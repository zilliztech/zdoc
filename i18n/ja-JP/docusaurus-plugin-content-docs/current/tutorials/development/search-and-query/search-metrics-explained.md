---
title: "メトリクスタイプ | Cloud"
slug: /search-metrics-explained
sidebar_label: "メトリクスタイプ"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "類似度メトリクスは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリクスを選択することで、分類およびクラスタリングのパフォーマンスを大幅に向上させることができます。 | Cloud"
type: origin
token: EOxmwUDxMiy2cpkOfIsc1dYzn4c
sidebar_position: 22
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# メトリクスタイプ

類似度メトリクスは、ベクトル間の類似性を測定するために使用されます。適切な距離メトリクスを選択すると、分類とクラスタリングのパフォーマンスを大幅に向上させることができます。

現在、Zilliz Cloud は次の種類の類似度メトリクスをサポートしています：ユークリッド距離（`L2`）、内積（`IP`）、コサイン類似度（`COSINE`）、`JACCARD`、`HAMMING`、および `BM25`（スパースベクトルに対する全文検索用に特別に設計されています）。

以下の表は、さまざまなフィールドタイプと、それに対応するメトリクスタイプのマッピングをまとめたものです。

| フィールドタイプ | 次元の範囲 | サポートされるメトリクスタイプ | デフォルトのメトリクスタイプ |
| --- | --- | --- | --- |
| `FLOAT_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `FLOAT16_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `BFLOAT16_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `INT8_VECTOR` | 2-32,768 | `COSINE`, `L2`, `IP` | `COSINE` |
| `SPARSE\_FLOAT\_VECTOR` | 次元を指定する必要はありません。 | `IP`, `BM25`（全文検索でのみ使用） | `IP` |
| `BINARY_VECTOR` | 8-32,768&ast;8 | `HAMMING`, `JACCARD`, `MHJACCARD` | `HAMMING` |

<Admonition type="info" title="Notes">

- `SPARSE\_FLOAT\_VECTOR` 型のベクトルフィールドでは、全文検索を実行する場合にのみ `BM25` メトリクスタイプを使用してください。詳細については、[Full Text Search](./full-text-search) を参照してください。

- `BINARY_VECTOR` 型のベクトルフィールドでは、次元値（`dim`）が 8 の倍数である必要があります。

</Admonition>

以下の表は、サポートされているすべてのメトリクスタイプについて、類似度距離値の特性とその値の範囲をまとめたものです。

| メトリクスタイプ | 類似度距離値の特性 | 類似度距離値の範囲 |
| --- | --- | --- |
| `L2` | 値が小さいほど類似度が高いことを示します。 | [0, ∞) |
| `IP` | 値が大きいほど類似度が高いことを示します。 | [-1, 1] |
| `COSINE` | 値が大きいほど類似度が高いことを示します。 | [-1, 1] |
| `JACCARD` | 値が小さいほど類似度が高いことを示します。 | [0, 1] |
| `MHJACCARD` | MinHash シグネチャビットから Jaccard 類似度を推定します。距離が小さいほど類似しています | [0, 1] |
| `HAMMING` | 値が小さいほど類似度が高いことを示します。 | [0, dim(ベクトル)] |
| `BM25` | 用語頻度、逆文書頻度、および文書の正規化に基づいて関連性をスコアリングします。 | [0, ∞) |

## ユークリッド距離（L2）\{#euclidean-distance-l2}

本質的に、ユークリッド距離は 2 点を結ぶ線分の長さを測定します。

ユークリッド距離の式は次のとおりです：

![C8gHbw8dSozNslx9wXbcyt2hnLe](https://zdoc-images.s3.us-west-2.amazonaws.com/c8ghbw8dsoznslx9wxbcyt2hnle.png "C8gHbw8dSozNslx9wXbcyt2hnLe")

ここで、**a = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** と **b = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** は、n 次元ユークリッド空間内の 2 点です。

これは最も一般的に使用される距離メトリクスであり、データが連続値である場合に非常に有用です。

<Admonition type="info" title="Notes">

Zilliz Cloud は、距離メトリクスとしてユークリッド距離を選択した場合、平方根を適用する前の値のみを計算します。

</Admonition>

## 内積（IP）\{#inner-product-ip}

2 つの埋め込み間の IP 距離は、次のように定義されます：

![Dqp4b8OP3oaQWgxZqoycL3ainwg](https://zdoc-images.s3.us-west-2.amazonaws.com/dqp4b8op3oaqwgxzqoycl3ainwg.png "Dqp4b8OP3oaQWgxZqoycL3ainwg")

正規化されていないデータを比較する必要がある場合や、大きさと角度の両方を重視する場合には、IP のほうが有用です。

<Admonition type="info" title="Notes">

埋め込み間の類似度を計算するために IP を使用する場合は、埋め込みを正規化する必要があります。正規化後、内積はコサイン類似度と等しくなります。

</Admonition>

埋め込み X を正規化したものを X' とします：

![U23obWPTJoID9KxeGyjc1HAXn9d](https://zdoc-images.s3.us-west-2.amazonaws.com/u23obwptjoid9kxegyjc1haxn9d.png "U23obWPTJoID9KxeGyjc1HAXn9d")

2 つの埋め込みの相関は次のとおりです：

![SHDAb6UUgo7qR6xLXb5cv4bKnke](https://zdoc-images.s3.us-west-2.amazonaws.com/shdab6uugo7qr6xlxb5cv4bknke.png "SHDAb6UUgo7qR6xLXb5cv4bKnke")

## コサイン類似度\{#cosine-similarity}

コサイン類似度は、2 つのベクトル集合のなす角度のコサインを使用して、それらがどれだけ類似しているかを測定します。2 つのベクトル集合は、[0,0,...] のような同じ点から始まり、異なる方向を向く線分と考えることができます。

2 つのベクトル集合 **A = (a<sub>0</sub>, a<sub>1</sub>,..., a<sub>n-1</sub>)** と **B = (b<sub>0</sub>, b<sub>1</sub>,..., b<sub>n-1</sub>)** の間のコサイン類似度を計算するには、次の式を使用します：

![R1iNbuEDDoz8RdxtA4RcM706nMc](https://zdoc-images.s3.us-west-2.amazonaws.com/r1inbueddoz8rdxta4rcm706nmc.png "R1iNbuEDDoz8RdxtA4RcM706nMc")

コサイン類似度は常に **[-1, 1]** の区間内にあります。たとえば、比例関係にある 2 つのベクトルのコサイン類似度は **1**、直交する 2 つのベクトルの類似度は **0**、逆向きの 2 つのベクトルの類似度は **-1** です。コサインが大きいほど 2 つのベクトル間の角度は小さくなり、これらの 2 つのベクトルがより類似していることを示します。

1 からコサイン類似度を減算すると、2 つのベクトル間のコサイン距離を取得できます。

## JACCARD 距離\{#jaccard-distance}

JACCARD 距離係数は、2 つのサンプル集合間の類似性を測定し、定義された集合の積集合の濃度を、それらの和集合の濃度で割ったものとして定義されます。有限のサンプル集合にのみ適用できます。

![Sl4dbmQRVoIf1yx55mRcibZ3nAg](https://zdoc-images.s3.us-west-2.amazonaws.com/sl4dbmqrvoif1yx55mrcibz3nag.png "Sl4dbmQRVoIf1yx55mRcibZ3nAg")

JACCARD 距離はデータ集合間の非類似性を測定し、1 から JACCARD 類似度係数を減算することで得られます。バイナリ変数の場合、JACCARD 距離は Tanimoto 係数と等価です。

![Kj2kbpNmHoTUUixjDC1ccTntnnV](https://zdoc-images.s3.us-west-2.amazonaws.com/kj2kbpnmhotuuixjdc1cctntnnv.png "Kj2kbpNmHoTUUixjDC1ccTntnnV")

## MHJACCARD\{#mhjaccard}

**MinHash Jaccard**（`MHJACCARD`）は、大規模な集合（文書の単語集合、ユーザータグ集合、ゲノムの k-mer 集合など）に対する効率的で近似的な類似性検索に使用されるメトリクスタイプです。MHJACCARD は生の集合を直接比較するのではなく、Jaccard 類似度を効率的に推定するために設計されたコンパクトな表現である **MinHash シグネチャ** を比較します。

このアプローチは、正確な Jaccard 類似度を計算するよりも大幅に高速であり、大規模または高次元のシナリオで特に有用です。

**適用可能なベクトルタイプ**

- `BINARY_VECTOR`。各ベクトルは MinHash シグネチャを格納します。各要素は、元の集合に適用された独立したハッシュ関数のいずれかにおける最小ハッシュ値に対応します。

**距離の定義**

MHJACCARD は、2 つの MinHash シグネチャで一致する位置の数を測定します。一致率が高いほど、基になる集合はより類似しています。

Zilliz Cloud は次のように報告します：

- **距離 = 1 - 推定類似度（一致率）**

距離値の範囲は 0 から 1 です：

- **0** は MinHash シグネチャが同一であること（推定 Jaccard 類似度 = 1）を意味します

- **1** はどの位置でも一致しないこと（推定 Jaccard 類似度 = 0）を意味します

技術的な詳細については、[MINHASH_LSH](./minhash-lsh) を参照してください。

## HAMMING 距離\{#hamming-distance}

HAMMING 距離はバイナリデータ文字列を測定します。同じ長さの 2 つの文字列間の距離は、ビットが異なるビット位置の数です。

たとえば、1101 1001 と 1001 1101 という 2 つの文字列があるとします。

11011001 ⊕ 10011101 = 01000100。これには 1 が 2 つ含まれるため、HAMMING 距離 d (11011001, 10011101) = 2 となります。

## BM25 類似度\{#bm25-similarity}

BM25 は広く使用されているテキスト関連性の測定手法であり、[full text search](./full-text-search) 用に特別に設計されています。これは次の 3 つの主要な要素を組み合わせたものです：

- **用語頻度（TF）:** 用語が文書内に出現する頻度を測定します。頻度が高いほど重要度が高いことを示す場合が多いですが、BM25 では飽和パラメータ $k_1$ を使用して、頻度が高すぎる用語が関連性スコアを支配しないようにします。

- **逆文書頻度（IDF）:** コーパス全体における用語の重要性を反映します。出現する文書が少ない用語ほど高い IDF 値を受け取り、関連性への寄与が大きいことを示します。

- **文書長の正規化:** 長い文書はより多くの用語を含むため、スコアが高くなる傾向があります。BM25 は文書長を正規化することでこのバイアスを軽減し、パラメータ $b$ がこの正規化の強さを制御します。

BM25 スコアは次のように計算されます。

$$
score(D, Q)=\sum_{i=1}^{n}IDF(q_i)\cdot {{TF(q_i,D)\cdot(k_1+1)}\over{TF(q_i, D)+k_1\cdot(1-b+b\cdot {{|D|}\over{avgdl}})}}
$$

パラメータの説明：

- $Q$: ユーザーが指定したクエリテキスト。

- $D$: 評価対象の文書。

- $TF(q_i, D)$: 用語頻度。用語 $q_i$ が文書 $D$ にどの程度の頻度で出現するかを表します。

- $IDF(q_i)$: 逆文書頻度。次のように計算されます：

    $$
    IDF(q_i)=\log({N-n(q_i)+0.5\over n(q_i)+0.5} + 1)
    $$

    ここで、$N$ はコーパス内の文書の総数、$n(q_i)$ は用語 $q_i$ を含む文書の数です。

- $|D|$: 文書 $D$ の長さ（用語の総数）。

- $avgdl$: コーパス内のすべての文書の平均長。

- $k_1$: スコアに対する用語頻度の影響を制御します。値が大きいほど、用語頻度の重要性が高まります。一般的な範囲は [1.2, 2.0] ですが、Zilliz Cloud では [0, 3] の範囲を許容しています。

- $b$: 長さの正規化の度合いを制御し、0 から 1 の範囲を取ります。値が 0 の場合、正規化は適用されません。値が 1 の場合、完全な正規化が適用されます。

## 最大類似度\{#maximum-similarity}

**最大類似度**（**MAX_SIM** とも呼ばれます）は、通常のベクトル埋め込みではなく、ベクトル埋め込みのリスト間の類似度を測定します。基本的な考え方は、各文書をコンテキストチャンクまたはトークンに分割し、それぞれのベクトル埋め込みを作成して、文書ごとに埋め込みのリストとして保存することです。クエリを受け取ると、そのクエリもトークンに分割され、それに応じて埋め込みリストが生成されます。

$$
score(Q, D) = \sum_{i=1}^m\max_{j=1}^ncos(e_{q_i}, e_{d_j})
$$

クエリと文書の間の距離または類似度スコアは、上記の式を使用して計算されます。これは最大類似度（**MAX_SIM**）と呼ばれます。式中の引数は次のとおりです：

- $Q$: ユーザーが指定したクエリテキスト。$E_Q = [e_{q_1}, ..., e_{q_m} ]$ のようなベクトル埋め込みリストに分割されています。

- $D$: 評価対象の文書。$E_D = [e_{d_1}, ... e_{d_n}]$ のようなベクトル埋め込みリストに分割されています。

- $e_{q_i}$: クエリ埋め込みリスト内の *i 番目* のベクトル埋め込み。

- $e_{d_j}$: 文書内の *j 番目* のベクトル埋め込み。

クエリと文書の間の類似度スコアを求めるには、各クエリトークンのベクトル埋め込みを文書内のベクトル埋め込みと比較して、類似度スコアのリストを取得します。次に、すべてのスコアリストから最も高いスコアを合計して、最終スコアを算出します。

![BqBlwM4OOh6hM9bmNwbc2xUUnxc](https://zdoc-images.s3.us-west-2.amazonaws.com/BqBlwM4OOh6hM9bmNwbc2xUUnxc.png)

Zilliz Cloud では、**MAX_SIM** を使用して、クエリと、構造体の配列に格納された文書との間の類似度を測定できます。

以下の表は、**MAX_SIM** シリーズで適用可能なメトリクスタイプを示しています。

| メトリクスタイプ | 説明 |
| --- | --- |
| MAX_SIM_L2 | 各クエリトークンと各文書トークンの間の距離を計算するために **L2** が使用され、複数のスコアリストが生成されます。**MAX_SIM** は、すべてのスコアリストにわたる最高スコアを合計して最終スコアを決定します。 |
| MAX_SIM_IP | 各クエリトークンと各文書トークンの間の距離を計算するために **IP** が使用され、複数のスコアリストが生成されます。**MAX_SIM** は、すべてのスコアリストから最高スコアを合計して最終スコアを決定します。 |
| MAX_SIM_COSINE | 各クエリトークンと各文書トークンの間の距離を計算するために **COSINE** が使用され、複数のスコアリストが生成されます。**MAX_SIM** は、すべてのスコアリストから最高スコアを合計して最終スコアを決定します。 |
