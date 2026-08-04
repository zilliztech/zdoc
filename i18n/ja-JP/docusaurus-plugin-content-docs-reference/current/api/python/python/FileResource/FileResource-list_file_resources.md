---
title: "list_file_resources() | Python"
slug: /python/python/FileResource-list_file_resources
sidebar_label: "list_file_resources()"
beta: PRIVATE
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "現在 Milvus cluster に登録されているすべての file resource を返します。各エントリは `FileResourceInfo` オブジェクトで、`addfileresource()` を通じて resource が登録されたときの `name` と、それが指す `path`（設定された object store 内のオブジェクトキー）を公開します。単一の resource に対する専用の \"get\" API はありません。登録済み resource を確認する標準的な方法は `listfileresources()` です。 | Python"
type: docx
token: VWCwdHpnbofX9pxw4D1chAghnJg
sidebar_position: 2
keywords: 
  - マネージド vector database
  - Pinecone vector database
  - 音声検索
  - セマンティック検索とは
  - zilliz
  - zilliz cloud
  - クラウド
  - list_file_resources()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# list_file_resources()

現在 Milvus cluster に登録されているすべての file resource を返します。各エントリは `FileResourceInfo` オブジェクトで、`add_file_resource()` を通じて resource が登録されたときの `name` と、それが指す `path`（設定された object store 内のオブジェクトキー）を公開します。単一の resource に対する専用の "get" API はありません。登録済み resource を確認する標準的な方法は `list_file_resources()` です。

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

