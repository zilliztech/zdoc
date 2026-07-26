---
title: "查看 Collection | BYOC"
slug: /view-collections
sidebar_label: "查看 Collection"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "您既可以查看当前连接的数据库中已创建的 Collection 名称列表，也可以针对某个 Collection 了解其详细情况。 | BYOC"
type: origin
token: WH2nwtc8ZiZ8cokQfxHcO2Mqn6c
sidebar_position: 4
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - 查看 collection
  - list collections
  - describe collection
  - 查看 collection 列表
  - 查看 colletion 详情

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 查看 Collection

您既可以查看当前连接的数据库中已创建的 Collection 名称列表，也可以针对某个 Collection 了解其详细情况。

## 查看 Collection 列表\{#list-collections}

如下示例演示了如何查看当前连接的数据库中已创建的 Collection 名称列表。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

res = client.list_collections()

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.response.ListCollectionsResp;

ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

ListCollectionsResp resp = client.listCollections();
System.out.println(resp.getCollectionNames());
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'localhost:19530',
    token: 'YOUR_CLUSTER_TOKEN'
});

const collections = await client.listCollections();
console.log(collections);
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

milvusAddr := "localhost:19530"
token := "YOUR_CLUSTER_TOKEN"
client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    fmt.Println(err.Error())
    // handle err
}
defer client.Close(ctx)

collectionNames, err := client.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

fmt.Println(collectionNames)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

如果您已经创建了名为 `quick_setup` 的 Collection，运行上述示例的结果如下：

```json
["quick_setup"]
```

## 查看 Collection 详情\{#describe-collection}

您也可以根据需要查看某个 Collection 的详细情况。如下示例代码中假设您已经创建了名为 quick_setup 的 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.describe_collection(
    collection_name="quick_setup"
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;

DescribeCollectionReq request = DescribeCollectionReq.builder()
        .collectionName("quick_setup")
        .build();
DescribeCollectionResp resp = client.describeCollection(request);
System.out.println(resp);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const res = await client.describeCollection({
    collection_name: "quick_setup"
});

console.log(res);
```

</TabItem>

<TabItem value='go'>

```go
collection, err := client.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}

fmt.Println(collection)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "quick_setup"
}'
```

</TabItem>
</Tabs>

如果您已经创建了名为 `quick_setup` 的 Collection，运行上述示例的结果如下：

```plaintext
{
    'collection_name': 'quick_setup', 
    'auto_id': False, 
    'num_shards': 1, 
    'description': '', 
    'fields': [
        {
            'field_id': 100, 
            'name': 'id', 
            'description': '', 
            'type': <DataType.INT64: 5>, 
            'params': {}, 
            'is_primary': True
        }, 
        {
            'field_id': 101, 
            'name': 'vector', 
            'description': '', 
            'type': <DataType.FLOAT_VECTOR: 101>, 
            'params': {'dim': 768}
        }
    ], 
    'functions': [], 
    'aliases': [], 
    'collection_id': 456909630285026300, 
    'consistency_level': 2, 
    'properties': {}, 
    'num_partitions': 1, 
    'enable_dynamic_field': True
}
```

