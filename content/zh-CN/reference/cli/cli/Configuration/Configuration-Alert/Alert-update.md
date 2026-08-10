---
title: "update | Cloud"
slug: /cli/cli/Alert-update
sidebar_label: "update"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更新现有的告警规则。 | Cloud"
type: docx
token: FxUedhePWogwX4xRxFucLvaqnGg
sidebar_position: 6
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - zilliz
  - zilliz cloud
  - cloud
  - update
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# update

此操作会更新现有的告警规则。

## 概要\{#synopsis}

```bash
zilliz alert update
--id <value>
[--project-id <value>]
[--metric-name <value>]
[--threshold <value>]
[--comparison <value>]
[--rule-name <value>]
[--level <WARNING | CRITICAL>]
[--window-size <value>]
[--cluster-id <value>]
[--action <value>]
[--send-resolved]
[--repeat-interval <value>]
[--enabled]
[--output <json | table | text>]
```

## 选项\{#options}

- **--id** (*string*) -

    **[必需]**

    表示要启用的告警规则 ID，例如 `alert-xxxxx`。如需获取现有告警规则的完整列表，请运行 `zilliz alert list`。

- **--project-id** (*string*) -

    表示项目 ID，例如 `proj-xxxx`。

    如果已使用 `zilliz context set` 配置项目，则在未配置此选项时会自动应用该项目。

- **--metric-name** (*string*) -

    表示要监控的指标。可能的值包括：

    - `CU_COMPUTATION`

    - `CU_CAPACITY`

    - `REQ_SEARCH_COUNT`

    - `REQ_QUERY_COUNT`

    - `REQ_SEARCH_LATENCY_P99`

    - `REQ_QUERY_LATENCY_P99`

    - `REQ_SEARCH_FAILURE_RATE`

    - `REQ_QUERY_FAILURE_RATE`

    - `TOTAL_ENTITIES`

    - `CREDIT_CARD_EXPIRATION`

    - `FREE_CREDITS_BALANCE`

    - `WALLET_BALANCE`

    - `DAILY_USAGE`

- **--threshold** (*string*) -

    表示阈值。

- **--comparison** (*string*) -

    表示比较运算符。

    可选值：`>`（或 `gt`）、`<`（或 `lt`）、`>=`（或 `gte`）、`<=`（或 `lte`）、`=`（或 `eq`）。

- **--rule-name** (*string*) -

    表示告警规则的显示名称。

- **--level** (*string*) -

    表示告警严重级别。默认值为 `WARNING`。

    可能的值包括：`WARNING`、`CRITICAL`。

- **--window-size** (*string*) -

    表示监控窗口。例如，`5m`、`15m`、`1h` 等。

- **--cluster-id** (*array*) -

    表示目标集群 ID。

    您可以在同一命令中将此选项与不同的集群 ID 一起使用。如果已使用 `zilliz context set` 配置集群，则在未配置此选项时会自动应用该集群。

- **--action** (*array*) -

    表示通知动作，格式如 `type:config`。例如，`email:user*@*example.com`。

    您可以在同一命令中将此选项与不同的集群 ID 一起使用。

- **--send-resolved** (*string*) -

    表示在告警解除时是否发送通知。

- **--repeat-interval** (*integer*) -

    表示发送通知的时间间隔，单位为秒。

- **--enabled** (*string*) -

    表示是否启用该规则。此选项默认为 true。

- **--output, -o** (*string*) -

    表示输出格式。可选值：`json`、`table`、`text`。

## 示例\{#example}

```bash
zilliz alert update --project-id porj-xxxx \
--metric-name WALLET_BALANCE \
--threshold 100 \
--comparison eq \
--rule-name wallet-watch \
--level warning \
--window-size 1d \
--cluster-id inx-xxxx \
--action email:john.doe@zilliz.com \
--send-resolved \
--repeat-interval 300 \
--enabled
```
