---
title: "クラスタ資格情報(SDK) | Cloud"
slug: /cluster-credentials-console
sidebar_label: "クラスタ資格情報(SDK)"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudは、Web UI上でクラスター資格情報を管理するだけでなく、資格情報管理用のSDKを提供することで機能を拡張しています。この統合により、柔軟性が向上し、Web UI単体よりも多くのカスタマイズオプションが提供されます。 | Cloud"
type: origin
token: C7RxwXO0Yiwstuk4M9QcS56tnTc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - console
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスタ資格情報(SDK)

Zilliz Cloudは、[Web UI上でクラスター資格情報を管理](./cluster-credentials-sdk)するだけでなく、資格情報管理用のSDKを提供することで機能を拡張しています。この統合により、柔軟性が向上し、Web UI単体よりも多くのカスタマイズオプションが提供されます。

バックエンドには、3つの組み込みロールオプションがあります。

- `db_admin`:クラスタと関連リソースを完全に制御します。

- `db_rw`:クラスター内のコレクションとインデックスの読み取り、書き込み、および管理の許可。

- `db_ro`:ほとんどのクラスタリソースの表示権がありますが、作成、変更、削除の機能はありません。

詳細については、[クラスタロールの管理(コンソール)](./cluster-roles)を参照してください。

## クラスターの役割とユーザーを一覧表示する{#list-cluster-roles-and-users}

クラスタ内のすべての組み込みロールとユーザーを次のようにリストできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. List roles and users
roles = client.list_roles()

print(roles)

# Output
#
# ["db_admin", "db_ro", "db_rw"]

users = client.list_users()

print(users)

# Output
#
# ["db_admin"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
   .uri(CLUSTER_ENDPOINT)
   .token(TOKEN)
   .secure(true)
   .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig); 

// 2. List all users and roles
List<String> roleNames = client.listRoles();

System.out.println(roleNames);

// Output
//
// ["db_admin", "db_ro", "db_rw"]

List<String> userNames = client.listUsers();

System.out.println(userNames);

// Output
//
// ["db_admin"]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

async function main() {
// 1. Connect to the cluster
const client = new MilvusClient({address, token})

// 2. List roles and users
var res = await client.listRoles()

console.log(res.results.map(r => r.role.name))

// Output
//
// ["db_admin", "db_ro", "db_rw"]

res = await client.listUsers()

console.log(res.usernames)

// Output
//
// ["db_admin"]
```

</TabItem>
</Tabs>

## クラスタユーザの作成{#create-a-cluster-user}

クラスターユーザーを作成するには、次のコードスニペットを使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 3. Create a user

if 'user1' not in users:
    client.create_user(
        user_name="user1",
        password="p@ssw0rd!"
    )

users = client.list_users()

print(users)

# Output
#
# ["db_admin", "user1"]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.DropUserReq;
import io.milvus.v2.service.rbac.request.CreateUserReq;

// 3. Create a user
CreateUserReq createUserReq = CreateUserReq.builder()
   .userName("user1")
   .password("p@ssw0rd!")
   .build();

client.createUser(createUserReq);

userNames = client.listUsers();

System.out.println(userNames);

// Output
//
// ["db_admin", "user1"]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. Create a user

if (!res.usernames.includes("user1")) {
    await client.createUser({
        username: "user1",
        password: "p@ssw0rd!"
    })
}

res = await client.listUsers()

console.log(res.usernames)

// Output
//
// ["db_admin", "user1"] 
```

</TabItem>
</Tabs>

クラスターユーザーを作成したら、そのユーザー名とパスワードを使用してクラスターに接続できます。詳細については、[Clusterに接続](./connect-to-cluster)を参照してください。詳細については、[Authenticate User Access](https://milvus.io/docs/ja/authenticate.md?tab=docker) and Enable [RBAC](https://milvus.io/docs/ja/rbac.md) を参照してください。

## ユーザーの資格情報を更新する{#update-a-user-credential}

ユーザーのパスワードを更新するには、以下のコードを使用してください

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 4. Update a user credentials

client.update_password(
    user_name="user1",
    old_password="p@ssw0rd!",
    new_password="p@ssw0rd123!"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.UpdatePasswordReq;

// 4. Update user password
UpdatePasswordReq updatePasswordReq = UpdatePasswordReq.builder()
   .userName("user1")
   .password("p@ssw0rd!")
   .newPassword("p@ssw0rd123!")
   .build();

client.updatePassword(updatePasswordReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Update a user credentials

await client.updateUser({
    username: "user1",
    oldPassword: "p@ssw0rd!",
    newPassword: "p@ssw0rd123!"
})
```

</TabItem>
</Tabs>

## 役割を説明する{#describe-a-role}

ユーザーにロールを割り当てる前に、ロールが持つ権限を確認することをお勧めします。Zilliz Cloudには、異なる権限を持つ`db_ro`、`db_admin`、`db_rw`の3つのプリセットロールがあります。

次のコードスニペットは、`db_ro`ロールの詳細を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 5. Describe the role
res = client.describe_role(role_name="db_ro")

print(res)

# Output
#
# {
#     "role": "db_ro",
#     "privileges": [
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "GetLoadState"
#         },
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "GetLoadingProgress"
#         },
#         {
#             "object_type": "Collection",
#             "object_name": "*",
#             "db_name": "default",
#             "role_name": "db_ro",
#             "privilege": "HasPartition"
#         },
#         "(10 more items hidden)"
#     ]
# }

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.DescribeRoleReq;

// 5. Describe the role
DescribeRoleReq describeRoleReq = DescribeRoleReq.builder()
   .roleName("db_ro")
   .build();

DescribeRoleResp describeRoleResp = client.describeRole(describeRoleReq);

System.out.println(JSONObject.toJSON(describeRoleResp));

// Output:

// {"grantInfos": [
//     {
//         "dbName": "default",
//         "objectName": "*",
//         "grantor": "",
//         "privilege": "GetLoadState",
//         "objectType": "Collection"
//     },
//     {
//         "dbName": "default",
//         "objectName": "*",
//         "grantor": "",
//         "privilege": "GetLoadingProgress",
//         "objectType": "Collection"
//     },
//     {
//         "dbName": "default",
//         "objectName": "*",
//         "grantor": "",
//         "privilege": "HasPartition",
//         "objectType": "Collection"
//     },
//     "(10 elements are hidden)"
// ]}

```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. Describe the role

var res = await client.describeRole({
    roleName: "db_ro"
})

console.log(res.results)

// Output
// 
// [ { users: [], role: { name: 'db_ro' } } ]
// 
```

</TabItem>
</Tabs>

## クラスターユーザーに役割を割り当てる{#assign-a-role-to-a-cluster-user}

user 1に`db_ro`ロールを割り当て`る`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 6. Assign a role to a user

client.grant_role(
    user_name="user1",
    role_name="db_ro"
)

# 7. Describe a user

user_info = client.describe_user(
    user_name="user1"
)

print(user_info)

# Output
#
# {
#     "user_name": "user1",
#     "roles": "(\"db_ro\")"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.GrantRoleReq;

// 6. Assign a role to a user
GrantRoleReq grantRoleReq = GrantRoleReq.builder()
   .userName("user1")
   .roleName("db_ro")
   .build();

client.grantRole(grantRoleReq);

// 7. Describe the user
DescribeUserReq describeUserReq = DescribeUserReq.builder()
   .userName("user1")
   .build();

DescribeUserResp describeUserResp = client.describeUser(describeUserReq);

System.out.println(JSONObject.toJSON(describeUserResp));

// Output:
// {"roles": ["db_ro"]}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. Assign a role to a user

await client.grantRole({
    username: "user1",
    roleName: "db_ro"
})

// 7. Describe a user

res = await client.describeUser({
    username: "user1"
})

console.log(res.results)

// Output
// 
// [ { roles: [ [Object] ], user: { name: 'user1' } } ]
// 
```

</TabItem>
</Tabs>

## ユーザーから役割を取り消す{#revoke-a-role-from-a-user}

ユーザーからロールを取り消すには:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 8. Revoke a role from a user

client.revoke_role(
    user_name="user1",
    role_name="db_ro"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.RevokeRoleReq;

// 8. Revoke a role from a user
RevokeRoleReq revokeRoleReq = RevokeRoleReq.builder()
   .userName("user1")
   .roleName("db_ro")
   .build();

client.revokeRole(revokeRoleReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. Revoke a role from a user

await client.revokeRole({
    username: "user1",
    roleName: "db_ro"
})
```

</TabItem>
</Tabs>

## ユーザーを削除{#drop-a-user}

ユーザーが不要になった場合は、以下のように削除してください:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 9. Drop a user

client.drop_user(
    user_name="user1"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.DropUserReq;

// 9. Drop the user
DropUserReq dropUserReq = DropUserReq.builder()
   .userName("user1")
   .build();

client.dropUser(dropUserReq);

userNames = client.listUsers();

System.out.println(userNames);

// Output:
// ["db_admin"]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9. Drop a user

await client.dropUser({
    username: "user1"
})
```

</TabItem>
</Tabs>

## 関連するトピック{#related-topics}

- [Clusterに接続](./connect-to-cluster)

- [APIキー](./manage-api-keys)

- [ホワイトリストの設定](./setup-whitelist)

- [プライベートエンドポイントを設定する](./setup-a-private-link)

