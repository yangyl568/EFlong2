# 很常见需求: 在jenkins发布分支的时候，需要选择 不同分支来选择性发布。

啥也不说了来 上个最终效果图~

![jenkins多分支选择](https://cdn.nlark.com/yuque/0/2020/png/407340/1578201281795-799be0d5-e918-4f3b-b2b1-a070f467ede3.png)

> 可选择多分支并且过滤 release (采用gitflow工作流规范)

## 安装配置 基本操作

1. 安装Git Parameter插件 --》在系统管理中的插件管理

![jenkins安装git parameter插件](https://cdn.nlark.com/yuque/0/2020/png/407340/1578201281888-7ea04f03-6fc9-45dd-83f6-d3394df1420a.png)

2. 插件安装成功后，返回首页，找到 想要设置的分支 打开其 【设置】找到这个 git parameter(只有安装上面1的插件之后才会出现，否则不能用噢~)

## 设置 多分支选择

![jenkins多分支选择设置](https://cdn.nlark.com/yuque/0/2020/png/407340/1578201281800-73dfa522-289e-4806-a771-b2283601a0e7.png)

紧接着：

![jenkins多分支选择设置2](https://cdn.nlark.com/yuque/0/2020/png/407340/1578201281916-39ead63d-e965-4715-a60f-5da974bff7ed.png)

此时【保存】 基本就可以实现 多分支选择功能了，开心的 搓搓小手 O(∩_∩)O

> 我需求更多，我只想要发布 release/ 下面的分支，其他的不让他们显示 该怎么办呢？

再次打开这个地方 有个 【高级】

![jenkins多分支选择设置高级](https://cdn.nlark.com/yuque/0/2020/png/407340/1578201281897-a21543c0-5f0e-42f5-9444-f69daa9c6dca.png)

## 使用 Branch Filter 分支过滤功能

![jenkins多分支选择设置分支过滤](https://cdn.nlark.com/yuque/0/2020/png/407340/1578201281581-292211cc-b7d1-4e53-9bba-fd9b2e2d271d.png)

666~ 这个隐藏的很深，我 当天找了 好久才找到。 其他教程就是半吊子，没讲到这里。。。
