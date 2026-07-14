---
title: "クラスターユーザーの管理（SDK）| Cloud"
slug: /cluster-users-sdk
sidebar_label: "クラスターユーザーの管理（SDK）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターユーザーを作成し、それらにクラスターロールを割り当てて権限を定義することで、データセキュリティを実現できます。 | Cloud"
type: origin
token: I2CHwfDHKilTMukoZ13cR2M4nzb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターユーザーの管理（SDK）

Zilliz Cloud では、クラスターユーザーを作成し、それらにクラスターロールを割り当てて権限を定義することで、データセキュリティを実現できます。

このガイドでは、クラスターユーザーを作成し、ユーザーにロールを付与し、ユーザーからロールを取り消し、最後にユーザーを削除する方法を説明します。クラスターロールの詳細については、[クラスターロールの管理（Console）](./cluster-roles)を参照してください。

## ユーザーを作成する\{#create-a-user}

以下の例は、ユーザー名 `user_1`、パスワード `P@ssw0rd` のユーザーを作成する方法を示しています。ユーザーのユーザー名とパスワードは、次のルールに従う必要があります。

- ユーザー名: 文字で始まる必要があり、使用できるのは大文字または小文字の英字、数字、アンダースコアのみです。

- パスワード: 長さは 8～64 文字で、次のうち 3 種類を含める必要があります: 大文字、小文字、数字、特殊文字。

- （任意）説明: 最大 1024（UTF-8 バイト単位）。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.create_user(user_name="user_1", password="P@ssw0rd", description="a new user in the developers team")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.CreateUserReq;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

CreateUserReq createUserReq = CreateUserReq.builder()
        .userName("user_1")
        .password("P@ssw0rd")
        .description("a new user in the developers team")
        .build();
        
client.createUser(createUserReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await milvusClient.createUser({
   username: 'user_1',
   password: 'P@ssw0rd',
 });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/users/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "userName": "user_1",
    "password": "P@ssw0rd"
    "description": "a new user in the developers team"
}'
```

</TabItem>
</Tabs>

## ユーザーを一覧表示する\{#list-users}

複数のユーザーを作成した後、既存のすべてのユーザーを一覧表示して確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.list_users()
```

</TabItem>

<TabItem value='java'>

```java
List<String> resp = client.listUsers();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

await milvusClient.listUsers();
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/users/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

以下は出力例です。`root` は自動生成されるデフォルトユーザーです。`user_1` は新しく作成されたユーザーです。

```bash
['root', 'user_1']
```

## ユーザーにロールを付与する\{#grant-a-role-to-a-user}

以下の例は、ユーザー `user_1` にロール `role_a` を付与する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.grant_role(user_name="user_1", role_name="role_a")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantRoleReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();
    
MilvusClientV2 client = new MilvusClientV2(connectConfig);

GrantRoleReq grantRoleReq = GrantRoleReq.builder()
        .roleName("role_a")
        .userName("user_1")
        .build();
client.grantRole(grantRoleReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

milvusClient.grantRole({
   username: 'user_1',
   roleName: 'role_a'
 })
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/users/grant_role" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "userName": "user_1"
}'
```

</TabItem>
</Tabs>

## ユーザー情報を確認する\{#describe-user}

ユーザーにロールを付与したら、`describe_user()` メソッドを使って付与操作が成功したかどうかを確認できます。

以下の例は、ユーザー `user_1` のロールを確認する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.describe_user(user_name="user_1")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.DescribeUserReq;
import io.milvus.v2.service.rbac.response.DescribeUserResp;

DescribeUserReq describeUserReq = DescribeUserReq.builder()
        .userName("user_1")
        .build();
DescribeUserResp describeUserResp = client.describeUser(describeUserReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

milvusClient.describeUser({username: 'user_1'})
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/users/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "userName": "user_1"
}'
```

</TabItem>
</Tabs>

以下は出力例です。

```bash
{'user_name': 'user_1', 'description':'a new user in the developers team', 'roles': 'role_a'}
```

## ロールを取り消す\{#revoke-a-role}

ユーザーに割り当てられているロールを取り消すこともできます。

以下の例は、ユーザー `user_1` に割り当てられたロール `role_a` を取り消す方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.revoke_role(
    user_name='user_1',
    role_name='role_a'
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.RevokeRoleReq;

client.revokeRole(RevokeRoleReq.builder()
        .userName("user_1")
        .roleName("role_a")
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.revokeRole({
    username: 'user_1',
    roleName: 'role_a'
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/users/revoke_role" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "userName": "user_1",
    "roleName": "role_a"
}'
```

</TabItem>
</Tabs>

## ユーザーを削除する\{#drop-user}

以下の例は、ユーザー `user_1` を削除する方法を示しています。 

<Admonition type="info" icon="📘" title="注意">

`root` ユーザーは削除できません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# create a user
client.drop_user(user_name="user_1")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig
import io.milvus.v2.client.MilvusClientV2
import io.milvus.v2.service.rbac.request.DropUserReq

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

DropUserReq dropUserReq = DropUserReq.builder()
        .userName("user_1")
        .build();
client.dropUser(dropUserReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

milvusClient.deleteUser({
    username: 'user_1'
})
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/users/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "userName": "user_1"
}'
```

</TabItem>
</Tabs>

ユーザーが削除されたら、既存のすべてのユーザーを一覧表示して、削除操作が成功したかどうかを確認できます。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.list_users()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.listUsersReq

List<String> resp = client.listUsers();
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

milvusClient.listUsers()
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/users/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

以下は出力例です。一覧に `user_1` は存在しません。削除操作は成功しています。

```bash
['root']
```

