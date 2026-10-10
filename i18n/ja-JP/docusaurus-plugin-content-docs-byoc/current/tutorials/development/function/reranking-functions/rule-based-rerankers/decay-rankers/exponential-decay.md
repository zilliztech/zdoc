---
title: "指数関数的減衰 | BYOC"
slug: /exponential-decay
sidebar_label: "指数関数的減衰"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "指数関数的減衰は、検索結果において急激な初期低下とその後の長い裾を生み出します。関連性が最初は急速に低下しても、一部の記事が時間の経過とともに重要性を保ち続ける速報ニュースサイクルのように、指数関数的減衰は、理想的な範囲をわずかに超えたアイテムに鋭いペナルティを適用しながら、離れたアイテムも引き続き発見できるようにします。このアプローチは、近接性や新しさを強く優先したい一方で、より離れた選択肢を完全に排除したくない場合に最適です。 | BYOC"
type: origin
token: FbVmwmuaei9WkIkIWJmcs3ManEd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 指数関数的減衰

指数関数的減衰は、検索結果において急激な初期低下とその後の長い裾を生み出します。関連性が最初は急速に低下しても、一部の記事が時間の経過とともに重要性を保ち続ける速報ニュースサイクルのように、指数関数的減衰は、理想的な範囲をわずかに超えたアイテムに鋭いペナルティを適用しながら、離れたアイテムも引き続き発見できるようにします。このアプローチは、近接性や新しさを強く優先したい一方で、より離れた選択肢を完全に排除したくない場合に最適です。

他の減衰関数とは次の点が異なります。

- ガウス減衰は、より緩やかなベル型の低下を生み出します。

- 線形減衰は、ちょうどゼロに達するまで一定の割合で減少します。

指数関数的減衰は、ペナルティを独自に「前方へ集中」させ、関連性の低下の大部分を早い段階で適用しながら、最小限ではあるもののゼロではない関連性の長い裾を維持します。

## 指数関数的減衰を使用する場合\{#when-to-use-exponential-decay}

指数関数的減衰は、次の場合に特に効果を発揮します。

| ユースケース | 例 | 指数関数的減衰が適している理由 |
| --- | --- | --- |
| ニュースフィード | 速報ニュースポータル | 古いニュースの関連性をすばやく下げつつ、数日前の重要な記事も引き続き表示します |
| ソーシャルメディアのタイムライン | アクティビティフィード、ステータス更新 | 新しいコンテンツを強調しつつ、バイラルになった古いコンテンツも浮上させます |
| 通知システム | アラートの優先順位付け | 最近のアラートに緊急性を持たせつつ、重要なアラートの可視性を維持します |
| フラッシュセール | 期間限定オファー | 締め切りが近づくにつれて可視性を急速に下げます |

次のような場合には、指数関数的減衰を選択します。

- ユーザーが、ごく最近のアイテムや近くのアイテムが結果を強く支配することを期待している場合

- 古いアイテムやより離れたアイテムでも、特に高い関連性があれば引き続き発見できるようにしたい場合

- 関連性の低下を前方に集中させたい場合（最初はより急峻で、その後はより緩やか）

## 急激な低下の原則\{#sharp-drop-off-principle}

指数関数的減衰は、最初は急速に低下し、その後徐々に平坦になって、ゼロに近づくものの決して到達しない長い裾へと変化する曲線を生み出します。この数学的パターンは、放射性崩壊、人口減少、時間の経過に伴う情報の関連性など、自然界の現象に頻繁に見られます。

<Admonition type="info" title="Notes">

すべての時間パラメーター（`origin`、`offset`、`scale`）は、コレクションのデータと同じ単位を使用する必要があります。コレクションが異なる単位（ミリ秒、マイクロ秒）でタイムスタンプを保存している場合は、それに合わせてすべてのパラメーターを調整してください。

</Admonition>

![YaRsbolv9oqomcxrFe5cXBa4nNg](https://zdoc-images.s3.us-west-2.amazonaws.com/yarsbolv9oqomcxrfe5cxba4nng.png "YaRsbolv9oqomcxrFe5cXBa4nNg")

上のグラフは、デジタルニュースプラットフォームにおけるニュース記事のランキングに指数関数的減衰がどのように影響するかを示しています。

- `origin`（現在時刻）：関連性が最大（1.0）になる現在の瞬間です。

- `offset`（3 時間）：「速報ニュースウィンドウ」で、過去 3 時間以内に公開されたすべての記事が完全な関連性スコア（1.0）を維持し、ごく最近のニュースがわずかな時間差によって不必要にペナルティを受けないようにします。

- `decay`（0.5）：スケール距離におけるスコアです。このパラメーターは、時間の経過とともにスコアがどれだけ劇的に減少するかを制御します。

- `scale`（24 時間）：関連性が decay 値まで低下する時間期間です。ちょうど 24 時間経過したニュース記事の関連性スコアは半分（0.5）になります。

曲線からわかるように、24 時間より古いニュース記事は関連性が低下し続けますが、完全にゼロに達することはありません。数日前の記事であっても最小限の関連性は保持されるため、重要ではあるものの古いニュースも（順位は下がるものの）フィードに引き続き表示されます。

この動作は、ニュースの関連性が一般的にどのように機能するかを模倣しています。つまり、ごく最近の記事が強く優勢になる一方で、ユーザーの関心に特に高い関連性があれば、重要な古い記事も引き続き浮上することができます。

## 計算式\{#formula}

指数関数的減衰スコアを計算する数式は次のとおりです。

$$
S(doc) = \exp\left( \lambda \cdot \max\left(0, \left|fieldvalue_{doc} - origin\right| - offset \right) \right)
$$

ここで、

$$
\lambda = \frac{\ln(decay)}{scale}
$$

これを平易な言葉で説明すると、次のようになります。

1. フィールド値が origin からどれだけ離れているかを計算します：$|fieldvalue_{doc} - origin|$。

1. offset（存在する場合）を減算しますが、ゼロを下回らないようにします：$\max(0, distance - offset)$。

1. scale と decay パラメーターから計算される $\lambda$ を乗算します。

1. 指数を取ります。これにより、0 から 1 の間の値が得られます：$\exp(\lambda \cdot value)$。

$\lambda$ の計算では、scale と decay パラメーターを指数関数のレートパラメーターに変換します。$\lambda$ がより負になるほど、初期の低下が急峻になります。

## 指数関数的減衰を使用する\{#use-exponential-decay}

指数関数的減衰は、Zilliz Cloud の標準ベクトル検索とハイブリッド検索の両方の操作に適用できます。以下に、この機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" title="Notes">

減衰関数を使用する前に、まず減衰計算に使用する適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、データ挿入を含む完全な動作例については、[Decay Ranker Tutorial](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### 減衰ランカーを作成する\{#create-a-decay-ranker}

コレクションに数値フィールド（この例では `publish_time`）を設定したら、指数関数的減衰ランカーを作成します：

<Admonition type="info" title="Notes">

**時間単位の整合性**：時間ベースの減衰を使用する場合は、`origin`、`scale`、`offset` パラメーターがコレクションデータと同じ時間単位を使用していることを確認してください。コレクションがタイムスタンプを秒で保存している場合は、すべてのパラメーターに秒を使用します。ミリ秒の場合も同様に、すべてのパラメーターにミリ秒を使用します。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import datetime

# Create an exponential decay ranker for news recency
# Note: All time parameters must use the same unit as your collection data
rerank = Function(
    name="news_recency",                  # Function identifier
    input_field_names=["publish_time"],   # Numeric field to use
    function_type=FunctionType.RERANK,    # Function type. Must be RERANK
    params={
        "reranker": "decay",              # Specify decay reranker
        "function": "exp",                # Choose exponential decay
        "origin": int(datetime.datetime.now().timestamp()),  # Current time (seconds, matching collection data)
        "offset": 3 * 60 * 60,            # 3 hour breaking news window (seconds)
        "decay": 0.5,                     # Half score at scale distance
        "scale": 24 * 60 * 60             # 24 hours (in seconds, matching collection data)
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Collections;
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker rerank = DecayRanker.builder()
        .name("news_recency")
        .inputFieldNames(Collections.singletonList("publish_time"))
        .function("exp")
        .origin(System.currentTimeMillis() / 1000)  // Current time (seconds, matching collection data)
        .offset(3 * 60 * 60)            // 3 hour breaking news window (seconds)
        .decay(0.5)                     // Half score at scale distance
        .scale(24 * 60 * 60)            // 24 hours (in seconds, matching collection data)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import (
    "time"

    "github.com/milvus-io/milvus/client/v3/entity"
)

// Create an exponential decay ranker for news recency
// Note: All time parameters must use the same unit as your collection data
rerank := entity.NewFunction().
    WithName("news_recency").
    WithInputFields("publish_time").
    WithType(entity.FunctionTypeRerank).
    WithParam("reranker", "decay").
    WithParam("function", "exp").
    WithParam("origin", time.Now().Unix()).
    WithParam("offset", 3*60*60).
    WithParam("decay", 0.5).
    WithParam("scale", 24*60*60)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Create an exponential decay ranker for news recency
// Note: All time parameters must use the same unit as your collection data
let origin = std::time::SystemTime::now()
    .duration_since(std::time::UNIX_EPOCH)
    .unwrap()
    .as_secs();
let rerank = {
    let mut rerank = DecayRerank::new()
        .name("news_recency")
        .decay_function("exp")
        .origin(origin)
        .offset(3 * 60 * 60)
        .decay(0.5)
        .scale(24 * 60 * 60);
    rerank.function(rerank.get_function().clone().input_fields(["publish_time"]))
};
```

</TabItem>

<TabItem value='c++'>

```c++
#include <ctime>
#include "milvus/MilvusClientV2.h"

auto rerank = std::make_shared<milvus::DecayRerank>("news_recency");
rerank->AddInputFieldName("publish_time");
rerank->SetFunction("exp");
rerank->SetOrigin(std::time(nullptr));  // Current time (seconds, matching collection data)
rerank->SetScale(24 * 60 * 60);
rerank->SetOffset(3 * 60 * 60);
rerank->SetDecay(0.5);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "news_recency",
  input_field_names: ["publish_time"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "exp",
    origin: Math.floor(Date.now() / 1000), // Current time (seconds)
    offset: 3 * 60 * 60,                   // 3 hour breaking news window (seconds)
    decay: 0.5,                            // Half score at scale distance
    scale: 24 * 60 * 60,                   // 24 hours (seconds)
  },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not expose a standalone "create a decay ranker"
# endpoint. The decay function is passed inline through the functionScore
# field of the search request (see the next section).
```

</TabItem>
</Tabs>

### 標準ベクトル検索に適用する\{#apply-to-standard-vector-search}

減衰ランカーを定義したら、検索操作中に `ranker` パラメーターへ渡すことでそれを適用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Apply decay ranker to vector search
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],             # Replace with your query vector
    anns_field="dense",                   # Vector field to search
    limit=10,                             # Number of results
    output_fields=["title", "publish_time"], # Fields to return
    #  highlight-next-line
    ranker=rerank,                        # Apply the decay ranker
    consistency_level="Strong"
)
```

</TabItem>

<TabItem value='java'>

```java
import java.util.Arrays;
import java.util.Collections;
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;

String COLLECTION_NAME = "collection_name";

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new FloatVec(Arrays.asList(0.1f, 0.2f, 0.3f, 0.4f, 0.5f, 0.6f, 0.7f, 0.8f))))  // Replace with your query vector
        .annsField("dense")                    // Vector field to search
        .limit(10)                             // Number of results
        .outputFields(Arrays.asList("title", "publish_time"))  // Fields to return
        .functionScore(FunctionScore.builder()
                .addFunction(rerank)           // Apply the decay ranker
                .build())
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build();
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

// Apply decay ranker to vector search
resultSets, err := cli.Search(ctx, milvusclient.NewSearchOption(
    "collection_name", 10, []entity.Vector{
        entity.FloatVector{0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8}, // Replace with your query vector
    }).
    WithANNSField("dense").                    // Vector field to search
    WithOutputFields("title", "publish_time"). // Fields to return
    WithFunctionReranker(rerank).              // Apply the decay ranker
    WithConsistencyLevel(entity.ClStrong))
if err != nil {
    panic(err)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

// Apply decay ranker to vector search
let response = client.search(
    SearchRequest::builder()
        .collection_name("collection_name")
        .vector_field("dense")                                // Vector field to search
        .vectors(SearchVectors::Float(vec![vec![0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]])) // Replace with your query vector
        .limit(10)                                             // Number of results
        .output_fields(["title", "publish_time"])             // Fields to return
        .rerank(FunctionScore::new().add_function(rerank))    // Apply the decay ranker
        .consistency_level(ConsistencyLevel::Strong)
        .build()?,
).await?;
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

auto function_score = std::make_shared<milvus::FunctionScore>();
function_score->AddFunction(rerank);

auto request = milvus::SearchRequest()
                   .WithCollectionName(collection_name)
                   .WithAnnsField("dense")
                   .WithRerank(function_score)
                   .WithLimit(10)
                   .AddOutputField("title")
                   .AddOutputField("publish_time")
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
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient("YOUR_CLUSTER_ENDPOINT");

const result = await milvusClient.search({
  collection_name: "collection_name",
  data: [[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]], // Replace with your query vector
  anns_field: "dense",
  limit: 10,
  output_fields: ["title", "publish_time"],
  rerank: rerank, // Apply the decay ranker
  consistency_level: "Strong",
});
```

</TabItem>

<TabItem value='bash'>

```bash
curl -s YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/search \
    -H "Authorization: Bearer YOUR_CLUSTER_TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "collectionName": "collection_name",
        "data": [[0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]],
        "annsField": "dense",
        "limit": 10,
        "outputFields": ["title", "publish_time"],
        "functionScore": {
            "functions": [{
                "name": "news_recency",
                "type": "Rerank",
                "inputFieldNames": ["publish_time"],
                "outputFieldNames": [],
                "params": {
                    "reranker": "decay",
                    "function": "exp",
                    "origin": 1790872778,
                    "offset": 10800,
                    "decay": 0.5,
                    "scale": 86400
                }
            }],
            "params": {}
        },
        "consistencyLevel": "Strong"
    }'
```

</TabItem>
</Tabs>
