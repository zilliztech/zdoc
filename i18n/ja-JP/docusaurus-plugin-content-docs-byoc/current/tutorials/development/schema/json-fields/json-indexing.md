---
title: "JSON インデックス | BYOC"
slug: /json-indexing
sidebar_label: "インデックス作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリは collection 全体のスキャンを必要とし、データセットが増えるにつれて遅くなります。JSON インデックスは JSON データ内の特定のパスにインデックスを作成し、そのパスに対する等価条件、範囲条件、その他のフィルタクエリを高速に実行できるようにします。 | BYOC"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON インデックス

JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリは collection 全体のスキャンを必要とし、データセットが増えるにつれて遅くなります。JSON インデックスは JSON データ内の特定のパスにインデックスを作成し、そのパスに対する等価条件、範囲条件、その他のフィルタクエリを高速に実行できるようにします。

JSON インデックスは、次のような場合に最適です。

- 一貫性があり、既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価条件、`IN`、範囲条件、テキストマッチクエリ

- どのキーをインデックス化するかを正確に制御する必要があるシナリオ

多様なクエリパターンを持つ複雑な JSON ドキュメントでは、代替案として [JSON Shredding](./json-shredding) を検討してください。

## インデックスタイプの概要\{#index-type-overview}

Zilliz Cloud は JSON パスに対して 4 つのインデックスタイプを提供しています。それぞれが異なるクエリパターンに適しています。

インデックスタイプを選ぶ前に、JSON パスの **cast type** を特定してください。cast type は、Zilliz Cloud がそのパスの値をどのように解釈するか、および利用可能なインデックスタイプを決定します。

### cast type を理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` にある値を解釈してインデックス化するために使われるデータ型です。これはフィールドスキーマ型とは異なります。フィールド自体は依然として `JSON` フィールドですが、インデックス化される各パスは特定の scalar、array、または JSON object 型として扱われます。

そのパスに保存されている値に一致する cast type を選択してください。特定のインデックスタイプでどの cast type が使えるかを確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| Cast type | パスの値が次のような場合に使用 | 値の例 |
| --- | --- | --- |
| `BOOL` | Boolean 値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列 | `"electronics"` |
| `ARRAY_BOOL` | Boolean 値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON object 全体または sub-object 全体。JSON object 全体のインデックス作成は Milvus 3.0.0 から非推奨です。 | `{"supplier": {"country": "USA"}}` |

同じパスにある値の型が一貫していない場合、cast type に一致する値だけがインデックス化されます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` cast type のインデックスには数値の値が含まれ、文字列の値はスキップされます。インデックス作成時に文字列値を変換するには、`json_cast_function` を使用してください。詳細は [例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックスタイプを選ぶ\{#choose-an-index-type}

cast type を選択したら、クエリパターンに応じてインデックスタイプを選択してください。

| クエリパターン | 推奨インデックスタイプ | cast type 要件 | メモ |
| --- | --- | --- | --- |
| scalar 値に対する等価条件と範囲条件が混在するフィルタ | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用。 | 値の cardinality に基づいて、Zilliz Cloud が内部インデックスレイアウトを選択します。 |
| JSON array 内の値に対するフィルタ | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用。 | すべての array cast type で必須です。 |
| object 全体または sub-object 全体のインデックス作成（非推奨） | `INVERTED` または `AUTOINDEX`（互換性のためのみ） | `JSON` を使用。 | 互換性のためにサポートされています。新しいワークロードでは、パスごとのインデックスを作成するか、[JSON Shredding](./json-shredding) を検討してください。 |
| 数値またはソート可能な文字列に対する範囲フィルタ | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用。 | ソート済みレイアウトを強制するには `STL_SORT` を使用し、自動選択させたい場合は `AUTOINDEX` を使用します。 |
| cardinality が低い値に対する等価条件または `IN` フィルタ | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用。 | ビットマップレイアウトを強制するには `BITMAP` を使用します。数値には `AUTOINDEX` または `STL_SORT` を使用してください。 |

迷った場合は、scalar パスにはまず `AUTOINDEX` を使ってください。array cast type とテキストマッチクエリには、明示的に `INVERTED` を使用してください。`INVERTED` と `AUTOINDEX` のいずれによる object 全体の JSON インデックス作成も引き続きサポートされていますが、Milvus 3.0.0 から非推奨です。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定する `json_cast_type` によって異なります。 

| Cast type | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`, `DOUBLE`, `VARCHAR` | 値の cardinality に基づいて `BITMAP` と `STL_SORT` のどちらかを選択します。 |
| `ARRAY_BOOL`, `ARRAY_DOUBLE`, `ARRAY_VARCHAR` | サポートされません。インデックスタイプとして明示的に `INVERTED` を使用してください。 |
| `JSON` | object 全体または sub-object 全体のインデックス作成に `INVERTED` を使用します。このモードは Milvus 3.0.0 から非推奨です。 |

scalar cast type（`BOOL`、`DOUBLE`、`VARCHAR`）では、Zilliz Cloud に内部インデックスレイアウトを選ばせたい場合、`AUTOINDEX` が推奨される出発点です。インデックス構築中に、Zilliz Cloud は JSON パスにある値の **cardinality** を測定します。cardinality とは、そのパスに存在する異なる値の数を意味します。

cardinality に基づいて、Zilliz Cloud は次の 2 つの内部レイアウトのいずれかを選択します。

- **低 cardinality**: `true` と `false` を持つ `metadata["in_stock"]` や、少数のステータス文字列セットを持つ `metadata["status"]` のように、値が頻繁に繰り返される場合。Zilliz Cloud は高速な等価条件および `IN` フィルタのために内部的に `BITMAP` インデックスを構築します。

- **高 cardinality**: `metadata["price"]`、`metadata["created_at"]`、`metadata["product_id"]` のように、ほとんどの値が一意である場合。Zilliz Cloud は `>`, `<`, `>=`, `<=` のような高速な範囲フィルタのために内部的に `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` の切り替えしきい値は **100 個の異なる値** です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳細は [AUTOINDEX の BITMAP-vs-STL_SORT しきい値を調整するにはどうすればよいですか](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

### INVERTED\{#inverted}

`INVERTED` は、テキストマッチクエリや array のインデックス作成が必要な場合に最も適しています。非推奨となった object 全体の JSON インデックス作成でも引き続き利用できます。

次のような場合は、明示的に `INVERTED` を指定してください。

- JSON array 内の値をインデックス化する必要がある。

- JSON object 全体または sub-object 全体に対する既存のインデックスを維持しており、`INVERTED` の動作を明示したい。

- 等価条件、`IN`、範囲条件、テキストマッチ、array クエリを扱える単一のインデックスタイプが欲しい。object 全体のサポートは互換性のために引き続き利用できますが、その代償としてインデックスサイズは大きくなります。

JSON object 全体に対する既存のインデックス（`json_cast_type="JSON"`）では、`INVERTED` または `AUTOINDEX` のいずれも引き続き使用できます。この cast type では `AUTOINDEX` は `INVERTED` を使用します。object 全体の JSON インデックス作成は、新しいワークロードではもはや推奨されません。

詳細は [INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスの値をソート順で保存します。数値やソート可能な文字列値に対する範囲フィルタ向けに最適化されています。

`STL_SORT` がサポートする cast type は `DOUBLE` と `VARCHAR` のみです。次のような場合に使用してください。

- フィルタで `>`, `<`, `>=`, `<=` を使う。

- インデックス化される値の cardinality が高く、価格、timestamp、ID、またはソート可能なコードのようなデータである。

- `AUTOINDEX` に選ばせるのではなく、ソート済みレイアウトを強制したい。

`STL_SORT` は `BOOL`、`ARRAY_*`、`JSON` cast type をサポートしません。array には `INVERTED` を使用してください。既存の object 全体インデックスでは引き続き `INVERTED` または `AUTOINDEX` を使用できますが、object 全体の JSON インデックス作成は非推奨です。

詳細は [STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パス上の各異なる値に対してコンパクトなビットマップを作成します。頻繁に繰り返される値に対する等価条件および `IN` フィルタ向けに最適化されています。

`BITMAP` がサポートする cast type は `BOOL` と `VARCHAR` のみです。次のような場合に使用してください。

- フィルタで `==` または `IN` を使う。

- インデックス化される値の cardinality が低く、boolean、status 値、または少数の category のようなデータである。

- `AUTOINDEX` に選ばせるのではなく、ビットマップレイアウトを強制したい。

`BITMAP` は `DOUBLE`、`ARRAY_*`、`JSON` cast type をサポートしません。数値には、代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細は [BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされる `(cast type, index type)` の組み合わせをすばやく確認するには、次のマトリクスを参照してください。

| Cast type | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | Boolean 値（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数値（整数または浮動小数点数）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 文字列値。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | boolean の配列。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 自動的な型推論とフラット化を伴う JSON object 全体または sub-object。Milvus 3.0.0 から非推奨。 | 任意のネストされた object | Yes (deprecated) | Yes (deprecated) | — | — |

`—` と示されたセルでは、Zilliz Cloud はインデックス作成時にリクエストを拒否します。array cast type では、明示的に `INVERTED` を使用してください（`AUTOINDEX` は array をカバーしません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形状の JSON データをインデックス化する方法を説明します。すべての例は以下のサンプル構造を使用し、`metadata` という名前の `JSON` フィールドを含む collection がすでに存在することを前提としています。

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

以下の例では、`client` という名前の `MilvusClient` が Zilliz Cloud デプロイメントに接続されており、`metadata` という名前の `JSON` フィールドをすでに含む collection があることを前提としています。これらを最初からセットアップする必要がある場合は、以下のブロックを展開してください。

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

以下の例で追加するインデックス定義を集めるため、index-params object を準備します。

```python
index_params = client.prepare_index_params()
```

続く各例では、1 つの `index_params.add_index(...)` 呼び出しを示します。自分のデータに合うものを選び、同じ `index_params` object に対して呼び出してください。その後、最後に 1 回の `client.create_index(...)` 呼び出しですべてを適用します（「インデックスを適用する」を参照）。

### 例 1: AUTOINDEX でトップレベルキーをインデックス化する\{#example-1-index-a-top-level-key-with-autoindex}

製品 category による高速なフィルタリングのために、`category` フィールドをインデックス化します。`AUTOINDEX` では、データ内に存在する異なる category の数に基づいて、Zilliz Cloud が `BITMAP` または `STL_SORT` を選択します。

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

supplier の連絡先検索のために、深くネストされた `email` フィールドをインデックス化します。`json_path` パラメータは任意の深さのブラケット記法を受け付けます。

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

パスに対するクエリが範囲比較（`>`, `<`, `>=`, `<=`）中心になることがわかっている場合は、直接 `STL_SORT` を選択してください。これにより cardinality の測定を省略し、すぐにソート済みレイアウトを構築します。

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

インデックス作成後、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリでは、全件スキャンではなく二分探索が使われます。

### 例 4: BITMAP による等価条件クエリ\{#example-4-equality-queries-with-bitmap}

cardinality が低いキー — status コード、boolean、列挙型のような文字列 — には、直接 `BITMAP` を選択してください。等価条件および `IN` クエリはビットマップ演算になります。

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

行ごとの変換に失敗した場合（たとえば `"invalid"` のような非数値文字列）、その行はインデックス作成中にスキップされます。

### 例 6: JSON object 全体をインデックス化する\{#example-6-index-entire-json-objects}

<Admonition type="warning" icon="🚧" title="警告">

Milvus 3.0.0 以降、object 全体の JSON インデックス作成（`json_cast_type="JSON"`）、別名 JSON flat indexing は非推奨です。既存のインデックスおよび新しいインデックス作成リクエストは互換性のために引き続きサポートされますが、このモードは新しいワークロードではもはや推奨されません。既知のクエリパスに対して JSON パスインデックスを作成してください。広範なクエリパターンを持つ複雑または進化中の JSON ドキュメントについては、[JSON Shredding](./json-shredding) を検討してください。JSON shredding は array 内の値を高速化しません。そのようなクエリには、array cast type を使った JSON パスインデックスを使用してください。

</Admonition>

互換性のために既存ワークロードを維持する場合、`json_cast_type="JSON"` を設定すると、指定したパスの完全な構造がインデックス化されます。Zilliz Cloud はネストされた object をパスへフラット化し、各値の型を自動推論します。そのパス配下のすべてのキーが検索可能になります。

`AUTOINDEX` は、フラット化と型推論が inverted index の機能であるため、`JSON` cast type には透過的に `INVERTED` を使用します。

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

または、sub-object をインデックス化することもできます。たとえば、すべての `supplier` 情報を対象にする場合は次のとおりです。

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

object 全体のインデックス化はインデックスサイズを増加させます。深くネストされたドキュメントと多様なクエリパターンを持つ新しいワークロードでは、パスごとのインデックスを使用するか、[JSON Shredding](./json-shredding) を検討してください。

### インデックスを適用する\{#apply-the-index}

すべてのインデックスパラメータを追加したら、それらを collection に適用します。

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

インデックスのビルドは非同期で実行されます。特定のインデックスのビルド状態を確認するには `client.describe_index(...)` を使用します。ビルドが完了すると `state` フィールドは `Finished` を示し、`total_rows` / `indexed_rows` / `pending_index_rows` は途中経過を示します。

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

`state` が `Finished` を示したら、インデックス付きパスに対するクエリは自動的に新しいインデックスを使用します。

`AUTOINDEX` エントリについては、このレスポンスの `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は現在、ビルド時にどの内部レイアウト（`BITMAP` または `STL_SORT`）が選択されたかを公開していません。この選択は内部最適化として扱ってください。どのレイアウトが選ばれたかにかかわらず、そのパスに対する等価条件、`IN`、および範囲クエリは動作します。

## FAQ\{#faq}

### AUTOINDEX と明示的なインデックスタイプはどう選べばよいですか？\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

まずは `AUTOINDEX` から始めてください。これはデータの cardinality に基づいて適切なレイアウトを選択し、JSON パス上のほとんどの等価条件、`IN`、および範囲クエリをカバーします。次のような場合は明示的なタイプを選んでください。

- クエリパターンが分かっている場合（例: 常に範囲 → `STL_SORT`、低 cardinality に対する等価条件のみ → `BITMAP`）で、cardinality の測定を省きたい。

- テキスト一致または部分文字列クエリが必要な場合 → `INVERTED`。

- 配列の cast type に対してインデックスを作成している場合。明示的に `INVERTED` を使用してください。

- 既存の JSON オブジェクト全体に対するインデックスを維持している場合。互換性のため `INVERTED` と `AUTOINDEX` はどちらも引き続きサポートされますが、JSON オブジェクト全体のインデックス作成は Milvus 3.0.0 から非推奨です。

### クエリの filter expression がインデックスの cast type と異なる型を使用している場合はどうなりますか？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

filter expression がインデックスの `json_cast_type` と異なる型を使用している場合、Zilliz Cloud はそのインデックスを使用せず、データが許す場合は低速な総当たりスキャンにフォールバックすることがあります。最高のパフォーマンスを得るには、常に filter expression をインデックスの cast type に合わせてください。たとえば、数値インデックスが `json_cast_type="DOUBLE"` で作成されている場合、数値の filter 条件だけがそのインデックスを活用します。

### JSON キーが異なる entity 間で一貫しないデータ型を持つ場合はどうなりますか？\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型の不一致は**部分インデックス化**につながる可能性があります。たとえば、`metadata["price"]` が数値 (`99.99`) と文字列 (`"99.99"`) の両方で保存されていて、`json_cast_type="DOUBLE"` でインデックスを作成した場合、数値だけがインデックス化されます。文字列形式のエントリはスキップされ、filter 結果には現れません。インデックス作成時に文字列を数値へ強制変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが同じ型を共有するように元データを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、cast type やインデックスタイプに関係なく、`(field, json_path)` の組ごとに作成できるインデックスは最大 1 つです。同じパスに対して `INVERTED` と `BITMAP` の両方のインデックスを作成したり、異なる cast type で同じパスに 2 つのインデックスを作成したりすることはできません。ただし、JSON オブジェクト全体に対するインデックスと、そのオブジェクト内のネストされたキーに対する別のインデックスを作成することはできます。これらは異なるパスです。

### AUTOINDEX の BITMAP と STL_SORT のしきい値はどう調整しますか？\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、`AUTOINDEX` はインデックス対象の値が**100 以下の異なる値**を持つ場合に `BITMAP` を選択し、それ以外の場合は `STL_SORT` を選択します。このしきい値は、インデックスパラメータに `"bitmap_cardinality_limit"` を追加することで上書きできます（範囲: 1–1000）。

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

ほとんどのユーザーはこれを調整する必要はありません。中程度の cardinality を持つ field で bitmap を優先したい場合はこの値を上げ、`AUTOINDEX` をより早く `STL_SORT` に寄せたい場合は下げてください。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。
