---
title: "create | Cloud"
slug: /cli/cli/Alert-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建一条新的告警规则。 | Cloud"
type: docx
token: VSewdBpmioKEJ2xtGAHczoO5nWh
sidebar_position: 1
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - create
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# create

此操作会创建一条新的告警规则。

## Description\{#description}

Zilliz Cloud 允许您配置告警规则，以接收有关重点关注事件的通知。告警分为组织级告警和项目级告警。

组织级告警会监控整个 Zilliz Cloud 组织范围内与计费和账户相关的指标。与专注于集群性能的项目级告警不同，组织级告警可帮助您跟踪额度余额、支付方式和使用模式，从而确保服务不中断并防止出现意外计费问题。通过及时接收有关额度耗尽、支付失败和使用量阈值的通知，您可以随时了解账户健康状态并避免服务中断。

项目级告警可在满足指定条件时发送通知，从而帮助您主动监控 Zilliz Cloud 集群。您可以配置项目级告警来监控集群指标，例如 CU 容量和查询性能，确保在出现需要关注的潜在问题时立即收到通知。

Zilliz Cloud 中的告警通知可让您及时了解集群内发生的事件。默认情况下，这些通知会发送到指定用户的电子邮件地址。不过，您也可以使用 webhook 设置自定义通知渠道，以获得更集成化、事件驱动的通知方式。

运行此命令时如果不带任何选项，将触发一组交互式提示，帮助您完成设置。

## Synopsis\{#synopsis}

```bash
zilliz alert create
--project-id <value>
--metric-name <value>
--threshold <value>
--comparison <value>
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

## Options\{#options}

- **--project-id** (*string*) -

    **[REQUIRED]**

    指定 Project ID，格式类似于 `proj-xxxxx`。

    如果已使用 `zilliz context set` 配置项目，则在未显式配置此选项时会自动应用该项目。

- **--metric-name** (*string*) -

    **[REQUIRED]**

    指定要监控的指标。可选值包括：

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

    **[REQUIRED]**

    指定所选指标的阈值。

- **--comparison** (*string*) -

    **[REQUIRED]**

    指定比较运算符。

    可选项：`>`（或 `gt`）、`<`（或 `lt`）、`>=`（或 `gte`）、`<=`（或 `lte`）、`=`（或 `eq`）。

- **--rule-name** (*string*) -

    指定告警规则的显示名称。

- **--level** (*string*) -

    指定告警严重级别。默认值为 `WARNING`。

    可选值：`WARNING`、`CRITICAL`。

- **--window-size** (*string*) -

    指定监控窗口。例如，`5m`、`15m`、`1h` 等。

- **--cluster-id** (*array*) -

    指定目标集群 ID。

    您可以在同一条命令中多次使用此选项并指定不同的集群 ID。如果已使用 `zilliz context set` 配置集群，则在未显式配置此选项时会自动应用该集群。

- **--action** (*array*) -

    指定通知动作，格式为 `type:config`。例如，`email:user*@*example.com`。

    您可以在同一条命令中多次使用此选项并指定不同的集群 ID。

- **--send-resolved** (*string*) -

    指定是否在告警恢复时发送通知。

- **--repeat-interval** (*integer*) -

    指定发送通知的间隔时间，单位为秒。

- **--enabled** (*string*) -

    指定是否启用该规则。此选项默认为 true。

- **--output, -o** (*string*) -

    指定输出格式。可选值包括：

    - `json`，

    - `table`，

    - `text`。

## Example\{#example}

```bash
zilliz alert create --project-id porj-xxxx \
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
