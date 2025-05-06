# VuePress + Github Actions 自动化部署

> 最终效果就是通过 gihub pages 自动化部署当前 vuepress 文档项目，并免费获取网站进行访问。

## 第一步 搭建自己的 vuepress 项目

本地搭建自己的 vuepress 项目并 git push 到自己的 github 上，我这里就不多赘述了，网上一搜一大把的教程。

## 第二步 配置密钥

1、打开自己的 [tokens](https://github.com/settings/tokens) 页面，点击 Generate new token 生成一个 token。

2、保存好自己的 tokens ，后面需要用到。

3、打开自己的代码仓库找到 Settings 选项卡，点击 Secrets 选项卡，点击 New secret 选项卡，输入密钥名称为 GH_TOKEN，密钥值为自己的 tokens，点击 Add secret。

![Secrets](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/cca1c670b9494b0285bdbb6ec7381bd5~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

## 第三步 docs.yml 配置

我们是通过 github 工作流自动化部署的，所以需要一套工作流配置文件。

`.github/workflows/docs.yml`

```yml
name: docs

on:
  # 每当 push 到 main 分支时触发部署
  push:
    branches: [main]

jobs:
  build:
    runs-on: ubuntu-latest

    permissions:
      contents: write   # 授予写入权限
      pages: write      # 如果使用 GitHub Pages 专用部署
      id-token: write   # 如果使用 OIDC 身份验证

    steps:
      # 步骤 1: 检出代码
      - name: Checkout code
        uses: actions/checkout@v4
        with:
          # “最近更新时间” 等 git 日志相关信息，需要拉取全部提交记录
          fetch-depth: 0

      - name: 设置 pnpm
        uses: pnpm/action-setup@v4
        with:
          version: 10  # 这里指定具体的版本号，如8、9等

      - name: 设置 Node.js
        uses: actions/setup-node@v4
        with:
          # 选择要使用的 node 版本
          node-version: 22
          # 缓存 pnpm 依赖
          cache: pnpm

      - name: 安装依赖
        run: pnpm install --frozen-lockfile

      # 运行构建脚本
      - name: 构建 VuePress 站点
        run: pnpm docs:build
        env:
          NODE_OPTIONS: '--max_old_space_size=4096'  # 内存不足时增加限制

      # 查看 workflow 的文档来获取更多信息
      # @see https://github.com/crazy-max/ghaction-github-pages
      - name: 部署到 GitHub Pages
        uses: crazy-max/ghaction-github-pages@v4
        with:
          # 部署到 gh-pages 分支
          target_branch: gh-pages
          # 部署目录为 VuePress 的默认输出目录
          build_dir: docs/.vuepress/dist
        env:
          # @see https://docs.github.com/cn/actions/reference/authentication-in-a-workflow#about-the-github_token-secret
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

**📢注意**上面的配置文件是我多次尝试后最终标准配置，几乎不用修改，直接拿去用。

> 在 GitHub Actions 中，secrets.GITHUB_TOKEN 是 GitHub 自动生成的临时访问令牌，无需手动配置！

上面配置里提到：每当 push 到 main 分支时触发部署。

测试命令：

```bash
git add .
git commit -m "test"
git push origin main
```
此时就会自动触发部署。

## 第四步 验证 github actions

1、打开自己的 github 仓库，打开 Actions 选项卡，可以看到自己的 vuepress 网站是否已经部署成功！

2、如果出现绿色✅的图标，说明部署成功！

3、如果出现红色❌的图标，说明部署失败！需要根据错误信息进行解决！

## 第五步 配置 github pages

1、上面第四步成功之后

2、打开项目的 settings/pages 选项卡，默认 site 是空的，别着急看下面

3、Build and deployment

- Source: Deploy from a branch
- Branch: gh-pages / (root)

4、点击 Save

![Build and deployment](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/697fd739921a45409816078a424cca0f~tplv-k3u1fbpfcp-zoom-in-crop-mark:1512:0:0:0.awebp?)

5、稍等片刻，刷新当面页面，就可以看到自己的 vuepress 网站地址了！

> 到这里就大功告成了！我在中间遇到很多问题，基本上都是配置文件里的一些小错误，大家可以自行调试，希望能帮到大家，也希望大家多多支持一下，支持一下就能更快，更好，更多！
