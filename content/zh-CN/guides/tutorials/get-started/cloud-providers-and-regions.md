---
title: "云服务提供商和地域 | Cloud"
slug: /cloud-providers-and-regions
sidebar_label: "云服务提供商和地域"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 支持阿里云、腾讯云、亚马逊云科技上的多个云服务商和区域。 | Cloud"
type: origin
token: BErdww1kOirndzkHrKoc2ibynlb
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 云服务提供商和地域

Zilliz Cloud 支持阿里云、腾讯云、亚马逊云科技上的多个云服务商和区域。

云地域支持情况可能因工作负载类型、部署选项和功能而异。创建项目前，请根据本文选择合适的云地域。

## 如何选择云地域\{#how-to-choose-a-cloud-region}

- 选择靠近应用或用户的地域。

- 考虑数据驻留和合规要求。

- 考虑延迟和跨地域数据传输影响。

- 检查目标地域是否支持所需功能。

- 如果所需地域或功能不可用，请[联系我们](http://zilliz.com.cn/contact-sales)。

## 支持的云地域\{#supported-regions}

### 阿里云\{#alibaba-cloud}

Zilliz Cloud 支持在阿里云以下地域部署集群。

<table>
   <tr>
     <th><p><strong>大洲</strong></p></th>
     <th><p><strong>地域名称</strong></p></th>
   </tr>
   <tr>
     <td rowspan="4"><p>中国内地</p></td>
     <td><p>华东1（杭州）</p></td>
   </tr>
   <tr>
     <td><p>华东2（上海）</p></td>
   </tr>
   <tr>
     <td><p>华北2（北京）</p></td>
   </tr>
   <tr>
     <td><p>华南1（深圳）</p></td>
   </tr>
   <tr>
     <td><p>北美</p></td>
     <td><p>美国（弗吉尼亚）</p></td>
   </tr>
   <tr>
     <td><p>亚太</p></td>
     <td><p>新加坡</p></td>
   </tr>
   <tr>
     <td><p>中东</p></td>
     <td><p>沙特（利雅得-合作伙伴运营）</p></td>
   </tr>
</table>

### 腾讯云\{#tencent-cloud}

Zilliz Cloud 支持在腾讯云以下地域部署集群。

<table>
   <tr>
     <th><p><strong>大洲</strong></p></th>
     <th><p><strong>地域名称</strong></p></th>
   </tr>
   <tr>
     <td rowspan="2"><p>中国内地</p></td>
     <td><p>华北地区（北京）</p></td>
   </tr>
   <tr>
     <td><p>华东地区（上海）</p></td>
   </tr>
   <tr>
     <td><p>北美</p></td>
     <td><p>美国东部（弗吉尼亚）</p></td>
   </tr>
</table>

### 亚马逊云科技\{#amazon-cn}

Zilliz Cloud 支持在亚马逊云科技以下地域部署集群。

| **大洲** | **地域名称** |
| --- | --- |
| 中国内地 | 中国（宁夏） |

## 云地域的功能支持情况\{#feature-support-by-cloud-region}

不同云地域对计算类型、部署方式和功能的支持情况可能不同。创建项目前，请先确认目标地域是否支持所需能力。

### 计算类型支持\{#compute-type-support}

| 计算类型 | 阿里云 | 腾讯云 | 亚马逊云科技 |
| --- | --- | --- | --- |
| Serving 集群 | ✅ 全部地域 | ✅ 全部地域 | ✅ 全部地域 |
| 按需计算 | ✅ 全部地域 | ❌ | ❌ |

<Admonition type="info" icon="📘" title="说明">

如果您选择的地域未支持按需计算，请[联系我们](http://zilliz.com.cn/contact-sales)。

</Admonition>

### 部署方式支持\{#deployment-option-support}

<table>
   <tr>
     <th><p>部署方式</p></th>
     <th><p>阿里云</p></th>
     <th><p>腾讯云</p></th>
     <th><p>亚马逊云科技</p></th>
   </tr>
   <tr>
     <td><p>SaaS（Free 和 Serverless）</p></td>
     <td><p>ℹ️ 部分地域：</p><ul><li>华东1（杭州）</li></ul></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>SaaS（Dedicated）</p></td>
     <td><p>✅ 全部地域</p></td>
     <td><p>✅ 全部地域</p></td>
     <td><p>✅ 全部地域</p></td>
   </tr>
   <tr>
     <td><p>BYOC</p></td>
     <td><p>✅ 全部地域</p></td>
     <td><p>✅ 全部地域</p></td>
     <td><p>✅ 全部地域</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

如需 BYOC 部署，请[联系我们](http://zilliz.com.cn/contact-sales)。

</Admonition>

### 功能支持\{#feature-support}

<table>
   <tr>
     <th><p>功能</p></th>
     <th><p>阿里云</p></th>
     <th><p>腾讯云</p></th>
     <th><p>亚马逊云科技</p></th>
   </tr>
   <tr>
     <td><p>Volume</p></td>
     <td><p>✅ 全部地域</p></td>
     <td><p>❌</p></td>
     <td><p>✅ 全部地域</p></td>
   </tr>
   <tr>
     <td><p>External Collection</p></td>
     <td><p>✅ 全部地域</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>Global Cluster（全球集群）</p></td>
     <td><p>ℹ️ 请联系我们</p></td>
     <td><p>ℹ️ 请联系我们</p></td>
     <td><p>ℹ️ 请联系我们</p></td>
   </tr>
   <tr>
     <td><p>Cross-region backup（跨地域备份）</p></td>
     <td><p>✅ 全部地域</p></td>
     <td><p>❌</p></td>
     <td><p>✅ 全部地域</p></td>
   </tr>
   <tr>
     <td><p>托管模型</p></td>
     <td><p>ℹ️ 部分地域：</p><ul><li>华北2（北京）</li></ul></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>导出备份文件</p></td>
     <td><p>✅ 全部地域</p></td>
     <td><p>❌</p></td>
     <td><p>✅ 全部地域</p></td>
   </tr>
</table>

