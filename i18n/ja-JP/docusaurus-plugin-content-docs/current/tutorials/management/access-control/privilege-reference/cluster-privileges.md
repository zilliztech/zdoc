---
title: "クラスターリソース権限と権限グループ | Cloud"
slug: /cluster-privileges
sidebar_label: "クラスター権限と権限グループ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "**権限**とは、クラスター、データベース、コレクションなどの Zilliz Cloud リソースに対して特定の操作を実行するための許可を指します。権限はロールに割り当てられ、そのロールがユーザーに付与されることで、ユーザーがリソース上で実行できる操作が定義されます。例えば、`collection01` という名前のコレクションにデータを挿入する許可などが権限の一例です。 | Cloud"
type: origin
token: NitBwKVzzi0hXBkjdDFcfwRsngb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターリソース権限と権限グループ

**権限**とは、クラスター、データベース、コレクションなどの Zilliz Cloud リソースに対して特定の操作を実行するための許可を指します。権限はロールに割り当てられ、そのロールがユーザーに付与されることで、ユーザーがリソース上で実行できる操作が定義されます。例えば、`collection_01` という名前のコレクションにデータを挿入する許可などが権限の一例です。

**権限グループ**は、個々の権限を組み合わせたものです。よく使う権限をまとめて権限グループを作成することで、ロール付与の手順を簡素化できます。利便性向上のため、Zilliz Cloud ではコレクション、データベース、クラスターの各レベルに合計 9 つの組み込み権限グループを用意しています。

次の図は、個別の権限と権限グループそれぞれの付与プロセスの違いを示しています。

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

このトピックでは、Zilliz Cloud で利用可能な組み込み権限グループおよび権限について詳しく説明します。

## 権限グループ\{#privilege-group}

### 組み込み権限グループ\{#built-in-privilege-groups}

Zilliz Cloud では、コレクション、データベース、クラスターの各レベルに合計 9 つの組み込み権限グループが用意されており、[ロールの作成](./cluster-roles)時に直接付与できます。

<Admonition type="info" icon="📘" title="Notes">

これら 3 つのレベルの組み込み権限グループの間にはカスケード関係はありません。クラスターレベルで権限グループを設定しても、そのインスタンス配下のすべてのデータベースやコレクションに自動的に権限が適用されるわけではありません。データベースレベルおよびコレクションレベルの権限は、それぞれ手動で設定する必要があります。

</Admonition>

#### コレクションレベルの権限グループ\{#collection-level-privilege-groups}

- **CollectionReadOnly (COLL_RO)**: コレクションデータの読み取り権限を含みます。

- **CollectionReadWrite (COLL_RW)**: コレクションデータの読み取りおよび書き込み権限を含みます。

- **CollectionAdmin (COLL_ADMIN)**: コレクションデータの読み取り・書き込み、およびコレクション管理の権限を含みます。

次の表に、コレクションレベルの 3 つの組み込み権限グループに含まれる具体的な権限の一覧を示します。

| **権限** | **CollectionReadOnly** | **CollectionReadWrite** | **CollectionAdmin** |
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

#### データベースレベルの権限グループ\{#database-level-privilege-groups}

- **DatabaseReadOnly (DB_RO)**: データベースデータの読み取り権限を含みます。

- **DatabaseReadWrite (DB_RW)**: データベースデータの読み取りおよび書き込み権限を含みます。

- **DatabaseAdmin (DB_Admin)**: データベースデータの読み取り・書き込み、およびデータベース管理の権限を含みます。

次の表に、データベースレベルの 3 つの組み込み権限グループに含まれる具体的な権限の一覧を示します。

| **権限** | **DatabaseReadOnly** | **DatabaseReadWrite** | **DatabaseAdmin** |
| --- | --- | --- | --- |
| ShowCollections | ✔️ | ✔️ | ✔️ |
| DescribeDatabase | ✔️ | ✔️ | ✔️ |
| CreateCollection | ❌ | ✔️ | ✔️ |
| DropCollection | ❌ | ✔️ | ✔️ |
| AlterDatabase | ❌ | ❌ | ❌ |

#### クラスターレベルの権限グループ\{#cluster-level-privilege-groups}

- **ClusterReadOnly (Cluster_RO)**: インスタンスデータの読み取り権限を含みます。

- **ClusterReadWrite (Cluster_RW)**: インスタンスデータの読み取りおよび書き込み権限を含みます。

- **ClusterAdmin (Cluster_Admin)**: インスタンスデータの読み取り・書き込み、およびインスタンス管理の権限を含みます。

次の表に、クラスターレベルの 3 つの組み込み権限グループに含まれる具体的な権限の一覧を示します。

| **権限** | **ClusterReadOnly** | **ClusterReadWrite** | **ClusterAdmin** |
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

組み込み権限で要件を満たせない場合は、SDK を使用してカスタム権限グループを作成し、任意の権限を追加できます。

<Admonition type="info" icon="📘" title="📘 Notes">

本機能は **Private Preview** です。ご利用をご希望の場合は、[サポートチケットを作成](http://support.zilliz.com)してお申し込みください。有効化の手続きを行います。

</Admonition>

#### カスタム権限グループの作成\{#create-a-custom-privilege-group}

次の例では、`privilege_group_1` という名前の権限グループを作成する方法を示します。

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

カスタム権限グループの作成後、そのグループに権限を追加できます。

#### カスタム権限グループへの権限の追加\{#add-privileges-to-a-custom-privilege-group}

次の例では、作成したばかりの権限グループ `privilege_group_1` に権限 `PrivilegeBackupRBAC` と `PrivilegeRestoreRBAC` を追加する方法を示します。Zilliz Cloud で利用可能なすべての権限の詳細については、[すべての権限](./cluster-privileges#all-privileges) を参照してください。

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

権限グループに権限を追加したら、その権限グループをロールに付与できます。詳細については、[Manage クラスター Roles (SDK)](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) を参照してください。

#### カスタム権限グループからの権限の削除\{#remove-privileges-from-a-custom-privilege-group}

次の例では、権限グループ `privilege_group_1` から権限 `PrivilegeRestoreRBAC` を削除する方法を示します。

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

#### 権限グループの一覧表示\{#list-privilege-groups}

次の例では、既存のすべての権限グループを一覧表示する方法を示します。

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

次の例では、権限グループ `privilege_group_1` を削除する方法を示します。

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

以下の権限を使用して独自の権限グループを作成する場合や、特定の権限を持つカスタムロールを作成する場合は、[お問い合わせください](http://support.zilliz.com)。

### データベース権限\{#database-privileges}

| **権限** | **説明** |
| --- | --- |
| ListDatabases | 現在のインスタンス内のすべてのデータベースを表示します。 |
| DescribeDatabase | データベースの詳細を表示します。 |
| CreateDatabase | データベースを作成します。 |
| DropDatabase | データベースを削除します。 |
| AlterDatabase | データベースのプロパティを変更します。 |

### コレクション権限\{#collection-privileges}

| **権限** | **説明** |
| --- | --- |
| GetFlushState | コレクションの flush 操作のステータスを確認します。 |
| GetLoadState | コレクションのロードステータスを確認します。 |
| GetLoadingProgress | コレクションのロード進行状況を確認します。 |
| ShowCollections | コレクション権限を持つすべてのコレクションを表示します。 |
| ListAliases | コレクションのすべてのエイリアスを表示します。 |
| DescribeCollection | コレクションの詳細を表示します。 |
| DescribeAlias | エイリアスの詳細を表示します。 |
| GetStatistics | コレクションの統計情報（例：コレクション内のエンティティ数）を取得します。 |
| CreateCollection | コレクションを作成します。 |
| DropCollection | コレクションを削除します。 |
| Load | コレクションをロードします。 |
| Release | コレクションをリリースします。 |
| Flush | コレクション内のすべてのエンティティを sealed segment に永続化します。flush 操作後に挿入されたエンティティは、新しい segment に保存されます。 |
| Compaction | 手動で Compaction をトリガーします。 |
| RenameCollection | コレクションの名前を変更します。 |
| CreateAlias | コレクションのエイリアスを作成します。 |
| DropAlias | コレクションのエイリアスを削除します。 |
| FlushAll | データベース内のすべてのコレクションを flush します。 |
| AddCollectionField | 既存のコレクションにフィールドを追加します。 |

### パーティション権限\{#partition-privileges}

| **権限** | **説明** |
| --- | --- |
| HasPartition | パーティションの存在を確認します |
| ShowPartitions | コレクション内のすべてのパーティションを表示します |
| CreatePartition | パーティションを作成します |
| DropPartition | パーティションを削除します |

### インデックス権限\{#index-privileges}

| **権限** | **説明** |
| --- | --- |
| IndexDetail | インデックスの詳細を表示します |
| CreateIndex | インデックスを作成します |
| DropIndex | インデックスを削除します |

### リソース管理権限\{#resource-management-privileges}

| **権限** | **説明** |
| --- | --- |
| LoadBalance | 負荷分散を実行します |
| CreateResourceGroup | リソースグループを作成します |
| DropResourceGroup | リソースグループを削除します |
| UpdateResourceGroups | リソースグループを更新します |
| DescribeResourceGroup | リソースグループの詳細を表示します |
| ListResourceGroups | 現在のインスタンスのすべてのリソースグループを表示します |
| TransferNode | リソースグループ間でノードを移動します |
| TransferReplica | リソースグループ間でレプリカを移動します |
| BackupRBAC | 現在のインスタンスのすべての RBAC 関連操作のバックアップを作成します |
| RestoreRBAC | 現在のインスタンスのすべての RBAC 関連操作のバックアップを復元します |

### エンティティ権限\{#entity-privileges}

| **権限** | **説明** |
| --- | --- |
| Query | クエリを実行します |
| Search | 検索を実行します |
| Insert | エンティティを挿入します |
| Delete | エンティティを削除します |
| Upsert | エンティティをアップサートします |
| Import | エンティティを一括挿入またはインポートします |

### RBAC 権限\{#rbac-privileges}

| **権限** | **説明** |
| --- | --- |
| CreateOwnership | ユーザーまたはロールを作成します |
| UpdateUser | ユーザーのパスワードを更新します |
| DropOwnership | ユーザーのパスワードまたはロールを削除します |
| SelectOwnership | 特定のロールが付与されているすべてのユーザーを表示します |
| ManageOwnership | ユーザーやロールの管理、またはユーザーへのロール付与を行います |
| SelectUser | ユーザーに付与されているすべてのロールを表示します |
| CreatePrivilegeGroup | 権限グループを作成します |
| DropPrivilegeGroup | 権限グループを削除します |
| ListPrivilegeGroups | 現在のインスタンスのすべての権限グループを表示します |
| OperatePrivilegeGroup | 権限グループへの権限の追加または削除を行います |
