---
title: "数据传输费用 | Cloud"
slug: /data-transfer-cost
sidebar_key: data-transfer-cost
sidebar_label: "数据传输"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，数据传输可以指流入 Zilliz Cloud 的流量、从 Zilliz Cloud 输出到公网的流量，或在 Zilliz Cloud 内部两个资源之间的流量。数据传输费用基于传输的数据量计费。 | Cloud"
type: origin
token: RZoSwcpJniF0ZxkfhaDcFUHin4A
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 支付方式
  - 账单
  - 数据传输
  - 费用

---

import Admonition from '@theme/Admonition';


# 数据传输费用

在 Zilliz Cloud 中，数据传输可以指流入 Zilliz Cloud 的流量、从 Zilliz Cloud 输出到公网的流量，或在 Zilliz Cloud 内部两个资源之间的流量。数据传输费用基于传输的数据量计费。

<Admonition type="info" icon="📘" title="说明">

每个组织每月可享受 ¥100 数据传输费用减免，覆盖前 100 GB 的数据传输。

</Admonition>

下表展示了不同数据传输类型之间的对比。

<table>
   <tr>
     <th><p><strong>数据传输类型</strong></p></th>
     <th><p><strong>描述</strong></p></th>
     <th><p><strong>定价说明</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>公网流量</strong></p></td>
     <td><p>公网出口流量是指通过 Zilliz Cloud 提供的 Public Endpoint 访问集群时产生的出站流量。包括：</p><ul><li><p>通过 Public Endpoint 发起的所有接口操作</p></li><li><p>通过 Endpoint 迁移发起的数据迁移流量</p></li></ul></td>
     <td><p>成本最高。具体价格由流量流出大洲决定。</p><p>详细费率请参见 <a href="https://zilliz.com.cn/pricing/pricing-guide">Zilliz Cloud 定价指南</a>。</p></td>
   </tr>
   <tr>
     <td><p><strong>跨地域流量</strong></p></td>
     <td><p>跨地域流量指不同地域之间的数据传输，仅在以下场景产生：</p><ul><li><p>跨地域的集群数据迁移（例如将阿里云北京的 Zilliz 集群迁移至阿里云新加坡的集群中）</p></li><li><p>跨地域备份</p></li></ul></td>
     <td><ul><li><p>对于阿里云集群，具体价格由流量流出和流入大洲决定。</p></li><li><p>对于腾讯云和亚马逊云科技集群，具体价格由流量流出大洲决定。</p><p>详细费率请参见 <a href="https://zilliz.com.cn/pricing/pricing-guide">Zilliz Cloud 定价指南</a>。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><strong>同地域流量</strong></p></td>
     <td><p>同地域流量是指在同一云服务商同一区域内进行的数据传输，通常延迟和费用都低于跨区域传输。通常在以下场景产生：</p><ul><li><p>将审计日志转发到同地域的云对象存储</p></li><li><p>部署在相同地域 Zilliz Cloud 集群之间的数据迁移</p></li></ul></td>
     <td><p>免费</p></td>
   </tr>
</table>

## 数据传输费用来源\{#sources-of-data-transfer-cost}

以下场景会产生数据传输费用：

- [搜索/查询](./search-query-get)等操作

- 转发[审计日志](./audit-logs)到云服务对象存储

- [离线迁移](./offline-migration)

- [跨地域备份](/docs/backup-to-other-regions)

- 使用第三方[模型](./function-and-model-inference-overview)进行数据 Ingest、Search、Query、Rerank

<Admonition type="info" icon="📘" title="说明">

如果数据传输发生在同一云地域内，费用为 ¥0。

在查询或搜索请求中使用私网连接不会产生数据传输费用。

</Admonition>

## 计算公式\{#cost-calculation}

```plaintext
数据传输费用 = 数据传输单价 × 传输数据量
```

- **数据传输单价**：由集群的云地域、数据传输类型（公网出口、跨地域或同地域）决定。详见 [Zilliz Cloud 定价指南](https://zilliz.com.cn/pricing/pricing-guide)。

- **传输数据量**：以 GB 为单位，按通过网络发送的数据大小计算。

## 计算示例\{#examples}

以下几个计算示例旨在帮助您了解如何计算数据传输费用。

### 示例 1：公网出口\{#example-1-public-internet-egress}

假设您的集群部署在阿里云华东1（杭州），并通过公网将搜索结果返回给客户端：

- **传输数据量**：一个月内 500 GB

- **传输类型**：公网出口

- **流出大洲**：中国内地

- **单价**：¥0.8/GB

那么，`数据传输费用 = ¥0.8 × 500 = ¥400.00`。

### 示例 2：跨地域传输\{#example-2-cross-region transfer}

假设您的集群部署在阿里云华东1（杭州），需要将此集群备份到阿里云华东2（上海）。

- **备份文件大小**：20 GB

- **传输类型**：跨地域传输

- **流出大洲**：中国内地

- **流入大洲**：中国内地

- **单价**：¥0.48/GB

那么，`数据传输费用 = ¥0.48 × 20 = ¥9.60`。

### 示例 3：同地域传输\{#example-3-intra-region transfer}

假设您的集群部署在阿里云华东1（杭州）并启用了审计日志功能，需要将此集群的审计日志转发到同区域创建的阿里云对象存储（OSS）桶中。由于是同地域数据传输，因此数据传输费用为 ¥0。

