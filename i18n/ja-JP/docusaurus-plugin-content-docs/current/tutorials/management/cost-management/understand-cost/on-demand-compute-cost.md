---
title: "オンデマンドコンピュートコスト | Cloud"
slug: /on-demand-compute-cost
sidebar_label: "オンデマンドコンピュート"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud のオンデマンドコンピュートは従量課金モデルに従います。ワークロードで消費されたクエリコンピュートとインデックス構築コンピュートに対して課金されます。 | Cloud"
type: origin
token: O1qjwpv0Ri9afmkSUwWcU2aTn5f
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# オンデマンドコンピュートコスト

Zilliz Cloud のオンデマンドコンピュートは従量課金モデルに従います。ワークロードで消費されたクエリコンピュートとインデックス構築コンピュートに対して課金されます。

オンデマンドコンピュートの総コストは、以下のコンポーネントの合計です。

- Query CU コスト

- Indexing CU コスト

## Query CU コスト\{#query-cu-cost}

Query CU コストは、オンデマンドクラスターによって消費されるコンピュートリソースを測定します。

### コスト計算\{#cost-calculation}

```plaintext
Query CU Cost = Query CU Unit Price × Number of Query CU × Active Runtime
```

- **Query CU Unit Price**: クラウドリージョンとプロジェクトプランによって決まります。詳細な料金については、[Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **Number of Query CU**: オンデマンドクラスターに設定された Query CU の数です。

- **Active Runtime**: オンデマンドクラスターのコンピュートリソースが使用されている間の課金対象ランタイムです。

    - 課金は、オンデマンドクラスターが **Running** ステータスになった時点で開始されます。

    - 課金は、オンデマンドクラスターが非アクティブのために自動サスペンドされた（**Suspending** または **Suspended** ステータスの）時点で停止します。

    - 最小課金単位は **1 分** です。1 分未満の使用も 1 分として課金されます。

## Indexing CU コスト\{#indexing-cu-cost}

Indexing CU コストは、オンデマンドコンピュートで [マネージドコレクション](./manage-collections-sdks) と [外部コレクション](./create-external-collection) の両方のデータに対してインデックスを構築する際に消費されるコンピュートリソースを測定します。

### Indexing CU コストの発生源\{#sources-of-indexing-cu-cost}

以下のシナリオで Indexing CU コストが発生します。

- マネージドコレクションと外部コレクションの両方にあるデータに対する初回の `CreateIndex` 構築

- `Refresh` によってトリガーされる増分インデックス構築

### コスト計算\{#cost-calculation}

```plaintext
Indexing CU Cost = Indexing CU Unit Price × Number of Indexing CU x Time
```

- **Indexing CU Unit Price**: クラウドリージョンとプロジェクトプランによって決まります。詳細な料金については、[Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **Number of Indexing CU**: システムが最も適切な量の Indexing CU を自動的に割り当てます。使用する Indexing CU の数を指定することはできません。

- **Time**: インデックス構築ジョブの完了にかかる時間です。ジョブの実行時間のみがカウントされる点に注意してください。キュー待機時間と失敗したジョブは課金されません。最小課金単位は 1 分です。1 分未満の使用も 1 分として課金されます。

<Admonition type="info" icon="📘" title="**注**">

[Usage](./analyze-cost) ページと [Invoice](./view-invoice) ページでは、Indexing CU コストは個々のジョブごとではなく、データベースごとの合計として表示されます。  

</Admonition>

## 例\{#example}

オンデマンドコンピュートの使用状況が次のとおりだとします。

- **Region**: AWS us-west-2

- **Project Plan**: Enterprise

- **Query CU Quantity**: 8 CU

- **On-demand cluster Runtime**: 30 分

- **Indexing Usage**: 120 CU-分

上記の情報に基づき、[List Price](https://zilliz.com/pricing/pricing-guide?plan=Enterprise&provider=aws&region=aws-us-west-2) ページで以下の単価を確認できます。

- **Query CU Unit Price** = &#36;0.41 / CU / 時間

- **Indexing CU Unit Price** = &#36;0.41 / CU / 時間

すると、次のようになります。

`Query CU Cost = 8 x 30 x $0.41 = $98.40`

`Indexing CU Cost = 120 x $0.41 = $49.20`

`Total On-demand Compute Cost = $98.40+ $49.20 = $147.60`

