---
title: "MINHASH_LSH | BYOC"
slug: /minhash-lsh
sidebar_label: "MINHASH_LSH"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "効率的な重複排除と類似検索は、大規模な機械学習データセットにとって極めて重要です。特に、大規模言語モデル（LLM）の学習コーパスのクリーニングのようなタスクでは不可欠です。数百万から数十億件のドキュメントを扱う場合、従来の完全一致は遅すぎてコストも高くなります。 | BYOC"
type: origin
token: BYtDwHuOXiG7imkyIjHcWa6fnlb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# MINHASH_LSH

効率的な重複排除と類似検索は、大規模な機械学習データセットにとって極めて重要です。特に、大規模言語モデル（LLM）の学習コーパスのクリーニングのようなタスクでは不可欠です。数百万から数十億件のドキュメントを扱う場合、従来の完全一致は遅すぎてコストも高くなります。

Zilliz Cloud の **MINHASH_LSH** インデックスは、2 つの強力な手法を組み合わせることで、高速でスケーラブルかつ高精度な近似重複排除を実現します。

- [MinHash](https://en.wikipedia.org/wiki/MinHash): ドキュメントの類似度を推定するためのコンパクトなシグネチャ（または「フィンガープリント」）を高速に生成します。

- [Locality-Sensitive Hashing (LSH)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing): MinHash シグネチャに基づいて、類似したドキュメントのグループを高速に見つけます。

このガイドでは、Zilliz Cloud で MINHASH_LSH を使用するための概念、事前準備、セットアップ、ベストプラクティスについて説明します。

## 概要\{#overview}

<details>

<summary>動作の仕組みを表示</summary>

### Jaccard 類似度\{#jaccard-similarity}

Jaccard 類似度は、2 つの集合 A と B の重なりを測る指標で、形式的には次のように定義されます。

$$
J(A, B) = \frac{|A \cap B|}{|A \cup B|}
$$

値の範囲は 0（まったく重なりがない状態）から 1（完全に一致）です。

ただし、大規模なデータセット内のすべてのドキュメントペア間で Jaccard 類似度を厳密に計算するには計算コストがかかり、**n** が大きい場合は時間とメモリの両方で **O(n²)** になります。そのため、LLM 学習コーパスのクリーニングや Web 規模のドキュメント分析といったユースケースには適していません。

### MinHash シグネチャ: Jaccard 類似度の近似\{#minhash-signatures-approximate-jaccard-similarity}

[MinHash](https://en.wikipedia.org/wiki/MinHash) は、Jaccard 類似度を効率的に推定する確率的手法です。各集合をコンパクトな **シグネチャベクトル** に変換することで、集合の類似度を効率的に近似するために十分な情報を保持します。

**中核となる考え方**:

2 つの集合が類似しているほど、それぞれの MinHash シグネチャが同じ位置で一致する可能性が高くなります。この性質により、MinHash は集合間の Jaccard 類似度を近似できます。

この性質により、MinHash は集合全体を直接比較することなく、集合間の **Jaccard 類似度を近似** できます。

MinHash の処理は次のとおりです。

1. **シングリング**: ドキュメントを、重なり合うトークン列（shingle）の集合に変換します。

1. **ハッシュ化**: 各 shingle に複数の独立したハッシュ関数を適用します。

1. **最小値の選択**: ハッシュ関数ごとに、すべての shingle にわたる **最小** のハッシュ値を記録します。

処理全体の流れを以下の図に示します。

![CCzEwT7uchMqI6bsxRJcK1qenEh](https://zdoc-images.s3.us-west-2.amazonaws.com/CCzEwT7uchMqI6bsxRJcK1qenEh.png)

<Admonition type="info" title="Notes">

使用するハッシュ関数の数によって、MinHash シグネチャの次元数が決まります。次元数が大きいほど近似精度は向上しますが、その分ストレージと計算コストが増加します。

</Admonition>

### MinHash のための LSH\{#lsh-for-minhash}

MinHash シグネチャは、ドキュメント間で厳密な Jaccard 類似度を計算するコストを大幅に削減しますが、すべてのシグネチャベクトルのペアを総当たりで比較するのは、大規模環境では依然として非効率です。

この問題を解決するために [LSH](https://zilliz.com/learn/Local-Sensitivity-Hashing-A-Comprehensive-Guide) を使用します。LSH は、類似した項目が高い確率で同じ「バケット」にハッシュされるようにすることで、すべてのペアを直接比較する必要なく、高速な近似類似検索を可能にします。

この処理は次のとおりです。

1. **シグネチャの分割:**

    *n* 次元の MinHash シグネチャを *b* 個のバンドに分割します。各バンドには連続する *r* 個のハッシュ値が含まれるため、シグネチャ全体の長さは *n = b × r* を満たします。

    たとえば、128 次元の MinHash シグネチャ（*n = 128*）を 32 個のバンド（*b = 32*）に分割すると、各バンドには 4 個のハッシュ値（*r = 4*）が含まれます。

1. **バンド単位のハッシュ化:**

    分割後、各バンドは標準的なハッシュ関数によって個別に処理され、バケットに割り当てられます。2 つのシグネチャが同じバンド内で同じハッシュ値を生成した場合、つまり同じバケットに入った場合は、それらは一致候補と見なされます。

1. **候補の選択:**

    少なくとも 1 つのバンドで衝突したペアが、類似候補として選択されます。

<Admonition type="info" title="Notes">

なぜ機能するのか？

数学的には、2 つのシグネチャの Jaccard 類似度が $s$ である場合、

- 1 行（ハッシュ位置）で一致する確率は $s$ です

- 1 つのバンドの $r$ 行すべてで一致する確率は $s^r$ です

- **少なくとも 1 つのバンド** で一致する確率は &#36;1 - (1 - s^r)^b$ です

詳細については、[Locality-sensitive hashing](https://en.wikipedia.org/wiki/Locality-sensitive_hashing) を参照してください。

</Admonition>

128 次元の MinHash シグネチャを持つ 3 つのドキュメントを考えてみます。

![E1dewMnqshua0ib7aHmcL10lnIe](https://zdoc-images.s3.us-west-2.amazonaws.com/E1dewMnqshua0ib7aHmcL10lnIe.png)

まず、LSH は 128 次元のシグネチャを、それぞれ 4 つの連続する値を持つ 32 個のバンドに分割します。

![PhSMwS74rh25oybv9Docmfionze](https://zdoc-images.s3.us-west-2.amazonaws.com/PhSMwS74rh25oybv9Docmfionze.png)

次に、各バンドはハッシュ関数によって異なるバケットにハッシュされます。同じバケットを共有するドキュメントペアが類似候補として選択されます。以下の例では、Document A と Document B のハッシュ結果が **Band 0** で衝突するため、これらが類似候補として選択されます。

![RfmMwNkIvhlUFSb11alcP8fqnmf](https://zdoc-images.s3.us-west-2.amazonaws.com/RfmMwNkIvhlUFSb11alcP8fqnmf.png)

<Admonition type="info" title="Notes">

バンドの数は `mh_lsh_band` パラメータで制御します。詳細については、[インデックス構築パラメータ](./minhash-lsh#index-building-params) を参照してください。

</Admonition>

### MHJACCARD: MinHash シグネチャの比較\{#mhjaccard-comparing-minhash-signatures}

MinHash シグネチャは、固定長のバイナリベクトルを使って集合間の Jaccard 類似度を近似します。ただし、これらのシグネチャは元の集合を保持していないため、`JACCARD`、`L2`、`COSINE` などの標準的なメトリクスを直接適用して比較することはできません。

この課題に対応するため、Zilliz Cloud では MinHash シグネチャの比較専用に設計された `MHJACCARD` という特殊なメトリクスタイプを導入しています。

Zilliz Cloud で MinHash を使用する場合:

- ベクトルフィールドは `BINARY_VECTOR` 型である必要があります

- `index_type` は `MINHASH_LSH`（または `BIN_FLAT`）である必要があります

- `metric_type` は `MHJACCARD` に設定する必要があります

これ以外のメトリクスを使用すると、無効になるか、誤った結果が返されます。

このメトリクスタイプの詳細については、[MHJACCARD](./search-metrics-explained#mhjaccard) を参照してください。

### 重複排除のワークフロー\{#deduplication-workflow}

MinHash LSH を活用した重複排除プロセスにより、Zilliz Cloud はコレクションに挿入する前に、ほぼ重複したテキストや構造化レコードを効率的に特定して除外できます。

![It9wwbCFwhfT0RbwosAcGltZneb](https://zdoc-images.s3.us-west-2.amazonaws.com/It9wwbCFwhfT0RbwosAcGltZneb.png)

1. **チャンク化と前処理**: 入力するテキストデータまたは構造化データ（レコード、フィールドなど）をチャンクに分割し、テキストを正規化（小文字化、句読点の除去）して、必要に応じてストップワードを除去します。

1. **特徴の構築**: MinHash に使用するトークンセットを構築します（テキストの場合は shingle、構造化データの場合は連結したフィールドトークンなど）。

1. **MinHash シグネチャの生成**: 各チャンクまたはレコードの MinHash シグネチャを計算します。

1. **バイナリベクトルへの変換**: シグネチャを Milvus と互換性のあるバイナリベクトルに変換します。

1. **挿入前の検索**: MinHash LSH インデックスを使用して、対象のコレクションで入力項目の近似重複を検索します。

1. **挿入と保存**: 一意な項目のみをコレクションに挿入します。挿入された項目は、今後の重複チェックで検索できるようになります。

</details>

## 事前準備\{#prerequisites}

Zilliz Cloud で MinHash LSH を使用する前に、まず **MinHash シグネチャ** を生成する必要があります。これらのコンパクトなバイナリシグネチャは集合間の Jaccard 類似度を近似するもので、Zilliz Cloud で `MHJACCARD` ベースの検索を行うために必要です。

<Admonition type="info" title="Notes">

`MINHASH_LSH` インデックス用の MinHash シグネチャは、次の 2 つの方法で準備できます。

- 外部ツールを使用して自分でシグネチャを生成し、BINARY_VECTOR フィールドに挿入する、または

- 組み込みの MinHash 関数を使用して、テキストから互換性のあるバイナリベクトルを自動生成する。MinHash 関数のエンドツーエンドのワークフローと設定オプションについては、[MinHash 関数](./minhash-function) を参照してください。

</Admonition>

### MinHash シグネチャを生成する方法を選択する\{#choose-a-method-to-generate-minhash-signatures}

ワークロードに応じて、次のいずれかを選択できます。

- シンプルさを重視する場合は Python の [`datasketch`](https://ekzhu.github.io/datasketch/) を使用する（プロトタイピングに推奨）

- 大規模なデータセットには分散ツール（Spark、Ray など）を使用する

- パフォーマンスチューニングが重要な場合はカスタムロジック（NumPy、C++ など）を実装する

このガイドでは、シンプルさと Zilliz Cloud の入力形式との互換性を重視して `datasketch` を使用します。

### 必要なライブラリをインストールする\{#install-required-libraries}

この例に必要なパッケージをインストールします。

```bash
pip install pymilvus datasketch numpy
```

### MinHash シグネチャを生成する\{#generate-minhash-signatures}

ここでは 256 次元の MinHash シグネチャを生成し、各ハッシュ値は 64 ビット整数として表現します。これは `MINHASH_LSH` で想定されるベクトル形式に一致します。

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

各シグネチャは 256 × 64 ビット = 2048 バイトです。このバイト列は `BINARY_VECTOR` フィールドに直接挿入できます。Zilliz Cloud で使用されるバイナリベクトルの詳細については、[バイナリベクトル](./use-binary-vector) を参照してください。

### （任意）生のトークンセットを準備する（絞り込み検索用）\{#optional-prepare-raw-token-sets-for-refined-search}

デフォルトでは、Zilliz Cloud は MinHash シグネチャと LSH インデックスのみを使用して近似近傍を検索します。これは高速ですが、偽陽性が返されたり、近い一致を見逃したりする可能性があります。

**正確な Jaccard 類似度** が必要な場合、Zilliz Cloud は元のトークンセットを使用する絞り込み検索をサポートしています。これを有効にするには、次のようにします。

- トークンセットを別の `VARCHAR` フィールドとして保存する

- [インデックスパラメータを構築する](./minhash-lsh#build-index-parameters-and-create-collection) ときに `"with_raw_data": True` を設定する

- さらに [類似検索を実行する](./minhash-lsh#perform-similarity-search) ときに `"mh_search_with_jaccard": True` を有効にする

**トークンセットの抽出例**:

```python
def extract_token_set(text: str) -> str:
    tokens = set(text.lower().split())
    return " ".join(tokens)
```

## MinHash LSH を使用する\{#use-minhash-lsh}

MinHash ベクトルと元のトークンセットを準備できたら、`MINHASH_LSH` を使用して Zilliz Cloud でそれらを保存、インデックス化、検索できます。

### クラスターに接続する\{#connect-to-your-cluster}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")  # Update if your URI is different
```

### コレクションスキーマを定義する\{#define-collection-schema}

次の項目を含むスキーマを定義します。

- プライマリキー

- MinHash シグネチャ用の `BINARY_VECTOR` フィールド

- 元のトークンセット用の `VARCHAR` フィールド（絞り込み検索を有効にする場合）

- 任意で、元のテキスト用の `document` フィールド

```python
from pymilvus import DataType

VECTOR_DIM = MINHASH_DIM * HASH_BIT_WIDTH  # 256 × 64 = 8192 bits

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("doc_id", DataType.INT64, is_primary=True)
schema.add_field("minhash_signature", DataType.BINARY_VECTOR, dim=VECTOR_DIM)
schema.add_field("token_set", DataType.VARCHAR, max_length=1000)  # required for refinement
schema.add_field("document", DataType.VARCHAR, max_length=1000)
```

### インデックスパラメータを構築してコレクションを作成する\{#build-index-parameters-and-create-collection}

Jaccard による絞り込みを有効にした `MINHASH_LSH` インデックスを構築します。

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

インデックス構築パラメータの詳細については、[インデックス構築パラメータ](./minhash-lsh#index-building-params) を参照してください。

### データを挿入する\{#insert-data}

ドキュメントごとに、次のものを準備します。

- バイナリの MinHash シグネチャ

- シリアライズされたトークンセット文字列

- （任意）元のテキスト

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

### 類似検索を実行する\{#perform-similarity-search}

Zilliz Cloud では、MinHash LSH を使用した 2 つの類似検索モードをサポートしています。

- **近似検索** — MinHash シグネチャと LSH のみを使用し、高速ですが確率的な結果を返します。

- **絞り込み検索** — 元のトークンセットを使用して Jaccard 類似度を再計算し、精度を向上させます。

#### 5.1 クエリを準備する\{#51-prepare-the-query}

類似検索を実行するには、クエリドキュメントの MinHash シグネチャを生成します。このシグネチャは、データ挿入時に使用したものと同じ次元とエンコード形式である必要があります。

```python
query_text = "neural networks model patterns in data"
query_sig = generate_minhash_signature(query_text)
```

#### 5.2 近似検索（LSH のみ）\{#52-approximate-search-lsh-only}

高速でスケーラブルですが、近い一致を見逃したり、偽陽性が含まれたりする可能性があります。

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

#### 5.3 絞り込み検索（精度重視の場合に推奨）:\{#53-refined-search-recommended-for-accuracy}

Zilliz Cloud に保存された元のトークンセットを使用して、正確な Jaccard 比較を有効にします。やや低速ですが、品質が重要なタスクに推奨されます。

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

## インデックスパラメータ\{#index-params}

ここでは、インデックスの構築とインデックスでの検索に使用するパラメータの概要を説明します。

### インデックス構築パラメータ\{#index-building-params}

次の表は、[インデックスを構築する](./minhash-lsh#build-index-parameters-and-create-collection) ときに `params` で設定できるパラメータの一覧です。

| パラメータ | 説明 | 値の範囲 | チューニングの提案 |
| --- | --- | --- | --- |
| `mh_element_bit_width` | MinHash シグネチャ内の各ハッシュ値のビット幅。8 で割り切れる必要があります。 | 8, 16, 32, 64 | パフォーマンスと精度のバランスを取るには `32` を使用します。大規模なデータセットでより高い精度が必要な場合は `64` を使用します。許容できる精度低下と引き換えにメモリを節約するには `16` を使用します。 |
| `mh_lsh_band` | LSH のために MinHash シグネチャを分割するバンド数。再現率とパフォーマンスのトレードオフを制御します。 | [1, *signature_length*] | 128 次元のシグネチャの場合は、まず 32 バンドから開始します (4 values/band). 再現率を高めるには 64 に増やし、パフォーマンスを高めるには 16 に減らします。シグネチャ長を均等に分割できる必要があります。 |
| `mh_lsh_code_in_mem` | LSH ハッシュコードを匿名メモリに保存するか（`true`）、メモリマッピングを使用するか（`false`）。 | true, false | 大規模なデータセット（100 万セット超）では、メモリ使用量を減らすために `false` を使用します。最大の検索速度を必要とする小規模なデータセットでは `true` を使用します。 |
| `with_raw_data` | 絞り込みのために、LSH コードとあわせて元の MinHash シグネチャを保存するかどうか。 | true, false | 高い精度が必要でストレージコストを許容できる場合は `true` を使用します。わずかな精度低下と引き換えにストレージオーバーヘッドを最小化する場合は `false` を使用します。 |
| `mh_lsh_bloom_false_positive_prob` | LSH バケットの最適化で使用される Bloom フィルターの偽陽性確率。 | [0.001, 0.1] | メモリ使用量と精度のバランスを取るには `0.01` を使用します。値を小さくすると（`0.001`）偽陽性は減りますが、メモリ使用量が増えます。値を大きくすると（`0.05`）メモリは節約できますが、精度が低下する可能性があります。 |

### インデックス固有の検索パラメータ\{#index-specific-search-params}

次の表は、[インデックスで検索する](./minhash-lsh#perform-similarity-search) ときに `search_params.params` で設定できるパラメータの一覧です。

| パラメータ | 説明 | 値の範囲 | チューニングの提案 |
| --- | --- | --- | --- |
| `mh_search_with_jaccard` | 絞り込みのために、候補結果に対して正確な Jaccard 類似度計算を実行するかどうか。 | true, false | 高い精度が求められるアプリケーション（重複排除など）では `true` を使用します。多少の精度低下を許容できる場合は、より高速な近似検索のために `false` を使用します。 |
| `refine_k` | Jaccard による絞り込みの前に取得する候補数。`mh_search_with_jaccard` が `true` の場合にのみ有効です。 | [*top_k*, *top_k &ast; 10*] | 再現率とパフォーマンスのバランスを良くするには、目的の *top_k* の 2〜5 倍に設定します。値を大きくすると再現率は向上しますが、計算コストが増加します。 |
| `mh_lsh_batch_search` | 複数の同時クエリに対するバッチ最適化を有効にするかどうか。 | true, false | 複数のクエリを同時に検索してスループットを高める場合は `true` を使用します。単一クエリのシナリオでは、メモリオーバーヘッドを減らすために `false` を使用します。 |
