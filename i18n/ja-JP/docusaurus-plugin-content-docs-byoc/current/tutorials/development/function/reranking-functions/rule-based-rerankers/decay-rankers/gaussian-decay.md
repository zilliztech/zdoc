---
title: "ガウス減衰 | BYOC"
slug: /gaussian-decay
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ガウス減衰（正規減衰とも呼ばれます）は、検索結果に対して最も自然な感覚の調整を実現します。距離に応じて徐々にぼやける人間の視覚と同様に、ガウス減衰は滑らかな釣鐘型の曲線を作成し、アイテムが理想的な地点から離れるにつれて関連性を穏やかに低下させます。このアプローチは、優先範囲のすぐ外にあるアイテムに厳しいペナルティを与えず、遠くにあるアイテムの関連性は大幅に低下させる、バランスの取れた減衰が必要な場合に最適です。 | BYOC"
type: origin
displayed_sidebar: default
token: shared-gaussian-decay
sidebar_label: "ガウス減衰"
sidebar_position: 2
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/embeddings-reranking/reranking/gaussian-decay.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ガウス減衰

ガウス減衰（正規減衰とも呼ばれます）は、検索結果に対して最も自然な感覚の調整を実現します。距離に応じて徐々にぼやける人間の視覚と同様に、ガウス減衰は滑らかな釣鐘型の曲線を作成し、アイテムが理想的な地点から離れるにつれて関連性を穏やかに低下させます。このアプローチは、優先範囲のすぐ外にあるアイテムに厳しいペナルティを与えず、遠くにあるアイテムの関連性は大幅に低下させる、バランスの取れた減衰が必要な場合に最適です。

他の減衰ランカーとは次の点が異なります。

- 指数減衰は最初に急激に低下し、初期のペナルティがより強くなります。

- 線形減衰はゼロに達するまで一定の割合で低下し、明確なカットオフを作成します。

ガウス減衰は、ユーザーにとって自然に感じられる、よりバランスの取れた直感的なアプローチを提供します。

## ガウス減衰を使用する場面\{#when-to-use-gaussian-decay}

ガウス減衰は、次のような場面で特に効果を発揮します。

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>ガウス減衰が適している理由</p></th>
   </tr>
   <tr>
     <td><p>位置情報に基づく検索</p></td>
     <td><p>レストラン検索、店舗検索ツール</p></td>
     <td><p>距離と関連性に対する人間の自然な知覚を模倣します。</p></td>
   </tr>
   <tr>
     <td><p>コンテンツのレコメンデーション</p></td>
     <td><p>公開日に基づく記事の提案</p></td>
     <td><p>コンテンツの経過時間に伴い、関連性が徐々に低下します。</p></td>
   </tr>
   <tr>
     <td><p>商品一覧</p></td>
     <td><p>目標価格に近い商品</p></td>
     <td><p>価格が目標から外れるにつれて、関連性が滑らかに低下します。</p></td>
   </tr>
   <tr>
     <td><p>専門性のマッチング</p></td>
     <td><p>関連する経験を持つ専門家の検索</p></td>
     <td><p>経験の関連性をバランスよく評価します。</p></td>
   </tr>
</table>

アプリケーションで、厳しいペナルティや厳格なカットオフなしに、関連性が自然に低下する感覚が必要な場合、ガウス減衰が最適な選択肢となる可能性があります。

## 釣鐘型曲線の原理\{#bell-curve-principle}

ガウス減衰は、理想的な地点からの距離が増すにつれて関連性を徐々に低下させる、滑らかな釣鐘型の曲線を作成します。数学者カール・フリードリヒ・ガウスにちなんで名付けられたこの分布は、自然界や統計で頻繁に見られるため、人間の知覚にとって非常に直感的に感じられる理由が説明できます。

![ガウス減衰](https://zdoc-images.s3.us-west-2.amazonaws.com/shared/a6ca4cf8682b134738bccdd41e3f763d629ec3d4132b9d5bd118f80b57334ab5.png)

上のグラフは、モバイル検索アプリでガウス減衰がレストランのランキングにどのように影響するかを示しています。

- `origin`（0 km）：現在地であり、関連性が最大（1.0）になる地点です。

- `offset`（±300 m）：周囲の「満点ゾーン」です。300 メートル以内のすべてのレストランは満点の関連性スコア（1.0）を維持するため、ごく近い選択肢がわずかな距離の違いだけで不必要にペナルティを受けることはありません。

- `scale`（±2 km）：関連性が減衰値まで下がる距離です。ちょうど 2 キロメートル離れたレストランの関連性スコアは半分（0.5）になります。

- `decay`（0.5）：スケール距離でのスコアです。このパラメーターは、距離に応じてスコアがどれだけ早く減少するかを本質的に制御します。

曲線からわかるように、2 km を超えるレストランは関連性が低下し続けますが、完全にゼロに達することはありません。4-5 キロメートル離れたレストランでも最小限の関連性は保持されるため、優れていても遠くにあるレストランは（ランキングは低くなりますが）検索結果に引き続き表示されます。

この動作は、人が距離と関連性について自然に考える方法を模倣しています。近くの場所が好まれますが、優れた選択肢のためなら遠くまで移動することも厭いません。

## 計算式\{#formula}

ガウス減衰スコアを計算する数式は次の通りです。

$$
S(doc) = \exp\left( -\frac{\left( \max\left(0, \left|fieldvalue_{doc} - origin\right| - offset \right) \right)^2}{2\sigma^2} \right)
$$

ここで、

$$
\sigma^2 = -\frac{scale^2}{2 \cdot \ln(decay)}
$$

これを平易な言葉で分解すると、次のようになります。

1. フィールド値が原点からどれだけ離れているかを計算します: $|fieldvalue_{doc} - origin|$

2. オフセットがある場合はそれを減算しますが、ゼロを下回らないようにします: $\max(0, distance - offset)$

3. この調整済み距離を二乗します: $(adjusted\_distance)^2$

4. スケールと減衰パラメーターから計算される &#36;2\sigma^2$ で除算します。

5. 負の指数を取ると、0 から 1 の間の値が得られます: $\exp(-value)$

$\sigma^{2}$ の計算により、スケールパラメーターと減衰パラメーターがガウス分布の標準偏差の二乗に変換されます。これが、この関数に特徴的な釣鐘型の形状を与えています。

## ガウス減衰を使用する\{#use-gaussian-decay}

ガウス減衰は、Zilliz Cloud の標準ベクトル検索とハイブリッド検索の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="Notes">

減衰関数を使用する前に、まず、減衰計算に使用する適切な数値フィールド（タイムスタンプ、距離など）を含むコレクションを作成する必要があります。コレクションの設定、スキーマの定義、データの挿入を含む完全な動作例については、[チュートリアル: Zilliz Cloud で時間ベースのランキングを実装する](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### 減衰ランカーを作成する\{#create-a-decay-ranker}

コレクションに数値フィールド（この例では、ユーザーからの距離をメートル単位で表す `distance`）が設定されたら、ガウス減衰ランカーを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

# Create a Gaussian decay ranker for location-based restaurant search
rerank = Function(
    name="restaurant_distance_decay",     # Function identifier
    input_field_names=["distance"],       # Numeric field for distance in meters
    function_type=FunctionType.RERANK,    # Function type. Must be RERANK
    params={
        "reranker": "decay",              # Specify decay reranker
        "function": "gauss",              # Choose Gaussian decay
        "origin": 0,                      # Your current location (0 meters)
        "offset": 300,                    # 300m no-decay zone
        "decay": 0.5,                     # Half score at scale distance
        "scale": 2000                     # 2 km scale (2000 meters)
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;
import java.util.Collections;

DecayRanker rerank = DecayRanker.builder()
        .name("restaurant_distance_decay")
        .inputFieldNames(Collections.singletonList("distance"))
        .function("gauss")
        .origin(0)
        .offset(300)
        .decay(0.5)
        .scale(2000)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

rerank := entity.NewFunction().
    WithName("restaurant_distance_decay").
    WithType(entity.FunctionTypeRerank).
    WithInputFields("distance").
    WithParam("reranker", "decay").
    WithParam("function", "gauss").
    WithParam("origin", "0").
    WithParam("offset", "300").
    WithParam("decay", "0.5").
    WithParam("scale", "2000")
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let rerank = Function::new()
    .name("restaurant_distance_decay")
    .function_type(FunctionType::Rerank)
    .input_fields(vec!["distance"])
    .param("reranker", "decay")
    .param("function", "gauss")
    .param("origin", "0")
    .param("offset", "300")
    .param("decay", "0.5")
    .param("scale", "2000");
```

</TabItem>

<TabItem value='c++'>

```c++
auto rerank = std::make_shared<milvus::DecayRerank>("restaurant_distance_decay");
rerank->AddInputFieldName("distance");
rerank->SetFunction("gauss");
rerank->SetOrigin(0);
rerank->SetScale(2000);
rerank->SetOffset(300);
rerank->SetDecay(0.5);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "restaurant_distance_decay",
  input_field_names: ["distance"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "gauss",
    origin: 0,
    offset: 300,
    decay: 0.5,
    scale: 2000,
  },
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

// Create a Gaussian decay ranker for location-based restaurant search
DecayRerank rerank = new DecayRerank("restaurant_distance_decay") // Function identifier
    .WithInputField("distance")                        // Numeric field for distance in meters
    .WithFunction("gauss")                             // Choose Gaussian decay
    .WithOrigin(0)                                     // Your current location (0 meters)
    .WithOffset(300)                                   // 300m no-decay zone
    .WithDecay(0.5f)                                   // Half score at scale distance
    .WithScale(2000);                                  // 2 km scale (2000 meters)
```

</TabItem>

<TabItem value='bash'>

```bash
rerank='{
  "name": "restaurant_distance_decay",
  "type": "Rerank",
  "inputFieldNames": ["distance"],
  "params": {
    "reranker": "decay",
    "function": "gauss",
    "origin": 0,
    "offset": 300,
    "decay": 0.5,
    "scale": 2000
  }
}'
```

</TabItem>

</Tabs>

### 標準ベクトル検索に適用する\{#apply-to-standard-vector-search}

減衰ランカーを定義したら、検索操作時に `ranker` パラメーターに渡して適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Apply decay ranker to restaurant vector search
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],         # Replace with your query vector
    anns_field="dense",                   # Vector field to search
    limit=10,                             # Number of results
    output_fields=["name", "cuisine", "distance"],  # Fields to return
    #  highlight-next-line
    ranker=rerank,                        # Apply the decay ranker
    consistency_level="Strong"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f, 0.4f}))) // Replace with your query vector
        .annsField("dense")
        .limit(10)
        .outputFields(Arrays.asList("name", "cuisine", "distance"))
        .functionScore(FunctionScore.builder()
                .addFunction(rerank)
                .build())
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build();
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

results, err := client.Search(ctx, milvusclient.NewSearchOption(
    "restaurant_db", 10,
    []entity.Vector{entity.FloatVector{0.1, 0.2, 0.3, 0.4}}). // Replace with your query vector
    WithANNSField("dense").
    WithOutputFields("name", "cuisine", "distance").
    WithFunctionReranker(rerank).
    WithConsistencyLevel(entity.ClStrong))
if err != nil {
    fmt.Println(err.Error())
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let search_req = SearchRequest::builder()
    .collection_name("restaurant_db")
    .vector_field("dense")
    .vectors(SearchVectors::Float(vec![vec![0.1f32, 0.2, 0.3, 0.4]]))
    .limit(10)
    .output_fields(vec!["name", "cuisine", "distance"])
    .rerank(FunctionScore::new().add_function(rerank))
    .consistency_level(ConsistencyLevel::Strong)
    .build()?;

let res = client.search(search_req).await?;
println!("{:?}", res.results());
```

</TabItem>

<TabItem value='c++'>

```c++
auto function_score = std::make_shared<milvus::FunctionScore>();
function_score->AddFunction(rerank);

auto request = milvus::SearchRequest()
                   .WithCollectionName(collection_name)
                   .WithAnnsField("dense")
                   .WithRerank(function_score)
                   .WithLimit(10)
                   .AddOutputField("name")
                   .AddOutputField("cuisine")
                   .AddOutputField("distance")
                   .AddFloatVector(your_query_vector)
                   .WithConsistencyLevel(milvus::ConsistencyLevel::STRONG);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const result = await milvusClient.search({
  collection_name: collection_name,
  data: [your_query_vector], // Replace with your query vector
  anns_field: "dense",
  limit: 10,
  output_fields: ["name", "cuisine", "distance"],
  rerank: rerank,
  consistency_level: "Strong",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

MilvusClientV2 client = new(new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
});

float[] queryVector = [0.1f, 0.2f, 0.3f, 0.4f]; // Replace with your query vector

// Apply decay ranker to restaurant vector search
SearchResp resp = await client.SearchAsync(new SearchReq
{
    CollectionName = "restaurant_db",
    VectorFieldName = "dense",
    Vectors = [queryVector],
    Limit = 10,
    Parameters = new SearchParameters
    {
        OutputFields = { "name", "cuisine", "distance" },
        FunctionScoreReranker = rerank,
        ConsistencyLevel = ConsistencyLevel.Strong
    }
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
-d '{
    "collectionName": "restaurant_db",
    "data": [[0.1, 0.2, 0.3, 0.4]],
    "annsField": "dense",
    "limit": 10,
    "outputFields": ["name", "cuisine", "distance"],
    "functionScore": {
        "functions": [
            {
                "name": "restaurant_distance_decay",
                "type": "Rerank",
                "inputFieldNames": ["distance"],
                "params": {"reranker": "decay", "function": "gauss", "origin": 0, "offset": 300, "decay": 0.5, "scale": 2000}
            }
        ]
    },
    "consistencyLevel": "Strong"
}'
```

</TabItem>

</Tabs>
