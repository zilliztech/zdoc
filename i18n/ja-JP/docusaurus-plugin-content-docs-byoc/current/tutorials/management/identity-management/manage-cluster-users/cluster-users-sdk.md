---
title: "クラスターユーザーの管理（SDK） | BYOC"
slug: /cluster-users-sdk
sidebar_label: "クラスターユーザーの管理（SDK）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、クラスターユーザーを作成してクラスターロールを割り当て、権限を定義することでデータセキュリティを確保できます。 | BYOC"
type: origin
token: I2CHwfDHKilTMukoZ13cR2M4nzb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# クラスターユーザーの管理（SDK）

Zilliz Cloud では、クラスターユーザーを作成してクラスターロールを割り当て、権限を定義することでデータセキュリティを確保できます。

このガイドでは、クラスターユーザーの作成、ユーザーへのロール付与、ユーザーからのロール取り消し、およびユーザー削除の手順を説明します。クラスターロールの詳細については、[クラスターロールの管理（コンソール）](./cluster-roles) を参照してください。

## ユーザーの作成\{#create-a-user}

次の例では、ユーザー名 `user_1`、パスワード `P@ssw0rd` のユーザーを作成する方法を示します。ユーザー名とパスワードは、以下の規則に従う必要があります。

- ユーザー名: 先頭は英字で、使用できるのは大文字・小文字の英字、数字、アンダースコアのみです。

- パスワード: 8〜64 文字で、大文字、小文字、数字、特殊文字のうち 3 種類以上を含む必要があります。

- （任意）説明: 最大 1024 バイト（UTF-8）まで指定できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

err = client.CreateUser(ctx, milvusclient.NewCreateUserOption("user_1", "P@ssw0rd").
    WithDescription("a new user in the developers team"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.create_user(
        sdk::request::rbac::CreateUserRequest::builder()
            .username("user_1")
            .password("P@ssw0rd")
            .description("a new user in the developers team")
            .build()?,
    ).await?;
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->CreateUser(milvus::CreateUserRequest()
                                .WithUserName("user_1")
                                .WithPassword("P@ssw0rd")
                                .WithDescription("a new user in the developers team"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.createUser({
   username: 'user_1',
   password: 'P@ssw0rd',
   description: 'a new user in the developers team',
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
    "password": "P@ssw0rd",
    "description": "a new user in the developers team"
}' 
```

</TabItem>
</Tabs>

## ユーザーの一覧表示\{#list-users}

複数のユーザーを作成した後は、既存のすべてのユーザーを一覧表示して確認できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.list_users()
```

</TabItem>

<TabItem value='java'>

```java
import java.util.List;

List<String> resp = client.listUsers();
```

</TabItem>

<TabItem value='go'>

```go
users, err := client.ListUsers(ctx, milvusclient.NewListUserOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
let users = client.list_users(
    sdk::request::rbac::ListUsersRequest::builder().build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::ListUsersRequest request;
milvus::ListUsersResponse response;
auto status = client->ListUsers(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.listUsers();
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

以下は出力例です。`root` は自動生成されるデフォルトユーザー、`user_1` は新たに作成されたユーザーです。

```bash
['root', 'user_1']
```

## ユーザーへのロール付与\{#grant-a-role-to-a-user}

次の例では、ユーザー `user_1` にロール `role_a` を付与する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

err = client.GrantRole(ctx, milvusclient.NewGrantRoleOption("user_1", "role_a"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.grant_role(
        sdk::request::rbac::GrantRoleRequest::builder()
            .username("user_1")
            .role_name("role_a")
            .build()?,
    ).await?;
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->GrantRole(milvus::GrantRoleRequest()
                               .WithUserName("user_1")
                               .WithRoleName("role_a"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.grantRole({
   username: 'user_1',
   roleName: 'role_a'
 });
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

## ユーザー情報の確認\{#describe-user}

ロール付与後、`describe_user()` メソッドを使って操作が成功したかを確認できます。

次の例では、ユーザー `user_1` に割り当てられているロールを確認する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
user, err := client.DescribeUser(ctx, milvusclient.NewDescribeUserOption("user_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
let user = client.describe_user(
    sdk::request::rbac::DescribeUserRequest::builder()
        .username("user_1")
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::DescribeUserResponse response;
auto status = client->DescribeUser(
    milvus::DescribeUserRequest().WithUserName("user_1"), response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.describeUser({username: 'user_1'});
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

## ロールの取り消し\{#revoke-a-role}

ユーザーに割り当てたロールを取り消すこともできます。

次の例では、ユーザー `user_1` からロール `role_a` を取り消す方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
err = client.RevokeRole(ctx, milvusclient.NewRevokeRoleOption("user_1", "role_a"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
client.revoke_role(
    sdk::request::rbac::RevokeRoleRequest::builder()
        .username("user_1")
        .role_name("role_a")
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->RevokeRole(milvus::RevokeRoleRequest()
                                     .WithUserName("user_1")
                                     .WithRoleName("role_a"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
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

## ユーザーの削除\{#drop-user}

次の例では、ユーザー `user_1` を削除する方法を示します。

<Admonition type="info" title="Notes">

`root` ユーザーは削除できません。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# drop the user
client.drop_user(user_name="user_1")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropUserReq;

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

err = client.DropUser(ctx, milvusclient.NewDropUserOption("user_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2 as sdk;
use milvus::v2::error::Result;
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    ).await?;

    client.drop_user(
        sdk::request::rbac::DropUserRequest::builder()
            .username("user_1")
            .build()?,
    ).await?;
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

status = client->DropUser(milvus::DropUserRequest().WithUserName("user_1"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

await client.deleteUser({
    username: 'user_1'
});
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

ユーザーを削除したら、既存のユーザー一覧を確認して、削除操作が成功したかどうかを検証できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.list_users()
```

</TabItem>

<TabItem value='java'>

```java
import java.util.List;

List<String> resp = client.listUsers();
```

</TabItem>

<TabItem value='go'>

```go
users, err := client.ListUsers(ctx, milvusclient.NewListUserOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
let users = client.list_users(
    sdk::request::rbac::ListUsersRequest::builder().build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::ListUsersRequest request;
milvus::ListUsersResponse response;
auto status = client->ListUsers(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
await client.listUsers();
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

以下は出力例です。一覧に `user_1` が含まれていないため、削除操作は成功しています。

```bash
['root']
```

