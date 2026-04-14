---
description: iframe postMessage 通信规范（POS 宿主 <-> H5）
---

# Iframe Bridge 通信规范

## 背景与目标

工作台中多个页面通过 `iframe` 嵌入 H5（如：`quote-query`、`goods-list`），需要实现宿主（Electron/React）与 H5 之间的事件通信。

本项目采用 `window.postMessage` 作为通信机制，并封装为通用 Hook：`src/hooks/useIframeBridge.ts`。

目标：

- **安全**：避免任意页面伪造消息触发宿主动作
- **可复用**：各页面只关注业务事件，不重复写监听与校验
- **可维护**：统一消息协议，便于扩展事件类型

## 为什么不能只校验 origin？

在浏览器中，跨域通信常见做法是校验 `event.origin` 是否为预期域名。

但在 Electron / `file://` 场景中：

- 宿主页面可能是 `file://`
- `event.origin` 可能为 `"null"`
- `origin` 校验不稳定甚至无法使用

因此本项目把 **`event.source` 校验**作为第一优先级：

- `event.source === iframeRef.current?.contentWindow`

这能保证消息确实来自“当前这个 iframe”，而不是来自其它窗口、其它 iframe、DevTools、浏览器扩展等。

## 安全校验策略（宿主侧）

`useIframeBridge` 内部做了四层过滤：

- **1) window 来源校验**：`event.source` 必须是当前 iframe 的 `contentWindow`
- **2) origin 校验（仅非 file 协议）**：`event.origin === iframeOrigin`
- **3) 协议校验**：`data.protocol === 'q3c-pos-bridge/v1'`
- **4) source 校验**：`data.source === 'mall-front'`（可配置）

通过这四层过滤后，才会进入业务 `onMessage`。

## 握手（Handshake）设计

跨域场景下，父页面无法确定 H5 何时注册了 message 监听器。

为提升稳定性，本项目默认启用握手（可配置 `enableHandshake` 关闭）：

- 宿主在 `iframe onLoad` 后发送：`INIT`
- H5 页面加载完成后发送：`READY`
- 宿主收到 `READY` 后回复：`INIT_ACK`

握手的目的：

- 让双方确认通信链路已建立
- 为后续“下发初始化数据/Token/设备信息”等提供时机

## 消息结构（双方约定）

所有消息均为对象（不要直接传字符串），结构如下：

```ts
type IframeBridgeMessage = {
  protocol: "q3c-pos-bridge/v1";
  source: "mall-front" | "pos-electron";
  type: string;
  payload?: any;
};
```

推荐：

- `protocol`：固定协议字符串，过滤非本业务消息
- `source`：消息来源标识，避免被伪造
- `type`：事件类型
- `payload`：业务数据

## 宿主（POS）侧使用方式

示例：

```tsx
const { iframeRef, iframeSrc, handleIframeLoad } = useIframeBridge({
  path: "quote-query",
  onMessage: (msg) => {
    switch (msg.type) {
      case "NAVIGATE_WORKBENCH_HOME":
        history.push("/workbench");
        break;
    }
  },
});

return <iframe ref={iframeRef} src={iframeSrc} onLoad={handleIframeLoad} />;
```

注意：

- 业务页面应该只写 `onMessage` 的 `switch(type)`
- 不要在页面里重复写 `addEventListener('message', ...)`

## H5 侧实现（建议封装成工具模块）

H5 需要：

- 从 query 读取 `parentOrigin`，作为 `postMessage` 的 `targetOrigin`
- 发送 `READY`，并根据需要发送业务事件

示例：

```js
const BRIDGE_PROTOCOL = "q3c-pos-bridge/v1";

function getParentOrigin() {
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get("parentOrigin");
  return v ? decodeURIComponent(v) : "*";
}

export function postToPos(type, payload) {
  window.parent.postMessage(
    { protocol: BRIDGE_PROTOCOL, source: "mall-front", type, payload },
    getParentOrigin(),
  );
}

// 建议：页面加载完成后 READY
window.addEventListener("load", () => {
  postToPos("READY");
});

// 示例：返回工作台
export function goWorkbenchHome() {
  postToPos("NAVIGATE_WORKBENCH_HOME");
}
```

## 常见坑与注意事项

- **不要使用 `'*'` 作为 targetOrigin（非 file 协议）**
  - 应使用 query 下发的 `parentOrigin`
- **不要只依赖 `event.origin`**
  - Electron/file 场景可能为 `null`
- **必须带 protocol/source 字段**
  - 宿主侧会过滤不符合协议的消息
- **不要在生产环境保留 debugger**

## 扩展事件

新增事件时建议：

- 宿主侧：在 `onMessage` 中新增 `case` 分支
- H5 侧：在 `postToPos(type, payload)` 中传入新 `type`

建议事件命名：

- `NAVIGATE_*`：导航类
- `SET_*`：宿主下发配置
- `REPORT_*`：H5 上报状态

## Electron 和 H5 事件通信实现代码

### H5 页面封装 bridge.ts

```typescript
export const POS_BRIDGE_PROTOCOL = "q3c-pos-bridge/v1";

export type PosBridgeMessage = {
  protocol?: string;
  source: string;
  type: string;
  payload?: unknown;
};

export const getParentOrigin = () => {
  const sp = new URLSearchParams(window.location.search);
  const v = sp.get("parentOrigin");
  return v ? decodeURIComponent(v) : "*";
};

export const postToParent = (
  message: PosBridgeMessage,
  targetOrigin?: string,
) => {
  window.parent?.postMessage(message, targetOrigin ?? getParentOrigin());
};

export const postToPosBridge = (args: {
  type: string;
  payload?: unknown;
  source?: string;
  protocol?: string;
  targetOrigin?: string;
}) => {
  const {
    type,
    payload,
    source = "mall-front",
    protocol = POS_BRIDGE_PROTOCOL,
    targetOrigin,
  } = args;

  postToParent(
    {
      protocol,
      source,
      type,
      payload,
    },
    targetOrigin,
  );
};

export const goWorkbenchHome = (args?: {
  source?: string;
  targetOrigin?: string;
}) => {
  postToPosBridge({
    type: "NAVIGATE_WORKBENCH_HOME",
    source: args?.source,
    targetOrigin: args?.targetOrigin,
  });
};
```

### H5 页面使用

```typescript
import { goWorkbenchHome } from "./bridge";

// 跳转到工作台首页
goWorkbenchHome();
```

### Electron 主进程封装

```typescript
import { useCallback, useEffect, useMemo, useRef } from "react";

/**
 * 通用 iframe postMessage 通信 Hook
 *
 * 设计目标：
 * - **安全**：避免 Electron / file 协议下由于 origin 不可靠而被其它页面伪造消息
 * - **可复用**：把 iframeSrc 组装、事件监听/清理、来源校验、握手流程统一封装
 * - **可维护**：约定统一的协议字段 protocol + source + type，便于扩展事件类型
 *
 * 关键安全点：
 * 1) 必须校验 event.source === iframe.contentWindow
 *    - 即使在 file:// 或 event.origin 为 null 的场景，也能保证消息来自当前 iframe
 * 2) 在非 file 协议下再校验 event.origin === iframeOrigin
 *    - 防止跨域页面冒充 iframe 发送消息
 * 3) 校验 data.protocol + data.source
 *    - 防止收到其它业务或浏览器扩展的 message
 */
const DEFAULT_PROTOCOL = "q3c-pos-bridge/v1";

const getIframeOrigin = (url: string) => {
  try {
    return new URL(url).origin;
  } catch (error) {
    return "";
  }
};

/**
 * iframe 消息结构体
 *
 * @description
 *   - protocol：通信协议标识，用于过滤非本协议消息
 *   - source：消息来源标识（如：mall-front / pos-electron），用于过滤伪造消息
 *   - type：事件类型
 *   - payload：事件负载
 */
export type IframeBridgeMessage<
  TType extends string = string,
  TPayload = any,
> = {
  /** 通信协议标识，用于过滤非本协议消息 */
  protocol: string;
  /** 消息来源标识（如：mall-front / pos-electron），用于过滤伪造消息 */
  source: string;
  /** 事件类型 */
  type: TType;
  /** 事件负载 */
  payload?: TPayload;
};

/**
 * useIframeBridge Hook 选项
 *
 * @description
 *   - baseUrl：H5 域名（可选，默认读取项目内 H5_MALL_URL_MAP[API_ENV]）
 *   - path：H5 路径，如 goods-list / quote-query
 *   - protocol：协议标识（建议所有页面统一）
 *   - parentOrigin：父页面 origin，默认 window.location.origin，会拼到 iframe query 中
 *   - h5Source：H5 发来的 source 标识（可选，默认 mall-front）
 *   - enableHandshake：是否启用握手：onLoad -> INIT；收到 READY -> INIT_ACK
 *   - onMessage：收到合法消息后的业务处理函数
 */
export type UseIframeBridgeOptions<TIncomingType extends string = string> = {
  /** H5 域名（可选，默认读取项目内 H5_MALL_URL_MAP[API_ENV]） */
  baseUrl?: string;
  /** H5 路径，如 goods-list / quote-query */
  path: string;
  /** 协议标识（建议所有页面统一） */
  protocol?: string;
  /** 父页面 origin，默认 window.location.origin，会拼到 iframe query 中 */
  parentOrigin?: string;
  /** H5 发来的 source 标识（可选，默认 mall-front） */
  h5Source?: string;
  /** 是否启用握手：onLoad -> INIT；收到 READY -> INIT_ACK */
  enableHandshake?: boolean;
  /** 收到合法消息后的业务处理函数 */
  onMessage: (
    message: IframeBridgeMessage<TIncomingType, any>,
    rawEvent: MessageEvent,
  ) => void;
};

/**
 * 通用 iframe postMessage 通信 Hook
 *
 * @description
 *   - 该 Hook 实现了 iframe 通信的安全校验、协议过滤、来源校验、握手流程等功能
 *   - 支持 file 协议和非 file 协议下的安全通信
 *   - 支持自定义协议标识、消息来源标识、事件类型等
 *
 * @param options Hook 选项
 * @returns
 *   - iframeRef：iframe 的引用
 *   - iframeSrc：iframe 的 src 地址
 *   - iframeOrigin：iframe 的 origin 地址
 *   - protocol：协议标识
 *   - postToIframe：向 iframe 发送消息的函数
 *   - handleIframeLoad：iframe 加载完成后的处理函数
 */
export function useIframeBridge<TIncomingType extends string = string>(
  options: UseIframeBridgeOptions<TIncomingType>,
) {
  const {
    baseUrl = H5_MALL_URL_MAP[API_ENV] || "http://willefc2.myds.me:82",
    path,
    protocol = DEFAULT_PROTOCOL,
    parentOrigin = window.location.origin,
    h5Source = "mall-front",
    enableHandshake = true,
    onMessage,
  } = options;

  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isFileProtocol = window.location.protocol === "file:";

  /**
   * 统一拼接 iframe 的完整地址：baseUrl + path
   * 使用 URL 以避免手动拼接导致的双斜杠、漏斜杠问题
   */
  const baseIframeSrc = useMemo(() => {
    const u = new URL(path, baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`);
    return u.toString().replace(/\/$/, "");
  }, [baseUrl, path]);

  /**
   * 将父页面 origin 下发给 H5（建议 H5 用该值作为 postMessage 的 targetOrigin）
   */
  const iframeSrc = useMemo(() => {
    return `${baseIframeSrc}${
      baseIframeSrc.includes("?") ? "&" : "?"
    }parentOrigin=${encodeURIComponent(parentOrigin)}`;
  }, [baseIframeSrc, parentOrigin]);

  /**
   * iframeOrigin 用于非 file 协议下校验 event.origin
   * 注意：file:// 下 event.origin 可能为 "null"，所以不能只依赖 origin
   */
  const iframeOrigin = useMemo(
    () => getIframeOrigin(baseIframeSrc),
    [baseIframeSrc],
  );

  /**
   * 父 -> 子发消息
   * targetOrigin:
   * - 非 file 协议：使用 iframeOrigin（更安全）
   * - file 协议：使用 '*'（origin 不可靠），但通过 event.source 校验保障安全
   */
  const postToIframe = useCallback(
    (
      message: Omit<IframeBridgeMessage, "protocol"> & { protocol?: string },
    ) => {
      const targetWindow = iframeRef.current?.contentWindow;
      if (!targetWindow) return;
      const targetOrigin = !isFileProtocol && iframeOrigin ? iframeOrigin : "*";
      targetWindow.postMessage({ protocol, ...message }, targetOrigin);
    },
    [iframeOrigin, isFileProtocol, protocol],
  );

  /**
   * iframe load 后可主动发 INIT，促使 H5 建立通信/上报 READY
   * 说明：跨域场景下 postMessage 不会因页面未注册监听而报错，消息会被丢弃
   */
  const handleIframeLoad = useCallback(() => {
    if (!enableHandshake) return;
    postToIframe({ source: "pos-electron", type: "INIT" });
  }, [enableHandshake, postToIframe]);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      /** 1) 确保消息来自当前 iframe，而不是其它窗口/其它 iframe */
      if (event.source !== iframeRef.current?.contentWindow) return;
      /** 2) 非 file 协议下再校验 origin */
      if (!isFileProtocol && iframeOrigin && event.origin !== iframeOrigin)
        return;

      const data: any = event.data;
      /** 3) 协议过滤 */
      if (!data || data.protocol !== protocol) return;
      /** 4) source 过滤 */
      if (data.source !== h5Source) return;

      /** 可选握手：H5 READY -> INIT_ACK */
      if (enableHandshake && data.type === "READY") {
        postToIframe({ source: "pos-electron", type: "INIT_ACK" });
      }

      onMessage(data as IframeBridgeMessage<TIncomingType, any>, event);
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [
    enableHandshake,
    h5Source,
    iframeOrigin,
    isFileProtocol,
    onMessage,
    postToIframe,
    protocol,
  ]);

  return {
    iframeRef,
    iframeSrc,
    iframeOrigin,
    protocol,
    postToIframe,
    handleIframeLoad,
  };
}
```

### Electron 主进程使用

```typescript
import { useIframeBridge } from './iframe-bridge';

function App() {
  const { iframeRef, iframeSrc, postToIframe, handleIframeLoad } = useIframeBridge({
    path: '/workbench',
    onMessage: (message) => {
      console.log('收到H5消息:', message);
      // 处理H5发送的消息
    },
  });

  return (
    <div>
      <iframe
        ref={iframeRef}
        src={iframeSrc}
        onLoad={handleIframeLoad}
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
}
```
