---
title: "StructFieldSchema | Python | MilvusClient"
slug: /python/python/MilvusClient-StructFieldSchema
sidebar_label: "StructFieldSchema"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "StructFieldSchema 实例表示结构体数组字段中结构体元素的模式。模式勾勒出结构体元素的结构。 | Python | MilvusClient"
type: docx
token: ZnKKd2PsyoRc1MxtC1BcJQjgnBh
sidebar_position: 3
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - StructFieldSchema
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# StructFieldSchema

`StructFieldSchema` 实例表示结构体数组字段中结构体元素的模式。模式勾勒出结构体元素的结构。

```python
class pymilvus.StructFieldSchema
```

## 构造函数\{#constructor}

通过定义字段、数据类型和其他参数，构造结构体数组字段中结构体元素的模式。

```python
CollectionSchema(
    fields: list,
    description: str
)
```

**参数：**

- **name** (*str*) -

    **[必需]**

    模式的名称。

- **fields** (*list*) -

    **[必需]**

    一个 **[FieldSchema](./ORM-FieldSchema)** 对象列表，用于定义结构体数组字段中结构体模式里的各个字段。

    <Admonition type="info" icon="📘" title="说明">

    什么是字段模式？
    
        字段模式表示并包含单个字段的元数据，而 **StructFieldSchema** 则将一组 **[FieldSchema](./ORM-FieldSchema)** 对象组织在一起，用于定义结构体数组字段中结构体的模式。

    </Admonition>

- **description** (*string*) -

    模式的描述。

    如果未提供描述，则将其设置为空字符串。

**返回类型：**

*StructFieldSchema*

**返回：**

一个 **StructFieldSchema** 对象。

**异常：**

- **FieldsTypeException**: 

    当 **fields** 参数不是列表时，将引发此异常。

- **FieldTypeException**: 

    当 **fields** 列表中的某个字段不是 **[FieldSchema](./ORM-FieldSchema)** 对象时，将引发此异常。

```python
from pymilvus import StructFieldSchema, FieldSchema, DataType

vector = FieldSchema(
    name="vector",
    dtype=DataType.FLOAT_VECTOR,
    dim=768
)

varchar = FieldSchema(
    name="varchar",
    dtype=DataType.VARCHAR,
    max_length=512
)

# Construct a schema with the predefined fields
schema = StructFieldSchema(
    name="struct_schema",
    fields=[vector, varchar],
    description="example_schema"
)
```

## 属性\{#properties}

- **fields** (*list*) -

    一个 **[FieldSchema](./ORM-FieldSchema)** 对象列表，用于定义结构体数组字段中结构体模式里的各个字段。

- **description** (*string*) -

    模式的描述。

    如果未提供描述，则为空字符串。

## 方法\{#methods}

以下是 `StructFieldSchema` 类的方法：

