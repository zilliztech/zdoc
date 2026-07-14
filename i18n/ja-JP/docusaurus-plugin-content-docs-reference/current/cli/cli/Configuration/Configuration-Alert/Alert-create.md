---
title: "create | Cloud"
slug: /cli/cli/Alert-create
sidebar_label: "create"
beta: false
added_since: v0.1.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は新しいアラートルールを作成します。 | Cloud"
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

この操作は新しいアラートルールを作成します。

## Description\{#description}

Zilliz Cloud では、関心のあるイベントに関する通知を受け取るためにアラートルールを設定できます。アラートには組織アラートとプロジェクトアラートがあります。

組織アラートは、Zilliz Cloud 組織全体にわたって請求およびアカウント関連のメトリクスを監視します。クラスターのパフォーマンスに焦点を当てるプロジェクトアラートとは異なり、組織アラートはクレジット残高、支払い方法、使用パターンを追跡するのに役立ち、中断のないサービスを確保し、予期しない請求の問題を防止します。クレジットの枯渇、支払い失敗、使用量のしきい値に関するタイムリーな通知を受け取ることで、アカウントの健全性を把握し、サービス中断を回避できます。

プロジェクトアラートでは、指定した条件が満たされたときに通知を送信することで、Zilliz Cloud クラスターをプロアクティブに監視できます。プロジェクトアラートを設定して、CU capacity やクエリパフォーマンスなどのクラスターメトリクスを監視し、対応が必要な潜在的な問題を即座に通知されるようにできます。

Zilliz Cloud のアラート通知は、クラスター内で発生しているイベントについて情報を提供します。デフォルトでは、これらの通知は指定されたユーザーのメールアドレスに送信されます。ただし、webhook を使用してカスタム通知チャネルを設定し、より統合されたイベント駆動型の通知を行うこともできます。

オプションを指定せずにこのコマンドを実行すると、設定を支援する一連の対話型プロンプトが開始されます。

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

    `proj-xxxxx` に似た Project ID を示します。

    `zilliz context set` を使用してプロジェクトが設定されている場合、このオプションを指定しなくても自動的に適用されます。

- **--metric-name** (*string*) -

    **[REQUIRED]**

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

    **[REQUIRED]**

    選択したメトリクスのしきい値を示します。

- **--comparison** (*string*) -

    **[REQUIRED]**

    比較演算子を示します。 

    選択肢: `>` (または `gt`)、`<` (または `lt`)、`>=` (または `gte`)、`<=` (または `lte`)、`=` (または `eq`)。

- **--rule-name** (*string*) -

    アラートルールの表示名を示します。

- **--level** (*string*) -

    アラートの重大度を示します。デフォルト値は `WARNING` です。

    指定可能な値: `WARNING`, `CRITICAL`。

- **--window-size** (*string*) -

    監視ウィンドウを示します。たとえば、`5m`、`15m`、`1h` などです。

- **--cluster-id** (*array*) -

    対象のクラスター ID を示します。 

    このオプションは、同じコマンド内で異なるクラスター ID とともに使用できます。`zilliz context set` を使用してクラスターが設定されている場合、このオプションを指定しなくても自動的に適用されます。

- **--action** (*array*) -

    `type:config` 形式の通知アクションを示します。たとえば、`email:user*@*example.com` です。

    このオプションは、同じコマンド内で異なるクラスター ID とともに使用できます。

- **--send-resolved** (*string*) -

    アラートが解消されたときに通知を送信するかどうかを示します。

- **--repeat-interval** (*integer*) -

    通知を送信する間隔を秒単位で示します。

- **--enabled** (*string*) -

    ルールを有効にするかどうかを示します。このオプションのデフォルトは true です。

- **--output, -o** (*string*) -

    出力形式を示します。指定可能な値:

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
