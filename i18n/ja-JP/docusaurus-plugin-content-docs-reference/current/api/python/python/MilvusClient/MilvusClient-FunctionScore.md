---
title: "FunctionScore | Python | MilvusClient"
slug: /python/python/MilvusClient-FunctionScore
sidebar_label: "FunctionScore"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "FunctionScore インスタンスは、複数の Function を設定可能な方法で組み合わせます。FunctionScore インスタンスをランカーとして使用すると、複数の再ランキング Function を組み合わせることができます。 | Python | MilvusClient"
type: docx
token: TXPxdXNMtoKZcRxkirkccYSsnId
sidebar_position: 12
keywords: 
  - スパースベクトル
  - ベクトル次元
  - ANN Search
  - ベクトル埋め込みとは
  - zilliz
  - zilliz cloud
  - cloud
  - FunctionScore
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# FunctionScore

**FunctionScore** インスタンスは、複数の **Function** を設定可能な方法で組み合わせます。**FunctionScore** インスタンスをランカーとして使用すると、複数の再ランキング **Function** を組み合わせることができます。

## リクエスト構文\{#request-syntax}

```python
class pymilvus.FunctionScore
```

**PARAMETERS:**

- **functions** (*[Function](../Collections/Function/Function.md*) -

    次のオプションです。<em>,</em> List[Function]&ast;） - 現在の FunctionScore インスタンスで組み合わせる Function インスタンス、または Function インスタンスのリストです。

- **params** (*Dict*) -

    オプションです。p e。

## Examples\{#examples}

```python
class pymilvus.FunctionScore
```
