---
title: "Tune Recall Rate | BYOC"
slug: /tune-recall-rate
sidebar_label: "Tune Recall Rate"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud introduces a search parameter `level` to allow users to balance search recall and performance. It also provides another search parameter, `enablerecallcalculation`, to give users the estimated recall rate of the current search. You can combine these two parameters to tune the recall rate of vector searches. | BYOC"
type: origin
token: Fz9swr5WwixkH8kKHircWCejnye
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Tune Recall Rate

Zilliz Cloud introduces a search parameter `level` to allow users to balance search recall and performance. It also provides another search parameter, `enable_recall_calculation`, to give users the estimated recall rate of the current search. You can combine these two parameters to tune the recall rate of vector searches.

<Admonition type="info" title="Notes">

This applies to all searches, including basic vector searches, filtered searches, range searches, grouping searches, hybrid searches, and search iterators.

</Admonition>

## Overview\{#overview}

The recall rate in Zilliz Cloud usually refers to the proportion of relevant results successfully retrieved by a search. It measures the system's ability to recover all the relevant items from a collection.

![OdMnbeHYOoAEqKxNEEnc9SwNnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/odmnbehyooaeqkxneenc9swnnmf.png "OdMnbeHYOoAEqKxNEEnc9SwNnmf")

To calculate a search's recall rate, you can divide the number of relevant items retrieved by the total number of applicable items that should be retrieved. For example, if a search retrieves 90 of 100 relevant items, the recall rate should be **0.9** or **90%**.

A high recall rate usually indicates a more precise search result, which may be time-consuming. You may want to tune the recall rate to balance the precision and efficiency of vector searches.

## Set up a search request\{#set-up-a-search-request}

To set up a search request with tunable recall, you must include the `level` parameter inside the search parameters as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            # highlight-next-line
            "level": 1 # The precision control
        }
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});

Map<String, Object> searchParams = new HashMap<>();
searchParams.put("level", 1);

SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .annsField("vector")
        .topK(3)
        .searchParams(searchParams)
        .build();

SearchResp searchResp = client.search(searchReq);

System.out.println(searchResp.getSearchResults());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector").
    WithSearchParam("level", "1"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    )
    .await?;

    let query_vector = vec![0.3580376395471989f32, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

    let res = client
        .search(
            SearchRequest::builder()
                .collection_name("quick_setup")
                .vector_field("vector")
                .vectors(SearchVectors::Float(vec![query_vector]))
                .limit(3)
                .extra_params(HashMap::from([("level".into(), "1".into())]))
                .build()?,
        )
        .await?;

    println!("{:?}", res.results());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <vector>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr << "Failed to connect: " << status.Message() << std::endl;
    return;
}

std::vector<float> queryVector = {
    0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F
};

auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         .WithLimit(3)
                         .WithExtraParams({{"level", "1"}})
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i] << std::endl;
    }
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const queryVector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

const res = await client.search({
    collection_name: "quick_setup",
    data: queryVector,
    limit: 3,
    params: {
        level: "1"
    }
});

console.log(res.results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "quick_setup",
      "data": [
          [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
      ],
      "annsField": "vector",
      "limit": 3,
      "searchParams": {
          "params": {
              "level": 1
          }
      }
  }'
```

</TabItem>
</Tabs>

The `level` parameter ranges from `1` to `10` and defaults to `1`. The default value results in a recall rate of 90%, which is typically sufficient for most use cases. 

For scenarios that require a high recall rate (**99%** or above), try setting the `level` parameter to an integer between `6` and `10`. If search efficiency is not a concern, you can set this parameter to `10` to get the most precise results.

<Admonition type="info" title="Notes">

If the top-most level settings still do not suffice, contact [Zilliz Cloud support](https://zilliz.com/contact-sales).

</Admonition>

## Tune recall rate\{#tune-recall-rate}

Zilliz Cloud also introduces another search parameter named `enable_recall_calculation` to facilitate the tuning process. Setting this parameter to `True` indicates that Zilliz Cloud will estimate the recall rate for the current search and include that estimate along with the search results.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={
        "params": {
            "level": 6, # The precision control
            # highlight-next-line
            "enable_recall_calculation": True # Ask for recall rate calculation
        }
    }
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

FloatVec queryVector = new FloatVec(new float[]{0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f});

Map<String, Object> searchParams = new HashMap<>();
searchParams.put("level", 6);
searchParams.put("enable_recall_calculation", true);

SearchReq searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(Collections.singletonList(queryVector))
        .annsField("vector")
        .topK(3)
        .searchParams(searchParams)
        .build();

SearchResp searchResp = client.search(searchReq);

System.out.println(searchResp.getSearchResults());
System.out.println(searchResp.getRecalls());
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

ctx := context.Background()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

queryVector := []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592}

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "quick_setup", // collectionName
    3,               // limit
    []entity.Vector{entity.FloatVector(queryVector)},
).WithANNSField("vector").
    WithSearchParam("level", "6").
    WithSearchParam("enable_recall_calculation", "true"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}

for _, resultSet := range resultSets {
    fmt.Println("IDs: ", resultSet.IDs.FieldData().GetScalars())
    fmt.Println("Scores: ", resultSet.Scores)
    fmt.Println("Recall: ", resultSet.Recall)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new()
            .uri("YOUR_CLUSTER_ENDPOINT")
            .token("YOUR_CLUSTER_TOKEN"),
    )
    .await?;

    let query_vector = vec![0.3580376395471989f32, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

    let res = client
        .search(
            SearchRequest::builder()
                .collection_name("quick_setup")
                .vector_field("vector")
                .vectors(SearchVectors::Float(vec![query_vector]))
                .limit(3)
                .extra_params(HashMap::from([
                    ("level".into(), "6".into()),
                    ("enable_recall_calculation".into(), "true".into()),
                ]))
                .build()?,
        )
        .await?;

    println!("results: {:?}", res.results());
    println!("recalls: {:?}", res.results().get_recalls());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <vector>

#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"));
if (!status.IsOk()) {
    std::cerr << "Failed to connect: " << status.Message() << std::endl;
    return;
}

std::vector<float> queryVector = {
    0.35803764F, -0.60234958F, 0.18414013F, -0.26286206F, 0.90294385F
};

auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("quick_setup")
                         .WithAnnsField("vector")
                         .WithLimit(3)
                         .WithExtraParams({{"level", "6"}, {"enable_recall_calculation", "true"}})
                         .AddFloatVector(queryVector);

milvus::SearchResponse searchResponse;
status = client->Search(searchRequest, searchResponse);
if (!status.IsOk()) {
    std::cerr << "Search failed: " << status.Message() << std::endl;
    return;
}

for (const auto& result : searchResponse.Results().Results()) {
    const auto ids = result.Ids().IntIDArray();
    for (size_t i = 0; i < result.Scores().size(); ++i) {
        std::cout << "id=" << ids[i] << ", score=" << result.Scores()[i] << std::endl;
    }
}

for (const auto& recall : searchResponse.Results().Recalls()) {
    std::cout << "recall=" << recall << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const queryVector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592];

const res = await client.search({
    collection_name: "quick_setup",
    data: queryVector,
    limit: 3,
    params: {
        level: "6",
        enable_recall_calculation: "true"
    }
});

console.log(res.results);
console.log(res.recalls);
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
  --url "YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search" \
  --header "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "quick_setup",
      "data": [
          [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
      ],
      "annsField": "vector",
      "limit": 3,
      "searchParams": {
          "params": {
              "level": 6,
              "enable_recall_calculation": true
          }
      }
  }'
```

</TabItem>
</Tabs>

With the above search request, you can get an estimated recall rate of the current search as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# data: [...], recalls: [0.98]
```

</TabItem>

<TabItem value='java'>

```java
// searchResults: [...], recalls: [0.98]
```

</TabItem>

<TabItem value='go'>

```go
// IDs: [...], Scores: [...], Recall: 0.98
```

</TabItem>

<TabItem value='rust'>

```rust
// results: [...], recalls: [0.98]
```

</TabItem>

<TabItem value='c++'>

```c++
// id=..., score=...; recall=0.98
```

</TabItem>

<TabItem value='javascript'>

```javascript
// results: [...], recalls: [0.98]
```

</TabItem>

<TabItem value='bash'>

```bash
# data: [...], recalls: [0.98]
```

</TabItem>
</Tabs>

During the estimation process, Zilliz Cloud:

1. Searches with the `level` parameter set to the user-defined value, and

1. Conducts another search in an internal high-precision mode.

1. Use the second search as the ground truth to estimate the recall rate.

While setting `enable_recall_calculation` to `True`, you can adjust the value of the `level` parameter to obtain multiple recall rates. By considering these estimated figures and the duration of each search, you can roughly estimate the appropriate level setting.

<Admonition type="info" title="Notes">

Enabling `enable_recall_calculation` may impact search performance and is not recommended in production.

</Admonition>

## Limits\{#limits}

Currently, this feature is available only for Zilliz Cloud clusters in basic vector searches, filtered searches, and range searches.

