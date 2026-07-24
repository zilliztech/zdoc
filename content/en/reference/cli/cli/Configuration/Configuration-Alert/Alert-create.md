---
title: "create | Cloud"
slug: /cli/cli/Alert-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a new alert rule. | Cloud"
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

This operation creates a new alert rule.

## Description\{#description}

Zilliz Cloud allows you to configure alert rules to receive notifications about the events of concern. There are organization alerts and project alerts.

Organization alerts monitor billing and account-related metrics across your entire Zilliz Cloud organization. Unlike project alerts that focus on cluster performance, organization alerts help you track credit balances, payment methods, and usage patterns to ensure uninterrupted service and prevent unexpected billing issues. Stay informed about account health and avoid service disruptions by receiving timely notifications about credit depletion, payment failures, and usage thresholds.

Project alerts enable proactive monitoring of your Zilliz Cloud clusters by sending notifications when specified conditions are met. You can configure project alerts to monitor cluster metrics such as CU capacity and query performance, ensuring you're immediately notified of potential issues that require attention.

Alert notifications in Zilliz Cloud keep you informed about events occurring within your clusters. By default, these notifications are sent to specified user email addresses. However, you can also set up custom notification channels using webhooks for more integrated, event-driven notifications.

Running this command without any options triggers a set of interactive prompts to help you set it up.

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

    Indicates a Project ID, which is simlar to `proj-xxxxx`.

    If a project is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--metric-name** (*string*) -

    **[REQUIRED]**

    Indicates the metric to monitor. Possible values:

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

    Indicates the threshold value for the selected metrics.

- **--comparison** (*string*) -

    **[REQUIRED]**

    Indicates the comparison operator. 

    Choices: `>` (or `gt`), `<` (or `lt`), `>=` (or `gte`), `<=` (or `lte`), `=` (or `eq`).

- **--rule-name** (*string*) -

    Indicates a display name for the alert rule.

- **--level** (*string*) -

    Indicates alert severity. The value defaults to `WARNING`.

    Possible values: `WARNING`, `CRITICAL`.

- **--window-size** (*string*) -

    Indicates the monitoring window. For example, `5m`, `15m`, `1h`, etc.

- **--cluster-id** (*array*) -

    Indicates the target cluster ID. 

    You can use this option with different cluster IDs in the same command. If a cluster is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--action** (*array*) -

    Indicates the notification action as in `type:config`. For example, `email:user*@*example.com`.

    You can use this option with different cluster IDs in the same command.

- **--send-resolved** (*string*) -

    Indicates whether to send notifications when the alert resolves.

- **--repeat-interval** (*integer*) -

    Indicates the interval at which the notification will be sent, in seconds.

- **--enabled** (*string*) -

    Indicates whether to enable the rule. This option defaults to true.

- **--output, -o** (*string*) -

    Indicates the output format. Possible values:

    - `json`,

    - `table`,

    - `text`.

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
