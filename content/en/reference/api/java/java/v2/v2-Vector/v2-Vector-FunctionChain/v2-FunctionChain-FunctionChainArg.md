---
title: "FunctionChainArg | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainArg
sidebar_label: "FunctionChainArg"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "A FunctionChainArg instance is a single argument of a function-chain expression either a column reference or a literal value. | Java | v2"
type: docx
token: RoiCd1E9QosTydxlBr9cURj5nne
sidebar_position: 2
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionChainArg
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainArg

A FunctionChainArg instance is a single argument of a function-chain expression: either a column reference or a literal value.

```java
io.milvus.v2.service.vector.request.FunctionChainArg
```

## Methods\{#methods}

- `static FunctionChainArg col(String name)`

    Creates a column-reference argument for the given field name.

- `static FunctionChainArg literal(Object value)`

    Creates a literal-value argument.

- `boolean isColumn()`

    Returns `true` if this argument is a column reference.

- `String getColumnName()`

    Returns the column name when this argument is a column reference.

- `FunctionParamValue getLiteral()`

    Returns the literal value when this argument is a literal.

## Example\{#example}

```java
FunctionChainArg arg = FunctionChainArg.col("$score");
FunctionChainArg literal = FunctionChainArg.literal(0.7);
```
