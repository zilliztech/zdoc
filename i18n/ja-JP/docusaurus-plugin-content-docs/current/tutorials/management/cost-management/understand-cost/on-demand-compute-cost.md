---
title: "オンデマンドコンピューティングコスト | Cloud"
slug: /on-demand-compute-cost
sidebar_label: "オンデマンドコンピューティング"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のオンデマンドコンピューティングは、使用量ベースの課金モデルに従います。ワークロードで消費されたクエリコンピューティングとインデックス構築コンピューティングに対して課金されます。 | Cloud"
type: origin
token: O1qjwpv0Ri9afmkSUwWcU2aTn5f
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# オンデマンドコンピューティングコスト

Zilliz Cloud のオンデマンドコンピューティングは、使用量ベースの課金モデルに従います。ワークロードで消費されたクエリコンピューティングとインデックス構築コンピューティングに対して課金されます。

オンデマンドコンピューティングの合計コストは、次のコンポーネントの合計です。

- Query CU コスト

- Indexing CU コスト

## Query CU コスト\{#query-cu-cost}

Query CU コストは、オンデマンドクラスターによって消費されたコンピューティングリソースを測定します。

### コスト計算\{#cost-calculation}

```plaintext
Query CU Cost = Query CU Unit Price × Number of Query CU × Active Runtime
```

- **Query CU Unit Price**: クラウドリージョンとプロジェクトプランによって決まります。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **Number of Query CU**: オンデマンドクラスターに設定された Query CU の数です。

- **Active Runtime**: オンデマンドクラスターのコンピューティングリソースが使用されている課金対象の実行時間です。

    - 課金は、オンデマンドクラスターが **Running** ステータスになったときに開始されます。

    - 課金は、オンデマンドクラスターが非アクティブにより自動的に一時停止された場合（**Suspending** または **Suspended** ステータス）に停止します。

    - 最小課金単位は **1分** です。1分未満の使用はすべて1分として課金されます。

## Indexing CU コスト\{#indexing-cu-cost}

Indexing CU コストは、オンデマンドコンピューティングにおいて、[マネージドコレクション](./manage-collections-sdks) および [外部コレクション](./create-external-collection) の両方のデータに対してインデックスを構築する際に消費されるコンピューティングリソースを測定します。

### Indexing CU コストの発生源\{#sources-of-indexing-cu-cost}

次のシナリオで Indexing CU コストが発生します。

- マネージドコレクションと外部コレクションの両方のデータに対する初回の `CreateIndex` 構築

- `Refresh` によってトリガーされる増分インデックス構築

### コスト計算\{#cost-calculation}

```plaintext
Indexing CU Cost = Indexing CU Unit Price × Number of Indexing CU x Time
```

- **Indexing CU Unit Price**: クラウドリージョンとプロジェクトプランによって決まります。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **Number of Indexing CU**: システムが最も適切な量の Indexing CU を自動的に割り当てます。使用する Indexing CU の数を指定することはできません。

- **Time**: インデックス構築ジョブの完了にかかる時間です。カウントされるのはジョブの実行時間のみである点に注意してください。キュー待機時間と失敗したジョブは課金されません。最小課金単位は1分です。1分未満の使用はすべて1分として課金されます。

<Admonition type="info" icon="📘" title="**注記**">

[Usage](./analyze-cost) ページおよび [Invoice](./view-invoice) ページでは、Indexing CU コストは個々のジョブごとではなく、データベースごとの合計として表示されます。  

</Admonition>

## 例\{#example}

オンデマンドコンピューティングの使用状況が次のとおりであるとします。

- **Region**: AWS us-west-2

- **Project Plan**: Enterprise

- **Query CU Quantity**: 8 CU

- **On-demand cluster Runtime**: 30分

- **Indexing Usage**: 120 CU-分

上記の情報に基づき、[List Price](https://zilliz.com/pricing/pricing-guide?plan=Enterprise&provider=aws&region=aws-us-west-2) ページで次の単価を確認できます。

- **Query CU Unit Price** = &#36;0.41 / CU / 時間

- **Indexing CU Unit Price** = &#36;0.41 / CU / 時間

すると、次のようになります。

`Query CU Cost = 8 x (30 ÷ 60) x $0.41 = $1.64`

`Indexing CU Cost = (120 ÷ 60) x $0.41 = $0.82`

`Total On-demand Compute Cost = $1.64 + $0.82 = $2.46`

