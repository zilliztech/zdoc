---
title: "JSON フィールドの概要 | BYOC"
slug: /json-field-overview
sidebar_key: json-field-overview
sidebar_label: "概要"
beta: FALSE
notebook: FALSE
description: "製品カタログ、コンテンツ管理システム、ユーザー設定エンジンなどのアプリケーションを構築する際、ベクトル埋め込みと共に柔軟なメタデータを保存する必要がある 경우가 많습니다。製品の属性はカテゴリによって異なり、ユーザーの設定は時間とともに変化し、ドキュメントのプロパティは複雑なネスト構造を持ちます。Zilliz Cloud の JSON フィールドを使用すると、パフォーマンスを犠牲にすることなく、柔軟な構造化データの保存とクエリが可能になり、この課題を解決します。| BYOC"
type: origin
token: Neq4wR0EdiXokRkhXwbcMPfanCd
sidebar_position: 1
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - スキーマ
  - json フィールド
  - 概要

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON フィールドの概要

商品カタログ、コンテンツ管理システム、ユーザープリファレンスエンジンなどのアプリケーションを構築する際、ベクトル埋め込みデータとともに柔軟なメタデータを保存する必要がよくあります。商品属性はカテゴリごとに異なり、ユーザーの好みは時間とともに変化し、ドキュメントのプロパティは複雑な入れ子構造を持つことがあります。Zilliz Cloud の JSON フィールドは、このような課題を解決します。柔軟な構造化データをパフォーマンスを犠牲にすることなく保存・クエリできるようにします。

## JSON フィールドとは？\{#what-is-a-json-field}

JSON フィールドとは、Zilliz Cloud におけるスキーマ定義済みのデータ型（`データType.JSON`）であり、構造化されたキー・バリュー形式のデータを格納します。従来の固定されたデータベースカラムとは異なり、JSON フィールドは入れ子になったオブジェクトや配列、複合データ型をサポートしながら、高速なクエリを実現するための複数のインデックスオプションを提供します。

JSON フィールドの構造例：

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

この例では、`metadata` はフラットな値（例：`category`、`in_stock`）、配列（`tags`）、およびネストされたオブジェクト（`supplier`）を含む単一の JSON フィールドです。

<Admonition type="info" icon="📘" title="Notes">

<p><strong>命名規則：</strong>JSON キーには英字、数字、アンダースコアのみを使用してください。特殊文字、スペース、ドットはクエリでのパースエラーを引き起こす可能性があるため避けてください。</p>

</Admonition>

## JSON フィールドと動的フィールド\{#json-field-vs-dynamic-field}

よく混同されるのが、JSON フィールドと[動的フィールド](./enable-dynamic-field)の違いです。どちらも JSON に関連していますが、目的は異なります。

以下の表は、JSON フィールドと動的フィールドの主な違いをまとめたものです：

<table>
   <tr>
     <th><p>機能</p></th>
     <th><p>JSON フィールド</p></th>
     <th><p>動的フィールド</p></th>
   </tr>
   <tr>
     <td><p>スキーマ定義</p></td>
     <td><p><code>データType.JSON</code> 型でコレクションスキーマに明示的に宣言する必要のあるスカラーフィールド。</p></td>
     <td><p>未宣言フィールドを自動的に格納する非表示の JSON フィールド（<code>$meta</code> という名前）。</p></td>
   </tr>
   <tr>
     <td><p>ユースケース</p></td>
     <td><p>スキーマが既知かつ一貫性のある構造化データを格納。</p></td>
     <td><p>固定スキーマに合わない柔軟で進化する、または半構造化されたデータを格納。</p></td>
   </tr>
   <tr>
     <td><p>制御</p></td>
     <td><p>フィールド名と構造をユーザーが制御。</p></td>
     <td><p>未定義フィールドに対してシステムが管理。</p></td>
   </tr>
   <tr>
     <td><p>クエリ</p></td>
     <td><p>フィールド名または JSON フィールド内のターゲットキーを使用してクエリ：<code>metadata["key"]</code>。</p></td>
     <td><p>動的フィールドキーを直接使用してクエリ：<code>"dynamic_key"</code>、または <code>$meta</code> 経由でクエリ：<code>$meta["dynamic_key"]</code></p></td>
   </tr>
</table>

## 基本操作\{#basic-operations}

JSON フィールドを使用する基本的なワークフローは、スキーマで定義し、データを挿入し、特定のフィルター式を使用してデータをクエリすることです。

### JSON フィールドの定義\{#define-a-json-field}

JSON フィールドを使用するには、コレクション作成時にコレクションスキーマで明示的に定義します。以下の例は、`データType.JSON` 型の `metadata` フィールドを持つコレクションを作成する方法を示しています：

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

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>この例では、コレクションスキーマで定義されたJSONフィールドが <code>nullable=True</code> により NULL許容 値を許可しています。詳細については、<a href="./nullable-fields">NULL許容 & デフォルト</a> を参照してください。</p>

</Admonition>

### Insert data\{#insert-data}

コレクションが作成されたら、指定したJSONフィールドに構造化されたJSONオブジェクトを含むエンティティを挿入します。データは辞書のリストとしてフォーマットする必要があります。

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

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

### フィルタリング操作\{#filtering-operations}

JSONフィールドに対してフィルタリング操作を実行する前に、以下の点を確認してください:

- 各ベクトルフィールドにインデックスを作成済みであること。

- コレクションがメモリにロード済みであること。

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

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

</details>

これらの要件を満たせば、JSONフィールド内の値に基づいてコレクションをフィルタリングするための以下の式を使用できます。これらのフィルター式は、特定のJSONパス構文と専用の演算子を活用します。

#### JSONパス構文によるフィルタリング\{#filtering-with-json-path-syntax}

特定のキーをクエリするには、角括弧表記を使用してJSONキーにアクセスします：`json_field_name["key"]`。ネストされたキーの場合は、それらを連鎖させます：`json_field_name["key1"]["key2"]`。

`category`が`"electronics"`であるエンティティをフィルタリングするには：

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

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

ネストされたキー `supplier["country"]` が `"USA"` であるエンティティをフィルタリングするには：

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

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

#### JSON固有の演算子によるフィルター\{#filtering-with-json-specific-operators}

Zilliz Cloud は、特定の JSON フィールドキーに対して配列値をクエリするための特殊な演算子も提供しています。例:

- `json_contains(identifier, expr)`: JSON 配列内に特定の要素またはサブ配列が存在するかどうかをチェックします。

- `json_contains_all(identifier, expr)`: 指定された JSON 式のすべての要素がフィールド内に存在することを保証します。

- `json_contains_any(identifier, expr)`: JSON 式のメンバーの少なくとも 1 つがフィールド内に存在するエンティティをフィルターします。

`tags` キーの下に `"summer_sale"` 値を持つ商品を検索するには:

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

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

`tags` キーの下に `"electronics"`、`"new"`、または `"clearance"` のいずれか少なくとも 1 つの値を持つ製品を検索するには：

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

<TabItem value='java'>

```javascript
// js
```

</TabItem>

<TabItem value='java'>

```go
// go
```

</TabItem>

<TabItem value='java'>

```bash
# restful
```

</TabItem>
</Tabs>

JSON固有の演算子について詳しくは、[JSON演算子](./json-filtering-operators)を参照してください。

## 次のステップ: JSONクエリの高速化\{#next-accelerate-json-queries}

デフォルトでは、高速化されていないJSONフィールドに対するクエリはすべての行をフルスキャンするため、大規模なデータセットでは遅くなる可能性があります。JSONクエリを高速化するために、Zilliz Cloudは高度なインデックス作成およびストレージ最適化機能を提供しています。

以下の表は、各手法の違いと最適な使用シナリオをまとめたものです：

<table>
   <tr>
     <th><p>手法</p></th>
     <th><p>最適な用途</p></th>
     <th><p>配列の高速化</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td><p>JSONインデックス</p></td>
     <td><p>頻繁にアクセスされる少数のキー、特定の配列キー上の配列</p></td>
     <td><p>はい（インデックスされた配列キー上）</p></td>
     <td><p>事前にキーを選択する必要があり、スキーマが変更された場合はメンテナンスが必要</p></td>
   </tr>
   <tr>
     <td><p>JSONシュレッディング</p></td>
     <td><p>多数のキーにわたる一般的な高速化、多様なクエリに柔軟に対応</p></td>
     <td><p>はい（ブルートフォースクエリと比べて配列値を若干高速化）</p></td>
     <td><p>追加のストレージ設定が必要、配列には依然としてキーごとのインデックスが必要</p></td>
   </tr>
   <tr>
     <td><p>NGRAMインデックス</p></td>
     <td><p>ワイルドカード検索、テキストフィールド内の部分文字列マッチング</p></td>
     <td><p>該当なし</p></td>
     <td><p>数値フィルターや範囲フィルターには使用不可</p></td>
   </tr>
</table>

**ヒント:** これらの手法を組み合わせることも可能です。例えば、広範なクエリの高速化にはJSONシュレッディングを、高頻度でアクセスされる配列キーにはJSONインデックスを、柔軟なテキスト検索にはNGRAMインデックスを使用できます。

実装の詳細については、以下を参照してください：

- [JSONインデックス](./json-indexing)

- [JSONシュレッディング](./json-shredding)

- [NGRAM](./ngram-index-type)

## よくある質問（FAQ）\{#faq}

### JSONフィールドのサイズに制限はありますか？\{#are-there-any-limitations-on-the-size-of-a-json-field}

はい。各JSONフィールドは65,536バイトまでです。

### JSONフィールドにデフォルト値を設定できますか？\{#does-a-json-field-support-setting-a-default-value}

いいえ、JSONフィールドはデフォルト値をサポートしていません。ただし、フィールド定義時に `nullable=True` を設定することで、空のエントリを許容できます。

詳細については、[NULL許容 & デフォルト](./nullable-fields)を参照してください。

### JSONフィールドのキーには命名規則がありますか？\{#are-there-any-naming-conventions-for-json-field-keys}

はい。クエリやインデックス作成との互換性を確保するため、以下の点に注意してください：

- JSONキーには英数字とアンダースコアのみを使用してください。

- 特殊文字、スペース、ドット（`.` や `/` など）は使用しないでください。

- 互換性のないキーは、フィルター式のパース時に問題を引き起こす可能性があります。

### Zilliz CloudはJSONフィールド内の文字列値をどのように扱いますか？\{#how-does-zilliz-cloud-handle-string-values-in-json-fields}

Zilliz Cloudは、JSON入力に記述されたとおりに文字列値をそのまま保存し、意味的な変換は行いません。不適切にクォートされた文字列は、パース中にエラーを引き起こす可能性があります。

**有効な文字列の例**：

```plaintext
"a\"b", "a'b", "a\\b"
```

**無効な文字列の例**:

```plaintext
'a"b', 'a\'b'
```

