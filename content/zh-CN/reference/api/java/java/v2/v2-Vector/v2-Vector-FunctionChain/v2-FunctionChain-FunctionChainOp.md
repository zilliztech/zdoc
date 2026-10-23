---
title: "FunctionChainOp | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainOp
sidebar_label: "FunctionChainOp"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainOp 实例是函数链管道中的单个操作，例如 `map`、`sort` 或 `limit`。 | Java | v2"
type: docx
token: A6jodK8uxonu3Gx8pS6ccsJtnte
sidebar_position: 4
keywords: 
  - Milvus 基准测试
  - 托管版 Milvus
  - Serverless 向量 Database
  - Milvus 开源
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionChainOp
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionChainOp

FunctionChainOp 实例是函数链管道中的单个操作，例如 `map`、`sort` 或 `limit`。

```java
io.milvus.v2.service.vector.request.FunctionChainOp
```

## 常量\{#constants}

- `String OP_MAP` — `"map"` 操作名称。

- `String OP_SORT` — `"sort"` 操作名称。

- `String OP_LIMIT` — `"limit"` 操作名称。

## 构造函数\{#constructor}

此构建器会创建一个函数链操作，其中包含可选的表达式、输入、输出和参数。

```java
FunctionChainOp.builder()
    .op(String op)
    .expr(FunctionChainExpr expr)
    .inputs(List<String> inputs)
    .outputs(List<String> outputs)
    .params(Map<String, FunctionParamValue> params)
    .build()
```

**构建器方法：**

- `op(String op)`

    操作名称，例如 `"map"`、`"sort"`、`"limit"`。

- `expr(FunctionChainExpr expr)`

    附加到此操作的函数表达式。

- `inputs(List<String> inputs)`

    此操作的输入列。

- `outputs(List<String> outputs)`

    此操作的输出列。

- `params(Map<String, FunctionParamValue> params)`

    此操作的命名参数。

**返回类型：**

*FunctionChainOp*

**返回：**

一个 **FunctionChainOp** 实例。

**参数：**

- **op** （*String*） -

    服务器可识别的操作名称，例如 `"map"`、`"sort"`、`"limit"`。

- **expr** （*FunctionChainExpr*） -

    附加到此操作的函数表达式；如果该操作没有函数表达式，则为 `null`。

- **inputs** （*List&lt;String&gt;*） -

    此操作使用的输入列。

- **outputs** （*List&lt;String&gt;*） -

    此操作生成的输出列。

- **params** （*Map&lt;String, FunctionParamValue&gt;*） -

    此操作的命名参数，每个值都是一个 **FunctionParamValue** 对象。

**方法：**

- `String getOp()`

    返回操作名称。

- `FunctionChainExpr getExpr()`

    返回附加的函数表达式。

- `List<String> getInputs()`

    返回此操作的输入列。

- `List<String> getOutputs()`

    返回此操作的输出列。

- `Map<String, FunctionParamValue> getParams()`

    返回此操作的命名参数。

## 示例\{#example}

```java
FunctionChainOp op = FunctionChainOp.builder()
        .op(FunctionChainOp.OP_SORT)
        .inputs(Collections.singletonList("$score"))
        .build();
```
