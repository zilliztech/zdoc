---
title: "RRF Ranker | BYOC"
slug: /reranking-rrf
sidebar_key: reranking-rrf
sidebar_label: "RRF Ranker"
beta: FALSE
notebook: FALSE
description: "Reciprocal Rank Fusion (RRF) Ranker は、Zilliz Cloud のハイブリッド検索における再ランキング戦略であり、生の類似度スコアではなく複数のベクトル検索パスにおけるランキング位置に基づいて結果を調整します。個々の統計値ではなく選手のランキングを考慮するスポーツトーナメントと同様に、RRF Ranker は各アイテムが異なる検索パスでどの程度高くランクされているかに基づいて検索結果を統合し、公平でバランスの取れた最終ランキングを作成します。| BYOC"
type: origin
token: Nqguwf6ikiKrHEkGKgAc8g7Lnnh
sidebar_position: 2
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - 検索結果の再ランキング
  - 結果の再ランキング
  - rrf

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RRF Ranker

逆順位融合（Reciprocal Rank Fusion、RRF）Ranker は、Zilliz Cloud のハイブリッド検索向けに設計されたリランキング戦略であり、生の類似度スコアではなく各検索パスにおける順位に基づいて複数のベクトル検索結果をバランスよく統合します。個々の統計値ではなく選手の順位を考慮するスポーツトーナメントのように、RRF Ranker は各アイテムが異なる検索パスでどの程度上位にランク付けされているかに基づいて検索結果を統合し、公平かつバランスの取れた最終ランキングを生成します。

## RRF Ranker の使用タイミング\{#when-to-use-rrf-ranker}

RRF Ranker は、明示的な重要度重みを割り当てることなく複数のベクトル検索パスの結果をバランスよく統合したいハイブリッド検索シナリオ向けに特化しています。特に以下のケースで効果的です：

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>RRF Ranker が有効な理由</p></th>
   </tr>
   <tr>
     <td><p>同等の重要度を持つマルチモーダル検索</p></td>
     <td><p>画像とテキストの検索で、両方のモダリティが同等に重要</p></td>
     <td><p>恣意的な重み付けを必要とせずに結果をバランスよく統合</p></td>
   </tr>
   <tr>
     <td><p>アンサンブルベクトル検索</p></td>
     <td><p>異なる埋め込みモデルからの結果を統合</p></td>
     <td><p>特定のモデルのスコア分布に偏らず、民主的にランキングをマージ</p></td>
   </tr>
   <tr>
     <td><p>クロスリンガル検索</p></td>
     <td><p>複数言語にまたがるドキュメントの検索</p></td>
     <td><p>言語固有の埋め込み特性に左右されず、公平に結果をランキング</p></td>
   </tr>
   <tr>
     <td><p>エキスパート推奨</p></td>
     <td><p>複数のエキスパートシステムからの推奨を統合</p></td>
     <td><p>互いに比較不能なスコアリング手法を使用するシステム間で合意ランキングを生成</p></td>
   </tr>
</table>

ハイブリッド検索アプリケーションにおいて、明示的な重み付けなしに複数の検索パスを民主的にバランス取りたい場合は、RRF Ranker が最適な選択肢です。

## RRF Ranker の仕組み\{#mechanism-of-rrf-ranker}

RRF Ranker 戦略の主なワークフローは以下の通りです：

1. **検索ランキングを収集**: 各ベクトル検索パス（rank_1, rank_2）から結果のランキングを収集します。

1. **ランキングをマージ**: 各パスのランキング（rank_rrf_1, rank_rrf_2）を特定の式に従って変換します。

    計算式には *N*（取得件数）が含まれます。*ranki*(*d*) は *i* 番目のリトリーバーによって生成されたドキュメント *d* のランキング位置です。*k* は通常 60 に設定される平滑化パラメータです。

1. **ランキングを集計**: 統合されたランキングに基づいて検索結果を再ランキングし、最終結果を生成します。

![M2SawupkSh2NZxbX7SAcwqZZnxd](https://zdoc-images.s3.us-west-2.amazonaws.com/M2SawupkSh2NZxbX7SAcwqZZnxd.png)

## RRF Ranker の例\{#example-of-rrf-ranker}

この例では、疎ベクトルと密ベクトルに対するハイブリッド検索（topK=5）を実行し、RRF Ranker 戦略が 2 つの ANN 検索結果をどのようにリランキングするかを示します。

- テキストの疎ベクトルに対する ANN 検索結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Rank (sparse)</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>1</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>2</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>3</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>4</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>5</p></td>
       </tr>
    </table>

- テキストの密ベクトルに対する ANN 検索結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Rank (dense)</strong></p></th>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>1</p></td>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>2</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>3</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>4</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>5</p></td>
       </tr>
    </table>

- RRF を使用して 2 つの検索結果セットのランキングを再構成します。平滑化パラメータ `k` は 60 に設定されていると仮定します。

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Score (Sparse)</strong></p></th>
         <th><p><strong>Score (Dense)</strong></p></th>
         <th><p><strong>Final Score</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>1</p></td>
         <td><p>2</p></td>
         <td><p>1/(60+1)+1/(60+2) = 0.03252247</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>4</p></td>
         <td><p>1</p></td>
         <td><p>1/(60+4)+1/(60+1) = 0.03201844</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>5</p></td>
         <td><p>4</p></td>
         <td><p>1/(60+5)+1/(60+4) = 0.03100962</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>2</p></td>
         <td><p>N/A</p></td>
         <td><p>1/(60+2) = 0.01612903</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>3</p></td>
         <td><p>N/A</p></td>
         <td><p>1/(60+3) = 0.01587302</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>N/A</p></td>
         <td><p>3</p></td>
         <td><p>1/(60+3) = 0.01587302</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>N/A</p></td>
         <td><p>5</p></td>
         <td><p>1/(60+5) = 0.01538462</p></td>
       </tr>
    </table>

- リランキング後の最終結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>Rank</strong></p></th>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>Final Score</strong></p></th>
       </tr>
       <tr>
         <td><p>1</p></td>
         <td><p>101</p></td>
         <td><p>0.03252247</p></td>
       </tr>
       <tr>
         <td><p>2</p></td>
         <td><p>198</p></td>
         <td><p>0.03201844</p></td>
       </tr>
       <tr>
         <td><p>3</p></td>
         <td><p>175</p></td>
         <td><p>0.03100962</p></td>
       </tr>
       <tr>
         <td><p>4</p></td>
         <td><p>203</p></td>
         <td><p>0.01612903</p></td>
       </tr>
       <tr>
         <td><p>5</p></td>
         <td><p>150</p></td>
         <td><p>0.01587302</p></td>
       </tr>
       <tr>
         <td><p>5</p></td>
         <td><p>110</p></td>
         <td><p>0.01587302</p></td>
       </tr>
    </table>

## RRF Ranker の使用方法\{#usage-of-rrf-ranker}

RRF リランキング戦略を使用する際は、パラメータ `k` を設定する必要があります。これは平滑化パラメータであり、全文検索とベクトル検索の相対的な重みを効果的に調整できます。このパラメータのデフォルト値は 60 で、(0, 16384) の範囲内で調整可能です。値は浮動小数点数である必要があります。推奨値は [10, 100] の範囲内です。`k=60` は一般的な選択ですが、最適な `k` 値はアプリケーションやデータセットによって異なります。ベストなパフォーマンスを得るために、具体的なユースケースに基づいてこのパラメータをテストおよび調整することを推奨します。

### RRF Ranker の作成\{#create-an-rrf-ranker}

コレクションに複数のベクトルフィールドを設定した後、適切な平滑化パラメータで RRF Ranker を作成します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

rerank = Function(
    name="rrf",
    input_field_names=[], # Must be an empty list
    function_type=FunctionType.RERANK,
    params={
        "reranker": "rrf", 
        "k": 100  # Optional
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.Function rerank = CreateCollectionReq.Function.builder()
        .name("rrf")
        .functionType(FunctionType.RERANK)
        .param("reranker", "rrf")
        .param("k", "100")
        .build();
```

</TabItem>

<TabItem value='java'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const rerank = {
  name: "rrf",
  input_field_names: [],
  function_type: FunctionType.RERANK,
  params: {
    reranker: "rrf",
    k: 100,
  },
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
     <td><p><code>"rrf"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>この関数を適用するベクトルフィールドのリスト（RRF Rankerの場合は空にする必要があります）</p></td>
     <td><p>[]</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出すFunctionのタイプ。再ランキング戦略を指定するには<code>RERANK</code>を使用します。</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用する再ランキング手法を指定します。</p><p>RRF Rankerを使用するには、<code>rrf</code>に設定する必要があります。</p></td>
     <td><p><code>"weighted"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.k</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>ドキュメントの順位への影響を制御するスムージングパラメータ。高い<code>k</code>値は上位の順位に対する感度を低下させます。範囲: (0, 16384)。デフォルト: <code>60</code>。</p><p>詳細については、<a href="./reranking-rrf#mechanism-of-rrf-ranker">RRF Rankerの仕組み</a>を参照してください。</p></td>
     <td><p><code>100</code></p></td>
   </tr>
</table>

### ハイブリッド検索への適用\{#apply-to-hybrid-search}

RRF Rankerは、複数のベクトルフィールドを組み合わせたハイブリッド検索操作のために特別に設計されています。以下はハイブリッド検索でこれを使用する方法です：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest

# Connect to Milvus server
milvus_client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

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

# Apply RRF Ranker to product hybrid search
# The smoothing parameter k controls the balance
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # Multiple search requests
    # highlight-next-line
    ranker=rerank,  # Apply the RRF ranker
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
                .ranker(rerank)
                .limit(10)
                .outputFields(Arrays.asList("product_name", "price", "category"))
                .build();
SearchResp searchResp = client.hybridSearch(hybridSearchReq);
```

</TabItem>

<TabItem value='java'>

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

const search = await milvusClient.search({
  collection_name: collection_name,
  data: [text_search, image_search],
  output_fields: ["product_name", "price", "category"],
  limit: 10,
  rerank: rerank,
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