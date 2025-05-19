---
title: "コレクションを見る | BYOC"
slug: /view-collections
sidebar_label: "コレクションを見る"
beta: FALSE
notebook: FALSE
description: "現在接続されているデータベース内のすべてのコレクションの名前リストを取得し、特定のコレクションの詳細を確認できます。 | BYOC"
type: origin
token: RWOjwFwsDi7MPykySlEc35v1nTb
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - view collections
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションを見る

現在接続されているデータベース内のすべてのコレクションの名前リストを取得し、特定のコレクションの詳細を確認できます。

## リストコレクション{#list-collections}

次の例は、現在接続されているデータベース内のすべてのコレクションの名前リストを取得する方法を示しています。

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
    address: 'YOUR_CLUSTER_ENDPOINT',
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

milvusAddr := "YOUR_CLUSTER_ENDPOINT"
token := "YOUR_CLUSTER_TOKEN"

cli, err := client.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  token,
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

collectionNames, err := cli.ListCollections(ctx, milvusclient.NewListCollectionOption())
if err != nil {
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
-d '{}
}'
```

</TabItem>
</Tabs>

すでに`quick_setup`という名前のコレクションを作成している場合、上記の例の結果は次のようになります。

```json
["quick_setup"]
```

## コレクションを説明する{#describe-collection}

特定のコレクションの詳細を取得することもできます。次の例では、すでにquick_setupという名前のコレクションを作成していることを前提としています。

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
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

milvusAddr := "YOUR_CLUSTER_ENDPOINT"

cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}

defer cli.Close(ctx)

collection, err := cli.DescribeCollection(ctx, milvusclient.NewDescribeCollectionOption("quick_setup"))
if err != nil {
    // handle error
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

上記の例の結果は、次のようになります。

```json
// TO BE ADDED
```

