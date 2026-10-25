---
title: "map() | Python | MilvusClient"
slug: /python/python/FunctionChain-map
sidebar_label: "map()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作向函数链追加一个 map 操作，并返回该函数链，以便流畅地进行链式调用。map 操作会计算函数表达式，并将结果写入输出字段。 | Python | MilvusClient"
type: docx
token: Vo8NdVAd6oBnY4xdWR1c3jNEnye
sidebar_position: 4
keywords: 
  - 分层可导航小世界
  - 稠密嵌入
  - Faiss 向量 Database
  - Chroma 向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - map()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# map()

此操作向函数链追加一个 map 操作，并返回该函数链，以便流畅地进行链式调用。map 操作会计算函数表达式，并将结果写入输出字段。

## 请求语法\{#request-syntax}

```python
map(
    output: str,
    expr: FunctionChainExpr
) -> "FunctionChain"
```

**参数：**

- **output** （*str*） -

    **[必需]**

    表达式将结果写入的输出字段名称，该名称必须是非空字符串。

- **expr** （*FunctionChainExpr*） -

    **[必需]**

    函数链针对每个输入项计算的函数表达式，由列引用和 fn 模块的辅助函数构建。

**返回类型：**

[FunctionChain](./MilvusClient-FunctionChain)

**返回：**

返回 FunctionChain 实例本身，并已追加 map 操作，因此后续的 map()、sort() 和 limit() 调用可以流畅地进行链式调用。

**参数：**

- **name** （*str*） -

    分配给函数链的名称。

- **stage** （[FunctionChainStage](./FunctionChain-FunctionChainStage)） -

    函数链运行的执行阶段。

- **ops** （*list*） -

    目前添加到函数链的操作，包括本次调用追加的操作。

**异常：**

- **ParamError**

    当 output 为空字符串或 expr 不是 FunctionChainExpr 时抛出。请修正参数，使 output 指定字段，并使 expr 为使用 fn 辅助函数构建的函数表达式。

## 示例\{#examples}

```python
chain = chain.map(
    "rounded_score",
    fn.round_decimal(
        col("$score"),
        decimal=3,
    ),
)
```
