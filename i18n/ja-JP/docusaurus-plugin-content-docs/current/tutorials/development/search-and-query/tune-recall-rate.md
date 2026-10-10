---
title: "再現率を調整する | Cloud"
slug: /tune-recall-rate
sidebar_label: "再現率を調整する"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、ユーザーが検索の再現率とパフォーマンスのバランスを取れるようにするための検索パラメーター `level` を導入しています。また、現在の検索の推定再現率をユーザーに提供するために、別の検索パラメーター `enablerecallcalculation` も提供しています。これら 2 つのパラメーターを組み合わせることで、ベクトル検索の再現率を調整できます。 | Cloud"
type: origin
token: Fz9swr5WwixkH8kKHircWCejnye
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 再現率を調整する

Zilliz Cloud は、ユーザーが検索の再現率とパフォーマンスのバランスを取れるようにするための検索パラメーター `level` を導入しています。また、現在の検索の推定再現率をユーザーに提供するために、もう 1 つの検索パラメーター `enable_recall_calculation` を提供しています。これら 2 つのパラメーターを組み合わせることで、ベクトル検索の再現率を調整できます。

<Admonition type="info" title="Notes">

これは、基本的なベクトル検索、フィルタリング検索、範囲検索、グループ化検索、ハイブリッド検索、検索イテレーターなど、すべての検索に適用されます。

</Admonition>

## 概要\{#overview}

Zilliz Cloud における再現率とは、通常、検索によって正常に取得された関連結果の割合を指します。これは、システムがコレクションからすべての関連項目を取得する能力を測る指標です。

![OdMnbeHYOoAEqKxNEEnc9SwNnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/odmnbehyooaeqkxneenc9swnnmf.png "OdMnbeHYOoAEqKxNEEnc9SwNnmf")

検索の再現率を計算するには、取得された関連項目の数を、取得すべき該当項目の総数で割ります。たとえば、検索が 100 件の関連項目のうち 90 件を取得した場合、再現率は **0.9** または **90%** になります。

再現率が高いと、通常はより精度の高い検索結果が得られますが、時間がかかることがあります。ベクトル検索の精度と効率のバランスを取るために、再現率を調整するとよいでしょう。

## 検索リクエストを設定する\{#set-up-a-search-request}

再現率を調整可能な検索リクエストを設定するには、次のように、検索パラメーター内に `level` パラメーターを含める必要があります。

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

`level` パラメーターは `1` から `10` までの範囲で、デフォルト値は `1` です。デフォルト値では再現率が 90% となり、通常はほとんどのユースケースで十分です。

高い再現率（**99%** 以上）が必要なシナリオでは、`level` パラメーターを `6` から `10` までの整数に設定してみてください。検索効率を気にしない場合は、このパラメーターを `10` に設定すると、最も精度の高い結果を得られます。

<Admonition type="info" title="Notes">

最上位の level 設定でもまだ不十分な場合は、[Zilliz Cloud サポート](https://zilliz.com/contact-sales) にお問い合わせください。

</Admonition>

## 再現率を調整する\{#tune-recall-rate}

Zilliz Cloud は、調整プロセスを容易にするために、`enable_recall_calculation` というもう 1 つの検索パラメーターも導入しています。このパラメーターを `True` に設定すると、Zilliz Cloud が現在の検索の再現率を推定し、その推定値を検索結果とともに返すようになります。

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

上記の検索リクエストを使用すると、次のように、現在の検索の推定再現率を取得できます。

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

推定プロセスでは、Zilliz Cloud は次のことを行います。

1. ユーザー定義の値に設定された `level` パラメーターを使用して検索を実行し、

1. 内部の高精度モードでさらに検索を実行します。

1. 2 回目の検索をグラウンドトゥルースとして使用し、再現率を推定します。

`enable_recall_calculation` を `True` に設定したうえで、`level` パラメーターの値を調整すると、複数の再現率を取得できます。これらの推定値と各検索の所要時間を考慮することで、適切な level 設定を大まかに見積もることができます。

<Admonition type="info" title="Notes">

`enable_recall_calculation` を有効にすると、検索パフォーマンスに影響を与える可能性があるため、本番環境での使用は推奨されません。

</Admonition>

## 制限事項\{#limits}

現在、この機能は Zilliz Cloud クラスターの基本的なベクトル検索、フィルタリング検索、範囲検索でのみ利用できます。

