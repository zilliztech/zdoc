---
title: "Weighted Ranker | Cloud"
slug: /reranking-weighted-reranker
sidebar_key: reranking-weighted-reranker
sidebar_label: "Weighted Ranker"
beta: FALSE
notebook: FALSE
description: "Weighted Ranker は、各検索パスに異なる重要度の重みを割り当てることで、複数の検索パスからの結果をインテリジェントに統合し、優先順位付けします。熟練したシェフが複数の食材をバランスよく調合して完璧な料理を作り上げるのと同様に、Weighted Ranker も異なる検索結果を調整し、最も関連性の高い統合された成果を提供します。このアプローチは、特定のフィールドが最終的なランキングにより大きく寄与すべきである場合に、複数のベクトルフィールドやモダリティにわたって検索を行う際に最適です。| Cloud"
type: origin
token: Oyy6w5DYJiVCMYkdduEc6eD9nZg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - 検索結果の再ランキング
  - 結果の再ランキング
  - weighted reranker

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Weighted Ranker

Weighted Ranker は、複数の検索パスからの結果をインテリジェントに統合・優先順位付けするために、それぞれに異なる重要度の重みを割り当てます。熟練したシェフが完璧な料理を作るために複数の食材をバランスよく調和させるように、Weighted Ranker は異なる検索結果をバランス取りながら、最も関連性の高い統合結果を提供します。このアプローチは、複数のベクトルフィールドやモダリティにまたがって検索を行う際に、特定のフィールドが最終的なランキングにより大きな影響を与えるべき場合に理想的です。

## Weighted Ranker の使用タイミング\{#when-to-use-weighted-ranker}

Weighted Ranker は、複数のベクトル検索パスの結果を統合する必要があるハイブリッド検索シナリオ向けに特別に設計されています。特に以下のケースで効果的です：

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>Weighted Ranker が有効な理由</p></th>
   </tr>
   <tr>
     <td><p>Eコマース検索</p></td>
     <td><p>画像類似性とテキスト説明を組み合わせた商品検索</p></td>
     <td><p>ファッションアイテムでは視覚的類似性を優先し、技術系製品ではテキスト説明を重視できる</p></td>
   </tr>
   <tr>
     <td><p>メディアコンテンツ検索</p></td>
     <td><p>ビジュアル特徴と音声トランスクリプトを用いた動画検索</p></td>
     <td><p>クエリの意図に基づき、視覚コンテンツと音声対話の重要度をバランス調整できる</p></td>
   </tr>
   <tr>
     <td><p>ドキュメント検索</p></td>
     <td><p>企業内ドキュメント検索で、異なるセクションごとに複数の埋め込みを使用</p></td>
     <td><p>タイトルおよび要約の埋め込みにより高い重みを与えつつ、全文埋め込みも考慮</p></td>
   </tr>
</table>

ハイブリッド検索アプリケーションにおいて、複数の検索パスを統合しつつ、それぞれの相対的重要性を制御する必要がある場合は、Weighted Ranker が最適な選択肢です。

## Weighted Ranker の仕組み\{#mechanism-of-weighted-ranker}

WeightedRanker 戦略の主なワークフローは以下の通りです：

1. **検索スコアを収集**: 各ベクトル検索パスから結果とスコアを収集します（score_1, score_2）。

1. **スコアの正規化**: 各検索は異なる類似度指標を使用している可能性があり、その結果スコア分布も異なります。例えば、内積（IP）を類似度タイプとして使用するとスコア範囲は [−∞,+∞] となりますが、ユークリッド距離（L2）を使用するとスコア範囲は [0,+∞] になります。異なる検索からのスコア範囲は異なり直接比較できないため、各検索パスのスコアを正規化する必要があります。通常、`arctan` 関数を適用してスコアを [0, 1] の範囲に変換します（score_1_normalized, score_2_normalized）。1 に近いスコアほど類似度が高いことを示します。

1. **重みの割り当て**: 異なるベクトルフィールドに割り当てられた重要度に基づき、正規化されたスコア（score_1_normalized, score_2_normalized）に重み（**wi**）を割り当てます。各パスの重みは [0,1] の範囲内である必要があります。これにより、加重スコア（score_1_weighted, score_2_weighted）が得られます。

1. **スコアの統合**: 加重スコア（score_1_weighted, score_2_weighted）を高い順にランク付けし、最終的なスコアセット（score_final）を生成します。

![GdmNwbkN8haZO8bpQkOc2NIWnqF](https://zdoc-images.s3.us-west-2.amazonaws.com/GdmNwbkN8haZO8bpQkOc2NIWnqF.png)

## Weighted Ranker の例\{#example-of-weighted-ranker}

この例では、画像とテキストを含むマルチモーダルハイブリッド検索（topK=5）を実施し、WeightedRanker 戦略が2つの ANN 検索結果をどのように再ランク付けするかを示します。

- 画像に対する ANN 検索結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Score (image)</strong></p></th>
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

- テキストに対する ANN 検索結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Score (text)</strong></p></th>
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

- WeightedRanker を使用して画像およびテキスト検索結果に重みを割り当てます。ここでは、画像 ANN 検索の重みを 0.6、テキスト検索の重みを 0.4 とします。

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Score (image)</strong></p></th>
         <th><p><strong>Score (text)</strong></p></th>
         <th><p><strong>Weighted Score</strong></p></th>
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
         <td><p>Not in Image</p></td>
         <td><p>0.85</p></td>
         <td><p>0.6×0+0.4×0.85=0.34</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>Not in Image</p></td>
         <td><p>0.78</p></td>
         <td><p>0.6×0+0.4×0.78=0.312</p></td>
       </tr>
    </table>

- 再ランク付け後の最終結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>Rank</strong></p></th>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Final Score</strong></p></th>
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

## Weighted Ranker の使用方法\{#usage-of-weighted-ranker}

WeightedRanker 戦略を使用する際には、重み値を入力する必要があります。入力する重み値の数は、ハイブリッド検索内の基本 ANN 検索リクエストの数と一致させる必要があります。入力する重み値は [0,1] の範囲内であり、1 に近いほど重要度が高いことを示します。

### Weighted Ranker の作成\{#create-a-weighted-ranker}

例えば、ハイブリッド検索内にテキスト検索と画像検索という2つの基本 ANN 検索リクエストがあるとします。テキスト検索の方がより重要だと判断される場合、より大きな重みを割り当てるべきです。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

rerank = Function(
    name="weight",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "weighted", 
        "weights": [0.1, 0.9],
        "norm_score": True  # Optional
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

<TabItem value='java'>

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

<TabItem value='java'>

```go
// Go
```

</TabItem>

<TabItem value='java'>

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
     <td><p>このFunctionの一意な識別子</p></td>
     <td><p><code>"weight"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>この関数を適用するベクトルフィールドのリスト（Weighted Rankerの場合は空にする必要があります）</p></td>
     <td><p>[]</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出すFunctionのタイプ。リランキング戦略を指定するには<code>RERANK</code>を使用します。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用するリランキング方法を指定します。</p><p>Weighted Rankerを使用するには、必ず<code>weighted</code>に設定してください。</p></td>
     <td><p><code>"weighted"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.weights</code></p></td>
     <td><p>はい</p></td>
     <td><p>各検索パスに対応する重みの配列。値は[0,1]の範囲内です。</p><p>詳細については、<a href="./reranking-weighted-reranker#mechanism-of-weighted-ranker">Weighted Rankerの仕組み</a>を参照してください。</p></td>
     <td><p><code>[0.1, 0.9]</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.norm_score</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>重み付け前に生スコアを（arctanを使って）正規化するかどうかを指定します。</p><p>詳細については、<a href="./reranking-weighted-reranker#mechanism-of-weighted-ranker">Weighted Rankerの仕組み</a>を参照してください。</p></td>
     <td><p><code>True</code></p></td>
   </tr>
</table>

### ハイブリッド検索への適用\{#apply-to-hybrid-search}

Weighted Rankerは、複数のベクトルフィールドを組み合わせたハイブリッド検索操作のために特別に設計されています。ハイブリッド検索を実行する際には、各検索パスの重みを指定する必要があります：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest

# Connect to Milvus server
milvus_client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Assume you have a collection setup

# Define text vector search request
text_search = AnnSearchRequest(
    data=["modern dining table"],
    anns_field="text_vector",
    param={},
    limit=10
)

# Define image vector search request
image_search = AnnSearchRequest(
    data=[image_embedding],  # Image embedding vector
    anns_field="image_vector",
    param={},
    limit=10
)

# Apply Weighted Ranker to product hybrid search
# Text search has 0.8 weight, image search has 0.3 weight
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # Multiple search requests
    # highlight-next-line
    ranker=rerank,  # Apply the weighted ranker
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
        .token("YOUR_CLUSTER_TOKEN")
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

<TabItem value='java'>

```javascript
import { MilvusClient, FunctionType } from "@zilliz/milvus2-sdk-node";

const milvusClient = new MilvusClient({ 
    address: "YOUR_CLUSTER_ENDPOINT",
    token: "YOUR_CLUSTER_TOKEN"
});

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

const search = await milvusClient.search({
  collection_name: collection_name,
  limit: 10,
  data: [text_search, image_search],
  rerank: rerank,
  output_fields = ["product_name", "price", "category"],
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

ハイブリッド検索の詳細については、[マルチベクターハイブリッド検索](./hybrid-search)を参照してください。