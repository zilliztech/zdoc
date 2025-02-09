---
title: "クラウドプロバイダー&地域 | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "クラウドプロバイダー&地域"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、パブリッククラウド上でベクトルデータベースクラスタを提供するクラウドベースのサービスです。当社のサービスを使用すると、お好みのパブリッククラウドプラットフォーム上で独自のベクトルデータベースクラスタを簡単に作成および管理できます。 | Cloud"
type: origin
token: D8EKw1MRViXdv8kgQvWcAk2Ynje
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - providers
  - regions
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database

---

import Admonition from '@theme/Admonition';


# クラウドプロバイダー&地域

Zilliz Cloudは、パブリッククラウド上でベクトルデータベースクラスタを提供するクラウドベースのサービスです。当社のサービスを使用すると、お好みのパブリッククラウドプラットフォーム上で独自のベクトルデータベースクラスタを簡単に作成および管理できます。

Zilliz Cloudは、Amazon Web Services（AWS）、Google Cloud Platform（GCP）、およびMicrosoft Azure上のさまざまなリージョンにクラスターを提供しています。新しいリージョンをリクエストする場合は、お気軽に[お問い合わせくださ](https://zilliz.com/cloud-region-request?)い。

## AWS{#aws}{#awsaws}

Zilliz CloudはAWS上で専用クラスタのデプロイをサポートしています。

<table>
   <tr>
     <th><p><strong>AWSリージョン</strong></p></th>
     <th><p><strong>ロケーション</strong></p></th>
     <th><p><strong>フリークラスタ</strong></p></th>
     <th><p><strong>サーバーレスクラスタ</strong></p></th>
     <th><p><strong>専用クラスタ(Standard)</strong></p></th>
     <th><p><strong>専用クラスタ(Enterprise)</strong></p></th>
   </tr>
   <tr>
     <td><p>us-east-1ファイル</p></td>
     <td><p>アメリカ合衆国バージニア州</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-east-2ファイル</p></td>
     <td><p>アメリカ、オハイオ州</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-west-2ファイル</p></td>
     <td><p>アメリカ合衆国オレゴン州</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ap-1のダウンロード</p></td>
     <td><p>シンガポール</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>eu-central-1ダウンロード</p></td>
     <td><p>フランクフルト</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ap-北東の1</p></td>
     <td><p>東京</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタータイプの詳細については、「[詳細なプラン比較](./select-zilliz-cloud-service-plans)」を参照してください。

## GCP{#gcp}{#gcpgcp}

無料、サーバーレス、専用クラスターはGCPにデプロイできます。

<table>
   <tr>
     <th><p><strong>GCPリージョン</strong></p></th>
     <th><p><strong>ロケーション</strong></p></th>
     <th><p><strong>フリークラスタ</strong></p></th>
     <th><p><strong>サーバーレスクラスタ</strong></p></th>
     <th><p><strong>専用クラスタ(Standard)</strong></p></th>
     <th><p><strong>専用クラスタ(Enterprise)</strong></p></th>
   </tr>
   <tr>
     <td><p>us-westとは</p></td>
     <td><p>アメリカ合衆国オレゴン州</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>私たちの東4</p></td>
     <td><p>アメリカ合衆国バージニア州</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-centralダウンロード</p></td>
     <td><p>アイオワ州、アメリカ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ西3</p></td>
     <td><p>フランクフルト,ドイツ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>アジア南東部1</p></td>
     <td><p>シンガポール</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタータイプの詳細については、「[詳細なプラン比較](./select-zilliz-cloud-service-plans)」を参照してください。

## マイクロソフトAzure{#microsoft-azure}{#azuremicrosoft-azure}

Zilliz Cloudは、Microsoft Azure上で専用クラスタを展開することをサポートしています。

<table>
   <tr>
     <th><p><strong>Azureリージョン</strong></p></th>
     <th><p><strong>ロケーション</strong></p></th>
     <th><p><strong>フリークラスタ</strong></p></th>
     <th><p><strong>サーバーレスクラスタ</strong></p></th>
     <th><p><strong>専用クラスタ(Standard)</strong></p></th>
     <th><p><strong>専用クラスタ(Enterprise)</strong></p></th>
   </tr>
   <tr>
     <td><p>アメリカ東部</p></td>
     <td><p>アメリカ合衆国バージニア州</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>中央アメリカ</p></td>
     <td><p>アメリカ合衆国ロワ州</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ドイツ西中部</p></td>
     <td><p>フランクフルト,ドイツ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタープランの詳細については、「[詳細なプラン比較](./select-zilliz-cloud-service-plans)」を参照してください。

## 関連するトピック{#}

- [詳細なプラン比較](./select-zilliz-cloud-service-plans)

- [適切なCUを選択](./cu-types-explained)

