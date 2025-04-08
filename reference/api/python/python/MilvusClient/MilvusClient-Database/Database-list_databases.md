---
displayed_sidbar: pythonSidebar
title: "list_databases() | Python | MilvusClient"
slug: /python/python/Database-list_databases
sidebar_label: "list_databases()"
beta: false
notebook: false
description: "This operation lists all existing databases. | Python | MilvusClient"
type: docx
token: FZuddXocNopEufxRFGdcbvkRnnb
sidebar_position: 6
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - list_databases()
  - pymilvus25
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# list_databases()

This operation lists all existing databases.

<Admonition type="info" icon="📘" title="Notes">

<p>This method applies only to dedicated clusters.</p>

</Admonition>

## Request Syntax{#request-syntax}

```python
list_databases(
    timeout: Optional[float] = None,
    **kwargs,
) -> [] string
```

**PARAMETERS:**

- **db_name** (*string*) -

    **[REQUIRED]**

    Name of the database to drop.

- **timeout** (*float* | *None*) -

    The timeout duration for this operation. Setting this to *None* indicates that it timeouts when a response arrives or an error occurs.

**RETURN TYPE:**

*[]string*

**RETURNS:**

A list of database names.

**EXCEPTIONS:**

- `MilvusException` - Raised if any error occurs during this operation.

## Examples{#examples}

```python
from pymilvus import MilvusClient

client = MilvusClient(uri, token) # db = "default" 

db_list = client.list_databases()
print(db_list)
# ["my_database", "default"]
```
