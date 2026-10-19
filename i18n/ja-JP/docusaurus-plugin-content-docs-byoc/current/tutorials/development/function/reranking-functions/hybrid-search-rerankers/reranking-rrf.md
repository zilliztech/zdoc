---
title: "RRF Ranker | BYOC"
slug: /reranking-rrf
sidebar_label: "RRF Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Reciprocal Rank Fusion（RRF）Ranker は、Zilliz Cloud のハイブリッド検索向けのリランキング戦略であり、生の類似度スコアではなくランキング位置に基づいて、複数のベクトル検索経路の結果をバランスさせます。個々の統計ではなく選手のランキングを考慮するスポーツトーナメントのように、RRF Ranker は各アイテムが異なる検索経路でどれだけ上位にランクされるかに基づいて検索結果を統合し、公平でバランスの取れた最終ランキングを作成します。 | BYOC"
type: origin
token: Nqguwf6ikiKrHEkGKgAc8g7Lnnh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RRF Ranker

Reciprocal Rank Fusion（RRF）Ranker は、Zilliz Cloud のハイブリッド検索向けのリランキング戦略であり、生の類似度スコアではなくランキング位置に基づいて、複数のベクトル検索経路の結果をバランスさせます。個々の統計ではなく選手のランキングを考慮するスポーツトーナメントのように、RRF Ranker は各アイテムが異なる検索経路でどれだけ上位にランクされるかに基づいて検索結果を統合し、公平でバランスの取れた最終ランキングを作成します。

## RRF Ranker を使用する場合\{#when-to-use-rrf-ranker}

RRF Ranker は、明示的な重要度の重みを割り当てずに、複数のベクトル検索経路の結果をバランスさせたいハイブリッド検索シナリオ向けに特別に設計されています。特に次の場合に有効です。

| ユースケース | 例 | RRF Ranker が適している理由 |
| --- | --- | --- |
| 同等の重要度を持つマルチモーダル検索 | 両方のモダリティが同等に重要である画像とテキストの検索 | 任意の重みを割り当てることなく結果をバランスさせます |
| アンサンブルベクトル検索 | 異なる埋め込みモデルの結果を組み合わせる | 特定のモデルのスコア分布を優先せずに、ランキングを民主的に統合します |
| クロスリンガル検索 | 複数の言語にまたがるドキュメントの検索 | 言語固有の埋め込み特性に関係なく、結果を公平にランク付けします |
| 専門家によるレコメンデーション | 複数のエキスパートシステムからのレコメンデーションを組み合わせる | 異なるシステムが比較できないスコアリング方法を使用する場合に、コンセンサスランキングを作成します |

ハイブリッド検索アプリケーションで、明示的な重みを割り当てずに複数の検索経路を民主的にバランスさせる必要がある場合、RRF Ranker が最適な選択肢です。

## RRF Ranker のメカニズム\{#mechanism-of-rrf-ranker}

RRFRanker 戦略の主なワークフローは次のとおりです。

1. **検索ランキングを収集する**: ベクトル検索の各経路から結果のランキングを収集します（rank_1、rank_2）。

1. **ランキングをマージする**: 各経路のランキング（rank_rrf_1、rank_rrf_2）を式に従って変換します。

    計算式には、取得回数を表す *N* が含まれます。*ranki*(*d*) は、*i(th)* 番目のレトリーバーによって生成されたドキュメント *d* のランキング位置です。*k* は通常 60 に設定されるスムージングパラメーターです。

1. **ランキングを集計する**: 結合されたランキングに基づいて検索結果を再ランキングし、最終結果を生成します。

![M2SawupkSh2NZxbX7SAcwqZZnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/M2SawupkSh2NZxbX7SAcwqZZnxd.png)

## RRF Ranker の例\{#example-of-rrf-ranker}

この例では、スパース・デンスベクトルに対するハイブリッド検索（topK=5）を示し、RRFRanker 戦略が 2 つの ANN 検索の結果をどのように再ランキングするかを説明します。

- テキストのスパースベクトルに対する ANN 検索の結果（topK=5）：

    | **ID** | **順位（スパース）** |
    | --- | --- |
    | 101 | 1 |
    | 203 | 2 |
    | 150 | 3 |
    | 198 | 4 |
    | 175 | 5 |

- テキストのデンスベクトルに対する ANN 検索の結果（topK=5）：

    | **ID** | **順位（デンス）** |
    | --- | --- |
    | 198 | 1 |
    | 101 | 2 |
    | 110 | 3 |
    | 175 | 4 |
    | 250 | 5 |

- RRF を使用して 2 セットの検索結果のランキングを並べ替えます。スムージングパラメーター `k` が 60 に設定されていると仮定します。

    | **ID** | **スコア（スパース）** | **スコア（デンス）** | **最終スコア** |
    | --- | --- | --- | --- |
    | 101 | 1 | 2 | 1/(60+1)+1/(60+2) = 0.03252247 |
    | 198 | 4 | 1 | 1/(60+4)+1/(60+1) = 0.03201844 |
    | 175 | 5 | 4 | 1/(60+5)+1/(60+4) = 0.03100962 |
    | 203 | 2 | N/A | 1/(60+2) = 0.01612903 |
    | 150 | 3 | N/A | 1/(60+3) = 0.01587302 |
    | 110 | N/A | 3 | 1/(60+3) = 0.01587302 |
    | 250 | N/A | 5 | 1/(60+5) = 0.01538462 |

- 再ランキング後の最終結果（topK=5）：

    | **順位** | **ID** | **最終スコア** |
    | --- | --- | --- |
    | 1 | 101 | 0.03252247 |
    | 2 | 198 | 0.03201844 |
    | 3 | 175 | 0.03100962 |
    | 4 | 203 | 0.01612903 |
    | 5 | 150 | 0.01587302 |
    | 5 | 110 | 0.01587302 |

## RRF Ranker の使用方法\{#usage-of-rrf-ranker}

RRF リランキング戦略を使用する場合は、パラメーター `k` を設定する必要があります。これは、全文検索とベクトル検索の相対的な重みを効果的に変更できるスムージングパラメーターです。このパラメーターのデフォルト値は 60 で、（0, 16384）の範囲で調整できます。値は浮動小数点数である必要があります。推奨値は [10, 100] の範囲です。`k=60` は一般的な選択肢ですが、最適な `k` の値は特定のアプリケーションやデータセットによって異なる場合があります。最高のパフォーマンスを実現するには、特定のユースケースに基づいてこのパラメーターをテストおよび調整することをお勧めします。

### RRF Ranker を作成する\{#create-an-rrf-ranker}

コレクションに複数のベクトルフィールドを設定したら、適切なスムージングパラメーターを指定して RRF Ranker を作成します。

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
use milvus::v2::prelude::*;

let rerank = Function::new()

    .name("rrf")

    .function_type(FunctionType::Rerank)

    .param("reranker", "rrf")

    .param("k", "100");
```

</TabItem>

<TabItem value='c++'>

```c++
#include <memory>
#include "milvus/MilvusClientV2.h"

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
  type: FunctionType.RERANK,
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
    "type": "RERANK",
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

| パラメーター | 必須 | 説明 | 値/Example |
| --- | --- | --- | --- |
| `name` | はい | この Function の一意の識別子です。 | `"rrf"` |
| `input_field_names` | はい | この関数を適用するベクトルフィールドのリストです（RRF Ranker では空にする必要があります）。 | [] |
| `function_type` | はい | 呼び出す Function のタイプです。リランキング戦略を指定するには `RERANK` を使用します。 | `FunctionType.RERANK` |
| `params.reranker` | はい | 使用するリランキング方法を指定します。<br/>RRF Ranker を使用するには `rrf` に設定する必要があります。 | `"weighted"` |
| `params.k` | いいえ | ドキュメントのランクの影響を制御するスムージングパラメーターです。`k` の値が大きいほど、上位ランクに対する感度が低下します。範囲: (0, 16384)、デフォルト: `60`。<br/>詳細については、[RRF Ranker のメカニズム](./reranking-rrf#mechanism-of-rrf-ranker) を参照してください。 | `100` |

### ハイブリッド検索に適用する\{#apply-to-hybrid-search}

RRF Ranker は、複数のベクトルフィールドを組み合わせるハイブリッド検索操作向けに特別に設計されています。ハイブリッド検索で使用する方法は次のとおりです。

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
).WithReranker(rerank))

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
#include <iostream>
#include <memory>
#include <utility>
#include "milvus/MilvusClientV2.h"

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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

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

ハイブリッド検索の詳細については、[マルチベクトルハイブリッド検索](./hybrid-search) を参照してください。
