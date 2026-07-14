---
title: "RRF Ranker | BYOC"
slug: /reranking-rrf
sidebar_label: "RRF Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Reciprocal Rank Fusion (RRF) Ranker は、Zilliz Cloud ハイブリッド検索のための reranking 戦略であり、生の類似度スコアではなく順位位置に基づいて、複数の vector 検索パスからの結果のバランスを取ります。個々の統計ではなく選手の順位を考慮するスポーツ大会のように、RRF Ranker は異なる検索パスで各アイテムがどれだけ高く順位付けされているかに基づいて検索結果を組み合わせ、公平でバランスの取れた最終順位を作成します。 | BYOC"
type: origin
token: Nqguwf6ikiKrHEkGKgAc8g7Lnnh
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RRF Ranker

Reciprocal Rank Fusion (RRF) Ranker は、Zilliz Cloud ハイブリッド検索のための reranking 戦略であり、生の類似度スコアではなく順位位置に基づいて、複数の vector 検索パスからの結果のバランスを取ります。個々の統計ではなく選手の順位を考慮するスポーツ大会のように、RRF Ranker は異なる検索パスで各アイテムがどれだけ高く順位付けされているかに基づいて検索結果を組み合わせ、公平でバランスの取れた最終順位を作成します。

## RRF Ranker を使用するタイミング\{#when-to-use-rrf-ranker}

RRF Ranker は、明示的な重要度の重みを割り当てることなく、複数の vector 検索パスからの結果のバランスを取りたいハイブリッド検索シナリオ向けに特別に設計されています。特に次のような用途で効果的です。

| ユースケース | 例 | RRF Ranker が適している理由 |
| --- | --- | --- |
| 同等の重要性を持つマルチモーダル検索 | 画像とテキストの両方が同等に重要な image-text 検索 | 任意の重み付けを必要とせずに結果のバランスを取れるため |
| アンサンブル vector 検索 | 異なる埋め込みモデルの結果を組み合わせる | 特定のモデルのスコア分布を優遇せず、順位を民主的に統合するため |
| クロスリンガル検索 | 複数言語にまたがってドキュメントを検索する | 言語固有の埋め込み特性に関係なく結果を公平に順位付けするため |
| エキスパート推奨 | 複数の専門システムからの推奨を組み合わせる | 異なるシステムが比較不可能なスコアリング手法を使う場合でも合意順位を作成できるため |

ハイブリッド検索アプリケーションで、明示的な重みを割り当てずに複数の検索パスを民主的にバランスさせる必要がある場合、RRF Ranker は理想的な選択肢です。

## RRF Ranker の仕組み\{#mechanism-of-rrf-ranker}

RRFRanker 戦略の主なワークフローは次のとおりです。

1. **検索順位を収集する**: vector 検索の各パスから結果の順位（rank_1、rank_2）を収集します。

1. **順位を統合する**: 数式に従って、各パスの順位（rank_rrf_1、rank_rrf_2）を変換します。

    計算式には *N* が含まれ、これは取得数を表します。*ranki*(*d*) は、*i(th)* 番目の retriever によって生成されたドキュメント *d* の順位位置です。*k* は通常 60 に設定される平滑化パラメータです。

1. **順位を集約する**: 統合された順位に基づいて検索結果を再順位付けし、最終結果を生成します。

![M2SawupkSh2NZxbX7SAcwqZZnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/M2SawupkSh2NZxbX7SAcwqZZnxd.png)

## RRF Ranker の例\{#example-of-rrf-ranker}

この例では、スパースベクトルと dense vector に対する Hybrid Search（topK=5）を示し、RRFRanker 戦略が 2 つの ANN 検索からの結果をどのように再順位付けするかを説明します。

- テキストの sparse vector に対する ANN 検索の結果（topK=5）:

    | **ID** | **順位（sparse）** |
    | --- | --- |
    | 101 | 1 |
    | 203 | 2 |
    | 150 | 3 |
    | 198 | 4 |
    | 175 | 5 |

- テキストの dense vector に対する ANN 検索の結果（topK=5）:

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

RRF reranking 戦略を使用する場合、パラメータ `k` を設定する必要があります。これは平滑化パラメータであり、全文検索と vector 検索の相対的な重みに効果的に影響を与えることができます。このパラメータのデフォルト値は 60 で、(0, 16384) の範囲で調整できます。値は浮動小数点数である必要があります。推奨値は [10, 100] の間です。`k=60` は一般的な選択肢ですが、最適な `k` 値は特定のアプリケーションやデータセットによって異なる場合があります。最良のパフォーマンスを得るために、具体的なユースケースに基づいてこのパラメータをテストし、調整することをお勧めします。

### RRF Ranker を作成する\{#create-an-rrf-ranker}

collection が複数の vector field で設定されたら、適切な平滑化パラメータで RRF Ranker を作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
auto rerank = std::make_shared<milvus::Function>("rrf", milvus::FunctionType::RERANK);
rerank->AddParam("reranker", "rrf");
rerank->AddParam("k", "100");
```

</TabItem>
</Tabs>

| パラメータ | 必須? | 説明 | 値/例 |
| --- | --- | --- | --- |
| `name` | はい | この Function の一意の識別子 | `"rrf"` |
| `input_field_names` | はい | 関数を適用する vector field のリスト（RRF Ranker では空でなければなりません） | [] |
| `function_type` | はい | 呼び出す Function のタイプ。reranking 戦略を指定するには `RERANK` を使用します | `FunctionType.RERANK` |
| `params.reranker` | はい | 使用する reranking メソッドを指定します。<br/>RRF Ranker を使用するには `rrf` に設定する必要があります。 | `"weighted"` |
| `params.k` | いいえ | ドキュメント順位の影響を制御する平滑化パラメータ。`k` が大きいほど上位順位への感度が低下します。範囲: (0, 16384)、デフォルト: `60`。<br/>詳細については、[RRF Ranker の仕組み](./reranking-rrf#mechanism-of-rrf-ranker) を参照してください。 | `100` |

### ハイブリッド検索に適用する\{#apply-to-hybrid-search}

RRF Ranker は、複数の vector field を組み合わせるハイブリッド検索操作向けに特別に設計されています。ハイブリッド検索での使用方法は次のとおりです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
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
                .ranker(rerank)
                .limit(10)
                .outputFields(Arrays.asList("product_name", "price", "category"))
                .build();
SearchResp searchResp = client.hybridSearch(hybridSearchReq);
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

ハイブリッド検索の詳細については、[Multi-Vector Hybrid Search](./hybrid-search) を参照してください。
