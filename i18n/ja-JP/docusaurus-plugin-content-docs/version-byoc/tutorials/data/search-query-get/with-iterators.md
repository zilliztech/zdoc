---
title: "検索イテレータ | BYOC"
slug: /with-iterators
sidebar_label: "検索イテレータ"
beta: FALSE
notebook: FALSE
description: "ANN検索には、1つのクエリで呼び出すことができるエンティティの最大数に制限があり、基本的なANN検索だけでは大規模な検索の要求を満たすことができない場合があります。topKが16,384を超えるANN検索リクエストの場合は、SearchIteratorの使用を検討することをお勧めします。このセクションでは、SearchIteratorの使用方法と関連する考慮事項を紹介します。 | BYOC"
type: origin
token: QVTnwVz2aifvSAkgomAc9KWRnHb
sidebar_position: 13
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search iterators
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 検索イテレータ

ANN検索には、1つのクエリで呼び出すことができるエンティティの最大数に制限があり、基本的なANN検索だけでは大規模な検索の要求を満たすことができない場合があります。topKが16,384を超えるANN検索リクエストの場合は、SearchIteratorの使用を検討することをお勧めします。このセクションでは、SearchIteratorの使用方法と関連する考慮事項を紹介します。

## 概要について{#overview}

Searchリクエストは検索結果を返しますが、SearchIteratorはイテレータを返します。このイテレータの**next()**メソッドを呼び出すことで、検索結果を取得できます。

具体的には、以下のようにSearchIteratorsを使用できます。

1. SearchIteratorを作成し、検索リクエストごとに返すエンティティの数と返すエンティティの総数を設定してください。

1. SearchIteratorの**next()**メソッドをループで呼び出して、ページ分割された方法で検索結果を取得します。

1. イテレータの**close()**メソッドを呼び出して、**next()**メソッドが空の結果を返す場合にループを終了します。

## SearchIteratorの作成{#create-searchiterator}

次のコードスニペットは、SearchIteratorを作成する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import connections, Collection

connections.connect(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# create iterator
query_vectors = [
    [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]]

collection = Collection("iterator_collection")

iterator = collection.search_iterator(
    data=query_vectors,
    anns_field="vector",
    param={"metric_type": "L2", "params": {"nprobe": 16}},
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
// go
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

上記の例では、検索ごとに返すエンティティの数(batch_size/batchSize)を50に設定し、返すエンティティの総数(topK)を20,000に設定しています。

## SearchIteratorを使う{#use-searchiterator}

SearchIteratorの準備ができたら、そのnext()メソッドを呼び出して、ページ分割された検索結果を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
results = []

while True:
    # highlight-next-line
    result = iterator.next()
    if not result:
        # highlight-next-line
        iterator.close()
        break
    
    for hit in result:
        results.append(hit.to_dict())
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
// go
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

上記のコード例では、無限ループを作成し、ループ内で**next()**メソッドを呼び出して検索結果を変数に格納し、**next()**が何も返さない場合にイテレータを閉じました。