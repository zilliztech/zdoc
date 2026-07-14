---
title: "alter_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-alter_collection_function
sidebar_label: "alter_collection_function()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、collection 内の既存の function を新しい function schema に置き換えることで変更します。 | Python | MilvusClient"
type: docx
token: N9d9df9IIojLZDxft1HcU0mkn0b
sidebar_position: 22
keywords: 
  - vector database の例
  - rag vector database
  - vector db とは
  - vector databases とは何か
  - zilliz
  - zilliz cloud
  - cloud
  - alter_collection_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_collection_function()

この操作は、collection 内の既存の function を新しい function schema に置き換えることで変更します。

<Admonition type="info" icon="📘" title="注意">

これは external collection には適用されません。

</Admonition>

## Request syntax\{#request-syntax}

```python
client.alter_collection_function(
    collection_name: str,
    function_name: str,
    function: Function,
    timeout: float = None,
    **kwargs
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    collection の名前。

- **function_name** (*str*) -

    **[REQUIRED]**

    変更する function の名前。

- **[function](./MilvusClient-Function)** (*[Function](./MilvusClient-Function)*) -

    **[REQUIRED]**

    既存のものを置き換える新しい function schema。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間。これを **None** に設定すると、レスポンスが到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

- **kwargs** (*dict*) -

    オプションの追加パラメータ。

**RETURN TYPE:**

*NoneType*

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、この例外が発生します。

## Example\{#example}

```python
from pymilvus import MilvusClient, Function, FunctionType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

updated_function = Function(
    name="bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
    params={"bm25_k1": 1.5, "bm25_b": 0.75},
)

client.alter_collection_function(
    collection_name="my_collection",
    function_name="bm25",
    function=updated_function,
)
```
