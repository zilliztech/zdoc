---
title: "クラスターリソースの権限と権限グループ | BYOC"
slug: /cluster-privileges
sidebar_label: "クラスターの権限と権限グループ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "権限とは、クラスター、データベース、コレクションなどの特定の Zilliz Cloud リソースに対して特定の操作を実行する許可を指します。権限はロールに割り当てられ、そのロールがユーザーに付与されることで、ユーザーがリソースに対して実行できる操作が定義されます。権限の例として、`collection01` という名前のコレクションにデータを挿入する許可が挙げられます。 | BYOC"
type: origin
token: NitBwKVzzi0hXBkjdDFcfwRsngb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターリソースの権限と権限グループ

**権限**とは、クラスター、データベース、コレクションなどの特定の Zilliz Cloud リソースに対して、特定の操作を実行する許可を指します。権限はロールに割り当てられ、そのロールがユーザーに付与されることで、リソースに対してユーザーが実行できる操作が定義されます。権限の例として、`collection_01` という名前のコレクションにデータを挿入する許可が挙げられます。 

**権限グループ**は、個々の権限を組み合わせたものです。よく使用する権限をまとめた権限グループを作成すると、ロールの付与プロセスを簡素化できます。使いやすさのため、Zilliz Cloud では、コレクション、データベース、クラスターの各レベルで合計 9つの組み込み権限グループを提供しています。

次の図は、権限と権限グループの異なる付与プロセスを示しています。

![SsW6w8kaNhz4iQbEMYmcbUzsnOc](https://zdoc-images.s3.us-west-2.amazonaws.com/SsW6w8kaNhz4iQbEMYmcbUzsnOc.png)

このトピックでは、Zilliz Cloud で利用可能な組み込み権限グループと権限について詳しく説明します。 

## 権限グループ\{#privilege-group}

### 組み込み権限グループ\{#built-in-privilege-groups}

Zilliz Cloud では、コレクション、データベース、クラスターの各レベルで合計 9つの組み込み権限グループを提供しており、[ロールを作成する](./cluster-roles) ときに直接付与できます。 

<Admonition type="info" title="Notes">

3つのレベルの組み込み権限グループにはカスケード関係はありません。クラスターレベルで権限グループを設定しても、そのインスタンス配下のすべてのデータベースとコレクションに権限が自動的に設定されるわけではありません。データベースレベルとコレクションレベルの権限は手動で設定する必要があります。

</Admonition>

#### コレクションレベルの権限グループ\{#collection-level-privilege-groups}

- **CollectionReadOnly (COLL_RO)**: コレクションデータを読み取る権限が含まれます。

- **CollectionReadWrite (COLL_RW)**: コレクションデータの読み取りと書き込みを行う権限が含まれます。

- **CollectionAdmin (COLL_ADMIN)**: コレクションデータの読み取りと書き込み、およびコレクションの管理を行う権限が含まれます。

次の表は、コレクションレベルで 3つの組み込み権限グループに含まれる具体的な権限を示しています。

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

- **DatabaseReadOnly (DB_RO)**: データベースデータを読み取る権限が含まれます。

- **DatabaseReadWrite (DB_RW)**: データベースデータの読み取りと書き込みを行う権限が含まれます。

- **DatabaseAdmin (DB_Admin)**: データベースデータの読み取りと書き込み、およびデータベースの管理を行う権限が含まれます。

次の表は、データベースレベルで 3つの組み込み権限グループに含まれる具体的な権限を示しています。

| **権限** | **DatabaseReadOnly** | **DatabaseReadWrite** | **DatabaseAdmin** |
| --- | --- | --- | --- |
| ShowCollections | ✔️ | ✔️ | ✔️ |
| DescribeDatabase | ✔️ | ✔️ | ✔️ |
| CreateCollection | ❌ | ✔️ | ✔️ |
| DropCollection | ❌ | ✔️ | ✔️ |
| AlterDatabase | ❌ | ❌ | ❌ |

#### クラスターレベルの権限グループ\{#cluster-level-privilege-groups}

- **ClusterReadOnly (Cluster_RO)**: インスタンスデータを読み取る権限が含まれます。

- **ClusterReadWrite (Cluster_RW)**: インスタンスデータの読み取りと書き込みを行う権限が含まれます。

- **ClusterAdmin (Cluster_Admin)**: インスタンスデータの読み取りと書き込み、およびインスタンスの管理を行う権限が含まれます。

次の表は、クラスターレベルで 3つの組み込み権限グループに含まれる具体的な権限を示しています。

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

組み込みの権限でニーズを満たせない場合は、SDK を使用してカスタム権限グループを作成し、指定した権限を権限グループに追加できます。 

<Admonition type="info" title="Notes">

これは **Private Preview** の機能です。この機能を利用するには、[サポートチケットを作成](http://support.zilliz.com) して、有効化を依頼してください。

</Admonition>

#### カスタム権限グループの作成\{#create-a-custom-privilege-group}

次の例では、`privilege_group_1` という名前の権限グループを作成する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.create_privilege_group(group_name='privilege_group_1')
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

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

err = client.CreatePrivilegeGroup(ctx, milvusclient.NewCreatePrivilegeGroupOption("privilege_group_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .create_privilege_group(
        CreatePrivilegeGroupRequest::builder()
            .group_name("privilege_group_1")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto status = client->CreatePrivilegeGroup(milvus::CreatePrivilegeGroupRequest().WithGroupName("privilege_group_1"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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

カスタム権限グループを作成したら、その権限グループに権限を追加できます。

#### カスタム権限グループへの権限の追加\{#add-privileges-to-a-custom-privilege-group}

次の例では、作成したばかりの権限グループ `privilege_group_1` に権限 `PrivilegeBackupRBAC` と `PrivilegeRestoreRBAC` を追加する方法を示します。Zilliz Cloud で利用可能なすべての権限の詳細については、[すべての権限](./cluster-privileges#all-privileges) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.add_privileges_to_group(group_name='privilege_group_1', privileges=['Query', 'Search'])
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.AddPrivilegesToGroupReq;
import java.util.Arrays;

client.addPrivilegesToGroup(AddPrivilegesToGroupReq.builder()
        .groupName("privilege_group_1")
        .privileges(Arrays.asList("Query", "Search"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

privileges := []string{"Query", "Search"}
err = client.AddPrivilegesToGroup(ctx, milvusclient.NewAddPrivilegesToGroupOption("privilege_group_1", privileges...))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .add_privileges_to_group(
        AddPrivilegesToGroupRequest::builder()
            .group_name("privilege_group_1")
            .privileges(["Query", "Search"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto status = client->AddPrivilegesToGroup(milvus::AddPrivilegesToGroupRequest()
                                              .WithGroupName("privilege_group_1")
                                              .WithPrivileges({"Query", "Search"}));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.addPrivilegesToGroup({
  group_name: "privilege_group_1",
  privileges: ["Query", "Search"],
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

権限グループに権限を追加したら、その権限グループをロールに付与できます。詳細については、[クラスターロールの管理（SDK）](./cluster-roles-sdk#grant-a-privilege-group-to-a-role) を参照してください。

#### カスタム権限グループからの権限の削除\{#remove-privileges-from-a-custom-privilege-group}

次の例では、権限グループ `privilege_group_1` から権限 `PrivilegeRestoreRBAC` を削除する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.remove_privileges_from_group(group_name='privilege_group_1', privileges=['Search'])
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.RemovePrivilegesFromGroupReq;
import java.util.Collections;

client.removePrivilegesFromGroup(RemovePrivilegesFromGroupReq.builder()
        .groupName("privilege_group_1")
        .privileges(Collections.singletonList("Search"))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

err = client.RemovePrivilegesFromGroup(ctx, milvusclient.NewRemovePrivilegesFromGroupOption("privilege_group_1", []string{"Search"}...))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .remove_privileges_from_group(
        RemovePrivilegesFromGroupRequest::builder()
            .group_name("privilege_group_1")
            .privileges(["Search"])
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto status = client->RemovePrivilegesFromGroup(milvus::RemovePrivilegesFromGroupRequest()
                                                    .WithGroupName("privilege_group_1")
                                                    .WithPrivileges({"Search"}));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.list_privilege_groups()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.PrivilegeGroup;
import io.milvus.v2.service.rbac.request.ListPrivilegeGroupsReq;
import io.milvus.v2.service.rbac.response.ListPrivilegeGroupsResp;
import java.util.List;

ListPrivilegeGroupsResp resp = client.listPrivilegeGroups(ListPrivilegeGroupsReq.builder()
        .build());
List<PrivilegeGroup> groups = resp.getPrivilegeGroups();
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

groups, err := client.ListPrivilegeGroups(ctx, milvusclient.NewListPrivilegeGroupsOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
for _, group := range groups {
    fmt.Println(group.GroupName, group.Privileges)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let resp = client
    .list_privilege_groups(ListPrivilegeGroupsRequest::builder().build()?)
    .await?;
for group in resp.groups() {
    println!("{}: {:?}", group.get_group_name(), group.get_privileges());
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

milvus::ListPrivilegeGroupsResponse resp;
auto status = client->ListPrivilegeGroups(milvus::ListPrivilegeGroupsRequest(), resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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

出力例は以下の通りです。

```bash
PrivilegeGroupItem: <privilege_group:privilege_group_1>, <privileges:('Search', 'Query')>
```

#### カスタム権限グループの削除\{#drop-a-custom-privilege-group}

次の例では、権限グループ `privilege_group_1` を削除する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient
client.drop_privilege_group(group_name='privilege_group_1')
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

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/milvusclient"

err = client.DropPrivilegeGroup(ctx, milvusclient.NewDropPrivilegeGroupOption("privilege_group_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .drop_privilege_group(
        DropPrivilegeGroupRequest::builder()
            .group_name("privilege_group_1")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto status = client->DropPrivilegeGroup(milvus::DropPrivilegeGroupRequest().WithGroupName("privilege_group_1"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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

Zilliz Cloud で利用可能なすべての権限は以下の通りです。 

以下に示す権限を含む独自の権限グループを作成する場合、または権限を持つカスタムロールを作成する場合は、[お問い合わせください](http://support.zilliz.com)。

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
| GetFlushState | コレクションのフラッシュ操作のステータスを確認します。 |
| GetLoadState | コレクションのロードステータスを確認します。 |
| GetLoadingProgress | コレクションのロード進行状況を確認します。 |
| ShowCollections | コレクション権限を持つすべてのコレクションを表示します。 |
| ListAliases | コレクションのすべてのエイリアスを表示します。 |
| DescribeCollection | コレクションの詳細を表示します。 |
| DescribeAlias | エイリアスの詳細を表示します。 |
| GetStatistics | コレクションの統計情報を取得します（例：コレクション内のエンティティ数）。 |
| CreateCollection | コレクションを作成します。 |
| DropCollection | コレクションを削除します。 |
| Load | コレクションをロードします。 |
| Release | コレクションをリリースします。 |
| Flush | コレクション内のすべてのエンティティをシールドセグメントに永続化します。フラッシュ操作の後に挿入されたエンティティは、新しいセグメントに格納されます。 |
| Compaction | Compaction を手動でトリガーします。 |
| RenameCollection | コレクションの名前を変更します。 |
| CreateAlias | コレクションのエイリアスを作成します。 |
| DropAlias | コレクションのエイリアスを削除します。 |
| FlushAll | データベース内のすべてのコレクションをフラッシュします。 |
| AddCollectionField | 既存のコレクションにフィールドを追加します。 |

### パーティション権限\{#partition-privileges}

| **権限** | **説明** |
| --- | --- |
| HasPartition | パーティションが存在するかどうかを確認します。 |
| ShowPartitions | コレクション内のすべてのパーティションを表示します。 |
| CreatePartition | パーティションを作成します。 |
| DropPartition | パーティションを削除します。 |

### インデックス権限\{#index-privileges}

| **権限** | **説明** |
| --- | --- |
| IndexDetail | インデックスの詳細を表示します。 |
| CreateIndex | インデックスを作成します。 |
| DropIndex | インデックスを削除します。 |

### リソース管理権限\{#resource-management-privileges}

| **権限** | **説明** |
| --- | --- |
| LoadBalance | ロードバランスを実現します。 |
| CreateResourceGroup | リソースグループを作成します。 |
| DropResourceGroup | リソースグループを削除します。 |
| UpdateResourceGroups | リソースグループを更新します。 |
| DescribeResourceGroup | リソースグループの詳細を表示します。 |
| ListResourceGroups | 現在のインスタンスのすべてのリソースグループを表示します。 |
| TransferNode | リソースグループ間でノードを転送します。 |
| TransferReplica | リソースグループ間でレプリカを転送します。 |
| BackupRBAC | 現在のインスタンス内のすべての RBAC 関連操作のバックアップを作成します。 |
| RestoreRBAC | 現在のインスタンス内のすべての RBAC 関連操作のバックアップを復元します。 |

### エンティティ権限\{#entity-privileges}

| **権限** | **説明** |
| --- | --- |
| Query | クエリを実行します。 |
| Search | 検索を実行します。 |
| Insert | エンティティを挿入します。 |
| Delete | エンティティを削除します。 |
| Upsert | エンティティをアップサートします。 |
| Import | エンティティを一括挿入またはインポートします。 |

### RBAC 権限\{#rbac-privileges}

| **権限** | **説明** |
| --- | --- |
| CreateOwnership | ユーザーまたはロールを作成します。 |
| UpdateUser | ユーザーのパスワードを更新します。 |
| DropOwnership | ユーザーのパスワードまたはロールを削除します。 |
| SelectOwnership | 特定のロールが付与されているすべてのユーザーを表示します。 |
| ManageOwnership | ユーザーまたはロールを管理するか、ユーザーにロールを付与します。 |
| SelectUser | ユーザーに付与されているすべてのロールを表示します。 |
| CreatePrivilegeGroup | 権限グループを作成します。 |
| DropPrivilegeGroup | 権限グループを削除します。 |
| ListPrivilegeGroups | 現在のインスタンス内のすべての権限グループを表示します。 |
| OperatePrivilegeGroup | 権限グループに権限を追加、または権限グループから権限を削除します。 |
