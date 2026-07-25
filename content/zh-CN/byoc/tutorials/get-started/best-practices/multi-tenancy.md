---
title: "多租户策略 | BYOC"
slug: /multi-tenancy
sidebar_label: "多租户策略"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，多租户（multi-tenancy）指多个客户或团队（即租户）共享同一个集群，同时保持各自数据环境的隔离。 | BYOC"
type: origin
token: H996wdrf3iU9vjkAARzcnA5enId
sidebar_position: 1
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 多租

---

import Admonition from '@theme/Admonition';


# 多租户策略

在 Zilliz Cloud 中，多租户（multi-tenancy）指多个客户或团队（即租户）共享同一个集群，同时保持各自数据环境的隔离。

Zilliz Cloud 支持 4 种多租户策略，每种策略在可扩展性、数据隔离性和灵活性之间具有不同的权衡。本文将逐一介绍这些策略，帮助您为具体使用场景选择最合适的方案。

## 多租户策略\{#multi-tenancy-strategies}

Zilliz Cloud 支持以下四个级别的多租户策略：Database 级别、Collection 级别、 Partition 级别和 Partition-key 级别。

### Database 级别多租户\{#database-level-multi-tenancy}

在 Database 级别的多租户模式中，每个租户对应一个独立的 [Database](./database)，各个 Database 中可以包含一个或多个 Collection。

![ICyhwNeJChn7HpbThtMcimjmnqf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/ICyhwNeJChn7HpbThtMcimjmnqf.png)

- **可扩展性**：仅 Dedicated 集群支持 Database 级别的多租户策略。最多可支持 1,024 个租户。

- **数据隔离**：每个数据库之间完全隔离，提供企业级的数据隔离能力，适用于合规性要求严格的场景。

- **灵活性**：不同数据库中的 Collection 可以拥有各自的数据 Schema，支持高度灵活的数据组织。

- **其他**：支持 RBAC，可对每个租户的用户访问权限进行精细控制。您还可以按需加载或释放某个租户的数据，实现冷热数据分层管理。

### Collection 级别多租户\{#collection-level-multi-tenancy}

在 Collection 级别的多租户模式中，每个租户对应一个 [Collection](./collection)，数据隔离性强。

![RWcowcrWihDa0ebNFu9cY7rhn0e](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/RWcowcrWihDa0ebNFu9cY7rhn0e.png)

- **可扩展性**：一个集群最多支持 16,384 个 collections，即最多支持 16,384 个租户。

- **数据隔离**：Collections 在物理层面相互隔离，具备良好的数据隔离能力。

- **灵活性**：每个 Collection 可以拥有自己的数据 Schema，适配不同租户的数据需求。

- **其他**：支持 RBAC，可对每个租户的访问权限进行精细管理。支持按租户加载或释放数据，实现冷热数据管理。

### Partition 级别多租户\{#partition-level-multi-tenancy}

在 Partition 级别的多租户模式中，所有租户共享同一个 Collection，但每个租户分配一个手动创建的 [Partition](./manage-partitions)。

![BtxawK5amh1CGxbrfDacC0swnHc](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/BtxawK5amh1CGxbrfDacC0swnHc.png)

**可扩展性**：一个 Collection 最多支持 1,024 个 Partition，即支持 1,024 个租户。

**数据隔离**：每个租户的数据在物理上由 Partition 隔离。

**灵活性**：所有租户必须共享同样的数据 Schema，且需要手动创建 Partition。

**其他**：该级别不支持 RBAC。支持对单个或多个 Partition 进行查询，适用于需要跨租户聚合查询或分析的场景。同时支持按租户加载或释放数据，实现冷热数据管理。

### 分区键级多租户\{#partition-key-level-multi-tenancy}

在 Partition key 级别的策略下，所有租户共享同一个 Collection 和 schema，但系统会根据 [Partition key](./use-partition-key) 的值自动将数据分配到 16 个自动创建的 Partition 中。虽然单个 Partition 中可能包含多个租户，但各租户数据在逻辑上是相互隔离的。

![Ls93wrcsZhRlnbbT51ocBEoxnng](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/Ls93wrcsZhRlnbbT51ocBEoxnng.png)

- **可扩展性**：该策略具有最强的扩展能力，可支持百万级租户。

- **数据隔离**：数据隔离能力相对较弱，因为多个租户可能共享一个物理分区。

- **灵活性**：所有租户必须使用相同的数据 Schema，灵活性受限。

- **其他**：该级别不支持 RBAC。支持对单个或多个 Partition 进行查询，适用于跨租户聚合分析等场景。

## 选择合适的多租户策略\{#choosing-the-right-multi-tenancy-strategy}

下表提供了四种多租户策略的详细对比。

<table>
   <tr>
     <th></th>
     <th><p><strong>Database 级别</strong></p></th>
     <th><p><strong>Collection 级别</strong></p></th>
     <th><p><strong>Partition 级别</strong></p></th>
     <th><p><strong>Partition key 级别</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>支持的集群部署方式</strong></p></td>
     <td><p>仅 Dedicated 集群支持</p></td>
     <td><p>所有部署方式</p></td>
     <td><p>所有部署方式</p></td>
     <td><p>所有部署方式</p></td>
   </tr>
   <tr>
     <td><p><strong>数据隔离</strong></p></td>
     <td><p>物理隔离</p></td>
     <td><p>物理隔离</p></td>
     <td><p>物理隔离</p></td>
     <td><p>物理隔离 + 逻辑隔离</p></td>
   </tr>
   <tr>
     <td><p><strong>最多可支持的租户数量</strong></p></td>
     <td><p>1024</p></td>
     <td><p>受集群部署方式和项目版本影响，最多 16,384。详见<a href="./limits#collections">使用限制</a>。</p></td>
     <td><p>受集群部署方式和项目版本影响，每个 Collection 中最多 1,024。详见<a href="./limits#collections">使用限制</a>。</p></td>
     <td><p>百万</p></td>
   </tr>
   <tr>
     <td><p><strong>数据 Schema 灵活性</strong></p></td>
     <td><p>高</p></td>
     <td><p>中</p></td>
     <td><p>低</p></td>
     <td><p>低</p></td>
   </tr>
   <tr>
     <td><p><strong>是否支持 RBAC</strong></p></td>
     <td><p>是</p></td>
     <td><p>是</p></td>
     <td><p>否</p></td>
     <td><p>否</p></td>
   </tr>
   <tr>
     <td><p><strong>搜索性能</strong></p></td>
     <td><p>高</p></td>
     <td><p>高</p></td>
     <td><p>中</p></td>
     <td><p>中</p></td>
   </tr>
   <tr>
     <td><p><strong>是否支持跨租户搜索</strong></p></td>
     <td><p>否</p></td>
     <td><p>否</p></td>
     <td><p>是</p></td>
     <td><p>是</p></td>
   </tr>
   <tr>
     <td><p><strong>是否支持冷热数据分层管理</strong></p></td>
     <td><p>是</p></td>
     <td><p>是</p></td>
     <td><p>是</p></td>
     <td><p>否</p><p>当前 Partition key 级别的多组策略暂不支持。如果您的租户数量极大且需要分层管理冷热数据，请<a href="https://zilliz.com.cn/contact-sales">联系我们</a>。</p></td>
   </tr>
</table>

在 Zilliz Cloud 中选择多租户策略时，建议综合考虑以下因素：

1. **可扩展性**：Partition Key > Partition > Collection > Database
 如果您需要支持数量极大的租户（如百万级以上），建议选择 Partition key 级别的策略。

1. **强数据隔离需求**：Database = Collection > Partition > Partition key
 如果租户间的数据必须物理隔离，建议选择 Database、Collection 或 Partition 级别的策略。

1. **数据灵活性（不同租户的数据 Schema 不同）**：Database > Collection > Partition = Partition key
 Database 和 Collection 级别的策略允许每个租户拥有不同的数据 Schema，更适合数据结构差异大的场景。

1. **其他因素**：

    - **性能**：检索性能受索引、检索参数和机器配置等多种因素影响，Zilliz Cloud 支持性能调优。建议在选择策略前进行实际性能测试。

    - **冷热数据管理**：目前，Database、Collection 和 Partition 级别的策略都支持冷热数据分层管理。若您计划使用 Partition key 级别的策略但有冷热数据处理需求，请[联系我们](https://zilliz.com.cn/contact-sales)。

    - **跨租户查询**：仅 Partition 和 Partition key 级别的策略支持跨租户查询操作。

