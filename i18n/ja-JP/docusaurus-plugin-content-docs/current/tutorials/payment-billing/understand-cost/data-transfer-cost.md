---
title: "データ転送料 | Cloud"
slug: /data-transfer-cost
sidebar_label: "データ転送"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "データ転送は、Zilliz Cloudへの流入トラフィック、Zilliz Cloudからインターネットへの流出トラフィック、またはZilliz Cloud内の2つのリソース間のトラフィックのいずれかです。Zilliz Cloudのデータ転送料は、転送されたデータ量に基づいて請求されます。 | Cloud"
type: origin
token: BClgwKlHaiushBkPPssclTkYnef
sidebar_position: 4
keywords: 
  - zilliz
  - ベクターデータベース
  - クラウド
  - データ転送
  - コスト
  - 請求
  - コサイン距離
  - ベクターデータベースとは何か
  - vectordb
  - マルチモーダルベクターデータベース検索

---

import Admonition from '@theme/Admonition';


# データ転送料

データ転送は、Zilliz Cloudへのトラフィック流入、Zilliz Cloudからインターネットへのトラフィック流出、またはZilliz Cloud内の2つのリソース間のトラフィックのいずれかです。Zilliz Cloudのデータ転送料は、転送されたデータ量に基づいて請求されます。

以下の表は、異なるデータ転送タイプの比較です。

<table>
   <tr>
     <th><p><strong>データ転送タイプ</strong></p></th>
     <th><p><strong>説明</strong></p></th>
     <th><p><strong>一般的なシナリオ</strong></p></th>
     <th><p><strong>価格</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>インターネット外部転送</strong></p></td>
     <td><p>パプリックインターネット経由でZilliz Cloudから宛先へのデータ転送。外部ネットワーク、クライアントアプリケーション、またはクラウドプロバイダーのプライベートネットワーク外のサードパーティサービスなどが含まれます。</p></td>
     <td><p>クラウドプロバイダーの外部にホストされているクライアントアプリに検索またはクエリ結果を返却。</p></td>
     <td><p>最も高価です。詳細な料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud価格ガイド</a>を参照してください。</p></td>
   </tr>
   <tr>
     <td><p><strong>クロスリージョン</strong></p></td>
     <td><p>同一クラウドプロバイダーのネットワーク内で異なるリージョン間のデータ移動。同一リージョン内転送と比較して、追加のレイテンシとコストが発生する可能性があります。</p></td>
     <td><ul><li><p>クロスリージョンバックアップ</p></li><li><p>異なるリージョンにデプロイされているZilliz Cloudクラスター間のデータ移行。</p></li></ul></td>
     <td><ul><li><p>AWSの場合、料金は送信元大陸によって決定されます。</p></li><li><p>AzureおよびGoogle Cloudの場合、料金は送信元と宛先の両方の大陸によって決定されます。同一大陸内の異なるリージョンへの転送は低料金で請求され、異なる大陸への転送は高料金がかかります。</p><p>詳細料金については、<a href="https://zilliz.com/pricing/pricing-guide">Zilliz Cloud価格ガイド</a>を参照してください。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>同一リージョン</strong></p></td>
     <td><p>クラウドプロバイダーの同一リージョン内でのデータ転送。通常、クロスリージョン転送と比較してレイテンシとコストが低くなります。</p></td>
     <td><ul><li><p>監査ログを同一リージョンクラウドオブジェクトストレージに転送</p></li><li><p>同一リージョンにデプロイされているZilliz Cloudクラスター間のデータ移行。</p></li></ul></td>
     <td><p>無料</p></td>
   </tr>
</table>

## データ転送料の発生源\{#sources-of-data-transfer-cost}

以下のシナリオではデータ転送料が請求されます：

- [検索/クエリ](./search-query-get)などの操作

- クラウドオブジェクトストレージへの[監査ログ](./audit-logs)転送

- [ゼロダウンタイム移行](./zero-downtime-migration)データ同期

- [オフライン移行](./offline-migration)

<Admonition type="info" icon="📘" title="注意">

<p>データ転送が同一クラウドリージョン内で発生する場合、料金は$0になる可能性があります。</p>
<p>検索またはクエリなどの操作を実行する際にプライベートエンドポイントを使用する場合、データ転送料は発生しません。</p>

</Admonition>

## 料金計算\{#cost-calculation}

```plaintext
データ転送料 = データ転送単価 × 転送データサイズ
```

- **データ転送単価**：クラスターコラウドプロバイダーおよびリージョン、データ転送タイプ（パブリックインターネット、クロスリージョン、または同一リージョン）によって決定されます。詳細料金については、[Zilliz Cloud価格ガイド](https://zilliz.com/pricing/pricing-guide)を参照してください。

- **転送データサイズ**：GB単位で測定され、ネットワーク経由で送信されたデータのサイズに基づいて計算されます。

## 例\{#examples}

以下は、ストレージコストがどのように計算されるかを理解するためのいくつかの例です。

### 例1：パブリックインターネット外部転送\{#example-1-public-internet-egress}

クラスターがAWS us-east-1（バージニア）にデプロイされており、パブリックインターネット経由でクライアントに検索結果を返却していると仮定します：

- **転送データサイズ**：1か月で500 GB

- **転送タイプ**：パブリックインターネット外部転送

- **単価**：$0.09/GB（AWS us-east-1パブリックインターネット外部転送レートに基づく）

データ転送料は `#0.09 × 500 = #45.00` です。

### 例2：クロスリージョン転送\{#example-2-cross-region-transfer}

クラスターがGCP us-west1（オレゴン）にデプロイされており、このクラスターを2つの異なるリージョン、GCP us-central1（アイオワ）およびGCP europe-west3（フランクフルト）にバックアップする必要があると仮定します：

- **バックアップファイルサイズ**：20 GB

- **転送タイプ**：クロスリージョン転送

- **単価**：

    - GCP us-west1（オレゴン）からGCP us-central1（アイオワ）へのデータ転送は、同一大陸クロスリージョンレートの**&#36;0.02/GB**で請求されます。

    - GCP us-west1（オレゴン）からGCP europe-west3（フランクフルト）へのデータ転送は、異なる大陸クロスリージョンレートの**&#36;0.08/GB**で請求されます。

データ転送料は `#0.02 × 20 + #0.08 x 20 = #2.00` です。

### 例3：同一リージョン転送\{#example-3-intra-region-transfer}

AWS us-east-1（バージニア）にデプロイされているクラスターの監査ログを有効にしており、このクラスターの監査ログを同一クラウドリージョンに作成されたAWS S3バケットに転送する必要があると仮定します。同一リージョンデータ転送は無料であるため、この場合のデータ転送料は**&#36;0**になります。

