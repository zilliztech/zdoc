---
title: "ガウス減衰 | BYOC"
slug: /gaussian-decay
sidebar_label: "ガウス減衰"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "ガウス減衰は、通常は正規減衰としても知られており、検索結果に最も自然に感じられる調整を提供します。距離とともに徐々にぼやけていく人間の視界のように、ガウス減衰は滑らかなベル曲線を作成し、項目が理想的なポイントから離れるにつれて関連性を穏やかに低下させます。このアプローチは、好ましい範囲のわずかに外側にある項目に厳しくペナルティを与えることなくバランスの取れた減衰が必要で、それでも遠く離れた項目の関連性を大幅に削減したい場合に理想的です。 | BYOC"
type: origin
token: G39mw621Yi3iICkv69JcQ0J5nHf
sidebar_position: 2
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
  - gaussian decay
  - gauss
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ガウス減衰

ガウス減衰は、正規減衰としても知られていますが、検索結果に対して最も自然に感じられる調整を生成します。距離とともに徐々にぼやけていく人間の視力のように、ガウス減衰は滑らかなベル曲線を作成し、項目が理想的なポイントから離れるにつれて関連性を穏やかに低下させます。このアプローチは、好ましい範囲のわずかに外側にある項目に厳しくペナルティを与えることなくバランスの取れた減衰が必要で、それでも遠く離れた項目の関連性を大幅に削減したい場合に理想的です。

他の減衰ランカーとは異なり：

- 指数減衰は最初に急激に低下し、初期ペナルティを強化

- 線形減衰はゼロになるまで一定の速度で低下し、明確なカットオフを作成

ガウス減衰は、ユーザにとって自然に感じられるよりバランスの取れた、直感的なアプローチを提供します。

## ガウス減衰を使用する場合\{#when-to-use-gaussian-decay}

ガウス減衰は特に次のような場合に効果的です：

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>ガウス減衰が適している理由</p></th>
   </tr>
   <tr>
     <td><p>位置情報ベースの検索</p></td>
     <td><p>レストランファインダー、店舗ロケーター</p></td>
     <td><p>距離関連性の自然な人間の知覚を模倣</p></td>
   </tr>
   <tr>
     <td><p>コンテンツのレコメンデーション</p></td>
     <td><p>公開日付に基づく記事の提案</p></td>
     <td><p>コンテンツが古くなるにつれて関連性が徐々に低下</p></td>
   </tr>
   <tr>
     <td><p>商品リスト</p></td>
     <td><p>ターゲット価格に近い商品</p></td>
     <td><p>価格がターゲットから逸れるにつれて関連性が滑らかに低下</p></td>
   </tr>
   <tr>
     <td><p>専門知識マッチング</p></td>
     <td><p>関連経験を持つ専門家を探す</p></td>
     <td><p>経験の関連性に関するバランスの取れた評価</p></td>
   </tr>
</table>

アプリケーションで厳しいペナルティや厳格なカットオフなしに自然な関連性低下を感じさせたい場合は、ガウス減衰が最良の選択です。

## ベル曲線の原則\{#bell-curve-principle}

ガウス減衰は、理想的なポイントから距離が離れるにつれて関連性を徐々に減少させる滑らかなベル曲線を作成します。数学者カール・フリードリヒ・ガウスにちなんで名付けられたこの分布は、自然界や統計学で頻繁に出現するため、人間の知覚には非常に直感的に感じられます。

![DP1AbcqZPoyfqhxpJ2icptjQnfc](/img/DP1AbcqZPoyfqhxpJ2icptjQnfc.png)

上記のグラフは、ガウス減衰が携帯検索アプリでのレストランランキングにどのように影響するかを示しています：

- `origin` (0 km)：現在地で、関連性が最大（1.0）です。

- `offset` (±300 m)：あなたを中心とした「完全スコアゾーン」—300メートル以内のすべてのレストランは完全な関連性スコア（1.0）を維持し、非常に近いオプションがわずかな距離の違いで不必要にペナルティを受けないようにします。

- `scale` (±2 km)：関連性が減衰値にまで低下する距離—正確に2キロメートル離れたレストランの関連性スコアは半分（0.5）になります。

- `decay` (0.5)：スケール距離でのスコア—このパラメータは基本的に距離によるスコアの減少速度を制御します。

この曲線からわかるように、2 kmを超えるレストランは関連性が低下し続けますが、ゼロにはなりません。4〜5 km離れたレストランでも最小限の関連性を保持し、優れたが遠く離れたレストランが結果に表示される可能性を残します（たとえランクが低いとしても）。

この挙動は、人々が距離関連性を自然に考える方法を模倣しています—近隣の場所が好まれますが、例外的なオプションのためにさらに遠くへ行く意思もあります。

## 式\{#formula}

ガウス減衰スコアを計算するための数学的式は以下のとおりです：

$$
S(doc) = \exp\left( -\frac\{\left( \max\left(0, \left|fieldvalue_{doc} - origin\right| - offset \right) \right)^2}\{2\sigma^2} \right)
$$

ただし：

$$
\sigma^2 = -\frac{scale^2}\{2 \cdot \ln(decay)}
$$

これを平易な言葉に分解すると：

1. フィールド値が原点からどれだけ離れているかを計算：  $|fieldvalue_{doc} - origin|$

1. オフセット（ある場合）を減算するが、ゼロを下回らないように： $\max(0, distance - offset)$

1. この調整された距離を平方： $(adjusted\_distance)^2$

1. $2\sigma^2$で割る（これはスケールと減衰パラメータから計算される）

1. 負の指数を取る（これは0と1の間の値を与える）： $\exp(-value)$

$\sigma^2$の計算は、スケールと減衰パラメータをガウス分布の標準偏差の二乗に変換します。これにより関数に特徴的なベル曲線が与えられます。

## ガウス減衰の使用\{#use-gaussian-decay}

ガウス減衰は、Zilliz Cloudの標準的なベクトル検索およびハイブリッド検索の両方の操作に適用できます。以下は、この機能を実装するための主要なコードスニペットです。

<Admonition type="info" icon="📘" title="注釈">

<p>減衰関数を使用する前に、減衰計算に使用される適切な数値フィールド（タイムスタンプ、距離など）を持つコレクションを最初に作成する必要があります。コレクションのセットアップ、スキーマ定義、およびデータの挿入を含む完全な作業例については、<a href="./tutorial-implement-time-based-ranking">チュートリアル：Milvusで時間ベースのランキングを実装する</a>を参照してください。</p>

</Admonition>

### 減衰ランカーの作成\{#create-a-decay-ranker}

数値フィールド（この例ではユーザーからのメートル単位の`distance`）を持つコレクションがセットアップされた後、ガウス減衰ランカーを作成します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

# 位置ベースのレストラン検索のためのガウス減衰ランカーを作成
ranker = Function(
    name="restaurant_distance_decay",     # 関数識別子
    input_field_names=["distance"],       # 距離を示す数値フィールド（メートル単位）
    function_type=FunctionType.RERANK,    # 関数タイプ。RERANKに設定する必要があります
    params={
        "reranker": "decay",              # 減衰ランカーを指定
        "function": "gauss",              # ガウス減衰を選択
        "origin": 0,                      # 現在地（0メートル）
        "offset": 300,                    # 300メートルのノーディケイゾーン
        "decay": 0.5,                     # スケール距離での半分のスコア
        "scale": 2000                     # 2 kmスケール（2000メートル）
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
# 減衰ランカーをレストランベクトル検索に適用
result = milvus_client.search(
    collection_name,
    data=[your_query_vector],         # あなたのクエリベクトルに置き換えてください
    anns_field="dense",                   # 検索するベクトルフィールド
    limit=10,                             # 結果数
    output_fields=["name", "cuisine", "distance"],  # 返却するフィールド
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
  data: [your_query_vector], // あなたのクエリベクトルに置き換えてください
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

# 密ベクトル検索要求を定義
dense = AnnSearchRequest(
    data=[your_query_vector_1], # あなたのクエリベクトルに置き換えてください
    anns_field="dense",
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
  data: [your_query_vector_1], // あなたのクエリベクトルに置き換えてください
  anns_field: "dense",
  param: {},
  limit: 10,
};

const sparseRequest = {
  data: [your_query_vector_2], // あなたのクエリベクトルに置き換えてください
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

ハイブリッド検索に関する詳細情報については、[マルチベクトルハイブリッド検索](./hybrid-search)を参照してください。
