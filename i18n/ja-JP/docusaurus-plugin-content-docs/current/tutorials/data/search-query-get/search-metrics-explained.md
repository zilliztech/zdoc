---
title: "メトリックの種類 | Cloud"
slug: /search-metrics-explained
sidebar_label: "メトリックの種類"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "類似性メトリックは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類とクラスタリングのパフォーマンスが大幅に向上します。 | Cloud"
type: origin
token: HIoEw7DP7iikySkdkkIcToHUntc
sidebar_position: 16
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
  - vector search algorithms
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search

---

import Admonition from '@theme/Admonition';


# メトリックの種類

類似性メトリックは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類とクラスタリングのパフォーマンスが大幅に向上します。

現在、Zilliz Cloudは次の種類の類似性メトリックをサポートしています:ユークリッド距離(`L2`)、内積(`IP`)、コサイン類似性(`COSINE`)、`JACCARD`、`HAMMING`、および`BM25`(疎ベクトルの全文検索に特化して設計されています)。

以下の表は、異なるフィールドタイプとそれらに対応するメトリックタイプ間のマッピングをまとめたものです。

<table>
   <tr>
     <th><p>フィールドタイプ</p></th>
     <th><p>次元の範囲</p></th>
     <th><p>サポートされているメトリックタイプ</p></th>
     <th><p>デフォルトのメトリックタイプ</p></th>
   </tr>
   <tr>
     <td><p><code>フロートベクトル</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>コサイン</code>,<code>L 2</code>,<code>IP</code></p></td>
     <td><p><code>コサイン</code></p></td>
   </tr>
   <tr>
     <td><p><code>ベクターデータ</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>コサイン</code>,<code>L 2</code>,<code>IP</code></p></td>
     <td><p><code>コサイン</code></p></td>
   </tr>
   <tr>
     <td><p><code>その他のベクトル:</code></p></td>
     <td><p>2-32,768</p></td>
     <td><p><code>コサイン</code>,<code>L 2</code>,<code>IP</code></p></td>
     <td><p><code>コサイン</code></p></td>
   </tr>
   <tr>
     <td><p><code>SPARSE\_FLOAT\_ベクトル</code></p></td>
     <td><p>寸法を指定する必要はありません。</p></td>
     <td><p><code>IP</code>、<code>BM 25</code>（全文検索にのみ使用）</p></td>
     <td><p><code>IP</code></p></td>
   </tr>
   <tr>
     <td><p><code>バイナリベクトル</code></p></td>
     <td><p>8-32,768*8</p></td>
     <td><p><code>ハミング</code>、<code>ジャカード</code></p></td>
     <td><p><code>ハミング</code></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>ベクトル場の<code>SPARSE\_FLOAT\_VECTOR</code>型については、全文検索を行う場合にのみ<code>BM 25</code>メトリック型を使用してください。詳細については、「<a href="./full-text-search">フルテキスト検索</a>」を参照してください。</p></li>
<li><p>ベクトルフィールドの<code>BINARY_VECTOR</code>型の場合、ディメンション値(<code>dim</code>)は8の倍数でなければなりません。</p></li>
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
     <td><p><code>L 2</code></p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>&#91;0, ∞)</p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>値が大きいほど類似度が大きいことを示します。</p></td>
     <td><p>&#91;-1, 1&#93;</p></td>
   </tr>
   <tr>
     <td><p><code>コサイン</code></p></td>
     <td><p>値が大きいほど類似度が大きいことを示します。</p></td>
     <td><p>&#91;-1, 1&#93;</p></td>
   </tr>
   <tr>
     <td><p><code>ジャカード</code></p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>&#91;0, 1&#93;</p></td>
   </tr>
   <tr>
     <td><p><code>ハミング</code></p></td>
     <td><p>値が小さいほど類似度が高いことを示します。</p></td>
     <td><p>&#91;0, dim(ベクトル)&#93;</p></td>
   </tr>
   <tr>
     <td><p><code>BM 25</code></p></td>
     <td><p>用語頻度、転置文書頻度、および文書正規化に基づいて関連性をスコアリングします。</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
</table>

## ユークリッド距離（L2）{#euclidean-distance-l2}

基本的に、ユークリッド距離は2点を結ぶ線分の長さを測定します。

ユークリッド距離のレシピは以下の通りです。

![DJxsbpt4QoziATxRSj9c4OnpnZb](/img/DJxsbpt4QoziATxRSj9c4OnpnZb.png)

ここで**a=(a<sub>0</sub>, a<sub>1</sub>,.。。, a<sub>n-1</sub>)**と**b=(b<sub>0</sub>,b<sub>1</sub>,.。。, b<sub>n-1</sub>)**はn次元ユークリッド空間の2つの点です。

これは最も一般的に使用される距離メトリックであり、データが連続している場合に非常に役立ちます。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloudは、距離メトリックとしてユークリッド距離が選択された場合にのみ、平方根を適用する前に値を計算します。</p>

</Admonition>

## インナープロダクト（IP）{#inner-product-ip}

2つの埋め込み間のIP距離は以下のように定義されます:

![KH1BbkztLoGEYfxp0LucJl58nmb](/img/KH1BbkztLoGEYfxp0LucJl58nmb.png)

IPは、正規化されていないデータを比較する必要がある場合や、大きさや角度に関心がある場合により役立ちます。

<Admonition type="info" icon="📘" title="ノート">

<p>埋め込み間の類似度を計算するためにIPを使用する場合、埋め込みを正規化する必要があります。正規化後、内積は余弦類似度に等しくなります。</p>

</Admonition>

X'が埋め込みXから正規化されると仮定する:

![DORmbFSf9oQF5DxRxgKcKy32nzh](/img/DORmbFSf9oQF5DxRxgKcKy32nzh.png)

2つの埋め込みの相関関係は以下の通りです:

![JWDFbswIxoT5cJx35Ylcm81znLf](/img/JWDFbswIxoT5cJx35Ylcm81znLf.png)

## コサイン類似度{#cosine-similarity}

コサイン類似度は、2つのベクトルセット間の角度のコサインを使用して、それらがどの程度類似しているかを測定します。2つのベクトルセットは、&#91;0,0,...&#93;のように、同じ点から始まる線分と考えることができます。。。異なる方向を指しています。

2組のベクトル間のコサイン類似度を計算するには**A=(a<sub>0</sub>, a<sub>1</sub>,.。。, a<sub>n-1</sub>)**と**B=(b<sub>0</sub>,b<sub>1</sub>,.。。、b<sub>n-1</sub>)**、以下のレシピを使用してください:

![Yihlbb3hUo5zYzx2P05cw78CnMb](/img/Yihlbb3hUo5zYzx2P05cw78CnMb.png)

余弦類似度は常に区間**&#91;-1,1&#93;**にあります。例えば、2つの比例ベクトルの余弦類似度は**1**であり、2つの直交ベクトルの類似度は**0**であり、2つの反対ベクトルの類似度は**-1**です。余弦が大きいほど、2つのベクトル間の角度が小さくなり、これら2つのベクトルがより類似していることを示しています。

コサイン類似度を1から引くことで、2つのベクトル間のコサイン距離を求めることができます。

## ジャカード距離{#jaccard-distance}

JACC ARD類似係数は、2つのサンプルセット間の類似度を測定し、定義されたセットの交差の基数をそれらの和集合の基数で割ったものです。有限のサンプルセットにのみ適用できます。

![UDRGbUhIDoAN4gxiPLsceHqmnxh](/img/UDRGbUhIDoAN4gxiPLsceHqmnxh.png)

JACC ARD距離は、データセット間の相違度を測定し、JACC ARD類似係数を1から引くことによって得られます。バイナリ変数の場合、JACC ARD距離は谷本係数と同等です。

![ESaGbBw3IozhUwxD1O1c58Jbnke](/img/ESaGbBw3IozhUwxD1O1c58Jbnke.png)

## ハミング距離{#hamming-distance}

HAMMING距離はバイナリデータ文字列を測定します。等しい長さの2つの文字列間の距離は、ビットが異なるビット位置の数です。

例えば、2つの文字列、1101 1001と1001 1101があるとします。

11011001は1001 1 101=0 10001 00です。これには2つの1が含まれているため、HAMMING距離d(1101100 1、1001 1 101)=2です。

## BM25の類似性{#bm25-similarity}

BM 25は、[全文検索](./full-text-search)用に特別に設計された、広く使用されているテキスト関連性測定方法です。以下の3つの重要な要素を組み合わせています:

- **用語頻度(TF):**文書内で用語が出現する頻度を測定します。頻度が高いほど重要性が高いことが多いですが、BM 25は飽和パラメータを使用$k_1$して、過度に頻繁な用語が関連性スコアを支配するのを防止します。

- **逆文書頻度(IDF):**用語の重要性をコーパス全体に反映します。少ない文書に出現する用語は、より高いIDF値を受け取り、関連性への貢献が大きいことを示します。

- **文書長の正規化:**長い文書は、より多くの用語を含むため、スコアが高くなる傾向があります。BM 25は、文書長を正規化することでこのバイアスを軽減し、パラメータ$b$がこの正規化の強度を制御します。

BM 25のスコアは以下のように計算されます:

$$
score(D, Q)=\sum_{i=1}^{n}IDF(q_i)\cdot {{TF(q_i,D)\cdot(k_1+1)}\over{TF(q_i, D)+k_1\cdot(1-b+b\cdot {{|D|}\over{avgdl}&#125;)&#125;&#125;
$$

パラメータの説明:

- $Q$:ユーザーが提供したクエリテキスト。

- $D$:評価中のドキュメント。

- $TF(q_i, D)$用語の出現頻度:用語が$q_i$文書に現れ$D$る頻度を表します。

- $IDF(q_i)$:逆ドキュメント頻度、次のように計算:

    $$
    IDF(q_i)=\log({N-n(q_i)+0.5\over n(q_i)+0.5} + 1)
    $$

    コーパス$N$内の文書の総数はどこにありますか、そして$n(q_i)$用語を含む文書の数$q_i$はどこにありますか。

- $|D|$:ドキュメントの長さ$D$(用語の総数)。

- $avgdl$:コーパス内の全ドキュメントの平均長。

- $k_1$スコアに対する用語頻度の影響を制御します。値が高いほど、用語頻度の重要性が高まります。典型的な範囲は&#91;1.2、2.0&#93;であり、Zilliz Cloudは&#91;0、3&#93;の範囲を許容します。

- $b$長さの正規化の程度を0から1の範囲で制御します。値が0の場合、正規化は適用されません。値が1の場合、完全な正規化が適用されます。

