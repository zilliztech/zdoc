---
title: "add_function_field() | Python | MilvusClient"
slug: /python/python/Function-add_function_field
sidebar_label: "add_function_field()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションに関数ベースのフィールドを追加します。これは、スキーマの変更（新しい出力フィールドと関数定義）を、新しい出力フィールドにバインドされたインデックスメタ情報とともにコミットする高レベルの便利なラッパーです。サーバーはスキーマの変更と同時にインデックスメタ情報をアトミックに作成するため、バックフィルの Compaction がベクトルインデックスの欠落によってブロックされることはありません。 | Python | MilvusClient"
type: docx
token: SPl9dAH9noQ2e9xu86Zcy4XxnTb
sidebar_position: 6
keywords: 
  - milvus ベクトルデータベース
  - milvus データベース
  - milvus ベクトルデータベース
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - クラウド
  - add_function_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_function_field()

この操作は、既存のコレクションに関数ベースのフィールドを追加します。これは、スキーマの変更（新しい出力フィールドと関数定義）を、新しい出力フィールドにバインドされたインデックスメタ情報とともにコミットする高レベルの便利なラッパーです。サーバーはスキーマの変更と同時にインデックスメタ情報をアトミックに作成するため、バックフィルの Compaction がベクトルインデックスの欠落によってブロックされることはありません。

<Admonition type="info" title="Note">

index_params には、出力フィールドの明示的な index_type を含むエントリを 1 つだけ指定する必要があります。サーバーは、バインドされたインデックスパラメーターのないベクトル出力フィールドを拒否します。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.add_function_field(
    collection_name: str,
    field_schema: FieldSchema,
    func: Function,
    index_params: IndexParams,
    timeout: Optional[float] = None
)
```

**パラメーター：**

- **collection_name** (*str*) -

    **[必須]**

    変更するコレクションの名前です。

- **field_schema** (*[FieldSchema](./MilvusClient-FieldSchema)*) -

    **[必須]**

    関数によって生成される新しい出力フィールドのスキーマです。たとえば、BM25 用の SPARSE_FLOAT_VECTOR フィールドや MinHash 用の BINARY_VECTOR フィールドです。

- **func** (*[Function](./MilvusClient-Function)*) -

    **[必須]**

    出力フィールドを生成する関数定義です。たとえば、FunctionType.BM25 または FunctionType.MINHASH 関数です。サポートされる組み合わせは、FunctionType.BM25 と DataType.SPARSE_FLOAT_VECTOR、および FunctionType.MINHASH と DataType.BINARY_VECTOR です。

- **index_params** (*[IndexParams](./Management-prepare_index_params)*) -

    **[必須]**

    新しい出力フィールドにバインドされるインデックス定義です。明示的な index_type を含むエントリを 1 つだけ含める必要があります (たとえば、SPARSE_INVERTED_INDEX/BM25 または MINHASH_LSH/MHJACCARD).

- **timeout** (*float | None*) -

    スキーマ変更 RPC のタイムアウト（秒）です。これを None に設定すると、応答の到着時またはエラーの発生時にこの操作がタイムアウトすることを示します。

**戻り値の型：**

*NoneType*

**戻り値：**

None。

**例外：**

- **ParamError**

    必須パラメーターが欠落しているか無効な場合に発生します。必須パラメーターが欠落しているか無効な場合に発生します。

- **MilvusException**

    スキーマの変更が失敗した場合にこの例外が発生します。スキーマの変更が失敗した場合にこの例外が発生します。

## 例\{#examples}

```python
from pymilvus import MilvusClient, DataType, FieldSchema, CollectionSchema, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# The target collection must exist first. The BM25 input field must have
# enable_analyzer set to True, and the schema must contain a vector field.
client.create_collection(
    collection_name="my_collection",
    schema=CollectionSchema(
        fields=[
            FieldSchema(
                "id",
                DataType.INT64,
                is_primary=True,
            ),
            FieldSchema(
                "text",
                DataType.VARCHAR,
                max_length=512,
                enable_analyzer=True,
            ),
            FieldSchema(
                "dense",
                DataType.FLOAT_VECTOR,
                dim=3,
            ),
        ],
    ),
)

# Define the BM25 function and its output sparse vector field
bm25_function = Function(
    name="bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
)

sparse_field = FieldSchema(
    name="sparse_vector",
    dtype=DataType.SPARSE_FLOAT_VECTOR,
)

# The index params bound to the output field
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="sparse_vector",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
)

client.add_function_field(
    collection_name="my_collection",
    field_schema=sparse_field,
    func=bm25_function,
    index_params=index_params,
)
```
