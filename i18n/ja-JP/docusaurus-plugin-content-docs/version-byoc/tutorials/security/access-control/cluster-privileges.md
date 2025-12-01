---
title: "権限と権限グループ | BYOC"
slug: /cluster-privileges
sidebar_label: "権限と権限グループ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "権限は、クラスター、データベース、コレクションなどの特定のZilliz Cloudリソースに対する特定の操作の許可を指します。権限はロールに割り当てられ、その後ユーザーに付与され、ユーザーがリソースに対して実行できる操作を定義します。権限の例として、`collection01`という名前のコレクションにデータを挿入する許可があります。 | BYOC"
type: origin
token: NitBwKVzzi0hXBkjdDFcfwRsngb
sidebar_position: 6
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - クラスター
  - アクセス制御
  - rbac
  - 権限
  - 安価なベクトルデータベース
  - マネージドベクトルデータベース
  - Pineconeベクトルデータベース
  - 音声検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 権限と権限グループ

**権限**とは、クラスター、データベース、コレクションなどの特定のZilliz Cloudリソースに対する特定の操作の許可を指します。権限はロールに割り当てられ、その後ユーザーに付与され、ユーザーがリソースに対して実行できる操作を定義します。権限の例として、`collection_01`という名前のコレクションにデータを挿入する許可があります。

**権限グループ**は個々の権限の組み合わせです。ロール付与プロセスを簡略化するために、一般的に使用される権限の権限グループを作成できます。使いやすさのために、Zilliz Cloudはコレクション、データベース、およびクラスターレベルの合計9つの組み込み権限グループを提供します。

以下の図は、権限と権限グループの異なる付与プロセスを示しています。

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](/img/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

このトピックでは、Zilliz Cloudで利用可能な組み込み権限グループと権限の詳細を説明します。

## 権限グループ\{#privilege-group}

### 組み込み権限グループ\{#built-in-privilege-groups}

Zilliz Cloudは、[ロールの作成](./cluster-roles)時に直接付与できる、コレクション、データベース、およびクラスターレベルの合計9つの組み込み権限グループを提供します。

<Admonition type="info" icon="📘" title="注意">

<p>組み込み権限グループの3つのレベルにはカスケード関係がありません。クラスターレベルで権限グループを設定しても、そのインスタンス配下のすべてのデータベースおよびコレクションに自動的に権限が設定されるわけではありません。データベースおよびコレクションレベルの権限は手動で設定する必要があります。</p>

</Admonition>

#### コレクションレベルの権限グループ\{#collection-level-privilege-groups}

- **CollectionReadOnly (COLL_RO)**：コレクションデータの読み取り権限を含む

- **CollectionReadWrite (COLL_RW)**：コレクションデータの読み書き権限を含む

- **CollectionAdmin (COLL_ADMIN)**：コレクションデータの読み書きおよびコレクション管理の権限を含む

以下の表は、コレクションレベルの3つの組み込み権限グループに含まれる特定の権限をリストしています：

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
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

#### データベースレベルの権限グループ\{#database-level-privilege-groups}

- **DatabaseReadOnly (DB_RO)**：データベースデータの読み取り権限を含む

- **DatabaseReadWrite (DB_RW)**：データベースデータの読み書き権限を含む

- **DatabaseAdmin (DB_Admin)**：データベースデータの読み書きおよびデータベース管理の権限を含む

以下の表は、データベースレベルの3つの組み込み権限グループに含まれる特定の権限をリストしています：

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
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

#### クラスターレベルの権限グループ\{#cluster-level-privilege-groups}

- **ClusterReadOnly (Cluster_RO)**：インスタンスデータの読み取り権限を含む

- **ClusterReadWrite (Cluster_RW)**：インスタンスデータの読み書き権限を含む

- **ClusterAdmin (Cluster_Admin)**：インスタンスデータの読み書きおよびインスタンス管理の権限を含む

以下の表は、クラスターレベルの3つの組み込み権限グループに含まれる特定の権限をリストしています：

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
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

### カスタム権限グループ\{#custom-privilege-groups}

組み込み権限がニーズを満たさない場合、SDKを使用してカスタム権限グループを作成し、権限グループに指定された権限を追加できます。

<Admonition type="info" icon="📘" title="注意">

<p>以下にリストされた権限で独自の権限グループを作成するか、権限を持つカスタムロールを作成するには、<a href="http://support.zilliz.com">お問い合わせください</a>。</p>

</Admonition>

#### カスタム権限グループの作成\{#create-a-custom-privilege-group}

以下の例は、`privilege_group_1`という名前の権限グループを作成する方法を示しています。

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

カスタム権限グループが作成されると、権限グループに権限を追加できます。

#### カスタム権限グループへの権限追加\{#add-privileges-to-a-custom-privilege-group}

以下の例は、権限`PrivilegeBackupRBAC`および`PrivilegeRestoreRBAC`を直前に作成した権限グループ`privilege_group_1`に追加する方法を示しています。Zilliz Cloudで利用可能なすべての権限の詳細については、[すべての権限](./cluster-privileges#all-privileges)を参照してください。

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

権限が権限グループに追加されると、ロールに権限グループを付与できます。詳細については、[クラスターロールの管理（SDK）](./cluster-roles-sdk#grant-a-privilege-or-a-privilege-group-to-a-role)を参照してください。

#### カスタム権限グループからの権限削除\{#remove-privileges-from-a-custom-privilege-group}

以下の例は、権限グループ`privilege_group_1`から権限`PrivilegeRestoreRBAC`を削除する方法を示しています。

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

#### 権限グループ一覧表示\{#list-privilege-groups}

以下の例は、既存のすべての権限グループを一覧表示する方法を示しています。

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

以下は出力例です。

```bash
PrivilegeGroupItem: <privilege_group:privilege_group_1>, <privileges:('Search', 'Query')>
```

#### カスタム権限グループの削除\{#drop-a-custom-privilege-group}

以下の例は、権限グループ`privilege_group_1`を削除する方法を示しています。

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

## すべての権限\{#all-privileges}

以下のものはZilliz Cloudで利用可能なすべての権限です。

以下にリストされた権限で独自の権限グループを作成するか、権限を持つカスタムロールを作成するには、[お問い合わせください](http://support.zilliz.com)。

### データベース権限\{#database-privileges}

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>ListDatabases</p></td>
     <td><p>現在のインスタンス内のすべてのデータベースを表示</p></td>
   </tr>
   <tr>
     <td><p>DescribeDatabase</p></td>
     <td><p>データベースの詳細を表示</p></td>
   </tr>
   <tr>
     <td><p>CreateDatabase</p></td>
     <td><p>データベースを作成</p></td>
   </tr>
   <tr>
     <td><p>DropDatabase</p></td>
     <td><p>データベースを削除</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabase</p></td>
     <td><p>データベースのプロパティを変更</p></td>
   </tr>
</table>

### コレクション権限\{#collection-privileges}

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>GetFlushState</p></td>
     <td><p>コレクションフラッシュ操作の状態を確認</p></td>
   </tr>
   <tr>
     <td><p>GetLoadState</p></td>
     <td><p>コレクションの読み込み状態を確認</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingProgress</p></td>
     <td><p>コレクションの読み込み進行状況を確認</p></td>
   </tr>
   <tr>
     <td><p>ShowCollections</p></td>
     <td><p>コレクション権限を持つすべてのコレクションを表示</p></td>
   </tr>
   <tr>
     <td><p>ListAliases</p></td>
     <td><p>コレクションのすべてのエイリアスを表示</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollection</p></td>
     <td><p>コレクションの詳細を表示</p></td>
   </tr>
   <tr>
     <td><p>DescribeAlias</p></td>
     <td><p>エイリアスの詳細を表示</p></td>
   </tr>
   <tr>
     <td><p>GetStatistics</p></td>
     <td><p>コレクションの統計情報を取得（例：コレクション内のエンティティ数）</p></td>
   </tr>
   <tr>
     <td><p>CreateCollection</p></td>
     <td><p>コレクションを作成</p></td>
   </tr>
   <tr>
     <td><p>DropCollection</p></td>
     <td><p>コレクションを削除</p></td>
   </tr>
   <tr>
     <td><p>Load</p></td>
     <td><p>コレクションを読み込む</p></td>
   </tr>
   <tr>
     <td><p>Release</p></td>
     <td><p>コレクションを解放する</p></td>
   </tr>
   <tr>
     <td><p>Flush</p></td>
     <td><p>すべてのエンティティを封印されたセグメントに永続化する。フラッシュ操作後に挿入されたいずれのエンティティも新しいセグメントに保存される。</p></td>
   </tr>
   <tr>
     <td><p>Compaction</p></td>
     <td><p>手動でコンパクションをトリガーする</p></td>
   </tr>
   <tr>
     <td><p>RenameCollection</p></td>
     <td><p>コレクション名を変更する</p></td>
   </tr>
   <tr>
     <td><p>CreateAlias</p></td>
     <td><p>コレクションのエイリアスを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropAlias</p></td>
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

### パーティション権限\{#partition-privileges}

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>HasPartition</p></td>
     <td><p>パーティションが存在するかどうかを確認</p></td>
   </tr>
   <tr>
     <td><p>ShowPartitions</p></td>
     <td><p>コレクション内のすべてのパーティションを表示</p></td>
   </tr>
   <tr>
     <td><p>CreatePartition</p></td>
     <td><p>パーティションを作成</p></td>
   </tr>
   <tr>
     <td><p>DropPartition</p></td>
     <td><p>パーティションを削除</p></td>
   </tr>
</table>

### インデックス権限\{#index-privileges}

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>IndexDetail</p></td>
     <td><p>インデックスの詳細を表示</p></td>
   </tr>
   <tr>
     <td><p>CreateIndex</p></td>
     <td><p>インデックスを作成</p></td>
   </tr>
   <tr>
     <td><p>DropIndex</p></td>
     <td><p>インデックスを削除</p></td>
   </tr>
</table>

### リソース管理権限\{#resource-management-privileges}

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>LoadBalance</p></td>
     <td><p>負荷分散を実現する</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroup</p></td>
     <td><p>リソースグループを作成</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroup</p></td>
     <td><p>リソースグループを削除</p></td>
   </tr>
   <tr>
     <td><p>UpdateResourceGroups</p></td>
     <td><p>リソースグループを更新</p></td>
   </tr>
   <tr>
     <td><p>DescribeResourceGroup</p></td>
     <td><p>リソースグループの詳細を表示</p></td>
   </tr>
   <tr>
     <td><p>ListResourceGroups</p></td>
     <td><p>現在のインスタンスのすべてのリソースグループを表示</p></td>
   </tr>
   <tr>
     <td><p>TransferNode</p></td>
     <td><p>リソースグループ間でノードを転送</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>リソースグループ間でレプリカを転送</p></td>
   </tr>
   <tr>
     <td><p>BackupRBAC</p></td>
     <td><p>現在のインスタンス内のすべてのRBAC関連操作のバックアップを作成</p></td>
   </tr>
   <tr>
     <td><p>RestoreRBAC</p></td>
     <td><p>現在のインスタンス内のすべてのRBAC関連操作のバックアップを復元</p></td>
   </tr>
</table>

### エンティティ権限\{#entity-privileges}

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>Query</p></td>
     <td><p>クエリを実行</p></td>
   </tr>
   <tr>
     <td><p>Search</p></td>
     <td><p>検索を実行</p></td>
   </tr>
   <tr>
     <td><p>Insert</p></td>
     <td><p>エンティティを挿入</p></td>
   </tr>
   <tr>
     <td><p>Delete</p></td>
     <td><p>エンティティを削除</p></td>
   </tr>
   <tr>
     <td><p>Upsert</p></td>
     <td><p>エンティティをアップサート</p></td>
   </tr>
   <tr>
     <td><p>Import</p></td>
     <td><p>エンティティを一括挿入またはインポート</p></td>
   </tr>
</table>

### RBAC権限\{#rbac-privileges}

<table>
   <tr>
     <th><p><strong>権限</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p>CreateOwnership</p></td>
     <td><p>ユーザーまたはロールを作成</p></td>
   </tr>
   <tr>
     <td><p>UpdateUser</p></td>
     <td><p>ユーザーのパスワードを更新</p></td>
   </tr>
   <tr>
     <td><p>DropOwnership</p></td>
     <td><p>ユーザーのパスワードまたはロールを削除</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnership</p></td>
     <td><p>特定のロールが付与されたすべてのユーザーを表示</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnership</p></td>
     <td><p>ユーザーまたはロールを管理する、またはユーザーにロールを付与する</p></td>
   </tr>
   <tr>
     <td><p>SelectUser</p></td>
     <td><p>ユーザーに付与されたすべてのロールを表示</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>権限グループを作成</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroup</p></td>
     <td><p>権限グループを削除</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroups</p></td>
     <td><p>現在のインスタンス内のすべての権限グループを表示</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>権限グループに権限を追加または権限グループから権限を削除</p></td>
   </tr>
</table>