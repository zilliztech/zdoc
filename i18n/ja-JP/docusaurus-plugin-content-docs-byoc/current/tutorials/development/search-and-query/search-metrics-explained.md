---
title: "Metric Types | BYOC"
slug: /search-metrics-explained
sidebar_label: "メトリックタイプ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "類似度メトリックは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類およびクラスタリングのパフォーマンスを大幅に向上させることができます。 | BYOC"
type: origin
token: EOxmwUDxMiy2cpkOfIsc1dYzn4c
sidebar_position: 22
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# メトリックタイプ

類似度メトリックは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類およびクラスタリングのパフォーマンスを大幅に向上させることができます。

現在、Zilliz Cloud は以下の種類の類似度メトリックをサポートしています: Euclidean distance（`L2`）、Inner Product（`IP`）、Cosine Similarity（`COSINE`）、`JACCARD`、`HAMMING`、および `BM25`（疎ベクトルに対する全文検索用に特別に設計されています）。

以下の表は、さまざまなフィールドタイプとそれに対応するメトリックタイプの対応関係をまとめたものです。

| Field Type | Dimension Range | Supported Metric Types | Default Metric Type |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `FLOAT16_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `BFLOAT16_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `INT8_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `SPARSE\_FLOAT\_VECTOR` | 次元を指定する必要はありません。 | `IP`, `BM25`（全文検索でのみ使用） | `IP` |
| `BINARY_VECTOR` | 8-32,768*8 | `HAMMING`, `JACCARD`, `MHJACCARD` | `HAMMING` |

<Admonition type="info" icon="📘" title="注">

- `SPARSE\_FLOAT\_VECTOR` タイプのベクトルフィールドでは、全文検索を実行する場合にのみ `BM25` メトリックタイプを使用してください。詳細については、[全文検索](./full-text-search) を参照してください。

- `BINARY_VECTOR` タイプのベクトルフィールドでは、次元値（`dim`）は 8 の倍数である必要があります。 

</Admonition>

以下の表は、サポートされているすべてのメトリックタイプの類似距離値の特性とその値の範囲をまとめたものです。

| Metric Type | Characteristics of the Similarity Distance Values | Similarity Distance Value Range |
| --- | --- | --- |
| `L2` | 値が小さいほど類似度が高いことを示します。 | [0, ∞) |
| `IP` | 値が大きいほど類似度が高いことを示します。 | [-1, 1] |
| `COSINE` | 値が大きいほど類似度が高いことを示します。 | [-1, 1] |
| `JACCARD` | 値が小さいほど類似度が高いことを示します。 | [0, 1] |
| `MHJACCARD` | MinHash シグネチャビットから Jaccard 類似度を推定します。距離が小さいほどより類似しています | [0, 1] |
| `HAMMING` | 値が小さいほど類似度が高いことを示します。 | [0, dim(vector)] |
| `BM25` | 項頻度、逆文書頻度、および文書正規化に基づいて関連性をスコア化します。 | [0, ∞) |

## Euclidean distance (L2)\{#euclidean-distance-l2}

本質的に、Euclidean distance は 2 点を結ぶ線分の長さを測定します。

Euclidean distance の式は以下のとおりです。

![C8gHbw8dSozNslx9wXbcyt2hnLe](https://zdoc-images.s3.us-west-2.amazonaws.com/c8ghbw8dsoznslx9wxbcyt2hnle.png "C8gHbw8dSozNslx9wXbcyt2hnLe")

ここで、**a = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** と **b = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** は、n 次元 Euclidean 空間内の 2 点です。

これは最も一般的に使用される距離メトリックであり、データが連続的である場合に非常に有用です。

<Admonition type="info" icon="📘" title="注">

Zilliz Cloud は、Euclidean distance が距離メトリックとして選択された場合、平方根を適用する前の値のみを計算します。

</Admonition>

## Inner product (IP)\{#inner-product-ip}

2 つの embedding 間の IP 距離は、次のように定義されます。

![Dqp4b8OP3oaQWgxZqoycL3ainwg](https://zdoc-images.s3.us-west-2.amazonaws.com/dqp4b8op3oaqwgxzqoycl3ainwg.png "Dqp4b8OP3oaQWgxZqoycL3ainwg")

IP は、正規化されていないデータを比較する必要がある場合や、大きさと角度の両方が重要な場合により有用です。

<Admonition type="info" icon="📘" title="注">

embedding 間の類似度を計算するために IP を使用する場合は、embedding を正規化する必要があります。正規化後、inner product は cosine similarity と等しくなります。

</Admonition>

X' が embedding X を正規化したものだとします。

![U23obWPTJoID9KxeGyjc1HAXn9d](https://zdoc-images.s3.us-west-2.amazonaws.com/u23obwptjoid9kxegyjc1haxn9d.png "U23obWPTJoID9KxeGyjc1HAXn9d")

2 つの embedding 間の相関は次のとおりです。

![SHDAb6UUgo7qR6xLXb5cv4bKnke](https://zdoc-images.s3.us-west-2.amazonaws.com/shdab6uugo7qr6xlxb5cv4bknke.png "SHDAb6UUgo7qR6xLXb5cv4bKnke")

## Cosine similarity\{#cosine-similarity}

Cosine similarity は、2 組のベクトル間の角度の cosine を使用して、それらがどの程度類似しているかを測定します。2 組のベクトルは、[0,0,...] のような同じ点から始まるが異なる方向を指す線分として考えることができます。

2 組のベクトル **A = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** と **B = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** の cosine similarity を計算するには、次の式を使用します。

![R1iNbuEDDoz8RdxtA4RcM706nMc](https://zdoc-images.s3.us-west-2.amazonaws.com/r1inbueddoz8rdxta4rcm706nmc.png "R1iNbuEDDoz8RdxtA4RcM706nMc")

cosine similarity は常に **[-1, 1]** の範囲にあります。たとえば、比例する 2 つのベクトルの cosine similarity は **1**、直交する 2 つのベクトルの類似度は **0**、反対方向の 2 つのベクトルの類似度は **-1** です。cosine が大きいほど、2 つのベクトル間の角度は小さくなり、これら 2 つのベクトルがより互いに類似していることを示します。

それらの cosine similarity を 1 から引くことで、2 つのベクトル間の cosine distance を得ることができます。

## JACCARD distance\{#jaccard-distance}

JACCARD distance coefficient は、2 つのサンプル集合間の類似性を測定し、定義された集合の共通部分の要素数を、それらの和集合の要素数で割ったものとして定義されます。これは有限サンプル集合にのみ適用できます。

![Sl4dbmQRVoIf1yx55mRcibZ3nAg](https://zdoc-images.s3.us-west-2.amazonaws.com/sl4dbmqrvoif1yx55mrcibz3nag.png "Sl4dbmQRVoIf1yx55mRcibZ3nAg")

JACCARD distance はデータ集合間の非類似性を測定し、JACCARD similarity coefficient を 1 から引くことで得られます。二値変数の場合、JACCARD distance は Tanimoto coefficient と同等です。

![Kj2kbpNmHoTUUixjDC1ccTntnnV](https://zdoc-images.s3.us-west-2.amazonaws.com/kj2kbpnmhotuuixjdc1cctntnnv.png "Kj2kbpNmHoTUUixjDC1ccTntnnV")

## MHJACCARD\{#mhjaccard}

**MinHash Jaccard**（`MHJACCARD`）は、文書の単語集合、ユーザーのタグ集合、またはゲノムの k-mer 集合のような大規模集合に対して、効率的な近似類似検索を行うためのメトリックタイプです。MHJACCARD は生の集合を直接比較する代わりに、**MinHash signatures** を比較します。これは Jaccard 類似度を効率的に推定するために設計されたコンパクトな表現です。

このアプローチは、正確な Jaccard 類似度を計算するよりも大幅に高速であり、大規模または高次元のシナリオで特に有用です。

**適用可能なベクトルタイプ**

- `BINARY_VECTOR`。各ベクトルは MinHash signature を格納します。各要素は、元の集合に適用された独立したハッシュ関数の 1 つにおける最小ハッシュ値に対応します。

**距離の定義**

MHJACCARD は、2 つの MinHash signature において一致する位置の数を測定します。一致率が高いほど、元の集合はより類似しています。

Zilliz Cloud は以下を報告します。

- **Distance = 1 - estimated similarity (match ratio)**

距離値の範囲は 0 から 1 です。

- **0** は、MinHash signature が同一であることを意味します（推定 Jaccard 類似度 = 1）

- **1** は、どの位置にも一致がないことを意味します（推定 Jaccard 類似度 = 0）

技術的な詳細については、[MINHASH_LSH](./minhash-lsh) を参照してください。

## HAMMING distance\{#hamming-distance}

HAMMING distance は二値データ文字列を測定します。同じ長さの 2 つの文字列間の距離は、ビットが異なるビット位置の数です。

たとえば、2 つの文字列 1101 1001 と 1001 1101 があるとします。

11011001 ⊕ 10011101 = 01000100。これには 1 が 2 つ含まれているため、HAMMING distance, d (11011001, 10011101) = 2 です。

## BM25 similarity\{#bm25-similarity}

BM25 は広く使用されているテキスト関連性測定手法であり、特に[全文検索](./full-text-search)向けに設計されています。これは次の 3 つの主要な要素を組み合わせています。

- **Term Frequency (TF):** 文書内に用語がどれくらい頻繁に出現するかを測定します。出現頻度が高いほど重要であることが多い一方で、BM25 は飽和パラメータ $k_1$ を使用して、過度に頻出する用語が関連性スコアを支配するのを防ぎます。

- **Inverse Document Frequency (IDF):** コーパス全体における用語の重要性を反映します。より少ない文書に出現する用語ほど高い IDF 値を受け取り、関連性への寄与が大きいことを示します。

- **Document Length Normalization:** 長い文書はより多くの用語を含むため、スコアが高くなる傾向があります。BM25 は文書長を正規化することでこのバイアスを軽減し、パラメータ $b$ がこの正規化の強さを制御します。

BM25 スコアは次のように計算されます。

$$
score(D, Q)=\sum_\{i=1\}^\{n\}IDF(q_i)\cdot \{\{TF(q_i,D)\cdot(k_1+1)\}\over\{TF(q_i, D)+k_1\cdot(1-b+b\cdot \{\{|D|\}\over\{avgdl\}\})\}\}
$$

パラメータの説明:

- $Q$: ユーザーが指定したクエリテキスト。

- $D$: 評価対象の文書。

- $TF(q_i, D)$: 項頻度であり、用語 $q_i$ が文書 $D$ にどの程度頻繁に出現するかを表します。

- $IDF(q_i)$: 逆文書頻度であり、次のように計算されます。

    $$
    IDF(q_i)=\log(\{N-n(q_i)+0.5\over n(q_i)+0.5\} + 1)
    $$

    ここで、$N$ はコーパス内の文書総数、$n(q_i)$ は用語 $q_i$ を含む文書数です。

- $|D|$: 文書 $D$ の長さ（用語の総数）。

- $avgdl$: コーパス内のすべての文書の平均長。

- $k_1$: スコアに対する項頻度の影響を制御します。値が大きいほど、項頻度の重要性が増します。一般的な範囲は [1.2, 2.0] ですが、Zilliz Cloud では [0, 3] の範囲が許可されています。

- $b$: 長さ正規化の度合いを制御し、0 から 1 の範囲を取ります。値が 0 の場合は正規化は適用されず、値が 1 の場合は完全な正規化が適用されます。

## Maximum similarity\{#maximum-similarity}

**maximum similarity** は **MAX_SIM** とも呼ばれ、通常の vector embedding ではなく vector embedding リスト間の類似度を測定します。主な考え方は、各文書をコンテキストチャンクまたはトークンに分割し、それぞれの vector embedding を作成して、文書ごとに embedding のリストとして格納することです。クエリを受信したときも同様にトークンに分割され、それに応じて embedding リストが生成されます。 

$$
score(Q, D) = \sum_\{i=1\}^m\max_\{j=1\}^ncos(e_\{q_i\}, e_\{d_j\})
$$

クエリと文書の間の距離または類似度スコアは、上記の式、すなわち maximum similarity（**MAX_SIM**）を使用して計算されます。式中の引数は以下のとおりです。

- $Q$: ユーザーが指定したクエリテキストで、$E_Q = [e_\{q_1\}, ..., e_\{q_m\} ]$ のような vector embedding リストに分割されています。

- $D$: 評価対象の文書で、$E_D = [e_\{d_1\}, ... e_\{d_n\}]$ のような vector embedding リストに分割されています。

- $e_\{q_i\}$: クエリ embedding リスト内の *i 番目*の vector embedding。

- $e_\{d_j\}$: 文書内の *j 番目*の vector embedding。

クエリと文書の類似度スコアを決定するために、各クエリトークンの vector embedding を文書内のものと比較して類似度スコアのリストを取得します。その後、すべてのスコアリストから最も高いスコアを合計して最終スコアを生成します。

![BqBlwM4OOh6hM9bmNwbc2xUUnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/BqBlwM4OOh6hM9bmNwbc2xUUnxc.png)

Zilliz Cloud では、**MAX_SIM** を使用して、struct 配列に格納された文書とクエリの間の類似度を測定できます。 

以下の表は、**MAX_SIM** シリーズで適用可能なメトリックタイプを示しています。

| Metric type | Description |
| --- | --- |
| MAX_SIM_L2 | 各クエリトークンと各文書トークンの間の距離を計算するために **L2** が使用され、複数のスコアリストが生成されます。一方、**MAX_SIM** はすべてのスコアリストにわたる最も高いスコアを合計して最終スコアを決定します。 |
| MAX_SIM_IP | 各クエリトークンと各文書トークンの間の距離を計算するために **IP** が使用され、複数のスコアリストが生成されます。一方、**MAX_SIM** はすべてのスコアリストから最も高いスコアを合計して最終スコアを決定します。 |
| MAX_SIM_COSINE | 各クエリトークンと各文書トークンの間の距離を計算するために **COSINE** が使用され、複数のスコアリストが生成されます。一方、**MAX_SIM** はすべてのスコアリストから最も高いスコアを合計して最終スコアを決定します。 |

