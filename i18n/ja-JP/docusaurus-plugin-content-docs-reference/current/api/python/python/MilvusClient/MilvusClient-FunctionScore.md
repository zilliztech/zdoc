---
title: "FunctionScore | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionScore インスタンスは、複数の [Function](./MilvusClient-Function) を設定可能な方法で組み合わせます。FunctionScore インスタンスを ranker として使用し、複数の reranking [Function](./MilvusClient-Function) を組み合わせることができます。 | Python | MilvusClient"
type: docx
token: PfJNdkuMDoCqqcxm6S2cDD6TnFh
sidebar_position: 12
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - vector embeddings とは
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

**FunctionScore** インスタンスは、複数の **[Function](./MilvusClient-Function)** を設定可能な方法で組み合わせます。**FunctionScore** インスタンスを ranker として使用し、複数の reranking **[Function](./MilvusClient-Function)** を組み合わせることができます。

```python
class pymilvus.FunctionScore
```

## Constructor\{#constructor}

複数の **[Function](./MilvusClient-Function)** を設定可能な方法で組み合わせる **FunctionScore** インスタンスを構築します。

```python
FunctionScore(
    functions: Union[Function, List[Function]],
    params: Optional[Dict] = None,
)
```

**PARAMETERS:**

- **functions** (*[Function](./MilvusClient-Function)*, *List[[Function](./MilvusClient-Function)]*) -

    現在の FunctionScore インスタンスで組み合わせる Function インスタンス、または Function インスタンスのリストです。

- **params** (*Dict*) -  

    上記の Function インスタンスをどのように組み合わせるかを指定します。以下の設定を提供します。

    - **boost_mode** (*str*) - 

        指定された weight が、一致した entity の score にどのように影響するかを指定します。指定可能な値は以下のとおりです。

        - `Multiply`

            重み付けされた値が、一致した entity の元の score に指定された weight を乗算した値に等しいことを示します。 

            これはデフォルト値です。

        - `Sum`

            重み付けされた値が、一致した entity の元の score と指定された weight の合計に等しいことを示します

    - **function_mode** (*str*) -

        さまざまな Boost Ranker からの重み付けされた値をどのように処理するかを指定します。指定可能な値は以下のとおりです。

        - `Multiply`

            一致した entity の最終 score が、すべての Boost Ranker からの重み付けされた値の積に等しいことを示します。

            これはデフォルト値です。

        - `Sum`

            一致した entity の最終 score が、すべての Boost Ranker からの重み付けされた値の合計に等しいことを示します。

    **RETURN TYPE:**

    *FunctionScore*

    **RETURNS:**

    設定された方法で組み合わされた Functions のセット

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

