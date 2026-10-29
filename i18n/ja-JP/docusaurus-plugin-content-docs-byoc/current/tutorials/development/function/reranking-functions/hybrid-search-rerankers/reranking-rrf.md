---
title: "RRF Ranker | BYOC"
slug: /reranking-rrf
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Reciprocal Rank Fusion（RRF）Ranker は、Zilliz Cloud のハイブリッド検索向けのリランキング戦略であり、生の類似度スコアではなくランキング位置に基づいて、複数のベクトル検索経路の結果をバランスさせます。個々の統計ではなく選手のランキングを考慮するスポーツトーナメントのように、RRF Ranker は各アイテムが異なる検索経路でどれだけ上位にランクされるかに基づいて検索結果を統合し、公平でバランスの取れた最終ランキングを作成します。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-reranking-rrf
sidebar_label: "RRF Ranker"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/embeddings-reranking/reranking/rrf-ranker.md"

---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RRF Ranker

Reciprocal Rank Fusion（RRF）Ranker は、Zilliz Cloud のハイブリッド検索向けのリランキング戦略であり、生の類似度スコアではなくランキング位置に基づいて、複数のベクトル検索経路の結果をバランスさせます。個々の統計ではなく選手のランキングを考慮するスポーツトーナメントのように、RRF Ranker は各アイテムが異なる検索経路でどれだけ上位にランクされるかに基づいて検索結果を統合し、公平でバランスの取れた最終ランキングを作成します。

## RRF Ranker を使用する場合\{#when-to-use-rrf-ranker}

RRF Ranker は、明示的な重要度の重みを割り当てずに、複数のベクトル検索経路の結果をバランスさせたいハイブリッド検索シナリオ向けに特別に設計されています。特に次の場合に有効です。

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>RRF Ranker が適している理由</p></th>
   </tr>
   <tr>
     <td><p>重要度が等しいマルチモーダル検索</p></td>
     <td><p>画像とテキストの両方のモダリティが等しく重要な画像・テキスト検索</p></td>
     <td><p>任意の重みを割り当てることなく、結果をバランスさせます</p></td>
   </tr>
   <tr>
     <td><p>アンサンブルベクトル検索</p></td>
     <td><p>異なる埋め込みモデルの結果を組み合わせる</p></td>
     <td><p>特定のモデルのスコア分布を優先することなく、ランキングを民主的に統合します</p></td>
   </tr>
   <tr>
     <td><p>言語横断検索</p></td>
     <td><p>複数の言語にわたってドキュメントを検索する</p></td>
     <td><p>言語固有の埋め込み特性に関係なく、結果を公平にランク付けします</p></td>
   </tr>
   <tr>
     <td><p>専門家によるレコメンデーション</p></td>
     <td><p>複数の専門家システムからのレコメンデーションを組み合わせる</p></td>
     <td><p>異なるシステムが比較できないスコアリング手法を使用している場合に、コンセンサスランキングを作成します</p></td>
   </tr>
</table>

ハイブリッド検索アプリケーションで、明示的な重みを割り当てずに複数の検索経路を民主的にバランスさせる必要がある場合、RRF Ranker が最適な選択肢です。

## RRF Ranker のメカニズム\{#mechanism-of-rrf-ranker}

RRFRanker 戦略の主なワークフローは次のとおりです。

1. **検索ランキングを収集する**: ベクトル検索の各経路から結果のランキングを収集します（rank_1、rank_2）。

1. **ランキングをマージする**: 各経路のランキング（rank_rrf_1、rank_rrf_2）を式に従って変換します。

    計算式には、取得回数を表す *N* が含まれます。*ranki*(*d*) は、*i(th)* 番目のレトリーバーによって生成されたドキュメント *d* のランキング位置です。*k* は通常 60 に設定されるスムージングパラメーターです。

1. **ランキングを集計する**: 結合されたランキングに基づいて検索結果を再ランキングし、最終結果を生成します。

![RRF Ranker](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/b44372a644df1aa1ab2bd6a45aa9dce55b67d01bc91cd926334db7a9b797c9c2.png)

## RRF Ranker の例\{#example-of-rrf-ranker}

この例では、スパース・デンスベクトルに対するハイブリッド検索（topK=5）を示し、RRFRanker 戦略が 2 つの ANN 検索の結果をどのように再ランキングするかを説明します。

- テキストのスパースベクトルに対する ANN 検索の結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>ランク（スパース）</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>1</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>2</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>3</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>4</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>5</p></td>
       </tr>
    </table>

- テキストのデンスベクトルに対する ANN 検索の結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>ランク（デンス）</strong></p></th>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>1</p></td>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>2</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>3</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>4</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>5</p></td>
       </tr>
    </table>

- RRF を使用して 2 セットの検索結果のランキングを並べ替えます。スムージングパラメーター `k` が 60 に設定されていると仮定します。

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>スコア（スパース）</strong></p></th>
         <th><p><strong>スコア（デンス）</strong></p></th>
         <th><p><strong>最終スコア</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>1</p></td>
         <td><p>2</p></td>
         <td><p>1/(60+1)+1/(60+2) = 0.03252247</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>4</p></td>
         <td><p>1</p></td>
         <td><p>1/(60+4)+1/(60+1) = 0.03201844</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>5</p></td>
         <td><p>4</p></td>
         <td><p>1/(60+5)+1/(60+4) = 0.03100962</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>2</p></td>
         <td><p>N/A</p></td>
         <td><p>1/(60+2) = 0.01612903</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>3</p></td>
         <td><p>N/A</p></td>
         <td><p>1/(60+3) = 0.01587302</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>N/A</p></td>
         <td><p>3</p></td>
         <td><p>1/(60+3) = 0.01587302</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>N/A</p></td>
         <td><p>5</p></td>
         <td><p>1/(60+5) = 0.01538462</p></td>
       </tr>
    </table>

- 再ランキング後の最終結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ランク</strong></p></th>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>最終スコア</strong></p></th>
       </tr>
       <tr>
         <td><p>1</p></td>
         <td><p>101</p></td>
         <td><p>0.03252247</p></td>
       </tr>
       <tr>
         <td><p>2</p></td>
         <td><p>198</p></td>
         <td><p>0.03201844</p></td>
       </tr>
       <tr>
         <td><p>3</p></td>
         <td><p>175</p></td>
         <td><p>0.03100962</p></td>
       </tr>
       <tr>
         <td><p>4</p></td>
         <td><p>203</p></td>
         <td><p>0.01612903</p></td>
       </tr>
       <tr>
         <td><p>5</p></td>
         <td><p>150</p></td>
         <td><p>0.01587302</p></td>
       </tr>
       <tr>
         <td><p>5</p></td>
         <td><p>110</p></td>
         <td><p>0.01587302</p></td>
       </tr>
    </table>

## RRF Ranker の使用方法\{#usage-of-rrf-ranker}

RRF リランキング戦略を使用する場合は、パラメーター `k` を設定する必要があります。これは、全文検索とベクトル検索の相対的な重みを効果的に変更できるスムージングパラメーターです。このパラメーターのデフォルト値は 60 で、（0, 16384）の範囲で調整できます。値は浮動小数点数である必要があります。推奨値は [10, 100] の範囲です。`k=60` は一般的な選択肢ですが、最適な `k` の値は特定のアプリケーションやデータセットによって異なる場合があります。最高のパフォーマンスを実現するには、特定のユースケースに基づいてこのパラメーターをテストおよび調整することをお勧めします。

### RRF Ranker を作成する\{#create-an-rrf-ranker}

コレクションに複数のベクトルフィールドを設定したら、適切なスムージングパラメーターを指定して RRF Ranker を作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

ranker = Function(
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
import "github.com/milvus-io/milvus/client/v3/milvusclient"

rerank := milvusclient.NewRRFReranker().WithK(100)
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

const ranker = {
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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

var rerank = new RrfReranker(100);
```

</TabItem>

<TabItem value='bash'>

```bash
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

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須</p></th>
     <th><p>説明</p></th>
     <th><p>Value/Example</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>この Function の一意の識別子</p></td>
     <td><p><code>"rrf"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>Function を適用するベクトルフィールドのリスト（RRF Ranker では空にする必要があります）</p></td>
     <td><p>[]</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す Function のタイプ。リランキング戦略を指定するには <code>RERANK</code> を使用します</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用するリランキング方法を指定します。</p><p>RRF Ranker を使用するには、<code>rrf</code> に設定する必要があります。</p></td>
     <td><p><code>"rrf"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.k</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>ドキュメントのランクの影響を制御するスムージングパラメーターです。<code>k</code> を大きくすると、上位ランクへの感度が低下します。範囲：（0, 16384）、デフォルト：<code>60</code>。</p><p>詳細については、<a href="./reranking-rrf#mechanism-of-rrf-ranker">RRF Ranker のメカニズム</a> を参照してください。</p></td>
     <td><p><code>100</code></p></td>
   </tr>
</table>

### ハイブリッド検索に適用する\{#apply-to-hybrid-search}

RRF Ranker は、複数のベクトルフィールドを組み合わせるハイブリッド検索操作向けに特別に設計されています。ハイブリッド検索で使用する方法は次のとおりです。

例では、`text_vector` 用のテキスト埋め込み関数を備えた既存のコレクションと、`image_vector` の次元に一致する準備済みの画像埋め込みがあることを前提としています。コレクション名と画像埋め込みは、ご自身の値に置き換えてください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest, RRFRanker

# Connect to Zilliz Cloud server
milvus_client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

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

# Create an RRF ranker with smoothing parameter k
ranker = RRFRanker(k=100)

# Apply RRF Ranker to product hybrid search
# The smoothing parameter k controls the balance
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # Multiple search requests
    # highlight-next-line
    ranker=ranker,  # Apply the RRF ranker
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
import io.milvus.v2.service.vector.request.ranker.RRFRanker;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
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

RRFRanker ranker = RRFRanker.builder()
                .k(100)
                .build();

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
                .collectionName(COLLECTION_NAME)
                .searchRequests(searchRequests)
                .ranker(ranker)
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
    APIKey: "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    panic(err)
}
defer client.Close(ctx)

// Define text vector search request
textSearch := milvusclient.NewAnnRequest("text_vector", 10, entity.Text("modern dining table"))

// Define image vector search request
imageSearch := milvusclient.NewAnnRequest("image_vector", 10, entity.FloatVector(imageEmbedding))

// Apply RRF Ranker to product hybrid search
rerank := milvusclient.NewRRFReranker().WithK(100)
resultSets, err := client.HybridSearch(ctx, milvusclient.NewHybridSearchOption(
    collectionName, 10, textSearch, imageSearch,
).WithReranker(rerank).WithOutputFields("product_name", "price", "category"))
if err != nil {
    panic(err)
}
fmt.Println(resultSets)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new()
    .uri("YOUR_CLUSTER_ENDPOINT")
    .token("YOUR_CLUSTER_TOKEN");
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

auto client = milvus::MilvusClientV2::Create();
auto connect_status = client->Connect(milvus::ConnectParam{
    "YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"});
if (!connect_status.IsOk()) {
    std::cout << connect_status.Message() << std::endl;
    return;
}

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

const milvusClient = new MilvusClient({
  address: "YOUR_CLUSTER_ENDPOINT",
  token: "YOUR_CLUSTER_TOKEN",
});

const text_search = {
    data: ["modern dining table"],
    anns_field: "text_vector",
    params: {},
    limit: 10,
};

const image_search = {
  data: [image_embedding],
  anns_field: "image_vector",
  params: {},
  limit: 10,
};

const ranker = {
  name: "rrf",
  input_field_names: [],
  type: FunctionType.RERANK,
  params: {
    reranker: "rrf",
    k: 100,
  },
};

const search = await milvusClient.search({
  collection_name: collection_name,
  data: [text_search, image_search],
  output_fields: ["product_name", "price", "category"],
  limit: 10,
  rerank: ranker,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

// Connect to Zilliz Cloud server
var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

// Assume you have a collection setup

// Define text vector search request
var textSearch = new AnnSearchReq
{
    VectorFieldName = "text_vector",
    Texts = ["modern dining table"],
    Limit = 10
};

// Define image vector search request
var imageSearch = new AnnSearchReq
{
    VectorFieldName = "image_vector",
    Vectors = [imageEmbedding], // Image embedding vector
    Limit = 10
};

var rerank = new RrfReranker(100);

// Apply RRF Ranker to product hybrid search
// The smoothing parameter k controls the balance
SearchResp hybridResults = await client.HybridSearchAsync(new HybridSearchReq
{
    CollectionName = collectionName,
    SearchRequests = [textSearch, imageSearch], // Multiple search requests
    Reranker = rerank, // Apply the RRF ranker
    Limit = 10,
    Parameters = new SearchParameters
    {
        OutputFields = { "product_name", "price", "category" }
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
export TOKEN="YOUR_CLUSTER_TOKEN"

# Set IMAGE_EMBEDDING to your image vector as a JSON array before running this request.
: "${IMAGE_EMBEDDING:?Set IMAGE_EMBEDDING to a JSON array of embedding values}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/hybrid_search" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-binary @- <<EOF
{
    "collectionName": "collection_name",
    "search": [
        {
            "data": ["modern dining table"],
            "annsField": "text_vector",
            "limit": 10
        },
        {
            "data": [${IMAGE_EMBEDDING}],
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
}
EOF
```

</TabItem>

</Tabs>

ハイブリッド検索の詳細については、[マルチベクトルハイブリッド検索](./hybrid-search) を参照してください。
