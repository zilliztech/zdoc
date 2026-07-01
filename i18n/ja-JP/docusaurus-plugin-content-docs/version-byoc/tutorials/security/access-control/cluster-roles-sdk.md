---
title: "クラスターロールの管理 (SDK) | BYOC"
slug: /cluster-roles-sdk
sidebar_key: cluster-roles-sdk
sidebar_label: "クラスターロールの管理 (SDK)"
beta: FALSE
notebook: FALSE
description: "クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。具体的には、クラスターロールはクラスターユーザーのクラスター、データベース、およびコレクションレベルでの権限を制御します。 | BYOC"
type: origin
token: PBZwwNqWjiikeYkXgHPcGhLznTh
sidebar_position: 5
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - cluster
  - access control
  - rbac
  - ロール

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターロールの管理 (SDK)

クラスターロールは、ユーザーがクラスター内で持つ特権を定義します。より具体的には、クラスターロールはクラスターユーザーのクラスター、データベース、およびコレクションレベルでの特権を制御します。

このガイドでは、ロールの作成、ロールへの組み込み特権グループの付与、ロールからの特権グループの取り消し、および最後にロールの削除について説明します。組み込み特権グループの詳細については、[特権](./cluster-privileges#built-in-privilege-groups) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

この機能は Dedicated クラスターでのみ利用可能です。

</Admonition>

## ロールの作成\{#create-a-role}

次の例は、`role_a` という名前のロールを作成する方法を示しています。

ロール名は文字で始まる必要があり、大文字または小文字の文字、数字、およびアンダースコアのみを含めることができます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
client.createRole(createRoleReq);
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

await milvusClient.createRole({
   roleName: 'role_a',
});
```

</TabItem>

<TabItem value='java'>

```bash
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

## List roles\{#list-roles}

いくつかのロールを作成した後、既存のすべてのロールを一覧表示して確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

await milvusClient.listRoles(
    includeUserInfo: True
);
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

以下は出力例です。`role_a` は新しく作成されたロールです。

```bash
['role_a']
```

## ロールに特権グループを付与する\{#grant-a-privilege-group-to-a-role}

Zilliz Cloud では、ロールに以下を付与できます。

- **組み込み特権グループ:** Zilliz Cloud では、9 つの組み込み特権グループが提供されています。各組み込み特権グループに含まれる具体的な特権の詳細については、[組み込み特権グループ](./cluster-privileges#built-in-privilege-groups) を参照してください。

- **カスタム特権グループ:** 組み込みの特権が要件を満たさない場合は、異なる特権を組み合わせて独自のカスタム特権グループを作成できます。詳細については、[カスタム特権グループ](./cluster-privileges#custom-privilege-groups-or-private) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

- カスタム特権グループをロールに付与する必要がある場合は、[サポートチケットを作成](http://support.zilliz.com)して、この機能を有効化していただく必要があります。

- Milvus 2.5.x 以降を実行しているクラスターでは、個別の特権はサポートされなくなりました。

</Admonition>

以下の例では、カスタム特権グループ `privilege_group_1` と組み込み特権グループ `ClusterReadOnly` をロール `role_a` に付与する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

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

<TabItem value='java'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.grantPrivilegeV2({
    role: "role_a",
    privilege: "privilege_group_1"
    collection_name: 'collection_01'
    db_name: 'default',
});

await client.grantPrivilegeV2({
    role: "role_a",
    privilege: "ClusterReadOnly"
    collection_name: '*'
    db_name: '*',
});
```

</TabItem>

<TabItem value='java'>

```bash
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

以下はパラメーターと対応する説明です。

- **role_name:** 特権グループを付与する対象ロールの名前です。

- **privilege**: ロールに付与する特権グループです。利用可能なオプションについては、[特権と特権グループ](./cluster-privileges) を参照してください。

- **リソース**: 特権グループの対象リソースです。特定のクラスター、データベース、またはコレクションを指定できます。

    次の表は、リソースの指定方法を説明しています。

    <table>
       <tr>
         <th><p><strong>レベル</strong></p></th>
         <th><p><strong>リソース</strong></p></th>
         <th><p><strong>付与方法</strong></p></th>
         <th><p><strong>備考</strong></p></th>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>コレクション</strong></p></td>
         <td><p>特定のコレクション</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="CollectionAdmin",     collection_name="col1",      db_name="db1" )</code></pre></td>
         <td><p>対象コレクションの名前と、その対象コレクションが属するデータベースの名前を入力します。</p></td>
       </tr>
       <tr>
         <td><p>特定のデータベース配下のすべてのコレクション</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="CollectionAdmin",     collection_name="&ast;",      db_name="db1" )</code></pre></td>
         <td><p>対象データベースの名前と、コレクション名としてワイルドカード <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>データベース</strong></p></td>
         <td><p>特定のデータベース</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="DatabaseAdmin",      collection_name="&ast;",      db_name="db1" )</code></pre></td>
         <td><p>対象データベースの名前と、コレクション名としてワイルドカード <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td><p>現在のインスタンス配下のすべてのデータベース</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="DatabaseAdmin",      collection_name="&ast;",      db_name="&ast;" )</code></pre></td>
         <td><p>データベース名として <code>&ast;</code>、コレクション名として <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td><p><strong>インスタンス</strong></p></td>
         <td><p>現在のインスタンス</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="ClusterAdmin",      collection_name="&ast;",      db_name="&ast;" )</code></pre></td>
         <td><p>データベース名として <code>&ast;</code>、コレクション名として <code>&ast;</code> を入力します。</p></td>
       </tr>
    </table>

## ロールの説明\{#describe-a-role}

次の例では、`describe_role` メソッドを使用してロール `role_a` に付与された権限を表示する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.describe_role(role_name="role_a")
```

</TabItem>

<TabItem value='java'>

```go
import "github.com/milvus-io/milvus-sdk-go/v2/client"

client.ListRoles(context.Background())
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

<TabItem value='java'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

await milvusClient.describeRole({roleName: 'role_a'});
```

</TabItem>

<TabItem value='java'>

```bash
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

## ロールから特権グループを取り消す\{#revoke-a-privilege-group-from-a-role}

次の例では、ロール `role_a` に付与されていたカスタム特権グループ `privilege_group_1` と組み込み特権グループ `ClusterReadOnly` を取り消す方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

```javascript
await client.revokePrivilegeV2({
    role: 'role_a',
    collection_name: 'collection_01',
    privilege: 'Search',
    db_name: 'default'
});

await client.revokePrivilegeV2({
    role: 'role_a',
    collection_name: '*',
    privilege: 'ClusterReadOnly',
    db_name: '*'
});
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/revoke_privilege_v2" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "privilege": "Search",
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

<Admonition type="info" icon="📘" title="Notes">

組み込みロール `admin` は削除できません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

milvusClient.dropRole({
   roleName: 'role_a',
 })
```

</TabItem>

<TabItem value='java'>

```bash
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

ロールが削除されたら、既存のすべてのロールを一覧表示して、削除操作が成功したか確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

milvusClient.listRoles(
    includeUserInfo: True
)
```

</TabItem>

<TabItem value='java'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

以下は出力例です。リストには `role_a` が存在しません。削除操作は成功しました。

```bash
['admin']
```
