---
title: "FunctionChainArg | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainArg
sidebar_label: "FunctionChainArg"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainArg 实例是函数链表达式中的单个参数：可以是列引用或字面量值。 | Java | v2"
type: docx
token: RoiCd1E9QosTydxlBr9cURj5nne
sidebar_position: 2
keywords: 
  - 最近邻搜索
  - Agentic RAG
  - RAG LLM 架构
  - 私有 LLM
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionChainArg
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# FunctionChainArg

FunctionChainArg 实例是函数链表达式中的单个参数：可以是列引用或字面量值。

```java
io.milvus.v2.service.vector.request.FunctionChainArg
```

## 方法\{#methods}

- `static FunctionChainArg col(String name)`

    为给定字段名创建列引用参数。

- `static FunctionChainArg literal(Object value)`

    创建字面量值参数。

- `boolean isColumn()`

    如果此参数为列引用，则返回 `true`。

- `String getColumnName()`

    当此参数为列引用时，返回列名。

- `FunctionParamValue getLiteral()`

    当此参数为字面量时，返回字面量值。

## 示例\{#example}

```java
FunctionChainArg arg = FunctionChainArg.col("$score");
FunctionChainArg literal = FunctionChainArg.literal(0.7);
```
