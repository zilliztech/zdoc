---
title: "Zilliz Cloud IP | BYOC"
slug: /zilliz-cloud-ips
sidebar_label: "Zilliz Cloud IP 地址"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 使用一组固定的 IP 地址从您的数据源中拉取数据，并将其发送到目标集群。为了确保 Zilliz Cloud 能够执行此操作，您需要在防火墙中将这些 IP 地址添加到安全列表中： | BYOC"
type: origin
token: J86AwNi3midzR9kqgbHcnX14ntc
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 迁移
  - ip

---

import Admonition from '@theme/Admonition';


# Zilliz Cloud IP

Zilliz Cloud 使用一组固定的 IP 地址从您的数据源中拉取数据，并将其发送到目标集群。为了确保 Zilliz Cloud 能够执行此操作，您需要在防火墙中将这些 IP 地址添加到安全列表中：

- Zilliz Cloud 服务 IP 地址

- 目标集群所在云地域的 IP 地址

## Zilliz Cloud 服务 IP 地址

这些 IP 地址由 Zilliz Cloud 用于提供服务，请确保将它们添加到防火墙的安全列表中。

<table>
   <tr>
     <th><p>云地域</p></th>
     <th><p>位置</p></th>
     <th><p>IP 地址（CIDR）</p></th>
   </tr>
   <tr>
     <td><p>cn-hangzhou</p></td>
     <td><p>华东1（杭州）</p></td>
     <td><p><code>114.55.232.32</code></p></td>
   </tr>
</table>

## 目标集群所在云地域 IP 地址

将目标 Zilliz Cloud 集群所在云服务提供商和地域对应的 IP 地址加入安全列表。

### 阿里云

<table>
   <tr>
     <th><p>云地域</p></th>
     <th><p>位置</p></th>
     <th><p>IP 地址（CIDR）</p></th>
   </tr>
   <tr>
     <td><p>cn-hangzhou</p></td>
     <td><p>华东1（杭州）</p></td>
     <td><p><code>114.55.232.32</code></p></td>
   </tr>
   <tr>
     <td><p>cn-beijing</p></td>
     <td><p>华北2（北京）</p></td>
     <td><p><code>39.105.24.167</code></p></td>
   </tr>
   <tr>
     <td><p>cn-shenzhen</p></td>
     <td><p>华南1（深圳）</p></td>
     <td><p><code>47.107.39.14</code></p></td>
   </tr>
   <tr>
     <td><p>cn-shanghai</p></td>
     <td><p>华东2（上海）</p></td>
     <td><p><code>47.117.150.202</code></p></td>
   </tr>
   <tr>
     <td><p>us-east</p></td>
     <td><p>美国（弗吉尼亚）</p></td>
     <td><p><code>47.253.55.20</code></p></td>
   </tr>
   <tr>
     <td><p>ap-southeast-1</p></td>
     <td><p>新加坡</p></td>
     <td><p><code>47.237.71.220</code></p></td>
   </tr>
</table>

### 腾讯云

<table>
   <tr>
     <th><p>云地域</p></th>
     <th><p>位置</p></th>
     <th><p>IP 地址（CIDR）</p></th>
   </tr>
   <tr>
     <td><p>ap-beijing</p></td>
     <td><p>华北地区（北京）</p></td>
     <td><p><code>82.156.105.162</code></p></td>
   </tr>
   <tr>
     <td><p>ap-shanghai</p></td>
     <td><p>华东地区（上海）</p></td>
     <td><p><code>124.222.234.127</code></p></td>
   </tr>
   <tr>
     <td><p>na-ashburn</p></td>
     <td><p>美国东部（弗吉尼亚）</p></td>
     <td><p><code>43.130.121.239</code></p></td>
   </tr>
</table>

### 亚马逊云科技

<table>
   <tr>
     <th><p>云地域</p></th>
     <th><p>位置</p></th>
     <th><p>IP 地址（CIDR）</p></th>
   </tr>
   <tr>
     <td><p>cn-northwest-1</p></td>
     <td><p>中国（宁夏）</p></td>
     <td><p><code>43.192.24.37</code></p></td>
   </tr>
</table>

