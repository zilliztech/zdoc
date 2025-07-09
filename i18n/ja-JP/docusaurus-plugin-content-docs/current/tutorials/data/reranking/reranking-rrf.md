---
title: "RRFランカー | Cloud"
slug: /reranking-rrf
sidebar_label: "RRFランカー"
beta: FALSE
notebook: FALSE
description: "Reciprocal Rank Fusion(RRF)Rankerは、Milvusハイブリッド検索の再ランキング戦略であり、生の類似スコアではなく、ランキング位置に基づいて複数のベクトル検索パスからの結果をバランスさせます。個々の統計ではなく、選手のランキングを考慮するスポーツトーナメントのように、RRF Rankerは、各アイテムが異なる検索パスでどの程度高くランク付けされているかに基づいて検索結果を組み合わせ、公正でバランスの取れた最終ランキングを作成します。 | Cloud"
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
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# RRFランカー

Reciprocal Rank Fusion(RRF)Rankerは、Milvusハイブリッド検索の再ランキング戦略であり、生の類似スコアではなく、ランキング位置に基づいて複数のベクトル検索パスからの結果をバランスさせます。個々の統計ではなく、選手のランキングを考慮するスポーツトーナメントのように、RRF Rankerは、各アイテムが異なる検索パスでどの程度高くランク付けされているかに基づいて検索結果を組み合わせ、公正でバランスの取れた最終ランキングを作成します。

## いつRRF Rankerを使うべきか{#when-to-use-rrf-ranker}

RRF Rankerは、明示的な重要度の重みを割り当てることなく、複数のベクトル検索パスからの結果をバランスさせたいハイブリッド検索シナリオ向けに特別に設計されています。特に以下の場合に効果的です:

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>RRFランカーがうまく機能する理由</p></th>
   </tr>
   <tr>
     <td><p>同じ重要性を持つマルチモーダル検索</p></td>
     <td><p>両方のモダリティが同等に重要な画像テキスト検索</p></td>
     <td><p>任意の重みの割り当てを必要とせずに結果をバランスさせる</p></td>
   </tr>
   <tr>
     <td><p>アンサンブルベクトル探索</p></td>
     <td><p>異なる埋め込みモデルの結果を組み合わせる</p></td>
     <td><p>特定のモデルのスコア分布を優先せずに、民主的にランキングを統合する</p></td>
   </tr>
   <tr>
     <td><p>クロスリンガル検索</p></td>
     <td><p>複数の言語でドキュメントを検索する</p></td>
     <td><p>言語固有の埋め込み特性に関係なく、結果を公正にランク付けします</p></td>
   </tr>
   <tr>
     <td><p>エキスパートの推奨</p></td>
     <td><p>複数の専門家システムからの推奨を組み合わせる</p></td>
     <td><p>異なるシステムが比類のないスコアリング方法を使用する場合に、コンセンサスランキングを作成します</p></td>
   </tr>
</table>

ハイブリッド検索アプリケーションが、明示的な重みを割り当てずに複数の検索パスを民主的にバランスさせる必要がある場合、RRF Rankerが理想的な選択肢です。

## RRFランカーの仕組み{#mechanism-of-rrf-ranker}

RRFRanker戦略の主なワークフローは以下の通りです:

1. 検索ランキングの収集:ベクトル検索の各パスから結果のランキングを収集します(ランク1、ランク2)。

1. ランキングのマージ:レシピに従って、各パス(rank_rrf_1、rank_rrf_2)のランキングを変換してください。

    計算レシピには、検索回数を表す*N*が含まれます。*ranki*(*d*)は、*i(th)*リトリーバによって生成されたドキュメント*d*のランキング位置です。*k*は、通常60に設定されるスムージングパラメータです。

1. 集計ランキング:結合されたランキングに基づいて検索結果を再ランク付けし、最終結果を生成します。

![M2SawupkSh2NZxbX7SAcwqZZnxd](/img/M2SawupkSh2NZxbX7SAcwqZZnxd.png)

## RRFランカーの例{#example-of-rrf-ranker}

この例は、疎密度ベクトルに対するハイブリッド検索（topK=5）を示し、RRFRanker戦略が2つのANN検索の結果を再ランク付けする方法を示しています。

- テキストの疎ベクトルに対するANN検索の結果（topK=5）:

<table>
   <tr>
     <th><p><strong>IDの</strong></p></th>
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

- テキストの高密度ベクトルに対するANN検索の結果（topK=5）:

<table>
   <tr>
     <th><p><strong>IDの</strong></p></th>
     <th><p><strong>ランク（密）</strong></p></th>
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

- RRFを使用して、2つの検索結果のランキングを再配置します。スムージングパラメータ`k`が60に設定されていると仮定します。

<table>
   <tr>
     <th><p><strong>IDの</strong></p></th>
     <th><p><strong>スコア（スパース）</strong></p></th>
     <th><p><strong>スコア（密集）</strong></p></th>
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

- リランキング後の最終結果（topK=5）:

<table>
   <tr>
     <th><p><strong>ランク</strong></p></th>
     <th><p><strong>IDの</strong></p></th>
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

## RRF Rankerの使い方{#usage-of-rrf-ranker}

RRFリランキング戦略を使用する場合、パラメータ`k`を設定する必要があります。これは、全文検索とベクトル検索の相対的な重みを効果的に変更できるスムージングパラメータです。このパラメータのデフォルト値は60で、(0,163 8 4)の範囲内で調整できます。値は浮動小数点数である必要があります。推奨値は[10,100]の間です。`k=60`が一般的な選択肢ですが、最適な`k`値は、特定のアプリケーションやデータセットによって異なる場合があります。最適なパフォーマンスを実現するために、特定のユースケースに基づいてこのパラメータをテストおよび調整することをお勧めします。

### RRFランカーを作成する{#create-an-rrf-ranker}

複数のベクトルフィールドでコレクションを設定したら、適切なスムージングパラメータを使用してRRF Rankerを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import RRFRanker

ranker = RRFRanker(100)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.RRFRanker;

RRFRanker ranker = new RRFRanker(100);
```

</TabItem>

<TabItem value='go'>

```go
ranker := milvusclient.NewRRFReranker().WithK(100)
```

</TabItem>

<TabItem value='javascript'>

```javascript
ranker: RRFRanker("100")
```

</TabItem>

<TabItem value='bash'>

```bash
"ranker": {
    "strategy": "rrf",
    "params": {
        "k": 100
    }
}
export ranker='{
        "strategy": "rrf",
        "params": {"k": 100}
    }'
```

</TabItem>
</Tabs>

</include>

<Admonition type="info" icon="📘" title="ノート">

<p>Milvus 2.6. x以降では、<code>Function</code> APIを使用して再ランキング戦略を直接設定できます。v 2.6.0より前のリリースを使用している場合は、<a href="https://milvus.io/docs/v2.5.x/reranking.md">リランキング</a>のドキュメントを参照して設定手順を確認してください。</p>

</Admonition>

</include>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import Function, FunctionType

ranker = Function(
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
// Java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Nodejs
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
     <th><p>必要ですか?</p></th>
     <th><p>説明する</p></th>
     <th><p>値/サンプル</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>はい</p></td>
     <td><p>この関数の一意の識別子</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>はい</p></td>
     <td><p>関数を適用するベクトルフィールドのリスト(RRF Rankerの場合は空である必要があります)</p></td>
     <td><p>[]</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>はい</p></td>
     <td><p>呼び出す関数の種類。再ランキング戦略を指定するには、<code>RERANK</code>を使用してください</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>はい</p></td>
     <td><p>使用する再ランキングメソッドを指定します。</p><p>RRFランカーを使用するには、<code>rrf</code>に設定する必要があります。</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>いいえ</p></td>
     <td><p>ドキュメントランクの影響を制御するスムージングパラメータ。<code>k</code>が高いほど、上位ランクへの感度が低下します。範囲:(0,163 84);デフォルト: <code>60</code>。</p><p>詳細については、<a href="./reranking-rrf#mechanism-of-rrf-ranker">RRFランカーの仕組み</a>を参照してください。</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
</table>

</include>

### ハイブリッド検索に適用する{#apply-to-hybrid-search}

RRF Rankerは、複数のベクトル場を組み合わせたハイブリッド検索操作に特化して設計されています。ハイブリッド検索での使用方法は以下の通りです:

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
    ranker=ranker,  # Apply the RRF ranker
    limit=10,
    output_fields=["product_name", "price", "category"]
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
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