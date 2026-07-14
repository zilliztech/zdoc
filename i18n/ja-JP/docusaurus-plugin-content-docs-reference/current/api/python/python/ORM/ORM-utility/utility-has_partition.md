---
title: "has_partition() | Python | ORM"
slug: /python/python/utility-has_partition
sidebar_label: "has_partition()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、partition が存在するかどうかを確認します。 | Python | ORM"
type: docx
token: KsmadNcXRoElO2xJi5HcJO57nwb
sidebar_position: 18
keywords: 
  - milvus open source
  - milvus はどのように動作しますか
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - has_partition()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# has_partition()

この操作は、partition が存在するかどうかを確認します。

## Request Syntax\{#request-syntax}

```python
has_partition(
    collection_name: str,
    partition_name: str,
    using: str = "default",
    timeout: float | None,
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**
    既存の collection の名前。

    存在しない collection を指定すると、**MilvusException** が発生します。

- **partition_name** (*str*) -

    **[REQUIRED]**
    partition の名前。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかの応答が到着するか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*bool*

**RETURNS:**
指定された partition が存在するかどうかを示すブール値。

**EXCEPTIONS:**

- **MilvusException**

    この操作中に何らかのエラーが発生した場合、特に指定されたエイリアスが存在しない場合に、この例外が発生します。

## Examples\{#examples}

```python
from pymilvus import connections, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection = Collection(name="test_collection")

# Check whether a partition exist
collection.has_partition(
    collection_name="test_collection",
    partition_name="test_partition",
) # True
```

## Related operations\{#related-operations}

以下の操作は `has_partition()` に関連しています。

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

