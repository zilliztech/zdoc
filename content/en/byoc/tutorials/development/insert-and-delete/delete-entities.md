---
title: "Delete Entities | BYOC"
slug: /delete-entities
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can delete the entities that are no longer needed by filtering conditions or their primary keys. | BYOC"
type: origin
displayed_sidebar: default
token: shared-delete-entities
sidebar_label: "Delete"
sidebar_position: 4
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/insert-and-delete/delete-entities.md"

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Delete Entities

You can delete the entities that are no longer needed by filtering conditions or their primary keys.

## Delete Entities by Filtering Conditions\{#delete-entities-by-filtering-conditions}

When deleting multiple entities that share some attributes in a batch, you can use filter expressions. The example code below uses the **in** operator to bulk delete all entities with their **color** field set to the values of **red_7025** and **purple_4976**. You can also use other operators to construct filter expressions that meet your requirements. For more information about filter expressions, please refer to [Filtering Explained](./filtering-overview).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.delete(
    collection_name="quick_setup",
    # highlight-next-line
    filter="color in ['red_7025', 'purple_4976']"
)

print(res)

# Output
# {'delete_count': 2}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.DeleteReq;
import io.milvus.v2.service.vector.response.DeleteResp;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

DeleteResp deleteResp = client.delete(DeleteReq.builder()
        .collectionName("quick_setup")
        .filter("color in ['red_7025', 'purple_4976']")
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

_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").WithExpr("color in ['red_7025', 'purple_4976']"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let request = DeleteRequest::builder()
    .collection_name("quick_setup")
    .filter("color in ['red_7025', 'purple_4976']")
    .build()?;
let response = client.delete(request).await?;
println!("{:?}", response.delete_count());
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::DeleteResponse response;
status = client->Delete(milvus::DeleteRequest()
                            .WithCollectionName("quick_setup")
                            .WithFilter("color in ['red_7025', 'purple_4976']"),
                        response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 7. Delete entities
res = await client.delete({
    collection_name: "quick_setup",
    // highlight-next-line
    filter: "color in ['red_7025', 'purple_4976']"
})

console.log(res.delete_cnt)

// Output
//
// 2
//
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Types;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Responses.Dml;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

MutationResp res = await client.DeleteAsync(new DeleteReq
{
    CollectionName = "quick_setup",
    Expression = "color in [\"red_7025\", \"purple_4976\"]"
});
Console.WriteLine(res.DeleteCount);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "quick_setup",
    "filter": "color in [\"red_7025\", \"purple_4976\"]"
}'
```

</TabItem>

</Tabs>

## Delete Entities by Primary Keys\{#delete-entities-by-primary-keys}

In most cases, a primary key uniquely identifies an entity. You can delete entities by setting their primary keys in the delete request. The example code below demonstrates how to delete two entities with primary keys **18** and **19**.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.delete(
    collection_name="quick_setup",
    # highlight-next-line
    ids=[18, 19]
)

print(res)

# Output
# {'delete_count': 2}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.DeleteReq;
import io.milvus.v2.service.vector.response.DeleteResp;

import java.util.Arrays;

DeleteResp deleteResp = client.delete(DeleteReq.builder()
        .collectionName("quick_setup")
        .ids(Arrays.asList(18, 19))
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
    WithInt64IDs("id", []int64{18, 19}))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

    let request = DeleteRequest::builder()
        .collection_name("quick_setup")
        .ids(Ids::Int64(vec![18, 19]))
        .build()?;
    let response = client.delete(request).await?;
    println!("{:?}", response.delete_count());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::DeleteResponse response;
auto status = client->Delete(milvus::DeleteRequest()
                                .WithCollectionName("quick_setup")
                                .WithIDs(std::vector<int64_t>{18, 19}),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

res = await client.delete({
    collection_name: "quick_setup",
    ids: [18, 19]
})

console.log(res.delete_cnt)

// Output
//
// 2
//
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Responses.Dml;

MutationResp res = await client.DeleteAsync(new DeleteReq
{
    CollectionName = "quick_setup",
    Ids = [18, 19]
});
Console.WriteLine(res.DeleteCount);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "quick_setup",
    "filter": "id in [18, 19]"
}'
## {"code":0,"cost":0,"data":{}}
```

</TabItem>

</Tabs>

## Delete Entities from Partitions\{#delete-entities-from-partitions}

You can also delete entities stored in specific partitions. The following code snippets assume that you have a partition named **partitionA** in your collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.delete(
    collection_name="quick_setup",
    ids=[18, 19],
    partition_name="partitionA"
)

print(res)

# Output
# {'delete_count': 2}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.DeleteReq;
import io.milvus.v2.service.vector.response.DeleteResp;

import java.util.Arrays;

DeleteResp deleteResp = client.delete(DeleteReq.builder()
        .collectionName("quick_setup")
        .ids(Arrays.asList(18, 19))
        .partitionName("partitionA")
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
    WithInt64IDs("id", []int64{18, 19}).
    WithPartition("partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

    let request = DeleteRequest::builder()
        .collection_name("quick_setup")
        .ids(Ids::Int64(vec![18, 19]))
        .partition_name("partitionA")
        .build()?;
    let response = client.delete(request).await?;
    println!("{:?}", response.delete_count());
```

</TabItem>

<TabItem value='c++'>

```c++
milvus::DeleteResponse response;
auto status = client->Delete(milvus::DeleteRequest()
                                .WithCollectionName("quick_setup")
                                .WithPartitionName("partitionA")
                                .WithIDs(std::vector<int64_t>{18, 19}),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

res = await client.delete({
    collection_name: "quick_setup",
    ids: [18, 19],
    partition_name: "partitionA"
})

console.log(res.delete_cnt)

// Output
//
// 2
//
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Responses.Dml;

MutationResp res = await client.DeleteAsync(new DeleteReq
{
    CollectionName = "quick_setup",
    Ids = [18, 19],
    PartitionName = "partitionA"
});
Console.WriteLine(res.DeleteCount);
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "quick_setup",
    "partitionName": "partitionA",
    "filter": "id in [18, 19]"
}'

# {
#     "code": 0,
#     "cost": 0,
#     "data": {}
# }
```

</TabItem>

</Tabs>
