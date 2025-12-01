---
title: "メトリックタイプ | Cloud"
slug: /search-metrics-explained
sidebar_label: "メトリックタイプ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "類似度メトリックはベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類およびクラスタリングのパフォーマンスを大幅に改善できます。 | Cloud"
type: origin
token: EOxmwUDxMiy2cpkOfIsc1dYzn4c
sidebar_position: 18
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - search metrics
  - metric types
  - L2
  - IP
  - COSINE
  - Jaccard
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database

---

import Admonition from '@theme/Admonition';


# メトリックタイプ

類似度メトリックはベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類およびクラスタリングのパフォーマンスを大幅に改善できます。

現在、Zilliz Cloudはこれらの類似性メトリックタイプをサポートしています：ユークリッド距離（`L2`）、内積（`IP`）、コサイン類似度（`COSINE`）、`JACCARD`、`HAMMING`、および`BM25`（スパースベクトルの全文検索に特化して設計されています）。

以下は、異なるフィールドタイプとそれに対応するメトリックタイプとのマッピングをまとめた表です。

<table>
   <tr>
     <th><p>フィールドタイプ</p></th>
     <th><p>次元範囲</p></th>
     <th><p>サポートされているメトリックタイプ</p></th>
     <th><p>デフォルトのメトリックタイプ</p></th>
   </tr>
   <tr>
     <td><p><code>FLOAT_VECTOR</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>, <code>IP</code></p></td>
     <td><p><code>COSINE</code></p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT16_VECTOR</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>, <code>IP</code></p></td>
     <td><p><code>COSINE</code></p></td>
   </tr>
   <tr>
     <td><p><code>BFLOAT16_VECTOR</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>, <code>IP</code></p></td>
     <td><p><code>COSINE</code></p></td>
   </tr>
   <tr>
     <td><p><code>INT8_VECTOR</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>, <code>IP</code></p></td>
     <td><p><code>COSINE</code></p></td>
   </tr>
   <tr>
     <td><p><code>SPARSE\_FLOAT\_VECTOR</code></p></td>
     <td><p>次元を指定する必要はありません。</p></td>
     <td><p><code>IP</code>, <code>BM25</code> (全文検索でのみ使用されます)</p></td>
     <td><p><code>IP</code></p></td>
   </tr>
   <tr>
     <td><p><code>BINARY_VECTOR</code></p></td>
     <td><p>8-32,768*8</p></td>
     <td><p><code>HAMMING</code>, <code>JACCARD</code>, <code>MHJACCARD</code></p></td>
     <td><p><code>HAMMING</code></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p><code>SPARSE\_FLOAT\_VECTOR</code>型のベクトルフィールドについては、全文検索を実行する場合にのみ<code>BM25</code>メトリックタイプを使用します。詳細については、<a href="./full-text-search">全文検索</a>を参照してください。</p></li>
<li><p><code>BINARY_VECTOR</code>型のベクトルフィールドについては、次元値（<code>dim</code>）は8の倍数でなければなりません。</p></li>
</ul>

</Admonition>

以下は、サポートされているすべてのメトリックタイプの類似性距離値の特性とその値の範囲をまとめた表です。

<table>
   <tr>
     <th><p>メトリックタイプ</p></th>
     <th><p>類似性距離値の特性</p></th>
     <th><p>類似性距離値の範囲</p></th>
   </tr>
   <tr>
     <td><p><code>L2</code></p></td>
     <td><p>値が小さいほど類似性が高い。</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>値が大きいほど類似性が高い。</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>COSINE</code></p></td>
     <td><p>値が大きいほど類似性が高い。</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>JACCARD</code></p></td>
     <td><p>値が小さいほど類似性が高い。</p></td>
     <td><p>[0, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>MHJACCARD</code></p></td>
     <td><p>MinHash署名ビットからのJaccard類似度の推定値。距離が小さいほど類似度が高い</p></td>
     <td><p>[0, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>HAMMING</code></p></td>
     <td><p>値が小さいほど類似性が高い。</p></td>
     <td><p>[0, dim(vector)]</p></td>
   </tr>
   <tr>
     <td><p><code>BM25</code></p></td>
     <td><p>用語頻度、逆文書頻度、および文書正規化に基づいて関連性を評価します。</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
</table>

## ユークリッド距離（L2）\{#euclidean-distance-l2}

本質的に、ユークリッド距離は2点をつなぐセグメントの長さを測定します。

ユークリッド距離の公式は以下の通りです。

![C8gHbw8dSozNslx9wXbcyt2hnLe](/img/C8gHbw8dSozNslx9wXbcyt2hnLe.png)

ここで、**a = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** および **b = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** は、n次元ユークリッド空間における2つの点です。

これは最も一般的に使用される距離メトリックであり、データが連続している場合に非常に有用です。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudではユークリッド距離が距離メトリックとして選択された場合、ルートを適用する前の値のみを計算します。</p>

</Admonition>

## 内積（IP）\{#inner-product-ip}

2つの埋め込み間のIP距離は次のように定義されます。

![Dqp4b8OP3oaQWgxZqoycL3ainwg](/img/Dqp4b8OP3oaQWgxZqoycL3ainwg.png)

IPは、正規化されていないデータを比較する必要がある場合や、大きさと角度を重視する場合に特に有用です。

<Admonition type="info" icon="📘" title="ノート">

<p>埋め込み間の類似性を計算するためにIPを使用する場合、埋め込みを正規化する必要があります。正規化後、内積はコサイン類似度と等しくなります。</p>

</Admonition>

X'が埋め込みXから正規化されたと仮定します。

![U23obWPTJoID9KxeGyjc1HAXn9d](/img/U23obWPTJoID9KxeGyjc1HAXn9d.png)

2つの埋め込み間の相関は次のとおりです。

![SHDAb6UUgo7qR6xLXb5cv4bKnke](/img/SHDAb6UUgo7qR6xLXb5cv4bKnke.png)

## コサイン類似度\{#cosine-similarity}

コサイン類似度は、2つのベクトル集合の角度のコサインを使用して、それらがどれほど似ているかを測定します。2つのベクトル集合を同じ点、たとえば[0,0,...]から始まり、異なる方向を向いている線分と考えることができます。

2つのベクトル集合 **A = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** および **B = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** の間のコサイン類似度を計算するには、次の公式を使用します。

![R1iNbuEDDoz8RdxtA4RcM706nMc](/img/R1iNbuEDDoz8RdxtA4RcM706nMc.png)

コサイン類似度は常に区間 **[-1, 1]** に含まれます。たとえば、2つの比例するベクトルはコサイン類似度が **1** になり、2つの直交するベクトルは類似度が **0** になり、2つの反対方向のベクトルは類似度が **-1** になります。コサインが大きいほど、2つのベクトル間の角度が小さくなり、これらの2つのベクトルが互いに類似していることを示します。

コサイン類似度を1から引くことで、2つのベクトル間のコサイン距離を得ることができます。

## JACCARD距離\{#jaccard-distance}

JACCARD距離係数は2つの標本集合間の類似性を測定し、定義された集合の交差の濃度をそれらの和集合の濃度で割って定義されます。有限標本集合にのみ適用できます。

![Sl4dbmQRVoIf1yx55mRcibZ3nAg](/img/Sl4dbmQRVoIf1yx55mRcibZ3nAg.png)

JACCARD距離はデータセット間の不類似性を測定し、JACCARD類似係数を1から引いて得られます。2値変数については、JACCARD距離はTanimoto係数と同等です。

![Kj2kbpNmHoTUUixjDC1ccTntnnV](/img/Kj2kbpNmHoTUUixjDC1ccTntnnV.png)

## MHJACCARD\{#mhjaccard}

**MinHash Jaccard**（`MHJACCARD`）は、文書語集合、ユーザータグ集合、またはゲノムk-mer集合などの大規模集合上で効率的かつ近似的な類似度検索を行うためのメトリックタイプです。MHJACCARDは生の集合を直接比較する代わりに、**MinHash署名**を比較します。これはJaccard類似度を効率的に推定するように設計されたコンパクトな表現です。

このアプローチは、正確なJaccard類似度を計算するよりはるかに高速であり、特に大規模または高次元のシナリオに有用です。

**適用可能なベクトルタイプ**

- `BINARY_VECTOR`。各ベクトルはMinHash署名を格納します。各要素は、元の集合に適用された独立したハッシュ関数の1つに対する最小ハッシュ値に対応します。

**距離定義**

MHJACCARDは、2つのMinHash署名で一致する位置の数を測定します。一致率が高いほど、基になる集合がより類似していることを示します。

Milvusでは以下を報告します。

- **距離 = 1 - 推定類似度（一致率）**

距離値の範囲は0〜1です。

- **0** はMinHash署名が同一であることを意味します（推定Jaccard類似度 = 1）

- **1** はどの位置でも一致しないことを意味します（推定Jaccard類似度 = 0）

技術的な詳細については、[MINHASH_LSH](./minhash-lsh)を参照してください。

## ハミング距離\{#hamming-distance}

ハミング距離はバイナリデータ文字列を測定します。等しい長さの2つの文字列間の距離は、ビットが異なる位置の数です。

たとえば、1101 1001 と 1001 1101 という2つの文字列があるとします。

11011001 ⊕ 10011101 = 01000100。これには2つの1が含まれているため、ハミング距離 d (11011001, 10011101) = 2 です。

## BM25類似度\{#bm25-similarity}

BM25は広く使用されているテキスト関連性測定方法であり、特に[全文検索](./full-text-search)用に設計されています。これには以下の3つの主要な要素が組み込まれています。

- **用語頻度（TF）：** 文書内で用語がどれだけ頻繁に出現するかを測定します。出現頻度が高いほど重要であることが多いですが、BM25は飽和パラメータ$k_1$を使用して、過度に頻繁な用語が関連性スコアを支配するのを防ぎます。

- **逆文書頻度（IDF）：** 用語が全体のコーパス全体にどれだけ重要かを反映します。少数の文書に出現する用語は高いIDF値を受け取り、関連性へのより大きな貢献を示します。

- **文書長正規化：** 長い文書は多くの用語を含むため、スコアが高くなりやすいです。BM25はこのバイアスを、パラメータ$b$でこの正規化の強度を制御することにより緩和します。

BM25のスコアリングは以下のように計算されます。

$$
score(D, Q)=\sum_{i=1}^{n}IDF(q_i)\cdot \{\{TF(q_i,D)\cdot(k_1+1)}\over\{TF(q_i, D)+k_1\cdot(1-b+b\cdot \{\{|D|}\over{avgdl}})}}
$$

パラメータ説明：

- $Q$：ユーザーが提供するクエリテキスト。

- $D$：評価中の文書。

- $TF(q_i, D)$：用語頻度。文書$D$中に用語$q_i$が出現する頻度を表します。

- $IDF(q_i)$：逆文書頻度。次のように計算されます。

    $$
    IDF(q_i)=\log(\{N-n(q_i)+0.5\over n(q_i)+0.5} + 1)
    $$

    ここで、$N$はコーパス中の文書の総数、$n(q_i)$は用語$q_i$を含む文書の数です。

- $|D|$：文書$D$の長さ（用語の総数）。

- $avgdl$：コーパス中すべての文書の平均長。

- $k_1$：スコアに対する用語頻度の影響を制御します。値が大きいほど用語頻度の重要性が高まります。通常の範囲は[1.2, 2.0]ですが、Zilliz Cloudでは[0, 3]の範囲を許可します。

- $b$：長さの正規化の程度を制御します。0〜1の範囲です。値が0の場合、正規化は適用されません。値が1の場合、完全な正規化が適用されます。