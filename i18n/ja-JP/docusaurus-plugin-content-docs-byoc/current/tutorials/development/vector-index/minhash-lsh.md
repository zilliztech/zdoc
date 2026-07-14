---
title: "MINHASH_LSH | BYOC"
slug: /minhash-lsh
sidebar_label: "MINHASH_LSH"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "効率的な重複排除と類似検索は、大規模な機械学習データセットにとって極めて重要です。特に Large Language Models (LLMs) の学習コーパスのクリーニングのようなタスクでは不可欠です。数百万から数十億のドキュメントを扱う場合、従来の完全一致は遅すぎてコストも高くなります。 | BYOC"
type: origin
token: BYtDwHuOXiG7imkyIjHcWa6fnlb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# MINHASH_LSH

効率的な重複排除と類似検索は、大規模な機械学習データセットにとって極めて重要です。特に Large Language Models (LLMs) の学習コーパスのクリーニングのようなタスクでは不可欠です。数百万から数十億のドキュメントを扱う場合、従来の完全一致は遅すぎてコストも高くなります。

Zilliz Cloud の **MINHASH_LSH** index は、2 つの強力な技術を組み合わせることで、高速でスケーラブルかつ高精度な近似重複排除を可能にします。

- [MinHash](https://en.wikipedia.org/wiki/MinHash): ドキュメントの類似性を推定するためのコンパクトなシグネチャ（または「フィンガープリント」）を高速に生成します。

- [Locality-Sensitive Hashing (LSH)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing): MinHash シグネチャに基づいて、類似したドキュメントのグループを高速に見つけます。

このガイドでは、Zilliz Cloud で MINHASH_LSH を使用するための概念、前提条件、セットアップ、ベストプラクティスを説明します。

## Overview\{#overview}

<details>

<summary>動作の仕組みを表示</summary>

### Jaccard similarity\{#jaccard-similarity}

Jaccard similarity は、2 つの集合 A と B の重なりを測定する指標で、次のように定義されます。

$$
J(A, B) = \frac\{|A \cap B|\}\{|A \cup B|\}
$$

その値の範囲は 0（完全に互いに素）から 1（同一）です。

しかし、大規模データセットにおいてすべてのドキュメントペア間の Jaccard similarity を正確に計算するのは、計算コストが非常に高く、**n** が大きい場合、時間・メモリともに **O(n²)** となります。そのため、LLM 学習コーパスのクリーニングや Web スケールのドキュメント分析のようなユースケースでは現実的ではありません。

### MinHash signatures: Approximate Jaccard similarity\{#minhash-signatures-approximate-jaccard-similarity}

[MinHash](https://en.wikipedia.org/wiki/MinHash) は、Jaccard similarity を効率的に推定するための確率的手法です。各集合をコンパクトな **signature vector** に変換し、集合間の類似性を効率よく近似するのに十分な情報を保持します。

**中核となる考え方**:

2 つの集合が似ているほど、それらの MinHash signatures は同じ位置で一致しやすくなります。この性質によって、MinHash は集合間の Jaccard similarity を近似できます。

この性質により、MinHash は集合全体を直接比較することなく、集合間の **Jaccard similarity を近似** できます。

MinHash の処理は次のステップで構成されます。

1. **Shingling**: ドキュメントを重なり合うトークン列（shingles）の集合に変換する

1. **Hashing**: 各 shingle に対して複数の独立したハッシュ関数を適用する

1. **Min Selection**: 各ハッシュ関数について、すべての shingle にわたる**最小**ハッシュ値を記録する

以下の図は、全体の処理を示しています。

![CCzEwT7uchMqI6bsxRJcK1qenEh](https://zdoc-images.s3.us-west-2.amazonaws.com/CCzEwT7uchMqI6bsxRJcK1qenEh.png)

<Admonition type="info" icon="📘" title="注意">

使用するハッシュ関数の数によって、MinHash signature の次元数が決まります。次元数が高いほど近似精度は向上しますが、その分ストレージと計算コストが増加します。

</Admonition>

### LSH for MinHash\{#lsh-for-minhash}

MinHash signatures によってドキュメント間の正確な Jaccard similarity 計算コストは大幅に削減されますが、それでもすべての signature vector のペアを総当たりで比較するのは、大規模環境では非効率です。

この問題を解決するために [LSH](https://zilliz.com/learn/Local-Sensitivity-Hashing-A-Comprehensive-Guide) が使われます。LSH は、類似したアイテムが高い確率で同じ「bucket」にハッシュされるようにすることで、高速な近似類似検索を可能にし、すべてのペアを直接比較する必要を回避します。

この処理は次のステップで構成されます。

1. **Signature segmentation:**

    *n* 次元の MinHash signature を *b* 個の band に分割します。各 band には連続する *r* 個のハッシュ値が含まれるため、シグネチャ全体の長さは *n = b × r* を満たします。

    たとえば、128 次元の MinHash signature（*n = 128*）を 32 個の band（*b = 32*）に分割すると、各 band には 4 個のハッシュ値（*r = 4*）が含まれます。

1. **Band-level hashing:**

    分割後、各 band は標準的なハッシュ関数を使って独立に処理され、bucket に割り当てられます。2 つの signature がある band 内で同じハッシュ値を生成した場合、つまり同じ bucket に入った場合、それらは潜在的な一致候補と見なされます。

1. **Candidate selection:**

    少なくとも 1 つの band で衝突したペアが、類似候補として選択されます。

<Admonition type="info" icon="📘" title="注意">

なぜ機能するのでしょうか？

数学的には、2 つの signature の Jaccard similarity が $s$ である場合、

- 1 行（ハッシュ位置）で一致する確率は $s$

- 1 つの band の全 $r$ 行で一致する確率は $s^r$

- **少なくとも 1 つの band** で一致する確率は &#36;1 - (1 - s^r)^b$ です

詳細は [Locality-sensitive hashing](https://en.wikipedia.org/wiki/Locality-sensitive_hashing) を参照してください。

</Admonition>

128 次元の MinHash signatures を持つ 3 つのドキュメントを考えてみましょう。

![E1dewMnqshua0ib7aHmcL10lnIe](https://zdoc-images.s3.us-west-2.amazonaws.com/E1dewMnqshua0ib7aHmcL10lnIe.png)

まず、LSH は 128 次元のシグネチャを、それぞれ 4 つの連続値を持つ 32 個の band に分割します。

![PhSMwS74rh25oybv9Docmfionze](https://zdoc-images.s3.us-west-2.amazonaws.com/PhSMwS74rh25oybv9Docmfionze.png)

次に、各 band はハッシュ関数を使って異なる bucket にハッシュされます。同じ bucket を共有するドキュメントペアが類似候補として選択されます。以下の例では、Document A と Document B は **Band 0** でハッシュ結果が衝突しているため、類似候補として選択されます。

![RfmMwNkIvhlUFSb11alcP8fqnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/RfmMwNkIvhlUFSb11alcP8fqnmf.png)

<Admonition type="info" icon="📘" title="注意">

band の数は `mh_lsh_band` パラメータで制御されます。詳細は [Index building params](./minhash-lsh#index-building-params) を参照してください。

</Admonition>

### MHJACCARD: Comparing MinHash signatures\{#mhjaccard-comparing-minhash-signatures}

MinHash signatures は、固定長のバイナリベクトルを使って集合間の Jaccard similarity を近似します。しかし、これらの signature は元の集合を保持しないため、`JACCARD`、`L2`、`COSINE` などの標準的な metric を直接適用して比較することはできません。

この課題に対応するため、Zilliz Cloud では MinHash signatures の比較専用に設計された `MHJACCARD` という特化した metric_type を導入しています。

Zilliz Cloud で MinHash を使用する場合:

- vector field は `BINARY_VECTOR` 型である必要があります

- `index_type` は `MINHASH_LSH`（または `BIN_FLAT`）である必要があります

- `metric_type` は `MHJACCARD` に設定する必要があります

これ以外の metric を使用すると、無効になるか誤った結果を返します。

この metric type の詳細については、[MHJACCARD](./search-metrics-explained#mhjaccard) を参照してください。

### Deduplication workflow\{#deduplication-workflow}

MinHash LSH を活用した重複排除プロセスにより、Zilliz Cloud は collection に挿入する前に、ほぼ重複するテキストや構造化レコードを効率的に特定して除外できます。

![It9wwbCFwhfT0RbwosAcGltZneb](https://zdoc-images.s3.us-west-2.amazonaws.com/It9wwbCFwhfT0RbwosAcGltZneb.png)

1. **Chunk & preprocess**: 入力されるテキストデータまたは構造化データ（例: records、fields）をチャンクに分割し、テキストを正規化（小文字化、句読点除去）し、必要に応じて stopwords を除去します。

1. **Feature construction**: MinHash に使用する token set を構築します（例: テキストからの shingles、構造化データでは連結された field token）。

1. **MinHash signature generation**: 各 chunk または record の MinHash signatures を計算します。

1. **Binary vector conversion**: signature を Milvus と互換性のある binary vector に変換します。

1. **Search before insert**: MinHash LSH index を使用して、対象の collection 内で入力アイテムの近似重複を検索します。

1. **Insert & store**: 一意なアイテムのみを collection に挿入します。これらは今後の重複チェックで検索対象になります。

</details>

## Prerequisites\{#prerequisites}

Zilliz Cloud で MinHash LSH を使用する前に、まず **MinHash signatures** を生成する必要があります。これらのコンパクトなバイナリ signature は集合間の Jaccard similarity を近似し、Zilliz Cloud における `MHJACCARD` ベースの検索に必要です。

<Admonition type="info" icon="📘" title="注意">

`MINHASH_LSH` index 用の MinHash signatures は、次の 2 つの方法で準備できます。

- 外部ツールを使って自分で signature を生成し、BINARY_VECTOR field に挿入する

- 組み込みの MinHash function を使って、テキストから互換性のある binary vector を自動生成する。MinHash function のエンドツーエンドのワークフローおよび設定オプションについては、[MinHash Function](./minhash-function) を参照してください。

</Admonition>

### Choose a method to generate MinHash signatures\{#choose-a-method-to-generate-minhash-signatures}

ワークロードに応じて、次の方法を選択できます。

- シンプルさのために Python の [`datasketch`](https://ekzhu.github.io/datasketch/) を使う（プロトタイピングに推奨）

- 大規模データセットには分散ツール（例: Spark、Ray）を使う

- パフォーマンスチューニングが重要な場合は、カスタムロジック（NumPy、C++ など）を実装する

このガイドでは、シンプルさと Zilliz Cloud の入力形式との互換性のために `datasketch` を使用します。

### Install required libraries\{#install-required-libraries}

この例に必要なパッケージをインストールします。

```bash
pip install pymilvus datasketch numpy
```

### Generate MinHash signatures\{#generate-minhash-signatures}

ここでは 256 次元の MinHash signatures を生成し、各ハッシュ値は 64 ビット整数として表現します。これは `MINHASH_LSH` に期待される vector format に対応しています。

```python
from datasketch import MinHash
import numpy as np

MINHASH_DIM = 256
HASH_BIT_WIDTH = 64

def generate_minhash_signature(text, num_perm=MINHASH_DIM) -> bytes:
    m = MinHash(num_perm=num_perm)
    for token in text.lower().split():
        m.update(token.encode("utf8"))
    return m.hashvalues.astype('>u8').tobytes()  # Returns 2048 bytes
```

各 signature は 256 × 64 bits = 2048 bytes です。この byte string は `BINARY_VECTOR` field に直接挿入できます。Zilliz Cloud で使用される binary vector の詳細については、[Binary Vector](./use-binary-vector) を参照してください。

### (Optional) Prepare raw token sets (for refined search)\{#optional-prepare-raw-token-sets-for-refined-search}

デフォルトでは、Zilliz Cloud は MinHash signatures と LSH index のみを使って近似近傍を見つけます。これは高速ですが、偽陽性を返したり、近い一致を見逃したりする可能性があります。

**正確な Jaccard similarity** が必要な場合、Zilliz Cloud は元の token set を使用する refined search をサポートしています。有効にするには:

- token set を別の `VARCHAR` field として保存する

- [building index parameters](./minhash-lsh#build-index-parameters-and-create-collection) の際に `"with_raw_data": True` を設定する

- さらに [performing similarity search](./minhash-lsh#perform-similarity-search) の際に `"mh_search_with_jaccard": True` を有効にする

**Token set extraction example**:

```python
def extract_token_set(text: str) -> str:
    tokens = set(text.lower().split())
    return " ".join(tokens)
```

## Use MinHash LSH\{#use-minhash-lsh}

MinHash vector と元の token set の準備ができたら、`MINHASH_LSH` を使って Zilliz Cloud 上でそれらを保存、index 化、検索できます。

### Connect to your cluster\{#connect-to-your-cluster}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")  # Update if your URI is different
```

### Define collection schema\{#define-collection-schema}

次を含む schema を定義します。

- primary key

- MinHash signatures 用の `BINARY_VECTOR` field

- 元の token set 用の `VARCHAR` field（refined search を有効にする場合）

- オプションで元のテキスト用の `document` field

```python
from pymilvus import DataType

VECTOR_DIM = MINHASH_DIM * HASH_BIT_WIDTH  # 256 × 64 = 8192 bits

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("doc_id", DataType.INT64, is_primary=True)
schema.add_field("minhash_signature", DataType.BINARY_VECTOR, dim=VECTOR_DIM)
schema.add_field("token_set", DataType.VARCHAR, max_length=1000)  # required for refinement
schema.add_field("document", DataType.VARCHAR, max_length=1000)
```

### Build index parameters and create collection\{#build-index-parameters-and-create-collection}

Jaccard refinement を有効にした `MINHASH_LSH` index を構築します。

```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="minhash_signature",
    index_type="MINHASH_LSH",
    metric_type="MHJACCARD",
    params={
        "mh_element_bit_width": HASH_BIT_WIDTH,  # Must match signature bit width
        "mh_lsh_band": 16,                       # Band count (128/16 = 8 hashes per band)
        "with_raw_data": True                    # Required for Jaccard refinement
    }
)

client.create_collection("minhash_demo", schema=schema, index_params=index_params)
```

index 構築パラメータの詳細については、[Index building params](./minhash-lsh#index-building-params) を参照してください。

### Insert data\{#insert-data}

各ドキュメントについて、次を準備します。

- binary MinHash signature

- シリアライズされた token set 文字列

- （オプションで）元のテキスト

```python
documents = [
    "machine learning algorithms process data automatically",
    "deep learning uses neural networks to model patterns"
]

insert_data = []
for i, doc in enumerate(documents):
    sig = generate_minhash_signature(doc)
    token_str = extract_token_set(doc)
    insert_data.append({
        "doc_id": i,
        "minhash_signature": sig,
        "token_set": token_str,
        "document": doc
    })

client.insert("minhash_demo", insert_data)
client.flush("minhash_demo")
```

### Perform similarity search\{#perform-similarity-search}

Zilliz Cloud は、MinHash LSH を使用した 2 つの類似検索モードをサポートしています。

- **Approximate search** — MinHash signatures と LSH のみを使用し、高速ですが確率的な結果を返します。

- **Refined search** — 元の token set を使って Jaccard similarity を再計算し、精度を向上させます。

#### 5.1 Prepare the query\{#51-prepare-the-query}

類似検索を実行するには、クエリドキュメントの MinHash signature を生成します。この signature は、データ挿入時に使用したものと同じ次元数およびエンコーディング形式に一致している必要があります。

```python
query_text = "neural networks model patterns in data"
query_sig = generate_minhash_signature(query_text)
```

#### 5.2 Approximate search (LSH-only)\{#52-approximate-search-lsh-only}

これは高速かつスケーラブルですが、近い一致を見逃したり、偽陽性を含む場合があります。

```python
# highlight-start
search_params={
    "metric_type": "MHJACCARD", 
    "params": {}
}
# highlight-end

approx_results = client.search(
    collection_name="minhash_demo",
    data=[query_sig],
    anns_field="minhash_signature",
    # highlight-next-line
    search_params=search_params,
    limit=3,
    output_fields=["doc_id", "document"],
    consistency_level="Strong"
)

for i, hit in enumerate(approx_results[0]):
    sim = 1 - hit['distance']
    print(f"{i+1}. Similarity: {sim:.3f} | {hit['entity']['document']}")
```

#### 5.3 Refined search (recommended for accuracy):\{#53-refined-search-recommended-for-accuracy}

これにより、Zilliz Cloud に保存された元の token set を使った正確な Jaccard 比較が有効になります。やや低速ですが、品質重視のタスクには推奨されます。

```python
# highlight-start
search_params = {
    "metric_type": "MHJACCARD",
    "params": {
        "mh_search_with_jaccard": True,  # Enable real Jaccard computation
        "refine_k": 5                    # Refine top 5 candidates
    }
}
# highlight-end

refined_results = client.search(
    collection_name="minhash_demo",
    data=[query_sig],
    anns_field="minhash_signature",
    # highlight-next-line
    search_params=search_params,
    limit=3,
    output_fields=["doc_id", "document"],
    consistency_level="Strong"
)

for i, hit in enumerate(refined_results[0]):
    sim = 1 - hit['distance']
    print(f"{i+1}. Similarity: {sim:.3f} | {hit['entity']['document']}")
```

## Index params\{#index-params}

このセクションでは、index の構築および index 上での検索実行に使用されるパラメータの概要を説明します。

### Index building params\{#index-building-params}

次の表は、[building an index](./minhash-lsh#build-index-parameters-and-create-collection) の際に `params` で設定できるパラメータを示しています。

| Parameter | Description | Value Range | Tuning Suggestion |
| --- | --- | --- | --- |
| `mh_element_bit_width` | MinHash signature 内の各ハッシュ値のビット幅。8 で割り切れる必要があります。 | 8, 16, 32, 64 | パフォーマンスと精度のバランスには `32` を使用します。大規模データセットでより高い精度が必要な場合は `64` を使用します。許容可能な精度低下でメモリを節約したい場合は `16` を使用します。 |
| `mh_lsh_band` | LSH のために MinHash signature を分割する band 数。recall とパフォーマンスのトレードオフを制御します。 | [1, *signature_length*] | 128 次元 signature の場合: 32 bands（4 values/band）から開始します。より高い recall が必要なら 64 に増やし、より高いパフォーマンスが必要なら 16 に減らします。signature length を均等に割り切る必要があります。 |
| `mh_lsh_code_in_mem` | LSH hash code を anonymous memory (`true`) に保存するか、memory mapping (`false`) を使用するか。 | true, false | 大規模データセット（>1M sets）ではメモリ使用量を減らすために `false` を使用します。最大の検索速度が必要な小規模データセットでは `true` を使用します。 |
| `with_raw_data` | refinement のために、LSH code とともに元の MinHash signatures を保存するかどうか。 | true, false | 高精度が必要でストレージコストを許容できる場合は `true` を使用します。わずかな精度低下と引き換えにストレージオーバーヘッドを最小化したい場合は `false` を使用します。 |
| `mh_lsh_bloom_false_positive_prob` | LSH bucket 最適化で使用される Bloom filter の偽陽性確率。 | [0.001, 0.1] | メモリ使用量と精度のバランスには `0.01` を使用します。低い値（`0.001`）は偽陽性を減らしますが、メモリ使用量が増えます。高い値（`0.05`）はメモリを節約しますが、精度が低下する可能性があります。 |

### Index-specific search params\{#index-specific-search-params}

次の表は、[searching on the index](./minhash-lsh#perform-similarity-search) の際に `search_params.params` で設定できるパラメータを示しています。

| Parameter | Description | Value Range | Tuning Suggestion |
| --- | --- | --- | --- |
| `mh_search_with_jaccard` | refinement のために候補結果に対して正確な Jaccard similarity 計算を実行するかどうか。 | true, false | 高精度が必要なアプリケーション（例: deduplication）では `true` を使用します。多少の精度低下を許容して高速な近似検索を行う場合は `false` を使用します。 |
| `refine_k` | Jaccard refinement の前に取得する候補数。`mh_search_with_jaccard` が `true` の場合にのみ有効です。 | [*top_k*, *top_k &ast; 10*] | recall とパフォーマンスの良いバランスのため、目的の *top_k* の 2～5 倍に設定します。値を大きくすると recall は向上しますが、計算コストが増加します。 |
| `mh_lsh_batch_search` | 複数クエリ同時実行時の batch 最適化を有効にするかどうか。 | true, false | 複数クエリを同時に検索する場合は、スループット向上のために `true` を使用します。単一クエリのシナリオでは、メモリオーバーヘッドを減らすために `false` を使用します。 |
