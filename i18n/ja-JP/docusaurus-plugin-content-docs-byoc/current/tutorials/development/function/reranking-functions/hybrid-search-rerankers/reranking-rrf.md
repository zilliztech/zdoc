---
title: "RRF Ranker | BYOC"
slug: /reranking-rrf
sidebar_label: "RRF Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Reciprocal Rank Fusion (RRF) Ranker is a reranking strategy for Zilliz Cloud hybrid search that balances results from multiple ベクトル search paths based on their ranking positions rather than their raw similarity scores. Like a sports tournament that considers players' rankings rather than individual statistics, RRF Ranker combines search results based on how highly each item ranks in different search paths, creating a fair and balanced final ranking. | BYOC"
type: origin
token: Nqguwf6ikiKrHEkGKgAc8g7Lnnh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RRF Ranker

Reciprocal Rank Fusion (RRF) Ranker is a reranking strategy for Zilliz Cloud hybrid search that balances results from multiple ベクトル search paths based on their ranking positions rather than their raw similarity scores. Like a sports tournament that considers players' rankings rather than individual statistics, RRF Ranker combines search results based on how highly each item ranks in different search paths, creating a fair and balanced final ranking.

## RRF Ranker を使用するタイミング\{#when-to-use-rrf-ranker}

RRF Ranker is specifically designed for hybrid search scenarios where you want to balance results from multiple ベクトル search paths without assigning explicit importance weights. It's particularly effective for:

| ユースケース | 例 | RRF Ranker が適している理由 |
| --- | --- | --- |
| 同等の重要性を持つマルチモーダル検索 | 画像とテキストの両方が同等に重要な image-text 検索 | 任意の重み付けを必要とせずに結果のバランスを取れるため |
| Ensemble ベクトル search | 異なる埋め込みモデルの結果を組み合わせる | 特定のモデルのスコア分布を優遇せず、順位を民主的に統合するため |
| クロスリンガル検索 | 複数言語にまたがってドキュメントを検索する | 言語固有の埋め込み特性に関係なく結果を公平に順位付けするため |
| エキスパート推奨 | 複数の専門システムからの推奨を組み合わせる | 異なるシステムが比較不可能なスコアリング手法を使う場合でも合意順位を作成できるため |

ハイブリッド検索アプリケーションで、明示的な重みを割り当てずに複数の検索パスを民主的にバランスさせる必要がある場合、RRF Ranker は理想的な選択肢です。

## RRF Ranker の仕組み\{#mechanism-of-rrf-ranker}

RRFRanker 戦略の主なワークフローは次のとおりです。

1. **Collect Search Rankings**: Collect the rankings of results from each path of ベクトル search (rank_1, rank_2).

1. **順位を統合する**: 数式に従って、各パスの順位（rank_rrf_1、rank_rrf_2）を変換します。

    計算式には *N* が含まれ、これは取得数を表します。*ranki*(*d*) は、*i(th)* 番目の retriever によって生成されたドキュメント *d* の順位位置です。*k* は通常 60 に設定される平滑化パラメータです。

1. **順位を集約する**: 統合された順位に基づいて検索結果を再順位付けし、最終結果を生成します。

![M2SawupkSh2NZxbX7SAcwqZZnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/M2SawupkSh2NZxbX7SAcwqZZnxd.png)

## RRF Ranker の例\{#example-of-rrf-ranker}

この例では、スパースベクトルと dense ベクトル に対する Hybrid Search（topK=5）を示し、RRFRanker 戦略が 2 つの ANN 検索からの結果をどのように再順位付けするかを説明します。

- Results of ANN search on sparse ベクトル of texts （topK=5)：

    | **ID** | **順位（sparse）** |
    | --- | --- |
    | 101 | 1 |
    | 203 | 2 |
    | 150 | 3 |
    | 198 | 4 |
    | 175 | 5 |

- Results of ANN search on dense ベクトル of texts （topK=5)：

    | **ID** | **順位（dense）** |
    | --- | --- |
    | 198 | 1 |
    | 101 | 2 |
    | 110 | 3 |
    | 175 | 4 |
    | 250 | 5 |

- RRF を使用して、2 つの検索結果セットの順位を並べ替えます。平滑化パラメータ `k` は 60 に設定されていると仮定します。

    | **ID** | **スコア（Sparse）** | **スコア（Dense）** | **最終スコア** |
    | --- | --- | --- | --- |
    | 101 | 1 | 2 | 1/(60+1)+1/(60+2) = 0.03252247 |
    | 198 | 4 | 1 | 1/(60+4)+1/(60+1) = 0.03201844 |
    | 175 | 5 | 4 | 1/(60+5)+1/(60+4) = 0.03100962 |
    | 203 | 2 | N/A | 1/(60+2) = 0.01612903 |
    | 150 | 3 | N/A | 1/(60+3) = 0.01587302 |
    | 110 | N/A | 3 | 1/(60+3) = 0.01587302 |
    | 250 | N/A | 5 | 1/(60+5) = 0.01538462 |

- reranking 後の最終結果（topK=5）:

    | **順位** | **ID** | **最終スコア** |
    | --- | --- | --- |
    | 1 | 101 | 0.03252247 |
    | 2 | 198 | 0.03201844 |
    | 3 | 175 | 0.03100962 |
    | 4 | 203 | 0.01612903 |
    | 5 | 150 | 0.01587302 |
    | 5 | 110 | 0.01587302 |

## RRF Ranker の使用方法\{#usage-of-rrf-ranker}

When using the RRF reranking strategy, you need to configure the parameter `k`. It is a smoothing parameter that can effectively alter the relative weights of full-text search versus ベクトル search. The default value of this parameter is 60, and it can be adjusted within a range of (0, 16384). The value should be floating-point numbers. The recommended value is between [10, 100]. While `k=60` is a common choice, the optimal `k` value can vary depending on your specific applications and datasets. We recommend testing and adjusting this parameter based on your specific use case to achieve the best performance.

### RRF Ranker を作成する\{#create-an-rrf-ranker}

After your コレクション is set up with multiple ベクトル fields, create an RRF Ranker with an appropriate smoothing parameter:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

rerank = Function(
    name="rrf",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "rrf", 
        "k": 100  # Optional
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.Function rerank = CreateCollectionReq.Function.builder()
        .name("rrf")
        .functionType(FunctionType.RERANK)
        .param("reranker", "rrf")
        .param("k", "100")
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

rerank := entity.NewFunction().

    WithName("rrf").

    WithType(entity.FunctionTypeRerank).

    WithInputFields().

    WithParam("reranker", "rrf").

    WithParam("k", 100)
```

</TabItem>

<TabItem value='rust'>

```rust
let rerank = Function::new()

    .name("rrf")

    .function_type(FunctionType::Rerank)

    .param("reranker", "rrf")

    .param("k", "100");
```

</TabItem>

<TabItem value='c++'>

```c++
auto rerank = std::make_shared<milvus::Function>("rrf", milvus::FunctionType::RERANK);
rerank->AddParam("reranker", "rrf");
rerank->AddParam("k", "100");
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "rrf",
  input_field_names: [],
  function_type: FunctionType.RERANK,
  params: {
    reranker: "rrf",
    k: 100,
  },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful

functions='[

  {
    "name": "rrf",
    "type": "Rerank",
    "inputFieldNames": [],
    "params": {
      "reranker": "rrf",
      "k": 100
    }
  }

]'
```

</TabItem>
</Tabs>

| パラメータ | 必須? | 説明 | Value/Example |
| --- | --- | --- | --- |
| `name` | はい | この Function の一意の識別子 | `"rrf"` |
| `input_field_names` | はい | List of ベクトル fields to apply the function to (must be empty for RRF Ranker) | [] |
| `function_type` | はい | 呼び出す Function のタイプ。reranking 戦略を指定するには `RERANK` を使用します | `FunctionType.RERANK` |
| `params.reranker` | はい | 使用する reranking メソッドを指定します。<br/>RRF Ranker を使用するには `rrf` に設定する必要があります。 | `"weighted"` |
| `params.k` | いいえ | ドキュメント順位の影響を制御する平滑化パラメータ。`k` が大きいほど上位順位への感度が低下します。範囲: (0, 16384)、デフォルト: `60`。<br/>詳細については、[RRF Ranker の仕組み](./reranking-rrf#mechanism-of-rrf-ranker) を参照してください。 | `100` |

### ハイブリッド検索に適用する\{#apply-to-hybrid-search}

RRF Ranker is designed specifically for hybrid search operations that combine multiple ベクトル fields. Here's how to use it in a hybrid search:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest

# Connect to Milvus server
milvus_client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Assume you have a collection setup

# Define text vector search request
text_search = AnnSearchRequest(
    data=["modern dining table"],
    anns_field="text_vector",
    param={},
    limit=10
)

# Define image vector search request
image_search = AnnSearchRequest(
    data=[image_embedding],  # Image embedding vector
    anns_field="image_vector",
    param={},
    limit=10
)

# Apply RRF Ranker to product hybrid search
# The smoothing parameter k controls the balance
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # Multiple search requests
    # highlight-next-line
    ranker=rerank,  # Apply the RRF ranker
    limit=10,
    output_fields=["product_name", "price", "category"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.request.data.FloatVec;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()

        .uri("YOUR_CLUSTER_ENDPOINT")

        .build());

List<AnnSearchReq> searchRequests = new ArrayList<>();

searchRequests.add(AnnSearchReq.builder()

        .vectorFieldName("text_vector")

        .vectors(Collections.singletonList(new EmbeddedText("modern dining table")))

        .limit(10)

        .build());

searchRequests.add(AnnSearchReq.builder()

        .vectorFieldName("image_vector")

        .vectors(Collections.singletonList(new FloatVec(imageEmbedding)))

        .limit(10)

        .build());

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()

        .collectionName(collectionName)

        .searchRequests(searchRequests)

        .ranker(rerank)

        .limit(10)

        .outFields(Arrays.asList("product_name", "price", "category"))

        .build();

SearchResp searchResp = client.hybridSearch(hybridSearchReq);
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
})

if err != nil {
    fmt.Println(err.Error())

    // handle error
}

// Define text vector search request

textSearch := milvusclient.NewAnnRequest("text_vector", 10, entity.FloatVector(textEmbedding))

// Define image vector search request

imageSearch := milvusclient.NewAnnRequest("image_vector", 10, entity.FloatVector(imageEmbedding))

// Apply RRF Ranker to product hybrid search

resultSets, err := client.HybridSearch(ctx, milvusclient.NewHybridSearchOption(

    collectionName, 10, textSearch, imageSearch,
).WithReranker(milvusclient.NewRRFReranker()))

if err != nil {
    fmt.Println(err.Error())

    // handle error
}

fmt.Println(resultSets)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT");

let client = ClientV2::new(&config).await?;

// Define text vector search request

let text_search = SubSearchRequest::builder()

    .vector_field("text_vector")

    .vectors(SearchVectors::EmbeddedText(vec!["modern dining table".to_string()]))

    .limit(10)

    .build()?;

// Define image vector search request

let image_search = SubSearchRequest::builder()

    .vector_field("image_vector")

    .vectors(SearchVectors::Float(vec![image_embedding]))

    .limit(10)

    .build()?;

// Apply RRF Ranker to product hybrid search

let hybrid_results = client

    .hybrid_search(

        HybridSearchRequest::builder()

            .collection_name(collection_name)

            .sub_requests(vec![text_search, image_search])

            .rerank(RRFRerank::new().k(100))

            .limit(10)

            .output_fields(["product_name", "price", "category"])

            .build()?,
    )

    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto text_search = milvus::SubSearchRequest()
                    .WithLimit(10)
                    .WithAnnsField("text_vector")
                    .AddEmbeddedText("modern dining table");

auto image_search = milvus::SubSearchRequest()
                    .WithLimit(10)
                    .WithAnnsField("image_vector")
                    .AddFloatVector(image_embedding);

auto request = milvus::HybridSearchRequest()
                    .WithCollectionName(collection_name)
                    .WithLimit(10)
                    .AddSubRequest(std::make_shared<milvus::SubSearchRequest>(std::move(text_search)))
                    .AddSubRequest(std::make_shared<milvus::SubSearchRequest>(std::move(image_search)))
                    .WithRerank(rerank)
                    .AddOutputField("product_name")
                    .AddOutputField("price")
                    .AddOutputField("category");

milvus::SearchResponse response;
auto status = client->HybridSearch(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, FunctionType } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const text_search = {
    data: ["modern dining table"],
    anns_field: "text_vector",
    param: {},
    limit: 10,
};

const image_search = {
  data: [image_embedding],
  anns_field: "image_vector",
  param: {},
  limit: 10,
};

const search = await milvusClient.search({
  collection_name: collection_name,
  data: [text_search, image_search],
  output_fields: ["product_name", "price", "category"],
  limit: 10,
  rerank: rerank,
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export TOKEN="YOUR_CLUSTER_TOKEN"

curl --request POST \

--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" \

--header "Authorization: Bearer ${TOKEN}" \

--header "Content-Type: application/json" \

-d '{
    "collectionName": "collection_name",
    "data": [
        {
            "data": ["modern dining table"],
            "annsField": "text_vector",
            "limit": 10
        },
        {
            "data": [image_embedding],
            "annsField": "image_vector",
            "limit": 10
        }
    ],
    "rerank": {
        "strategy": "rrf",
        "params": {
            "k": 100
        }
    },
    "limit": 10,
    "outputFields": ["product_name", "price", "category"]
}'
```

</TabItem>
</Tabs>

For more information on hybrid search, refer to [Multi-Vector Hybrid Search](./hybrid-search).
