---
title: "Database | Cloud"
slug: /database-concept
sidebar_label: "Database"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Database 是项目内 Collection 的逻辑容器。 | Cloud"
type: origin
token: HOk4wsRngiiDEVkMuF4c4487nxb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Database

Database 是项目内 Collection 的逻辑容器。

Zilliz Cloud 支持两种类型的 Database，具体取决于其托管和访问方式。

## Serving 集群中的 Database\{#database-in-serving-cluster}

Cluster database 是指在特定的 Serving Cluster 中创建的一类 Database。当创建 Serving Cluster 时，系统会随之自动创建一个默认的 Cluster database。您也可以根据需要，在同一个 Serving Cluster 中创建额外的 Cluster database。

Cluster database 可通过 Serving Cluster 端点完整支持所有操作，包括 DDL、DML（insert、upsert、delete）和 DQL（search、query）。

Cluster database 的生命周期与其所属的 Serving Cluster 绑定：

- 如果 Serving Cluster 被挂起，其中所有 Cluster database 及其 Collection 都将不可用，直到该集群恢复。

- 如果 Serving Cluster 被删除，其中所有 Cluster database 和 Collection 也会一并删除。

Cluster database 适用于需要始终在线、低延迟访问数据的生产工作负载。

下图展示了项目、Serving Cluster、Database 和 Collection 之间的组织关系。

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

除了 Cluster database 之外，还有另一种项目级别的 Database，它不绑定到任何特定集群。此类 Database 由平台管理，您无需为其预配置或维护集群。您可以指定按需计算资源，对这类 Database 中的数据执行 query 和 search。

这种类型的 Database 支持以下操作：

| **操作** | **是否支持** |
| --- | --- |
| 创建/删除 Database | 是 |
| 创建/删除 Collection | 是 |
| 加载/释放 Collection | 无需操作 |
| Search, query | 是 |
| Import | 是 |
| Insert, upsert, delete | 否 |

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

|  | **Serving 集群中的 Database** | **按需计算中的 Database** |
| --- | --- | --- |
| 使用场景 | 需要始终在线、低延迟访问数据的生产工作负载 | 具有爆发式 search 和 query 需求的大规模数据集 |
| 托管位置 | 用户创建的 Serving 集群 | 平台托管 |
| 计算资源 | 由所属 Serving Cluster 提供 | 由指定的按需集群提供 |
| Insert/upsert/delete | 支持 | 不支持 |
| Import/Truncate | 支持 | 支持 |
| Search and query | 支持 | 支持 |
| 生命周期 | 与 Serving Cluster 绑定 | 独立于任何集群 |

