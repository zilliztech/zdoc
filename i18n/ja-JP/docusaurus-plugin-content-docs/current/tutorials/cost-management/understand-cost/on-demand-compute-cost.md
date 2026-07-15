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

インデックス作成 CU コストは、オンデマンドコンピュートで[マネージドコレクション](./manage-collections-sdks)および[外部コレクション](./create-external-collection)の両方のデータに対してインデックスを構築する際に消費されるコンピュートリソースを測定します。

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

## 例\{#example}

オンデマンドコンピュートの使用状況が次のとおりであるとします。

- **リージョン**: AWS us-west-2

- **プロジェクトプラン**: Enterprise

- **クエリ CU 数**: 8 CU

- **オンデマンドクラスターの実行時間**: 30 分

- **インデックス作成使用量**: 120 CU-minutes

上記の情報に基づき、[料金表](https://zilliz.com/pricing/pricing-guide?plan=Enterprise&provider=aws&region=aws-us-west-2)ページで次の単価を確認できます。

- **クエリ CU 単価** = &#36;0.41 / CU / hour

- **インデックス作成 CU 単価** = &#36;0.41 / CU / hour

したがって、次のように計算されます。

`Query CU Cost = 8 x 30 x $0.41 = $98.40`

`Indexing CU Cost = 120 x $0.41 = $49.20`

`Total On-demand Compute Cost = $98.40+ $49.20 = $147.60`
