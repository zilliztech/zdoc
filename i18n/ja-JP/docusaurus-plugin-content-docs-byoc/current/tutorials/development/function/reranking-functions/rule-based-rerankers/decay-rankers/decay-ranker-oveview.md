---
title: "Decay Ranker の概要 | BYOC"
slug: /decay-ranker-oveview
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "従来のベクトル検索では、結果はベクトルの類似性だけでランク付けされます。つまり、数学空間でベクトルがどれだけ一致するかによって決まります。しかし、実際のアプリケーションでは、コンテンツが真に関連性の高いものになるかどうかは、意味的な類似性だけでは決まらないことがよくあります。 | BYOC"
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

従来のベクトル検索では、結果はベクトルの類似性だけでランク付けされます。つまり、数学空間でベクトルがどれだけ一致するかによって決まります。しかし、実際のアプリケーションでは、コンテンツが真に関連性の高いものになるかどうかは、意味的な類似性だけでは決まらないことがよくあります。

次のような日常的なシナリオを考えてみましょう。

- 昨日の記事が、3 年前の類似記事よりも上位にランク付けされるべきニュース検索

- 5 分で行ける店舗を、車で 30 分かかる店舗よりも優先するレストラン検索

- 検索クエリとの類似性がわずかに低くても、トレンドの商品を上位に表示する e コマースプラットフォーム

これらのシナリオには共通のニーズがあります。それは、ベクトルの類似性と、時間・距離・人気といった他の数値的要因のバランスを取ることです。

Zilliz Cloud の Decay Ranker は、数値フィールドの値に基づいて検索ランキングを調整することで、このニーズに対応します。これにより、ベクトルの類似性と、データの「新しさ」「近さ」、その他の数値的特性のバランスを取ることができ、より直感的で文脈に合った検索エクスペリエンスを実現できます。

## 使用上の注意\{#usage-notes}

- Decay ランキングはグループ化検索と併用できません。

- Decay ランキングに使用するフィールドは数値型（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、`DOUBLE`）である必要があります。

- 各 Decay Ranker で使用できる数値フィールドは 1 つだけです。

- **時間単位の一貫性**: 時間ベースの Decay ランキングを使用する場合、`origin`、`scale`、`offset` パラメーターの単位は、コレクションデータで使用されている単位と一致している必要があります。

    - コレクションがタイムスタンプを **秒** で保存している場合は、すべてのパラメーターに秒を使用します。

    - コレクションがタイムスタンプを **ミリ秒** で保存している場合は、すべてのパラメーターにミリ秒を使用します。

    - コレクションがタイムスタンプを **マイクロ秒** で保存している場合は、すべてのパラメーターにマイクロ秒を使用します。

## 仕組み\{#how-it-works}

Decay ランキングは、時間や地理的距離などの数値的要因をランキングプロセスに組み込むことで、従来のベクトル検索を強化します。プロセス全体は次の段階で構成されます。

### ステップ 1: 正規化された類似度スコアを計算する\{#stage-1-calculate-normalized-similarity-scores}

まず、Zilliz Cloud は一貫した比較を可能にするために、ベクトル類似度スコアを計算して正規化します。

- **L2** および **JACCARD** 距離メトリクスの場合（値が小さいほど類似度が高い）: 

    ```plaintext
    normalized_score = 1.0 - (2 × arctan(score))/π
    ```

    これにより、距離が 0-1 の類似度スコアに変換されます。値が大きいほど良い結果となります。

- **IP**、**COSINE**、**BM25** メトリクスの場合（スコアが高いほど既に良い一致を示す）: スコアは正規化せずにそのまま使用されます。

### ステップ 2: Decay スコアを計算する\{#stage-2-calculate-decay-scores}

次に、Zilliz Cloud は、選択した Decay Ranker を使用して、数値フィールドの値（タイムスタンプや距離など）に基づいて Decay スコアを計算します。

- 各 Decay Ranker は、生の数値を 0-1 の正規化された関連性スコアに変換します

- Decay スコアは、理想的なポイントからの「距離」に基づいて項目がどれだけ関連しているかを表します

具体的な計算式は Decay Ranker のタイプによって異なります。Decay スコアの計算方法の詳細については、[Gaussian Decay](./gaussian-decay#formula)、[Exponential Decay](./exponential-decay#formula)、[Linear Decay](./linear-decay#formula) の専用ページを参照してください。

### ステップ 3: 最終スコアを計算する\{#stage-3-compute-final-scores}

最後に、Zilliz Cloud は正規化された類似度スコアと Decay スコアを組み合わせて、最終的なランキングスコアを生成します。

```plaintext
final_score = normalized_similarity_score × decay_score
```

ハイブリッド検索（複数のベクトルフィールドを組み合わせる検索）の場合、Zilliz Cloud は検索リクエスト間で最大の正規化類似度スコアを採用します。

```plaintext
final_score = max([normalized_score₁, normalized_score₂, ..., normalized_scoreₙ]) × decay_score
```

たとえば、ハイブリッド検索で、ある研究論文がベクトル類似度から 0.82、BM25 ベースのテキスト検索から 0.91 のスコアを得た場合、Zilliz Cloud は Decay 係数を適用する前の基準類似度スコアとして 0.91 を使用します。

### Decay ランキングの実例\{#decay-ranking-in-action}

実際のシナリオで Decay ランキングを見てみましょう。ここでは、時間ベースの Decay を使用して **"AI research papers"** を検索します。

<Admonition type="info" icon="📘" title="Notes">

この例では、Decay スコアは時間の経過とともに関連性がどれだけ低下するかを表します。新しい論文ほど 1.0 に近いスコアを受け取り、古い論文ほど低いスコアを受け取ります。これらの値は特定の Decay Ranker を使用して計算されます。詳細については、[適切な Decay Ranker を選択する](./decay-ranker-oveview#choose-the-right-decay-ranker) を参照してください。

</Admonition>

<table>
   <tr>
     <th><p>論文</p></th>
     <th><p>ベクトル類似度</p></th>
     <th><p>正規化類似度スコア</p></th>
     <th><p>公開日</p></th>
     <th><p>Decay スコア</p></th>
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
     <td><p>中</p></td>
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

Decay リランキングを行わない場合、純粋なベクトル類似度（0.92）に基づくと論文 B が最も上位にランク付けされます。しかし、Decay リランキングを適用すると次のようになります。

- 論文 C は、類似度が中程度であるにもかかわらず、非常に新しい（昨日公開）ため、1 位に浮上します

- 論文 B は、類似度が非常に高いにもかかわらず、比較的古いため 4 位に下がります

- 論文 D は COSINE 類似度を使用するため、Decay を適用する前に 0.76 のスコアがそのまま使用されます

## 適切な Decay Ranker を選択する\{#choose-the-right-decay-ranker}

Zilliz Cloud では、それぞれ特定のユースケース向けに設計された個別の Decay Ranker（`gauss`、`exp`、`linear`）を提供しています。

<table>
   <tr>
     <th><p>Decay Ranker</p></th>
     <th><p>特性</p></th>
     <th><p>理想的なユースケース</p></th>
     <th><p>シナリオ例</p></th>
   </tr>
   <tr>
     <td><p>Gaussian（<code>gauss</code>）</p></td>
     <td><p>自然に感じられる緩やかな低下が、ほどよく広範囲に及ぶ</p></td>
     <td><ul><li><p>バランスの取れた結果が求められる一般的な検索</p></li><li><p>ユーザーが距離を直感的に把握できるアプリケーション</p></li><li><p>中程度の距離が結果に大きなペナルティを与えるべきでない場合</p></li></ul></td>
     <td><p>レストラン検索では、3 km 先の優良店舗も、近くの候補より下位にはなるものの、引き続き発見できます</p></td>
   </tr>
   <tr>
     <td><p>Exponential（<code>exp</code>）</p></td>
     <td><p>最初は急速に低下しますが、長い裾を維持する</p></td>
     <td><ul><li><p>新しさが重要なニュースフィード</p></li><li><p>新鮮なコンテンツが優先されるべきソーシャルメディア</p></li><li><p>近さが強く好まれる一方で、例外的に遠い項目も引き続き表示されるべき場合</p></li></ul></td>
     <td><p>ニュースアプリでは、昨日の記事が 1 週間前のコンテンツよりはるかに上位にランク付けされますが、非常に関連性の高い古い記事も引き続き表示される可能性があります</p></td>
   </tr>
   <tr>
     <td><p>Linear（<code>linear</code>）</p></td>
     <td><p>明確なカットオフを伴う、一貫性があり予測可能な低下</p></td>
     <td><ul><li><p>自然な境界があるアプリケーション</p></li><li><p>距離制限のあるサービス</p></li><li><p>有効期限や明確なしきい値があるコンテンツ</p></li></ul></td>
     <td><p>イベント検索では、2 週間より先のイベントはまったく表示されません</p></td>
   </tr>
</table>

各 Decay Ranker がスコアを計算する方法と、具体的な低下パターンの詳細については、専用のドキュメントを参照してください。

- [Gaussian Decay](./gaussian-decay)

- [Exponential Decay](./exponential-decay)

- [Linear Decay](./linear-decay)

## 実装例\{#implementation-example}

Decay Ranker は、Zilliz Cloud の標準ベクトル検索とハイブリッド検索の両方の操作に適用できます。以下に、この機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" icon="📘" title="Notes">

Decay 関数を使用する前に、Decay の計算に使用する適切な数値フィールド（タイムスタンプ、距離など）を含むコレクションをまず作成する必要があります。コレクションの設定、スキーマ定義、データ挿入を含む完全な動作例については、[チュートリアル: Zilliz Cloud での時間ベースランキングの実装](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### Decay Ranker を作成する\{#create-a-decay-ranker}

Decay ランキングを実装するには、まず適切な構成で `Function` オブジェクトを定義します。

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
     <th><p>値/Example</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>検索を実行する際に使用する関数の識別子です。ユースケースに合った説明的な名前を選択してください。</p></td>
     <td><p><code>"time_decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>Decay スコアを計算するための数値フィールドです。Decay の計算に使用するデータ属性（時間ベースの Decay ではタイムスタンプ、位置ベースの Decay では座標など）を指定します。</p><p>コレクション内の関連する数値を含むフィールドである必要があります。INT8/16/32/64, FLOAT, DOUBLE. をサポートします。</p></td>
     <td><p><code>["timestamp"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>作成する関数のタイプを指定します。</p><p>すべての Decay Ranker で <code>RERANK</code> に設定する必要があります。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用するリランキング方法を指定します。</p><p>Decay ランキング機能を有効にするには、<code>"decay"</code> に設定する必要があります。</p></td>
     <td><p><code>"decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>はい</p></td>
     <td><p>適用する数学的な Decay Ranker を指定します。関連性が低下する曲線の形状を決定します。</p><p>適切な関数の選択方法については、<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な Decay Ranker を選択する</a> セクションを参照してください。</p></td>
     <td><p><code>"gauss"</code>, <code>"exp"</code>, or <code>"linear"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>はい</p></td>
     <td><p>Decay スコアの計算の基準となる参照点です。この値を持つ項目は最大の関連性スコアを受け取ります。</p><p>時間ベースの Decay では、時間単位をコレクションデータと一致させる必要があります。</p></td>
     <td><ul><li><p>タイムスタンプの場合: 現在時刻（例: <code>int(time.time())</code>）</p></li><li><p>位置情報の場合: ユーザーの現在の座標</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>はい</p></td>
     <td><p>関連性が <code>decay</code> の値まで低下する距離または時間です。関連性が低下する速さを制御します。</p><p>時間ベースの Decay では、時間単位をコレクションデータと一致させる必要があります。</p><p>値が大きいほど関連性の低下が緩やかになり、値が小さいほど低下が急になります。</p></td>
     <td><ul><li><p>時間の場合: 秒単位の期間（例: 7 日間の <code>7 * 24 * 60 * 60</code>）</p></li><li><p>距離の場合: メートル（例: 5km の <code>5000</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>origin</code> の周囲に「Decay しないゾーン」を作成し、その範囲内の項目が満点のスコア（Decay スコア = 1.0）を維持するようにします。</p><p>時間ベースの Decay では、時間単位をコレクションデータと一致させる必要があります。</p><p><code>origin</code> からこの範囲内にある項目は、最大の関連性を維持します。</p></td>
     <td><ul><li><p>時間の場合: 秒単位の期間（例: 1 日間の <code>24 * 60 * 60</code>）</p></li><li><p>距離の場合: メートル（例: 500m の <code>500</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>scale</code> の距離におけるスコア値で、曲線の急峻さを制御します。値が小さいほど低下曲線が急になり、値が大きいほど低下曲線が緩やかになります。</p><p>0 から 1 の間である必要があります。</p></td>
     <td><p><code>0.5</code>（デフォルト）</p></td>
   </tr>
</table>

### 標準ベクトル検索に適用する\{#apply-to-standard-vector-search}

Decay Ranker を定義したら、検索操作時に `ranker` パラメーターに渡すことで適用できます。

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
