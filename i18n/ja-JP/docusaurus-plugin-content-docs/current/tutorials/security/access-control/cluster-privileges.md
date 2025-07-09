---
title: "特権と特権グループ | Cloud"
slug: /cluster-privileges
sidebar_label: "特権と特権グループ"
beta: FALSE
notebook: FALSE
description: "特権とは、クラスター、データベース、コレクションなどの特定のZilliz Cloudリソースに対する特定の操作の許可を指します。特権は役割に割り当てられ、ユーザーに付与され、ユーザーがリソースで実行できる操作を定義します。特権の例としては、`collection01`という名前のコレクションにデータを挿入する許可があります。 | Cloud"
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
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 特権と特権グループ

特権とは、クラスター、データベース、コレクションなどの特定のZilliz Cloudリソースに対する特定の操作の許可を指します。特権は役割に割り当てられ、ユーザーに付与され、ユーザーがリソースで実行できる操作を定義します。特権の例としては、`collection_01`という名前のコレクションにデータを挿入する許可があります。 

特権グループは、個々の特権の組み合わせです。役割付与過程を簡素化するために、一般的に使用される特権の特権グループを作成できます。使いやすさのために、Zilliz Cloudはコレクション、データベース、クラスターレベルで合計9つの組み込み特権グループを提供しています。

次の図は、特権と特権グループのさまざまな付与過程を示しています。

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](/img/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

このトピックでは、Zilliz Cloudで利用可能な組み込みの特権グループと特権について詳しく説明します。 

## 特権グループ{#privilege-group}

### 組み込みの特権グループ{#built-in-privilege-groups}

Zilliz Cloudには、コレクション、データベース、クラスターレベルで合計9つの組み込み特権グループがあり、[役割を作成する](./cluster-roles)の場合に直接付与できます。 

<Admonition type="info" icon="📘" title="ノート">

<p>組み込み特権グループの3つのレベルには、カスケード関係はありません。クラスターレベルで特権グループを設定しても、そのインスタンスのすべてのデータベースとコレクションの権限が自動的に設定されるわけではありません。データベースレベルとコレクションレベルの特権は手動で設定する必要があります。</p>

</Admonition>

#### コレクションレベルの権限グループ{#collection-level-privilege-groups}

- **CollectionReadOnly(COLL_RO)**:コレクションデータを読み取る権限が含まれています

- **CollectionReadWrite(COLL_RW)**:コレクションデータを読み書きする権限が含まれています

- **CollectionAdmin(COLL_ADMIN)**:コレクションデータを読み書きし、コレクションを管理する権限が含まれます。

次の表に、コレクションレベルの3つの組み込み特権グループに含まれる特定の特権を示します。

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>CollectionReadOnly</strong></p></th>
     <th><p><strong>CollectionReadWrite</strong></p></th>
     <th><p><strong>コレクション管理</strong></p></th>
   </tr>
   <tr>
     <td><p>クエリ</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>検索する</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>In dexDetailの詳細</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetFlushStateの状態</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetLoadStateの状態</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingプログレス</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>パーティションHasPartition</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>パーティションを表示</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListAliasesのリスト</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollectionの説明</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DescribeAliasの説明</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>GetStatisticsの設定</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateIn dexを作成する</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropIn dex</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>パーティションの作成</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Dropパーティション</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ロードする</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>リリース</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>挿入する</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>削除する</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>アップサート</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>インポート</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>フラッシュ</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>コンパクション</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ロードバランス</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateAliasの作成</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropAliasの設定</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

#### データベースレベルの権限グループ{#database-level-privilege-groups}

- **DatabaseReadOnly(DB_RO)**:データベースデータを読み取る権限を含みます

- **DatabaseReadWrite(DB_RW)**:データベースデータを読み書きする権限が含まれています

- **DatabaseAdmin(DB_Admin)**:データベースデータを読み書きし、データベースを管理する権限が含まれています。

以下の表は、データベースレベルの3つの組み込み特権グループに含まれる特定の特権を示しています。

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>DatabaseReadOnly</strong></p></th>
     <th><p><strong>DatabaseReadWrite</strong></p></th>
     <th><p><strong>データベース管理</strong></p></th>
   </tr>
   <tr>
     <td><p>コレクションを表示</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>データベースの説明</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateCollectionを作成する</p></td>
     <td><p>✔️</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropCollectionを削除する</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabaseデータベース</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
</table>

#### クラスターレベルの特権グループ{#cluster-level-privilege-groups}

- **ClusterReadOnly(Cluster_RO)**:インスタンスデータを読み取る権限が含まれています

- **Cluster ReadWrite(Cluster_RW)**:インスタンスデータを読み書きする権限が含まれています

- **ClusterAdmin(Cluster_Admin)**:インスタンスデータを読み書きし、インスタンスを管理する権限が含まれています。

次の表に、クラスターレベルの3つの組み込み特権グループに含まれる特定の特権を示します。

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>クラスタReadOnly</strong></p></th>
     <th><p><strong>ClusterReadWrite</strong></p></th>
     <th><p><strong>クラスタ管理</strong></p></th>
   </tr>
   <tr>
     <td><p>リストデータベース</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>RenameCollectionファイル</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateOwnershipを作成する</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Userを更新</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropOwnershipの利用</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnershipを選択してください。</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnershipの管理</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>SelectUserを選択してください。</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>バックアップRBAC</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>RBACの復元</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroupの作成</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroupを削除する</p></td>
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
     <td><p>ListResourceGroupsのリスト</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>Transfer Node</p></td>
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
     <td><p>データベースの作成</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ドロップデータベース</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>フラッシュオール</p></td>
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
     <td><p>DropPrivilegeGroupを削除する</p></td>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>✔️</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroupsのリスト</p></td>
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

### カスタム権限グループ{#custom-privilege-groups}

組み込みの特権がニーズを満たさない場合は、S DKを使用してカスタム特権グループを作成し、特権グループに指定された特権を追加できます。 

<Admonition type="info" icon="📘" title="ノート">

<p>カスタム権限グループを作成および管理するには、この機能を有効にするために<a href="http://support.zilliz.com">サポートチケットを作成する</a>を使用してください。</p>

</Admonition>

#### カスタム特権グループを作成する{#create-a-custom-privilege-group}

次の例は、`privilege_group_1`という名前の特権グループを作成する方法を示しています。

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

カスタム特権グループが作成されたら、特権グループに特権を追加できます。

#### カスタム権限グループに権限を追加する{#add-privileges-to-a-custom-privilege-group}

以下の例は、作成した特権グループ`privilege_group_1`に`PrivilegeBackupRBAC`と`PrivilegeRestoreRBAC`の特権を追加する方法を示しています。Zilliz Cloudで利用可能なすべての特権の詳細については、[すべての特権](./cluster-privileges#all-privileges)を参照してください。

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

権限グループに権限を追加すると、ロールに権限グループを付与できます。詳細については、[クラスタロールの管理(SDK)](./cluster-roles-sdk#grant-a-privilege-or-a-privilege-group-to-a-role)を参照してください。

#### カスタム特権グループから特権を削除する{#remove-privileges-from-a-custom-privilege-group}

次の例は、特権グループ`privilege_group_1`から特権`PrivilegeRestoreRBAC`を削除する方法を示しています。

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

#### 特権グループの一覧{#list-privilege-groups}

次の例は、既存のすべての特権グループを一覧表示する方法を示しています。

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

#### カスタム特権グループを削除する{#drop-a-custom-privilege-group}

次の例は、特権グループ`privilege_group_1`を削除する方法を示しています。

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

## すべての特権{#all-privileges}

以下は、Zilliz Cloudで利用可能なすべての権限です。 

以下の権限を持つ独自の権限グループを作成する必要がある場合、または権限を持つカスタムロールを作成する必要がある場合は、[お問い合わせ](http://support.zilliz.com)を使用してください。

### データベースの権限{#database-privileges}

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>リストデータベース</p></td>
     <td><p>現在のインスタンスのすべてのデータベースを表示する</p></td>
   </tr>
   <tr>
     <td><p>データベースの説明</p></td>
     <td><p>データベースの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>データベースの作成</p></td>
     <td><p>データベースを作成する</p></td>
   </tr>
   <tr>
     <td><p>ドロップデータベース</p></td>
     <td><p>データベースを削除</p></td>
   </tr>
   <tr>
     <td><p>AlterDatabaseデータベース</p></td>
     <td><p>データベースのプロパティを変更する</p></td>
   </tr>
</table>

### コレクション権限{#collection-privileges}

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>GetFlushStateの状態</p></td>
     <td><p>コレクションフラッシュ操作の状態を確認する</p></td>
   </tr>
   <tr>
     <td><p>GetLoadStateの状態</p></td>
     <td><p>コレクションのロード状態を確認する</p></td>
   </tr>
   <tr>
     <td><p>GetLoadingプログレス</p></td>
     <td><p>コレクションの読み込み状況を確認する</p></td>
   </tr>
   <tr>
     <td><p>コレクションを表示</p></td>
     <td><p>コレクション権限を持つすべてのコレクションを表示する</p></td>
   </tr>
   <tr>
     <td><p>ListAliasesのリスト</p></td>
     <td><p>コレクションのすべてのエイリアスを表示する</p></td>
   </tr>
   <tr>
     <td><p>DescribeCollectionの説明</p></td>
     <td><p>コレクションの詳細を見る</p></td>
   </tr>
   <tr>
     <td><p>DescribeAliasの説明</p></td>
     <td><p>エイリアスの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>GetStatisticsの設定</p></td>
     <td><p>コレクションの統計情報を取得する（例:コレクション内のエンティティの数）</p></td>
   </tr>
   <tr>
     <td><p>CreateCollectionを作成する</p></td>
     <td><p>コレクションを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropCollectionを削除する</p></td>
     <td><p>コレクションを削除する</p></td>
   </tr>
   <tr>
     <td><p>ロードする</p></td>
     <td><p>コレクションをロードする</p></td>
   </tr>
   <tr>
     <td><p>リリース</p></td>
     <td><p>コレクションをリリースする</p></td>
   </tr>
   <tr>
     <td><p>フラッシュ</p></td>
     <td><p>コレクション内のすべてのエンティティをシールされたセグメントに保持します。フラッシュ操作の後に挿入されたエンティティは、新しいセグメントに保存されます。</p></td>
   </tr>
   <tr>
     <td><p>コンパクション</p></td>
     <td><p>手動で圧縮をトリガーする</p></td>
   </tr>
   <tr>
     <td><p>RenameCollectionファイル</p></td>
     <td><p>コレクションの名前を変更する</p></td>
   </tr>
   <tr>
     <td><p>CreateAliasの作成</p></td>
     <td><p>コレクションのエイリアスを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropAliasの設定</p></td>
     <td><p>コレクションのエイリアスを削除する</p></td>
   </tr>
   <tr>
     <td><p>フラッシュオール</p></td>
     <td><p>データベース内のすべてのコレクションをフラッシュする</p></td>
   </tr>
</table>

### パーティションの権限{#partition-privileges}

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>パーティションHasPartition</p></td>
     <td><p>パーティションが存在するかどうかを確認する</p></td>
   </tr>
   <tr>
     <td><p>パーティションを表示</p></td>
     <td><p>コレクション内のすべてのパーティションを表示する</p></td>
   </tr>
   <tr>
     <td><p>パーティションの作成</p></td>
     <td><p>パーティションを作成する</p></td>
   </tr>
   <tr>
     <td><p>Dropパーティション</p></td>
     <td><p>パーティションを削除する</p></td>
   </tr>
</table>

### インデックス権限{#index-privileges}

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>In dexDetailの詳細</p></td>
     <td><p>インデックスの詳細を表示する</p></td>
   </tr>
   <tr>
     <td><p>CreateIn dexを作成する</p></td>
     <td><p>インデックスを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropIn dex</p></td>
     <td><p>インデックスを削除</p></td>
   </tr>
</table>

### リソース管理の権限{#resource-management-privileges}

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>ロードバランス</p></td>
     <td><p>ロードバランスを実現する</p></td>
   </tr>
   <tr>
     <td><p>CreateResourceGroupの作成</p></td>
     <td><p>リソースグループを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropResourceGroupを削除する</p></td>
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
     <td><p>ListResourceGroupsのリスト</p></td>
     <td><p>現在のインスタンスのすべてのリソースグループを表示する</p></td>
   </tr>
   <tr>
     <td><p>Transfer Node</p></td>
     <td><p>リソースグループ間でノードを転送する</p></td>
   </tr>
   <tr>
     <td><p>TransferReplica</p></td>
     <td><p>リソースグループ間でレプリカを転送する</p></td>
   </tr>
   <tr>
     <td><p>バックアップRBAC</p></td>
     <td><p>現在のインスタンス内のすべてのRBAC関連操作のバックアップを作成してください</p></td>
   </tr>
   <tr>
     <td><p>RBACの復元</p></td>
     <td><p>現在のインスタンス内のすべてのRBAC関連操作のバックアップを復元します</p></td>
   </tr>
</table>

### エンティティの権限{#entity-privileges}

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>クエリ</p></td>
     <td><p>クエリを実行する</p></td>
   </tr>
   <tr>
     <td><p>検索する</p></td>
     <td><p>検索を行う</p></td>
   </tr>
   <tr>
     <td><p>挿入する</p></td>
     <td><p>図形を挿入</p></td>
   </tr>
   <tr>
     <td><p>削除する</p></td>
     <td><p>エンティティを削除</p></td>
   </tr>
   <tr>
     <td><p>アップサート</p></td>
     <td><p>図形をUpsert</p></td>
   </tr>
   <tr>
     <td><p>インポート</p></td>
     <td><p>一括挿入または図形のインポート</p></td>
   </tr>
</table>

### RBACの権限{#rbac-privileges}

<table>
   <tr>
     <th><p><strong>特典</strong></p></th>
     <th><p><strong>の説明</strong></p></th>
   </tr>
   <tr>
     <td><p>CreateOwnershipを作成する</p></td>
     <td><p>ユーザーまたはロールを作成する</p></td>
   </tr>
   <tr>
     <td><p>Userを更新</p></td>
     <td><p>ユーザーのパスワードを更新する</p></td>
   </tr>
   <tr>
     <td><p>DropOwnershipの利用</p></td>
     <td><p>ユーザーパスワードまたはロールを削除する</p></td>
   </tr>
   <tr>
     <td><p>SelectOwnershipを選択してください。</p></td>
     <td><p>特定の役割が付与されたすべてのユーザーを表示する</p></td>
   </tr>
   <tr>
     <td><p>ManageOwnershipの管理</p></td>
     <td><p>ユーザーまたは役割を管理するか、ユーザーに役割を付与する</p></td>
   </tr>
   <tr>
     <td><p>SelectUserを選択してください。</p></td>
     <td><p>ユーザーに付与されたすべてのロールを表示する</p></td>
   </tr>
   <tr>
     <td><p>CreatePrivilegeGroup</p></td>
     <td><p>特権グループを作成する</p></td>
   </tr>
   <tr>
     <td><p>DropPrivilegeGroupを削除する</p></td>
     <td><p>特権グループを削除する</p></td>
   </tr>
   <tr>
     <td><p>ListPrivilegeGroupsのリスト</p></td>
     <td><p>現在のインスタンスのすべての特権グループを表示する</p></td>
   </tr>
   <tr>
     <td><p>OperatePrivilegeGroup</p></td>
     <td><p>特権グループに特権を追加または削除する</p></td>
   </tr>
</table>

