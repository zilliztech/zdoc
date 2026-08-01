---
title: "VectorDB 审计日志参考 | BYOC"
slug: /audit-logs-ref
sidebar_label: "VectorDB 审计日志参考"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 上，审计日志的结构如下所示： | BYOC"
type: origin
token: RNEgwQLoUi4djXkouqQcSbgvnlb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# VectorDB 审计日志参考

在 Zilliz Cloud 上，审计日志的结构如下所示：

```json
{
    "date": "<timestamp>",
    "action": "<action_type>",
    "cluster_id": "<unique_cluster_identifier>",
    "database": "<database_name>",
    "interface": "<interface_type>",
    "log_type": "<log_type>",
    "params": {
        "<key1>": "<value1>",
        "<key2>": "<value2>",
      ...
    },
    "result": <result_code>,
    "status": "<action_status>",
    "time": <timestamp>,
    "trace_id": "<unique_trace_identifier>",
    "user": "<user_identifier>"
}
```

<table>
   <tr>
     <th><p>字段</p></th>
     <th><p>类型</p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p><code>date</code></p></td>
     <td><p>String（ISO 8601 格式）</p></td>
     <td><p>操作发生的时间戳（UTC 时间），例如 <code>"2025-01-21T08:38:39.494527Z"</code>。</p></td>
   </tr>
   <tr>
     <td><p><code>action</code></p></td>
     <td><p>String</p></td>
     <td><p>执行的操作类型（例如 <code>"DescribeCollection"</code>）。可执行的操作列表详见<a href="./audit-logs-ref#list-of-actions">操作列表</a>。</p></td>
   </tr>
   <tr>
     <td><p><code>cluster_id</code></p></td>
     <td><p>String</p></td>
     <td><p>操作发生的集群唯一标识（例如<code>"in01-b5a7e190615xxxf"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>database</code></p></td>
     <td><p>String</p></td>
     <td><p>涉及到的数据库名称（例如 <code>"default"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>interface</code></p></td>
     <td><p>string</p></td>
     <td><p>执行操作所使用的接口类型（例如 <code>"Grpc"</code>, <code>"Restful"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>log_type</code></p></td>
     <td><p>String</p></td>
     <td><p>日志条目的类型（例如 <code>"AUDIT"</code>）。</p></td>
   </tr>
   <tr>
     <td><p><code>params</code></p></td>
     <td><p>Object (key-value pairs)</p></td>
     <td><p>与操作相关的其他参数信息，例如 <code>collection</code>, <code>consistency_level</code> 等。</p></td>
   </tr>
   <tr>
     <td><p><code>result</code></p></td>
     <td><p>Integer</p></td>
     <td><p>操作结果代码或状态码（例如 <code>0</code> 表示成功，其他代码可能表示错误）。当 <code>status</code> 为 <code>Receive</code> 时，该字段不可用。</p></td>
   </tr>
   <tr>
     <td><p><code>status</code></p></td>
     <td><p>String</p></td>
     <td><p>日志记录时操作的状态（例如 <code>Receive</code>、<code>Success</code>、<code>Failed</code>）。</p><ul><li><p><code>Receive</code>：操作已被系统接收但尚未完成。</p></li><li><p><code>Success</code>：操作顺利完成，无任何异常。</p></li><li><p><code>Failed</code>：操作失败。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>time</code></p></td>
     <td><p>Integer (epoch 时间，毫秒)</p></td>
     <td><p>自 1970 年以来的毫秒级时间戳（epoch 时间）。</p></td>
   </tr>
   <tr>
     <td><p><code>trace_id</code></p></td>
     <td><p>String</p></td>
     <td><p>用于跨系统跟踪请求的唯一标识，有助于将相关日志串联起来。</p></td>
   </tr>
   <tr>
     <td><p><code>user</code></p></td>
     <td><p>String</p></td>
     <td><p>执行该操作的用户标识。</p></td>
   </tr>
</table>

## 操作列表\{#list-of-actions}

以下表格汇总了在数据平面上可被审计记录的操作。

### Connection\{#connection}

| `action` | 描述 |
| --- | --- |
| Connect | 建立连接 |

### Database\{#database}

| `action` | 描述 |
| --- | --- |
| ListDatabases | 查看当前实例中的所有 Database |
| DescribeDatabase | 查看某个 Database 的详细信息 |
| CreateDatabase | 创建 Database |
| DropDatabase | 删除 Database |
| AlterDatabase | 修改 Database 的属性 |

### Collection\{#collection}

| `action` | 描述 |
| --- | --- |
| GetLoadState | 查看 Collection 的加载状态 |
| GetLoadingProgress | 检查 Collection 的加载进度 |
| DescribeCollection | 查看 Collection 的详细信息 |
| CreateCollection | 创建 Collection |
| HasCollection | 检查数据库中是否存在某个 Collection |
| DropCollection | 删除 Collection |
| LoadCollection | 加载 Collection |
| AlterCollection | 修改 Collection 的 Schema 或其他配置 |
| ShowCollections | 查看权限内的所有 Collection |
| RenameCollection | 重命名 Collection |
| ReleaseCollection | 释放 Collection |
| GetCollectionStatistics | 获取 Collection 的统计信息（例如 Collection 中 Entity 数量） |
| Flush | 将 Collection 中的所有 Entity 持久化至 Sealed Segment。任何在 Flush 操作之后插入的 Entity 都会存储到新的 Segment 中。 |
| GetFlushState | 检查 Collection Flush 操作的状态 |
| CreateAlias | 为 Collection 创建别名 |
| DescribeAlias | 查看 Collection 的别名信息 |
| AlterAlias | 修改 Collection 所关联的别名 |
| ListAliases | 查看 Collection 的所有别名 |
| DropAlias | 删除 Collection 的别名 |
| GetReplicas | 获取 Collection 的 Replica 信息 |

### Partition\{#partition}

| `action` | 描述 |
| --- | --- |
| CreatePartition | 创建 Partition |
| HasPartition | 检查 Partition 是否存在 |
| LoadPartitions | 加载一个或多个 Partition |
| ShowPartitions | 查看 Collection 中的所有 Partition |
| DropPartition | 删除 Partition |
| ReleasePartitions | 释放一个或多个 Partition |
| GetPartitionStatistics | 获取 Partition 的统计信息 |

### 索引\{#index}

| `action` | 描述 |
| --- | --- |
| CreateIndex | 创建索引 |
| DescribeIndex | 查看 Collection 的索引构建进度 |
| AlterIndex | 更新现有索引的配置或参数 |
| GetIndexState | 获取现有索引的配置或参数 |
| GetIndexStatistics | 检索索引的当前状态（例如 `building`、`built`、`failed` 等） |
| GetIndexBuildProgress | 获取索引的详细统计信息（如内存使用情况、已索引的 Entity 数量等） |
| DropIndex | 获取集合中某个特定 Segment 的详细索引数据 |

### Entity\{#entity}

| `action` | 描述 |
| --- | --- |
| Insert | 插入 Entity |
| Query | 执行标量查询 |
| Search | 执行向量搜索 |
| HybridSearch | 执行 Hybrid Search |
| Delete | 删除 Entity |
| Upsert | Upsert Entity |

### RBAC\{#rbac}

| `action` | 描述 |
| --- | --- |
| SelectRole | 获取当前实例中的角色列表 |
| CreateRole | 定义新角色以管理用户权限 |
| DropRole | 删除角色 |
| OperateUserRole | 将角色分配给用户或从用户移除角色 |
| ListPrivilegeGroups | 查看当前实例中的所有权限组 |
| OperatePrivilegeV2 | 向某个权限组添加或移除特定权限 |
| SelectGrant | 获取分配给特定角色或用户的所有权限授予列表 |
| CreateCredential | 创建新凭证（例如 API 密钥或令牌）以访问系统 |
| UpdateCredential | 更新现有凭证的属性或权限 |
| DeleteCredential | 从系统中移除凭证 |
| ListCredUsers | 获取与特定凭证相关联的所有用户列表 |

### 其他\{#others}

| `action` | 描述 |
| --- | --- |
| Authorize | 仅在授权失败时记录此操作，`status`会记录为 `Refused`。 |

