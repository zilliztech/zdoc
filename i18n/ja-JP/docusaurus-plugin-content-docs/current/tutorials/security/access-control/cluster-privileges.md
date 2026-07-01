---
title: "権限と権限グループ | Cloud"
slug: /cluster-privileges
sidebar_key: cluster-privileges
sidebar_label: "権限と権限グループ"
beta: FALSE
notebook: FALSE
description: "権限とは、Zilliz Cloud のクラスター、データベース、コレクションなどの特定のリソースに対する特定の操作の許可を指します。権限はロールに割り当てられ、そのロールがユーザーに付与されることで、ユーザーがリソースに対して実行できる操作が定義されます。権限の例としては、`collection01` という名前のコレクションにデータを挿入する許可などがあります。"
type: origin
token: NitBwKVzzi0hXBkjdDFcfwRsngb
sidebar_position: 6
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cluster
  - アクセス制御
  - rbac
  - 権限

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 特権と特権グループ

**特権**とは、クラスター、データベース、コレクションなどの特定の Zilliz Cloud リソースに対する特定の操作の許可を指します。特権はロールに割り当てられ、そのロールがユーザーに付与されることで、ユーザーがリソースに対して実行できる操作が定義されます。特権の例としては、`collection_01` という名前のコレクションにデータを挿入する許可などがあります。

**特権グループ**は、個別の特権を組み合わせたものです。よく使用する特権の特権グループを作成することで、ロール付与プロセスを簡略化できます。利便性のため、Zilliz Cloud はコレクションレベル、データベースレベル、クラスターレベルで合計 9 つの組み込み特権グループを提供しています。

以下の図は、特権と特権グループの異なる付与プロセスを示しています。

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

このトピックでは、Zilliz Cloud で利用可能な組み込み特権グループと特権について詳しく説明します。

## 特権グループ\{#privilege-group}

### 組み込み特権グループ\{#built-in-privilege-groups}

Zilliz Cloud は、コレクションレベル、データベースレベル、クラスターレベルで合計 9 つの組み込み特権グループを提供しており、[ロールの作成](./cluster-roles)時に直接付与できます。

<Admonition type="info" icon="📘" title="Notes">

3 つのレベルの組み込み特権グループにはカスケード関係はありません。クラスターレベルで特権グループを設定しても、そのインスタンス配下のすべてのデータベースとコレクションの権限が自動的に設定されるわけではありません。データベースレベルとコレクションレベルの特権は手動で設定する必要があります。

</Admonition>

#### コレクションレベルの特権グループ\{#collection-level-privilege-groups}

- **CollectionReadOnly (COLL_RO)**: コレクションデータの読み取り特権を含む

- **CollectionReadWrite (COLL_RW)**: コレクションデータの読み取りと書き込み特権を含む

- **CollectionAdmin (COLL_ADMIN)**: コレクションデータの読み取りと書き込み、およびコレクションの管理特権を含む

以下の表は、コレクションレベルの 3 つの組み込み特権グループに含まれる具体的な特権を示しています。

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
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
     <td><p>Showパーティション</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Listエイリアスes</p></td>
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
     <td><p>Describeエイリアス</p></td>
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
     <td><p>Createエイリアス</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Dropエイリアス</p></td>
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

#### データベースレベルの特権グループ\{#database-level-privilege-groups}

- **データベースReadOnly (DB_RO)**: データベースデータの読み取り特権を含む

- **データベースReadWrite (DB_RW)**: データベースデータの読み取りと書き込み特権を含む

- **データベースAdmin (DB_Admin)**: データベースデータの読み取りと書き込み、およびデータベースの管理特権を含む

以下の表は、データベースレベルの 3 つの組み込み特権グループに含まれる具体的な特権を示しています。

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>データベースReadOnly</strong></p></th>
     <th><p><strong>データベースReadWrite</strong></p></th>
     <th><p><strong>データベースAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Describeデータベース</p></td>
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
     <td><p>Alterデータベース</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
   </tr>
</table>

#### クラスターレベルの特権グループ\{#cluster-level-privilege-groups}

- **ClusterReadOnly (Cluster_RO)**: インスタンスデータの読み取り特権を含む

- **ClusterReadWrite (Cluster_RW)**: インスタンスデータの読み取りと書き込み特権を含む

- **ClusterAdmin (Cluster_Admin)**: インスタンスデータの読み取りと書き込み、およびインスタンスの管理特権を含む

以下の表は、クラスターレベルの 3 つの組み込み特権グループに含まれる具体的な特権を示しています。

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>ClusterReadOnly</strong></p></th>
     <th><p><strong>ClusterReadWrite</strong></p></th>
     <th><p><strong>ClusterAdmin</strong></p></th>
   </tr>
   <tr>
     <td><p>Listデータベースs</p></td>
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
     <td><p>Createオーナーship</p></td>
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
     <td><p>Dropオーナーship</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Selectオーナーship</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Manageオーナーship</p></td>
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
     <td><p>Createデータベース</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Dropデータベース</p></td>
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

### カスタム特権グループ\{#custom-privilege-groups}

組み込み特権がニーズを満たさない場合は、SDK を使用してカスタム特権グループを作成し、指定した特権を特権グループに追加できます。

<Admonition type="info" icon="📘" title="Notes">

カスタム特権グループの作成と管理については、[サポートチケットの作成](http://support.zilliz.com) を行っていただき、この機能を有効化してください。

</Admonition>

#### カスタム特権グループの作成\{#create-a-custom-privilege-group}

以下の例は、`privilege_group_1` という名前の特権グループを作成する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.create_privilege_group(group_name='privilege_group_1'）
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
await client.createPrivilegeGroup({
  group_name: 'privilege_group_1',
});
```

</TabItem>

<TabItem value='java'>

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

カスタム特権グループが作成されたら、その特権グループに特権を追加できます。

#### カスタム特権グループへの特権の追加\{#add-privileges-to-a-custom-privilege-group}

以下の例では、先ほど作成した特権グループ `privilege_group_1` に `PrivilegeBackupRBAC` と `PrivilegeRestoreRBAC` の特権を追加する方法を示します。Zilliz Cloud で利用可能なすべての特権の詳細については、[すべての特権](./cluster-privileges#all-privileges) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.add_privileges_to_group(group_name='privilege_group_1', privileges=['Query', 'Search'])
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
await client.addPrivilegesToGroup({
  group_name: privilege_group_1,
  privileges: ['Query', 'Search'],
});

```

</TabItem>

<TabItem value='java'>

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

特権が特権グループに追加されたら、その特権グループをロールに付与できます。詳細については、[クラスターロールの管理 (SDK)](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) を参照してください。

#### カスタム特権グループからの特権の削除\{#remove-privileges-from-a-custom-privilege-group}

以下の例は、特権グループ `privilege_group_1` から特権 `PrivilegeRestoreRBAC` を削除する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.remove_privileges_from_group(group_name='privilege_group_1', privileges='Search')
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
await client.removePrivilegesFromGroup({
  group_name: "privilege_group_1",
  privileges: ["Search"],
});
```

</TabItem>

<TabItem value='java'>

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

#### List 特権グループs\{#list-privilege-groups}

次の例は、既存のすべての特権グループを一覧表示する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.list_privilege_groups()
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
await client.listPrivilegeGroups();
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/privilege_groups/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

以下は出力例です。

```bash
PrivilegeGroupItem: <privilege_group:privilege_group_1>, <privileges:('Search', 'Query')>
```

#### カスタム特権グループの削除\{#drop-a-custom-privilege-group}

次の例では、特権グループ `privilege_group_1` を削除する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.drop_privilege_group(group_name='privilege_group_1')
```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
await client.dropPrivilegeGroup({group_name: 'privilege_group_1'});
```

</TabItem>

<TabItem value='java'>

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

## すべての特権\{#all-privileges}

以下は、Zilliz Cloud で利用可能なすべての特権です。

以下にリストされた特権で独自の特権グループを作成する必要がある場合、または特権を持つカスタムロールを作成する場合は、[お問い合わせ](http://support.zilliz.com) ください。

### データベース特権\{#database-privileges}

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>Listデータベースs</p></td>
     <td><p>現在のインスタンス内のすべてのデータベースを表示する</p></td>
   </tr>
   <tr>
     <td><p>Describeデータベース</p></td>
     <td><p>データベースの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>Createデータベース</p></td>
     <td><p>データベースを作成する</p></td>
   </tr>
   <tr>
     <td><p>Dropデータベース</p></td>
     <td><p>データベースを削除する</p></td>
   </tr>
   <tr>
     <td><p>Alterデータベース</p></td>
     <td><p>データベースのプロパティを変更する</p></td>
   </tr>
</table>

### コレクション特権\{#collection-privileges}

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>コレクションのフラッシュ操作のステータスを確認する</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>コレクションのロード状態を確認する</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>コレクションのロード進捗を確認する</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>コレクション特権を持つすべてのコレクションを表示する</p></td>
   </tr>
   <tr>
     <td><p>Listエイリアスes</p></td>
     <td><p>コレクションのすべてのエイリアスを表示する</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>コレクションの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>Describeエイリアス</p></td>
     <td><p>エイリアスの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>コレクションの統計情報を取得する（例：コレクション内のエンティティ数）</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>コレクションを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>コレクションを削除する</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>コレクションをロードする</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>コレクションをリリースする</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>コレクション内のすべてのエンティティをシールドセグメントに永続化する。フラッシュ操作後に挿入されたエンティティは新しいセグメントに保存される。</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>手動でコンパクションをトリガーする</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>コレクションの名前を変更する</p></td>
   </tr>
   <tr>
     <td><p>Createエイリアス</p></td>
     <td><p>コレクションのエイリアスを作成する</p></td>
   </tr>
   <tr>
     <td><p>Dropエイリアス</p></td>
     <td><p>コレクションのエイリアスを削除する</p></td>
   </tr>
   <tr>
     <td><p>FlushAll</p></td>
     <td><p>データベース内のすべてのコレクションをフラッシュする</p></td>
   </tr>
   <tr>
     <td><p>AddCollectionField</p></td>
     <td><p>既存のコレクションにフィールドを追加する</p></td>
   </tr>
</table>

### パーティション特権\{#partition-privileges}

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>パーティションが存在するかどうかを確認する</p></td>
   </tr>
   <tr>
     <td><p>Showパーティション</p></td>
     <td><p>コレクション内のすべてのパーティションを表示する</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>パーティションを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>パーティションを削除する</p></td>
   </tr>
</table>

### インデックス特権\{#index-privileges}

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>インデックスの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>インデックスを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>インデックスを削除する</p></td>
   </tr>
</table>

### リソース管理特権\{#resource-management-privileges}

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>ロードバランスを実現する</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>リソースグループを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>リソースグループを削除する</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>リソースグループを更新する</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>リソースグループの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>現在のインスタンスのすべてのリソースグループを表示する</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>リソースグループ間でノードを転送する</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>リソースグループ間でレプリカを転送する</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>現在のインスタンスですべてのRBAC関連操作のバックアップを作成する</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>現在のインスタンスですべてのRBAC関連操作のバックアップを復元する</p></td>
   </tr>
</table>

### エンティティ特権\{#entity-privileges}

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>クエリを実行する</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>検索を実行する</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>エンティティを挿入する</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>エンティティを削除する</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>エンティティをアップサートする</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>エンティティを一括挿入またはインポートする</p></td>
   </tr>
</table>

### RBAC特権\{#rbac-privileges}

<table>
   <tr>
     <th><p><strong>特権</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>Createオーナーship</p></td>
     <td><p>ユーザまたはロールを作成する</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>ユーザのパスワードを更新する</p></td>
   </tr>
   <tr>
     <td><p>Dropオーナーship</p></td>
     <td><p>ユーザのパスワードまたはロールを削除する</p></td>
   </tr>
   <tr>
     <td><p>Selectオーナーship</p></td>
     <td><p>特定のロールが付与されたすべてのユーザを表示する</p></td>
   </tr>
   <tr>
     <td><p>Manageオーナーship</p></td>
     <td><p>ユーザまたはロールを管理する、またはユーザにロールを付与する</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>ユーザに付与されたすべてのロールを表示する</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>特権グループを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>特権グループを削除する</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>現在のインスタンス内のすべての特権グループを表示する</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>特権グループに特権を追加または特権グループから特権を削除する</p></td>
   </tr>
</table>

