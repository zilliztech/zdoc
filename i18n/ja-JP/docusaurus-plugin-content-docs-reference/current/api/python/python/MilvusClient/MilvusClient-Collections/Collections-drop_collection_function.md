---
title: "drop_collection_function() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_function
sidebar_label: "drop_collection_function()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "この操作は、コレクションから既存の関数を削除します。 | Python | MilvusClient"
type: docx
token: MFoOd3DJEoRgbnxgAOdcVlecnQc
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

---

import Admonition from '@theme/Admonition';


# drop_collection_function()

この操作は、コレクションから既存の関数を削除します。

<Admonition type="info" title="Note">

PyMilvus v3.0.2 以降では非推奨です。Milvus 3.0 以降では関数を個別に削除できないため、このメソッドは非推奨となりました。代わりに drop_function_field() を使用してください。このメソッドは、関数の出力フィールドとそのインデックスも削除します。

</Admonition>

<Admonition type="info" title="Note">

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

**パラメーター:**

- **collection_name** (*str*) -

    **[必須]**

    コレクションの名前です。

- **function_name** (*str*) -

    **[必須]**

    削除する関数の名前です。

- **timeout** (*float | None*) -

    この操作のタイムアウト時間です。None に設定すると、応答が返されたとき、またはエラーが発生したときにこの操作がタイムアウトすることを示します。

- **kwargs** (*dict*) -

    オプションの追加パラメーターです。

**戻り値の型:**

*NoneType*

**戻り値:**

なし。

**例外:**

- **MilvusException**

    この操作中にエラーが発生すると、この例外が発生します。この操作中にエラーが発生すると、この例外が発生します。

## 例\{#examples}

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
