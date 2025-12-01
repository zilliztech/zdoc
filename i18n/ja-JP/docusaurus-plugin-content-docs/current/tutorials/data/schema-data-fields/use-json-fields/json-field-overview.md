---
title: "JSONフィールドの概要 | Cloud"
slug: /json-field-overview
sidebar_label: "JSONフィールドの概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "製品カタログ、コンテンツ管理システム、ユーザープレファレンスエンジンなどのアプリケーションを構築する際、ベクターエンベディングとともに柔軟なメタデータを保存する必要がよくあります。製品属性はカテゴリによって異なり、ユーザープレファレンスは時間とともに変化し、ドキュメントプロパティは複雑なネストされた構造を持っています。Zilliz CloudのJSONフィールドは、パフォーマンスを犠牲にすることなく柔軟な構造化データを保存およびクエリできる機能により、この課題を解決します。 | Cloud"
type: origin
token: Neq4wR0EdiXokRkhXwbcMPfanCd
sidebar_position: 1
keywords:
  - zilliz
  - ベクトルデータベース
  - クラウド
  - コレクション
  - スキーマ
  - jsonフィールド
  - 概要
  - ベクトルデータベース
  - IVF
  - knn
  - 画像検索

---

import Admonition from '@theme/Admonition';


# JSONフィールドの概要

製品カタログ、コンテンツ管理システム、ユーザープレファレンスエンジンなどのアプリケーションを構築する際、ベクターエンベディングとともに柔軟なメタデータを保存する必要がよくあります。製品属性はカテゴリによって異なり、ユーザープレファレンスは時間とともに変化し、ドキュメントプロパティは複雑なネストされた構造を持っています。Zilliz CloudのJSONフィールドは、パフォーマンスを犠牲にすることなく柔軟な構造化データを保存およびクエリできる機能により、この課題を解決します。

## JSONフィールドとは\{#what-is-a-json-field}

JSONフィールドは、Zilliz Cloudにおけるスキーマ定義されたデータ型（`DataType.JSON`）であり、構造化されたキーバリューデータを保存します。従来の剛直なデータベースカラムとは異なり、JSONフィールドはネストされたオブジェクト、配列、および混合データ型を許容し、高速クエリ用に複数のインデックスオプションを提供します。

JSONフィールド構造の例:

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

この例では、`metadata` はフラットな値（例：`category`、`in_stock`）、配列（`tags`）、およびネストされたオブジェクト（`supplier`）を含む単一のJSONフィールドです。

<Admonition type="info" icon="📘" title="注意">

<p><strong>命名規則：</strong>JSONキーには英数字とアンダースコアのみを使用してください。クエリで解析の問題を引き起こす可能性があるため、特殊文字、スペース、またはドットは避けてください。</p>

</Admonition>

## JSONフィールドと動的フィールドの違い\{#json-field-vs-dynamic-field}

よくある混乱点は、JSONフィールドと[動的フィールド](./enable-dynamic-field)との違いです。両方ともJSONに関係していますが、異なる目的を果たします。

JSONフィールドと動的フィールドの主な違いを以下の表にまとめています:

<table>
   <tr>
     <th><p>機能</p></th>
     <th><p>JSONフィールド</p></th>
     <th><p>動的フィールド</p></th>
   </tr>
   <tr>
     <td><p>スキーマ定義</p></td>
     <td><p><code>DataType.JSON</code>型でコレクションスキーマ内に明示的に宣言する必要があるスカラーフィールド。</p></td>
     <td><p>宣言されていないフィールドを自動的に保存する非表示のJSONフィールド（名前は<code>#meta</code>）。</p></td>
   </tr>
   <tr>
     <td><p>使用例</p></td>
     <td><p>スキーマが既知で一貫している構造化データを保存。</p></td>
     <td><p>固定スキーマに適合しない柔軟な、進化する、または準構造化されたデータを保存。</p></td>
   </tr>
   <tr>
     <td><p>制御</p></td>
     <td><p>フィールド名と構造を制御できます。</p></td>
     <td><p>未定義フィールド用にシステム管理。</p></td>
   </tr>
   <tr>
     <td><p>クエリ</p></td>
     <td><p>フィールド名またはJSONフィールド内の特定のキーを使用してクエリ：<code>metadata["key"]</code>。</p></td>
     <td><p>動的フィールドキーを直接使用してクエリ：<code>"dynamic_key"</code>または<code>#meta</code>経由：<code>#meta["dynamic_key"]</code></p></td>
   </tr>
</table>

## 基本操作\{#basic-operations}

JSONフィールドを使用するための基本的なワークフローには、スキーマ内での定義、データの挿入、および特定のフィルター式を使用したデータのクエリが含まれます。

### JSONフィールドを定義する\{#define-a-json-field}

JSONフィールドを使用するには、コレクションを作成する際にスキーマ内で明示的に定義します。以下の例では、`DataType.JSON`型の`metadata`フィールドを持つコレクションを作成する方法を示しています:

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# Milvusクライアントのセットアップ
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

# スキーマの作成
schema = client.create_schema(auto_id=False, enable_dynamic_field=True)

schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True) # プライマリフィールド
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5) # ベクトルフィールド
# null値を許可するJSONフィールドを定義
# highlight-next-line
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)

client.create_collection(
    collection_name="product_catalog",
    schema=schema
)
```

<Admonition type="info" icon="📘" title="注意">

<p>この例では、コレクションスキーマで定義されたJSONフィールドは<code>nullable=True</code>でnull値を許可します。詳細は<a href="./nullable-and-default">Nullable & Default</a>を参照してください。</p>

</Admonition>

### データの挿入\{#insert-data}

コレクションが作成されたら、指定されたJSONフィールドに構造化されたJSONオブジェクトを含むエンティティを挿入します。データは辞書のリストとしてフォーマットする必要があります。

```python
entities = [
    {
        "product_id": 1,
        "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
        # highlight-start
        "metadata": { # JSONフィールド
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

### フィルタリング操作\{#filtering-operations}

JSONフィールドのフィルタリング操作を実行する前に、以下を確認してください:

- 各ベクトルフィールドにインデックスが作成されている。
- コレクションがメモリにロードされている。

<details>

<summary>コード例を表示</summary>

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

</details>

これらの要件が満たされれば、以下の式を使用してJSONフィールド内の値に基づいてコレクションのフィルタリングができます。これらのフィルター式は特定のJSONパス構文と専用演算子を利用しています。

#### JSONパス構文によるフィルタリング\{#filtering-with-json-path-syntax}

特定のキーをクエリするには、角括弧表記を使用してJSONキーにアクセスします：`json_field_name["key"]`。ネストされたキーの場合は、連鎖させます：`json_field_name["key1"]["key2"]`。

`category`が`"electronics"`であるエンティティをフィルタリングするには:

```python
# フィルター式を定義
filter = 'metadata["category"] == "electronics"'

client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクターディムと一致する必要があります）
    limit=5,                           # 返される結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)
```

ネストされたキー`supplier["country"]`が`"USA"`であるエンティティをフィルタリングするには:

```python
# フィルター式を定義
filter = 'metadata["supplier"]["country"] == "USA"'

res = client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクターディムと一致する必要があります）
    limit=5,                           # 返される結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)

print(res)
```

#### JSON固有の演算子によるフィルタリング\{#filtering-with-json-specific-operators}

Zilliz Cloudは、特定のJSONフィールドキーの配列値をクエリするための特別な演算子も提供します。例えば:

- `json_contains(identifier, expr)`：JSON配列内に特定の要素またはサブ配列が存在するかどうかをチェック
- `json_contains_all(identifier, expr)`：指定されたJSON式のすべての要素がフィールド内に存在することを確認
- `json_contains_any(identifier, expr)`：JSON式の少なくとも1つのメンバーがフィールド内に存在するエンティティをフィルタ

`tags`キー配下の`"summer_sale"`値を持つ製品を検索するには:

```python
# フィルター式を定義
filter = 'json_contains(metadata["tags"], "summer_sale")'

res = client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクターディムと一致する必要があります）
    limit=5,                           # 返される結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)

print(res)
```

`tags`キー配下に`"electronics"`、`"new"`、または`"clearance"`値の少なくとも1つを持つ製品を検索するには:

```python
# フィルター式を定義
filter = 'json_contains_any(metadata["tags"], ["electronics", "new", "clearance"])'

res = client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクターディムと一致する必要があります）
    limit=5,                           # 返される結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)

print(res)
```

JSON固有の演算子の詳細については、[JSON演算子](./json-filtering-operators)を参照してください。

## 次：JSONクエリの高速化\{#next-accelerate-json-queries}

デフォルトでは、高速化されていないJSONフィールドのクエリはすべての行をフルスキャンするため、大規模なデータセットでは遅くなる可能性があります。JSONクエリを高速化するために、Zilliz Cloudは高度なインデックスおよびストレージ最適化機能を提供します。

以下の表は、それらの違いと最適使用例をまとめています:

<table>
   <tr>
     <th><p>技術</p></th>
     <th><p>最適対象</p></th>
     <th><p>配列の高速化</p></th>
     <th><p>注意</p></th>
   </tr>
   <tr>
     <td><p>JSONインデックス</p></td>
     <td><p>頻繁にアクセスされるキーの小規模セット、特定の配列キーの配列</p></td>
     <td><p>はい（インデックス付き配列キー）</p></td>
     <td><p>キーを事前選択する必要あり、スキーマが変更された場合はメンテナンスが必要</p></td>
   </tr>
   <tr>
     <td><p>JSONシャレディング</p></td>
     <td><p>多くのキーにわたる一般的な高速化、多様なクエリに柔軟性</p></td>
     <td><p>はい（ブルートフォースクエリと比較して配列値をわずかに高速化）</p></td>
     <td><p>追加ストレージ設定、配列は引き続きキーベースインデックスが必要</p></td>
   </tr>
   <tr>
     <td><p>NGRAMインデックス</p></td>
     <td><p>ワイルドカード検索、テキストフィールドでの部分文字列一致</p></td>
     <td><p>該当なし</p></td>
     <td><p>数値/範囲フィルターには不向き</p></td>
   </tr>
</table>

**ヒント：** これらのアプローチを組み合わせることができます。たとえば、幅広いクエリ高速化にはJSONシャレディングを使用し、高頻度の配列キーにはJSONインデックスを使用し、柔軟なテキスト検索にはNGRAMインデックスを使用するなどです。

実装の詳細については、以下を参照してください：

-  [JSONインデックス](./json-indexing)

- [JSONシャレディング](./json-shredding)

- [NGRAM](./ngram-index-type)

## FAQ\{#faq}

### JSONフィールドのサイズに制限はありますか？\{#are-there-any-limitations-on-the-size-of-a-json-field}

はい。各JSONフィールドは65,536バイトに制限されています。

### JSONフィールドはデフォルト値の設定をサポートしていますか？\{#does-a-json-field-support-setting-a-default-value}

いいえ、JSONフィールドはデフォルト値をサポートしていません。ただし、フィールド定義時に`nullable=True`を設定して空のエントリを許可できます。

詳細については[Nullable & Default](./nullable-and-default)を参照してください。

### JSONフィールドキーには命名規則がありますか？\{#are-there-any-naming-conventions-for-json-field-keys}

はい、クエリおよびインデックスとの互換性を確保するために：

- JSONキーには英数字とアンダースコアのみを使用してください。
- 特殊文字、スペース、またはドット（`.`, `/`など）の使用は避けてください。
- 互換性のないキーはフィルター式で解析の問題を引き起こす可能性があります。

### Zilliz CloudはJSONフィールド内の文字列値をどのように処理しますか？\{#how-does-zilliz-cloud-handle-string-values-in-json-fields}

Zilliz CloudはJSON入力でのように文字列値を正確に保存します—意味的な変換は行いません。不適切にクォートされた文字列は解析中にエラーになる可能性があります。

**有効な文字列の例：**

```plaintext
"a\"b", "a'b", "a\\b"
```

**無効な文字列の例：**

```plaintext
'a"b', 'a\'b'
```
