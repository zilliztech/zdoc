---
title: "データ転送コスト | Cloud"
slug: /data-transfer-cost
sidebar_label: "データ転送"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ転送には、Zilliz Cloud に入ってくるトラフィック、Zilliz Cloud からインターネットへ出ていくトラフィック、または Zilliz Cloud 内の 2 つのリソース間のトラフィックが含まれます。Zilliz Cloud のデータ転送コストは、転送されたデータ量に基づいて課金されます。 | Cloud"
type: origin
token: BClgwKlHaiushBkPPssclTkYnef
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データ転送コスト

データ転送には、Zilliz Cloud に入ってくるトラフィック、Zilliz Cloud からインターネットへ出ていくトラフィック、または Zilliz Cloud 内の 2 つのリソース間のトラフィックが含まれます。Zilliz Cloud のデータ転送コストは、転送されたデータ量に基づいて課金されます。 

<Admonition type="info" icon="📘" title="Notes">

各組織には、最初の 100 GB をカバーする月額 &#36;10 のデータ転送割引が提供されます。

</Admonition>

次の表は、さまざまなデータ転送タイプを比較したものです。

<table>
   <tr>
     <th><p><strong>データ転送タイプ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>料金</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>インターネット送信</strong></p></td>
     <td><p>パブリックインターネット送信とは、Zilliz Cloud クラスターからパブリックインターネット、またはパブリックエンドポイント経由でアクセスした際の別のクラウドプロバイダーへのアウトバウンドトラフィックを指します。 </p><p>これは、パブリックエンドポイント経由の読み取り、書き込み、クエリ、または移行トラフィックが現在のクラウドプロバイダーのネットワークを離れるときに発生します。 </p><p>同じクラウドプロバイダーのバックボーン内にとどまるトラフィック（例: リージョン間）は、インターネット送信ではなく、リージョン間データ転送として別途課金されます。</p></td>
     <td><p>最も高額であり、コストは送信元と宛先によって決まります。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><strong>リージョン間</strong></p></td>
     <td><p>リージョン間データ転送とは、同じクラウドプロバイダーの異なるリージョン間で移動されるデータを指します。これには以下が含まれます。</p><ul><li><p>リージョン間クラスター移行</p></li><li><p>リージョン間バックアップ</p><p>パブリックエンドポイント経由でアクセスした際に、同じクラウドプロバイダーの別リージョンにあるクラスターへのトラフィック。</p></li></ul></td>
     <td><ul><li><p>AWS の場合、コストは送信元の大陸によって決まります。</p></li><li><p>Azure と Google Cloud の場合、コストは送信元と宛先の両方の大陸によって決まります。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a> を参照してください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>同一リージョン内</strong></p></td>
     <td><p>同一リージョン内データ転送とは、クラウドプロバイダーの同じリージョン内でのデータ転送を指します。これには以下が含まれます。</p><ul><li><p>監査ログを同一リージョン内のクラウドオブジェクトストレージへ転送すること</p></li><li><p>同じリージョンにデプロイされた Zilliz Cloud クラスター間のデータ移行。</p></li></ul></td>
     <td><p>無料</p></td>
   </tr>
</table>

## データ転送コストの発生源\{#sources-of-data-transfer-cost}

以下のシナリオでは、データ転送に対して課金されます。

- [検索](./single-vector-search)/[クエリ](./get-and-scalar-query) などの操作

- [監査ログ](./audit-logs) をクラウドオブジェクトストレージへ転送すること

- [オフライン移行](./offline-migration)

- [リージョン間バックアップ](/docs/backup-to-other-regions)

- データ取り込み、検索、クエリ、および再ランキングのために、[OpenAI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere) などのサードパーティモデルプロバイダーを使用すること。

<Admonition type="info" icon="📘" title="📘 Note">

データ転送が同じクラウドリージョン内で発生する場合、コストは &#36;0 になる可能性があります。

検索やクエリなどの操作をプライベートエンドポイントを使って実行する場合、データ転送コストは発生しません。

</Admonition>

## コスト計算\{#cost-calculation}

```plaintext
Data Transfer Cost = Data Transfer Unit Price × Transferred Data Size
```

- **データ転送単価**: クラスターのクラウドプロバイダーとリージョン、データ転送タイプ（パブリックインターネット、リージョン間、または同一リージョン内）によって決まります。詳細な料金については、[Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **転送データサイズ**: GB 単位で測定され、ネットワーク経由で送信されたデータのサイズに基づいて計算されます。

## 例\{#examples}

以下は、ストレージコストの計算方法を理解するための例です。

### 例 1: パブリックインターネット送信\{#example-1-public-internet-egress}

クラスターが AWS us-east-1 (Virginia) にデプロイされており、パブリックインターネット経由でクライアントに検索結果を返すとします。

- **転送データサイズ**: 1 か月で 500 GB

- **転送タイプ**: パブリックインターネット送信

- **送信元の大陸**: 北米

- **単価**: &#36;0.09/GB（北米からのパブリックインターネット送信料金に基づく）

データ転送コストは `$0.09 × 500 = $45.00` です。

### 例 2: リージョン間転送\{#example-2-cross-region-transfer}

クラスターが GCP us-west1 (Oregon) にデプロイされており、このクラスターを 2 つの異なるリージョン、GCP us-central1 (Iowa) と GCP europe-west3 (Frankfurt) にバックアップする必要があるとします。

- **バックアップファイルサイズ**: 20 GB

- **転送タイプ**: リージョン間転送

- **送信元の大陸**: 北米

- **宛先の大陸**: 北米およびヨーロッパ

- **単価**: 

    - 北米（GCP us-west1）から北米（GCP us-central1）へのデータ転送は、**&#36;0.02/GB** の料金で課金されます。

    - 北米（GCP us-west1）からヨーロッパ（GCP europe-west3）へのデータ転送は、**&#36;0.05/GB** の料金で課金されます。

データ転送コストは `$0.02 × 20 + $0.05 x 20 = $1.40` です。

### 例 3: 同一リージョン内転送\{#example-3-intra-region-transfer}

クラスターが AWS us-east-1 (Virginia) にデプロイされており、そのクラスターに対して監査ログ記録を有効にしているとします。また、このクラスターの監査ログを同じクラウドリージョン内に作成された AWS S3 バケットに転送する必要があるとします。この場合のデータ転送コストは、同一リージョン内データ転送が無料であるため **&#36;0** になります。

