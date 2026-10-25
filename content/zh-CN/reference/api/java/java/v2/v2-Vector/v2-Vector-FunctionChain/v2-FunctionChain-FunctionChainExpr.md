---
title: "FunctionChainExpr | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionChainExpr
sidebar_label: "FunctionChainExpr"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionChainExpr 实例是一种函数调用表达式，供函数链操作使用，例如 `numcombine`、`decay` 或 `rounddecimal`。 | Java | v2"
type: docx
token: RyvBdUjTKo2sF4xtwoRc2FNbn3d
sidebar_position: 3
keywords: 
  - 视频搜索
  - AI 智能体
  - AI 幻觉
  - 语义搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - FunctionChainExpr
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# FunctionChainExpr

FunctionChainExpr 实例是一种函数调用表达式，供函数链操作使用，例如 `num_combine`、`decay` 或 `round_decimal`。

```java
io.milvus.v2.service.vector.request.FunctionChainExpr
```

## 构造函数\{#constructor}

此构建器会创建一个具有名称、参数和命名参数的函数表达式。

```java
FunctionChainExpr.builder()
    .name(String name)
    .arg(FunctionChainArg arg)
    .param(String key, Object value)
    .build()
```

**构建器方法：**

- `name(String name)`

    表达式名称，例如 `"num_combine"`。

- `arg(FunctionChainArg arg)`

    追加一个参数，该参数可以是列引用或字面量。

- `param(String key, Object value)`

    设置表达式的命名参数。

**返回类型：**

*FunctionChainExpr*

**返回：**

一个 **FunctionChainExpr** 实例。

**参数：**

- **name** （*String*） -

    表达式名称，例如 `"num_combine"`。

- **args** （*List&lt;FunctionChainArg&gt;*） -

    表达式的参数，其中每个参数都是一个 **FunctionChainArg** 对象。

- **params** （*Map&lt;String, FunctionParamValue&gt;*） -

    表达式的命名参数，每个值都是一个 **FunctionParamValue** 对象。

**方法：**

- `String getName()`

    返回表达式名称。

- `List<FunctionChainArg> getArgs()`

    返回表达式的参数。

- `Map<String, FunctionParamValue> getParams()`

    返回表达式的命名参数。

## 示例\{#example}

```java
FunctionChainExpr expr = FunctionChainExpr.builder()
        .name("num_combine")
        .arg(FunctionChainArg.col("$score"))
        .arg(FunctionChainArg.col("freshness"))
        .param("mode", "weighted")
        .build();
```
