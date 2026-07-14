---
title: "get_query_segment_info() | Python | ORM"
slug: /python/python/utility-get_query_segment_info
sidebar_label: "get_query_segment_info()"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "この操作は、query cluster 内の sealed セグメントおよび growing セグメントに関する情報を取得します。 | Python | ORM"
type: docx
token: CB9edh2ySoJyWhxBoLcchPj9nxg
sidebar_position: 14
keywords: 
  - private llms
  - nn search
  - llm eval
  - Sparse vs Dense
  - zilliz
  - zilliz cloud
  - cloud
  - get_query_segment_info()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# get_query_segment_info()

この操作は、query cluster 内の sealed セグメントおよび growing セグメントに関する情報を取得します。

## Request Syntax\{#request-syntax}

```python
get_query_segment_info(
    collection_name: str,
    timeout: float | None,
    using: str = "default",
)
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    既存の collection の名前。

- **using** (*str*) - 

    使用する接続のエイリアス。

    デフォルト値は **default** で、この操作がデフォルト接続を使用することを示します。

- **timeout** (*float* | *None*)  

    この操作のタイムアウト時間。これを **None** に設定すると、何らかの応答が返されるか、何らかのエラーが発生した時点でこの操作はタイムアウトします。

**RETURN TYPE:**

*list*

**RETURNS:**

各セグメントの状態を報告する **QuerySegmentInfo** オブジェクトのリスト。

**EXCEPTIONS:**

該当なし

## Examples\{#examples}

```python
from pymilvus import connections, Collection, utility

# Connect to YOUR_CLUSTER_ENDPOINT
connections.connect()

# Get an existing collection
collection = Collection("test_collection")

# Get the query segment info
res = utility.get_query_segment_info(collection_name="test_collection")

print(res)

# segmentID: 446781855409287839
# collectionID: 446738261027224920
# partitionID: 446738261027224921
# num_rows: 5
# state: Sealed
# nodeIds: 3
```

## Related operations\{#related-operations}

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

