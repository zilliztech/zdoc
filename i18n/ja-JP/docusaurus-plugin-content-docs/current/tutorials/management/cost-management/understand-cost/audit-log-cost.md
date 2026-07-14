---
title: "監査ログのコスト | Cloud"
slug: /audit-log-cost
sidebar_label: "監査ログ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "監査ログを有効にすると、Zilliz Cloud はロギングサービスをデプロイします。これらのログの収集、処理、転送には追加のシステムリソースが消費されるため、対応する料金が発生します。 | Cloud"
type: origin
token: GBfswoqhviHfTVk2qhHc4eGXnfh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 監査ログのコスト

[監査ログ](./audit-logs)を有効にすると、Zilliz Cloud はロギングサービスをデプロイします。これらのログの収集、処理、転送には追加のシステムリソースが消費されるため、対応する料金が発生します。

監査ログ機能の利用にかかる合計コストは、次のコンポーネントの合計です。

- [監査ログ CU コスト](./audit-log-cost#audit-logs-cu-cost): 監査ログの収集および処理で消費されるコンピューティングリソースのコスト

- [データ転送コスト](./audit-log-cost#data-transfer-cost): ログをオブジェクトストレージに転送するコスト

## 監査ログ CU コスト\{#audit-logs-cu-cost}

```plaintext
Audit Logs CU Cost = Audit Logs CU Unit Price x Total Number of Query CU x Audit Logs Runtime
```

- **監査ログ CU 単価**: クラスターのリージョンとプロジェクトプランによって決まります。詳細な料金については、[Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **クエリ CU の合計数**: レプリカを考慮した、クラスター内のクエリ CU の合計数です。

    ```plaintext
    Total Number of Query CU = Query CU × Replica Count
    ```

    たとえば、2 クエリ CU と 2 レプリカを持つクラスターの合計は 4 CU です。

- **監査ログの実行時間**: 監査ログ機能が有効になっている合計時間です。実行時間は `Disable Time Point − Enable Time Point` として計算されます。クラスターが **Suspended** 状態にある場合、または監査ログ機能が **Abnormal** 状態にある場合、その時間は計算から除外されます。これは、一時停止中は監査ログ機能によってコンピューティングリソースが消費されないためです。実行時間の計算例については、[例](./audit-log-cost#example) を参照してください。

## データ転送コスト\{#data-transfer-cost}

監査ログはオブジェクトストレージバケットに転送できます。現在、Zilliz Cloud は、クラスターと同じクラウドリージョンに作成されたオブジェクトストレージバケットへのログ転送のみをサポートしています。

現在、同一リージョン内のデータ転送には追加料金は発生しません。

データ転送の料金の詳細については、[Data Transfer](./data-transfer-cost) を参照してください。

## 例\{#example}

クラスターの構成が次のとおりであるとします。

- **プロジェクトプラン:** Enterprise

- **クラスターのデプロイオプション**: Dedicated

- **クラウドプロバイダーとリージョン:** AWS us-east-1 (Virginia)

- **CU サイズ:** 8 CU

- **レプリカ数:** 2

- **監査ログの実行時間:** 

    ![JKGIwkjiyhRr2ebq4eKcUsZOn8d](https://zdoc-images.s3.us-west-2.amazonaws.com/JKGIwkjiyhRr2ebq4eKcUsZOn8d.png)

    上図のとおり、

    - 2025 年 8 月 1 日 12:00 に監査ログを有効化。

    - 2025 年 8 月 1 日 24:00 にクラスターを一時停止。

    - 2025 年 8 月 2 日 12:00 にクラスターを再開し、2025 年 8 月 3 日 12:00 に削除されるまで稼働。

    合計実行時間は `(24 − 12) + 24 = 36 hours` です。

プロジェクトプラン、クラウドプロバイダー、およびリージョンの情報に基づき、[pricing guide page](https://zilliz.com/pricing/pricing-guide) で監査ログの単価が **&#36;0.031/hour** であることが確認できます。

CU サイズとレプリカ数の情報に基づくと、クエリ CU の合計サイズは `8 CU x 2 Replica = 16 CU` です。

監査ログ CU の合計コストは `$0.031 x 16 x 36 = $17.856` です。

同一リージョンへの転送であるため、データ転送コストは **&#36;0** です。 

監査ログの合計コストは `$17.856 + $0.00 = $17.856` です。

## FAQ\{#faqs}

1. **クラスターが一時停止している場合でも監査ログの料金は発生しますか？**
いいえ。監査ログ CU の料金は、機能が有効であり、クラスターがアクティブに稼働している間にのみ適用されます。"Suspended" 状態の時間は除外されます。

1. **監査ログを転送する際、データ転送料金は発生しますか？**
同一リージョン内の転送は無料です。リージョンをまたぐ転送（現在は未サポート）では追加料金が発生する可能性があります。

1. **監査ログを有効にしていても、実際にはログが生成されない場合、料金は発生しますか？**
はい。監査ログ CU の料金は、ログが生成されたかどうかに関係なく、機能が有効な間のクラスターのクエリ CU サイズと実行時間に基づいて算出されます。ログが生成されない場合、データ転送コストは &#36;0 になる可能性があります。

1. **実際に生成されるログの量（例: 高 QPS と低 QPS のワークロード）によって課金は変わりますか？**
いいえ。監査ログ CU のコストは、生成されるログ量ではなく、クラスターのクエリ CU サイズと実行時間のみに依存します。

