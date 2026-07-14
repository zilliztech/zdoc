---
title: "Metric Types | Cloud"
slug: /search-metrics-explained
sidebar_label: "メトリックタイプ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "類似度メトリックは、vector 間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類およびクラスタリングの性能を大幅に向上させることができます。 | Cloud"
type: origin
token: EOxmwUDxMiy2cpkOfIsc1dYzn4c
sidebar_position: 22
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Metric Types

類似度メトリックは、vector 間の類似性を測定するために使用されます。適切な距離メトリックを選択することで、分類およびクラスタリングの性能を大幅に向上させることができます。

現在、Zilliz Cloud は次の種類の類似度 Metrics をサポートしています: Euclidean distance (`L2`)、Inner Product (`IP`)、Cosine Similarity (`COSINE`)、`JACCARD`、`HAMMING`、および `BM25`（疎 vector に対する全文検索専用に設計されています）。

以下の表は、異なる field type とそれに対応する metric type の対応関係をまとめたものです。

| Field Type | Dimension Range | Supported Metric Types | Default Metric Type |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `FLOAT16_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `BFLOAT16_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `INT8_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `SPARSE\_FLOAT\_VECTOR` | dimension を指定する必要はありません。 | `IP`, `BM25`（全文検索でのみ使用） | `IP` |
| `BINARY_VECTOR` | 8-32,768*8 | `HAMMING`, `JACCARD`, `MHJACCARD` | `HAMMING` |

<Admonition type="info" icon="📘" title="注意">

- `SPARSE\_FLOAT\_VECTOR` 型の vector fields では、`BM25` metric type は全文検索を行う場合にのみ使用してください。詳細については、[Full Text Search](./full-text-search) を参照してください。

- `BINARY_VECTOR` 型の vector fields では、dimension 値 (`dim`) は 8 の倍数でなければなりません。 

</Admonition>

以下の表は、サポートされているすべての metric types における類似距離値の特性と、その値の範囲をまとめたものです。

| Metric Type | Characteristics of the Similarity Distance Values | Similarity Distance Value Range |
| --- | --- | --- |
| `L2` | 値が小さいほど類似性が高いことを示します。 | [0, ∞) |
| `IP` | 値が大きいほど類似性が高いことを示します。 | [-1, 1] |
| `COSINE` | 値が大きいほど類似性が高いことを示します。 | [-1, 1] |
| `JACCARD` | 値が小さいほど類似性が高いことを示します。 | [0, 1] |
| `MHJACCARD` | MinHash シグネチャビットから Jaccard 類似度を推定します。距離が小さいほど、より類似しています | [0, 1] |
| `HAMMING` | 値が小さいほど類似性が高いことを示します。 | [0, dim(vector)] |
| `BM25` | term frequency、inverted document frequency、および document normalization に基づいて関連性をスコアリングします。 | [0, ∞) |

## Euclidean distance (L2)\{#euclidean-distance-l2}

Euclidean distance は、本質的には 2 点を結ぶ線分の長さを測定するものです。

Euclidean distance の式は次のとおりです。

![C8gHbw8dSozNslx9wXbcyt2hnLe](https://zdoc-images.s3.us-west-2.amazonaws.com/c8ghbw8dsoznslx9wxbcyt2hnle.png "C8gHbw8dSozNslx9wXbcyt2hnLe")

ここで、**a = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** および **b = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** は、n 次元 Euclidean 空間内の 2 点です。

これは最も一般的に使用される距離メトリックであり、データが連続値である場合に非常に有用です。

<Admonition type="info" icon="📘" title="注意">

Zilliz Cloud では、Euclidean distance が距離メトリックとして選択された場合、平方根を適用する前の値のみを計算します。

</Admonition>

## Inner product (IP)\{#inner-product-ip}

2 つの embedding 間の IP distance は次のように定義されます。

![Dqp4b8OP3oaQWgxZqoycL3ainwg](https://zdoc-images.s3.us-west-2.amazonaws.com/dqp4b8op3oaqwgxzqoycl3ainwg.png "Dqp4b8OP3oaQWgxZqoycL3ainwg")

IP は、正規化されていないデータを比較する必要がある場合や、大きさと角度の両方を重視する場合により有用です。

<Admonition type="info" icon="📘" title="注意">

embedding 間の類似性を計算するために IP を使用する場合は、embedding を正規化する必要があります。正規化後、inner product は cosine similarity と等しくなります。

</Admonition>

X' が embedding X を正規化したものだとします。

![U23obWPTJoID9KxeGyjc1HAXn9d](https://zdoc-images.s3.us-west-2.amazonaws.com/u23obwptjoid9kxegyjc1haxn9d.png "U23obWPTJoID9KxeGyjc1HAXn9d")

2 つの embeddings 間の相関は次のとおりです。

![SHDAb6UUgo7qR6xLXb5cv4bKnke](https://zdoc-images.s3.us-west-2.amazonaws.com/shdab6uugo7qr6xlxb5cv4bknke.png "SHDAb6UUgo7qR6xLXb5cv4bKnke")

## Cosine similarity\{#cosine-similarity}

Cosine similarity は、2 組の vectors のなす角の cosine を使って、それらがどれほど似ているかを測定します。この 2 組の vectors は、[0,0,...] のような同じ始点から出発しつつ、異なる方向を向く線分として考えることができます。

2 組の vectors **A = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** と **B = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** の間の cosine similarity を計算するには、次の式を使用します。

![R1iNbuEDDoz8RdxtA4RcM706nMc](https://zdoc-images.s3.us-west-2.amazonaws.com/r1inbueddoz8rdxta4rcm706nmc.png "R1iNbuEDDoz8RdxtA4RcM706nMc")

cosine similarity は常に **[-1, 1]** の範囲にあります。たとえば、比例する 2 つの vector の cosine similarity は **1**、直交する 2 つの vector の similarity は **0**、逆向きの 2 つの vector の similarity は **-1** です。cosine が大きいほど、2 つの vectors のなす角は小さくなり、これら 2 つの vectors がより互いに類似していることを示します。

cosine similarity を 1 から引くことで、2 つの vectors 間の cosine distance を得ることができます。

## JACCARD distance\{#jaccard-distance}

JACCARD distance coefficient は 2 つのサンプル集合の類似性を測定するもので、定義された集合の積集合の濃度を、それらの和集合の濃度で割ったものとして定義されます。これは有限のサンプル集合にのみ適用できます。

![Sl4dbmQRVoIf1yx55mRcibZ3nAg](https://zdoc-images.s3.us-west-2.amazonaws.com/sl4dbmqrvoif1yx55mrcibz3nag.png "Sl4dbmQRVoIf1yx55mRcibZ3nAg")

JACCARD distance はデータ集合間の非類似性を測定するもので、JACCARD similarity coefficient を 1 から引くことで得られます。二値変数の場合、JACCARD distance は Tanimoto coefficient と等価です。

![Kj2kbpNmHoTUUixjDC1ccTntnnV](https://zdoc-images.s3.us-west-2.amazonaws.com/kj2kbpnmhotuuixjdc1cctntnnv.png "Kj2kbpNmHoTUUixjDC1ccTntnnV")

## MHJACCARD\{#mhjaccard}

**MinHash Jaccard** (`MHJACCARD`) は、ドキュメントの単語集合、ユーザーのタグ集合、ゲノムの k-mer 集合などの大規模な集合に対して、効率的な近似類似検索を行うための metric type です。MHJACCARD は生の集合を直接比較する代わりに、**MinHash signatures** を比較します。これは Jaccard 類似度を効率的に推定するために設計されたコンパクトな表現です。

このアプローチは、厳密な Jaccard 類似度を計算するよりも大幅に高速であり、特に大規模または高次元のシナリオで有用です。

**適用可能な vector type**

- `BINARY_VECTOR`。各 vector は MinHash signature を格納します。各要素は、元の集合に適用された独立な hash functions のいずれか 1 つにおける最小 hash value に対応します。

**距離の定義**

MHJACCARD は、2 つの MinHash signatures において一致する位置の数を測定します。一致率が高いほど、元の集合はより類似しています。

Zilliz Cloud は次を返します。

- **Distance = 1 - estimated similarity (match ratio)**

距離値の範囲は 0 から 1 です。

- **0** は MinHash signatures が同一であることを意味します（estimated Jaccard similarity = 1）

- **1** はどの位置にも一致がないことを意味します（estimated Jaccard similarity = 0）

技術的な詳細については、[MINHASH_LSH](./minhash-lsh) を参照してください。

## HAMMING distance\{#hamming-distance}

HAMMING distance は二進データ文字列を測定します。同じ長さの 2 つの文字列間の距離は、ビットが異なる位置の数です。

たとえば、2 つの文字列 1101 1001 と 1001 1101 があるとします。

11011001 ⊕ 10011101 = 01000100。これには 1 が 2 つ含まれるため、HAMMING distance, d (11011001, 10011101) = 2 です。

## BM25 similarity\{#bm25-similarity}

BM25 は広く使用されているテキスト関連性測定手法であり、特に[全文検索](./full-text-search)向けに設計されています。以下の 3 つの主要な要素を組み合わせています。

- **Term Frequency (TF):** 文書内に用語がどれだけ頻繁に出現するかを測定します。頻度が高いほど重要度が高いことを示す場合が多いですが、BM25 では saturation parameter $k_1$ を使用して、過度に頻出する用語が関連性スコアを支配しないようにしています。

- **Inverse Document Frequency (IDF):** コーパス全体における用語の重要性を反映します。より少ない文書に出現する用語ほど高い IDF 値が与えられ、関連性への寄与が大きいことを示します。

- **Document Length Normalization:** 長い文書は多くの用語を含むため、より高いスコアになりがちです。BM25 は文書長を正規化することでこのバイアスを緩和し、parameter $b$ がこの正規化の強さを制御します。

BM25 スコアは次のように計算されます。

$$
score(D, Q)=\sum_\{i=1\}^\{n\}IDF(q_i)\cdot \{\{TF(q_i,D)\cdot(k_1+1)\}\over\{TF(q_i, D)+k_1\cdot(1-b+b\cdot \{\{|D|\}\over\{avgdl\}\})\}\}
$$

パラメータの説明:

- $Q$: ユーザーが指定するクエリテキスト。

- $D$: 評価対象の文書。

- $TF(q_i, D)$: term frequency。文書 $D$ において用語 $q_i$ がどの程度出現するかを表します。

- $IDF(q_i)$: inverse document frequency。次のように計算されます。

    $$
    IDF(q_i)=\log(\{N-n(q_i)+0.5\over n(q_i)+0.5\} + 1)
    $$

    ここで、$N$ はコーパス内の文書総数、$n(q_i)$ は用語 $q_i$ を含む文書数です。

- $|D|$: 文書 $D$ の長さ（用語の総数）。

- $avgdl$: コーパス内のすべての文書の平均長。

- $k_1$: スコアに対する term frequency の影響を制御します。値が高いほど term frequency の重要性が増します。一般的な範囲は [1.2, 2.0] ですが、Zilliz Cloud では [0, 3] の範囲を許可しています。

- $b$: 長さ正規化の度合いを制御し、範囲は 0 から 1 です。値が 0 の場合は正規化は適用されず、値が 1 の場合は完全な正規化が適用されます。

## Maximum similarity\{#maximum-similarity}

**maximum similarity** は **MAX_SIM** とも呼ばれ、通常の vector embeddings ではなく、vector embedding のリスト間の類似性を測定します。主な考え方は、各文書をコンテキストチャンクまたは token に分割し、それぞれについて vector embedding を作成して、文書ごとに embedding のリストとして保存することです。クエリを受け取った際にも、それを token に分割し、それに応じた embedding リストを生成します。 

$$
score(Q, D) = \sum_\{i=1\}^m\max_\{j=1\}^ncos(e_\{q_i\}, e_\{d_j\})
$$

クエリと文書の間の距離または類似度スコアは、上記の式を使って計算され、これを maximum similarity (**MAX_SIM**) と呼びます。式の各引数は次のとおりです。

- $Q$: ユーザーが指定したクエリテキストで、$E_Q = [e_\{q_1\}, ..., e_\{q_m\} ]$ のような vector embedding リストに分割されています。

- $D$: 評価対象の文書で、$E_D = [e_\{d_1\}, ... e_\{d_n\}]$ のような vector embedding リストに分割されています。

- $e_\{q_i\}$: クエリ embedding リスト内の *i 番目* の vector embedding。

- $e_\{d_j\}$: 文書内の *j 番目* の vector embedding。

クエリと文書の類似度スコアを求めるには、各クエリ token の vector embeddings を文書内のものと比較して、類似度スコアのリストを取得します。その後、すべてのスコアリストから最も高いスコアを合計して、最終スコアを算出します。

![BqBlwM4OOh6hM9bmNwbc2xUUnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/BqBlwM4OOh6hM9bmNwbc2xUUnxc.png)

Zilliz Cloud では、**MAX_SIM** を使用して、struct の配列に保存されたクエリと文書の間の類似性を測定できます。 

以下の表は、**MAX_SIM** シリーズで適用可能な metric types を示しています。

| Metric type | Description |
| --- | --- |
| MAX_SIM_L2 | 各クエリ token と各文書 token の間の距離計算に **L2** を使用して複数のスコアリストを生成し、**MAX_SIM** がそれらすべてのスコアリストの中から最も高いスコアを合計して最終スコアを決定します。 |
| MAX_SIM_IP | 各クエリ token と各文書 token の間の距離計算に **IP** を使用して複数のスコアリストを生成し、**MAX_SIM** がそれらすべてのスコアリストの中から最も高いスコアを合計して最終スコアを決定します。 |
| MAX_SIM_COSINE | 各クエリ token と各文書 token の間の距離計算に **COSINE** を使用して複数のスコアリストを生成し、**MAX_SIM** がそれらすべてのスコアリストの中から最も高いスコアを合計して最終スコアを決定します。 |

