---
title: "ウェイト付きランカー | BYOC"
slug: /reranking-weighted-reranker
sidebar_label: "ウェイト付きランカー"
beta: FALSE
notebook: FALSE
description: "Weighted Rankerは、それぞれに異なる重要度の重みを割り当てることで、複数の検索パスからの結果を賢く組み合わせ、優先順位を付けます。熟練したシェフが複数の材料をバランスよく組み合わせて完璧な料理を作るのと同様に、Weighted Rankerは異なる検索結果をバランスよく組み合わせて、最も関連性の高い結果を提供します。このアプローチは、特定のフィールドが他のフィールドよりも最終的なランキングにより重要に貢献する必要がある複数のベクトルフィールドやモダリティを検索する場合に最適です。 | BYOC"
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
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# ウェイト付きランカー

Weighted Rankerは、それぞれに異なる重要度の重みを割り当てることで、複数の検索パスからの結果を賢く組み合わせ、優先順位を付けます。熟練したシェフが複数の材料をバランスよく組み合わせて完璧な料理を作るのと同様に、Weighted Rankerは異なる検索結果をバランスよく組み合わせて、最も関連性の高い結果を提供します。このアプローチは、特定のフィールドが他のフィールドよりも最終的なランキングにより重要に貢献する必要がある複数のベクトルフィールドやモダリティを検索する場合に最適です。

## Weighted Rankerを使用するタイミング{#when-to-use-weighted-ranker}

Weighted Rankerは、複数のベクトル検索パスからの結果を組み合わせる必要があるハイブリッド検索シナリオ向けに特別に設計されています。特に以下の場合に効果的です:

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>なぜ加重ランカーがうまく機能するのか</p></th>
   </tr>
   <tr>
     <td><p>Eコマース検索</p></td>
     <td><p>画像の類似性とテキストの説明を組み合わせた製品検索</p></td>
     <td><p>小売業者がファッションアイテムの視覚的類似性を優先し、技術製品のテキスト説明を強調できるようにする</p></td>
   </tr>
   <tr>
     <td><p>メディアコンテンツの検索</p></td>
     <td><p>ビジュアル特徴とオーディオトランスクリプトの両方を使用したビデオ検索</p></td>
     <td><p>クエリの意図に基づいて、ビジュアルコンテンツと音声対話の重要性をバランスさせます</p></td>
   </tr>
   <tr>
     <td><p>ドキュメントの検索</p></td>
     <td><p>異なるセクションに対して複数の埋め込みを使用した企業文書検索</p></td>
     <td><p>タイトルと抽象的な埋め込みに高い重みを与えながら、全文の埋め込みを考慮します</p></td>
   </tr>
</table>

あなたのハイブリッド検索アプリケーションが、相対的な重要性を制御しながら複数の検索パスを組み合わせる必要がある場合、Weighted Rankerは理想的な選択肢です。

## ウェイト付きランカーのメカニズム{#mechanism-of-weighted-ranker}

WeightedRanker戦略の主なワークフローは以下の通りです:

1. 検索スコアの収集:ベクトル検索の各パス(スコア1、スコア2)から結果とスコアを収集します。

1. スコア正規化:各検索は異なる類似性メトリックを使用する場合があり、異なるスコア分布になります。たとえば、内積(IP)を類似性タイプとして使用すると、[-∞、+∞]のスコアが得られますが、ユークリッド距離(L 2)を使用すると、[0、+∞]のスコアが得られます。異なる検索からのスコア範囲が異なり、直接比較できないため、各検索パスのスコアを正規化する必要があります。通常、`arctan`関数が適用され、スコアを[0、1]の範囲に変換します(スコア_1_正規化、スコア_2_正規化)。1に近いスコアは、より高い類似性を示します。

1. 重みの割り当て:異なるベクトル場に割り当てられた重要度に基づいて、重み(wi)が正規化されたスコア(スコア_1_正規化、スコア_2_正規化)に割り当てられます。各パスの重みは[0,1]の範囲である必要があります。結果として得られる重み付きスコアは、スコア_1_重みとスコア_2_重みです。

1. マージスコア:重み付けされたスコア(スコア_1_重み付け、スコア_2_重み付け)は、最高から最低までランク付けされ、最終的なスコアセット(スコア_最終)が生成されます。

![GdmNwbkN8haZO8bpQkOc2NIWnqF](/img/GdmNwbkN8haZO8bpQkOc2NIWnqF.png)

## Weighted Rankerの例{#example-of-weighted-ranker}

この例は、画像とテキストを含むマルチモーダルハイブリッド検索（topK=5）を示し、WeightedRanker戦略が2つのANN検索の結果を再ランク付けする方法を示しています。

- 画像のANN検索の結果（topK=5）:

<table>
   <tr>
     <th><p><strong>IDの</strong></p></th>
     <th><p><strong>スコア（画像）</strong></p></th>
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

- テキストに対するANN検索の結果（topK=5）:

<table>
   <tr>
     <th><p><strong>IDの</strong></p></th>
     <th><p><strong>スコア（テキスト）</strong></p></th>
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

- WeightedRankerを使用して、画像とテキストの検索結果に重みを付けます。画像ANN検索の重みが0.6、テキスト検索の重みが0.4とします。

<table>
   <tr>
     <th><p><strong>IDの</strong></p></th>
     <th><p><strong>スコア（画像）</strong></p></th>
     <th><p><strong>スコア（テキスト）</strong></p></th>
     <th><p><strong>加重スコア</strong></p></th>
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
     <td><p>画像にない</p></td>
     <td><p>0.85</p></td>
     <td><p>0.6×0+0.4×0.85=0.34</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>画像にない</p></td>
     <td><p>0.78</p></td>
     <td><p>0.6×0+0.4×0.78=0.312</p></td>
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

## Weighted Rankerの使い方{#usage-of-weighted-ranker}

WeightedRanker戦略を使用する場合、重み値を入力する必要があります。入力する重み値の数は、ハイブリッド検索の基本ANN検索リクエストの数に対応する必要があります。入力重み値は[0,1]の範囲内にあり、1に近い値ほど重要度が高いことを示します。

### ウェイト付きランカーを作成する{#create-a-weighted-ranker}

例えば、ハイブリッド検索にはテキスト検索と画像検索の2つの基本的なANN検索リクエストがあるとします。テキスト検索がより重要と考えられる場合は、より大きな重みを割り当てる必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import WeightedRanker

# Create a Weighted Ranker for multimodal search 
# Weight for first search path (0.8) and second search path (0.3)
rerank= WeightedRanker(0.8, 0.3) 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.WeightedRanker;

WeightedRanker rerank = new WeightedRanker(Arrays.asList(0.8f, 0.3f))
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus/client/v2/milvusclient"

reranker := milvusclient.NewWeightedReranker([]float64{0.8, 0.3})
```

</TabItem>

<TabItem value='javascript'>

```javascript
rerank: WeightedRanker(0.8, 0.3)
```

</TabItem>

<TabItem value='bash'>

```bash
export rerank='{
        "strategy": "ws",
        "params": {"weights": [0.8,0.3]}
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
     <td><p>関数を適用するベクトルフィールドのリスト(Weighted Rankerの場合は空である必要があります)</p></td>
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
     <td><p>使用する再ランキングメソッドを指定します。</p><p>重み付きランカーを使用するには、<code>weighted</code>に設定する必要があります。</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>はい</p></td>
     <td><p>各検索パスに対応する重みの配列;値∈[0,1]。</p><p>詳細については、<a href="./reranking-weighted-reranker#mechanism-of-weighted-ranker">ウェイト付きランカーのメカニズム</a>を参照してください。</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>いいえ</p></td>
     <td><p>重み付けの前に生のスコア（arctanを使用）を正規化するかどうか。</p><p>詳細については、<a href="./reranking-weighted-reranker#mechanism-of-weighted-ranker">ウェイト付きランカーのメカニズム</a>を参照してください。</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
</table>

</include>

### ハイブリッド検索に適用する{#apply-to-hybrid-search}

Weighted Rankerは、複数のベクトル場を組み合わせたハイブリッド検索操作用に特別に設計されています。ハイブリッド検索を実行する場合、各検索パスの重みを指定する必要があります。

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