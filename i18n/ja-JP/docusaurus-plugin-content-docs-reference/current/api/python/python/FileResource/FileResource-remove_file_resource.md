---
title: "remove_file_resource() | Python"
slug: /python/python/FileResource-remove_file_resource
sidebar_label: "remove_file_resource()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "`addfileresource()` を介して以前に登録されたファイルリソースを Milvus クラスターから削除します。この呼び出しは冪等です。現在登録されていない名前を削除しても、例外は発生せず正常に完了します。 | Python"
type: docx
token: DLsXdlRA3odugzx4sIccnBVKn0d
sidebar_position: 3
keywords: 
  - ベクトル化
  - k 近傍アルゴリズム
  - ANNS
  - ベクトル検索
  - zilliz
  - zilliz cloud
  - クラウド
  - remove_file_resource()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# remove_file_resource()

`add_file_resource()` を介して以前に登録されたファイルリソースを Milvus クラスターから削除します。この呼び出しは冪等です。現在登録されていない名前を削除しても、例外は発生せず正常に完了します。

## リクエスト構文\{#request-syntax}

```python
remove_file_resource(
    name: str,
    timeout: float | None = None,
    **kwargs
)
```

**パラメータ**:

- **name** (*str*) -<br/>
   `add_file_resource()` に元々渡された、削除するリソースの名前です。

- **timeout** (*float* | *None*) -<br/>
   この操作のタイムアウト時間（秒）です。値が `None` の場合、タイムアウトは適用されません。

**戻り値**:

*None*

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.remove_file_resource(name="zh_terms")

# Removing a name that is not currently registered is a no-op.
client.remove_file_resource(name="already_gone")
```

