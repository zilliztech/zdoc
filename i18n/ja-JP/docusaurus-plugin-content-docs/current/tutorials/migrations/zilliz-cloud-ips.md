---
title: "Zilliz CloudのIPアドレス | Cloud"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz CloudのIPアドレス"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、データソースからデータを取得し、固定IPアドレスのセットを使用してターゲットクラスタに送信します。Zilliz Cloudがこれを行うためには、ファイアウォールにこれらのIPアドレスを安全にリストする必要があります。 | Cloud"
type: origin
token: TVSkwMDwdiQmMykqD0ncQBPun1E
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - migrations
  - ips
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

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
     <td><p><code>54.200.111.111</code>, <code>34.218.171.123</code></p></td>
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
     <td><p><code>54.200.111.111</code>, <code>34.218.171.123</code></p></td>
   </tr>
   <tr>
     <td><p>us-east-1ファイル</p></td>
     <td><p>アメリカ合衆国バージニア州</p></td>
     <td><p><code>44.208.236.92</code></p></td>
   </tr>
   <tr>
     <td><p>us-east-2ファイル</p></td>
     <td><p>アメリカ合衆国オハイオ州</p></td>
     <td><p><code>18.190.127.133</code></p></td>
   </tr>
   <tr>
     <td><p>ap-1のダウンロード</p></td>
     <td><p>シンガポール</p></td>
     <td><p><code>13.251.167.154</code>, <code>3.0.159.148</code></p></td>
   </tr>
   <tr>
     <td><p>ap-北東の1</p></td>
     <td><p>東京</p></td>
     <td><p><code>35.72.252.126</code></p></td>
   </tr>
   <tr>
     <td><p>eu-central-1ダウンロード</p></td>
     <td><p>フランクフルト</p></td>
     <td><p><code>18.158.52.65</code>, <code>3.121.11.160</code></p></td>
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
     <td><p><code>34.168.252.102</code>, <code>34.83.176.23</code>, <code>35.247.80.67</code>, <code>35.227.139.83</code>,</p><p><code>34.168.123.225</code>, <code>35.247.17.192</code>, <code>34.105.17.34</code></p></td>
   </tr>
   <tr>
     <td><p>us-eastさん</p></td>
     <td><p>アメリカ合衆国バージニア州</p></td>
     <td><p><code>35.245.190.186</code>, <code>35.245.51.241</code></p></td>
   </tr>
   <tr>
     <td><p>アジア南東部1</p></td>
     <td><p>シンガポール</p></td>
     <td><p><code>34.87.102.210</code>, <code>35.197.139.186</code></p></td>
   </tr>
   <tr>
     <td><p>ヨーロッパ西3</p></td>
     <td><p>フランクフルト</p></td>
     <td><p><code>34.107.41.158</code>, <code>34.141.61.171</code></p></td>
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
     <td><p><code>52.152.137.114</code></p></td>
   </tr>
   <tr>
     <td><p>ドイツ西中部</p></td>
     <td><p>フランクフルト</p></td>
     <td><p><code>4.184.247.193</code></p></td>
   </tr>
</table>

