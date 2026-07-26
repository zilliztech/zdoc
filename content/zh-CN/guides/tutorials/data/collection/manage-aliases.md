---
title: "管理 Alias | Cloud"
slug: /manage-aliases
sidebar_key: manage-aliases
sidebar_label: "管理 Alias"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 为 Collection 提供了 Alias 管理能力。本节介绍如何创建、查看、删除 Alias。 | Cloud"
type: origin
token: Cwr5wh4WPix6M6kH1BycMgS2nEh
sidebar_position: 9
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - collection 别名
  - collection alias

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 管理 Alias

Zilliz Cloud 为 Collection 提供了 Alias 管理能力。本节介绍如何创建、查看、删除 Alias。

## 为何使用 Alias\{#why-use-an-alias}

通过为指定 Collection 绑定不同的别名，可以在不修改应用代码的情况下方便的更换不同的 Collection。

假设您的应用需要查询的 Collection 绑定了一个名为 `prod_data`的 Alias。当您需要使用新数据时，你可以按照如下步骤以不中断业务的方式完成该任务：

1. **创建一个新的 Collection**，并将其命名为 `prod_data_v2`。

1. **准备数据**：为该 Collection 创建索引并加载该 Collection。然后将新的数据存入该 Collection。

1. **更换别名**：在新 Collection 就绪后，将 `prod_data` 这个 Alias 重新分配给 `prod_data_v2` 这个 Collection。

这时，您的应用仍旧可以将业务请求发送到 `prod_data`，业务运行丝毫不受影响。该机制让数据无缝更新成为可能，简化了向量检索服务的蓝绿部署流程。

Alias 的关键特性：

- 一个 Collection 可以绑定多个 Alias。

- 一个 Alias 一次只能绑定到一个 Collection，不能同时绑定多个 Collection。

- 在处理接收到的业务请求时，Zilliz Cloud 会检查请求中指定的 Collection 名称是否存在。如果不存在，Zilliz Cloud 就会检查现有 Alias 中是否存在该名称。

## 创建 Alias\{#create-alias}

您可以参考如下代码为您的 Collection 创建 Alias。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# 9. Manage aliases
# 9.1. Create aliases
client.create_alias(
    collection_name="my_collection_1",
    alias="bob"
)

client.create_alias(
    collection_name="my_collection_1",
    alias="alice"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.CreateAliasReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 9. Manage aliases

// 9.1 Create alias
CreateAliasReq createAliasReq = CreateAliasReq.builder()
        .collectionName("my_collection_1")
        .alias("bob")
        .build();

client.createAlias(createAliasReq);

createAliasReq = CreateAliasReq.builder()
        .collectionName("my_collection_1")
        .alias("alice")
        .build();

client.createAlias(createAliasReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 9. Manage aliases
// 9.1 Create aliases
res = await client.createAlias({
    collection_name: "my_collection_1",
    alias: "bob"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.createAlias({
    collection_name: "my_collection_1",
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 
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

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

err = client.CreateAlias(ctx, milvusclient.NewCreateAliasOption("my_collection_1", "bob"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.CreateAlias(ctx, milvusclient.NewCreateAliasOption("my_collection_1", "alice"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "bob",
    "collectionName": "my_collection_1"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "alice",
    "collectionName": "my_collection_1"
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>
</Tabs>

## 查看分配给 Collection 的所有 Alias\{#list-aliases}

你可以参考如下代码查看分配给指定 Collection 的所有 Alias。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.2. List aliases
res = client.list_aliases(
    collection_name="my_collection_1"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "bob",
#         "alice"
#     ],
#     "collection_name": "my_collection_1",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.ListAliasesReq;
import io.milvus.v2.service.utility.response.ListAliasResp;

// 9.2 List alises
ListAliasesReq listAliasesReq = ListAliasesReq.builder()
    .collectionName("my_collection_1")
    .build();

ListAliasResp listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

// Output:
// [bob, alice]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.2 List aliases
res = await client.listAliases({
    collection_name: "my_collection_1"
})

console.log(res.aliases)

// Output
// 
// [ 'bob', 'alice' ]
// 
```

</TabItem>

<TabItem value='go'>

```go
aliases, err := client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(aliases)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'

# {
#     "code": 0,
#     "data": [
#         "bob",
#         "alice"
#     ]
# }
```

</TabItem>
</Tabs>

## 查看 Alias 详情\{#describe-alias}

你可以参考如下代码查看指定 Alias 绑定的 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.3. Describe aliases
res = client.describe_alias(
    alias="bob"
)

print(res)

# Output
#
# {
#     "alias": "bob",
#     "collection_name": "my_collection_1",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.DescribeAliasReq;
import io.milvus.v2.service.utility.response.DescribeAliasResp;

// 9.3 Describe alias
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
    .alias("bob")
    .build();

DescribeAliasResp describeAliasRes = client.describeAlias(describeAliasReq);

System.out.println(describeAliasRes);

// Output:
// DescribeAliasResp(databaseName=default, collectionName=my_collection_1, alias=bob)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.3 Describe aliases
res = await client.describeAlias({
    collection_name: "my_collection_1",
    alias: "bob"
})

console.log(res)

// Output
// 
// {
//   status: {
//     extra_info: {},
//     error_code: 'Success',
//     reason: '',
//     code: 0,
//     retriable: false,
//     detail: ''
//   },
//   db_name: 'default',
//   alias: 'bob',
//   collection: 'my_collection_1'
// }
// 
```

</TabItem>

<TabItem value='go'>

```go
alias, err := client.DescribeAlias(ctx, milvusclient.NewDescribeAliasOption("bob"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(alias)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "bob"
}'

# {
#     "code": 0,
#     "data": {
#         "aliasName": "bob",
#         "collectionName": "my_collection_1",
#         "dbName": "default"
#     }
# }
```

</TabItem>
</Tabs>

## 重新分配 Alias\{#alter-alias}

你可以参考如下代码将已经分配给某个 Collection 的 Alias 重新分配给另一个 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.4 Reassign aliases to other collections
client.alter_alias(
    collection_name="my_collection_2",
    alias="alice"
)

res = client.list_aliases(
    collection_name="my_collection_2"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "alice"
#     ],
#     "collection_name": "my_collection_2",
#     "db_name": "default"
# }

res = client.list_aliases(
    collection_name="my_collection_1"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "bob"
#     ],
#     "collection_name": "my_collection_1",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.AlterAliasReq;

// 9.4 Reassign alias to other collections
AlterAliasReq alterAliasReq = AlterAliasReq.builder()
        .collectionName("my_collection_2")
        .alias("alice")
        .build();

client.alterAlias(alterAliasReq);

ListAliasesReq listAliasesReq = ListAliasesReq.builder()
        .collectionName("my_collection_2")
        .build();

ListAliasResp listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

listAliasesReq = ListAliasesReq.builder()
        .collectionName("my_collection_1")
        .build();

listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

// Output:
// [bob]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.4 Reassign aliases to other collections
res = await client.alterAlias({
    collection_name: "my_collection_2",
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.listAliases({
    collection_name: "my_collection_2"
})

console.log(res.aliases)

// Output
// 
// [ 'alice' ]
// 

res = await client.listAliases({
    collection_name: "my_collection_1"
})

console.log(res.aliases)

// Output
// 
// [ 'bob' ]
// 

```

</TabItem>

<TabItem value='go'>

```go
err = client.AlterAlias(ctx, milvusclient.NewAlterAliasOption("alice", "my_collection_2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

aliases, err := client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_2"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(aliases)

aliases, err = client.ListAliases(ctx, milvusclient.NewListAliasesOption("my_collection_1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(aliases)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/alter" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "alice",
    "collectionName": "my_collection_2"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "alice"
}'

# {
#     "code": 0,
#     "data": {
#         "aliasName": "alice",
#         "collectionName": "my_collection_2",
#         "dbName": "default"
#     }
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "bob"
}'

# {
#     "code": 0,
#     "data": {
#         "aliasName": "alice",
#         "collectionName": "my_collection_1",
#         "dbName": "default"
#     }
# }
```

</TabItem>
</Tabs>

## 删除 Alias\{#drop-alias}

你可以参考如下代码删除指定的 Alias。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 9.5 Drop aliases
client.drop_alias(
    alias="bob"
)

client.drop_alias(
    alias="alice"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.DropAliasReq;

// 9.5 Drop alias
DropAliasReq dropAliasReq = DropAliasReq.builder()
    .alias("bob")
    .build();

client.dropAlias(dropAliasReq);

dropAliasReq = DropAliasReq.builder()
    .alias("alice")
    .build();

client.dropAlias(dropAliasReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.5 Drop aliases
res = await client.dropAlias({
    alias: "bob"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.dropAlias({
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>

<TabItem value='go'>

```go
err = client.DropAlias(ctx, milvusclient.NewDropAliasOption("bob"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

err = client.DropAlias(ctx, milvusclient.NewDropAliasOption("alice"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "bob"
}'

# {
#     "code": 0,
#     "data": {}
# }

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/aliases/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "aliasName": "alice"
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>
</Tabs>

