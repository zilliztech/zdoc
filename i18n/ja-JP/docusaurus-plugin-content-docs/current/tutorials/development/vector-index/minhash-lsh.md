---
title: "MINHASH_LSH | Cloud"
slug: /minhash-lsh
sidebar_label: "MINHASH_LSH"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "効率的な重複排除と類似検索は、大規模な機械学習データセットにおいて極めて重要です。特に、大規模言語モデル（LLM）の学習コーパスのクリーニングのようなタスクでは不可欠です。数百万から数十億のドキュメントを扱う場合、従来の完全一致は遅すぎてコストも高くなります。 | Cloud"
type: origin
token: BYtDwHuOXiG7imkyIjHcWa6fnlb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# MINHASH_LSH

効率的な重複排除と類似検索は、大規模な機械学習データセットにおいて極めて重要です。特に、大規模言語モデル（LLM）の学習コーパスのクリーニングのようなタスクでは不可欠です。数百万から数十億のドキュメントを扱う場合、従来の完全一致は遅すぎてコストも高くなります。

Zilliz Cloud の **MINHASH_LSH** index は、2 つの強力な手法を組み合わせることで、高速でスケーラブルかつ高精度な近似重複排除を実現します。

- [MinHash](https://en.wikipedia.org/wiki/MinHash): ドキュメントの類似性を推定するためのコンパクトなシグネチャ（または「フィンガープリント」）を高速に生成します。

- [Locality-Sensitive Hashing (LSH)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing): MinHash シグネチャに基づいて、類似するドキュメントのグループを高速に見つけます。

このガイドでは、Zilliz Cloud で MINHASH_LSH を使用するための概念、前提条件、セットアップ、およびベストプラクティスを説明します。

## Overview\{#overview}

<details>

<summary>仕組みを表示して確認</summary>

### Jaccard similarity\{#jaccard-similarity}

Jaccard similarity は、2 つの集合 A と B の重なり具合を測定するもので、正式には次のように定義されます。

$$
J(A, B) = \frac\{|A \cap B|\}\{|A \cup B|\}
$$

この値の範囲は 0（完全に互いに素）から 1（完全一致）です。

ただし、大規模データセット内のすべてのドキュメントペア間で Jaccard similarity を厳密に計算するのは計算コストが非常に高く、**n** が大きい場合、時間・メモリの計算量は **O(n²)** になります。そのため、LLM 学習コーパスのクリーニングや Web スケールのドキュメント分析といったユースケースでは実用的ではありません。

### MinHash signatures: Approximate Jaccard similarity\{#minhash-signatures-approximate-jaccard-similarity}

[MinHash](https://en.wikipedia.org/wiki/MinHash) は、Jaccard similarity を効率的に推定するための確率的手法です。各集合をコンパクトな **signature vector** に変換することで機能し、集合間の類似性を効率よく近似するために十分な情報を保持します。

**中核となる考え方**:

2 つの集合が類似しているほど、それらの MinHash シグネチャが同じ位置で一致する可能性が高くなります。この性質により、MinHash は集合間の Jaccard similarity を近似できます。

この性質により、MinHash は集合全体を直接比較することなく、集合間の **Jaccard similarity を近似** できます。

MinHash のプロセスは次のとおりです。

1. **Shingling**: ドキュメントを、重なり合うトークン列（shingles）の集合に変換する

1. **Hashing**: 各 shingle に対して複数の独立した hash 関数を適用する

1. **Min Selection**: 各 hash 関数について、すべての shingle にわたる **最小** の hash 値を記録する

この全体のプロセスは以下の図で確認できます。

![CCzEwT7uchMqI6bsxRJcK1qenEh](https://zdoc-images.s3.us-west-2.amazonaws.com/CCzEwT7uchMqI6bsxRJcK1qenEh.png)

<Admonition type="info" icon="📘" title="Notes">

使用する hash 関数の数によって、MinHash シグネチャの次元数が決まります。次元数が大きいほど近似精度は向上しますが、その分ストレージと計算コストが増加します。

</Admonition>

### LSH for MinHash\{#lsh-for-minhash}

MinHash シグネチャは、ドキュメント間で厳密な Jaccard similarity を計算するコストを大幅に削減しますが、すべてのシグネチャベクトルのペアを総当たりで比較するのは、依然として大規模環境では非効率です。

これを解決するために [LSH](https://zilliz.com/learn/Local-Sensitivity-Hashing-A-Comprehensive-Guide) を使用します。LSH は、類似した項目が高い確率で同じ「bucket」に hash されるようにすることで、高速な近似類似検索を可能にし、すべてのペアを直接比較する必要を避けます。

このプロセスには次が含まれます。

1. **Signature segmentation:**

    *n* 次元の MinHash シグネチャを *b* 個の band に分割します。各 band には連続する *r* 個の hash 値が含まれるため、シグネチャ全体の長さは *n = b × r* を満たします。

    たとえば、128 次元の MinHash シグネチャ（*n = 128*）を 32 個の band（*b = 32*）に分割すると、各 band には 4 個の hash 値（*r = 4*）が含まれます。

1. **Band-level hashing:**

    分割後、各 band は標準的な hash 関数を使って個別に処理され、bucket に割り当てられます。2 つのシグネチャがある band 内で同じ hash 値を生成した場合、つまり同じ bucket に入った場合、それらは潜在的な一致候補とみなされます。

1. **Candidate selection:**

    少なくとも 1 つの band で衝突したペアが、類似候補として選択されます。

<Admonition type="info" icon="📘" title="Notes">

なぜこれでうまくいくのでしょうか？

数学的には、2 つのシグネチャの Jaccard similarity が $s$ の場合、

- 1 行（hash 位置）で同一である確率は $s$

- 1 つの band の全 $r$ 行で一致する確率は $s^r$

- **少なくとも 1 つの band** で一致する確率は &#36;1 - (1 - s^r)^b$

詳細については、[Locality-sensitive hashing](https://en.wikipedia.org/wiki/Locality-sensitive_hashing) を参照してください。

</Admonition>

128 次元の MinHash シグネチャを持つ 3 つのドキュメントを考えてみましょう。

![E1dewMnqshua0ib7aHmcL10lnIe](https://zdoc-images.s3.us-west-2.amazonaws.com/E1dewMnqshua0ib7aHmcL10lnIe.png)

まず、LSH は 128 次元のシグネチャを、それぞれ 4 つの連続する値からなる 32 個の band に分割します。

![PhSMwS74rh25oybv9Docmfionze](https://zdoc-images.s3.us-west-2.amazonaws.com/PhSMwS74rh25oybv9Docmfionze.png)

次に、各 band は hash 関数を使って異なる bucket に hash されます。同じ bucket を共有するドキュメントペアが、類似候補として選択されます。以下の例では、Document A と Document B は **Band 0** で hash 結果が衝突しているため、類似候補として選択されます。

![RfmMwNkIvhlUFSb11alcP8fqnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/RfmMwNkIvhlUFSb11alcP8fqnmf.png)

<Admonition type="info" icon="📘" title="Notes">

band の数は `mh_lsh_band` パラメータで制御されます。詳細については、[Index building params](./minhash-lsh#index-building-params) を参照してください。

</Admonition>

### MHJACCARD: Comparing MinHash signatures\{#mhjaccard-comparing-minhash-signatures}

MinHash シグネチャは、固定長のバイナリベクトルを使って集合間の Jaccard similarity を近似します。しかし、これらのシグネチャは元の集合を保持していないため、`JACCARD`、`L2`、`COSINE` などの標準的な metric を直接適用して比較することはできません。

この課題に対処するため、Zilliz Cloud は `MHJACCARD` という特殊な metric type を導入しており、これは MinHash シグネチャの比較専用に設計されています。

Zilliz Cloud で MinHash を使用する場合:

- vector field は `BINARY_VECTOR` 型である必要があります

- `index_type` は `MINHASH_LSH`（または `BIN_FLAT`）である必要があります

- `metric_type` は `MHJACCARD` に設定する必要があります

ほかの metric を使用すると、無効になるか、誤った結果になる可能性があります。

この metric type の詳細については、[MHJACCARD](./search-metrics-explained#mhjaccard) を参照してください。

### Deduplication workflow\{#deduplication-workflow}

MinHash LSH を活用した重複排除プロセスにより、Zilliz Cloud は collection に挿入する前に、ほぼ重複しているテキストや構造化レコードを効率的に識別して除外できます。

![It9wwbCFwhfT0RbwosAcGltZneb](https://zdoc-images.s3.us-west-2.amazonaws.com/It9wwbCFwhfT0RbwosAcGltZneb.png)

1. **Chunk & preprocess**: 入力されるテキストデータまたは構造化データ（例: レコード、フィールド）をチャンクに分割し、テキストを正規化（小文字化、句読点除去）し、必要に応じてストップワードを除去します。

1. **Feature construction**: MinHash に使用するトークン集合を構築します（例: テキストから作る shingle、構造化データでは連結したフィールドトークン）。

1. **MinHash signature generation**: 各チャンクまたはレコードに対して MinHash シグネチャを計算します。

1. **Binary vector conversion**: シグネチャを Milvus と互換性のあるバイナリベクトルに変換します。

1. **Search before insert**: MinHash LSH index を使用して、入力項目の近似重複を対象 collection 内で検索します。

1. **Insert & store**: 一意な項目のみを collection に挿入します。これらは今後の重複チェックのために検索可能になります。

</details>

## Prerequisites\{#prerequisites}

Zilliz Cloud で MinHash LSH を使用する前に、まず **MinHash signatures** を生成する必要があります。これらのコンパクトなバイナリシグネチャは、集合間の Jaccard similarity を近似するもので、Zilliz Cloud で `MHJACCARD` ベースの検索を行うために必要です。

<Admonition type="info" icon="📘" title="Notes">

`MINHASH_LSH` index 用の MinHash シグネチャは、次の 2 つの方法で準備できます。

- 外部ツールを使って自分でシグネチャを生成し、BINARY_VECTOR field に挿入する、または

- 組み込みの MinHash function を使って、テキストから互換性のあるバイナリベクトルを自動生成する。MinHash function のエンドツーエンドのワークフローと設定オプションについては、[MinHash Function](./minhash-function) を参照してください。

</Admonition>

### Choose a method to generate MinHash signatures\{#choose-a-method-to-generate-minhash-signatures}

ワークロードに応じて、次の方法を選択できます。

- シンプルさを重視して Python の [`datasketch`](https://ekzhu.github.io/datasketch/) を使用する（プロトタイピングに推奨）

- 大規模データセットには分散ツール（例: Spark、Ray）を使用する

- パフォーマンスチューニングが重要な場合はカスタムロジック（NumPy、C++ など）を実装する

このガイドでは、シンプルさと Zilliz Cloud の入力形式との互換性を考慮して `datasketch` を使用します。

### Install required libraries\{#install-required-libraries}

この例に必要なパッケージをインストールします。

```bash
pip install pymilvus datasketch numpy
```

### Generate MinHash signatures\{#generate-minhash-signatures}

256 次元の MinHash シグネチャを生成し、各 hash 値は 64 ビット整数で表現します。これは `MINHASH_LSH` で期待される vector format に一致します。

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

各シグネチャは 256 × 64 ビット = 2048 バイトです。このバイト文字列は `BINARY_VECTOR` field に直接挿入できます。Zilliz Cloud で使用される binary vector の詳細については、[Binary Vector](./use-binary-vector) を参照してください。

### (Optional) Prepare raw token sets (for refined search)\{#optional-prepare-raw-token-sets-for-refined-search}

デフォルトでは、Zilliz Cloud は MinHash シグネチャと LSH index のみを使用して近似近傍を見つけます。これは高速ですが、偽陽性を返したり、近い一致を見逃したりする可能性があります。

**正確な Jaccard similarity** が必要な場合、Zilliz Cloud は元の token set を使用する refined search をサポートしています。有効にするには、次を行います。

- token set を別の `VARCHAR` field として保存する

- [building index parameters](./minhash-lsh#build-index-parameters-and-create-collection) 時に `"with_raw_data": True` を設定する

- [performing similarity search](./minhash-lsh#perform-similarity-search) 時に `"mh_search_with_jaccard": True` を有効にする

**Token set extraction example**:

```python
def extract_token_set(text: str) -> str:
    tokens = set(text.lower().split())
    return " ".join(tokens)
```

## Use MinHash LSH\{#use-minhash-lsh}

MinHash ベクトルと元の token set の準備ができたら、Zilliz Cloud で `MINHASH_LSH` を使用して、それらを保存、index 化、検索できます。

### Connect to your cluster\{#connect-to-your-cluster}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")  # Update if your URI is different
```

### Define collection schema\{#define-collection-schema}

次を含む schema を定義します。

- primary key

- MinHash シグネチャ用の `BINARY_VECTOR` field

- 元の token set 用の `VARCHAR` field（refined search を有効にする場合）

- オプションで、元テキスト用の `document` field

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

- バイナリの MinHash シグネチャ

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

- **Approximate search** — MinHash シグネチャと LSH のみを使用し、高速ですが確率的な結果になります。

- **Refined search** — 元の token set を使用して Jaccard similarity を再計算し、精度を向上させます。

#### 5.1 Prepare the query\{#51-prepare-the-query}

類似検索を実行するには、クエリドキュメントの MinHash シグネチャを生成します。このシグネチャは、データ挿入時に使用したものと同じ次元数およびエンコーディング形式に一致している必要があります。

```python
query_text = "neural networks model patterns in data"
query_sig = generate_minhash_signature(query_text)
```

#### 5.2 Approximate search (LSH-only)\{#52-approximate-search-lsh-only}

これは高速でスケーラブルですが、近い一致を見逃したり、偽陽性を含んだりする可能性があります。

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

これにより、Zilliz Cloud に保存された元の token set を使用した正確な Jaccard 比較が有効になります。やや遅くなりますが、品質に敏感なタスクには推奨されます。

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

このセクションでは、index の構築およびその index に対する検索実行に使用されるパラメータの概要を示します。

### Index building params\{#index-building-params}

以下の表は、[building an index](./minhash-lsh#build-index-parameters-and-create-collection) 時に `params` で設定できるパラメータを示しています。

| Parameter | Description | Value Range | Tuning Suggestion |
| --- | --- | --- | --- |
| `mh_element_bit_width` | MinHash シグネチャ内の各 hash 値のビット幅。8 で割り切れる必要があります。 | 8, 16, 32, 64 | パフォーマンスと精度のバランスには `32` を使用します。より大規模なデータセットで高精度が必要な場合は `64` を使用します。許容可能な精度低下でメモリを節約したい場合は `16` を使用します。 |
| `mh_lsh_band` | LSH のために MinHash シグネチャを分割する band の数。recall とパフォーマンスのトレードオフを制御します。 | [1, *signature_length*] | 128 次元シグネチャの場合: まず 32 band（4 値/band）から始めます。より高い recall が必要なら 64 に増やし、より高いパフォーマンスが必要なら 16 に減らします。シグネチャ長を均等に割り切れる必要があります。 |
| `mh_lsh_code_in_mem` | LSH hash code を匿名メモリに保存するか（`true`）、メモリマッピングを使用するか（`false`）。 | true, false | 大規模データセット（>1M sets）ではメモリ使用量削減のため `false` を使用します。最大の検索速度が必要な小規模データセットでは `true` を使用します。 |
| `with_raw_data` | refinement のために、元の MinHash シグネチャを LSH code とともに保存するかどうか。 | true, false | 高精度が必要でストレージコストを許容できる場合は `true` を使用します。わずかな精度低下でストレージオーバーヘッドを最小化したい場合は `false` を使用します。 |
| `mh_lsh_bloom_false_positive_prob` | LSH bucket 最適化に使用される Bloom filter の false positive probability。 | [0.001, 0.1] | メモリ使用量と精度のバランスには `0.01` を使用します。低い値（`0.001`）は false positive を減らしますがメモリ使用量が増えます。高い値（`0.05`）はメモリを節約しますが精度が下がる可能性があります。 |

### Index-specific search params\{#index-specific-search-params}

以下の表は、[searching on the index](./minhash-lsh#perform-similarity-search) 時に `search_params.params` で設定できるパラメータを示しています。

| Parameter | Description | Value Range | Tuning Suggestion |
| --- | --- | --- | --- |
| `mh_search_with_jaccard` | refinement のために候補結果に対して厳密な Jaccard similarity 計算を実行するかどうか。 | true, false | 高精度が必要なアプリケーション（例: 重複排除）では `true` を使用します。わずかな精度低下を許容して高速な近似検索を行う場合は `false` を使用します。 |
| `refine_k` | Jaccard refinement 前に取得する候補数。`mh_search_with_jaccard` が `true` の場合のみ有効です。 | [*top_k*, *top_k &ast; 10*] | recall とパフォーマンスのバランスを良くするには、目的の *top_k* の 2～5 倍に設定します。大きい値ほど recall は向上しますが、計算コストも増加します。 |
| `mh_lsh_batch_search` | 複数の同時クエリに対して batch 最適化を有効にするかどうか。 | true, false | 複数クエリを同時に検索する場合はスループット向上のため `true` を使用します。単一クエリのシナリオではメモリオーバーヘッド削減のため `false` を使用します。 |
