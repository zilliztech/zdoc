---
title: "update | Cloud"
slug: /cli/cli/Alert-update
sidebar_label: "update"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation updates an existing alert rule. | Cloud"
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

This operation updates an existing alert rule.

## Synopsis\{#synopsis}

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

## Options\{#options}

- **--id** (*string*) -

    **[REQUIRED]**

    Indicates the ID of the alert rule to enable, such as `alert-xxxxx`. To get an exhaustive list of existing alert rules, run `zilliz alert list`.

- **--project-id** (*string*) -

    Indicates a Project ID, such as `proj-xxxx`.

    If a project is configured using `zilliz context set`, it automatically applies if this option is left unconfigured.

- **--metric-name** (*string*) -

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

    Indicates the threshold value.

- **--comparison** (*string*) -

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

    Indicates the output format. Choices: `json`, `table`, `text`.

## Example\{#example}

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
