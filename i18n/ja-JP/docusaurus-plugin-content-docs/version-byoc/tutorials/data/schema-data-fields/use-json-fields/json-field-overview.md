---
title: "JSONフィールド概要 | BYOC"
slug: /json-field-overview
sidebar_label: "JSONフィールド概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "製品カタログ、コンテンツ管理システム、またはユーザー設定エンジンなどのアプリケーションを構築する際、ベクトル埋め込みとともに柔軟なメタデータを保存する必要がよくあります。製品属性はカテゴリによって異なり、ユーザー設定は時間とともに変化し、ドキュメントプロパティは複雑なネスト構造を持ちます。Zilliz CloudのJSONフィールドは、パフォーマンスを犠牲にすることなく柔軟な構造化データを保存およびクエリできるようにすることでこの課題を解決します。 | BYOC"
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
  - 自然言語処理データベース
  - 安価なベクトルデータベース
  - 管理型ベクトルデータベース
  - Pineconeベクトルデータベース

---

import Admonition from '@theme/Admonition';


# JSONフィールド概要

製品カタログ、コンテンツ管理システム、またはユーザー設定エンジンなどのアプリケーションを構築する際、ベクトル埋め込みとともに柔軟なメタデータを保存する必要がよくあります。製品属性はカテゴリによって異なり、ユーザー設定は時間とともに変化し、ドキュメントプロパティは複雑なネスト構造を持ちます。Zilliz CloudのJSONフィールドは、パフォーマンスを犠牲にすることなく柔軟な構造化データを保存およびクエリできるようにすることでこの課題を解決します。

## JSONフィールドとは？\{#what-is-a-json-field}

JSONフィールドは、Zilliz Cloudのスキーマ定義データ型（`DataType.JSON`）であり、構造化されたキー・バリューのデータを保存します。従来の剛性なデータベースカラムとは異なり、JSONフィールドはネストされたオブジェクト、配列、および混合データ型を許容しながら、高速クエリのための複数のインデックスオプションを提供します。

JSONフィールド構造の例：

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

この例では、`metadata`はフラット値（例：`category`、`in_stock`）、配列（`tags`）、およびネストされたオブジェクト（`supplier`）を含む単一のJSONフィールドです。

<Admonition type="info" icon="📘" title="注意">

<p><strong>命名規則：</strong>JSONキーには文字、数字、およびアンダースコアのみを使用してください。クエリで解析問題を引き起こす可能性があるため、特殊文字、スペース、またはドットは避けてください。</p>

</Admonition>

## JSONフィールドと動的フィールドの違い\{#json-field-vs-dynamic-field}

よく混同されるのは、JSONフィールドと[動的フィールド](./enable-dynamic-field)の違いです。両方ともJSONに関連していますが、異なった目的を持っています。

以下の表は、JSONフィールドと動的フィールドの主な違いをまとめています。

<table>
   <tr>
     <th><p>機能</p></th>
     <th><p>JSONフィールド</p></th>
     <th><p>動的フィールド</p></th>
   </tr>
   <tr>
     <td><p>スキーマ定義</p></td>
     <td><p><code>DataType.JSON</code>型でコレクションスキーマに明示的に宣言する必要があるスカラーフィールド。</p></td>
     <td><p>宣言されていないフィールドを自動的に保存する隠しJSONフィールド（名前：<code>#meta</code>）。</p></td>
   </tr>
   <tr>
     <td><p>使用例</p></td>
     <td><p>スキーマが分かっており一貫している構造化データを保存。</p></td>
     <td><p>固定スキーマに合わない柔軟、変化、または半構造化されたデータを保存。</p></td>
   </tr>
   <tr>
     <td><p>制御</p></td>
     <td><p>フィールド名と構造を制御できます。</p></td>
     <td><p>未定義フィールドはシステム管理。</p></td>
   </tr>
   <tr>
     <td><p>クエリ</p></td>
     <td><p>フィールド名またはJSONフィールド内のターゲットキーを使用してクエリ：<code>metadata["key"]</code>。</p></td>
     <td><p>動的フィールドキーを直接使用してクエリ：<code>"dynamic_key"</code> または <code>#meta</code>経由：<code>#meta["dynamic_key"]</code></p></td>
   </tr>
</table>

## 基本操作\{#basic-operations}

JSONフィールドを使用するための基本的なワークフローには、スキーマで定義し、データを挿入し、その後特定のフィルター式を使用してデータをクエリすることが含まれます。

### JSONフィールドを定義\{#define-a-json-field}

JSONフィールドを使用するには、コレクションを作成する際にコレクションスキーマで明示的に定義します。以下の例は、`DataType.JSON`型の`metadata`フィールドを持つコレクションを作成する方法を示しています。

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# Milvusクライアントを設定
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

# スキーマを作成
schema = client.create_schema(auto_id=False, enable_dynamic_field=True)

schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True) # 主フィールド
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5) # ベクトルフィールド
# null値を許容するJSONフィールドを定義
# highlight-next-line
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)

client.create_collection(
    collection_name="product_catalog",
    schema=schema
)
```

<Admonition type="info" icon="📘" title="注意">

<p>この例では、コレクションスキーマで定義されたJSONフィールドは<code>nullable=True</code>でnull値を許容します。詳細は<a href="./nullable-and-default">Null許容性とデフォルト</a>を参照してください。</p>

</Admonition>

### データの挿入\{#insert-data}

コレクションが作成されたら、指定したJSONフィールドに構造化されたJSONオブジェクトを含むエンティティを挿入してください。データは辞書のリストとしてフォーマットする必要があります。

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

JSONフィールドでフィルタリング操作を実行する前に、以下のことを確認してください。

- すべてのベクトルフィールドにインデックスを作成しました。

- コレクションがメモリにロードされています。

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

これらの要件が満たされれば、以下の式を使用してJSONフィールド内の値に基づいてコレクションをフィルタリングできます。これらのフィルター式は特定のJSONパス構文および専用オペレータを活用します。

#### JSONパス構文によるフィルタリング\{#filtering-with-json-path-syntax}

特定のキーをクエリするには、ブラケット表記を使用してJSONキーにアクセスします：`json_field_name["key"]`。ネストされたキーの場合は、`json_field_name["key1"]["key2"]`のように連鎖させます。

`category`が`"electronics"`であるエンティティをフィルタリングするには：

```python
# フィルター式を定義
filter = 'metadata["category"] == "electronics"'

client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクトル次元と一致する必要があります）
    limit=5,                           # 返す結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)
```

ネストされたキー`supplier["country"]`が`"USA"`であるエンティティをフィルタリングするには：

```python
# フィルター式を定義
filter = 'metadata["supplier"]["country"] == "USA"'

res = client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクトル次元と一致する必要があります）
    limit=5,                           # 返す結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)

print(res)
```

#### JSON固有のオペレータによるフィルタリング\{#filtering-with-json-specific-operators}

Zilliz Cloudは、特定のJSONフィールドキーの配列値をクエリするための特別なオペレータも提供します。たとえば：

- `json_contains(identifier, expr)`：JSON配列内に特定の要素またはサブ配列が存在するかどうかをチェック

- `json_contains_all(identifier, expr)`：指定されたJSON式のすべての要素がフィールドに存在することを確認

- `json_contains_any(identifier, expr)`：JSON式の少なくとも1つのメンバーがフィールド内に存在するエンティティをフィルタリング

`tags`キーの下に`"summer_sale"`値を持つ製品を見つけるには：

```python
# フィルター式を定義
filter = 'json_contains(metadata["tags"], "summer_sale")'

res = client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクトル次元と一致する必要があります）
    limit=5,                           # 返す結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)

print(res)
```

`tags`キーの下に`"electronics"`、`"new"`、または`"clearance"`のいずれかの値が少なくとも1つある製品を見つけるには：

```python
# フィルター式を定義
filter = 'json_contains_any(metadata["tags"], ["electronics", "new", "clearance"])'

res = client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクトル次元と一致する必要があります）
    limit=5,                           # 返す結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)

print(res)
```

JSON固有のオペレータの詳細については、[JSONオペレータ](./json-filtering-operators)を参照してください。

## 次へ：JSONクエリの高速化\{#next-accelerate-json-queries}

デフォルトでは、加速機能なしのJSONフィールドのクエリはすべての行を完全スキャンするため、大規模データセットでは遅くなる可能性があります。JSONクエリを高速化するために、Zilliz Cloudは高度なインデックスおよびストレージ最適化機能を提供します。

以下の表は、それらの違いと最適使用シナリオをまとめています。

<table>
   <tr>
     <th><p>手法</p></th>
     <th><p>最適な使用例</p></th>
     <th><p>配列の高速化</p></th>
     <th><p>備考</p></th>
   </tr>
   <tr>
     <td><p>JSONインデクシング</p></td>
     <td><p>頻繁にアクセスされるキーの小さなセット、特定の配列キーの配列</p></td>
     <td><p>はい（インデックスされた配列キー上で）</p></td>
     <td><p>キーを事前に選択する必要があり、スキーマが変化する場合はメンテナンスが必要</p></td>
   </tr>
   <tr>
     <td><p>JSONシャレディング</p></td>
     <td><p>多くのキーにわたる一般的な高速化、さまざまなクエリに柔軟に対応</p></td>
     <td><p>はい（ブルートフォースクエリと比較して配列値をわずかに高速化）</p></td>
     <td><p>追加のストレージ設定が必要、配列にはキーごとのインデックスが必要</p></td>
   </tr>
   <tr>
     <td><p>NGRAMインデックス</p></td>
     <td><p>ワイルドカード検索、テキストフィールドでの部分文字列マッチング</p></td>
     <td><p>該当なし</p></td>
     <td><p>数値/範囲フィルターには不向き</p></td>
   </tr>
</table>

**ヒント：** これらのアプローチを組み合わせることができます。たとえば、一般的なクエリ高速化にはJSONシャレディングを使用し、高頻度の配列キーにはJSONインデクシングを使用し、柔軟なテキスト検索にはNGRAMインデクシングを使用できます。

実装の詳細については、以下を参照してください：

- [JSONインデクシング](./json-indexing)

- [JSONシャレディング](./json-shredding)

- [NGRAM](./ngram-index-type)

## よくある質問\{#faq}

### JSONフィールドのサイズに制限はありますか？\{#are-there-any-limitations-on-the-size-of-a-json-field}

はい。各JSONフィールドは65,536バイトに制限されています。

### JSONフィールドはデフォルト値の設定をサポートしていますか？\{#does-a-json-field-support-setting-a-default-value}

いいえ、JSONフィールドはデフォルト値をサポートしていません。ただし、フィールドを定義する際に`nullable=True`を設定して空のエントリを許可できます。

詳細は[Null許容性とデフォルト](./nullable-and-default)を参照してください。

### JSONフィールドキーには命名規則がありますか？\{#are-there-any-naming-conventions-for-json-field-keys}

はい、クエリおよびインデックスとの互換性を確保するために：

- JSONキーには文字、数字、およびアンダースコアのみを使用してください。

- 特殊文字、スペース、またはドット（`.`, `/`など）の使用は避けてください。

- 互換性のないキーはフィルター式で解析問題を引き起こす可能性があります。

### Zilliz CloudはJSONフィールド内の文字列値をどのように処理しますか？\{#how-does-zilliz-cloud-handle-string-values-in-json-fields}

Zilliz Cloudは、JSON入力に表示されるまま正確に文字列値を保存します—意味的な変換は行いません。不適切にクォートされた文字列は、解析中にエラーを引き起こす可能性があります。

**有効な文字列の例**：

```plaintext
"a\"b", "a'b", "a\\b"
```

**無効な文字列の例**：

```plaintext
'a"b', 'a\'b'
```
