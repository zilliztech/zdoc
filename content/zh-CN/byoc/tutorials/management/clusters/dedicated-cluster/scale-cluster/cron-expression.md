---
title: "了解 Cron 表达式 | BYOC"
slug: /cron-expression
sidebar_label: "Cron 表达式"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Cron 表达式定义定时扩缩容任务的运行时间。Zilliz Cloud 使用标准五字段 Unix cron 格式，粒度为分钟。Cron 计划会按您选择的时区进行评估。 | BYOC"
type: origin
token: Tzvkw65P7iBWjoktlQvcAE8Ynwk
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 了解 Cron 表达式

Cron 表达式定义定时扩缩容任务的运行时间。Zilliz Cloud 使用标准五字段 Unix cron 格式，粒度为分钟。Cron 计划会按您选择的时区进行评估。

```plaintext
* * * * *
│ │ │ │ └── 星期
│ │ │ └──── 月
│ │ └────── 日期
│ └──────── 小时
└────────── 分钟
```

| 字段 | 有效取值范围 | 说明 |
| --- | --- | --- |
| `minute` | `0` 到 `59` | 小时内的分钟。 |
| `hour` | `0` 到 `23` | 使用 24 小时制。 |
| `day of month` | `1` 到 `31` | 如果某个月没有指定日期，则该计划在该月不会运行。 |
| `month` | `1` 到 `12` | 一年中的月份。 |
| `day of week` | `0` 到 `6` | `0` 表示星期日，`1` 表示星期一，依此类推。 |

### 支持的运算符\{#supported-operators}

| 运算符 | 含义 | 示例 |
| --- | --- | --- |
| `*` | 任意值。 | `* * * * *` 每分钟运行一次。 |
| `,` | 值列表。 | `0 9,17 * * *` 每天 09:00 和 17:00 运行。 |
| `-` | 值范围。 | `0 9-17 * * *` 从 09:00 到 17:00 每小时运行一次。 |
| `/` | 步长值。 | `*/5 * * * *` 每 5 分钟运行一次。 |

### 常见 Cron 模板\{#common-cron-templates}

| 使用场景 | Cron 表达式 | 含义 |
| --- | --- | --- |
| 每天 09:30 | `30 9 * * *` | 每天 09:30 运行。 |
| 工作日 09:00 | `0 9 * * 1-5` | 周一到周五 09:00 运行。 |
| 每周日 09:00 | `0 9 * * 0` | 每周日 09:00 运行。 |
| 每天两次 | `0 9,21 * * *` | 每天 09:00 和 21:00 运行。 |
| 每月 1 日 09:00 | `0 9 1 * *` | 每月第一天 09:00 运行。 |

### 示例计划\{#example-schedules}

**在工作日高峰时段扩容，并在下班后缩容**

创建两个计划：一个用于在高峰时段前扩容，另一个用于在高峰时段后缩容。

| 计划 | Cron 表达式 | 目标 |
| --- | --- | --- |
| 周一到周五 09:00 扩容 | `0 9 * * 1-5` | 将 Query CU 或 Replica 设置为高峰时段目标值。 |
| 周一到周五 19:00 缩容 | `0 19 * * 1-5` | 将 Query CU 或 Replica 设置为非高峰目标值。 |

**周末使用更少资源，并在周一恢复**

创建一个计划用于周六缩容，另一个计划用于周一恢复容量。

| 计划 | Cron 表达式 | 目标 |
| --- | --- | --- |
| 每周六 00:00 缩容 | `0 0 * * 6` | 将 Query CU 或 Replica 设置为周末目标值。 |
| 每周一 09:00 恢复 | `0 9 * * 1` | 将 Query CU 或 Replica 设置为工作日目标值。 |
