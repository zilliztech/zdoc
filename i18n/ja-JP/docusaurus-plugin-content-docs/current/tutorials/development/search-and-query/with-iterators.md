---
title: "Search Iterator | Cloud"
slug: /with-iterators
sidebar_label: "Search Iterator"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ANN Search では、1 回のクエリでリコールできるエンティティ数に最大制限があり、基本的な ANN Search だけでは大規模検索の要件を満たせない場合があります。topK が 16,384 を超える ANN Search リクエストでは、SearchIterator の使用を検討することを推奨します。このセクションでは、SearchIterator の使い方と関連する注意事項を紹介します。 | Cloud"
type: origin
token: QVTnwVz2aifvSAkgomAc9KWRnHb
sidebar_position: 19
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Search Iterator

ANN Search では、1 回のクエリでリコールできるエンティティ数に最大制限があり、基本的な ANN Search だけでは大規模検索の要件を満たせない場合があります。topK が 16,384 を超える ANN Search リクエストでは、SearchIterator の使用を検討することを推奨します。このセクションでは、SearchIterator の使い方と関連する注意事項を紹介します。

## 概要\{#overview}

Search リクエストは検索結果を返しますが、SearchIterator はイテレータを返します。このイテレータの **next()** メソッドを呼び出すことで、検索結果を取得できます。

具体的には、SearchIterator は次のように使用できます。

1. SearchIterator を作成し、**1 回の検索リクエストごとに返すエンティティ数** と **返すエンティティの総数** を設定します。

1. SearchIterator の **next()** メソッドをループ内で呼び出し、ページ分割された形で検索結果を取得します。

1. **next()** メソッドが空の結果を返した場合は、イテレータの **close()** メソッドを呼び出してループを終了します。

## SearchIterator を作成する\{#create-searchiterator}

次のコードスニペットは、SearchIterator を作成する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

milvus::SearchIteratorRequest request;
request.SetCollectionName("iterator_collection");
request.SetBatchSize(50);
request.SetLimit(20000);
request.SetAnnsField("vector");
request.AddOutputField("color");
request.SetMetricType(milvus::MetricType::L2);

std::vector<float> vector = {0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592};
request.AddFloatVector(vector);

milvus::SearchIteratorPtr iterator;
auto status = client->SearchIterator(request, iterator);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>

上記の例では、1 回の検索あたりに返すエンティティ数（**batch_size**/**batchSize**）を 50、返すエンティティの総数（**topK**）を 20,000 に設定しています。

## SearchIterator を使用する\{#use-searchiterator}

SearchIterator の準備ができたら、その next() メソッドを呼び出して、ページ分割された形で検索結果を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='c++'>

```c++
while (true) {
    milvus::SingleResult batch_results;
    auto status = iterator->Next(batch_results);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        break;
    }

    if (batch_results.GetRowCount() == 0) {
        std::cout << "search iteration finished" << std::endl;
        break;
    }

    milvus::EntityRows rows;
    status = batch_results.OutputRows(rows);
    for (const auto& row : rows) {
        std::cout << row.dump() << std::endl;
    }
}
```

</TabItem>
</Tabs>

上記のコード例では、無限ループを作成し、そのループ内で **next()** メソッドを呼び出して検索結果を変数に格納し、**next()** が何も返さなくなった時点でイテレータを閉じています。
