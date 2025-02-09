---
title: "リランキング | Cloud"
slug: /reranking
sidebar_label: "リランキング"
beta: FALSE
notebook: FALSE
description: "ハイブリッド検索は、複数の同時ANN検索により、より正確な検索結果を実現します。複数の検索は複数の結果セットを返し、結果をマージして並べ替え、単一の結果セットを返すために再ランキング戦略が必要です。このガイドでは、Zilliz Cloudでサポートされる再ランキング戦略を紹介し、適切な再ランキング戦略を選択するためのヒントを提供します。 | Cloud"
type: origin
token: JnVlwz9BSigBwkksiubcMAcUn1b
sidebar_position: 17
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search result reranking
  - result reranking
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - vector similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# リランキング

ハイブリッド検索は、複数の同時ANN検索により、より正確な検索結果を実現します。複数の検索は複数の結果セットを返し、結果をマージして並べ替え、単一の結果セットを返すために再ランキング戦略が必要です。このガイドでは、Zilliz Cloudでサポートされる再ランキング戦略を紹介し、適切な再ランキング戦略を選択するためのヒントを提供します。

## 概要について{#overview}

次の図は、マルチモーダル検索アプリケーションでハイブリッド検索を実行する主なワークフローを示しています。図では、1つのパスはテキスト上の基本的なANN検索であり、もう1つのパスは画像上の基本的なANN検索です。各パスは、それぞれテキストと画像の類似スコアに基づいて一連の結果を生成します(**Limit 1**および**Limit 2**)。その後、再ランキング戦略が適用され、統一された基準に基づいて2つの結果セットが再ランク付けされ、最終的に2つの結果セットが最終的な検索結果セットである**Limit(final)**にマージされます。

![DdtYbb5iDoaVTixnk4vc2izTnph](/img/ja-JP/DdtYbb5iDoaVTixnk4vc2izTnph.png)

ハイブリッド検索において、再ランキングは複数のベクトル検索の結果を統合し、最終的な出力が最も関連性が高く正確であることを確認するための重要なステップです。現在、Zilliz Cloudは、以下の2つの再ランキング戦略をサポートしています

- **[WeightedRanker](./reranking#weightedrankerweightedranker)**:この戦略は、異なるベクトル検索からのスコア(または距離)の重み付けスコアを計算することによって結果を統合します。重みは、各ベクトルフィールドの重要度に基づいて割り当てられ、特定のユースケースの優先順位に応じてカスタマイズすることができます。

- **[RRFRanker](./reranking#rrfrankerrrfranker)(Reciprocal Rank Fusion Ranker)**:この戦略は、ランキングに基づいて結果を組み合わせます。異なる検索からの結果のランクをバランスさせる方法を使用し、しばしば多様なデータタイプやモダリティのより公正かつ効果的な統合につながります。

## WeightedRanker{#weightedranker}

WeightedRanker戦略は、ベクトル検索の各パスの重要度に基づいて、結果に異なる重みを割り当てます。

### WeightedRankerの仕組み{#mechanism-of-weightedranker}

WeightedRanker戦略の主なワークフローは以下の通りです:

1. **検索スコア収集**:ベクトル検索の各パス（スコア1、スコア2）から結果とスコアを収集します。

1. **スコア正規化**:各検索は異なる類似性メトリックを使用する場合があり、異なるスコア分布が得られます。たとえば、内積(IP)を類似性タイプとして使用すると、[-∞、+∞]のスコアが得られますが、ユークリッド距離(L 2)を使用すると、[0、+∞]のスコアが得られます。異なる検索からのスコア範囲が異なり、直接比較できないため、検索の各パスのスコアを正規化する必要があります。通常、`arctan`関数を適用して、スコアを[0、1]の範囲に変換します(スコア_1_正規化、スコア_2_正規化)。1に近いスコアは、より高い類似性を示します。

1. **重みを割り当て**る:異なるベクトル場に割り当てられた重要度に基づいて、重み(**wi**)が正規化されたスコア(スコア_1_正規化、スコア_2_正規化)に割り当てられます。各パスの重みは[0,1]の範囲である必要があります。結果として得られる重み付きスコアは、スコア_1_重みとスコア_2_重みです。

1. **Merge Scores**:加重されたスコア(score_1_、score_2_)は、最高から最低までランク付けされ、最終的なスコアセット(score_final)が生成されます。

![VUOkwss1fhKELVbfYcUcj24WnYJ](/img/ja-JP/VUOkwss1fhKELVbfYcUcj24WnYJ.png)

### WeightedRankerの例{#example-of-weightedranker}

この例は、画像とテキストを含むマルチモーダルハイブリッド検索（topK=5）を示し、WeightedRanker戦略が2つのANN検索の結果を再ランク付けする方法を示しています。

- 画像のANN検索の結果（topK=5）:

<table>
   <tr>
     <th><p><strong>ID</strong></p></th>
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
     <th><p><strong>ID</strong></p></th>
     <th><p><strong>スコア(テキスト)</strong></p></th>
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
     <th><p><strong>ID</strong></p></th>
     <th><p><strong>スコア(画像)</strong></p></th>
     <th><p><strong>Score(テキスト)</strong></p></th>
     <th><p><strong>最終的な加重スコア</strong></p></th>
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
     <th><p><strong>ランキング</strong></p></th>
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

### WeightedRankerの使い方{#usage-of-weightedranker}

WeightedRanker戦略を使用する場合、重み値を入力する必要があります。入力する重み値の数は、ハイブリッド検索の基本ANN検索リクエストの数に対応する必要があります。入力重み値は[0,1]の範囲内にあり、1に近い値ほど重要度が高いことを示します。

例えば、ハイブリッド検索にはテキスト検索と画像検索の2つの基本的なANN検索リクエストがあるとします。テキスト検索がより重要と考えられる場合は、より大きな重みを割り当てる必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import WeightedRanker

rerank= WeightedRanker(0.8, 0.3) 
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.ranker.WeightedRanker;

WeightedRanker rerank = new WeightedRanker(Arrays.asList(0.8f, 0.3f))
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

## RRFRanker{#rrfranker}

相互ランクフュージョン(RRF)は、ランキングの逆数に基づいてランク付けされたリストを組み合わせるデータフュージョン手法です。この再ランキング戦略は、ベクトル検索の各パスの重要性を効果的にバランスさせます。

### RRFRankerの仕組み{#mechanism-of-rrfranker}

RRFRanker戦略の主なワークフローは以下の通りです:

1. **検索ランキングの収集**:ベクトル検索の各パスから結果のランキングを収集します（ランク_1、ランク_2）。

1. **ランキング**の統合:レシピに従って、各パス（rank_rrf_1、rank_rrf_2）のランキングを変換します。

    計算レシピには、検索回数を表す*N*が含まれます。*ranki*(*d*)は、*i(th)*リトリーバによって生成された文書*d*のランキング位置です。*k*は、通常60に設定されるスムージングパラメータです。

1. **集計ランキング**:組み合わせたランキングに基づいて検索結果を再ランク付けし、最終結果を生成します。

![NR0nw4yJhhlqVqbkPIxcG3eanqc](/img/ja-JP/NR0nw4yJhhlqVqbkPIxcG3eanqc.png)

### RRFRankerの例{#example-of-rrfranker}

この例は、疎密度ベクトルに対するハイブリッド検索（topK=5）を示し、RRFRanker戦略が2つのANN検索の結果を再ランク付けする方法を示しています。

- テキストの疎ベクトルに対するANN検索の結果（topK=5）:

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

- テキストの密なベクトルに対するANN検索の結果（topK=5）:

<table>
   <tr>
     <th><p><strong>ID</strong></p></th>
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
     <th><p><strong>ID</strong></p></th>
     <th><p><strong>スコア(スパース)</strong></p></th>
     <th><p><strong>スコア(密)</strong></p></th>
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
     <th><p><strong>ランキング</strong></p></th>
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

### RRFRankerの使い方{#usage-of-rrfranker}

RRF再ランキング戦略を使用する場合、パラメータ`k`を設定する必要があります。これは、全文検索とベクトル検索の相対的な重みを効果的に変更できるスムージングパラメータです。このパラメータのデフォルト値は60で、(0,163 8 4)の範囲内で調整できます。値は浮動小数点数である必要があります。推奨値は[10,100]の間です。`k=60`が一般的な選択肢ですが、最適な`k`値は、特定のアプリケーションやデータセットによって異なる場合があります。最高のパフォーマンスを実現するために、このパラメータをテストして調整することをお勧めします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='javascript'>

```javascript
rerank: RRFRanker("100")
```

</TabItem>

<TabItem value='bash'>

```bash
"rerank": {
    "strategy": "rrf",
    "params": {
        "k": 100
    }
}
export rerank='{
        "strategy": "rrf",
        "params": {"k": 100}
    }'
```

</TabItem>
</Tabs>

## 適切な再ランキング戦略を選択{#select-the-right-reranking-strategy}

再ランキング戦略を選択する際に考慮すべきことの1つは、ベクトル場に対して1つ以上の基本的なANN検索に重点があるかどうかです。

- **WeightedRanker**:この戦略は、特定のベクトルフィールドを強調する必要がある場合に推奨されます。WeightedRankerを使用すると、特定のベクトルフィールドにより高い重みを割り当て、それらをより強調することができます。たとえば、マルチモーダル検索では、画像のテキストの説明が、この画像の色よりも重要と考えられる場合があります。

- **RRFRanker(Reciprocal Rank Fusion Ranker)**:この戦略は、特定の強調がない場合に推奨されます。RRFは、各ベクトル場の重要性を効果的にバランスさせることができます。

