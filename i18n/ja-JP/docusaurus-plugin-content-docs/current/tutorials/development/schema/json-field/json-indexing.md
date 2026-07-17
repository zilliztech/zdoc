---
title: "JSON インデックス作成 | Cloud"
slug: /json-indexing
sidebar_label: "インデックス作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリは collection 全体のスキャンを必要とし、データセットが増えるにつれて遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。 | Cloud"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON インデックス作成

JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリは collection 全体のスキャンを必要とし、データセットが増えるにつれて遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成するため、そのパスに対する等価、範囲、その他のフィルタークエリを高速に実行できます。

JSON インデックス作成は、次のような場合に最適です。

- 一貫性があり、既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価、`IN`、範囲、およびテキストマッチクエリ

- どのキーをインデックス化するかを厳密に制御する必要があるシナリオ

多様なクエリパターンを持つ複雑な JSON ドキュメントについては、代替として [JSON Shredding](./json-shredding) を検討してください。

## インデックスタイプの概要\{#index-type-overview}

Zilliz Cloud は JSON パス向けに 4 種類のインデックスタイプを提供しています。それぞれ異なるクエリパターンに適しています。

インデックスタイプを選択する前に、JSON パスの **cast type** を特定してください。cast type は、Zilliz Cloud がそのパスの値をどのように解釈するか、およびどのインデックスタイプが利用可能かを決定します。

### cast type を理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` にある値を解釈してインデックス化するために使用されるデータ型です。これはフィールドスキーマ型とは異なります。フィールド自体は引き続き `JSON` フィールドですが、インデックス化される各パスは特定の scalar、array、または JSON object 型として扱われます。

パスに保存されている値に一致する cast type を選択してください。cast type が特定のインデックスタイプで使用可能かを確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| Cast type | パスの値が次の場合に使用 | 値の例 |
| --- | --- | --- |
| `BOOL` | Boolean 値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列 | `"electronics"` |
| `ARRAY_BOOL` | Boolean 値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON object 全体または sub-object。オブジェクト全体の JSON インデックス作成は Milvus 3.0.0 以降で非推奨です。 | `{"supplier": {"country": "USA"}}` |

同じパスにある値の型が一貫していない場合、cast type に一致する値だけがインデックス化されます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` cast type のインデックスには数値が含まれ、文字列値はスキップされます。インデックス作成中に文字列値を変換するには、`json_cast_function` を使用してください。詳細は [例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックスタイプを選ぶ\{#choose-an-index-type}

cast type を選んだら、クエリパターンに応じてインデックスタイプを選択します。

| クエリパターン | 推奨インデックスタイプ | cast type の要件 | メモ |
| --- | --- | --- | --- |
| scalar 値に対する等価フィルターと範囲フィルターの混在 | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用します。 | 値の cardinality に基づいて、Zilliz Cloud が内部インデックスレイアウトを選択します。 |
| JSON array 内の値に対するフィルター | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用します。 | すべての array cast type で必須です。 |
| object 全体または sub-object のインデックス作成（非推奨） | `INVERTED` または `AUTOINDEX`（互換性のためのみ） | `JSON` を使用します。 | 互換性のためにサポートされています。新しいワークロードでは、パス固有のインデックスを作成するか、[JSON Shredding](./json-shredding) を検討してください。 |
| 数値またはソート可能な文字列に対する範囲フィルター | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用します。 | ソート済みレイアウトを強制するには `STL_SORT`、自動選択したい場合は `AUTOINDEX` を使用します。 |
| 低 cardinality の値に対する等価または `IN` フィルター | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用します。 | bitmap レイアウトを強制するには `BITMAP` を使用します。数値には `AUTOINDEX` または `STL_SORT` を使用します。 |

迷った場合は、scalar パスには `AUTOINDEX` から始めてください。array cast type とテキストマッチクエリには、明示的に `INVERTED` を使用します。`INVERTED` または `AUTOINDEX` のいずれかによる object 全体の JSON インデックス作成は引き続きサポートされていますが、Milvus 3.0.0 以降では非推奨です。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定する `json_cast_type` に依存します。 

| Cast type | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`, `DOUBLE`, `VARCHAR` | 値の cardinality に基づいて `BITMAP` と `STL_SORT` のどちらかを選択します。 |
| `ARRAY_BOOL`, `ARRAY_DOUBLE`, `ARRAY_VARCHAR` | サポートされていません。インデックスタイプとして明示的に `INVERTED` を使用してください。 |
| `JSON` | object 全体または sub-object のインデックス作成に `INVERTED` を使用します。 |

scalar cast type（`BOOL`、`DOUBLE`、`VARCHAR`）では、Zilliz Cloud に内部インデックスレイアウトを選択させたい場合、`AUTOINDEX` が推奨される出発点です。インデックス作成中、Zilliz Cloud は JSON パスにある値の **cardinality** を測定します。cardinality とは、そのパスにおける異なる値の数を意味します。

cardinality に基づいて、Zilliz Cloud は次の 2 つの内部レイアウトのいずれかを選択します。

- **低 cardinality**: `true` と `false` を持つ `metadata["in_stock"]` や、少数のステータス文字列セットを持つ `metadata["status"]` のように、値が頻繁に繰り返される場合です。Zilliz Cloud は、高速な等価フィルターおよび `IN` フィルターのために内部的に `BITMAP` インデックスを構築します。

- **高 cardinality**: `metadata["price"]`、`metadata["created_at"]`、`metadata["product_id"]` のように、ほとんどの値が一意である場合です。Zilliz Cloud は、`>`、`<`、`>=`、`<=` のような高速な範囲フィルターのために内部的に `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` のしきい値は **100 個の異なる値** です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳細は [AUTOINDEX の BITMAP-vs-STL_SORT しきい値を調整するにはどうすればよいですか](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

### INVERTED\{#inverted}

`INVERTED` は、テキストマッチクエリまたは array インデックス作成が必要な場合に最適です。また、非推奨の object 全体 JSON インデックス作成でも引き続き利用できます。

次の場合は `INVERTED` を明示的に指定してください。

- JSON array 内の値をインデックス化する必要がある場合。

- JSON object 全体または sub-object 全体に対する既存のインデックスを維持しており、`INVERTED` の動作を明示したい場合。

- 等価、`IN`、範囲、テキストマッチ、array クエリを処理できる 1 つのインデックスタイプが必要な場合。object 全体のサポートは互換性のために引き続き利用できますが、その代償としてインデックスサイズは大きくなります。

JSON object 全体に対する既存のインデックス（`json_cast_type="JSON"`）については、引き続き `INVERTED` または `AUTOINDEX` のいずれかを使用できます。この cast type に対して `AUTOINDEX` は `INVERTED` を使用します。object 全体の JSON インデックス作成は、新しいワークロードにはもはや推奨されません。

詳細は [INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスの値をソート順で格納します。数値またはソート可能な文字列値に対する範囲フィルター向けに最適化されています。

`STL_SORT` は `DOUBLE` と `VARCHAR` の cast type のみをサポートします。次の場合に使用してください。

- フィルターで `>`、`<`、`>=`、`<=` による比較を行う場合。

- インデックス化される値の cardinality が高い場合。たとえば、価格、タイムスタンプ、ID、ソート可能なコードなどです。

- `AUTOINDEX` に選択させるのではなく、ソート済みレイアウトを強制したい場合。

`STL_SORT` は `BOOL`、`ARRAY_*`、`JSON` の cast type をサポートしません。array には `INVERTED` を使用してください。既存の object 全体インデックスは引き続き `INVERTED` または `AUTOINDEX` を使用できますが、object 全体の JSON インデックス作成は非推奨です。

詳細は [STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パスにある個々の異なる値ごとにコンパクトな bitmap を作成します。頻繁に繰り返される値に対する等価フィルターおよび `IN` フィルター向けに最適化されています。

`BITMAP` は `BOOL` と `VARCHAR` の cast type のみをサポートします。次の場合に使用してください。

- フィルターで `==` または `IN` を使用する場合。

- インデックス化される値の cardinality が低い場合。たとえば、Boolean、status 値、または少数のカテゴリセットです。

- `AUTOINDEX` に選択させるのではなく、bitmap レイアウトを強制したい場合。

`BITMAP` は `DOUBLE`、`ARRAY_*`、`JSON` の cast type をサポートしません。数値には、代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細は [BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされる `(cast type, index type)` の組み合わせのクイックリファレンスとして、次のマトリクスを使用してください。

| Cast type | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | Boolean 値（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数値（整数または浮動小数点数）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 文字列値。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | Boolean の配列。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 自動型推論とフラット化を伴う JSON object 全体または sub-object。 | 任意のネストした object | ✓ | ✓ | — | — |

`—` とマークされたセルについては、Zilliz Cloud はインデックス作成時にリクエストを拒否します。array cast type には、明示的に `INVERTED` を使用してください（`AUTOINDEX` は array をカバーしません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形状の JSON データをインデックス化する方法を説明します。すべての例では以下のサンプル構造を使用し、`metadata` という名前の `JSON` フィールドを含む collection がすでに存在していることを前提としています。

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

以下の例では、Zilliz Cloud デプロイメントに接続された `client` という名前の `MilvusClient` と、`metadata` という名前の `JSON` フィールドをすでに含む collection があることを前提としています。これらを最初からセットアップする必要がある場合は、以下のブロックを展開してください。

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

以降の各例では、1 つの `index_params.add_index(...)` 呼び出しを示します。データに一致するものを選び、同じ `index_params` object に対して呼び出してください。その後、最後に 1 回の `client.create_index(...)` 呼び出しでまとめて適用します（「インデックスを適用する」を参照）。

### 例 1: AUTOINDEX でトップレベルキーをインデックス化する\{#example-1-index-a-top-level-key-with-autoindex}

`category` フィールドをインデックス化して、製品カテゴリによる高速フィルタリングを実現します。`AUTOINDEX` を使用すると、データ内に存在する異なるカテゴリ数に基づいて、Zilliz Cloud が `BITMAP` または `STL_SORT` を選択します。

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

supplier の連絡先検索のために、深くネストされた `email` フィールドをインデックス化します。`json_path` パラメーターは、任意の深さのブラケット記法を受け付けます。

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

あるパスに対するクエリが範囲比較（`>`、`<`、`>=`、`<=`）中心になると分かっている場合は、直接 `STL_SORT` を選択してください。これにより cardinality の測定をスキップし、すぐにソート済みレイアウトを構築します。

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

インデックス作成後、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリでは、全スキャンではなく二分探索が使用されます。

### 例 4: BITMAP による等価クエリ\{#example-4-equality-queries-with-bitmap}

低 cardinality のキー、たとえば status コード、Boolean、enum のような文字列には、直接 `BITMAP` を選択してください。等価クエリと `IN` クエリは bitmap 操作になります。

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

`BITMAP` は、少数の異なる文字列値を持つ `status` column のようなフィールドにも非常に適しています。

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

### 例 6: JSON object 全体をインデックス化する\{#example-6-index-entire-json-objects}

<Admonition type="warning" icon="🚧" title="警告">

Milvus 3.0.0 以降、object 全体の JSON インデックス作成（`json_cast_type="JSON"`）、別名 JSON フラットインデックス作成は非推奨です。既存のインデックスおよび新しいインデックス作成リクエストは互換性のために引き続きサポートされますが、このモードは新しいワークロードにはもはや推奨されません。既知のクエリパスに対して JSON パスインデックスを作成してください。幅広いクエリパターンを持つ複雑または変化し続ける JSON ドキュメントには、[JSON Shredding](./json-shredding) を検討してください。JSON shredding は array 内の値を高速化しません。そのようなクエリには、array cast type を持つ JSON パスインデックスを使用してください。

</Admonition>

互換性が必要な既存ワークロードでは、`json_cast_type="JSON"` を設定すると、指定したパスにある完全な構造をインデックス化します。Zilliz Cloud はネストした object をパスにフラット化し、各値の型を自動推論します。パス配下のすべてのキーが検索可能になります。

`JSON` cast type に対しては、フラット化と型推論が inverted index の機能であるため、`AUTOINDEX` は透過的に `INVERTED` を使用します。

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

または、sub-object をインデックス化することもできます。たとえば、すべての `supplier` 情報です。

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

### インデックスを適用する \{#apply-the-index}

すべてのインデックスパラメータを追加したら、それらを collection に適用します。

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

インデックスのビルドは非同期で実行されます。特定のインデックスのビルド状態を確認するには `client.describe_index(...)` を使用してください。ビルドが完了すると `state` フィールドには `Finished` が表示され、`total_rows` / `indexed_rows` / `pending_index_rows` で途中経過を確認できます。

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

`state` が `Finished` を返したら、インデックス化されたパスに対するクエリは自動的に新しいインデックスを使用します。

`AUTOINDEX` エントリでは、このレスポンスの `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は現在、ビルド時にどの基盤レイアウト（`BITMAP` または `STL_SORT`）が選択されたかを公開していません。この選択は内部最適化として扱ってください。選択されたレイアウトに関係なく、パスに対する等価、`IN`、および範囲クエリは機能します。

## FAQ \{#faq}

### AUTOINDEX と明示的なインデックスタイプはどのように選べばよいですか？ \{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

まずは `AUTOINDEX` から始めてください。これはデータの cardinality に基づいて適切なレイアウトを選択し、JSON パスに対するほとんどの等価、`IN`、および範囲クエリをカバーします。次のような場合は、明示的なタイプを選択してください。

- クエリパターンが分かっている場合（例: 常に範囲 → `STL_SORT`、低 cardinality に対する等価比較のみ → `BITMAP`）で、cardinality の測定を省略したい。

- テキスト一致や部分文字列クエリが必要な場合 → `INVERTED`。

- 配列の cast type をインデックス化する場合。明示的に `INVERTED` を使用してください。

- 既存の JSON オブジェクト全体インデックスを維持している場合。互換性のために `INVERTED` と `AUTOINDEX` はどちらも引き続きサポートされますが、JSON オブジェクト全体のインデックス作成は Milvus 3.0.0 以降で非推奨です。

### クエリのフィルター式が、インデックス化された cast type とは異なる型を使っている場合はどうなりますか？ \{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルター式がインデックスの `json_cast_type` とは異なる型を使用している場合、Zilliz Cloud はそのインデックスを使用せず、データが許す場合はより低速な総当たりスキャンにフォールバックする可能性があります。最高のパフォーマンスを得るには、常にフィルター式をインデックスの cast type に合わせてください。たとえば、`json_cast_type="DOUBLE"` で数値インデックスを作成した場合、インデックスを活用できるのは数値フィルター条件だけです。

### JSON キーが異なる entity 間で一貫しないデータ型を持つ場合はどうなりますか？ \{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型の不一致は **partial indexing** を引き起こす可能性があります。たとえば、`metadata["price"]` が数値 (`99.99`) と文字列 (`"99.99"`) の両方で保存されていて、`json_cast_type="DOUBLE"` でインデックスを作成した場合、インデックス化されるのは数値だけです。文字列形式のエントリはスキップされ、フィルター結果には現れません。インデックス作成時に文字列を数値へ強制変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが同じ型を共有するように元データを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか？ \{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、cast type や index type に関係なく、`(field, json_path)` の組ごとに最大 1 つのインデックスしか許可されません。同じパスに対して `INVERTED` と `BITMAP` の両方のインデックスを作成したり、異なる cast type で同じパスに 2 つのインデックスを作成したりすることはできません。ただし、JSON オブジェクト全体に対するインデックスと、そのオブジェクト内のネストされたキーに対する別のインデックスは作成できます。これらは異なるパスだからです。

### AUTOINDEX の BITMAP と STL_SORT のしきい値はどう調整すればよいですか？ \{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、`AUTOINDEX` はインデックス化された値の**異なる値の数が 100 以下**であれば `BITMAP` を選び、それ以外は `STL_SORT` を選びます。このしきい値は、インデックスパラメータに `"bitmap_cardinality_limit"` を追加することで上書きできます（範囲: 1–1000）。

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

ほとんどのユーザーはこれを調整する必要はありません。中程度の cardinality を持つフィールドで bitmap を優先したい場合は値を上げてください。`AUTOINDEX` をより早く `STL_SORT` に寄せたい場合は値を下げてください。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。
