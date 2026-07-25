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
sidebar_position: 2
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 审计
  - 日志
  - 参考

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

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>Connect</p></td>
     <td><p>建立连接</p></td>
   </tr>
</table>

### Database\{#database}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>查看当前实例中的所有 Database</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>查看某个 Database 的详细信息</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>创建 Database</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>删除 Database</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>修改 Database 的属性</p></td>
   </tr>
</table>

### Collection\{#collection}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>查看 Collection 的加载状态</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>检查 Collection 的加载进度</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>查看 Collection 的详细信息</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>创建 Collection</p></td>
   </tr>
   <tr>
     <td><p>HasCollection</p></td>
     <td><p>检查数据库中是否存在某个 Collection</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>删除 Collection</p></td>
   </tr>
   <tr>
     <td><p>LoadCollection</p></td>
     <td><p>加载 Collection</p></td>
   </tr>
   <tr>
     <td><p>AlterCollection</p></td>
     <td><p>修改 Collection 的 Schema 或其他配置</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>查看权限内的所有 Collection</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>重命名 Collection</p></td>
   </tr>
   <tr>
     <td><p>ReleaseCollection</p></td>
     <td><p>释放 Collection</p></td>
   </tr>
   <tr>
     <td><p>GetCollectionStatistics</p></td>
     <td><p>获取 Collection 的统计信息（例如 Collection 中 Entity 数量）</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>将 Collection 中的所有 Entity 持久化至 Sealed Segment。任何在 Flush 操作之后插入的 Entity 都会存储到新的 Segment 中。</p></td>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>检查 Collection Flush 操作的状态</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>为 Collection 创建别名</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>查看 Collection 的别名信息</p></td>
   </tr>
   <tr>
     <td><p>AlterAlias</p></td>
     <td><p>修改 Collection 所关联的别名</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>查看 Collection 的所有别名</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>删除 Collection 的别名</p></td>
   </tr>
   <tr>
     <td><p>GetReplicas</p></td>
     <td><p>获取 Collection 的 Replica 信息</p></td>
   </tr>
</table>

### Partition\{#partition}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>创建 Partition</p></td>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>检查 Partition 是否存在</p></td>
   </tr>
   <tr>
     <td><p>LoadPartitions</p></td>
     <td><p>加载一个或多个 Partition</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>查看 Collection 中的所有 Partition</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>删除 Partition</p></td>
   </tr>
   <tr>
     <td><p>ReleasePartitions</p></td>
     <td><p>释放一个或多个 Partition</p></td>
   </tr>
   <tr>
     <td><p>GetPartitionStatistics</p></td>
     <td><p>获取 Partition 的统计信息</p></td>
   </tr>
</table>

### 索引\{#index}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>创建索引</p></td>
   </tr>
   <tr>
     <td><p>DescribeIndex</p></td>
     <td><p>查看 Collection 的索引构建进度</p></td>
   </tr>
   <tr>
     <td><p>AlterIndex</p></td>
     <td><p>更新现有索引的配置或参数</p></td>
   </tr>
   <tr>
     <td><p>GetIndexState</p></td>
     <td><p>获取现有索引的配置或参数</p></td>
   </tr>
   <tr>
     <td><p>GetIndexStatistics</p></td>
     <td><p>检索索引的当前状态（例如 <code>building</code>、<code>built</code>、<code>failed</code> 等）</p></td>
   </tr>
   <tr>
     <td><p>GetIndexBuildProgress</p></td>
     <td><p>获取索引的详细统计信息（如内存使用情况、已索引的 Entity 数量等）</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>获取集合中某个特定 Segment 的详细索引数据</p></td>
   </tr>
</table>

### Entity\{#entity}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>插入 Entity</p></td>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>执行标量查询</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>执行向量搜索</p></td>
   </tr>
   <tr>
     <td><p>HybridSearch</p></td>
     <td><p>执行 Hybrid Search</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>删除 Entity</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>Upsert Entity</p></td>
   </tr>
</table>

### RBAC\{#rbac}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>SelectRole</p></td>
     <td><p>获取当前实例中的角色列表</p></td>
   </tr>
   <tr>
     <td><p>CreateRole</p></td>
     <td><p>定义新角色以管理用户权限</p></td>
   </tr>
   <tr>
     <td><p>DropRole</p></td>
     <td><p>删除角色</p></td>
   </tr>
   <tr>
     <td><p>OperateUserRole</p></td>
     <td><p>将角色分配给用户或从用户移除角色</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>查看当前实例中的所有权限组</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeV2</p></td>
     <td><p>向某个权限组添加或移除特定权限</p></td>
   </tr>
   <tr>
     <td><p>SelectGrant</p></td>
     <td><p>获取分配给特定角色或用户的所有权限授予列表</p></td>
   </tr>
   <tr>
     <td><p>CreateCredential</p></td>
     <td><p>创建新凭证（例如 API 密钥或令牌）以访问系统</p></td>
   </tr>
   <tr>
     <td><p>UpdateCredential</p></td>
     <td><p>更新现有凭证的属性或权限</p></td>
   </tr>
   <tr>
     <td><p>DeleteCredential</p></td>
     <td><p>从系统中移除凭证</p></td>
   </tr>
   <tr>
     <td><p>ListCredUsers</p></td>
     <td><p>获取与特定凭证相关联的所有用户列表</p></td>
   </tr>
</table>

### 其他\{#others}

<table>
   <tr>
     <th><p><code>action</code></p></th>
     <th><p>描述</p></th>
   </tr>
   <tr>
     <td><p>Authorize</p></td>
     <td><p>仅在授权失败时记录此操作，<code>status</code>会记录为 <code>Refused</code>。</p></td>
   </tr>
</table>

