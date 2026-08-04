---
title: "add_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-add_collection_field
sidebar_label: "add_collection_field()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向现有集合添加一个新的标量字段，而无需重新创建集合。由于内部架构同步，该字段几乎会立即可用，仅有极小延迟。 | Python | MilvusClient"
type: docx
token: IquldHhyGo9s4IxF3cicOXGnnNf
sidebar_position: 20
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - add_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# add_collection_field()

此操作会向现有集合添加一个新的标量字段，而无需重新创建集合。由于内部架构同步，该字段几乎会立即可用，仅有极小延迟。

<Admonition type="info" icon="📘" title="说明">

如果集合启用了动态字段，并且你添加了一个与现有动态字段键同名的静态字段，则该静态字段会屏蔽该动态字段键。原始动态值仍可通过 `$meta['field_name']` 语法访问。

</Admonition>

<Admonition type="info" icon="📘" title="说明">

这不适用于外部集合。

</Admonition>

## 请求语法\{#request-syntax}

```python
add_collection_field(
    collection_name: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**参数：**

- **collection_name** *(string)* –

    **[必需]**

    目标集合的名称。

- **field_name** *(string)* –

    **[必需]**

    新字段的名称。

- **data_type** *(DataType)* –

    **[必需]**

    新字段的数据类型。支持的类型请参见 DataType。

- **desc** *(string, optional)* –

    字段的简要描述。

- **timeout** *(float)* –

    RPC 请求的超时时间（以秒为单位）。如果为 `None`，调用将无限期等待。

- **kwargs** *(dict, optional)* –

    附加参数包括：

    - **nullable** *(bool)*:

        对于动态添加的字段，必须将其设置为 `True`，以兼容那些没有新字段值的现有实体。

    - **default_value** *(DataType-specific)*:

        如果在插入数据时未提供该字段的值，则使用此默认值。

    - **max_length** *(int)*:

        `DataType.VARCHAR` 字段必需。设置字符串允许的最大字节长度（1 到 65,535）。

    - **element_type** *(DataType)*:

        `DataType.ARRAY` 字段必需。指定数组中元素的数据类型。

    - **max_capacity** *(int)*:

        `DataType.ARRAY` 字段必需。定义数组中的最大元素数量。

**返回类型：**

*None*

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#examples}

**示例 1：** 添加一个基础的可空字段

```python
client.add_collection_field(
    collection_name="product_catalog",
    field_name="created_timestamp",
    data_type=DataType.INT64,
    nullable=True  # Required for added fields
)
```

**示例 2：** 添加带默认值的字段

```python
client.add_collection_field(
    collection_name="product_catalog",
    field_name="priority_level",
    data_type=DataType.VARCHAR,
    max_length=20,
    nullable=True,          # Required for added fields
    default_value="standard"  # Default value for existing entities
)
```
