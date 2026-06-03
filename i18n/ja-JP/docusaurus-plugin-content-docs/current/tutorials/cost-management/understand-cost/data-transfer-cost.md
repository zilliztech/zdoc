---
title: "データ転送費用 | Cloud"
slug: /data-transfer-cost
sidebar_key: data-transfer-cost
sidebar_label: "データ転送"
beta: FALSE
notebook: FALSE
description: "データ転送には、Zilliz Cloud に入ってくるトラフィック、Zilliz Cloud からインターネットに出ていくトラフィック、または Zilliz Cloud 内の2つのリソース間のトラフィックが含まれます。Zilliz Cloud のデータ転送費用は、転送されたデータ量に基づいて請求されます。 | Cloud"
type: origin
token: BClgwKlHaiushBkPPssclTkYnef
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - データ転送
  - 費用
  - 請求

---

import Admonition from '@theme/Admonition';


# データ転送費用

データ転送には、Zilliz Cloud に入ってくるトラフィック、Zilliz Cloud からインターネットへ出ていくトラフィック、または Zilliz Cloud 内の 2 つのリソース間のトラフィックがあります。Zilliz Cloud のデータ転送費用は、転送されたデータ量に基づいて請求されます。

<Admonition type="info" icon="📘" title="Notes">

<p>各組織には月額 10 ドルのデータ転送割引が適用され、最初の 100 GB をカバーします。</p>

</Admonition>

以下の表は、異なるデータ転送タイプを比較しています。

<table>
   <tr>
     <th><p><strong>転送タイプ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>料金</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>インターネットエグレス</strong></p></td>
     <td><p>パブリックインターネットエグレスは、Zilliz Cloud クラスターからパブリックインターネット、またはパブリックエンドポイント経由でアクセスされた場合の別のクラウドプロバイダーへの外向きトラフィックです。 </p><p>これは、パブリックエンドポイント経由の読み取り、書き込み、クエリ、または移行トラフィックが現在のクラウドプロバイダーのネットワークを離れる際に発生します。 </p><p>同じクラウドプロバイダーのバックボーン内に留まるトラフィック（例：クロスリージョン）は、インターネットエグレスではなく、クロスリージョンデータ転送として別途請求されます。</p></td>
     <td><p>最も高価で、コストは送信元の目的地によって決定されます。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><strong>クロスリージョン</strong></p></td>
     <td><p>クロスリージョンデータ転送とは、同じクラウドプロバイダーの異なるリージョン間で移動されるデータを指します。これには以下が含まれます：</p><ul><li><p>クロスリージョンクラスター移行</p></li><li><p>クロスリージョンバックアップ</p><p>パブリックエンドポイント経由でアクセスされた場合の、同じクラウドプロバイダーの他のリージョンにあるクラスターへのトラフィック。</p></li></ul></td>
     <td><ul><li><p>AWS の場合、コストは送信元の大陸によって決定されます。</p></li><li><p>Azure と Google Cloud の場合、コストは送信元と宛先の両方の大陸によって決定されます。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a> を参照してください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>イントラリージョン</strong></p></td>
     <td><p>イントラリージョンデータ転送とは、クラウドプロバイダーの同じリージョン内でのデータ転送を指します。これには以下が含まれます：</p><ul><li><p>イントラリージョンのクラウドオブジェクトストレージへの監査ログの転送</p></li><li><p>同じリージョンにデプロイされた Zilliz Cloud クラスター間のデータ移行。</p></li></ul></td>
     <td><p>無料</p></td>
   </tr>
</table>

## データ転送費用の発生元\{#sources-of-data-transfer-cost}

以下のシナリオでデータ転送が請求されます：

- [検索/クエリ](./search-query-get) などの運用

- クラウドオブジェクトストレージへの [監査ログ](./audit-logs) の転送

- [オフラインマイグレーション](./offline-migration)

- [クロスリージョンバックアップ](/docs/backup-to-other-regions)

- データ取り込み、検索、クエリ、およびリランキングのためにサードパーティの [モデル](./model-based-functions) プロバイダーを使用する場合。

<Admonition type="info" icon="📘" title="Note">

<p>データ転送が同じクラウドリージョン内で発生する場合、コストは 0 ドルになる可能性があります。</p>
<p>プライベートエンドポイントを使用して検索やクエリなどの運用を行う場合、データ転送費用は発生しません。</p>

</Admonition>

## コスト計算\{#cost-calculation}

```plaintext
Data Transfer Cost = Data Transfer Unit Price × Transferred Data Size
```

- **データ転送単価**: クラスターのクラウドプロバイダーとリージョン、データ転送タイプ（パブリックインターネット、クロスリージョン、イントラリージョン）によって決定されます。詳細な料金については、[Zilliz Cloud 料金ガイド](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **転送データサイズ**: GB単位で測定され、ネットワーク経由で送信されたデータのサイズに基づいて計算されます。

## Examples\{#examples}

以下は、ストレージコストの計算方法を理解するための例です。

### Example 1: Public internet egress\{#example-1-public-internet-egress}

クラスターが AWS us-east-1（バージニア）にデプロイされており、検索結果をパブリックインターネット経由でクライアントに返す場合を想定します：

- **転送データサイズ**: 1か月あたり 500 GB

- **転送タイプ**: Public Internet Egress

- **送信元大陸**: North America

- **単価**: &#36;0.09/GB（North America からのパブリックインターネット egress レートに基づく）

データ転送コストは `$0.09 × 500 = $45.00` となります。

### Example 2: Cross-region transfer\{#example-2-cross-region-transfer}

クラスターが GCP us-west1（オレゴン）にデプロイされており、このクラスターを 2 つの異なるリージョン、GCP us-central1（アイオワ）と GCP europe-west3（フランクフルト）にバックアップする必要がある場合を想定します：

- **バックアップファイルサイズ**: 20 GB

- **転送タイプ**: Cross-region Transfer

- **送信元大陸**: North America

- **送信先大陸**: North America & Europe

- **単価**: 

    - North America（GCP us-west1）から North America（GCP us-central1）へのデータ転送は、**&#36;0.02/GB** のレートで課金されます。

    - North America（GCP us-west1）から Europe（GCP europe-west3）へのデータ転送は、**&#36;0.05/GB** のレートで課金されます。

データ転送コストは `$0.02 × 20 + $0.05 x 20 = $1.40` となります。

### Example 3: Intra-region transfer\{#example-3-intra-region-transfer}

AWS us-east-1（バージニア）にデプロイされたクラスターで監査ログを有効にしており、このクラスターの監査ログを同じクラウドリージョンに作成された AWS S3 バケットに転送する必要がある場合を想定します。この場合のデータ転送コストは **&#36;0** となります。イントラリージョンのデータ転送は無料のためです。

