---
displayed_sidbar: pythonSidebar
title: "get_query_segment_info() | Python | ORM"
slug: /python/python/utility-get_query_segment_info
sidebar_label: "get_query_segment_info()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation gets information about the sealed and growing segments in the query cluster. | Python | ORM"
type: docx
token: CB9edh2ySoJyWhxBoLcchPj9nxg
sidebar_position: 14
keywords: 
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
  - zilliz
  - zilliz cloud
  - cloud
  - get_query_segment_info()
  - pymilvus25
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_query_segment_info()

This operation gets information about the sealed and growing segments in the query cluster.

## Request Syntax{#request-syntax}

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

    The name of an existing collection.

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*list*

**RETURNS:**

A list of **QuerySegmentInfo** objects, each reporting the status of a segment.

**EXCEPTIONS:**

N/A

## Examples{#examples}

```python
from pymilvus import connections, Collection, utility

# Connect to localhost:19530
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

## Related operations{#related-operations}

- [drop_collection()](./utility-drop_collection)

- [flush_all()](./utility-flush_all)

- [has_collection()](./utility-has_collection)

- [has_partition()](./utility-has_partition)

- [list_collections()](./utility-list_collections)

- [rename_collection()](./utility-rename_collection)

