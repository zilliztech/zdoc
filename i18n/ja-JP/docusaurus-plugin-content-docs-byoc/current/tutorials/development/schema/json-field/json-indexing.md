---
title: "JSON インデックス作成 | BYOC"
slug: /json-indexing
sidebar_label: "インデックス作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリは collection 全体のスキャンを必要とし、データセットが大きくなるにつれて低速になります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。 | BYOC"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON インデックス作成

JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリは collection 全体のスキャンを必要とし、データセットが大きくなるにつれて低速になります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。

JSON インデックス作成が最適なのは、次のような場合です。

- 一貫性があり、既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価、`IN`、範囲、およびテキスト一致クエリ

- どのキーをインデックス化するかを正確に制御する必要があるシナリオ

多様なクエリパターンを持つ複雑な JSON ドキュメントについては、代替手段として [JSON Shredding](./json-shredding) を検討してください。

## インデックスタイプの概要\{#index-type-overview}

Zilliz Cloud は、JSON パスに対して 4 つのインデックスタイプを提供します。それぞれ異なるクエリパターンに適しています。

インデックスタイプを選択する前に、JSON パスの **cast type** を特定してください。cast type は、Zilliz Cloud がそのパスの値をどのように解釈するか、および利用可能なインデックスタイプを決定します。

### cast type を理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` の値を解釈してインデックス化するために使用されるデータ型です。これはフィールドのスキーマ型とは異なります。フィールド自体は依然として `JSON` フィールドですが、インデックス化される各パスは特定の scalar、array、または JSON object 型として扱われます。

パスに格納されている値に一致する cast type を選択してください。特定のインデックスタイプで cast type が利用可能かどうかを確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| Cast type | パスの値が次の場合に使用 | 値の例 |
| --- | --- | --- |
| `BOOL` | Boolean 値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列 | `"electronics"` |
| `ARRAY_BOOL` | Boolean 値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON object 全体または sub-object。オブジェクト全体の JSON インデックス作成は Milvus 3.0.0 から非推奨です。 | `{"supplier": {"country": "USA"}}` |

同じパスにある値の型が一貫していない場合、cast type に一致する値のみがインデックス化されます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` cast type のインデックスには数値のみが含まれ、文字列値はスキップされます。インデックス作成時に文字列値を変換するには、`json_cast_function` を使用します。詳細は [例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックスタイプを選択する\{#choose-an-index-type}

cast type を選択したら、クエリパターンに応じてインデックスタイプを選択します。

| クエリパターン | 推奨インデックスタイプ | Cast type 要件 | 注記 |
| --- | --- | --- | --- |
| scalar 値に対する等価フィルターと範囲フィルターが混在 | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用。 | 値のカーディナリティに基づいて、Zilliz Cloud が内部インデックスレイアウトを選択します。 |
| JSON 配列内の値に対するフィルター | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用。 | すべての array cast type で必須です。 |
| オブジェクト全体または sub-object のインデックス作成（非推奨） | `INVERTED` または `AUTOINDEX`（互換性のみ） | `JSON` を使用。 | 互換性のためにサポートされています。新しいワークロードでは、パス固有のインデックスを作成するか、[JSON Shredding](./json-shredding) を検討してください。 |
| 数値またはソート可能な文字列に対する範囲フィルター | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用。 | ソート済みレイアウトを強制する場合は `STL_SORT`、自動選択にしたい場合は `AUTOINDEX` を使用します。 |
| 低カーディナリティ値に対する等価または `IN` フィルター | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用。 | bitmap レイアウトを強制する場合は `BITMAP` を使用します。数値には `AUTOINDEX` または `STL_SORT` を使用してください。 |

迷った場合は、scalar パスに対してまず `AUTOINDEX` から始めてください。array cast type とテキスト一致クエリでは、明示的に `INVERTED` を使用します。`INVERTED` または `AUTOINDEX` のどちらによるオブジェクト全体の JSON インデックス作成も引き続きサポートされていますが、Milvus 3.0.0 から非推奨です。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定する `json_cast_type` に依存します。 

| Cast type | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`, `DOUBLE`, `VARCHAR` | 値のカーディナリティに基づいて `BITMAP` と `STL_SORT` のいずれかを選択します。 |
| `ARRAY_BOOL`, `ARRAY_DOUBLE`, `ARRAY_VARCHAR` | サポートされていません。インデックスタイプとして明示的に `INVERTED` を使用してください。 |
| `JSON` | オブジェクト全体または sub-object のインデックス作成に `INVERTED` を使用します。 |

scalar cast type（`BOOL`、`DOUBLE`、`VARCHAR`）については、Zilliz Cloud に内部インデックスレイアウトを選択させたい場合、`AUTOINDEX` が推奨される出発点です。インデックスのビルド中に、Zilliz Cloud は JSON パス上の値の **cardinality** を測定します。cardinality とは、そのパスにおける一意な値の数を意味します。

カーディナリティに基づいて、Zilliz Cloud は次の 2 つの内部レイアウトのいずれかを選択します。

- **低カーディナリティ**: 値が頻繁に繰り返される場合です。たとえば `metadata["in_stock"]` に `true` と `false` がある場合や、`metadata["status"]` に少数の status 文字列セットがある場合です。Zilliz Cloud は、高速な等価フィルターおよび `IN` フィルターのために内部的に `BITMAP` インデックスを構築します。

- **高カーディナリティ**: `metadata["price"]`、`metadata["created_at"]`、`metadata["product_id"]` のように、ほとんどの値が一意である場合です。Zilliz Cloud は、`>`、`<`、`>=`、`<=` のような高速な範囲フィルターのために、内部的に `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` のしきい値は **100 個の一意な値** です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳細は [AUTOINDEX の BITMAP-vs-STL_SORT のしきい値を調整するにはどうすればよいですか](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

### INVERTED\{#inverted}

`INVERTED` は、テキスト一致クエリまたは array インデックス作成が必要な場合に最適です。また、非推奨のオブジェクト全体の JSON インデックス作成でも引き続き利用できます。

次の場合は、明示的に `INVERTED` を指定してください。

- JSON 配列内の値をインデックス化する必要がある場合。

- JSON object 全体または sub-object 全体に対する既存のインデックスを維持しており、`INVERTED` の動作を明示したい場合。

- 等価、`IN`、範囲、テキスト一致、array クエリを処理する 1 つのインデックスタイプが必要な場合。オブジェクト全体のサポートは互換性のために引き続き利用できますが、その代償としてインデックスサイズが大きくなります。

JSON object 全体に対する既存のインデックス（`json_cast_type="JSON"`）については、`INVERTED` または `AUTOINDEX` のいずれも引き続き使用できます。この cast type に対して、`AUTOINDEX` は `INVERTED` を使用します。オブジェクト全体の JSON インデックス作成は、新しいワークロードにはもはや推奨されません。

詳細は、[INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスからの値をソート順で保存します。数値またはソート可能な文字列値に対する範囲フィルター向けに最適化されています。

`STL_SORT` は `DOUBLE` と `VARCHAR` の cast type のみをサポートします。次の場合に使用してください。

- フィルターが `>`, `<`, `>=`, `<=` で値を比較する場合。

- インデックス化される値のカーディナリティが高い場合。たとえば価格、タイムスタンプ、ID、ソート可能なコードなどです。

- `AUTOINDEX` に選ばせるのではなく、ソート済みレイアウトを強制したい場合。

`STL_SORT` は `BOOL`、`ARRAY_*`、`JSON` cast type をサポートしません。array には `INVERTED` を使用してください。既存のオブジェクト全体のインデックスでは `INVERTED` または `AUTOINDEX` を引き続き使用できますが、オブジェクト全体の JSON インデックス作成は非推奨です。

詳細は、[STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パス上の各一意値に対してコンパクトな bitmap を作成します。頻繁に繰り返される値に対する等価フィルターおよび `IN` フィルター向けに最適化されています。

`BITMAP` は `BOOL` と `VARCHAR` の cast type のみをサポートします。次の場合に使用してください。

- フィルターで `==` または `IN` を使用する場合。

- インデックス化される値のカーディナリティが低い場合。たとえば boolean、status 値、少数の category セットなどです。

- `AUTOINDEX` に選ばせるのではなく、bitmap レイアウトを強制したい場合。

`BITMAP` は `DOUBLE`、`ARRAY_*`、`JSON` cast type をサポートしません。数値には代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細は、[BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされている `(cast type, index type)` の組み合わせをすばやく確認するには、次のマトリクスを使用してください。

| Cast type | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | Boolean 値（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数値（整数または浮動小数）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 文字列値。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | Boolean の配列。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 自動型推論およびフラット化を伴う JSON object 全体または sub-object。 | 任意のネストした object | ✓ | ✓ | — | — |

`—` と記載されたセルについては、Zilliz Cloud はインデックス作成時にリクエストを拒否します。array cast type については、明示的に `INVERTED` を使用してください（`AUTOINDEX` は array をカバーしません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形状の JSON データにインデックスを付ける方法を説明します。すべての例では、以下のサンプル構造を使用し、すでに `metadata` という名前の `JSON` フィールドを含む collection があることを前提としています。

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

以下の例では、`client` という名前の `MilvusClient` が Zilliz Cloud デプロイメントに接続されており、すでに `metadata` という名前の `JSON` フィールドを含む collection が存在することを前提としています。これらを最初からセットアップする必要がある場合は、以下のブロックを展開してください。

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

以下の例で追加するインデックス定義を収集するために、index-params object を準備します。

```python
index_params = client.prepare_index_params()
```

以降の各例では、1 つの `index_params.add_index(...)` 呼び出しを示します。自分のデータに合うものを選び、同じ `index_params` object に対して呼び出してください。その後、最後に 1 回の `client.create_index(...)` 呼び出しですべてを適用します（「インデックスを適用する」を参照）。

### 例 1: AUTOINDEX でトップレベルキーをインデックス化する\{#example-1-index-a-top-level-key-with-autoindex}

商品 category による高速フィルタリングのために `category` フィールドをインデックス化します。`AUTOINDEX` を使用すると、データ内に存在する異なる category 数に基づいて、Zilliz Cloud が `BITMAP` または `STL_SORT` を選択します。

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

supplier の連絡先検索のために、深くネストされた `email` フィールドをインデックス化します。`json_path` パラメータは、任意の深さのブラケット記法を受け付けます。

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

### 例 3: STL_SORT による範囲クエリ\{#example-3-range-queries-with-stlsort}

あるパスに対するクエリが範囲比較（`>`, `<`, `>=`, `<=`）中心になると分かっている場合は、直接 `STL_SORT` を選択します。これによりカーディナリティの測定を省略し、ただちにソート済みレイアウトを構築します。

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

インデックス作成後は、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリで、全スキャンの代わりに二分探索が使われます。

### 例 4: BITMAP による等価クエリ\{#example-4-equality-queries-with-bitmap}

低カーディナリティのキー — status code、boolean、enum のような文字列 — には、直接 `BITMAP` を選択します。等価クエリおよび `IN` クエリは bitmap 演算になります。

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

`BITMAP` は、少数の異なる文字列値しか持たない `status` 列のようなフィールドにも非常に適しています。

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

行の変換に失敗した場合（たとえば `"invalid"` のような非数値文字列）、その行はインデックス作成時にスキップされます。

### 例 6: JSON object 全体をインデックス化する\{#example-6-index-entire-json-objects}

<Admonition type="warning" icon="🚧" title="警告">

Milvus 3.0.0 以降、オブジェクト全体の JSON インデックス作成（`json_cast_type="JSON"`）は、JSON フラットインデックス作成とも呼ばれ、非推奨です。既存のインデックスおよび新規のインデックス作成リクエストは互換性のために引き続きサポートされますが、このモードは新しいワークロードにはもはや推奨されません。既知のクエリパスに対して JSON パスインデックスを作成してください。広範なクエリパターンを持つ複雑または進化する JSON ドキュメントには、[JSON Shredding](./json-shredding) を検討してください。JSON shredding は配列内の値を高速化しません。そのようなクエリには、array cast type を使った JSON パスインデックスを使用してください。

</Admonition>

互換性が必要な既存ワークロードでは、`json_cast_type="JSON"` を設定すると、指定したパスの完全な構造がインデックス化されます。Zilliz Cloud はネストされた object をパスへフラット化し、各値の型を自動的に推論します。パス配下のすべてのキーが検索可能になります。

`AUTOINDEX` は、フラット化と型推論が inverted index の機能であるため、`JSON` cast type に対して透過的に `INVERTED` を使用します。

`metadata` object 全体をインデックス化するには、次のようにします。

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

あるいは、sub-object をインデックス化することもできます。たとえば、`supplier` 情報全体です。

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

object 全体をインデックス化すると、インデックスサイズが増加します。深くネストされたドキュメントと多様なクエリパターンを持つ新しいワークロードでは、パス固有のインデックスを使用するか、[JSON Shredding](./json-shredding) を検討してください。

### インデックスを適用する\{#apply-the-index}

すべてのインデックスパラメータを追加したら、それらを collection に適用します。

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

インデックスのビルドは非同期で実行されます。特定のインデックスのビルド状態を確認するには `client.describe_index(...)` を使用します。ビルドが完了すると `state` フィールドには `Finished` が表示され、途中経過は `total_rows` / `indexed_rows` / `pending_index_rows` で確認できます。

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

`state` が `Finished` を示したら、インデックス化されたパスに対するクエリは自動的に新しいインデックスを使用します。

`AUTOINDEX` エントリでは、このレスポンスの `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は現在、ビルド時にどの基盤レイアウト（`BITMAP` または `STL_SORT`）が選択されたかを公開していません。この選択は内部最適化として扱ってください。どのレイアウトが選択されたかにかかわらず、そのパスに対する等価、`IN`、および範囲クエリは動作します。

## FAQ\{#faq}

### AUTOINDEX と明示的なインデックスタイプはどのように選べばよいですか？\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

まずは `AUTOINDEX` から始めてください。これはデータのカーディナリティに基づいて適切なレイアウトを選択し、JSON パス上のほとんどの等価、`IN`、および範囲クエリをカバーします。明示的なタイプを選ぶのは次のような場合です。

- クエリパターンがわかっている場合（例: 常に範囲 → `STL_SORT`、低カーディナリティに対する等価のみ → `BITMAP`）で、カーディナリティの測定を省略したい。

- テキスト一致または部分文字列クエリが必要な場合 → `INVERTED`。

- 配列の cast type をインデックス化する場合。`INVERTED` を明示的に使用してください。

- 既存の JSON オブジェクト全体インデックスを維持している場合。互換性のために `INVERTED` と `AUTOINDEX` の両方が引き続きサポートされますが、JSON オブジェクト全体のインデックス作成は Milvus 3.0.0 以降で非推奨です。

### クエリのフィルター式が、インデックス化された cast type と異なる型を使用している場合はどうなりますか？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルター式がインデックスの `json_cast_type` と異なる型を使用している場合、Zilliz Cloud はそのインデックスを使用せず、データで許容される場合は低速な総当たりスキャンにフォールバックすることがあります。最適なパフォーマンスを得るには、フィルター式を常にインデックスの cast type に合わせてください。たとえば、数値インデックスが `json_cast_type="DOUBLE"` で作成されている場合、数値フィルター条件のみがそのインデックスを利用します。

### JSON キーのデータ型が entity ごとに一貫していない場合はどうなりますか？\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型の不一致は **部分的なインデックス作成** につながる可能性があります。たとえば、`metadata["price"]` が数値（`99.99`）として保存されている場合と文字列（`"99.99"`）として保存されている場合があり、`json_cast_type="DOUBLE"` でインデックスを作成すると、数値だけがインデックス化されます。文字列形式のエントリはスキップされ、フィルター結果には表示されません。インデックス作成時に文字列を数値へ強制変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが単一の型を共有するようにソースデータを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、cast type やインデックスタイプに関係なく、`(field, json_path)` の組ごとに最大 1 つのインデックスしか許可されません。同じパスに `INVERTED` と `BITMAP` の両方のインデックスを作成したり、異なる cast type で同じパスに 2 つのインデックスを作成したりすることはできません。ただし、JSON オブジェクト全体に対するインデックスと、そのオブジェクト内のネストされたキーに対する別のインデックスを作成することは可能です。これらは異なるパスです。

### AUTOINDEX の BITMAP と STL_SORT のしきい値はどのように調整しますか？\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、`AUTOINDEX` はインデックス化された値の**異なる値の数が 100 以下**の場合に `BITMAP` を選択し、それ以外の場合は `STL_SORT` を選択します。このしきい値は、インデックスパラメータに `"bitmap_cardinality_limit"` を追加することで上書きできます（範囲: 1–1000）。

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

ほとんどのユーザーはこれを調整する必要はありません。適度なカーディナリティの field をビットマップ化したい場合は値を大きくし、`AUTOINDEX` をより早く `STL_SORT` に寄せたい場合は値を小さくしてください。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。
