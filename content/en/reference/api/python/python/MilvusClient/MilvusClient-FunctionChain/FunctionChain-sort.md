---
title: "sort() | Python | MilvusClient"
slug: /python/python/FunctionChain-sort
sidebar_label: "sort()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation appends a sort operation to the function chain and returns the chain so calls can be chained fluently. The chain sorts by a column in descending order by default, with an optional tie-breaker column for stable ordering. | Python | MilvusClient"
type: docx
token: NqVVdpsuPoWuD8xKcf5cAvq3nJh
sidebar_position: 5
keywords: 
  - openai vector db
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - zilliz
  - zilliz cloud
  - cloud
  - sort()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# sort()

This operation appends a sort operation to the function chain and returns the chain so calls can be chained fluently. The chain sorts by a column in descending order by default, with an optional tie-breaker column for stable ordering.

## Request Syntax\{#request-syntax}

```python
sort(
    by: Union[str, ColumnRef],
    desc: bool = True,
    tie_break_col: Optional[Union[str, ColumnRef]] = None
) -> "FunctionChain"
```

**PARAMETERS:**

- **by** (*str | ColumnRef*) -

    **[REQUIRED]**

    The column name or ColumnRef used as the primary sort key.

- **desc** (*bool*) -

    The sort direction for the chain, which sorts in descending order by default.

- **tie_break_col** (*str | ColumnRef | None*) -

    The optional column name or ColumnRef used to break ties when the primary sort values are equal.

**RETURN TYPE:**

[FunctionChain](./MilvusClient-FunctionChain)

**RETURNS:**

The FunctionChain instance itself, with the sort operation appended, so subsequent map(), sort(), and limit() calls can be chained fluently.

**PARAMETERS:**

- **name** (*str*) -

    The name assigned to the function chain.

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    The execution stage where the chain runs.

- **ops** (*list*) -

    The operations added to the chain so far, including the operation this call appended.

**EXCEPTIONS:**

- **ParamError**

    Raised when by or tie_break_col is not a valid column reference, or desc is not a boolean. Fix the arguments so both column references name existing fields and desc is a boolean.

## Examples\{#examples}

```python
chain = chain.sort(
    "score",
    desc=True,
    tie_break_col="doc_id",
)
```
