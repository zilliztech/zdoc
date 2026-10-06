---
title: "召回调优 | Cloud"
slug: /tune-recall-rate
sidebar_label: "召回调优"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 引入了一个名为 `level` 的搜索参数，允许用户通过调整该参数来平衡召回率和搜索性能。同时，Zilliz Cloud 还允许用户设置 `enablerecallcalculation` 参数来决定是否在搜索结果中包含预估召回率信息。您可以配合使用这两个参数来对向量搜索结果进行调优。 | Cloud"
type: origin
token: Wb3KwVJBDiQvzikvXNbcUiZonEf
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 召回调优

Zilliz Cloud 引入了一个名为 `level` 的搜索参数，允许用户通过调整该参数来平衡召回率和搜索性能。同时，Zilliz Cloud 还允许用户设置 `enable_recall_calculation` 参数来决定是否在搜索结果中包含预估召回率信息。您可以配合使用这两个参数来对向量搜索结果进行调优。

<Admonition type="info" title="说明">

召回调优适用于所有搜索类型，包括基本 Vector Search、Filtered Search、Range Search、Grouping Search、多向量混合搜索以及 Search Iterator。

</Admonition>

## 概述\{#overview}

Zilliz Cloud 向量搜索中的召回率通常是指成功召回的相关结果数量占所有相关结果数量的比值。该指标通常用来衡量集群准确召回相关结果的能力。

![JHafbESR3oZ9GzxgELeci02inyg](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/jhafbesr3oz9gzxgeleci02inyg.png "JHafbESR3oZ9GzxgELeci02inyg")

根据上述公式，您可以用搜索结果中获取的相关结果数量除以所有相关结果数量获得本次搜索的召回率。例如，如果某次向量搜索获取到了 100 条相关结果中的 90 条，那么此次向量搜索的召回率为 **0.9** 或 **90%**。

高召回率通常意味着更加精确的搜索结果，搜索耗时可能也更长。您可能希望通过调节召回率在搜索效率和搜索准确率之间找到平衡。

## 设置搜索参数\{#set-up-a-search-request}

您可以通过在搜索请求中添加 `level` 参数的方式将该请求变更为可调优请求。

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

该参数取值范围在 `1` 到 `10` 之间，默认值为 `1`。默认值通常能获得 `90%` 以上的召回率，能够满足大多数场景的需要。

对于有高召回率要求的场景（如 99% 及以上），可以将 `level` 值设置为 `6` 到 `10` 之间的某个整数。如果搜索效率指标没有要求，您可以考虑将该参数的值直接设置为 `10` 以获取最精确的搜索结果。

<Admonition type="info" title="说明">

如果将该参数设置为最大值仍无法满足要求，您可以联系 [Zilliz Cloud 支持](https://zilliz.com.cn/contact-sales)。

</Admonition>

## 调节召回率\{#tune-recall-rate}

为了方便您调整 `level` 参数，Zilliz Cloud 还提供了另一个名为 `enable_recall_calculation` 的参数。通过设置该参数为 `True`，您可以让 Zilliz Cloud 在搜索结果中包含本次搜索的预估召回率。

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

在使用上述搜索请求进行向量搜索后，您可以得到如下响应，其中 `recalls` 即为预估召回率。

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

在预估过程中， Zilliz Cloud 执行了如下操作：

1. 使用用户指定的 `level` 值进行向量搜索。

1. 使用内部高精模式再次执行向量搜索。

1. 使用第二次搜索的结果作为分母计算预估召回率。

在设置 `enable_recall_calculation` 为 `True` 时，您可以通过调整 `level` 参数的取值执行多次搜索来查看预估召回率的变化。通过评估预估召回率和搜索耗时等指标，粗略估计合适的 `level` 参数取值。

<Admonition type="info" title="说明">

开启 `enable_recall_calculation` 可能会影响搜索性能，不建议在生产环境使用。

</Admonition>

## 限制\{#limits}

该功能当前仅对基本 Vector Search、Filtered Search 和 Range Search 有效。