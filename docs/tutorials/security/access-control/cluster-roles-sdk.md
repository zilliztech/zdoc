---
title: "Manage Cluster Roles (SDK) | Cloud"
slug: /cluster-roles-sdk
sidebar_label: "Manage Cluster Roles (SDK)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A cluster role defines the privileges that a user has within the cluster. More specifically, the cluster role controls a cluster user's privileges on the cluster, database, and collection level. | Cloud"
type: origin
token: PBZwwNqWjiikeYkXgHPcGhLznTh
sidebar_position: 5
keywords: 
  - zilliz
  - vector database
  - cloud
  - cluster
  - access control
  - rbac
  - roles
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Cluster Roles (SDK)

A cluster role defines the privileges that a user has within the cluster. More specifically, the cluster role controls a cluster user's privileges on the cluster, database, and collection level.

This guide walks you through how to create a role, grant built-in privilege groups to a role, revoke privilege groups from a role, and finally drop a role. For details about built-in privilege groups, refer to [Privileges](./cluster-privileges#built-in-privilege-groups).

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is exclusively available to Dedicated clusters.</p>

</Admonition>

## Create a role\{#create-a-role}

The following example demonstrates how to create a role named `role_a`. 

The role name must follow the following rule:

- Must start with a letter and can only include uppercase or lowercase letters, numbers, and underscores.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.create_role(role_name="role_a")

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.rbac.request.CreateRoleReq;
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

## List roles\{#list-roles}

After creating several roles, you can list and view all existing roles.

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

Below is an example output. `role_a` is the new role that is just created.

```bash
['role_a']
```

## Grant a privilege or a privilege group to a role\{#grant-a-privilege-or-a-privilege-group-to-a-role}

In Zilliz Cloud, you can grant the followings to a role:

- **Privileges:** Zilliz Cloud provides various types of privileges. For details, refer to [All privileges](./cluster-privileges#all-privileges).

- **Built-in privilege groups:** Zilliz Cloud offers 9 built-in privilege groups. For details about the specific privileges included in each built-in privilege group, refer to [Built-in privilege groups](./cluster-privileges#built-in-privilege-groups).

- **Custom privilege groups:** If the built-in privileges do not meet your needs, you can combine different privileges to create your own custom privilege groups. For details, refer to [Custom privilege groups](./cluster-privileges#custom-privilege-groups).

<Admonition type="info" icon="📘" title="Notes">

<p>If you need to grant specific privileges and custom privilege groups to a role, please <a href="http://support.zilliz.com">create a support ticket</a> first so that we can enable this feature for you.</p>

</Admonition>

The following example demonstrates how to grant the privilege `PrivilegeSearch` on `collection_01` under the `default` database as well as a custom privilege group named `privilege_group_1` to the role `role_a`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client.grant_privilege_v2(
    role_name="role_a",
    privilege="Search",
    collection_name='collection_01',
    db_name='default',
)
    
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
        .privilege("Search")
        .collectionName("collection_01")
        .dbName("default")
        .build());

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

err = client.GrantV2(ctx, milvusclient.NewGrantV2Option("role_a", "Search", "default", "collection_01"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

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
    privilege: "Search"
    collection_name: 'collection_01'
    db_name: 'default',
});
    
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
    "privilege": "Search",
    "collectionName": "collection_01",
    "dbName":"default"
}'

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

## Describe a role\{#describe-a-role}

The following example demonstrates how to view the privileges granted to the role `role_a` using the `describe_role` method.

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

Below is an example output. 

```python
{
     "role": "role_a",
     "privileges": [
         "COLL_ADMIN"
     ]
}
```

## Revoke a privilege or a privilege group from a role\{#revoke-a-privilege-or-a-privilege-group-from-a-role}

The following example demonstrates how to revoke the privilege `PrivilegeSearch` on `collection_01` under the `default` database as well as the privilege group `privilege_group_1` that have been granted to the role `role_a`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.revoke_privilege_v2(
    role_name="role_a",
    privilege="Search",
    collection_name='collection_01',
    db_name='default',
)
    
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
        .privilege("Search")
        .collectionName("collection_01")
        .dbName("default")
        .build());

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
err = client.RevokePrivilegeV2(ctx, milvusclient.NewRevokePrivilegeV2Option("role_a", "Search", "collection_01").
        WithDbName("default"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

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
    privilege: 'Search',
    collection_name: 'collection_01',
    db_name: 'default'
});

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

## Drop a role\{#drop-a-role}

The following example demonstrates how to drop the role `role_a`.

<Admonition type="info" icon="📘" title="Notes">

<p>The built-in role <code>admin</code> cannot be dropped.</p>

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

Once the role is dropped, you can list all existing roles to check if the drop operation is successful. 

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

Below is an example output. There is no `role_a` in the list. The drop operation is successful.

```bash
['admin']
```

