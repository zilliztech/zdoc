---
title: "権限と権限グループ | Cloud"
slug: /cluster-privileges
sidebar_label: "権限と権限グループ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "権限とは、clusters、databases、collections などの特定の Zilliz Cloud リソースに対する特定操作の許可を指します。権限は roles に割り当てられ、その roles が users に付与されることで、users がリソースに対して実行できる操作が定義されます。権限の例としては、`collection01` という名前の collection にデータを挿入する許可があります。 | Cloud"
type: origin
token: NitBwKVzzi0hXBkjdDFcfwRsngb
sidebar_position: 8
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 権限と権限グループ

**権限**とは、clusters、databases、collections などの特定の Zilliz Cloud リソースに対する特定操作の許可を指します。権限は roles に割り当てられ、その roles が users に付与されることで、users がリソースに対して実行できる操作が定義されます。権限の例としては、`collection_01` という名前の collection にデータを挿入する許可があります。 

**権限グループ**は、個々の権限を組み合わせたものです。よく使われる権限をまとめた権限グループを作成することで、role の付与プロセスを簡素化できます。使いやすさのために、Zilliz Cloud では collection、database、cluster レベルで合計 9 つの組み込み権限グループを提供しています。

次の図は、権限と権限グループの付与プロセスの違いを示しています。

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

このトピックでは、Zilliz Cloud で利用可能な組み込み権限グループと権限について詳しく説明します。 

## 権限グループ\{#privilege-group}

### 組み込み権限グループ\{#built-in-privilege-groups}

Zilliz Cloud は、collection、database、cluster レベルで合計 9 つの組み込み権限グループを提供しており、[role の作成](./cluster-roles)時に直接付与できます。 

<Admonition type="info" icon="📘" title="注意">

3 つのレベルの組み込み権限グループには、カスケード関係はありません。cluster レベルで権限グループを設定しても、その instance 配下のすべての databases と collections に自動的に権限が設定されるわけではありません。database レベルおよび collection レベルの権限は手動で設定する必要があります。

</Admonition>

#### Collection レベルの権限グループ\{#collection-level-privilege-groups}

- **CollectionReadOnly (COLL_RO)**: collection データを読み取る権限を含みます

- **CollectionReadWrite (COLL_RW)**: collection データの読み取りと書き込みの権限を含みます

- **CollectionAdmin (COLL_ADMIN)**: collection データの読み取りと書き込み、および collection の管理権限を含みます。

以下の表は、collection レベルの 3 つの組み込み権限グループに含まれる具体的な権限を示しています。

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

#### Database レベルの権限グループ\{#database-level-privilege-groups}

- **DatabaseReadOnly (DB_RO)**: database データを読み取る権限を含みます

- **DatabaseReadWrite (DB_RW)**: database データの読み取りと書き込みの権限を含みます

- **DatabaseAdmin (DB_Admin)**: database データの読み取りと書き込み、および database の管理権限を含みます。

以下の表は、database レベルの 3 つの組み込み権限グループに含まれる具体的な権限を示しています。

| **Privilege** | **DatabaseReadOnly** | **DatabaseReadWrite** | **DatabaseAdmin** |
| --- | --- | --- | --- |
| ShowCollections | ✔️ | ✔️ | ✔️ |
| DescribeDatabase | ✔️ | ✔️ | ✔️ |
| CreateCollection | ❌ | ✔️ | ✔️ |
| DropCollection | ❌ | ✔️ | ✔️ |
| AlterDatabase | ❌ | ❌ | ❌ |

#### Cluster レベルの権限グループ\{#cluster-level-privilege-groups}

- **ClusterReadOnly (Cluster_RO)**: instance データを読み取る権限を含みます

- **ClusterReadWrite (Cluster_RW)**: instance データの読み取りと書き込みの権限を含みます

- **ClusterAdmin (Cluster_Admin)**: instance データの読み取りと書き込み、および instance の管理権限を含みます。

以下の表は、cluster レベルの 3 つの組み込み権限グループに含まれる具体的な権限を示しています。

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

### カスタム権限グループ | PRIVATE\{#custom-privilege-groups}

組み込み権限が要件を満たさない場合は、SDK を使用してカスタム権限グループを作成し、指定した権限をその権限グループに追加できます。 

<Admonition type="info" icon="📘" title="📘 注意">

これは **Private Preview** の機能です。この機能を利用するには、[サポートチケットを作成](http://support.zilliz.com)して有効化を依頼してください。

</Admonition>

#### カスタム権限グループを作成する\{#create-a-custom-privilege-group}

次の例は、`privilege_group_1` という名前の権限グループを作成する方法を示しています。

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

カスタム権限グループが作成されたら、その権限グループに権限を追加できます。

#### カスタム権限グループに権限を追加する\{#add-privileges-to-a-custom-privilege-group}

次の例は、作成したばかりの権限グループ `privilege_group_1` に、権限 `PrivilegeBackupRBAC` と `PrivilegeRestoreRBAC` を追加する方法を示しています。Zilliz Cloud で利用可能なすべての権限の詳細については、[すべての権限](./cluster-privileges#all-privileges)を参照してください。

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

権限が権限グループに追加されると、その権限グループを role に付与できます。詳細については、[Cluster Roles の管理 (SDK)](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) を参照してください。

#### カスタム権限グループから権限を削除する\{#remove-privileges-from-a-custom-privilege-group}

次の例は、権限グループ `privilege_group_1` から権限 `PrivilegeRestoreRBAC` を削除する方法を示しています。

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

#### 権限グループを一覧表示する\{#list-privilege-groups}

次の例は、既存のすべての権限グループを一覧表示する方法を示しています。

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

#### カスタム権限グループを削除する\{#drop-a-custom-privilege-group}

次の例は、権限グループ `privilege_group_1` を削除する方法を示しています。

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

以下は、Zilliz Cloud で利用可能なすべての権限です。 

以下に挙げる権限を使って独自の権限グループを作成したい場合、または権限を持つカスタム role を作成したい場合は、[お問い合わせ](http://support.zilliz.com)ください。

### Database 権限\{#database-privileges}

| **Privilege** | **Description** |
| --- | --- |
| ListDatabases | 現在の instance 内のすべての databases を表示する |
| DescribeDatabase | database の詳細を表示する |
| CreateDatabase | database を作成する |
| DropDatabase | database を削除する |
| AlterDatabase | database のプロパティを変更する |

### Collection 権限\{#collection-privileges}

| **Privilege** | **Description** |
| --- | --- |
| GetFlushState | collection の flush 操作の状態を確認する |
| GetLoadState | collection の load 状態を確認する |
| GetLoadingProgress | collection の loading 進捗を確認する |
| ShowCollections | collection 権限を持つすべての collections を表示する |
| ListAliases | collection のすべての aliases を表示する |
| DescribeCollection | collection の詳細を表示する |
| DescribeAlias | alias の詳細を表示する |
| GetStatistics | collection の統計情報を取得する（例: collection 内の entities 数） |
| CreateCollection | collection を作成する |
| DropCollection | collection を削除する |
| Load | collection を load する |
| Release | collection を release する |
| Flush | collection 内のすべての entities を sealed segment に永続化します。flush 操作後に挿入された entity は新しい segment に保存されます。 |
| Compaction | compaction を手動でトリガーする |
| RenameCollection | collection の名前を変更する |
| CreateAlias | collection の alias を作成する |
| DropAlias | collection の alias を削除する |
| FlushAll | database 内のすべての collections を flush する |
| AddCollectionField | 既存の collection に field を追加する |

### Partition 権限\{#partition-privileges}

| **Privilege** | **Description** |
| --- | --- |
| HasPartition | partition が存在するかどうかを確認する |
| ShowPartitions | collection 内のすべての partitions を表示する |
| CreatePartition | partition を作成する |
| DropPartition | partition を削除する |

### Index 権限\{#index-privileges}

| **Privilege** | **Description** |
| --- | --- |
| IndexDetail | index の詳細を表示する |
| CreateIndex | index を作成する |
| DropIndex | index を削除する |

### リソース管理権限\{#resource-management-privileges}

| **Privilege** | **Description** |
| --- | --- |
| LoadBalance | 負荷分散を実現する |
| CreateResourceGroup | リソースグループを作成する |
| DropResourceGroup | リソースグループを削除する |
| UpdateResourceGroups | リソースグループを更新する |
| DescribeResourceGroup | リソースグループの詳細を表示する |
| ListResourceGroups | 現在の instance のすべてのリソースグループを表示する |
| TransferNode | リソースグループ間で nodes を移動する |
| TransferReplica | リソースグループ間で replicas を移動する |
| BackupRBAC | 現在の instance 内のすべての RBAC 関連操作のバックアップを作成する |
| RestoreRBAC | 現在の instance 内のすべての RBAC 関連操作のバックアップを復元する |

### Entity 権限\{#entity-privileges}

| **Privilege** | **Description** |
| --- | --- |
| Query | query を実行する |
| Search | search を実行する |
| Insert | entities を挿入する |
| Delete | entities を削除する |
| Upsert | entities を upsert する |
| Import | entities を一括挿入または import する |

### RBAC 権限\{#rbac-privileges}

| **Privilege** | **Description** |
| --- | --- |
| CreateOwnership | user または role を作成する |
| UpdateUser | user のパスワードを更新する |
| DropOwnership | user パスワードまたは role を削除する |
| SelectOwnership | 特定の role が付与されているすべての users を表示する |
| ManageOwnership | user または role を管理する、あるいは user に role を付与する |
| SelectUser | user に付与されているすべての roles を表示する |
| CreatePrivilegeGroup | 権限グループを作成する |
| DropPrivilegeGroup | 権限グループを削除する |
| ListPrivilegeGroups | 現在の instance 内のすべての権限グループを表示する |
| OperatePrivilegeGroup | 権限グループに権限を追加する、または権限グループから権限を削除する |

