---
displayed_sidbar: pythonSidebar
title: "rename_collection() | Python | MilvusClient"
slug: /python/python/Collections-rename_collection
sidebar_label: "rename_collection()"
beta: false
notebook: false
description: "This operation renames an existing collection. | Python | MilvusClient"
type: docx
token: IeiIdJ71Pox2OjxMiOzczUTenud
sidebar_position: 15
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# rename_collection()

This operation renames an existing collection.

## Request Syntax{#request-syntax}

```python
rename_collection(
    old_name: str,
    new_name: str,
    timeout: Optional[float] = None
) -> None
```

**PARAMETERS:**

- **old_name** (*str*) -

    **[REQUIRED]**

    The name of an existing collection.

    Setting this to a non-existing collection results in a **MilvusException**.

- **new_name** (*str*) -

    **[REQUIRED]**

    The name of the target collection after this operation.

    Setting this to the value of **old_name** results in a **MilvusException**.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

# 1. Set up a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create a collection
client.create_collection(
    collection_name="test_collection",
    dimension=5
)

# 3. Rename the collection
client.rename_collection(
    old_name="test_collection",
    new_name="test_collection_renamed"
)
```

## Related methods{#related-methods}

- [create_collection()](./Collections-create_collection)

- [create_schema()](./Collections-create_schema)

- [describe_collection()](./Collections-describe_collection)

- [drop_collection()](./Collections-drop_collection)

- [get_collection_stats()](./Collections-get_collection_stats)

- [has_collection()](./Collections-has_collection)

- [list_collections()](./Collections-list_collections)

- [DataType](./Collections-DataType)

