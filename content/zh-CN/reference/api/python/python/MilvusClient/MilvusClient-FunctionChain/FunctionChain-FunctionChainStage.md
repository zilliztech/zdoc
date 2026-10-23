---
title: "FunctionChainStage | Python | MilvusClient"
slug: /python/python/FunctionChain-FunctionChainStage
sidebar_label: "FunctionChainStage"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainStage 实例是函数链可以运行的一个执行阶段。 | Python | MilvusClient"
type: docx
token: IUVldU03IosKJqxo8W9cU0g5nWh
sidebar_position: 2
keywords: 
  - LLM 评估
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionChainStage
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainStage

FunctionChainStage 实例是函数链可以运行的一个执行阶段。

**取值：**

- `UNSPECIFIED`

    未指定阶段。

- `INGESTION`

    该函数链在数据摄取期间运行。

- `PRE_PROCESS`

    该函数链在主查询或搜索过程之前运行。

- `L0_RERANK`

    该函数链在第一个重排序阶段运行。

- `L1_RERANK`

    该函数链在第二个重排序阶段运行。

- `L2_RERANK`

    该函数链在第三个重排序阶段运行。

- `POST_PROCESS`

    该函数链在主查询或搜索过程之后运行。

## 示例\{#examples}

```python
from pymilvus import FunctionChain, FunctionChainStage

chain = FunctionChain(
    FunctionChainStage.L2_RERANK,
    name="rerank",
)
```
