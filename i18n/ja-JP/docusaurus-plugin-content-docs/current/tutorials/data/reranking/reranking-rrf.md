---
title: "RRF Ranker | Cloud"
slug: /reranking-rrf
sidebar_label: "RRF Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Reciprocal Rank Fusion (RRF) Rankerは、Zilliz Cloudハイブリッド検索のための再ランク付け戦略であり、生の類似度スコアではなくランキング位置に基づいて複数のベクトル検索パスの結果をバランスさせるものです。選手の統計ではなくランキングを考慮するスポーツトーナメントのように、RRF Rankerは各アイテムが異なる検索パスでどれほど高い順位にあるかに基づいて検索結果を組み合わせ、公平でバランスの取れた最終ランキングを作成します。 | Cloud"
type: origin
token: Nqguwf6ikiKrHEkGKgAc8g7Lnnh
sidebar_position: 2
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search result reranking
  - result reranking
  - rrf
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RRF Ranker

Reciprocal Rank Fusion (RRF) Rankerは、Zilliz Cloudハイブリッド検索のための再ランク付け戦略であり、複数のベクトル検索パスからの結果を、生の類似度スコアではなくランキング位置に基づいてバランスさせるものです。選手の統計ではなくランキングを考慮するスポーツトーナメントと同様に、RRF Rankerは各アイテムが異なる検索パスでどれほど高い順位にあるかに基づいて検索結果を組み合わせ、公平でバランスの取れた最終ランキングを作成します。

## RRF Rankerの使用タイミング\{#when-to-use-rrf-ranker}

RRF Rankerは、明示的な重要度ウェイトを割り当てずに複数のベクトル検索パスの結果をバランスさせたいハイブリッド検索シナリオのために特別に設計されています。特に効果的なのは：

<table>
   <tr>
     <th><p>使用例</p></th>
     <th><p>例</p></th>
     <th><p>RRF Rankerがうまく機能する理由</p></th>
   </tr>
   <tr>
     <td><p>同等の重要度を持つマルチモーダル検索</p></td>
     <td><p>両方のモダリティが同等に重要な画像-テキスト検索</p></td>
     <td><p>任意の重み付けを必要とせずに結果をバランスさせる</p></td>
   </tr>
   <tr>
     <td><p>アンサンブルベクトル検索</p></td>
     <td><p>異なる埋め込みモデルからの結果を組み合わせる</p></td>
     <td><p>特定のモデルのスコア分布を優遇することなく民主的にランキングをマージする</p></td>
   </tr>
   <tr>
     <td><p>クロスリンガル検索</p></td>
     <td><p>複数言語間の文書を検索する</p></td>
     <td><p>言語固有の埋め込み特性に関係なく結果を公平にランク付けする</p></td>
   </tr>
   <tr>
     <td><p>専門家による推薦</p></td>
     <td><p>複数の専門家システムからの推薦を組み合わせる</p></td>
     <td><p>異なるシステムが比較不可能なスコアリング方法を使用する場合の合意されたランキングを作成する</p></td>
   </tr>
</table>

ハイブリッド検索アプリケーションで明示的な重みを割り当てることなく複数の検索パスを民主的にバランスさせる必要がある場合、RRF Rankerが最適な選択です。

## RRF Rankerの仕組み\{#mechanism-of-rrf-ranker}

RRFRanker戦略の主なワークフローは以下の通りです：

1. **検索ランキングの収集**: ベクトル検索の各パスからの結果のランキングを収集します（rank_1, rank_2）。

1. **ランキングのマージ**: 各パスからのランキングを数式に従って変換します（rank_rrf_1, rank_rrf_2）。

    計算式には*N*が含まれ、これは検索数を表します。*ranki*(*d*)は*i番目*の検索器によって生成された文書*d*のランキング位置です。*k*は通常60に設定されるスムージングパラメータです。

1. **ランキングの集約**: 組み合わされたランキングに基づいて検索結果を再ランク付けし、最終結果を生成します。

![M2SawupkSh2NZxbX7SAcwqZZnxd](/img/M2SawupkSh2NZxbX7SAcwqZZnxd.png)

## RRF Rankerの例\{#example-of-rrf-ranker}

この例は、スパース-デンスベクトル上のハイブリッド検索（topK=5）を示し、RRFRanker戦略が2つのANN検索からの結果をどのように再ランク付けするかを説明しています。

- テキストのスパースベクトルに対するANN検索の結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>ランク (スパース)</strong></p></th>
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

- テキストのデンスベクトルに対するANN検索の結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>ランク (デンス)</strong></p></th>
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

- RRFを使用して2つの検索結果セットのランキングを並び替えます。スムージングパラメータ「k」が60に設定されていると仮定します。

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>スコア (スパース)</strong></p></th>
         <th><p><strong>スコア (デンス)</strong></p></th>
         <th><p><strong>最終スコア</strong></p></th>
       </tr>
       <tr>
         <td><p>101</p></td>
         <td><p>1</p></td>
         <td><p>2</p></td>
         <td><p>1/(60+1)+1/(60+2) = 0.01639</p></td>
       </tr>
       <tr>
         <td><p>198</p></td>
         <td><p>4</p></td>
         <td><p>1</p></td>
         <td><p>1/(60+4)+1/(60+1) = 0.01593</p></td>
       </tr>
       <tr>
         <td><p>175</p></td>
         <td><p>5</p></td>
         <td><p>4</p></td>
         <td><p>1/(60+5)+1/(60+4) = 0.01554</p></td>
       </tr>
       <tr>
         <td><p>203</p></td>
         <td><p>2</p></td>
         <td><p>N/A</p></td>
         <td><p>1/(60+2) = 0.01613</p></td>
       </tr>
       <tr>
         <td><p>150</p></td>
         <td><p>3</p></td>
         <td><p>N/A</p></td>
         <td><p>1/(60+3) = 0.01587</p></td>
       </tr>
       <tr>
         <td><p>110</p></td>
         <td><p>N/A</p></td>
         <td><p>3</p></td>
         <td><p>1/(60+3) = 0.01587</p></td>
       </tr>
       <tr>
         <td><p>250</p></td>
         <td><p>N/A</p></td>
         <td><p>5</p></td>
         <td><p>1/(60+5) = 0.01554</p></td>
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
         <td><p>0.01639</p></td>
       </tr>
       <tr>
         <td><p>2</p></td>
         <td><p>203</p></td>
         <td><p>0.01613</p></td>
       </tr>
       <tr>
         <td><p>3</p></td>
         <td><p>198</p></td>
         <td><p>0.01593</p></td>
       </tr>
       <tr>
         <td><p>4</p></td>
         <td><p>150</p></td>
         <td><p>0.01587</p></td>
       </tr>
       <tr>
         <td><p>5</p></td>
         <td><p>110</p></td>
         <td><p>0.01587</p></td>
       </tr>
    </table>

## RRF Rankerの使用法\{#usage-of-rrf-ranker}

RRF再ランク付け戦略を使用する際には、パラメータ「k」を設定する必要があります。これは、全文検索とベクトル検索の相対的重みを効果的に変更できるスムージングパラメータです。このパラメータのデフォルト値は60であり、(0, 16384)の範囲内で調整できます。値は浮動小数点数である必要があります。推奨される値は[10, 100]の間です。`k=60`が一般的な選択肢ではありますが、最適な「k」の値は特定のアプリケーションやデータセットによって異なります。最適なパフォーマンスを得るために、特定の使用例に基づいてこのパラメータをテストし調整することを推奨します。

### RRF Rankerの作成\{#create-an-rrf-ranker}

複数のベクトルフィールドでコレクションが設定された後、適切なスムージングパラメータでRRF Rankerを作成します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

ranker = Function(
    name="rrf",
    input_field_names=[], # 空のリストでなければなりません
    function_type=FunctionType.RERANK,
    params={
        "reranker": "rrf",
        "k": 100  # オプション
    }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

CreateCollectionReq.Function rr = CreateCollectionReq.Function.builder()
                .functionType(FunctionType.RERANK)
                .param("strategy", "rrf")
                .param("params", "{\"k\": 100}")
                .build();
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { FunctionType } from "@zilliz/milvus2-sdk-node";

const ranker = {
  name: "weight",
  input_field_names: [],
  function_type: FunctionType.RERANK,
  params: {
    reranker: "weighted",
    weights: [0.1, 0.9],
    norm_score: true,
  },
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
     <td><p><code>"rrf"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>関数を適用するベクトルフィールドのリスト（RRF Rankerでは空のリストにする必要があります）</p></td>
     <td><p>[]</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す関数のタイプ。再ランク付け戦略を指定するには<code>RERANK</code>を使用してください</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用する再ランク付け方法を指定します。<p>RRF Rankerを使用するには<code>rrf</code>に設定する必要があります。</p></p></td>
     <td><p><code>"weighted"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.k</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>文書ランキングの影響を制御するスムージングパラメータ。より高い<code>k</code>は上位ランキングに対する感度を低下させます。範囲: (0, 16384); デフォルト: <code>60</code>。<p>詳細については、<a href="./reranking-rrf#mechanism-of-rrf-ranker">RRF Rankerの仕組み</a>を参照してください。</p></p></td>
     <td><p><code>100</code></p></td>
   </tr>
</table>

### ハイブリッド検索への適用\{#apply-to-hybrid-search}

RRF Rankerは、複数のベクトルフィールドを組み合わせるハイブリッド検索操作のために特別に設計されています。ハイブリッド検索で使用する方法は以下の通りです：

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

# RRF Rankerを製品ハイブリッド検索に適用
# スムージングパラメータkがバランスを制御
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # 複数の検索リクエスト
    # highlight-next-line
    ranker=ranker,  # RRFランカーを適用
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

const ranker = {
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
  data: [text_search, image_search],
  output_fields: ["product_name", "price", "category"],
  limit: 10,
  rerank: ranker,
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