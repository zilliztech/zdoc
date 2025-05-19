---
title: "Privileges & Privilege Groups | Cloud"
slug: /cluster-privileges
sidebar_label: "Privileges & Privilege Groups"
beta: FALSE
notebook: FALSE
description: "A privilege refers to the permission of specific operations on certain Zilliz Cloud resources such as clusters, databases, and collections. Privileges are assigned to roles, which are then granted to users, defining the operations users can perform on the resources. An example of a privilege could be the permission to insert data into a collection named `collection01`. | Cloud"
type: origin
token: NitBwKVzzi0hXBkjdDFcfwRsngb
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - privileges
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Privileges & Privilege Groups

A **privilege** refers to the permission of specific operations on certain Zilliz Cloud resources such as clusters, databases, and collections. Privileges are assigned to roles, which are then granted to users, defining the operations users can perform on the resources. An example of a privilege could be the permission to insert data into a collection named `collection_01`. 

A **privilege group** is a combination of individual privileges. You can create a privilege group of commonly used privileges to simplify the role granting process. For ease-of-use, Zilliz Cloud provides a total of 9 built-in privilege groups on the collection, database, and cluster level.

The following figure illustrates the different granting process of privileges and a privilege group.

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](/img/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

This topic details the built-in privilege groups and privileges that are available in Zilliz Cloud. 

## Privilege group{#privilege-group}

### Built-in privilege groups{#built-in-privilege-groups}

Zilliz Cloud offers a total of 9 built-in privilege groups on the collection, database, and cluster level that you can directly grant when [creating roles](./cluster-roles). 

<Admonition type="info" icon="📘" title="Notes">

<p>The three levels of built-in privilege groups do not have a cascading relationship. Setting a privilege group at the cluster level does not automatically set permissions for all databases and collections under that instance. Privileges at the database and collection levels need to be set manually.</p>

</Admonition>

#### Collection level privilege groups{#collection-level-privilege-groups}

- **CollectionReadOnly (COLL_RO)**: includes privileges to read collection data

- **CollectionReadWrite (COLL_RW)**: includes privileges to read and write collection data

- **CollectionAdmin (COLL_ADMIN)**: includes privileges to read and write collection data and manage collections.

The table below lists the specific privileges included in the three built-in privilege groups at the collection level:

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
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
     <td><p>✔️</p></td>
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
     <td><p>❌</p></td>
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
     <td><p>✔️</p></td>
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
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

#### Database level privilege groups{#database-level-privilege-groups}

- **DatabaseReadOnly (DB_RO)**: includes privileges to read database data

- **DatabaseReadWrite (DB_RW)**: includes privileges to read and write database data

- **DatabaseAdmin (DB_Admin)**: includes privileges to read and write database data and manage databases.

The table below lists the specific privileges included in the three built-in privilege groups at the database level:

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
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
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

#### Cluster level privilege groups{#cluster-level-privilege-groups}

- **ClusterReadOnly (Cluster_RO)**: includes privileges to read instnace data

- **ClusterReadWrite (Cluster_RW)**: includes privileges to read and write instance data

- **ClusterAdmin (Cluster_Admin)**: includes privileges to read and write instance data and manage instances.

The table below lists the specific privileges included in the three built-in privilege groups at the cluster level:

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
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
     <td><p>❌</p></td>
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
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
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
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

### Custom privilege groups{#custom-privilege-groups}

If the built-in privileges do not meet your needs, you can create custom privilege groups and add specified privileges to the privilege groups using the SDKs. 

<Admonition type="info" icon="📘" title="Notes">

<p>To create and manage custom privilege groups, please <a href="http://support.zilliz.com">create a support ticket</a> so that we can enable this feature for you.</p>

</Admonition>

#### Create a  custom privilege group{#create-a-custom-privilege-group}

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

#### Add privileges to a custom privilege group{#add-privileges-to-a-custom-privilege-group}

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

Once the privileges are added to a privilege group, you can grant the privilege group to a role. For details, refer to [Manage Cluster Roles (SDK)](./cluster-roles-sdk#grant-a-privilege-or-a-privilege-group-to-a-role).

#### Remove privileges from a custom privilege group{#remove-privileges-from-a-custom-privilege-group}

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

#### List privilege groups{#list-privilege-groups}

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

#### Drop a custom privilege group{#drop-a-custom-privilege-group}

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

## All privileges{#all-privileges}

The followings are all the privileges available on Zilliz Cloud. 

If you need to create your own privilege group with the privileges listed below or create custom roles with privileges, please [contact us](http://support.zilliz.com).

### Database privileges{#database-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>View all databases in the current instance</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>View the details of a database</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>Create a database</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>Drop a database</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>Modify the properties of a database</p></td>
   </tr>
</table>

### Collection privileges{#collection-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>Check the status of the collection flush operation</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>Check the load status of a collection</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>Check the loading progress of a collection</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>View all collections with collection privileges</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>View all aliases of a collection</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>View the details of a collection</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>View the details of an alias</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>Obtain the statistics of a collection (eg. The number of entities in a collection)</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>Create a collection</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>Drop a collection</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>Load a collection</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>Release a collection</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>Persist all entities in a collection to a sealed segment. Any entity inserted after the flush operation will be stored in a new segment.</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>Manually trigger compaction</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>Rename a collection</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>Create an alias for a collection</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
     <td><p>Drop the alias of a collection</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>Flush all collections in a database</p></td>
   </tr>
</table>

### Partition privileges{#partition-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>Check whether a partition exists</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>View all partitions in a collection</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>Create a partition</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>Drop a partition</p></td>
   </tr>
</table>

### Index privileges{#index-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>View the details of an index</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>Create an index</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>Drop an index</p></td>
   </tr>
</table>

### Resource management privileges{#resource-management-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>Achieve load balance</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>Create a resource group</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>Drop a resource group</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>Update a resource group</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>View the details of a resource group</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>View all resource groups of the current instance</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>Transfer nodes between resource groups</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>Transfer replicas between resource groups</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>Create a backup for all RBAC related operations in the current instance</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>Restore a backup of all RBAC related operations in the current instance</p></td>
   </tr>
</table>

### Entity privileges{#entity-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>Conduct a query</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>Conduct a search</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>Insert entities</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>Delete entities</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>Upsert entities</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>Bulk insert or import entities</p></td>
   </tr>
</table>

### RBAC privileges{#rbac-privileges}

<table>
   <tr>
     <th><p><strong>Privilege</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td><p>CreateOwnership</p></td>
     <td><p>Create a user or a role</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>Update the password of a user</p></td>
   </tr>
   <tr>
     <td><p>DropOwnership</p></td>
     <td><p>Drop a user password or a role</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnership</p></td>
     <td><p>View all users that are granted a specific role</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnership</p></td>
     <td><p>Manage a user or a role or grant a role to a user</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>View all roles granted to a user</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>Create a privilege group</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>Drop a privilege group</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>View all privilege groups in the current instance</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>Add privileges to or remove privileges from a privilege group</p></td>
   </tr>
</table>

