---
title: "減衰ランカー概要 | BYOC"
slug: /decay-ranker-overview
sidebar_label: "減衰ランカー概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "伝統的なベクトル検索では、結果は純粋にベクトル類似度—数学的空間内でベクトルがどれほど密接に一致するか—に基づいてランク付けされます。しかし、現実世界のアプリケーションでは、コンテンツが本当に関連性を持つ理由はセマンティック類似性以上に多くの要因に依存することがよくあります。 | BYOC"
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
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 減衰ランカー概要

伝統的なベクトル検索では、結果は純粋にベクトル類似度—数学的空間内でベクトルがどれほど密接に一致するか—に基づいてランク付けされます。しかし、現実世界のアプリケーションでは、コンテンツが本当に関連性を持つ理由はセマンティック類似性以上に多くの要因に依存することがよくあります。

日常的なシナリオをいくつか考えてみましょう：

- 3年前の類似記事よりも昨日の記事が上位にランクされるべきニュース検索

- 30分のドライブが必要な場所よりも徒歩5分のレストランを優先するレストランファインダー

- 検索クエリと少ししか類似していない場合でもトレンド商品を強調するECプラットフォーム

これらのシナリオはすべて共通のニーズを共有しています：時間、距離、または人気などの他の数値的な要素とベクトル類似度をバランスさせること。

Zilliz Cloudの減衰ランカーは、数値フィールド値に基づいて検索ランクを調整することでこのニーズに対応します。これにより、データの「新鮮さ」、「近接性」、またはその他の数値的な特性をベクトル類似度とバランスさせ、より直感的で文脈的に関連性のある検索体験を作成できます。

## 使用上の注意\{#usage-notes}

- 減衰ランキングはグループ検索では使用できません。

- 減衰ランキングに使用されるフィールドは数値でなければなりません（`INT8`、`INT16`、`INT32`、`INT64`、`FLOAT`、または`DOUBLE`）。

- 各減衰ランカーは1つの数値フィールドのみを使用できます。

- **時間単位の整合性**：時間ベースの減衰ランキングを使用する場合、`origin`、`scale`、および`offset`パラメータの単位はコレクションデータで使用される単位と一致する必要があります：

    - コレクションがタイムスタンプを**秒**単位で保存している場合、すべてのパラメータに秒単位を使用

    - コレクションがタイムスタンプを**ミリ秒**単位で保存している場合、すべてのパラメータにミリ秒単位を使用

    - コレクションがタイムスタンプを**マイクロ秒**単位で保存している場合、すべてのパラメータにマイクロ秒単位を使用

## 仕組み\{#how-it-works}

減衰ランキングは、時間や地理的距離などの数値的な要素をランキングプロセスに組み込むことで従来のベクトル検索を強化します。全体のプロセスはこれらの段階に従います：

### ステージ1: 正規化された類似度スコアの計算\{#stage-1-calculate-normalized-similarity-scores}

まず、Zilliz Cloudは一貫した比較を確実にするためにベクトル類似度スコアを計算および正規化します：

- **L2**および**JACCARD**距離メトリックの場合（低い値が高い類似度を示す）：

    ```plaintext
    正規化されたスコア = 1.0 - (2 × arctan(スコア))/π
    ```

    これにより、0-1の間の類似度スコアに距離が変換され、数値が高いほうが良い結果になります。

- **IP**、**COSINE**、および**BM25**メトリックの場合（既に高いスコアがより良い一致を示す）：スコアは正規化せずに直接使用されます。

### ステージ2: 減衰スコアの計算\{#stage-2-calculate-decay-scores}

次に、Zilliz Cloudは選択した減衰ランカーを使用し、数値フィールド値（タイムスタンプや距離など）に基づいて減衰スコアを計算します：

- 各減衰ランカーは生の数値を0-1の間の正規化された関連性スコアに変換します

- 減衰スコアは、理想的なポイントからの「距離」に基づいてアイテムがどれほど関連性があるかを表します

特定の計算式は減衰ランカータイプによって異なります。減衰スコアの計算方法の詳細については、[ガウス減衰](./gaussian-decay#formula)、[指数減衰](./exponential-decay#formula)、[線形減衰](./linear-decay#formula)の専用ページを参照してください。

### ステージ3: 最終スコアの計算\{#stage-3-compute-final-scores}

最後に、Zilliz Cloudは正規化された類似度スコアと減衰スコアを組み合わせて最終的なランキングスコアを生成します：

```plaintext
最終スコア = 正規化された類似度スコア × 減衰スコア
```

ハイブリッド検索（複数のベクトルフィールドを組み合わせる）の場合は、Zilliz Cloudは検索要求間で最大の正規化類似度スコアを取ります：

```plaintext
最終スコア = max([正規化スコア₁, 正規化スコア₂, ..., 正規化スコアₙ]) × 減衰スコア
```

たとえば、研究論文がベクトル類似度で0.82、BM25ベースのテキスト検索で0.91のスコアを取得した場合、Zilliz Cloudは減衰係数を適用する前に0.91を基本類似度スコアとして使用します。

### 減衰ランキングの実際\{#decay-ranking-in-action}

実際のシナリオで減衰ランキングを見てみましょう—時間ベースの減衰を使って**「AI研究論文」**を検索する例です：

<Admonition type="info" icon="📘" title="注釈">

<p>この例では、減衰スコアは関連性が時間とともに減少する様子を反映しています—新しい論文は1.0に近いスコアを受け取り、古い論文は低いスコアを受け取ります。これらの値は特定の減衰ランカーを使用して計算されます。詳細については、<a href="./decay-ranker-overview#choose-the-right-decay-ranker">適切な減衰ランカーの選択</a>を参照してください。</p>

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
     <td><p>6ヶ月前</p></td>
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
     <td><p>中〜高</p></td>
     <td><p>0.76 (<code>COSINE</code>)</p></td>
     <td><p>3週間前</p></td>
     <td><p>0.70</p></td>
     <td><p>0.53</p></td>
     <td><h1 id="4">4</h1></td>
   </tr>
</table>

減衰再ランクを行わない場合、論文Bは純粋なベクトル類似度（0.92）に基づいて最も高いランクになります。しかし、減衰再ランクが適用された場合：

- 論文Cは中程度の類似度にもかかわらず、非常に最新（昨日公開）であるため、第1位にジャンプします

- 論文Bは優れた類似度にもかかわらず、比較的古いため第3位に下がります

- 論文DはL2距離（低い方が良い）を使用しており、減衰を適用する前に1.2から0.76にスコアが正規化されます

## 適切な減衰ランカーの選択\{#choose-the-right-decay-ranker}

Zilliz Cloudは、`gauss`、`exp`、`linear`の3つの異なる減衰ランカーを提供しており、それぞれ特定のユースケース用に設計されています：

<table>
   <tr>
     <th><p>減衰ランカー</p></th>
     <th><p>特徴</p></th>
     <th><p>理想的な使用ケース</p></th>
     <th><p>例のシナリオ</p></th>
   </tr>
   <tr>
     <td><p>ガウス (<code>gauss</code>)</p></td>
     <td><p>中程度に延びる自然に感じられる徐々の減少</p></td>
     <td><ul><li><p>バランスの取れた結果が必要な汎用検索</p></li><li><p>ユーザーが距離を直感的に理解できるアプリケーション</p></li><li><p>中程度の距離が結果に深刻なペナルティを与えない場合</p></li></ul></td>
     <td><p>レストラン検索では、3km離れた質の高い店舗も発見可能ですが、近くの選択肢よりランクは低くなります</p></td>
   </tr>
   <tr>
     <td><p>指数 (<code>exp</code>)</p></td>
     <td><p>最初は急速に減少しますが、長期的な尾を維持</p></td>
     <td><ul><li><p>最新性が重要なニュースフィード</p></li><li><p>新鮮なコンテンツが支配するべきソーシャルメディア</p></li><li><p>近接性が強く好まれるが、例外的な遠く離れたアイテムが可視状態であるべき場合</p></li></ul></td>
     <td><p>ニュースアプリでは、昨日のストーリーが1週間前のコンテンツよりはるかに高いランクになりますが、非常に関連性の高い古い記事も表示される可能性があります</p></td>
   </tr>
   <tr>
     <td><p>線形 (<code>linear</code>)</p></td>
     <td><p>明確なカットオフを持つ一貫した予測可能な減少</p></td>
     <td><ul><li><p>自然な境界線を持つアプリケーション</p></li><li><p>距離制限のあるサービス</p></li><li><p>有効期限または明確なしきい値を持つコンテンツ</p></li></ul></td>
     <td><p>イベントファインダーでは、2週間先の将来ウィンドウを超えるイベントはまったく表示されません</p></td>
   </tr>
</table>

各減衰ランカーがスコアをどのように計算し、特定の減少パターンについての詳細情報については、専用ドキュメントを参照してください：

- [ガウス減衰](./gaussian-decay)

- [指数減衰](./exponential-decay)

- [線形減衰](./linear-decay)

## 実装例\{#implementation-example}

減衰ランカーは、Zilliz Cloudの標準ベクトル検索およびハイブリッド検索操作の両方に適用できます。この機能を実装するための主要コードスニペットは以下の通りです。

<Admonition type="info" icon="📘" title="注釈">

<p>減衰関数を使用する前に、まず減衰計算で使用される適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、およびデータ挿入を含む完全な作業例については、<a href="./tutorial-implement-time-based-ranking">チュートリアル：Milvusでの時間ベースのランキングの実装</a>を参照してください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

コレクションが数値フィールド（この例では`timestamp`）とともにセットアップされた後、減衰ランカーを作成します：

<Admonition type="info" icon="📘" title="注釈">

<p><strong>時間単位の整合性</strong>：時間ベースの減衰を使用する場合、<code>origin</code>、<code>scale</code>、および<code>offset</code>パラメータがコレクションデータと同じ時間単位を使用していることを確認してください。コレクションがタイムスタンプを秒単位で保存している場合、すべてのパラメータに秒を使用してください。ミリ秒単位で保存している場合は、すべてのパラメータにミリ秒を使用してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import datetime

# タイムスタンプベースの減衰のための減衰関数を作成
# 注：すべての時間パラメータはコレクションデータと同じ単位を使用する必要があります
ranker = Function(
    name="time_decay",                  # 関数識別子
    input_field_names=["timestamp"],    # 減衰に使用する数値フィールド
    function_type=FunctionType.RERANK,  # 関数タイプ。RERANKに設定する必要があります
    params={
        "reranker": "decay",            # 減衰再ランカーを指定
        "function": "gauss",            # 減衰関数タイプを選択："gauss"、"exp"、または"linear"
        "origin": int(datetime.datetime(2025, 1, 15).timestamp()),    # 基準点（秒）
        "offset": 7 * 24 * 60 * 60,    # 7日間のノーディケイズーン（秒）
        "decay": 0.5,                  # スケール距離での半分のスコア
        "scale": 24 * 60 * 60          # 24時間（秒単位、コレクションデータと一致）
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker ranker = DecayRanker.builder()
        .name("time_decay")
        .inputFieldNames(Collections.singletonList("timestamp"))
        .function("gauss")
        .origin(System.currentTimeMillis())
        .offset(3 * 60 * 60)
        .decay(0.5)
        .scale(24 * 60 * 60)
        .build();

```

</TabItem>

<TabItem value='javascript'>

```javascript

import { FunctionType } from "@zilliz/milvus2-sdk-node";

const ranker = {
  name: "time_decay",
  input_field_names: ["timestamp"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "gauss",
    origin: new Date(2025, 1, 15).getTime(),
    offset: 3 * 60 * 60,
    decay: 0.5,
    scale: 24 * 60 * 60,
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
     <td><p>検索実行時に使用される関数の識別子。使用例に関連する説明的な名前を選択してください。</p></td>
     <td><p><code>"time_decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>減衰スコア計算用の数値フィールド。減衰計算に使用されるデータ属性を決定します（例：時間ベースの減衰のためのタイムスタンプ、場所ベースの減衰のための座標）。</p><p>関連する数値値を含むコレクション内のフィールドである必要があります。INT8/16/32/64、FLOAT、DOUBLEをサポートします。</p></td>
     <td><p><code>["timestamp"]</code></p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>作成される関数のタイプを指定します。</p><p>すべての減衰ランカーでは<code>RERANK</code>に設定する必要があります。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用する再ランク方法を指定します。</p><p>減衰ランキング機能を有効にするには<code>"decay"</code>に設定する必要があります。</p></td>
     <td><p><code>"decay"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.function</code></p></td>
     <td><p>はい</p></td>
     <td><p>適用する数学的減衰ランカーを指定します。関連性の下降曲線の形状を決定します。</p><p>適切な関数の選択に関するガイダンスについては、<a href="./decay-ranker-overview#choose-the-right-decay-ranker">適切な減衰ランカーの選択</a>セクションを参照してください。</p></td>
     <td><p><code>"gauss"</code>、<code>"exp"</code>、または<code>"linear"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.origin</code></p></td>
     <td><p>はい</p></td>
     <td><p>減衰スコアが計算される基準点。この値を持つアイテムは最大関連性スコアを受け取ります。</p><p>時間ベースの減衰では、時間単位がコレクションデータと一致する必要があります。</p></td>
     <td><ul><li><p>タイムスタンプ用：現在時刻（例：<code>int(time.time())</code>）</p></li><li><p>位置情報用：ユーザーの現在の座標</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.scale</code></p></td>
     <td><p>はい</p></td>
     <td><p>関連性が<code>decay</code>値にまで低下する距離または時間。関連性の低下速度を制御します。</p><p>時間ベースの減衰では、時間単位がコレクションデータと一致する必要があります。</p><p>大きな値は関連性のより徐々の減少を生み出し、小さな値はより急な減少を生み出します。</p></td>
     <td><ul><li><p>時間用：秒単位の期間（例：<code>7 * 24 * 60 * 60</code>（7日分））</p></li><li><p>距離用：メートル（例：<code>5000</code>（5km））</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.offset</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>origin</code>の周囲に「ノーディケイゾーン」を作成し、アイテムは完全スコア（減衰スコア = 1.0）を維持します。</p><p>時間ベースの減衰では、時間単位がコレクションデータと一致する必要があります。</p><p><code>origin</code>からのこの範囲内のアイテムは最大関連性を維持します。</p></td>
     <td><ul><li><p>時間用：秒単位の期間（例：<code>24 * 60 * 60</code>（1日分））</p></li><li><p>距離用：メートル（例：<code>500</code>（500m））</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>params.decay</code></p></td>
     <td><p>いいえ</p></td>
     <td><p><code>scale</code>距離でのスコア値。曲線の急勾配を制御します。低い値はより急な下降曲線を作成し、高い値はより徐々の下降曲線を作成します。</p><p>0と1の間である必要があります。</p></td>
     <td><p><code>0.5</code>（デフォルト）</p></td>
   </tr>
</table>

### 標準ベクトル検索への適用\{#apply-to-standard-vector-search}

減衰ランカーを定義した後、検索操作中に`ranker`パラメータに渡すことで適用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 標準ベクトル検索で減衰関数を使用
results = milvus_client.search(
    collection_name,
    data=[your_query_vector], # あなたのクエリベクトルに置き換えてください
    anns_field="vector_field",
    limit=10,
    output_fields=["document", "timestamp"],  # 出力に値を見るために減衰フィールドを含める
    #  highlight-next-line
    ranker=ranker,                        # 減衰ランカーをここに適用
    consistency_level="Strong"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.ConsistencyLevel;
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
        .consistencyLevel(ConsistencyLevel.STRONG)
        .build();
SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const result = await milvusClient.search({
  collection_name: "collection_name",
  data: [your_query_vector], // あなたのクエリベクトルに置き換えてください
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

減衰ランカーは、複数のベクトルフィールドを組み合わせるハイブリッド検索操作にも適用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import AnnSearchRequest

# 異なるベクトルフィールドの検索要求を定義
dense_request = AnnSearchRequest(
    data=[your_query_vector_1], # あなたのクエリベクトルに置き換えてください
    anns_field="dense_vector",
    param={},
    limit=20
)

sparse_request = AnnSearchRequest(
    data=[your_query_vector_2], # あなたのクエリベクトルに置き換えてください
    anns_field="sparse_vector",
    param={},
    limit=20
)

# 減衰ランカーをハイブリッド検索に適用
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [dense_request, sparse_request],
    #  highlight-next-line
    ranker=ranker,                        # 同じ減衰ランカーはハイブリッド検索でも機能
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
  data: [your_query_vector_1], // あなたのクエリベクトルに置き換えてください
  anns_field: "dense_vector",
  param: {},
  limit: 20,
};

const sparseRequest = {
  data: [your_query_vector_2], // あなたのクエリベクトルに置き換えてください
  anns_field: "sparse_vector",
  param: {},
  limit: 20,
};

const hybridResults = await milvusClient.hybrid_search({
  collection_name: "collection_name",
  data: [denseRequest, sparseRequest],
  ranker: ranker,
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

ハイブリッド検索では、Zilliz Cloudはまずすべてのベクトルフィールドから最大の類似度スコアを探し出し、その後そのスコアに減衰係数を適用します。