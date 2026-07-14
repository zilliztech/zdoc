---
title: "Cluster ロールの管理（SDK）| BYOC"
slug: /cluster-roles-sdk
sidebar_label: "Cluster ロールの管理（SDK）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "cluster ロールは、ユーザーが cluster 内で持つ権限を定義します。より具体的には、cluster ロールは cluster ユーザーの cluster、database、collection レベルでの権限を制御します。 | BYOC"
type: origin
token: PBZwwNqWjiikeYkXgHPcGhLznTh
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Cluster ロールの管理（SDK）

cluster ロールは、ユーザーが cluster 内で持つ権限を定義します。より具体的には、cluster ロールは cluster ユーザーの cluster、database、collection レベルでの権限を制御します。

このガイドでは、ロールの作成、ロールへの組み込み privilege group の付与、ロールからの privilege group の取り消し、そして最後にロールの削除方法について説明します。組み込み privilege group の詳細については、[Privileges](./cluster-privileges#built-in-privilege-groups) を参照してください。

<Admonition type="info" icon="📘" title="注意">

この機能は Dedicated cluster でのみ利用できます。

</Admonition>

## ロールの作成\{#create-a-role}

以下の例は、`role_a` という名前のロールを作成する方法を示しています。 

ロール名は文字で始める必要があり、使用できるのは大文字または小文字の英字、数字、アンダースコアのみです。

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

複数のロールを作成した後、既存のすべてのロールを一覧表示して確認できます。

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

以下は出力例です。`role_a` は新しく作成されたロールです。

```bash
['role_a']
```

## ロールへの privilege group の付与\{#grant-a-privilege-group-to-a-role}

Zilliz Cloud では、ロールに以下を付与できます。

- **組み込み privilege groups:** Zilliz Cloud は 9 個の組み込み privilege group を提供しています。各組み込み privilege group に含まれる具体的な権限の詳細については、[Built-in privilege groups](./cluster-privileges#built-in-privilege-groups) を参照してください。

- **カスタム privilege groups:** 組み込み権限が要件を満たさない場合は、複数の権限を組み合わせて独自のカスタム privilege group を作成できます。詳細については、[Custom privilege groups](./cluster-privileges#custom-privilege-groups) を参照してください。

<Admonition type="info" icon="📘" title="注意">

- ロールにカスタム privilege group を付与する必要がある場合は、[サポートチケットを作成](http://support.zilliz.com) してください。この機能を有効化します。

- Milvus 2.5.x 以降を実行している cluster では、個別の権限はサポートされなくなりました。

</Admonition>

以下の例は、`privilege_group_1` という名前のカスタム privilege group と、組み込み privilege group `ClusterReadOnly` をロール `role_a` に付与する方法を示しています。

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

以下に、各パラメーターとその説明を示します。

- **role_name:** privilege group を付与する対象ロールの名前。

- **privilege**: ロールに付与する privilege group。使用可能なオプションについては、[Privileges & Privilege Groups](./cluster-privileges) を参照してください。

- **Resource**: privilege group の対象リソースで、特定の cluster、database、または collection を指定できます。 

    以下の表では、リソースの指定方法を説明しています。

    <table>
       <tr>
         <th><p><strong>レベル</strong></p></th>
         <th><p><strong>リソース</strong></p></th>
         <th><p><strong>付与方法</strong></p></th>
         <th><p><strong>注意</strong></p></th>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>Collection</strong></p></td>
         <td><p>特定の collection</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="CollectionAdmin",     collection_name="col1",      db_name="db1" )</code></pre></td>
         <td><p>対象 collection の名前と、その collection が属する database の名前を入力します。</p></td>
       </tr>
       <tr>
         <td><p>特定の database 配下のすべての collection</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="CollectionAdmin",     collection_name="&ast;",      db_name="db1" )</code></pre></td>
         <td><p>対象 database の名前と、collection 名としてワイルドカード <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>Database</strong></p></td>
         <td><p>特定の database</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="DatabaseAdmin",      collection_name="&ast;",      db_name="db1" )</code></pre></td>
         <td><p>対象 database の名前と、collection 名としてワイルドカード <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td><p>現在の instance 配下のすべての database</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="DatabaseAdmin",      collection_name="&ast;",      db_name="&ast;" )</code></pre></td>
         <td><p>database 名に <code>&ast;</code>、collection 名にも <code>&ast;</code> を入力します。</p></td>
       </tr>
       <tr>
         <td><p><strong>Instance</strong></p></td>
         <td><p>現在の instance</p></td>
         <td><pre><code class="python language-python"> client.grant_privilege_v2(     role_name="roleA",      privilege="ClusterAdmin",      collection_name="&ast;",      db_name="&ast;" )</code></pre></td>
         <td><p>database 名に <code>&ast;</code>、collection 名にも <code>&ast;</code> を入力します。</p></td>
       </tr>
    </table>

## ロールの詳細表示\{#describe-a-role}

以下の例は、`describe_role` メソッドを使用してロール `role_a` に付与されている権限を確認する方法を示しています。

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

## ロールからの privilege group の取り消し\{#revoke-a-privilege-group-from-a-role}

以下の例は、ロール `role_a` に付与されているカスタム privilege group `privilege_group_1` と組み込み privilege group `ClusterReadOnly` を取り消す方法を示しています。

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

以下の例は、ロール `role_a` を削除する方法を示しています。

<Admonition type="info" icon="📘" title="注意">

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

ロールを削除したら、既存のすべてのロールを一覧表示して、削除操作が成功したかどうかを確認できます。 

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

以下は出力例です。一覧に `role_a` はありません。削除操作は成功しています。

```bash
['admin']
```

