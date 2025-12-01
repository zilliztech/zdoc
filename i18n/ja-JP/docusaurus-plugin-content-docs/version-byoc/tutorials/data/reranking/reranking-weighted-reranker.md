---
title: "重み付きリランカー | BYOC"
slug: /reranking-weighted-reranker
sidebar_label: "重み付きリランカー"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "重み付きリランカーは、異なる重要度の重みを割り当てることで、複数の検索パスからの結果を賢く結合し、優先順位を付けています。熟練したシェフが複数の材料をバランスよく混ぜて完璧な料理を作るのと同様に、重み付きリランカーは異なる検索結果をバランスよく調整して、最も関連性が高い複合結果を提供します。このアプローチは、特定のフィールドが最終ランキングに他のフィールドよりも有意に貢献すべきである複数のベクトルフィールドまたはモダリティ間での検索に理想的です。 | BYOC"
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
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 重み付きリランカー

重み付きリランカーは、異なる重要度の重みを割り当てることで、複数の検索パスからの結果を賢く結合し、優先順位を付けています。熟練したシェフが複数の材料をバランスよく混ぜて完璧な料理を作るのと同様に、重み付きリランカーは異なる検索結果をバランスよく調整して、最も関連性が高い複合結果を提供します。このアプローチは、特定のフィールドが最終ランキングに他のフィールドよりも有意に貢献すべきである複数のベクトルフィールドまたはモダリティ間での検索に理想的です。

## 重み付きリランカーの使用タイミング\{#when-to-use-weighted-ranker}

重み付きリランカーは、複数のベクトル検索パスから結果を結合する必要があるハイブリッド検索シナリオに特化して設計されています。特に効果的なのは次のような場合です：

<table>
   <tr>
     <th><p>ユースケース</p></th>
     <th><p>例</p></th>
     <th><p>なぜ重み付きリランカーがうまくいくのか</p></th>
   </tr>
   <tr>
     <td><p>EC検索</p></td>
     <td><p>画像の類似性とテキスト記述を組み合わせた商品検索</p></td>
     <td><p>ファッション商品に対して視覚的類似性を優先し、技術製品に対してはテキスト記述を強調できるようにします</p></td>
   </tr>
   <tr>
     <td><p>メディアコンテンツ検索</p></td>
     <td><p>視覚的特徴と音声トランスクリプトを両方使用した動画検索</p></td>
     <td><p>クエリの意図に基づいて、視覚的内容と話し言葉の相対的重みを調整します</p></td>
   </tr>
   <tr>
     <td><p>文書検索</p></td>
     <td><p>複数のセクション用に複数の埋め込みを持つ企業文書検索</p></td>
     <td><p>タイトルや概要の埋め込みにより高い重みを与えながら、全文埋め込みも考慮に入れます</p></td>
   </tr>
</table>

ハイブリッド検索アプリケーションで複数の検索パスを組み合わせると同時に相対的な重要度を制御する必要がある場合、重み付きリランカーが理想の選択です。

## 重み付きリランカーの仕組み\{#mechanism-of-weighted-ranker}

重み付きリランカー戦略の主なワークフローは以下の通りです：

1. **検索スコアの収集**: 各ベクトル検索パスの結果とスコアを収集します（score_1、score_2）。

1. **スコアの正規化**: 各検索では異なる類似性メトリクスを使用するため、スコア分布が異なります。例えば、Inner Product（IP）を類似性タイプとして使用すると、スコア範囲は[-∞,+∞]になるのに対し、ユークリッド距離（L2）を使用するとスコア範囲は[0,+∞]になります。異なる検索から得られたスコア範囲は異なり、直接比較できないため、各検索パスのスコアを正規化する必要があります。通常、`arctan`関数が適用され、スコアを[0, 1]の範囲に変換します（score_1_normalized、score_2_normalized）。1に近いスコアほど類似性が高いことを示します。

1. **重みの割り当て**: 異なるベクトルフィールドの重要度に基づき、重み（**wi**）を正規化されたスコア（score_1_normalized、score_2_normalized）に割り当てます。各パスの重みは[0,1]の範囲にある必要があります。結果の重み付きスコアはscore_1_weightedおよびscore_2_weightedになります。

1. **スコアの統合**: 重み付きスコア（score_1_weighted、score_2_weighted）を最も高いスコアから最も低いスコアの順に並べ替えて、最終的なスコアセット（score_final）を生成します。

![GdmNwbkN8haZO8bpQkOc2NIWnqF](/img/GdmNwbkN8haZO8bpQkOc2NIWnqF.png)

## 重み付きリランカーの例\{#example-of-weighted-ranker}

この例では、画像とテキストを含むマルチモーダルハイブリッド検索（topK=5）を示し、重み付きリランカー戦略が2つのANN検索からの結果をどのようにリランキングするかを説明しています。

- 画像のANN検索結果（topK=5）：

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
    </table>
