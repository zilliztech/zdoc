---
title: "limit() | Python | MilvusClient"
slug: /python/python/FunctionChain-limit
sidebar_label: "limit()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation appends a limit operation to the function chain and returns the chain so calls can be chained fluently. The chain keeps the first limit items and optionally skips an offset before applying it. | Python | MilvusClient"
type: docx
token: KhBxdmmAGobyzWxEdHvcYEqWnxe
sidebar_position: 3
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - zilliz
  - zilliz cloud
  - cloud
  - limit()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# limit()

This operation appends a limit operation to the function chain and returns the chain so calls can be chained fluently. The chain keeps the first limit items and optionally skips an offset before applying it.

## Request Syntax\{#request-syntax}

```python
limit(
    limit: int,
    offset: int = 0
) -> "FunctionChain"
```

**PARAMETERS:**

- **limit** (*int*) -

    **[REQUIRED]**

    The maximum number of items to keep, which must be a positive integer.

- **offset** (*int*) -

    The number of items to skip before applying the limit, which must be a non-negative integer and defaults to 0.

**RETURN TYPE:**

[FunctionChain](./MilvusClient-FunctionChain)

**RETURNS:**

The FunctionChain instance itself, with the limit operation appended, so subsequent map(), sort(), and limit() calls can be chained fluently.

**PARAMETERS:**

- **name** (*str*) -

    The name assigned to the function chain.

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    The execution stage where the chain runs.

- **ops** (*list*) -

    The operations added to the chain so far, including the operation this call appended.

**EXCEPTIONS:**

- **ParamError**

    Raised when limit is not a positive integer or offset is negative. Fix the arguments so limit is positive and offset is zero or greater.

## Examples\{#examples}

```python
chain = chain.limit(
    10,
    offset=10,
)
```
