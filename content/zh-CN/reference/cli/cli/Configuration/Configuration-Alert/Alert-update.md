---
title: "update | Cloud"
slug: /cli/cli/Alert-update
sidebar_label: "update"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更新现有告警规则。 | Cloud"
type: docx
token: FxUedhePWogwX4xRxFucLvaqnGg
sidebar_position: 6
keywords: 
  - 向量 Database
  - IVF
  - knn
  - 图像搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - 更新
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# update

此操作会更新现有告警规则。

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

    **[REQUIRED]**

    指示要启用的告警规则的 ID，例如 `alert-xxxxx`。要获取现有告警规则的完整列表，请运行 `zilliz alert list`。

- **--project-id** (*string*) -

    指示 Project ID，例如 `proj-xxxx`。

    如果使用 `zilliz context set` 配置了项目，而此选项未配置，则会自动应用该项目。

- **--metric-name** (*string*) -

    指示要监控的指标。可选值：

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

    指示阈值。

- **--comparison** (*string*) -

    指示比较运算符。

    可选值：`>`（或 `gt`）、`<`（或 `lt`）、`>=`（或 `gte`）、`<=`（或 `lte`）、`=`（或 `eq`）。

- **--rule-name** (*string*) -

    指示告警规则的显示名称。

- **--level** (*string*) -

    指示告警严重级别。该值默认为 `WARNING`。

    可选值：`WARNING`、`CRITICAL`。

- **--window-size** (*string*) -

    指示监控窗口。例如 `5m`、`15m`、`1h` 等。

- **--cluster-id** (*array*) -

    指示目标集群 ID。

    您可以在同一命令中将此选项与不同的集群 ID 一起使用。如果使用 `zilliz context set` 配置了集群，而此选项未配置，则会自动应用该集群。

- **--action** (*array*) -

    指示通知操作，格式为 `type:config`。例如 `email:user<em>@</em>example.com`。

    您可以在同一命令中将此选项与不同的集群 ID 一起使用。

- **--send-resolved** (*string*) -

    指示告警解除时是否发送通知。

- **--repeat-interval** (*integer*) -

    指示发送通知的间隔，单位为秒。

- **--enabled** (*string*) -

    指示是否启用该规则。此选项默认为 true。

- **--output, -o** (*string*) -

    指示输出格式。可选值：`json`、`table`、`text`。

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
