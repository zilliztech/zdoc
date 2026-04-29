---
title: "Search Iterator | Cloud"
slug: /with-iterators
sidebar_key: with-iterators
sidebar_label: "Search Iterator"
beta: FALSE
notebook: FALSE
description: "ANN 検索では、1 つのクエリで取得できるエンティティ数に上限があり、基本的な ANN 検索だけでは大規模な検索ニーズに対応できない場合があります。topK が 16,384 を超える ANN 検索リクエストでは、SearchIterator の使用を検討することをお勧めします。このセクションでは、SearchIterator の使用方法と関連する考慮事項について説明します。 | Cloud"
type: origin
token: QVTnwVz2aifvSAkgomAc9KWRnHb
sidebar_position: 17
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - search iterators

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Search Iterator

ANN検索には、1回のクエリで再呼び出し（recall）できるエンティティ数の上限があり、基本的なANN検索だけでは大規模な検索要件を満たせない場合があります。topKが16,384を超えるANN検索リクエストでは、SearchIteratorの使用を検討することをお勧めします。このセクションでは、SearchIteratorの使い方と関連する注意点を紹介します。

## 概要\{#overview}

通常のSearchリクエストは検索結果を返しますが、SearchIteratorはイテレータを返します。このイテレータの **next()** メソッドを呼び出すことで、検索結果を取得できます。

具体的には、SearchIteratorは次のように使用します。

1. SearchIteratorを作成し、**1回の検索リクエストで返すエンティティ数**および**合計で返すエンティティ数**を設定します。

1. SearchIteratorの **next()** メソッドをループ内で呼び出して、検索結果をページネーション形式で取得します。

1. **next()** メソッドが空の結果を返した場合は、イテレータの **close()** メソッドを呼び出してループを終了します。

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

# create iterator
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
        .metricType(IndexParam.MetricType.L2)
        .build());
```

</TabItem>

<TabItem value='java'>

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
iter, err := c.SearchIterator(ctx, milvusclient.NewSearchIteratorOption("iterator_collection", entity.FloatVector(vec)).
    WithANNSField("vector").
    WithAnnParam(index.NewIvfAnnParam(16)).
    WithBatchSize(50).
    WithOutputFields("color").
    WithIteratorLimit(20000))
if err != nil {
    // handle error
}

```

</TabItem>

<TabItem value='java'>

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

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

上記の例では、1回の検索で返されるエンティティ数（**batch_size**/**batchSize**）を50に、返されるエンティティの総数（**topK**）を20,000に設定しています。

## Use SearchIterator\{#use-searchiterator}

SearchIteratorの準備が完了したら、その`next()`メソッドを呼び出して、検索結果をページネーション形式で取得できます。

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

<TabItem value='java'>

```go
for {
    rs, err := iter.Next(ctx)
    // end of iterator
    if errors.Is(err, io.EOF) {
        break
    }
    if err != nil {
        // handler error
    }
    fmt.Println(rs)
}
```

</TabItem>

<TabItem value='java'>

```javascript
for await (const result of iterator) {
    console.log(result);
}
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

上記のコード例では、無限ループを作成し、そのループ内で **next()** メソッドを呼び出して検索結果を変数に格納しています。また、**next()** が何も返さなくなった時点でイテレータを閉じています。