---
displayed_sidbar: pythonSidebar
title: "describe_database() | Python | MilvusClient"
slug: /python/python/Database-describe_database
sidebar_label: "describe_database()"
beta: false
notebook: false
description: "This operation lists detailed information about the specified database. | Python | MilvusClient"
type: docx
token: LEaYdk179oZn0vxqa0lcn4mnnrg
sidebar_position: 3
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - describe_database()
  - pymilvus25
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# describe_database()

This operation lists detailed information about the specified database.

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
describe_database(
    db_name: str, 
    timeout: Optional[float] = None,
    **kwargs,
) -> Dict
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    Name of the database to describe.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to *None* indicates that it timeouts when a response arrives, or an error occurs.

**RETURN TYPE:**

*Dict*

**RETURNS:**

A dictionary that contains detailed information about the specified database.

**EXCEPTIONS:**

- `MilvusException` - Raised if any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

client.describe_database(
    db_name="my_db"
)

# {
#   "name": "my_db",
#   "a": "b",
#.  "c": "d",
# }
```
