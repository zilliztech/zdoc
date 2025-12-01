---
title: "コレクションの削除 | クラウド"
slug: /drop-collection
sidebar_label: "コレクションの削除"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "不要になったコレクションは削除できます。 | Cloud"
type: origin
token: DEUuwEwM4iMLOikU7XpcpNnKnGd
sidebar_position: 10
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - 削除
  - フィルターによる削除
  - IDによる削除
  - マルチモーダル検索
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# コレクションの削除

不要になったコレクションは削除できます。

## 例\{#examples}

以下のコードスニペットでは、**my_collection**という名前のコレクションが存在すると仮定しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.drop_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.DropCollectionReq;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Milvusサーバーに接続
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);

DropCollectionReq dropQuickSetupParam = DropCollectionReq.builder()
        .collectionName("my_collection")
        .build();

client.dropCollection(dropQuickSetupParam);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const address = "YOUR_CLUSTER_ENDPOINT";
const token = "YOUR_CLUSTER_TOKEN";
const client = new MilvusClient({address, token});

// 10. コレクションを削除
res = await client.dropCollection({
    collection_name: "my_collection"
})

console.log(res.error_code)

// 出力
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
    "log"

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
    // エラー処理
}
defer client.Close(ctx)

err = client.DropCollection(ctx, milvusclient.NewDropCollectionOption("my_collection"))
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
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'

# {
#     "code": 0,
#     "data": {}
# }
```

</TabItem>
</Tabs>