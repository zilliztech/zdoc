---
displayed_sidbar: pythonSidebar
title: "get_server_type() | Python | ORM"
slug: /python/python/utility-get_server_type
sidebar_label: "get_server_type()"
beta: false
notebook: false
description: "This operation checks the type of the Zilliz Cloud cluster. | Python | ORM"
type: docx
token: UOIddRBUXotHvyx4Yyocer0mnId
sidebar_position: 15
keywords: 
  - Faiss vector database
  - Chroma vector database
  - nlp search
  - hallucinations llm
  - zilliz
  - zilliz cloud
  - cloud
  - get_server_type()
  - python
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# get_server_type()

This operation checks the type of the Zilliz Cloud cluster.

## Request syntax{#request-syntax}

```python
get_server_type(
    using: str = "default",
)
```

**PARAMETERS:**

- **using** (*str*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

**RETURN TYPE:**

*str*

**RETURNS:**
The server type. Possible values are as follows:

- **zilliz**

    Indicates that the current server is a Zilliz Cloud cluster.

- **milvus**

    Indicates that the current server is a Milvus instance.

**EXAMPLE:**

```python
from pymilvus import connections, utility

# Connection to localhost:19530
connections.connect()

# Check the server type
server_type = utility.get_server_type()
```

## Related operations{#related-operations}

The following operations are related to `get_server_type()`:

- [get_server_version()](./utility-get_server_version)

