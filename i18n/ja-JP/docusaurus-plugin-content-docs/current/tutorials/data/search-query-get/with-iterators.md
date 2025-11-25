---
title: "検索イテレーター | Cloud"
slug: /with-iterators
sidebar_label: "検索イテレーター"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ANN検索では、1回のクエリで取得できるエンティティ数に最大制限があり、基本的なANN検索のみを使用しても大規模検索の要求を満たせない場合があります。topKが16,384を超えるANN検索リクエストでは、SearchIteratorの使用を検討することをお勧めします。このセクションでは、SearchIteratorの使用方法と関連する検討事項を紹介します。| Cloud"
type: origin
token: QVTnwVz2aifvSAkgomAc9KWRnHb
sidebar_position: 13
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - 検索イテレーター
  - Pineconeベクトルデータベース
  - 音声検索
  - セマンティック検索とは
  - 埋め込みモデル

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 検索イテレーター

ANN検索では、1回のクエリで取得できるエンティティ数に最大制限があり、基本的なANN検索のみを使用しても大規模検索の要求を満たせない場合があります。topKが16,384を超えるANN検索リクエストでは、SearchIteratorの使用を検討することをお勧めします。このセクションでは、SearchIteratorの使用方法と関連する検討事項を紹介します。

## 概要\{#overview}

検索リクエストは検索結果を返しますが、検索イテレーターはイテレーターを返します。このイテレーターの**next()**メソッドを呼び出すことで検索結果を取得できます。

具体的には、検索イテレーターを以下のように使用できます。

1. 検索イテレーターを作成し、**1回の検索リクエストで返すエンティティ数**と**返すエンティティの総数**を設定します。

2. ループ内で検索イテレーターの**next()**メソッドを呼び出して、ページ分割された方法で検索結果を取得します。

3. **next()**メソッドが空の結果を返した場合、イテレーターの**close()**メソッドを呼び出してループを終了します。

## SearchIteratorの作成\{#create-searchiterator}

以下のコードスニペットは、SearchIteratorの作成方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# イテレーターを作成
query_vectors = [
    [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]]

iterator = client.search_iterator(
    collection_name="iterator_collection"
    data=query_vectors,
    anns_field="vector",
    search_param={"metric_type": "L2", "params": {"nprobe": 16}},
    # highlight-next-line
    batch_size=50,
    output_fields=["color"],
    # highlight-next-line
    limit=20000
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.orm.iterator.SearchIterator;
import io.milvus.v2.common.IndexParam.MetricType;
import io.milvus.v2.service.vector.request.data.FloatVec;

import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});
SearchIterator searchIterator = client.searchIterator(SearchIteratorReq.builder()
        .collectionName("iterator_collection")
        .vectors(Collections.singletonList(queryVector))
        .vectorFieldName("vector")
        .batchSize(500L)
        .outputFields(Lists.newArrayList("color"))
        .topK(20000)
        .metricType(IndexParam.MetricType.COSINE)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "errors"
    "fmt"
    "io"
    "log"
    "strings"
    "time"

    "golang.org/x/exp/rand"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/index"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

c, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: milvusAddr,
    APIKey:  "YOUR_CLUSTER_TOKEN",
})

vec := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}
iter, err := c.SearchIterator(ctx, milvusclient.NewSearchIteratorOption(collectionName, entity.FloatVector(vec)).
    WithANNSField("vector").
    WithAnnParam(index.NewIvfAnnParam(16)).
    WithBatchSize(50).
    WithOutputFields("color").
    WithIteratorLimit(20000))
if err != nil {
    // エラー処理
}

```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const milvusClient = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN',
});

const queryVectors = [
[0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
];
const collectionName = 'iterator_collection';

const iterator = milvusClient.searchIterator({
    collection_name: collectionName,
    vectors: queryVectors,
    anns_field: 'vector',
    params: { metric_type: 'L2', params: { nprobe: 16 } },
    batch_size: 50,
    output_fields: ['color'],
    limit: 20000,
});

```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

上記の例では、1回の検索で返すエンティティ数（**batch_size**/**batchSize**）を50に、返すエンティティの総数（**topK**）を20,000に設定しています。

## SearchIteratorの使用\{#use-searchiterator}

SearchIteratorの準備が完了したら、next()メソッドを呼び出してページ分割された方法で検索結果を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
while True:
    # highlight-next-line
    result = iterator.next()
    if not result:
        # highlight-next-line
        iterator.close()
        break

    for res in result:
        print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.response.QueryResultsWrapper;

while (true) {
    List<QueryResultsWrapper.RowRecord> res = searchIterator.next();
    if (res.isEmpty()) {
        searchIterator.close();
        break;
    }

    for (QueryResultsWrapper.RowRecord record : res) {
        System.out.println(record);
    }
}
```

</TabItem>

<TabItem value='go'>

```go
for {
    rs, err := iter.Next(ctx)
    // イテレーターの終了
    if errors.Is(err, io.EOF) {
        break
    }
    if err != nil {
        // エラー処理
    }
    fmt.Println(rs)
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
for await (const result of iterator) {
    console.log(result);
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

上記のコード例では、無限ループを作成し、ループ内で**next()**メソッドを呼び出して検索結果を変数に格納し、**next()**が何も返さないときにイテレーターを閉じています。