---
title: "append_row() | Python"
slug: /python/python/LocalBulkWriter-append_row
sidebar_label: "append_row()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作将记录追加到写入器中。 | Python"
type: docx
token: WCxIdVwCpoIaMUxbabWcSRCkn2g
sidebar_position: 1
keywords: 
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
  - zilliz
  - zilliz cloud
  - cloud
  - append_row()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# append_row()

此操作将记录追加到写入器中。

## 请求语法\{#request-syntax}

```python
append_row(
    row: dict
)
```

**参数：**

- **row** (*dict*) -

    表示要追加的实体的字典。

    字典中的键及其值应与当前 **[LocalBulkWriter](./DataImport-LocalBulkWriter)** 引用的 schema 相匹配。

## 示例\{#examples}

```python
from pymilvus import CollectionSchema, FieldSchema, DataType
from pymilvus.bulk_writer import LocalBulkWriter, BulkFileType

# Set up a schema
schema = CollectionSchema(fields=[
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="vector", dtype=DataType.FLOAT_VECTOR, dim=5),
    ]
)

# Set up a local bulk writer
writer = LocalBulkWriter(
    schema=schema,
    local_path="/tmp/output",
)

# Append a row to the writer
writer.append_row(
    {"id": 0, "vector": [0.1, 0.4, -0.8, -0.2, 0.4]}
)
```

## 相关方法\{#related-methods}

- [commit()](./LocalBulkWriter-commit)

