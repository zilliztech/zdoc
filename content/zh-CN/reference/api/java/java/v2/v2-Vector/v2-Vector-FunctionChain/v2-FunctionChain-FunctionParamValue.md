---
title: "FunctionParamValue | Java | v2"
slug: /java/java/v2-FunctionChain-FunctionParamValue
sidebar_label: "FunctionParamValue"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "FunctionParamValue 实例是一种类型化值，用于函数链表达式和操作参数。 | Java | v2"
type: docx
token: HYTwdAVAEo85oqxQPI4ctxErnDh
sidebar_position: 6
keywords: 
  - 视频相似性搜索
  - 向量检索
  - 音频相似性搜索
  - 弹性向量 Database
  - zilliz
  - Zilliz Cloud
  - 云
  - FunctionParamValue
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# FunctionParamValue

FunctionParamValue 实例是一种类型化值，用于函数链表达式和操作参数。

```java
io.milvus.v2.service.vector.request.FunctionParamValue
```

## 方法\{#methods}

- `static FunctionParamValue of(boolean value)`

    创建一个布尔参数值。

- `static FunctionParamValue of(long value)`

    创建一个整数参数值。

- `static FunctionParamValue of(double value)`

    创建一个浮点数参数值。

- `static FunctionParamValue of(String value)`

    创建一个字符串参数值。

- `static FunctionParamValue of(byte[] value)`

    从字节数组创建一个二进制参数值。

- `static FunctionParamValue of(ByteString value)`

    从 protobuf `ByteString` 创建一个二进制参数值。

- `static FunctionParamValue ofArray(List<FunctionParamValue> values)`

    从类型化值列表创建一个数组参数值。

- `static FunctionParamValue ofObject(Map<String, FunctionParamValue> fields)`

    从字段值映射创建一个对象参数值。

- `static FunctionParamValue from(Object value)`

    通过从 Java 对象推断类型来创建一个参数值。

## 示例\{#example}

```java
FunctionChainExpr expr = FunctionChainExpr.builder()
        .name("num_combine")
        .arg(FunctionChainArg.col("$score"))
        .param("weights", Arrays.asList(FunctionParamValue.of(0.7), FunctionParamValue.of(0.3)))
        .build();
```
