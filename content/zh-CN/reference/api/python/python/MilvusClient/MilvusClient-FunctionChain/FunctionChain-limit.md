---
title: "limit() | Python | MilvusClient"
slug: /python/python/FunctionChain-limit
sidebar_label: "limit()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向函数链追加一个 limit 操作，并返回该链，以便流畅地链式调用。该链会保留最初的 limit 个条目，并可在应用该限制前选择跳过一定的偏移量。 | Python | MilvusClient"
type: docx
token: KhBxdmmAGobyzWxEdHvcYEqWnxe
sidebar_position: 3
keywords: 
  - 最近邻搜索
  - LLM 评估
  - 稀疏与稠密
  - 稠密向量
  - zilliz
  - zilliz cloud
  - 云
  - limit()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# limit()

此操作会向函数链追加一个 limit 操作，并返回该链，以便流畅地链式调用。该链会保留最初的 limit 个条目，并可在应用该限制前选择跳过一定的偏移量。

## 请求语法\{#request-syntax}

```python
limit(
    limit: int,
    offset: int = 0
) -> "FunctionChain"
```

**参数：**

- **limit** (*int*) -

    **[必需]**

    要保留的最大条目数，必须为正整数。

- **offset** (*int*) -

    应用限制前要跳过的条目数，必须为非负整数，默认为 0。

**返回类型：**

[FunctionChain](./MilvusClient-FunctionChain)

**返回：**

FunctionChain 实例本身，并已追加 limit 操作，因此后续的 map()、sort() 和 limit() 调用可以流畅地链式执行。

**参数：**

- **name** (*str*) -

    分配给函数链的名称。

- **stage** ([FunctionChainStage](./FunctionChain-FunctionChainStage)) -

    该链运行所在的执行阶段。

- **ops** (*list*) -

    到目前为止添加到该链的操作，包括本次调用追加的操作。

**异常：**

- **ParamError**

    当 limit 不是正整数或 offset 为负数时引发。请修正参数，使 limit 为正数且 offset 为 0 或更大。

## 示例\{#examples}

```python
chain = chain.limit(
    10,
    offset=10,
)
```
