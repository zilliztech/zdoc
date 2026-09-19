---
title: "Decay Ranker の概要 | Cloud"
slug: /decay-ranker-oveview
sidebar_label: "Decay Ranker の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "従来のベクトル検索では、結果は純粋にベクトル類似度（数学空間におけるベクトルの近さ）に基づいてランキングされます。しかし実際のアプリケーションでは、コンテンツの真の関連性は意味的な類似性だけでなく、より多くの要素に依存することが少なくありません。 | Cloud"
type: origin
token: QZYhwcQhWigYTVkLnHeczkwYnZb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decay Ranker の概要

従来のベクトル検索では、結果は純粋にベクトル類似度（数学空間におけるベクトルの近さ）に基づいてランキングされます。しかし実際のアプリケーションでは、コンテンツの真の関連性は意味的な類似性だけでなく、より多くの要素に依存することが少なくありません。

次のような日常的なシナリオを考えてみましょう。

- ニュース検索で、昨日の記事が 3 年前の類似記事よりも上位に表示されるべき場合

- レストラン検索で、車で 30 分かかる店舗よりも 5 分の距離にある店舗を優先する場合

- E コマースプラットフォームで、検索クエリとの類似度がやや低くても、トレンド商品を上位に表示する場合

これらのシナリオには共通のニーズがあります。それは、ベクトル類似度と、時間、距離、人気度といった他の数値的要因のバランスを取ることです。

Zilliz Cloud の Decay Ranker は、数値フィールドの値に基づいて検索ランキングを調整することで、このニーズに応えます。ベクトル類似度と、データの「新しさ」「近さ」などの数値的特性のバランスを取ることで、より直感的で文脈に即した検索体験を実現します。

## 使用上の注意\{#usage-notes}

- Decay Ranking はグループ検索と併用できません。

- Decay Ranking に使用するフィールドは数値型（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、または `DOUBLE`）である必要があります。

- 各 Decay Ranker で使用できる数値フィールドは1つだけです。

- **時間単位の一貫性**: 時間ベースの Decay Ranking を使用する場合、`origin`、`scale`、`offset` パラメーターの単位は、コレクションのデータで使用されている単位と一致させる必要があります。

    - コレクションがタイムスタンプを**秒**で保存している場合は、すべてのパラメーターに秒を使用します。

    - コレクションがタイムスタンプを**ミリ秒**で保存している場合は、すべてのパラメーターにミリ秒を使用します。

    - コレクションがタイムスタンプを**マイクロ秒**で保存している場合は、すべてのパラメーターにマイクロ秒を使用します。

## 仕組み\{#how-it-works}

Decay Ranking は、時間や地理的距離などの数値的要因をランキング処理に組み込むことで、従来のベクトル検索を強化します。一連の処理は以下の段階で構成されます。

### ステージ 1: 正規化類似度スコアを計算する\{#stage-1-calculate-normalized-similarity-scores}

まず、Zilliz Cloud がベクトル類似度スコアを計算して正規化し、一貫した比較を行えるようにします。

- **L2** および **JACCARD** 距離メトリック（値が小さいほど類似度が高い）の場合:

    ```plaintext
    normalized_score = 1.0 - (2 × arctan(score))/π
    ```

    これにより、距離が 0〜1 の類似度スコアに変換されます。値が大きいほど類似度が高いことを示します。

- **IP**、**COSINE**、**BM25** メトリック（スコアが高いほど一致度が高い）の場合: スコアは正規化せずにそのまま使用されます。

### ステージ 2: Decay スコアを計算する\{#stage-2-calculate-decay-scores}

次に、Zilliz Cloud は、選択した Decay Ranker を使用して、数値フィールドの値（タイムスタンプや距離など）に基づいて Decay スコアを計算します。

- 各 Decay Ranker は、生の数値を 0〜1 の正規化された関連性スコアに変換します

- Decay スコアは、理想的なポイントからの「距離」に基づくアイテムの関連性を表します

具体的な計算式は Decay Ranker の種類によって異なります。Decay スコアの計算方法の詳細については、[Gaussian Decay](./gaussian-decay#formula)、[Exponential Decay](./exponential-decay#formula)、[Linear Decay](./linear-decay#formula) の専用ページを参照してください。

### ステージ 3: 最終スコアを算出する\{#stage-3-compute-final-scores}

最後に、Zilliz Cloud は正規化類似度スコアと Decay スコアを組み合わせて、最終的なランキングスコアを生成します。

```plaintext
final_score = normalized_similarity_score × decay_score
```

ハイブリッド検索（複数のベクトルフィールドを組み合わせる場合）では、Zilliz Cloud は検索リクエスト間で最大の正規化類似度スコアを採用します。

```plaintext
final_score = max([normalized_score₁, normalized_score₂, ..., normalized_scoreₙ]) × decay_score
```

例えば、ハイブリッド検索で、ある研究論文がベクトル類似度から 0.82、BM25 ベースのテキスト検索から 0.91 のスコアを獲得した場合、Zilliz Cloud は Decay 係数を適用する前のベース類似度スコアとして 0.91 を使用します。

### Decay Ranking の実際の動作\{#decay-ranking-in-action}

時間ベースの Decay を使用して **"AI research papers"** を検索する実践的なシナリオで、Decay Ranking の動作を確認してみましょう。

<Admonition type="info" title="Notes">

この例では、Decay スコアが時間の経過に伴う関連性の低下を反映しています。新しい論文ほど 1.0 に近いスコアとなり、古い論文ほど低いスコアになります。これらの値は特定の Decay Ranker を使用して計算されます。詳細については、[適切な Decay Ranker の選択](./decay-ranker-oveview#choose-the-right-decay-ranker) を参照してください。

</Admonition>

| 論文 | ベクトル類似度 | 正規化類似度スコア | 公開日 | Decay スコア | 最終スコア | 最終順位 |
| --- | --- | --- | --- | --- | --- | --- |
| 論文 A | 高 | 0.85 (`COSINE`) | 2 週間前 | 0.80 | 0.68 | #2 |
| 論文 B | 非常に高 | 0.92 (`COSINE`) | 6 か月前 | 0.45 | 0.41 | #3 |
| 論文 C | 中 | 0.75 (`COSINE`) | 1 日前 | 0.98 | 0.74 | #1 |
| 論文 D | 中〜高 | 0.76 (`COSINE`) | 3 週間前 | 0.70 | 0.53 | #4 |

Decay リランキングを適用しない場合、論文 B は純粋なベクトル類似度（0.92）に基づいて最も高い順位になります。しかし、Decay リランキングを適用すると次のようになります。

- 論文 C は類似度が中程度であるにもかかわらず、非常に新しい（昨日公開された）ため、1 位に浮上します

- 論文 B は類似度が非常に高いにもかかわらず、比較的古いため、3 位に後退します

- 論文 D は L2 距離（値が小さいほど良い）を使用しているため、Decay を適用する前にスコアが 1.2 から 0.76 に正規化されます

## 適切な Decay Ranker の選択\{#choose-the-right-decay-ranker}

Zilliz Cloud は、それぞれ特定のユースケース向けに設計された `gauss`、`exp`、`linear` という個別の Decay Ranker を提供しています。

<table>
   <tr>
     <th><p>Decay Ranker</p></th>
     <th><p>特徴</p></th>
     <th><p>最適なユースケース</p></th>
     <th><p>シナリオ例</p></th>
   </tr>
   <tr>
     <td><p>Gaussian (<code>gauss</code>)</p></td>
     <td><p>自然に感じられる、適度に広がりのある緩やかな低下</p></td>
     <td><ul><li><p>バランスの取れた結果が必要な一般的な検索</p></li><li><p>ユーザーが距離を直感的に把握できるアプリケーション</p></li><li><p>中程度の距離によって結果に厳しいペナルティを与えるべきではない場合</p></li></ul></td>
     <td><p>レストラン検索では、3 km 離れた高品質な店舗も、近くの選択肢より下位ながら引き続き見つけられる</p></td>
   </tr>
   <tr>
     <td><p>Exponential (<code>exp</code>)</p></td>
     <td><p>最初は急速に減少するが、長いテールを維持する</p></td>
     <td><ul><li><p>最新性が重要となるニュースフィード</p></li><li><p>新鮮なコンテンツが優先されるソーシャルメディア</p></li><li><p>近接性が強く好まれる一方で、例外的に離れたアイテムも表示され続けるべき場合</p></li></ul></td>
     <td><p>ニュースアプリでは、昨日の記事が 1 週間前のコンテンツよりはるかに上位にランクされるが、関連性の高い古い記事も引き続き表示される</p></td>
   </tr>
   <tr>
     <td><p>Linear (<code>linear</code>)</p></td>
     <td><p>明確なカットオフを伴う、一貫した予測可能な低下</p></td>
     <td><ul><li><p>自然な境界があるアプリケーション</p></li><li><p>距離制限があるサービス</p></li><li><p>有効期限や明確なしきい値があるコンテンツ</p></li></ul></td>
     <td><p>イベント検索では、2 週間先の期間を超えるイベントはまったく表示されない</p></td>
   </tr>
</table>

各 Decay Ranker がスコアを計算する方法と、具体的な低下パターンの詳細については、次の専用ドキュメントを参照してください。

- [Gaussian Decay](./gaussian-decay)

- [Exponential Decay](./exponential-decay)

- [Linear Decay](./linear-decay)

## 実装例\{#implementation-example}

Decay Ranker は、Zilliz Cloud の標準ベクトル検索とハイブリッド検索の両方に適用できます。以下に、この機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" title="Notes">

Decay 関数を使用する前に、まず Decay 計算に使用する適切な数値フィールド（タイムスタンプや距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、データ挿入を含む完全な動作例については、[チュートリアル: Milvus で時間ベースのランキングを実装する](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### Decay Ranker を作成する\{#create-a-decay-ranker}

Decay ランキングを実装するには、まず適切な設定で `Function` オブジェクトを定義します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

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

ZonedDateTime zdt = ZonedDateTime.of(2025, 1, 25, 0, 0, 0, 0, ZoneId.systemDefault());

DecayRanker rerank = DecayRanker.builder()
        .name("time_decay")
        .inputFieldNames(Collections.singletonList("timestamp"))
        .function("gauss")
        .origin(zdt.toInstant().toEpochMilli())
        .scale(7 * 24 * 60 * 60)
        .offset(24 * 60 * 60)
        .decay(0.5)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import {FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "time_decay",
  input_field_names: ["timestamp"],
  function_type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "gauss",
    origin: new Date(2025, 1, 15).getTime(),
    scale: 7 * 24 * 60 * 60,
    offset: 24 * 60 * 60,
    decay: 0.5,
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
auto rerank = std::make_shared<milvus::DecayRerank>("time_decay");
rerank->AddInputFieldName("timestamp");
rerank->SetFunction("gauss");
rerank->SetOrigin(1735689600);
rerank->SetScale(7 * 24 * 60 * 60);
rerank->SetOffset(24 * 60 * 60);
rerank->SetDecay(0.5);
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
     <td><p>検索を実行するときに使用される関数の識別子です。ユースケースに合ったわかりやすい名前を付けてください。</p></td>
     <td><p><code>&quot;time_decay&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>Decay スコアの計算に使用する数値フィールドです。Decay の計算に使用するデータ属性を決定します（例: 時間ベースの Decay の場合はタイムスタンプ、位置ベースの Decay の場合は座標）。</p><p>関連する数値を含むコレクション内のフィールドである必要があります。INT8/16/32/64, FLOAT、DOUBLE をサポートします。</p></td>
     <td><p><code>[&quot;timestamp&quot;]</code></p></td>
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
     <td><p>使用するリランキング方法を指定します。</p><p>Decay ランキング機能を有効にするには、<code>&quot;decay&quot;</code> に設定する必要があります。</p></td>
     <td><p><code>&quot;decay&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>はい</p></td>
     <td><p>適用する数学的な Decay Ranker を指定します。関連性が低下するときの曲線の形状を決定します。</p><p>適切な関数の選択に関するガイダンスについては、<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な Decay Ranker の選択</a> セクションを参照してください。</p></td>
     <td><p><code>&quot;gauss&quot;</code>、<code>&quot;exp&quot;</code>、または <code>&quot;linear&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>はい</p></td>
     <td><p>Decay スコアの算出の基準となる参照点です。この値にあるアイテムは最大の関連性スコアを受け取ります。</p><p>時間ベースの Decay では、時間の単位をコレクションのデータと一致させる必要があります。</p></td>
     <td><ul><li><p>タイムスタンプの場合: 現在時刻（例: <code>int(time.time())</code>）</p></li><li><p>地理位置情報の場合: ユーザーの現在の座標</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>はい</p></td>
     <td><p>関連性が <code>decay</code> の値まで低下する距離または時間です。関連性が低下する速さを制御します。</p><p>時間ベースの Decay では、時間の単位をコレクションのデータと一致させる必要があります。</p><p>値が大きいほど関連性は緩やかに低下し、値が小さいほど急激に低下します。</p></td>
     <td><ul><li><p>時間の場合: 秒単位の期間（例: 7 日間の場合は <code>7 &ast; 24 &ast; 60 &ast; 60</code>）</p></li><li><p>距離の場合: メートル単位（例: 5 km の場合は <code>5000</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>origin</code> の周囲に「Decay なしゾーン」を作成し、その範囲内のアイテムはフルスコア（Decay スコア = 1.0）を維持します。</p><p>時間ベースの Decay では、時間の単位をコレクションのデータと一致させる必要があります。</p><p><code>origin</code> からこの範囲内にあるアイテムは、最大の関連性を維持します。</p></td>
     <td><ul><li><p>時間の場合: 秒単位の期間（例: 1 日間の場合は <code>24 &ast; 60 &ast; 60</code>）</p></li><li><p>距離の場合: メートル単位（例: 500 m の場合は <code>500</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>scale</code> の距離におけるスコア値で、曲線の急峻さを制御します。値が小さいほど低下曲線は急になり、値が大きいほど緩やかになります。</p><p>0 から 1 の間で指定する必要があります。</p></td>
     <td><p><code>0.5</code>（デフォルト）</p></td>
   </tr>
</table>

### 標準ベクトル検索への適用\{#apply-to-standard-vector-search}

Decay Ranker を定義したら、検索操作中に `ranker` パラメーターへ渡すことで適用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
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
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;

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

<TabItem value='javascript'>

```javascript
const result = await milvusClient.search({
  collection_name: collection_name,
  data: [your_query_vector], // Replace with your query vector
  anns_field: "dense",
  limit: 10,
  output_fields: ["document", "timestamp"],
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
                   .AddOutputField("document")
                   .AddOutputField("timestamp")
                   .AddFloatVector(your_query_vector);

milvus::SearchResponse response;
auto status = client->Search(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>
</Tabs>
