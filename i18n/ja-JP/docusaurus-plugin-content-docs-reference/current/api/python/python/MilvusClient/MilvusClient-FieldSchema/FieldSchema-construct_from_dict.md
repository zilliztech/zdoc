---
title: "construct_from_dict() | Python | MilvusClient"
slug: /python/python/FieldSchema-construct_from_dict
sidebar_label: "construct_from_dict()"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、辞書表現から FieldSchema オブジェクトを構築します。 | Python | MilvusClient"
type: docx
token: ASRmddh2eo3Q4axtV3RcLfvmnYU
sidebar_position: 2
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

---

import Admonition from '@theme/Admonition';


# construct_from_dict()

この操作は、辞書表現から FieldSchema オブジェクトを構築します。

<Admonition type="info" title="Note">

これはクラスメソッドです。次のように、クラスのインスタンスではなくクラスから呼び出してください：FieldSchema.construct_from_dict()

</Admonition>

## Request Syntax\{#request-syntax}

これはクラスメソッドです。次のように、クラスのインスタンスではなくクラスから呼び出してください：FieldSchema.construct_from_dict()

```python
construct_from_dict(
```

<Admonition type="info" title="Notes">

これはクラスメソッドです。次のように、クラスのインスタンスではなくクラスから呼び出してください：

`FieldSchema.construct_from_dict()`

</Admonition>

**PARAMETERS:**

- **raw** (*dict*) -

    フィールドスキーマを構築するための生データを含む辞書です。

**RETURN TYPE:**

*[FieldSchema](./MilvusClient-FieldSchema)*

**RETURNS:**

FieldSchema オブジェクトです。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。この操作中に何らかのエラーが発生した場合、この例外が発生します。

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
