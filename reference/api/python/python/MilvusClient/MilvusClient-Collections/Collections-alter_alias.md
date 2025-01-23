---
displayed_sidbar: pythonSidebar
title: "alter_alias() | Python | MilvusClient"
slug: /python/python/Collections-alter_alias
sidebar_label: "alter_alias()"
beta: false
notebook: false
description: "This operation reassigns the alias of one collection to another. | Python | MilvusClient"
type: docx
token: CBc3d1mrdoYqmDxe4Kcc9zxAnzh
sidebar_position: 1
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - alter_alias()
  - pymilvus25
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# alter_alias()

This operation reassigns the alias of one collection to another.

## Request syntax{#request-syntax}

```python
alter_alias(
    collection_name: str,
    alias: str,
    timeout: float | None
) -> None
```

**PARAMETERS:**

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the target collection to reassign an alias to.

- **alias** (*str*) -

    **[REQUIRED]**

    The alias of the collection. Note that the alias should exist beforehand.

    <Admonition type="info" icon="📘" title="What is a collection alias?">

    <p>A collection alias is an additional name for a collection. Collection aliases are useful when you want to switch your application to a new collection without any changes to your code. </p>
    <p>On Zilliz Cloud, a collection alias is a globally unique identifier. One alias can only be assigned to exactly one collection. Conversely, a collection can have multiple aliases.</p>
    <p>Below is an example of reassigning the alias of one collection to another:</p>
    <p>Suppose there are two collections: <code>collection_1</code> and <code>collection_2</code>. There is also a collection alias named <code>bob</code>, which was originally assigned to <code>collection_1</code>:</p>
    <ul>
    <li><p><code>collection_1</code>'s alias = ["bob"]</p></li>
    <li><p><code>collection_2</code>'s alias = []</p></li>
    </ul>
    <p>After calling <code>alter_alias("collection_2", "bob")</code>:</p>
    <ul>
    <li><p><code>collection_1</code>'s alias = []</p></li>
    <li><p><code>collection_2</code>'s alias = ["bob"]</p></li>
    </ul>

    </Admonition>

- **timeout** (*float* | *None*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURN TYPE:**

*NoneType*

**RETURNS:**

 None

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation, especially when the specified alias does not exist.

## Example{#example}

```python
from pymilvus import MilvusClient

# 1. Create a milvus client
client = MilvusClient(
    uri="https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530",
    token="user:password"
)

# 2. Create two collections
client.create_collection(collection_name="test_collection_1", dimension=5)
client.create_collection(collection_name="test_collection_2", dimension=5)

# 3. Create an alias for the collection
client.create_alias(collection_name="test_collection_1", alias="test")

# 4. Reassign the alias to the other collection
client.alter_alias(collection_name="test_collection_2", alias="test")
```

## Related methods{#related-methods}

- [create_alias()](./Collections-create_alias)

- [describe_alias()](./Collections-describe_alias)

- [drop_alias()](./Collections-drop_alias)

- [list_aliases()](./Collections-list_aliases)

