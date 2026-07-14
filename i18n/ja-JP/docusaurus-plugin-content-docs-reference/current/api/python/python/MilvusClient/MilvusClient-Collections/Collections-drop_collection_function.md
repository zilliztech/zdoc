---
title: "drop_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_function
sidebar_label: "drop_collection_function()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、コレクションから既存の関数を削除します。 | Python | MilvusClient"
type: docx
token: F1mJdDLyzoMTrxxarPMcqPkqnqg
sidebar_position: 24
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection_function()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_collection_function()

この操作は、コレクションから既存の関数を削除します。

<Admonition type="info" icon="📘" title="Notes">

これは外部コレクションには適用されません。

</Admonition>

## リクエスト構文\{#request-syntax}

```python
client.drop_collection_function(
    collection_name: str,
    function_name: str,
    timeout: float = None,
    **kwargs
)
```

**パラメータ:**

- **collection_name** (*str*) -

    **[必須]**

    コレクションの名前。

- **function_name** (*str*) -

    **[必須]**

    削除する関数の名前。

- **timeout** (*float* | *None*) -

    この操作のタイムアウト時間です。これを **None** に設定すると、レスポンスが返されるかエラーが発生した時点でこの操作はタイムアウトします。

- **kwargs** (*dict*) -

    オプションの追加パラメータ。

**戻り値の型:**

*NoneType*

**例外:**

- **MilvusException**

    この操作中にエラーが発生した場合、この例外が発生します。

## 例\{#example}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.drop_collection_function(
    collection_name="my_collection",
    function_name="bm25",
)
```
