---
title: "Search Iterator | BYOC"
slug: /with-iterators
sidebar_label: "Search Iterator"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ANN Search 单次召回的 Entity 有最大数量限制，单纯使用基本 ANN Search 可能无法应对大规模召回的需求。对于 topK 大于 16,384 的 ANN Search 请求，可以考虑使用 Search Iterator。本节将介绍如何使用 Search Iterator 以及与相关的注意事项。 | BYOC"
type: origin
token: GsLqwoJK6iZgfZkyNMscbpzmn5l
sidebar_position: 14
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - search iterator
  - 迭代器
  - next
  - close

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Search Iterator

ANN Search 单次召回的 Entity 有最大数量限制，单纯使用基本 ANN Search 可能无法应对大规模召回的需求。对于 topK 大于 16,384 的 ANN Search 请求，可以考虑使用 Search Iterator。本节将介绍如何使用 Search Iterator 以及与相关的注意事项。

## 概述\{#overview}

与 Search 操作直接返回搜索结果不同，Search Iterator 返回一个迭代器。你可以通过循环调用迭代器提供的 `next()` 方法来分页获取搜索结果。

具体来说，使用 Search Iterator 的流程如下：

1. 在创建迭代器时指定单页返回的 Entity 数量和需要返回的 Entity 总数量。

1. 循环调用迭代器的 `next()` 方法来分页获取搜索结果。

1. 当 `next()` 方法返回的结果为空时，调用迭代器的 `close()` 方法销毁迭代器。

## 创建 Search Iterator\{#create-search-iterator}

如下代码演示了如何创建一个 Search Iterator。

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

上述示例代码设置了单页召回数量（**batch_size**/**batchSize**）为 50，topK（**limit**/**topK**） 为 20,000。

关于在创建迭代器时可以使用的参数，可以参考

## 调用 `next()` 方法获取搜索结果\{#use-search-iterator}

在创建好迭代器后，可以参考如下示例代码循环调用 `next()` 方法获取搜索结果。

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
</Tabs>

上述代码创建了一个无限循环，并在其中调用了迭代器的 `next()` 方法。然后将获取的结果添加到名为 results 的列表中，只到 `next()` 方法返回为空时，调用 `close()` 方法销毁迭代器。