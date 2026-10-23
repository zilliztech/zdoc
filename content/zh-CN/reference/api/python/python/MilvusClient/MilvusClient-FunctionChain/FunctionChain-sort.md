---
title: "sort() | Python | MilvusClient"
slug: /python/python/FunctionChain-sort
sidebar_label: "sort()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会向函数链追加一个排序操作，并返回该链，以便流畅地进行链式调用。该链默认按某一列降序排序，并可选使用一个用于打破平局的列来实现稳定排序。 | Python | MilvusClient"
type: docx
token: NqVVdpsuPoWuD8xKcf5cAvq3nJh
sidebar_position: 5
keywords: 
  - OpenAI 向量 Database
  - 自然语言处理 Database
  - 低成本向量 Database
  - 托管向量 Database
  - Zilliz
  - Zilliz Cloud
  - 云
  - sort()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# sort()

此操作会向函数链追加一个排序操作，并返回该链，以便流畅地进行链式调用。该链默认按某一列降序排序，并可选使用一个用于打破平局的列来实现稳定排序。

## 请求语法\{#request-syntax}

```python
sort(
    by: Union[str, ColumnRef],
    desc: bool = True,
    tie_break_col: Optional[Union[str, ColumnRef]] = None
) -> "FunctionChain"
```

**参数：**

- **by** （*str | ColumnRef*） -

    **[必需]**

    用作主要排序键的列名或 ColumnRef。

- **desc** （*bool*） -

    该链的排序方向，默认按降序排序。

- **tie_break_col** （*str | ColumnRef | None*） -

    可选，用于在主排序值相等时打破平局的列名或 ColumnRef。

**返回类型：**

[FunctionChain](./MilvusClient-FunctionChain)

**返回：**

返回追加了排序操作的 FunctionChain 实例本身，以便后续的 map()、sort() 和 limit() 调用可以流畅地链式执行。

**参数：**

- **name** （*str*） -

    分配给函数链的名称。

- **stage** （[FunctionChainStage](./FunctionChain-FunctionChainStage)） -

    链运行所在的执行阶段。

- **ops** （*list*） -

    到目前为止添加到链中的操作，包括本次调用追加的操作。

**异常：**

- **ParamError**

    当 by 或 tie_break_col 不是有效的列引用，或 desc 不是布尔值时抛出。请修正参数，使两个列引用都指向现有字段，并且 desc 为布尔值。

## 示例\{#examples}

```python
chain = chain.sort(
    "score",
    desc=True,
    tie_break_col="doc_id",
)
```
