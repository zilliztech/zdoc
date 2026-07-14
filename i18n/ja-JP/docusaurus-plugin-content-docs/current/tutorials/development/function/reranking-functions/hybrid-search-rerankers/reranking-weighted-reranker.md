---
title: "Weighted Ranker | Cloud"
slug: /reranking-weighted-reranker
sidebar_label: "Weighted Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Weighted Ranker は、各検索パスに異なる重要度の重みを割り当てることで、複数の検索パスからの結果をインテリジェントに結合し、優先順位付けします。熟練したシェフが完璧な料理を作るために複数の材料のバランスを取るように、Weighted Ranker は異なる検索結果のバランスを取り、最も関連性の高い統合結果を提供します。このアプローチは、複数の vector field やモダリティをまたいで検索する際に、特定の field が最終ランキングに他よりも大きく寄与すべき場合に最適です。 | Cloud"
type: origin
token: Oyy6w5DYJiVCMYkdduEc6eD9nZg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Weighted Ranker

Weighted Ranker は、各検索パスに異なる重要度の重みを割り当てることで、複数の検索パスからの結果をインテリジェントに結合し、優先順位付けします。熟練したシェフが完璧な料理を作るために複数の材料のバランスを取るように、Weighted Ranker は異なる検索結果のバランスを取り、最も関連性の高い統合結果を提供します。このアプローチは、複数の vector field やモダリティをまたいで検索する際に、特定の field が最終ランキングに他よりも大きく寄与すべき場合に最適です。

## Weighted Ranker を使うべき場合\{#when-to-use-weighted-ranker}

Weighted Ranker は、複数の vector search パスからの結果を組み合わせる必要がある hybrid search シナリオ向けに特化して設計されています。特に、次のような用途で効果的です。

| ユースケース | 例 | Weighted Ranker がうまく機能する理由 |
| --- | --- | --- |
| E-commerce search | 画像の類似性とテキスト説明を組み合わせた商品検索 | 小売業者は、ファッション商品では視覚的な類似性を優先しつつ、技術製品ではテキスト説明を重視できます |
| メディアコンテンツ検索 | 視覚特徴と音声文字起こしの両方を用いた動画検索 | クエリ意図に基づいて、視覚コンテンツと話し言葉の対話の重要度のバランスを取ります |
| ドキュメント検索 | 異なるセクション用に複数の embedding を持つエンタープライズ文書検索 | タイトルと要約の embedding により高い重みを与えつつ、全文 embedding も考慮します |

hybrid search アプリケーションで、複数の検索パスを組み合わせながらそれぞれの相対的な重要度を制御する必要がある場合、Weighted Ranker は理想的な選択肢です。

## Weighted Ranker の仕組み\{#mechanism-of-weighted-ranker}

WeightedRanker 戦略の主なワークフローは次のとおりです。

1. **検索スコアの収集**: 各 vector search パスの結果とスコア（score_1、score_2）を収集します。

1. **スコアの正規化**: 各検索では異なる類似度メトリクスを使用する場合があり、その結果としてスコア分布も異なります。たとえば、類似度タイプとして Inner Product (IP) を使用するとスコア範囲は [−∞,+∞] になる可能性があり、Euclidean distance (L2) を使用するとスコア範囲は [0,+∞] になります。異なる検索からのスコア範囲は異なり、直接比較できないため、各検索パスのスコアを正規化する必要があります。通常は `arctan` 関数を適用して、スコアを [0, 1] の範囲（score_1_normalized、score_2_normalized）に変換します。1 に近いスコアほど、類似度が高いことを示します。

1. **重みの割り当て**: 異なる vector field に割り当てられた重要度に基づいて、正規化されたスコア（score_1_normalized、score_2_normalized）に重み（**wi**）を割り当てます。各パスの重みは [0,1] の範囲である必要があります。結果として得られる重み付きスコアは score_1_weighted および score_2_weighted です。

1. **スコアの統合**: 重み付きスコア（score_1_weighted、score_2_weighted）を高い順に並べて、最終スコアの集合（score_final）を生成します。

![GdmNwbkN8haZO8bpQkOc2NIWnqF](https://zdoc-images.s3.us-west-2.amazonaws.com/GdmNwbkN8haZO8bpQkOc2NIWnqF.png)

## Weighted Ranker の例\{#example-of-weighted-ranker}

この例では、画像とテキストを含むマルチモーダル Hybrid Search（topK=5）を示し、WeightedRanker 戦略が 2 つの ANN search の結果をどのように rerank するかを説明します。

- 画像に対する ANN search の結果（topK=5）：

    | **ID** | **Score (image)** |
    | --- | --- |
    | 101 | 0.92 |
    | 203 | 0.88 |
    | 150 | 0.85 |
    | 198 | 0.83 |
    | 175 | 0.8 |

- テキストに対する ANN search の結果（topK=5）：

    | **ID** | **Score (text)** |
    | --- | --- |
    | 198 | 0.91 |
    | 101 | 0.87 |
    | 110 | 0.85 |
    | 175 | 0.82 |
    | 250 | 0.78 |

- WeightedRanker を使用して、画像検索結果とテキスト検索結果に重みを割り当てます。画像 ANN search の重みを 0.6、テキスト検索の重みを 0.4 とします。

    | **ID** | **Score (image)** | **Score (text)** | **Weighted Score** |
    | --- | --- | --- | --- |
    | 101 | 0.92 | 0.87 | 0.6×0.92+0.4×0.87=0.90 |
    | 203 | 0.88 | N/A | 0.6×0.88+0.4×0=0.528 |
    | 150 | 0.85 | N/A | 0.6×0.85+0.4×0=0.51 |
    | 198 | 0.83 | 0.91 | 0.6×0.83+0.4×0.91=0.86 |
    | 175 | 0.80 | 0.82 | 0.6×0.80+0.4×0.82=0.81 |
    | 110 | Not in Image | 0.85 | 0.6×0+0.4×0.85=0.34 |
    | 250 | Not in Image | 0.78 | 0.6×0+0.4×0.78=0.312 |

- rerank 後の最終結果（topK=5）：

    | **Rank** | **ID** | **Final Score** |
    | --- | --- | --- |
    | 1 | 101 | 0.90 |
    | 2 | 198 | 0.86 |
    | 3 | 175 | 0.81 |
    | 4 | 203 | 0.528 |
    | 5 | 150 | 0.51 |

## Weighted Ranker の使用方法\{#usage-of-weighted-ranker}

WeightedRanker 戦略を使用する場合は、重みの値を入力する必要があります。入力する重みの数は、Hybrid Search における基本 ANN search リクエストの数に対応している必要があります。入力する重みの値は [0,1] の範囲にある必要があり、1 に近い値ほど重要度が高いことを示します。

### Weighted Ranker を作成する\{#create-a-weighted-ranker}

たとえば、Hybrid Search に 2 つの基本 ANN search リクエスト（テキスト検索と画像検索）があるとします。テキスト検索の方が重要と見なされる場合は、より大きな重みを割り当てる必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

rerank = Function(
    name="weight",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "weighted", 
        "weights": [0.1, 0.9],
        "norm_score": True  # Optional
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.Function rerank = CreateCollectionReq.Function.builder()
                .name("weight")
                .functionType(FunctionType.RERANK)
                .param("reranker", "weighted")
                .param("weights", "[0.1, 0.9]")
                .param("norm_score", "true")
                .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from '@zilliz/milvus2-sdk-node';

const rerank = {
    name: "weight",
    input_field_names: [],
    function_type: FunctionType.RERANK,
    params: {
        reranker: "weighted",
        weights: [0.1, 0.9],
        norm_score: true
    }
};
```

</TabItem>

<TabItem value='go'>

```go
// Go
```

</TabItem>

<TabItem value='bash'>

```bash
# Restful
```

</TabItem>

<TabItem value='c++'>

```c++
auto rerank = std::make_shared<milvus::Function>("weight", milvus::FunctionType::RERANK);
rerank->AddParam("reranker", "weighted");
rerank->AddParam("weights", "[0.1, 0.9]");
rerank->AddParam("norm_score", "true");
```

</TabItem>
</Tabs>

| Parameter | Required? | Description | Value/Example |
| --- | --- | --- | --- |
| `name` | Yes | この Function の一意な識別子 | `"weight"` |
| `input_field_names` | Yes | function を適用する vector field のリスト（Weighted Ranker の場合は空でなければなりません） | [] |
| `function_type` | Yes | 呼び出す Function のタイプ。reranking 戦略を指定するには `RERANK` を使用します | `FunctionType.RERANK` |
| `params.reranker` | Yes | 使用する reranking メソッドを指定します。<br/>Weighted Ranker を使用するには `weighted` に設定する必要があります。 | `"weighted"` |
| `params.weights` | Yes | 各検索パスに対応する重みの配列。値 ∈ [0,1]。<br/>詳細は [Weighted Ranker の仕組み](./reranking-weighted-reranker#mechanism-of-weighted-ranker) を参照してください。 | `[0.1, 0.9]` |
| `params.norm_score` | No | 重み付けの前に生スコアを正規化する（arctan を使用する）かどうか。<br/>詳細は [Weighted Ranker の仕組み](./reranking-weighted-reranker#mechanism-of-weighted-ranker) を参照してください。 | `True` |

### hybrid search に適用する\{#apply-to-hybrid-search}

Weighted Ranker は、複数の vector field を組み合わせる hybrid search 操作向けに特化して設計されています。hybrid search を実行する際は、各検索パスの重みを指定する必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest

# Connect to Milvus server
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

# Apply Weighted Ranker to product hybrid search
# Text search has 0.8 weight, image search has 0.3 weight
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # Multiple search requests
    # highlight-next-line
    ranker=rerank,  # Apply the weighted ranker
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

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());
        
List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("text_vector")
        .vectors(Collections.singletonList(new EmbeddedText("\"modern dining table\"")))
        .limit(10)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("image_vector")
        .vectors(Collections.singletonList(new FloatVec(imageEmbedding)))
        .limit(10)
        .build());
        
HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
                .collectionName(COLLECTION_NAME)
                .searchRequests(searchRequests)
                .ranker(ranker)
                .limit(10)
                .outputFields(Arrays.asList("product_name", "price", "category"))
                .build();
SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, FunctionType } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient({ 
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
});

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
  limit: 10,
  data: [text_search, image_search],
  rerank: rerank,
  output_fields = ["product_name", "price", "category"],
});
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
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
</Tabs>

hybrid search の詳細については、[Multi-Vector Hybrid Search](./hybrid-search) を参照してください。
