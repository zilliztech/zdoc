---
title: "線形減衰 | Cloud"
slug: /linear-decay
sidebar_label: "線形減衰"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "線形減衰は、検索結果で絶対ゼロ点で終了する直線的な下降を作成します。関連性がイベントが過ぎるまで徐々に薄れていく今後のイベントのカウントダウンのように、線形減衰は理想的なポイントから離れると予測可能な一定の割合で関連性を減少させ、完全に消えるまで続きます。このアプローチは、明確なカットオフ付きの一貫した減衰率が望まれる場合に理想的で、ある境界を超えたアイテムが結果から完全に除外されるようにします。| Cloud"
type: origin
token: M7xHwZSIuiAP4Fkfm67cBU7Pn8g
sidebar_position: 4
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - データ
  - 検索結果の再ランク付け
  - 結果の再ランク付け
  - 減衰
  - 減衰ランカー
  - 線形減衰
  - linear
  - Vector store
  - オープンソースベクトルデータベース
  - Vector index
  - ベクトルデータベースオープンソース

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 線形減衰

線形減衰は、検索結果で絶対ゼロ点で終了する直線的な下降を作成します。関連性がイベントが過ぎるまで徐々に薄れていく今後のイベントのカウントダウンのように、線形減衰は理想的なポイントから離れると予測可能な一定の割合で関連性を減少させ、完全に消えるまで続きます。このアプローチは、明確なカットオフ付きの一貫した減衰率が望まれる場合に理想的で、ある境界を超えたアイテムが結果から完全に除外されるようにします。

他の減衰関数とは異なり：

- ガウス減衰は、徐々にゼロに近づくが決してゼロに達しないベル曲線に従います

- 指数減衰は、無期限に続く最小限の関連性の尾を維持します

線形減衰は、自然な境界線や締切があるアプリケーションに特に効果的な明確な終点を作成します。

## 線形減衰を使用する場合\{#when-to-use-linear-decay}

線形減衰は特に以下の場合に効果的です：

<table>
   <tr>
     <th><p>使用例</p></th>
     <th><p>例</p></th>
     <th><p>線形がよく機能する理由</p></th>
   </tr>
   <tr>
     <td><p>イベントリスト</p></td>
     <td><p>コンサートチケットプラットフォーム</p></td>
     <td><p>未来に遠く離れたイベントに対する明確なカットオフを作成します</p></td>
   </tr>
   <tr>
     <td><p>期間限定オファー</p></td>
     <td><p>フラッシュセール、プロモーション</p></td>
     <td><p>期限切れまたは間もなく期限切れになるオファーが表示されないようにします</p></td>
   </tr>
   <tr>
     <td><p>配送可能範囲</p></td>
     <td><p>フードデリバリー、宅配サービス</p></td>
     <td><p>厳しい地理的境界を強制します</p></td>
   </tr>
   <tr>
     <td><p>年齢制限のあるコンテンツ</p></td>
     <td><p>出会い系プラットフォーム、メディアサービス</p></td>
     <td><p>堅牢な年齢のしきい値を確立します</p></td>
   </tr>
</table>

以下のような場合に線形減衰を選択してください：

- あなたのアプリケーションに自然な境界、締切、またはしきい値がある場合

- あるポイントを超えたアイテムを結果から完全に除外する必要がある場合

- 関連性の低下率を予測可能で一貫性のあるものにする必要がある場合

- ユーザーが関連性のあるアイテムと無関係なアイテムの間の明確な区別を見られるべきである場合

## 定常的な下降の原則\{#steady-decline-principle}

線形減衰は、正確にゼロに達するまで一定の割合で減少する直線的な下降を作成します。このパターンは、関連性に明確な有効期限があるカウントダウンタイマー、在庫の減少、締切の接近など多くの日常的なシナリオに現れます。

<Admonition type="info" icon="📘" title="注意">

<p>すべての時間パラメータ（<code>origin</code>、<code>offset</code>、<code>scale</code>）は、コレクションデータと同じ単位を使用する必要があります。コレクションがタイムスタンプを異なる単位（ミリ秒、マイクロ秒）で保存している場合は、すべてのパラメータをそれに応じて調整してください。</p>

</Admonition>

![LNwQbV5FYo7OYbxaA1VcetPgnUh](/img/LNwQbV5FYo7OYbxaA1VcetPgnUh.png)

上のグラフは、線形減衰がチケットプラットフォームでのイベントリストにどのように影響するかを示しています：

- `origin`（現在日）：関連性が最大（1.0）になる現在時刻。

- `offset`（1日）：「即時イベントウィンドウ」—次の1日以内に発生するすべてのイベントは完全な関連性スコア（1.0）を維持し、非常に近いイベントがわずかな時間差でペナルティを受けないようにします。

- `decay`（0.5）：スケール距離でのスコア—このパラメータは関連性の低下率を制御します。

- `scale`（10日）：関連性が減衰値まで低下する期間—10日先のイベントは関連性スコアが半分（0.5）になります。

直線的な曲線からわかるように、約16日以上先のイベントは完全にゼロの関連性を持ち、検索結果には全く表示されません。これにより、ユーザーが定義された時間枠内で関連性のある upcoming イベントのみを確実に見れるようにする明確な境界が作成されます。

この動作は、イベント計画が通常どのように機能するかを模倣しています—間近のイベントが最も関連性が高く、今後の週のイベントは重要性が低下し、未来に遠く離れたイベント（または既に過ぎたイベント）は全く表示されるべきではありません。

## 式\{#formula}

線形減衰スコアを計算するための数学的式は以下の通りです：

$$
S(doc) = \max\left( \frac\{s - \max(0, |fieldvalue_{doc} - origin| - offset)}{s}, 0 \right)
$$

ただし：

$$
s = \frac {scale}{(1.0 - decay)}
$$

平易な言葉で分解すると：

1. フィールド値が原点からどれだけ離れているかを計算します： $|fieldvalue_{doc} - origin|$。

1. オフセット（存在する場合）を引きますが、ゼロを下回ることはありません： $\max(0, distance - offset)$。

1. スケールと減衰値からパラメータ$s$を決定します。

1. 調整された距離を$s$から引き、$s$で割ります。

1. 結果がゼロを下回らないようにします： $\max(result, 0)$。

$s$の計算は、スケールと減衰パラメータをスコアがゼロに達する点に変換します。たとえば、decay=0.5、scale=7の場合、スコアは距離=14（スケール値の2倍）で正確にゼロになります。

## 線形減衰の使用\{#use-linear-decay}

線形減衰は、Zilliz Cloudの標準ベクトル検索およびハイブリッド検索操作の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="注意">

<p>減衰関数を使用する前に、減衰計算に使用される適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、およびデータ挿入を含む完全な作業例については、<a href="./tutorial-implement-time-based-ranking">減衰ランカーのチュートリアル</a>を参照してください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

数値フィールドでコレクションのセットアップが完了した後（この例では、現在からの秒数である`event_date`）、線形減衰ランカーを作成します：

<Admonition type="info" icon="📘" title="注意">

<p><strong>時間単位の整合性</strong>：時間ベースの減衰を使用する際は、<code>origin</code>、<code>scale</code>、および<code>offset</code>パラメータがコレクションデータと同じ時間単位を使用していることを確認してください。コレクションがタイムスタンプを秒単位で保存している場合は、すべてのパラメータに秒単位を使用してください。ミリ秒単位の場合は、すべてのパラメータにミリ秒単位を使用してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import time

# 現在時刻を計算
current_time = int(time.time())

# イベントリスト用の線形減衰ランカーを作成
# 注：すべての時間パラメータはコレクションデータと同じ単位を使用する必要があります
ranker = Function(
    name="event_relevance",               # 関数識別子
    input_field_names=["event_date"],     # 使用する数値フィールド
    function_type=FunctionType.RERANK,    # 関数タイプ。RERANKでなければなりません
    params={
        "reranker": "decay",              # 減衰再ランカーを指定
        "function": "linear",             # 線形減衰を選択
        "origin": current_time,           # 現在時刻（秒、コレクションデータに一致）
        "offset": 12 * 60 * 60,           # 12時間の即時イベントウィンドウ（秒）
        "decay": 0.5,                     # 一定距離での半分のスコア
        "scale": 7 * 24 * 60 * 60         # 7日間（秒、コレクションデータに一致）
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker ranker = DecayRanker.builder()
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

const ranker = {
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
</Tabs>

### 標準ベクトル検索への適用\{#apply-to-standard-vector-search}

減衰ランカーを定義した後、検索操作中に`ranker`パラメータに渡すことで適用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 減衰ランカーをベクトル検索に適用
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],              # クエリーベクトルに置き換えてください
    anns_field="dense",                   # 検索するベクトルフィールド
    limit=10,                             # 結果の数
    output_fields=["title", "venue", "event_date"], # 戻すフィールド
    #  highlight-next-line
    ranker=ranker,                        # 減衰ランカーを適用
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
  data: [your_query_vector], // クエリーベクトルに置き換えてください
  anns_field: "dense",
  limit: 10,
  output_fields: ["title", "venue", "event_date"],
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

# 密ベクトル検索リクエストを定義
dense = AnnSearchRequest(
    data=[your_query_vector_1], # クエリーベクトルに置き換えてください
    anns_field="dense_vector",
    param={},
    limit=10
)

# スパースベクトル検索リクエストを定義
sparse = AnnSearchRequest(
    data=[your_query_vector_2], # クエリーベクトルに置き換えてください
    anns_field="sparse_vector",
    param={},
    limit=10
)

# 減衰ランカーをハイブリッド検索に適用
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [dense, sparse],                      # 複数の検索リクエスト
    #  highlight-next-line
    ranker=ranker,                        # 同じ減衰ランカー
    limit=10,
    output_fields=["title", "venue", "event_date"]
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
        .limit(10)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("sparse_vector")
        .vectors(Collections.singletonList(new EmbeddedText("music concerts")))
        .limit(10)
        .build());

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
                .collectionName(COLLECTION_NAME)
                .searchRequests(searchRequests)
                .ranker(ranker)
                .limit(10)
                .outputFields(Arrays.asList("title", "venue", "event_date"))
                .build();
SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const dense = {
    data: [your_query_vector_1], # クエリーベクトルに置き換えてください
    anns_field: "dense_vector",
    limit: 10,
    param: {}
};

const sparse = {
    data: [your_query_vector_2], # クエリーベクトルに置き換えてください
    anns_field: "sparse_vector",
    limit: 10,
    params: {}
};

const hybrid = await milvusClient.search({
    collection_name: "collection_name",
    data: [dense, sparse],
    rerank: ranker,
    limit: 10,
    output_fields: ["title", "venue", "event_date"],
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

ハイブリッド検索操作の詳細については、[複数ベクトルハイブリッド検索](./hybrid-search)を参照してください。