---
title: "コレクションの表示 | BYOC"
slug: /view-collections
sidebar_key: view-collections
sidebar_label: "表示"
beta: FALSE
notebook: FALSE
description: "現在接続されているデータベース内のすべてのコレクション名のリストを取得し、特定のコレクションの詳細を確認できます。| BYOC"
type: origin
token: VAirw0c7ZiKCSqkjtDscAsC4nAf
sidebar_position: 4
keywords: 
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - コレクションの表示

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションの表示

現在接続中のデータベースに存在するすべてのコレクションの名前一覧を取得したり、特定のコレクションの詳細を確認したりできます。

## コレクションの一覧表示\{#list-collections}

以下の例では、現在接続中のデータベース内のすべてのコレクションの名前一覧を取得する方法を示しています。

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

<TabItem value='java'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN'
});

const collections = await client.listCollections();
console.log(collections);
```

</TabItem>

<TabItem value='java'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
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

<TabItem value='java'>

```bash
curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

</TabItem>
</Tabs>

すでに `quick_setup` という名前のコレクションを作成済みの場合、上記の例の結果は以下のようになります。

```json
["quick_setup"]
```

## コレクションの詳細取得\{#describe-collection}

特定のコレクションの詳細情報を取得することもできます。以下の例では、`quick_setup` という名前のコレクションがすでに作成済みであることを前提としています。

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

<TabItem value='java'>

```javascript
const res = await client.describeCollection({
    collection_name: "quick_setup"
});

console.log(res);
```

</TabItem>

<TabItem value='java'>

```go
collection, err := client.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
    fmt.Println(err.Error())
    // handle err
}

fmt.Println(collection)
```

</TabItem>

<TabItem value='java'>

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

上記の例の結果は、以下のようになるはずです。

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

