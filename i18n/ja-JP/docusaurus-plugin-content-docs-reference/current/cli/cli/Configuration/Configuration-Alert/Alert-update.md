---
title: "update | Cloud"
slug: /cli/cli/Alert-update
sidebar_label: "update"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は既存のアラートルールを更新します。 | Cloud"
type: docx
token: FxUedhePWogwX4xRxFucLvaqnGg
sidebar_position: 6
keywords: 
  - ベクターデータベース
  - IVF
  - knn
  - 画像検索
  - zilliz
  - zilliz cloud
  - cloud
  - 更新
  - cliv14
displayed_sidebar: cliSidebar

displayed_sidbar: cliSidebar
---

import Admonition from '@theme/Admonition';


# update

この操作は既存のアラートルールを更新します。

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

    **[必須]**

    有効化するアラートルールの ID を示します。例: `alert-xxxxx`。既存のアラートルールの一覧を完全に取得するには、`zilliz alert list` を実行します。

- **--project-id** (*string*) -

    `proj-xxxx` のような Project ID を示します。

    `zilliz context set` を使用して project が設定されている場合、このオプションを指定しなくても自動的に適用されます。

- **--metric-name** (*string*) -

    監視するメトリクスを示します。指定可能な値:

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

    しきい値を示します。

- **--comparison** (*string*) -

    比較演算子を示します。 

    選択肢: `>` (または `gt`)、`<` (または `lt`)、`>=` (または `gte`)、`<=` (または `lte`)、`=` (または `eq`)。

- **--rule-name** (*string*) -

    アラートルールの表示名を示します。

- **--level** (*string*) -

    アラートの重要度を示します。デフォルト値は `WARNING` です。

    指定可能な値: `WARNING`、`CRITICAL`。

- **--window-size** (*string*) -

    監視ウィンドウを示します。例: `5m`、`15m`、`1h` など。

- **--cluster-id** (*array*) -

    対象の cluster ID を示します。 

    同じコマンド内で、このオプションを異なる cluster ID とともに使用できます。`zilliz context set` を使用して cluster が設定されている場合、このオプションを指定しなくても自動的に適用されます。

- **--action** (*array*) -

    `type:config` 形式の通知アクションを示します。例: `email:user*@*example.com`。

    同じコマンド内で、このオプションを異なる cluster ID とともに使用できます。

- **--send-resolved** (*string*) -

    アラートが解消されたときに通知を送信するかどうかを示します。

- **--repeat-interval** (*integer*) -

    通知を送信する間隔を秒単位で示します。

- **--enabled** (*string*) -

    ルールを有効にするかどうかを示します。このオプションのデフォルトは true です。

- **--output, -o** (*string*) -

    出力形式を示します。選択肢: `json`、`table`、`text`。

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
