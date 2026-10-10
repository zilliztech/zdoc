---
title: "クラスターロールの管理（SDK） | Cloud"
slug: /cluster-roles-sdk
sidebar_label: "クラスターロールの管理（SDK）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。より具体的には、クラスターロールは、クラスター、データベース、コレクションの各レベルにおけるクラスターユーザーの権限を制御します。 | Cloud"
type: origin
token: PBZwwNqWjiikeYkXgHPcGhLznTh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターロールの管理（SDK）

クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。より具体的には、クラスターロールは、クラスター、データベース、コレクションの各レベルにおけるクラスターユーザーの権限を制御します。

このガイドでは、ロールの作成、ロールへの組み込み権限グループの付与、ロールからの権限グループの取り消し、最後にロールの削除の方法を順を追って説明します。組み込み権限グループの詳細については、[権限](./cluster-privileges#built-in-privilege-groups) を参照してください。

<Admonition type="info" title="Notes">

この機能は Dedicated クラスターでのみ利用できます。

</Admonition>

## ロールの作成\{#create-a-role}

次の例では、`role_a` という名前のロールを作成する方法を示します。 

ロール名は英字で始まる必要があり、使用できるのは大文字または小文字の英字、数字、およびアンダースコアのみです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.create_role(role_name="role_a", description="a cluster read only role")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.CreateRoleReq;
CreateRoleReq createRoleReq = CreateRoleReq.builder()
        .roleName("role_a")
        .description("a cluster read only role")
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.CreateRole(ctx, milvusclient.NewCreateRoleOption("role_a").WithDescription("a cluster read only role"))
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
    .create_role(
        CreateRoleRequest::builder()
            .role_name("role_a")
            .description("a cluster read only role")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateRole(milvus::CreateRoleRequest()
                                     .WithRoleName("role_a")
                                     .WithDescription("a cluster read only role"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

await client.createRole({
  roleName: 'role_a',
  description: 'a cluster read only role',
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "description": "a cluster read only role"
}' 
```

</TabItem>
</Tabs>

## ロールの一覧表示\{#list-roles}

複数のロールを作成した後は、既存のすべてのロールを一覧表示して確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.list_roles()
```

</TabItem>

<TabItem value='java'>

```java
List<String> roles = client.listRoles();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

roles, err := client.ListRoles(ctx, milvusclient.NewListRoleOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(roles)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let roles = client
    .list_roles(ListRolesRequest::builder().build()?)
    .await?;
println!("{:?}", roles.role_names());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::ListRolesResponse resp;
auto status = client->ListRoles(milvus::ListRolesRequest(), resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const roles = await client.listRoles();
console.log(roles);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}' 
```

</TabItem>
</Tabs>

以下は出力例です。`role_a` は、作成したばかりの新しいロールです。

```bash
['role_a']
```

## ロールへの権限グループの付与\{#grant-a-privilege-group-to-a-role}

Zilliz Cloud では、ロールに次のものを付与できます。

- **組み込み権限グループ:** Zilliz Cloud では 9つの組み込み権限グループが提供されています。各組み込み権限グループに含まれる具体的な権限の詳細については、[組み込み権限グループ](./cluster-privileges#built-in-privilege-groups) を参照してください。

- **カスタム権限グループ:** 組み込みの権限で要件を満たせない場合は、さまざまな権限を組み合わせて独自のカスタム権限グループを作成できます。詳細については、[カスタム権限グループ](./cluster-privileges#custom-privilege-groups) を参照してください。

<Admonition type="info" title="Notes">

- ロールにカスタム権限グループを付与する必要がある場合は、この機能を有効化できるよう、[サポートチケットを作成](http://support.zilliz.com) してください。

- Milvus 2.5.x 以降を実行しているクラスターでは、個別の権限はサポートされなくなりました。

</Admonition>

次の例では、`privilege_group_1` という名前のカスタム権限グループと、組み込み権限グループ `ClusterReadOnly` をロール `role_a` に付与する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.grant_privilege_v2(
    role_name="role_a",
    privilege="privilege_group_1",
    collection_name='collection_01',
    db_name='default',
)

client.grant_privilege_v2(
    role_name="role_a",
    privilege="ClusterReadOnly",
    collection_name='*',
    db_name='*',
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.GrantPrivilegeReqV2

client.grantPrivilegeV2(GrantPrivilegeReqV2.builder()
        .roleName("role_a")
        .privilege("privilege_group_1")
        .collectionName("collection_01")
        .dbName("default")
        .build());

client.grantPrivilegeV2(GrantPrivilegeReqV2.builder()
        .roleName("role_a")
        .privilege("ClusterReadOnly")
        .collectionName("*")
        .dbName("*")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.GrantV2(ctx, milvusclient.NewGrantV2Option("role_a", "privilege_group_1", "default", "collection_01"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.GrantV2(ctx, milvusclient.NewGrantV2Option("role_a", "ClusterReadOnly", "*", "*"))
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
    .grant_privilege(
        GrantPrivilegeRequest::builder()
            .role_name("role_a")
            .privilege("privilege_group_1")
            .database_name("default")
            .collection_name("collection_01")
            .build()?,
    )
    .await?;

client
    .grant_privilege(
        GrantPrivilegeRequest::builder()
            .role_name("role_a")
            .privilege("ClusterReadOnly")
            .database_name("*")
            .collection_name("*")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::GrantPrivilegeV2Request grant_req;
grant_req.WithRoleName("role_a")
         .WithPrivilege("privilege_group_1")
         .WithDatabaseName("default")
         .WithCollectionName("collection_01");
auto status = client->GrantPrivilegeV2(grant_req);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

await client.grantPrivilegeV2({
  role: 'role_a',
  privilege: 'privilege_group_1',
  collection_name: 'collection_01',
  db_name: 'default',
});

await client.grantPrivilegeV2({
  role: 'role_a',
  privilege: 'ClusterReadOnly',
  collection_name: '*',
  db_name: '*',
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/grant_privilege_v2" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "privilege": "privilege_group_1",
    "collectionName": "collection_01",
    "dbName":"default"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/grant_privilege_v2" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "privilege": "ClusterReadOnly",
    "collectionName": "*",
    "dbName":"*"
}' 
```

</TabItem>
</Tabs>

パラメーターとそれぞれの説明は以下のとおりです。

- **role_name:** 権限グループを付与する対象ロールの名前です。

- **privilege**: ロールに付与する権限グループです。使用可能なオプションについては、[権限と権限グループ](./cluster-privileges) を参照してください。

- **Resource**: 権限グループの対象リソースです。特定のクラスター、データベース、またはコレクションを指定できます。 

    次の表では、リソースの指定方法を説明します。

    <table>
       <tr>
         <th><p><strong>レベル</strong></p></th>
         <th><p><strong>リソース</strong></p></th>
         <th><p><strong>付与方法</strong></p></th>
         <th><p><strong>注意</strong></p></th>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>コレクション</strong></p></td>
         <td><p>特定のコレクション</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;CollectionAdmin&quot;,     collection_name=&quot;col1&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>対象コレクションの名前、および対象コレクションが属するデータベースの名前を入力します。</p></td>
       </tr>
       <tr>
         <td><p>特定のデータベース配下のすべてのコレクション</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;CollectionAdmin&quot;,     collection_name=&quot;&ast;&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>対象データベースの名前と、コレクション名としてのワイルドカード <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>データベース</strong></p></td>
         <td><p>特定のデータベース</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;DatabaseAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>対象データベースの名前と、コレクション名としてのワイルドカード <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td><p>現在のインスタンス配下のすべてのデータベース</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;DatabaseAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;&ast;&quot; )</code></pre></td>
         <td><p><code>&ast;</code> をデータベース名として、<code>&ast;</code> をコレクション名として入力します。</p></td>
       </tr>
       <tr>
         <td><p><strong>インスタンス</strong></p></td>
         <td><p>現在のインスタンス</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;ClusterAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;&ast;&quot; )</code></pre></td>
         <td><p><code>&ast;</code> をデータベース名として、<code>&ast;</code> をコレクション名として入力します。</p></td>
       </tr>
    </table>

## ロールの詳細表示\{#describe-a-role}

次の例では、`describe_role` メソッドを使用して、ロール `role_a` に付与されている権限を表示する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.describe_role(role_name="role_a")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.response.DescribeRoleResp;
import io.milvus.v2.service.rbac.request.DescribeRoleReq

DescribeRoleReq describeRoleReq = DescribeRoleReq.builder()
        .roleName("role_a")
        .build();
DescribeRoleResp resp = client.describeRole(describeRoleReq);
List<DescribeRoleResp.GrantInfo> infos = resp.getGrantInfos();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

role, err := client.DescribeRole(ctx, milvusclient.NewDescribeRoleOption("role_a"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(role)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let role = client
    .describe_role(
        DescribeRoleRequest::builder()
            .role_name("role_a")
            .build()?,
    )
    .await?;
println!("{:?}", role.role_name());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::DescribeRoleResponse resp;
auto status = client->DescribeRole(milvus::DescribeRoleRequest().WithRoleName("role_a"), resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const role = await client.describeRole({ roleName: 'role_a' });
console.log(role);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a"
}' 
```

</TabItem>
</Tabs>

以下は出力例です。 

```python
{
     "role": "role_a",
     "descripton": "a cluster read only role",
     "privilege": "ClusterReadOnly"
}
```

## ロールからの権限グループの取り消し\{#revoke-a-privilege-group-from-a-role}

次の例では、ロール `role_a` に付与されているカスタム権限グループ `privilege_group_1` と組み込み権限グループ `ClusterReadOnly` を取り消す方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.revoke_privilege_v2(
    role_name="role_a",
    privilege="privilege_group_1",
    collection_name='collection_01',
    db_name='default',
)

client.revoke_privilege_v2(
    role_name="role_a",
    privilege="ClusterReadOnly",
    collection_name='*',
    db_name='*',
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.RevokePrivilegeReqV2

client.revokePrivilegeV2(RevokePrivilegeReqV2.builder()
        .roleName("role_a")
        .privilege("privilege_group_1")
        .collectionName("collection_01")
        .dbName("default")
        .build());

client.revokePrivilegeV2(RevokePrivilegeReqV2.builder()
        .roleName("role_a")
        .privilege("ClusterReadOnly")
        .collectionName("*")
        .dbName("*")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
err = client.RevokePrivilegeV2(ctx, milvusclient.NewRevokePrivilegeV2Option("role_a", "privilege_group_1", "collection_01").
    WithDbName("default"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.RevokePrivilegeV2(ctx, milvusclient.NewRevokePrivilegeV2Option("role_a", "ClusterReadOnly", "*").
    WithDbName("*"))
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
    .revoke_privilege(
        RevokePrivilegeRequest::builder()
            .role_name("role_a")
            .privilege("privilege_group_1")
            .database_name("default")
            .collection_name("collection_01")
            .build()?,
    )
    .await?;

client
    .revoke_privilege(
        RevokePrivilegeRequest::builder()
            .role_name("role_a")
            .privilege("ClusterReadOnly")
            .database_name("*")
            .collection_name("*")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::RevokePrivilegeV2Request revoke_req;
revoke_req.WithRoleName("role_a")
           .WithPrivilege("privilege_group_1")
           .WithDatabaseName("default")
           .WithCollectionName("collection_01");
auto status = client->RevokePrivilegeV2(revoke_req);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

await client.revokePrivilegeV2({
  role: 'role_a',
  privilege: 'privilege_group_1',
  collection_name: 'collection_01',
  db_name: 'default',
});

await client.revokePrivilegeV2({
  role: 'role_a',
  privilege: 'ClusterReadOnly',
  collection_name: '*',
  db_name: '*',
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/revoke_privilege_v2" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "privilege": "privilege_group_1",
    "collectionName": "collection_01",
    "dbName":"default"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/revoke_privilege_v2" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "privilege": "ClusterReadOnly",
    "collectionName": "*",
    "dbName":"*"
}' 
```

</TabItem>
</Tabs>

## ロールの削除\{#drop-a-role}

次の例では、ロール `role_a` を削除する方法を示します。

<Admonition type="info" title="Notes">

組み込みロール `admin` は削除できません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.drop_role(role_name="role_a")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.DropRoleReq

DropRoleReq dropRoleReq = DropRoleReq.builder()
        .roleName("role_a")
        .build();
client.dropRole(dropRoleReq);
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropRole(ctx, milvusclient.NewDropRoleOption("role_a"))
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
    .drop_role(
        DropRoleRequest::builder()
            .role_name("role_a")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->DropRole(milvus::DropRoleRequest().WithRoleName("role_a"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

await client.dropRole({ roleName: 'role_a' });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a"
}' 
```

</TabItem>
</Tabs>

ロールを削除したら、既存のすべてのロールを一覧表示して、削除操作が成功したかどうかを確認できます。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.list_roles()
```

</TabItem>

<TabItem value='java'>

```java
List<String> resp = client.listRoles();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

roles, err := client.ListRoles(ctx, milvusclient.NewListRoleOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(roles)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let roles = client
    .list_roles(ListRolesRequest::builder().build()?)
    .await?;
println!("{:?}", roles.role_names());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::ListRolesResponse resp;
auto status = client->ListRoles(milvus::ListRolesRequest(), resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const roles = await client.listRoles();
console.log(roles);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}' 
```

</TabItem>
</Tabs>

以下は出力例です。一覧に `role_a` はありません。削除操作は成功しています。

```bash
['admin']
```

