---
title: "指数減衰 | BYOC"
slug: /exponential-decay
sidebar_label: "指数減衰"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "指数減衰は、検索結果で急激な初期降下とその後に続く長いテールを作成します。ニュースサイクルのように、関連性が最初は急速に低下するが、一部のストーリーは時間とともに重要性を維持する場合、指数減衰は理想的な範囲外にあるアイテムに厳しいペナルティを適用しつつ、遠く離れたアイテムの発見性を維持します。このアプローチは、近接性や新しさを強く優先したいが、さらに遠くにあるオプションを完全に排除したくない場合に最適です。 | BYOC"
type: origin
token: FbVmwmuaei9WkIkIWJmcs3ManEd
sidebar_position: 3
keywords:
  - zilliz
  - ベクターデータベース
  - クラウド
  - コレクション
  - データ
  - 検索結果のランク付け
  - 結果のランク付け
  - 減衰
  - 減衰ランカー
  - 指数減衰
  - exp
  - Faiss
  - ビデオ検索
  - AI ハルシネーション
  - AI エージェント

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 指数減衰

指数減衰は、検索結果で急激な初期降下とその後に続く長いテールを作成します。ニュースサイクルのように、関連性が最初は急速に低下するが、一部のストーリーは時間とともに重要性を維持する場合、指数減衰は理想的な範囲外にあるアイテムに厳しいペナルティを適用しつつ、遠く離れたアイテムの発見性を維持します。このアプローチは、近接性や新しさを強く優先したいが、さらに遠くにあるオプションを完全に排除したくない場合に最適です。

他の減衰関数とは異なり：

- ガウス減衰は、より緩やかな鐘型の減少を生成します

- 線形減衰は、正確にゼロになるまで一定の割合で減少します

指数減衰は、関連性の低下を前半に集中させるという点で特異であり、早期の大部分の関連性低下を適用しながら、最小限ながらゼロではない関連性の長いテールを維持します。

## 指数減衰を使用すべき時\{#when-to-use-exponential-decay}

指数減衰は、以下のような場合に特に効果的です：

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>指数減衰が適している理由</p></th>
   </tr>
   <tr>
     <td><p>ニュースフィード</p></td>
     <td><p>速報ニュースポータル</p></td>
     <td><p>古いニュースの関連性を急速に低下させながらも、数日前の重要なストーリーを表示し続ける</p></td>
   </tr>
   <tr>
     <td><p>ソーシャルメディアのタイムライン</p></td>
     <td><p>アクティビティフィード、ステータス更新</p></td>
     <td><p>新鮮なコンテンツを強調しつつ、話題となった古いコンテンツが浮上することを可能にする</p></td>
   </tr>
   <tr>
     <td><p>通知システム</p></td>
     <td><p>アラートの優先順位付け</p></td>
     <td><p>直近のアラートに緊急性をもたせながら、重要なアラートの可視性を維持する</p></td>
   </tr>
   <tr>
     <td><p>フラッシュセール</p></td>
     <td><p>期間限定オファー</p></td>
     <td><p>締切が近づくにつれて可視性を急速に低下させる</p></td>
   </tr>
</table>

指数減衰を選択する場合：

- ユーザーが非常に最近または近距離のアイテムが結果を強く占めることを期待している場合

- 古いまたは遠くにあるアイテムが例外的に関連性がある場合、今でも発見可能であるべきである場合

- 関連性の低下が前半に集中するべきである場合（開始時に急激に、その後は緩やかになる）

## 急激な低下の原則\{#sharp-drop-off-principle}

指数減衰は、最初に急速に低下し、その後ゼロに近づくが決してゼロにはならない長いテールに徐々に平坦化される曲線を作成します。この数学的パターンは、放射性崩壊、人口減少、時間経過による情報の関連性など、自然界に頻繁に現れます。

<Admonition type="info" icon="📘" title="注意">

<p>すべての時間パラメータ (<code>origin</code>, <code>offset</code>, <code>scale</code>) は、コレクションデータと同じ単位を使用する必要があります。コレクションが別の単位（ミリ秒、マイクロ秒）でタイムスタンプを保存している場合は、すべてのパラメータをそれに応じて調整してください。</p>

</Admonition>

![YaRsbolv9oqomcxrFe5cXBa4nNg](/img/YaRsbolv9oqomcxrFe5cXBa4nNg.png)

上のグラフは、指数減衰がデジタルニュースプラットフォームでのニュース記事のランキングにどのように影響するかを示しています：

- `origin` (現在時刻): 関連性が最大(1.0)となる現在の時刻。

- `offset` (3時間): 「速報ニュースウィンドウ」—過去3時間以内に発行されたすべてのストーリーは完全な関連性スコア(1.0)を維持し、ごくわずかな時間差のある新着ニュースが不必要にペナルティを受けるのを防ぎます。

- `decay` (0.5): スケール距離におけるスコア—このパラメータは、時間とともにスコアがどのくらい劇的に低下するかを制御します。

- `scale` (24時間): 関連性が減衰値まで低下する期間—正確に24時間前のニュース記事の関連性スコアは半分(0.5)になります。

曲線からわかるように、24時間以上経過したニュース記事は関連性がさらに低下しますが、ゼロには決して達しません。数日前のストーリーでも何らかの最小限の関連性を維持し、重要なが古いニュースがフィードに表示される可能性を残しています（ただし、順位は低くなります）。

この動作は、ニュースの関連性が通常どのように機能するかを模倣しています—非常に最新のストーリーが強く支配しますが、ユーザーの関心に非常に関連性が高い重要な古いストーリーはそれでも突き抜けることができます。

## 数式\{#formula}

指数減衰スコアを計算する数学的式は以下の通りです：

$$
S(doc) = \exp\left( \lambda \cdot \max\left(0, \left|fieldvalue_{doc} - origin\right| - offset \right) \right)
$$

ただし：

$$
\lambda = \frac\{\ln(decay)}{scale}
$$

平易な言葉でこれを分解すると：

1. フィールド値が原点からどれだけ離れているかを計算します：$|fieldvalue_{doc} - origin|$。

2. オフセット（ある場合）を引きますが、ゼロ以下にはしません：$\max(0, distance - offset)$。

3. $\lambda$（スケールと減衰パラメータから計算された値）を乗算します。

4. 指数を取ることで、0から1の間の値が得られます：$\exp(\lambda \cdot value)$。

$\lambda$ の計算は、スケールと減衰パラメータを指数関数のレートパラメータに変換します。より負の $\lambda$ は、初期の急激な低下をより急峻にします。

## 指数減衰の使用\{#use-exponential-decay}

指数減衰は、Zilliz Cloudの標準ベクトル検索およびハイブリッド検索操作の両方に適用できます。以下は、この機能を実装するための主なコードスニペットです。

<Admonition type="info" icon="📘" title="注意">

<p>減衰関数を使用する前には、まず適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、およびデータ挿入を含む完全な作業例については、<a href="./tutorial-implement-time-based-ranking">減衰ランカーのチュートリアル</a>を参照してください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

コレクションが数値フィールド（この例では `publish_time`）でセットアップされた後、指数減衰ランカーを作成します：

<Admonition type="info" icon="📘" title="注意">

<p><strong>時間単位の一貫性</strong>：時間ベースの減衰を使用する場合、<code>origin</code>、<code>scale</code>、および<code>offset</code>パラメータがコレクションデータと同じ時間単位を使用していることを確認してください。コレクションが秒単位でタイムスタンプを保存している場合は、すべてのパラメータに秒単位を使用してください。ミリ秒単位を使用している場合は、すべてのパラメータにミリ秒単位を使用してください。</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType
import datetime

# ニュースの新しさのための指数減衰ランカーを作成
# 注：すべての時間パラメータはコレクションデータと同じ単位を使用する必要があります
ranker = Function(
    name="news_recency",                  # 関数識別子
    input_field_names=["publish_time"],   # 使用する数値フィールド
    function_type=FunctionType.RERANK,    # 関数タイプ。RERANKでなければなりません
    params={
        "reranker": "decay",              # 減衰ランカーを指定
        "function": "exp",                # 指数減衰を選択
        "origin": int(datetime.datetime.now().timestamp()),  # 現在時刻（秒、コレクションデータに合わせる）
        "offset": 3 * 60 * 60,            # 3時間の速報ニュースウィンドウ（秒）
        "decay": 0.5,                     # スケール距離での半分のスコア
        "scale": 24 * 60 * 60             # 24時間（秒、コレクションデータに合わせる）
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
# ベクトル検索に減衰ランカーを適用
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],             # あなたのクエリーベクトルに置き換えてください
    anns_field="dense",                   # 検索するベクトルフィールド
    limit=10,                             # 結果の数
    output_fields=["title", "publish_time"], # 返すフィールド
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
  data: [your_query_vector], // あなたのクエリーベクトルに置き換えてください
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
    data=[your_query_vector_1], # あなたのクエリーベクトルに置き換えてください
    anns_field="dense",
    param={},
    limit=10
)

# スパースベクトル検索リクエストを定義
sparse = AnnSearchRequest(
    data=[your_query_vector_2], # あなたのクエリーベクトルに置き換えてください
    anns_field="sparse_vector",
    param={},
    limit=10
)

# ハイブリッド検索に減衰ランカーを適用
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
    data: [your_query_vector_1], // あなたのクエリーベクトルに置き換えてください
    anns_field: "dense",
    limit: 10,
    param: {}
};

const sparse = {
    data: [your_query_vector_2], // あなたのクエリーベクトルに置き換えてください
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

詳細については、[マルチベクトルハイブリッド検索](./hybrid-search)を参照してください。