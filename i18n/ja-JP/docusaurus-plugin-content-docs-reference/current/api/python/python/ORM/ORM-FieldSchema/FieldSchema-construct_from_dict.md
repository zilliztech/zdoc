---
title: "construct_from_dict() | Python | ORM"
slug: /python/python/FieldSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、辞書表現から FieldSchema オブジェクトを構築します。 | Python | ORM"
type: docx
token: DCLUdOpVjohl8HxPUx1cGjokngf
sidebar_position: 1
keywords: 
  - 画像類似検索
  - コンテキストウィンドウ
  - 自然言語検索
  - 類似検索
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

この操作は、辞書表現から FieldSchema オブジェクトを構築します。

## Request Syntax\{#request-syntax}

```python
construct_from_dict(
    raw: dict
)
```

<Admonition type="info" icon="📘" title="注記">

これはクラスメソッドです。以下のように、クラスのインスタンスではなくクラスから呼び出す必要があります。

`FieldSchema.construct_from_dict()`

</Admonition>

**PARAMETERS:**

- **raw** (*dict*)

    field schema を構築するための生データを含む辞書です。

**RETURN TYPE:**

*[FieldSchema](./ORM-FieldSchema)*

**RETURNS:**

FieldSchema オブジェクト。

**EXCEPTIONS:**

- **MilvusException**

    この操作の実行中に何らかのエラーが発生した場合、この例外が発生します。

## Examples\{#examples}

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

