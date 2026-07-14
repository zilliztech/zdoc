---
title: "Decay Ranker の概要 | BYOC"
slug: /decay-ranker-oveview
sidebar_label: "Decay Ranker の概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "従来の vector search では、結果は純粋に vector の類似度、つまり数学的空間でどれだけ近いかによって順位付けされます。しかし実際のアプリケーションでは、コンテンツが本当に関連性を持つかどうかは、意味的な類似性だけでは決まらないことがよくあります。 | BYOC"
type: origin
token: QZYhwcQhWigYTVkLnHeczkwYnZb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decay Ranker の概要

従来の vector search では、結果は純粋に vector 類似度、つまり数学的空間内で vector がどれだけ一致しているかによって順位付けされます。しかし現実のアプリケーションでは、コンテンツが本当に関連性を持つかどうかは、意味的な類似性だけに依存しないことが多くあります。

次のような日常的なシナリオを考えてみてください。

- ニュース検索で、3年前の類似した記事よりも昨日の記事を上位に表示したい場合

- レストラン検索で、車で30分かかる店よりも5分で行ける店を優先したい場合

- eコマースプラットフォームで、検索クエリとの類似性がやや低くてもトレンド商品をブーストしたい場合

これらのシナリオには共通のニーズがあります。時間、距離、人気度などの数値要素と vector 類似度のバランスを取ることです。

Zilliz Cloud の decay ranker は、このニーズに対応するために、数値フィールドの値に基づいて検索順位を調整します。これにより、vector 類似度とデータの「新しさ」「近さ」またはその他の数値的特性とのバランスを取ることができ、より直感的で文脈に適した検索体験を実現できます。

## 使用上の注意\{#usage-notes}

- Decay ranking は grouping search では使用できません。

- decay ranking に使用するフィールドは数値型（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、または `DOUBLE`）である必要があります。

- 各 decay ranker で使用できる数値フィールドは1つだけです。

- **時間単位の一貫性**: 時間ベースの decay ranking を使用する場合、`origin`、`scale`、`offset` パラメータの単位は、collection データで使用されている単位と一致している必要があります。

    - collection がタイムスタンプを**秒**で保存している場合は、すべてのパラメータでも秒を使用してください

    - collection がタイムスタンプを**ミリ秒**で保存している場合は、すべてのパラメータでもミリ秒を使用してください

    - collection がタイムスタンプを**マイクロ秒**で保存している場合は、すべてのパラメータでもマイクロ秒を使用してください

## 仕組み\{#how-it-works}

Decay ranking は、時間や地理的距離などの数値要因を ranking プロセスに取り込むことで、従来の vector search を強化します。全体の処理は次の段階で進みます。

### ステージ1: 正規化された類似度スコアを計算する\{#stage-1-calculate-normalized-similarity-scores}

まず、Zilliz Cloud は一貫した比較を可能にするために、vector 類似度スコアを計算して正規化します。

- **L2** および **JACCARD** 距離メトリクス（値が低いほど類似度が高い）の場合: 

    ```plaintext
    normalized_score = 1.0 - (2 × arctan(score))/π
    ```

    これにより距離が 0〜1 の類似度スコアに変換され、高いほど良いことを意味します。

- **IP**、**COSINE**、**BM25** メトリクス（スコアが高いほどすでに良い一致を示す）の場合: スコアは正規化せずそのまま使用されます。

### ステージ2: decay スコアを計算する\{#stage-2-calculate-decay-scores}

次に、Zilliz Cloud は選択した decay ranker を使用して、数値フィールドの値（タイムスタンプや距離など）に基づく decay スコアを計算します。

- 各 decay ranker は、生の数値を 0〜1 の正規化された関連性スコアに変換します

- decay スコアは、理想的なポイントからの「距離」に基づいて、そのアイテムがどれだけ関連しているかを表します

具体的な計算式は decay ranker の種類によって異なります。decay スコアの計算方法の詳細については、[Gaussian Decay](./gaussian-decay#formula)、[Exponential Decay](./exponential-decay#formula)、[Linear Decay](./linear-decay#formula) の各専用ページを参照してください。

### ステージ3: 最終スコアを計算する\{#stage-3-compute-final-scores}

最後に、Zilliz Cloud は正規化された類似度スコアと decay スコアを組み合わせて、最終的な ranking スコアを生成します。

```plaintext
final_score = normalized_similarity_score × decay_score
```

hybrid search（複数の vector フィールドを組み合わせる検索）の場合、Zilliz Cloud は検索リクエスト間で最大の正規化類似度スコアを採用します。

```plaintext
final_score = max([normalized_score₁, normalized_score₂, ..., normalized_scoreₙ]) × decay_score
```

たとえば、ある研究論文が hybrid search において vector 類似度から 0.82、BM25 ベースのテキスト検索から 0.91 を獲得した場合、Zilliz Cloud は decay 係数を適用する前のベース類似度スコアとして 0.91 を使用します。

### 実際の decay ranking\{#decay-ranking-in-action}

時間ベースの decay を使って **「AI research papers」** を検索する、実用的なシナリオで decay ranking を見てみましょう。

<Admonition type="info" icon="📘" title="Notes">

この例では、decay スコアは時間の経過とともに関連性がどのように低下するかを反映しています。新しい論文ほど 1.0 に近いスコアを受け取り、古い論文ほど低いスコアを受け取ります。これらの値は特定の decay ranker を使用して計算されます。詳細については、[適切な decay ranker を選ぶ](./decay-ranker-oveview#choose-the-right-decay-ranker) を参照してください。

</Admonition>

| 論文 | Vector 類似度 | 正規化類似度スコア | 公開日 | Decay スコア | 最終スコア | 最終順位 |
| --- | --- | --- | --- | --- | --- | --- |
| Paper A | 高い | 0.85 (`COSINE`) | 2週間前 | 0.80 | 0.68 | #2 |
| Paper B | 非常に高い | 0.92 (`COSINE`) | 6か月前 | 0.45 | 0.41 | #3 |
| Paper C | 中程度 | 0.75 (`COSINE`) | 1日前 | 0.98 | 0.74 | #1 |
| Paper D | やや高い | 0.76 (`COSINE`) | 3週間前 | 0.70 | 0.53 | #4 |

decay reranking がない場合、Paper B は純粋な vector 類似度（0.92）に基づいて最上位になります。しかし decay reranking を適用すると、次のようになります。

- Paper C は類似度が中程度であるにもかかわらず、非常に新しい（昨日公開）ため #1 に上がります

- Paper B は類似度が非常に高いにもかかわらず、比較的古いため #3 に下がります

- Paper D は L2 距離（低いほど良い）を使用するため、decay を適用する前にスコアが 1.2 から 0.76 に正規化されます

## 適切な decay ranker を選ぶ\{#choose-the-right-decay-ranker}

Zilliz Cloud は、それぞれ特定のユースケース向けに設計された異なる decay ranker、`gauss`、`exp`、`linear` を提供しています。

<table>
   <tr>
     <th><p>Decay Ranker</p></th>
     <th><p>特徴</p></th>
     <th><p>理想的なユースケース</p></th>
     <th><p>シナリオ例</p></th>
   </tr>
   <tr>
     <td><p>Gaussian (<code>gauss</code>)</p></td>
     <td><p>自然に感じられる緩やかな減衰で、中程度まで広がる</p></td>
     <td><ul><li><p>バランスの取れた結果が必要な一般的な検索</p></li><li><p>ユーザーが距離感を直感的に理解できるアプリケーション</p></li><li><p>中程度の距離で結果を過度に不利にしたくない場合</p></li></ul></td>
     <td><p>レストラン検索では、3 km 離れた質の高い店舗も、近くの選択肢より順位は下がるものの、引き続き見つけられる</p></td>
   </tr>
   <tr>
     <td><p>Exponential (<code>exp</code>)</p></td>
     <td><p>最初は急速に低下するが、長いテールを維持する</p></td>
     <td><ul><li><p>新しさが重要なニュースフィード</p></li><li><p>新しいコンテンツが優先されるべきソーシャルメディア</p></li><li><p>近接性を強く優先したいが、離れた場所の特に優れた項目も可視性を維持したい場合</p></li></ul></td>
     <td><p>ニュースアプリでは、昨日のニュースは1週間前のコンテンツより大幅に高く順位付けされるが、関連性の高い古い記事も表示される可能性がある</p></td>
   </tr>
   <tr>
     <td><p>Linear (<code>linear</code>)</p></td>
     <td><p>明確な打ち切り点を伴う、一貫した予測可能な減衰</p></td>
     <td><ul><li><p>自然な境界があるアプリケーション</p></li><li><p>距離制限のあるサービス</p></li><li><p>有効期限や明確なしきい値を持つコンテンツ</p></li></ul></td>
     <td><p>イベント検索では、2週間先を超えるイベントはまったく表示されない</p></td>
   </tr>
</table>

各 decay ranker がどのようにスコアを計算するか、および具体的な減衰パターンの詳細については、各専用ドキュメントを参照してください。

- [Gaussian Decay](./gaussian-decay)

- [Exponential Decay](./exponential-decay)

- [Linear Decay](./linear-decay)

## 実装例\{#implementation-example}

decay ranker は、Zilliz Cloud の標準的な vector search と hybrid search の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="Notes">

decay function を使用する前に、まず decay 計算に使用する適切な数値フィールド（タイムスタンプ、距離など）を持つ collection を作成する必要があります。collection のセットアップ、schema 定義、データ挿入を含む完全な動作例については、[Tutorial: Implement Time-based Ranking in Milvus](./tutorial-implement-time-based-ranking) を参照してください。

</Admonition>

### decay ranker を作成する\{#create-a-decay-ranker}

decay ranking を実装するには、まず適切な設定を持つ `Function` オブジェクトを定義します。

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
     <th><p>パラメータ</p></th>
     <th><p>必須?</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>検索実行時に使用する function の識別子です。ユースケースに関連した説明的な名前を選んでください。</p></td>
     <td><p><code>"time_decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>decay スコア計算用の数値フィールドです。どのデータ属性を decay 計算に使用するかを決定します（例: 時間ベースの decay ではタイムスタンプ、位置ベースの decay では座標）。</p><p>関連する数値を含む、collection 内のフィールドである必要があります。INT8/16/32/64、FLOAT、DOUBLE をサポートします。</p></td>
     <td><p><code>["timestamp"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>作成する function の種類を指定します。</p><p>すべての decay ranker で <code>RERANK</code> に設定する必要があります。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用する reranking 方法を指定します。</p><p>decay ranking 機能を有効にするには <code>"decay"</code> に設定する必要があります。</p></td>
     <td><p><code>"decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>はい</p></td>
     <td><p>適用する数学的な decay ranker を指定します。関連性低下のカーブ形状を決定します。</p><p>適切な function の選択については、<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な decay ranker を選ぶ</a> セクションを参照してください。</p></td>
     <td><p><code>"gauss"</code>, <code>"exp"</code>, or <code>"linear"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>はい</p></td>
     <td><p>decay スコアを計算する基準点です。この値にある項目は最大の関連性スコアを受け取ります。</p><p>時間ベースの decay では、時間単位が collection データと一致している必要があります。</p></td>
     <td><ul><li><p>タイムスタンプの場合: 現在時刻（例: <code>int(time.time())</code>）</p></li><li><p>地理位置情報の場合: ユーザーの現在座標</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>はい</p></td>
     <td><p>関連性が <code>decay</code> 値まで低下する距離または時間です。関連性がどのくらい速く低下するかを制御します。</p><p>時間ベースの decay では、時間単位が collection データと一致している必要があります。</p><p>値が大きいほど関連性の低下は緩やかになり、値が小さいほど急になります。</p></td>
     <td><ul><li><p>時間の場合: 秒単位の期間（例: 7日なら <code>7 &ast; 24 &ast; 60 &ast; 60</code>）</p></li><li><p>距離の場合: メートル（例: 5km なら <code>5000</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>origin</code> の周囲に「減衰しないゾーン」を作成し、その範囲内の項目は完全なスコア（decay score = 1.0）を維持します。</p><p>時間ベースの decay では、時間単位が collection データと一致している必要があります。</p><p><code>origin</code> のこの範囲内にある項目は最大の関連性を維持します。</p></td>
     <td><ul><li><p>時間の場合: 秒単位の期間（例: 1日なら <code>24 &ast; 60 &ast; 60</code>）</p></li><li><p>距離の場合: メートル（例: 500m なら <code>500</code>）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>scale</code> 距離におけるスコア値で、カーブの急さを制御します。値が低いほど減衰カーブは急になり、値が高いほど緩やかになります。</p><p>0 から 1 の間である必要があります。</p></td>
     <td><p><code>0.5</code> (default)</p></td>
   </tr>
</table>

### 標準 vector search に適用する\{#apply-to-standard-vector-search}

decay ranker を定義した後は、検索操作時に `ranker` パラメータへ渡すことで適用できます。

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
