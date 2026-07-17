---
title: "Dedicated Cluster のコスト | Cloud"
slug: /dedicated-cluster-cost
sidebar_label: "Dedicated Cluster"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Dedicated cluster は従量課金モデルに従っており、主に cluster が消費するコンピューティングリソースに対して課金されます。これにより、事前にリソースを過剰にプロビジョニングすることなく、実際に使用した分だけを支払うことができます。 | Cloud"
type: origin
token: J2prwh2KLis9oqkqNIAcU1d6nsd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Dedicated Cluster のコスト

Zilliz Cloud の Dedicated clusters は従量課金モデルに従っており、主に cluster が消費するコンピューティングリソースに対して課金されます。これにより、事前にリソースを過剰にプロビジョニングすることなく、実際に使用した分だけを支払うことができます。

Dedicated cluster の総コストは、以下のコンポーネントの合計です。

- [ベクトルデータベースのコスト](./dedicated-cluster-cost#vector-database-cost)

- [ストレージコスト](./dedicated-cluster-cost#storage-cost)

上記の2つの主要な課金項目に加えて、以下のオプションの追加料金が適用される場合があります。

- [データ転送コスト](./data-transfer-cost)

- [監査ログコスト](./audit-log-cost)

## ベクトルデータベースのコスト\{#vector-database-cost}

ベクトルデータベースのコストには、Dedicated cluster のコンピューティングリソースの使用料金が含まれます。

### コストの計算\{#cost-calculation}

```plaintext
Vector Database Cost = Query CU Unit Price x Total Number of Query CU x Cluster Runtime
```

- **Query CU Unit Price**: cluster のリージョン、タイプ、プロジェクトプランによって決まります。詳細な料金については、[Zilliz Cloud Pricing](http://zilliz.com/pricing) を参照してください。

- **Total Number of Query CU**: レプリカを考慮した、cluster 内の query CU の総数です。

    ```plaintext
    Total Number of Query CU = Number of Query CU × Replica Count
    ```

    たとえば、2 query CU と 2 replicas を持つ cluster の総 CU 数は 4 CU です。

- **Cluster Runtime**: cluster が課金対象ステータスにある合計時間（時間単位）です。

    - 課金対象ステータス: Running、Modifying、Migrating など

    - 非課金ステータス: Creating、Suspending、Resuming、Suspended など。非課金ステータス中は CU の課金は停止しますが、ストレージ料金は引き続き発生します。

    <Admonition type="info" icon="📘" title="注意">

    [スケーリング](./auto-scaling) ジョブの実行中、Zilliz Cloud は引き続き以前の構成に基づいて cluster に課金します。新しい構成が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。これはスケールアップとスケールダウンの両方に適用されます。ジョブがまだ進行中の間、cluster は引き続き以前の利用可能な構成でサービスを提供します。

    </Admonition>

### 例\{#example}

cluster の構成が以下のとおりであるとします。

- **Project Plan:** Enterprise

- **Cluster Deployment Option**: Dedicated

- **Cloud Provider & Region:** AWS us-east-1 (Virginia)

- **Cluster Type:** Performance-optimized

- **Number of Query CU:** 8 CU

- **Replica Count:** 2

- **Cluster** **Runtime:** 720 時間（1 か月）。

プラン、クラウドプロバイダーとリージョン、cluster タイプの情報に基づいて、[Pricing Page](https://zilliz.com/pricing) で CU Unit Price が **&#36;0.248/hour** であることを確認できます。

![find-cu-unit-price](https://zdoc-images.s3.us-west-2.amazonaws.com/find-cu-unit-price.png "find-cu-unit-price")

query CU 数と replica count に基づくと、query CU の総数は `8 CU x 2 Replica = 16 CU` です。

この例の Dedicated cluster のベクトルデータベース総コストは `$0.248 x 16 x 720 = $2856.96` です。

## ストレージコスト\{#storage-cost}

ストレージコストは CU コストとは別に課金され、以下に依存します。

- cluster のクラウドプロバイダーとリージョン、タイプ、プラン

- ストレージ使用量

詳細については、[Storage](./storage-cost) を参照してください。

## FAQ\{#faqs}

**Dedicated cluster を停止した場合、課金されますか？**

Dedicated cluster が停止されると、ベクトルデータベースのコストは停止しますが、cluster を削除するまでストレージ料金は引き続き発生します。

**cluster の作成中または停止中にも課金されますか？**

Creating、Suspending、Resuming、または Suspended ステータスの間は、ベクトルデータベースのコストは課金されません。ただし、ストレージコストは引き続き発生します。

**Dedicated cluster をスケーリングする場合、スケーリング中は旧構成と新構成のどちらに基づいて課金されますか？**

[スケーリング](./auto-scaling) 中は、以前の構成に基づいて課金されます。新しい構成が課金に使用されるのは、スケーリングジョブが正常に完了した後のみです。 
