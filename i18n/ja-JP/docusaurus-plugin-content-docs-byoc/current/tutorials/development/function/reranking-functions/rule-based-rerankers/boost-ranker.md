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

検索リクエストに Boost Ranker 関数が含まれる場合、Milvus は関数内の任意のフィルタリング条件に基づいて検索候補から該当するエンティティを特定し、指定された重みを適用してスコアを変更します。これにより、最終結果において該当エンティティの順位を上げたり下げたりできます。

## Boost Ranker の使用場面\{#when-to-use-boost-ranker}

クロスエンコーダーモデルや融合アルゴリズムに依存する他のランカーとは異なり、Boost Ranker はメタデータに基づく任意のルールをランキングプロセスに直接組み込めるため、以下のような場面で特に有効です。

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>Boost Ranker が効果的な理由</p></th>
   </tr>
   <tr>
     <td><p>ビジネス主導のコンテンツ優先順位付け</p></td>
     <td><ul><li><p>Eコマース検索結果でプレミアム商品を強調表示する</p></li><li><p>ユーザーエンゲージメント指標（閲覧数、いいね、シェアなど）が高いコンテンツの可視性を高める</p></li><li><p>時間的制約のある検索アプリケーションで最新コンテンツを上位に表示する</p></li><li><p>確認済みまたは信頼できるソースからのコンテンツを優先する</p></li><li><p>完全一致フレーズや関連性の高いキーワードに合致する結果をブーストする</p></li></ul></td>
     <td rowspan="2"><p>インデックスの再構築やベクトル埋め込みモデルの変更といった時間のかかる操作を必要とせず、リアルタイムで任意のメタデータフィルタを適用することで、検索結果内の特定アイテムを即座に昇格・降格できます。この仕組みにより、変化するビジネス要件にも柔軟かつ動的に対応できる検索ランキングを実現できます。</p></td>
   </tr>
   <tr>
     <td><p>戦略的なコンテンツの降格</p></td>
     <td><ul><li><p>在庫が少ないアイテムを完全に除外せずに目立たなくする</p></li><li><p>検閲を行わずに、問題となる可能性のある用語を含むコンテンツのランクを下げる</p></li><li><p>技術検索で古いドキュメントへのアクセスを維持しつつランクを下げる</p></li><li><p>マーケットプレイス検索で競合製品の可視性を控えめに下げる</p></li><li><p>品質が低いことを示すコンテンツ（書式の問題、短い長さなど）の関連性を下げる</p></li></ul></td>
   </tr>
</table>

複数の Boost Ranker を組み合わせることで、より動的で堅牢な重みベースのランキング戦略を実装することも可能です。

## Boost Ranker の仕組み\{#mechanism-of-boost-ranker}

次の図は、Boost Ranker の主なワークフローを示しています。

![Hq0awfjC7h0Ty3bvsUEcasOHncb](https://zdoc-images.s3.us-west-2.amazonaws.com/Hq0awfjC7h0Ty3bvsUEcasOHncb.png)

データを挿入すると、Zilliz Cloud はそれをセグメント全体に分散します。検索時は各セグメントが候補セットを返し、Zilliz Cloud が全セグメントの候補をランキングして最終結果を生成します。検索リクエストに Boost Ranker が含まれる場合、Zilliz Cloud は精度低下を防ぎ再現率を向上させるため、各セグメントの候補結果に対して Boost Ranker を適用します。

結果を確定する前に、Milvus は Boost Ranker を用いてこれらの候補を次のように処理します。

1. Boost Ranker で指定された任意のフィルタリング式を適用し、その式に合致するエンティティを特定します。

1. Boost Ranker で指定された重みを適用し、特定されたエンティティのスコアを調整します。

<Admonition type="info" icon="📘" title="Notes">

Boost Ranker はマルチベクトルハイブリッド検索では使用できません。

</Admonition>

## Boost Ranker の例\{#examples-of-boost-ranker}

以下の例では、最も関連性の高い上位 5 つのエンティティを返す単一ベクトル検索において、abstract ドキュメントタイプを持つエンティティのスコアに重みを加えるために Boost Ranker を使用する方法を示します。

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

    前のステップで特定されたすべてのエンティティのスコアに Boost Ranker で指定された重みが乗算され、その結果としてランクが変動します。

    | ID | DocType | スコア | 重み付きスコア<br/>(= スコア × 重み) | ランク | セグメント |
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

    <Admonition type="info" icon="📘" title="Notes">

    重みには任意の浮動小数点数を指定します。上記の例のようにスコアが小さいほど関連性が高い場合は **1** 未満の値を使用し、それ以外の場合は **1** より大きい値を使用します。

    </Admonition>

1. **重み付きスコアに基づいて全セグメントの候補を集約し、最終結果を確定します。**

    | ID | DocType | スコア | 重み付きスコア | ランク | セグメント |
    | --- | --- | --- | --- | --- | --- |
    | **117** | **abstract** | **0.344** | **0.172** | **1** | **0001** |
    | **561** | **abstract** | **0.366** | **0.183** | **2** | **0002** |
    | 46 | body | 0.189 | 0.189 | 3 | 0002 |
    | **344** | **abstract** | **0.444** | **0.222** | **4** | **0002** |
    | **89** | **abstract** | **0.456** | **0.228** | **5** | **0001** |

## Boost Ranker の使用方法\{#usage-of-boost-ranker}

このセクションでは、Boost Ranker を使用して単一ベクトル検索の結果に影響を与える方法について、具体例を通じて説明します。

### Boost Ranker の作成\{#create-a-boost-ranker}

検索リクエストの reranker として Boost Ranker を指定する前に、以下のように Boost Ranker を再ランキング関数として正しく定義しておく必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
        .weight(5.0f)
        .randomScoreField("id")
        .randomScoreSeed(126)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
// go
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
```

</TabItem>

<TabItem value='c++'>

```c++
auto rerank = std::make_shared<milvus::BoostRerank>("boost");
rerank->SetFilter("doctype == 'abstract'");
rerank->SetWeight(0.5);
rerank->SetRandomScoreField("id");
rerank->SetRandomScoreSeed(126);
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
     <td><p>この Function の一意な識別子</p></td>
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
     <td><p>reranker のタイプを指定します。</p><p>Boost Ranker を使用する場合は <code>boost</code> に設定する必要があります。</p></td>
     <td><p><code>&quot;boost&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.weight</code></p></td>
     <td><p>はい</p></td>
     <td><p>生の検索結果において、条件に一致するエンティティのスコアに乗算される重みを指定します。</p><p>値は浮動小数点数である必要があります。</p><ul><li><p>一致するエンティティの重要性を高めるには、スコアが大きくなる値を設定します。</p></li><li><p>一致するエンティティの優先度を下げるには、スコアが小さくなる値を指定します。</p></li></ul></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.filter</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>検索結果のエンティティから対象を絞り込むためのフィルター式を指定します。「<a href="./filtering-overview">フィルタリングの説明</a>」に記載されている有効な基本フィルター式を使用できます。</p><p><strong>注</strong>: <code>==</code>、<code>&gt;</code>、<code>&lt;</code> などの基本演算子のみを使用してください。<code>text_match</code> や <code>phrase_match</code> などの高度な演算子を使用すると、検索パフォーマンスが低下します。</p></td>
     <td><p><code>&quot;doctype == 'abstract'&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.random_score</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>0</code> から <code>1</code> の範囲で値をランダムに生成する関数を指定します。以下の 2 つのオプション引数があります。</p><ul><li><p><code>seed</code> (number) 疑似乱数生成器 (PRNG) の初期値を指定します。</p></li><li><p><code>field</code> (string) 乱数生成時のランダム因子として使用されるフィールド名を指定します。一意な値を持つフィールドであれば問題ありません。</p></li></ul><p>同じシードとフィールド値を用いて生成結果の一貫性を確保するため、<code>seed</code> と <code>field</code> の両方を設定することを推奨します。</p></td>
     <td><p><code>\{&quot;seed&quot;: 126, &quot;field&quot;: &quot;id&quot;\}</code></p></td>
   </tr>
</table>

### 単一の Boost Ranker を使った検索\{#search-with-a-single-boost-ranker}

Boost Ranker 関数の準備ができたら、検索リクエストで参照できます。以下の例では、**id**、**vector**、**doctype** の各フィールドを持つコレクションが作成済みであることを前提としています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
    output_field=["doctype"],
    ranker=rerank
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.FloatVec;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build());

SearchResp searchReq = client.search(SearchReq.builder()
        .collectionName("my_collection")
        .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
        .annsField("vector")
        .outputFields(Collections.singletonList("doctype"))
        .functionScore(FunctionScore.builder()
                .addFunction(rerank)
                .build())
        .build());
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// go
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
  rerank: rerank,
});

console.log('Search results:', searchResults);
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"

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
</Tabs>

### 複数の Boost Ranker を使用した検索\{#search-with-multiple-boost-rankers}

1 回の検索で複数の Boost Ranker を組み合わせて、検索結果に反映させることができます。これを行うには、複数の Boost Ranker を作成して **FunctionScore** インスタンスで参照し、検索リクエストの ranker としてその **FunctionScore** インスタンスを使用します。

次の例では、**0.8** から **1.2** の間の重みを適用して、特定されたすべてのエンティティのスコアを変更する方法を示しています。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
    output_field=["doctype"],
    ranker=ranker
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

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
params.put("boost_mode","Multiply");
params.put("function_mode","Sum");
FunctionScore ranker = FunctionScore.builder()
                 .addFunction(fixWeightRanker)
                 .addFunction(randomWeightRanker)
                 .params(params)
                 .build()

SearchResp searchReq = client.search(SearchReq.builder()
                 .collectionName("my_collection")
                 .data(Collections.singletonList(new FloatVec(new float[]{-0.619954f, 0.447943f, -0.174938f, -0.424803f, -0.864845f})))
                 .annsField("vector")
                 .outputFields(Collections.singletonList("doctype"))
                 .addFunction(ranker)
                 .build());
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// go
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
  output_field: ["doctype"],
  ranker: ranker
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

<TabItem value='c++'>

```c++
auto fix_weight_ranker = std::make_shared<milvus::BoostRerank>("boost");
fix_weight_ranker->SetWeight(0.8);

auto random_weight_ranker = std::make_shared<milvus::BoostRerank>("boost");
random_weight_ranker->SetWeight(0.4);
random_weight_ranker->SetRandomScoreSeed(126);

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
</Tabs>

具体的には、2 つの Boost Ranker を使用します。一方は検出されたすべてのエンティティに固定の重みを適用し、もう一方はランダムな重みを割り当てます。そして、これら 2 つの ranker を **FunctionScore** で参照します。この **FunctionScore** では、重みが検出されたエンティティのスコアにどのように影響するかも定義されています。

次の表に、**FunctionScore** インスタンスの作成に必要なパラメーターを示します。

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
     <td><p>対象の ranker の名前をリスト形式で指定します。</p></td>
     <td><p><code>[&quot;fix_weight_ranker&quot;, &quot;random_weight_ranker&quot;]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.boost_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定した重みが一致するエンティティのスコアにどう影響するかを指定します。</p><p>使用可能な値は次のとおりです。</p><ul><li><p><code>Multiply</code></p><p>重み付け後の値が、一致するエンティティの元のスコアに指定された重みを掛けた値になることを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>重み付け後の値が、一致するエンティティの元のスコアに指定された重みを足した値になることを示します。</p></li></ul></td>
     <td><p><code>&quot;Sum&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>各 Boost Ranker による重み付け値の処理方法を指定します。</p><p>使用可能な値は次のとおりです。</p><ul><li><p><code>Multiply</code></p><p>一致するエンティティの最終スコアが、すべての Boost Ranker による重み付け値の積になることを示します。</p><p>これがデフォルト値です。</p></li><li><p><code>Sum</code></p><p>一致するエンティティの最終スコアが、すべての Boost Ranker による重み付け値の合計になることを示します。</p></li></ul></td>
     <td><p><code>&quot;Sum&quot;</code></p></td>
   </tr>
</table>
