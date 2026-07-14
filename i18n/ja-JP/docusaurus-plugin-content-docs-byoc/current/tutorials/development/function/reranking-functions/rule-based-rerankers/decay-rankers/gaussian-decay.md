---
title: "Gaussian Decay | BYOC"
slug: /gaussian-decay
sidebar_label: "Gaussian Decay"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Gaussian decay は normal decay とも呼ばれ、検索結果に対して最も自然に感じられる調整を行います。距離が離れるにつれて徐々にぼやける人間の視覚のように、Gaussian decay は滑らかなベル型の曲線を作り、アイテムが理想的なポイントから離れるにつれて関連性を穏やかに低下させます。このアプローチは、好ましい範囲のすぐ外にあるアイテムに厳しいペナルティを与えず、それでいて遠く離れたアイテムの関連性は大きく下げたい場合に最適です。 | BYOC"
type: origin
token: G39mw621Yi3iICkv69JcQ0J5nHf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Gaussian Decay

Gaussian decay は normal decay とも呼ばれ、検索結果に対して最も自然に感じられる調整を行います。距離が離れるにつれて徐々にぼやける人間の視覚のように、Gaussian decay は滑らかなベル型の曲線を作り、アイテムが理想的なポイントから離れるにつれて関連性を穏やかに低下させます。このアプローチは、好ましい範囲のすぐ外にあるアイテムに厳しいペナルティを与えず、それでいて遠く離れたアイテムの関連性は大きく下げたい場合に最適です。

他の decay ranker とは異なり、次の特徴があります。

- Exponential decay は最初に急激に低下し、より強い初期ペナルティを生み出します

- Linear decay はゼロに達するまで一定の速度で減少し、明確なカットオフを生み出します

Gaussian decay は、よりバランスが取れていて、ユーザーにとって自然に感じられる直感的なアプローチを提供します。

## Gaussian decay を使用するタイミング\{#when-to-use-gaussian-decay}

Gaussian decay は特に次のようなケースで効果的です。

| ユースケース | 例 | Gaussian がうまく機能する理由 |
| --- | --- | --- |
| 位置ベース検索 | レストラン検索、店舗検索 | 距離の関連性に対する人間の自然な知覚を模倣するため |
| コンテンツ推薦 | 公開日に基づく記事の提案 | コンテンツが古くなるにつれて関連性が徐々に低下するため |
| 商品一覧 | ターゲット価格に近い商品 | 価格がターゲットから外れるにつれて関連性が滑らかに低下するため |
| 専門性マッチング | 関連する経験を持つ専門家の検索 | 経験の関連性をバランスよく評価できるため |

厳しいペナルティや厳格なカットオフなしに、関連性が自然に下がっていく感覚を必要とするアプリケーションであれば、Gaussian decay が最適な選択である可能性が高いです。

## ベルカーブの原理\{#bell-curve-principle}

Gaussian decay は、理想的なポイントからの距離が大きくなるにつれて関連性を徐々に低下させる、滑らかなベル型の曲線を作ります。数学者 Carl Friedrich Gauss にちなんで名付けられたこの分布は、自然界や統計の中に頻繁に現れるため、人間の知覚にとって非常に直感的に感じられます。

![DP1AbcqZPoyfqhxpJ2icptjQnfc](https://zdoc-images.s3.us-west-2.amazonaws.com/dp1abcqzpoyfqhxpj2icptjqnfc.png "DP1AbcqZPoyfqhxpJ2icptjQnfc")

上のグラフは、モバイル検索アプリにおいて Gaussian decay がレストランのランキングにどのような影響を与えるかを示しています。

- `origin` (0 km): あなたの現在地であり、関連性が最大値 (1.0) となる地点です。

- `offset` (±300 m): あなたの周囲の「満点ゾーン」です。300 メートル以内のすべてのレストランは完全な関連性スコア (1.0) を維持し、ごくわずかな距離差のために非常に近い候補が不必要にペナルティを受けないようにします。

- `scale` (±2 km): 関連性が decay 値まで低下する距離です。ちょうど 2 キロメートル離れたレストランの関連性スコアは半分 (0.5) になります。

- `decay` (0.5): scale 距離におけるスコアです。このパラメータは本質的に、距離に応じてスコアがどれだけ速く減少するかを制御します。

曲線からわかるように、2 km を超えるレストランは関連性が引き続き低下しますが、完全にゼロにはなりません。4～5 キロメートル離れたレストランであっても最小限の関連性は保持されるため、優れたが遠方にあるレストランも検索結果に表示され続けます（ただし順位は下がります）。

この挙動は、人々が距離の関連性について自然に考える方法を模倣しています。近くの場所が好まれる一方で、特別に優れた選択肢であれば、より遠くまで移動する意思があります。

## 数式\{#formula}

Gaussian decay スコアを計算するための数式は次のとおりです。

$$
S(doc) = \exp\left( -\frac\{\left( \max\left(0, \left|fieldvalue_\{doc\} - origin\right| - offset \right) \right)^2\}\{2\sigma^2\} \right)
$$

ここで、

$$
\sigma^2 = -\frac\{scale^2\}\{2 \cdot \ln(decay)\}
$$

これを平易な言葉で分解すると、次のようになります。

1. フィールド値が origin からどれだけ離れているかを計算します:  $|fieldvalue_\{doc\} - origin|$

1. offset（ある場合）を差し引きますが、ゼロ未満にはしません: $\max(0, distance - offset)$

1. この調整後の距離を二乗します: $(adjusted\_distance)^2$

1. これを &#36;2\sigma^2$ で割ります。これは scale と decay パラメータから計算されます

1. 負の指数を取ることで、0 から 1 の間の値が得られます: $\exp(-value)$

$\sigma^2$ の計算により、scale と decay パラメータが Gaussian 分布の標準偏差の二乗に変換されます。これが、この関数に特徴的なベル型の形状を与える要因です。

## Gaussian decay を使用する\{#use-gaussian-decay}

Gaussian decay は、Zilliz Cloud における標準 vector search と hybrid search の両方に適用できます。以下に、この機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" icon="📘" title="注意">

decay function を使用する前に、まず decay 計算に使用する適切な数値フィールド（timestamp、distance など）を持つ collection を作成する必要があります。collection のセットアップ、schema 定義、データ挿入を含む完全な動作例については、[チュートリアル: Milvus で時間ベースのランキングを実装する](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### decay ranker を作成する\{#create-a-decay-ranker}

collection に数値フィールド（この例では、ユーザーからの距離をメートルで表す `distance`）を設定したら、Gaussian decay ranker を作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "restaurant_distance_decay",
  input_field_names: ["distance"],
  function_type: FunctionType.RERANK,
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
auto rerank = std::make_shared<milvus::DecayRerank>("restaurant_distance_decay");
rerank->AddInputFieldName("distance");
rerank->SetFunction("gauss");
rerank->SetOrigin(0);
rerank->SetScale(2000);
rerank->SetOffset(300);
rerank->SetDecay(0.5);
```

</TabItem>
</Tabs>

### 標準 vector search に適用する\{#apply-to-standard-vector-search}

decay ranker を定義した後、`ranker` パラメータに渡すことで search 操作中に適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("italian restaurants")))
        .annsField("vector_field")
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
</Tabs>
