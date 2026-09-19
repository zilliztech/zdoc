---
title: "Dedicated クラスターのコスト | Cloud"
slug: /dedicated-cluster-cost
sidebar_label: "Dedicated クラスター"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Dedicated クラスターは従量課金モデルに従い、主にクラスターが消費したコンピュートリソースに対して課金されます。これにより、事前にリソースを過剰にプロビジョニングすることなく、実際に使用した分だけを支払うことができます。 | Cloud"
type: origin
token: J2prwh2KLis9oqkqNIAcU1d6nsd
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Dedicated クラスターのコスト

Zilliz Cloud の Dedicated クラスターは従量課金モデルに従い、主にクラスターが消費したコンピュートリソースに対して課金されます。これにより、事前にリソースを過剰にプロビジョニングすることなく、実際に使用した分だけを支払うことができます。

Dedicated クラスターの総コストは、以下のコンポーネントの合計です。

- [ベクトルデータベースのコスト](./dedicated-cluster-cost#vector-database-cost)

- [ストレージコスト](./dedicated-cluster-cost#storage-cost)

上記の 2 つの主要な請求項目に加えて、以下のオプションの追加料金が適用される場合があります。

- [データ転送コスト](./data-transfer-cost)

- [監査ログのコスト](./audit-log-cost)

## ベクトルデータベースのコスト\{#vector-database-cost}

ベクトルデータベースのコストには、Dedicated クラスターのコンピューティングリソースを使用するための料金が含まれます。

### コスト計算\{#cost-calculation}

```plaintext
Vector Database Cost = Query CU Unit Price x Total Number of Query CU x Cluster Runtime
```

- **Query CU Unit Price**: クラスターのリージョン、タイプ、およびプロジェクトプランによって決まります。詳細な料金については、[Zilliz Cloud Pricing](http://zilliz.com/pricing) を参照してください。

- **Total Number of Query CU**: レプリカを考慮した、クラスター内の Query CU の総数です。

    ```plaintext
    Total Number of Query CU = Number of Query CU × Replica Count
    ```

    たとえば、2 つの Query CU と 2 つのレプリカを持つクラスターでは、合計が 4 CU になります。

- **クラスター Runtime**: クラスターが課金対象のステータスにある合計時間（時間単位）です。

    - 課金対象のステータス: Running、Modifying、Migrating など

    - 非課金ステータス: Creating、Suspending、Resuming、Suspended など。非課金ステータスの間は CU の課金が停止しますが、ストレージの料金は引き続き適用されます。

    <Admonition type="info" title="Note">

    [スケーリング](./auto-scaling) ジョブの実行中も、Zilliz Cloud は以前の構成に基づいてクラスターへの課金を継続します。新しい構成が課金に使用されるのは、スケーリングジョブが正常に完了した後だけです。これはスケールアップとスケールダウンの両方に適用されます。ジョブがまだ進行中の間は、クラスターは引き続き、以前に利用可能だった構成でサービスを提供します。

    </Admonition>

### 例\{#example}

クラスターの構成が以下のとおりであるとします。

- **Project Plan:** Enterprise

- **クラスター Deployment Option**: Dedicated

- **Cloud Provider & Region:** AWS us-east-1（Virginia）

- **クラスター Type:** Performance-optimized

- **Number of Query CU:** 8 CU

- **Replica Count:** 2

- **クラスター** **Runtime:** 720 時間（1 か月）

プラン、クラウドプロバイダーとリージョン、およびクラスタータイプの情報をもとに、[料金ページ](https://zilliz.com/pricing) で CU Unit Price が **&#36;0.248/hour**. であることを確認できます。

![find-cu-unit-price](https://zdoc-images.s3.us-west-2.amazonaws.com/find-cu-unit-price.png "find-cu-unit-price")

Query CU の数とレプリカ数に基づくと、Query CU の総数は `8 CU x 2 Replica = 16 CU` です。

この Dedicated クラスターの例におけるベクトルデータベースの総コストは `$0.248 x 16 x 720 = $2856.96` です。

## ストレージコスト\{#storage-cost}

ストレージコストは CU のコストとは別に課金され、以下によって決まります。

- クラスターのクラウドプロバイダーとリージョン、タイプ、およびプラン

- ストレージの使用量

詳細については、[ストレージ](./storage-cost) を参照してください。

## よくある質問\{#faqs}

**Dedicated クラスターを一時停止すると課金されますか？**

Dedicated クラスターを一時停止すると、ベクトルデータベースのコストは停止しますが、クラスターを削除するまでストレージの料金は継続します。

**クラスターの作成中または一時停止中に課金されますか？**

Creating、Suspending、Resuming、または Suspended のステータスでは、ベクトルデータベースのコストは課金されません。ただし、ストレージコストは引き続き適用されます。

**Dedicated クラスターをスケーリングするとき、スケーリング中は古い構成と新しい構成のどちらに基づいて課金されますか？**

[スケーリング](./auto-scaling) 中は、以前の構成に基づいて課金されます。新しい構成が課金に使用されるのは、スケーリングジョブが正常に完了した後だけです。
