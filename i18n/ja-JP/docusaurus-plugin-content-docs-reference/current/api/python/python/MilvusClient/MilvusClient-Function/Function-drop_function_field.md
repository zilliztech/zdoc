---
title: "drop_function_field() | Python | MilvusClient"
slug: /python/python/Function-drop_function_field
sidebar_label: "drop_function_field()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、既存のコレクションから関数フィールドを削除します。バインドされた関数、フィールド、およびその基盤となるインデックスを削除します。 | Python | MilvusClient"
type: docx
token: UxyedGPErolaikxcssgc2IF1nAh
sidebar_position: 7
keywords: 
  - LLM ハルシネーション
  - ハイブリッド検索
  - 字句検索
  - 最近傍探索
  - zilliz
  - Zilliz Cloud
  - クラウド
  - drop_function_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_function_field()

この操作は、既存のコレクションから関数フィールドを削除します。バインドされた関数、フィールド、およびその基盤となるインデックスを削除します。

## リクエスト構文\{#request-syntax}

```python
drop_function_field(
    collection_name: str,
    function_name: str,
    timeout: Optional[float] = None,
    **kwargs
)
```

**パラメーター：**

- **collection_name** (*str*) -

    対象のコレクションの名前です。

- **function_name** (*str*) -

    出力フィールドを削除する関数の名前です。

- **timeout** (*float | None*) -

    デフォルト：`None`

    この操作のタイムアウト（秒）です。

**例外：**

- **MilvusException**

    サーバーがリクエストを拒否した場合、または RPC が失敗した場合に発生します。正確な失敗理由については、サーバーのエラーメッセージを確認してください。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
client.drop_function_field(
    collection_name="docs",
    function_name="bm25_sparse",
)
```
