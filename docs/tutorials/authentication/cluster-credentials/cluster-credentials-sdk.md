---
slug: /cluster-credentials-sdk
beta: FALSE
notebook: FALSE
token: ZAp4w4SWaiJal2kaMhjcItyvnJh
sidebar_position: 2
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

## Before you start{#before-you-start}

- You have created a cluster. For details, see [Create Cluster](./undefined).

- You have installed a Milvus SDK applicable to your use case. For details, see [Install SDKs](./install-sdks).

## Create a cluster user{#create-a-cluster-user}

To create a cluster user, use the following code snippet:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
import json, os, time
from pymilvus import connections, Role, utility

# 0. Connect to cluster

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token

connections.connect(
    alias='default', 
    #  Public endpoint obtained from Zilliz Cloud
    uri=CLUSTER_ENDPOINT,
    # API key or a colon-separated cluster username and password
    token=TOKEN, 
)

# 1. Create user

if not 'user1' in utility.list_usernames():
    utility.create_user(user='user1', password='P@ssw0rd!')
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. Connect to the cluster

const client = new MilvusClient({address, token})

// 2. Create user

const users1 = await client.listUsers()

if (!users1.usernames.includes("user1")) {
    await client.createUser({
        username: "user1",
        password: "P@ssw0rd!",
    })
}
```

</TabItem>

<TabItem value='java'>

```java
String clusterEndpoint = "YOUR_CLUSTER_ENDPOINT";
String token = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Zilliz Cloud cluster

ConnectParam connectParam = ConnectParam.newBuilder()
    .withUri(clusterEndpoint)
    .withToken(token)
    .build();

MilvusServiceClient client = new MilvusServiceClient(connectParam);

System.out.println("Connected to Zilliz Cloud!");

// Output:
// Connected to Zilliz Cloud!

// 2. Create a user

CreateCredentialParam createCredentialParam = CreateCredentialParam.newBuilder()
    .withUsername("user1")
    .withPassword("P@ssw0rd!")
    .build();

R<RpcStatus> res = client.createCredential(createCredentialParam);

if (res.getException() != null) {
    System.err.println("Failed to create user!");
    return;
}

System.out.println("User created!");

// Output:
// User created!
```

</TabItem>

<TabItem value='go'>

```go
CLUSTER_ENDPOINT := "YOUR_CLUSTER_ENDPOINT"
TOKEN := "YOUR_CLUSTER_TOKEN"
USERNAME := "user1"
PASSWORD1 := "P@ssw0rd!"
PASSWORD2 := "P@ssw0rd!!"

// 1. Connect to cluster

connParams := client.Config{
    Address: CLUSTER_ENDPOINT,
    APIKey:  TOKEN,
}

conn, err := client.NewClient(context.Background(), connParams)

if err != nil {
    log.Fatal("Failed to connect to Zilliz Cloud:", err.Error())
}

// 2. Create a user

err = conn.CreateCredential(
    context.Background(), // context
    USERNAME,             // username
    PASSWORD1,            // password
)

if err != nil {
    log.Fatal("Failed to create user:", err.Error())
}
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

The password will not be displayed again, so it's crucial to note it down and securely store it in an appropriate location.

</Admonition>

Having created a cluster user, you can now connect to the cluster using its username and password. See [Connect to Cluster](./connect-to-cluster) to explore further details.

## Update a user credential{#update-a-user-credential}

To update a user's password, use the code below:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 2. Update a user credential

utility.update_password(
    user='user1',
    old_password='P@ssw0rd!',
    new_password='P@ssw0rd!!'
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. Update a user credential

await client.updateUser({
        username: "user1",
        oldPassword: "P@ssw0rd!",
        newPassword: "P@ssw0rd!!",
    })
```

</TabItem>

<TabItem value='java'>

```java
// 3. Update a user credential

UpdateCredentialParam updateCredentialParam = UpdateCredentialParam.newBuilder()
    .withUsername("user1")
    .withOldPassword("P@ssw0rd!")
    .withNewPassword("P@ssw0rd!!")
    .build();

R<RpcStatus> updateCreRes = client.updateCredential(updateCredentialParam);

if (updateCreRes.getException() != null) {
    System.err.println("Failed to update user credential!");
    return;
}

System.out.println("User credential updated!");

// Output:
// User credential updated!
```

</TabItem>

<TabItem value='go'>

```go
// 2. Update a user credential

err = conn.UpdateCredential(
    context.Background(), // context
    USERNAME,             // username
    PASSWORD1,            // old password
    PASSWORD2,            // new password
)

if err != nil {
    log.Fatal("Failed to update user credential:", err.Error())
}
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

The password will not be displayed again, so it's crucial to note it down and securely store it in an appropriate location.

</Admonition>

## List cluster users{#list-cluster-users}

To list all cluster users:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 3. List users

print(utility.list_usernames())

# Output
#
# ["db_admin", "user1"]

userInfo = utility.list_users(include_role_info=True)

users = [ { "user": u.username, "roles": list(u.roles) } for u in userInfo.groups ]

print(users)

# Output
#
# [
#     {
#         "user": "db_admin",
#         "roles": [
#             "db_admin"
#         ]
#     },
#     {
#         "user": "user1",
#         "roles": []
#     }
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. List users

const users = await client.listUsers()

console.log(users.usernames)

// Output
// 
// [ 'db_admin', 'user1' ]
// 
```

</TabItem>

<TabItem value='java'>

```java
// 4. List users

ListCredUsersParam listCredUsersParam = ListCredUsersParam.newBuilder()
    .build();

R<ListCredUsersResponse> listRes = client.listCredUsers(listCredUsersParam);

if (listRes.getException() != null) {
    System.err.println("Failed to list users!");
    return;
}

ProtocolStringList usernames = listRes.getData().getUsernamesList();

System.out.println(usernames);

// Output:
// [
//     "db_admin",
//     "user1"
// ]
```

</TabItem>

<TabItem value='go'>

```go
// 3. List users

users1, err := conn.ListCredUsers(context.Background())

if err != nil {
    log.Fatal("Failed to list users:", err.Error())
}

fmt.Println("Users:", users1)

// Output:
//
// Users: [db_admin user1]

// Alternatively

users2, err := conn.ListUsers(context.Background())

if err != nil {
    log.Fatal("Failed to list users:", err.Error())
}

userList := make([]string, 0)

for _, user := range users2 {
    userList = append(userList, user.Name)
}

fmt.Println("Users:", userList)

// Output: 
//
// Users: [db_admin user1]
```

</TabItem>
</Tabs>

## Assign a role to a cluster user{#assign-a-role-to-a-cluster-user}

To assign the `db_ro` role to `user1`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 4. Assign role

role = Role("db_ro") # Valid values: "db_admin", "db_rw", "db_ro"

role.add_user("user1")

# 5. Get users of a specific role

users = list(role.get_users())

print(users)

# Output
#
# ["user1"]

# 6. List roles

roleInfo = utility.list_roles(include_user_info=True)

roles = [ { "role": g.role_name, "users": list(g.users) } for g in roleInfo.groups ]

print(roles)

# Output
#
# [
#     {
#         "role": "db_admin",
#         "users": [
#             "db_admin"
#         ]
#     },
#     {
#         "role": "db_ro",
#         "users": [
#             "user1"
#         ]
#     },
#     {
#         "role": "db_rw",
#         "users": []
#     }
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. Assign role to user

await client.addUserToRole({
    username: "user1",
    rolename: "db_ro",
})

// 6. List roles

const roles = await client.listRoles()

console.log(roles.results)

// Output
// 
// [
//   { users: [ [Object] ], role: { name: 'db_admin' } },
//   { users: [], role: { name: 'db_ro' } },
//   { users: [], role: { name: 'db_rw' } },
// ]
// 
```

</TabItem>

<TabItem value='java'>

```java
// 5. Assign role to user

AddUserToRoleParam addUserToRoleParam = AddUserToRoleParam.newBuilder()
    .withUserName("user1")
    .withRoleName("db_ro")
    .build();

R<RpcStatus> addRes = client.addUserToRole(addUserToRoleParam);

if (addRes.getException() != null) {
    System.err.println("Failed to assign role to user!");
    return;
}

System.out.println("Role assigned to user!");

// Output:
// Role assigned to user!

// 6. Get users of a specific role

SelectRoleParam selectRoleParam = SelectRoleParam.newBuilder()
    .withRoleName("db_ro")
    .withIncludeUserInfo(true)
    .build();

R<SelectRoleResponse> selectRoleRes = client.selectRole(selectRoleParam);

if (selectRoleRes.getException() != null) {
    System.err.println("Failed to list roles!");
    return;
}

List<RoleResult> roles = selectRoleRes.getData().getResultsList();
List<JSONObject> roleList = new ArrayList<>();

for (RoleResult role : roles) {
role.getAllFields().forEach((k, v) -> {
    roleList.add(new JSONObject().fluentPut(k.getName(), v));
});
}

System.out.println(roleList);

// Output:
// [
//     {"role": {"name": "db_ro"}},
//     {"users": [{"name": "user1"}]}
// ]

// 7. Get roles of a specific user
SelectUserParam selectUserParam = SelectUserParam.newBuilder()
    .withUserName("user1")
    .withIncludeRoleInfo(true)
    .build();

R<SelectUserResponse> selectUserRes = client.selectUser(selectUserParam);

if (selectUserRes.getException() != null) {
    System.err.println("Failed to list roles!");
    return;
}

List<UserResult> users = selectUserRes.getData().getResultsList();
List<JSONObject> userList = new ArrayList<>();

for (UserResult user : users) {
user.getAllFields().forEach((k, v) -> {
    userList.add(new JSONObject().fluentPut(k.getName(), v));
});
}

System.out.println(userList);

// Output:
// [
//     {"user": {"name": "user1"}},
//     {"roles": [{"name": "db_ro"}]}
// ]
```

</TabItem>

<TabItem value='go'>

```go
// 4. Assign role

rolename := "db_ro"

err = conn.AddUserRole(
    context.Background(), // context
    USERNAME,             // username
    rolename,             // role
)

if err != nil {
    log.Fatal("Failed to assign role:", err.Error())
}

// 5. List roles

roles, err := conn.ListRoles(
    context.Background(), // context
)

if err != nil {
    log.Fatal("Failed to list roles:", err.Error())
}

roleList := make([]interface{}, 0, 1)
for _, role := range roles {
    roleList = append(roleList, role.Name)
}

fmt.Println("Roles:", roleList)

// Output: 
//
// Roles: [db_admin db_ro db_rw]
```

</TabItem>
</Tabs>

## Remove a role from a user{#remove-a-role-from-a-user}

To remove a role from a user:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 7. Remove role from user

role.remove_user("user1")
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 7. Remove role from user

await client.removeUserFromRole({
    username: "user1",
    rolename: "db_ro",
})
```

</TabItem>

<TabItem value='java'>

```java
// 8. Remove role from user

RemoveUserFromRoleParam removeUserFromRoleParam = RemoveUserFromRoleParam.newBuilder()
    .withUserName("user1")
    .withRoleName("db_ro")
    .build();

R<RpcStatus> removeRes = client.removeUserFromRole(removeUserFromRoleParam);

if (removeRes.getException() != null) {
    System.err.println("Failed to remove user from role!");
    return;
}

System.out.println("User removed from role!");
```

</TabItem>

<TabItem value='go'>

```go
// 6. Remove role from user

err = conn.RemoveUserRole(
    context.Background(), // context
    USERNAME,             // username
    rolename,             // role
)

if err != nil {
    log.Fatal("Failed to remove user from role:", err.Error())
}
```

</TabItem>
</Tabs>

## Delete a user{#delete-a-user}

If a user is no longer needed, delete it as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 8. Delete user

utility.delete_user('user1')
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. Delete user

await client.deleteUser({
        username: "user1",
    })
```

</TabItem>

<TabItem value='java'>

```java
// 8. Delete user

DeleteCredentialParam  deleteCredentialParam = DeleteCredentialParam.newBuilder()
    .withUsername("user1")
    .build();

R<RpcStatus> deleteRes = client.deleteCredential(deleteCredentialParam);

if (deleteRes.getException() != null) {
    System.err.println("Failed to delete user!");
    return;
}

System.out.println("User deleted!");

// Output:
// User deleted!
```

</TabItem>

<TabItem value='go'>

```go
// 7. Delete user

err = conn.DeleteCredential(
    context.Background(), // context
    USERNAME,             // username
)

if err != nil {
    log.Fatal("Failed to delete user:", err.Error())
}
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

The default user **db_admin **cannot be dropped.

</Admonition>

## Related topics{#related-topics}

- [Connect to Cluster](./connect-to-cluster)

- [API Keys](./api-keys)

- [Set up Whitelist](./setup-whitelist)

- [Set up a Private Link](./setup-a-private-link)

