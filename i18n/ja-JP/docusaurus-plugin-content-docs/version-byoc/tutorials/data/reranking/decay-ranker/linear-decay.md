---
title: "線形減衰 | BYOC"
slug: /linear-decay
sidebar_label: "線形減衰"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "線形減衰は、検索結果で絶対ゼロ点で終了する直線的な減少を作成します。今後のイベントのカウントダウンのように関連性がイベントの通過まで徐々に薄れていくように、線形減衰はアイテムが理想的なポイントから離れるにつれて予測可能で一定の減少を適用し、最終的には完全に消滅します。このアプローチは、明確なカットオフを持つ一貫した減衰率が必要な場合に理想的です。これにより、ある境界を超えるアイテムが結果から完全に除外されます。 | BYOC"
type: origin
token: M7xHwZSIuiAP4Fkfm67cBU7Pn8g
sidebar_position: 4
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
  - linear decay
  - linear
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 線形減衰

線形減衰は、検索結果で絶対ゼロ点で終了する直線的な減少を作成します。今後のイベントのカウントダウンのように関連性がイベントの通過まで徐々に薄れていくように、線形減衰はアイテムが理想的なポイントから離れるにつれて予測可能で一定の減少を適用し、最終的には完全に消滅します。このアプローチは、明確なカットオフを持つ一貫した減衰率が必要な場合に理想的です。これにより、ある境界を超えるアイテムが結果から完全に除外されます。

他の減衰関数とは異なり：

- ガウス減衰はゼロに漸近するが決してゼロにならないベル曲線に従います

- 指数減衰は無期限に延長される最小限の関連性の長い尾を維持します

線形減衰は明確な終点を作成し、自然な境界や期限を持つアプリケーションに特に効果的です。

## 線形減衰を使用する場合\{#when-to-use-linear-decay}

線形減衰は特に以下の場合に効果的です：

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>線形減衰が適している理由</p></th>
   </tr>
   <tr>
     <td><p>イベント一覧</p></td>
     <td><p>コンサートチケットプラットフォーム</p></td>
     <td><p>未来に遠すぎるイベントの明確なカットオフを作成</p></td>
   </tr>
   <tr>
     <td><p>期間限定オファー</p></td>
     <td><p>フラッシュセール、プロモーション</p></td>
     <td><p>期限切れまたはまもなく期限切れになるオファーが表示されないように保証</p></td>
   </tr>
   <tr>
     <td><p>配達範囲</p></td>
     <td><p>フードデリバリー、宅配便サービス</p></td>
     <td><p>地理的境界を強制的に適用</p></td>
   </tr>
   <tr>
     <td><p>年齢制限コンテンツ</p></td>
     <td><p>マッチングプラットフォーム、メディアサービス</p></td>
     <td><p>明確な年齢しきい値を確立</p></td>
   </tr>
</table>

線形減衰を選択してください：

- あなたのアプリケーションが自然な境界、期限、またはしきい値を持っている場合

- あるポイントを超えるアイテムが結果から完全に除外されるべき場合

- 関連性の低下率が予測可能で一定である必要がある場合

- ユーザーが関連および関連でないアイテムの明確な区別を見られるべき場合

## 定常的減少の原則\{#steady-decline-principle}

線形減衰は、一定のレートで減少し、正確にゼロで終了する直線的なドロップを作成します。このパターンは、カウントダウンタイマー、在庫の減少、期限の迫った状況など、関連性が明確な有効期限を持つ多くの日常的なシナリオで見られます。

<Admonition type="info" icon="📘" title="注釈">

<p>すべての時間パラメータ（<code>origin</code>、<code>offset</code>、<code>scale</code>）は、コレクションデータと同じ単位を使用する必要があります。コレクションがタイムスタンプを異なる単位（ミリ秒、マイクロ秒）で保存している場合は、すべてのパラメータをそれに応じて調整してください。</p>

</Admonition>

![LNwQbV5FYo7OYbxaA1VcetPgnUh](/img/LNwQbV5FYo7OYbxaA1VcetPgnUh.png)

上記のグラフは、線形減衰がチケットプラットフォームでのイベント一覧にどのように影響するかを示しています：

- `origin`（現在日）：関連性が最大（1.0）である現在時刻。

- `offset`（1日）：「即時イベントウィンドウ」—翌日に発生するすべてのイベントは完全な関連性スコア（1.0）を維持し、非常にすぐ迫っているイベントがわずかな時間差でペナルティを受けないようにします。

- `decay`（0.5）：スケール距離でのスコア—このパラメータは関連性の減少率を制御します。

- `scale`（10日）：関連性が減衰値まで低下する期間—10日先のイベントは関連性スコアが半分（0.5）になります。

この直線的な曲線からわかるように、約16日以上先のイベントは完全にゼロの関連性を持ち、検索結果にまったく表示されません。これにより、ユーザーが定義された時間枠内で関連のある今後のイベントのみを確認できるようにする明確な境界線が作成されます。

この動作はイベント企画が通常どのように機能するかを反映しています—直近のイベントが最も関連性が高く、今後の週のイベントが重要性を下げていき、あまりにも未来（またはすでに過去）のイベントはまったく表示されるべきではありません。

## 式\{#formula}

線形減衰スコアを計算するための数学的式は以下の通りです：

$$
S(doc) = \max\left( \frac\{s - \max(0, |fieldvalue_{doc} - origin| - offset)}{s}, 0 \right)
$$

ただし：

$$
s = \frac {scale}{(1.0 - decay)}
$$

これを平易な言葉に分解すると：

1. フィールド値が原点からどれだけ離れているかを計算： $|fieldvalue_{doc} - origin|$。

2. オフセット（ある場合）を減算しますが、ゼロを下回らないように： $\max(0, distance - offset)$。

3. 減衰値とスケール値からパラメータ$s$を決定します。

4. 修正された距離を$s$から減算し、$s$で割ります。

5. 結果がゼロを下回らないようにします： $\max(result, 0)$。

$s$計算は、スケールと減衰パラメータをスコアがゼロに達する地点に変換します。たとえば、decay=0.5およびscale=7の場合、スコアは距離=14（スケール値の2倍）で正確にゼロになります。

## 線形減衰を使用\{#use-linear-decay}

線形減衰は、Zilliz Cloudの標準ベクトル検索およびハイブリッド検索操作の両方に適用できます。この機能を実装するための主要なコードスニペットは以下の通りです。

<Admonition type="info" icon="📘" title="注釈">

<p>減衰関数を使用する前に、まず減衰計算に使用される適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを最初に作成する必要があります。コレクションのセットアップ、スキーマ定義、およびデータ挿入を含む完全な作業例については、<a href="./tutorial-implement-time-based-ranking">減衰ランカーのチュートリアル</a>を参照してください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

数値フィールドを持つコレクションがセットアップされた後（この例では、現在から秒単位の`event_date`）、線形減衰ランカーを作成します：

<Admonition type="info" icon="📘" title="注釈">

<p><strong>時間単位の整合性</strong>：時間ベースの減衰を使用する場合、<code>origin</code>、<code>scale</code>、および<code>offset</code>パラメータがコレクションデータと同じ時間単位を使用していることを確認してください。コレクションがタイムスタンプを秒単位で保存している場合、すべてのパラメータに秒単位を使用してください。ミリ秒単位で保存している場合は、すべてのパラメータにミリ秒単位を使用してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import time

# 現在時刻を計算
current_time = int(time.time())

# イベント一覧のための線形減衰ランカーを作成
# 注：すべての時間パラメータはコレクションデータと同じ単位を使用する必要があります
ranker = Function(
    name="event_relevance",               # 関数識別子
    input_field_names=["event_date"],     # 使用する数値フィールド
    function_type=FunctionType.RERANK,    # 関数タイプ。RERANKでなければなりません
    params={
        "reranker": "decay",              # 減衰再ランカーを指定
        "function": "linear",             # 線形減衰を選択
        "origin": current_time,           # 現在時刻（秒、コレクションデータと一致）
        "offset": 12 * 60 * 60,           # 12時間の即時イベントウィンドウ（秒）
        "decay": 0.5,                     # スケール距離での半分のスコア
        "scale": 7 * 24 * 60 * 60         # 7日（秒単位、コレクションデータと一致）
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
    data=[your_query_vector],              # あなたのクエリベクトルに置き換えてください
    anns_field="dense",                   # 検索するベクトルフィールド
    limit=10,                             # 結果数
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
  data: [your_query_vector], // あなたのクエリベクトルに置き換えてください
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

# 密ベクトル検索要求を定義
dense = AnnSearchRequest(
    data=[your_query_vector_1], # あなたのクエリベクトルに置き換えてください
    anns_field="dense_vector",
    param={},
    limit=10
)

# スパースベクトル検索要求を定義
sparse = AnnSearchRequest(
    data=[your_query_vector_2], # あなたのクエリベクトルに置き換えてください
    anns_field="sparse_vector",
    param={},
    limit=10
)

# 減衰ランカーをハイブリッド検索に適用
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [dense, sparse],                      # 複数の検索要求
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
    data: [your_query_vector_1], // あなたのクエリベクトルに置き換えてください
    anns_field: "dense_vector",
    limit: 10,
    param: {}
};

const sparse = {
    data: [your_query_vector_2], // あなたのクエリベクトルに置き換えてください
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

ハイブリッド検索操作の詳細については、[マルチベクトルハイブリッド検索](./hybrid-search)を参照してください。
