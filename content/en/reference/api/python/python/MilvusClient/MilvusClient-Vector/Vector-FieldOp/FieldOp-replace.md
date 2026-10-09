---
title: "replace() | Python | MilvusClient"
slug: /python/python/FieldOp-replace
sidebar_label: "replace()"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Creates an explicit replacement operation for a field during an upsert. | Python | MilvusClient"
type: docx
token: ES6KdwdwUoN700xriVUcS3EBnVc
sidebar_position: 5
keywords: 
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
  - Audio search
  - zilliz
  - zilliz cloud
  - cloud
  - replace()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# replace()

Creates an explicit replacement operation for a field during an upsert.

## Request Syntax\{#request-syntax}

```python
FieldOp.replace() -> FieldPartialUpdateOp
```

**RETURN TYPE:**

*FieldPartialUpdateOp*

**RETURNS:**

Operation message that selects replacement behavior. Replacement is also the default when no field operation is supplied.

## Examples\{#examples}

Creates the explicit replacement operation value.

```python
from pymilvus import FieldOp

op = FieldOp.replace()
print(op)
```
