---
title: "エンティティの削除 | BYOC"
slug: /delete-entities
sidebar_label: "エンティティの削除"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "フィルタリング条件または主キーを使用して、不要になったエンティティを削除できます。 | BYOC"
type: origin
token: RhKcwNACpi3WihkTzo8cr4BCnee
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - 削除
  - エンティティの削除
  - milvus
  - Zilliz
  - milvus ベクトルデータベース
  - milvus db

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# エンティティの削除

フィルタリング条件または主キーを使用して、不要になったエンティティを削除できます。

## フィルタリング条件によるエンティティの削除\{#delete-entities-by-filtering-conditions}

一部の属性を共有する複数のエンティティをバッチで削除する場合、フィルター式を使用できます。以下のコード例では **in** 演算子を使用して、**color** フィールドが **red** および **purple** の値に設定されているすべてのエンティティを一括で削除しています。必要に応じたフィルター式を構成するために、他の演算子を使用することもできます。フィルター式の詳細については、[フィルタリングの説明](./filtering-overview)を参照してください。

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
    filter="color in ['red_7025', 'purple_4976]"
)

print(res)

# 出力
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

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 7. エンティティの削除
res = await client.delete({
    collection_name: "quick_setup",
    // highlight-next-line
    filter: "color in ['red_7025', 'purple_4976]"
})

console.log(res.delete_cnt)

// 出力
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
    // エラー処理
}
defer client.Close(ctx)

_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").WithExpr("color in ['red_7025', 'purple_4976']"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
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
-d '{
    "collectionName": "quick_setup",
    "filter": "color in [\"red_7025\", \"purple_4976\"]"
}'
```

</TabItem>
</Tabs>

## 主キーによるエンティティの削除\{#delete-entities-by-primary-keys}

ほとんどの場合、主キーはエンティティを一意に識別します。削除要求で主キーを設定することでエンティティを削除できます。以下のコード例では、主キー **18** および **19** を持つ2つのエンティティを削除する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.delete(
    collection_name="quick_setup",
    # highlight-next-line
    ids=[18, 19]
)

print(res)

# 出力
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

# 出力
#
# 2
#
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
    WithInt64IDs("id", []int64{18, 19}))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
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
-d '{
    "collectionName": "quick_setup",
    "filter": "id in [18, 19]"
}'
## {"code":0,"cost":0,"data":{}}
```

</TabItem>
</Tabs>

## パーティションからのエンティティの削除\{#delete-entities-from-partitions}

特定のパーティションに格納されたエンティティを削除することもできます。以下のコードスニペットでは、コレクション内に **PartitionA** という名前のパーティションが存在すると仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.delete(
    collection_name="quick_setup",
    ids=[18, 19],
    partition_name="partitionA"
)

print(res)

# 出力
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

# 出力
#
# 2
#
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Delete(ctx, milvusclient.NewDeleteOption("quick_setup").
    WithInt64IDs("id", []int64{18, 19}).
    WithPartition("partitionA"))
if err != nil {
    fmt.Println(err.Error())
    // エラー処理
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