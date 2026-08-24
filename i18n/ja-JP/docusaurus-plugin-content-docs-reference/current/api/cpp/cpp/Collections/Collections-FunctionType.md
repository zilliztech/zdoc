---
title: "FunctionType | Cloud"
slug: /cpp/cpp/Collections-FunctionType
sidebar_label: "FunctionType"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "コレクションスキーマの関数でサポートされる関数タイプを列挙します。 | Cloud"
type: docx
token: InoydNBt1osec5xj0C6cPCsRnTd
sidebar_position: 37
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense ベクトル
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

コレクションスキーマの関数でサポートされる関数タイプを列挙します。

## 例\{#example}

C++ SDK を使用した FunctionType の例を示します。

```c++
auto function_type = milvus::FunctionType::BM25;
```

## 備考\{#notes}

- UNKNOWN = 0

- BM25 = 1

- TEXTEMBEDDING = 2

- RERANK = 3

- MINHASH = 4

- MOLFINGERPRINT = 5

