---
title: "add_function_field() | Python | MilvusClient"
slug: /python/python/Function-add_function_field
sidebar_label: "add_function_field()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会向现有 Collection 添加一个由 Function 支持的字段。它是一个高层便捷封装，会将 Schema 变更（即新的输出字段和 Function 定义）连同绑定到该新输出字段的索引元数据一并提交。服务器会以原子方式随 Schema 变更创建索引元数据，因此回填 Compaction 绝不会因缺少向量索引而被阻塞。 | Python | MilvusClient"
type: docx
token: SPl9dAH9noQ2e9xu86Zcy4XxnTb
sidebar_position: 6
keywords: 
  - milvus 向量 Database
  - milvus Database
  - milvus 向量 Database
  - Zilliz Cloud
  - zilliz
  - zilliz cloud
  - 云
  - add_function_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# add_function_field()

此操作会向现有 Collection 添加一个由 Function 支持的字段。它是一个高层便捷封装，会将 Schema 变更（即新的输出字段和 Function 定义）连同绑定到该新输出字段的索引元数据一并提交。服务器会以原子方式随 Schema 变更创建索引元数据，因此回填 Compaction 绝不会因缺少向量索引而被阻塞。

<Admonition type="info" title="Note">

index_params 必须只包含一个针对输出字段且显式指定 index_type 的条目。对于未绑定索引参数的向量输出字段，服务器会予以拒绝。

</Admonition>

## 请求语法\{#request-syntax}

```python
client.add_function_field(
    collection_name: str,
    field_schema: FieldSchema,
    func: Function,
    index_params: IndexParams,
    timeout: Optional[float] = None
)
```

**参数：**

- **collection_name** （*str*） -

    **[必需]**

    要修改的 Collection 名称。

- **field_schema** （*[FieldSchema](FieldSchema/FieldSchema.md*) -

    **[必需]**

    一个选项（&ast;）：由 Function 生成的新输出字段的 Schema。例如，用于 BM25 的 SPARSE_FLOAT_VECTOR 字段或用于 MinHash 的 BINARY_VECTOR 字段。

- **func** （*[Function](Function/Function.md*) -

    **[必需]**

    一个选项（&ast;）：生成输出字段的 Function 定义。例如，FunctionType.BM25 或 FunctionType.MINHASH 类型的 Function。支持的组合包括 FunctionType.BM25 与 DataType.SPARSE_FLOAT_VECTOR，以及 FunctionType.MINHASH 与 DataType.BINARY_VECTOR。

- **index_params** （*[IndexParams](../Management/prepare_index_params.md*) -

    **[必需]**

    一个选项（&ast;）：绑定到新输出字段的索引定义。它必须只包含一个显式指定 index_type 的条目，例如 SPARSE_INVERTED_INDEX/BM25 或 MINHASH_LSH/MHJACCARD).

- **timeout** （*float | None*） -

    Schema 变更 RPC 的超时时间，单位为秒。将其设置为 None 表示当收到任意响应或发生任何错误时，此操作即超时。

**返回类型：**

*NoneType*

**返回值：**

None。

**异常：**

- **ParamError**

    当必需参数缺失或无效时引发。当必需参数缺失或无效时引发。

- **MilvusException**

    当 Schema 变更失败时，将引发此异常。当 Schema 变更失败时，将引发此异常。

## 示例\{#examples}

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
