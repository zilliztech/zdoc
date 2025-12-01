---
title: "Zilliz Cloud IPアドレス | BYOC"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IPアドレス"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データソースからデータを取得し、固定IPアドレスセットを使用してターゲットクラスターに送信します。Zilliz Cloudがこれを行うことを確認するには、ファイアウォールでこれらのIPアドレスを安全リストに登録する必要があります | BYOC"
type: origin
token: KfgvwJKPDi8uDekl2aHcPOvgnSb
sidebar_position: 4
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - 移行
  - ipアドレス
  - ベクターデータベース
  - IVF
  - knn
  - Image Search

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud IPアドレス

Zilliz Cloudは、データソースからデータを取得し、固定IPアドレスセットを使用してターゲットクラスターにデータを送信します。Zilliz Cloudがこれを行うことを確認するには、ファイアウォールでこれらのIPアドレスを安全リスト（許可リスト）に登録する必要があります：

- Zilliz CloudサービスIPアドレス

- ターゲットクラスターが存在するクラウドリージョンのIPアドレス

## Zilliz CloudサービスIPアドレス\{#zilliz-cloud-service-ip-addresses}

これらのIPアドレスは、Zilliz Cloudがサービスを提供するために使用します。これらのアドレスがファイアウォールの許可リストに追加されていることを確認してください。

<table>
   <tr>
     <th><p>リージョン</p></th>
     <th><p>場所</p></th>
     <th><p>IPアドレス（CIDR）</p></th>
   </tr>
   <tr>
     <td><p>us-west-2</p></td>
     <td><p>オレゴン州、アメリカ</p></td>
     <td><p><code>54.200.111.111</code>, <code>34.218.171.123</code></p></td>
   </tr>
</table>

## ターゲットクラスターリージョンIPアドレス\{#target-cluster-region-ip-addresses}

Zilliz Cloudターゲットクラスターのクラウドサービスプロバイダーおよびリージョンに対応するIPアドレスを安全リストに登録してください。

### AWS\{#aws}

<table>
   <tr>
     <th><p>リージョン</p></th>
     <th><p>場所</p></th>
     <th><p>IPアドレス（CIDR）</p></th>
   </tr>
   <tr>
     <td><p>us-west-2</p></td>
     <td><p>オレゴン州、アメリカ</p></td>
     <td><p><code>54.200.111.111</code>, <code>34.218.171.123</code></p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>バージニア州北部、アメリカ</p></td>
     <td><p><code>44.208.236.92</code></p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>オハイオ州、アメリカ</p></td>
     <td><p><code>18.190.127.133</code></p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>シンガポール</p></td>
     <td><p><code>13.251.167.154</code>, <code>3.0.159.148</code></p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-1</p></td>
     <td><p>東京、日本</p></td>
     <td><p><code>35.72.252.126</code></p></td>
   </tr>
   <tr>
     <td><p>eu-central-1</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
     <td><p><code>18.158.52.65</code>, <code>3.121.11.160</code></p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>カナダ（中部）</p></td>
     <td><p><code>15.157.245.36</code>, <code>52.60.120.239</code>, <code>15.157.14.152</code></p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-2</p></td>
     <td><p>オーストラリア、シドニー</p></td>
     <td><p><code>13.210.191.123</code>, <code>52.62.215.167</code></p></td>
   </tr>
</table>

### GCP\{#gcp}

<table>
   <tr>
     <th><p>リージョン</p></th>
     <th><p>場所</p></th>
     <th><p>IPアドレス（CIDR）</p></th>
   </tr>
   <tr>
     <td><p>us-west1</p></td>
     <td><p>オレゴン州、アメリカ</p></td>
     <td>\<p><code>34.168.252.102</code>, <code>34.83.176.23</code>, <code>35.247.80.67</code>, <code>35.227.139.83</code>,<p><code>34.168.123.225</code>, <code>35.247.17.192</code>, <code>34.105.17.34</code></p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>バージニア州、アメリカ</p></td>
     <td><p><code>35.245.190.186</code>, <code>35.245.51.241</code></p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>アイオワ州、アメリカ</p></td>
     <td><p><code>34.49.219.2</code>, <code>34.98.66.206</code>, <code>35.190.6.159</code>, <code>34.149.186.202</code></p></td>
   </tr>
   <tr>
     <td><p>asia-southeast1</p></td>
     <td><p>シンガポール</p></td>
     <td><p><code>34.87.102.210</code>, <code>35.197.139.186</code></p></td>
   </tr>
   <tr>
     <td><p>europe-west3</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
     <td><p><code>34.107.41.158</code>, <code>34.141.61.171</code></p></td>
   </tr>
</table>

### Azure\{#azure}

<table>
   <tr>
     <th><p>リージョン</p></th>
     <th><p>場所</p></th>
     <th><p>IPアドレス（CIDR）</p></th>
   </tr>
   <tr>
     <td><p>米国東部</p></td>
     <td><p>バージニア州、アメリカ</p></td>
     <td><p><code>52.152.137.114</code></p></td>
   </tr>
   <tr>
     <td><p>米国東部2</p></td>
     <td><p>バージニア州、アメリカ</p></td>
     <td><p><code>135.18.170.251</code></p></td>
   </tr>
   <tr>
     <td><p>米国中部</p></td>
     <td><p>アイオワ州、アメリカ</p></td>
     <td><p><code>52.173.197.113</code></p></td>
   </tr>
   <tr>
     <td><p>ドイツ西部中央</p></td>
     <td><p>ドイツ、フランクフルト</p></td>
     <td><p><code>4.184.247.193</code></p></td>
   </tr>
   <tr>
     <td><p>北ヨーローラ</p></td>
     <td><p>アイルランド</p></td>
     <td><p><code>4.207.64.80</code>, <code>13.79.36.108</code></p></td>
   </tr>
   <tr>
     <td><p>中央インド</p></td>
     <td><p>プネー、インド</p></td>
     <td><p><code>98.70.222.135</code></p></td>
   </tr>
</table>

