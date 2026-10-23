---
title: "FunctionScore | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A FunctionScore instance combines multiple Functions in a configurable manner. You can use a FunctionScore instance as a ranker to combine multiple reranking Functions. | Python | MilvusClient"
type: docx
token: TXPxdXNMtoKZcRxkirkccYSsnId
sidebar_position: 12
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionScore
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

A **FunctionScore** instance combines multiple **Function**s in a configurable manner. You can use a **FunctionScore** instance as a ranker to combine multiple reranking **Function**s.

## Request Syntax\{#request-syntax}

```python
class pymilvus.FunctionScore
```

**PARAMETERS:**

- **functions** (*[Function](../Collections/Function/Function.md*) -

    An option that <em>,</em> List[Function]&ast;) - A Function instance or a list of Function instances that are to be combined in the current FunctionScore instance.

- **params** (*Dict*) -

    An option that p e.

## Examples\{#examples}

```python
class pymilvus.FunctionScore
```
