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

---

import Admonition from '@theme/Admonition';


# FunctionScore

**FunctionScore** 实例以可配置的方式组合多个 **Function**。您可以将 **FunctionScore** 实例用作重排器，以组合多个重排 **Function**。

## 请求语法\{#request-syntax}

```python
class pymilvus.FunctionScore
```

**参数：**

- **functions** (*[Function](./MilvusClient-Function), List[Function]*) -

    要在当前 FunctionScore 实例中组合的 Function 实例或 Function 实例列表。

- **params** (*Dict*) -

    一个选项，用于指定上述 Function 实例的组合方式。它提供以下设置：boost_mode（str）：指定权重如何影响任何匹配 Entity 的分数。可选值包括：Multiply：表示加权值等于匹配 Entity 的原始分数乘以指定的权重。这是默认值。Sum：表示加权值等于匹配 Entity 的原始分数与指定权重之和。function_mode（str）：指定如何处理来自各个 Boost Ranker 的加权值。可选值包括：Multiply：表示匹配 Entity 的最终分数等于所有 Boost Ranker 加权值的乘积。这是默认值。Sum：表示匹配 Entity 的最终分数等于所有 Boost Ranker 加权值之和。返回类型：*FunctionScore* 返回值：一组按配置方式组合的 Function。 ## 示例。

## 示例\{#examples}

```python
class pymilvus.FunctionScore
```
