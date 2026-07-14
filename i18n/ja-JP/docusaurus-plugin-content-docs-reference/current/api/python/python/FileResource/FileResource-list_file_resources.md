---
title: "list_file_resources() | Python"
slug: /python/python/FileResource-list_file_resources
sidebar_label: "list_file_resources()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Milvus cluster に現在登録されているすべてのファイルリソースを返します。各エントリは `FileResourceInfo` オブジェクトで、`addfileresource()` を通じてリソースが登録された際の `name` と、その参照先である `path`（設定済みオブジェクトストア内のオブジェクトキー）を公開します。単一のリソースに対する専用の \"get\" API はなく、登録済みリソースを確認するための標準的な方法は `listfileresources()` です。 | Python"
type: docx
token: VWCwdHpnbofX9pxw4D1chAghnJg
sidebar_position: 2
keywords: 
  - マネージド vector database
  - Pinecone vector database
  - Audio search
  - semantic search とは
  - zilliz
  - zilliz cloud
  - cloud
  - list_file_resources()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_file_resources()

Milvus cluster に現在登録されているすべてのファイルリソースを返します。各エントリは `FileResourceInfo` オブジェクトで、`add_file_resource()` を通じてリソースが登録された際の `name` と、その参照先である `path`（設定済みオブジェクトストア内のオブジェクトキー）を公開します。単一のリソースに対する専用の "get" API はなく、登録済みリソースを確認するための標準的な方法は `list_file_resources()` です。

## リクエスト構文\{#request-syntax}

```python
list_file_resources(
    timeout: float | None = None,
    **kwargs
)
```

**パラメータ**:

- **timeout** (*float* | *None*) -
 この操作のタイムアウト時間（秒）です。`None` を指定すると、タイムアウトは適用されません。

**戻り値**:

*list[FileResourceInfo]*

返されるリストの各要素は、以下の属性を持ちます。

- **name** (*str*) -
 リソースが登録された名前です。

- **path** (*str*) -
 登録されたファイルのオブジェクトストアキーで、`rootPath` プレフィックスを含みます。

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

