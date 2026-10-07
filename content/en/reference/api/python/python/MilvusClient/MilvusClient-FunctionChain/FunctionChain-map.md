---
title: "map() | Python | MilvusClient"
slug: /python/python/FunctionChain-map
sidebar_label: "map()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation appends a map operation to the function chain and returns the chain so calls can be chained fluently. A map operation evaluates a function expression and writes its result to an output field. | Python | MilvusClient"
type: docx
token: Vo8NdVAd6oBnY4xdWR1c3jNEnye
sidebar_position: 4
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - map()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# map()

This operation appends a map operation to the function chain and returns the chain so calls can be chained fluently. A map operation evaluates a function expression and writes its result to an output field.

## Request Syntax\{#request-syntax}

```python
map(
    output: str,
    expr: FunctionChainExpr
) -> "FunctionChain"
```

**PARAMETERS:**

- **output** (*str*) -

    **[REQUIRED]**

    The name of the output field that the expression writes its result to, which must be a non-empty string.

- **expr** (*FunctionChainExpr*) -

    **[REQUIRED]**

    The function expression that the chain evaluates for each input item, built from a column reference and a helper function of the fn module.

**RETURN TYPE:**

[FunctionChain](./MilvusClient-FunctionChain)

**RETURNS:**

The FunctionChain instance itself, with the map operation appended, so subsequent map(), sort(), and limit() calls can be chained fluently.

**PARAMETERS:**

- **name** (*str*) -

    The name assigned to the function chain.

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    The execution stage where the chain runs.

- **ops** (*list*) -

    The operations added to the chain so far, including the operation this call appended.

**EXCEPTIONS:**

- **ParamError**

    Raised when output is an empty string or expr is not a FunctionChainExpr. Fix the arguments so output names a field and expr is a function expression built with the fn helpers.

## Examples\{#examples}

```python
chain = chain.map(
    "rounded_score",
    fn.round_decimal(
        col("$score"),
        decimal=3,
    ),
)
```
