---
title: "Manage Cluster Roles (SDK) | BYOC"
slug: /cluster-roles-sdk
sidebar_label: "Manage Cluster Roles (SDK)"
beta: FALSE
notebook: FALSE
description: "A cluster role defines the privileges that a user has within the cluster. More specifically, the cluster role controls a cluster user's privileges on the cluster, database, and collection level. | BYOC"
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
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm

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

## Create a role{#create-a-role}

The following example demonstrates how to create a role named `role_a`. 

The role name must follow the following rule:

- Must start with a letter and can only include uppercase or lowercase letters, numbers, and underscores.

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

## List roles{#list-roles}

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

## Grant a built-in privilege group to a role{#grant-a-built-in-privilege-group-to-a-role}

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, Zilliz Cloud only supports creating custom roles with built-in privilege groups. For details about built-in privilege groups, refer to <a href="./cluster-privileges#built-in-privilege-groups">Privileges</a>.</p>
<p>If you need to create custom roles with user-defined privileges and privilege groups, please <a href="http://support.zilliz.com">contact us</a>.</p>

</Admonition>

The following example demonstrates how to grant `role_a` read-only access to all collections in the `default` database and admin access to `collection_01`.

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

## Describe a role{#describe-a-role}

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

## Revoke a built-in privilege group from a role{#revoke-a-built-in-privilege-group-from-a-role}

The following example demonstrates how to revoke the read-only access to all collections in the `default` database and admin access to `collection_01` from `role_a`.

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

## Drop a role{#drop-a-role}

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

