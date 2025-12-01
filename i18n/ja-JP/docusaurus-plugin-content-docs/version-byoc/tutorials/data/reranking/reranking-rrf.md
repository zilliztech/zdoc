---
title: "RRF ランカー | BYOC"
slug: /reranking-rrf
sidebar_label: "RRF ランカー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "相互順位融合（RRF）ランカーは、Zilliz Cloudハイブリッド検索のためのリランキング戦略であり、複数のベクトル検索パスからの結果を生の類似度スコアではなく順位位置に基づいてバランスさせます。選手のランキングではなく個々の統計に基づくスポーツトーナメントのように、RRF ランカーは検索結果を異なる検索パスで各アイテムがどれほど高くランクされているかに基づいて結合し、公平でバランスの取れた最終ランキングを作成します。 | BYOC"
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
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RRF ランカー

相互順位融合（RRF）ランカーは、Zilliz Cloudハイブリッド検索のためのリランキング戦略であり、複数のベクトル検索パスからの結果を生の類似度スコアではなく順位位置に基づいてバランスさせます。選手のランキングではなく個々の統計に基づくスポーツトーナメントのように、RRF ランカーは検索結果を異なる検索パスで各アイテムがどれほど高くランクされているかに基づいて結合し、公平でバランスの取れた最終ランキングを作成します。

## RRF ランカーの使用タイミング\{#when-to-use-rrf-ranker}

RRF ランカーは、明示的な重要度の重みを割り当てることなく複数のベクトル検索パスからの結果をバランスさせるハイブリッド検索シナリオに特化して設計されています。特に効果的なのは：

<table>
   <tr>
     <th><p>使用ケース</p></th>
     <th><p>例</p></th>
     <th><p>なぜRRF ランカーがうまく機能するのか</p></th>
   </tr>
   <tr>
     <td><p>同等の重要度を持つマルチモーダル検索</p></td>
     <td><p>両方のモダリティが同等に重要である画像-テキスト検索</p></td>
     <td><p>任意の重み付けなしで結果をバランスさせる</p></td>
   </tr>
   <tr>
     <td><p>アンサンブルベクトル検索</p></td>
     <td><p>異なる埋め込みモデルからの結果を結合</p></td>
     <td><p>特定のモデルのスコアリング分布を favors することなく、民主的にランキングをマージする</p></td>
   </tr>
   <tr>
     <td><p>クロスリンガル検索</p></td>
     <td><p>複数言語にわたるドキュメント検索</p></td>
     <td><p>言語固有の埋め込み特性に関係なく公平に結果をランク付けする</p></td>
   </tr>
   <tr>
     <td><p>専門家推奨</p></td>
     <td><p>複数の専門家システムからの推奨を結合</p></td>
     <td><p>比較できないスコアリング方法を使用する異なるシステムのコンセンサスランキングを作成する</p></td>
   </tr>
</table>

ハイブリッド検索アプリケーションで明示的な重み付けなしに複数の検索パスを民主的にバランスさせたい場合、RRF ランカーが理想的な選択です。

## RRF ランカーのメカニズム\{#mechanism-of-rrf-ranker}

RRFRanker戦略の主なワークフローは以下の通りです：

1. **検索ランキングの収集**: 各ベクトル検索パスからの結果のランキングを収集します（rank_1、rank_2）。

1. **ランキングのマージ**: 各パスからのランキング（rank_rrf_1、rank_rrf_2）を式に従って変換します。

    計算式には、検索数を表す*N*が含まれます。*ranki*（*d*）は*i*番目の検索者によって生成されたドキュメント*d*のランキング位置です。*k*は通常60に設定される平滑化パラメータです。

1. **ランキングの集約**: 結合されたランキングに基づいて検索結果を再ランク付けし、最終結果を生成します。

![M2SawupkSh2NZxbX7SAcwqZZnxd](/img/M2SawupkSh2NZxbX7SAcwqZZnxd.png)

## RRF ランカーの例\{#example-of-rrf-ranker}

この例では、スパース・デンスベクトルのハイブリッド検索（topK=5）を示し、RRFRanker戦略が2つのANN検索からの結果をどのようにリランキングするかを説明しています。

- テキストのスパースベクトルに対するANN検索の結果（topK=5）：

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>ランク（スパース）</strong></p></th>
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
         <th><p><strong>ランク（デンス）</strong></p></th>
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

- RRFを使用して2つの検索結果セットのランキングを並べ替えます。平滑化パラメータ「k」は60に設定されていると仮定します。

    <table>
       <tr>
         <th><p><strong>ID</strong></p></th>
         <th><p><strong>スコア（スパース）</strong></p></th>
         <th><p><strong>スコア（デンス）</strong></p></th>
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

- リランキング後の最終結果（topK=5）：

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

## RRF ランカーの使用法\{#usage-of-rrf-ranker}

RRF リランキング戦略を使用する際には、パラメータ`k`を構成する必要があります。これは、全文検索とベクトル検索の相対的な重みを効果的に変更できる平滑化パラメータです。このパラメータのデフォルト値は60であり、（0、16384）の範囲内で調整できます。値は浮動小数点数でなければなりません。推奨値は[10、100]の間です。`k=60`は一般的な選択肢ですが、最適な`k`の値はアプリケーションとデータセットによって異なります。特定のユースケースに基づいてテストおよび調整することをお勧めします。

### RRF ランカーの作成\{#create-an-rrf-ranker}

コレクションが複数のベクトルフィールドでセットアップされた後、適切な平滑化パラメータでRRF ランカーを作成します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

ranker = Function(
    name="rrf",
    input_field_names=[], # 空のリストでなければならない
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
     <th><p>必須？</p></th>
     <th><p>説明</p></th>
     <th><p>値/例</p></th>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>はい</p></td>
     <td><p>この関数の固有識別子</p></td>
     <td><p><code>"rrf"</code></p></td>
   </tr>
   <tr>
     <td><p><code>input_field_names</code></p></td>
     <td><p>はい</p></td>
     <td><p>関数を適用するベクトルフィールドのリスト（RRF ランカーでは空リストでなければならない）</p></td>
     <td><p>[]</p></td>
   </tr>
   <tr>
     <td><p><code>function_type</code></p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す関数のタイプ；リランキング戦略を指定するには<code>RERANK</code>を使用する</p></td>
     <td><p><code>FunctionType.RERANK</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.reranker</code></p></td>
     <td><p>はい</p></td>
     <td><p>使用するリランキング方法を指定する。<code>rrf</code>に設定してRRF ランカーを使用しなければならない。</p></td>
     <td><p><code>"weighted"</code></p></td>
   </tr>
   <tr>
     <td><p><code>params.k</code></p></td>
     <td><p>いいえ</p></td>
     <td><p>文書ランクの影響を制御する平滑化パラメータ；高い<code>k</code>はトップランクの感度を低下させる。範囲：（0、16384）；デフォルト：<code>60</code>。<br/>詳細については、<a href="./reranking-rrf#mechanism-of-rrf-ranker">RRF ランカーのメカニズム</a>を参照してください。</p></td>
     <td><p><code>100</code></p></td>
   </tr>
</table>

### ハイブリッド検索への適用\{#apply-to-hybrid-search}

RRF ランカーは、複数のベクトルフィールドを組み合わせるハイブリッド検索操作のために特に設計されています。以下はハイブリッド検索で使用する方法です：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, AnnSearchRequest

# Milvusサーバーに接続
milvus_client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# コレクションセットアップがあると仮定

# テキストベクトル検索要求を定義
text_search = AnnSearchRequest(
    data=["modern dining table"],
    anns_field="text_vector",
    param={},
    limit=10
)

# 画像ベクトル検索要求を定義
image_search = AnnSearchRequest(
    data=[image_embedding],  # 画像埋め込みベクトル
    anns_field="image_vector",
    param={},
    limit=10
)

# RRF ランカーを商品ハイブリッド検索に適用
# 平滑化パラメータkはバランスを制御する
hybrid_results = milvus_client.hybrid_search(
    collection_name,
    [text_search, image_search],  # 複数の検索要求
    # highlight-next-line
    ranker=ranker,  # RRF ランカーを適用
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