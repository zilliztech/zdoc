---
title: "データ転送コスト | Cloud"
slug: /data-transfer-cost
sidebar_label: "データ転送"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ転送は、Zilliz Cloud に入ってくるトラフィック、Zilliz Cloud からインターネットへ出ていくトラフィック、または Zilliz Cloud 内の 2 つのリソース間のトラフィックを指します。Zilliz Cloud のデータ転送コストは、転送されたデータ量に基づいて課金されます。 | Cloud"
type: origin
token: BClgwKlHaiushBkPPssclTkYnef
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データ転送コスト

データ転送は、Zilliz Cloud に入ってくるトラフィック、Zilliz Cloud からインターネットへ出ていくトラフィック、または Zilliz Cloud 内の 2 つのリソース間のトラフィックを指します。Zilliz Cloud のデータ転送コストは、転送されたデータ量に基づいて課金されます。 

<Admonition type="info" icon="📘" title="注記">

各組織には毎月 &#36;10 のデータ転送割引が提供され、最初の 100 GB が対象となります。

</Admonition>

以下の表では、異なるデータ転送タイプを比較しています。

<table>
   <tr>
     <th><p><strong>データ転送タイプ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>料金</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>インターネットエグレス</strong></p></td>
     <td><p>パブリックインターネットエグレスは、パブリックエンドポイント経由でアクセスされた場合に、Zilliz Cloud クラスターからパブリックインターネット、または別のクラウドプロバイダーへ送信されるアウトバウンドトラフィックです。</p><p>これは、パブリックエンドポイントを介した読み取り、書き込み、クエリ、または移行のトラフィックが現在のクラウドプロバイダーのネットワークを離れる場合に発生します。</p><p>同じクラウドプロバイダーのバックボーン内にとどまるトラフィック（例: クロスリージョン）は、インターネットエグレスではなく、クロスリージョンデータ転送として別途課金されます。</p></td>
     <td><p>最も高額であり、コストは送信元と宛先によって決まります。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud 料金ガイド</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><strong>クロスリージョン</strong></p></td>
     <td><p>クロスリージョンデータ転送とは、同じクラウドプロバイダーの異なるリージョン間で移動されるデータを指します。これには以下が含まれます。</p><ul><li><p>クロスリージョンクラスター移行</p></li><li><p>クロスリージョンバックアップ</p><p>パブリックエンドポイント経由でアクセスされた、同じクラウドプロバイダーの他のリージョンにあるクラスターへのトラフィック。</p></li></ul></td>
     <td><ul><li><p>AWS の場合、コストは送信元の大陸によって決まります。</p></li><li><p>Azure と Google Cloud の場合、コストは送信元と宛先の両方の大陸によって決まります。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud 料金ガイド</a>を参照してください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>リージョン内</strong></p></td>
     <td><p>リージョン内データ転送とは、クラウドプロバイダーの同じリージョン内でのデータ転送を指します。これには以下が含まれます。</p><ul><li><p>監査ログをリージョン内のクラウドオブジェクトストレージに転送すること</p></li><li><p>同じリージョンにデプロイされた Zilliz Cloud クラスター間のデータ移行。</p></li></ul></td>
     <td><p>無料</p></td>
   </tr>
</table>

## データ転送コストの発生元\{#sources-of-data-transfer-cost}

以下のシナリオでは、データ転送に対して課金されます。

- [検索](./single-vector-search)/[クエリ](./get-and-scalar-query) などの操作

- [監査ログ](./audit-logs) をクラウドオブジェクトストレージに転送すること

- [オフライン移行](./offline-migration)

- [クロスリージョンバックアップ](/docs/backup-to-other-regions)

- [OpenAI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere) などのサードパーティモデルプロバイダーを、データ取り込み、検索、クエリ、再ランキングに使用すること。

<Admonition type="info" icon="📘" title="📘 注記">

データ転送が同じクラウドリージョン内で発生する場合、コストは &#36;0 になる可能性があります。

検索やクエリなどの操作をプライベートエンドポイントで実行する場合、データ転送コストは発生しません。

</Admonition>

## コスト計算\{#cost-calculation}

```plaintext
Data Transfer Cost = Data Transfer Unit Price × Transferred Data Size
```

- **データ転送の単価**: クラスターのクラウドプロバイダーとリージョン、およびデータ転送タイプ（パブリックインターネット、クロスリージョン、またはリージョン内）によって決まります。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide)を参照してください。

- **転送データサイズ**: GB 単位で測定され、ネットワーク経由で送信されたデータサイズに基づいて計算されます。

## 例\{#examples}

以下は、データ転送コストがどのように計算されるかを理解するための例です。

### 例 1: パブリックインターネットエグレス\{#example-1-public-internet-egress}

クラスターが AWS us-east-1 (Virginia) にデプロイされており、検索結果をパブリックインターネット経由でクライアントに返すとします。

- **転送データサイズ**: 1 か月で 500 GB

- **転送タイプ**: パブリックインターネットエグレス

- **送信元の大陸**: 北米

- **単価**: &#36;0.09/GB（北米からのパブリックインターネットエグレス料金に基づく）

データ転送コストは `$0.09 × 500 = $45.00` です。

### 例 2: クロスリージョン転送\{#example-2-cross-region-transfer}

クラスターが GCP us-west1 (Oregon) にデプロイされており、このクラスターを 2 つの異なるリージョン、GCP us-central1 (Iowa) と GCP europe-west3 (Frankfurt) にバックアップする必要があるとします。

- **バックアップファイルサイズ**: 20 GB

- **転送タイプ**: クロスリージョン転送

- **送信元の大陸**: 北米

- **宛先の大陸**: 北米とヨーロッパ

- **単価**: 

    - 北米 (GCP us-west1) から北米 (GCP us-central1) へのデータ転送は、**&#36;0.02/GB** の料金で課金されます。

    - 北米 (GCP us-west1) からヨーロッパ (GCP europe-west3) へのデータ転送は、**&#36;0.05/GB** の料金で課金されます。

データ転送コストは `$0.02 × 20 + $0.05 x 20 = $1.40` です。

### 例 3: リージョン内転送\{#example-3-intra-region-transfer}

AWS us-east-1 (Virginia) にデプロイされたクラスターで監査ログを有効にしており、このクラスターの監査ログを同じクラウドリージョンに作成された AWS S3 バケットへ転送する必要があるとします。この場合、リージョン内データ転送は無料であるため、データ転送コストは **&#36;0** になります。

