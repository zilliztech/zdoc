---
title: "ガウス減衰 | Cloud"
slug: /gaussian-decay
sidebar_label: "ガウス減衰"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ガウス減衰（正規減衰とも呼ばれます）は、検索結果に対して最も自然な調整を行う方法です。距離とともに徐々にぼやけていく人間の視覚のように、ガウス減衰は滑らかなベル型曲線を作り、アイテムが理想的なポイントから離れるにつれて関連性を優しく低下させます。このアプローチは、好ましい範囲の外にあるアイテムに厳しくペナルティを与えない一方で、遠く離れたアイテムの関連性を大幅に低下させるバランスの取れた減衰を望む場合に理想的です。| Cloud"
type: origin
token: G39mw621Yi3iICkv69JcQ0J5nHf
sidebar_position: 2
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
  - ガウス減衰
  - gauss
  - how does milvus work
  - Zilliz ベクトルデータベース
  - Zilliz データベース
  - 非構造化データ

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ガウス減衰

ガウス減衰（正規減衰とも呼ばれます）は、検索結果に対して最も自然な調整を行う方法です。距離とともに徐々にぼやけていく人間の視覚のように、ガウス減衰は滑らかなベル型曲線を作り、アイテムが理想的なポイントから離れるにつれて関連性を優しく低下させます。このアプローチは、好ましい範囲の外にあるアイテムに厳しくペナルティを与えない一方で、遠く離れたアイテムの関連性を大幅に低下させるバランスの取れた減衰を望む場合に理想的です。

他の減衰ランカーとは異なり：

- 指数減衰は最初に急激に低下し、より強い初期ペナルティを作ります

- 線形減衰はゼロに達するまで一定の割合で減少し、明確なカットオフを作ります

ガウス減衰は、ユーザーにとって自然に感じるよりバランスの取れた直感的なアプローチを提供します。

## ガウス減衰を使用する場合\{#when-to-use-gaussian-decay}

ガウス減衰は特に以下の場合に効果的です：

<table>
   <tr>
     <th><p>使用例</p></th>
     <th><p>例</p></th>
     <th><p>ガウスがよく機能する理由</p></th>
   </tr>
   <tr>
     <td><p>位置ベースの検索</p></td>
     <td><p>レストラン検索、店舗検索</p></td>
     <td><p>距離の関連性に対する自然な人間の知覚を模倣します</p></td>
   </tr>
   <tr>
     <td><p>コンテンツのレコメンデーション</p></td>
     <td><p>公開日付に基づく記事の提案</p></td>
     <td><p>コンテンツが古くなるにつれて関連性が徐々に低下します</p></td>
   </tr>
   <tr>
     <td><p>商品リスト</p></td>
     <td><p>目標価格に近い商品</p></td>
     <td><p>価格が目標から逸れるにつれて関連性がスムーズに低下します</p></td>
   </tr>
   <tr>
     <td><p>専門知識のマッチング</p></td>
     <td><p>関連経験を持つ専門家を探す</p></td>
     <td><p>経験の関連性のバランスの取れた評価</p></td>
   </tr>
</table>

厳しいペナルティや厳格なカットオフなしに、関連性が自然に低下する感覚が必要な場合、ガウス減衰が最適な選択肢になる可能性が高いです。

## ベル曲線の原則\{#bell-curve-principle}

ガウス減衰は、理想的なポイントから距離が増加するにつれて関連性を徐々に低下させる滑らかなベル型曲線を作ります。数学者カール・フリードリヒ・ガウスにちなんで名付けられたこの分布は、自然界や統計学で頻繁に現れるため、人間の知覚にとって直感的に感じられます。

![DP1AbcqZPoyfqhxpJ2icptjQnfc](/img/DP1AbcqZPoyfqhxpJ2icptjQnfc.png)

上のグラフは、ガウス減衰がモバイル検索アプリでのレストランランキングにどのように影響するかを示しています：

- `origin`（0km）：関連性が最大（1.0）になる現在地。

- `offset`（±300m）：あなたの周りの「完全スコアゾーン」—300メートル以内のすべてのレストランは完全な関連性スコア（1.0）を維持し、非常に近いオプションがわずかな距離の違いで不必要にペナルティを受けないようにします。

- `scale`（±2km）：関連性が減衰値まで低下する距離—正確に2キロメートル離れたレストランの関連性スコアは半分（0.5）になります。

- `decay`（0.5）：スケール距離でのスコア—このパラメータは基本的に距離とともにスコアがどの程度速く低下するかを制御します。

曲線からわかるように、2kmを超えるレストランは関連性がさらに低下しますが、決してゼロにはなりません。4〜5km離れたレストランでも最小限の関連性を維持し、優れていても遠く離れたレストランが結果に表示される可能性（ albeit 低いランクで）を残します。

この動作は、人々が距離の関連性について自然に考える方法を模倣しています—近場の場所が好まれますが、特別なオプションのためにさらに遠くまで行く意欲があります。

## 式\{#formula}

ガウス減衰スコアを計算するための数学的式は以下の通りです：

$$
S(doc) = \exp\left( -\frac\{\left( \max\left(0, \left|fieldvalue_{doc} - origin\right| - offset \right) \right)^2}\{2\sigma^2} \right)
$$

ただし：

$$
\sigma^2 = -\frac{scale^2}\{2 \cdot \ln(decay)}
$$

平易な言葉で分解すると：

1. フィールド値が原点からどれだけ離れているかを計算します： $|fieldvalue_{doc} - origin|$

1. オフセット（存在する場合）を引きますが、ゼロを下回ることはありません： $\max(0, distance - offset)$

1. この調整された距離を2乗します： $(adjusted\_distance)^2$

1. $2\sigma^2$（スケールと減衰パラメータから計算されます）で割ります

1. 負の指数を取り、0〜1の値を得ます： $\exp(-value)$

$\sigma^2$の計算は、スケールと減衰パラメータをガウス分布の標準偏差の2乗に変換します。これが関数に特徴的なベル型を与えるものです。

## ガウス減衰の使用\{#use-gaussian-decay}

ガウス減衰は、Zilliz Cloudの標準ベクトル検索およびハイブリッド検索操作の両方に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="注意">

<p>減衰関数を使用する前に、減衰計算に使用される適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを作成する必要があります。コレクションのセットアップ、スキーマ定義、およびデータ挿入を含む完全な作業例については、<a href="./tutorial-implement-time-based-ranking">チュートリアル：Milvusでの時間ベースのランク付けの実装</a>を参照してください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

数値フィールドでコレクションのセットアップが完了した後（この例では、ユーザーからの距離をメートル単位で表す`distance`）、ガウス減衰ランカーを作成します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

# 位置ベースのレストラン検索のためのガウス減衰ランカーを作成
ranker = Function(
    name="restaurant_distance_decay",     # 関数識別子
    input_field_names=["distance"],       # メートル単位の距離用数値フィールド
    function_type=FunctionType.RERANK,    # 関数タイプ。RERANKでなければなりません
    params={
        "reranker": "decay",              # 減衰再ランカーを指定
        "function": "gauss",              # ガウス減衰を選択
        "origin": 0,                      # 現在地（0メートル）
        "offset": 300,                    # 300m 減衰なしゾーン
        "decay": 0.5,                     # 一定距離での半分のスコア
        "scale": 2000                     # 2km スケール（2000メートル）
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.DecayRanker;

DecayRanker ranker = DecayRanker.builder()
        .name("restaurant_distance_decay")
        .inputFieldNames(Collections.singletonList("distance"))
        .function("gauss")
        .origin(0)
        .offset(300)
        .decay(0.5)
        .scale(2000)
        .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const ranker = {
  name: "restaurant_distance_decay",
  input_field_names: ["distance"],
  function_type: FunctionType.RERANK,
  params: {
    reranker: "decay",
    function: "gauss",
    origin: 0,
    offset: 300,
    decay: 0.5,
    scale: 2000,
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
# 減衰ランカーをレストランのベクトル検索に適用
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],         # クエリーベクトルに置き換えてください
    anns_field="dense",                   # 検索するベクトルフィールド
    limit=10,                             # 結果の数
    output_fields=["name", "cuisine", "distance"],  # 戻すフィールド
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
        .data(Collections.singletonList(new EmbeddedText("italian restaurants")))
        .annsField("vector_field")
        .limit(10)
        .outputFields(Arrays.asList("name", "cuisine", "distance"))
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
  output_fields: ["name", "cuisine", "distance"],
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

# 減衰ランカーをレストランハイブリッド検索に適用
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [dense, sparse],                      # 複数の検索リクエスト
    #  highlight-next-line
    ranker=ranker,                        # 同じ減衰ランカー
    limit=10,
    output_fields=["name", "cuisine", "distance"]
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
        .vectors(Collections.singletonList(new EmbeddedText("italian restaurants")))
        .limit(10)
        .build());

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
                .collectionName(COLLECTION_NAME)
                .searchRequests(searchRequests)
                .ranker(ranker)
                .limit(10)
                .outputFields(Arrays.asList("name", "cuisine", "distance"))
                .build();
SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const denseRequest = {
  data: [your_query_vector_1], # クエリーベクトルに置き換えてください
  anns_field: "dense",
  param: {},
  limit: 10,
};

const sparseRequest = {
  data: [your_query_vector_2], # クエリーベクトルに置き換えてください
  anns_field: "sparse_vector",
  param: {},
  limit: 10,
};

const hybridResults = await milvusClient.search({
  collection_name: "collection_name",
  data: [denseRequest, sparseRequest],
  rerank: ranker,
  limit: 10,
  output_fields: ["name", "cuisine", "distance"],
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