---
title: "FieldOpType | Python | MilvusClient"
slug: /python/python/FieldOp-FieldOpType
sidebar_label: "FieldOpType"
beta: PUBLIC
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Enum alias for field-level partial-update operation types. | Python | MilvusClient"
type: docx
token: I8zBdZOdaorBS1xAxl4cC4E5njf
sidebar_position: 4
keywords: 
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - zilliz
  - zilliz cloud
  - cloud
  - FieldOpType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FieldOpType

Enum alias for field-level partial-update operation types.

## Examples\{#examples}

Compares an operation message with the exported enum value.

```python
from pymilvus import FieldOp, FieldOpType

op = FieldOp.array_append()
assert op.op == FieldOpType.ARRAY_APPEND
```

## Notes\{#notes}

- REPLACE replaces the current field value.

- ARRAY_APPEND appends incoming elements to the current array.

- ARRAY_REMOVE removes every matching incoming element from the current array.

