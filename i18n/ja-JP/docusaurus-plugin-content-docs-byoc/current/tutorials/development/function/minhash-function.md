---
title: "MinHash Function | BYOC"
slug: /minhash-function
sidebar_label: "MinHash Function"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "MinHash function は生テキストを、ドキュメント間の Jaccard similarity を近似するバイナリベクトルに変換します。テキストの shingling と複数の hash function を適用して固定長のシグネチャベクトルを生成し、高速な類似重複検出と大規模なドキュメント重複排除を可能にします。 | BYOC"
type: origin
token: EAwdw2ZbtiBKttk66FTctUebn7f
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MinHash Function

**MinHash function** は、生テキストをドキュメント間の [Jaccard similarity](https://en.wikipedia.org/wiki/Jaccard_index) を近似する **バイナリベクトル** に変換します。テキストの shingling と複数の hash function を適用して固定長のシグネチャベクトルを生成し、高速な類似重複検出と大規模なドキュメント重複排除を可能にします。

組み込み関数として、MinHash は Zilliz Cloud 内で実行され、外部モデルの推論や前処理を必要としません。生テキストを挿入すると、Zilliz Cloud が MinHash シグネチャベクトルを自動的に生成します。

## Limits\{#limits}

- 出力フィールドは `BINARY_VECTOR` である必要があり、各 MinHash シグネチャは 32 ビットの hash 値であるため、`dim % 32 == 0` を満たす次元でなければなりません。

- バイナリベクトルフィールドの `dim` は `32 * num_hashes` と等しくなければなりません。一致しない場合はエラーになります。

- MinHash function の出力に対して `MINHASH_LSH` index を使用する場合、`mh_element_bit_width` は `32` に設定する必要があります。

## How MinHash works\{#how-minhash-works}

<details>

<summary>動作の仕組みを表示</summary>

[MinHash](https://en.wikipedia.org/wiki/MinHash) は、集合間の [Jaccard similarity](https://en.wikipedia.org/wiki/Jaccard_index) を推定する locality-sensitive hashing 手法です。Zilliz Cloud では、MinHash function は次のパイプラインに従います。入力として生テキストを与えると、Zilliz Cloud は出力としてバイナリベクトルを生成し、途中のすべての処理は内部で行われます。

全体のワークフローは、ドキュメント取り込みとクエリ処理の両方で使用される**共通のテキスト処理パイプライン**と、それに続く保存および検索のためのフェーズ固有の処理で構成されます。

![IaqkbFEh8oQgGSx6NsocFoSOnDo](https://zdoc-images.s3.us-west-2.amazonaws.com/iaqkbfeh8oqggsx6nsocfosondo.png "IaqkbFEh8oQgGSx6NsocFoSOnDo")

### Shared text processing pipeline\{#shared-text-processing-pipeline}

ドキュメント取り込みとクエリ処理の両方で、生テキストは同じ 4 段階の変換を通過します。

1. **Text analysis**: テキストは [analyzer](./analyzer-overview) によって処理され（`token_level` が `"word"` の場合）、またはそのまま使用されます（`token_level` が `"char"` の場合）。単語レベルの tokenization では、入力フィールドに設定された analyzer を適用してテキストをトークンへ分割します。たとえば、`"milvus is vector db"` は `["milvus", "is", "vector", "db"]` になります。

1. **Shingling**: トークンは、サイズ `shingle_size` の重なり合う n-gram（shingle）に分割されます。たとえば、単語レベルの 3-gram では、トークン `["information", "retrieval", "is", "a", "field"]` は `["information retrieval is", "retrieval is a", "is a field"]` のような shingle になります。

1. **MinHash signature generation**: 複数の hash function（H1, H2, ..., Hn。n = `num_hashes`）が shingle 集合に適用されます。各 hash function について、すべての shingle に対する最小の hash 値が選択されます。これらの最小値の集合が MinHash シグネチャを形成し、元のドキュメントの Jaccard similarity を近似する固定長表現になります。

1. **Binary vector encoding**: 各シグネチャ値は 32 ビット hash であり、完全なシグネチャは次元 `32 * num_hashes` の `BINARY_VECTOR` にパックされます。

### Document ingestion\{#document-ingestion}

挿入時には、共通パイプラインによって生成されたバイナリベクトルが `MINHASH_LSH` index に保存されます。この index は、類似するシグネチャを同じバケットにグループ化する LSH（Locality-Sensitive Hashing）テーブルを維持し、クエリ時の高速な候補検索を可能にします。

### Query processing\{#query-processing}

検索時には、クエリテキストも同じ共通パイプラインを通ってバイナリベクトルを生成します。このベクトルは `MINHASH_LSH` index に対する LSH ルックアップに使用され、類似している可能性の高い候補ペアをすばやく特定します。候補はその後、推定 Jaccard similarity に基づいてランク付けされ、上位 K 件の結果が返されます。

両方の経路が同じ変換ロジックを共有するため、内容が大きく重複する 2 つのドキュメントは類似した MinHash シグネチャを生成します。これにより、語順、フォーマット、またはわずかな言い回しの違いがあっても、類似重複を見つけるのにこの function は効果的です。

</details>

## Before you start\{#before-you-start}

MinHash function を使用する前に、次の項目を含むように collection schema を計画してください。

- **生コンテンツ用のテキストフィールド**

    collection には、生テキストを保存する `VARCHAR` フィールドを含める必要があります。このフィールドは MinHash function への入力として使用されます。

- **テキストフィールド用の analyzer**（単語レベル tokenization を使用する場合）

    `token_level` が `"word"`（デフォルト）に設定されている場合、テキストフィールドでは analyzer を有効にする必要があります。analyzer は、shingling の前にテキストをどのように tokenization するかを定義します。デフォルトでは、Zilliz Cloud は `standard` analyzer を使用します。別の analyzer を設定するには、[Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **MinHash 出力用のバイナリベクトルフィールド**

    collection には、MinHash function によって生成されたバイナリベクトルを保存する `BINARY_VECTOR` フィールドを含める必要があります。次元は `32 * num_hashes` と等しくなければなりません。

## Step 1: Create a collection with a MinHash function\{#step-1-create-a-collection-with-a-minhash-function}

MinHash function を使用するには、collection 作成時にそれを定義します。この function は collection schema の一部となり、データ挿入時および検索時に自動的に適用されます。

### Define schema fields\{#define-schema-fields}

collection schema には少なくとも 3 つのフィールドを含める必要があります。

- **Primary field**: collection 内の各 entity を一意に識別します。

- **Text field** (`VARCHAR`): 生テキストドキュメントを保存します。`enable_analyzer=True` を設定すると、Zilliz Cloud が MinHash シグネチャ生成のためにテキストを処理できます。デフォルトでは、Zilliz Cloud はテキスト解析に `standard` analyzer を使用します。別の analyzer を設定するには、[Choose the Right Analyzer for Your Use Case](./choose-the-right-analyzer-for-your-use-case) を参照してください。

- **Binary vector field** (`BINARY_VECTOR`): MinHash function によって自動生成されるバイナリベクトルを保存します。次元は `32 * num_hashes` と等しくなければなりません。

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

### Define the MinHash function\{#define-the-minhash-function}

MinHash function は、解析済みテキストをドキュメント間の Jaccard similarity を近似するバイナリベクトルに変換します。

function を定義し、schema に追加します。

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

MinHash function の `params` 辞書では、次のパラメータを受け付けます。すべてのパラメータ名は **大文字小文字を区別しません**。

<table>
   <tr>
     <th><p><strong>パラメータ</strong></p></th>
     <th><p><strong>型</strong></p></th>
     <th><p><strong>デフォルト</strong></p></th>
     <th><p><strong>説明</strong></p></th>
   </tr>
   <tr>
     <td><p><code>num_hashes</code></p></td>
     <td><p>int</p></td>
     <td><p><code>dim / 32</code> から導出</p></td>
     <td><p>シグネチャ生成に使用する hash function の数です。出力バイナリベクトルの次元は <code>32 &ast; num_hashes</code> に等しくなります。値を大きくすると similarity 推定の分散は減少しますが、計算量は増加します。推奨値: <code>256</code>（dim = 8192）。</p></td>
   </tr>
   <tr>
     <td><p><code>shingle_size</code></p></td>
     <td><p>int</p></td>
     <td><p><code>3</code></p></td>
     <td><p>shingling に使用する N-gram サイズです。単語レベルでは 1～3、文字レベルでは 2～6 が一般的です。</p></td>
   </tr>
   <tr>
     <td><p><code>hash_function</code></p></td>
     <td><p>str</p></td>
     <td><p><code>"xxhash"</code></p></td>
     <td><p>使用する hash function です。オプション: </p><ul><li><p><code>"xxhash"</code>（高速）</p></li><li><p><code>"sha1"</code>（より低速、高い衝突耐性）。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>token_level</code></p></td>
     <td><p>str</p></td>
     <td><p><code>"word"</code></p></td>
     <td><p>tokenization レベルです。オプション:</p><ul><li><p><code>"word"</code>: フィールドの analyzer を tokenization に使用し、その後 n-gram shingling を適用します。</p></li><li><p><code>"char"</code> / <code>"character"</code>: 生の文字に対して直接 n-gram shingling を適用します（analyzer なし）。</p><p>単語レベルはより強い意味表現と高い効率を提供しますが、言語固有の tokenization に依存します。文字レベルは言語に依存しませんが、より高次元の shingle を生成し、意味表現は弱くなります。</p></li></ul></td>
   </tr>
   <tr>
     <td><p><code>seed</code></p></td>
     <td><p>int</p></td>
     <td><p><code>1234</code></p></td>
     <td><p>MinHash function 初期化用の乱数シードです。</p></td>
   </tr>
</table>

### Configure the index\{#configure-the-index}

MinHash バイナリベクトルに推奨される index type は `MINHASH_LSH` で、metric type は `MHJACCARD` です。

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

### Create the collection\{#create-the-collection}

上で定義した schema と index パラメータを使用して collection を作成します。

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

## Step 2: Insert documents\{#step-2-insert-documents}

collection のセットアップ後、テキストデータを挿入します。必要なのは生テキストを渡すことだけで、MinHash function が各ドキュメントのバイナリベクトルを自動的に生成します。

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

## Step 3: Search with MinHash\{#step-3-search-with-minhash}

データを挿入したら、生テキストのクエリを指定して類似重複ドキュメントを検索します。Zilliz Cloud はクエリテキストを自動的に MinHash バイナリベクトルへ変換し、推定 Jaccard similarity を使用して最も類似したドキュメントを取得します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"},{"label":"C++","value":"c++"}]}>
<TabItem value='python'>

```python
search_params = {
    "metric_type": "MHJACCARD",
    "params": {},
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

## What's next\{#whats-next}

- [Full Text Search](./full-text-search): 類似重複検出の代わりに、語彙ベースの関連度ランキングに BM25 を使用します。

- [Analyzer Overview](./analyzer-overview): テキスト tokenization 用のカスタム analyzer を設定します。

- [MINHASH_LSH Index](./minhash-lsh): 再現率とパフォーマンスのために LSH パラメータを調整する方法を学びます。

