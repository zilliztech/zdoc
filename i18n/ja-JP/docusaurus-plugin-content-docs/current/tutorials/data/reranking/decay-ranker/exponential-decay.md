---
title: "指数減衰 | Cloud"
slug: /exponential-decay
sidebar_label: "指数減衰"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "指数減衰は、検索結果で初期に急激な低下を起こした後に長期的な尾を引く現象を作ります。重要性が最初に急速に低下するが、一部のストーリーは時間と共に重要性を維持するような速報ニュースサイクルのように、指数減衰は理想的な範囲をわずかに超えるアイテムに急激なペナルティを適用しつつ、遠く離れたアイテムを発見可能に保ちます。このアプローチは、近接性または最新性を強く優先したいが、より遠くのオプションを完全に排除したくない場合に理想的です。| Cloud"
type: origin
token: FbVmwmuaei9WkIkIWJmcs3ManEd
sidebar_position: 3
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
  - 指数減衰
  - exp
  - ベクトル検索アルゴリズム
  - 質問応答システム
  - llm-as-a-judge
  - ハイブリッドベクトル検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 指数減衰

指数減衰は、検索結果で初期に急激な低下を起こした後に長期的な尾を引く現象を作ります。重要性が最初に急速に低下するが、一部のストーリーは時間と共に重要性を維持するような速報ニュースサイクルのように、指数減衰は理想的な範囲をわずかに超えるアイテムに急激なペナルティを適用しつつ、遠く離れたアイテムを発見可能に保ちます。このアプローチは、近接性または最新性を強く優先したいが、より遠くのオプションを完全に排除したくない場合に理想的です。

他の減衰関数とは異なり：

- ガウス減衰は、より緩やかでベル型の下降曲線を作成します

- 線形減衰は、正確にゼロに達するまで一定の割合で減少します

指数減衰は、特異的にペナルティを「先に」適用し、関連性の大部分を早期に削減しながら、最小限ながらもゼロではない関連性を維持するという特徴があります。

## 指数減衰を使用する場合\{#when-to-use-exponential-decay}

指数減衰は特に以下の場合に効果的です：

<table>
   <tr>
     <th><p>使用例</p></th>
     <th><p>例</p></th>
     <th><p>指数減衰が適している理由</p></th>
   </tr>
   <tr>
     <td><p>ニュースフィード</p></td>
     <td><p>速報ニュースポータル</p></td>
     <td><p>古くなったニュースの関連性を素早く低下させながら、何日前かの重要なストーリーを依然として表示します</p></td>
   </tr>
   <tr>
     <td><p>SNSのタイムライン</p></td>
     <td><p>アクティビティフィード、ステータス更新</p></td>
     <td><p>最新のコンテンツを強調しつつ、人気のある古いコンテンツが浮上できるようにします</p></td>
   </tr>
   <tr>
     <td><p>通知システム</p></td>
     <td><p>アラートの優先順位付け</p></td>
     <td><p>最新のアラートに緊急性を作りつつ、重要なアラートの視認性を維持します</p></td>
   </tr>
   <tr>
     <td><p>フラッシュセール</p></td>
     <td><p>期間限定オファー</p></td>
     <td><p>締め切りが近づくにつれて可視性を急速に低下させます</p></td>
   </tr>
</table>

以下のような場合に指数減衰を選択してください：

- ユーザーが非常に最新または近距離のアイテムを強く優先することを期待している場合

- 古いまたは遠く離れたアイテムも、例外的に関連性が高い場合は依然として発見可能にする場合

- 関連性の低下が前方に集中しているべき（開始時に急激で、その後は緩やか）場合

## 急激な低下の原則\{#sharp-drop-off-principle}

指数減衰は、最初に急速に低下し、その後ゼロに近づくが決してゼロに達しない長期的な尾を引く曲線を作成します。この数学的パターンは、放射性崩壊、人口減少、時間経過に伴う情報の重要性などの自然現象で頻繁に現れます。

<Admonition type="info" icon="📘" title="注意">

<p>すべての時間パラメータ（<code>origin</code>、<code>offset</code>、<code>scale</code>）は、コレクションデータと同じ単位を使用する必要があります。コレクションがタイムスタンプを異なる単位（ミリ秒、マイクロ秒）で保存している場合は、すべてのパラメータをそれに応じて調整してください。</p>

</Admonition>

![YaRsbolv9oqomcxrFe5cXBa4nNg](/img/YaRsbolv9oqomcxrFe5cXBa4nNg.png)

上のグラフは、指数減衰がデジタルニュースプラットフォームでのニュース記事のランキングにどのように影響するかを示しています：

- `origin`（現在時刻）：関連性が最大（1.0）になる現在の時刻。

- `offset`（3時間）：「速報ニュースウィンドウ」—直近3時間以内に公開されたすべてのストーリーは完全な関連性スコア（1.0）を維持し、非常に最新のニュースがわずかな時間差で不必要にペナルティを受けないようにします。

- `decay`（0.5）：スケール距離でのスコア—このパラメータは、時間とともにスコアがどれだけ劇的に減少するかを制御します。

- `scale`（24時間）：関連性が減衰値まで低下する期間—正確に24時間前のニュース記事はその関連性スコアが半分（0.5）になります。

曲線からわかるように、24時間より古いニュース記事は関連性が低下し続けますが、決してゼロにはなりません。何日前かのストーリーでも最小限の関連性を維持し、重要であるが古いニュースが（低いランクで）フィードに表示される可能性を残します。

この動作は、ニュースの関連性が通常どのように機能するかを模倣しています—非常に最新のストーリーが強く優位に立ちますが、ユーザーの関心に非常に関連性が高い場合は、重要な古いストーリーも依然として注目される可能性があります。

## 式\{#formula}

指数減衰スコアを計算するための数学的式は以下の通りです：

$$
S(doc) = \exp\left( \lambda \cdot \max\left(0, \left|fieldvalue_{doc} - origin\right| - offset \right) \right)
$$

ただし：

$$
\lambda = \frac\{\ln(decay)}{scale}
$$

平易な言葉で分解すると：

1. フィールド値が原点からどれだけ離れているかを計算します： $|fieldvalue_{doc} - origin|$。

1. オフセット（存在する場合）を引きますが、ゼロを下回ることはありません： $\max(0, distance - offset)$。

1. $\lambda$（スケールと減衰パラメータから計算されます）を乗算します。

1. 指数を取り、0〜1の値を得ます： $\exp(\lambda \cdot value)$。

$\lambda$の計算は、スケールと減衰パラメータを指数関数のレートパラメータに変換します。より負の$\lambda$が急な初期の低下を作成します。

## 指数減衰の使用\{#use-exponential-decay}

指数減衰は、Zilliz Cloudの標準ベクトル検索およびハイブリッド検索操作の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="注意">

<p>減衰関数を使用する前に、減衰計算に使用される適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、およびデータ挿入を含む完全な作業例については、<a href="./tutorial-implement-time-based-ranking">減衰ランカーのチュートリアル</a>を参照してください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

数値フィールドでコレクションのセットアップが完了した後（この例では`publish_time`）、指数減衰ランカーを作成します：

<Admonition type="info" icon="📘" title="注意">

<p><strong>時間単位の整合性</strong>：時間ベースの減衰を使用する際は、<code>origin</code>、<code>scale</code>、および<code>offset</code>パラメータがコレクションデータと同じ時間単位を使用していることを確認してください。コレクションがタイムスタンプを秒単位で保存している場合は、すべてのパラメータに秒単位を使用してください。ミリ秒単位の場合は、すべてのパラメータにミリ秒単位を使用してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import datetime

# ニュースの最新性のための指数減衰ランカーを作成
# 注：すべての時間パラメータはコレクションデータと同じ単位を使用する必要があります
ranker = Function(
    name="news_recency",                  # 関数識別子
    input_field_names=["publish_time"],   # 使用する数値フィールド
    function_type=FunctionType.RERANK,    # 関数タイプ。RERANKでなければなりません
    params={
        "reranker": "decay",              # 減衰再ランカーを指定
        "function": "exp",                # 指数減衰を選択
        "origin": int(datetime.datetime.now().timestamp()),  # 現在時刻（秒、コレクションデータに一致）
        "offset": 3 * 60 * 60,            # 3時間の速報ニュースウィンドウ（秒）
        "decay": 0.5,                     # 一定距離での半分のスコア
        "scale": 24 * 60 * 60             # 24時間（秒、コレクションデータに一致）
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker ranker = DecayRanker.builder()
        .name("news_recency")
        .inputFieldNames(Collections.singletonList("publish_time"))
        .function("exp")
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
  name: "news_recency",
  input_field_names: ["publish_time"],
  type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "exp",
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

### 標準ベクトル検索への適用\{#apply-to-standard-vector-search}

減衰ランカーを定義した後、検索操作中に`ranker`パラメータに渡すことで適用できます：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 減衰ランカーをベクトル検索に適用
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],             # クエリーベクトルに置き換えてください
    anns_field="dense",                   # 検索するベクトルフィールド
    limit=10,                             # 結果の数
    output_fields=["title", "publish_time"], # 戻すフィールド
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
import io.milvus.v2.service.vector.request.data.EmbeddedText;

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("market analysis")))
        .annsField("vector_field")
        .limit(10)
        .outputFields(Arrays.asList("title", "publish_time"))
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
import { FunctionType MilvusClient } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient("YOUR_CLUSTER_ENDPOINT");

const result = await milvusClient.search({
  collection_name: "collection_name",
  data: [your_query_vector], // クエリーベクトルに置き換えてください
  anns_field: "dense",
  limit: 10,
  output_fields: ["title", "publish_time"],
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
    anns_field="dense",
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
    output_fields=["title", "publish_time"]
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
        .vectors(Collections.singletonList(new EmbeddedText("market analysis")))
        .limit(10)
        .build());

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
                .collectionName(COLLECTION_NAME)
                .searchRequests(searchRequests)
                .ranker(ranker)
                .limit(10)
                .outputFields(Arrays.asList("title", "publish_time"))
                .build();
SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const dense = {
    data: [your_query_vector_1], # クエリーベクトルに置き換えてください
    anns_field: "dense",
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
    output_fields: ["title", "publish_time"],
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