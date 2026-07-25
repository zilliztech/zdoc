---
title: "使用限制 | BYOC"
slug: /limits
sidebar_label: "使用限制"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "本文介绍了 Zilliz Cloud 平台和集群的使用限制信息。如需了解更多限制信息，您可以使用 Zilliz Cloud 提供的 OPS 系统对大多数设置进行调整。如需更多帮助，可联系我们。 | BYOC"
type: origin
token: A8UFwSbMniMl6IkpJkNc4HsHnLc
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 使用限制

---

import Admonition from '@theme/Admonition';


# 使用限制

本文介绍了 Zilliz Cloud 平台和集群的使用限制信息。如需了解更多限制信息，您可以使用 Zilliz Cloud 提供的 OPS 系统对大多数设置进行调整。如需更多帮助，可[联系我们](https://support.zilliz.com.cn/hc/zh-cn)。

## 组织、项目和成员\{#organizations-projects-and-members}

下表展示了单个用户可加入的最大组织和项目数。

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>最大数量</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>项目</p></td>
     <td><p>100</p></td>
     <td><p>每个用户在每个组织中最多可以创建 100 个项目。</p></td>
   </tr>
</table>

## Replica\{#replicas}

如需添加 Replica，集群规格需要为 **8 CU 或以上**。此外，Replica 功能还具有以下限制

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>限制</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>Replica 数量</p></td>
     <td><p>10</p></td>
     <td><p>每个集群最多可添加 10 个 Replica。</p></td>
   </tr>
   <tr>
     <td><p>Replica 数量 &ast; CU 规格</p></td>
     <td><p>&lt;= 256</p></td>
     <td><p>CU 规格与 Replica 数量的乘积不得超过 256。</p></td>
   </tr>
</table>

## Collection\{#collections}

### 兼容 Milvus v2.4.x 的集群\{#clusters-compatible-with-milvus-v24x}

根据您的集群使用的 CU 数量的不同，每 CU 支持创建最多 256 个 Collection 或 1,024 个 Partition。其中，每个 Collection 最多可创建 1,024 个 Partition。每个 Collection 支持创建最多 1,024 个 Partition。 您可以参考如下公式计算您的集群中的 Collection 和 Partition 的数量上限。

![QJ1jwpa8YhQegqbrAYWcJEOUnWf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/QJ1jwpa8YhQegqbrAYWcJEOUnWf.png)

- 集群中 Collection 的数量上限应该在 256 和集群的 CU 数量之积与 16,384 间取最小值。

- 集群中所有 Collection 中的 Partition 的总数量应该在 1,024 和集群的 CU 数量之和与 65,536 间取最小值。

- 上述条件需同时满足。

### 兼容 Milvus v2.5.x 的集群\{#clusters-compatible-with-milvus-v25x}

根据您的集群使用的 CU 数量的不同，每 CU 支持创建最多 1,024 个 Collection 或 4,096 个 Partition。其中，每个 Collection 最多可创建 1,024 个 Partition。您可以参考如下公式计算您的集群中的 Collection 和 Partition 的数量上限。

![RBu3wbDwihqeFgbFZwQcIpXNnUf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RBu3wbDwihqeFgbFZwQcIpXNnUf.png)

- 集群中 Collection 的数量上限应该在 1,024 和集群的 CU 数量之积与 16,384 间取最小值。

- 集群中所有 Collection 中的 Partition 的总数量应该在 4,096 和集群的 CU 数量之积与 65,536 间取最小值。

- 上述条件需同时满足。

### 字段\{#fields}

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>最大数量</strong></p></th>
   </tr>
   <tr>
     <td><p>所有字段（每个 Collection）</p></td>
     <td><p>64</p></td>
   </tr>
   <tr>
     <td><p>向量字段（每个 Collection）</p></td>
     <td><p>10</p></td>
   </tr>
</table>

关于字段的其他限制：

- 某些字段（如 VarChar 或 JSON）使用的内存超出预期，可能导致集群空间耗尽。

### 向量维度\{#dimensions}

向量字段的最大维度数为 32768。

### Shard\{#shards}

Shard 的数量上限取决于 CU 规格。

<table>
   <tr>
     <th><p>CU 规格</p></th>
     <th><p>数量上限</p></th>
   </tr>
   <tr>
     <td><p>1 - 2 CU</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td><p>4 - 8 CU</p></td>
     <td><p>4</p></td>
   </tr>
   <tr>
     <td><p>12 - 64 CU</p></td>
     <td><p>8</p></td>
   </tr>
   <tr>
     <td><p>> 64 CU</p></td>
     <td><p>16</p></td>
   </tr>
</table>

### 速率限制\{#rate-limit}

此外，Zilliz Cloud 针对 Serverless 和 Dedicated 集群中的 Collection 和 Partition 操作（包括创建、加载、释放、删除）还具有速率限制。

<table>
   <tr>
     <th></th>
     <th><p><strong>Rate limits</strong></p></th>
   </tr>
   <tr>
     <td><p>Collection 操作（创建、加载、释放、删除）</p></td>
     <td><p>每个集群 20 req/s。</p></td>
   </tr>
   <tr>
     <td><p>Partition 操作（创建、加载、释放、删除）</p></td>
     <td><p>每个集群 20 req/s。</p></td>
   </tr>
</table>

## 数据操作\{#operations}

下文将介绍 Zilliz Cloud 集群中常见数据操作的速率限制。

### Insert\{#insert}

每个插入请求/响应的大小不应超过 64 MB。

速率限制根据集群类型和 CU 数量而有所不同。以下表格列出了插入操作的速率限制。

<table>
   <tr>
     <th></th>
     <th><p><strong>Insert 最大速率限制</strong></p></th>
   </tr>
   <tr>
     <td><p>1-2 CU</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>4-8 CU</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
   <tr>
     <td><p>12-20 CU</p></td>
     <td><p>16 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[24 CU, 64 CU)</p></td>
     <td><p>24 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[64CU, 128 CU)</p></td>
     <td><p>36 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[128 CU, 256 CU)</p></td>
     <td><p>48 MB/s</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>= 256 CU</p></blockquote></td>
     <td><p>64 MB/s</p></td>
   </tr>
</table>

在插入数据时，请确保包含所有在 Schema 中已定义的字段。如果 Collection 启用了 AutoID，则排除主键。

为了使插入的数据能够立即被检索到，建议将搜索或查询请求中的一致性级别更改为 **Strong**。详细信息，请参阅[一致性水平](./consistency-level)。

### Upsert\{#upsert}

每个 Upsert 请求/响应的大小不应超过 64 MB。

速率限制根据集群类型和 CU 数量而有所不同。以下表格列出了 Upsert 操作的速率限制。

<table>
   <tr>
     <th></th>
     <th><p>Upsert 最大速率限制</p></th>
   </tr>
   <tr>
     <td><p>1-2 CU</p></td>
     <td><p>8 MB/s</p></td>
   </tr>
   <tr>
     <td><p>4-8 CU</p></td>
     <td><p>12 MB/s</p></td>
   </tr>
   <tr>
     <td><p>12-20 CU</p></td>
     <td><p>16 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[24 CU, 64 CU)</p></td>
     <td><p>24 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[64CU, 128 CU)</p></td>
     <td><p>36 MB/s</p></td>
   </tr>
   <tr>
     <td><p>[128 CU, 256 CU)</p></td>
     <td><p>48 MB/s</p></td>
   </tr>
   <tr>
     <td><blockquote>  <p>= 256 CU</p></blockquote></td>
     <td><p>64 MB/s</p></td>
   </tr>
</table>

在 Upsert 数据时，请确保包含所有在 Schema 中已定义的字段。

为了使 Upsert 的数据能够立即被检索到，建议将搜索或查询请求中的一致性级别更改为 **Strong**。详细信息，请参阅[一致性水平](./consistency-level)。

### Index\{#index}

不同字段类型对应不同类型的索引。以下表格列出了可索引的字段类型及其对应的索引类型。

<table>
   <tr>
     <th><p><strong>字段类型</strong></p></th>
     <th><p><strong>索引类型</strong></p></th>
     <th><p><strong>度量类型</strong></p></th>
   </tr>
   <tr>
     <td><p>向量字段</p></td>
     <td><p>AUTOINDEX</p></td>
     <td><p>L2, IP, 和 COSINE</p></td>
   </tr>
   <tr>
     <td><p>VarChar 字段</p></td>
     <td><p>TRIE</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>Int8/16/32/64</p></td>
     <td><p>STL_SORT</p></td>
     <td><p>N/A</p></td>
   </tr>
   <tr>
     <td><p>Float32/64</p></td>
     <td><p>STL_SORT</p></td>
     <td><p>N/A</p></td>
   </tr>
</table>

### Flush\{#flush}

每个集群的 Flush 请求速率限制为每秒 0.1 个请求，该限制具体适用于以下集群类型：

- 兼容 Milvus 2.4.x 或更高版本的 Serverless 集群；

- 升级到 Beta 版本的 Dedicated 集群，该集群类型兼容 Milvus 2.4.x 或更高版本。

<Admonition type="info" icon="📘" title="说明">

<p>不建议您手动执行 Flush 操作。Zilliz Cloud 会自动优雅地处理数据 Flush 操作。</p>

</Admonition>

### Load\{#load}

每个集群的加载请求速率限制为每秒 **20** 个请求。

<Admonition type="info" icon="📘" title="说明">

<p>对于已加载的 Collection，即使有新数据插入，您无需重复执行加载操作。</p>

</Admonition>

### Search\{#search}

每个搜索请求/响应的大小不应超过 **64** MB。

根据集群部署方式，每个搜索请求携带的查询向量（**nq**）上限有所不同最多不超过 16,384 个。

根据集群部署方式，每个搜索响应返回的 Entity 数量（**topK**）上限有所不同最多不超过 16,384 个。

### Query\{#query}

每个查询请求/响应的大小不应超过 **64** MB。

每个查询响应返回的 Entity 数量（**topK**）不超过 **16384** 个。

### Delete Entity\{#delete}

每个删除请求/响应的大小不应超过 **64** MB。

每个集群的删除请求速率限制为每秒 **0.5** MB。

### Drop Collection\{#drop}

每个集群的删除请求速率限制为每秒 **20** 个请求。

### Data Import\{#data-import}

单 Collection 支持最多 **10,000** 个正在运行或待运行的数据导入任务。

此外，Zilliz Cloud 还对导入的文件大小有以下限制。

请参阅[支持的对象存储](./data-import-storage-options)和[支持的数据格式](./data-import-format-options)了解更多。

## 数据备份（控制台）\{#backup-on-console}

手动创建的备份会永久保留。

自动创建的备份可最多保存 30 天。

## 数据恢复（控制台）\{#restore-on-console}

您可以从快照中恢复 Zilliz Cloud 集群。恢复的集群和原集群应属于同一地域，并使用相同的 CU 类型。

## IP 白名单\{#ip-access-list}

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>最大数量</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>IP 地址 (CIDR)</p></td>
     <td><p>100</p></td>
     <td><p>IP 白名单中最多可添加 100 个 IP 地址。</p></td>
   </tr>
</table>

## 迁移\{#migrations}

您可以将数据从其他供应商迁移到您的 Zilliz Cloud 集群，每次迁移的最大集合数量会因您的 Zilliz Cloud 集群而异。每次迁移最多可以迁移 **10** 个 Collection。

