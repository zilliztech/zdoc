---
title: "construct_from_dict() | Python | ORM"
slug: /python/python/FieldSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "此操作根据字典表示构造一个 FieldSchema 对象。 | Python | ORM"
type: docx
token: DCLUdOpVjohl8HxPUx1cGjokngf
sidebar_position: 1
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - construct_from_dict()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# construct_from_dict()

此操作根据字典表示构造一个 FieldSchema 对象。

## 请求语法\{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

<Admonition type="info" icon="📘" title="说明">

这是一个类方法。你应当通过类而不是类的实例来调用它，如下所示：

`FieldSchema.construct_from_dict()`

</Admonition>

**参数：**

- **raw** (*dict*)

    包含用于构造字段模式的原始数据的字典。

**返回类型：**

*[FieldSchema](./ORM-FieldSchema)*

**返回：**

一个 FieldSchema 对象。

**异常：**

- **MilvusException**

    当此操作期间发生任何错误时，将引发此异常。

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

