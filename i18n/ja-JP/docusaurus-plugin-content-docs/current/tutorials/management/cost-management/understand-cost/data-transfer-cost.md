---
title: "データ転送コスト | Cloud"
slug: /data-transfer-cost
sidebar_label: "データ転送"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ転送には、Zilliz Cloud に入ってくるトラフィック、Zilliz Cloud からインターネットへ出ていくトラフィック、または Zilliz Cloud 内の 2 つのリソース間のトラフィックがあります。Zilliz Cloud のデータ転送コストは、転送されたデータ量に基づいて請求されます。 | Cloud"
type: origin
token: BClgwKlHaiushBkPPssclTkYnef
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# データ転送コスト

データ転送には、Zilliz Cloud に入ってくるトラフィック、Zilliz Cloud からインターネットへ出ていくトラフィック、または Zilliz Cloud 内の 2 つのリソース間のトラフィックがあります。Zilliz Cloud のデータ転送コストは、転送されたデータ量に基づいて請求されます。 

<Admonition type="info" icon="📘" title="Notes">

各 organization には毎月 &#36;10 のデータ転送割引が適用され、最初の 100 GB が対象となります。

</Admonition>

以下の表では、さまざまなデータ転送タイプを比較しています。

<table>
   <tr>
     <th><p><strong>データ転送タイプ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>料金</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Internet egress</strong></p></td>
     <td><p>Public Internet egress は、public endpoint 経由でアクセスされた場合に、Zilliz Cloud cluster からパブリックインターネット、または別のクラウドプロバイダーへ送信されるアウトバウンドトラフィックを指します。 </p><p>これは、public endpoint を介した read、write、query、または migration のトラフィックが現在のクラウドプロバイダーのネットワーク外へ出るときに発生します。 </p><p>同じクラウドプロバイダーのバックボーン内に留まるトラフィック（例: cross-region）は、Internet egress ではなく、cross-region data transfer として別途請求されます。</p></td>
     <td><p>最も高額であり、コストは送信元と宛先によって決まります。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a> を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-region</strong></p></td>
     <td><p>Cross-region data transfer は、同じクラウドプロバイダーの異なるリージョン間で移動されるデータを指します。これには次が含まれます。</p><ul><li><p>Cross-region cluster migration</p></li><li><p>Cross-region backup</p><p>public endpoint 経由でアクセスされた場合に、同じクラウドプロバイダーの他リージョンにある cluster へのトラフィック。</p></li></ul></td>
     <td><ul><li><p>AWS の場合、コストは送信元の大陸によって決まります。</p></li><li><p>Azure と Google Cloud の場合、コストは送信元と宛先の両方の大陸によって決まります。</p><p>詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud Pricing Guide</a> を参照してください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>Intra-region</strong></p></td>
     <td><p>Intra-region data transfer は、クラウドプロバイダーの同一リージョン内でのデータ転送を指します。これには次が含まれます。</p><ul><li><p>audit logs の同一リージョン内クラウドオブジェクトストレージへの転送</p></li><li><p>同じリージョンにデプロイされた Zilliz Cloud clusters 間のデータ migration。</p></li></ul></td>
     <td><p>無料</p></td>
   </tr>
</table>

## データ転送コストの発生元\{#sources-of-data-transfer-cost}

以下のシナリオでは、データ転送に対して課金されます。

- [search](./single-vector-search) / [query](./get-and-scalar-query) などの操作

- [audit logs](./audit-logs) のクラウドオブジェクトストレージへの転送

- [Offline migration](./offline-migration)

- [Cross-region backup](/docs/backup-to-other-regions)

- データ取り込み、search、query、reranking のために、[OpenAI](./openai)、[Voyage AI](./voyage-ai)、[Cohere](./cohere) などのサードパーティモデルプロバイダーを使用する場合

<Admonition type="info" icon="📘" title="📘 Note">

データ転送が同じクラウドリージョン内で発生する場合、コストは &#36;0 になることがあります。

search や query などの操作を private endpoint で実行する場合、データ転送コストは発生しません。

</Admonition>

## コスト計算\{#cost-calculation}

```plaintext
Data Transfer Cost = Data Transfer Unit Price × Transferred Data Size
```

- **Data Transfer Unit Price**: cluster のクラウドプロバイダーとリージョン、データ転送タイプ（public internet、cross-region、または intra-region）によって決まります。詳細な料金については、[Zilliz Cloud Pricing Guide](https://zilliz.com/pricing/pricing-guide) を参照してください。

- **Transferred Data Size**: GB 単位で測定され、ネットワーク経由で送信されたデータのサイズに基づいて計算されます。

## 例\{#examples}

以下は、ストレージコストがどのように計算されるかを理解するための例です。

### 例 1: Public internet egress\{#example-1-public-internet-egress}

cluster が AWS us-east-1 (Virginia) にデプロイされており、パブリックインターネット経由でクライアントに search 結果を返すとします。

- **Transferred Data Size**: 1 か月で 500 GB

- **Transfer Type**: Public Internet Egress

- **Source Continent**: 北米

- **Unit Price**: &#36;0.09/GB（北米からの public internet egress レートに基づく）

データ転送コストは `$0.09 × 500 = $45.00` です。

### 例 2: Cross-region transfer\{#example-2-cross-region-transfer}

cluster が GCP us-west1 (Oregon) にデプロイされており、この cluster を 2 つの異なるリージョン、GCP us-central1 (Iowa) と GCP europe-west3 (Frankfurt) にバックアップする必要があるとします。

- **Backup File Size**: 20 GB

- **Transfer Type**: Cross-region Transfer

- **Source Continent**: 北米

- **Destination Continent**: 北米とヨーロッパ

- **Unit Price**: 

    - 北米 (GCP us-west1) から北米 (GCP us-central1) へのデータ転送は、**&#36;0.02/GB** の料金で請求されます。

    - 北米 (GCP us-west1) から Europ (GCP europe-west3) へのデータ転送は、**&#36;0.05/GB** の料金で請求されます。

データ転送コストは `$0.02 × 20 + $0.05 x 20 = $1.40` です。

### 例 3: Intra-region transfer\{#example-3-intra-region-transfer}

cluster が AWS us-east-1 (Virginia) にデプロイされており、その cluster の audit logging を有効にして、同じクラウドリージョンに作成された AWS S3 バケットに audit logs を転送する必要があるとします。この場合、intra-region data transfer は無料であるため、データ転送コストは **&#36;0** になります。

