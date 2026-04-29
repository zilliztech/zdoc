---
title: "Zilliz Cloud IPs | Cloud"
slug: /zilliz-cloud-ips
sidebar_key: zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IP アドレス"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud は、固定された IP アドレスのセットを使用して、データソースからデータを取得し、ターゲットクラスターに送信します。Zilliz Cloud がこれを実行できるようにするには、ファイアウォールでこれらの IP アドレスをホワイトリストに登録する必要があります | Cloud"
type: origin
token: KfgvwJKPDi8uDekl2aHcPOvgnSb
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - migrations
  - ips

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud の IP アドレス

Zilliz Cloud は、固定された IP アドレスのセットを使用して、データソースからデータを取得し、ターゲットクラスターに送信します。Zilliz Cloud がこれを実行できるようにするには、ファイアウォールで以下の IP アドレスを許可リストに登録する必要があります。

- Zilliz Cloud サービスの IP アドレス

- ターゲットクラスターが存在するクラウドリージョンの IP アドレス

## Zilliz Cloud サービスの IP アドレス\{#zilliz-cloud-service-ip-addresses}

これらの IP アドレスは、Zilliz Cloud がサービスを提供するために使用されます。これらがファイアウォールの許可リストに追加されていることを確認してください。

<table>
   <tr>
     <th><p>リージョン</p></th>
     <th><p>場所</p></th>
     <th><p>IP アドレス (CIDR)</p></th>
   </tr>
   <tr>
     <td><p>us-west-2</p></td>
     <td><p>Oregon, USA</p></td>
     <td><p><code>54.200.111.111</code>, <code>34.218.171.123</code></p></td>
   </tr>
</table>

## ターゲットクラスターリージョンの IP アドレス\{#target-cluster-region-ip-addresses}

ターゲット Zilliz Cloud クラスターのクラウドサービスプロバイダーおよびリージョンに対応する IP アドレスを許可リストに登録してください。

### AWS\{#aws}

<table>
   <tr>
     <th><p>リージョン</p></th>
     <th><p>場所</p></th>
     <th><p>IP アドレス (CIDR)</p></th>
   </tr>
   <tr>
     <td><p>us-west-2</p></td>
     <td><p>Oregon, USA</p></td>
     <td><p><code>54.200.111.111</code>, <code>34.218.171.123</code></p></td>
   </tr>
   <tr>
     <td><p>us-east-1</p></td>
     <td><p>N. Virginia, USA</p></td>
     <td><p><code>44.208.236.92</code></p></td>
   </tr>
   <tr>
     <td><p>us-east-2</p></td>
     <td><p>Ohio, USA</p></td>
     <td><p><code>18.190.127.133</code></p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>Singapore</p></td>
     <td><p><code>13.251.167.154</code>, <code>3.0.159.148</code></p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-1</p></td>
     <td><p>Tokyo, Japan</p></td>
     <td><p><code>35.72.252.126</code></p></td>
   </tr>
   <tr>
     <td><p>eu-central-1</p></td>
     <td><p>Frankfurt, Germany</p></td>
     <td><p><code>18.158.52.65</code>, <code>3.121.11.160</code></p></td>
   </tr>
   <tr>
     <td><p>eu-west-1</p></td>
     <td><p>Ireland</p></td>
     <td><p><code>54.76.194.38</code>, <code>99.81.179.135</code>, <code>3.248.62.149</code>, <code>52.16.225.156</code></p></td>
   </tr>
   <tr>
     <td><p>ca-central-1</p></td>
     <td><p>Canada (Central)</p></td>
     <td><p><code>15.157.245.36</code>, <code>52.60.120.239</code>, <code>15.157.14.152</code></p></td>
   </tr>
   <tr>
     <td><p>ap-sourtheast-2</p></td>
     <td><p>Sydney, Australia</p></td>
     <td><p><code>13.210.191.123</code>, <code>52.62.215.167</code></p></td>
   </tr>
   <tr>
     <td><p>ap-northeast-2</p></td>
     <td><p>Seoul, Korea</p></td>
     <td><p><code>43.200.197.223</code>, <code>54.116.65.71</code>, <code>43.200.30.237</code>, <code>13.125.81.204</code></p></td>
   </tr>
</table>

### GCP\{#gcp}

<table>
   <tr>
     <th><p>リージョン</p></th>
     <th><p>場所</p></th>
     <th><p>IP アドレス (CIDR)</p></th>
   </tr>
   <tr>
     <td><p>us-west1</p></td>
     <td><p>Oregon, USA</p></td>
     <td><p><code>34.168.252.102</code>, <code>34.83.176.23</code>, <code>35.247.80.67</code>, <code>35.227.139.83</code>,</p><p><code>34.168.123.225</code>, <code>35.247.17.192</code>, <code>34.105.17.34</code></p></td>
   </tr>
   <tr>
     <td><p>us-east4</p></td>
     <td><p>Virginia, USA</p></td>
     <td><p><code>35.245.190.186</code>, <code>35.245.51.241</code></p></td>
   </tr>
   <tr>
     <td><p>us-central1</p></td>
     <td><p>Iowa, USA</p></td>
     <td><p><code>34.49.219.2</code>, <code>34.98.66.206</code>, <code>35.190.6.159</code>, <code>34.149.186.202</code></p></td>
   </tr>
   <tr>
     <td><p>asia-southeast1</p></td>
     <td><p>Singapore</p></td>
     <td><p><code>34.87.102.210</code>, <code>35.197.139.186</code></p></td>
   </tr>
   <tr>
     <td><p>europe-west3</p></td>
     <td><p>Frankfurt, Germany</p></td>
     <td><p><code>34.107.41.158</code>, <code>34.141.61.171</code></p></td>
   </tr>
</table>

### Azure\{#azure}

<table>
   <tr>
     <th><p>リージョン</p></th>
     <th><p>場所</p></th>
     <th><p>IP アドレス (CIDR)</p></th>
   </tr>
   <tr>
     <td><p>East US</p></td>
     <td><p>Virginia, USA</p></td>
     <td><p><code>52.152.137.114</code></p></td>
   </tr>
   <tr>
     <td><p>East US 2</p></td>
     <td><p>Virginia, USA</p></td>
     <td><p><code>135.18.170.251</code></p></td>
   </tr>
   <tr>
     <td><p>Central US</p></td>
     <td><p>Iowa, USA</p></td>
     <td><p><code>52.173.197.113</code></p></td>
   </tr>
   <tr>
     <td><p>Germany West Central</p></td>
     <td><p>Frankfurt, Germany</p></td>
     <td><p><code>4.184.247.193</code></p></td>
   </tr>
   <tr>
     <td><p>North Europe</p></td>
     <td><p>Ireland</p></td>
     <td><p><code>4.207.64.80</code>, <code>13.79.36.108</code></p></td>
   </tr>
   <tr>
     <td><p>Central India</p></td>
     <td><p>Pune, India</p></td>
     <td><p><code>98.70.222.135</code></p></td>
   </tr>
</table>

