---
title: "JSON インデックス作成 | BYOC"
slug: /json-indexing
sidebar_label: "インデックス作成"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリは collection 全体のスキャンを必要とし、データセットが増えるにつれて遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成することで、そのパスに対する等価、範囲、その他のフィルタクエリを高速に実行できます。 | BYOC"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON インデックス作成

JSON フィールドは、Zilliz Cloud で構造化メタデータを保存するための柔軟な方法を提供します。インデックスがない場合、JSON フィールドに対するクエリは collection 全体のスキャンを必要とし、データセットが増えるにつれて遅くなります。JSON インデックス作成では、JSON データ内の特定のパスにインデックスを作成することで、そのパスに対する等価、範囲、その他のフィルタクエリを高速に実行できます。

JSON インデックス作成は、次のようなケースに最適です。

- 一貫性があり、既知のキーを持つ構造化スキーマ

- 特定の JSON パスに対する等価、`IN`、範囲、およびテキストマッチクエリ

- どのキーをインデックス化するかを正確に制御する必要があるシナリオ

多様なクエリパターンを持つ複雑な JSON ドキュメントについては、代替手段として [JSON Shredding](./json-shredding) を検討してください。

## インデックス種別の概要\{#index-type-overview}

Zilliz Cloud は JSON パスに対して 4 つのインデックス種別を提供します。それぞれが異なるクエリパターンに適しています。

インデックス種別を選ぶ前に、JSON パスの **cast type** を特定してください。cast type は、Zilliz Cloud がそのパスの値をどのように解釈するか、また利用可能なインデックス種別を決定します。

### cast type を理解する\{#understand-cast-types}

`json_cast_type` は、`json_path` の値を解釈およびインデックス化するために使用されるデータ型です。これはフィールドスキーマの型とは異なります。フィールド自体は引き続き `JSON` フィールドですが、インデックス化された各パスは特定の scalar、array、または JSON object 型として扱われます。

パスに保存されている値に一致する cast type を選択してください。cast type が特定のインデックス種別で使用できるか確認するには、[互換性リファレンス](./json-indexing#compatibility-reference) を参照してください。

| Cast type | パスの値が...である場合に使用 | 値の例 |
| --- | --- | --- |
| `BOOL` | Boolean 値 | `true` |
| `DOUBLE` | 数値 | `99.99` |
| `VARCHAR` | 文字列 | `"electronics"` |
| `ARRAY_BOOL` | Boolean 値の配列 | `[true, false]` |
| `ARRAY_DOUBLE` | 数値の配列 | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | 文字列の配列 | `["tag1", "tag2"]` |
| `JSON` | JSON object 全体または sub-object | `{"supplier": {"country": "USA"}}` |

同じパスの値に型の不一致がある場合、cast type に一致する値だけがインデックス化されます。たとえば、`metadata["price"]` に `99.99` と `"99.99"` の両方が含まれている場合、`DOUBLE` cast type のインデックスは数値を含み、文字列値はスキップします。インデックス作成中に文字列値を変換するには、`json_cast_function` を使用してください。詳しくは [例 5: インデックス作成時にデータ型を変換する](./json-indexing#example-5-convert-data-type-at-index-time) を参照してください。

### インデックス種別を選択する\{#choose-an-index-type}

cast type を選択したら、クエリパターンに応じてインデックス種別を選択します。

| クエリパターン | 推奨インデックス種別 | Cast type の要件 | 注記 |
| --- | --- | --- | --- |
| scalar 値に対する等価フィルタと範囲フィルタの混在 | `AUTOINDEX` | `BOOL`、`DOUBLE`、または `VARCHAR` を使用します。 | 値の cardinality に基づいて Zilliz Cloud が内部インデックスレイアウトを選択します。 |
| JSON 配列内の値に対するフィルタ | `INVERTED` | `ARRAY_BOOL`、`ARRAY_DOUBLE`、または `ARRAY_VARCHAR` を使用します。 | すべての array cast type で必須です。 |
| object 全体または sub-object のインデックス化 | `INVERTED` または `AUTOINDEX` | `JSON` を使用します。 | `JSON` cast type では、`AUTOINDEX` は cardinality ベースの選択ではなく `INVERTED` を使用します。 |
| 数値またはソート可能な文字列に対する範囲フィルタ | `STL_SORT` または `AUTOINDEX` | `DOUBLE` または `VARCHAR` を使用します。 | ソート済みレイアウトを強制するには `STL_SORT` を、選択を自動化したい場合は `AUTOINDEX` を使用します。 |
| 低 cardinality 値に対する等価または `IN` フィルタ | `BITMAP` または `AUTOINDEX` | `BOOL` または `VARCHAR` を使用します。 | bitmap レイアウトを強制するには `BITMAP` を使用します。数値には `AUTOINDEX` または `STL_SORT` を使用してください。 |

迷った場合は、scalar パスに対して `AUTOINDEX` から始めてください。array cast type とテキストマッチクエリでは明示的に `INVERTED` を使用してください。object 全体の JSON インデックス作成には、`INVERTED` または `AUTOINDEX` のいずれかを使用します。

### AUTOINDEX\{#autoindex}

`AUTOINDEX` の動作は、指定した `json_cast_type` に依存します。 

| Cast type | `AUTOINDEX` の動作 |
| --- | --- |
| `BOOL`, `DOUBLE`, `VARCHAR` | 値の cardinality に基づいて `BITMAP` と `STL_SORT` のいずれかを選択します。 |
| `ARRAY_BOOL`, `ARRAY_DOUBLE`, `ARRAY_VARCHAR` | サポートされません。インデックス種別として明示的に `INVERTED` を使用してください。 |
| `JSON` | object 全体または sub-object のインデックス化に `INVERTED` を使用します。 |

scalar cast type（`BOOL`、`DOUBLE`、`VARCHAR`）については、Zilliz Cloud に内部インデックスレイアウトを選択させたい場合、`AUTOINDEX` が推奨される開始点です。インデックス作成中、Zilliz Cloud は JSON パスにある値の **cardinality** を測定します。cardinality とは、そのパスに存在する異なる値の数を意味します。

cardinality に基づいて、Zilliz Cloud は 2 つの内部レイアウトのいずれかを選択します。

- **低 cardinality**: `metadata["in_stock"]` の `true` と `false` のように、値が頻繁に繰り返される場合、または少数のステータス文字列を持つ `metadata["status"]` のような場合です。Zilliz Cloud は、高速な等価フィルタおよび `IN` フィルタのために内部的に `BITMAP` インデックスを構築します。

- **高 cardinality**: `metadata["price"]`、`metadata["created_at"]`、`metadata["product_id"]` のように、ほとんどの値が一意である場合です。Zilliz Cloud は、`>`、`<`、`>=`、`<=` などの高速な範囲フィルタのために内部的に `STL_SORT` インデックスを構築します。

デフォルトの `BITMAP` と `STL_SORT` のしきい値は **100 個の異なる値** です。このしきい値は `bitmap_cardinality_limit` で調整できます。詳しくは [AUTOINDEX の BITMAP-vs-STL_SORT しきい値を調整するにはどうすればよいですか](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold) を参照してください。

### INVERTED\{#inverted}

`INVERTED` は、テキストマッチクエリ、配列のインデックス化、または object 全体の JSON インデックス化が必要な場合に最適です。

次の場合は、明示的に `INVERTED` を指定してください。

- JSON 配列内の値をインデックス化する必要がある。

- JSON object 全体または sub-object をインデックス化し、`INVERTED` の動作を明示したい。

- 等価、`IN`、範囲、テキストマッチ、配列、および object レベルのクエリを扱える単一のインデックス種別が必要であり、その代わりにインデックスサイズが大きくなってもよい。

JSON object 全体（`json_cast_type="JSON"`）については、`INVERTED` または `AUTOINDEX` のいずれかを使用できます。この cast type に対して `AUTOINDEX` は `INVERTED` を使用します。

詳細は、[INVERTED](./inverted-index-type) を参照してください。

### STL_SORT\{#stlsort}

`STL_SORT` は、JSON パスの値をソート順で保存します。数値またはソート可能な文字列値に対する範囲フィルタ向けに最適化されています。

`STL_SORT` は `DOUBLE` と `VARCHAR` の cast type のみをサポートします。次の場合に使用してください。

- フィルタで `>`、`<`、`>=`、`<=` を使用する。

- インデックス化される値の cardinality が高い。たとえば、価格、タイムスタンプ、ID、またはソート可能なコードなど。

- `AUTOINDEX` に任せるのではなく、ソート済みレイアウトを強制したい。

`STL_SORT` は `BOOL`、`ARRAY_*`、`JSON` cast type をサポートしません。配列または object 全体のインデックス化には `INVERTED` を使用してください。

詳細は、[STL_SORT](./slt-sort-index-type) を参照してください。

### BITMAP\{#bitmap}

`BITMAP` は、JSON パスの各異なる値に対してコンパクトな bitmap を作成します。頻繁に繰り返される値に対する等価フィルタおよび `IN` フィルタ向けに最適化されています。

`BITMAP` は `BOOL` と `VARCHAR` の cast type のみをサポートします。次の場合に使用してください。

- フィルタで `==` または `IN` を使用する。

- インデックス化される値の cardinality が低い。たとえば、boolean、status 値、または少数のカテゴリなど。

- `AUTOINDEX` に任せるのではなく、bitmap レイアウトを強制したい。

`BITMAP` は `DOUBLE`、`ARRAY_*`、`JSON` cast type をサポートしません。数値には、代わりに `AUTOINDEX`、`STL_SORT`、または `INVERTED` を使用してください。

詳細は、[BITMAP](./bitmap-index-type) を参照してください。

### 互換性リファレンス\{#compatibility-reference}

サポートされている `(cast type, index type)` の組み合わせを素早く確認するために、次のマトリクスを使用してください。

| Cast type | 説明 | 値の例 | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | Boolean 値（`true`/`false`）。 | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | 数値（整数または浮動小数点）。 | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | 文字列値。 | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | boolean の配列。 | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | 数値の配列。 | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | 文字列の配列。 | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | 自動型推論とフラット化を伴う JSON object 全体または sub-object。 | 任意のネストされた object | ✓ | ✓ | — | — |

`—` とマークされたセルについては、Zilliz Cloud はインデックス作成時にリクエストを拒否します。array cast type では、明示的に `INVERTED` を使用してください（`AUTOINDEX` は配列を対象にしません）。

## JSON インデックスを作成する\{#create-a-json-index}

このセクションでは、さまざまな形状の JSON データをインデックス化する方法を説明します。すべての例では以下のサンプル構造を使用し、`metadata` という名前の `JSON` フィールドを含む collection がすでに存在することを前提としています。

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

以降の各例では、1 つの `index_params.add_index(...)` 呼び出しを示します。自分のデータに合うものを選び、同じ `index_params` object に対して呼び出してください。その後、最後に 1 回の `client.create_index(...)` 呼び出しでまとめて適用します（「インデックスを適用する」を参照）。

### 例 1: AUTOINDEX でトップレベルキーをインデックス化する\{#example-1-index-a-top-level-key-with-autoindex}

製品カテゴリによる高速フィルタリングのために `category` フィールドをインデックス化します。`AUTOINDEX` を使用すると、データ内に存在する異なるカテゴリ数に基づいて、Zilliz Cloud が `BITMAP` または `STL_SORT` を選択します。

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

supplier の連絡先検索のために、深くネストされた `email` フィールドをインデックス化します。`json_path` パラメータは任意の深さの bracket notation を受け付けます。

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

あるパスに対するクエリが範囲比較（`>`、`<`、`>=`、`<=`）中心になると分かっている場合は、直接 `STL_SORT` を選択してください。これにより cardinality の測定を省略し、ただちにソート済みレイアウトを構築します。

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

インデックス作成後、`metadata["price"] > 50 AND metadata["price"] < 100` のような範囲クエリは、全件スキャンではなく二分探索を使用します。

### 例 4: BITMAP を使った等価クエリ\{#example-4-equality-queries-with-bitmap}

低 cardinality のキー、たとえば status code、boolean、enum 的な文字列には、直接 `BITMAP` を選択してください。等価クエリおよび `IN` クエリは bitmap 演算になります。

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

`BITMAP` は、少数の異なる文字列値しか持たない `status` カラムのようなフィールドにも非常によく適しています。

### 例 5: インデックス作成時にデータ型を変換する\{#example-5-convert-data-type-at-index-time}

数値データが誤って文字列として保存されている場合は、`STRING_TO_DOUBLE` を使ってインデックス構築中に値を数値へ変換します。

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

ある行で変換に失敗した場合（たとえば `"invalid"` のような非数値文字列）、その行はインデックス作成時にスキップされます。

### 例 6: JSON object 全体をインデックス化する\{#example-6-index-entire-json-objects}

`json_cast_type="JSON"` を設定すると、指定されたパスにある完全な構造をインデックス化します。Zilliz Cloud はネストされた object をパスにフラット化し、各値の型を自動的に推論します。そのパス配下のすべてのキーが検索可能になります。

`JSON` cast type では、フラット化と型推論が inverted index の機能であるため、`AUTOINDEX` は透過的に `INVERTED` を使用します。

`metadata` object 全体をインデックス化する例:

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

または、sub-object をインデックス化することもできます。たとえば、すべての `supplier` 情報を対象にする場合:

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

object 全体をインデックス化すると、インデックスサイズは大きくなります。多様なクエリパターンを持つ深くネストされたドキュメントについては、JSON Shredding を検討してください。

### インデックスを適用する\{#apply-the-index}

すべてのインデックスパラメータを追加したら、それらを collection に適用します。

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

インデックス構築は非同期で実行されます。特定のインデックスの構築状態を確認するには `client.describe_index(...)` を使用します。`state` フィールドが `Finished` を示したら構築は完了しており、`total_rows` / `indexed_rows` / `pending_index_rows` により途中経過を確認できます。

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

`AUTOINDEX` エントリについては、このレスポンスの `index_type` フィールドは `AUTOINDEX` として報告されます。Zilliz Cloud は現在、構築時にどの基盤レイアウト（`BITMAP` または `STL_SORT`）が選ばれたかを公開していません。この選択は内部最適化として扱ってください。どのレイアウトが選ばれた場合でも、そのパスに対する等価、`IN`、および範囲クエリは動作します。

## FAQ\{#faq}

### AUTOINDEX と明示的なインデックス種別はどのように選べばよいですか？\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

まずは `AUTOINDEX` から始めてください。これはデータの cardinality に基づいて適切なレイアウトを選択し、JSON パスに対するほとんどの等価、`IN`、および範囲クエリをカバーします。次のような場合は明示的な種別を選択してください。

- クエリパターンが分かっている場合（例: 常に範囲 → `STL_SORT`、常に低 cardinality の等価 → `BITMAP`）で、cardinality 測定を省略したい。

- テキストマッチまたは部分文字列クエリが必要 → `INVERTED`。

- array cast type または JSON object 全体をインデックス化する → `INVERTED`（object 全体の場合は `AUTOINDEX` も可）。

### クエリのフィルタ式がインデックス化された cast type と異なる型を使用している場合はどうなりますか？\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

フィルタ式がインデックスの `json_cast_type` と異なる型を使用している場合、Zilliz Cloud はそのインデックスを使用せず、データ上許容される場合はより低速な brute-force scan にフォールバックする可能性があります。最高のパフォーマンスを得るには、フィルタ式を常にインデックスの cast type と一致させてください。たとえば、`json_cast_type="DOUBLE"` で数値インデックスを作成した場合、数値によるフィルタ条件だけがそのインデックスを活用します。

### 異なる entity 間で JSON キーのデータ型に不一致がある場合はどうなりますか？\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

型の不一致は **部分的なインデックス化** を引き起こす可能性があります。たとえば、`metadata["price"]` が数値（`99.99`）と文字列（`"99.99"`）の両方として保存されていて、`json_cast_type="DOUBLE"` でインデックスを作成した場合、数値だけがインデックス化されます。文字列形式のエントリはスキップされ、フィルタ結果には現れません。インデックス作成時に文字列を数値へ強制変換するには `json_cast_function="STRING_TO_DOUBLE"` を使用するか、すべてのエントリが 1 つの型を共有するように元データを修正してください。

### 同じ JSON キーに複数のインデックスを作成できますか？\{#can-i-create-multiple-indexes-on-the-same-json-key}

いいえ。Zilliz Cloud では、cast type やインデックス種別に関係なく、`(field, json_path)` の組み合わせごとに作成できるインデックスは最大 1 つです。同じパスに対して `INVERTED` と `BITMAP` の両方を作成したり、異なる cast type で同じパスに 2 つのインデックスを作成したりすることはできません。ただし、JSON object 全体に対するインデックスと、その object 内のネストされたキーに対する別のインデックスは作成できます。これらは異なるパスだからです。

### AUTOINDEX の BITMAP-vs-STL_SORT しきい値はどのように調整すればよいですか？\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

デフォルトでは、`AUTOINDEX` はインデックス化される値が **100 個以下の異なる値** を持つ場合に `BITMAP` を選び、それ以外では `STL_SORT` を選びます。このしきい値は、インデックスパラメータに `"bitmap_cardinality_limit"` を追加することで上書きできます（範囲: 1–1000）。

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

ほとんどのユーザーはこれを調整する必要はありません。moderately-cardinal なフィールドを bitmap 化したい場合は値を上げ、`AUTOINDEX` をより早く `STL_SORT` に寄せたい場合は値を下げてください。`INVERTED`、`STL_SORT`、または `BITMAP` を明示的に指定した場合、この設定は無視されます。
