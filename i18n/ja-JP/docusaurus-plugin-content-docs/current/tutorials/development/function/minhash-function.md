---
title: "MinHash 関数 | Cloud"
slug: /minhash-function
sidebar_label: "MinHash 関数"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "MinHash 関数は、生テキストをドキュメント間の Jaccard 類似度を近似するバイナリベクトルに変換します。テキストシングリングと複数のハッシュ関数を適用して固定長のシグネチャベクトルを生成し、大規模なニアデュプリケート検出やドキュメントの重複排除を実現します。 | Cloud"
type: origin
token: EAwdw2ZbtiBKttk66FTctUebn7f
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MinHash 関数

**MinHash 関数**は、生テキストをドキュメント間の [Jaccard 類似度](https://en.wikipedia.org/wiki/Jaccard_index) を近似する**バイナリベクトル**に変換します。テキストシングリングと複数のハッシュ関数を適用して固定長のシグネチャベクトルを生成し、大規模なニアデュプリケート検出やドキュメントの重複排除を実現します。

MinHash は組み込み関数として Zilliz Cloud 内で実行されるため、外部モデルの推論や前処理は不要です。生テキストを挿入するだけで、Zilliz Cloud が MinHash シグネチャベクトルを自動的に生成します。

## 制限事項\{#limits}

- 各 MinHash シグネチャは 32 ビットのハッシュ値であるため、出力フィールドは次元が `dim % 32 == 0` を満たす `BINARY_VECTOR` である必要があります。

- バイナリベクトルフィールドの `dim` は `32 * num_hashes` と一致している必要があります。一致しない場合はエラーが発生します。

- MinHash 関数の出力に対して `MINHASH_LSH` インデックスを使用する場合、`mh_element_bit_width` を `32` に設定する必要があります。

## MinHash の仕組み\{#how-minhash-works}

<details>

<summary>展開して仕組みを確認</summary>

[MinHash](https://en.wikipedia.org/wiki/MinHash) は、集合間の [Jaccard 類似度](https://en.wikipedia.org/wiki/Jaccard_index) を推定するための局所性鋭敏ハッシュ手法です。Zilliz Cloud における MinHash 関数のパイプラインは次のとおりです。生テキストを入力すると、中間処理がすべて内部で行われ、Zilliz Cloud からバイナリベクトルが出力されます。

全体のワークフローは、ドキュメントの取り込みとクエリ処理の両方で共通の**共有テキスト処理パイプライン**と、その後に続く保存・検索用のフェーズ固有の処理で構成されます。

![IaqkbFEh8oQgGSx6NsocFoSOnDo](https://zdoc-images.s3.us-west-2.amazonaws.com/iaqkbfeh8oqggsx6nsocfosondo.png "IaqkbFEh8oQgGSx6NsocFoSOnDo")

### 共有テキスト処理パイプライン\{#shared-text-processing-pipeline}

ドキュメントの取り込みとクエリ処理のいずれも、生テキストに対して同じ 4 段階の変換処理を行います。

1. **テキスト分析**: `token_level` が `"word"` の場合は [アナライザー](./analyzer-overview) によってテキストが処理され、`token_level` が `"char"` の場合はテキストがそのまま使用されます。単語レベルのトークン化では、入力フィールドに設定されたアナライザーを使用してテキストをタームに分割します。たとえば、`"milvus is vector db"` は `["milvus", "is", "vector", "db"]` となります。

1. **シングリング**: トークンをサイズ `shingle_size` の重複する n-gram（シングル）に分割します。たとえば、単語レベルの 3-gram の場合、トークン `["information", "retrieval", "is", "a", "field"]` は `["information retrieval is", "retrieval is a", "is a field"]` のようなシングルになります。

1. **MinHash シグネチャ生成**: 複数のハッシュ関数(H1、H2、...、Hn、ここで n = `num_hashes`)がシングル集合に適用されます。各ハッシュ関数について、すべてのシングルにわたる最小ハッシュ値が選択されます。これらの最小値のコレクションが MinHash シグネチャを形成します。これは、元のドキュメントの Jaccard 類似度を近似する固定長の表現です。

1. **バイナリベクトルへのエンコード**: 各シグネチャ値は 32 ビットのハッシュであり、シグネチャ全体が次元 `32 * num_hashes` の `BINARY_VECTOR` にパックされます。

### ドキュメントの取り込み\{#document-ingestion}

データの挿入時、共有パイプラインで生成されたバイナリベクトルが `MINHASH_LSH` インデックスに格納されます。このインデックスは LSH（Locality-Sensitive Hashing）テーブルを管理し、類似したシグネチャを同じバケットにグループ化することで、クエリ時の候補取得を高速化します。

### クエリ処理\{#query-processing}

検索時は、クエリテキストが同じ共有パイプラインを通ってバイナリベクトルに変換されます。このベクトルを用いて `MINHASH_LSH` インデックス上で LSH ルックアップが行われ、類似性の高い候補ペアが迅速に特定されます。Jaccard リファインメントが無効の場合、Zilliz Cloud は推定 Jaccard 類似度によるランキングを行わずに LSH 候補を返します。有効にすると、Zilliz Cloud が格納済みの生の MinHash シグネチャに基づいて候補を推定 Jaccard 類似度で並べ替え、top-K の結果を返します。

どちらの経路でも同じ変換ロジックが使われるため、内容が大きく重複する 2 つのドキュメントからは類似した MinHash シグネチャが生成されます。これにより、語順、書式、細かな言い回しの違いがあっても、ニアデュプリケートを効果的に検出できます。

</details>

## 事前準備\{#before-you-start}

MinHash 関数を使用する前に、以下の要素を含むようにコレクションスキーマを設計してください。

- **生コンテンツ用のテキストフィールド**

    コレクションには、生テキストを格納するための `VARCHAR` フィールドが必要です。このフィールドが MinHash 関数の入力となります。

- **テキストフィールド用のアナライザー**（単語レベルのトークン化を使用する場合）

    `token_level` が `"word"`（デフォルト）に設定されている場合、テキストフィールドでアナライザーを有効にする必要があります。アナライザーは、シングリング前のテキストのトークン化方法を定義します。デフォルトでは、Zilliz Cloud は `standard` アナライザーを使用します。別のアナライザーを設定する場合は、[ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **MinHash 出力用のバイナリベクトルフィールド**

    コレクションには、MinHash 関数で生成されるバイナリベクトルを格納するための `BINARY_VECTOR` フィールドが必要です。次元は `32 * num_hashes` と一致している必要があります。

## ステップ 1: MinHash 関数付きのコレクションを作成する\{#step-1-create-a-collection-with-a-minhash-function}

MinHash 関数を使用するには、コレクション作成時に関数を定義します。この関数はコレクションスキーマの一部となり、データの挿入および検索時に自動的に適用されます。

### スキーマフィールドの定義\{#define-schema-fields}

コレクションスキーマには、少なくとも次の 3 つのフィールドを含める必要があります。

- **プライマリフィールド**: コレクション内の各エンティティを一意に識別します。

- **テキストフィールド**（`VARCHAR`）: 生テキストドキュメントを格納します。`enable_analyzer=True` を設定することで、Zilliz Cloud が MinHash シグネチャ生成のためにテキストを処理できるようになります。デフォルトでは、Zilliz Cloud はテキスト分析に `standard` アナライザーを使用します。別のアナライザーを設定する場合は、[ユースケースに適したアナライザーの選択](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **バイナリベクトルフィールド**（`BINARY_VECTOR`）: MinHash 関数によって自動生成されたバイナリベクトルを格納します。次元は `32 * num_hashes` と一致している必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType, Function, FunctionType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

schema = client.create_schema()

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(field_name="document_content", datatype=DataType.VARCHAR, max_length=9000, enable_analyzer=True)
schema.add_field(field_name="binary_vector", datatype=DataType.BINARY_VECTOR, dim=8192)
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

### MinHash 関数を定義する\{#define-the-minhash-function}

MinHash 関数は、解析済みのテキストをバイナリベクトルに変換し、ドキュメント間の Jaccard 類似度を近似します。

関数を定義してスキーマに追加します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
minhash_function = Function(
    name="minhash_function",
    input_field_names=["document_content"], # Name of the VARCHAR field containing raw text
    output_field_names=["binary_vector"], # Name of the BINARY_VECTOR field for generated signatures
    function_type=FunctionType.MINHASH,
    params={
        "num_hashes": 256, # Number of hash functions; produces dim = 32 * 256 = 8192
        "shingle_size": 3, # N-gram size for shingling
    }
)

schema.add_function(minhash_function)
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

**設定オプション**

MinHash 関数の `params` 辞書では、以下のパラメーターを指定できます。すべてのパラメーター名は**大文字・小文字を区別しません**。

<table>
   <tr>
     <th><p><strong>パラメーター</strong></p></th>
     <th><p><strong>型</strong></p></th>
     <th><p><strong>デフォルト</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>num_hashes</code></p></td>
     <td><p>int</p></td>
     <td><p><code>dim / 32</code> から導出</p></td>
     <td><p>シグネチャ生成に用いるハッシュ関数の数です。出力されるバイナリベクトルの次元は <code>32 &ast; num_hashes</code> になります。値を大きくすると類似度推定のばらつきは抑えられますが、計算量が増加します。推奨値: <code>256</code> (dim = 8192)。</p></td>
   </tr>
   <tr>
     <td><p><code>shingle_size</code></p></td>
     <td><p>int</p></td>
     <td><p><code>3</code></p></td>
     <td><p>シングリングに使用する N-gram のサイズです。単語レベルの場合は 1〜3、文字レベルの場合は 2〜6 が一般的です。</p></td>
   </tr>
   <tr>
     <td><p><code>hash_function</code></p></td>
     <td><p>str</p></td>
     <td><p><code>&quot;xxhash&quot;</code></p></td>
     <td><p>使用するハッシュ関数です。選択肢:</p><ul><li><p><code>&quot;xxhash&quot;</code> (高速)</p></li><li><p><code>&quot;sha1&quot;</code> (低速だが衝突耐性が高い)。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>token_level</code></p></td>
     <td><p>str</p></td>
     <td><p><code>&quot;word&quot;</code></p></td>
     <td><p>トークン化のレベルです。選択肢:</p><ul><li><p><code>&quot;word&quot;</code>: フィールドのアナライザーでトークン化した後、n-gram シングリングを適用します。</p></li><li><p><code>&quot;char&quot;</code> / <code>&quot;character&quot;</code>: 生文字に対して直接 n-gram シングリングを適用します（アナライザーは使用しません）。</p></li></ul><p>単語レベルは意味的な強度と効率に優れていますが、言語固有のトークン化に依存します。文字レベルは言語非依存ですが、より高次元のシングルが生成され、意味的な強度は弱くなります。</p></td>
   </tr>
   <tr>
     <td><p><code>seed</code></p></td>
     <td><p>int</p></td>
     <td><p><code>1234</code></p></td>
     <td><p>MinHash 関数の初期化に使用するランダムシードです。</p></td>
   </tr>
</table>

### インデックスを設定する\{#configure-the-index}

MinHash バイナリベクトルには、インデックスタイプ `MINHASH_LSH`、メトリックタイプ `MHJACCARD` の組み合わせが推奨されます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="binary_vector",
    index_type="MINHASH_LSH",
    metric_type="MHJACCARD",
    params={
        "mh_lsh_band": 128,
        "mh_element_bit_width": 32,
        "with_raw_data": True,
    },
)
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

検索時に Jaccard リファインメントを使用する場合は、`with_raw_data` を `True` に設定してください。LSH ルックアップで得られた候補について推定 Jaccard 類似度を算出するには、生の MinHash シグネチャが必要です。

### コレクションを作成する\{#create-the-collection}

上記で定義したスキーマとインデックスのパラメーターを使用してコレクションを作成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.create_collection(
    collection_name="dedup_collection",
    schema=schema,
    index_params=index_params,
)
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## ステップ 2: ドキュメントを挿入する\{#step-2-insert-documents}

コレクションの準備ができたら、テキストデータを挿入します。生のテキストを指定するだけで、MinHash 関数が各ドキュメントのバイナリベクトルを自動的に生成します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
client.insert(
    "dedup_collection",
    [
        {"document_content": "information retrieval is a field of study that helps users find relevant information in large datasets"},
        {"document_content": "information retrieval is a research field focused on helping users find relevant data in large collections"},
        {"document_content": "information retrieval is a field of research helping users search for relevant information in large datasets"},
    ],
)
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

## ステップ 3: MinHash で検索する\{#step-3-search-with-minhash}

データの挿入後、生のテキストクエリを入力して類似ドキュメントを検索できます。Zilliz Cloud が各クエリを MinHash バイナリベクトルに自動変換します。Jaccard リファインメントを有効にすると、推定 Jaccard 類似度に基づいて LSH 候補をランキングできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
search_params = {
    "metric_type": "MHJACCARD",
    "params": {
        "mh_search_with_jaccard": True,
        "refine_k": 3,
    },
}

results = client.search(
    collection_name="dedup_collection",
    data=["information retrieval is a research field focused on helping users find relevant data in large collections"],
    anns_field="binary_vector",
    limit=3,
    output_fields=["document_content"],
    search_params=search_params,
)

for hits in results:
    for hit in hits:
        print(f"ID: {hit['id']}, Distance: {hit['distance']}")
        print(f"Document: {hit['entity']['document_content']}")
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

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>
</Tabs>

Jaccard リファインメントを有効にするには、`mh_search_with_jaccard` を `True` に設定します。`refine_k` はリファインメントに使用する候補プールの容量を制御します。Zilliz Cloud は容量として `max(refine_k, limit)` を使用しますが、LSH ルックアップの一致数が少ない場合は、実際にリファインメントされる候補数も少なくなることがあります。`refine_k` を大きくすると、計算コストは増えますが結果の品質を向上できる可能性があります。

## 次のステップ\{#whats-next}

- [Full Text Search](./full-text-search): 類似重複検出ではなく、BM25 を用いた語彙レベルの関連性ランキングを行います。

- [Analyzer Overview](./analyzer-overview): テキストのトークン化に使用するカスタムアナライザーを設定します。

- [MINHASH_LSH インデックス](./minhash-lsh): 再現率とパフォーマンスのための LSH パラメーターの調整について学びます。

