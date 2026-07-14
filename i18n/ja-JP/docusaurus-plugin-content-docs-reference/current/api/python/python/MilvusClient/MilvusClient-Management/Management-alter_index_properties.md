---
title: "alter_index_properties() | Python | MilvusClient"
slug: /python/python/Management-alter_index_properties
sidebar_label: "alter_index_properties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定された index プロパティを変更します。 | Python | MilvusClient"
type: docx
token: QvyHdbEHholEqXxypKNcHHD5n0c
sidebar_position: 14
keywords: 
  - オープンソース vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - alter_index_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# alter_index_properties()

この操作は、指定された index プロパティを変更します。

## Request Syntax\{#request-syntax}

```python
alter_index_properties(
    self,
    collection_name: str,
    index_name: str,
    properties: dict,
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    対象 collection の名前。

- **index_name** (*str*) -

    変更する index ファイルの名前。

- **properties** (*dict*) -

    この操作後のプロパティとその値です。変更可能なプロパティには次のものがあります。

    - **mmap.enabled** (*bool*) -

        指定された index に対して mmap を有効にするかどうか。これを `true` に設定すると、指定された index はディスクにオフロードされます。詳細については、[Use mmap](/docs/use-mmap) を参照してください。

- **timeout** (*Optional[float]*) - 

    この操作のタイムアウト時間。

    これを None に設定すると、何らかのレスポンスが到着した時点、または何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    この例外は、この操作中に何らかのエラーが発生した場合に発生します。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# update properties
properties = {"mmap.enabled": true}

client.alter_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    properties = properties
)
```

