---
slug: /cluster-credentials-sdk
beta: FALSE
notebook: FALSE
type: origin
token: NGvbww7DpirhxOknAWncOrmqnNJ
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster credentials
  - sdk

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Cluster Credentials (SDK)

In addition to [managing cluster credentials on web UI](./cluster-credentials-console), Zilliz Cloud extends its functionality by offering SDKs for credential management. This integration enhances flexibility and provides more customization options than the web UI alone.

In the backend, there are three built-in role options:

- `db_admin`: Full control over the cluster and associated resources.

- `db_rw`: Permission to read, write, and manage collections and indexes within the cluster.

- `db_ro`: Viewing rights for most cluster resources, but no creation, modification, or deletion capabilities.

Explore [Cluster Built-in Roles](./user-roles) for details.

## List cluster roles and users{#list-cluster-roles-and-users}

You can list all built-in roles and users in a cluster as follows:

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

## Create a cluster user{#create-a-cluster-user}

To create a cluster user, use the following code snippet:

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

Having created a cluster user, you can now connect to the cluster using its username and password. See [Connect to Cluster](./connect-to-cluster) to explore further details.See [Authenticate User Access](https://milvus.io/docs/authenticate.md) and Enable [RBAC](https://milvus.io/docs/rbac.md) for details.

## Update a user credential{#update-a-user-credential}

To update a user's password, use the code below:

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

## Describe a role{#describe-a-role}

Before assigning a role to a user, you are advised to view the privileges that a role has. Zilliz Cloud has three preset roles, namely `db_ro`, `db_admin`, and `db_rw` with different privileges.

The following code snippet lists the `db_ro` role in detail.

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

## Assign a role to a cluster user{#assign-a-role-to-a-cluster-user}

To assign the `db_ro` role to `user1`:

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

## Revoke a role from a user{#revoke-a-role-from-a-user}

To revoke a role from a user:

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

## Drop a user{#drop-a-user}

If a user is no longer needed, drop it as follows:

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

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [API Keys](./manage-api-keys)

- [Set up Whitelist](./setup-whitelist)

- [Set up a Private Link](./setup-a-private-link)

