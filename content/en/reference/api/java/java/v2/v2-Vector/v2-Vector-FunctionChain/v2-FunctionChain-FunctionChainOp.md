---
title: "FunctionChainOp | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainOp
sidebar_label: "FunctionChainOp"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A single operation in a function-chain pipeline, such as `map`, `sort`, or `limit`. | Java | v2"
type: docx
token: A6jodK8uxonu3Gx8pS6ccsJtnte
sidebar_position: 4
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionChainOp
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainOp

A single operation in a function-chain pipeline, such as `map`, `sort`, or `limit`.

```java
io.milvus.v2.service.vector.request.FunctionChainOp
```

## Constants\{#constants}

- `String OP_MAP` — The `"map"` operation name.

- `String OP_SORT` — The `"sort"` operation name.

- `String OP_LIMIT` — The `"limit"` operation name.

## Constructor\{#constructor}

This builder creates a function-chain operation with an optional expression, inputs, outputs, and parameters.

```java
FunctionChainOp.builder()
    .op(String op)
    .expr(FunctionChainExpr expr)
    .inputs(List<String> inputs)
    .outputs(List<String> outputs)
    .params(Map<String, FunctionParamValue> params)
    .build()
```

**BUILDER METHODS:**

- `op(String op)`

    The operation name, e.g. `"map"`, `"sort"`, `"limit"`.

- `expr(FunctionChainExpr expr)`

    The function expression attached to this operation.

- `inputs(List<String> inputs)`

    The input columns of this operation.

- `outputs(List<String> outputs)`

    The output columns of this operation.

- `params(Map<String, FunctionParamValue> params)`

    The named parameters of this operation.

**RETURN TYPE:**

*FunctionChainOp*

**METHODS:**

- `String getOp()`

    Returns the operation name.

- `FunctionChainExpr getExpr()`

    Returns the attached function expression.

- `List<String> getInputs()`

    Returns the input columns of this operation.

- `List<String> getOutputs()`

    Returns the output columns of this operation.

- `Map<String, FunctionParamValue> getParams()`

    Returns the named parameters of this operation.

## Example\{#example}

```java
FunctionChainOp op = FunctionChainOp.builder()
        .op(FunctionChainOp.OP_SORT)
        .inputs(Collections.singletonList("$score"))
        .build();
```
