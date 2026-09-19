---
title: "JSON インデックス | BYOC"
slug: /json-indexing
sidebar_label: "インデックス作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリはコレクション全体のスキャンを必要とし、データセットが大きくなるにつれて遅くなります。JSON インデックスは、JSON データ内の特定のパスにインデックスを作成することで、そのパスに対する等価条件、範囲条件、その他のフィルタークエリを高速に実行できるようにします。 | BYOC"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON インデックス

JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリはコレクション全体のスキャンを必要とし、データセットが大きくなるにつれて遅くなります。JSON インデックスは、JSON データ内の特定のパスにインデックスを作成することで、そのパスに対する等価条件、範囲条件、その他のフィルタークエリを高速に実行できるようにします。

JSON インデックスが最適なのは、次のような場合です。

- 一貫性があり、既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価条件、`IN`、範囲条件、テキスト一致クエリ

- どのキーをインデックス化するかを厳密に制御する必要があるシナリオ

多様なクエリパターンを持つ複雑な JSON ドキュメントでは、代替手段として [JSON Shredding](./json-shredding) を検討してください。

## インデックスタイプの概要\{#index-type-overview}

Zilliz Cloud は、JSON パスに対して 4 つのインデックスタイプを提供しています。それぞれが異なるクエリパターンに適しています。

インデックスタイプを選択する前に、JSON パスの**キャスト型**を特定してください。キャスト型は、Zilliz Cloud がそのパスにある値をどのように解釈するか、および利用できるインデックスタイプを決定します。

### キャスト型を理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` にある値を解釈し、インデックス化するために使用するデータ型です。これはフィールドのスキーマ型とは異なります。フィールド自体は依然として `JSON` フィールドですが、インデックス化される各パスは特定のスカラー型、配列型、または JSON オブジェクト型として扱われます。

パスに保存されている値に一致するキャスト型を選択してください。特定のインデックスタイプでキャスト型を使用できるかどうかを確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| キャスト型 | パスにある値が次のような場合に使用 | 値の例 |
| --- | --- | --- |
| `BOOL` | ブール値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列値 | `"electronics"` |
| `ARRAY_BOOL` | ブール値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列値の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON オブジェクトまたはサブオブジェクト全体。オブジェクト全体の JSON インデックス作成は Milvus 3.0.0 以降は非推奨です。 | `{"supplier": {"country": "USA"}}` |

同じパスにある値の型が一致しない場合、キャスト型に一致する値だけがインデックス化されます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` キャスト型のインデックスには数値が含まれ、文字列値はスキップされます。インデックス作成時に文字列値を変換するには、`json_cast_function` を使用します。詳細は [例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックスタイプを選択する\{#choose-an-index-type}

キャスト型を選択したら、クエリパターンに応じてインデックスタイプを選択してください。

| クエリパターン | 推奨されるインデックスタイプ | キャスト型の要件 | 備考 |
| --- | --- | --- | --- |
| スカラー値に対する等価条件と範囲条件が混在するフィルター | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用します。 | 値のカーディナリティに基づいて、Zilliz Cloud が内部インデックスレイアウトを選択できるようにします。 |
| JSON 配列内の値に対するフィルター | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用します。 | すべての配列キャスト型で必須です。 |
| オブジェクト全体またはサブオブジェクトのインデックス作成（非推奨） | `INVERTED` または `AUTOINDEX`（互換性のみ） | `JSON` を使用します。 | 互換性のためにサポートされています。新しいワークロードでは、パス固有のインデックスを作成するか、[JSON Shredding](./json-shredding) を検討してください。 |
| 数値または並べ替え可能な文字列に対する範囲フィルター | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用します。 | ソート済みレイアウトを強制するには `STL_SORT` を使用し、自動選択を希望する場合は `AUTOINDEX` を使用します。 |
| カーディナリティが低い値に対する等価条件または `IN` フィルター | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用します。 | ビットマップレイアウトを強制するには `BITMAP` を使用します。数値の場合は `AUTOINDEX` または `STL_SORT` を使用してください。 |

判断に迷う場合は、スカラーのパスにはまず `AUTOINDEX` を使用してください。配列キャスト型とテキスト一致クエリには、`INVERTED` を明示的に使用してください。`INVERTED` または `AUTOINDEX` によるオブジェクト全体の JSON インデックス作成は引き続きサポートされていますが、Milvus 3.0.0 以降は非推奨です。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定する `json_cast_type` によって異なります。

| キャスト型 | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`, `DOUBLE`, `VARCHAR` | 値のカーディナリティに基づいて `BITMAP` と `STL_SORT` のいずれかを選択します。 |
| `ARRAY_BOOL`, `ARRAY_DOUBLE`, `ARRAY_VARCHAR` | サポートされません。インデックスタイプとして `INVERTED` を明示的に使用してください。 |
| `JSON` | オブジェクト全体またはサブオブジェクトのインデックス作成に `INVERTED` を使用します。このモードは Milvus 3.0.0 以降は非推奨です。 |

スカラーのキャスト型（`BOOL`、`DOUBLE`、`VARCHAR`）では、Zilliz Cloud に内部インデックスレイアウトを選択させたい場合、`AUTOINDEX` が推奨される出発点です。インデックスの構築中に、Zilliz Cloud は JSON パスにある値の**カーディナリティ**を測定します。カーディナリティとは、そのパスにある異なる値の数です。

カーディナリティに基づいて、Zilliz Cloud は 2 つの内部レイアウトのいずれかを選択します。

- **カーディナリティが低い場合**: `true` と `false` を持つ `metadata["in_stock"]` や、少数のステータス文字列を持つ `metadata["status"]` のように、値が頻繁に繰り返されます。Zilliz Cloud は、等価条件と `IN` フィルターを高速化するために、内部的に `BITMAP` インデックスを構築します。

- **カーディナリティが高い場合**: `metadata["price"]`、`metadata["created_at"]`、`metadata["product_id"]` のように、ほとんどの値が異なります。Zilliz Cloud は、`>`、`<`、`>=`、`<=` などの範囲フィルターを高速化するために、内部的に `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` の切り替えしきい値は、**100 個の異なる値**です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳細は [AUTOINDEX の BITMAP-vs-STL_SORT しきい値を調整するにはどうすればよいですか](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

### INVERTED\{#inverted}

`INVERTED` は、テキスト一致クエリや配列のインデックス作成が必要な場合に最適です。非推奨になったオブジェクト全体の JSON インデックス作成でも引き続き利用できます。

次のような場合は、`INVERTED` を明示的に指定してください。

- JSON 配列内の値をインデックス化する必要がある場合。

- JSON オブジェクトまたはサブオブジェクト全体に対する既存のインデックスを維持していて、`INVERTED` の動作を明示したい場合。

- 等価条件、`IN`、範囲条件、テキスト一致、配列のクエリを処理する単一のインデックスタイプが必要な場合。オブジェクト全体のサポートは互換性のために引き続き利用できますが、その代償としてインデックスサイズが大きくなります。

JSON オブジェクト全体に対する既存のインデックス（`json_cast_type="JSON"`）では、`INVERTED` または `AUTOINDEX` のいずれも引き続き使用できます。このキャスト型では、`AUTOINDEX` は `INVERTED` を使用します。オブジェクト全体の JSON インデックス作成は、新しいワークロードでは推奨されなくなりました。

詳細は [INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスから取得した値をソートされた順序で保存します。数値または並べ替え可能な文字列値に対する範囲フィルターに最適化されています。

`STL_SORT` がサポートするキャスト型は `DOUBLE` と `VARCHAR` のみです。次のような場合に使用してください。

- フィルターで `>`、`<`、`>=`、`<=` を使って値を比較する場合。

- インデックス化する値のカーディナリティが高い場合（価格、タイムスタンプ、ID、並べ替え可能なコードなど）。

- `AUTOINDEX` に選択させるのではなく、ソート済みレイアウトを強制したい場合。

`STL_SORT` は `BOOL`、`ARRAY_*`、`JSON` キャスト型をサポートしません。配列には `INVERTED` を使用してください。既存のオブジェクト全体のインデックスでは引き続き `INVERTED` または `AUTOINDEX` を使用できますが、オブジェクト全体の JSON インデックス作成は非推奨です。

詳細は [STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パス上の異なる値ごとにコンパクトなビットマップを作成します。頻繁に繰り返される値に対する等価条件および `IN` フィルターに最適化されています。

`BITMAP` がサポートするキャスト型は `BOOL` と `VARCHAR` のみです。次のような場合に使用してください。

- フィルターで `==` または `IN` を使用する場合。

- インデックス化する値のカーディナリティが低い場合（ブール値、ステータス値、少数のカテゴリなど）。

- `AUTOINDEX` に選択させるのではなく、ビットマップレイアウトを強制したい場合。

`BITMAP` は `DOUBLE`、`ARRAY_*`、`JSON` キャスト型をサポートしません。数値の場合は、代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細は [BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされている `(cast type, index type)` の組み合わせをすばやく確認するには、以下のマトリクスを参照してください。

| キャスト型 | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | ブール値（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数値（整数または浮動小数点数）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 文字列値。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | ブール値の配列。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 自動的な型推論とフラット化を伴う JSON オブジェクトまたはサブオブジェクト全体。Milvus 3.0.0 以降は非推奨。 | 任意のネストされたオブジェクト | はい（非推奨） | はい（非推奨） | — | — |

`—` と記されたセルでは、Zilliz Cloud はインデックス作成時にリクエストを拒否します。配列キャスト型では、`INVERTED` を明示的に使用してください（`AUTOINDEX` は配列をカバーしません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形の JSON データをインデックス化する方法を順に説明します。すべての例では以下のサンプル構造を使用し、`metadata` という名前の `JSON` フィールドを含むコレクションがすでに存在することを前提としています。

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

以下の例では、Zilliz Cloud デプロイメントに接続された `client` という名前の `MilvusClient` と、`metadata` という名前の `JSON` フィールドをすでに含むコレクションがあることを前提としています。これらをゼロからセットアップする必要がある場合は、以下のブロックを展開してください。

<details>

<summary>接続してサンプルコレクションを作成する</summary>

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

以下の例で追加するインデックス定義を収集するために、インデックスパラメータオブジェクトを準備します。

```python
index_params = client.prepare_index_params()
```

以降の各例では、1 つの `index_params.add_index(...)` 呼び出しを示します。自分のデータに合うものを選んで同じ `index_params` オブジェクトに対して呼び出し、最後に 1 回の `client.create_index(...)` 呼び出しですべてを適用します（「インデックスを適用する」を参照）。

### 例 1: AUTOINDEX でトップレベルキーをインデックス化する\{#example-1-index-a-top-level-key-with-autoindex}

製品カテゴリによる高速なフィルタリングのために、`category` フィールドをインデックス化します。`AUTOINDEX` では、データ内に存在する異なるカテゴリの数に基づいて、Zilliz Cloud が `BITMAP` または `STL_SORT` を選択します。

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

サプライヤーの連絡先を検索するために、深くネストされた `email` フィールドをインデックス化します。`json_path` パラメータは任意の深さのブラケット記法を受け付けます。

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

パスに対するクエリが範囲比較（`>`、`<`、`>=`、`<=`）中心になると分かっている場合は、`STL_SORT` を直接選択してください。これによりカーディナリティの測定が省略され、ソート済みレイアウトがすぐに構築されます。

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

インデックス作成後は、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリで、全件スキャンではなく二分探索が使用されます。

### 例 4: BITMAP による等価条件クエリ\{#example-4-equality-queries-with-bitmap}

カーディナリティが低いキー（ステータスコード、ブール値、列挙型のような文字列）には、`BITMAP` を直接選択してください。等価条件および `IN` クエリはビットマップ演算になります。

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

`BITMAP` は、少数の異なる文字列値しか持たない `status` カラムのようなフィールドにもよく適しています。

### 例 5: インデックス作成時にデータ型を変換する\{#example-5-convert-data-type-at-index-time}

数値データが誤って文字列として保存されている場合は、`STRING_TO_DOUBLE` を使用して、インデックスの構築中に値を数値へ変換します。

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

行の変換に失敗した場合（たとえば `"invalid"` のような数値以外の文字列）、その行はインデックス作成時にスキップされます。

### 例 6: JSON オブジェクト全体をインデックス化する\{#example-6-index-entire-json-objects}

<Admonition type="warning" title="Warning">

Milvus 3.0.0 以降、オブジェクト全体の JSON インデックス作成（`json_cast_type="JSON"`、JSON flat indexing とも呼ばれます）は非推奨です。既存のインデックスおよび新しいインデックス作成リクエストは互換性のために引き続きサポートされますが、このモードは新しいワークロードでは推奨されなくなりました。既知のクエリパスには JSON パスインデックスを作成してください。広範なクエリパターンを持つ複雑または変化し続ける JSON ドキュメントでは、[JSON Shredding](./json-shredding) を検討してください。JSON shredding は配列内の値を高速化しません。そのようなクエリには、配列キャスト型を指定した JSON パスインデックスを使用してください。

</Admonition>

互換性のために既存のワークロードを維持する場合、`json_cast_type="JSON"` を設定すると、指定したパスにある構造全体がインデックス化されます。Zilliz Cloud はネストされたオブジェクトをパスにフラット化し、各値の型を自動的に推論します。そのパス配下のすべてのキーが検索可能になります。

フラット化と型推論は転置インデックスの機能であるため、`AUTOINDEX` は `JSON` キャスト型に対して透過的に `INVERTED` を使用します。

`metadata` オブジェクト全体をインデックス化します。

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

または、サブオブジェクト（たとえば `supplier` のすべての情報）をインデックス化します。

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

オブジェクト全体をインデックス化すると、インデックスサイズが大きくなります。深くネストされたドキュメントと多様なクエリパターンを持つ新しいワークロードでは、パス固有のインデックスを使用するか、[JSON Shredding](./json-shredding) を検討してください。

### インデックスを適用する\{#apply-the-index}

すべてのインデックスパラメータを追加したら、コレクションに適用します。

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

インデックスの構築は非同期で実行されます。特定のインデックスの構築状態を確認するには `client.describe_index(...)` を使用します。`state` フィールドは構築が完了すると `Finished` を示し、`total_rows` / `indexed_rows` / `pending_index_rows` は進行状況を示します。

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

`state` が `Finished` を報告すると、インデックス化されたパスに対するクエリは新しいインデックスを自動的に使用します。

`AUTOINDEX` のエントリでは、このレスポンスの `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は現在、構築時にどの基盤レイアウト（`BITMAP` または `STL_SORT`）が選択されたかを公開していません。この選択は内部的な最適化とみなしてください。パスに対する等価条件、`IN`、範囲クエリは、どのレイアウトが選択された場合でも動作します。

## FAQ\{#faq}

### AUTOINDEX と明示的なインデックスタイプのどちらを選択すべきですか？\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

まず `AUTOINDEX` から始めてください。データのカーディナリティに基づいて適切なレイアウトが選択され、JSON パスに対するほとんどの等価条件、`IN`、範囲クエリをカバーできます。次のような場合は明示的なタイプを選択してください。

- クエリパターンが分かっていて（例: 常に範囲 → `STL_SORT`、カーディナリティが低い値に対する等価条件のみ → `BITMAP`）、カーディナリティの測定を省略したい場合。

- テキスト一致または部分文字列クエリが必要な場合 → `INVERTED`。

- 配列キャスト型をインデックス化する場合。`INVERTED` を明示的に使用してください。

- 既存のオブジェクト全体の JSON インデックスを維持している場合。互換性のために `INVERTED` と `AUTOINDEX` はどちらも引き続きサポートされていますが、オブジェクト全体の JSON インデックス作成は Milvus 3.0.0 以降は非推奨です。

### クエリのフィルター式がインデックス化されたキャスト型と異なる型を使用した場合はどうなりますか？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルター式がインデックスの `json_cast_type` と異なる型を使用している場合、Zilliz Cloud はそのインデックスを使用せず、データが許せば低速な総当たりスキャンにフォールバックすることがあります。最高のパフォーマンスを得るには、フィルター式を常にインデックスのキャスト型に一致させてください。たとえば、`json_cast_type="DOUBLE"` で数値インデックスを作成した場合、数値のフィルター条件だけがそのインデックスを活用します。

### JSON キーがエンティティごとに一貫しないデータ型を持つ場合はどうなりますか？\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型が一致しないと、**部分インデックス化**が発生することがあります。たとえば、`metadata["price"]` が数値（`99.99`）と文字列（`"99.99"`）の両方として保存されており、`json_cast_type="DOUBLE"` でインデックスを作成すると、数値のみがインデックス化されます。文字列形式のエントリはスキップされ、フィルター結果に表示されません。インデックス作成時に文字列を数値に変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが同じ型になるようにソースデータを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、キャスト型やインデックスタイプに関係なく、`(field, json_path)` の組ごとに最大 1 つのインデックスしか作成できません。同じパスに `INVERTED` と `BITMAP` の両方のインデックスを作成したり、異なるキャスト型で同じパスに 2 つのインデックスを作成したりすることはできません。ただし、JSON オブジェクト全体に対するインデックスと、そのオブジェクト内のネストされたキーに対する別のインデックスを作成することはできます。これらは異なるパスです。

### AUTOINDEX の BITMAP-vs-STL_SORT しきい値を調整するにはどうすればよいですか？\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、`AUTOINDEX` はインデックス化される値が**100 個以下の異なる値**である場合に `BITMAP` を選択し、それ以外の場合は `STL_SORT` を選択します。このしきい値は、インデックスパラメータに `"bitmap_cardinality_limit"` を追加することで上書きできます（範囲: 1–1000）。

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

ほとんどのユーザーはこれを調整する必要はありません。中程度のカーディナリティを持つフィールドをビットマップで処理したい場合はこの値を大きくし、`AUTOINDEX` をより早く `STL_SORT` に寄せたい場合は小さくしてください。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。
