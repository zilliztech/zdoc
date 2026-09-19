---
title: "JSON インデックス作成 | Cloud"
slug: /json-indexing
sidebar_label: "インデックス作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリではコレクション全体のスキャンが必要となり、データセットが大きくなるにつれて遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。 | Cloud"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON インデックス作成

JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリではコレクション全体のスキャンが必要となり、データセットが大きくなるにつれて遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。

JSON インデックス作成は、次のような場合に最適です。

- 一貫性があり、既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価、`IN`、範囲、テキスト一致クエリ

- どのキーをインデックス化するかを正確に制御する必要があるシナリオ

多様なクエリパターンを持つ複雑な JSON ドキュメントでは、代替手段として [JSON Shredding](./json-shredding) を検討してください。

## インデックスタイプの概要\{#index-type-overview}

Zilliz Cloud は、JSON パス向けに 4 つのインデックスタイプを提供しています。それぞれが異なるクエリパターンに適しています。

インデックスタイプを選択する前に、JSON パスの **cast type** を特定してください。cast type は、Zilliz Cloud がそのパスの値をどのように解釈するか、および利用可能なインデックスタイプを決定します。

### cast type を理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` にある値を解釈してインデックス化するために使用されるデータ型です。これはフィールドのスキーマ型とは異なります。フィールドは引き続き `JSON` フィールドですが、インデックス化された各パスは特定のスカラー型、配列型、または JSON オブジェクト型として扱われます。

パスに保存されている値に一致する cast type を選択してください。特定のインデックスタイプでどの cast type を使用できるかを確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| Cast type | パスの値が次の場合に使用 | 値の例 |
| --- | --- | --- |
| `BOOL` | Boolean 値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列値 | `"electronics"` |
| `ARRAY_BOOL` | Boolean 値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON オブジェクト全体またはサブオブジェクト。オブジェクト全体の JSON インデックス作成は Milvus 3.0.0 以降では非推奨です。 | `{"supplier": {"country": "USA"}}` |

同じパスにある値の型が一貫していない場合は、cast type に一致する値だけがインデックス化されます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` cast type のインデックスには数値が含まれ、文字列値はスキップされます。インデックス作成時に文字列値を変換するには、`json_cast_function` を使用します。詳しくは、[例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックスタイプを選択する\{#choose-an-index-type}

cast type を選択したら、クエリパターンに応じてインデックスタイプを選択します。

| クエリパターン | 推奨されるインデックスタイプ | cast type の要件 | 備考 |
| --- | --- | --- | --- |
| スカラー値に対する等価フィルターと範囲フィルターの混在 | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用します。 | 値のカーディナリティに基づいて、Zilliz Cloud に内部のインデックスレイアウトを選択させます。 |
| JSON 配列内の値に対するフィルター | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用します。 | すべての配列 cast type で必須です。 |
| オブジェクト全体またはサブオブジェクトのインデックス作成（非推奨） | `INVERTED` または `AUTOINDEX`（互換性のみ） | `JSON` を使用します。 | 互換性のためにサポートされています。新しいワークロードでは、パス固有のインデックスを作成するか、[JSON Shredding](./json-shredding) を検討してください。 |
| 数値またはソート可能な文字列に対する範囲フィルター | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用します。 | ソート済みレイアウトを強制するには `STL_SORT` を使用し、自動選択を希望する場合は `AUTOINDEX` を使用します。 |
| 低カーディナリティ値に対する等価フィルターまたは `IN` フィルター | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用します。 | ビットマップレイアウトを強制するには `BITMAP` を使用します。数値の場合は `AUTOINDEX` または `STL_SORT` を使用します。 |

迷った場合は、スカラーパスに対して `AUTOINDEX` から始めてください。配列 cast type とテキスト一致クエリには、明示的に `INVERTED` を使用してください。`INVERTED` または `AUTOINDEX` を使用したオブジェクト全体の JSON インデックス作成は引き続きサポートされていますが、Milvus 3.0.0 以降では非推奨です。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定する `json_cast_type` によって異なります。

| Cast type | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`, `DOUBLE`, `VARCHAR` | 値のカーディナリティに基づいて `BITMAP` と `STL_SORT` のいずれかを選択します。 |
| `ARRAY_BOOL`, `ARRAY_DOUBLE`, `ARRAY_VARCHAR` | サポートされていません。インデックスタイプとして明示的に `INVERTED` を指定してください。 |
| `JSON` | オブジェクト全体またはサブオブジェクトのインデックス作成に `INVERTED` を使用します。このモードは Milvus 3.0.0 以降では非推奨です。 |

スカラー cast type（`BOOL`、`DOUBLE`、`VARCHAR`）では、Zilliz Cloud に内部のインデックスレイアウトを選択させたい場合、`AUTOINDEX` が推奨される出発点です。インデックスの構築中、Zilliz Cloud は JSON パスにある値の **カーディナリティ** を測定します。カーディナリティとは、そのパスにある異なる値の数を意味します。

カーディナリティに基づいて、Zilliz Cloud は 2 つの内部レイアウトのいずれかを選択します。

- **低カーディナリティ**: `metadata["in_stock"]` の `true` と `false`、または少数のステータス文字列を持つ `metadata["status"]` のように、値が頻繁に繰り返される場合です。Zilliz Cloud は、等価フィルターと `IN` フィルターを高速化するために、内部で `BITMAP` インデックスを構築します。

- **高カーディナリティ**: `metadata["price"]`、`metadata["created_at"]`、`metadata["product_id"]` のように、ほとんどの値が異なる場合です。Zilliz Cloud は、`>`、`<`、`>=`、`<=` などの範囲フィルターを高速化するために、内部で `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` のしきい値は **100 個の異なる値** です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳しくは、[AUTOINDEX の BITMAP と STL_SORT のしきい値を調整するにはどうすればよいですか](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

### INVERTED\{#inverted}

`INVERTED` は、テキスト一致クエリや配列のインデックス作成が必要な場合に最適です。また、非推奨となったオブジェクト全体の JSON インデックス作成でも引き続き利用できます。

次の場合は、明示的に `INVERTED` を指定してください。

- JSON 配列内の値をインデックス化する必要がある場合。

- JSON オブジェクト全体またはサブオブジェクトに対する既存のインデックスを維持しており、`INVERTED` の動作を明示したい場合。

- 等価、`IN`、範囲、テキスト一致、配列の各クエリを処理できる単一のインデックスタイプを希望する場合。オブジェクト全体のサポートは互換性のために引き続き利用できますが、インデックスサイズが大きくなるという代償があります。

JSON オブジェクト全体に対する既存のインデックス（`json_cast_type="JSON"`）では、引き続き `INVERTED` または `AUTOINDEX` のいずれかを使用できます。`AUTOINDEX` はこの cast type に対して `INVERTED` を使用します。オブジェクト全体の JSON インデックス作成は、新しいワークロードには推奨されなくなりました。

詳細については、[INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスから取得した値をソート順で保存します。数値またはソート可能な文字列値に対する範囲フィルターに最適化されています。

`STL_SORT` は `DOUBLE` と `VARCHAR` の cast type のみをサポートします。次の場合に使用してください。

- フィルターで `>`、`<`、`>=`、`<=` を使用して値を比較する場合。

- インデックス化する値のカーディナリティが高い場合（価格、タイムスタンプ、ID、ソート可能なコードなど）。

- `AUTOINDEX` に選択させるのではなく、ソート済みレイアウトを強制したい場合。

`STL_SORT` は `BOOL`、`ARRAY_*`、`JSON` の cast type をサポートしません。配列には `INVERTED` を使用してください。既存のオブジェクト全体のインデックスでは引き続き `INVERTED` または `AUTOINDEX` を使用できますが、オブジェクト全体の JSON インデックス作成は非推奨です。

詳細については、[STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パスにある異なる値ごとにコンパクトなビットマップを作成します。頻繁に繰り返される値に対する等価フィルターと `IN` フィルターに最適化されています。

`BITMAP` は `BOOL` と `VARCHAR` の cast type のみをサポートします。次の場合に使用してください。

- フィルターで `==` または `IN` を使用する場合。

- インデックス化する値のカーディナリティが低い場合（ブール値、ステータス値、少数のカテゴリなど）。

- `AUTOINDEX` に選択させるのではなく、ビットマップレイアウトを強制したい場合。

`BITMAP` は `DOUBLE`、`ARRAY_*`、`JSON` の cast type をサポートしません。数値の場合は、代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細については、[BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされている `(cast type, index type)` の組み合わせを素早く確認するには、次のマトリクスを使用してください。

| Cast type | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | Boolean 値（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数値（整数または浮動小数点数）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 文字列値。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | Boolean 値の配列。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 型の自動推論とフラット化を行う JSON オブジェクト全体またはサブオブジェクト。Milvus 3.0.0 以降では非推奨です。 | 任意のネストされたオブジェクト | はい（非推奨） | はい（非推奨） | — | — |

`—` とマークされたセルでは、Zilliz Cloud はインデックス作成時にリクエストを拒否します。配列 cast type には、明示的に `INVERTED` を使用してください（`AUTOINDEX` は配列を対象としません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形の JSON データをインデックス化する手順を説明します。すべての例では、以下のサンプル構造を使用し、`metadata` という名前の `JSON` フィールドを含むコレクションがすでに存在することを前提としています。

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

### 基本的なセットアップ\{#basic-setup}

以下の例では、Zilliz Cloud のデプロイに接続された `client` という名前の `MilvusClient` と、`metadata` という名前の `JSON` フィールドをすでに含むコレクションがあることを前提としています。これらをゼロからセットアップする必要がある場合は、以下のブロックを展開してください。

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

以下の例で追加するインデックス定義を格納するためのインデックスパラメーターオブジェクトを準備します。

```python
index_params = client.prepare_index_params()
```

後続の各例では、1 つの `index_params.add_index(...)` 呼び出しを示します。データに一致するものを選び、同じ `index_params` オブジェクトに対して呼び出します。その後、最後に 1 回の `client.create_index(...)` 呼び出しですべてを適用します（「インデックスを適用する」を参照）。

### 例 1: AUTOINDEX でトップレベルキーをインデックス化する\{#example-1-index-a-top-level-key-with-autoindex}

商品カテゴリによる高速なフィルタリングのために、`category` フィールドをインデックス化します。`AUTOINDEX` では、データ内に存在する異なるカテゴリの数に基づいて、Zilliz Cloud が `BITMAP` または `STL_SORT` を選択します。

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

サプライヤーの連絡先を検索するために、深くネストされた `email` フィールドをインデックス化します。`json_path` パラメーターは、任意の深さのブラケット記法を受け付けます。

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

### 例 3: STL_SORT を使用した範囲クエリ\{#example-3-range-queries-with-stlsort}

特定のパスに対するクエリが主に範囲比較（`>`、`<`、`>=`、`<=`）になるとわかっている場合は、`STL_SORT` を直接選択してください。これによりカーディナリティの測定が省略され、ソート済みレイアウトがすぐに構築されます。

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

インデックス作成後は、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリが、フルスキャンではなく二分探索を使用します。

### 例 4: BITMAP を使用した等価クエリ\{#example-4-equality-queries-with-bitmap}

低カーディナリティのキー（ステータスコード、ブール値、列挙型のような文字列）には、`BITMAP` を直接選択してください。等価クエリと `IN` クエリがビットマップ操作になります。

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

`BITMAP` は、少数の異なる文字列値を持つ `status` 列のようなフィールドにも非常に適しています。

### 例 5: インデックス作成時にデータ型を変換する\{#example-5-convert-data-type-at-index-time}

数値データが誤って文字列として保存されている場合は、`STRING_TO_DOUBLE` を使用して、インデックス構築時に値を数値に変換します。

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

行の変換に失敗した場合（例: `"invalid"` のような非数値文字列）、その行はインデックス作成時にスキップされます。

### 例 6: JSON オブジェクト全体をインデックス化する\{#example-6-index-entire-json-objects}

<Admonition type="warning" title="Warning">

Milvus 3.0.0 以降では、JSON flat indexing とも呼ばれるオブジェクト全体の JSON インデックス作成（`json_cast_type="JSON"`）は非推奨です。既存のインデックスと新規のインデックス作成リクエストは互換性のために引き続きサポートされていますが、このモードは新しいワークロードには推奨されなくなりました。既知のクエリパスには JSON パスインデックスを作成してください。幅広いクエリパターンを持つ複雑または変化する JSON ドキュメントでは、[JSON Shredding](./json-shredding) を検討してください。JSON shredding は配列内の値を高速化しません。そのようなクエリには、配列 cast type を指定した JSON パスインデックスを使用してください。

</Admonition>

互換性のある既存のワークロードでは、`json_cast_type="JSON"` を設定すると、指定したパスにある完全な構造がインデックス化されます。Zilliz Cloud はネストされたオブジェクトをパスにフラット化し、各値の型を自動的に推論します。そのパス配下のすべてのキーが検索可能になります。

`AUTOINDEX` は `JSON` cast type に対して透過的に `INVERTED` を使用します。これは、フラット化と型推論が転置インデックスの機能であるためです。

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

オブジェクト全体をインデックス化すると、インデックスサイズが増加します。深くネストされたドキュメントと多様なクエリパターンを持つ新しいワークロードでは、パス固有のインデックスを使用するか、[JSON Shredding](./json-shredding) を検討してください。

### インデックスを適用する\{#apply-the-index}

すべてのインデックスパラメーターを追加したら、それらをコレクションに適用します。

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

インデックスの構築は非同期で実行されます。`client.describe_index(...)` を使用して特定のインデックスの構築状態を確認します。ビルドが完了すると `state` フィールドに `Finished` と表示され、`total_rows` / `indexed_rows` / `pending_index_rows` は進行状況を示します。

```python
client.describe_index(
    collection_name="your_collection_name",
    index_name="category_index",
)
```

レスポンスの例：

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

`state` が `Finished` を示したら、インデックス化されたパスに対するクエリは新しいインデックスを自動的に使用します。

`AUTOINDEX` のエントリでは、このレスポンスの `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は現在、ビルド時にどの基盤レイアウト（`BITMAP` または `STL_SORT`）が選択されたかを公開していません。この選択は内部的な最適化として扱ってください。パスに対する等価、`IN`、範囲の各クエリは、どのレイアウトが選択されても機能します。

## FAQ\{#faq}

### AUTOINDEX と明示的なインデックスタイプのどちらを選択すべきですか？\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

まず `AUTOINDEX` から始めてください。データのカーディナリティに基づいて適切なレイアウトを選択し、JSON パスに対するほとんどの等価、`IN`、範囲クエリをカバーします。次の場合は明示的なタイプを選択してください。

- クエリパターンがわかっており（例: 常に範囲 → `STL_SORT`、常に低カーディナリティに対する等価 → `BITMAP`）、カーディナリティの測定を省略したい場合。

- テキスト一致または部分文字列クエリが必要な場合 → `INVERTED`。

- 配列 cast type をインデックス化する場合。明示的に `INVERTED` を使用してください。

- 既存のオブジェクト全体の JSON インデックスを維持している場合。`INVERTED` と `AUTOINDEX` はどちらも互換性のために引き続きサポートされていますが、オブジェクト全体の JSON インデックス作成は Milvus 3.0.0 以降では非推奨です。

### クエリのフィルター式が、インデックス化された cast type と異なる型を使用した場合はどうなりますか？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルター式がインデックスの `json_cast_type` と異なる型を使用している場合、Zilliz Cloud はそのインデックスを使用せず、データが許せばより低速なブルートフォーススキャンにフォールバックすることがあります。最良のパフォーマンスを得るには、フィルター式を常にインデックスの cast type に合わせてください。たとえば、`json_cast_type="DOUBLE"` で数値インデックスを作成した場合、インデックスを活用できるのは数値のフィルター条件だけです。

### JSON キーがエンティティごとに一貫しないデータ型を持つ場合はどうなりますか？\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型が一貫していないと、**部分的なインデックス作成** につながる可能性があります。たとえば、`metadata["price"]` が数値（`99.99`）と文字列（`"99.99"`）の両方として保存されており、`json_cast_type="DOUBLE"` でインデックスを作成した場合、インデックス化されるのは数値のみです。文字列形式のエントリはスキップされ、フィルター結果に表示されません。インデックス作成時に文字列を数値に強制変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが同じ型を共有するようにソースデータを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、cast type やインデックスタイプに関係なく、`(field, json_path)` のペアごとに最大 1 つのインデックスを作成できます。同じパスに `INVERTED` と `BITMAP` の両方のインデックスを作成したり、異なる cast type で同じパスに 2 つのインデックスを作成したりすることはできません。ただし、JSON オブジェクト全体に対するインデックスと、そのオブジェクト内のネストされたキーに対する別のインデックスを作成することはできます。これらは異なるパスです。

### AUTOINDEX の BITMAP と STL_SORT のしきい値を調整するにはどうすればよいですか？\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、`AUTOINDEX` はインデックス化される値が **異なる値が 100 個以下** の場合は `BITMAP` を選択し、それ以外の場合は `STL_SORT` を選択します。このしきい値は、インデックスパラメーターに `"bitmap_cardinality_limit"` を追加することで上書きできます（範囲：1–1000）。

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

ほとんどのユーザーはこれを調整する必要はありません。中程度のカーディナリティを持つフィールドをビットマップ化したい場合は値を上げてください。`AUTOINDEX` をより早く `STL_SORT` に寄せたい場合は値を下げてください。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。
