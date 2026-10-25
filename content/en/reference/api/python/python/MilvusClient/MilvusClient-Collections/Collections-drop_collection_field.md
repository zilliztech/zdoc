---
title: "drop_collection_field() | Python | MilvusClient"
slug: /python/python/Collections-drop_collection_field
sidebar_label: "drop_collection_field()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes a field from an existing collection schema by field name or field ID. | Python | MilvusClient"
type: docx
token: SpmqdHRBjoRKQuxTibQcx0zMnnb
sidebar_position: 27
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - drop_collection_field()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# drop_collection_field()

This operation removes a field from an existing collection schema by field name or field ID.

## Request Syntax\{#request-syntax}

```python
drop_collection_field(
```

**PARAMETERS:**

- **collection_name** (*str*) -

    The name of the target collection.

- **field_name** (*str*) -

    The field name to remove. Provide this when you identify the field by name.

- **field_id** (*int*) -

    The field ID to remove. Use this when your workflow tracks schema by field ID.

- **timeout** (*Optional[float]*) -

    The timeout for this operation in seconds.

- **kwargs** (*dict*) -

    Additional request options passed to the underlying RPC.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

This operation does not return data.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the collection does not exist, the field cannot be resolved, or the request fails. Raised when the collection does not exist, the field cannot be resolved, or the request fails.

## Examples\{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

client.drop_collection_field(
    collection_name="products",
    field_name="legacy_score",
)
```
