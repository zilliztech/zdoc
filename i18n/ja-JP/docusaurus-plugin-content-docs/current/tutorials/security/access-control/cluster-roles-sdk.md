---
title: "クラスタロールの管理(SDK) | Cloud"
slug: /cluster-roles-sdk
sidebar_label: "クラスタロールの管理(SDK)"
beta: FALSE
notebook: FALSE
description: "クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。より具体的には、クラスターロールは、クラスター、データベース、およびコレクションレベルでクラスターユーザーの権限を制御します。 | Cloud"
type: origin
token: ZLwswiskDiEC95k7cMgcmcn1npc
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - roles
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスタロールの管理(SDK)

クラスターロールは、ユーザーがクラスター内で持つ権限を定義します。より具体的には、クラスターロールは、クラスター、データベース、およびコレクションレベルでクラスターユーザーの権限を制御します。

このガイドでは、ロールの作成方法、ロールに組み込み特権グループを付与する方法、ロールから特権グループを取り消す方法、そして最後にロールを削除する方法について説明します。組み込み特権グループの詳細については、「[特権について](./cluster-privileges)」を参照してください。

<Admonition type="info" icon="📘" title="ノート">

<p>この機能は専用クラスターでのみ利用可能です。</p>

</Admonition>

## 役割を作成する{#create-a-role}

次の例は、role_aという名前のロールを作成する方法を示`してい`ます。

ロール名は次のルールに従う必要があります。

- 文字で始め、大文字または小文字、数字、アンダースコアのみを含める必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.create_role(role_name="role_a")
import io.milvus.v2.service.rbac.request.CreateRoleReq;
```

</TabItem>

<TabItem value='java'>

```java
CreateRoleReq createRoleReq = CreateRoleReq.builder()
        .roleName("role_a")
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
    "roleName": "role_a"
}'
```

</TabItem>
</Tabs>

## 役割リスト{#list-roles}

複数のロールを作成した後、既存のすべてのロールを一覧表示できます。

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

以下は出力例です。`role_a`は作成されたばかりの新しいロールです。

```bash
['role_a']
```

## ロールに組み込みの特権グループを付与する{#grant-a-built-in-privilege-group-to-a-role}

<Admonition type="info" icon="📘" title="ノート">

<p>現在、Zilliz Cloudは組み込み特権グループを持つカスタムロールの作成のみをサポートしています。組み込み特権グループの詳細については、「<a href="./cluster-privileges">特権について</a>」を参照してください。</p>
<p>ユーザー定義の権限と権限グループを持つカスタムロールを作成する必要がある場合は、<a href="http://support.zilliz.com">お問い合わせ</a>ください。</p>

</Admonition>

次の例は、`role_a`に`既定`のデータベース内のすべてのコレクションへの読み取り専用アクセスと`collection_01`への管理者アクセスを付与する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.grant_privilege_v2(
    role_name="role_a",
    privilege="COLL_ADMIN"
    collection_name='collection_01'
    db_name='default',
)

client.grant_privilege_v2(
    role_name="role_a",
    privilege="DatabaseReadOnly"
    collection_name='*'
    db_name='default',
)
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus-sdk-go/v2/client"

client.GrantV2(context.Background(), "role_a", "collection_01", "COLL_ADMIN", entity.WithOperatePrivilegeDatabase("default"))

client.GrantV2(context.Background(), "role_a", "*", "DatabaseReadOnly", entity.WithOperatePrivilegeDatabase("default"))
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.GrantPrivilegeReqV2

client.grantPrivilegeV2(GrantPrivilegeReqV2.builder()
        .roleName("role_a")
        .privilege("COLL_ADMIN")
        .collectionName("collection_01")
        .dbName("default")
        .build());

client.grantPrivilegeV2(GrantPrivilegeReqV2.builder()
        .roleName("role_a")
        .privilege("DatabaseReadOnly")
        .collectionName("*")
        .dbName("default")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await milvusClient.grantPrivilege({
   roleName: 'role_a',
   object: 'Collection', 
   objectName: 'collection_01',
   privilegeName: 'COLL_ADMIN'
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
    "privilege": "COLL_ADMIN",
    "collectionName": "collection_01",
    "dbName":"default"
}'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/grant_privilege_v2" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "privilege": "DatabaseReadOnly",
    "collectionName": "*",
    "dbName":"default"
}'

```

</TabItem>
</Tabs>

## 役割を説明してください{#describe-a-role}

次の例では、役割に付与された権限を表示する方法を示します`role_a`を使用して、`description_role`メソッド。

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
     "privileges": [
         "COLL_ADMIN"
     ]
}
```

## ロールから組み込みの特権グループを取り消す{#revoke-a-built-in-privilege-group-from-a-role}

次の例では、`既定`のデータベース内のすべてのコレクションへの読み取り専用アクセスと、role_aから`collection_01`への管理者アクセスを取り消す方法を示し`ます`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Go","value":"go"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)
   
client.revoke_privilege_v2(
    role_name="role_a",
    privilege="COLL_ADMIN"
    collection_name='collection_01'
    db_name='default',
)

client.revoke_privilege_v2(
    role_name="role_a",
    privilege="ClusterReadOnly"
    collection_name='*'
    db_name='*',
)
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus-sdk-go/v2/client"

client.RevokeV2(context.Background(), "role_a", "collection_01", "COLL_ADMIN", entity.WithOperatePrivilegeDatabase("default"))

client.RevokeV2(context.Background(), "role_a", "*", "ClusterReadOnly", entity.WithOperatePrivilegeDatabase("*"))
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.RevokePrivilegeReqV2

client.revokePrivilegeV2(RevokePrivilegeReqV2.builder()
        .roleName("role_a")
        .privilege("COLL_ADMIN")
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

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/revoke_privilege_v2" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "privilege": "COLL_ADMIN",
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

## 役割を削除する{#drop-a-role}

次の例は、ロールrole_aを削除する方法を示`してい`ます。

<Admonition type="info" icon="📘" title="ノート">

<p>組み込みのロール<code>admin</code>は削除できません。</p>

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

ロールが削除されたら、既存のすべてのロールを一覧表示して、削除操作が成功したかどうかを確認できます。

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

以下は出力例です。リストには`role_aが`ありません。ドロップ操作は成功しました。

```bash
['admin']
```

