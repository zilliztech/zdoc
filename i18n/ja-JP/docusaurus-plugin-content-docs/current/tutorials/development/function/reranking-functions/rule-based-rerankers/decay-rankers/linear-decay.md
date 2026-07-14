---
title: "Linear Decay | Cloud"
slug: /linear-decay
sidebar_label: "Linear Decay"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Linear decay は、検索結果内で絶対的なゼロ地点で終わる直線的な減衰を作成します。今後予定されているイベントのカウントダウンのように、イベントが過ぎるまで関連性が徐々に薄れていくのと同様に、linear decay は、アイテムが理想点から離れるにつれて、完全に消えるまで予測可能で一定の関連性低下を適用します。このアプローチは、明確なカットオフを伴う一貫した減衰率が必要な場合に理想的であり、特定の境界を超えたアイテムが結果から完全に除外されることを保証します。 | Cloud"
type: origin
token: M7xHwZSIuiAP4Fkfm67cBU7Pn8g
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linear Decay

Linear decay は、検索結果内で絶対的なゼロ地点で終わる直線的な減衰を作成します。今後予定されているイベントのカウントダウンのように、イベントが過ぎるまで関連性が徐々に薄れていくのと同様に、linear decay は、アイテムが理想点から離れるにつれて、完全に消えるまで予測可能で一定の関連性低下を適用します。このアプローチは、明確なカットオフを伴う一貫した減衰率が必要な場合に理想的であり、特定の境界を超えたアイテムが結果から完全に除外されることを保証します。

他の decay 関数とは異なり:

- Gaussian decay は、徐々にゼロに近づくものの決してゼロにはならないベルカーブに従います

- Exponential decay は、最小限の関連性を持つ長いテールを維持し、それが無期限に続きます

Linear decay は明確な終点を一意に作り出すため、自然な境界や締め切りがあるアプリケーションで特に効果的です。

## Linear decay を使用するタイミング\{#when-to-use-linear-decay}

Linear decay が特に効果的なのは次のような場合です:

| ユースケース | 例 | Linear がうまく機能する理由 |
| --- | --- | --- |
| イベント一覧 | コンサートチケットプラットフォーム | 未来すぎるイベントに対して明確なカットオフを作成できる |
| 期間限定オファー | フラッシュセール、プロモーション | 期限切れまたは間もなく期限切れになるオファーが表示されないようにする |
| 配達半径 | フードデリバリー、宅配サービス | 厳密な地理的境界を適用できる |
| 年齢制限コンテンツ | マッチングプラットフォーム、メディアサービス | 明確な年齢しきい値を設定できる |

次のような場合は linear decay を選択してください:

- アプリケーションに自然な境界、締め切り、またはしきい値がある

- 特定の地点を超えたアイテムを結果から完全に除外する必要がある

- 予測可能で一貫した関連性低下率が必要である

- ユーザーに関連性のあるアイテムとないアイテムの明確な境界を見せたい

## 一定の低下の原則\{#steady-decline-principle}

Linear decay は、一定の割合で低下し、最終的に正確にゼロに到達する直線的な下降を作り出します。このパターンは、カウントダウンタイマー、在庫の減少、締め切りの接近など、関連性に明確な有効期限がある多くの日常的なシナリオに見られます。

<Admonition type="info" icon="📘" title="Notes">

すべての時間パラメータ（`origin`、`offset`、`scale`）は、collection データと同じ単位を使用する必要があります。collection が異なる単位（ミリ秒、マイクロ秒）でタイムスタンプを保存している場合は、すべてのパラメータをそれに応じて調整してください。

</Admonition>

![LNwQbV5FYo7OYbxaA1VcetPgnUh](https://zdoc-images.s3.us-west-2.amazonaws.com/lnwqbv5fyo7oybxaa1vcetpgnuh.png "LNwQbV5FYo7OYbxaA1VcetPgnUh")

上のグラフは、Linear decay がチケット販売プラットフォームのイベント一覧にどのように影響するかを示しています:

- `origin`（現在日付）: 現在の時点で、関連性は最大値（1.0）です。

- `offset`（1日）: 「直近イベントウィンドウ」—翌日までに開催されるすべてのイベントは完全な関連性スコア（1.0）を維持し、ごく近いイベントがわずかな時間差で不利にならないようにします。

- `decay`（0.5）: scale 距離におけるスコア—このパラメータは関連性低下の割合を制御します。

- `scale`（10日）: 関連性が decay 値まで低下する期間—10日後のイベントの関連性スコアは半分（0.5）になります。

直線的なカーブから分かるように、およそ16日先を超えるイベントは関連性が正確にゼロとなり、検索結果にはまったく表示されません。これにより、明確な境界が作られ、ユーザーには定義された期間内の関連性のある今後のイベントのみが表示されます。

この挙動は、イベント計画が通常どのように機能するかを反映しています。直近のイベントが最も関連性が高く、今後数週間のイベントは重要性が徐々に低下し、遠すぎる未来のイベント（またはすでに終了したイベント）はまったく表示されるべきではありません。

## Formula\{#formula}

Linear decay スコアを計算する数式は次のとおりです:

$$
S(doc) = \max\left( \frac\{s - \max(0, |fieldvalue_\{doc\} - origin| - offset)\}\{s\}, 0 \right)
$$

ここで:

$$
s = \frac \{scale\}\{(1.0 - decay)\}
$$

これを平易な言葉で分解すると次のようになります:

1. フィールド値が origin からどれだけ離れているかを計算します: $|fieldvalue_\{doc\} - origin|$。

1. offset（存在する場合）を差し引きますが、ゼロ未満にはしません: $\max(0, distance - offset)$。

1. scale と decay の値からパラメータ $s$ を求めます。

1. 調整後の距離を $s$ から引き、その結果を $s$ で割ります。

1. 結果がゼロ未満にならないようにします: $\max(result, 0)$。

$s$ の計算では、scale と decay のパラメータを、スコアがゼロに到達する地点に変換します。たとえば、decay=0.5 かつ scale=7 の場合、スコアは distance=14（scale 値の2倍）で正確にゼロに達します。

## Linear decay を使用する\{#use-linear-decay}

Linear decay は、Zilliz Cloud における標準 vector search と hybrid search の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="Notes">

decay 関数を使用する前に、まず、decay 計算に使用される適切な数値フィールド（タイムスタンプ、距離など）を持つ collection を作成する必要があります。collection のセットアップ、スキーマ定義、データ挿入を含む完全な動作例については、[Decay Ranker Tutorial](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### Decay ranker を作成する\{#create-a-decay-ranker}

数値フィールド（この例では、現在からの秒数としての `event_date`）を使って collection をセットアップした後、linear decay ranker を作成します:

<Admonition type="info" icon="📘" title="Notes">

**時間単位の一貫性**: 時間ベースの decay を使用する場合、`origin`、`scale`、`offset` の各パラメータが collection データと同じ時間単位を使用していることを確認してください。collection が秒単位でタイムスタンプを保存している場合は、すべてのパラメータに秒を使用してください。ミリ秒を使用している場合は、すべてのパラメータにミリ秒を使用してください。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import time

# Calculate current time
current_time = int(time.time())

# Create a linear decay ranker for event listings
# Note: All time parameters must use the same unit as your collection data
rerank = Function(
    name="event_relevance",               # Function identifier
    input_field_names=["event_date"],     # Numeric field to use
    function_type=FunctionType.RERANK,    # Function type. Must be RERANK
    params={
        "reranker": "decay",              # Specify decay reranker
        "function": "linear",             # Choose linear decay
        "origin": current_time,           # Current time (seconds, matching collection data)
        "offset": 12 * 60 * 60,           # 12 hour immediate events window (seconds)
        "decay": 0.5,                     # Half score at scale distance
        "scale": 7 * 24 * 60 * 60         # 7 days (in seconds, matching collection data)
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker rerank = DecayRanker.builder()
        .name("event_relevance")
        .inputFieldNames(Collections.singletonList("event_date"))
        .function("linear")
        .origin(System.currentTimeMillis())
        .offset(12 * 60 * 60)
        .decay(0.5)
        .scale(7 * 24 * 60 * 60)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "event_relevance",
  input_field_names: ["event_date"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "linear",
    origin: new Date(2025, 1, 15).getTime(),
    offset: 12 * 60 * 60,
    decay: 0.5,
    scale: 7 * 24 * 60 * 60,
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
auto rerank = std::make_shared<milvus::DecayRerank>("event_relevance");
rerank->AddInputFieldName("event_date");
rerank->SetFunction("exp");
rerank->SetOrigin(1736870400);
rerank->SetScale(7 * 24 * 60 * 60);
rerank->SetOffset(12 * 60 * 60);
rerank->SetDecay(0.5);
```

</TabItem>
</Tabs>

### 標準 vector search に適用する\{#apply-to-standard-vector-search}

decay ranker を定義した後、`ranker` パラメータに渡すことで search 操作中に適用できます:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
# Apply decay ranker to vector search
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],              # Replace with your query vector
    anns_field="dense",                   # Vector field to search
    limit=10,                             # Number of results
    output_fields=["title", "venue", "event_date"], # Fields to return
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
import io.milvus.v2.service.vector.request.data.FloatVec;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new FloatVec(embedding)))
        .annsField("dense")
        .limit(10)
        .outputFields(Arrays.asList("title", "venue", "event_date"))
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
  output_fields: ["title", "venue", "event_date"],
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
                   .AddOutputField("venue")
                   .AddOutputField("event_date")
                   .AddFloatVector(your_query_vector)
                   .WithConsistencyLevel(milvus::ConsistencyLevel::BOUNDED);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>
