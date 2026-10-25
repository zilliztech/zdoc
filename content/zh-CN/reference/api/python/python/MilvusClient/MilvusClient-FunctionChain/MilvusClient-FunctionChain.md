---
title: "FunctionChain | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionChain
sidebar_label: "FunctionChain"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FunctionChain 实例组合出一个服务端函数链，即绑定到同一执行阶段的具名 map 和 sort 操作序列。 | Python | MilvusClient"
type: docx
token: Qp9tdzovXo3xCvxPlszcLGcInPh
sidebar_position: 1
keywords: 
  - 近似最近邻搜索
  - DiskANN
  - 稀疏向量
  - 向量维度
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionChain
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# FunctionChain

FunctionChain 实例组合出一个服务端函数链，即绑定到同一执行阶段的具名 map 和 sort 操作序列。

## 请求语法\{#request-syntax}

```python
class FunctionChain:
```

**参数：**

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    函数链运行所在的执行阶段，例如 FunctionChainStage.L2_RERANK。

- **name** (*str*) -

    默认值：`""`

    分配给此函数链的名称。

**方法：**

- `name`

    分配给此函数链的名称。

- `stage`

    此函数链运行所在的执行阶段。

- `ops`

    添加到此链的操作的不可变视图。

- `map(output, expr)`

    追加一个 map 操作，该操作将表达式结果写入输出字段。

- `sort(by, desc=True, tie_break_col=None)`

    追加一个按列排序的操作，并可选指定用于打破平局的列。

- `limit(limit, offset=0)`

    追加一个带可选偏移量的 limit 操作。

**异常：**

- **ParamError**

    当 stage 无法转换为 FunctionChainStage 或 name 不是字符串时抛出。请检查错误消息以确定确切原因。

## 示例\{#examples}

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
