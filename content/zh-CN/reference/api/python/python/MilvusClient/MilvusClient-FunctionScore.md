---
title: "FunctionScore | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "一个 FunctionScore 实例以可配置的方式组合多个 Function](./MilvusClient-Function)。您可以将 FunctionScore 实例用作排序器，以组合多个重排序 [Function。 | Python | MilvusClient"
type: docx
token: PfJNdkuMDoCqqcxm6S2cDD6TnFh
sidebar_position: 13
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
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

**FunctionScore** 实例以可配置的方式组合多个 **[Function](./MilvusClient-Function)**。您可以将 **FunctionScore** 实例用作排序器，以组合多个重排序 **[Function](./MilvusClient-Function)**。

```python
class pymilvus.FunctionScore
```

## Constructor\{#constructor}

构造一个 **FunctionScore** 实例，以可配置的方式组合多个 **[Function](./MilvusClient-Function)**。

```python
FunctionScore(
    functions: Union[Function, List[Function]],
    params: Optional[Dict] = None,
)
```

**PARAMETERS:**

- **functions** (*[Function](./MilvusClient-Function)*, *List[[Function](./MilvusClient-Function)]*) -

    要在当前 FunctionScore 实例中进行组合的一个 Function 实例或一个 Function 实例列表。

- **params** (*Dict*) -  

    指定如何组合上述 Function 实例。它提供以下设置：

    - **boost_mode** (*str*) - 

        指定所设定权重如何影响任何匹配实体的分数。可能的值包括：

        - `Multiply`

            表示加权值等于匹配实体的原始分数乘以指定权重。 

            这是默认值。

        - `Sum`

            表示加权值等于匹配实体的原始分数与指定权重之和

    - **function_mode** (*str*) -

        指定如何处理来自各个 Boost Ranker 的加权值。可能的值包括：

        - `Multiply`

            表示匹配实体的最终分数等于所有 Boost Ranker 的加权值乘积。

            这是默认值。

        - `Sum`

            表示匹配实体的最终分数等于所有 Boost Ranker 的加权值之和。

    **RETURN TYPE:**

    *FunctionScore*

    **RETURNS:**

    按配置方式组合的 Function 集合

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

