---
title: "メトリックタイプ | Cloud"
slug: /search-metrics-explained
sidebar_label: "メトリックタイプ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "類似度メトリックは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類およびクラスタリングの性能を大幅に向上できます。 | Cloud"
type: origin
token: EOxmwUDxMiy2cpkOfIsc1dYzn4c
sidebar_position: 23
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# メトリックタイプ

類似度メトリックは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類およびクラスタリングの性能を大幅に向上できます。

現在、Zilliz Cloud は以下の種類の類似度メトリックをサポートしています：Euclidean distance (`L2`)、Inner Product (`IP`)、Cosine Similarity (`COSINE`)、`JACCARD`、`HAMMING`、および `BM25`（疎ベクトルに対する全文検索用に特別に設計されています）。

以下の表は、異なるフィールドタイプと対応するメトリックタイプの対応関係をまとめたものです。

| Field Type | Dimension Range | Supported Metric Types | Default Metric Type |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `FLOAT16_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `BFLOAT16_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `INT8_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `SPARSE\_FLOAT\_VECTOR` | 次元を指定する必要はありません。 | `IP`, `BM25`（全文検索でのみ使用） | `IP` |
| `BINARY_VECTOR` | 8-32,768*8 | `HAMMING`, `JACCARD`, `MHJACCARD` | `HAMMING` |

<Admonition type="info" icon="📘" title="Notes">

- `SPARSE\_FLOAT\_VECTOR` 型のベクトルフィールドでは、全文検索を実行する場合にのみ `BM25` メトリックタイプを使用してください。詳細は [Full Text Search](./full-text-search) を参照してください。

- `BINARY_VECTOR` 型のベクトルフィールドでは、次元値 (`dim`) は 8 の倍数でなければなりません。 

</Admonition>

以下の表は、サポートされているすべてのメトリックタイプの類似距離値の特性とその値域をまとめたものです。

| Metric Type | Characteristics of the Similarity Distance Values | Similarity Distance Value Range |
| --- | --- | --- |
| `L2` | 値が小さいほど、類似度が高いことを示します。 | [0, ∞) |
| `IP` | 値が大きいほど、類似度が高いことを示します。 | [-1, 1] |
| `COSINE` | 値が大きいほど、類似度が高いことを示します。 | [-1, 1] |
| `JACCARD` | 値が小さいほど、類似度が高いことを示します。 | [0, 1] |
| `MHJACCARD` | MinHash シグネチャビットから Jaccard 類似度を推定します。距離が小さいほど、より類似しています | [0, 1] |
| `HAMMING` | 値が小さいほど、類似度が高いことを示します。 | [0, dim(vector)] |
| `BM25` | 項頻度、逆文書頻度、および文書正規化に基づいて関連性をスコア化します。 | [0, ∞) |

## Euclidean distance (L2)\{#euclidean-distance-l2}

本質的に、Euclidean distance は 2 点を結ぶ線分の長さを測定します。

Euclidean distance の式は次のとおりです。

![C8gHbw8dSozNslx9wXbcyt2hnLe](https://zdoc-images.s3.us-west-2.amazonaws.com/c8ghbw8dsoznslx9wxbcyt2hnle.png "C8gHbw8dSozNslx9wXbcyt2hnLe")

ここで、**a = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** と **b = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** は n 次元 Euclidean 空間内の 2 点です。

これは最も一般的に使用される距離メトリックであり、データが連続値である場合に非常に有用です。

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud は、Euclidean distance が距離メトリックとして選択された場合、平方根を適用する前の値のみを計算します。

</Admonition>

## Inner product (IP)\{#inner-product-ip}

2 つの埋め込み間の IP 距離は、次のように定義されます。

![Dqp4b8OP3oaQWgxZqoycL3ainwg](https://zdoc-images.s3.us-west-2.amazonaws.com/dqp4b8op3oaqwgxzqoycl3ainwg.png "Dqp4b8OP3oaQWgxZqoycL3ainwg")

IP は、正規化されていないデータを比較する必要がある場合や、大きさと角度の両方が重要な場合により有用です。

<Admonition type="info" icon="📘" title="Notes">

埋め込み間の類似度を計算するために IP を使用する場合は、埋め込みを正規化する必要があります。正規化後、inner product は cosine similarity と等しくなります。

</Admonition>

X' が埋め込み X を正規化したものだとすると：

![U23obWPTJoID9KxeGyjc1HAXn9d](https://zdoc-images.s3.us-west-2.amazonaws.com/u23obwptjoid9kxegyjc1haxn9d.png "U23obWPTJoID9KxeGyjc1HAXn9d")

2 つの埋め込み間の相関は次のようになります。

![SHDAb6UUgo7qR6xLXb5cv4bKnke](https://zdoc-images.s3.us-west-2.amazonaws.com/shdab6uugo7qr6xlxb5cv4bknke.png "SHDAb6UUgo7qR6xLXb5cv4bKnke")

## Cosine similarity\{#cosine-similarity}

Cosine similarity は、2 つのベクトル集合のなす角の cosine を使用して、それらがどれだけ類似しているかを測定します。2 つのベクトル集合は、[0,0,...] のような同じ点から始まるが、異なる方向を向いている線分として考えることができます。

2 つのベクトル集合 **A = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** と **B = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** の cosine similarity を計算するには、次の式を使用します。

![R1iNbuEDDoz8RdxtA4RcM706nMc](https://zdoc-images.s3.us-west-2.amazonaws.com/r1inbueddoz8rdxta4rcm706nmc.png "R1iNbuEDDoz8RdxtA4RcM706nMc")

cosine similarity は常に **[-1, 1]** の範囲にあります。たとえば、比例する 2 つのベクトルの cosine similarity は **1**、直交する 2 つのベクトルの類似度は **0**、反対向きの 2 つのベクトルの類似度は **-1** です。cosine が大きいほど、2 つのベクトル間の角度は小さくなり、これら 2 つのベクトルがより類似していることを示します。

cosine similarity を 1 から引くことで、2 つのベクトル間の cosine distance を得ることができます。

## JACCARD distance\{#jaccard-distance}

JACCARD distance coefficient は 2 つのサンプル集合間の類似性を測定し、定義された集合の共通部分の要素数を、それらの和集合の要素数で割ったものとして定義されます。これは有限のサンプル集合にのみ適用できます。

![Sl4dbmQRVoIf1yx55mRcibZ3nAg](https://zdoc-images.s3.us-west-2.amazonaws.com/sl4dbmqrvoif1yx55mrcibz3nag.png "Sl4dbmQRVoIf1yx55mRcibZ3nAg")

JACCARD distance はデータ集合間の非類似性を測定し、JACCARD similarity coefficient を 1 から引くことで得られます。二値変数の場合、JACCARD distance は Tanimoto coefficient と等価です。

![Kj2kbpNmHoTUUixjDC1ccTntnnV](https://zdoc-images.s3.us-west-2.amazonaws.com/kj2kbpnmhotuuixjdc1cctntnnv.png "Kj2kbpNmHoTUUixjDC1ccTntnnV")

## MHJACCARD\{#mhjaccard}

**MinHash Jaccard** (`MHJACCARD`) は、文書の単語集合、ユーザーのタグ集合、ゲノムの k-mer 集合などの大規模な集合に対して、効率的な近似類似検索を行うためのメトリックタイプです。MHJACCARD は生の集合を直接比較する代わりに、**MinHash signatures** を比較します。これは Jaccard 類似度を効率的に推定するために設計されたコンパクトな表現です。

このアプローチは、正確な Jaccard 類似度を計算するよりも大幅に高速であり、特に大規模または高次元のシナリオで有用です。

**適用可能なベクトルタイプ**

- `BINARY_VECTOR`。各ベクトルは MinHash signature を格納します。各要素は、元の集合に適用された独立なハッシュ関数の 1 つにおける最小ハッシュ値に対応します。

**距離の定義**

MHJACCARD は、2 つの MinHash signatures で一致する位置の数を測定します。一致率が高いほど、元の集合はより類似しています。

Zilliz Cloud は以下を返します：

- **Distance = 1 - estimated similarity (match ratio)**

距離値の範囲は 0 から 1 です：

- **0** は、MinHash signatures が同一であることを意味します（推定 Jaccard similarity = 1）

- **1** は、どの位置にも一致がないことを意味します（推定 Jaccard similarity = 0）

技術的な詳細については、[MINHASH_LSH](./minhash-lsh) を参照してください。

## HAMMING distance\{#hamming-distance}

HAMMING distance は二進データ文字列を測定します。長さが等しい 2 つの文字列間の距離は、ビットが異なるビット位置の数です。

たとえば、2 つの文字列 1101 1001 と 1001 1101 があるとします。

11011001 ⊕ 10011101 = 01000100。これには 1 が 2 つ含まれるため、HAMMING distance, d (11011001, 10011101) = 2 です。

## BM25 similarity\{#bm25-similarity}

BM25 は広く使用されているテキスト関連性の測定方法であり、特に [full text search](./full-text-search) 向けに設計されています。以下の 3 つの主要な要素を組み合わせます。

- **Term Frequency (TF):** 文書内に用語がどの程度頻繁に出現するかを測定します。出現頻度が高いほど重要であることが多い一方で、BM25 は飽和パラメータ $k_1$ を使用して、過度に頻出する用語が関連性スコアを支配しないようにします。

- **Inverse Document Frequency (IDF):** コーパス全体における用語の重要性を反映します。より少ない文書に出現する用語ほど、より高い IDF 値を受け取り、関連性への寄与が大きいことを示します。

- **Document Length Normalization:** 長い文書は多くの用語を含むため、スコアが高くなる傾向があります。BM25 は文書長を正規化することでこの偏りを軽減し、パラメータ $b$ がこの正規化の強さを制御します。

BM25 スコアは次のように計算されます。

$$
score(D, Q)=\sum_\{i=1\}^\{n\}IDF(q_i)\cdot \{\{TF(q_i,D)\cdot(k_1+1)\}\over\{TF(q_i, D)+k_1\cdot(1-b+b\cdot \{\{|D|\}\over\{avgdl\}\})\}\}
$$

パラメータの説明：

- $Q$: ユーザーが指定したクエリテキスト。

- $D$: 評価対象の文書。

- $TF(q_i, D)$: Term frequency。用語 $q_i$ が文書 $D$ にどの程度出現するかを表します。

- $IDF(q_i)$: Inverse document frequency。次のように計算されます：

    $$
    IDF(q_i)=\log(\{N-n(q_i)+0.5\over n(q_i)+0.5\} + 1)
    $$

    ここで、$N$ はコーパス内の文書総数、$n(q_i)$ は用語 $q_i$ を含む文書数です。

- $|D|$: 文書 $D$ の長さ（用語の総数）。

- $avgdl$: コーパス内のすべての文書の平均長。

- $k_1$: スコアに対する term frequency の影響を制御します。値が大きいほど、term frequency の重要性が増します。一般的な範囲は [1.2, 2.0] であり、Zilliz Cloud では [0, 3] の範囲を許可しています。

- $b$: 長さ正規化の度合いを制御し、0 から 1 の範囲を取ります。値が 0 の場合は正規化は適用されず、値が 1 の場合は完全な正規化が適用されます。

## Maximum similarity\{#maximum-similarity}

**maximum similarity**（**MAX_SIM** とも呼ばれます）は、通常のベクトル埋め込みではなく、ベクトル埋め込みのリスト間の類似性を測定します。基本的な考え方は、各文書をコンテキストチャンクまたはトークンに分割し、それぞれのベクトル埋め込みを作成して、文書ごとに埋め込みのリストとして保存することです。クエリを受け取ったときにも、それをトークンに分割し、対応する埋め込みリストを生成します。 

$$
score(Q, D) = \sum_\{i=1\}^m\max_\{j=1\}^ncos(e_\{q_i\}, e_\{d_j\})
$$

クエリと文書間の距離または類似度スコアは、maximum similarity（**MAX_SIM**）として知られる上記の式を使用して計算されます。式中の引数は次のとおりです。

- $Q$: ユーザーが指定したクエリテキストで、$E_Q = [e_\{q_1\}, ..., e_\{q_m\} ]$ のようなベクトル埋め込みリストに分割されています。

- $D$: 評価対象の文書で、$E_D = [e_\{d_1\}, ... e_\{d_n\}]$ のようなベクトル埋め込みリストに分割されています。

- $e_\{q_i\}$: クエリ埋め込みリスト内の *i 番目* のベクトル埋め込み。

- $e_\{d_j\}$: 文書内の *j 番目* のベクトル埋め込み。

クエリと文書の類似度スコアを決定するには、各クエリトークンのベクトル埋め込みを文書内の埋め込みと比較して類似度スコアのリストを取得します。その後、すべてのスコアリストから最も高いスコアを合計して、最終スコアを生成します。

![BqBlwM4OOh6hM9bmNwbc2xUUnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/BqBlwM4OOh6hM9bmNwbc2xUUnxc.png)

Zilliz Cloud では、**MAX_SIM** を使用して、クエリと、構造体の配列に格納された文書との間の類似性を測定できます。 

以下の表は、**MAX_SIM** 系列で適用可能なメトリックタイプを示しています。

| Metric type | Description |
| --- | --- |
| MAX_SIM_L2 | 各クエリトークンと各文書トークン間の距離を計算するために **L2** が使用され、複数のスコアリストが生成されます。その後、**MAX_SIM** はすべてのスコアリストにわたる最高スコアを合計して最終スコアを決定します。 |
| MAX_SIM_IP | 各クエリトークンと各文書トークン間の距離を計算するために **IP** が使用され、複数のスコアリストが生成されます。その後、**MAX_SIM** はすべてのスコアリストから最高スコアを合計して最終スコアを決定します。 |
| MAX_SIM_COSINE | 各クエリトークンと各文書トークン間の距離を計算するために **COSINE** が使用され、複数のスコアリストが生成されます。その後、**MAX_SIM** はすべてのスコアリストから最高スコアを合計して最終スコアを決定します。 |

