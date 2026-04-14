## 简介 - [官网](http://wproxy.org/whistle/install.html)

基于 Node 实现的跨平台 web 调试代理工具，类似的工具有 Windows 平台上的 [Fiddler](http://www.telerik.com/fiddler/)、花瓶（太麻烦）。主要用于查看、修改 HTTP、HTTPS、Websocket 的请求、响应，也可以作为 HTTP 代理服务器使用。

总之一句话：简单、方便、跨端，开源免费且持续在维护。

### 代理调试流程：

<img src="https://cdn.nlark.com/yuque/0/2021/png/407340/1621826935050-3aa8c85c-2a7a-40d6-8199-ba57a4521f5d.png" width="772" title="" crop="0,0,1,1" id="u9127c974" class="ne-image">

## 安装-启动

[官网](http://wproxy.org/whistle/install.html)

需要使用 [SwitchyOmega_Chromium.crx](https://codeload.github.com/FelisCatus/SwitchyOmega/zip/v2.5.20) 浏览器代理插件配置

- 安装 Node ：[官网下载安装包](https://nodejs.org/en/)
- 安装 whistle ： npm install -g whistle
- 启动 whistle：w2 start
- 配置代理：使用 Proxy SwitchyOmega，配置一个 127.0.0.1 ：8899 的代理

1. PC 网站设置代理：

![pc设置代理](https://cdn.nlark.com/yuque/0/2021/png/407340/1621827411266-485932a7-afc8-41c6-b6d6-d35e951e750e.png)
![pc设置代理2](https://cdn.nlark.com/yuque/0/2021/png/407340/1621827457712-b320bd98-550c-4798-a1d9-90b8948a8b01.png)

2. 移动端设置代理:

需要在设置中配置当前Wi-Fi的代理，以 iOS 为例：

![移动端设置代理](https://cdn.nlark.com/yuque/0/2019/jpeg/499258/1574344170206-31db843a-b0c9-4e1a-900e-28bfbc4dd5c2.jpeg)

注意：代理时需要手机和电脑在同一个网络！！

3. 微信开发者工具代理：

操作： 设置 --> 代理设置 --> 手动设置代理

![微信开发者工具代理](https://cdn.nlark.com/yuque/0/2019/png/499258/1574344225663-1f06f807-9d7f-4d9f-95bd-e2c74c7682f2.png)

- 访问，w2 start 之后会在控制台 输出地址 如下

方式1：域名访问 [http://local.whistlejs.com/](http://local.whistlejs.com/)

方式2: 通过ip+端口来访问,例如 [http://127.0.0.1:8899](http://127.0.0.1:8899/)

### 拦截 https 的配置

这个比较特殊所以，**需要 **[**特定配置**](http://wproxy.org/whistle/webui/https.html)** 点这查看**

## 常用命令

1. `**w2 status**`**：** 查看本机运行的 whistle 实例
2. `**w2 start**`**：** 正常启动 whistle
3. `**w2 stop**`**：** 停止 whistle（`w2 run` 的方式无法用此命令停止）
4. `**w2 restart**`**：** 重启 whistle（`w2 run` 的方式无法用此命令重启）
5. 服务的端口号可以用命令行参数`w2 start -p xxxx`来指定 （默认端口8899）
6. `**w2 help**`** 或 **`**w2 -h**`** 或 **`**w2 --help**`**：** 查看帮助
7. `**w2 -V**`** 或 **`**w2 --version**`**：** 查看当前版本

## 常用功能

我们最常使用的就是 NetWork 和 Rules 功能了, 其中 NetWork 是查看抓包，而 Rules 是设置代理，下面我以一个移动端活动为例，介绍一下 whistle 的使用：

### Filter 红色代表启用

顶部Filter 设置过滤器，**Include Filter **只看你想看的域名请求：

### Rules 配置规则

原理就是替换本地修改 hosts 文件，

双击创建的规则集，出现打钩的符号说明应用了规则集。例如

```javascript
www.qq.com www.qqapi.com #意思就是，把 www.qq.com 的请求代理到 www.qqapi.com ，这样创建多个 rules 就可以实现双击任意切换代理了，是不是很方便啊！
```

#### 匹配指定规则-操作

```plain
# 匹配域名www.qq.com下的所有请求 到 operatorURI(要代理的 api 地址)
www.qq.com operatorURI

# 匹配域名www.qq.com下的所有http请求
http://www.qq.com operatorURI

# 匹配域名www.qq.com下的所有https请求
https://www.qq.com operatorURI

# 限定域名的端口号
www.qq.com:8888 operatorURI # 8888端口

#限定具体路径
http://www.qq.com/xxx operatorURI
```

#### operatorURI 为对应的操作，由操作协议+操作值组成(`operatorURI = opProtocol://opValue`)：

协议列表：[http://wproxy.org/whistle/rules/](http://wproxy.org/whistle/rules/) 这个功能很多，用到了再说。

#### Rules的特殊操作符(`{}`、`()`、`<>`)

- {} ：主要是引入 Values里的配置文件

```plain
www.example.com res://{index.html}
# 对应的是 Values 里定义的文件，  按住 Ctrl 点击 {xxx} 可快速定位到源文件
```

- ()：直接在 [配置页面]（[http://www.example.com/)上设置value](http://www.example.com/)上设置value)

```plain
www.example.com res://({"delay":6000,"body":"1234567890"}) # () 里面不能有空格
```

#### 代理协议： 常用于开发，移动端实时联调

```plain
# 将www.qq.com的请求都代理到10.241.11.111 IP上，实现在本地环境发测试环境的请求， 类似于 修改host
127.0.0.1 tmall.xc2018.com.cn
```

### urlParams 修改请求参数

```plain
www.ifeng.com urlParams://(test=1)
```

## 真机调试

### log查看项目打印日志

```plain
/http://www.baidu.com/ log://
# 这时候不管是PC还是真机，只要是访问 http://www.baidu.com 匹配方式下的页面，都可以在whistle的log选项下看到控制台输出的信息：
```

### 使用 values + js 功能往页面注入 vconsole.js ：

我们在values功能栏下新建一个vConsole.js , 并把vconsole的源码放进去，并初始化一个vconsole对象(源码最后一行 写 var vConsole = new VConsole();),此时在rules 下配置：

```plain
http://www.baidu.com js://{vConsole.js}
```

此时，我们刷新页面可以看到：

### 使用whistle内置的Weinre调试移动端页面：

在rules配置：

```plain
http://www.baidu.com weinre://index
# 此时可以使用 weinre 查看页面
```
