---
title: "Zilliz CloudのIPアドレス | BYOC"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IP Addresses"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データソースからデータを取得し、固定IPアドレスのセットを使用してターゲットクラスタに送信します。Zilliz Cloudがこれを行うためには、ファイアウォールにこれらのIPアドレスを安全にリストする必要があります。 | BYOC"
type: origin
token: KfgvwJKPDi8uDekl2aHcPOvgnSb
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - ips
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge

---

import Admonition from '@theme/Admonition';


# Zilliz CloudのIPアドレス

Zilliz Cloudは、データソースからデータを取得し、固定IPアドレスのセットを使用してターゲットクラスタに送信します。Zilliz Cloudがこれを行うためには、ファイアウォールにこれらのIPアドレスを安全にリストする必要があります。

- Zilliz CloudサービスのIPアドレス

- ターゲットクラスタが存在するクラウドリージョンのIPアドレス

## Zilliz CloudサービスのIPアドレス{#zilliz-cloud-service-ip-addresses}

これらのIPアドレスは、Zilliz Cloudがサービスを提供するために使用されます。これらがファイアウォールの許可リストに追加されていることを確認してください。

<table>
   <tr>
     <th><p>地域</p></th>
     <th><p>ロケーション</p></th>
     <th><p>IPアドレス(CIDR)</p></th>
   </tr>
   <tr>
     <td><p>us-west-2ファイル</p></td>
     <td><p>アメリカ合衆国オレゴン州</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
</table>

## 対象クラスタリージョンのIPアドレス{#target-cluster-region-ip-addresses}

対象のZilliz Cloudクラスタのクラウドサービスプロバイダとリージョンに対応するIPアドレスをセーフリストにします。

### AWS{#aws}

<table>
   <tr>
     <th><p>地域</p></th>
     <th><p>ロケーション</p></th>
     <th><p>IPアドレス(CIDR)</p></th>
   </tr>
   <tr>
     <td><p>us-west-2ファイル</p></td>
     <td><p>アメリカ合衆国オレゴン州</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
   <tr>
     <td><p>us-east-1ファイル</p></td>
     <td><p>アメリカ合衆国バージニア州</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>us-east-2ファイル</p></td>
     <td><p>アメリカ合衆国オハイオ州</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>ap-1のダウンロード</p></td>
     <td><p>シンガポール</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
   <tr>
     <td><p>ap-北東の1</p></td>
     <td><p>東京</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>eu-central-1ダウンロード</p></td>
     <td><p>フランクフルト</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
</table>

### GCP{#gcp}

<table>
   <tr>
     <th><p>地域</p></th>
     <th><p>ロケーション</p></th>
     <th><p>IPアドレス(CIDR)</p></th>
   </tr>
   <tr>
     <td><p>us-westとは</p></td>
     <td><p>アメリカ合衆国オレゴン州</p></td>
     <td><p><code>34.168.252.102</code>, <code>34.83.176.23</code>,<code>35.247.80.67</code>,<code>35.227.139.83</code>,</p><p><code>34.168.123.225</code>, <code>35.247.17.192</code>,<code>34.105.17.34</code>,インラインコードプレースホルダー</p></td>
   </tr>
   <tr>
     <td><p>私たちの東4</p></td>
     <td><p>アメリカ合衆国バージニア州</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
   <tr>
     <td><p>アジア南東部1</p></td>
     <td><p>シンガポール</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ西3</p></td>
     <td><p>フランクフルト</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
</table>

### Azure{#azure}

<table>
   <tr>
     <th><p>地域</p></th>
     <th><p>ロケーション</p></th>
     <th><p>IPアドレス(CIDR)</p></th>
   </tr>
   <tr>
     <td><p>アメリカ東部</p></td>
     <td><p>アメリカ合衆国バージニア州</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>中央アメリカ</p></td>
     <td><p>ロワ、アメリカ</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>ドイツ西中部</p></td>
     <td><p>フランクフルト</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
</table>

