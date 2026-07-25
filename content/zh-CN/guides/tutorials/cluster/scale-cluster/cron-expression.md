---
title: "Cron 表达式 | Cloud"
slug: /cron-expression
sidebar_key: cron-expression
sidebar_label: "Cron 表达式"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Cron 表达式用于定义系统执行自动扩缩容任务的调度计划。 | Cloud"
type: origin
token: FJkpwLOJRisXX0kxqC8ck8YAn4c
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 扩缩容，Cron 表达式

---

import Admonition from '@theme/Admonition';


# Cron 表达式

Cron 表达式用于定义系统执行自动扩缩容任务的调度计划。

本文将介绍 **Unix cron** 格式的表达式（标准 **5 字段**语法），其精度为**分钟级**。当表达式中的**所有字段**都与当前时间匹配时，调度任务将被触发。Cron 调度计划会按照您所选择的时区进行计算与触发。

## 表达式格式与字段取值范围\{#expression-format-and-field-values}

```bash
* * * * *
│ │ │ │ └── 星期几（day of week）
│ │ │ └──── 月份（month）
│ │ └────── 日期（day of month）
│ └──────── 小时（hour）
└────────── 分钟（minute）
```

<table>
   <tr>
     <th><p><strong>Field</strong></p></th>
     <th><p><strong>取值范围</strong></p></th>
     <th><p><strong>说明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>minute</code></p></td>
     <td><p>[0 - 59]</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><code>hour</code></p></td>
     <td><p>[0 - 23]</p></td>
     <td><p>24 小时制。</p><p>例如，当 CRON 表达式的 <code>hour</code> 字段为 <code>17</code> 时，该字段匹配 <code>17:00</code> 到 <code>17:59</code> 之间的任意时间。</p></td>
   </tr>
   <tr>
     <td><p><code>day of month</code></p></td>
     <td><p>[1 - 31]</p></td>
     <td><p>并非所有月份都有 31 天。如果您在天数较少的月份里设置为 <code>31</code>，则该月的计划扩缩容任务不会运行。</p></td>
   </tr>
   <tr>
     <td><p><code>month</code></p></td>
     <td><p>[1 -12]</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><code>day of week</code></p></td>
     <td><p>[0 - 6]</p></td>
     <td><p><code>0</code> 表示<code>周日</code>，<code>1</code> 表示<code>周一</code>， <code>2</code> 表示<code>周二</code> …… 以此类推。</p></td>
   </tr>
</table>

## 特殊字符与操作符\{#special-characters-and-operators}

以下操作符可用于大部分字段：

<table>
   <tr>
     <th><p><strong>操作符</strong></p></th>
     <th><p><strong>含义</strong></p></th>
     <th><p><strong>示例</strong></p></th>
   </tr>
   <tr>
     <td><p><code>&ast;</code></p></td>
     <td><p>任意值</p></td>
     <td><p><code>&ast; &ast; &ast; &ast; &ast;</code> 表示每分钟运行一次。</p></td>
   </tr>
   <tr>
     <td><p><code>,</code></p></td>
     <td><p>列表</p></td>
     <td><p><code>0 9,17 &ast; &ast; &ast;</code> 表示在每天 09:00 和 17:00 运行。</p></td>
   </tr>
   <tr>
     <td><p><code>-</code></p></td>
     <td><p>范围</p></td>
     <td><p><code>0 9-17 &ast; &ast; &ast;</code> 表示在每天 09:00 到 17:00 之间运行。</p></td>
   </tr>
   <tr>
     <td><p><code>/</code></p></td>
     <td><p>间隔触发</p><p>说明: <code>-</code> 可以和 <code>/</code> 组合使用。</p></td>
     <td><p><code>&ast;/5 &ast; &ast; &ast; &ast;</code> 表示每 5 分钟运行一次。</p><p><code>10-50/10 &ast; &ast; &ast; &ast;</code> 表示在每小时的第 10、20、30、40、50 分钟运行。</p></td>
   </tr>
</table>

## 示例\{#examples}

本节提供了一些可直接使用的[常用表达式模板](./cron-expression#simple-templates)。如果您需要使用多个运算符组合的复杂表达式，请参考此处的[常见示例](./cron-expression#common-scenarios)。

### 常用模板\{#simple-templates}

<table>
   <tr>
     <th><p><strong>使用场景</strong></p></th>
     <th><p><strong>Cron 表达式</strong></p></th>
     <th><p><strong>含义</strong></p></th>
   </tr>
   <tr>
     <td><p>每分钟</p></td>
     <td><p><code>&ast; &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>每分钟运行一次</p></td>
   </tr>
   <tr>
     <td><p>每 5 分钟</p></td>
     <td><p><code>&ast;/5 &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>每 5 分钟运行一次</p></td>
   </tr>
   <tr>
     <td><p>每小时</p></td>
     <td><p><code>0 &ast; &ast; &ast; &ast;</code></p></td>
     <td><p>每小时整点运行</p></td>
   </tr>
   <tr>
     <td><p>每天 09:30</p></td>
     <td><p><code>30 9 &ast; &ast; &ast;</code></p></td>
     <td><p>每天 09:30 运行</p></td>
   </tr>
   <tr>
     <td><p>工作日 09:00</p></td>
     <td><p><code>0 9 &ast; &ast; 1-5</code></p></td>
     <td><p>周一到周五 09:00 运行</p></td>
   </tr>
   <tr>
     <td><p>每月第 1 天 09:00</p></td>
     <td><p><code>0 9 1 &ast; &ast;</code></p></td>
     <td><p>每月 1 日 09:00 运行</p></td>
   </tr>
   <tr>
     <td><p>每周日 09:00</p></td>
     <td><p><code>0 9 &ast; &ast; 0</code></p></td>
     <td><p>每周日 09:00 运行</p></td>
   </tr>
   <tr>
     <td><p>每天两次</p></td>
     <td><p><code>0 9,21 &ast; &ast; &ast;</code></p></td>
     <td><p>每天 09:00 和 21:00 运行</p></td>
   </tr>
</table>

### 常见场景\{#common-scenarios}

以下示例展示了如何根据常见的工作负载模式，为定时扩缩容任务编写 Unix cron 表达式。

**示例 1：工作日高峰时段扩容，工作日非高峰时段缩容**

需要创建两个计划：一个用于高峰时段，一个用于非高峰时段。

- **高峰时段：** `* 9-18 * * 1-5`

    周一到周五，在 09:00–18:59 之间每分钟运行一次。

- **非高峰：** `* 0-8,19-23 * * 1-5`

    周一到周五，在 00:00–08:59 和 19:00–23:59 之间每分钟运行一次。

**示例 2：周末节省资源成本 + 周一恢复资源使用**

需要创建两个计划：一个用于周末，一个用于周一恢复。

- **周末：** `* * * * 0,6`

    周六和周日每分钟运行一次。

- **周一恢复：** `0 9 * * 1`

     每周一 09:00 运行。