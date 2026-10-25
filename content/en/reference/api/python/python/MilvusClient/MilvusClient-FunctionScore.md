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

    An option that specifies how the above Function instances are to be combined. It provides the following settings: boost_mode (str): Specifies how the specified weights influence the scores of any matching entities. Possible values are: Multiply: Indicates that the weighted value is equal to the original score of a matching entity multiplied by the specified weight. This is the default value. Sum: Indicates that the weighted value is equal to the sum of the original score of a matching entity and the specified weight. function_mode (str): Specifies how the weighted values from various Boost Rankers are processed. Possible values are: Multiply: Indicates that the final score of a matching entity is equal to the product of the weighted values from all Boost Rankers. This is the default value. Sum: Indicates that the final score of a matching entity is equal to the sum of the weighted values from all Boost Rankers. RETURN TYPE: *FunctionScore* RETURNS: A set of Functions that are combined in the configured manner ## Examples.

## Examples\{#examples}

```python
class pymilvus.FunctionScore
```
