---
title: "Boost Ranker | BYOC"
slug: /boost-ranker
sidebar_label: "Boost Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ベクトル距離に基づいて計算されるセマンティック類似度のみに依存するのではなく、Boost Ranker を使用すると、検索結果に意味のある形で影響を与えることができます。メタデータフィルタリングを使用して検索結果をすばやく調整するのに最適です。 | BYOC"
type: origin
token: Qa60w2vDuiqNk0kclKLcZ0uQnkg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Boost Ranker

ベクトル距離に基づいて計算されるセマンティック類似度のみに依存するのではなく、Boost Ranker を使用すると、検索結果に意味のある形で影響を与えることができます。メタデータフィルタリングを使用して検索結果をすばやく調整するのに最適です。

検索リクエストに Boost Ranker 関数が含まれている場合、Milvus は関数内のオプションのフィルタリング条件を使用して検索結果候補の中から一致を見つけ、指定された重みを適用してそれらの一致のスコアをブーストします。これにより、最終結果において一致したエンティティの順位を上げたり下げたりすることができます。 

## Boost Ranker を使用するタイミング\{#when-to-use-boost-ranker}

cross-encoder モデルや融合アルゴリズムに依存する他のランカーとは異なり、Boost Ranker はオプションのメタデータ駆動ルールをランキングプロセスに直接注入します。そのため、以下のようなシナリオにより適しています。

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>Boost Ranker が効果的な理由</p></th>
   </tr>
   <tr>
     <td><p>ビジネス主導のコンテンツ優先順位付け</p></td>
     <td><ul><li><p>e コマースの検索結果でプレミアム商品を目立たせる</p></li><li><p>高いユーザーエンゲージメント指標（閲覧数、いいね、シェアなど）を持つコンテンツの可視性を高める</p></li><li><p>時間に敏感な検索アプリケーションで新しいコンテンツを優先する</p></li><li><p>認証済みまたは信頼できるソースからのコンテンツを優先する</p></li><li><p>完全一致のフレーズや関連性の高いキーワードに一致する結果をブーストする</p></li></ul></td>
     <td rowspan="2"><p>インデックスの再構築やベクトル埋め込みモデルの変更といった、時間のかかる操作を行う必要なく、リアルタイムでオプションのメタデータフィルタを適用することで、検索結果内の特定の項目を即座に昇格または降格できます。この仕組みにより、変化するビジネス要件に容易に適応できる、柔軟で動的な検索ランキングが実現します。</p></td>
   </tr>
   <tr>
     <td><p>戦略的なコンテンツの順位引き下げ</p></td>
     <td><ul><li><p>在庫が少ない項目を完全に削除せずに目立ちにくくする</p></li><li><p>検閲せずに、問題となり得る用語を含むコンテンツの順位を下げる</p></li><li><p>技術検索でアクセス可能な状態を維持しつつ、古いドキュメントの順位を下げる</p></li><li><p>マーケットプレイス検索で競合商品の可視性をさりげなく下げる</p></li><li><p>品質の低さを示す兆候（書式の問題、短い長さなど）があるコンテンツの関連性を下げる</p></li></ul></td>
   </tr>
</table>

複数の Boost Ranker を組み合わせて、より動的で堅牢な重みベースのランキング戦略を実装することもできます。

## Boost Ranker の仕組み\{#mechanism-of-boost-ranker}

次の図は、Boost Ranker の主なワークフローを示しています。

![Hq0awfjC7h0Ty3bvsUEcasOHncb](https://zdoc-images.s3.us-west-2.amazonaws.com/Hq0awfjC7h0Ty3bvsUEcasOHncb.png)

データを挿入すると、Zilliz Cloud はそれを複数のセグメントに分散します。検索時には、各セグメントが候補のセットを返し、Zilliz Cloud はすべてのセグメントからの候補をランキングして最終結果を生成します。検索リクエストに Boost Ranker が含まれている場合、Zilliz Cloud は精度低下の可能性を防ぎ、再現率を向上させるために、各セグメントからの候補結果にそれを適用します。 

結果を確定する前に、Milvus はこれらの候補を以下のように Boost Ranker で処理します。

1. Boost Ranker で指定されたオプションのフィルタリング式を適用し、その式に一致するエンティティを識別します。

1. Boost Ranker で指定された重みを適用して、識別されたエンティティのスコアをブーストします。

<Admonition type="info" icon="📘" title="Notes">

Boost Ranker はマルチベクトルハイブリッド検索では使用できません。

</Admonition>

## Boost Ranker の例\{#examples-of-boost-ranker}

次の例は、上位 5 件の最も関連性の高いエンティティを返し、abstract ドキュメントタイプを持つエンティティのスコアに重みを追加する必要がある単一ベクトル検索での Boost Ranker の使用を示しています。

1. **セグメント内で検索結果候補を収集します。** 

    次の表では、Milvus がエンティティを 2 つのセグメント（**0001** と **0002**）に分散し、各セグメントが 5 件の候補を返すと仮定しています。

    | ID | DocType | Score | Rank | segment |
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

1. **Boost Ranker で指定されたフィルタリング式** (`doctype='abstract'`) **を適用します。**

    次の表の `DocType` フィールドが示すように、Milvus は `doctype` が `abstract` に設定されているすべてのエンティティを、後続の処理のためにマークします。

    | ID | DocType | Score | Rank | segment |
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

1. **Boost Ranker で指定された重み** (`weight=0.5`) **を適用します。**

    前のステップで識別されたすべてのエンティティに、Boost Ranker で指定された重みが乗算され、その結果として順位が変化します。 

    | ID | DocType | Score | Weighted Score<br/>(= score x weight) | Rank | segment |
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

    重みは、ユーザーが選択する浮動小数点数である必要があります。上記の例のように、スコアが小さいほど関連性が高い場合は、**1** 未満の重みを使用します。それ以外の場合は、**1** より大きい重みを使用します。

    </Admonition>

1. **重み付きスコアに基づいてすべてのセグメントから候補を集約し、結果を確定します。**

    | ID | DocType | Score | Weighted Score | Rank | segment |
    | --- | --- | --- | --- | --- | --- |
    | **117** | **abstract** | **0.344** | **0.172** | **1** | **0001** |
    | **561** | **abstract** | **0.366** | **0.183** | **2** | **0002** |
    | 46 | body | 0.189 | 0.189 | 3 | 0002 |
    | **344** | **abstract** | **0.444** | **0.222** | **4** | **0002** |
    | **89** | **abstract** | **0.456** | **0.228** | **5** | **0001** |

## Boost Ranker の使用方法\{#usage-of-boost-ranker}

このセクションでは、Boost Ranker を使用して単一ベクトル検索の結果に影響を与える方法の例を示します。

### Boost Ranker を作成する\{#create-a-boost-ranker}

Boost Ranker を検索リクエストのリランカーとして渡す前に、以下のように再ランキング関数として適切に定義する必要があります。

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
     <th><p>パラメータ</p></th>
     <th><p>必須?</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>この Function の一意識別子</p></td>
     <td><p><code>"boost"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>この関数を適用するベクトルフィールドのリスト（Boost Ranker の場合は空でなければなりません）</p></td>
     <td><p><code>[]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す Function のタイプ。再ランキング戦略を指定するには <code>RERANK</code> を使用します</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>リランカーのタイプを指定します。</p><p>Boost Ranker を使用するには <code>boost</code> に設定する必要があります。</p></td>
     <td><p><code>"boost"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.weight</code></p></td>
     <td><p>はい</p></td>
     <td><p>生の検索結果内の一致したエンティティのスコアに乗算される重みを指定します。</p><p>値は浮動小数点数である必要があります。 </p><ul><li><p>一致したエンティティの重要性を強調するには、スコアをブーストする値に設定します。</p></li><li><p>一致したエンティティを降格するには、このパラメータにスコアを下げる値を割り当てます。</p></li></ul></td>
     <td><p><code>1</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.filter</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>検索結果エンティティの中からエンティティを一致させるために使用されるフィルタ式を指定します。これは、<a href="./filtering-overview">Filtering Explained</a> で説明されている任意の有効な基本フィルタ式を使用できます。</p><p><strong>注</strong>: <code>==</code>、<code>&gt;</code>、<code>&lt;</code> などの基本演算子のみを使用してください。<code>text_match</code> や <code>phrase_match</code> などの高度な演算子を使用すると、検索パフォーマンスが低下します。</p></td>
     <td><p><code>"doctype == 'abstract'"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.random_score</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>0</code> から <code>1</code> の間の値をランダムに生成するランダム関数を指定します。これには次の 2 つのオプション引数があります。</p><ul><li><p><code>seed</code> (number) 疑似乱数生成器 (PRNG) を開始するために使用される初期値を指定します。</p></li><li><p><code>field</code> (string) 乱数生成時のランダム要因として使用されるフィールド名を指定します。一意の値を持つフィールドで十分です。</p><p>同じ seed 値と field 値を使用して生成間の一貫性を確保するために、<code>seed</code> と <code>field</code> の両方を設定することを推奨します。</p></li></ul></td>
     <td><p><code>\{"seed": 126, "field": "id"\}</code></p></td>
   </tr>
</table>

### 単一の Boost Ranker で検索する\{#search-with-a-single-boost-ranker}

Boost Ranker 関数の準備ができたら、検索リクエストでそれを参照できます。次の例では、すでに **id**、**vector**、および **doctype** のフィールドを持つコレクションを作成していることを前提としています。

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

### 複数の Boost Ranker で検索する\{#search-with-multiple-boost-rankers}

複数の Boost Ranker を 1 回の検索で組み合わせて、検索結果に影響を与えることができます。これを行うには、複数の Boost Ranker を作成し、それらを **FunctionScore** インスタンスで参照し、その **FunctionScore** インスタンスを検索リクエストのランカーとして使用します。

次の例では、識別されたすべてのエンティティのスコアを、**0.8** から **1.2** の間の重みを適用して変更する方法を示します。 

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

具体的には、2 つの Boost Ranker があります。1 つは見つかったすべてのエンティティに固定の重みを適用し、もう 1 つはそれらにランダムな重みを割り当てます。次に、これら 2 つのランカーを **FunctionScore** で参照し、さらに一致したエンティティのスコアに重みがどのように影響するかも定義します。 

次の表は、**FunctionScore** インスタンスを作成するために必要なパラメータを示しています。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>必須?</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>functions</code></p></td>
     <td><p>はい</p></td>
     <td><p>対象ランカーの名前をリストで指定します。</p></td>
     <td><p><code>["fix_weight_ranker", "random_weight_ranker"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.boost_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>指定された重みが一致したエンティティのスコアにどのように影響するかを指定します。</p><p>指定可能な値は次のとおりです。</p><ul><li><p><code>Multiply</code></p><p>重み付き値が、一致したエンティティの元のスコアに指定された重みを乗算した値に等しいことを示します。 </p><p>これはデフォルト値です。</p></li><li><p><code>Sum</code></p><p>重み付き値が、一致したエンティティの元のスコアと指定された重みの合計に等しいことを示します</p></li></ul></td>
     <td><p><code>"Sum"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function_mode</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>さまざまな Boost Ranker からの重み付き値をどのように処理するかを指定します。</p><p>指定可能な値は次のとおりです。</p><ul><li><p><code>Multiply</code></p><p>一致したエンティティの最終スコアが、すべての Boost Ranker からの重み付き値の積に等しいことを示します。</p><p>これはデフォルト値です。</p></li><li><p><code>Sum</code></p><p>一致したエンティティの最終スコアが、すべての Boost Ranker からの重み付き値の合計に等しいことを示します。</p></li></ul></td>
     <td><p><code>"Sum"</code></p></td>
   </tr>
</table>

