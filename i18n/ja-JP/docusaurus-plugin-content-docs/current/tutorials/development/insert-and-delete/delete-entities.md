---
title: "エンティティの削除 | Cloud"
slug: /delete-entities
sidebar_label: "削除"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "不要になったエンティティは、フィルタリング条件またはその主キーによって削除できます。 | Cloud"
type: origin
token: RhKcwNACpi3WihkTzo8cr4BCnee
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティの削除

不要になったエンティティは、フィルタリング条件またはその主キーによって削除できます。

## フィルタリング条件によるエンティティの削除\{#delete-entities-by-filtering-conditions}

いくつかの属性を共有する複数のエンティティを一括で削除する場合は、フィルター式を使用できます。以下のコード例では、**in** 演算子を使用して、**color** フィールドが **red** および **purple** の値に設定されているすべてのエンティティを一括削除しています。要件に応じたフィルター式を構築するために、他の演算子を使用することもできます。フィルター式の詳細については、[Filtering Explained](./filtering-overview) を参照してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

ilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

DeleteResp deleteResp = client.delete(DeleteReq.builder()
        .collectionName("quick_setup")
        .filter("color in ['red_7025', 'purple_4976']")
        .build());
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
    filter: "color in ['red_7025', 'purple_4976]"
})

console.log(res.delete_cnt)

// Output
// 
// 3
// 
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/column"
    "github.com/milvus-io/milvus/client/v2/entity"
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

_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").WithExpr("color in ['red_7025', 'purple_4976']"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
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

## 主キーによるエンティティの削除\{#delete-entities-by-primary-keys}

ほとんどの場合、主キーはエンティティを一意に識別します。削除リクエストで主キーを指定することで、エンティティを削除できます。以下のコード例は、主キー **18** と **19** を持つ 2 つのエンティティを削除する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
    WithInt64IDs("id", []int64{18, 19}))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
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

## パーティションからのエンティティの削除\{#delete-entities-from-partitions}

特定のパーティションに保存されているエンティティを削除することもできます。以下のコードスニペットは、コレクションに **PartitionA** という名前のパーティションがあることを前提としています。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
    WithInt64IDs("id", []int64{18, 19}).
    WithPartition("partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
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

```c++
milvus::DeleteResponse response;
auto status = client->Delete(milvus::DeleteRequest()
                                .WithCollectionName("quick_setup")
                                .AddPartitionName("partitionA")
                                .WithIDs(std::vector<int64_t>{18, 19}),
                             response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```
