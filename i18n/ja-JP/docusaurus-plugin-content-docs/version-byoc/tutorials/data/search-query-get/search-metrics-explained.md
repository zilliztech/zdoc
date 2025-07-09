---
title: "メトリックの種類 | BYOC"
slug: /search-metrics-explained
sidebar_label: "メトリックの種類"
beta: FALSE
notebook: FALSE
description: "類似性メトリックは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類とクラスタリングのパフォーマンスが大幅に向上します。 | BYOC"
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
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms

---

import Admonition from '@theme/Admonition';


# メトリックの種類

類似性メトリックは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類とクラスタリングのパフォーマンスが大幅に向上します。

現在、Zillizクラウドユークリッド距離(`L2`)、内積(`IP`)、コサイン類似度(`COSINE`)、`JACCARD`、`HAMMING`、および`BM25`(疎ベクトルの全文検索用に特別に設計されています)。

以下の表は、異なるフィールドタイプとそれらに対応するメトリックタイプ間のマッピングをまとめたものです。

<table>
   <tr>
     <th><p>フィールドタイプ</p></th>
     <th><p>次元の範囲</p></th>
     <th><p>サポートされているメトリックタイプ</p></th>
     <th><p>デフォルトのメトリックタイプ</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>,<code>IP</code>,インラインコードプレースホルダー</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>,<code>IP</code>,インラインコードプレースホルダー</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>COSINE</code>, <code>L2</code>,<code>IP</code>,インラインコードプレースホルダー</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>寸法を指定する必要はありません。</p></td>
     <td><p><code>IP</code>、<code>BM25</code>(全文検索にのみ使用されます)</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>8-32,768*8</p></td>
     <td><p><code>HAMMING</code>,インラインコード_PLACEHOLDER_1,</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p><code>SPARSE\_FLOAT\_VECTOR</code>型のベクトルフィールドについては、全文検索を行う場合にのみ<code>BM25</code>メトリック型を使用してください。詳細については、<a href="./full-text-search">フルテキスト検索</a>を参照してください。</p></li>
<li><p><code>BINARY_VECTOR</code>型のベクトルフィールドの場合、次元値(<code>dim</code>)は8の倍数でなければなりません。 </p></li>
</ul>

</Admonition>

以下の表は、サポートされているすべてのメトリックタイプの類似距離値の特性とその値の範囲をまとめたものです。

<table>
   <tr>
     <th><p>メートルタイプ</p></th>
     <th><p>類似距離の値の特徴</p></th>
     <th><p>類似距離の値の範囲</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>値が大きいほど類似度が大きいことを示します。</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>値が大きいほど類似度が大きいことを示します。</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>[0, 1]</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>[0, dim(ベクトル)]</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>用語頻度、転置文書頻度、および文書正規化に基づいて関連性をスコアリングします。</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
</table>

## ユークリッド距離(L 2){#euclidean-distance-l2}

基本的に、ユークリッド距離は2点を結ぶ線分の長さを測定します。

ユークリッド距離のレシピは以下の通りです。

![C8gHbw8dSozNslx9wXbcyt2hnLe](/img/C8gHbw8dSozNslx9wXbcyt2hnLe.png)

ここで**a=(a<sub>0</sub>、A<sub>1</sub>、、、。。、A<sub>n-1</sub>)**と**b=(b<sub>0</sub>, b<sub>1</sub>、、、。。, b<sub>n-1</sub>n次元ユークリッド空間内の2つの点です。

これは最も一般的に使用される距離メトリックであり、データが連続している場合に非常に役立ちます。

<Admonition type="info" icon="📘" title="ノート">

<p>Zillizクラウドユークリッド距離が距離メトリックとして選択された場合にのみ、平方根を適用する前に値を計算します。</p>

</Admonition>

## インナープロダクト（IP）{#inner-product-ip}

2つの埋め込み間のIP距離は以下のように定義されます:

![Dqp4b8OP3oaQWgxZqoycL3ainwg](/img/Dqp4b8OP3oaQWgxZqoycL3ainwg.png)

IPは、正規化されていないデータを比較する必要がある場合や、大きさや角度に関心がある場合により役立ちます。

<Admonition type="info" icon="📘" title="ノート">

<p>埋め込み間の類似度を計算するためにIPを使用する場合、埋め込みを正規化する必要があります。正規化後、内積は余弦類似度に等しくなります。</p>

</Admonition>

X'がXの埋め込みから正規化されると仮定する:

![U23obWPTJoID9KxeGyjc1HAXn9d](/img/U23obWPTJoID9KxeGyjc1HAXn9d.png)

2つの埋め込みの相関関係は以下の通りです:

![SHDAb6UUgo7qR6xLXb5cv4bKnke](/img/SHDAb6UUgo7qR6xLXb5cv4bKnke.png)

## コサイン類似度{#cosine-similarity}

コサイン類似度は、2つのベクトルセット間の角度のコサインを使用して、それらがどの程度類似しているかを測定します。2つのベクトルセットは、[0,0,...]のように、同じ点から始まる線分と考えることができます。。。異なる方向を指しています。

2つのベクトルセット間の余弦類似度を計算するには**A=(a<sub>0</sub>、A<sub>1</sub>、、、。。、A<sub>n-1</sub>)**と**B=(b<sub>0</sub>, b<sub>1</sub>、、、。。, b<sub>n-1</sub>以下のレシピを使用してください:

![R1iNbuEDDoz8RdxtA4RcM706nMc](/img/R1iNbuEDDoz8RdxtA4RcM706nMc.png)

余弦類似度は常に区間**[-1,1]**にあります。例えば、2つの比例ベクトルの余弦類似度は**1**であり、2つの直交ベクトルの類似度は**0**であり、2つの反対ベクトルの類似度は**-1**です。余弦が大きいほど、2つのベクトル間の角度が小さくなり、これら2つのベクトルがより類似していることを示しています。

コサイン類似度を1から引くことで、2つのベクトル間のコサイン距離を求めることができます。

## ジャカード距離{#jaccard-distance}

JACC ARD距離係数は、2つのサンプルセット間の類似性を測定し、定義されたセットの交差の基数をそれらの和集合の基数で割ったものです。有限のサンプルセットにのみ適用できます。

![Sl4dbmQRVoIf1yx55mRcibZ3nAg](/img/Sl4dbmQRVoIf1yx55mRcibZ3nAg.png)

JACC ARD距離は、データセット間の相違度を測定し、JACC ARD類似係数を1から引くことによって得られます。バイナリ変数の場合、JACC ARD距離は谷本係数と同等です。

![Kj2kbpNmHoTUUixjDC1ccTntnnV](/img/Kj2kbpNmHoTUUixjDC1ccTntnnV.png)

## MHJACCARD{#mhjaccard}

MinHash Jaccard(`MHJACCARD`)は、事前に計算された[ミンハッシュ](https://en.wikipedia.org/wiki/MinHash)シグネチャを利用して、大きなセット(ドキュメントワードセット、ユーザータグセット、ゲノムk-merセットなど)に対する高速で近似的なJaccardベースの類似検索を測定します。

**適用可能なベクトルタイプ**

- `BINARY_VECTOR`は、MinHashシグネチャを格納します(各エントリは、$k$の独立したハッシュ関数のいずれかからの最小ハッシュ値です)。

**の定義**

長さ$k$の2つのMinHashシグネチャベクトルが与えられた場合:

- $\mathbf{s}_A=[\,\min_{x\in A}h_1(x),\,\min_{x\in A}h_2(x),\dots,\min_{x\in A}h_k(x)\,]$,

- $$
\mathbf{s}_B=[\,\min_{x\in B}h_1(x),\,\min_{x\in B}h_2(x),\dots,\min_{x\in B}h_k(x)\,]
$$

推定されたジャッカード類似度は

$$
\hat J(A, B)\;=\;\frac{1}{k}\,\bigl|\{\,i:s_{A,i}=s_{B,i}\}\bigr|ここでは、\frac{1}{k}\,\bigl|\{\,i:s_{A,i}=s_{B,i}\}\bigr|となります。
$$

Milvusは**距離**=1-$\hat J(A, B)$を報告しています。

**値の範囲**

- $[0,1]$での距離(0=同一のMinHash署名→推定Jaccard=1; 1=署名が一致しない→推定Jaccard=0)。

**パフォーマンス**

- 比較コスト:ベクトルペアごとに$O(k)$(元の集合体格に依存しない)。

- 署名長$k$はインデックス時に固定され、ストレージ/コンピューティングと推定精度のトレードオフが行われます。

詳細については、MINHASH_LSHを参照してください。

</include>

## ハミング距離{#hamming-distance}

HAMMING距離はバイナリデータ文字列を測定します。等しい長さの2つの文字列間の距離は、ビットが異なるビット位置の数です。

例えば、2つの文字列、1101 1001と1001 1101があるとします。

11011001は1001 1 101=0 10001 00です。これには2つの1が含まれているため、HAMMING距離d(1101100 1、1001 1 101)=2です。

## BM 25の類似性{#bm25-similarity}

BM 25は、[全文検索](./full-text-search)用に特別に設計された、広く使用されているテキスト関連性測定方法です。以下の3つの重要な要素を組み合わせています:

- 用語頻度(TF):文書内で用語がどの程度頻繁に出現するかを測定します。頻度が高いほど重要性が高いことが多いですが、BM 25は飽和パラメータ$k_1$を使用して、過度に頻繁に出現する用語が関連性スコアを支配するのを防止します。

- 逆文書頻度(IDF):用語の重要性をコーパス全体に反映します。少ない文書に出現する用語は、より高いIDF値を受け取り、関連性への貢献度が高いことを示します。

- 文書の長さの正規化:長い文書は、より多くの用語を含むため、スコアが高くなる傾向があります。BM 25は、パラメータ$b$がこの正規化の強度を制御することで、文書の長さを正規化することで、このバイアスを軽減します。

BM 25のスコアは以下のように計算されます:

$$
score(D, Q)=\sum_{i=1}^{n}IDF(q_i)\cdot{{TF(q_i,D)\cdot(k_1+1)}\over{TF(q_i,D)+k_1\cdot(1-b+b\cdot{{|D|}\over{avgdl}})}}
$$

パラメータの説明:

- $Q$:ユーザーが提供したクエリテキスト。

- $D$:評価されているドキュメント。

- $TF(q_i, D)$:用語の出現頻度を表し、$q_i$が文書$D$に出現する頻度を表します。

- $IDF(q_i)$:ドキュメントの逆頻度を計算します。

    $$
    IDF(q_i)=\log({n-n(q_i)+0.5\over n(q_i)+0.5}+1)となります。
    $$

    $N$はコーパス内の文書の総数であり、$n(q_i)$は用語$q_i$を含む文書の数です。

- $|D|$:文書$D$の長さ(用語の総数)。

- $avgdl$:コーパス内のすべての文書の平均長。

- $k_1$:用語の頻度がスコアに与える影響を制御します。値が大きいほど用語の頻度の重要度が高くなります。典型的な範囲は[1.2,2.0]です。Zillizクラウド[0,3]の範囲を許可します。

- $b$:長さの正規化の度合いを0から1の範囲で制御します。値が0の場合、正規化は適用されません。値が1の場合、完全な正規化が適用されます。

