---
title: "JSON インデックス作成 | Cloud"
slug: /json-indexing
sidebar_label: "インデックス作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリでは collection 全体のスキャンが必要になり、データセットの増加に伴って遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。 | Cloud"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON インデックス作成

JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリでは collection 全体のスキャンが必要になり、データセットの増加に伴って遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。

JSON インデックス作成は、次のような場合に最適です。

- 一貫性のある既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価、`IN`、範囲、およびテキストマッチクエリ

- どのキーをインデックス化するかを正確に制御する必要があるシナリオ

多様なクエリパターンを持つ複雑な JSON ドキュメントについては、代替手段として [JSON Shredding](./json-shredding) を検討してください。

## インデックスタイプの概要\{#index-type-overview}

Zilliz Cloud は JSON パス向けに 4 種類のインデックスタイプを提供しています。それぞれ異なるクエリパターンに適しています。

インデックスタイプを選択する前に、その JSON パスの **cast type** を特定してください。cast type によって、Zilliz Cloud がそのパスの値をどのように解釈するか、および利用可能なインデックスタイプが決まります。

### cast type を理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` の値を解釈してインデックス化するために使用されるデータ型です。これはフィールドスキーマの型とは異なります。フィールド自体は引き続き `JSON` フィールドですが、インデックス化された各パスは特定の scalar、配列、または JSON オブジェクト型として扱われます。

そのパスに保存されている値に一致する cast type を選択してください。cast type が特定のインデックスタイプと互換性があるかを確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| Cast type | パスの値が次の場合に使用... | 値の例 |
| --- | --- | --- |
| `BOOL` | Boolean 値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列 | `"electronics"` |
| `ARRAY_BOOL` | Boolean 値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON オブジェクト全体またはサブオブジェクト | `{"supplier": {"country": "USA"}}` |

同じパスの値に一貫しない型が含まれている場合、cast type に一致する値だけがインデックス化されます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` cast type のインデックスには数値が含まれ、文字列値はスキップされます。インデックス作成中に文字列値を変換するには、`json_cast_function` を使用してください。詳しくは [例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックスタイプを選択する\{#choose-an-index-type}

cast type を選択したら、クエリパターンに応じてインデックスタイプを選択します。

| クエリパターン | 推奨インデックスタイプ | cast type の要件 | 備考 |
| --- | --- | --- | --- |
| scalar 値に対する等価フィルターと範囲フィルターの混在 | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用します。 | 値のカーディナリティに基づいて、Zilliz Cloud が内部インデックスレイアウトを選択します。 |
| JSON 配列内の値に対するフィルター | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用します。 | すべての配列 cast type で必須です。 |
| オブジェクト全体またはサブオブジェクトのインデックス作成 | `INVERTED` または `AUTOINDEX` | `JSON` を使用します。 | `AUTOINDEX` は、`JSON` cast type に対してカーディナリティベースの選択ではなく `INVERTED` を使用します。 |
| 数値またはソート可能な文字列に対する範囲フィルター | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用します。 | ソート済みレイアウトを強制するには `STL_SORT` を、自動選択したい場合は `AUTOINDEX` を使用します。 |
| 低カーディナリティ値に対する等価または `IN` フィルター | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用します。 | ビットマップレイアウトを強制するには `BITMAP` を使用します。数値には `AUTOINDEX` または `STL_SORT` を使用します。 |

迷った場合は、scalar パスにはまず `AUTOINDEX` を使用してください。配列 cast type とテキストマッチクエリには明示的に `INVERTED` を使用します。オブジェクト全体の JSON インデックス作成には、`INVERTED` または `AUTOINDEX` のいずれかを使用します。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定した `json_cast_type` に依存します。 

| Cast type | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`, `DOUBLE`, `VARCHAR` | 値のカーディナリティに基づいて `BITMAP` と `STL_SORT` のどちらかを選択します。 |
| `ARRAY_BOOL`, `ARRAY_DOUBLE`, `ARRAY_VARCHAR` | サポートされていません。インデックスタイプとして明示的に `INVERTED` を使用してください。 |
| `JSON` | オブジェクト全体またはサブオブジェクトのインデックス作成に `INVERTED` を使用します。 |

scalar cast type（`BOOL`、`DOUBLE`、`VARCHAR`）については、Zilliz Cloud に内部インデックスレイアウトを選択させたい場合、`AUTOINDEX` が推奨される出発点です。インデックス構築中に、Zilliz Cloud は JSON パスの値の **カーディナリティ** を測定します。カーディナリティとは、そのパスにおける異なる値の数を意味します。

カーディナリティに基づいて、Zilliz Cloud は次の 2 つの内部レイアウトのいずれかを選択します。

- **低カーディナリティ**: `metadata["in_stock"]` の `true` と `false`、または少数のステータス文字列セットを持つ `metadata["status"]` のように、値が頻繁に繰り返されます。Zilliz Cloud は、高速な等価フィルターと `IN` フィルターのために内部的に `BITMAP` インデックスを構築します。

- **高カーディナリティ**: `metadata["price"]`、`metadata["created_at"]`、`metadata["product_id"]` のように、ほとんどの値が一意です。Zilliz Cloud は、`>`、`<`、`>=`、`<=` などの高速な範囲フィルターのために内部的に `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` のしきい値は **100 個の異なる値** です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳しくは [AUTOINDEX の BITMAP-vs-STL_SORT しきい値を調整するにはどうすればよいですか](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

### INVERTED\{#inverted}

`INVERTED` は、テキストマッチクエリ、配列インデックス作成、またはオブジェクト全体の JSON インデックス作成が必要な場合に最適です。

次の場合は `INVERTED` を明示的に指定してください。

- JSON 配列内の値をインデックス化する必要がある場合。

- JSON オブジェクト全体またはサブオブジェクトをインデックス化し、`INVERTED` の動作を明示したい場合。

- 等価、`IN`、範囲、テキストマッチ、配列、およびオブジェクトレベルのクエリを処理できる 1 つのインデックスタイプが必要で、インデックスサイズが大きくなることを許容できる場合。

JSON オブジェクト全体（`json_cast_type="JSON"`）については、`INVERTED` または `AUTOINDEX` のいずれかを使用できます。この cast type に対して、`AUTOINDEX` は `INVERTED` を使用します。

詳細については、[INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスの値をソート順で保存します。数値またはソート可能な文字列値に対する範囲フィルターに最適化されています。

`STL_SORT` は `DOUBLE` と `VARCHAR` cast type のみをサポートします。次のような場合に使用します。

- フィルターで `>`、`<`、`>=`、`<=` を使用する場合。

- インデックス化される値が、価格、タイムスタンプ、ID、ソート可能なコードなど、高カーディナリティである場合。

- `AUTOINDEX` に選択させるのではなく、ソート済みレイアウトを強制したい場合。

`STL_SORT` は `BOOL`、`ARRAY_*`、または `JSON` cast type をサポートしません。配列またはオブジェクト全体のインデックス作成には `INVERTED` を使用してください。

詳細については、[STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パスの各異なる値に対してコンパクトなビットマップを作成します。頻繁に繰り返される値に対する等価フィルターと `IN` フィルターに最適化されています。

`BITMAP` は `BOOL` と `VARCHAR` cast type のみをサポートします。次のような場合に使用します。

- フィルターで `==` または `IN` を使用する場合。

- インデックス化される値が、Boolean、ステータス値、または少数のカテゴリセットのように低カーディナリティである場合。

- `AUTOINDEX` に選択させるのではなく、ビットマップレイアウトを強制したい場合。

`BITMAP` は `DOUBLE`、`ARRAY_*`、または `JSON` cast type をサポートしません。数値には代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細については、[BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされている `(cast type, index type)` の組み合わせを素早く確認するために、次のマトリクスを使用してください。

| Cast type | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | Boolean 値（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数値（整数または浮動小数点）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 文字列値。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | Boolean の配列。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 自動型推論とフラット化を伴う、JSON オブジェクト全体またはサブオブジェクト。 | 任意のネストされたオブジェクト | ✓ | ✓ | — | — |

`—` と記されたセルについては、Zilliz Cloud はインデックス作成時にリクエストを拒否します。配列 cast type には明示的に `INVERTED` を使用してください（`AUTOINDEX` は配列をカバーしません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形状の JSON データに対するインデックス作成について説明します。すべての例では、以下のサンプル構造を使用し、`metadata` という名前の `JSON` フィールドを含む collection がすでにあることを前提としています。

### サンプル JSON 構造\{#sample-json-structure}

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

### 基本セットアップ\{#basic-setup}

以下の例では、Zilliz Cloud デプロイメントに接続された `client` という名前の `MilvusClient` と、すでに `metadata` という `JSON` フィールドを含む collection があることを前提としています。これらを最初からセットアップする必要がある場合は、以下のブロックを展開してください。

<details>

<summary>接続してサンプル collection を作成する</summary>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Define a schema with a JSON field
schema = client.create_schema(enable_dynamic_field=False)
schema.add_field("pk", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vec", DataType.FLOAT_VECTOR, dim=4)
schema.add_field("metadata", DataType.JSON, nullable=True)

# Minimal vector index so the collection can be loaded
vec_index = client.prepare_index_params()
vec_index.add_index(field_name="vec", index_type="AUTOINDEX", metric_type="L2")

client.create_collection(
    collection_name="your_collection_name",
    schema=schema,
    index_params=vec_index,
)

# Insert one row that matches the sample JSON structure above
client.insert(
    collection_name="your_collection_name",
    data=[{
        "pk": 1,
        "vec": [0.1, 0.2, 0.3, 0.4],
        "metadata": {
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
    }],
)
```

</details>

以下の例で追加するインデックス定義を収集するため、index-params オブジェクトを準備します。

```python
index_params = client.prepare_index_params()
```

以降の各例では、1 つの `index_params.add_index(...)` 呼び出しを示します。データに一致するものを選び、同じ `index_params` オブジェクトに対して呼び出してください。最後に、すべてを 1 回の `client.create_index(...)` 呼び出しで適用します（「インデックスを適用する」を参照）。

### 例 1: AUTOINDEX でトップレベルキーをインデックス化する\{#example-1-index-a-top-level-key-with-autoindex}

商品カテゴリによる高速フィルタリングのために、`category` フィールドをインデックス化します。`AUTOINDEX` を使うと、データ内に存在する異なるカテゴリ数に基づいて、Zilliz Cloud が `BITMAP` または `STL_SORT` を選択します。

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="category_index",
    # highlight-start
    params={
        "json_path": 'metadata["category"]',
        "json_cast_type": "VARCHAR",
    }
    # highlight-end
)
```

### 例 2: ネストされたキーをインデックス化する\{#example-2-index-a-nested-key}

サプライヤー連絡先の検索のために、深くネストされた `email` フィールドをインデックス化します。`json_path` パラメータは、任意の深さのブラケット表記を受け付けます。

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="email_index",
    # highlight-start
    params={
        "json_path": 'metadata["supplier"]["contact"]["email"]',
        "json_cast_type": "VARCHAR",
    }
    # highlight-end
)
```

### 例 3: STL_SORT を使った範囲クエリ\{#example-3-range-queries-with-stlsort}

パスに対するクエリが範囲比較（`>`、`<`、`>=`、`<=`）に支配されることが分かっている場合は、直接 `STL_SORT` を選択します。これによりカーディナリティ測定を省略し、即座にソート済みレイアウトを構築します。

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="STL_SORT",
    index_name="price_index",
    params={
        "json_path": 'metadata["price"]',
        "json_cast_type": "DOUBLE",
    }
)
```

インデックス作成後、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリでは、全スキャンの代わりに二分探索が使用されます。

### 例 4: BITMAP を使った等価クエリ\{#example-4-equality-queries-with-bitmap}

低カーディナリティのキー — ステータスコード、Boolean、enum のような文字列 — には、直接 `BITMAP` を選択します。等価クエリと `IN` クエリはビットマップ操作になります。

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="BITMAP",
    index_name="in_stock_index",
    params={
        "json_path": 'metadata["in_stock"]',
        "json_cast_type": "BOOL",
    }
)
```

`BITMAP` は、少数の異なる文字列値しか持たない `status` カラムのようなフィールドにも非常に適しています。

### 例 5: インデックス作成時にデータ型を変換する\{#example-5-convert-data-type-at-index-time}

数値データが誤って文字列として保存されている場合は、`STRING_TO_DOUBLE` を使用して、インデックス構築中に値を数値へ変換します。

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="string_to_double_index",
    params={
        "json_path": 'metadata["string_price"]',
        "json_cast_type": "DOUBLE",
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE",
    }
)
```

ある行で変換に失敗した場合（たとえば `"invalid"` のような非数値文字列）、その行はインデックス作成中にスキップされます。

### 例 6: JSON オブジェクト全体をインデックス化する\{#example-6-index-entire-json-objects}

`json_cast_type="JSON"` を設定すると、指定したパスにある完全な構造がインデックス化されます。Zilliz Cloud はネストされたオブジェクトをパスにフラット化し、各値の型を自動的に推論します。パス配下のすべてのキーが検索可能になります。

`AUTOINDEX` は、フラット化と型推論が inverted index の機能であるため、`JSON` cast type に対して透過的に `INVERTED` を使用します。

`metadata` オブジェクト全体をインデックス化するには、次のようにします。

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="metadata_full_index",
    params={
        # highlight-start
        "json_path": "metadata",
        "json_cast_type": "JSON",
        # highlight-end
    }
)
```

または、たとえばすべての `supplier` 情報のように、サブオブジェクトをインデックス化することもできます。

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="supplier_index",
    params={
        # highlight-start
        "json_path": 'metadata["supplier"]',
        "json_cast_type": "JSON",
        # highlight-end
    }
)
```

オブジェクト全体のインデックス作成は、インデックスサイズを増加させます。多様なクエリパターンを持つ深くネストされたドキュメントについては、JSON Shredding を検討してください。

### インデックスを適用する\{#apply-the-index}

すべてのインデックスパラメータを追加したら、それらを collection に適用します。

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

インデックス構築は非同期で実行されます。特定のインデックスの構築状態を確認するには `client.describe_index(...)` を使用してください。`state` フィールドは構築完了時に `Finished` を示し、`total_rows` / `indexed_rows` / `pending_index_rows` は進行状況を示します。

```python
client.describe_index(
    collection_name="your_collection_name",
    index_name="category_index",
)
```

レスポンス例:

```json
{
  "json_path": "metadata[\"category\"]",
  "json_cast_type": "VARCHAR",
  "index_type": "AUTOINDEX",
  "field_name": "metadata",
  "index_name": "category_index",
  "total_rows": 20,
  "indexed_rows": 20,
  "pending_index_rows": 0,
  "state": "Finished"
}
```

`state` が `Finished` を報告したら、インデックス化されたパスに対するクエリは自動的に新しいインデックスを使用します。

`AUTOINDEX` エントリについては、このレスポンスの `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は現在、構築時にどの基盤レイアウト（`BITMAP` または `STL_SORT`）が選ばれたかを公開していません。この選択は内部最適化として扱ってください。選択されたレイアウトに関係なく、そのパスに対する等価、`IN`、および範囲クエリは機能します。

## FAQ\{#faq}

### AUTOINDEX と明示的なインデックスタイプはどのように使い分ければよいですか?\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

まず `AUTOINDEX` から始めてください。これはデータのカーディナリティに基づいて適切なレイアウトを選択し、JSON パスに対するほとんどの等価、`IN`、および範囲クエリをカバーします。明示的なタイプを選ぶのは次のような場合です。

- クエリパターンが分かっている場合（例: 常に範囲 → `STL_SORT`、常に低カーディナリティでの等価 → `BITMAP`）で、カーディナリティ測定を省略したい。

- テキストマッチまたは部分文字列クエリが必要な場合 → `INVERTED`。

- 配列 cast type または JSON オブジェクト全体をインデックス化する場合 → `INVERTED`（またはオブジェクト全体の場合は `AUTOINDEX`）。

### クエリのフィルター式が、インデックス化された cast type と異なる型を使う場合はどうなりますか?\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルター式がインデックスの `json_cast_type` と異なる型を使用している場合、Zilliz Cloud はそのインデックスを使用せず、データが許す場合は低速なブルートフォーススキャンにフォールバックすることがあります。最良のパフォーマンスを得るには、常にフィルター式をインデックスの cast type に合わせてください。たとえば、数値インデックスが `json_cast_type="DOUBLE"` で作成されている場合、数値のフィルター条件のみがそのインデックスを活用します。

### JSON キーのデータ型が entity ごとに一貫していない場合はどうなりますか?\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型の不一致は **部分的なインデックス作成** につながる可能性があります。たとえば、`metadata["price"]` が数値（`99.99`）と文字列（`"99.99"`）の両方として保存されていて、`json_cast_type="DOUBLE"` でインデックスを作成した場合、インデックス化されるのは数値だけです。文字列形式のエントリはスキップされ、フィルター結果には現れません。インデックス作成時に文字列を数値へ強制変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが 1 つの型を共有するようにソースデータを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか?\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、cast type やインデックスタイプに関係なく、`(field, json_path)` ペアごとに最大 1 つのインデックスしか許可されません。同じパスに `INVERTED` と `BITMAP` の両方のインデックスを作成したり、異なる cast type で同じパスに 2 つのインデックスを作成したりすることはできません。ただし、JSON オブジェクト全体に対するインデックスと、そのオブジェクト内のネストされたキーに対する別のインデックスを作成することはできます。これらは異なるパスです。

### AUTOINDEX の BITMAP-vs-STL_SORT しきい値を調整するにはどうすればよいですか?\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、`AUTOINDEX` はインデックス化される値の **異なる値の数が 100 以下** の場合に `BITMAP` を選択し、それ以外では `STL_SORT` を選択します。`"bitmap_cardinality_limit"` をインデックスパラメータに追加することで、このしきい値を上書きできます（範囲: 1–1000）。

```python
index_params.add_index(
    field_name="metadata",
    index_type="AUTOINDEX",
    index_name="string_to_double_index",
    params={
    "json_path": 'metadata["category"]',
    "json_cast_type": "VARCHAR",
    # highlight-next-line
    "bitmap_cardinality_limit": 200,  # use BITMAP up to 200 distinct values
    }
)
```

ほとんどのユーザーはこれを調整する必要はありません。適度なカーディナリティのフィールドをビットマップ化したい場合は値を上げてください。`AUTOINDEX` がより早く `STL_SORT` を選ぶようにしたい場合は値を下げてください。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。
