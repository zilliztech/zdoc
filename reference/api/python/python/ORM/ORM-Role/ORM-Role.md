---
title: "Role | Python | ORM"
slug: /python/python/ORM-Role
sidebar_label: "Role"
beta: NEAR DEPRECATE
added_since: Inherit
last_modified: false
deprecate_since: false
notebook: false
description: "A Role instance represents a role with specific privileges to access your . | Python | ORM"
type: docx
token: LZL1d0kckouPXNxJLCmcwbCTnkG
sidebar_position: 11
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - Role
  - pymilvus26
  - Chroma vs Milvus
  - Annoy vector search
  - milvus
  - Zilliz
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# Role

A **Role** instance represents a role with specific privileges to access your .

```python
class pymilvus.Role
```

## Constructor\{#constructor}

Constructs a role by name and other parameters.

```python
Role(
    name: str,
    using: str
)
```

<Admonition type="info" icon="📘" title="Notes">

<p>Calling the constructor alone does not create the role. You have to explicitly call the <code>create()</code> method of the role object to create the role.</p>

</Admonition>

**PARAMETERS:**

- **name** (*string*) - 

    **[REQUIRED]**

    The name of the role to create.

- **using** (*string*) - 

    The alias of the employed connection.

    The default value is **default**, indicating that this operation employs the default connection.

**RETURN TYPE:**

*Role*

**RETURNS:**

A role object.

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples\{#examples}

```python
from pymilvus import Role

# Create a role
role = Role(
    name="admin",
)
```

## Methods\{#methods}

The following are the methods of the `Role` class:

