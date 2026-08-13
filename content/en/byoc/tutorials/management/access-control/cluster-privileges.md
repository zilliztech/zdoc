---
title: "Privileges & Privilege Groups | BYOC"
slug: /cluster-privileges
sidebar_label: "Privileges & Privilege Groups"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A privilege refers to the permission of specific operations on certain Zilliz Cloud resources such as clusters, databases, and collections. Privileges are assigned to roles, which are then granted to users, defining the operations users can perform on the resources. An example of a privilege could be the permission to insert data into a collection named `collection01`. | BYOC"
type: origin
token: NitBwKVzzi0hXBkjdDFcfwRsngb
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cluster Resource Privileges & Privilege Groups

A **privilege** refers to the permission of specific operations on certain Zilliz Cloud resources such as clusters, databases, and collections. Privileges are assigned to roles, which are then granted to users, defining the operations users can perform on the resources. An example of a privilege could be the permission to insert data into a collection named `collection_01`. 

A **privilege group** is a combination of individual privileges. You can create a privilege group of commonly used privileges to simplify the role granting process. For ease-of-use, Zilliz Cloud provides a total of 9 built-in privilege groups on the collection, database, and cluster level.

The following figure illustrates the different granting process of privileges and a privilege group.

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

This topic details the built-in privilege groups and privileges that are available in Zilliz Cloud. 

## Privilege group\{#privilege-group}

### Built-in privilege groups\{#built-in-privilege-groups}

Zilliz Cloud offers a total of 9 built-in privilege groups on the collection, database, and cluster level that you can directly grant when [creating roles](./cluster-roles). 

<Admonition type="info" icon="📘" title="Notes">

The three levels of built-in privilege groups do not have a cascading relationship. Setting a privilege group at the cluster level does not automatically set permissions for all databases and collections under that instance. Privileges at the database and collection levels need to be set manually.

</Admonition>

#### Collection level privilege groups\{#collection-level-privilege-groups}

- **CollectionReadOnly (COLL_RO)**: includes privileges to read collection data

- **CollectionReadWrite (COLL_RW)**: includes privileges to read and write collection data

- **CollectionAdmin (COLL_ADMIN)**: includes privileges to read and write collection data and manage collections.

The table below lists the specific privileges included in the three built-in privilege groups at the collection level:

| **Privilege** | **CollectionReadOnly** | **CollectionReadWrite** | **CollectionAdmin** |
| --- | --- | --- | --- |
| Query | ✔️ | ✔️ | ✔️ |
| Search | ✔️ | ✔️ | ✔️ |
| IndexDetail | ✔️ | ✔️ | ✔️ |
| GetFlushState | ❌ | ✔️ | ✔️ |
| GetLoadState | ✔️ | ✔️ | ✔️ |
| GetLoadingProgress | ✔️ | ✔️ | ✔️ |
| HasPartition | ✔️ | ✔️ | ✔️ |
| ShowPartitions | ✔️ | ✔️ | ✔️ |
| ListAliases | ✔️ | ✔️ | ✔️ |
| DescribeCollection | ✔️ | ✔️ | ✔️ |
| DescribeAlias | ✔️ | ✔️ | ✔️ |
| GetStatistics | ✔️ | ✔️ | ✔️ |
| CreateIndex | ❌ | ✔️ | ✔️ |
| DropIndex | ❌ | ✔️ | ✔️ |
| CreatePartition | ❌ | ✔️ | ✔️ |
| DropPartition | ❌ | ✔️ | ✔️ |
| Load | ✔️ | ✔️ | ✔️ |
| Release | ❌ | ✔️ | ✔️ |
| Insert | ❌ | ✔️ | ✔️ |
| Delete | ❌ | ✔️ | ✔️ |
| Upsert | ❌ | ✔️ | ✔️ |
| Import | ❌ | ✔️ | ✔️ |
| Flush | ❌ | ✔️ | ✔️ |
| Compaction | ❌ | ❌ | ✔️ |
| LoadBalance | ❌ | ✔️ | ✔️ |
| CreateAlias | ❌ | ✔️ | ✔️ |
| DropAlias | ❌ | ✔️ | ✔️ |
| AddCollectionField | ❌ | ✔️ | ✔️ |

#### Database level privilege groups\{#database-level-privilege-groups}

- **DatabaseReadOnly (DB_RO)**: includes privileges to read database data

- **DatabaseReadWrite (DB_RW)**: includes privileges to read and write database data

- **DatabaseAdmin (DB_Admin)**: includes privileges to read and write database data and manage databases.

The table below lists the specific privileges included in the three built-in privilege groups at the database level:

| **Privilege** | **DatabaseReadOnly** | **DatabaseReadWrite** | **DatabaseAdmin** |
| --- | --- | --- | --- |
| ShowCollections | ✔️ | ✔️ | ✔️ |
| DescribeDatabase | ✔️ | ✔️ | ✔️ |
| CreateCollection | ❌ | ✔️ | ✔️ |
| DropCollection | ❌ | ✔️ | ✔️ |
| AlterDatabase | ❌ | ❌ | ❌ |

#### Cluster level privilege groups\{#cluster-level-privilege-groups}

- **ClusterReadOnly (Cluster_RO)**: includes privileges to read instance data

- **ClusterReadWrite (Cluster_RW)**: includes privileges to read and write instance data

- **ClusterAdmin (Cluster_Admin)**: includes privileges to read and write instance data and manage instances.

The table below lists the specific privileges included in the three built-in privilege groups at the cluster level:

| **Privilege** | **ClusterReadOnly** | **ClusterReadWrite** | **ClusterAdmin** |
| --- | --- | --- | --- |
| ListDatabases | ✔️ | ✔️ | ✔️ |
| RenameCollection | ❌ | ✔️ | ✔️ |
| CreateOwnership | ❌ | ❌ | ✔️ |
| UpdateUser | ❌ | ❌ | ✔️ |
| DropOwnership | ❌ | ❌ | ✔️ |
| SelectOwnership | ❌ | ❌ | ✔️ |
| ManageOwnership | ❌ | ❌ | ✔️ |
| SelectUser | ❌ | ❌ | ✔️ |
| BackupRBAC | ❌ | ❌ | ❌ |
| RestoreRBAC | ❌ | ❌ | ❌ |
| CreateResourceGroup | ❌ | ❌ | ❌ |
| DropResourceGroup | ❌ | ❌ | ❌ |
| UpdateResourceGroups | ❌ | ❌ | ❌ |
| DescribeResourceGroup | ❌ | ❌ | ❌ |
| ListResourceGroups | ❌ | ❌ | ❌ |
| TransferNode | ❌ | ❌ | ❌ |
| TransferReplica | ❌ | ❌ | ❌ |
| CreateDatabase | ❌ | ✔️ | ✔️ |
| DropDatabase | ❌ | ✔️ | ✔️ |
| FlushAll | ❌ | ❌ | ❌ |
| CreatePrivilegeGroup | ❌ | ❌ | ❌ |
| DropPrivilegeGroup | ❌ | ❌ | ❌ |
| ListPrivilegeGroups | ✔️ | ✔️ | ✔️ |
| OperatePrivilegeGroup | ❌ | ❌ | ❌ |

### Custom privilege groups | PRIVATE\{#custom-privilege-groups}

If the built-in privileges do not meet your needs, you can create custom privilege groups and add specified privileges to the privilege groups using the SDKs. 

<Admonition type="info" icon="📘" title="📘 Notes">

This is a feature in **Private Preview**. To request this feature, [create a support ticket](http://support.zilliz.com) so we can enable it for you.

</Admonition>

#### Create a custom privilege group\{#create-a-custom-privilege-group}

The following example demonstrates how to create a privilege group named `privilege_group_1`.

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

Once a custom privilege group is created, you can add privileges to the privilege group.

#### Add privileges to a custom privilege group\{#add-privileges-to-a-custom-privilege-group}

The following example demonstrates how to add privileges `PrivilegeBackupRBAC` and `PrivilegeRestoreRBAC` to the privilege group `privilege_group_1` that is just created. For details about all the privileges available in Zilliz Cloud, refer to [All privileges](./cluster-privileges#all-privileges).

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

Once the privileges are added to a privilege group, you can grant the privilege group to a role. For details, refer to [Manage Cluster Roles (SDK)](./cluster-roles-sdk#grant-a-privilege-group-to-a-role).

#### Remove privileges from a custom privilege group\{#remove-privileges-from-a-custom-privilege-group}

The following example demonstrates how to remove the privilege `PrivilegeRestoreRBAC` from the privilege group `privilege_group_1`.

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

#### List privilege groups\{#list-privilege-groups}

The following example demonstrates how to list all existing privilege groups.

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

Below is an example output.

```bash
PrivilegeGroupItem: <privilege_group:privilege_group_1>, <privileges:('Search', 'Query')>
```

#### Drop a custom privilege group\{#drop-a-custom-privilege-group}

The following example demonstrates how to drop the privilege group `privilege_group_1`.

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

## All privileges\{#all-privileges}

The followings are all the privileges available on Zilliz Cloud. 

If you need to create your own privilege group with the privileges listed below or create custom roles with privileges, please [contact us](http://support.zilliz.com).

### Database privileges\{#database-privileges}

| **Privilege** | **Description** |
| --- | --- |
| ListDatabases | View all databases in the current instance |
| DescribeDatabase | View the details of a database |
| CreateDatabase | Create a database |
| DropDatabase | Drop a database |
| AlterDatabase | Modify the properties of a database |

### Collection privileges\{#collection-privileges}

| **Privilege** | **Description** |
| --- | --- |
| GetFlushState | Check the status of the collection flush operation |
| GetLoadState | Check the load status of a collection |
| GetLoadingProgress | Check the loading progress of a collection |
| ShowCollections | View all collections with collection privileges |
| ListAliases | View all aliases of a collection |
| DescribeCollection | View the details of a collection |
| DescribeAlias | View the details of an alias |
| GetStatistics | Obtain the statistics of a collection (eg. The number of entities in a collection) |
| CreateCollection | Create a collection |
| DropCollection | Drop a collection |
| Load | Load a collection |
| Release | Release a collection |
| Flush | Persist all entities in a collection to a sealed segment. Any entity inserted after the flush operation will be stored in a new segment. |
| Compaction | Manually trigger compaction |
| RenameCollection | Rename a collection |
| CreateAlias | Create an alias for a collection |
| DropAlias | Drop the alias of a collection |
| FlushAll | Flush all collections in a database |
| AddCollectionField | Add a field to an existing collection |

### Partition privileges\{#partition-privileges}

| **Privilege** | **Description** |
| --- | --- |
| HasPartition | Check whether a partition exists |
| ShowPartitions | View all partitions in a collection |
| CreatePartition | Create a partition |
| DropPartition | Drop a partition |

### Index privileges\{#index-privileges}

| **Privilege** | **Description** |
| --- | --- |
| IndexDetail | View the details of an index |
| CreateIndex | Create an index |
| DropIndex | Drop an index |

### Resource management privileges\{#resource-management-privileges}

| **Privilege** | **Description** |
| --- | --- |
| LoadBalance | Achieve load balance |
| CreateResourceGroup | Create a resource group |
| DropResourceGroup | Drop a resource group |
| UpdateResourceGroups | Update a resource group |
| DescribeResourceGroup | View the details of a resource group |
| ListResourceGroups | View all resource groups of the current instance |
| TransferNode | Transfer nodes between resource groups |
| TransferReplica | Transfer replicas between resource groups |
| BackupRBAC | Create a backup for all RBAC related operations in the current instance |
| RestoreRBAC | Restore a backup of all RBAC related operations in the current instance |

### Entity privileges\{#entity-privileges}

| **Privilege** | **Description** |
| --- | --- |
| Query | Conduct a query |
| Search | Conduct a search |
| Insert | Insert entities |
| Delete | Delete entities |
| Upsert | Upsert entities |
| Import | Bulk insert or import entities |

### RBAC privileges\{#rbac-privileges}

| **Privilege** | **Description** |
| --- | --- |
| CreateOwnership | Create a user or a role |
| UpdateUser | Update the password of a user |
| DropOwnership | Drop a user password or a role |
| SelectOwnership | View all users that are granted a specific role |
| ManageOwnership | Manage a user or a role or grant a role to a user |
| SelectUser | View all roles granted to a user |
| CreatePrivilegeGroup | Create a privilege group |
| DropPrivilegeGroup | Drop a privilege group |
| ListPrivilegeGroups | View all privilege groups in the current instance |
| OperatePrivilegeGroup | Add privileges to or remove privileges from a privilege group |

