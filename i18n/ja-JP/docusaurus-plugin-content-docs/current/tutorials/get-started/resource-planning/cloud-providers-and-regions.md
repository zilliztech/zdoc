---
title: "クラウドプロバイダーとリージョン | Cloud"
slug: /cloud-providers-and-regions
sidebar_key: cloud-providers-and-regions
sidebar_label: "クラウドプロバイダーとリージョン"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、パブリッククラウド上でベクトルデータベースクラスターを提供するクラウドベースのサービスです。このサービスを利用することで、選択したパブリッククラウドプラットフォーム上で、簡単に独自のベクトルデータベースクラスターを作成および管理できます。 | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - プロバイダー
  - リージョン

---

import Admonition from '@theme/Admonition';


# クラウドプロバイダーとリージョン

Zilliz Cloud は、パブリッククラウド上で ベクトルデータベース クラスターを提供するクラウドベースのサービスです。このサービスを利用することで、選択したパブリッククラウドプラットフォーム上で簡単に独自の ベクトルデータベース クラスターを作成および管理できます。

Zilliz Cloud は、Amazon Web Services (AWS)、Google Cloud Platform (GCP)、Microsoft Azure 上のさまざまなリージョンでクラスターを提供しています。新しいリージョンのリクエストについては、お気軽に [お問い合わせください](https://zilliz.com/cloud-region-request?)。

## AWS\{#aws}

Zilliz Cloud は、AWS 上で無料、サーバーレス、および専用クラスターのデプロイをサポートしています。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
     <th><p><strong>無料およびサーバーレスクラスター</strong></p></th>
     <th><p><strong>専用クラスター</strong></p></th>
     <th><p><strong>オンデマンドクラスター</strong></p></th>
   </tr>
   <tr>
     <td rowspan="4"><p>北米</p></td>
     <td><p>us-west-2</p></td>
     <td><p>オレゴン州、米国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>バージニア州北部、米国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td rowspan="9"><p><a href="http://zilliz.com/contact-sales">お問い合わせ</a></p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>オハイオ州、米国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ (セントラル)</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>eu-central-1</p></td>
     <td><p>フランクフルト、ドイツ</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>アイルランド</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td rowspan="3"><p>アジア</p></td>
     <td><p>ap-northeast-1</p></td>
     <td><p>東京、日本</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>ソウル、韓国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>オセアニア</p></td>
     <td><p>ap-southeast-2</p></td>
     <td><p>シドニー、オーストラリア</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタータイプの詳細については、[クラスタープランの選択](./select-zilliz-cloud-service-plans) をご覧ください。

## GCP\{#gcp}

GCP 上で無料、サーバーレス、および専用クラスターをデプロイできます。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
     <th><p><strong>無料およびサーバーレスクラスター</strong></p></th>
     <th><p><strong>専用クラスター</strong></p></th>
     <th><p><strong>オンデマンドクラスター</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>us-west1</p></td>
     <td><p>オレゴン州、米国</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
     <td rowspan="5"><p><a href="http://zilliz.com/contact-sales">お問い合わせ</a></p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>バージニア州、米国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>アイオワ州、米国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ</p></td>
     <td><p>europe-west3</p></td>
     <td><p>フランクフルト、ドイツ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタータイプの詳細については、[クラスタープランの選択](./select-zilliz-cloud-service-plans) をご覧ください。

## Microsoft Azure\{#microsoft-azure}

Zilliz Cloud は、Microsoft Azure 上で専用クラスターのデプロイをサポートしています。

<table>
   <tr>
     <th><p><strong>大陸</strong></p></th>
     <th><p><strong>リージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
     <th><p><strong>無料およびサーバーレスクラスター</strong></p></th>
     <th><p><strong>専用クラスター</strong></p></th>
     <th><p><strong>オンデマンドクラスター</strong></p></th>
   </tr>
   <tr>
     <td rowspan="3"><p>北米</p></td>
     <td><p>East US</p></td>
     <td><p>バージニア州、米国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
     <td rowspan="6"><p><a href="http://zilliz.com/contact-sales">お問い合わせ</a></p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>バージニア州、米国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>アイオワ州、米国</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td rowspan="2"><p>ヨーロッパ</p></td>
     <td><p>Germany West Central</p></td>
     <td><p>フランクフルト、ドイツ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>アイルランド</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>アジア</p></td>
     <td><p>Central India</p></td>
     <td><p>プネー、インド</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタープランの詳細については、[適切なクラスタープランの選択](./select-zilliz-cloud-service-plans) をご覧ください。

## 関連トピック\{#related-topics}

- [適切なクラスタープランの選択](./select-zilliz-cloud-service-plans)

- [適切な CU の選択](./cu-types-explained)

