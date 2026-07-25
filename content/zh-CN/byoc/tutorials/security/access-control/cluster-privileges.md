---
title: "权限与权限组 | BYOC"
slug: /cluster-privileges
sidebar_label: "权限与权限组"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "权限指的是对 Zilliz Cloud 资源（如集群、Database 和 Collection）进行特定操作的权限。权限被分配给角色，然后将角色授权给用户，用户就可以在资源上根据权限执行的操作。例如，权限可以是允许将数据插入名为 `collection01` 的集合的权限。 | BYOC"
type: origin
token: PTadwccZmiQ6PpkcQYtcH9OAnSe
sidebar_position: 6
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 安全
  - 访问控制
  - permissions

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 权限与权限组

**权限**指的是对 Zilliz Cloud 资源（如集群、Database 和 Collection）进行特定操作的权限。权限被分配给角色，然后将角色授权给用户，用户就可以在资源上根据权限执行的操作。例如，权限可以是允许将数据插入名为 `collection_01` 的集合的权限。

**权限组**是多个单一权限的组合。您可以创建一个包含常用权限的权限组，以简化角色授予过程。为了方便您使用，Zilliz Cloud 在 Collection、Database 和集群级别提供了共 9 个内置权限组。

下图展示了权限和权限组的授权过程间差异。

![T21Pwj7Q6hlWaNbvt2SctI3rnYf](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/T21Pwj7Q6hlWaNbvt2SctI3rnYf.png)

本文详细介绍了 Zilliz Cloud 中可用的内置权限组和权限。

## 权限组\{#privilege-group}

### 内置权限组\{#built-in-privilege-groups}

您可以在[创建角色](./cluster-roles)时选择为角色分配内置权限组。Zilliz Cloud 在集群、Database、Collection 层级共提供 9 个不同的内置权限组。

<Admonition type="info" icon="📘" title="说明">

<p>上述三个层级的内置权限组之间没有级联关系。设置实例层级的权限组并不会自动设置该实例下所有 Database 和 Collection 的权限，Database 和 Collection 层级的权限需要单独手动设置。</p>

</Admonition>

#### Collection 层级权限组\{#collection-level-privilege-groups}

- **CollectionReadOnly（COLL_RO）**：包含读取 Collection 数据的权限

- **CollectionReadWrite（COLL_RW）**：包含读写 Collection 数据的权限

- **CollectionAdmin（COLL_ADMIN）**：包含 Collection 读写和管理等所有 Collection 层级操作的权限

下表详细罗列了 Collection 层级的三个内置权限组所包含的具体权限：

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>CollectionReadOnly</strong></p></th>
     <th><p><strong>CollectionReadWrite</strong></p></th>
     <th><p><strong>CollectionAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>AddCollectionField</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

#### Database 层级权限组\{#database-level-privilege-groups}

- **DatabaseReadOnly（DB_RO）**：包含读取 Database 数据的权限

- **DatabaseReadWrite（DB_RW）**：包含读写 Database 数据的权限

- **DatabaseAdmin（DB_Admin）**：包含 Database 读写和管理等所有 Database 层级操作的权限

下表详细罗列了 Database 层级的三个内置权限组所包含的具体权限：

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>DatabaseReadOnly</strong></p></th>
     <th><p><strong>DatabaseReadWrite</strong></p></th>
     <th><p><strong>DatabaseAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

#### 集群层级权限组\{#cluster-level-privilege-groups}

- **ClusterReadOnly（Cluster_RO）**：包含读取实例数据的权限

- **ClusterReadWrite（Cluster_RW）**：包含读写实例数据的权限

- **ClusterAdmin（Cluster_Admin）**：包含实例读写和管理等所有实例层级操作的权限

下表详细罗列了集群层级的三个内置权限组所包含的具体权限：

<table>
   <tr>
     <th><p>权限</p></th>
     <th><p><strong>ClusterReadOnly</strong></p></th>
     <th><p><strong>ClusterReadWrite</strong></p></th>
     <th><p><strong>ClusterAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnership</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

### 自定义权限组\{#custom-privilege-group}

如果内置权限组无法满足您的需求，您可以使用 SDK 创建自定义权限组，并将所需权限添加到这些权限组中。

<Admonition type="info" icon="📘" title="说明">

<p>如需创建和管理自定义权限组，请<a href="http://support.zilliz.com.cn">提交工单</a>，我们将为您启用此功能。</p>

</Admonition>

#### 创建自定义权限组\{#create-a-custom-privilege-group}

以下示例展示了如何创建一个名为 `privilege_group_1` 的权限组。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.create_privilege_group(group_name='privilege_group_1'）
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

err = client.CreatePrivilegeGroup(ctx, milvusclient.NewCreatePrivilegeGroupOption("privilege_group_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.CreatePrivilegeGroupReq;

client.createPrivilegeGroup(CreatePrivilegeGroupReq.builder()
        .groupName("privilege_group_1")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.createPrivilegeGroup({
  group_name: 'privilege_group_1',
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/privilege_groups/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "privilegeGroupName":"privilege_group_1"
}'
```

</TabItem>
</Tabs>

自定义权限组创建完成后，您可以向该权限组添加权限。

#### 向自定义权限组添加权限\{#add-privileges-to-a-custom-privilege-group}

以下示例展示了如何将权限 `PrivilegeBackupRBAC` 和 `PrivilegeRestoreRBAC` 添加到刚创建的权限组 `privilege_group_1` 中。有关 Zilliz Cloud 中可用的所有权限的详细信息，请参考[所有权限](./cluster-privileges#all-privileges)。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.add_privileges_to_group(group_name='privilege_group_1', privileges=['Query', 'Search'])
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

privileges := []string{"Query", "Search"}
err = client.AddPrivilegesToGroup(ctx, milvusclient.NewAddPrivilegesToGroupOption("privilege_group_1", privileges...))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.AddPrivilegesToGroupReq;

client.addPrivilegesToGroup(AddPrivilegesToGroupReq.builder()
        .groupName("privilege_group_1")
        .privileges(Arrays.asList("Query", "Search"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.addPrivilegesToGroup({
  group_name: privilege_group_1,
  privileges: ['Query', 'Search'],
});

```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/privilege_groups/add_privileges_to_group" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "privilegeGroupName":"privilege_group_1",
    "privileges":["Query", "Search"]
}'
```

</TabItem>
</Tabs>

在将权限添加到权限组后，您可以将该权限组授予某个角色。更多详情请参考[管理集群角色（SDK）](./cluster-roles-sdk)。

#### **从自定义权限组中移除权限**\{#remove-privileges-from-a-custom-privilege-group}

以下示例展示了如何从权限组 `privilege_group_1` 中移除权限 `PrivilegeRestoreRBAC`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.remove_privileges_from_group(group_name='privilege_group_1', privileges='Search')
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

err = client.RemovePrivilegesFromGroup(ctx, milvusclient.NewRemovePrivilegesFromGroupOption("privilege_group_1", []string{"Search"}...))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.RemovePrivilegesFromGroupReq;

client.removePrivilegesFromGroup(RemovePrivilegesFromGroupReq.builder()
        .groupName("privilege_group_1")
        .privileges(Collections.singletonList("Search"))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.removePrivilegesFromGroup({
  group_name: "privilege_group_1",
  privileges: ["Search"],
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/privilege_groups/remove_privileges_from_group" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "privilegeGroupName":"privilege_group_1",
    "privileges":["Search"]
}'
```

</TabItem>
</Tabs>

#### 查看权限组\{#list-privilege-groups}

以下示例展示了如何查看当前所有权限组。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.list_privilege_groups()
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

groups, err := client.ListPrivilegeGroups(ctx, milvusclient.NewListPrivilegeGroupsOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.PrivilegeGroup;
import io.milvus.v2.service.rbac.request.ListPrivilegeGroupsReq;
import io.milvus.v2.service.rbac.response.ListPrivilegeGroupsResp;

ListPrivilegeGroupsResp resp = client.listPrivilegeGroups(ListPrivilegeGroupsReq.builder()
        .build());
List<PrivilegeGroup> groups = resp.getPrivilegeGroups();
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.listPrivilegeGroups();
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/privilege_groups/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

以下为示例返回结果。

```bash
PrivilegeGroupItem: <privilege_group:privilege_group_1>, <privileges:('Search', 'Query')>
```

#### 删除自定义权限组\{#drop-a-custom-privilege-group}

以下示例展示了如何删除权限组`privilege_group_1`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.drop_privilege_group(group_name='privilege_group_1')
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

err = client.DropPrivilegeGroup(ctx, milvusclient.NewDropPrivilegeGroupOption("privilege_group_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.DropPrivilegeGroupReq;

client.dropPrivilegeGroup(DropPrivilegeGroupReq.builder()
        .groupName("privilege_group_1")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.dropPrivilegeGroup({group_name: 'privilege_group_1'});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/privilege_groups/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "privilegeGroupName":"privilege_group_1"
}'
```

</TabItem>
</Tabs>

## 所有权限\{#all-privileges}

以下为 Zilliz Cloud 上所有可以分配给角色的权限。

如需自行组合以下权限创建权限组，或将特定权限授予自定义角色，请[联系我们](http://support.zilliz.com.cn)。

### Database 权限\{#database-privileges}

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>查看当前实例下的所有 Database</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>查看 Database 详情</p></td>
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
     <td><p>修改 Database 属性</p></td>
   </tr>
</table>

### Collection 权限\{#collection-privileges}

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>查看 Collection Flush 状态</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>查看 Collection 加载状态</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>查看 Collection 加载进度</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>查看具有 Collection 权限的所有 Collection</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>查看 Collection 的所有 Alias</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>查看 Collection 详情</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>查看 Alias 详情</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>获取 Collection 统计信息（例如 Collection 中的 Entity 数量）</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>创建 Collection</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>删除 Collection</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>加载 Collection</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>释放 Collection</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>将 Collection 中 Entity 持久化到 Sealed Segment，执行 Flush 操作后，任何插入操作都会生成新的 Segment</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>手动触发 Compaction</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>重命名 Collection</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>创建 Collection Alias</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>删除 Collection Alias</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>对 Database 下所有 Collection 进行 Flush</p></td>
   </tr>
   <tr>
     <td><p>AddCollectionField</p></td>
     <td><p>向 Collection 添加字段。</p></td>
   </tr>
</table>

### Partition 权限\{#partition-privileges}

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>查看 Partition 是否存在</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>查看 Collection 下所有 Partition</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>创建 Partition</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>删除 Partition</p></td>
   </tr>
</table>

### Index 权限\{#index-privileges}

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>查看索引详情</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>创建索引</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>删除索引</p></td>
   </tr>
</table>

### 资源管理权限\{#resource-management-privileges}

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>负载均衡</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>创建资源组</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>删除资源组</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>更新资源组</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>查看资源组详情</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>查看当前实例下的所有资源组</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>转移 Node</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>转移 Replica</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>备份当前实例中所有RBAC 操作</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>恢复当前实例中所有RBAC 操作的备份</p></td>
   </tr>
</table>

### Entity 权限\{#entity-privileges}

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>查询</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>搜索</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>插入 Entity</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>删除 Entity</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>Upsert Entity</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>批量导入数据</p></td>
   </tr>
</table>

### RBAC 权限\{#rbac-privileges}

<table>
   <tr>
     <th><p><strong>权限</strong></p></th>
     <th><p><strong>描述</strong></p></th>
   </tr>
   <tr>
     <td><p>CreateOwnership</p></td>
     <td><p>创建用户或角色</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>更新用户密码</p></td>
   </tr>
   <tr>
     <td><p>DropOwnership</p></td>
     <td><p>删除用户密码或角色</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnership</p></td>
     <td><p>列出绑定角色用户或授权实体</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnership</p></td>
     <td><p>管理用户与角色或授权操作</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>列出用户所有绑定角色</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>创建权限组</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>删除权限组</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>列出权限组权限</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>权限组增加或删除权限</p></td>
   </tr>
</table>

