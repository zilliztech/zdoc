---
title: "Search Iterator | BYOC"
slug: /with-iterators
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ANN Search では 1 回のクエリで取得できるエンティティ数に上限があり、基本的な ANN Search を使用するだけでは大規模な検索の要件を満たせない場合があります。topK が 16,384 を超える ANN Search リクエストでは、SearchIterator の使用を検討することをお勧めします。このセクションでは、SearchIterator の使用方法と関連する考慮事項について説明します。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-with-iterators
sidebar_label: "Search Iterator"
sidebar_position: 18
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/with-iterators.md"

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Search Iterator

ANN Search では 1 回のクエリで取得できるエンティティ数に上限があり、基本的な ANN Search を使用するだけでは大規模な検索の要件を満たせない場合があります。topK が 16,384 を超える ANN Search リクエストでは、SearchIterator の使用を検討することをお勧めします。このセクションでは、SearchIterator の使用方法と関連する考慮事項について説明します。

## Overview\{#overview}

Search リクエストは検索結果を返しますが、SearchIterator はイテレーターを返します。このイテレーターの **next()** メソッドを呼び出すと、検索結果を取得できます。

具体的には、SearchIterator は次のように使用できます。

1. SearchIterator を作成し、**検索リクエストごとに返すエンティティ数**と**返すエンティティの総数**を設定します。

1. ループ内で SearchIterator の **next()** メソッドを呼び出し、ページ単位で検索結果を取得します。

1. **next()** メソッドが空の結果を返した場合は、イテレーターの **close()** メソッドを呼び出してループを終了します。

## Create SearchIterator\{#create-searchiterator}

次のコードスニペットは、SearchIterator を作成する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.vector.request.SearchIteratorReq;
import io.milvus.v2.service.vector.request.data.FloatVec;

import java.util.Collections;

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
        .outputFields(Collections.singletonList("color"))
        .topK(20000)
        .metricType(IndexParam.MetricType.L2)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/index"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
defer client.Close(ctx)

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

// create iterator
iterator, err := client.SearchIterator(ctx, milvusclient.NewSearchIteratorOption("iterator_collection", entity.FloatVector(queryVector)).
    WithANNSField("vector").
    WithAnnParam(index.NewIvfAnnParam(16)).
    // highlight-next-line
    WithBatchSize(50).
    WithOutputFields("color").
    // highlight-next-line
    WithIteratorLimit(20000))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN")).await?;

let query_vectors = vec![vec![0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]];
let iterator = client
    .search_iterator(
        SearchIteratorRequest::builder()
            .search(
                SearchRequest::builder()
                    .collection_name("iterator_collection")
                    .vector_field("vector")
                    .vectors(SearchVectors::Float(query_vectors))
                    .output_fields(["color"])
                    .build()?,
            )
            .batch_size(50)
            .limit(20000)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```cpp
#include <iostream>
#include <vector>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr << "Failed to connect: " << status.Message() << std::endl;
    return;
}

// create iterator
std::vector<float> queryVector = {
    0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F
};

milvus::SearchIteratorRequest request;
request.SetCollectionName("iterator_collection");
request.SetAnnsField("vector");
request.SetMetricType(milvus::MetricType::L2);
request.AddExtraParam("nprobe", "16");
// highlight-next-line
request.SetBatchSize(50);
request.AddOutputField("color");
// highlight-next-line
request.SetLimit(20000);
// SearchIterator only accepts one vector
request.AddFloatVector(queryVector);

milvus::SearchIteratorPtr iterator;
status = client->SearchIterator(request, iterator);
if (!status.IsOk()) {
    std::cerr << "Failed to create search iterator: " << status.Message() << std::endl;
    return;
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

const iterator = await milvusClient.searchIterator({
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    Username = "root",
    Password = "Milvus"
});

// create iterator
float[] queryVector = [0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f];

SearchIterator iterator = client.SearchIteratorAsync(new SearchIteratorReq
{
    CollectionName = "iterator_collection",
    VectorFieldName = "vector",
    Vectors = [queryVector],
    MetricType = MetricType.L2,
    BatchSize = 50,
    Parameters = new SearchParameters { OutputFields = { "color" } },
    Limit = 20000
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--header "Request-Timeout: 10" \
-d '{
    "collectionName": "iterator_collection",
    "annsField": "vector",
    "data": [[0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]],
    "searchParams": {
        "metricType": "L2",
        "params": {
            "nprobe": 16
        }
    },
    "limit": 50,
    "offset": 0,
    "outputFields": ["color"]
}'
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Create a search with pagination (equivalent to the first batch of a SearchIterator)
zilliz collection search --collection-name my_collection --vector-field vector --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --limit 50 --offset 0 --output-fields "id,color" 
```

</TabItem>

</Tabs>

上記の例では、検索ごとに返すエンティティ数 (**batch_size**/**batchSize**) を 50 に、返すエンティティの総数（**topK**）を 20,000 に設定しています。

## Use SearchIterator\{#use-searchiterator}

SearchIterator の準備ができたら、その next() メソッドを呼び出して、ページ単位で検索結果を取得できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
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

import java.util.List;

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
    // highlight-next-line
    resultSet, err := iterator.Next(ctx)
    if err != nil {
        // io.EOF marks the end of the iterator
        break
    }

    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='rust'>

```rust
loop {
    let Some(batch) = iterator.next().await? else {
        iterator.close().await?;
        break;
    };
    for result in batch.results() {
        for row in result.rows()? {
            println!("{:?}", row.to_entity_row()?);
        }
    }
}
```

</TabItem>

<TabItem value='c++'>

```cpp
while (true) {
    milvus::SingleResult result;
    // highlight-next-line
    status = iterator->Next(result);
    if (!status.IsOk()) {
        std::cerr << "Iterator next failed: " << status.Message() << std::endl;
        break;
    }
    if (result.GetRowCount() == 0) {
        // highlight-next-line
        break;
    }

    milvus::EntityRows rows;
    status = result.OutputRows(rows);
    if (!status.IsOk()) {
        std::cerr << "Failed to get output rows: " << status.Message() << std::endl;
        break;
    }

    for (const auto& row : rows) {
        std::cout << row.dump() << std::endl;
    }
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Responses.Dql;

// Use SearchIterator
await foreach (SingleResult result in iterator)
{
    Console.WriteLine(result.Scores);
}
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

batch_size=50
limit=20000
offset=0

# Paginate with offset until an empty page is returned. Note that the sum of
# offset and limit in each request must not exceed the server-side result
# window (16,384 by default); SDK search iterators do not have this limit.
while [ "$offset" -lt "$limit" ]; do
    # highlight-next-line
    response=$(curl --silent --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Content-Type: application/json" \
        --header "Request-Timeout: 10" \
        -d '{
            "collectionName": "iterator_collection",
            "annsField": "vector",
            "data": [[0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]],
            "searchParams": {
                "metricType": "L2",
                "params": {
                    "nprobe": 16
                }
            },
            "limit": '"$batch_size"',
            "offset": '"$offset"',
            "outputFields": ["color"]
        }')

    count=$(echo "$response" | jq -r '.data | length')
    if [ "$count" -eq 0 ]; then
        # highlight-next-line
        break
    fi

    echo "$response" | jq -r '.data[]'
    offset=$((offset + batch_size))
done
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI
# Prerequisite: run zilliz login and select your cluster with zilliz context set.

# Iterate through results with pagination (batch_size=50)
# Batch 1: offset 0
zilliz collection search --collection-name my_collection --vector-field vector --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --limit 50 --offset 0 --output-fields "id,color"

# Batch 2: offset 50
zilliz collection search --collection-name my_collection --vector-field vector --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --limit 50 --offset 50 --output-fields "id,color"

# Batch 3: offset 100
zilliz collection search --collection-name my_collection --vector-field vector --vectors '[[0.1,0.2,0.3,0.4,0.5]]' --limit 50 --offset 100 --output-fields "id,color"

# Continue incrementing offset by 50 until an empty page is returned
```

</TabItem>

</Tabs>

上記のコード例では、無限ループを作成し、ループ内で **next()** メソッドを呼び出して検索結果を変数に格納し、**next()** が何も返さないときにイテレーターを閉じています。
