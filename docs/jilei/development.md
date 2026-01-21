---
title: development
createTime: 2026/01/20 11:13:09
permalink: /article/v4p57qcc/
---

# 开发代码

## 注释

```ts
/**
 * 添加单位，支持以下场景：
 * 1. 单值：如果有rpx、%、px等单位结尾或者值为auto，直接返回，否则加上rpx单位结尾
 * 2. 多值（空格分隔）：分别处理每个值，如 "10 20" => "10rpx 20rpx"
 *
 * @example
 * ```ts
 * addUnit(10) => "10rpx"
 * addUnit('10px') => "10px"
 * addUnit('auto') => "auto"
 * addUnit('10 20') => "10rpx 20rpx"
 * addUnit('10rpx 20') => "10rpx 20rpx"
 * ```
 *
 * @param value 输入值，可以为字符串或数字，默认'auto'。支持空格分隔的多值（用于 padding、margin 等）
 * @param unit 单位，默认'rpx'
 * @returns 添加单位后的字符串
 */
export default function addUnit(value: string | number = 'auto', unit: string = 'rpx'): string {
  return 'xx'
}
```
