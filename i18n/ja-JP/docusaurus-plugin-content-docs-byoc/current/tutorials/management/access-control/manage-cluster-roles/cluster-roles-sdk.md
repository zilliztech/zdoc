---
title: "クラスターロールの管理 (SDK) | BYOC"
slug: /cluster-roles-sdk
sidebar_label: "クラスターロールの管理 (SDK)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "クラスターロールは、クラスター内でユーザーが持つ権限を定義します。より具体的には、クラスターロールはクラスター、データベース、コレクションレベルでのクラスターユーザーの権限を制御します。 | BYOC"
type: origin
token: PBZwwNqWjiikeYkXgHPcGhLznTh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターロールの管理 (SDK)

クラスターロールは、クラスター内でユーザーが持つ権限を定義します。より具体的には、クラスターロールはクラスター、データベース、コレクションレベルでのクラスターユーザーの権限を制御します。

このガイドでは、ロールの作成、組み込み権限グループの付与と取り消し、およびロールの削除について順を追って説明します。組み込み権限グループの詳細については、[Privileges](./cluster-privileges#built-in-privilege-groups) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

この機能は Dedicated クラスターでのみ利用可能です。

</Admonition>

## ロールの作成\{#create-a-role}

以下の例では、`role_a` という名前のロールを作成する方法を示します。

ロール名は英字で始まる必要があり、使用できる文字は大文字・小文字の英字、数字、アンダースコアのみです。

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

<TabItem value='javascript'>

```javascript
client.createRole(createRoleReq);
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

await milvusClient.createRole({
   roleName: 'role_a',
});
```

</TabItem>

<TabItem value='bash'>

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

## ロールの一覧表示\{#list-roles}

複数のロールを作成した後は、既存のすべてのロールを一覧表示して確認できます。

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

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

await milvusClient.listRoles(
    includeUserInfo: True
);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

以下に出力例を示します。`role_a` が新たに作成されたロールです。

```bash
['role_a']
```

## ロールへの権限グループの付与\{#grant-a-privilege-group-to-a-role}

Zilliz Cloud では、以下の項目をロールに付与できます。

- **組み込み権限グループ:** Zilliz Cloud には 9 つの組み込み権限グループが用意されています。各グループに含まれる具体的な権限の詳細については、[Built-in privilege groups](./cluster-privileges#built-in-privilege-groups) を参照してください。

- **カスタム権限グループ:** 組み込み権限で要件を満たせない場合は、複数の権限を組み合わせて独自のカスタム権限グループを作成できます。詳細については、[Custom privilege groups](./cluster-privileges#custom-privilege-groups) を参照してください。

<Admonition type="info" icon="📘" title="Notes">

- カスタム権限グループをロールに付与する場合は、機能を有効化するため [サポートチケットを作成](http://support.zilliz.com) してください。

- Milvus 2.5.x 以降のクラスターでは、個別の権限付与はサポートされていません。

</Admonition>

以下の例では、カスタム権限グループ `privilege_group_1` と組み込み権限グループ `ClusterReadOnly` をロール `role_a` に付与する方法を示します。

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

<TabItem value='go'>

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

<TabItem value='javascript'>

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

<TabItem value='bash'>

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

各パラメーターの説明は以下のとおりです。

- **role_name:** 権限グループを付与する対象のロール名です。

- **privilege**: ロールに付与する権限グループです。指定可能な値については、[Privileges & Privilege Groups](./cluster-privileges) を参照してください。

- **Resource**: 権限グループの適用対象となるリソースです。特定のクラスター、データベース、またはコレクションを指定できます。

    リソースの指定方法については、下表を参照してください。

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
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;CollectionAdmin&quot;,     collection_name=&quot;col1&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>対象のコレクション名と、そのコレクションが属するデータベース名を入力します。</p></td>
       </tr>
       <tr>
         <td><p>特定のデータベース配下の全コレクション</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;CollectionAdmin&quot;,     collection_name=&quot;&ast;&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>対象のデータベース名と、コレクション名としてワイルドカード <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>データベース</strong></p></td>
         <td><p>特定のデータベース</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;DatabaseAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>対象のデータベース名と、コレクション名としてワイルドカード <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td><p>現在のインスタンス配下の全データベース</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;DatabaseAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;&ast;&quot; )</code></pre></td>
         <td><p>データベース名に <code>&ast;</code>、コレクション名に <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td><p><strong>インスタンス</strong></p></td>
         <td><p>現在のインスタンス</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;ClusterAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;&ast;&quot; )</code></pre></td>
         <td><p>データベース名に <code>&ast;</code>、コレクション名に <code>&ast;</code> を入力します。</p></td>
       </tr>
    </table>

## ロールの詳細確認\{#describe-a-role}

次の例では、`describe_role` メソッドを使用して、ロール `role_a` に付与された権限を確認する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.describe_role(role_name="role_a")
```

</TabItem>

<TabItem value='go'>

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

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

await milvusClient.describeRole({roleName: 'role_a'});
```

</TabItem>

<TabItem value='bash'>

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

## ロールから権限グループを取り消す\{#revoke-a-privilege-group-from-a-role}

次の例では、ロール `role_a` に付与されたカスタム権限グループ `privilege_group_1` および組み込み権限グループ `ClusterReadOnly` を取り消す方法を示します。

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

<TabItem value='javascript'>

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

<TabItem value='bash'>

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

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

milvusClient.dropRole({
   roleName: 'role_a',
 })
```

</TabItem>

<TabItem value='bash'>

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

ロールを削除した後、既存のすべてのロールを一覧表示して、削除操作が成功したかどうかを確認できます。

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

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

milvusClient.listRoles(
    includeUserInfo: True
)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

以下は出力例です。リストに `role_a` が含まれていない場合、削除操作は成功しています。

```bash
['admin']
```

