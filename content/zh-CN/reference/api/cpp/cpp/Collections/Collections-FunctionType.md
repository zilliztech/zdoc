---
title: "FunctionType | Cloud"
slug: /cpp/cpp/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "枚举 Collection Schema 函数支持的功能类型。 | Cloud"
type: docx
token: InoydNBt1osec5xj0C6cPCsRnTd
sidebar_position: 38
keywords: 
  - LLM 评估
  - 稀疏与稠密
  - 稠密向量
  - 分层可导航小世界
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionType
  - cppv30
displayed_sidebar: cppSidebar

---

import Admonition from '@theme/Admonition';


# FunctionType

枚举 Collection Schema 函数支持的功能类型。

## 示例\{#example}

演示如何在 C++ SDK 中使用 FunctionType。

```c++
auto function_type = milvus::FunctionType::BM25;
```

## 注意\{#notes}

- UNKNOWN = 0

- BM25 = 1

- TEXTEMBEDDING = 2

- RERANK = 3

- MINHASH = 4

- MOLFINGERPRINT = 5

