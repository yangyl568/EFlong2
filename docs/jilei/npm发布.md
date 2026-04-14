# npm发布

## 背景

独立通用功能需要独立开发并且已包的形式应用到公司各个项目中。

算是一个基建方面的业务，给其他项目赋能。

# node 包管理

项目中因为一些原因，必须使用指定版本的 node 。

一般有两个模式 nvm 和 n , 这里我使用 nvm。

[https://segmentfault.com/a/1190000018110318](https://segmentfault.com/a/1190000018110318) 继续解析

# npm 私库使用

## 1.背景

工作中可能会用到很多通用性的代码，比如，框架类、工具类以及公用的业务逻辑代码等等，通过打包发布到npm 中央仓库或者私有仓库，来进行维护和托管代码，方便公用代码的使用。

但是公司内部需要私有化，使用 cnpm 搭建一个仓库 [http://cnpm.xxxx.com:8000/](http://cnpm.127.0.0.1:8000/)，公司内公共 npm 包都统一发布到这个仓库。

## 2.使用

### 2.1 本地使用私有仓库

通过 nrm 添加私有仓库源，nrm 是一个 npm 源管理器,允许你快速地在 npm 源间切换。

#### 2.1.1 安装nrm

```bash
npm install -g nrm
```

#### 2.1.2 添加源

```bash
nrm add webuy http://cnpm.xxxx.com:8000/
```

#### 2.1.3 切换源

```git
nrm ls
/*
*
* npm ---- https://registry.npmjs.org/
* cnpm --- http://r.cnpmjs.org/
* taobao - https://registry.npm.taobao.org/
* xxxx -- http://cnpm.xxxx.com:8000/
*/
```

```bash
nrm use xxxx // Registry has been set to: http://cnpm.xxxx.com:8000/
```

#### 2.1.4 yarn 配置私有仓库

注意：nrm 只能切换 npm 的镜像地址，yarn 镜像配置需要进行如下操作

```javascript
yarn config set registry http://cnpm.xxxx.com:8000/
```

执行完毕后执行如下命令检测是否配置成功

```javascript
yarn config get registry
```

### 3.1.1 安装私库 npm 依赖

```java
npm install [pkgname]
```

### 3.1.2 登录 npm

**未登录过的用户，默认会记住第一次登录使用的用户名，密码，邮箱。所以第一次登录时不要忘了密码！！！**

```bash
npm login
Username: xxxx
Password: xxxx
Email: xxxx
Logged in as Username on url
```

### 3.1.3 发布

package.json 里面必须提供包名、 main 入口文件、版本信息等。

执行 npm publish 命令进行发布，如图

<img src="https://cdn.nlark.com/yuque/0/2021/png/407340/1624519229094-3ac70272-c69d-4cd7-9c16-c0fb1b367d7f.png" width="591" title="" crop="0,0,1,1" id="u6612ae8c" class="ne-image">

注：仓库仅支持当前包的所有人(owner)发布，如果想给自己的包添加 owner，参考如下步骤：

```bash
npm owner add username packgeName

npm owner ls
```

PS，npm 高版本(V6以上)还需要在包的 package.json 描述文件内加上 maintainers 字段，如下：

```bash
"maintainers": [
	"ownerName"
]
```

# npm 版本规范

## 版本标记

### version 概念

"version": "1.2.3"，每个版本号都由三个部分组成，依次叫做**“主版本号 major”、“次版本号 minor”和“修订号 patch”**。版本号一旦生成就不能覆盖，只能修改。

- 当新版本无法兼容基于前一版本的代码时，则**提高主版本号**
- 当新版本新增了功能与特性，但仍兼容前一版本的代码时，则**提高次版本号**
- 当新版本仅仅修正漏洞或者增强效率，仍然兼容前一版本代码，则**提高修订号**

---

默认情况下，yarn add 下载的都是最新版本，并且会在 package.json 文件里登记一个最优版本号，其形式如下所示:

```plain
"dependencies": {
    "express": "^4.10.0",
    "ejs": "~2.3.2"
}
```

#### ~version 大概匹配某个版本

如果 minor 版本号指定了，那么 minor 版本号不变，而 patch 版本号任意

如果 minor 和 patch 版本号未指定，那么 minor 和 patch 版本号任意

如：~1.1.2，表示>=1.1.2 <1.2.0，可以是1.1.2，1.1.3，1.1.4，.....，1.1.n

如：~1.1，表示>=1.1.0 <1.2.0，可以是同上

#### ^version 兼容某个版本

版本号中最左边的**非 0 数字的右侧**可以任意

如：^1.1.2 ，表示>=1.1.2 <2.0.0，可以是 1.1.2，1.1.3，.....，1.1.n，1.2.n，.....，1.n.n

如：^0.2.3 ，表示>=0.2.3 <0.3.0，可以是 0.2.3，0.2.4，.....，0.2.n

#### 1.2.x 该位置表示任意版本

#### \*version 任意版本

npm install 会忽略模糊版本

npm update 会更新模糊版本至最新

### tag 概念

npm 中也有个 tag 的概念，有点类似 git 中的 branch。

一般情况下不指定 tag，这时 npm 默认就会发布到 latest 这个 tag，yarn 或者 npm install 的时候拉取的就是latest tag 上对应的版本。

我们**开发或者测试**的时候，发布 latest tag 是会直接影响线上环境，所以我们可以在发布时指定 tag（如beta）, yarn 或者 npm 安装时默认会跳过该 tag。

## 发布版本

通常分为 测试版本 和 正式版本：

- 测试版本：发布需额外指定 --tag=beta , 安装需要手动指定 tag 标记版本
- 正式版本：无需额外指令，项目中引用默认拉取正式版本。

### 测试版本

测试版本使用 --tag=beta 和测试版本号区分于正式版  
例如：@xxx/testnpm@2.0.0-beta.5

```bash
1. 更新测试版本号

npm version prerelease --preid=beta


2. 发布测试版本号
npm publish --tag=beta

3. 更新预发版本号
npm version prerelease --preid=rc

4. 发布预发版本号
npm publish --tag=rc

操作完毕后 可通过 npm info 或者 npm dist-tag ls 查看设置是否生效

5. 切换标记
npm dist-tag add example-package@1.0.0 latest
```

### 正式版本

```bash
1. 更新主版本号
npm version majo


2. 更新次版本号
npm version minor


3. 更新修订版本号
npm version patch


4. 发布正式版本
npm publish

```
