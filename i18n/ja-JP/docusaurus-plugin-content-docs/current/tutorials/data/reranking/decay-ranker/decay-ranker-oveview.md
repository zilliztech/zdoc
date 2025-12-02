---
title: "減衰ランカー概要 | Cloud"
slug: /decay-ranker-oveview
sidebar_label: "減衰ランカー概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "従来のベクトル検索では、結果は純粋にベクトル類似度に基づいてランク付けされます—ベクトルが数学的空間でどれほど密接に一致するかに基づいて。しかし、実際のアプリケーションでは、コンテンツの真正の関連性は、意味的類似性だけに依存するとは限りません。| Cloud"
type: origin
token: QZYhwcQhWigYTVkLnHeczkwYnZb
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search result reranking
  - result reranking
  - decay
  - decay ranker
  - decay ranker overview
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 減衰ランカー概要

従来のベクトル検索では、結果は純粋にベクトル類似度に基づいてランク付けされます—ベクトルが数学的空間でどれほど密接に一致するかに基づいて。しかし、実際のアプリケーションでは、コンテンツの真正の関連性は、意味的類似性だけに依存するとは限りません。

これらの日常的なシナリオを考えてみましょう：

- 3年前の類似した記事より、昨日の記事の方が上位にランクされるニュース検索

- 30分のドライブが必要な場所よりも、5分で行ける場所を優先するレストラン検索

- 検索クエリとの類似性がわずかに低くても、トレンド商品を優先表示するECプラットフォーム

これらのシナリオはすべて共通のニーズを共有しています：ベクトル類似度と時間、距離、人気などの他の数値要因のバランスを取る必要があります。

Zilliz Cloudの減衰ランカーは、数値フィールド値に基づいて検索ランクを調整することでこのニーズに対応します。これにより、ベクトル類似度と「新鮮さ」、「近さ」、または他のデータの数値的特性をバランスさせることができ、より直感的で文脈的に関連性のある検索エクスペリエンスを作成できます。

## 使用上の注意\{#usage-notes}

- 減衰ランキングはグルーピング検索では使用できません。

- 減衰ランキングに使用されるフィールドは数値（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、または`DOUBLE`）でなければなりません。

- 各減衰ランカーは1つの数値フィールドのみを使用できます。

- **時間単位の整合性**：時間ベースの減衰ランキングを使用する場合、`origin`、`scale`、および`offset`パラメータの単位は、コレクションデータで使用される単位と一致する必要があります：

    - コレクションがタイムスタンプを**秒**で保存している場合、すべてのパラメータに秒を使用します

    - コレクションがタイムスタンプを**ミリ秒**で保存している場合、すべてのパラメータにミリ秒を使用します

    - コレクションがタイムスタンプを**マイクロ秒**で保存している場合、すべてのパラメータにマイクロ秒を使用します

## 仕組み\{#how-it-works}

減衰ランキングは、時間や地理的距離などの数値要因をランキングプロセスに組み込むことで、従来のベクトル検索を強化します。プロセス全体は以下の段階に分かれます：

### ステージ1：正規化された類似度スコアの計算\{#stage-1-calculate-normalized-similarity-scores}

まず、Zilliz Cloudはベクトル類似度スコアを計算し、正規化して一貫した比較を確保します：

- **L2**および**JACCARD**距離メトリック（値が低いほど類似度が高い）の場合：

    ```plaintext
    normalized_score = 1.0 - (2 × arctan(score))/π
    ```

    これにより、距離が0〜1の間の類似度スコアに変換され、値が高いほど優れています。

- **IP**、**COSINE**、および**BM25**メトリック（値が高いほどマッチ度が高い）の場合：スコアは正規化せずに直接使用されます。

### ステージ2：減衰スコアの計算\{#stage-2-calculate-decay-scores}

次に、Zilliz Cloudは選択した減衰ランカーを使用して、数値フィールド値（タイムスタンプや距離など）に基づいた減衰スコアを計算します：

- 各減衰ランカーは、生の数値を0〜1の間の正規化された関連性スコアに変換します

- 減衰スコアは、理想的な点からの「距離」に基づいてアイテムの関連性を表します

特定の計算式は減衰ランカーのタイプによって異なります。減衰スコアの計算方法の詳細については、[ガウス減衰](./gaussian-decay#formula)、[指数減衰](./exponential-decay#formula)、[線形減衰](./linear-decay#formula)の専用ページを参照してください。

### ステージ3：最終スコアの計算\{#stage-3-compute-final-scores}

最後に、Zilliz Cloudは正規化された類似度スコアと減衰スコアを組み合わせて、最終的なランク付けスコアを生成します：

```plaintext
final_score = normalized_similarity_score × decay_score
```

ハイブリッド検索（複数のベクトルフィールドを組み合わせる）の場合、Zilliz Cloudは検索要求の中で最も高い正規化スコアを採用します：

```plaintext
final_score = max([normalized_score₁, normalized_score₂, ..., normalized_scoreₙ]) × decay_score
```

例えば、研究論文がベクトル類似度で0.82、BM25ベースのテキスト検索で0.91のスコアを獲得したハイブリッド検索では、Zilliz Cloudは減衰係数を適用する前に0.91をベース類似度スコアとして使用します。

### 実際の減衰ランキング\{#decay-ranking-in-action}

実際のシナリオで減衰ランキングを見てみましょう—時間ベースの減衰を使用した**「AI研究論文」**の検索：

<Admonition type="info" icon="📘" title="注意">

<p>この例では、減衰スコアは時間の経過とともに関連性がどのように低下するかを反映しています—新しい論文は1.0に近いスコアを受け取り、古い論文は低いスコアを受け取ります。これらの値は特定の減衰ランカーを使用して計算されます。詳細については、<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な減衰ランカーを選択する</a>を参照してください。</p>

</Admonition>

<table>
   <tr>
     <th><p>論文</p></th>
     <th><p>ベクトル類似度</p></th>
     <th><p>正規化類似度スコア</p></th>
     <th><p>公開日</p></th>
     <th><p>減衰スコア</p></th>
     <th><p>最終スコア</p></th>
     <th><p>最終ランク</p></th>
   </tr>
   <tr>
     <td><p>論文A</p></td>
     <td><p>高</p></td>
     <td><p>0.85 (<code>COSINE</code>)</p></td>
     <td><p>2週間前</p></td>
     <td><p>0.80</p></td>
     <td><p>0.68</p></td>
     <td><h1 id="2">2</h1></td>
   </tr>
   <tr>
     <td><p>論文B</p></td>
     <td><p>非常に高</p></td>
     <td><p>0.92 (<code>COSINE</code>)</p></td>
     <td><p>6か月前</p></td>
     <td><p>0.45</p></td>
     <td><p>0.41</p></td>
     <td><h1 id="3">3</h1></td>
   </tr>
   <tr>
     <td><p>論文C</p></td>
     <td><p>中</p></td>
     <td><p>0.75 (<code>COSINE</code>)</p></td>
     <td><p>1日前</p></td>
     <td><p>0.98</p></td>
     <td><p>0.74</p></td>
     <td><h1 id="1">1</h1></td>
   </tr>
   <tr>
     <td><p>論文D</p></td>
     <td><p>中高</p></td>
     <td><p>0.76 (<code>COSINE</code>)</p></td>
     <td><p>3週間前</p></td>
     <td><p>0.70</p></td>
     <td><p>0.53</p></td>
     <td><h1 id="4">4</h1></td>
   </tr>
</table>

減衰再ランク付けがない場合、論文Bは純粋なベクトル類似度（0.92）に基づいて最上位にランクされます。しかし、減衰再ランク付けを適用すると：

- 論文Cは中程度の類似度でも非常に新しく（昨日公開）なため、1位にジャンプします

- 非常に良い類似度を持つにもかかわらず、論文Bは比較的古いため3位に下がります

- 論文DはL2距離（値が低い方が良い）を使用しており、減衰を適用する前にスコアが1.2から0.76に正規化されます

## 適切な減衰ランカーの選択\{#choose-the-right-decay-ranker}

Zilliz Cloudは、`gauss`、`exp`、`linear`という異なる減衰ランカーを提供しており、それぞれ特定のユースケース用に設計されています：

<table>
   <tr>
     <th><p>減衰ランカー</p></th>
     <th><p>特徴</p></th>
     <th><p>理想的な使用例</p></th>
     <th><p>シナリオ例</p></th>
   </tr>
   <tr>
     <td><p>ガウス (<code>gauss</code>)</p></td>
     <td><p>自然に感じられる、ある程度まで続く徐々の下降</p></td>
     <td><ul><li><p>バランスの取れた結果を必要とする一般的な検索</p></li><li><p>ユーザーが距離を直感的に理解するアプリケーション</p></li><li><p>中程度の距離が結果に深刻なペナルティを与えない場合</p></li></ul></td>
     <td><p>レストラン検索では、3km離れた品質の高い店舗も発見可能ですが、近くの選択肢よりも下位にランクされます</p></td>
   </tr>
   <tr>
     <td><p>指数 (<code>exp</code>)</p></td>
     <td><p>最初は急速に減少しますが、長い尾を引きます</p></td>
     <td><ul><li><p>新鮮さが重要なニュースフィード</p></li><li><p>新鮮なコンテンツが優先されるSNS</p></li><li><p>近さが強く好まれるが、例外的に優れた遠くのアイテムが見えるようにする場合</p></li></ul></td>
     <td><p>ニュースアプリでは、昨日のストーリーが1週間前のコンテンツよりはるかに高いランクになりますが、非常に関連性の高い古い記事も表示される場合があります</p></td>
   </tr>
   <tr>
     <td><p>線形 (<code>linear</code>)</p></td>
     <td><p>一貫した予測可能な下降で、明確なカットオフがあります</p></td>
     <td><ul><li><p>自然な境界があるアプリケーション</p></li><li><p>距離制限があるサービス</p></li><li><p>期限切れや明確なしきい値があるコンテンツ</p></li></ul></td>
     <td><p>イベント検索では、2週間先の将来のウィンドウを超えるイベントは全く表示されません</p></td>
   </tr>
</table>

各減衰ランカーがどのようにスコアを計算し、具体的な下降パターンについての詳細は、専用のドキュメントを参照してください：

- [ガウス減衰](./gaussian-decay)

- [指数減衰](./exponential-decay)

- [線形減衰](./linear-decay)

## 実装例\{#implementation-example}

減衰ランカーは、Zilliz Cloudの標準ベクトル検索とハイブリッド検索の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="注意">

<p>減衰関数を使用する前に、減衰計算に使用される適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクション設定、スキーマ定義、およびデータ挿入を含む完全な作業例については、<a href="./tutorial-implement-time-based-ranking">チュートリアル：Milvusでの時間ベースのランク付けの実装</a>を参照してください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

減衰ランキングを実装するには、まず適切な設定を持つ`Function`オブジェクトを定義します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

# タイムスタンプベースの減衰用の減衰関数を作成します
# 注：すべての時間パラメータは、コレクションデータと単位を一致させる必要があります
decay_ranker = Function(
    name="time_decay",                  # 関数識別子
    input_field_names=["timestamp"],    # 減衰に使用する数値フィールド
    function_type=FunctionType.RERANK,  # 減衰ランカーの場合はRERANKに設定する必要があります
    params={
        "reranker": "decay",            # 減衰再ランカーを指定します。"decay"にする必要があります
        "function": "gauss",            # 減衰関数タイプ："gauss"、"exp"、または"linear"を選択します
        "origin": int(datetime.datetime(2025, 1, 15).timestamp()),    # 基準点（秒）
        "scale": 7 * 24 * 60 * 60,      # 7日間（秒）のスケール（コレクションデータ単位と一致させる必要があります）
        "offset": 24 * 60 * 60,         # 1日間の減衰なしゾーン（コレクションデータ単位と一致させる必要があります）
        "decay": 0.5                    # 一定距離での半分のスコア
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

DecayRanker ranker = DecayRanker.builder()
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

const decayRanker = {
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
</Tabs>

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>必須？</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>検索実行時に使用される関数の識別子。あなたのユースケースに関連する記述的な名前を選択してください。</p></td>
     <td><p><code>"time_decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>減衰スコア計算のための数値フィールド。どのデータ属性が減衰計算に使用されるかを決定します（例：時間ベースの減衰のためのタイムスタンプ、位置ベースの減衰のための座標）。関連する数値値を含むコレクション内のフィールドである必要があります。INT8/16/32/64、FLOAT、DOUBLEをサポートします。</p></td>
     <td><p><code>["timestamp"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>作成される関数のタイプを指定します。すべての減衰ランカーでは<code>RERANK</code>に設定する必要があります。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用する再ランク付け方法を指定します。減衰ランキング機能を有効にするには<code>"decay"</code>に設定する必要があります。</p></td>
     <td><p><code>"decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>はい</p></td>
     <td><p>適用する数学的減衰ランカーを指定します。関連性の下降曲線の形状を決定します。<a href="./decay-ranker-oveview#choose-the-right-decay-ranker">適切な減衰ランカーの選択</a>のセクションを参照して、適切な関数を選択してください。</p></td>
     <td><p><code>"gauss"</code>、<code>"exp"</code>、または<code>"linear"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>はい</p></td>
     <td><p>減衰スコアが計算される基準点。この値にあるアイテムは最大関連性スコアを受け取ります。時間ベースの減衰では、時間単位がコレクションデータと一致する必要があります。</p></td>
     <td><ul><li><p>タイムスタンプの場合：現在時刻（例：<code>int(time.time())</code>）</p></li><li><p>位置情報の場合：ユーザーの現在地座標</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>はい</p></td>
     <td><p>関連性が<code>decay</code>値に低下するまでの距離または時間。関連性の低下速度を制御します。時間ベースの減衰では、時間単位がコレクションデータと一致する必要があります。大きな値は関連性のより緩やかな下降を、小さな値はより急な下降を作成します。</p></td>
     <td><ul><li><p>時間の場合：秒単位の期間（例：<code>7 * 24 * 60 * 60</code> 7日分）</p></li><li><p>距離の場合：メートル（例：<code>5000</code> 5km）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>origin</code>の周囲に「減衰なしゾーン」を作成し、アイテムは最大スコア（減衰スコア=1.0）を維持します。時間ベースの減衰では、時間単位がコレクションデータと一致する必要があります。<code>origin</code>のこの範囲内のアイテムは最大関連性を維持します。</p></td>
     <td><ul><li><p>時間の場合：秒単位の期間（例：<code>24 * 60 * 60</code> 1日分）</p></li><li><p>距離の場合：メートル（例：<code>500</code> 500m）</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>scale</code>距離でのスコア値で、曲線の急峻度を制御します。低い値はより急な下降曲線を作成し、高い値はより緩やかな下降曲線を作成します。0〜1の間になければなりません。</p></td>
     <td><p><code>0.5</code>（デフォルト）</p></td>
   </tr>
</table>

### 標準ベクトル検索への適用\{#apply-to-standard-vector-search}

減衰ランカーを定義したら、検索操作中に`ranker`パラメータに渡すことで適用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 標準ベクトル検索で減衰関数を使用
results = milvus_client.search(
    collection_name,
    data=[your_query_vector], # クエリーベクトルに置き換えてください
    anns_field="vector_field",
    limit=10,
    output_fields=["document", "timestamp"],  # 出力に減衰フィールドを含めて値を確認
    #  highlight-next-line
    ranker=decay_ranker,                      # ここに減衰ランカーを適用
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
                .addFunction(ranker)
                .build())
        .build();
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const result = await milvusClient.search({
  collection_name: "collection_name",
  data: [your_query_vector], // クエリーベクトルに置き換えてください
  anns_field: "dense",
  limit: 10,
  output_fields: ["document", "timestamp"],
  rerank: ranker,
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
</Tabs>

### ハイブリッド検索への適用\{#apply-to-hybrid-search}

減衰ランカーは、複数のベクトルフィールドを組み合わせたハイブリッド検索操作にも適用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest

# 異なるベクトルフィールドの検索要求を定義
dense_request = AnnSearchRequest(
    data=[your_query_vector_1], # クエリーベクトルに置き換えてください
    anns_field="dense_vector",
    param={},
    limit=20
)

sparse_request = AnnSearchRequest(
    data=[your_query_vector_2], # クエリーベクトルに置き換えてください
    anns_field="sparse_vector",
    param={},
    limit=20
)

# 減衰ランカーをハイブリッド検索に適用
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [dense_request, sparse_request],
    #  highlight-next-line
    ranker=decay_ranker,                      # 同じ減衰ランカーはハイブリッド検索でも動作します
    limit=10,
    output_fields=["document", "timestamp"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.request.data.FloatVec;

List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("dense_vector")
        .vectors(Collections.singletonList(new FloatVec(embedding)))
        .limit(20)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("sparse_vector")
        .vectors(Collections.singletonList(new EmbeddedText("search query")))
        .limit(20)
        .build());

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
                .collectionName(COLLECTION_NAME)
                .searchRequests(searchRequests)
                .ranker(ranker)
                .limit(10)
                .outputFields(Arrays.asList("document", "timestamp"))
                .build();
SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const denseRequest = {
  data: [your_query_vector_1], // クエリーベクトルに置き換えてください
  anns_field: "dense_vector",
  param: {},
  limit: 20,
};

const sparseRequest = {
  data: [your_query_vector_2], // クエリーベクトルに置き換えてください
  anns_field: "sparse_vector",
  param: {},
  limit: 20,
};

const hybridResults = await milvusClient.hybrid_search({
  collection_name: "collection_name",
  data: [denseRequest, sparseRequest],
  ranker: decayRanker,
  limit: 10,
  output_fields: ["document", "timestamp"],
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
</Tabs>

ハイブリッド検索では、Zilliz Cloudはまずすべてのベクトルフィールドから最も高い類似度スコアを見つけ、そのスコアに減衰係数を適用します。