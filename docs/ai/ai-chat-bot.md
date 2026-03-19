# NestJS AI 客服系统

## 一、项目概述

### 1.1 项目定位

本项目是一个基于 NestJS + RAG (检索增强生成) 架构的 AI 客服系统，具备以下核心能力：

- **智能问答**：基于知识库的语义检索和 AI 生成回复
- **流式对话**：SSE 实时推送，用户体验流畅
- **人工转接**：关键词触发 + 工单系统
- **上下文记忆**：多轮对话支持历史上下文

### 1.2 技术栈

| 层级          | 技术                  | 说明                            |
| ------------- | --------------------- | ------------------------------- |
| **框架**      | NestJS                | 企业级 Node.js 框架，模块化架构 |
| **数据库**    | MongoDB               | 存储会话、消息、知识库文档      |
| **向量库**    | Qdrant                | 高性能向量检索，语义搜索        |
| **Embedding** | 智谱 AI (embedding-2) | 中文语义理解，1024维向量        |
| **LLM**       | DeepSeek              | 大语言模型，流式生成            |
| **ORM**       | Mongoose              | MongoDB 对象建模                |
| **API**       | REST + SSE            | 标准接口 + 服务器推送           |

### 1.3 项目结构

```
src/
├── ai/                          # AI 核心模块
│   ├── ai.module.ts             # AI 模块入口
│   ├── interfaces/              # 类型定义
│   └── services/                # AI 服务层
│       ├── embedding.service.ts # 文本向量化
│       ├── llm.service.ts       # 大模型调用
│       ├── rag.service.ts       # RAG 检索增强
│       ├── vector.service.ts    # Qdrant 向量库
│       ├── ai-model.factory.ts  # 模型工厂（备用）
│       └── session.manager.ts   # 会话管理（备用）
├── chat/                        # 对话模块
│   ├── chat.module.ts           # 对话模块入口
│   ├── chat.controller.ts       # SSE 流式接口
│   ├── schemas/                 # 数据模型
│   │   ├── chat-session.schema.ts    # 会话模型
│   │   ├── chat-message.schema.ts    # 消息模型
│   │   └── handoff-ticket.schema.ts  # 转人工工单
│   └── services/
│       └── chat.service.ts      # 对话核心逻辑
├── knowledge/                   # 知识库模块
│   ├── knowledge.module.ts      # 知识库模块入口
│   ├── knowledge.controller.ts  # 知识库管理接口
│   ├── schemas/                 # 知识库模型
│   │   ├── kb-faq-doc.schema.ts     # FAQ 文档
│   │   └── kb-faq-chunk.schema.ts   # 文本分块
│   └── services/
│       ├── ingestion.service.ts     # 知识导入
│       ├── faq-kb.service.ts        # FAQ 服务（备用）
│       └── faq-retriever.service.ts # 检索服务（备用）
├── user/                        # 用户模块
├── auth/                        # 认证模块
├── interview/                   # 面试模块（历史）
├── common/                      # 公共组件
│   ├── filters/                 # 异常过滤器
│   ├── interceptors/            # 拦截器
│   └── middleware/              # 中间件
├── config/                      # 配置
│   └── config.schema.ts         # 环境变量校验
└── app.module.ts                # 应用根模块
```

---

## 二、核心模块详解

### 2.1 AI 模块 (src/ai)

#### 2.1.1 EmbeddingService - 文本向量化

**职责**：将文本转换为向量表示，用于语义检索

**实现要点**：

```typescript
// 使用智谱 embedding-2 模型
getEmbeddings(): ZhipuAIEmbeddings {
  return new ZhipuAIEmbeddings({ apiKey });
}

// 单文本向量化
async embedText(text: string): Promise<number[]>

// 批量向量化（用于知识库导入）
async embedTexts(texts: string[]): Promise<number[][]>
```

**关键配置**：

- **模型**：智谱 embedding-2
- **向量维度**：1024（Qdrant 集合必须匹配）
- **API Key**：`ZHIPU_API_KEY` 环境变量

**⚠️ 注意事项**：

- 向量维度必须与 Qdrant 集合配置一致
- 批量向量化时注意 API 限流

---

#### 2.1.2 VectorService - Qdrant 向量库

**职责**：管理向量数据库的存储和检索

**核心方法**：

**1. 向量检索** `similaritySearch()`

```typescript
async similaritySearch(
  embeddings: Embeddings,
  query: string,
  collectionName: string,
  topK = 4
): Promise<{ pageContent; metadata; score }[]>
```

流程：

1. 将查询文本 embedding 为向量
2. 调用 Qdrant `search()` API
3. 返回相似文档 + 相似度分数

**2. 向量存储** `addDocuments()`

```typescript
async addDocuments(
  embeddings: Embeddings,
  collectionName: string,
  docs: { pageContent; metadata }[]
): Promise<void>
```

**⚠️ 关键坑点修复**：

- **Point ID 必须是数字或 UUID**：早期使用 `${timestamp}-${idx}` 字符串导致 `Bad Request`
- **正确做法**：`id: timestamp + idx` 数字递增

**3. 集合管理** `ensureCollection()`

```typescript
async ensureCollection(
  collectionName: string,
  vectorSize = 1024
): Promise<void>
```

---

#### 2.1.3 LlmService - 大语言模型

**职责**：调用 DeepSeek 模型进行对话生成

**实现**：

```typescript
private createModel(): ChatDeepSeek {
  return new ChatDeepSeek({
    apiKey,
    model: 'deepseek-chat',
    streaming: true,      // 开启流式
    temperature: 0.7,     // 创造性适中
    maxTokens: 2000       // 最大输出长度
  });
}

// 流式对话
async stream(systemPrompt, userMessage): Promise<AsyncIterable>

// 非流式（备用）
async invoke(systemPrompt, userMessage): Promise<string>
```

**⚠️ 配置要点**：

- `DEEPSEEK_API_KEY` 必须配置
- `streaming: true` 启用 SSE 流式响应
- `maxTokens` 控制回复长度

---

#### 2.1.4 RagService - 检索增强生成（核心）

**职责**：整合检索和生成，实现知识增强的对话

**核心方法** `ask()`：

```typescript
async ask(
  question: string,
  history: string,
  collectionName = 'knowledge'
): Promise<{
  stream: AsyncIterable;    // LLM 流式输出
  context: string;          // 检索到的知识
  sources: {title; content; score}[]  // 来源
}>
```

**执行流程**：

```
用户问题 → Embedding → Qdrant 检索(topK=4) → 格式化上下文
→ 构建 Prompt → LLM 流式生成 → 返回结果
```

**Prompt 构建**（关键优化）：

```
你是亲切的电商小助手，用简短友好的话回答用户。

参考信息：
[检索到的知识库片段]

对话记录：
[历史对话上下文]

回答要求：
- 每句话不超过30个字
- 像朋友聊天一样自然
- 不知道的就说"这个我不太清楚，帮您转人工问问？"
- 不要出现"知识库"这种词汇，可以替换成"平台政策"
```

**⚠️ Prompt 工程要点**：

- **限制回复长度**：每句话不超过30字
- **语气自然化**：避免"根据知识库"等生硬表达
- **兜底话术**：未知问题时引导转人工

---

### 2.2 Chat 模块 (src/chat)

#### 2.2.1 数据模型

**ChatSession - 会话**

```typescript
@Schema({ timestamps: true })
class ChatSession {
  sessionId: string; // UUID，唯一标识
  userId: string; // 用户标识
  status: "open" | "handed_off" | "closed";
  summary?: string; // 会话摘要（备用）
  lastActiveAt: Date; // 最后活跃时间
}
```

**ChatMessage - 消息**

```typescript
@Schema({ timestamps: true })
class ChatMessage {
  sessionId: string;
  userId: string;
  role: 'user' | 'assistant';
  content: string;
  metadata?: {
    sources: [...],      // 知识来源
    context: string      // 检索上下文
  };
}
```

**HandoffTicket - 转人工工单**

```typescript
@Schema({ timestamps: true })
class HandoffTicket {
  ticketId: string; // 工单编号
  sessionId: string;
  userId: string;
  status: "created" | "processing" | "resolved";
  reason: string; // 转人工原因
}
```

---

#### 2.2.2 ChatService - 对话核心

**核心方法** `streamChat()`：

返回 `Observable<MessageEvent>`，支持 SSE 流式推送

**完整对话流程**：

```
1. 获取/创建会话
   └─ getOrCreateSession(userId, sessionId?)

2. 发送元数据事件（meta）
   └─ { type: 'meta', data: { sessionId, startedAt } }

3. 保存用户消息到 MongoDB
   └─ chatMessageModel.create({ role: 'user', ... })

4. 检测转人工关键词
   └─ keywords: ['转人工', '人工', '人工客服', '投诉', '真人']
   └─ 匹配 → handleHandoff() → 创建工单 → 返回转接消息

5. 执行 RAG 流程
   a. 获取历史对话（最近10条）
      └─ chatMessageModel.find({ sessionId }).sort({ createdAt: -1 }).limit(10)

   b. 调用 ragService.ask(question, history)
      └─ 检索知识库 → 流式生成回复

6. 发送检索结果事件（tool）
   └─ { type: 'tool', data: { name: 'rag_retrieve', sources: [...] } }

7. 流式输出 AI 回复（delta）
   └─ for await (chunk of stream)
      └─ { type: 'delta', data: { text } }

8. 保存 AI 回复到 MongoDB
   └─ chatMessageModel.create({ role: 'assistant', ... })

9. 更新会话状态
   └─ chatSessionModel.updateOne({ lastActiveAt, status: 'open' })

10. 发送完成事件（final）
    └─ { type: 'final', data: { sessionId, text, elapsedMs } }
```

**转人工逻辑** `handleHandoff()`：

```typescript
private async handleHandoff(session, input, subscriber, startedAt) {
  // 1. 更新会话状态为 handed_off
  await chatSessionModel.updateOne({ status: 'handed_off' });

  // 2. 创建工单
  const ticket = await handoffTicketModel.create({
    sessionId,
    userId,
    status: 'created',
    reason: 'user_request'
  });

  // 3. 推送转接消息
  subscriber.next({
    type: 'final',
    data: {
      handoffRequired: true,
      handoffTicketId: ticket.ticketId,
      message: '已为你转接人工客服，请稍候，专员将尽快为您服务。'
    }
  });
}
```

**⚠️ 关键实现细节**：

1. **上下文获取**：

   ```typescript
   const historyMessages = await this.chatMessageModel
     .find({ sessionId: session.sessionId })
     .sort({ createdAt: -1 }) // 最新的在前
     .limit(10) // 最近10条
     .lean();

   const history = historyMessages
     .reverse() // 按时间正序
     .map((m) => `${m.role === "user" ? "用户" : "客服"}：${m.content}`)
     .join("\n");
   ```

2. **SSE 事件类型**：
   - `meta` - 会话元数据（初始化）
   - `delta` - AI 回复增量（流式）
   - `tool` - 调试信息（检索结果）
   - `final` - 完成标记
   - `error` - 错误处理

3. **错误处理**：
   - 使用 try-catch 包裹 RAG 流程
   - 发生错误时推送 error 事件并结束流

---

### 2.3 Knowledge 模块 (src/knowledge)

#### 2.3.1 数据模型

**KbFaqDoc - FAQ 文档**

```typescript
@Schema({ timestamps: true })
class KbFaqDoc {
  docId: string; // UUID
  title: string; // 文件名
  sourceKey: string; // 相对路径
  sourceMtimeMs: number; // 文件修改时间
}
```

**KbFaqChunk - 文本分块**

```typescript
@Schema({ timestamps: true })
class KbFaqChunk {
  docId: string; // 所属文档
  title: string; // 文档标题
  chunkIndex: number; // 分块序号
  content: string; // 分块内容
  chunkId: string; // 唯一标识（用于Qdrant）
}
```

---

#### 2.3.2 IngestionService - 知识导入

**核心方法** `reindexAll()`：

**完整导入流程**：

```
1. 清空现有数据
   ├─ kbFaqDocModel.deleteMany({})
   └─ kbFaqChunkModel.deleteMany({})

2. 扫描知识库目录
   └─ kb/faq/*.md

3. 逐个导入文件
   for each file:
     a. 读取文件内容
     b. 文本分块 chunkText(raw, 500, 80)
     c. 存入 MongoDB (KbFaqDoc + KbFaqChunk)
     d. 生成向量并存入 Qdrant
```

**文本分块算法** `chunkText()`：

```typescript
private chunkText(text, chunkSize = 500, chunkOverlap = 80): string[] {
  // 1. 标准化文本
  const normalized = text.replace(/\r\n/g, '\n').trim();

  // 2. 滑动窗口分块
  while (start < normalized.length) {
    const end = Math.min(start + chunkSize, normalized.length);
    const slice = normalized.slice(start, end).trim();

    parts.push(slice);

    // 滑动步长 = chunkSize - overlap
    start = Math.max(0, end - chunkOverlap);
  }
}
```

**配置建议**：

- `chunkSize: 400-600` - 平衡语义完整性和检索精度
- `chunkOverlap: 80` - 保证上下文连贯

**向量索引** `indexToVectorStore()`：

```typescript
private async indexToVectorStore(chunks, docTitle) {
  // 1. 准备文档数据
  const docs = chunks.map(chunk => ({
    pageContent: chunk.content,
    metadata: {
      chunkId: chunk.chunkId,
      docId: chunk.docId,
      title: docTitle,
      chunkIndex: chunk.chunkIndex
    }
  }));

  // 2. 确保集合存在
  await vectorService.ensureCollection('knowledge', 1024);

  // 3. 批量添加向量
  const embeddings = embeddingService.getEmbeddings();
  await vectorService.addDocuments(embeddings, 'knowledge', docs);
}
```

**⚠️ 关键坑点**：

1. **Qdrant Point ID 格式**：
   - ❌ 错误：`chunkId: 'timestamp-index'` 字符串
   - ✅ 正确：`id: timestamp + idx` 数字
   - Qdrant 要求 ID 必须是**无符号整数或 UUID**

2. **Batch 格式**：
   ```typescript
   await client.upsert(collectionName, {
     batch: {
       ids: points.map((p) => p.id),
       vectors: points.map((p) => p.vector),
       payloads: points.map((p) => p.payload),
     },
   });
   ```

---

## 三、数据流全景图

### 3.1 对话流程

```
┌─────────────┐    ┌─────────────┐    ┌─────────────----┐
│   用户输入   │───▶│  ChatController  │───▶│  ChatService  │
└─────────────┘    └─────────────┘    └──────┬──────----┘
                                              │
                         ┌────────────────────┼────────────────────┐
                         │                    │                    │
                         ▼                    ▼                    ▼
                   ┌──────────┐         ┌──────────┐         ┌──────────┐
                   │ MongoDB  │         │  RAG     │         │  LLM     │
                   │ Sessions │         │ Service  │         │ Service  │
                   │ Messages │         └────┬─────┘         └────┬─────┘
                   └──────────┘              │                    │
                                              ▼                    ▼
                                         ┌──────────┐         ┌──────────┐
                                         │ Embedding│         │ DeepSeek │
                                         │ Service  │         │   API    │
                                         └────┬─────┘         └────┬─────┘
                                              │                    │
                                              ▼                    ▼
                                         ┌──────────┐         ┌──────────┐
                                         │  智谱 AI  │         │  SSE 流式 │
                                         │ embedding│         │  返回    │
                                         └──────────┘         └──────────┘
                                              │
                                              ▼
                                         ┌──────────┐
                                         │ Qdrant   │
                                         │ Vector DB│
                                         └──────────┘
```

### 3.2 知识库导入流程

```
Markdown 文件
     │
     ▼
┌─────────────┐
│ 读取文件内容 │
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ chunkText() │──── 分块参数: size=500, overlap=80
│   文本分块   │
└──────┬──────┘
       │
       ├──────────────────┐
       ▼                  ▼
┌─────────────┐    ┌─────────────┐
│  MongoDB    │    │   Qdrant    │
│ KbFaqDoc    │    │  Vector DB  │
│ KbFaqChunk  │    │  (知识向量)  │
└─────────────┘    └─────────────┘
```

---

## 四、核心 API 接口

### 4.1 对话接口

**SSE 流式对话** `GET /chat/stream`

参数：

- `userId` (required) - 用户标识
- `message` (required) - 用户消息
- `sessionId` (optional) - 会话ID（不传则创建新会话）

SSE 事件：

```
event: message
data: {"type":"meta","data":{"sessionId":"xxx","startedAt":"..."}}

event: message
data: {"type":"delta","data":{"text":"你好"}}

event: message
data: {"type":"final","data":{"sessionId":"xxx","text":"...","elapsedMs":1234}}
```

### 4.2 知识库接口

**重新索引** `POST /kb/reindex`

清空并重新导入所有 FAQ 文件

响应：

```json
{
  "code": 200,
  "message": "Successfully reindexed 1 documents, 6 chunks",
  "data": {
    "totalDocs": 1,
    "totalChunks": 6
  }
}
```

**测试检索** `GET /kb/test-retrieval?query=xxx&topK=3`

测试向量检索质量

---

## 五、重要注意事项

### 5.1 环境变量配置

`.env.development`：

```
# MongoDB
MONGODB_URI=mongodb://localhost:27017/wwzhidao

# Qdrant 向量库
QDRANT_URL=https://xxx.gcp.cloud.qdrant.io
QDRANT_API_KEY=xxx

# 智谱 AI (Embedding)
ZHIPU_API_KEY=xxx

# DeepSeek (LLM)
DEEPSEEK_API_KEY=sk-xxx
DEEPSEEK_MODEL=deepseek-chat

# JWT
JWT_SECRET=your-secret-key
```

### 5.2 关键配置项

| 配置         | 位置                 | 说明                        |
| ------------ | -------------------- | --------------------------- |
| chunkSize    | ingestion.service.ts | 文本分块大小（推荐400-600） |
| chunkOverlap | ingestion.service.ts | 分块重叠（推荐80）          |
| topK         | rag.service.ts       | 检索返回数量（推荐4）       |
| maxTokens    | llm.service.ts       | 最大输出长度（2000）        |
| temperature  | llm.service.ts       | 创造性（0.7）               |

### 5.3 常见坑点

#### 坑点 1：Qdrant Point ID 格式

- **问题**：使用字符串 ID 导致 `Bad Request`
- **解决**：使用数字或 UUID
- **代码**：`id: timestamp + idx`

#### 坑点 2：向量维度不匹配

- **问题**：Qdrant 集合维度与 Embedding 模型不一致
- **解决**：统一使用 1024 维（智谱 embedding-2）
- **代码**：`ensureCollection('knowledge', 1024)`

#### 坑点 3：上下文爆炸

- **问题**：历史对话过长导致 Token 超限
- **解决**：限制历史消息数量（最近10条）
- **代码**：`.limit(10)`

#### 坑点 4：生硬的 AI 回复

- **问题**：出现"根据知识库内容..."等表达
- **解决**：Prompt 中明确禁止并给出替代说法
- **代码**：见 RagService Prompt 构建

#### 坑点 5：转人工关键词遗漏

- **问题**：用户说"人工"但未触发转接
- **解决**：关键词数组覆盖常见表达
- **代码**：`['转人工', '人工', '人工客服', '投诉', '真人']`

### 5.4 性能优化建议

1. **向量检索优化**
   - Qdrant 使用 HNSW 索引，默认配置即可
   - 如果数据量大，考虑增加 `ef` 参数

2. **API 限流处理**
   - 智谱 Embedding 有 QPS 限制
   - 知识库导入时建议批量处理

3. **MongoDB 索引**
   - `ChatSession`：`userId + lastActiveAt`
   - `ChatMessage`：`sessionId + createdAt`

---
