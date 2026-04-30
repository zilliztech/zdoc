---
title: "Decay Ranker の概要 | Cloud"
slug: /decay-ranker-oveview
sidebar_key: decay-ranker-oveview
sidebar_label: "Decay Ranker の概要"
beta: FALSE
notebook: FALSE
description: "従来のベクトル検索では、結果はベクトルの類似度、つまり数学的空間におけるベクトルの一致度のみによってランク付けされます。しかし、実際のアプリケーションにおいては、コンテンツの真の関連性は意味的な類似度だけでなく、他の要因にも依存することがよくあります。 | Cloud"
type: origin
token: QZYhwcQhWigYTVkLnHeczkwYnZb
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - 検索結果の再ランキング
  - 結果の再ランキング
  - decay
  - decay ranker
  - decay ranker の概要

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Decay Ranker の概要

従来のベクトル検索では、結果は純粋にベクトル類似度（数学的空間におけるベクトルの近さ）に基づいてランキングされます。しかし実際のアプリケーションでは、コンテンツの真の関連性は意味的類似度だけではなく、他の要素にも依存することがよくあります。

以下のような日常的なシナリオを考えてみましょう。

- 昨日のニュース記事が、3年前の類似記事よりも上位に表示されるニュース検索
- 30分のドライブが必要な店舗よりも、徒歩5分の飲食店を優先するレストラン検索
- 検索クエリとの類似度がやや低くても、トレンド中の商品を優先表示するECプラットフォーム

これらのシナリオには共通点があります。それは、ベクトル類似度と時間・距離・人気度などの数値的要素をバランスよく考慮する必要があることです。

Zilliz Cloud の Decay ranker は、このニーズに対応するために、数値フィールドの値に基づいて検索結果のランキングを調整します。「新鮮さ（freshness）」や「近接性（nearness）」など、データに含まれる数値的特性とベクトル類似度をバランスさせることで、より直感的で文脈に即した検索体験を実現します。

## 使用上の注意\{#usage-notes}

- Decay ranking はグループ化検索とは併用できません。

- Decay ranking に使用するフィールドは数値型（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、または `DOUBLE`）である必要があります。

- 各 Decay ranker は1つの数値フィールドのみを使用できます。

- **時間単位の一貫性**：時間ベースの decay ranking を使用する場合、`origin`、`scale`、および `offset` パラメータの単位は、コレクション内のデータで使用されている単位と一致させる必要があります。

    - コレクションがタイムスタンプを**秒**単位で保存している場合、すべてのパラメータも秒単位で指定します

    - コレクションがタイムスタンプを**ミリ秒**単位で保存している場合、すべてのパラメータもミリ秒単位で指定します

    - コレクションがタイムスタンプを**マイクロ秒**単位で保存している場合、すべてのパラメータもマイクロ秒単位で指定します

## 動作の仕組み\{#how-it-works}

Decay ranking は、時間や地理的距離といった数値的要素をランキング処理に組み込むことで、従来のベクトル検索を強化します。このプロセスは以下のステージで構成されています。

### ステージ 1: 正規化された類似度スコアの計算\{#stage-1-calculate-normalized-similarity-scores}

まず、Zilliz Cloud はベクトル類似度スコアを計算し、一貫した比較が行えるように正規化します。

- **L2** および **JACCARD** 距離メトリクスの場合（値が小さいほど類似度が高い）： 

    ```plaintext
    normalized_score = 1.0 - (2 × arctan(score))/π
    ```

    これは、距離を0〜1の類似度スコアに変換し、数値が大きいほど良い結果を示します。

- **IP**、**COSINE**、および**BM25**メトリクスの場合（これらのメトリクスでは、すでに高いスコアがより良いマッチを示します）：スコアは正規化せずにそのまま使用されます。

### ステージ 2: 減衰スコアの計算\{#stage-2-calculate-decay-scores}

次に、Zilliz Cloud は選択した減衰ランカーを使用して、数値フィールドの値（タイムスタンプや距離など）に基づく減衰スコアを計算します。

- 各減衰ランカーは、生の数値を0〜1の正規化された関連性スコアに変換します

- 減衰スコアは、「理想的なポイント」からの「距離」に基づいてアイテムの関連性を表します

具体的な計算式は、減衰ランカーのタイプによって異なります。減衰スコアの計算方法の詳細については、それぞれの専用ページをご参照ください：[ガウス減衰](./gaussian-decay#formula)、[指数減衰](./exponential-decay#formula)、[線形減衰](./linear-decay#formula)。

### ステージ 3: 最終スコアの算出\{#stage-3-compute-final-scores}

最後に、Zilliz Cloud は正規化された類似度スコアと減衰スコアを組み合わせて、最終的なランキングスコアを生成します。

```plaintext
final_score = normalized_similarity_score × decay_score
```

ハイブリッド検索（複数のベクトルフィールドを組み合わせる）の場合、Zilliz Cloud は検索リクエストの中で最大の正規化済み類似度スコアを採用します。

```plaintext
final_score = max([normalized_score₁, normalized_score₂, ..., normalized_scoreₙ]) × decay_score
```

たとえば、ハイブリッド検索において、ある研究論文がベクトル類似度で0.82、BM25ベースのテキスト検索で0.91をスコアした場合、Zilliz Cloudは減衰係数を適用する前に0.91を基本類似度スコアとして使用します。

### 実際の減衰ランキング\{#decay-ranking-in-action}

実用的なシナリオで減衰ランキングを見てみましょう。ここでは「AI研究論文」を時間に基づく減衰付きで検索します：

<Admonition type="info" icon="📘" title="Notes">

<p>この例では、減衰スコアは時間の経過とともに関連性が低下することを反映しています。新しい論文ほど1.0に近いスコアを受け取り、古い論文ほど低いスコアになります。これらの値は特定の減衰ランカーを使用して計算されています。詳細については、<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な減衰ランカーの選択</a>をご参照ください。</p>

</Admonition>

<table>
   <tr>
     <th><p>論文</p></th>
     <th><p>ベクトル類似度</p></th>
     <th><p>正規化済み類似度スコア</p></th>
     <th><p>公開日</p></th>
     <th><p>減衰スコア</p></th>
     <th><p>最終スコア</p></th>
     <th><p>最終順位</p></th>
   </tr>
   <tr>
     <td><p>論文 A</p></td>
     <td><p>高</p></td>
     <td><p>0.85 (<code>COSINE</code>)</p></td>
     <td><p>2週間前</p></td>
     <td><p>0.80</p></td>
     <td><p>0.68</p></td>
     <td><h1 id="2">2</h1></td>
   </tr>
   <tr>
     <td><p>論文 B</p></td>
     <td><p>非常に高</p></td>
     <td><p>0.92 (<code>COSINE</code>)</p></td>
     <td><p>6か月前</p></td>
     <td><p>0.45</p></td>
     <td><p>0.41</p></td>
     <td><h1 id="3">3</h1></td>
   </tr>
   <tr>
     <td><p>論文 C</p></td>
     <td><p>中</p></td>
     <td><p>0.75 (<code>COSINE</code>)</p></td>
     <td><p>1日前</p></td>
     <td><p>0.98</p></td>
     <td><p>0.74</p></td>
     <td><h1 id="1">1</h1></td>
   </tr>
   <tr>
     <td><p>論文 D</p></td>
     <td><p>中〜高</p></td>
     <td><p>0.76 (<code>COSINE</code>)</p></td>
     <td><p>3週間前</p></td>
     <td><p>0.70</p></td>
     <td><p>0.53</p></td>
     <td><h1 id="4">4</h1></td>
   </tr>
</table>

減衰による再ランキングを行わなければ、論文Bは純粋なベクトル類似度（0.92）により最上位になります。しかし、減衰再ランキングを適用すると：

- 論文Cは類似度が「中」であるにもかかわらず、非常に新しい（昨日公開）ため1位にジャンプアップします

- 論文Bは優れた類似度を持つものの比較的古いため、3位にまで下がります

- 論文DはL2距離（小さいほど良い）を使用しているため、1.2から0.76に正規化された後に減衰が適用されています

## 適切な減衰ランカーの選択\{#choose-the-right-decay-ranker}

Zilliz Cloudは、それぞれ異なるユースケース向けに設計された`gauss`、`exp`、`linear`の3種類の減衰ランカーを提供しています：

<table>
   <tr>
     <th><p>減衰ランカー</p></th>
     <th><p>特徴</p></th>
     <th><p>理想的なユースケース</p></th>
     <th><p>例となるシナリオ</p></th>
   </tr>
   <tr>
     <td><p>ガウス (<code>gauss</code>)</p></td>
     <td><p>自然で緩やかな減少傾向を持ち、中程度まで影響が及ぶ</p></td>
     <td><ul><li><p>バランスの取れた結果が求められる一般検索</p></li><li><p>ユーザーが直感的に距離感を把握できるアプリケーション</p></li><li><p>中程度の距離であっても結果を厳しくペナルティすべきでない場合</p></li></ul></td>
     <td><p>レストラン検索では、3 km離れた高品質な店舗も表示されますが、近くの選択肢よりは順位が下がります</p></td>
   </tr>
   <tr>
     <td><p>指数 (<code>exp</code>)</p></td>
     <td><p>最初に急激に減少し、その後も長い尾を引く</p></td>
     <td><ul><li><p>新鮮さが極めて重要なニュースフィード</p></li><li><p>最新コンテンツが支配すべきソーシャルメディア</p></li><li><p>近接性が強く好まれるが、例外的に遠くても優れたアイテムは表示したい場合</p></li></ul></td>
     <td><p>ニュースアプリでは、昨日の記事が1週間前のコンテンツよりもはるかに高い順位となりますが、関連性が非常に高い古い記事も表示されます</p></td>
   </tr>
   <tr>
     <td><p>線形 (<code>linear</code>)</p></td>
     <td><p>一貫性があり予測可能な減少傾向を持ち、明確なカットオフがある</p></td>
     <td><ul><li><p>自然な境界を持つアプリケーション</p></li><li><p>距離制限のあるサービス</p></li><li><p>有効期限や明確な閾値を持つコンテンツ</p></li></ul></td>
     <td><p>イベント検索では、2週間以上先のイベントはまったく表示されません</p></td>
   </tr>
</table>

各減衰ランカーがスコアをどのように計算し、どのような減少パターンを持つのかについての詳細は、以下の専用ドキュメントをご参照ください：

- [ガウス Decay](./gaussian-decay)

- [指数 Decay](./exponential-decay)

- [線形 Decay](./linear-decay)

## 実装例\{#implementation-example}

減衰ランカーは、Zilliz Cloudにおける標準的なベクトル検索およびハイブリッド検索の両方に適用できます。以下にこの機能を実装するための主要なコードスニペットを示します。

<Admonition type="info" icon="📘" title="Notes">

<p>減衰関数を使用する前に、まず減衰計算に使用するタイムスタンプや距離などの数値フィールドを含むコレクションを作成しておく必要があります。コレクションのセットアップ、スキーマ定義、データ挿入を含む完全な動作例については、<a href="./tutorial-implement-time-based-ranking">チュートリアル: Milvusで時間ベースのランキングを実装する</a>をご参照ください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

減衰ランキングを実装するには、まず適切な設定で`Function`オブジェクトを定義します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
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
     <td><p>検索実行時に使用される関数の識別子です。ユースケースに関連したわかりやすい名前を指定してください。</p></td>
     <td><p><code>"time_decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>減衰スコア計算に使用する数値フィールドです。減衰計算に使用するデータ属性（例：時間ベースの減衰にはタイムスタンプ、位置ベースの減衰には座標）を決定します。</p><p>コレクション内に存在し、関連する数値を含むフィールドである必要があります。INT8/16/32/64、FLOAT、DOUBLE をサポートしています。</p></td>
     <td><p><code>["timestamp"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>作成する関数のタイプを指定します。</p><p>すべての減衰ランカーに対して <code>RERANK</code> に設定する必要があります。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用するリランキング手法を指定します。</p><p>減衰ランキング機能を有効にするには、<code>"decay"</code> に設定する必要があります。</p></td>
     <td><p><code>"decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>はい</p></td>
     <td><p>適用する数学的減衰ランカーを指定します。関連性の低下カーブの形状を決定します。</p><p>適切な関数の選択については、<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な減衰ランカーの選択</a>セクションをご参照ください。</p></td>
     <td><p><code>"gauss"</code>、<code>"exp"</code>、または <code>"linear"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>はい</p></td>
     <td><p>減衰スコアの計算基準となる参照点です。この値を持つアイテムは最大の関連性スコアを受け取ります。</p><p>時間ベースの減衰の場合、時間単位はコレクションのデータと一致している必要があります。</p></td>
     <td><ul><li><p>タイムスタンプの場合：現在時刻（例：<code>int(time.time())</code>）</p></li><li><p>ジオロケーションの場合：ユーザーの現在地座標</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>はい</p></td>
     <td><p><code>decay</code> 値となる距離または時間です。関連性がどの程度速く低下するかを制御します。</p><p>時間ベースの減衰の場合、時間単位はコレクションのデータと一致している必要があります。</p><p>大きな値は関連性の緩やかな低下を、小さな値は急激な低下をもたらします。</p></td>
     <td><ul><li><p>時間の場合：秒単位の期間（例：<code>7 &ast; 24 &ast; 60 &ast; 60</code> で7日間）</p></li><li><p>距離の場合：メートル（例：<code>5000</code> で5km）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>origin</code> の周囲に「減衰なしゾーン」を作成し、その範囲内のアイテムは完全なスコア（減衰スコア = 1.0）を維持します。</p><p>時間ベースの減衰の場合、時間単位はコレクションのデータと一致している必要があります。</p><p><code>origin</code> からこの範囲内にあるアイテムは最大の関連性を維持します。</p></td>
     <td><ul><li><p>時間の場合：秒単位の期間（例：<code>24 &ast; 60 &ast; 60</code> で1日）</p></li><li><p>距離の場合：メートル（例：<code>500</code> で500m）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>scale</code> 距離におけるスコア値で、カーブの急峻さを制御します。低い値は急激な低下カーブを、高い値は緩やかな低下カーブを生成します。</p><p>0 から 1 の間である必要があります。</p></td>
     <td><p><code>0.5</code>（デフォルト）</p></td>
   </tr>
</table>

### 標準的なベクトル検索への適用\{#apply-to-standard-vector-search}

減衰ランカーを定義した後、検索操作時に `ranker` パラメータに渡すことで適用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='java'>

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

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

