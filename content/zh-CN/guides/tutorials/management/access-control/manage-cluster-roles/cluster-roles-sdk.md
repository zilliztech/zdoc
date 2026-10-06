---
title: "管理集群角色（SDK） | Cloud"
slug: /cluster-roles-sdk
sidebar_label: "管理集群角色（SDK）"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "集群角色定义了用户在集群内的权限。具体而言，集群角色控制集群用户在集群、Database 和 Collection 层级的权限。 | Cloud"
type: origin
token: IrLSwdkWWiSeshkNHfVcYhIjnHy
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 管理集群角色（SDK）

集群角色定义了用户在集群内的权限。具体而言，集群角色控制集群用户在集群、Database 和 Collection 层级的权限。

本文将介绍如何创建角色、将内置权限组授予角色、撤销授予角色的权限组，以及删除角色。有关内置权限组的详细信息，请参考[权限](./cluster-privileges)。

<Admonition type="info" title="说明">

此功能仅限 Dedicated 集群使用。

</Admonition>

## 创建角色\{#create-a-role}

以下示例展示了如何创建一个角色 `role_a`。

角色名称必须以字母开头且只可以包含大写或小写字母、数字和下划线。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

err = client.CreateRole(ctx, milvusclient.NewCreateRoleOption("role_a").WithDescription("a cluster read only role"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .create_role(
        CreateRoleRequest::builder()
            .role_name("role_a")
            .description("a cluster read only role")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->CreateRole(milvus::CreateRoleRequest()
                                     .WithRoleName("role_a")
                                     .WithDescription("a cluster read only role"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

await client.createRole({
  roleName: 'role_a',
  description: 'a cluster read only role',
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

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

## 查看所有角色\{#list-roles}

在创建了多个角色后，您可以查看所有已创建的角色列表。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

roles, err := client.ListRoles(ctx, milvusclient.NewListRoleOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(roles)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let roles = client
    .list_roles(ListRolesRequest::builder().build()?)
    .await?;
println!("{:?}", roles.role_names());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::ListRolesResponse resp;
auto status = client->ListRoles(milvus::ListRolesRequest(), resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const roles = await client.listRoles();
console.log(roles);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}' 
```

</TabItem>
</Tabs>

示例结果如下，`role_a` 为新创建的角色。

```bash
['role_a']
```

## 为角色分配权限组\{#grant-a-privilege-group-to-a-role}

在 Zilliz Cloud 中，你可以为一个角色分配如下权限：

- 内置权限组：Zilliz Cloud 提供了九种内置权限组。关于每种内置权限组中包含哪些权限，可以参考[内置权限组](./cluster-privileges#built-in-privilege-groups)。

- 自定义权限组：如果内置权限组不能满足您的需要，您也可以通过将多个权限组合的方式创建自定义权限组。更多详情，可参考[自定义权限组](./cluster-privileges#custom-privilege-group)。

<Admonition type="info" title="说明">

- 如需为角色分配自定义权限组，请[联系我们](http://support.zilliz.com)开通功能。

- Milvus 2.5 及以上版本的集群不再支持为角色分配单个权限。

</Admonition>

以下示例展示了如何为角色 `role_a` 分配在 `default` Database 中的名为 `collection_01` 的 Collection 中的 `PrivilegeSearch` 权限及名为 `privilege_group_1` 的自定义权限组。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .grant_privilege(
        GrantPrivilegeRequest::builder()
            .role_name("role_a")
            .privilege("privilege_group_1")
            .database_name("default")
            .collection_name("collection_01")
            .build()?,
    )
    .await?;

client
    .grant_privilege(
        GrantPrivilegeRequest::builder()
            .role_name("role_a")
            .privilege("ClusterReadOnly")
            .database_name("*")
            .collection_name("*")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::GrantPrivilegeV2Request grant_req;
grant_req.WithRoleName("role_a")
         .WithPrivilege("privilege_group_1")
         .WithDatabaseName("default")
         .WithCollectionName("collection_01");
auto status = client->GrantPrivilegeV2(grant_req);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

await client.grantPrivilegeV2({
  role: 'role_a',
  privilege: 'privilege_group_1',
  collection_name: 'collection_01',
  db_name: 'default',
});

await client.grantPrivilegeV2({
  role: 'role_a',
  privilege: 'ClusterReadOnly',
  collection_name: '*',
  db_name: '*',
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

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

以下是参数及其说明：

- **role_name**：需要授予权限组的目标角色名称。

- **privilege**：需要授予该角色的权限组。可选的参数值请参考[权限与权限组](./cluster-privileges)

- **Resource**：权限组对应的目标资源，可以是指定的集群、Database 或 Collection。

    下表说明了如何指定资源。

    <table>
       <tr>
         <th><p><strong>层级</strong></p></th>
         <th><p><strong>资源</strong></p></th>
         <th><p><strong>Grant Method</strong></p></th>
         <th><p><strong>Notes</strong></p></th>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>Collection</strong></p></td>
         <td><p>指定 Collection</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;CollectionAdmin&quot;,     collection_name=&quot;col1&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>输入目标 Collection 的名称，以及该 Collection 所属 Database 的名称。</p></td>
       </tr>
       <tr>
         <td><p>当前 Database 下所有 Collection</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;CollectionAdmin&quot;,     collection_name=&quot;&ast;&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>输入目标 Database 的名称，并将 Collection 名称设置为通配符 <code>&ast;</code>。</p></td>
       </tr>
       <tr>
         <td rowspan="2"><p><strong>Database</strong></p></td>
         <td><p>指定 Database</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;DatabaseAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;db1&quot; )</code></pre></td>
         <td><p>输入目标 Database 的名称，并将 Collection 名称设置为通配符 <code>&ast;</code>。</p></td>
       </tr>
       <tr>
         <td><p>当前集群下所有 Database</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;DatabaseAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;&ast;&quot; )</code></pre></td>
         <td><p>将 Database 名称和 Collection 名称都设置为通配符 <code>&ast;</code>。</p></td>
       </tr>
       <tr>
         <td><p><strong>集群</strong></p></td>
         <td><p>当前集群</p></td>
         <td><pre><code class="language-python"> client.grant_privilege_v2(     role_name=&quot;roleA&quot;,      privilege=&quot;ClusterAdmin&quot;,      collection_name=&quot;&ast;&quot;,      db_name=&quot;&ast;&quot; )</code></pre></td>
         <td><p>将 Database 名称和 Collection 名称都设置为通配符 <code>&ast;</code>。</p></td>
       </tr>
    </table>

## 查看角色权限\{#describe-a-role}

以下示例展示如何查看角色 `role_a` 的权限。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.describe_role(role_name="role_a")
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

role, err := client.DescribeRole(ctx, milvusclient.NewDescribeRoleOption("role_a"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(role)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let role = client
    .describe_role(
        DescribeRoleRequest::builder()
            .role_name("role_a")
            .build()?,
    )
    .await?;
println!("{:?}", role.role_name());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::DescribeRoleResponse resp;
auto status = client->DescribeRole(milvus::DescribeRoleRequest().WithRoleName("role_a"), resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const role = await client.describeRole({ roleName: 'role_a' });
console.log(role);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

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

示例结果如下:

```python
{
     "role": "role_a",
     "descripton": "a cluster read only role",
     "privilege": "ClusterReadOnly"
}
```

## 撤销为角色分配的权限组\{#revoke-a-privilege-group-from-a-role}

以下示例展示了如何撤销已分配给角色 `role_a` 的 `privilege_group_1` 自定义权限组和内置权限组 `ClusterReadOnly`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .revoke_privilege(
        RevokePrivilegeRequest::builder()
            .role_name("role_a")
            .privilege("privilege_group_1")
            .database_name("default")
            .collection_name("collection_01")
            .build()?,
    )
    .await?;

client
    .revoke_privilege(
        RevokePrivilegeRequest::builder()
            .role_name("role_a")
            .privilege("ClusterReadOnly")
            .database_name("*")
            .collection_name("*")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::RevokePrivilegeV2Request revoke_req;
revoke_req.WithRoleName("role_a")
           .WithPrivilege("privilege_group_1")
           .WithDatabaseName("default")
           .WithCollectionName("collection_01");
auto status = client->RevokePrivilegeV2(revoke_req);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

await client.revokePrivilegeV2({
  role: 'role_a',
  privilege: 'privilege_group_1',
  collection_name: 'collection_01',
  db_name: 'default',
});

await client.revokePrivilegeV2({
  role: 'role_a',
  privilege: 'ClusterReadOnly',
  collection_name: '*',
  db_name: '*',
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/revoke_privilege_v2" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "roleName": "role_a",
    "privilege": "privilege_group_1",
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

## 删除角色\{#drop-a-role}

以下示例展示了如何删除角色 `role_a`。

<Admonition type="info" title="说明">

内置的 `admin` 角色无法删除。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
err = client.DropRole(ctx, milvusclient.NewDropRoleOption("role_a"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

client
    .drop_role(
        DropRoleRequest::builder()
            .role_name("role_a")
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto status = client->DropRole(milvus::DropRoleRequest().WithRoleName("role_a"));
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

await client.dropRole({ roleName: 'role_a' });
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

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

删除后，您可以通过查看所有角色操作检查是否删除成功。如果列表中未展示此前删除的角色则视为删除成功。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

roles, err := client.ListRoles(ctx, milvusclient.NewListRoleOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(roles)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let roles = client
    .list_roles(ListRolesRequest::builder().build()?)
    .await?;
println!("{:?}", roles.role_names());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::ListRolesResponse resp;
auto status = client->ListRoles(milvus::ListRolesRequest(), resp);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const roles = await client.listRoles();
console.log(roles);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/roles/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}' 
```

</TabItem>
</Tabs>

示例结果如下，列表中无角色 `role_a`，删除操作成功。

```bash
['admin']
```

