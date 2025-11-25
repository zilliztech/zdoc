---
title: "JSONフィールドの概要 | Cloud"
slug: /json-field-overview
sidebar_label: "JSONフィールドの概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "製品カタログ、コンテンツ管理システム、またはユーザー設定エンジンなどのアプリケーションを構築する際、ベクトル埋め込みデータと一緒に柔軟なメタデータを保存する必要がよくあります。製品の属性はカテゴリによって異なり、ユーザーの設定は時間とともに変化し、ドキュメントのプロパティは複雑なネスト構造を持っています。Zilliz CloudのJSONフィールドは、パフォーマンスを犠牲にすることなく柔軟な構造化データを保存およびクエリできるため、この課題を解決します。 | Cloud"
type: origin
token: Neq4wR0EdiXokRkhXwbcMPfanCd
sidebar_position: 1
keywords:
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - json field
  - overview
  - vector database
  - IVF
  - knn
  - Image Search

---

import Admonition from '@theme/Admonition';


# JSONフィールドの概要

製品カタログ、コンテンツ管理システム、またはユーザー設定エンジンなどのアプリケーションを構築する際、ベクトル埋め込みデータと一緒に柔軟なメタデータを保存する必要がよくあります。製品の属性はカテゴリによって異なり、ユーザーの設定は時間とともに変化し、ドキュメントのプロパティは複雑なネスト構造を持っています。Zilliz CloudのJSONフィールドは、パフォーマンスを犠牲にすることなく柔軟な構造化データを保存およびクエリできるため、この課題を解決します。

## JSONフィールドとは？\{#what-is-a-json-field}

JSONフィールドは、Zilliz Cloudのスキーマ定義済みデータ型（`DataType.JSON`）であり、構造化されたキーと値のデータを格納します。伝統的な堅牢なデータベースカラムとは異なり、JSONフィールドはネストされたオブジェクト、配列、および混合データ型に対応し、高速なクエリのための複数のインデックスオプションを提供します。

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

この例では、`metadata`はフラットな値（例：`category`、`in_stock`）、配列（`tags`）、およびネストされたオブジェクト（`supplier`）の混合を含む単一のJSONフィールドです。

<Admonition type="info" icon="📘" title="ノート">

<p><strong>命名規則:</strong> JSONキーには英数字とアンダースコアのみを使用してください。クエリ時の解析に問題が発生する可能性があるため、特殊文字、スペース、またはドットは避けてください。</p>

</Admonition>

## JSONフィールドと動的フィールドの違い\{#json-field-vs-dynamic-field}

よく混同されるのが、JSONフィールドと[動的フィールド](./enable-dynamic-field)の違いです。両方ともJSONに関連していますが、異なる目的を持っています。

JSONフィールドと動的フィールドの主な違いを以下の表にまとめました：

<table>
   <tr>
     <th><p>機能</p></th>
     <th><p>JSONフィールド</p></th>
     <th><p>動的フィールド</p></th>
   </tr>
   <tr>
     <td><p>スキーマ定義</p></td>
     <td><p><code>DataType.JSON</code>型でコレクションスキーマに明示的に宣言する必要があるスカラーフィールドです。</p></td>
     <td><p>宣言されていないフィールドを自動的に格納する隠しJSONフィールド（<code>#meta</code>と命名）です。</p></td>
   </tr>
   <tr>
     <td><p>使用例</p></td>
     <td><p>スキーマが既知で一貫している構造化データを格納します。</p></td>
     <td><p>固定スキーマに適合しない柔軟な、進化する、または準構造化データを格納します。</p></td>
   </tr>
   <tr>
     <td><p>制御</p></td>
     <td><p>フィールド名と構造を制御できます。</p></td>
     <td><p>未定義フィールドはシステム管理です。</p></td>
   </tr>
   <tr>
     <td><p>クエリ</p></td>
     <td><p>フィールド名またはJSONフィールド内のターゲットキーを使用してクエリ：<code>metadata["key"]</code>。</p></td>
     <td><p>動的フィールドキーを直接使用してクエリ：<code>"dynamic_key"</code> または <code>#meta</code> 経由：<code>#meta["dynamic_key"]</code></p></td>
   </tr>
</table>

## 基本操作\{#basic-operations}

JSONフィールドを使用するための基本的なワークフローには、スキーマでそれを定義し、データを挿入し、特定のフィルター式を使用してデータをクエリすることが含まれます。

### JSONフィールドを定義\{#define-a-json-field}

JSONフィールドを使用するには、コレクションを作成する際にコレクションスキーマで明示的に定義します。次の例は、`DataType.JSON`型の`metadata`フィールドを持つコレクションを作成する方法を示しています：

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

schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True) # 主キーフィールド
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5) # ベクトルフィールド
# null値を許可するJSONフィールドを定義
# highlight-next-line
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)

client.create_collection(
    collection_name="product_catalog",
    schema=schema
)
```

<Admonition type="info" icon="📘" title="ノート">

<p>この例では、コレクションスキーマで定義されたJSONフィールドは<code>nullable=True</code>によりnull値を許可します。詳細については<a href="./nullable-and-default">Nullable & Default</a>を参照してください。</p>

</Admonition>

### データを挿入\{#insert-data}

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

JSONフィールドのフィルタリング操作を実行する前に、以下のことを確認してください：

- ベクトルフィールドにインデックスが作成されている。

- コレクションがメモリにロードされている。

<details>

<summary>サンプルコードを表示</summary>

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

これらの要件が満たされれば、以下の式を使用してJSONフィールド内の値に基づいてコレクションをフィルタリングできます。これらのフィルター式は特定のJSONパス構文と専用演算子を利用しています。

#### JSONパス構文によるフィルタリング\{#filtering-with-json-path-syntax}

特定のキーをクエリするには、角括弧記法を使用してJSONキーにアクセスします：`json_field_name["key"]`。ネストされたキーの場合は、連鎖的に記述します：`json_field_name["key1"]["key2"]`。

`category`が`"electronics"`であるエンティティをフィルタリングするには：

```python
# フィルター式を定義
filter = 'metadata["category"] == "electronics"'

client.search(
    collection_name="product_catalog",  # コレクション名
    data=[[0.1, 0.2, 0.3, 0.4, 0.5]],               # クエリベクトル（コレクションのベクトル次元と一致する必要があります）
    limit=5,                           # 返される結果の最大数
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
    limit=5,                           # 返される結果の最大数
    # highlight-next-line
    filter=filter,                    # フィルター式
    output_fields=["product_id", "metadata"]   # 検索結果に含めるフィールド
)

print(res)
```

#### JSON固有の演算子によるフィルタリング\{#filtering-with-json-specific-operators}

Zilliz Cloudは、特定のJSONフィールドキーの配列値をクエリするための特殊な演算子も提供しています。たとえば：