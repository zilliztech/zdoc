---
title: "使用限制 | Cloud"
slug: /limits
sidebar_key: limits
sidebar_label: "使用限制"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "本文介绍了 Zilliz Cloud 平台和集群的使用限制信息。如需了解更多限制信息，可向我们提交请求。 | Cloud"
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

本文介绍了 Zilliz Cloud 平台和集群的使用限制信息。如需了解更多限制信息，可向我们[提交请求](https://support.zilliz.com.cn/hc/zh-cn)。

## 组织、项目和成员\{#organizations-projects-and-members}

下表展示了单个用户可加入的最大组织和项目数。

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>最大数量</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>组织</p></td>
     <td><p>1</p></td>
     <td><p>Zilliz Cloud 账号注册成功后，系统会自动创建 1 个组织。如需更多组织，请<a href="https://support.zilliz.com.cn/hc/zh-cn">提交工单</a>。1 名用户可以加入多个组织。</p></td>
   </tr>
   <tr>
     <td><p>项目</p></td>
     <td><p>100</p></td>
     <td><p>每个用户在每个组织中最多可以创建 100 个项目。</p></td>
   </tr>
</table>

## 用户与角色\{#users-and-roles}

下表展示了 Zilliz Cloud 中用用户与角色的数量限制。

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>最大数量</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>组织用户</p></td>
     <td><p>100</p></td>
     <td><p>每个组织中最多可容纳 100 名组织用户。</p></td>
   </tr>
   <tr>
     <td><p>集群用户</p></td>
     <td><p>100</p></td>
     <td><p>每个集群中最多可容纳 100 名集群用户。</p></td>
   </tr>
   <tr>
     <td><p>集群自定义角色</p></td>
     <td><p>20</p></td>
     <td><p>每个集群中最多可创建 20 个自定义角色。如需取消此限制，请<a href="http://support.zilliz.com.cn">联系我们</a>。</p></td>
   </tr>
</table>

## API 密钥\{#api-keys}

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>最大数量</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>API 密钥</p></td>
     <td><p>100</p></td>
     <td><p>每个组织中可创建最多 100 个自定义 API 密钥。</p></td>
   </tr>
</table>

## 控制台 IP 白名单\{#console-ip-allowlist}

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>最大数量</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>组织控制台 IP 白名单中 IP 地址</p></td>
     <td><p>100</p></td>
     <td><p>每个组织的控制台 IP 白名单中最多可添加 100 个 IP 地址或 CIDR。</p></td>
   </tr>
</table>

## Volume\{#volumes}

<table>
   <tr>
     <th><p><strong>内容</strong></p></th>
     <th><p><strong>最大数量</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>内部 Volume</p></td>
     <td><p>100</p></td>
     <td><p>每个组织中可创建最多 100 个内部 Volume。</p></td>
   </tr>
   <tr>
     <td><p>外部 Volume</p></td>
     <td><p>100</p></td>
     <td><p>每个组织中可创建最多 100 个外部 Volume。</p></td>
   </tr>
</table>

## 集群\{#clusters}

### 集群数量\{#clusters}

集群数量的限制取决于您的支付方式和集群部署方式。

- **未绑定有效支付方式**

    <table>
       <tr>
         <th><p><strong>集群部署方式</strong></p></th>
         <th><p><strong>最大数量</strong></p></th>
         <th><p><strong>描述</strong></p></th>
       </tr>
       <tr>
         <td><p>Free</p></td>
         <td><p>1</p></td>
         <td><p>不论是否绑定有效支付方式，每个组织中最多只可创建一个 Free 集群。如需创建新的 Free 集群，请先删除现有的 Free 集群。</p></td>
       </tr>
       <tr>
         <td><p>Serverless 或 Dedicated</p></td>
         <td><p>1</p></td>
         <td><p>未绑定有效支付方式，最多可免费试用一个 Serverless 或 Dedicated 集群。如需更多集群，请添加支付方式。</p></td>
       </tr>
    </table>

- **已绑定有效支付方式**

    <table>
       <tr>
         <th><p><strong>集群部署方式</strong></p></th>
         <th><p><strong>最大数量</strong></p></th>
         <th><p><strong>描述</strong></p></th>
       </tr>
       <tr>
         <td><p>Serving - Free</p></td>
         <td><p>1</p></td>
         <td><p>不论是否绑定有效支付方式，每个组织中最多只可创建一个 Free 集群。如需创建新的 Free 集群，请先删除现有的 Free 集群。</p></td>
       </tr>
       <tr>
         <td><p>Serving - Serverless</p></td>
         <td><p>100</p></td>
         <td><p>每个项目中最多创建 100 个 Serving 的 Serverless 集群。</p></td>
       </tr>
       <tr>
         <td><p>Serving - Dedicated</p></td>
         <td><p>100</p></td>
         <td><p>每个项目中最多创建 100 个 Serving 的 Dedicated 集群。</p></td>
       </tr>
       <tr>
         <td><p>On-demand</p></td>
         <td><p>20</p></td>
         <td><p>每个项目中最多创建 100 个 On-demand 集群。</p></td>
       </tr>
    </table>

### CU\{#cus}

计算单元（CU）是指用于提供向量检索、分析服务的一组硬件资源。CU 提供了并行数据处理的基础计算资源，不同类型的 CU 结合了各异的 CPU、内存和存储配置。CU 的概念仅针对 Dedicated 集群。

<table>
   <tr>
     <th><p><strong>集群部署方式</strong></p></th>
     <th><p><strong>限制</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>Serving-Dedicated</p></td>
     <td><p>CU 规格 &ast; Replica 数量 &lt;=20480</p></td>
     <td><p>在自助操作时，单个 Serving-Dedicated 集群最多使用 2048 个 CU。如果创建了 Replica，CU 规格与 Replica 数量的乘积不得超过 20480。</p></td>
   </tr>
   <tr>
     <td><p>On-demand</p></td>
     <td><p>8&lt;= CU 规格 &lt;= 256</p></td>
     <td><p>自助操作时，单个 On-demand 集群的 CU 配置范围为 8–256。</p></td>
   </tr>
</table>

如需创建超过 2048 个 CU 规格的集群，请[联系我们](https://zilliz.com.cn/contact-sales?firstname=xushuang&lastname=hu&company=Zilliz&name=Zilliz&email=xushuang.hu@zilliz.com&fullname=hu%20xushuang&phone=--&country=)。

### vCU\{#vcus}

vCU 是用于衡量读取（如 search、query）和写入操作（如 insert、upsert、delete）所消耗资源的基本单位。vCU 的概念仅针对 Free 和 Serverless 集群。

<table>
   <tr>
     <th><p><strong>集群部署方式</strong></p></th>
     <th><p><strong>限制</strong></p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>每月 250 万 vCU</p></td>
   </tr>
   <tr>
     <td><p>Serverless</p></td>
     <td><p>无</p></td>
   </tr>
</table>

### 容量\{#capacity}

<table>
   <tr>
     <th><p><strong>集群部署方式</strong></p></th>
     <th><p><strong>限制</strong></p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>每个集群 5 GB（相当于每个集群可容纳 100 万个 768 维向量）。</p></td>
   </tr>
   <tr>
     <td><p>Serverless</p></td>
     <td><p>Zilliz Cloud Serverless 集群无硬性容量限制。</p></td>
   </tr>
   <tr>
     <td><p>Dedicated</p></td>
     <td><p>Zilliz Cloud Dedicated 集群无硬性容量限制。</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

Dedicated 集群的容量上限会根据您选择的 CU 类型与 CU 大小的不同而发生变化。如果容量不足，可以尝试调整 CU 类型和大小。具体操作步骤，可以参考[集群扩缩容](./scale-cluster)。

</Admonition>

## Database\{#databases}

- 每个 Serving-Dedicated 集群中最多可创建 1024 个 Database。

- 每个 项目中最多可创建 100 个 按需计算的 Database。

- 默认的 Default Database 不可删除。

## Replica\{#replicas}

如需添加 Replica，集群规格需要为 **12 CU 或以上**。此外，Replica 功能还具有以下限制

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
     <td><p>Query CU x Replica 数量</p></td>
     <td><p>20480</p></td>
     <td><p>每个集群的 Query CU x Replica 数量不得超过 20480</p></td>
   </tr>
</table>

## Collection\{#collections}

根据您的集群使用的 CU 数量的不同，每 CU 支持创建最多 1,024 个 Collection 或 4,096 个 Partition。其中，每个 Collection 最多可创建 1,024 个 Partition。您可以参考如下公式计算您的集群中的 Collection 和 Partition 的数量上限。

![RBu3wbDwihqeFgbFZwQcIpXNnUf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RBu3wbDwihqeFgbFZwQcIpXNnUf.png)

- 集群中 Collection 的数量上限应该在 1,024 和集群的 CU 数量之积与 16,384 间取最小值。

- 集群中所有 Collection 中的 Partition 的总数量应该在 4,096 和集群的 CU 数量之积与 65,536 间取最小值。

- 上述条件需同时满足。

<Admonition type="info" icon="📘" title="说明">

对于 **Free** 和 **Serverless** 集群，执行如下限制：

- 单个 **Free** 集群支持最多 **5** 个 Collection。

- 单个 **Serverless** 集群支持最多 **100** 个 Collection。

</Admonition>

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
     <td><ul><li><p>Free & Serverless：4</p></li><li><p>Dedicated：10</p></li></ul></td>
   </tr>
</table>

关于字段的其他限制：

- 某些字段（如 VarChar 或 JSON）使用的内存超出预期，可能导致集群空间耗尽。

### 向量维度\{#dimensions}

向量字段的最大维度数为 32768。

### Shard\{#shards}

Shard 的数量上限取决于集群部署方式和 CU 规格。

<table>
   <tr>
     <th colspan="2"><p><strong>集群部署方式和 CU 规格</strong></p></th>
     <th><p><strong>数量上限</strong></p></th>
   </tr>
   <tr>
     <td colspan="2"><p>Free</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td colspan="2"><p>Serverless</p></td>
     <td><p>2</p></td>
   </tr>
   <tr>
     <td rowspan="4"><p>Dedicated</p></td>
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

### Insert 和 Upsert\{#insert-and-upsert}

速率限制根据集群部署方式和 CU 数量而有所不同。以下表格列出了插入操作的速率限制。

<table>
   <tr>
     <th></th>
     <th><p><strong>Insert 和 Upsert 最大速率限制</strong></p></th>
   </tr>
   <tr>
     <td><p>Free 版集群</p></td>
     <td><p>2 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Serverless 版集群</p></td>
     <td><p>10 MB/s</p></td>
   </tr>
   <tr>
     <td><p>Dedicated 版集群</p></td>
     <td><p>16 MB/s + 1 MB/s × CU</p><p>最高不超过 256 MB/s。</p></td>
   </tr>
</table>

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

不建议您手动执行 Flush 操作。Zilliz Cloud 会自动优雅地处理数据 Flush 操作。

</Admonition>

### Load\{#load}

每个集群的加载请求速率限制为每秒 **20** 个请求。

<Admonition type="info" icon="📘" title="说明">

对于已加载的 Collection，即使有新数据插入，您无需重复执行加载操作。

</Admonition>

### Search\{#search}

每个搜索请求/响应的大小不应超过 **64** MB。

根据集群部署方式，每个搜索请求携带的查询向量（**nq**）上限有所不同：

- Free 和 Serverless 集群：**nq** 不超过 **10**

- Dedicated 集群：**nq** 不超过 **16384**

根据集群部署方式，每个搜索响应返回的 Entity 数量（**topK**）上限有所不同：

- Free 和 Serverless 集群：**topK** 不超过 **1024**

- Dedicated 集群：**topK** 不超过 **16384**

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

<table>
   <tr>
     <th><p>文件类型</p></th>
     <th><p>本地导入</p></th>
     <th><p>对象存储导入</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1 GB</p></td>
     <td><p><strong>Free</strong>: 单次导入总文件大小最大为 1 GB，单个文件大小最大为 1 GB，单次最多导入 1,000 个文件。</p><p><strong>Serverless & Dedicated</strong>: 单次导入总文件大小最大为 1 TB，单个文件大小最大为 10 GB，单次最多导入 1,000 个文件。</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>1 GB</p></td>
     <td><p><strong>Free</strong>: 单次导入总文件大小最大为 1 GB，单个文件大小最大为 1 GB，单次最多导入 1,000 个文件。</p><p><strong>Serverless & Dedicated</strong>: 单次导入总文件大小最大为 1 TB，单个文件大小最大为 10 GB，单次最多导入 1,000 个文件。</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>暂不支持</p></td>
     <td><p><strong>Free</strong>: 单次导入总文件大小最大为 1 GB，单个文件大小最大为 1 GB，单次最多导入 1,000 个文件。</p><p><strong>Serverless & Dedicated</strong>: 单次导入总文件大小最大为 1 TB，单个子文件夹大小最大为 10 GB，单次最多导入 1,000 个子文件夹。</p></td>
   </tr>
</table>

<table>
   <tr>
     <th><p>文件类型</p></th>
     <th><p>本地导入</p></th>
     <th><p>对象存储导入</p></th>
   </tr>
   <tr>
     <td><p>JSON</p></td>
     <td><p>1 GB</p></td>
     <td><p><strong>Free</strong>: 单次导入总文件大小最大为 1 GB，单个文件大小最大为 1 GB，单次最多导入 1,000 个文件。</p><p><strong>Serverless & Dedicated</strong>: 单次导入总文件大小最大为 1 TB，单个文件大小最大为 10 GB，单次最多导入 1,000 个文件。</p></td>
   </tr>
   <tr>
     <td><p>Parquet</p></td>
     <td><p>1 GB</p></td>
     <td><p><strong>Free</strong>: 单次导入总文件大小最大为 1 GB，单个文件大小最大为 1 GB，单次最多导入 1,000 个文件。</p><p><strong>Serverless & Dedicated</strong>: 单次导入总文件大小最大为 1 TB，单个文件大小最大为 10 GB，单次最多导入 1,000 个文件。</p></td>
   </tr>
   <tr>
     <td><p>Numpy</p></td>
     <td><p>暂不支持</p></td>
     <td><p><strong>Free</strong>: 单次导入总文件大小最大为 1 GB，单个文件大小最大为 1 GB，单次最多导入 1,000 个文件。</p><p><strong>Serverless & Dedicated</strong>: 单次导入总文件大小最大为 1 TB，单个子文件夹大小最大为 10 GB，单次最多导入 1,000 个子文件夹。</p></td>
   </tr>
</table>

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
     <td><p>控制台 IP 白名单</p></td>
     <td><p>100</p></td>
     <td><p>控制台 IP 白名单中最多可添加 100 个 IP 地址。</p></td>
   </tr>
   <tr>
     <td><p>集群 IP 白名单</p></td>
     <td><p>100</p></td>
     <td><p>集群 IP 白名单中最多可添加 100 个 IP 地址。</p></td>
   </tr>
</table>

## 迁移\{#migrations}

您可以将数据从其他供应商迁移到您的 Zilliz Cloud 集群，每次迁移的最大集合数量会因您的 Zilliz Cloud 集群订阅计划而异。

<table>
   <tr>
     <th><p>目标集群订阅计划</p></th>
     <th><p>每次迁移支持的最大 Collection 数量</p></th>
   </tr>
   <tr>
     <td><p>Free</p></td>
     <td><p>5</p></td>
   </tr>
   <tr>
     <td><p>Serverless / Dedicated</p></td>
     <td><p>10</p></td>
   </tr>
</table>

