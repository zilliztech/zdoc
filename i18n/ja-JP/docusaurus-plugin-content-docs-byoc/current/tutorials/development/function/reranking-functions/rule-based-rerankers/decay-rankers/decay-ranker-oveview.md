---
title: "Decay Ranker の概要 | BYOC"
slug: /decay-ranker-oveview
sidebar_label: "Decay Ranker の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "従来のベクトル検索では、結果は純粋にベクトル類似度（数学空間におけるベクトルの近さ）に基づいてランク付けされます。しかし実際のアプリケーションでは、コンテンツの真の関連性は意味的な類似性だけでなく、より多くの要素に依存することが少なくありません。 | BYOC"
type: origin
token: QZYhwcQhWigYTVkLnHeczkwYnZb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decay Ranker の概要

従来のベクトル検索では、結果は純粋にベクトル類似度（数学空間におけるベクトルの近さ）に基づいてランク付けされます。しかし実際のアプリケーションでは、コンテンツの真の関連性は意味的な類似性だけでなく、より多くの要素に依存することが少なくありません。

次のような日常的なシナリオを考えてみましょう。

- ニュース検索で、昨日の記事が3年前の類似記事よりも上位に表示されるべき場合

- レストラン検索で、車で30分かかる店舗よりも徒歩5分の店舗を優先したい場合

- EC サイトで、検索クエリとの類似度がやや低くてもトレンド商品を上位に表示したい場合

これらのシナリオには共通のニーズがあります。それは、ベクトル類似度と時間、距離、人気度などの数値要素とのバランスを取ることです。

Zilliz Cloud の Decay Ranker は、数値フィールドの値に基づいて検索ランキングを調整することで、このニーズに対応します。ベクトル類似度とデータの「新しさ」や「近さ」といった数値特性のバランスを取り、より直感的で文脈に即した検索体験を実現します。

## 使用上の注意\{#usage-notes}

- Decay Ranking はグループ検索と併用できません。

- Decay Ranking に使用するフィールドは数値型（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、または `DOUBLE`）である必要があります。

- 各 Decay Ranker で使用できる数値フィールドは1つだけです。

- **時間単位の一貫性**: 時間ベースの Decay Ranking を使用する場合、`origin`、`scale`、`offset` パラメーターの単位は、コレクションのデータで使用されている単位と一致させる必要があります。

    - コレクションがタイムスタンプを**秒**で保存している場合は、すべてのパラメーターに秒を使用します

    - コレクションがタイムスタンプを**ミリ秒**で保存している場合は、すべてのパラメーターにミリ秒を使用します

    - コレクションがタイムスタンプを**マイクロ秒**で保存している場合は、すべてのパラメーターにマイクロ秒を使用します

## 仕組み\{#how-it-works}

Decay Ranking は、時間や地理的距離などの数値要素をランキング処理に組み込むことで、従来のベクトル検索を強化します。一連の処理は以下の段階で構成されます。

### ステージ1: 正規化類似度スコアの計算\{#stage-1-calculate-normalized-similarity-scores}

まず、Zilliz Cloud がベクトル類似度スコアを計算・正規化し、一貫した比較を行えるようにします。

- **L2** および **JACCARD** 距離メトリック（値が小さいほど類似度が高い）の場合: 

    ```plaintext
    normalized_score = 1.0 - (2 × arctan(score))/π
    ```

    これにより距離が0〜1の類似度スコアに変換され、値が大きいほど類似度が高くなります。

- **IP**、**COSINE**、**BM25** メトリック（スコアが大きいほど一致度が高い）の場合: スコアは正規化せずにそのまま使用されます。

### ステージ2: Decay スコアの計算\{#stage-2-calculate-decay-scores}

次に、Zilliz Cloud が選択された Decay Ranker を用いて、数値フィールドの値（タイムスタンプや距離など）に基づき Decay スコアを計算します。

- 各 Decay Ranker は生の数値を0〜1の正規化された関連性スコアに変換します

- Decay スコアは、理想点からの「距離」に基づいてアイテムの関連性を示します

具体的な計算式は Decay Ranker の種類によって異なります。Decay スコアの計算方法の詳細については、[Gaussian Decay](./gaussian-decay#formula)、[Exponential Decay](./exponential-decay#formula)、[Linear Decay](./linear-decay#formula) の専用ページを参照してください。

### ステージ3: 最終スコアの算出\{#stage-3-compute-final-scores}

最後に、Zilliz Cloud が正規化された類似度スコアと Decay スコアを組み合わせて、最終的なランキングスコアを算出します。

```plaintext
final_score = normalized_similarity_score × decay_score
```

ハイブリッド検索（複数のベクトルフィールドを組み合わせる場合）では、Zilliz Cloud は検索リクエストの中で最大の正規化類似度スコアを採用します。

```plaintext
final_score = max([normalized_score₁, normalized_score₂, ..., normalized_scoreₙ]) × decay_score
```

例えば、ハイブリッド検索においてある研究論文のベクトル類似度スコアが0.82、BM25 ベースのテキスト検索スコアが0.91であった場合、Zilliz Cloud は Decay 係数を適用する前のベース類似度スコアとして0.91を使用します。

### Decay Ranking の実例\{#decay-ranking-in-action}

時間ベースの Decay を使用して **「AI research papers」** を検索する実践的なシナリオで、Decay Ranking の効果を見てみましょう。

<Admonition type="info" icon="📘" title="Notes">

この例では、Decay スコアが時間の経過に伴う関連性の低下を反映しています。新しい論文は1.0に近いスコアを得られ、古い論文は低いスコアになります。これらの値は特定の Decay Ranker によって計算されます。詳細については、[適切な Decay Ranker の選択](./decay-ranker-oveview#choose-the-right-decay-ranker) を参照してください。

</Admonition>

| 論文 | ベクトル類似度 | 正規化類似度スコア | 公開日 | Decay スコア | 最終スコア | 最終順位 |
| --- | --- | --- | --- | --- | --- | --- |
| 論文 A | 高 | 0.85 (`COSINE`) | 2週間前 | 0.80 | 0.68 | #2 |
| 論文 B | 非常に高 | 0.92 (`COSINE`) | 6か月前 | 0.45 | 0.41 | #3 |
| 論文 C | 中 | 0.75 (`COSINE`) | 1日前 | 0.98 | 0.74 | #1 |
| 論文 D | 中〜高 | 0.76 (`COSINE`) | 3週間前 | 0.70 | 0.53 | #4 |

Decay Reranking を適用しない場合、論文 B が純粋なベクトル類似度（0.92）に基づいて最上位にランクされます。しかし、Decay Reranking を適用すると以下のようになります。

- 論文 C は類似度が中程度にもかかわらず、非常に新しい（昨日公開）ため1位に浮上します

- 論文 B は類似度が非常に高いものの、比較的古いため3位に後退します

- 論文 D は L2 距離（値が小さいほど良い）を使用しているため、Decay を適用する前にスコアが1.2から0.76に正規化されます

## 適切な Decay Ranker の選択\{#choose-the-right-decay-ranker}

Zilliz Cloud は、それぞれ特定のユースケース向けに設計された `gauss`、`exp`、`linear` という異なる Decay Ranker を提供しています。

<table>
   <tr>
     <th><p>Decay Ranker</p></th>
     <th><p>特徴</p></th>
     <th><p>推奨ユースケース</p></th>
     <th><p>シナリオ例</p></th>
   </tr>
   <tr>
     <td><p>Gaussian (<code>gauss</code>)</p></td>
     <td><p>適度に広がりを持つ、自然で緩やかな減衰</p></td>
     <td><ul><li><p>バランスの取れた結果が求められる一般的な検索</p></li><li><p>ユーザーが距離を直感的に把握できるアプリケーション</p></li><li><p>中程度の距離差が結果に過度なペナルティを与えるべきでない場合</p></li></ul></td>
     <td><p>レストラン検索で、3km 離れた高評価の店舗も、近隣の選択肢より順位は下がるものの引き続き発見可能</p></td>
   </tr>
   <tr>
     <td><p>Exponential (<code>exp</code>)</p></td>
     <td><p>初期は急激に減少するが、ロングテールを維持</p></td>
     <td><ul><li><p>最新性が重要なニュースフィード</p></li><li><p>新鮮なコンテンツを優先すべきソーシャルメディア</p></li><li><p>近接性を強く重視しつつ、例外的に遠くのアイテムも表示したい場合</p></li></ul></td>
     <td><p>ニュースアプリで、昨日の記事は1週間前のコンテンツよりはるかに上位になるが、関連性の高い古い記事も引き続き表示される</p></td>
   </tr>
   <tr>
     <td><p>Linear (<code>linear</code>)</p></td>
     <td><p>明確なカットオフを持つ、一定で予測可能な減衰</p></td>
     <td><ul><li><p>自然な境界線を持つアプリケーション</p></li><li><p>距離制限のあるサービス</p></li><li><p>有効期限や明確なしきい値があるコンテンツ</p></li></ul></td>
     <td><p>イベント検索で、2週間先を超えるイベントは一切表示されない</p></td>
   </tr>
</table>

各 Decay Ranker のスコア計算方法や具体的な減衰パターンの詳細については、専用ドキュメントを参照してください。

- [Gaussian Decay](./gaussian-decay)

- [Exponential Decay](./exponential-decay)

- [Linear Decay](./linear-decay)

## 実装例\{#implementation-example}

Decay ranker は、Zilliz Cloud における標準ベクトル検索とハイブリッド検索の両方に適用できます。以下に、この機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" icon="📘" title="Notes">

decay 関数を使用する前に、まず decay 計算に用いる適切な数値フィールド（タイムスタンプや距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、データ挿入を含む完全な動作例については、[Tutorial: Implement Time-based Ranking in Milvus](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### Decay ranker の作成\{#create-a-decay-ranker}

decay ランキングを実装するには、まず適切な設定で `Function` オブジェクトを定義します。

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
     <td><p>検索実行時に使用される関数の識別子です。ユースケースに合った分かりやすい名前を指定してください。</p></td>
     <td><p><code>&quot;time_decay&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>decay スコアの計算に使用する数値フィールドです。decay 計算の対象となるデータ属性を指定します（例：時間ベースの decay ならタイムスタンプ、位置ベースの decay なら座標）。</p><p>コレクション内の関連する数値を含むフィールドである必要があります。INT8/16/32/64, FLOAT、DOUBLE がサポートされています。</p></td>
     <td><p><code>[&quot;timestamp&quot;]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>作成する関数の種類を指定します。</p><p>すべての decay ranker で <code>RERANK</code> に設定する必要があります。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用するリランキング手法を指定します。</p><p>decay ランキング機能を有効にするには、<code>&quot;decay&quot;</code> に設定する必要があります。</p></td>
     <td><p><code>&quot;decay&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>はい</p></td>
     <td><p>適用する数学的な decay ranker を指定します。これにより、関連性が低下する際の曲線の形状が決まります。</p><p>適切な関数の選択については、<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な decay ranker の選択</a> セクションを参照してください。</p></td>
     <td><p><code>&quot;gauss&quot;</code>、<code>&quot;exp&quot;</code>、または <code>&quot;linear&quot;</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>はい</p></td>
     <td><p>decay スコア算出の基準となる参照点です。この値と一致するアイテムは、最大の関連性スコアを得ます。</p><p>時間ベースの decay では、時間の単位がコレクションのデータと一致している必要があります。</p></td>
     <td><ul><li><p>タイムスタンプの場合：現在時刻（例：<code>int(time.time())</code>）</p></li><li><p>地理位置情報の場合：ユーザーの現在座標</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>はい</p></td>
     <td><p>関連性が <code>decay</code> 値まで低下する距離または時間を指定します。これにより、関連性の低下速度を制御できます。</p><p>時間ベースの decay では、時間の単位がコレクションのデータと一致している必要があります。</p><p>値を大きくすると関連性の低下が緩やかになり、小さくすると急激に低下します。</p></td>
     <td><ul><li><p>時間の場合：秒単位の期間（例：7日間の場合は <code>7 &ast; 24 &ast; 60 &ast; 60</code>）</p></li><li><p>距離の場合：メートル単位（例：5km の場合は <code>5000</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>origin</code> の周囲に「非減衰ゾーン」を設け、その範囲内のアイテムはフルスコア（decay スコア = 1.0）を維持します。</p><p>時間ベースの decay では、時間の単位がコレクションのデータと一致している必要があります。</p><p><code>origin</code> からこの範囲内にあるアイテムは、最大の関連性を維持します。</p></td>
     <td><ul><li><p>時間の場合：秒単位の期間（例：1日の場合は <code>24 &ast; 60 &ast; 60</code>）</p></li><li><p>距離の場合：メートル単位（例：500m の場合は <code>500</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>scale</code> 距離におけるスコア値であり、曲線の急峻さを制御します。値が小さいほど低下曲線は急になり、大きいほど緩やかになります。</p><p>0 から 1 の間で指定する必要があります。</p></td>
     <td><p><code>0.5</code>（デフォルト）</p></td>
   </tr>
</table>

### 標準ベクトル検索への適用\{#apply-to-standard-vector-search}

decay ranker を定義したら、検索時に `ranker` パラメーターへ渡すことで適用できます。

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
