---
title: "適切なCUを選択 | Cloud"
slug: /cu-types-explained
sidebar_label: "適切なCUを選択"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloudでクラスタを作成する際には、適切なコンピューティングユニット（CU）を選択することが重要なステップです。CUは、データの並列処理に使用されるコンピューティングリソースの基本単位であり、異なるCUタイプには、CPU、メモリ、ストレージのさまざまな組み合わせが含まれます。 | Cloud"
type: origin
token: IIFEwvhtViqF2YkQJZrcwREwndb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - cu
  - select
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search

---

import Admonition from '@theme/Admonition';


# 適切なCUを選択

Zilliz Cloudでクラスタを作成する際には、適切なコンピューティングユニット（CU）を選択することが重要なステップです。CUは、データの並列処理に使用されるコンピューティングリソースの基本単位であり、異なるCUタイプには、CPU、メモリ、ストレージのさまざまな組み合わせが含まれます。

## CUタイプを理解する{#understand-cu-types}

Zilliz Cloudは、次のCUタイプを提供しています:**Performance-optimized、容量最適化**、および**拡張容量。**

以下の表は、異なる側面で3つのCUタイプを簡単に比較したものです。CUタイプ間の容量と性能の詳細な比較については、「[最適なCUタイプを選択](./cu-types-explained#select-an-optimal-cu-type)する」を参照してください。

<table>
   <tr>
     <th><p>CUタイプ</p></th>
     <th><p>QPSを検索する</p></th>
     <th><p>検索レイテンシ</p></th>
     <th><p>CU容量ごと</p></th>
     <th><p>百万ベクトルあたりのコスト</p></th>
   </tr>
   <tr>
     <td><p><strong>Performance-optimized</strong></p></td>
     <td><p>500~1500</p></td>
     <td><p>サブ10ミリ秒</p></td>
     <td><p>150万個の768暗ベクトル</p></td>
     <td><p>$65/月から。</p></td>
   </tr>
   <tr>
     <td><p><strong>キャパシティ最適化</strong></p></td>
     <td><p>100~300</p></td>
     <td><p>十ミリ秒</p></td>
     <td><p>500万個の768-dimベクトル</p></td>
     <td><p>$20/月から。</p></td>
   </tr>
   <tr>
     <td><p><strong>拡張キャパシティ</strong></p></td>
     <td><p>5~20</p></td>
     <td><p>百ミリ秒</p></td>
     <td><p>20百万の768暗いベクトル</p></td>
     <td><p>$10/月から。</p></td>
   </tr>
</table>

### Performance-optimized CU{#performance-optimized-cu}

- 低レイテンシーと高スループットを重視したシナリオに合わせて調整されています。

- 生成AI、推薦システム、チャットボットなどのリアルタイムアプリケーションに最適です。

### 容量最適化された CU{#capacity-optimized-cu}

- 膨大なデータセットを処理できるように設計されており、検索性能は抑えられていますが、Performance-optimizedの相手の5倍のデータ容量を誇っています。

- 大規模な非構造化データ検索、著作権検出、身元確認に最適です。

## 拡張キャパシティ CU{#extended-capacity-cu}

- レイテンシよりもコスト効率が優先される広範なデータセットのシナリオに最適です。

- 低コストで大量のデータを保存する必要があるアプリケーションに最適です。拡張容量CUの容量は、容量最適化CUの4倍です。

拡張容量のCUを選択する必要がある場合は、[営業部までお問い合わせ](https://zilliz.com/contact-sales)ください。

## 最適なCUタイプを選択してください{#select-an-optimal-cu-type}

CUタイプを選択する際には、データ量、パフォーマンスの期待値、および予算を考慮してください。ベクトルデータの大きさは、ベクトルの数と次元の両方において、クラスタリソースの割り当てを決定する上で重要な役割を果たします。

### 容量を評価する{#assess-capacity}

クラスタが収容できるエンティティの数は、クラスタのCU容量に依存します。

以下の参照表は、ベクトルの寸法と総ベクトル数を考慮して、1つのperformance-optimizedCUと1つの容量最適化CUを持つクラスタの容量を示しています。データ量に必要なCUサイズの見積もりについては、[当社の計算機](https://zilliz.com/pricing#calculator)を使用してください。

<table>
   <tr>
     <th><p>ベクトルの寸法</p></th>
     <th><p>Performance-optimized(CUあたりの最大ベクトル数)</p></th>
     <th><p>容量最適化（CUあたりの最大ベクトル数）</p></th>
     <th><p>拡張容量（CUあたりの最大ベクトル数）</p></th>
   </tr>
   <tr>
     <td><p>128</p></td>
     <td><p>750万ドル</p></td>
     <td><p>2500万ドル</p></td>
     <td><p>1億ドル</p></td>
   </tr>
   <tr>
     <td><p>256</p></td>
     <td><p>450万ドル</p></td>
     <td><p>1500万ドル</p></td>
     <td><p>6,000万ドル</p></td>
   </tr>
   <tr>
     <td><p>512</p></td>
     <td><p>225万ドル</p></td>
     <td><p>750万ドル</p></td>
     <td><p>3000万ドル</p></td>
   </tr>
   <tr>
     <td><p>768</p></td>
     <td><p>150万ドル</p></td>
     <td><p>500万ドル</p></td>
     <td><p>2000万ドル</p></td>
   </tr>
   <tr>
     <td><p>1024</p></td>
     <td><p>1,125万円</p></td>
     <td><p>375万ドル</p></td>
     <td><p>1500万ドル</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>上記のメトリックは、主キーとベクトルのみを考慮したテストに基づいています。データセットに余分なスカラーフィールド（例: id、label、キーワード）がある場合、実際の容量はずれる可能性があります。正確な評価のために個人的なテストを実施することが賢明です。</p>

</Admonition>

### パフォーマンスを評価する{#evaluate-performance}

パフォーマンス指標、特にレイテンシと1秒あたりのクエリ数(QPS)は重要です。Performance-optimizedCUは、特に10から250までの標準的な`top-k`値において、レイテンシとスループットにおいて、容量最適化CUよりも明らかに優れています。

以下の表は、各CUタイプのQPSに関するテスト結果を示しています。

<table>
   <tr>
     <th><p>トップk</p></th>
     <th><p>QPS forPerformance-optimizedCU(76 8-dim 1 Mベクトル)</p></th>
     <th><p>容量最適化CUのQPS（76 8-dim 5 Mベクトル）</p></th>
   </tr>
   <tr>
     <td><p>10</p></td>
     <td><p>520</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>100</p></td>
     <td><p>440</p></td>
     <td><p>80</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>270</p></td>
     <td><p>60</p></td>
   </tr>
   <tr>
     <td><p>1000</p></td>
     <td><p>150</p></td>
     <td><p>40</p></td>
   </tr>
</table>

次の表は、各CUタイプのレイテンシに関するテスト結果を示しています。

<table>
   <tr>
     <th><p>トップk</p></th>
     <th><p>CUPerformance-optimized(76 8-dim 1 Mベクトル)の遅延</p></th>
     <th><p>容量最適化CU（76 8-dim 5 Mベクトル）のレイテンシ</p></th>
   </tr>
   <tr>
     <td><p>10</p></td>
     <td><p>&lt;10ミリ秒</p></td>
     <td><p>&lt;50ミリ秒</p></td>
   </tr>
   <tr>
     <td><p>100</p></td>
     <td><p>&lt;10ミリ秒</p></td>
     <td><p>&lt;50ミリ秒</p></td>
   </tr>
   <tr>
     <td><p>250</p></td>
     <td><p>&lt;10ミリ秒</p></td>
     <td><p>&lt;50ミリ秒</p></td>
   </tr>
   <tr>
     <td><p>1000</p></td>
     <td><p>10-20ミリ秒</p></td>
     <td><p>50-100ミリ秒</p></td>
   </tr>
</table>

## シナリオの内訳{#scenario-breakdown}

800万枚の画像ライブラリを持つ画像推薦アプリケーションを構築していると仮定します。ライブラリ内の各画像は768次元の埋め込みベクトルで表されます。目標は、1,000件の推薦リクエストのQPSを迅速に処理し、トップ100の画像推薦を30ミリ秒未満で提供することです。

この要件に適したCUを選択するには、次の手順に従います。

1. **レイテンシの評価**:Performance-optimizedCUは、30ミリ秒のレイテンシ要件を満たす唯一のタイプです。

1. **容量を評価**する: 1つのPerformance-optimizedCUには150万個の768次元ベクトルが格納できます。800万個のベクトルをすべて格納するには、少なくとも6つのCUが必要です。

1. **チェックスループット**:`top-k`を100に設定すると、Performance-optimizedCUはQPS 440を達成できます。一貫して1,000 QPSを維持するには、レプリカの数を3倍にする必要があります。

結論として、このシナリオでは、Performance-optimizedCUが最善の選択肢です。各レプリカが6つのCUで構成される3つのレプリカの構成は、完璧に役立つはずです。