---
displayed_sidbar: pythonSidebar
title: "Role | Python | ORM"
slug: /python/python/ORM-Role
sidebar_label: "Role"
beta: NEAR DEPRECATE
notebook: false
description: "A Role instance represents a role with specific privileges to access your . | Python | ORM"
type: docx
token: LZL1d0kckouPXNxJLCmcwbCTnkG
sidebar_position: 11
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - Role
  - pymilvus25
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# Role

A **Role** instance represents a role with specific privileges to access your .

```python
class pymilvus.Role
```

## Constructor{#constructor}

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

## Examples{#examples}

```python
from pymilvus import Role

# Create a role
role = Role(
    name="admin",
)
```

## Methods{#methods}

The following are the methods of the `Role` class:

