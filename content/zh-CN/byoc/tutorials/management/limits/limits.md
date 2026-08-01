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
sidebar_position: 17
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# 使用限制

本文介绍了 Zilliz Cloud 平台和集群的使用限制信息。如需了解更多限制信息，您可以使用 Zilliz Cloud 提供的 OPS 系统对大多数设置进行调整。如需更多帮助，可[联系我们](https://support.zilliz.com.cn/hc/zh-cn)。

## 组织、项目和成员\{#organizations-projects-and-members}

下表展示了单个用户可加入的最大组织和项目数。

| **内容** | **最大数量** | **描述** |
| --- | --- | --- |
| 项目 | 100 | 每个用户在每个组织中最多可以创建 100 个项目。 |

## 用户与角色\{#users-and-roles}

下表展示了 Zilliz Cloud 中用用户与角色的数量限制。

| **内容** | **最大数量** | **描述** |
| --- | --- | --- |
| 集群用户 | 500 | 每个集群中最多可容纳 500 名集群用户。 |
| 集群自定义角色 | 500 | 每个集群中最多可创建 500 个自定义角色。如需取消此限制，请[联系我们](http://support.zilliz.com.cn)。 |

## API 密钥\{#api-keys}

| **内容** | **最大数量** | **描述** |
| --- | --- | --- |
| API 密钥 | 100 | 每个组织中可创建最多 100 个自定义 API 密钥。 |

## 控制台 IP 白名单\{#console-ip-allowlist}

| **内容** | **最大数量** | **描述** |
| --- | --- | --- |
| 组织控制台 IP 白名单中 IP 地址 | 100 | 每个组织的控制台 IP 白名单中最多可添加 100 个 IP 地址或 CIDR。 |

## 集群\{#clusters}

### CU\{#cus}

计算单元（CU）是指用于提供向量检索、分析服务的一组硬件资源。CU 提供了并行数据处理的基础计算资源，不同类型的 CU 结合了各异的 CPU、内存和存储配置。CU 的概念仅针对 Dedicated 集群。

| **集群部署方式** | **限制** | **描述** |
| --- | --- | --- |
| Serving-Dedicated | CU 规格 * Replica 数量 &lt;=204,800 | 在自助操作时，单个 Serving-Dedicated 集群最多使用 2,048 个 CU。如果创建了 Replica，CU 规格与 Replica 数量的乘积不得超过 204,800。 |
| On-demand | 8&lt;= CU 规格 &lt;= 256 | 自助操作时，单个 On-demand 集群的 CU 配置范围为 8–256。 |

如需创建超过 2048 个 CU 规格的集群，请[联系我们](https://zilliz.com.cn/contact-sales?firstname=xushuang&lastname=hu&company=Zilliz&name=Zilliz&email=xushuang.hu@zilliz.com&fullname=hu%20xushuang&phone=--&country=)。

## Database\{#databases}

- 每个 Serving-Dedicated 集群中最多可创建 1024 个 Database。

- 每个 项目中最多可创建 100 个 按需计算的 Database。

- 默认的 Default Database 不可删除。

## Replica\{#replicas}

如需添加 Replica，集群规格需要为 **8 CU 或以上**。此外，Replica 功能还具有以下限制

| **内容** | **限制** | **描述** |
| --- | --- | --- |
| Replica 数量 | 100 | 每个集群最多可添加 100 个 Replica。 |
| Query CU x Replica 数量 | 204,800 | 每个集群的 Query CU x Replica 数量不得超过 204,800 |

<Admonition type="info" icon="📘" title="说明">

对于创建较早、兼容 Milvus 版本较低的部分集群，可能需要规格在 12 CU 或以上才可以添加 Replica。

如果想在小规模集群（Query CU 数量小于 8）中添加 Replica，请[联系我们](https://support.zilliz.com.cn/hc/zh-cn)。

</Admonition>

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

| **内容** | **最大数量** |
| --- | --- |
| 所有字段（每个 Collection） | 64 |
| 向量字段（每个 Collection） | 10 |

关于字段的其他限制：

- 某些字段（如 VarChar 或 JSON）使用的内存超出预期，可能导致集群空间耗尽。

### 向量维度\{#dimensions}

向量字段的最大维度数为 32768。

### Shard\{#shards}

Shard 的数量上限取决于 CU 规格。

| CU 规格 | 数量上限 |
| --- | --- |
| 1 - 2 CU | 2 |
| 4 - 8 CU | 4 |
| 12 - 64 CU | 8 |
| \> 64 CU | 16 |

### 速率限制\{#rate-limit}

此外，Zilliz Cloud 针对 Serverless 和 Dedicated 集群中的 Collection 和 Partition 操作（包括创建、加载、释放、删除）还具有速率限制。

|  | **Rate limits** |
| --- | --- |
| Collection 操作（创建、加载、释放、删除） | 每个集群 20 req/s。 |
| Partition 操作（创建、加载、释放、删除） | 每个集群 20 req/s。 |

## 数据操作\{#operations}

下文将介绍 Zilliz Cloud 集群中常见数据操作的速率限制。

### Insert 和 Upsert\{#insert-and-upsert}

速率限制根据集群部署方式和 CU 数量而有所不同。以下表格列出了插入操作的速率限制。

| **Insert 和 Upsert 最大速率限制** |
| --- |
| 16 MB/s + 1 MB/s × CU<br/>最高不超过 256 MB/s。 |

示例：

- `1 CU`: `17 MB/s`

- `8 CUs`: `24 MB/s`

- `64 CUs`: `80 MB/s`

- `240 CUs`: `256 MB/s`

- `>= 240 CUs`: 最高 `256 MB/s`

此外，还适用以下额外限制：

- 单个 shard 的写入速率不得超过 32 MB/s。

- 在 Insert 数据时，请确保包含所有在 Schema 中已定义的字段。如果 Collection 启用了 AutoID，则排除主键。

- 在 Upsert 数据时，请确保包含所有在 Schema 中已定义的字段。

- 为了使 Insert 或 Upsert 的数据能够立即被检索到，建议将搜索或查询请求中的一致性级别更改为 **Strong**。详细信息，请参阅[一致性水平](./consistency-level)。

### Index\{#index}

不同字段类型对应不同类型的索引。以下表格列出了可索引的字段类型及其对应的索引类型。

| **字段类型** | **索引类型** | **度量类型** |
| --- | --- | --- |
| 向量字段 | AUTOINDEX | L2, IP, 和 COSINE |
| VarChar 字段 | TRIE | N/A |
| Int8/16/32/64 | STL_SORT | N/A |
| Float32/64 | STL_SORT | N/A |

### Flush\{#flush}

每个集群的 Flush 请求速率限制为每秒 0.1 个请求，该限制具体适用于以下集群类型：

- 兼容 Milvus 2.4.x 或更高版本的 Serverless 集群；

- 升级到 Beta 版本的 Dedicated 集群，该集群类型兼容 Milvus 2.4.x 或更高版本。

<Admonition type="info" icon="📘" title="说明">

不建议您手动执行 Flush 操作。Zilliz Cloud 会自动优雅地处理数据 Flush 操作。

</Admonition>

### Load\{#load}

每个集群的加载请求速率限制为每秒 **20** 个请求。

<Admonition type="info" icon="📘" title="说明">

对于已加载的 Collection，即使有新数据插入，您无需重复执行加载操作。

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

| **内容** | **最大数量** | **描述** |
| --- | --- | --- |
| 控制台 IP 白名单 | 100 | 控制台 IP 白名单中最多可添加 100 个 IP 地址。 |

## 迁移\{#migrations}

您可以将数据从其他供应商迁移到您的 Zilliz Cloud 集群，每次迁移的最大集合数量会因您的 Zilliz Cloud 集群而异。每次迁移最多可以迁移 **10** 个 Collection。

## Private Endpoint\{#private-endpoint}

| **内容** | **最大数量** | **描述** |
| --- | --- | --- |
| Private Enpoint | 10 | 每个项目最多可创建 10 个 Private Endpoint。 |



import DocCardList from '@theme/DocCardList';

<DocCardList />