---
title: "専用クラスターのコスト | Cloud"
slug: /dedicated-cluster-cost
sidebar_key: dedicated-cluster-cost
sidebar_label: "専用クラスター"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud の専用クラスターは従量課金モデルを採用しており、主にクラスターが消費するコンピューティングリソースに対して課金されます。これにより、事前にリソースを過剰にプロビジョニングすることなく、実際に使用した分のみを支払うことができます。| Cloud"
type: origin
token: J2prwh2KLis9oqkqNIAcU1d6nsd
sidebar_position: 3
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - 専用
  - コスト
  - 請求

---

import Admonition from '@theme/Admonition';


# 専用クラスターのコスト

Zilliz Cloud の専用クラスターは従量課金モデルを採用しており、主にクラスターが消費するコンピューティングリソースに対して課金されます。これにより、事前にリソースを過剰にプロビジョニングすることなく、実際に使用した分のみを支払うことができます。

専用クラスターの総コストは、以下のコンポーネントの合計です：

- [ベクトルデータベースのコスト](./dedicated-cluster-cost#vector-database-cost)

- [ストレージ費用](./dedicated-cluster-cost#storage-cost)

上記の 2 つの主要な課金項目に加え、以下のオプションの追加料金が発生する場合があります：

- [データ転送コスト](./data-transfer-cost)

- [監査ログコスト](./audit-log-cost)

## ベクトルデータベースのコスト\{#vector-database-cost}

ベクトルデータベースのコストには、専用クラスターのコンピューティングリソースの使用に対する課金が含まれます。

### コスト計算\{#cost-calculation}

```plaintext
Vector Database Cost = Query CU Unit Price x Total Number of Query CU x Cluster Runtime
```

- **Query CU 単価**: クラスターのリージョン、タイプ、およびプロジェクトプランによって決定されます。詳細な料金については、[Zilliz Cloud Pricing](http://zilliz.com/pricing) をご覧ください。

- **Total クエリCU数**: レプリカを考慮した、クラスター内のクエリ CU の総数です。

    ```plaintext
    Total Number of Query CU = Number of Query CU × Replica Count
    ```

    たとえば、2 つのクエリ CU と 2 つのレプリカを持つクラスターの場合、CU の合計は 4 つになります。

- **クラスター実行時間**: クラスターが課金対象ステータスにある合計時間（時間単位）：

    - 課金対象ステータス：Running、Modifying、Migrating など

    - 非課金ステータス：Creating、Suspending、Resuming、Suspended など。非課金ステータスの間は CU 料金は発生しませんが、ストレージ費用は引き続き適用されます。

    <Admonition type="info" icon="📘" title="Note">

    <p><a href="./scale-cluster">スケーリング</a>ジョブ中、Zilliz Cloud は以前の構成に基づいてクラスタに課金し続けます。新しい構成は、スケーリングジョブが正常に完了した後にのみ課金に使用されます。これはスケールアップとスケールダウンの両方に適用されます。ジョブが進行中の間、クラスタは以前の利用可能な構成でサービスを継続します。</p>

    </Admonition>

### 例\{#example}

クラスター構成が以下の通りであると仮定します：

- **Project Plan:** Enterprise

- **クラスターデプロイオプション**: Dedicated

- **クラウドプロバイダー & Region:** AWS us-east-1 (Virginia)

- **クラスタータイプ:** パフォーマンス最適化済み

- **クエリCU数:** 8 CU

- **Replica Count:** 2

- **Cluster** **Runtime:** 720 時間（1 ヶ月）。

プラン、クラウドプロバイダーとリージョン、およびクラスタータイプの情報に基づき、[料金ページ](https://zilliz.com/pricing) で CU の単価が **&#36;0.248/時間** であることを確認できます。

![find-cu-unit-price](https://zdoc-images.s3.us-west-2.amazonaws.com/find-cu-unit-price.png "find-cu-unit-price")

クエリ CU 数とレプリカ数に基づくと、クエリ CU の合計数は `8 CU x 2 Replica = 16 CU` となります。

Dedicated クラスターのベクトルデータベースの総費用は `$0.248 x 16 x 720 = $2856.96` です。

## ストレージ費用\{#storage-cost}

ストレージ費用は CU 費用とは別に課金され、以下に依存します：

- クラスターのクラウドプロバイダーとリージョン、タイプ、およびプラン

- ストレージ使用量

詳細については、[ストレージ](./storage-cost) をご覧ください。

## よくある質問\{#faqs}

**Dedicated クラスターを一時停止した場合、料金は発生しますか？**

Dedicated クラスターが一時停止されると、ベクトルデータベースの費用は発生しませんが、クラスターを削除するまでストレージ費用は引き続き発生します。

**クラスターの作成中または一時停止中に課金されますか？**

Creating、Suspending、Resuming、または Suspended ステータスの間は、ベクトルデータベースの費用は発生しません。ただし、ストレージ費用は引き続き適用されます。

**Dedicated クラスタをスケーリングする場合、スケーリング中は古い構成と新しい構成のどちらに基づいて課金されますか？**

[スケーリング](./scale-cluster)中は、以前の構成に基づいて課金されます。新しい構成は、スケーリングジョブが正常に完了した後にのみ課金に使用されます。
