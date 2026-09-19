---
title: "Linear Decay | Cloud"
slug: /linear-decay
sidebar_label: "Linear Decay"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Linear decay は、検索結果において絶対的なゼロ点で終わる直線的な低下を生み出します。今後開催されるイベントのカウントダウンのように、イベントが終わるまで関連性が徐々に薄れていくのと同様に、linear decay は、アイテムが理想的なポイントから離れるにつれて、完全に消えるまで、予測可能で一定の関連性低下を適用します。このアプローチは、明確なカットオフを伴う一貫した減衰率が必要な場合に最適であり、特定の境界を超えたアイテムが結果から完全に除外されることを保証します。 | Cloud"
type: origin
token: M7xHwZSIuiAP4Fkfm67cBU7Pn8g
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linear Decay

Linear decay は、検索結果において絶対的なゼロ点で終わる直線的な低下を生み出します。今後開催されるイベントのカウントダウンのように、イベントが終わるまで関連性が徐々に薄れていくのと同様に、linear decay は、アイテムが理想的なポイントから離れるにつれて、完全に消えるまで、予測可能で一定の関連性低下を適用します。このアプローチは、明確なカットオフを伴う一貫した減衰率が必要な場合に最適であり、特定の境界を超えたアイテムが結果から完全に除外されることを保証します。

他の decay 関数とは異なり、次のような特徴があります。

- Gaussian decay は、徐々にゼロに近づきますが決してゼロには達しないベルカーブに従います

- Exponential decay は、無期限に続く最小限の関連性の長いテールを維持します

Linear decay は、明確な終点を独自に作り出すため、自然な境界や期限を持つアプリケーションで特に効果的です。

## Linear decay を使用するタイミング\{#when-to-use-linear-decay}

Linear decay は、特に次のようなケースで効果的です。

| ユースケース | 例 | Linear が適している理由 |
| --- | --- | --- |
| イベント一覧 | コンサートチケットプラットフォーム | 将来の遠すぎるイベントに対して明確なカットオフを作成します。 |
| 期間限定オファー | フラッシュセール、プロモーション | 期限切れ、またはまもなく期限切れになるオファーが表示されないようにします。 |
| 配達半径 | フードデリバリー、宅配サービス | 地理的な厳密な境界を適用します。 |
| 年齢制限コンテンツ | マッチングプラットフォーム、メディアサービス | 厳格な年齢しきい値を確立します。 |

次のような場合は Linear decay を選択してください。

- アプリケーションに自然な境界、期限、またはしきい値がある

- 特定のポイントを超えたアイテムを結果から完全に除外する必要がある

- 予測可能で一貫した関連性低下率が必要である

- ユーザーに、関連性のあるアイテムと関連性のないアイテムの明確な区別が見える必要がある

## 一定の低下の原則\{#steady-decline-principle}

Linear decay は、一定の割合で低下し、正確にゼロに達するまで減少し続ける直線的な下降を作り出します。このパターンは、カウントダウンタイマー、在庫の減少、期限の接近など、関連性に明確な有効期限がある多くの日常的なシナリオに現れます。

<Admonition type="info" title="Notes">

すべての時間パラメーター（`origin`、`offset`、`scale`）は、コレクションデータと同じ単位を使用する必要があります。コレクションがタイムスタンプを別の単位（ミリ秒、マイクロ秒）で保存している場合は、すべてのパラメーターをそれに合わせて調整してください。

</Admonition>

![LNwQbV5FYo7OYbxaA1VcetPgnUh](https://zdoc-images.s3.us-west-2.amazonaws.com/lnwqbv5fyo7oybxaa1vcetpgnuh.png "LNwQbV5FYo7OYbxaA1VcetPgnUh")

上のグラフは、linear decay がチケット販売プラットフォームのイベント一覧にどのような影響を与えるかを示しています。

- `origin`（現在日付）：現在の時点であり、関連性が最大値（1.0）になります。

- `offset`（1 日）：「直近のイベントウィンドウ」です。翌日までに開催されるすべてのイベントは完全な関連性スコア（1.0）を維持し、ごく直近のイベントがわずかな時間差によって不利益を受けないようにします。

- `decay`（0.5）：scale 距離におけるスコアです。このパラメーターは、関連性の低下率を制御します。

- `scale`（10 日）：関連性が decay 値まで低下する期間です。10 日後のイベントは、関連性スコアが半分（0.5）になります。

直線的なカーブからわかるように、およそ 16 日以上先のイベントは関連性が正確にゼロになり、検索結果にはまったく表示されません。これにより明確な境界が作られ、ユーザーには定義された期間内の関連性のある今後のイベントだけが表示されるようになります。

この挙動は、イベント計画が通常どのように行われるかを反映しています。直近のイベントが最も関連性が高く、今後数週間のイベントは重要性が徐々に低下し、あまりに先の未来のイベント（またはすでに終了したイベント）はまったく表示されるべきではありません。

## 数式\{#formula}

Linear decay スコアを計算する数式は次のとおりです。

$$
S(doc) = \max\left( \frac{s - \max(0, |fieldvalue_{doc} - origin| - offset)}{s}, 0 \right)
$$

ここで、

$$
s = \frac {scale}{(1.0 - decay)}
$$

これを平易な言葉で説明すると、次のようになります。

1. フィールド値が origin からどれだけ離れているかを計算します：$|fieldvalue_{doc} - origin|$。

1. offset（存在する場合）を差し引きますが、ゼロ未満にはしません：$\max(0, distance - offset)$。

1. scale と decay の値からパラメーター $s$ を求めます。

1. $s$ から調整後の距離を差し引き、$s$ で割ります。

1. 結果がゼロ未満にならないようにします：$\max(result, 0)$。

$s$ の計算では、scale と decay パラメーターを、スコアがゼロに達するポイントに変換します。たとえば、decay=0.5 かつ scale=7 の場合、スコアは distance=14（scale 値の 2 倍）で正確にゼロに達します。

## Linear decay を使用する\{#use-linear-decay}

Linear decay は、Zilliz Cloud における標準的なベクトル検索とハイブリッド検索の両方の操作に適用できます。以下に、この機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" title="Notes">

decay 関数を使用する前に、まず decay の計算に使用する適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、データ挿入を含む完全な動作例については、[時間ベースのランキングを実装するチュートリアル](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### decay ranker を作成する\{#create-a-decay-ranker}

コレクションに数値フィールド（この例では、現在からの秒数を表す `event_date`）を設定したら、linear decay ranker を作成します。

<Admonition type="info" title="Notes">

**時間単位の一貫性**：時間ベースの decay を使用する場合は、`origin`、`scale`、`offset` の各パラメーターがコレクションデータと同じ時間単位を使用していることを確認してください。コレクションがタイムスタンプを秒で保存している場合は、すべてのパラメーターに秒を使用してください。ミリ秒を使用している場合は、すべてのパラメーターにミリ秒を使用してください。

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

### 標準ベクトル検索に適用する\{#apply-to-standard-vector-search}

decay ranker を定義したら、検索操作時にそれを `ranker` パラメーターに渡すことで適用できます。

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
