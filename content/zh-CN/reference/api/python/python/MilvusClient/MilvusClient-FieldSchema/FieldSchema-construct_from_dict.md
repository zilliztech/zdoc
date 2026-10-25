---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/FieldSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会从字典表示中构造一个 FieldSchema 对象。 | Python | MilvusClient"
type: docx
token: ASRmddh2eo3Q4axtV3RcLfvmnYU
sidebar_position: 2
keywords: 
  - 图像相似度搜索
  - 上下文窗口
  - 自然语言搜索
  - 相似度搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# construct_from_dict()

此操作会从字典表示中构造一个 FieldSchema 对象。

<Admonition type="info" title="Note">

这是一个类方法。您应从类而非类实例调用它，如下所示：FieldSchema.construct_from_dict()

</Admonition>

## 请求语法\{#request-syntax}

这是一个类方法。您应从类而非类实例调用它，如下所示：FieldSchema.construct_from_dict()

```python
construct_from_dict(
```

<Admonition type="info" title="Notes">

这是一个类方法。您应从类而非类实例调用它，如下所示：

`FieldSchema.construct_from_dict()`

</Admonition>

**参数：**

- **raw**（*dict*）-

    包含用于构造字段 Schema 的原始数据的字典。

**返回类型：**

*[FieldSchema](./MilvusClient-FieldSchema)*

**返回：**

一个 FieldSchema 对象。

**异常：**

- **MilvusException**

    在此操作过程中发生任何错误时，都会抛出此异常。在此操作过程中发生任何错误时，都会抛出此异常。

## 示例\{#examples}

```python
from pymilvus import FieldSchema, DataType  

# Create a dictionary to pass to construct_from_dict 
field_dict = {   
    "name": "primary_key",    
    "type": DataType.INT64,   
    "description": "test_field_schema"
}  

# Construct a FieldSchema object from the dictionary
field = FieldSchema.construct_from_dict(field_dict)  

print(field)

# Output
# {'name': 'primary_key', 'description': 'test_field_schema', 'type': <DataType.INT64: 5>}
```
