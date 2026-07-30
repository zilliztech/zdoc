---
title: "FunctionType | Python | MilvusClient"
slug: /python/python/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "这是一个提供以下常量的枚举。 | Python | MilvusClient"
type: docx
token: IU0idURLBoJNlZxgkiUcQaOYnIf
sidebar_position: 19
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionType
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionType

这是一个提供以下常量的枚举。

## 常量\{#constants}

- BM25 = 1

    将函数类型设置为 BM25。这表示 Milvus 将使用 BM25 算法为指定的 VARCHAR 或 TEXT 字段生成稀疏嵌入。

- TEXTEMBEDDING = 2

    将函数类型设置为 TEXTEMBEDDING。这表示 Milvus 将通过自动调用外部模型提供方，把 VARCHAR 或 TEXT 字段中的原始文本数据转换为向量嵌入。

- RERANK = 3

    将函数类型设置为 **RERANK**。这表示 Milvus 将使用排序器对候选结果进行重排序，以提升搜索性能。
