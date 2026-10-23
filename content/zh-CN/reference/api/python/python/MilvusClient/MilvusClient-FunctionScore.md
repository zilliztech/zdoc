---
title: "FunctionScore | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FunctionScore 实例以可配置的方式组合多个 Function。您可以将 FunctionScore 实例用作重排器，以组合多个重排 Function。 | Python | MilvusClient"
type: docx
token: TXPxdXNMtoKZcRxkirkccYSsnId
sidebar_position: 12
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - 云
  - FunctionScore
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

**FunctionScore** 实例以可配置的方式组合多个 **Function**。您可以将 **FunctionScore** 实例用作重排器，以组合多个重排 **Function**。

## 请求语法\{#request-syntax}

```python
class pymilvus.FunctionScore
```

**参数：**

- **functions** (*[Function](../Collections/Function/Function.md*) -

    一个选项，<em>,</em> List[Function]&ast;） - 要在此 FunctionScore 实例中组合的一个 Function 实例或 Function 实例列表。

- **params** (*Dict*) -

    一个选项，p e。

## 示例\{#examples}

```python
class pymilvus.FunctionScore
```
