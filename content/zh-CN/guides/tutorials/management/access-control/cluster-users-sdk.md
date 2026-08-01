---
title: "管理集群用户（SDK） | Cloud"
slug: /cluster-users-sdk
sidebar_label: "管理集群用户（SDK）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，您可以创建集群用户并为他们分配集群角色，从而定义用户权限并实现数据安全。 | Cloud"
type: origin
token: UX6ew8AtoillJskKRthcZyqinZb
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 管理集群用户（SDK）

在 Zilliz Cloud 中，您可以创建集群用户并为他们分配集群角色，从而定义用户权限并实现数据安全。

本文将介绍如何创建集群用户、授予用户角色、撤销用户角色，以及删除用户。有关集群角色的详细信息，请参考[管理集群角色（控制台）](./cluster-roles)和[管理集群角色（SDK）](./cluster-roles-sdk)。

## 创建用户\{#create-a-user}

以下示例展示如何创建一个具有指定用户名（`user_1`）和密码（`P@ssw0rd`）的用户。用户的用户名和密码需要遵循以下规则：

- 用户名：必须以字母开头且只可以包含大写或小写字母、数字和下划线

- 密码：长度需为 8-64 个字符，且必须包含大写字母、小写字母、数字和特殊字符中的三种。

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

## 查看所有用户\{#list-users}

在创建了多个用户后，您可以查看所有已创建的用户列表。

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

示例结果如下，其中 `root` 为默认创建的根用户，`user_1` 为新创建的用户。

```bash
['root', 'user_1']
```

## 为用户分配角色\{#grant-a-role-to-a-user}

以下示例展示了如何将角色 `role_a` 分配给用户 `user_1`。

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

## 查看用户角色\{#describe-user}

为用户分配完角色后，您可以查看用户角色已验证操作是否成功。

以下示例展示了如何查看用户 `user_1` 的角色。

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

结果如下所示：

```bash
{'user_name': 'user_1', 'description':'a new user in the developers team', 'roles': 'role_a'}
```

## 撤销角色\{#revoke-a-role}

您还可以撤销已分配给用户的角色。

以下示例展示了如何撤销已分配给用户 `user_1` 的角色 `role_a`。

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

## 删除用户\{#drop-a-user}

以下示例展示如何删除用户 `user_1`。

<Admonition type="info" icon="📘" title="说明">

`root` 用户无法删除。

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

删除后，您可以通过查看所有用户操作检查是否删除成功。如果列表中未展示此前删除的用户则视为删除成功。

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

示例结果如下，列表中无 `user_1`，删除操作成功。

```bash
['root']
```

