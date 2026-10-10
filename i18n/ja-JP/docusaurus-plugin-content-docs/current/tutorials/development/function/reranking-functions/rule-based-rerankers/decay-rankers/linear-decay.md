---
title: "Linear Decay | Cloud"
slug: /linear-decay
sidebar_label: "Linear Decay"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Linear decay は、検索結果において絶対的なゼロ点で終了する直線的な減少を生成します。開催が近いイベントのカウントダウンのように、イベントが終了するまで関連性が徐々に薄れていくのと同様に、Linear decay は、アイテムが理想的なポイントから離れるにつれて関連性を予測可能かつ一定の割合で減少させ、最終的に完全に消えます。このアプローチは、明確なカットオフを伴う一貫した減少率が必要な場合に最適であり、特定の境界を超えたアイテムが結果から完全に除外されることを保証します。 | Cloud"
type: origin
token: M7xHwZSIuiAP4Fkfm67cBU7Pn8g
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Linear Decay

Linear decay は、検索結果において絶対的なゼロ点で終了する直線的な減少を生成します。開催が近いイベントのカウントダウンのように、イベントが終了するまで関連性が徐々に薄れていくのと同様に、Linear decay は、アイテムが理想的なポイントから離れるにつれて関連性を予測可能かつ一定の割合で減少させ、最終的に完全に消えます。このアプローチは、明確なカットオフを伴う一貫した減少率が必要な場合に最適であり、特定の境界を超えたアイテムが結果から完全に除外されることを保証します。

他の decay 関数とは異なり、次のようになります。

- Gaussian decay は、徐々にゼロに近づきますが、決して到達しないベル曲線に従います。

- Exponential decay は、無期限に続く最小限の関連性の長いテールを維持します。

Linear decay は独自に明確な終了点を作成するため、自然な境界や期限を持つアプリケーションに特に効果的です。

## Linear decay を使用する場合\{#when-to-use-linear-decay}

Linear decay は、次のような場合に特に効果的です。

| ユースケース | 例 | Linear が効果的な理由 |
| --- | --- | --- |
| イベント一覧 | コンサートチケットプラットフォーム | あまりに先のイベントに対して明確なカットオフを作成します。 |
| 期間限定オファー | フラッシュセール、プロモーション | 期限切れまたはまもなく期限切れになるオファーが表示されないようにします。 |
| 配達半径 | フードデリバリー、宅配サービス | 地理的な厳密な境界を適用します。 |
| 年齢制限コンテンツ | 出会い系プラットフォーム、メディアサービス | 年齢の厳格なしきい値を設定します。 |

次の場合に Linear decay を選択します。

- アプリケーションに自然な境界、期限、またはしきい値がある場合。

- 特定のポイントを超えたアイテムを結果から完全に除外すべき場合。

- 関連性が予測可能で一貫性のある割合で低下する必要がある場合。

- ユーザーが関連アイテムと無関係アイテムを明確に区別できる必要がある場合。

## 一定の減少の原則\{#steady-decline-principle}

Linear decay は、正確にゼロに達するまで一定の割合で減少する直線的な低下を生成します。このパターンは、カウントダウンタイマー、在庫の枯渇、期限の接近など、関連性に明確な有効期限がある多くの日常的なシナリオに見られます。

<Admonition type="info" title="Notes">

すべての時間パラメーター（`origin`、`offset`、`scale`）は、コレクションデータと同じ単位を使用する必要があります。コレクションがタイムスタンプを別の単位（ミリ秒、マイクロ秒）で保存している場合は、すべてのパラメーターを適宜調整してください。

</Admonition>

![LNwQbV5FYo7OYbxaA1VcetPgnUh](https://zdoc-images.s3.us-west-2.amazonaws.com/lnwqbv5fyo7oybxaa1vcetpgnuh.png "LNwQbV5FYo7OYbxaA1VcetPgnUh")

上のグラフは、チケット販売プラットフォームにおけるイベント一覧に Linear decay がどのように影響するかを示しています。

- `origin`（現在の日付）：関連性が最大（1.0）になる現在の時点です。

- `offset`（1 日）：「直近イベントウィンドウ」—翌日以内に発生するすべてのイベントは完全な関連性スコア（1.0）を維持するため、ごく直近のイベントがわずかな時間差によってペナルティを受けないようにします。

- `decay`（0.5）：scale 距離でのスコアです—このパラメーターは関連性の低下率を制御します。

- `scale`（10 日）：関連性が decay 値まで低下する期間です—10 日先のイベントは関連性スコアが半分（0.5）になります。

この直線的な曲線からわかるように、約 16 日を超えて先にあるイベントは関連性が完全にゼロになり、検索結果にはまったく表示されません。これにより明確な境界が作成され、ユーザーには定義された時間枠内の関連する今後のイベントのみが表示されるようになります。

この動作は、イベント計画の一般的な仕組みを反映しています—直近のイベントが最も関連性が高く、今後数週間のイベントは重要度が低下し、あまりに先のイベント（またはすでに終了したイベント）はまったく表示されるべきではありません。

## 計算式\{#formula}

Linear decay スコアを計算する数式は次の通りです。

$$
S(doc) = \max\left( \frac{s - \max(0, |fieldvalue_{doc} - origin| - offset)}{s}, 0 \right)
$$

ここで、

$$
s = \frac {scale}{(1.0 - decay)}
$$

これを平易な言葉で説明すると、次のようになります。

1. フィールド値が origin からどれだけ離れているかを計算します：$|fieldvalue_{doc} - origin|$。

1. offset を減算します（存在する場合）。ただし、ゼロを下回らないようにします：$\max(0, distance - offset)$。

1. scale と decay の値からパラメーター $s$ を求めます。

1. $s$ から調整済みの距離を減算し、$s$ で除算します。

1. 結果がゼロを下回らないようにします：$\max(result, 0)$。

$s$ の計算は、scale と decay のパラメーターを、スコアがゼロに達するポイントに変換します。たとえば、decay=0.5 および scale=7 の場合、スコアは distance=14（scale 値の 2 倍）で正確にゼロに達します。

## Linear decay の使用方法\{#use-linear-decay}

Linear decay は、Zilliz Cloud の標準のベクトル検索とハイブリッド検索の両方の操作に適用できます。以下に、この機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" title="Notes">

decay 関数を使用する前に、まず decay 計算に使用する適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、データ挿入を含む完全な動作例については、[Decay Ranker チュートリアル](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### decay ランカーを作成する\{#create-a-decay-ranker}

コレクションに数値フィールド（この例では、現在からの秒数を表す `event_date`）を設定したら、Linear decay ランカーを作成します。

<Admonition type="info" title="Notes">

**時間単位の一貫性**：時間ベースの decay を使用する場合は、`origin`、`scale`、`offset` パラメーターがコレクションデータと同じ時間単位を使用していることを確認してください。コレクションがタイムスタンプを秒で保存している場合は、すべてのパラメーターに秒を使用します。ミリ秒を使用している場合は、すべてのパラメーターにミリ秒を使用します。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
import "time"

currentTime := time.Now().Unix()

rerank := entity.NewFunction().
    WithName("event_relevance").
    WithInputFields("event_date").
    WithType(entity.FunctionTypeRerank).
    WithParam("reranker", "decay").
    WithParam("function", "linear").
    WithParam("origin", currentTime).
    WithParam("scale", 7*24*60*60).
    WithParam("offset", 12*60*60).
    WithParam("decay", 0.5)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let rerank = DecayRerank::new()
        .function(Function::new()
            .name("event_relevance")
            .input_fields(["event_date"])
            .function_type(FunctionType::Rerank)
            .param("reranker", "decay"))
        .decay_function("linear")
        .origin(std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH).unwrap().as_secs())
        .scale(7 * 24 * 60 * 60)
        .offset(12 * 60 * 60)
        .decay(0.5);

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
auto rerank = std::make_shared<milvus::DecayRerank>("event_relevance");
rerank->AddInputFieldName("event_date");
rerank->SetFunction("linear");
rerank->SetOrigin(1736870400);
rerank->SetScale(7 * 24 * 60 * 60);
rerank->SetOffset(12 * 60 * 60);
rerank->SetDecay(0.5);
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

<TabItem value='bash'>

```bash
# Note: The RESTful API does not expose the decay/rerank operation as of Milvus v3.0.x.
```

</TabItem>
</Tabs>

### 標準のベクトル検索に適用する\{#apply-to-standard-vector-search}

decay ランカーを定義したら、検索操作時に `ranker` パラメーターに渡すことで適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='go'>

```go
functionScore := entity.NewFunctionScore().AddFunction(rerank)

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    collection_name, // collection name
    10,              // limit
    []entity.Vector{your_query_vector}, // query vector
).WithANNSField("dense").
    WithFunctionScore(functionScore).
    WithOutputFields("title", "venue", "event_date"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
    let function_score = FunctionScore::new().add_function(rerank);
    let request = SearchRequest::builder()
        .collection_name(collection_name)
        .vectors(SearchVectors::Float(vec![your_query_vector]))
        .vector_field("dense")
        .limit(10)
        .output_fields(vec!["title", "venue", "event_date"])
        .rerank(function_score)
        .build()?;
    let resp = client.search(request).await?;
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
status = client->Search(request, response);
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
  output_fields: ["title", "venue", "event_date"],
  rerank: rerank,
  consistency_level: "Strong",
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: The RESTful API does not expose the decay/rerank operation as of Milvus v3.0.x.
```

</TabItem>
</Tabs>
