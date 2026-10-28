---
title: "Decay Ranker の概要 | Cloud"
slug: /decay-ranker-oveview
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "従来のベクトル検索では、結果はベクトルの類似度、つまり数学空間でベクトルがどれだけ一致するかだけに基づいてランク付けされます。しかし、実際のアプリケーションでは、コンテンツが本当に関連しているかどうかは、意味的な類似度だけでは決まらないことがよくあります。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-decay-ranker-oveview
sidebar_label: "Decay Ranker の概要"
sidebar_position: 1
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/embeddings-reranking/reranking/decay-ranker-overview.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decay Ranker の概要

従来のベクトル検索では、結果はベクトルの類似度、つまり数学空間でベクトルがどれだけ一致するかだけに基づいてランク付けされます。しかし、実際のアプリケーションでは、コンテンツが本当に関連しているかどうかは、意味的な類似度だけでは決まらないことがよくあります。

次のような日常的なシナリオを考えてみましょう。

- 昨日の記事が、3 年前の類似記事よりも上位にランク付けされるべきニュース検索

- 5 分の距離にある店舗を、30 分の移動を要する店舗よりも優先するレストラン検索

- 検索クエリとの類似度が多少低くても、トレンドの商品をブーストする E コマースプラットフォーム

これらのシナリオには共通のニーズがあります。それは、ベクトルの類似度と、時間、距離、人気度などの他の数値要因のバランスを取ることです。

Zilliz Cloud の Decay Ranker は、数値フィールドの値に基づいて検索ランキングを調整することで、このニーズに対応します。ベクトルの類似度と、データの「鮮度」「近さ」、その他の数値特性のバランスを取ることができ、より直感的で文脈に即した検索体験を実現します。

## 使用上の注意\{#usage-notes}

- Decay ランキングはグループ化検索では使用できません。

- Decay ランキングに使用するフィールドは数値型（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`）である必要があります。

- 各 Decay Ranker は、数値フィールドを 1 つだけ使用できます。

- **時間単位の一貫性**: 時間ベースの Decay ランキングを使用する場合、`origin`、`scale`、`offset` パラメーターの単位は、コレクションデータで使用されている単位と一致している必要があります。

    - コレクションがタイムスタンプを**秒**で保存している場合は、すべてのパラメーターに秒を使用します。

    - コレクションがタイムスタンプを**ミリ秒**で保存している場合は、すべてのパラメーターにミリ秒を使用します。

    - コレクションがタイムスタンプを**マイクロ秒**で保存している場合は、すべてのパラメーターにマイクロ秒を使用します。

## 仕組み\{#how-it-works}

Decay ランキングは、時間や地理的距離などの数値要因をランキングプロセスに組み込むことで、従来のベクトル検索を強化します。プロセス全体は次の段階に従います。

### ステージ 1: 正規化された類似度スコアを計算する\{#stage-1-calculate-normalized-similarity-scores}

まず、Zilliz Cloud はベクトルの類似度スコアを計算して正規化し、一貫した比較を行えるようにします。

- **L2** および **JACCARD** 距離メトリクス（値が小さいほど類似度が高い）の場合:

    ```plaintext
    normalized_score = 1.0 - (2 × arctan(score))/π
    ```

    これにより、距離が 0～1 の類似度スコアに変換されます。値が大きいほど類似度が高くなります。

- **IP**、**COSINE**、**BM25** メトリクス（値が大きいほど一致度が高い）の場合: スコアは正規化せずにそのまま使用されます。

### ステージ 2: 減衰スコアを計算する\{#stage-2-calculate-decay-scores}

次に、Zilliz Cloud は、選択した Decay Ranker を使用して、数値フィールドの値（タイムスタンプや距離など）に基づいて減衰スコアを計算します。

- 各 Decay Ranker は、生の数値を 0～1 の正規化された関連度スコアに変換します。

- 減衰スコアは、理想的なポイントからの「距離」に基づいて、アイテムがどれだけ関連しているかを表します。

具体的な計算式は、Decay Ranker の種類によって異なります。減衰スコアの計算方法の詳細については、[Gaussian Decay](./gaussian-decay#formula)、[Exponential Decay](./exponential-decay#formula)、[Linear Decay](./linear-decay#formula) の各ページを参照してください。

### ステージ 3: 最終スコアを計算する\{#stage-3-compute-final-scores}

最後に、Zilliz Cloud は正規化された類似度スコアと減衰スコアを組み合わせて、最終的なランキングスコアを生成します。

```plaintext
final_score = normalized_similarity_score × decay_score
```

ハイブリッド検索（複数のベクトルフィールドを組み合わせる検索）の場合、Zilliz Cloud は検索リクエスト間で最大の正規化類似度スコアを取得します。

```plaintext
final_score = max([normalized_score₁, normalized_score₂, ..., normalized_scoreₙ]) × decay_score
```

たとえば、ハイブリッド検索で論文のベクトル類似度スコアが 0.82、BM25 ベースのテキスト検索のスコアが 0.91 の場合、Zilliz Cloud は減衰係数を適用する前に 0.91 を基準の類似度スコアとして使用します。

### 実際の Decay ランキング\{#decay-ranking-in-action}

時間ベースの減衰を使用して **「AI 研究論文」** を検索する実用的なシナリオで、Decay ランキングを見てみましょう：

<Admonition type="info" icon="📘" title="Notes">

この例では、減衰スコアは時間の経過とともに関連度がどのように低下するかを反映しています。新しい論文ほど 1.0 に近いスコアを受け取り、古い論文ほど低いスコアを受け取ります。これらの値は、特定の Decay Ranker を使用して計算されます。詳細については、[適切な Decay Ranker を選択する](./decay-ranker-oveview#choose-the-right-decay-ranker) を参照してください。

</Admonition>

<table>
   <tr>
     <th><p>論文</p></th>
     <th><p>ベクトル類似度</p></th>
     <th><p>正規化類似度スコア</p></th>
     <th><p>公開日</p></th>
     <th><p>減衰スコア</p></th>
     <th><p>最終スコア</p></th>
     <th><p>最終順位</p></th>
   </tr>
   <tr>
     <td><p>論文 A</p></td>
     <td><p>高</p></td>
     <td><p>0.85 (<code>COSINE</code>)</p></td>
     <td><p>2 週間前</p></td>
     <td><p>0.80</p></td>
     <td><p>0.68</p></td>
     <td>2</td>
   </tr>
   <tr>
     <td><p>論文 B</p></td>
     <td><p>非常に高い</p></td>
     <td><p>0.92 (<code>COSINE</code>)</p></td>
     <td><p>6 か月前</p></td>
     <td><p>0.45</p></td>
     <td><p>0.41</p></td>
     <td>4</td>
   </tr>
   <tr>
     <td><p>論文 C</p></td>
     <td><p>中程度</p></td>
     <td><p>0.75 (<code>COSINE</code>)</p></td>
     <td><p>1 日前</p></td>
     <td><p>0.98</p></td>
     <td><p>0.74</p></td>
     <td>1</td>
   </tr>
   <tr>
     <td><p>論文 D</p></td>
     <td><p>中〜高</p></td>
     <td><p>0.76 (<code>COSINE</code>)</p></td>
     <td><p>3 週間前</p></td>
     <td><p>0.70</p></td>
     <td><p>0.53</p></td>
     <td>3</td>
   </tr>
</table>

Decay 再ランキングを行わない場合、論文 B は純粋なベクトル類似度（0.92）に基づいて最高位にランク付けされます。しかし、Decay 再ランキングを適用すると、次のようになります。

- 論文 C は中程度の類似度にもかかわらず、非常に新しい（昨日公開された）ため、1 位に浮上します。

- 論文 B は類似度が非常に高くても、比較的古いため 4 位に下がります。

- 論文 D は COSINE 類似度を使用しているため、減衰を適用する前に 0.76 のスコアがそのまま使用されます。

## 適切な Decay Ranker を選択する\{#choose-the-right-decay-ranker}

Zilliz Cloud は `gauss`、`exp`、`linear` という異なる Decay Ranker を提供しており、それぞれ特定のユースケース向けに設計されています。

<table>
   <tr>
     <th><p>Decay Ranker</p></th>
     <th><p>特性</p></th>
     <th><p>理想的なユースケース</p></th>
     <th><p>シナリオ例</p></th>
   </tr>
   <tr>
     <td><p>Gaussian（<code>gauss</code>）</p></td>
     <td><p>自然な感覚で、適度に広がる緩やかな減少</p></td>
     <td><ul><li><p>バランスの取れた結果を必要とする一般的な検索</p></li><li><p>ユーザーが距離を直感的に把握できるアプリケーション</p></li><li><p>中程度の距離が結果に大きなペナルティを与えるべきでない場合</p></li></ul></td>
     <td><p>レストラン検索では、3 km 離れた良質な店舗も、近くの選択肢より下位ながら引き続き見つけることができます。</p></td>
   </tr>
   <tr>
     <td><p>Exponential（<code>exp</code>）</p></td>
     <td><p>初期は急速に減少しつつ、ロングテールを維持する性質</p></td>
     <td><ul><li><p>新しさが重要なニュースフィード</p></li><li><p>新しいコンテンツが優先されるべきソーシャルメディア</p></li><li><p>近接性を強く優先しつつ、例外的に遠いアイテムも表示し続けるべき場合</p></li></ul></td>
     <td><p>ニュースアプリでは、昨日の記事は 1 週間前のコンテンツよりもはるかに上位にランク付けされますが、非常に関連性の高い古い記事も表示されることがあります。</p></td>
   </tr>
   <tr>
     <td><p>Linear（<code>linear</code>）</p></td>
     <td><p>明確なカットオフを伴う、一貫性があり予測可能な減少</p></td>
     <td><ul><li><p>自然な境界があるアプリケーション</p></li><li><p>距離制限があるサービス</p></li><li><p>有効期限や明確なしきい値があるコンテンツ</p></li></ul></td>
     <td><p>イベント検索では、2 週間より先のイベントはまったく表示されません。</p></td>
   </tr>
</table>

各 Decay Ranker のスコア計算方法と具体的な減少パターンの詳細については、専用のドキュメントを参照してください。

- [Gaussian Decay](./gaussian-decay)

- [Exponential Decay](./exponential-decay)

- [Linear Decay](./linear-decay)

## 実装例\{#implementation-example}

Decay Ranker は、Zilliz Cloud の標準ベクトル検索とハイブリッド検索の両方に適用できます。以下に、この機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" icon="📘" title="Notes">

減衰関数を使用する前に、まず減衰計算に使用する適切な数値フィールド（タイムスタンプ、距離など）を含むコレクションを作成する必要があります。コレクションの設定、スキーマ定義、データ挿入を含む完全な動作例については、[チュートリアル: Zilliz Cloud で時間ベースのランキングを実装する](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### Decay Ranker を作成する\{#create-a-decay-ranker}

Decay ランキングを実装するには、まず適切な設定で `Function` オブジェクトを定義します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import datetime

# Create a decay function for timestamp-based decay
# Note: All time parameters must use the same unit as your collection data
rerank = Function(
    name="time_decay",                  # Function identifier
    input_field_names=["timestamp"],    # Numeric field to use for decay
    function_type=FunctionType.RERANK,  # Must be set to RERANK for decay rankers
    params={
        "reranker": "decay",            # Specify decay reranker. Must be "decay"
        "function": "gauss",            # Choose decay function type: "gauss", "exp", or "linear"
        "origin": int(datetime.datetime(2025, 1, 15).timestamp()),    # Reference point (seconds)
        "scale": 7 * 24 * 60 * 60,      # 7 days in seconds (must match collection data unit)
        "offset": 24 * 60 * 60,         # 1 day no-decay zone (must match collection data unit)
        "decay": 0.5                    # Half score at scale distance
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;
import java.time.ZoneId;
import java.time.ZonedDateTime;
import java.util.Collections;

ZonedDateTime zdt = ZonedDateTime.of(2025, 1, 25, 0, 0, 0, 0, ZoneId.systemDefault());

DecayRanker rerank = DecayRanker.builder()
        .name("time_decay")
        .inputFieldNames(Collections.singletonList("timestamp"))
        .function("gauss")
        .origin(zdt.toInstant().getEpochSecond())
        .scale(7 * 24 * 60 * 60)
        .offset(24 * 60 * 60)
        .decay(0.5)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v3/entity"

rerank := entity.NewFunction().
    WithName("time_decay").
    WithInputFields("timestamp").
    WithType(entity.FunctionTypeRerank).
    WithParam("reranker", "decay").
    WithParam("function", "gauss").
    WithParam("origin", 1735689600).
    WithParam("scale", 7*24*60*60).
    WithParam("offset", 24*60*60).
    WithParam("decay", 0.5)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
let client = ClientV2::new(&config).await?;

let rerank = DecayRerank::new()
    .function(Function::new()
        .name("time_decay")
        .input_fields(["timestamp"])
        .function_type(FunctionType::Rerank)
        .param("reranker", "decay"))
    .decay_function("gauss")
    .origin(1735689600)
    .scale(7 * 24 * 60 * 60)
    .offset(24 * 60 * 60)
    .decay(0.5);
```

</TabItem>

<TabItem value='c++'>

```c++
auto rerank = std::make_shared<milvus::DecayRerank>("time_decay");
rerank->AddInputFieldName("timestamp");
rerank->SetFunction("gauss");
rerank->SetOrigin(1735689600);
rerank->SetScale(7 * 24 * 60 * 60);
rerank->SetOffset(24 * 60 * 60);
rerank->SetDecay(0.5);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import {FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "time_decay",
  input_field_names: ["timestamp"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "gauss",
    origin: Math.floor(Date.UTC(2025, 0, 15) / 1000),
    scale: 7 * 24 * 60 * 60,
    offset: 24 * 60 * 60,
    decay: 0.5,
  },
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2.Types;

// Create a decay function for timestamp-based decay
// Note: All time parameters must use the same unit as your collection data
var rerank = new DecayRerank("time_decay")     // Function identifier
    .WithInputField("timestamp")                // Numeric field to use for decay
    .WithFunction("gauss")                       // Choose decay function type: "gauss", "exp", or "linear"
    .WithOrigin(new DateTimeOffset(2025, 1, 15, 0, 0, 0, TimeSpan.Zero).ToUnixTimeSeconds()) // Reference point (seconds)
    .WithScale(7 * 24 * 60 * 60)                 // 7 days in seconds (must match collection data unit)
    .WithOffset(24 * 60 * 60)                    // 1 day no-decay zone (must match collection data unit)
    .WithDecay(0.5f);                            // Half score at scale distance
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

</Tabs>

<table>
   <tr>
     <th><p>パラメーター</p></th>
     <th><p>必須</p></th>
     <th><p>説明</p></th>
     <th><p>Value/Example</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>検索実行時に使用する関数の識別子です。ユースケースに合ったわかりやすい名前を選択してください。</p></td>
     <td><p><code>"time_decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>減衰スコア計算用の数値フィールドです。減衰の計算に使用するデータ属性を決定します（例：時間ベースの減衰ではタイムスタンプ、位置ベースの減衰では座標）。</p><p>関連する数値を含むコレクション内のフィールドである必要があります。INT8/16/32/64, FLOAT, DOUBLE をサポートします。</p></td>
     <td><p><code>["timestamp"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>作成する関数の種類を指定します。</p><p>すべての Decay Ranker で <code>RERANK</code> に設定する必要があります。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用する再ランキング方法を指定します。</p><p>Decay ランキング機能を有効にするには、<code>"decay"</code> に設定する必要があります。</p></td>
     <td><p><code>"decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>はい</p></td>
     <td><p>適用する数学的な Decay Ranker を指定します。関連度の低下曲線の形状を決定します。</p><p>適切な関数の選択については、<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な Decay Ranker を選択する</a>セクションを参照してください。</p></td>
     <td><p><code>"gauss"</code>、<code>"exp"</code>、または <code>"linear"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>はい</p></td>
     <td><p>減衰スコアの計算基準となる参照ポイントです。この値を持つアイテムは最大の関連度スコアを受け取ります。</p><p>時間ベースの減衰では、時間単位がコレクションデータと一致している必要があります。</p></td>
     <td><ul><li><p>タイムスタンプの場合：現在時刻（例：<code>int(time.time())</code>）</p></li><li><p>位置情報の場合：ユーザーの現在の座標</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>はい</p></td>
     <td><p><code>decay</code> の値まで関連度が低下する距離または時間です。関連度が低下する速さを制御します。</p><p>時間ベースの減衰では、時間単位をコレクションデータと一致させる必要があります。</p><p>値が大きいほど関連度の低下が緩やかになり、値が小さいほど低下が急になります。</p></td>
     <td><ul><li><p>時間の場合：秒単位の期間（例：7 日間の場合は <code>7 * 24 * 60 * 60</code>）</p></li><li><p>距離の場合：メートル（例：5 km の場合は <code>5000</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>origin</code> の周囲に、アイテムが満点のスコア（減衰スコア = 1.0）を維持する「減衰なしゾーン」を作成します。</p><p>時間ベースの減衰では、時間単位をコレクションデータと一致させる必要があります。</p><p><code>origin</code> からこの範囲内にあるアイテムは、最大の関連度を維持します。</p></td>
     <td><ul><li><p>時間の場合：秒単位の期間（例：1 日間の場合は <code>24 * 60 * 60</code>）</p></li><li><p>距離の場合：メートル（例：500 m の場合は <code>500</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>scale</code> の距離でのスコア値で、曲線の急峻さを制御します。値が小さいほど低下曲線が急になり、値が大きいほど低下曲線が緩やかになります。</p><p>0 から 1 の間である必要があります。</p></td>
     <td><p><code>0.5</code>（デフォルト）</p></td>
   </tr>
</table>

### 標準ベクトル検索に適用する\{#apply-to-standard-vector-search}

Decay Ranker を定義したら、`ranker` パラメーターに渡すことで検索操作中に適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Use the decay function in standard vector search
results = milvus_client.search(
    collection_name,
    data=[your_query_vector], # Replace with your query vector
    anns_field="vector_field",
    limit=10,
    output_fields=["document", "timestamp"],  # Include the decay field in outputs to see values
    #  highlight-next-line
    ranker=rerank,                      # Apply the decay ranker here
    consistency_level="Strong"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.FunctionScore;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.Arrays;
import java.util.Collections;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("search query")))
        .annsField("vector_field")
        .limit(10)
        .outputFields(Arrays.asList("document", "timestamp"))
        .functionScore(FunctionScore.builder()
                .addFunction(rerank)
                .build())
        .build();
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

functionScore := entity.NewFunctionScore().AddFunction(rerank)

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    collection_name, // collection name
    10,              // limit
    []entity.Vector{your_query_vector}, // query vector
).WithANNSField("vector_field").
    WithFunctionScore(functionScore).
    WithOutputFields("document", "timestamp"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let function_score = FunctionScore::new().add_function(rerank);
let request = SearchRequest::builder()
    .collection_name(collection_name)
    .vectors(SearchVectors::Float(vec![your_query_vector]))
    .vector_field("vector_field")
    .limit(10)
    .output_fields(vec!["document", "timestamp"])
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
                   .WithAnnsField("vector_field")
                   .WithLimit(10)
                   .WithRerank(function_score)
                   .AddOutputField("document")
                   .AddOutputField("timestamp")
                   .AddFloatVector(your_query_vector);

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
  anns_field: "vector_field",
  limit: 10,
  output_fields: ["document", "timestamp"],
  rerank: rerank,
  consistency_level: "Strong",
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Responses.Dql;
using Milvus.Client.V2.Types;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT",
    ApiKey = "YOUR_CLUSTER_TOKEN"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

// Use the decay function in standard vector search
SearchResp results = await client.SearchAsync(new SearchReq
{
    CollectionName = collectionName,
    Vectors = [yourQueryVector], // Replace with your query vector
    VectorFieldName = "vector_field",
    Limit = 10,
    Parameters = new SearchParameters
    {
        OutputFields = { "document", "timestamp" },  // Include the decay field in outputs to see values
        FunctionScoreReranker = rerank,              // Apply the decay ranker here
        ConsistencyLevel = ConsistencyLevel.Strong
    }
});
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>

</Tabs>
