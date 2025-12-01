---
title: "クラウドプロバイダーおよびリージョン | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "クラウドプロバイダーおよびリージョン"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudはパブリッククラウド上でベクターデータベースクラスターを提供するクラウドベースのサービスです。当社のサービスにより、選択したパブリッククラウドプラットフォーム上で簡単に独自のベクターデータベースクラスターを作成および管理できます。 | Cloud"
type: origin
token: CPLrwghdWiSvGBkdeEecGjgLnSb
sidebar_position: 5
keywords:
  - zilliz
  - vector database
  - cloud
  - providers
  - regions
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial

---

import Admonition from '@theme/Admonition';


# クラウドプロバイダーおよびリージョン

Zilliz Cloudはパブリッククラウド上でベクターデータベースクラスターを提供するクラウドベースのサービスです。当社のサービスにより、選択したパブリッククラウドプラットフォーム上で簡単に独自のベクターデータベースクラスターを作成および管理できます。

Zilliz Cloudは、Amazon Web Services（AWS）、Google Cloud Platform（GCP）、Microsoft Azureのさまざまなリージョンでクラスターを提供します。新しいリージョンのリクエストがある場合は、[お問い合わせください](https://zilliz.com/cloud-region-request?)。

## AWS\{#aws}

Zilliz Cloudは、AWS上で無料、サーバーレス、および専用クラスターの展開をサポートしています。

<table>
   <tr>
     <th><p><strong>AWSリージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
     <th><p><strong>無料クラスター</strong></p></th>
     <th><p><strong>サーバーレスクラスター</strong></p></th>
     <th><p><strong>専用クラスター</strong></p></th>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>米国北部バージニア</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>米国オハイオ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-west-2</p></td>
     <td><p>米国オレゴン</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ（セントラル）</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>eu-central-1</p></td>
     <td><p>ドイツフランクフルト</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-1</p></td>
     <td><p>日本東京</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-2</p></td>
     <td><p>オーストラリアシドニー</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタータイプの詳細については、[クラスタープランの選択](./select-zilliz-cloud-service-plans)を参照してください。

## GCP\{#gcp}

無料、サーバーレス、および専用クラスターはGCPに展開できます。

<table>
   <tr>
     <th><p><strong>GCPリージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
     <th><p><strong>無料クラスター</strong></p></th>
     <th><p><strong>サーバーレスクラスター</strong></p></th>
     <th><p><strong>専用クラスター</strong></p></th>
   </tr>
   <tr>
     <td><p>us-west1</p></td>
     <td><p>米国オレゴン</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>米国バージニア</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>米国アイオワ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>europe-west3</p></td>
     <td><p>ドイツフランクフルト</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタータイプの詳細については、[クラスタープランの選択](./select-zilliz-cloud-service-plans)を参照してください。

## Microsoft Azure\{#microsoft-azure}

Zilliz Cloudは、Microsoft Azure上で専用クラスターの展開をサポートしています。

<table>
   <tr>
     <th><p><strong>Azureリージョン</strong></p></th>
     <th><p><strong>場所</strong></p></th>
     <th><p><strong>無料クラスター</strong></p></th>
     <th><p><strong>サーバーレスクラスター</strong></p></th>
     <th><p><strong>専用クラスター</strong></p></th>
   </tr>
   <tr>
     <td><p>East US</p></td>
     <td><p>米国バージニア</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>米国バージニア</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>米国アイオワ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>Germany West Central</p></td>
     <td><p>ドイツフランクフルト</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>アイルランド</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
   <tr>
     <td><p>Central India</p></td>
     <td><p>インドプネ</p></td>
     <td><p>いいえ</p></td>
     <td><p>いいえ</p></td>
     <td><p>はい</p></td>
   </tr>
</table>

クラスタープランの詳細については、[適切なクラスタープランの選択](./select-zilliz-cloud-service-plans)を参照してください。

## 関連トピック\{#related-topics}

- [適切なクラスタープランの選択](./select-zilliz-cloud-service-plans)

- [適切なCUの選択](./cu-types-explained)