---
title: "データ転送費用 | Cloud"
slug: /data-transfer-cost
sidebar_key: data-transfer-cost
sidebar_label: "データ転送"
beta: FALSE
notebook: FALSE
description: "データ転送には、Zilliz Cloud へのインバウンドトラフィック、Zilliz Cloud からインターネットへのアウトバウンドトラフィック、または Zilliz Cloud 内の 2 つのリソース間のトラフィックが含まれます。Zilliz Cloud におけるデータ転送費用は、転送されたデータ量に基づいて課金されます。 | Cloud"
type: origin
token: BClgwKlHaiushBkPPssclTkYnef
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - データ転送
  - コスト
  - 課金

---

import Admonition from '@theme/Admonition';


# データ転送費用

データ転送には、Zilliz Cloud へのインバウンドトラフィック、Zilliz Cloud からインターネットへのアウトバウンドトラフィック、または Zilliz Cloud 内の 2 つのリソース間でのトラフィックが含まれます。Zilliz Cloud におけるデータ転送費用は、転送されたデータの量に基づいて課金されます。

<Admonition type="info" icon="📘" title="Notes">

<p>各組織には、最初の 100 GB をカバーする月額&#36;10 のデータ転送割引が提供されます。</p>

</Admonition>

以下の表は、異なる転送タイプを比較したものです。

<table>
   <tr>
     <th><p><strong>転送タイプ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>価格</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>インターネット_egress</strong></p></td>
     <td><p>パブリックインターネット_egress は、パブリックエンドポイントを介してアクセスされる場合の、Zilliz Cloud クラスタからパブリックインターネットまたは他のクラウドプロバイダーへのアウトバウンドトラフィックです。</p><p>これは、読み取り、書き込み、クエリ、または移行トラフィックがパブリックエンドポイントを通じて現在のクラウドプロバイダーのネットワークを離れる場合に発生します。</p><p>同じクラウドプロバイダーのバックボーン内（例：リージョン間）に残るトラフィックは、インターネット_egress ではなく、リージョン間データ転送として別途課金されます。</p></td>
     <td><p>最も高額であり、コストは送信元と宛先によって決定されます。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a>をご覧ください。</p></td>
   </tr>
   <tr>
     <td><p><strong>リージョン間</strong></p></td>
     <td><p>リージョン間データ転送とは、同じクラウドプロバイダーの異なるリージョン間で移動されるデータを指します。これには以下が含まれます：</p><ul><li><p>リージョン間クラスタ移行</p></li><li><p>リージョン間バックアップ</p><p>パブリックエンドポイントを介してアクセスされる場合の、同じクラウドプロバイダーの他のリージョンにあるクラスタへのトラフィック。</p></li></ul></td>
     <td><ul><li><p>AWS の場合、コストは送信元の大陸によって決定されます。</p></li><li><p>Azure および Google Cloud の場合、コストは送信元と宛先の両方の大陸によって決定されます。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a>をご覧ください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>リージョン内</strong></p></td>
     <td><p>リージョン内データ転送とは、クラウドプロバイダーの同じリージョン内でのデータ転送を指します。これには以下が含まれます：</p><ul><li><p>監査ログをリージョン内のクラウドオブジェクトストレージに転送すること</p></li><li><p>同じリージョンにデプロイされた Zilliz Cloud クラスタ間のデータ移行。</p></li></ul></td>
     <td><p>無料</p></td>
   </tr>
</table>

## データ転送費用の発生源\{#sources-of-data-transfer-cost}

以下のシナリオでは、データ転送に対して課金されます：

- [検索/クエリ](./search-query-get) などの運用

- [監査ログ](./audit-logs) をクラウドオブジェクトストレージに転送すること

- [オフライン移行](./offline-migration)

- [リージョン間バックアップ](/docs/backup-to-other-regions)

- データの取り込み、検索、クエリ、および再ランキングのためにサードパーティの [モデル](./model-based-functions) プロバイダーを使用すること。

<Admonition type="info" icon="📘" title="Note">

<p>データ転送が同じクラウドリージョン内で発生する場合、コストは&#36;0 になる可能性があります。</p><p>検索やクエリなどの操作をプライベートエンドポイントを使用して実行する場合、データ転送費用は発生しません。</p>

</Admonition>

## コスト計算\{#cost-calculation}

```plaintext
Data Transfer Cost = Data Transfer Unit Price × Transferred Data Size
```

- **データ転送単価**: クラスタのクラウドプロバイダーとリージョン、データ転送タイプ（パブリックインターネット、クロスリージョン、またはイントラリージョン）によって決定されます。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide) をご覧ください。

- **転送データサイズ**: GB 単位で測定され、ネットワーク経由で送信されたデータのサイズに基づいて計算されます。

## Examples\{#examples}

以下は、ストレージコストの計算方法を理解するためのいくつかの例です。

### Example 1: Public internet egress\{#example-1-public-internet-egress}

クラスタが AWS us-east-1 (バージニア) にデプロイされており、検索結果をパブリックインターネット経由でクライアントに返す場合を想定します：

- **転送データサイズ**: 1 か月あたり 500 GB

- **転送タイプ**: パブリックインターネットエグレス

- **送信元大陸**: 北米

- **単価**: &#36;0.09/GB（北米からのパブリックインターネットエグレスレートに基づく）

データ転送コストは `$0.09 × 500 = $45.00` です。

### Example 2: Cross-region transfer\{#example-2-cross-region-transfer}

クラスタが GCP us-west1 (オレゴン) にデプロイされており、このクラスタを 2 つの異なるリージョン、GCP us-central1 (アイオワ) と GCP europe-west3 (フランクフルト) にバックアップする必要がある場合を想定します：

- **バックアップファイルサイズ**: 20 GB

- **転送タイプ**: クロスリージョン転送

- **送信元大陸**: 北米

- **送信先大陸**: 北米およびヨーロッパ

- **単価**: 

    - 北米 (GCP us-west1) から北米 (GCP us-central1) へのデータ転送は、**&#36;0.02/GB** のレートで課金されます。

    - 北米 (GCP us-west1) からヨーロッパ (GCP europe-west3) へのデータ転送は、**&#36;0.05/GB** のレートで課金されます。

データ転送コストは `$0.02 × 20 + $0.05 x 20 = $1.40` です。

### Example 3: Intra-region transfer\{#example-3-intra-region-transfer}

AWS us-east-1 (バージニア) にデプロイされたクラスタに対して監査ログを有効にしており、このクラスタの監査ログを同じクラウドリージョンに作成された AWS S3 バケットに転送する必要がある場合を想定します。この場合のデータ転送コストは、イントラリージョンデータ転送が無料であるため、**&#36;0** となります。

