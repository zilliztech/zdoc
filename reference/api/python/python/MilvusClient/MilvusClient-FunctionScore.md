---
title: "FunctionScore | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "A FunctionScore instance combines multiple Function](./MilvusClient-Function)s in a configurable manner. You can use a FunctionScore instance as a ranker to combine multiple reranking [Functions. | Python | MilvusClient"
type: docx
token: PfJNdkuMDoCqqcxm6S2cDD6TnFh
sidebar_position: 13
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

A **FunctionScore** instance combines multiple **[Function](./MilvusClient-Function)**s in a configurable manner. You can use a **FunctionScore** instance as a ranker to combine multiple reranking **[Function](./MilvusClient-Function)**s.

```python
class pymilvus.FunctionScore
```

## Constructor\{#constructor}

Constructs a **FunctionScore** instance that combines multiple **[Function](./MilvusClient-Function)**s in a configurable manner.

```python
FunctionScore(
    functions: Union[Function, List[Function]],
    params: Optional[Dict] = None,
)
```

**PARAMETERS:**

- **functions** (*[Function](./MilvusClient-Function)*, *List[[Function](./MilvusClient-Function)]*) -

    A Function instance or a list of Function instances that are to be combined in the current FunctionScore instance.

- **params** (*Dict*) -  

    Specifies how the above Function instances are to be combined. It provides the following settings:

    - **boost_mode** (*str*) - 

        Specifies how the specified weights influence the scores of any matching entities. Possible values are:

        - `Multiply`

            Indicates that the weighted value is equal to the original score of a matching entity multiplied by the specified weight. 

            This is the default value.

        - `Sum`

            Indicates that the weighted value is equal to the sum of the original score of a matching entity and the specified weight

    - **function_mode** (*str*) -

        Specifies how the weighted values from various Boost Rankers are processed. Possible values are:

        - `Multiply`

            Indicates that the final score of a matching entity is equal to the product of the weighted values from all Boost Rankers.

            This is the default value.

        - `Sum`

            Indicates that the final score of a matching entity is equal to the sum of the weighted values from all Boost Rankers.

    **RETURN TYPE:**

    *FunctionScore*

    **RETURNS:**

    A set of Functions that are combined in the configured manner

    ## Examples\{#examples}

    ```python
    from pymilvus import Function, FunctionType, FunctionScore
    
    # Create a Boost Ranker with a fixed weight
    fix_weight_ranker = Function(
        name="boost",
        input_field_names=[], # Must be an empty list
        function_type=FunctionType.RERANK,
        params={
            "reranker": "boost",
            "weight": 0.8
        }
    )
    
    # Create a Boost Ranker with a randomly generated weight between 0 and 0.4
    random_weight_ranker = Function(
        name="boost",
        input_field_names=[], # Must be an empty list
        function_type=FunctionType.RERANK,
        params={
            "reranker": "boost",
            "random_score": {
                "seed": 126,
            },
            "weight": 0.4
        }
    )
    
    # Create a Function Score
    ranker = FunctionScore(
        functions=[
            fix_weight_ranker, 
            random_weight_ranker
        ],
        params={
            "boost_mode": "Multiply",
            "function_mode": "Sum"
        }
    )
    ```

