---
title: "DataType | Python | MilvusClient"
slug: /python/python/Collections-DataType
sidebar_label: "DataType"
beta: false
added_since: Inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。 | Python | MilvusClient"
type: docx
token: MKrAdumLvohQfDxgpMwcEB8dnqb
sidebar_position: 7
keywords: 
  - Retrieval Augmented Generation
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - DataType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# DataType

这是一个提供以下常量的枚举。

## 常量\{#constants}

- BOOL

    将数据类型设置为 **Boolean**。

- INT8

    将数据类型设置为 **Int8**。

- INT16

    将数据类型设置为 **Int16**。

- INT32

    将数据类型设置为 **Int32**。

- INT64

    将数据类型设置为 **Int64**。

- FLOAT

    将数据类型设置为 **Float**。

- DOUBLE

    将数据类型设置为 **Double**。

- VARCHAR

    将数据类型设置为 **Varchar**。

- TEXT

    将数据类型设置为 **TEXT**。使用此标量类型可存储长文本内容，例如文档、段落、工单或日志。与 **VARCHAR** 不同，TEXT 不需要 `max_length`。

- ARRAY

    将数据类型设置为 **Array**。

- JSON

    将数据类型设置为 **JSON**。

- GEOMETRY

    将数据类型设置为 **Geometry**。

- TIMESTAMPTZ

    将数据类型设置为 **TIMESTAMPTZ**。

- STRUCT

    将 Array 字段中元素的数据类型设置为 **Struct**。

- FLOAT_VECTOR

    将数据类型设置为 **Float Vector**。

- BINARY_VECTOR

    将数据类型设置为 **Binary Vector**。

- FLOAT16_VECTOR

    将数据类型设置为 **Float16 Vector**。

- BFLOAT16_VECTOR

    将数据类型设置为 **BFloat16 Vector**。

- INT8_VECTOR

    将数据类型设置为 **Int8 Vector**。此数据类型专为量化深度学习模型（例如 ResNet、EfficientNet）设计，可在精度损失极小的情况下减小模型大小并加快推理速度。

- SPARSE_FLOAT_VECTOR

    将数据类型设置为 **Sparse Vector**。
