---
title: "drop_index_properties() | Python | MilvusClient"
slug: /python/python/Management-drop_index_properties
sidebar_label: "drop_index_properties()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、指定されたインデックスプロパティを削除します。 | Python | MilvusClient"
type: docx
token: M2kXd5zWSoMIOnxXWamcgCkznih
sidebar_position: 15
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - drop_index_properties()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# drop_index_properties()

この操作は、指定されたインデックスプロパティを削除します。

<Admonition type="info" icon="📘" title="Notes">

このメソッドは、Dedicated serving cluster および on-demand compute にのみ適用されます。 

- serving cluster の collection でこの操作を行うには、cluster endpoint を使用して **[MilvusClient](./Client-MilvusClient)** を作成してください。

    - **Free & Serverless**

        `https://{cluster-id}.serverless.{region}.vectordb.zillizcloud.com`

    - **Dedicated**

        `https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530`

- on-demand compute の collection でこの操作を行うには、project endpoints を使用して **[MilvusClient](./Client-MilvusClient)** を作成し、その後、検索のために on-demand cluster にアタッチする session を作成してください。

    `https://{project-id}.{region}.api.zillizcloud.com`

</Admonition>

## Request Syntax\{#request-syntax}

```python
drop_index_properties(
    self,
    collection_name: str,
    index_name: str,
    property_keys: List[str],
    timeout: Optional[float] = None,
    **kwargs,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    対象 collection の名前。

- **index_name** (*str*) -

    削除する index file の名前。

- **property_keys** (*List[str]*) -

    リスト内で削除するプロパティの名前。使用可能なプロパティは次のとおりです。

    - `mmap.enabled`

- **timeout** (*Optional[float]*) - 

    この操作のタイムアウト時間。

    これを None に設定すると、レスポンスが返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生すると、この例外が送出されます。

## Examples\{#examples}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

client.drop_index_properties(
    collection_name="collection_name",
    index_name="my_vector", 
    property_keys = ["mmap.enabled"]
)
```

