---
title: "Dedicated Cluster のコスト | Cloud"
slug: /dedicated-cluster-cost
sidebar_label: "Dedicated Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Dedicated Cluster は従量課金モデルに従っており、主にクラスターが消費したコンピュートリソースに対して課金されます。これにより、事前にリソースを過剰にプロビジョニングする必要なく、実際に使用した分だけを支払うことができます。 | Cloud"
type: origin
token: J2prwh2KLis9oqkqNIAcU1d6nsd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Dedicated Cluster のコスト

Zilliz Cloud の Dedicated Cluster は従量課金モデルに従っており、主にクラスターが消費したコンピュートリソースに対して課金されます。これにより、事前にリソースを過剰にプロビジョニングする必要なく、実際に使用した分だけを支払うことができます。

Dedicated Cluster の総コストは、以下のコンポーネントの合計です。

- [ベクトルデータベースのコスト](./dedicated-cluster-cost#vector-database-cost)

- [ストレージコスト](./dedicated-cluster-cost#storage-cost)

上記の 2 つの主要な課金項目に加えて、以下のオプションの追加料金が適用される場合があります。

- [データ転送コスト](./data-transfer-cost)

- [監査ログのコスト](./audit-log-cost)

## ベクトルデータベースのコスト\{#vector-database-cost}

ベクトルデータベースのコストには、Dedicated Cluster のコンピューティングリソースの使用料金が含まれます。

### コスト計算\{#cost-calculation}

```plaintext
Vector Database Cost = Query CU Unit Price x Total Number of Query CU x Cluster Runtime
```

- **Query CU Unit Price**: クラスターのリージョン、タイプ、プロジェクトプランによって決まります。詳細な料金については、[Zilliz Cloud の料金](http://zilliz.com/pricing) を参照してください。

- **Total Number of Query CU**: レプリカを考慮した、クラスター内の Query CU の総数です。

    ```plaintext
    Total Number of Query CU = Number of Query CU × Replica Count
    ```

    たとえば、2 つの Query CU と 2 つのレプリカを持つクラスターの Query CU 総数は 4 CU です。

- **Cluster Runtime**: クラスターが課金対象ステータスにある合計時間（時間単位）です。

    - 課金対象ステータス: Running、Modifying、Migrating など

    - 非課金ステータス: Creating、Suspending、Resuming、Suspended など。非課金ステータス中は CU の課金は停止しますが、ストレージ料金は引き続き適用されます。

    <Admonition type="info" icon="📘" title="Note">

    [スケーリング](./auto-scaling) ジョブの実行中、Zilliz Cloud は引き続き以前の構成に基づいてクラスターに課金します。新しい構成が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。これはスケールアップとスケールダウンの両方に適用されます。ジョブがまだ進行中の間、クラスターは引き続き以前に利用可能だった構成でサービスを提供します。

    </Admonition>

### 例\{#example}

クラスターの構成が以下のとおりであるとします。

- **Project Plan:** Enterprise

- **Cluster Deployment Option**: Dedicated

- **Cloud Provider & Region:** AWS us-east-1 (Virginia)

- **Cluster Type:** Performance-optimized

- **Number of Query CU:** 8 CU

- **Replica Count:** 2

- **Cluster** **Runtime:** 720 時間（1 か月）

このプラン、クラウドプロバイダーとリージョン、およびクラスタータイプの情報をもとに、[料金ページ](https://zilliz.com/pricing) で CU Unit Price が **&#36;0.248/hour** であることを確認できます。

![find-cu-unit-price](https://zdoc-images.s3.us-west-2.amazonaws.com/find-cu-unit-price.png "find-cu-unit-price")

Query CU 数とレプリカ数に基づくと、Query CU の総数は `8 CU x 2 Replica = 16 CU` です。

この Dedicated Cluster の例におけるベクトルデータベースの総コストは `$0.248 x 16 x 720 = $2856.96` です。

## ストレージコスト\{#storage-cost}

ストレージコストは CU コストとは別に課金され、以下に依存します。

- クラスターのクラウドプロバイダー、リージョン、タイプ、およびプラン

- ストレージ使用量

詳細については、[ストレージ](./storage-cost) を参照してください。

## よくある質問\{#faqs}

**Dedicated Cluster を一時停止すると課金されますか？**

Dedicated Cluster が一時停止されると、ベクトルデータベースのコストは停止しますが、クラスターを削除するまでストレージ料金は継続します。

**クラスターの作成中または一時停止中に課金されますか？**

Creating、Suspending、Resuming、または Suspended ステータスの間は、ベクトルデータベースのコストは課金されません。ただし、ストレージコストは引き続き適用されます。

**Dedicated Cluster をスケーリングするとき、スケーリング中の課金は古い構成と新しい構成のどちらに基づきますか？**

[スケーリング](./auto-scaling) 中は、以前の構成に基づいて課金されます。新しい構成が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。 
