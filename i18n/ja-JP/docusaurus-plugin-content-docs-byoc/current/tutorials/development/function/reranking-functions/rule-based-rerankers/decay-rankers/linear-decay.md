---
title: "Linear Decay | BYOC"
slug: /linear-decay
sidebar_label: "Linear Decay"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Linear decay は、検索結果内で絶対的なゼロ点に到達する直線的な減衰を作成します。今後のイベントのカウントダウンのように、イベントが過ぎるまで関連性が徐々に薄れていくように、linear decay は、アイテムが理想点から離れるにつれて、完全に消えるまで予測可能かつ一定の割合で関連性を低下させます。このアプローチは、明確なカットオフを伴う一貫した減衰率が必要な場合に最適であり、特定の境界を超えたアイテムが結果から完全に除外されることを保証します。 | BYOC"
type: origin
token: M7xHwZSIuiAP4Fkfm67cBU7Pn8g
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linear Decay

Linear decay は、検索結果内で絶対的なゼロ点に到達する直線的な減衰を作成します。今後のイベントのカウントダウンのように、イベントが過ぎるまで関連性が徐々に薄れていくように、linear decay は、アイテムが理想点から離れるにつれて、完全に消えるまで予測可能かつ一定の割合で関連性を低下させます。このアプローチは、明確なカットオフを伴う一貫した減衰率が必要な場合に最適であり、特定の境界を超えたアイテムが結果から完全に除外されることを保証します。

他の decay function とは異なり、次の特徴があります。

- Gaussian decay は、徐々にゼロへ近づくものの決してゼロにはならないベルカーブに従います

- Exponential decay は、ごくわずかな関連性の長い尾を維持し、それが無期限に続きます

Linear decay は、明確な終点を作るという独自の特徴があり、自然な境界や期限があるアプリケーションで特に効果的です。

## Linear Decay を使用するタイミング\{#when-to-use-linear-decay}

Linear decay は、特に次のようなケースで効果的です。

| ユースケース | 例 | Linear が効果的な理由 |
| --- | --- | --- |
| イベント一覧 | コンサートチケットのプラットフォーム | 未来すぎるイベントに対して明確なカットオフを作成できる |
| 期間限定オファー | フラッシュセール、プロモーション | 期限切れまたはまもなく期限切れのオファーが表示されないようにできる |
| 配達範囲 | フードデリバリー、宅配サービス | 厳密な地理的境界を適用できる |
| 年齢制限コンテンツ | マッチングプラットフォーム、メディアサービス | 明確な年齢しきい値を設定できる |

次のような場合は linear decay を選択してください。

- アプリケーションに自然な境界、期限、またはしきい値がある

- ある地点を超えたアイテムを結果から完全に除外したい

- 関連性が予測可能かつ一貫した割合で低下する必要がある

- ユーザーに、関連性のあるアイテムとないアイテムの明確な境界を示したい

## 一定の低下の原則\{#steady-decline-principle}

Linear decay は、一定の割合で低下し、最終的に正確にゼロへ到達する直線的な減衰を作成します。このパターンは、カウントダウンタイマー、在庫の減少、期限の接近など、関連性に明確な有効期限がある多くの日常的なシナリオで見られます。

<Admonition type="info" icon="📘" title="Notes">

すべての時間パラメータ（`origin`、`offset`、`scale`）は、collection データと同じ単位を使用する必要があります。collection が異なる単位（ミリ秒、マイクロ秒）でタイムスタンプを保存している場合は、すべてのパラメータをそれに合わせて調整してください。

</Admonition>

![LNwQbV5FYo7OYbxaA1VcetPgnUh](https://zdoc-images.s3.us-west-2.amazonaws.com/lnwqbv5fyo7oybxaa1vcetpgnuh.png "LNwQbV5FYo7OYbxaA1VcetPgnUh")

上のグラフは、Linear decay がチケットプラットフォームのイベント一覧にどのように影響するかを示しています。

- `origin`（現在日時）: 現在の時点であり、関連性が最大（1.0）になるポイントです。

- `offset`（1日）: 「直近イベントウィンドウ」—翌日までに開催されるすべてのイベントは完全な関連性スコア（1.0）を維持し、ごくわずかな時間差によって差し迫ったイベントが不利にならないようにします。

- `decay`（0.5）: scale 距離におけるスコア—このパラメータは関連性の低下率を制御します。

- `scale`（10日）: 関連性が decay 値まで低下する時間期間—10日後のイベントは関連性スコアが半分（0.5）になります。

直線のカーブから分かるように、およそ16日以上先のイベントは関連性が正確にゼロとなり、検索結果にはまったく表示されません。これにより、ユーザーには定義された時間ウィンドウ内の関連性の高い今後のイベントだけが表示される、明確な境界が作られます。

この挙動は、一般的なイベント計画の考え方を反映しています。直近のイベントが最も関連性が高く、今後数週間のイベントは重要性が徐々に低下し、遠すぎる未来のイベント（またはすでに過ぎたイベント）はまったく表示されるべきではありません。

## 数式\{#formula}

Linear decay スコアを計算する数学的な式は次のとおりです。

$$
S(doc) = \max\left( \frac\{s - \max(0, |fieldvalue_\{doc\} - origin| - offset)\}\{s\}, 0 \right)
$$

ここで、

$$
s = \frac \{scale\}\{(1.0 - decay)\}
$$

平易な言葉で分解すると、次のようになります。

1. フィールド値が origin からどれだけ離れているかを計算します: $|fieldvalue_\{doc\} - origin|$。

1. offset（存在する場合）を差し引きますが、ゼロ未満にはしません: $\max(0, distance - offset)$。

1. scale と decay の値からパラメータ $s$ を求めます。

1. 調整後の距離を $s$ から引き、その値を $s$ で割ります。

1. 結果がゼロ未満にならないようにします: $\max(result, 0)$。

$s$ の計算によって、scale と decay のパラメータはスコアがゼロに到達する地点へと変換されます。たとえば、decay=0.5 かつ scale=7 の場合、スコアは distance=14（scale 値の2倍）で正確にゼロに到達します。

## Linear Decay を使用する\{#use-linear-decay}

Linear decay は、Zilliz Cloud における標準的な vector search と hybrid search の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="Notes">

decay function を使用する前に、まず decay 計算に使用される適切な数値フィールド（タイムスタンプ、距離など）を持つ collection を作成する必要があります。collection のセットアップ、schema 定義、データ挿入を含む完全な動作例については、[Decay Ranker Tutorial](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### decay ranker を作成する\{#create-a-decay-ranker}

collection が数値フィールド（この例では、現在からの秒数としての `event_date`）でセットアップされたら、linear decay ranker を作成します。

<Admonition type="info" icon="📘" title="Notes">

**時間単位の一貫性**: 時間ベースの decay を使用する場合、`origin`、`scale`、`offset` パラメータが collection データと同じ時間単位を使用していることを確認してください。collection がタイムスタンプを秒で保存している場合は、すべてのパラメータに秒を使用してください。ミリ秒を使用している場合は、すべてのパラメータにミリ秒を使用してください。

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

decay ranker を定義したら、`ranker` パラメータに渡すことで search 操作中に適用できます。

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
