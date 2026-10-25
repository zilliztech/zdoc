---
title: "list_file_resources() | Python"
slug: /python/python/FileResource-list_file_resources
sidebar_label: "list_file_resources()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Returns all file resources currently registered on the Milvus クラスター. Each entry is a `FileResourceInfo` object exposing the `name` under which the resource was registered via `addfileresource()` and the `path` (object key in the configured object store) that it points to. There is no dedicated \"get\" API for a single resource — `listfileresources()` is the canonical way to inspect registered resources. | Python"
type: docx
token: VWCwdHpnbofX9pxw4D1chAghnJg
sidebar_position: 2
keywords: 
  - Managed ベクトル データベース
  - Pinecone ベクトル データベース
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - クラウド
  - list_file_resources()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_file_resources()

Returns all file resources currently registered on the Milvus クラスター. Each entry is a `FileResourceInfo` object exposing the `name` under which the resource was registered via `add_file_resource()` and the `path` (object key in the configured object store) that it points to. There is no dedicated "get" API for a single resource — `list_file_resources()` is the canonical way to inspect registered resources.

## リクエスト構文\{#request-syntax}

```python
list_file_resources(
    timeout: float | None = None,
    **kwargs
)
```

**PARAMETERS**:

- **timeout** (*float* | *None*) -<br/>
   この操作のタイムアウト時間（秒）。`None` の場合、タイムアウトは適用されません。

**RETURNS**:

*list[FileResourceInfo]*

返されるリストの各要素は、次の属性を公開します。

- **name** (*str*) -<br/>
   resource が登録されたときの名前。

- **path** (*str*) -<br/>
   登録されたファイルの object store キー。`rootPath` プレフィックスを含みます。

## 例\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

resources = client.list_file_resources()
for r in resources:
    print(r.name, r.path)
# zh_terms file/zh_terms.txt
# en_stop_words file/stop_words.txt
```

