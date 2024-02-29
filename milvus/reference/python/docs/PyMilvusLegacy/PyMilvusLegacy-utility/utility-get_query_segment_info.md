---
displayed_sidbar: pythonSidebar
slug: /python/utility-get_query_segment_info
beta: false
notebook: false
type: docx
token: CB9edh2ySoJyWhxBoLcchPj9nxg
sidebar_position: 14
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

__PARAMETERS:__

- __collection_name__ (_str_) -

    __[REQUIRED]__

    The name of an existing collection.

- __using__ (_str_) - 

    The alias of the employed connection.

    The default value is __default__, indicating that this operation employs the default connection.

- __timeout__ (_float _|_ None_)  

    The timeout duration for this operation. Setting this to __None__ indicates that this operation timeouts when any response arrives or any error occurs.

__RETURN TYPE:__

_list_

__RETURNS:__

A list of __QuerySegmentInfo__ objects, each reporting the status of a segment.

__EXCEPTIONS:__

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

