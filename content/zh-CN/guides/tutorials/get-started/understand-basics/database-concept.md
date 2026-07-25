---
title: "Database 概述 | Cloud"
slug: /database-concept
sidebar_key: database-concept
sidebar_label: "Database 概述"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Database 是项目内 Collection 的逻辑容器。 | Cloud"
type: origin
token: XPdKwXBQyiw4BTk1nhNc3HKMnfg
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - cloud
  - database

---

import Admonition from '@theme/Admonition';


# Database 概述

Database 是项目内 Collection 的逻辑容器。

Zilliz Cloud 支持两种类型的 Database，具体取决于其托管和访问方式。

## Serving 集群中的 Database\{#database-in-serving-cluster}

这一类 Database 是指在特定的 Serving 集群中创建的 Database。当创建 Serving 集群时，系统会随之自动创建一个默认的 Default database。您也可以根据需要，在同一个 Serving 集群中创建额外的 database。

这一类 Database 可通过 Serving 集群 Endpoint 完成所有操作，包括 DDL、DML（Insert、Upsert、Delete）和 DQL（Search、Query）。

 Serving 集群中的 Database 的生命周期与其所属的 Serving 集群绑定：

- 如果 Serving 集群被挂起，其中所有 Database 及其 Collection 都将不可用，直到该集群恢复。

- 如果 Serving 集群被删除，其中所有 Database 和 Collection 也会一并删除。

此类 Database 适用于需要始终在线、低延迟访问数据的生产工作负载。

下图展示了项目、Serving 集群、Database 和 Collection 之间的组织关系。

```plaintext
  项目
     └── Serving 集群
          ├──  Database (default)
          │    ├── Collection_01
          │    └── Collection_02
          │
          └──  Database
               ├── Collection_03
               └── Collection_04
```

## 按需计算中的 Database\{#database-in-on-demand-compute}

除了 Serving 集群中的 Database 之外，还有另一种项目级别的 Database，它不绑定到任何特定集群。此类 Database 由平台管理，您无需为其预配置或维护集群。您可以指定按需计算资源，对这类 Database 中的数据执行 Query 和 Search。

这种类型的 Database 支持以下操作：

<table>
   <tr>
     <th><p><strong>操作</strong></p></th>
     <th><p><strong>是否支持</strong></p></th>
   </tr>
   <tr>
     <td><p>创建/删除 Database</p></td>
     <td><p>是</p></td>
   </tr>
   <tr>
     <td><p>创建/删除 Collection</p></td>
     <td><p>是</p></td>
   </tr>
   <tr>
     <td><p>加载/释放 Collection</p></td>
     <td><p>无需操作</p></td>
   </tr>
   <tr>
     <td><p>Search, Query</p></td>
     <td><p>是</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>是</p><p>（Import 仅适用于按需计算 Database 中的 Managed Collection。详情请参见 <a href="./external-collection-limits">External Collection 限制</a>。）</p></td>
   </tr>
   <tr>
     <td><p>Insert, Upsert, Delete</p></td>
     <td><p>否</p></td>
   </tr>
</table>

 这种类型的 Database 适用于查询频率较低的大规模数据集。

```plaintext
项目
 ├── Serving 集群 
 │    └── Database (default)
 │         ├── Collection_01 
 │         └── Collection_02                                                                                                                                                            
 │                                 
 └── 按需计算 Database 
      ├── External_Collection_01     
      └── External_Collection_02
```

## 对比\{#comparison}

下表对这两种 Database 类型进行了比较。

<table>
   <tr>
     <th></th>
     <th><p><strong>Serving 集群中的 Database</strong></p></th>
     <th><p><strong>按需计算中的 Database</strong></p></th>
   </tr>
   <tr>
     <td><p>使用场景</p></td>
     <td><p>需要始终在线、低延迟访问数据的生产工作负载</p></td>
     <td><p>具有爆发式 Search 和 Query 需求的大规模数据集</p></td>
   </tr>
   <tr>
     <td><p>托管位置</p></td>
     <td><p>用户创建的 Serving 集群</p></td>
     <td><p>平台托管</p></td>
   </tr>
   <tr>
     <td><p>计算资源</p></td>
     <td><p>由所属 Serving 集群提供</p></td>
     <td><p>由指定的按需计算集群提供</p></td>
   </tr>
   <tr>
     <td><p>Insert/Upsert/Delete</p></td>
     <td><p>支持</p></td>
     <td><p>不支持</p></td>
   </tr>
   <tr>
     <td><p>Import/Truncate</p></td>
     <td><p>支持</p></td>
     <td><p>支持</p></td>
   </tr>
   <tr>
     <td><p>Search 和 Query</p></td>
     <td><p>支持</p></td>
     <td><p>支持</p></td>
   </tr>
   <tr>
     <td><p>生命周期</p></td>
     <td><p>与 Serving 集群绑定</p></td>
     <td><p>独立于任何集群</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="说明">

请使用不同的 Endpoint 连接两种不同类型的 Database。详情请参见访问端点。

</Admonition>

