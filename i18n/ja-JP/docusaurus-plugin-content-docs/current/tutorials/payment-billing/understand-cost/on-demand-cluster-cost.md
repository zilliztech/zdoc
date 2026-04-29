---
title: "オンデマンドクラスターのコスト | Cloud"
slug: /on-demand-cluster-cost
sidebar_key: on-demand-cluster-cost
sidebar_label: "オンデマンドクラスター"
beta: PUBLIC
notebook: FALSE
description: "Zilliz Cloud のオンデマンドコンピューティングは、使用量に基づく課金モデルを採用しています。ワークロードによって消費されたクエリ計算およびインデックス構築計算に対して課金されます。 | Cloud"
type: origin
token: O1qjwpv0Ri9afmkSUwWcU2aTn5f
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コスト
  - 課金

---

import Admonition from '@theme/Admonition';


# オンデマンドクラスターのコスト

Zilliz Cloud におけるオンデマンドコンピューティングは、使用量に基づく課金モデルに従います。ワークロードによって消費されたクエリコンピューティングおよびインデックス作成コンピューティングに対して課金されます。

オンデマンドコンピューティングの総コストは、以下のコンポーネントの合計です：

- クエリ CU コスト

- インデックス作成 CU コスト

## クエリ CU コスト\{#query-cu-cost}

クエリ CU コストは、オンデマンドクラスターによって消費されるコンピューティングリソースを測定します。

### コスト計算\{#cost-calculation}

```plaintext
Query CU Cost = Query CU Unit Price × Number of Query CU × Active Runtime
```

- **クエリ CU の単価**: クラウドリージョンとプロジェクトプランによって決定されます。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide) をご参照ください。

- **クエリ CU 数**: オンデマンドクラスターに構成されたクエリ CU の数です。

- **アクティブ実行時間**: オンデマンドクラスターの計算リソースが使用されている際の課金対象の実行時間です。

    - 課金は、オンデマンドクラスターが**Running**ステータスになったときに開始されます。

    - 課金は、非アクティブによりオンデマンドクラスターが自動で一時停止され（**一時停止ing**または**一時停止ed**ステータス）、停止したときに終了します。

    - 最小課金単位は**1 分**です。1 分未満の使用も 1 分として課金されます。

## インデックス作成 CU コスト\{#indexing-cu-cost}

インデックス作成 CU コストは、[外部コレクション](null) 内のデータに対してインデックスを作成する際に消費される計算リソースを測定します。

### インデックス作成 CU コストの発生源\{#sources-of-indexing-cu-cost}

以下のシナリオでインデックス作成 CU コストが発生します。

- 外部コレクション内のデータに対する初期 `CreateIndex` ビルド

- `Refresh` 後にトリガーされる増分インデックスビルド

### コスト計算\{#cost-calculation}

```plaintext
Indexing CU Cost = Indexing CU Unit Price × Number of Indexing CU x Time
```

- **インデックス作成 CU 単価**: クラウドリージョンとプロジェクトプランによって決定されます。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide) をご参照ください。

- **インデックス作成 CU 数**: システムが自動的に最適な量の インデックス作成 CU を割り当てます。使用する インデックス作成 CU の数を指定することはできません。

- **時間**: インデックス構築ジョブの完了にかかる時間です。ジョブの実行時間のみが課金対象であり、キューでの待機時間は課金されません。最小課金単位は 1 分です。1 分未満の使用であっても 1 分として課金されます。

<Admonition type="info" icon="📘" title="**Note**">

<p><a href="./analyze-cost">使用量</a>ページと<a href="./view-invoice">請求書</a>ページでは、インデックス作成 CU のコストは個別のジョブごとではなく、オンデマンドコンピュートデータベースごとの合計として表示されます。</p>

</Admonition>

