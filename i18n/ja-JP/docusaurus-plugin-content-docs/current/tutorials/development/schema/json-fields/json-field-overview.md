---
title: "JSON フィールドの概要 | Cloud"
slug: /json-field-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "製品カタログ、コンテンツ管理システム、ユーザー設定エンジンのようなアプリケーションを構築する際、ベクトル埋め込みと一緒に柔軟なメタデータを保存する必要がよくあります。製品属性はカテゴリごとに異なり、ユーザー設定は時間とともに変化し、ドキュメントのプロパティは複雑なネスト構造を持ちます。Zilliz Cloud の JSON フィールドは、パフォーマンスを犠牲にすることなく、柔軟な構造化データを保存およびクエリできるようにすることで、この課題を解決します。 | Cloud"
type: origin
token: Neq4wR0EdiXokRkhXwbcMPfanCd
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON フィールドの概要

製品カタログ、コンテンツ管理システム、ユーザー設定エンジンのようなアプリケーションを構築する際、ベクトル埋め込みと一緒に柔軟なメタデータを保存する必要がよくあります。製品属性はカテゴリごとに異なり、ユーザー設定は時間とともに変化し、ドキュメントのプロパティは複雑なネスト構造を持ちます。Zilliz Cloud の JSON フィールドは、パフォーマンスを犠牲にすることなく、柔軟な構造化データを保存およびクエリできるようにすることで、この課題を解決します。

## JSON フィールドとは何ですか?\{#what-is-a-json-field}

JSON フィールドは、構造化されたキーと値のデータを保存する、Zilliz Cloud のスキーマ定義データ型（`DataType.JSON`）です。従来の固定的なデータベース列とは異なり、JSON フィールドはネストされたオブジェクト、配列、混在するデータ型に対応しながら、高速クエリのための複数のインデックスオプションを提供します。

JSON フィールド構造の例:

```json
{
  "metadata": { 
    "category": "electronics",
    "brand": "BrandA",
    "in_stock": true,
    "price": 99.99,
    "string_price": "99.99",
    "tags": ["clearance", "summer_sale"],
    "supplier": {
      "name": "SupplierX",
      "country": "USA",
      "contact": {
        "email": "support@supplierx.com",
        "phone": "+1-800-555-0199"
      }
    }
  }
}
```

この例では、`metadata` は単一の JSON フィールドであり、フラットな値（例: `category`、`in_stock`）、配列（`tags`）、ネストされたオブジェクト（`supplier`）が混在して含まれています。

<Admonition type="info" icon="📘" title="注意">

**命名規則:** JSON キーには文字、数字、アンダースコアのみを使用してください。特殊文字、スペース、ドットは、クエリでの解析上の問題を引き起こす可能性があるため避けてください。

</Admonition>

## JSON フィールドと dynamic field の違い\{#json-field-vs-dynamic-field}

よく混同される点として、JSON フィールドと [dynamic field](./enable-dynamic-field) の違いがあります。どちらも JSON に関連していますが、用途は異なります。

以下の表は、JSON フィールドと dynamic field の主な違いをまとめたものです。

| 機能 | JSON Field | Dynamic Field |
| --- | --- | --- |
| スキーマ定義 | `DataType.JSON` 型でコレクションスキーマ内に明示的に宣言する必要があるスカラーフィールド。 | 未宣言フィールドを自動的に保存する、非表示の JSON フィールド（`$meta` という名前）。 |
| 用途 | スキーマが既知で一貫している構造化データを保存する。 | 固定スキーマに適合しない、柔軟で進化する、または半構造化されたデータを保存する。 |
| 制御 | フィールド名と構造を自分で制御できる。 | 未定義フィールド用にシステムが管理する。 |
| クエリ | フィールド名または JSON フィールド内の対象キーを使用してクエリする: `metadata["key"]`。 | dynamic field のキーを直接使用してクエリする: `"dynamic_key"`、または `$meta` 経由: `$meta["dynamic_key"]` |

## 基本操作\{#basic-operations}

JSON フィールドを使用する基本的なワークフローには、スキーマでの定義、データの挿入、そして特定のフィルター式を使用したデータのクエリが含まれます。

### JSON フィールドを定義する\{#define-a-json-field}

JSON フィールドを使用するには、コレクションの作成時にコレクションスキーマ内で明示的に定義します。以下の例では、`DataType.JSON` 型の `metadata` フィールドを持つコレクションを作成する方法を示します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN" 

# Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# Create schema
schema = client.create_schema(auto_id=False, enable_dynamic_field=True)

schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True) # Primary field
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5) # Vector field
# Define a JSON field that allows null values
# highlight-next-line
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)

client.create_collection(
    collection_name="product_catalog",
    schema=schema
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
// js
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

<Admonition type="info" icon="📘" title="注意">

この例では、コレクションスキーマで定義された JSON フィールドは、`nullable=True` によって null 値を許可します。詳細については、[Nullable & Default](./nullable-fields) を参照してください。

</Admonition>

### データを挿入する\{#insert-data}

コレクションを作成したら、指定した JSON フィールドに構造化 JSON オブジェクトを含むエンティティを挿入します。データは辞書のリストとしてフォーマットする必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
entities = [
    {
        "product_id": 1,
        "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
        # highlight-start
        "metadata": { # JSON field
            "category": "electronics",
            "brand": "BrandA",
            "in_stock": True,
            "price": 99.99,
            "string_price": "99.99",
            "tags": ["clearance", "summer_sale"],
            "supplier": {
                "name": "SupplierX",
                "country": "USA",
                "contact": {
                    "email": "support@supplierx.com",
                    "phone": "+1-800-555-0199"
                }
            }
        }
        # highlight-end
    }
]

client.insert(collection_name="product_catalog", data=entities)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
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

### フィルタリング操作\{#filtering-operations}

JSON フィールドに対してフィルタリング操作を実行する前に、以下を確認してください。

- 各ベクトルフィールドにインデックスを作成していること。

- コレクションがメモリにロードされていること。

<details>

<summary>コード例を表示</summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    index_name="vector_index",
    metric_type="COSINE"
)

client.create_index(collection_name="product_catalog", index_params=index_params)

client.load_collection(collection_name="product_catalog")
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
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

</details>

これらの要件が満たされると、以下の式を使用して、JSON フィールド内の値に基づいてコレクションをフィルタリングできます。これらのフィルター式では、特定の JSON パス構文と専用の演算子を利用します。

#### JSON パス構文によるフィルタリング\{#filtering-with-json-path-syntax}

特定のキーをクエリするには、ブラケット記法を使用して JSON キーにアクセスします: `json_field_name["key"]`。ネストされたキーの場合は、`json_field_name["key1"]["key2"]` のように連結します。

`category` が `"electronics"` であるエンティティをフィルタリングするには:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define filter expression
filter = 'metadata["category"] == "electronics"'

client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
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
// js
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

ネストされたキー `supplier["country"]` が `"USA"` であるエンティティをフィルタリングするには:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define filter expression
filter = 'metadata["supplier"]["country"] == "USA"'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
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

#### JSON 専用演算子によるフィルタリング\{#filtering-with-json-specific-operators}

Zilliz Cloud は、特定の JSON フィールドキー上の配列値をクエリするための特別な演算子も提供しています。たとえば、次のようなものがあります。

- `json_contains(identifier, expr)`: 特定の要素またはサブ配列が JSON 配列内に存在するかを確認します

- `json_contains_all(identifier, expr)`: 指定した JSON 式のすべての要素がフィールド内に存在することを保証します

- `json_contains_any(identifier, expr)`: JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルタリングします

`tags` キーの下に `"summer_sale"` の値を持つ製品を見つけるには:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define filter expression
filter = 'json_contains(metadata["tags"], "summer_sale")'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
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

`tags` キーの下に `"electronics"`、`"new"`、または `"clearance"` の値のうち少なくとも 1 つを持つ製品を見つけるには:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Define filter expression
filter = 'json_contains_any(metadata["tags"], ["electronics", "new", "clearance"])'

res = client.search(
    collection_name="product_catalog",  # Collection name
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # Query vector (must match collection's vector dim)
    limit=5,                           # Max. number of results to return
    # highlight-next-line
    filter=filter,                    # Filter expression
    output_fields=["product_id", "metadata"]   # Fields to include in the search results
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
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

JSON 専用演算子の詳細については、[JSON Operators](./json-filtering-operators) を参照してください。

## 次へ: JSON クエリを高速化する\{#next-accelerate-json-queries}

デフォルトでは、高速化なしの JSON フィールドに対するクエリは、すべての行をフルスキャンするため、大規模データセットでは低速になる可能性があります。JSON クエリを高速化するために、Zilliz Cloud は高度なインデックス作成機能とストレージ最適化機能を提供しています。

<Admonition type="warning" icon="🚧" title="警告">

Milvus 3.0.0 以降、オブジェクト全体に対する JSON インデックス作成（`json_cast_type="JSON"`）、別名 JSON flat indexing は非推奨です。既存のインデックスと新しいインデックス作成リクエストは互換性のため引き続きサポートされますが、このモードは新しいワークロードにはもはや推奨されません。既知のクエリパスには JSON path indexing を使用するか、複雑または進化するドキュメント全体で広範なクエリ高速化が必要な場合は [JSON Shredding](./json-shredding) を検討してください。

</Admonition>

以下の表は、それぞれの違いと最適な利用シナリオをまとめたものです。

| 手法 | 最適な用途 | 配列の高速化 | 注記 |
| --- | --- | --- | --- |
| JSON Indexing | 頻繁にアクセスされる少数のキー、特定の配列キー上の配列 | はい（インデックス付き配列キーの場合） | キーを事前選択する必要があり、スキーマが進化する場合はメンテナンスが必要 |
| JSON Shredding | 多くのキーにまたがる一般的な高速化、多様なクエリに柔軟 | はい（総当たりクエリと比較して配列値がわずかに高速化されます） | 追加のストレージ設定が必要、配列には引き続きキー単位のインデックスが必要 |
| NGRAM Index | ワイルドカード検索、テキストフィールドでの部分文字列一致 | N/A | 数値/範囲フィルター向けではない |

**ヒント:** これらのアプローチは組み合わせて使用できます。たとえば、広範なクエリ高速化には JSON shredding、高頻度の配列キーには JSON indexing、柔軟なテキスト検索には NGRAM indexing を使用できます。

実装の詳細については、以下を参照してください。

-  [JSON Indexing](./json-indexing)

- [JSON Shredding](./json-shredding)

- [NGRAM](./ngram-index-type)

## FAQ\{#faq}

### JSON フィールドのサイズに制限はありますか?\{#are-there-any-limitations-on-the-size-of-a-json-field}

はい。各 JSON フィールドは 65,536 バイトに制限されています。

### JSON フィールドではデフォルト値を設定できますか?\{#does-a-json-field-support-setting-a-default-value}

いいえ。JSON フィールドはデフォルト値をサポートしていません。ただし、フィールド定義時に `nullable=True` を設定して空のエントリを許可できます。

詳細については、[Nullable & Default](./nullable-fields) を参照してください。

### JSON フィールドキーに命名規則はありますか？\{#are-there-any-naming-conventions-for-json-field-keys}

はい。クエリおよびインデックスとの互換性を確保するために、次の点に従ってください。

- JSON キーには、英字、数字、アンダースコアのみを使用してください。

- 特殊文字、スペース、ドット（`.`, `/` など）は使用しないでください。

- 互換性のないキーは、フィルター式の解析時に問題を引き起こす可能性があります。

### Zilliz Cloud は JSON フィールド内の文字列値をどのように処理しますか？\{#how-does-zilliz-cloud-handle-string-values-in-json-fields}

Zilliz Cloud は、JSON 入力に現れる文字列値を、意味的な変換を行わず、そのまま保存します。引用符が正しくない文字列は、解析時にエラーの原因となる場合があります。

**有効な文字列の例**:

```plaintext
"a\"b", "a'b", "a\\b"
```

**無効な文字列の例**:

```plaintext
'a"b', 'a\'b'
```

