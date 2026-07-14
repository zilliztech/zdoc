---
title: "指数減衰 | BYOC"
slug: /exponential-decay
sidebar_label: "指数減衰"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "指数減衰は、検索結果において最初に急激な低下を生み、その後に長いテールを形成します。ニュース速報のサイクルのように、関連性は最初は急速に低下する一方で、一部のストーリーは時間が経っても重要性を保ちます。指数減衰は、理想的な範囲を少し超えた項目に強いペナルティを適用しつつ、遠く離れた項目も引き続き見つけられるようにします。このアプローチは、近接性や新しさを強く優先したいが、より離れた選択肢を完全には排除したくない場合に最適です。 | BYOC"
type: origin
token: FbVmwmuaei9WkIkIWJmcs3ManEd
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 指数減衰

指数減衰は、検索結果において最初に急激な低下を生み、その後に長いテールを形成します。ニュース速報のサイクルのように、関連性は最初は急速に低下する一方で、一部のストーリーは時間が経っても重要性を保ちます。指数減衰は、理想的な範囲を少し超えた項目に強いペナルティを適用しつつ、遠く離れた項目も引き続き見つけられるようにします。このアプローチは、近接性や新しさを強く優先したいが、より離れた選択肢を完全には排除したくない場合に最適です。

他の減衰関数とは異なり、次の特徴があります。

- Gaussian decay は、より緩やかなベル型の減少を作ります

- Linear decay は、ちょうどゼロに達するまで一定の割合で減少します

指数減衰は、ペナルティを一意に「前倒し」で適用し、関連性の低下の大部分を早い段階で与えながら、最小限ではあるもののゼロではない関連性の長いテールを維持します。

## 指数減衰を使うタイミング\{#when-to-use-exponential-decay}

指数減衰は、特に次のようなケースで効果的です。

| ユースケース | 例 | 指数減衰が適している理由 |
| --- | --- | --- |
| ニュースフィード | ニュース速報ポータル | 古いニュースの関連性をすばやく下げつつ、数日前の重要な記事も引き続き表示できる |
| ソーシャルメディアのタイムライン | アクティビティフィード、ステータス更新 | 新しいコンテンツを強調しつつ、拡散した古いコンテンツも浮上できる |
| 通知システム | アラートの優先順位付け | 最新のアラートに緊急性を持たせつつ、重要なものの可視性を維持する |
| フラッシュセール | 期間限定オファー | 締切が近づくにつれて可視性を急速に下げる |

次のような場合は指数減衰を選択してください。

- ユーザーが、ごく最近の項目や非常に近い項目が結果を強く支配することを期待している場合

- 古い項目や遠い項目であっても、非常に関連性が高ければ引き続き発見可能であるべき場合

- 関連性の低下を前半に集中させたい場合（最初は急で、後半はより緩やか）

## 急激な減衰の原理\{#sharp-drop-off-principle}

指数減衰は、最初に急激に下がり、その後徐々に平坦になってゼロには達しない長いテールへと近づく曲線を作ります。この数学的パターンは、放射性崩壊、人口減少、時間経過に伴う情報の関連性など、自然現象によく見られます。

<Admonition type="info" icon="📘" title="注意">

すべての時間パラメータ（`origin`、`offset`、`scale`）は、collection データと同じ単位を使用する必要があります。collection が異なる単位（ミリ秒、マイクロ秒）でタイムスタンプを保存している場合は、すべてのパラメータをそれに応じて調整してください。

</Admonition>

![YaRsbolv9oqomcxrFe5cXBa4nNg](https://zdoc-images.s3.us-west-2.amazonaws.com/yarsbolv9oqomcxrfe5cxba4nng.png "YaRsbolv9oqomcxrFe5cXBa4nNg")

上のグラフは、指数減衰がデジタルニュースプラットフォームでニュース記事のランキングにどのように影響するかを示しています。

- `origin`（現在時刻）: 現在の時点で、関連性は最大値（1.0）です。

- `offset`（3時間）: 「速報ニュースのウィンドウ」—過去3時間以内に公開されたすべての記事は完全な関連性スコア（1.0）を維持し、ごくわずかな時間差によって最新ニュースが不必要にペナルティを受けることを防ぎます。

- `decay`（0.5）: scale 距離におけるスコア—このパラメータは、時間とともにスコアがどれだけ劇的に低下するかを制御します。

- `scale`（24時間）: 関連性が decay 値まで低下する時間期間—公開からちょうど24時間経過したニュース記事は、関連性スコアが半分（0.5）になります。

曲線からわかるように、24時間を超えたニュース記事は関連性がさらに低下し続けますが、完全にゼロにはなりません。数日前の記事であっても、わずかな関連性は保たれるため、重要ではあるものの古いニュースもフィード内に表示され続けます（ただし順位は低くなります）。

この挙動は、ニュースの関連性が一般的にどのように機能するかを模倣しています。非常に新しい記事が強く優勢になる一方で、古い記事でも、ユーザーの関心に対して非常に高い関連性があれば、依然として上位に現れる可能性があります。

## 数式\{#formula}

指数減衰スコアを計算する数学的な式は次のとおりです。

$$
S(doc) = \exp\left( \lambda \cdot \max\left(0, \left|fieldvalue_\{doc\} - origin\right| - offset \right) \right)
$$

ここで、

$$
\lambda = \frac\{\ln(decay)\}\{scale\}
$$

これを平易に分解すると、次のようになります。

1. フィールド値が origin からどれだけ離れているかを計算します: $|fieldvalue_\{doc\} - origin|$。

1. offset（存在する場合）を差し引きますが、ゼロ未満にはしません: $\max(0, distance - offset)$。

1. それに $\lambda$ を掛けます。これは scale と decay パラメータから計算されます。

1. 指数を取ることで、0 から 1 の間の値を得ます: $\exp(\lambda \cdot value)$。

$\lambda$ の計算は、scale と decay のパラメータを指数関数のレートパラメータに変換します。$\lambda$ がより負の値になるほど、初期の低下はより急になります。

## 指数減衰を使う\{#use-exponential-decay}

指数減衰は、Zilliz Cloud における標準の vector 検索とハイブリッド検索の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="注意">

減衰関数を使用する前に、まず減衰計算に使用する適切な数値フィールド（タイムスタンプ、距離など）を持つ collection を作成する必要があります。collection のセットアップ、スキーマ定義、データ挿入を含む完全な動作例については、[Decay Ranker Tutorial](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### decay ranker を作成する\{#create-a-decay-ranker}

collection が数値フィールド（この例では `publish_time`）でセットアップされたら、指数減衰 ranker を作成します。

<Admonition type="info" icon="📘" title="注意">

**時間単位の一貫性**: 時間ベースの減衰を使用する場合、`origin`、`scale`、`offset` の各パラメータが collection データと同じ時間単位を使用していることを確認してください。collection がタイムスタンプを秒で保存している場合は、すべてのパラメータにも秒を使用してください。ミリ秒を使用している場合は、すべてのパラメータにもミリ秒を使用してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker rerank = DecayRanker.builder()
        .name("news_recency")
        .inputFieldNames(Collections.singletonList("publish_time"))
        .function("exp")
        .origin(System.currentTimeMillis())
        .offset(3 * 60 * 60)
        .decay(0.5)
        .scale(24 * 60 * 60)
        .build();
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
    origin: new Date(2025, 1, 15).getTime(),
    offset: 3 * 60 * 60,
    decay: 0.5,
    scale: 24 * 60 * 60,
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
auto rerank = std::make_shared<milvus::DecayRerank>("news_recency");
rerank->AddInputFieldName("publish_time");
rerank->SetFunction("exp");
rerank->SetOrigin(1736870400);
rerank->SetScale(24 * 60 * 60);
rerank->SetOffset(3 * 60 * 60);
rerank->SetDecay(0.5);
```

</TabItem>
</Tabs>

### 標準 vector 検索に適用する\{#apply-to-standard-vector-search}

decay ranker を定義した後、`ranker` パラメータに渡すことで検索操作中に適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
import io.milvus.v2.common.ConsistencyLevel;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("market analysis")))
        .annsField("vector_field")
        .limit(10)
        .outputFields(Arrays.asList("title", "publish_time"))
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
import { FunctionType MilvusClient } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient("YOUR_CLUSTER_ENDPOINT");

const result = await milvusClient.search({
  collection_name: collection_name,
  data: [your_query_vector], // Replace with your query vector
  anns_field: "dense",
  limit: 10,
  output_fields: ["title", "publish_time"],
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
</Tabs>
