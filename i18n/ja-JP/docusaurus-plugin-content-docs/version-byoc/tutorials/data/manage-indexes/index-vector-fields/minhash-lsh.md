---
title: "MINHASH_LSH | BYOC"
slug: /minhash-lsh
sidebar_label: "MINHASH_LSH"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "大規模な機械学習データセットでは、効率的な重複排除と類似性検索が重要です。特に、大規模言語モデル（LLM）の学習コーパスのクリーニングなどのタスクにおいては、数百万または数十億のドキュメントを扱う場合、従来の正確一致は遅くコストが高くなります。| BYOC"
type: origin
token: BYtDwHuOXiG7imkyIjHcWa6fnlb
sidebar_position: 2
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - ベクトルフィールド
  - インデックス
  - minhash
  - 自然言語処理データベース
  - 安価なベクトルデータベース
  - 管理型ベクトルデータベース
  - Pinecone ベクトルデータベース

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MINHASH_LSH

効率的な重複排除と類似性検索は、大規模機械学習データセットにおいて特に重要です。大規模言語モデル（LLM）の学習コーパスのクリーニングなどのタスクにおいても不可欠です。数百万または数十億のドキュメントを扱う場合、従来の正確一致は遅くコストが高くなります。

Zilliz Cloudの**MINHASH_LSH**インデックスは、2つの強力な技術を組み合わせることで、高速、スケーラブル、かつ正確な近似重複排除を可能にします。

- [MinHash](https://en.wikipedia.org/wiki/MinHash)：ドキュメント類似性を推定するためのコンパクトな署名（または「フィンガープリント」）を迅速に生成します。

- [ローカリティセンシティブハッシング (LSH)](https://en.wikipedia.org/wiki/Locality-sensitive_hashing)：MinHash署名に基づいて類似ドキュメントのグループを迅速に検出します。

このガイドでは、Zilliz CloudでMINHASH_LSHを使用するための概念、前提条件、セットアップ、およびベストプラクティスについて説明します。

## 概要\{#overview}

### Jaccard類似度\{#jaccard-similarity}

Jaccard類似度は、2つの集合AとBの重なりを測定し、形式的には以下のように定義されます：

$$
J(A, B) = \frac\{|A \cap B|}\{|A \cup B|}
$$

その値の範囲は0（完全に非重複）から1（同一）です。

しかし、大規模データセット内のすべてのドキュメントペア間で正確なJaccard類似度を計算することは計算量が膨大で、**n**が大きい場合、時間とメモリの両方で**O(n²)**になります。これはLLM学習コーパスのクリーニングやWeb規模のドキュメント分析などの用途では現実的ではありません。

### MinHash署名：近似Jaccard類似度\{#minhash-signatures-approximate-jaccard-similarity}

[MinHash](https://en.wikipedia.org/wiki/MinHash)は、Jaccard類似度を推定する効率的な方法を提供する確率的手法です。各集合をコンパクトな**署名ベクトル**に変換し、集合の類似性を効率的に近似するのに十分な情報を保持します。

**核となる考え**：

2つの集合がどれほど類似しているかに応じて、それらのMinHash署名が同じ位置で一致する可能性が高くなります。この性質により、MinHashは集合間のJaccard類似度を近似できます。

この性質により、MinHashは集合間の**Jaccard類似度を近似**し、集合全体を直接比較する必要がなくなります。

MinHashプロセスには以下が含まれます：

1. **シングリング**：ドキュメントを重複するトークン列（シングル）の集合に変換

1. **ハッシング**：各シングルに複数の独立したハッシュ関数を適用

1. **最小値選択**：各ハッシュ関数について、すべてのシングルにわたる**最小**ハッシュ値を記録

以下に全プロセスを図示しています。

![CCzEwT7uchMqI6bsxRJcK1qenEh](/img/CCzEwT7uchMqI6bsxRJcK1qenEh.png)

<Admonition type="info" icon="📘" title="備考">

<p>使用するハッシュ関数の数はMinHash署名の次元数を決定します。次元数が高いほど近似精度が向上しますが、ストレージと計算のコストが増加します。</p>

</Admonition>

### MinHashのためのLSH\{#lsh-for-minhash}

MinHash署名はドキュメント間の正確なJaccard類似度を計算するコストを大幅に削減しますが、スケールにおいて署名ベクトルのすべてのペアを比較することは依然として非効率です。

これを解決するために、[LSH](https://zilliz.com/learn/Local-Sensitivity-Hashing-A-Comprehensive-Guide)が使用されます。LSHは、類似するアイテムが高確率で同じ「バケット」にハッシュされることを保証することで、高速な近似類似性検索を可能にします。これにより、すべてのペアを直接比較する必要がなくなります。

プロセスには以下が含まれます：

1. **署名セグメンテーション**：

    *n*次元MinHash署名は*b*個の帯（バンド）に分割されます。各帯には*r*個の連続するハッシュ値が含まれ、合計署名長は*n = b × r*を満たします。

    たとえば、128次元のMinHash署名（*n = 128*）があり、32個の帯（*b = 32*）に分割する場合、各帯には4個のハッシュ値（*r = 4*）が含まれます。

1. **帯レベルのハッシング**：

    セグメンテーション後、各帯は標準のハッシュ関数を使用して個別に処理され、バケットに割り当てられます。2つの署名が帯内で同じハッシュ値を生成する場合（つまり、同じバケットに属する場合）、潜在的な一致候補とみなされます。

1. **候補選択**：

    少なくとも1つの帯で衝突するペアが類似候補として選択されます。

<Admonition type="info" icon="📘" title="備考">

<p>なぜこれで機能するのか？</p>
<p>数学的に、2つの署名がJaccard類似度$s$を持つ場合、</p>
<ul>
<li><p>ある行（ハッシュ位置）で同一である確率は$s$です</p></li>
<li><p>帯内のすべての$r$行で一致する確率は$s^r$です</p></li>
<li><p><strong>少なくとも1つの帯</strong>で一致する確率は$1 - (1 - s^r)^b$です</p></li>
</ul>
<p>詳細については、<a href="https://en.wikipedia.org/wiki/Locality-sensitive_hashing">ローカリティセンシティブハッシング</a>を参照してください。</p>

</Admonition>

128次元のMinHash署名を持つ3つのドキュメントを例に考えます。

![E1dewMnqshua0ib7aHmcL10lnIe](/img/E1dewMnqshua0ib7aHmcL10lnIe.png)

まず、LSHは128次元の署名を4個の連続する値を持つ32個の帯に分割します。

![PhSMwS74rh25oybv9Docmfionze](/img/PhSMwS74rh25oybv9Docmfionze.png)

次に、各帯はハッシュ関数を使用して異なるバケットにハッシュされます。バケットを共有するドキュメントペアが類似候補として選択されます。以下の例では、ドキュメントAとドキュメントBはハッシュ結果が**帯0**で衝突するため、類似候補として選択されます。

![RfmMwNkIvhlUFSb11alcP8fqnmf](/img/RfmMwNkIvhlUFSb11alcP8fqnmf.png)

<Admonition type="info" icon="📘" title="備考">

<p>帯の数は<code>mh_lsh_band</code>パラメータで制御されます。詳細については、<a href="./minhash-lsh#index-building-params">インデックス構築パラメータ</a>を参照してください。</p>

</Admonition>

### MHJACCARD：MinHash署名の比較\{#mhjaccard-comparing-minhash-signatures}

MinHash署名は固定長バイナリベクトルを使用して集合間のJaccard類似度を近似します。ただし、これらの署名は元の集合を保持しないため、`JACCARD`、`L2`、`COSINE`などの標準メトリックを直接比較に使用することはできません。

これを解決するために、Zilliz Cloudは`MHJACCARD`と呼ばれる特殊なメトリックタイプを導入し、MinHash署名の比較に特化して設計されています。

Zilliz CloudでMinHashを使用する場合：

- ベクトルフィールドは`BINARY_VECTOR`型でなければなりません

- `index_type`は`MINHASH_LSH`（または`BIN_FLAT`）でなければなりません

- `metric_type`は`MHJACCARD`に設定しなければなりません

他のメトリックを使用すると無効になるか、不正確な結果が得られます。

このメトリックタイプの詳細については、[MHJACCARD](./search-metrics-explained#mhjaccard)を参照してください。

### 重複排除ワークフロー\{#deduplication-workflow}

MinHash LSHによる重複排除プロセスにより、Zilliz Cloudはコレクションに挿入する前に、近似的な重複テキストまたは構造化レコードを効率的に識別してフィルタリングできます。

![NuokbSgbroyVPQx14fKcm37bnoh](/img/NuokbSgbroyVPQx14fKcm37bnoh.png)

1. **チャンク分割と前処理**：入ってくるテキストデータまたは構造化データ（例：レコード、フィールド）をチャンクに分割し、テキストを正規化（小文字化、句読点の削除）し、必要に応じてストップワードを削除します。

1. **特徴量構築**：MinHashに使用するトークンセットを構築します（例：テキストからのシングル、構造化データのための結合されたフィールドトークン）。

1. **MinHash署名生成**：各チャンクまたはレコードのMinHash署名を計算します。

1. **バイナリベクトル変換**：署名をMilvusと互換性のあるバイナリベクトルに変換します。

1. **挿入前検索**：MinHash LSHインデックスを使用して、入ってくるアイテムの近似重複をターゲットコレクションで検索します。

1. **挿入と保存**：一意のアイテムのみをコレクションに挿入します。これらは将来の重複排除チェックで検索可能になります。

## 前提条件\{#prerequisites}

Zilliz CloudでMinHash LSHを使用する前に、まず**MinHash署名**を生成する必要があります。これらのコンパクトなバイナリ署名は集合間のJaccard類似度を近似し、Zilliz Cloudの`MHJACCARD`ベースの検索に必要です。

### MinHash署名生成方法の選択\{#choose-a-method-to-generate-minhash-signatures}

ワークロードに応じて、以下から選択できます。

- シンプルな使用のためにPythonの[`datasketch`](https://ekzhu.github.io/datasketch/)を使用（プロトタイピングに推奨）

- 大規模データセットのための分散ツール（例：Spark、Ray）を使用

- パフォーマンス調整が重要な場合はカスタムロジック（NumPy、C++など）を実装

このガイドでは、Zilliz Cloud入力形式との簡潔さと互換性のために`datasketch`を使用します。

### 必要なライブラリのインストール\{#install-required-libraries}

この例に必要なパッケージをインストールします：

```bash
pip install pymilvus datasketch numpy
```

### MinHash署名の生成\{#generate-minhash-signatures}

256次元のMinHash署名を生成し、各ハッシュ値を64ビット整数として表します。これは`MINHASH_LSH`に期待されるベクトル形式に一致します。

```python
from datasketch import MinHash
import numpy as np

MINHASH_DIM = 256
HASH_BIT_WIDTH = 64

def generate_minhash_signature(text, num_perm=MINHASH_DIM) -> bytes:
    m = MinHash(num_perm=num_perm)
    for token in text.lower().split():
        m.update(token.encode("utf8"))
    return m.hashvalues.astype('>u8').tobytes()  # 2048バイトを返す
```

各署名は256 × 64ビット = 2048バイトです。このバイト列は直接`BINARY_VECTOR`フィールドに挿入できます。Zilliz Cloudで使用されるバイナリベクトルの詳細については、[バイナリベクトル](./use-binary-vector)を参照してください。

### （オプション）生のトークンセットの準備（精製検索用）\{#optional-prepare-raw-token-sets-for-refined-search}

デフォルトでは、Zilliz CloudはMinHash署名とLSHインデックスのみを使用して近似的な近傍を検索します。これは高速ですが、誤検知が発生したり、近い一致を見逃す可能性があります。

**正確なJaccard類似度**が必要な場合、Zilliz Cloudは元のトークンセットを使用する精製検索をサポートします。これを有効にするには：

- トークンセットを別個の`VARCHAR`フィールドとして保存

- [インデックスパラメータ構築](./minhash-lsh#build-index-parameters-and-create-collection)時に`"with_raw_data": True`を設定

- [類似性検索実行](./minhash-lsh#perform-similarity-search)時に`"mh_search_with_jaccard": True`を有効

**トークンセット抽出例**：

```python
def extract_token_set(text: str) -> str:
    tokens = set(text.lower().split())
    return " ".join(tokens)
```

## MinHash LSHの使用\{#use-minhash-lsh}

MinHashベクトルと元のトークンセットの準備ができれば、Zilliz Cloudで`MINHASH_LSH`を使用して保存、インデックス作成、検索できます。

### クラスターへの接続\{#connect-to-your-cluster}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")  # URIが異なる場合は更新してください
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### コレクションスキーマの定義\{#define-collection-schema}

以下を含むスキーマを定義：

- 主キー

- MinHash署名用の`BINARY_VECTOR`フィールド

- 元のトークンセット用の`VARCHAR`フィールド（精製検索が有効な場合）

- オプションで、元のテキスト用の`document`フィールド

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType

VECTOR_DIM = MINHASH_DIM * HASH_BIT_WIDTH  # 256 × 64 = 8192ビット

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("doc_id", DataType.INT64, is_primary=True)
schema.add_field("minhash_signature", DataType.BINARY_VECTOR, dim=VECTOR_DIM)
schema.add_field("token_set", DataType.VARCHAR, max_length=1000)  # 精製に必要
schema.add_field("document", DataType.VARCHAR, max_length=1000)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### インデックスパラメータの構築とコレクションの作成\{#build-index-parameters-and-create-collection}

Jaccard精製が有効な`MINHASH_LSH`インデックスを構築：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="minhash_signature",
    index_type="MINHASH_LSH",
    metric_type="MHJACCARD",
    params={
        "mh_element_bit_width": HASH_BIT_WIDTH,  # 署名ビット幅と一致する必要があります
        "mh_lsh_band": 16,                       # 帯数（128/16 = 各帯8ハッシュ）
        "with_raw_data": True                    # Jaccard精製に必要
    }
)

client.create_collection("minhash_demo", schema=schema, index_params=index_params)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

インデックス構築パラメータの詳細については、[インデックス構築パラメータ](./minhash-lsh#index-building-params)を参照してください。

### データの挿入\{#insert-data}

各ドキュメントについて、以下を準備：

- バイナリMinHash署名

- シリアライズされたトークンセット文字列

- （オプション）元のテキスト

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

### 類似性検索の実行\{#perform-similarity-search}

Zilliz CloudはMinHash LSHを使用する類似性検索の2つのモードをサポートしています。

- **近似検索** — MinHash署名とLSHのみを使用して高速だが確率的な結果を得ます。

- **精製検索** — 元のトークンセットを使用してJaccard類似度を再計算し、精度を向上させます。

#### 5.1 クエリの準備\{#51-prepare-the-query}

類似性検索を行うには、クエリドキュメントのMinHash署名を生成します。この署名はデータ挿入時に使用した同じ次元とエンコーディング形式と一致しなければなりません。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
query_text = "neural networks model patterns in data"
query_sig = generate_minhash_signature(query_text)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

#### 5.2 近似検索（LSHのみ）\{#52-approximate-search-lsh-only}

これは高速でスケーラブルですが、近い一致を見逃したり、誤検知を含めたりする可能性があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

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
    print(f"{i+1}. 類似度: {sim:.3f} | {hit['entity']['document']}")
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

#### 5.3 精製検索（精度重視で推奨）\{#53-refined-search-recommended-for-accuracy}

これはZilliz Cloudに保存された元のトークンセットを使用した正確なJaccard比較を有効にします。少し遅いですが、品質重視のタスクに推奨されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
search_params = {
    "metric_type": "MHJACCARD",
    "params": {
        "mh_search_with_jaccard": True,  # 実際のJaccard計算を有効化
        "refine_k": 5                    # 上位5候補を精製
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
    print(f"{i+1}. 類似度: {sim:.3f} | {hit['entity']['document']}")
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

## インデックスパラメータ\{#index-params}

このセクションでは、インデックスの構築とインデックス上での検索に使用されるパラメータの概要を説明します。

### インデックス構築パラメータ\{#index-building-params}

以下の表は、[インデックス構築](./minhash-lsh#build-index-parameters-and-create-collection)時に`params`で設定できるパラメータをリストしています。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
     <th><p>値の範囲</p></th>
     <th><p>調整の提案</p></th>
   </tr>
   <tr>
     <td><p><code>mh_element_bit_width</code></p></td>
     <td><p>MinHash署名内の各ハッシュ値のビット幅。8で割り切れる必要があります。</p></td>
     <td><p>8, 16, 32, 64</p></td>
     <td><p>バランスの取れたパフォーマンスと精度には<code>32</code>を使用。大規模データセットで高精度が必要な場合は<code>64</code>を使用。メモリを節約し許容できる精度の低下で済む場合は<code>16</code>を使用。</p></td>
   </tr>
   <tr>
     <td><p><code>mh_lsh_band</code></p></td>
     <td><p>LSH用にMinHash署名を分割する帯（バンド）の数。再現率とパフォーマンスのトレードオフを制御します。</p></td>
     <td><p>[1, <em>署名長</em>]</p></td>
     <td><p>128次元署名の場合：32帯（各帯4値）から始めてください。再現率を高めるには64に増やし、パフォーマンスを向上させるには16に減らしてください。署名長を均等に分割する必要があります。</p></td>
   </tr>
   <tr>
     <td><p><code>mh_lsh_code_in_mem</code></p></td>
     <td><p>LSHハッシュコードを匿名メモリ（<code>true</code>）に保存するか、メモリマッピング（<code>false</code>）を使用するか。</p></td>
     <td><p>true, false</p></td>
     <td><p>大規模データセット（&gt;100万セット）ではメモリ使用量を削減するために<code>false</code>を使用。最大検索速度を必要とする小規模データセットでは<code>true</code>を使用。</p></td>
   </tr>
   <tr>
     <td><p><code>with_raw_data</code></p></td>
     <td><p>精製のためにLSHコードに加えて元のMinHash署名を保存するか。</p></td>
     <td><p>true, false</p></td>
     <td><p>高精度が必要でストレージコストが許容できる場合は<code>true</code>を使用。ストレージオーバーヘッドを最小限に抑え、わずかな精度低下で済む場合は<code>false</code>を使用。</p></td>
   </tr>
   <tr>
     <td><p><code>mh_lsh_bloom_false_positive_prob</code></p></td>
     <td><p>LSHバケット最適化で使用されるブルームフィルタの誤検知確率。</p></td>
     <td><p>[0.001, 0.1]</p></td>
     <td><p>バランスの取れたメモリ使用量と精度には<code>0.01</code>を使用。低い値（<code>0.001</code>）は誤検知を減少させますがメモリを増加させます。高い値（<code>0.05</code>）はメモリを節約しますが精度が低下する可能性があります。</p></td>
   </tr>
</table>

### インデックス固有の検索パラメータ\{#index-specific-search-params}

以下の表は、[インデックス検索](./minhash-lsh#perform-similarity-search)時に`search_params.params`で設定できるパラメータをリストしています。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
     <th><p>値の範囲</p></th>
     <th><p>調整の提案</p></th>
   </tr>
   <tr>
     <td><p><code>mh_search_with_jaccard</code></p></td>
     <td><p>精製のために候補結果上で正確なJaccard類似度計算を実行するか。</p></td>
     <td><p>true, false</p></td>
     <td><p>高精度が必要なアプリケーション（例：重複排除）では<code>true</code>を使用。わずかな精度低下が許容できる場合は高速な近似検索のために<code>false</code>を使用。</p></td>
   </tr>
   <tr>
     <td><p><code>refine_k</code></p></td>
     <td><p>Jaccard精製前に取得する候補数。<code>mh_search_with_jaccard</code>が<code>true</code>の場合にのみ有効。</p></td>
     <td><p>[<em>top_k</em>, *top_k * 10*]</p></td>
     <td><p>良い再現率と性能のバランスのために、望ましい<em>top_k</em>の2-5倍に設定。値を高くすると再現率は向上しますが計算コストも増加します。</p></td>
   </tr>
   <tr>
     <td><p><code>mh_lsh_batch_search</code></p></td>
     <td><p>複数の同時クエリのためのバッチ最適化を有効にするか。</p></td>
     <td><p>true, false</p></td>
     <td><p>複数のクエリを同時に検索してより良いスループットを得るには<code>true</code>を使用。メモリオーバーヘッドを減らすには単一クエリの場合は<code>false</code>を使用。</p></td>
   </tr>
</table>
