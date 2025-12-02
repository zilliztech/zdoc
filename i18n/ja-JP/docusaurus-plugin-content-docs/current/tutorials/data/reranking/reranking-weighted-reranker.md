---
title: "重み付きランカー | Cloud"
slug: /reranking-weighted-reranker
sidebar_label: "重み付きランカー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "重み付きランカーは、複数の検索パスから得られた結果に異なる重要度の重みを割り当てることで、結果をインテリジェントに組み合わせて優先順位を付けます。熟練したシェフが複数の食材をバランスよく調合して完璧な料理を作るのと同様に、重み付きランカーは異なる検索結果をバランスよく調整して、最も関連性の高い統合された結果を提供します。このアプローチは、特定のフィールドが他のフィールドよりも最終的なランキングに大きく貢献すべきであるような、複数のベクトルフィールドやモダリティにまたがる検索に最適です。 | Cloud"
type: origin
token: Oyy6w5DYJiVCMYkdduEc6eD9nZg
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search result reranking
  - result reranking
  - weighted reranker
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 重み付きランカー

重み付きランカーは、複数の検索パスから得られた結果に異なる重要度の重みを割り当てることで、結果をインテリジェントに組み合わせて優先順位を付けます。熟練したシェフが複数の食材をバランスよく調合して完璧な料理を作るのと同様に、重み付きランカーは異なる検索結果をバランスよく調整して、最も関連性の高い統合された結果を提供します。このアプローチは、特定のフィールドが他のフィールドよりも最終的なランキングに大きく貢献すべきであるような、複数のベクトルフィールドやモダリティにまたがる検索に最適です。

## 重み付きランカーの使用タイミング\{#when-to-use-weighted-ranker}

重み付きランカーは、複数のベクトル検索パスからの結果を組み合わせる必要があるハイブリッド検索シナリオのために特別に設計されています。特に効果的なのは：

<table>
   <tr>
     <th><p>使用例</p></th>
     <th><p>例</p></th>
     <th><p>重み付きランカーがうまく機能する理由</p></th>
   </tr>
   <tr>
     <td><p>EC検索</p></td>
     <td><p>商品検索で画像類似度とテキスト説明を組み合わせる</p></td>
     <td><p>ファッション商品では視覚的類似度を優先し、技術的商品ではテキスト説明を重視するように小売業者が調整できる</p></td>
   </tr>
   <tr>
     <td><p>メディアコンテンツ検索</p></td>
     <td><p>視覚的特徴と音声トランスクリプトの両方を使用したビデオ検索</p></td>
     <td><p>クエリの意図に基づいて視覚コンテンツと音声対話の重要度をバランスさせる</p></td>
   </tr>
   <tr>
     <td><p>文書検索</p></td>
     <td><p>異なるセクション用に複数の埋め込みを持つ企業文書検索</p></td>
     <td><p>全文埋め込みを考慮しつつ、タイトルや要約の埋め込みにより高い重みを与える</p></td>
   </tr>
</table>

ハイブリッド検索アプリケーションで複数の検索パスを相対的な重要度を制御しながら組み合わせる必要がある場合、重み付きランカーが最適な選択です。

## 重み付きランカーの仕組み\{#mechanism-of-weighted-ranker}

重み付きランカー戦略の主なワークフローは以下の通りです：

1. **検索スコアの収集**: ベクトル検索の各パスからの結果とスコアを収集します（score_1, score_2）。

1. **スコアの正規化**: 各検索では異なる類似度メトリックが使用されるため、スコア分布が異なります。例えば、Inner Product（IP）を類似度タイプとして使用すると [-∞, +∞] の範囲のスコアになる場合がありますが、ユークリッド距離（L2）を使用すると [0, +∞] の範囲のスコアになります。異なる検索からのスコア範囲は異なり、直接比較できないため、各検索パスのスコアを正規化する必要があります。通常、`arctan` 関数が適用され、スコアは [0, 1] の範囲に変換されます（score_1_normalized, score_2_normalized）。1に近いスコアほど類似度が高いことを示します。

1. **重みの割り当て**: 異なるベクトルフィールドに割り当てられた重要度に基づき、重み（**wi**）が正規化されたスコア（score_1_normalized, score_2_normalized）に割り当てられます。各パスの重みは [0, 1] の範囲にある必要があります。結果として得られる重み付きスコアは score_1_weighted および score_2_weighted です。

1. **スコアの統合**: 重み付きスコア（score_1_weighted, score_2_weighted）は上位から下位にランク付けされ、最終的なスコアセット（score_final）が生成されます。

![GdmNwbkN8haZO8bpQkOc2NIWnqF](/img/GdmNwbkN8haZO8bpQkOc2NIWnqF.png)

## 重み付きランカーの例\{#example-of-weighted-ranker}

この例は、画像とテキストを含むマルチモーダルハイブリッド検索（topK=5）を示し、重み付きランカー戦略が2つのANN検索からの結果をどのように再ランク付けするかを説明しています。

- 画像に対するANN検索の結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>スコア (画像)</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>0.92</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>0.88</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>0.85</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>0.83</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>0.8</p></td>
       </tr>
    </table>

- テキストに対するANN検索の結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>スコア (テキスト)</strong></p></th>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>0.91</p></td>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>0.87</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>0.85</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>0.82</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>0.78</p></td>
       </tr>
    </table>

- 重み付きランカーを使用して画像とテキスト検索結果に重みを割り当てます。画像ANN検索の重みを0.6、テキスト検索の重みを0.4と仮定します。

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>スコア (画像)</strong></p></th>
         <th><p><strong>スコア (テキスト)</strong></p></th>
         <th><p><strong>重み付きスコア</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>0.92</p></td>
         <td><p>0.87</p></td>
         <td><p>0.6×0.92+0.4×0.87=0.90</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>0.88</p></td>
         <td><p>N/A</p></td>
         <td><p>0.6×0.88+0.4×0=0.528</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>0.85</p></td>
         <td><p>N/A</p></td>
         <td><p>0.6×0.85+0.4×0=0.51</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>0.83</p></td>
         <td><p>0.91</p></td>
         <td><p>0.6×0.83+0.4×0.91=0.86</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>0.80</p></td>
         <td><p>0.82</p></td>
         <td><p>0.6×0.80+0.4×0.82=0.81</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>画像にはなし</p></td>
         <td><p>0.85</p></td>
         <td><p>0.6×0+0.4×0.85=0.34</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>画像にはなし</p></td>
         <td><p>0.78</p></td>
         <td><p>0.6×0+0.4×0.78=0.312</p></td>
       </tr>
    </table>

- 再ランク付け後の最終結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ランク</strong></p></th>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>最終スコア</strong></p></th>
       </tr>
       <tr>
         <td><p>1</p></td>
         <td><p>101</p></td>
         <td><p>0.90</p></td>
       </tr>
       <tr>
         <td><p>2</p></td>
         <td><p>198</p></td>
         <td><p>0.86</p></td>
       </tr>
       <tr>
         <td><p>3</p></td>
         <td><p>175</p></td>
         <td><p>0.81</p></td>
       </tr>
       <tr>
         <td><p>4</p></td>
         <td><p>203</p></td>
         <td><p>0.528</p></td>
       </tr>
       <tr>
         <td><p>5</p></td>
         <td><p>150</p></td>
         <td><p>0.51</p></td>
       </tr>
    </table>

## 重み付きランカーの使用法\{#usage-of-weighted-ranker}

重み付きランカー戦略を使用する際には、重み値を入力する必要があります。入力する重み値の数は、ハイブリッド検索内の基本的なANN検索リクエストの数に対応する必要があります。入力する重み値は [0,1] の範囲内にある必要があり、1に近い値ほど重要度が高いことを示します。

### 重み付きランカーの作成\{#create-a-weighted-ranker}

例えば、ハイブリッド検索に2つの基本的なANN検索リクエストがあるとします：テキスト検索と画像検索。テキスト検索がより重要であるとされる場合は、より大きな重みを割り当てる必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

rerank = Function(
    name="weight",
    input_field_names=[], # 空のリストでなければなりません
    function_type=FunctionType.RERANK,
    params={
        "reranker": "weighted",
        "weights": [0.1, 0.9],
        "norm_score": True  # オプション
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.Function rerank = CreateCollectionReq.Function.builder()
                .name("weight")
                .functionType(FunctionType.RERANK)
                .param("reranker", "weighted")
                .param("weights", "[0.1, 0.9]")
                .param("norm_score", "true")
                .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from '@zilliz/milvus2-sdk-node';

const rerank = {
    name: "weight",
    input_field_names: [],
    function_type: FunctionType.RERANK,
    params: {
        reranker: "weighted",
        weights: [0.1, 0.9],
        norm_score: true
    }
};
```

</TabItem>

<TabItem value='go'>

```go
// Go
```

</TabItem>

<TabItem value='bash'>

```bash
# Restful
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
     <td><p>この関数の一意の識別子</p></td>
     <td><p><code>"weight"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>関数を適用するベクトルフィールドのリスト（重み付きランカーでは空のリストでなければなりません）</p></td>
     <td><p>[]</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す関数のタイプ。再ランク付け戦略を指定するには <code>RERANK</code> を使用してください</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用する再ランク付け方法を指定します。<p>重み付きランカーを使用するには <code>weighted</code> に設定してください。</p></p></td>
     <td><p><code>"weighted"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.weights</code></p></td>
     <td><p>はい</p></td>
     <td><p>各検索パスに対応する重みの配列。値 ∈ [0,1]。<p>詳細については <a href="./reranking-weighted-reranker#mechanism-of-weighted-ranker">重み付きランカーの仕組み</a> を参照してください。</p></p></td>
     <td><p><code>[0.1, 0.9]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.norm_score</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>重み付けの前に生のスコア（arctan使用）を正規化するかどうか。<p>詳細については <a href="./reranking-weighted-reranker#mechanism-of-weighted-ranker">重み付きランカーの仕組み</a> を参照してください。</p></p></td>
     <td><p><code>True</code></p></td>
   </tr>
</table>

### ハイブリッド検索への適用\{#apply-to-hybrid-search}

重み付きランカーは、複数のベクトルフィールドを組み合わせるハイブリッド検索操作のために特別に設計されています。ハイブリッド検索を実行する際には、各検索パスの重みを指定する必要があります：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest

# Milvusサーバーに接続
milvus_client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# コレクションのセットアップがあると仮定

# テキストベクトル検索リクエストを定義
text_search = AnnSearchRequest(
    data=["modern dining table"],
    anns_field="text_vector",
    param={},
    limit=10
)

# 画像ベクトル検索リクエストを定義
image_search = AnnSearchRequest(
    data=[image_embedding],  # 画像埋め込みベクトル
    anns_field="image_vector",
    param={},
    limit=10
)

# 重み付きランカーを製品ハイブリッド検索に適用
# テキスト検索の重みは0.8、画像検索の重みは0.3
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # 複数の検索リクエスト
    # highlight-next-line
    ranker=rerank,  # 重み付きランカーを適用
    limit=10,
    output_fields=["product_name", "price", "category"]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.AnnSearchReq;
import io.milvus.v2.service.vector.request.HybridSearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.request.data.FloatVec;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

List<AnnSearchReq> searchRequests = new ArrayList<>();
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("text_vector")
        .vectors(Collections.singletonList(new EmbeddedText("\"modern dining table\"")))
        .limit(10)
        .build());
searchRequests.add(AnnSearchReq.builder()
        .vectorFieldName("image_vector")
        .vectors(Collections.singletonList(new FloatVec(imageEmbedding)))
        .limit(10)
        .build());

HybridSearchReq hybridSearchReq = HybridSearchReq.builder()
                .collectionName(COLLECTION_NAME)
                .searchRequests(searchRequests)
                .ranker(ranker)
                .limit(10)
                .outputFields(Arrays.asList("product_name", "price", "category"))
                .build();
SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, FunctionType } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });

const text_search = {
  data: ["modern dining table"],
  anns_field: "text_vector",
  param: {},
  limit: 10,
};

const image_search = {
  data: [image_embedding],
  anns_field: "image_vector",
  param: {},
  limit: 10,
};

const rerank = {
  name: "weight",
  input_field_names: [],
  function_type: FunctionType.RERANK,
  params: {
    reranker: "weighted",
    weights: [0.1, 0.9],
    norm_score: true,
  },
};

const search = await milvusClient.search({
  collection_name: collection_name,
  limit: 10,
  data: [text_search, image_search],
  rerank: rerank,
  output_fields: ["product_name", "price", "category"],
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

ハイブリッド検索の詳細については、[マルチベクトルハイブリッド検索](./hybrid-search)を参照してください。