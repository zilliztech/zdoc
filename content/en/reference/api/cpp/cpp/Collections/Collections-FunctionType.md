---
title: "FunctionType | Cloud"
slug: /cpp/cpp/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "Enumerates the function types supported by collection schema functions. | Cloud"
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

Enumerates the function types supported by collection schema functions.

## Example\{#example}

Demonstrates FunctionType with the C++ SDK.

```c++
auto function_type = milvus::FunctionType::BM25;
```

## Notes\{#notes}

- UNKNOWN = 0

- BM25 = 1

- TEXTEMBEDDING = 2

- RERANK = 3

- MINHASH = 4

- MOLFINGERPRINT = 5

