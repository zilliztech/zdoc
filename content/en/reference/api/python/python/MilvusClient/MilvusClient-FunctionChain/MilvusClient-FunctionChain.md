---
title: "FunctionChain | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionChain
sidebar_label: "FunctionChain"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A FunctionChain instance composes a server-side function chain a named sequence of map and sort operations bound to one execution stage. | Python | MilvusClient"
type: docx
token: Qp9tdzovXo3xCvxPlszcLGcInPh
sidebar_position: 1
keywords: 
  - approximate nearest neighbor search
  - DiskANN
  - Sparse vector
  - Vector Dimension
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionChain
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChain

A FunctionChain instance composes a server-side function chain: a named sequence of map and sort operations bound to one execution stage.

## Request Syntax\{#request-syntax}

```python
class FunctionChain:
```

**PARAMETERS:**

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    The execution stage where the chain runs, such as FunctionChainStage.L2_RERANK.

- **name** (*str*) -

    Default: `""`

    The name assigned to this function chain.

**METHODS:**

- `name`

    The name assigned to this function chain.

- `stage`

    The execution stage where this function chain runs.

- `ops`

    An immutable view of the operations added to this chain.

- `map(output, expr)`

    Appends a map operation that writes an expression result to an output field.

- `sort(by, desc=True, tie_break_col=None)`

    Appends a sort operation by column, optionally with a tie-break column.

- `limit(limit, offset=0)`

    Appends a limit operation with an optional offset.

**EXCEPTIONS:**

- **ParamError**

    Raised when the stage cannot be converted to a FunctionChainStage or the name is not a string. Inspect the error message for the exact cause.

## Examples\{#examples}

```python
from pymilvus import MilvusClient, FunctionChain, FunctionChainStage, col, fn

chain = (
    FunctionChain(
        FunctionChainStage.L2_RERANK,
        name="fresh_popular_rerank",
    )
    .map("freshness", fn.decay(
            col("published_at"),
            function="exp",
            origin=1700000000,
            scale=86400,
        ))
    .map(
        "$score",
        fn.num_combine(
            col("$score"),
            col("freshness"),
            col("popularity"),
            mode="weighted",
        ),
    )
    .sort(
        "$score",
        desc=True,
    )
)
results = client.search(
    collection_name="docs",
    data=[[0.1, 0.2]],
    limit=10,
    function_chains=chain,
)
```
