---
title: "FunctionType | Cloud"
slug: /cpp/cpp/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "列举 Collection Schema 函数所支持的函数类型。 | Cloud"
type: docx
token: InoydNBt1osec5xj0C6cPCsRnTd
sidebar_position: 37
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionType
  - cppv30
displayed_sidebar: cppSidebar

displayed_sidbar: cppSidebar
---

import Admonition from '@theme/Admonition';


# FunctionType

列举 Collection Schema 函数所支持的函数类型。

## 示例\{#example}

演示如何在 C++ SDK 中使用 FunctionType。

```c++
auto function_type = milvus::FunctionType::BM25;
```

## 说明\{#notes}

- UNKNOWN = 0

- BM25 = 1

- TEXTEMBEDDING = 2

- RERANK = 3

- MINHASH = 4

- MOLFINGERPRINT = 5

