---
title: "Boost Ranker | BYOC"
slug: /boost-ranker
sidebar_label: "Boost Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル距離に基づく意味的類似度だけに依存するのではなく、Boost Ranker を使うことで検索結果に意図した影響を与えられます。メタデータフィルタリングを用いて検索結果を素早く調整したい場合に最適です。 | BYOC"
type: origin
token: Qa60w2vDuiqNk0kclKLcZ0uQnkg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Boost Ranker

ベクトル距離に基づく意味的類似度だけに依存するのではなく、Boost Ranker を使うことで検索結果に意図した影響を与えられます。メタデータフィルタリングを用いて検索結果を素早く調整したい場合に最適です。

検索リクエストに Boost Ranker 関数が含まれる場合、Milvus は関数内の任意のフィルタリング条件を使用して検索結果の候補から一致するものを特定し、指定された重みを適用してそれらのスコアをブーストすることで、最終結果における一致したエンティティの順位を上げ下げします。 

## Boost Ranker の使用場面\{#when-to-use-boost-ranker}

クロスエンコーダーモデルや融合アルゴリズムに依存する他のランカーとは異なり、Boost Ranker はメタデータに基づく任意のルールをランキングプロセスに直接組み込むため、以下のシナリオにより適しています。

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>Boost Ranker が効果的な理由</p></th>
   </tr>
   <tr>
     <td><p>ビジネス主導のコンテンツ優先順位付け</p></td>
     <td><ul><li><p>Eコマースの検索結果でプレミアム商品を強調表示する</p></li><li><p>ユーザーエンゲージメント指標（閲覧数、いいね、シェアなど）が高いコンテンツの可視性を高める</p></li><li><p>時間的制約のある検索アプリケーションで最新のコンテンツを上位に表示する</p></li><li><p>確認済みまたは信頼できるソースからのコンテンツを優先する</p></li><li><p>完全一致フレーズや関連性の高いキーワードに一致する結果をブーストする</p></li></ul></td>
     <td rowspan="2"><p>インデックスの再構築やベクトル埋め込みモデルの変更といった時間のかかる操作を必要とせず、リアルタイムで任意のメタデータフィルターを適用することで、検索結果内の特定のアイテムを即座に昇格または降格できます。この仕組みにより、変化するビジネス要件に容易に適応できる柔軟で動的な検索ランキングを実現できます。</p></td>
   </tr>
   <tr>
     <td><p>戦略的なコンテンツの降格</p></td>
     <td><ul><li><p>在庫が少ないアイテムを完全に削除せずに目立たなくする</p></li><li><p>検閲せずに、問題となる可能性のある用語を含むコンテンツのランクを下げる</p></li><li><p>技術検索で古いドキュメントにアクセスできる状態を維持しつつ、そのランクを下げる</p></li><li><p>マーケットプレイス検索で競合製品の可視性を控えめに下げる</p></li><li><p>品質が低いことを示す兆候（書式の問題、短い長さなど）があるコンテンツの関連性を下げる</p></li></ul></td>
   </tr>
</table>

複数の Boost Ranker を組み合わせて、より動的で堅牢な重みベースのランキング戦略を実装することもできます。

## Boost Ranker の仕組み\{#mechanism-of-boost-ranker}

次の図は、Boost Ranker の主なワークフローを示しています。

![Hq0awfjC7h0Ty3bvsUEcasOHncb](https://zdoc-images.s3.us-west-2.amazonaws.com/Hq0awfjC7h0Ty3bvsUEcasOHncb.png)

データを挿入すると、Zilliz Cloud はそれをセグメント全体に分散します。検索時には、各セグメントが候補セットを返し、Zilliz Cloud がすべてのセグメントの候補をランク付けして最終結果を生成します。検索リクエストに Boost Ranker が含まれる場合、Zilliz Cloud は潜在的な精度低下を防ぎ再現率を向上させるため、各セグメントの候補結果に Boost Ranker を適用します。 

結果を確定する前に、Milvus は Boost Ranker を使用してこれらの候補を次のように処理します。

1. Boost Ranker で指定された任意のフィルタリング式を適用し、その式に一致するエンティティを特定します。

1. Boost Ranker で指定された重みを適用し、特定されたエンティティのスコアをブーストします。

<Admonition type="info" title="Notes">

Boost Ranker はマルチベクトルハイブリッド検索では使用できません。

</Admonition>

## Boost Ranker の例\{#examples-of-boost-ranker}

以下の例では、最も関連性の高い上位 5 つのエンティティを返し、abstract ドキュメントタイプを持つエンティティのスコアに重みを加える単一ベクトル検索における Boost Ranker の使用方法を示します。

1. **セグメント内の検索結果候補を収集します。** 

    以下の表では、Milvus がエンティティを 2 つのセグメント（**0001** と **0002**）に分散し、各セグメントが 5 つの候補を返すことを想定しています。

    | ID | DocType | スコア | ランク | セグメント |
    | --- | --- | --- | --- | --- |
    | 117 | abstract | 0.344 | 1 | 0001 |
    | 89 | abstract | 0.456 | 2 | 0001 |
    | 257 | body | 0.578 | 3 | 0001 |
    | 358 | title | 0.788 | 4 | 0001 |
    | 168 | body | 0.899 | 5 | 0001 |
    | 46 | body | 0.189 | 1 | 0002 |
    | 48 | body | 0265 | 2 | 0002 |
    | 561 | abstract | 0.366 | 3 | 0002 |
    | 344 | abstract | 0.444 | 4 | 0002 |
    | 276 | abstract | 0.845 | 5 | 0002 |

1. **Boost Ranker で指定されたフィルタリング式を適用します**（`doctype='abstract'`）。

    以下の表の `DocType` フィールドに示されるように、Milvus は `doctype` が `abstract` に設定されているすべてのエンティティを以降の処理対象としてマークします。

    | ID | DocType | スコア | ランク | セグメント |
    | --- | --- | --- | --- | --- |
    | **117** | **abstract** | **0.344** | **1** | **0001** |
    | **89** | **abstract** | **0.456** | **2** | **0001** |
    | 257 | body | 0.578 | 3 | 0001 |
    | 358 | title | 0.788 | 4 | 0001 |
    | 168 | body | 0.899 | 5 | 0001 |
    | 46 | body | 0.189 | 1 | 0002 |
    | 48 | body | 0265 | 2 | 0002 |
    | **561** | **abstract** | **0.366** | **3** | **0002** |
    | **344** | **abstract** | **0.444** | **4** | **0002** |
    | **276** | **abstract** | **0.845** | **5** | **0002** |

1. **Boost Ranker で指定された重みを適用します**（`weight=0.5`）。

    前のステップで特定されたすべてのエンティティには、Boost Ranker で指定された重みが乗算され、その結果、ランクが変化します。 

    | ID | DocType | スコア | 重み付きスコア<br/>（= スコア × 重み） | ランク | セグメント |
    | --- | --- | --- | --- | --- | --- |
    | **117** | **abstract** | **0.344** | **0.172** | **1** | **0001** |
    | **89** | **abstract** | **0.456** | **0.228** | **2** | **0001** |
    | 257 | body | 0.578 | 0.578 | 3 | 0001 |
    | 358 | title | 0.788 | 0.788 | 4 | 0001 |
    | 168 | body | 0.899 | 0.899 | 5 | 0001 |
    | **561** | **abstract** | **0.366** | **0.183** | **1** | **0002** |
    | 46 | body | 0.189 | 0.189 | 2 | 0002 |
    | **344** | **abstract** | **0.444** | **0.222** | **3** | **0002** |
    | 48 | body | 0.265 | 0.265 | 4 | 0002 |
    | **276** | **abstract** | **0.845** | **0.423** | **5** | **0002** |

    <Admonition type="info" title="Notes">

    重みは自由に選択できる浮動小数点数である必要があります。上記の例のようにスコアが小さいほど関連性が高い場合は、**1** より小さい重みを使用します。それ以外の場合は、**1** より大きい重みを使用します。

    </Admonition>

1. **重み付きスコアに基づいてすべてのセグメントの候補を集約し、最終結果を確定します。**

    | ID | DocType | スコア | 重み付きスコア | ランク | セグメント |
    | --- | --- | --- | --- | --- | --- |
    | **117** | **abstract** | **0.344** | **0.172** | **1** | **0001** |
    | **561** | **abstract** | **0.366** | **0.183** | **2** | **0002** |
    | 46 | body | 0.189 | 0.189 | 3 | 0002 |
    | **344** | **abstract** | **0.444** | **0.222** | **4** | **0002** |
    | **89** | **abstract** | **0.456** | **0.228** | **5** | **0001** |

## Boost Ranker の使用方法\{#usage-of-boost-ranker}

このセクションでは、Boost Ranker を使用して単一ベクトル検索の結果に影響を与える方法の例を示します。

### Boost Ranker の作成\{#create-a-boost-ranker}

検索リクエストの reranker として Boost Ranker を渡す前に、以下のように Boost Ranker を再ランキング関数として適切に定義しておく必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

rerank = Function(
    name="boost",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "filter": "doctype == 'abstract'",
        "random_score": { 
            "seed": 126,
            "field": "id"
        },
        "weight": 0.5
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.BoostRanker;

BoostRanker rerank = BoostRanker.builder()
        .name("boost")
        .filter("doctype == \"abstract\"")
        .weight(0.5f)
        .randomScoreField("id")
        .randomScoreSeed(126L)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

rerank := entity.NewFunction().
    WithName("boost").
    WithType(entity.FunctionTypeRerank).
    WithParam("reranker", "boost").
    WithParam("filter", "doctype == 'abstract'").
    WithParam("random_score", "{\"seed\": 126, \"field\": \"id\"}").
    WithParam("weight", "0.5")
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let rerank = Function::new()
    .name("boost")
    .function_type(FunctionType::Rerank)
    .param("reranker", "boost")
    .param("filter", "doctype == 'abstract'")
    .param("random_score", "{\"seed\": 126, \"field\": \"id\"}")
    .param("weight", "0.5");
```

</TabItem>

<TabItem value='c++'>

```c++
auto rerank = std::make_shared<milvus::BoostRerank>("boost");
rerank->SetFilter("doctype == 'abstract'");
rerank->SetWeight(0.5);
// Note: SetRandomScoreField()/SetRandomScoreSeed() are not usable as of
// milvus-sdk-cpp v3.0.3 - the SDK sends the seed as a string, which the
// server rejects (a numeric seed is required).
```

</TabItem>

<TabItem value='javascript'>

```javascript
import {FunctionType} from '@zilliz/milvus2-sdk-node';

const rerank = {
  name: "boost",
  input_field_names: [],
  type: FunctionType.RERANK,
  params: {
    reranker: "boost",
    filter: "doctype == 'abstract'",
    random_score: {
      seed: 126,
      field: "id",
    },
    weight: 0.5,
  },
};
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export RANKER='{
    "name": "boost",
    "type": "Rerank",
    "inputFieldNames": [],
    "outputFieldNames": [],
    "params": {
        "reranker": "boost",
        "filter": "doctype == '\''abstract'\''",
        "random_score": {"seed": 126, "field": "id"},
        "weight": 0.5
    }
}' 
```

</TabItem>
</Tabs>

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須?</p></th>
     <th><p>説明</p></th>
     <th><p>値/Example</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>この Function の一意の識別子</p></td>
     <td><p><code>&quot;boost&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>関数を適用するベクトルフィールドのリスト（Boost Ranker の場合は空にする必要があります）</p></td>
     <td><p><code>[]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す Function のタイプ。再ランキング戦略を指定するには <code>RERANK</code> を使用します。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>reranker のタイプを指定します。</p><p>Boost Ranker を使用するには <code>boost</code> に設定する必要があります。</p></td>
     <td><p><code>&quot;boost&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.weight</code></p></td>
     <td><p>はい</p></td>
     <td><p>生の検索結果において、一致するエンティティのスコアに乗算される重みを指定します。</p><p>値は浮動小数点数である必要があります。</p><ul><li><p>一致するエンティティの重要性を高めるには、スコアを大きくする値を設定します。</p></li><li><p>一致するエンティティの優先度を下げるには、スコアを小さくする値を指定します。</p></li></ul></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.filter</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>検索結果のエンティティの中から一致するものを特定するために使用するフィルター式を指定します。<a href="./filtering-overview">フィルタリングの説明</a> に記載されている任意の有効な基本フィルター式を使用できます。</p><p><strong>注</strong>: 使用できるのは <code>==</code>、<code>&gt;</code>、<code>&lt;</code> などの基本演算子だけです。<code>text_match</code> や <code>phrase_match</code> などの高度な演算子を使用すると、検索パフォーマンスが低下します。</p></td>
     <td><p><code>&quot;doctype == 'abstract'&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.random_score</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>0</code> から <code>1</code> の範囲の値をランダムに生成する関数を指定します。以下の 2 つのオプション引数があります。</p><ul><li><p><code>seed</code>（number）疑似乱数生成器（PRNG）を開始するために使用される初期値を指定します。</p></li><li><p><code>field</code>（string）乱数の生成時にランダム因子として使用されるフィールド名を指定します。一意の値を持つフィールドであれば問題ありません。</p></li></ul><p>同じシードとフィールド値を使用して生成ごとの一貫性を確保するため、<code>seed</code> と <code>field</code> の両方を設定することを推奨します。</p></td>
     <td><p><code>\{&quot;seed&quot;: 126, &quot;field&quot;: &quot;id&quot;\}</code></p></td>
   </tr>
</table>

### 単一の Boost Ranker を使用した検索\{#search-with-a-single-boost-ranker}

Boost Ranker 関数の準備ができたら、検索リクエストでそれを参照できます。以下の例では、**id**、**vector**、**doctype** の各フィールド（**vector** はベクトルフィールド）を持つコレクションをすでに作成していることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

# Connect to the Milvus server
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Assume you have a collection set up

# Conduct a similarity search using the created ranker
client.search(
    collection_name="my_collection",
    data=[[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
    anns_field="vector",
    params={},
    output_fields=["doctype"],
    ranker=rerank
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .topK(10)
        .functionScore(FunctionScore.builder()
                .addFunction(rerank)
                .build())
        .build());
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

resultSet, err := client.Search(ctx, milvusclient.NewSearchOption("my_collection", 10, []entity.Vector{
    entity.FloatVector{-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911},
}).
    WithANNSField("vector").
    WithOutputFields("doctype").
    WithFunctionScore(entity.NewFunctionScore().AddFunction(rerank)))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(resultSet)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN")).await?;

let response = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]]))
            .output_fields(["doctype"])
            .limit(10)
            .rerank(FunctionScore::new().add_function(rerank.clone()))
            .build()?,
    )
    .await?;
println!("{:?}", response);
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>
#include <vector>

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT", "YOUR_CLUSTER_TOKEN"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto function_score = std::make_shared<milvus::FunctionScore>();
function_score->AddFunction(rerank);

std::vector<float> query_vector = {-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("vector")
                   .WithLimit(10)
                   .WithRerank(function_score)
                   .AddOutputField("doctype")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

// Connect to the Milvus server
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT',
  token: 'YOUR_CLUSTER_TOKEN'
});

// Assume you have a collection set up

// Conduct a similarity search
const searchResults = await client.search({
  collection_name: 'my_collection',
  data: [-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911],
  anns_field: 'vector',
  output_fields: ['doctype'],
  limit: 10,
  rerank: rerank,
});

console.log('Search results:', searchResults);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export MILVUS_TOKEN="YOUR_CLUSTER_TOKEN"
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -H "Authorization: Bearer ${MILVUS_TOKEN}" \
  -d '{
    "collectionName": "my_collection",
    "data": [[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
    "annsField": "vector",
    "limit": 10,
    "outputFields": ["doctype"],
    "functionScore": {
        "functions": [
            {
                "name": "boost",
                "type": "Rerank",
                "inputFieldNames": [],
                "outputFieldNames": [],
                "params": {
                    "reranker": "boost",
                    "filter": "doctype == '\''abstract'\''",
                    "random_score": {"seed": 126, "field": "id"},
                    "weight": 0.5
                }
            }
        ]
    }
  }' 
```

</TabItem>
</Tabs>

### 複数の Boost Ranker を使用した検索\{#search-with-multiple-boost-rankers}

1 回の検索で複数の Boost Ranker を組み合わせて、検索結果に影響を与えることができます。そのためには、複数の Boost Ranker を作成し、それらを **FunctionScore** インスタンスで参照し、その **FunctionScore** インスタンスを検索リクエストの ranker として使用します。

以下の例では、**0.8** から **1.2** の間の重みを適用して、特定されたすべてのエンティティのスコアを変更する方法を示します。 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, Function, FunctionType, FunctionScore

# Create a Boost Ranker with a fixed weight
fix_weight_ranker = Function(
    name="boost",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "weight": 0.8
    }
)

# Create a Boost Ranker with a randomly generated weight between 0 and 0.4
random_weight_ranker = Function(
    name="boost",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "boost",
        "random_score": {
            "seed": 126,
        },
        "weight": 0.4
    }
)

# Create a Function Score
ranker = FunctionScore(
    functions=[
        fix_weight_ranker, 
        random_weight_ranker
    ],
    params={
        "boost_mode": "Multiply",
        "function_mode": "Sum"
    }
)

# Conduct a similarity search using the created Function Score
client.search(
    collection_name="my_collection",
    data=[[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
    anns_field="vector",
    params={},
    output_fields=["doctype"],
    ranker=ranker
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

CreateCollectionReq.Function fixWeightRanker = CreateCollectionReq.Function.builder()
        .functionType(FunctionType.RERANK)
        .name("boost")
        .param("reranker", "boost")
        .param("weight", "0.8")
        .build();

CreateCollectionReq.Function randomWeightRanker = CreateCollectionReq.Function.builder()
        .functionType(FunctionType.RERANK)
        .name("boost")
        .param("reranker", "boost")
        .param("weight", "0.4")
        .param("random_score", "{\"seed\": 126}")
        .build();

Map<String, String> params = new HashMap<>();
params.put("boost_mode", "Multiply");
params.put("function_mode", "Sum");

FunctionScore ranker = FunctionScore.builder()
        .addFunction(fixWeightRanker)
        .addFunction(randomWeightRanker)
        .params(params)
        .build();

SearchResp searchResp = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954382375778f, 0.4479436794798608f, -0.17493894838751745f, -0.4248030059917294f, -0.8648452746018911f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .topK(10)
        .functionScore(ranker)
        .build());
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

fixWeightRanker := entity.NewFunction().
    WithName("boost").
    WithType(entity.FunctionTypeRerank).
    WithParam("reranker", "boost").
    WithParam("weight", "0.8")

randomWeightRanker := entity.NewFunction().
    WithName("boost").
    WithType(entity.FunctionTypeRerank).
    WithParam("reranker", "boost").
    WithParam("random_score", "{\"seed\": 126}").
    WithParam("weight", "0.4")

ranker := entity.NewFunctionScore().
    AddFunction(fixWeightRanker).
    AddFunction(randomWeightRanker).
    WithParam("boost_mode", "Multiply").
    WithParam("function_mode", "Sum")

resultSet, err := client.Search(ctx, milvusclient.NewSearchOption("my_collection", 10, []entity.Vector{entity.FloatVector{-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911}}).
    WithANNSField("vector").
    WithOutputFields("doctype").
    WithFunctionScore(ranker))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
fmt.Println(resultSet)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN")).await?;

let fix_weight_ranker = Function::new()
    .name("boost")
    .function_type(FunctionType::Rerank)
    .param("reranker", "boost")
    .param("weight", "0.8");

let random_weight_ranker = Function::new()
    .name("boost")
    .function_type(FunctionType::Rerank)
    .param("reranker", "boost")
    .param("random_score", "{\"seed\": 126}")
    .param("weight", "0.4");

let function_score = FunctionScore::new()
    .add_function(fix_weight_ranker)
    .add_function(random_weight_ranker)
    .params(HashMap::from([
        ("boost_mode".to_string(), "Multiply".into()),
        ("function_mode".to_string(), "Sum".into()),
    ]));

let response = client
    .search(
        SearchRequest::builder()
            .collection_name("my_collection")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]]))
            .output_fields(["doctype"])
            .limit(10)
            .rerank(function_score)
            .build()?,
    )
    .await?;
println!("{:?}", response);
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <vector>

auto fix_weight_ranker = std::make_shared<milvus::BoostRerank>("boost");
fix_weight_ranker->SetWeight(0.8);

auto random_weight_ranker = std::make_shared<milvus::BoostRerank>("boost");
random_weight_ranker->SetWeight(0.4);
// Note: SetRandomScoreSeed() is not usable as of milvus-sdk-cpp v3.0.3 —
// the SDK sends the seed as a string, which the server rejects.

auto function_score = std::make_shared<milvus::FunctionScore>();
function_score->AddFunction(fix_weight_ranker);
function_score->AddFunction(random_weight_ranker);

std::vector<float> query_vector = {-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911};
auto request = milvus::SearchRequest()
                   .WithCollectionName("my_collection")
                   .WithAnnsField("vector")
                   .WithLimit(10)
                   .WithRerank(function_score)
                   .AddOutputField("doctype")
                   .AddFloatVector(query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import {FunctionType} from '@zilliz/milvus2-sdk-node';

const fix_weight_ranker = {
  name: "boost",
  input_field_names: [],
  type: FunctionType.RERANK,
  params: {
    reranker: "boost",
    weight: 0.8,
  },
};

const random_weight_ranker = {
  name: "boost",
  input_field_names: [],
  type: FunctionType.RERANK,
  params: {
    reranker: "boost",
    random_score: {
      seed: 126,
    },
    weight: 0.4,
  },
};

const ranker = {
  functions: [fix_weight_ranker, random_weight_ranker],
  params: {
    boost_mode: "Multiply",
    function_mode: "Sum",
  },
};

await client.search({
  collection_name: "my_collection",
  data: [[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
  anns_field: "vector",
  params: {},
  output_fields: ["doctype"],
  limit: 10,
  rerank: ranker
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export MILVUS_HOST="YOUR_CLUSTER_ENDPOINT"
export MILVUS_TOKEN="YOUR_CLUSTER_TOKEN"
curl -X POST "http://${MILVUS_HOST}/v2/vectordb/entities/search" \
  -H "Content-Type: application/json" \
  -H "Request-Timeout: 10" \
  -H "Authorization: Bearer ${MILVUS_TOKEN}" \
  -d '{
    "collectionName": "my_collection",
    "data": [[-0.619954382375778, 0.4479436794798608, -0.17493894838751745, -0.4248030059917294, -0.8648452746018911]],
    "annsField": "vector",
    "limit": 10,
    "outputFields": ["doctype"],
    "functionScore": {
        "functions": [
            {
                "name": "boost",
                "type": "Rerank",
                "inputFieldNames": [],
                "outputFieldNames": [],
                "params": {
                    "reranker": "boost",
                    "weight": 0.8
                }
            },
            {
                "name": "boost",
                "type": "Rerank",
                "inputFieldNames": [],
                "outputFieldNames": [],
                "params": {
                    "reranker": "boost",
                    "random_score": {"seed": 126},
                    "weight": 0.4
                }
            }
        ],
        "params": {
            "boost_mode": "Multiply",
            "function_mode": "Sum"
        }
    }
  }' 
```

</TabItem>
</Tabs>

具体的には、2 つの Boost Ranker があります。一方は検出されたすべてのエンティティに固定の重みを適用し、もう一方はそれらにランダムな重みを割り当てます。次に、これら 2 つの ranker を **FunctionScore** で参照します。この **FunctionScore** では、重みが検出されたエンティティのスコアにどのように影響するかも定義します。 

以下の表に、**FunctionScore** インスタンスの作成に必要なパラメーターを示します。

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須?</p></th>
     <th><p>説明</p></th>
     <th><p>値/Example</p></th>
   </tr>
   <tr>
     <td><p><code>functions</code></p></td>
     <td><p>はい</p></td>
     <td><p>対象のランカーの名前をリストで指定します。</p></td>
     <td><p><code>[&quot;fix_weight_ranker&quot;, &quot;random_weight_ranker&quot;]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.boost_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定した重みが、一致するエンティティのスコアにどのように影響するかを指定します。</p><p>使用可能な値は次のとおりです。</p><ul><li><p><code>Multiply</code></p><p>重み付けされた値が、一致するエンティティの元のスコアに指定された重みを乗算した値と等しいことを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>重み付けされた値が、一致するエンティティの元のスコアと指定された重みの合計と等しいことを示します</p></li></ul></td>
     <td><p><code>&quot;Sum&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>各 Boost Ranker からの重み付けされた値がどのように処理されるかを指定します。</p><p>使用可能な値は次のとおりです。</p><ul><li><p><code>Multiply</code></p><p>一致するエンティティの最終スコアが、すべての Boost Ranker からの重み付けされた値の積と等しいことを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>一致するエンティティの最終スコアが、すべての Boost Ranker からの重み付けされた値の合計と等しいことを示します。</p></li></ul></td>
     <td><p><code>&quot;Sum&quot;</code></p></td>
   </tr>
</table>

