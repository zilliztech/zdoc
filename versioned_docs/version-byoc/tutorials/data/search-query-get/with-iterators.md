---
title: "Search Iterator | BYOC"
slug: /with-iterators
sidebar_label: "Search Iterator"
beta: FALSE
notebook: FALSE
description: "The ANN Search has a maximum limit on the number of entities that can be recalled in a single query, and simply using basic ANN Search may not meet the demands of large-scale retrieval. For ANN Search requests where topK exceeds 16,384, it is advisable to consider using the SearchIterator. This section will introduce how to use the SearchIterator and related considerations. | BYOC"
type: origin
token: QVTnwVz2aifvSAkgomAc9KWRnHb
sidebar_position: 12
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search iterators
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Search Iterator

The ANN Search has a maximum limit on the number of entities that can be recalled in a single query, and simply using basic ANN Search may not meet the demands of large-scale retrieval. For ANN Search requests where topK exceeds 16,384, it is advisable to consider using the SearchIterator. This section will introduce how to use the SearchIterator and related considerations.

## Overview{#overview}

A Search request returns search results, while a SearchIterator returns an iterator. You can call the **next()** method of this iterator to get the search results.

Specifically, you can use the SearchIterators as follows:

1. Create a SearchIterator and set **the number of entities to return per search request** and **the total number of entities to return**.

1. Call the **next()** method of the SearchIterator in a loop to get the search result in a paginated manner.

1. Call the **close()** method of the iterator to end the loop if the **next()** method returns an empty result.

## Create SearchIterator{#create-searchiterator}

The following code snippet demonstrates how to create a SearchIterator.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
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
</Tabs>

In the above examples, you have set the number of entities to return per search (**batch_size**/**batchSize**) to 50, and the total number of entities to return (**topK**) to 20,000.

## Use SearchIterator{#use-searchiterator}

Once the SearchIterator is ready, you can call its next() method to get the search results in a paginated manner.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
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
</Tabs>

In the above code examples, you have created an infinite loop and called the **next()** method in the loop to store the search results in a variable and closed the iterator when the **next()** returns nothing.