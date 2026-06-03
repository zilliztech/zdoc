---
title: "オンデマンドコンピュートコスト | Cloud"
slug: /on-demand-compute-cost
sidebar_key: on-demand-compute-cost
sidebar_label: "オンデマンドコンピュート"
beta: PUBLIC
notebook: FALSE
description: "Zilliz Cloud のオンデマンドコンピュートは、使用量ベースの課金モデルに従います。ワークロードによって消費されるクエリコンピュートとインデックス構築コンピュートに対して課金されます。"
type: origin
token: O1qjwpv0Ri9afmkSUwWcU2aTn5f
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - コスト
  - 課金

---

import Admonition from '@theme/Admonition';


# オンデマンドコンピュートコスト

Zilliz Cloud のオンデマンドコンピュートは、従量課金制の請求モデルに従います。ワークロードによって消費されるクエリコンピュートとインデックス構築コンピュートに対して課金されます。

オンデマンドコンピュートの総コストは、以下のコンポーネントの合計です。

- クエリ CU コスト

- インデックス作成 CU コスト

## クエリ CU コスト\{#query-cu-cost}

クエリ CU コストは、オンデマンドクラスターによって消費されるコンピュートリソースを測定します。

### コスト計算\{#cost-calculation}

```plaintext
Query CU Cost = Query CU Unit Price × Number of Query CU × Active Runtime
```

- **クエリCU 単価**: クラウドリージョンとプロジェクトプランによって決定されます。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **クエリCU数**: オンデマンドクラスターに設定されたクエリCUの数。

- **アクティブな実行時間**: オンデマンドクラスターのコンピューティングリソースが使用されている課金対象の実行時間。

    - オンデマンドクラスターが **Running** ステータスの時に請求が開始されます。

    - 非アクティブによりオンデマンドクラスターが自動一時停止（**一時停止ing** または **一時停止ed** ステータス）された時に請求が停止します。

    - 最小請求単位は **1分** です。1分未満の使用も1分として請求されます。

## インデックス作成 CU cost\{#indexing-cu-cost}

インデックス作成CUコストは、オンデマンドコンピューティングで[マネージド](./manage-collections)および[外部コレクション](./external-collection)の両方のデータに対してインデックスを構築する際に消費されるコンピューティングリソースを測定します。

### Sources of indexing CU cost\{#sources-of-indexing-cu-cost}

以下のシナリオでインデックス作成CUコストが発生します:

- マネージドおよび外部コレクションの両方のデータに対する初期 `CreateIndex` 構築

- `Refresh` によってトリガーされる増分インデックス構築

### Cost calculation\{#cost-calculation}

```plaintext
Indexing CU Cost = Indexing CU Unit Price × Number of Indexing CU x Time
```

- **インデックス作成 CU 単価**: クラウドリージョンとプロジェクトプランによって決定されます。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **インデックス作成 CU 数**: システムが自動的に最適なインデックス作成 CU 数を割り当てます。インデックス作成 CU の数を指定することはできません。

- **時間**: インデックス構築ジョブの完了にかかる時間です。ジョブの実行時間のみが課金対象となります。キューの待機時間や失敗したジョブは課金されません。最小課金単位は 1 分です。1 分未満の使用は 1 分として課金されます。

<Admonition type="info" icon="📘" title="**Note**">

<p><a href="./analyze-cost">使用量</a>および<a href="./view-invoice">請求書</a>ページでは、インデックス作成 CU コストは個別のジョブではなく、データベースごとの合計として表示されます。  </p>

</Admonition>

