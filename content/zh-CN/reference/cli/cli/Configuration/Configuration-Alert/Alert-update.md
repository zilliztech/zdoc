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
  - vector database
  - IVF
  - knn
  - Image Search
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

    指定要启用的告警规则 ID，例如 `alert-xxxxx`。要获取现有告警规则的完整列表，请运行 `zilliz alert list`。

- **--project-id** (*string*) -

    指定 Project ID，例如 `proj-xxxx`。

    如果已使用 `zilliz context set` 配置项目，则在未配置此选项时会自动应用该项目。

- **--metric-name** (*string*) -

    指定要监控的指标。可能的值如下：

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

    指定阈值。

- **--comparison** (*string*) -

    指定比较运算符。 

    可选值：`>`（或 `gt`）、`<`（或 `lt`）、`>=`（或 `gte`）、`<=`（或 `lte`）、`=`（或 `eq`）。

- **--rule-name** (*string*) -

    指定告警规则的显示名称。

- **--level** (*string*) -

    指定告警严重级别。默认值为 `WARNING`。

    可能的值：`WARNING`、`CRITICAL`。

- **--window-size** (*string*) -

    指定监控窗口。例如，`5m`、`15m`、`1h` 等。

- **--cluster-id** (*array*) -

    指定目标集群 ID。 

    您可以在同一命令中多次使用此选项来指定不同的集群 ID。如果已使用 `zilliz context set` 配置集群，则在未配置此选项时会自动应用该集群。

- **--action** (*array*) -

    按 `type:config` 的格式指定通知动作。例如，`email:user*@*example.com`。

    您可以在同一命令中多次使用此选项来指定不同的集群 ID。

- **--send-resolved** (*string*) -

    指定在告警恢复时是否发送通知。

- **--repeat-interval** (*integer*) -

    指定发送通知的间隔时间，单位为秒。

- **--enabled** (*string*) -

    指定是否启用该规则。此选项默认值为 true。

- **--output, -o** (*string*) -

    指定输出格式。可选值：`json`、`table`、`text`。

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
