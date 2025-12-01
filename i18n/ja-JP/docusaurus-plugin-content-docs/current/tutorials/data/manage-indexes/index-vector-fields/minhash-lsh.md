---
title: "MINHASH_LSH | Cloud"
slug: /minhash-lsh
sidebar_label: "MINHASH_LSH"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "効率的な重複除去と類似性検索は、大規模機械学習データセット、特に大規模言語モデル（LLM）の学習コーパスのクリーニングなどのタスクにとって重要です。数百万または数十億のドキュメントを扱う場合、従来の完全一致検索は遅くなりすぎてコストが高くなります。 | Cloud"
type: origin
token: BYtDwHuOXiG7imkyIjHcWa6fnlb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - vector field
  - index
  - minhash
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MINHASH_LSH

効率的な重複除去と類似性検索は、大規模機械学習データセット、特に大規模言語モデル（LLM）の学習コーパスのクリーニングなどのタスクにとって重要です。数百万または数十億のドキュメントを扱う場合、従来の完全一致検索は遅くなりすぎてコストが高くなります。

Zilliz Cloudの**MINHASH_LSH**インデックスは、以下の2つの強力な技術を組み合わせることで、高速でスケーラブルかつ正確な近似重複除去を可能にします。

- [MinHash](https://en.wikipedia.org/wiki/MinHash): ドキュメント類似性を推定するためのコンパクトな署名（または「フィンガープリント」）を迅速に生成します。

- [局所性鋭感ハッシュ（LSH）](https://en.wikipedia.org/wiki/Locality-sensitive_hashing): MinHash署名に基づいて類似ドキュメントのグループを迅速に検索します。

このガイドでは、Zilliz CloudでMINHASH_LSHを使用するための概念、前提条件、セットアップ、およびベストプラクティスについて説明します。

## 概要\{#overview}

### ジャッカード類似度\{#jaccard-similarity}

ジャッカード類似度は、2つの集合AとBの重複を測定し、正式には次のように定義されます。

$$
J(A, B) = \frac\{|A \cap B|}\{|A \cup B|}
$$

その値の範囲は0（完全に重複なし）から1（完全一致）です。

しかし、大規模データセット内のすべてのドキュメントペア間でジャッカード類似度を正確に計算することは計算量が多くなります。**n**が大きい場合、時間とメモリが**O(n²)**になります。これは、LLMの学習コーパスのクリーニングやウェブ規模のドキュメント分析などのユースケースでは現実的ではありません。

### MinHash署名: 近似ジャッカード類似度\{#minhash-signatures-approximate-jaccard-similarity}

[MinHash](https://en.wikipedia.org/wiki/MinHash)はジャッカード類似度を推定するための効率的な方法を提供する確率的技術です。これは、各集合をコンパクトな**署名ベクトル**に変換して、集合類似性を効率的に近似するために十分な情報を保存します。

**核心的なアイデア**:

2つの集合がより似ているほど、それらのMinHash署名が同じ位置で一致する可能性が高くなります。この性質により、MinHashは集合間のジャッカード類似度を近似できます。

この性質により、MinHashは集合を直接比較する必要なく集合間の**ジャッカード類似度を近似できます**。

MinHashプロセスには以下が含まれます。

1. **シャングリング**: ドキュメントを重複するトークン列（シャングル）の集合に変換します。

1. **ハッシュ化**: 各シャングルに複数の独立したハッシュ関数を適用します。

1. **最小値選択**: 各ハッシュ関数について、すべてのシャングル間の**最小**ハッシュ値を記録します。

以下に全体のプロセスを示します。

![CCzEwT7uchMqI6bsxRJcK1qenEh](/img/CCzEwT7uchMqI6bsxRJcK1qenEh.png)

<Admonition type="info" icon="📘" title="注意">

<p>使用するハッシュ関数の数は、MinHash署名の次元数を決定します。より高次元により良い近似精度が得られますが、ストレージと計算量が増加します。</p>

</Admonition>

### MinHashのためのLSH\{#lsh-for-minhash}

MinHash署名はドキュメント間の正確なジャッカード類似度計算のコストを大幅に削減しますが、すべての署名ベクトルペアを網羅的に比較するのはスケール時にまだ効率的ではありません。

これを解決するため、[LSH](https://zilliz.com/learn/Local-Sensitivity-Hashing-A-Comprehensive-Guide)が使用されます。LSHは、類似する項目が高確率で同じ「バケット」にハッシュされるようにすることで、高速な近似類似性検索を可能にし、すべてのペアを直接比較する必要性を回避します。

プロセスには以下が含まれます。

1. **署名セグメンテーション:**

    *n*次元のMinHash署名が*b*個のバンドに分割されます。各バンドには*r*個の連続したハッシュ値が含まれるため、合計署名長は*n = b × r*を満たします。

    例として、128次元のMinHash署名（*n = 128*）があり、32個のバンド（*b = 32*）に分割する場合、各バンドには4つのハッシュ値（*r = 4*）が含まれます。

1. **バンドレベルのハッシュ:**

    セグメンテーション後、各バンドは標準のハッシュ関数を使用して独立に処理され、バケットに割り当てられます。2つの署名がバンド内で同じハッシュ値を生成する場合（つまり、同じバケットに落ちる場合）は、潜在的な一致候補と見なされます。

1. **候補選択:**

    少なくとも1つのバンドで衝突したペアが類似性候補として選択されます。

<Admonition type="info" icon="📘" title="注意">

<p>なぜ効果的なのか？</p>
<p>数式的には、2つの署名がジャッカード類似度$s$の場合、</p>
<ul>
<li><p>1つの行（ハッシュ位置）で同一である確率は$s$です</p></li>
<li><p>バンド内のすべての$r$行が一致する確率は$s^r$です</p></li>
<li><p><strong>少なくとも1つのバンド</strong>で一致する確率は$1 - (1 - s^r)^b$です</p></li>
</ul>
<p>詳細については、<a href="https://en.wikipedia.org/wiki/Locality-sensitive_hashing">局所性鋭感ハッシュ</a>を参照してください。</p>

</Admonition>

128次元MinHash署名を持つ3つのドキュメントを考えてみましょう。

![E1dewMnqshua0ib7aHmcL10lnIe](/img/E1dewMnqshua0ib7aHmcL10lnIe.png)

まず、LSHは128次元署名を各4つの連続値からなる32個のバンドに分割します。

![PhSMwS74rh25oybv9Docmfionze](/img/PhSMwS74rh25oybv9Docmfionze.png)

その後、各バンドはハッシュ関数を使用して異なるバケットにハッシュされます。バケットを共有するドキュメントペアが類似性候補として選択されます。以下の例では、ドキュメントAとドキュメントBはハッシュ結果が**バンド0**で衝突するため、類似性候補として選択されます。

![RfmMwNkIvhlUFSb11alcP8fqnmf](/img/RfmMwNkIvhlUFSb11alcP8fqnmf.png)

<Admonition type="info" icon="📘" title="注意">

<p>バンド数は<code>mh_lsh_band</code>パラメータで制御されます。詳細については、<a href="./minhash-lsh#index-building-params">インデックス構築パラメータ</a>を参照してください。</p>

</Admonition>

### MHJACCARD: MinHash署名の比較\{#mhjaccard-comparing-minhash-signatures}

MinHash署名は固定長バイナリベクトルを使用して集合間のジャッカード類似度を近似します。しかし、これらの署名は元の集合を保持していないため、`JACCARD`、`L2`、または`COSINE`などの標準メトリックを直接使用して比較することはできません。

これを解決するため、Zilliz CloudはMinHash署名の比較に特化して設計された特別なメトリック型`MHJACCARD`を導入しています。

Zilliz CloudでMinHashを使用する場合：

- ベクトルフィールドは`BINARY_VECTOR`型である必要があります

- `index_type`は`MINHASH_LSH`（または`BIN_FLAT`）である必要があります

- `metric_type`は`MHJACCARD`に設定する必要があります

他のメトリックを使用すると、無効になるか誤った結果が得られます。

このメトリック型の詳細については、[MHJACCARD](./search-metrics-explained#mhjaccard)を参照してください。

### 重複除去ワークフロー\{#deduplication-workflow}

MinHash LSHによる重複除去プロセスにより、Zilliz Cloudはコレクションに挿入する前に、近い重複テキストまたは構造化レコードを効率的に識別してフィルタリングできます。

![NuokbSgbroyVPQx14fKcm37bnoh](/img/NuokbSgbroyVPQx14fKcm37bnoh.png)

1. **チャンキングと前処理**: 入力テキストデータまたは構造化データ（例：レコード、フィールド）をチャンクに分割します。必要に応じてテキストを正規化（小文字化、句読点の削除）し、ストップワードを削除します。

1. **特徴構築**: MinHashで使用するトークン集合を構築します（例：テキストからのシャングル、構造化データのフィールドトークンの連結）。

1. **MinHash署名生成**: 各チャンクまたはレコードのMinHash署名を計算します。

1. **バイナリベクトル変換**: 署名をMilvusと互換性のあるバイナリベクトルに変換します。

1. **挿入前検索**: MinHash LSHインデックスを使用して、入力アイテムの近い重複を対象コレクション内で検索します。

1. **挿入と保存**: 一意のアイテムのみをコレクションに挿入します。これらは将来の重複除去チェックで検索可能になります。

## 事前準備\{#prerequisites}

Zilliz CloudでMinHash LSHを使用する前に、まず**MinHash署名**を生成する必要があります。これらのコンパクトなバイナリ署名は集合間のジャッカード類似度を近似し、Zilliz Cloudの`MHJACCARD`ベースの検索に必要です。

### MinHash署名を生成する方法を選択\{#choose-a-method-to-generate-minhash-signatures}

ワークロードに応じて、以下から選択できます。

- シンプルな使用（プロトタイプ作成推奨）にはPythonの[`datasketch`](https://ekzhu.github.io/datasketch/)を使用

- 大規模データセットには分散ツール（例：Spark、Ray）を使用

- パフォーマンス調整が重要であればカスタムロジック（NumPy、C++など）を実装

このガイドでは、Zilliz Cloudの入力形式との簡潔さと互換性のため`datasketch`を使用します。

### 必要なライブラリをインストール\{#install-required-libraries}

この例に必要なパッケージをインストールしてください。

```bash
pip install pymilvus datasketch numpy
```

### MinHash署名を生成\{#generate-minhash-signatures}

256次元のMinHash署名を生成し、各ハッシュ値を64ビット整数として表します。これは`MINHASH_LSH`で期待されるベクトル形式と一致します。

```python
from datasketch import MinHash
import numpy as np

MINHASH_DIM = 256
HASH_BIT_WIDTH = 64

def generate_minhash_signature(text, num_perm=MINHASH_DIM) -> bytes:
    m = MinHash(num_perm=num_perm)
    for token in text.lower().split():
        m.update(token.encode("utf8"))
    return m.hashvalues.astype('>u8').tobytes()  # 2048バイトを返します
```

各署名は256 × 64ビット = 2048バイトです。このバイト文字列は`BINARY_VECTOR`フィールドに直接挿入できます。Zilliz Cloudで使用されるバイナリベクトルの詳細については、[バイナリベクトル](./use-binary-vector)を参照してください。

### （オプション）生のトークン集合を準備（精度向上検索用）\{#optional-prepare-raw-token-sets-for-refined-search}

デフォルトでは、Zilliz Cloudは近似近隣を検索するためにMinHash署名とLSHインデックスのみを使用します。これは高速ですが、誤検知を返すか近い一致を見逃す可能性があります。

**正確なジャッカード類似度**が必要な場合、Zilliz Cloudは元のトークン集合を使用した精度向上検索をサポートしています。これを有効にするには：

- トークン集合を別の`VARCHAR`フィールドとして保存

- [インデックスパラメータ構築時](./minhash-lsh#build-index-parameters-and-create-collection)に`"with_raw_data": True`を設定

- [類似性検索実行時](./minhash-lsh#perform-similarity-search)に`"mh_search_with_jaccard": True`を有効

**トークン集合抽出例**:

```python
def extract_token_set(text: str) -> str:
    tokens = set(text.lower().split())
    return " ".join(tokens)
```

## MinHash LSHの使用\{#use-minhash-lsh}

MinHashベクトルと元のトークン集合の準備ができたら、Zilliz Cloudの`MINHASH_LSH`を使用して保存、インデックス作成、および検索ができます。

### クラスタへの接続\{#connect-to-your-cluster}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")  # ご使用のURIが異なる場合は更新してください
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

以下を含むスキーマを定義します。

- プライマリキー

- MinHash署名用の`BINARY_VECTOR`フィールド

- （精度向上検索が有効になっている場合）元のトークン集合用の`VARCHAR`フィールド

- オプションで、元のテキスト用の`document`フィールド

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import DataType

VECTOR_DIM = MINHASH_DIM * HASH_BIT_WIDTH  # 256 × 64 = 8192ビット

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field("doc_id", DataType.INT64, is_primary=True)
schema.add_field("minhash_signature", DataType.BINARY_VECTOR, dim=VECTOR_DIM)
schema.add_field("token_set", DataType.VARCHAR, max_length=1000)  # 精度向上に必要
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

### インデックスパラメータ構築とコレクション作成\{#build-index-parameters-and-create-collection}

ジャッカード精度向上が有効な`MINHASH_LSH`インデックスを構築します。

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
        "mh_lsh_band": 16,                       # バンド数（128/16 = 各バンド8ハッシュ）
        "with_raw_data": True                    # ジャッカード精度向上に必要
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

### データ挿入\{#insert-data}

各ドキュメントについて、以下の準備を行います。

- バイナリMinHash署名

- シリアライズされたトークン集合文字列

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

### 類似性検索を実行\{#perform-similarity-search}

Zilliz CloudはMinHash LSHを使用した2つのモードの類似性検索をサポートしています。

- **近似検索** — ハッシュのみを使用し、高速だが確率的な結果を得るLSH。

- **精度向上検索** — 改善された正確性のために元のトークン集合を使用してジャッカード類似度を再計算します。

#### 5.1 クエリの準備\{#51-prepare-the-query}

類似性検索を実行するには、クエリドキュメントのMinHash署名を生成します。この署名はデータ挿入時に使用した次元およびエンコーディング形式と一致する必要があります。

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

これは高速でスケーラブルですが、近い一致を見逃すか誤検知を含める可能性があります。

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

#### 5.3 精度向上検索（精度重視で推奨）:\{#53-refined-search-recommended-for-accuracy}

これはZilliz Cloudに保存された元のトークン集合を使用した正確なジャッカード比較を有効にします。やや遅いですが、品質重視のタスクには推奨されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
search_params = {
    "metric_type": "MHJACCARD",
    "params": {
        "mh_search_with_jaccard": True,  # 真のジャッカード計算を有効化
        "refine_k": 5                    # 上位5候補を精度向上
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

このセクションでは、インデックス構築と検索に使用されるパラメータの概要を提供します。

### インデックス構築パラメータ\{#index-building-params}

以下の表は、[インデックス構築時](./minhash-lsh#build-index-parameters-and-create-collection)に`params`で構成可能なパラメータを一覧表示しています。

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
     <td><p>バランスの取れたパフォーマンスと精度には<code>32</code>を使用。より大きなデータセットで高精度が必要な場合は<code>64</code>を使用。メモリ節約と許容できる精度の喪失には<code>16</code>を使用。</p></td>
   </tr>
   <tr>
     <td><p><code>mh_lsh_band</code></p></td>
     <td><p>LSH用にMinHash署名を分割するバンド数。再現率とパフォーマンスのトレードオフを制御します。</p></td>
     <td><p>[1, <em>signature_length</em>]</p></td>
     <td><p>128次元署名の場合：32バンド（4値/バンド）から開始。再現率向上には64に増加、パフォーマンス向上には16に減少。署名長を均等に分割する必要があります。</p></td>
   </tr>
   <tr>
     <td><p><code>mh_lsh_code_in_mem</code></p></td>
     <td><p>LSHハッシュコードを匿名メモリに保存（<code>true</code>）するか、メモリマッピングを使用（<code>false</code>）するか。</p></td>
     <td><p>true, false</p></td>
     <td><p>大規模データセット（&gt;1M集合）にはメモリ使用量削減のため<code>false</code>を使用。最大検索速度が必要な小規模データセットには<code>true</code>を使用。</p></td>
   </tr>
   <tr>
     <td><p><code>with_raw_data</code></p></td>
     <td><p>精度向上のためにLSHコードとともに元のMinHash署名を保存するか。</p></td>
     <td><p>true, false</p></td>
     <td><p>高精度が必要でストレージコストが許容できる場合は<code>true</code>を使用。ストレージオーバーヘッドを最小限に抑え、わずかな精度低下を許容する場合は<code>false</code>を使用。</p></td>
   </tr>
   <tr>
     <td><p><code>mh_lsh_bloom_false_positive_prob</code></p></td>
     <td><p>LSHバケット最適化に使用されるブルームフィルタの誤検知確率。</p></td>
     <td><p>[0.001, 0.1]</p></td>
     <td><p>バランスの取れたメモリ使用量と精度には<code>0.01</code>を使用。より低い値（<code>0.001</code>）は誤検知を削減しますがメモリを増加させます。より高い値（<code>0.05</code>）はメモリを節約しますが精度を低下させる可能性があります。</p></td>
   </tr>
</table>

### インデックス固有の検索パラメータ\{#index-specific-search-params}

以下の表は、[インデックス検索時](./minhash-lsh#perform-similarity-search)に`search_params.params`で構成可能なパラメータを一覧表示しています。

<table>
   <tr>
     <th><p>パラメータ</p></th>
     <th><p>説明</p></th>
     <th><p>値の範囲</p></th>
     <th><p>調整の提案</p></th>
   </tr>
   <tr>
     <td><p><code>mh_search_with_jaccard</code></p></td>
     <td><p>精度向上のために候補結果に対して正確なジャッカード類似度計算を実行するか。</p></td>
     <td><p>true, false</p></td>
     <td><p>高精度が必要なアプリケーション（例：重複除去）には<code>true</code>を使用。わずかな精度の喪失が許容できる場合の高速近似検索には<code>false</code>を使用。</p></td>
   </tr>
   <tr>
     <td><p><code>refine_k</code></p></td>
     <td><p>ジャッカード精度向上前に取得する候補数。<code>mh_search_with_jaccard</code>が<code>true</code>の場合にのみ有効。</p></td>
     <td><p>[<em>top_k</em>, *top_k * 10*]</p></td>
     <td><p>良い再現率とパフォーマンスのバランスのためには、目的の<em>top_k</em>の2-5倍に設定してください。高い値は再現率を向上させますが計算コストが増加します。</p></td>
   </tr>
   <tr>
     <td><p><code>mh_lsh_batch_search</code></p></td>
     <td><p>複数の同時クエリのためのバッチ最適化を有効にするか。</p></td>
     <td><p>true, false</p></td>
     <td><p>複数クエリの同時検索でより良いスループットを求める場合は<code>true</code>を使用。メモリオーバーヘッドを削減するための単一クエリシナリオには<code>false</code>を使用。</p></td>
   </tr>
</table>