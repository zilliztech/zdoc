---
title: "CollectionSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-CollectionSchema
sidebar_label: "CollectionSchema"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "CollectionSchema 实例定义一个 Collection Schema。 | Python | MilvusClient"
type: docx
token: SSiodq10FoH26hx2HlccfcAgnje
sidebar_position: 2
keywords: 
  - Chroma 向量 Database
  - NLP 搜索
  - LLM 幻觉
  - 多模态搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - CollectionSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# CollectionSchema

CollectionSchema 实例定义一个 Collection Schema。

## 请求语法\{#request-syntax}

```python
__init__(
    raw: Any
)
```

**参数：**

- **fields**（*list*）-

    **[必填]**

    一个用于定义 Collection 字段的 [FieldSchema](./MilvusClient-FieldSchema) 对象列表。

- **description**（*string*）-

    Schema 的说明。如果未提供说明，则会将其设置为空字符串。

- **external_source**（*str*）-

    外部源 URI，应为指向可访问外部卷的 `volume://` URI。例如，`volume://<volume-name>/path/to/folder/`。

- **external_spec**（*str*）-

    外部源规范，是一组次级参数：

    - **format**（*str*）-

        目标源数据文件的格式。

        可选值为 `parquet`、`vortex`、`lance-table` 和 `iceberg-table`。

    - **snapshot_id**（*str*）-

        Iceberg 表的 ID。仅当 `format` 为 `iceberg-table` 时适用。

**异常：**

- **MilvusException**

    当服务器拒绝请求或 RPC 失败时抛出。请查看服务器错误消息以获取确切的失败原因。

## 示例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType

schema = CollectionSchema(
    fields=[
        FieldSchema(
            name="id",
            dtype=DataType.INT64,
            is_primary=True,
        ),
        FieldSchema(
            name="vector",
            dtype=DataType.FLOAT_VECTOR,
            dim=128,
        ),
    ],
    enable_dynamic_field=True,
)
print(
    schema.auto_id,
    schema.enable_dynamic_field,
)
```
