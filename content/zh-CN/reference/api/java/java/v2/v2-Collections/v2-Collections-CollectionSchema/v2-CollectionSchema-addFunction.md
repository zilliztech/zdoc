---
title: "addFunction() | Java | v2"
slug: /java/java/v2-CollectionSchema-addFunction
sidebar_label: "addFunction()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会添加一个函数，用于将原始数据转换为向量表示。 | Java | v2"
type: docx
token: WI76dwejQosQWcxuhkccHOl7nXf
sidebar_position: 4
keywords: 
  - IVF
  - knn
  - Image Search
  - LLMs
  - zilliz
  - zilliz cloud
  - cloud
  - addFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addFunction()

此操作会添加一个函数，用于将原始数据转换为向量表示。

```java
public CollectionSchema addFunction(Function function)
```

## 请求语法\{#request-syntax}

```java
addFunction(Function.builder()
        .functionType(FunctionType functionType)
        .name(String name)
        .inputFieldNames(List<String> inputFieldNames)
        .outputFieldNames(List<String> outputFieldNames)
        .description(String description)
        .build());
```

**构建器方法：**

- `functionType(FunctionType functionType)`

    用于处理原始数据的函数类型。可能的值包括：

    - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

- `name(String name)`

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。

- `inputFieldNames(List<String> inputFieldNames)`

    包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

- `outputFieldNames(List<String> outputFieldNames)`

    生成的嵌入将存储到的字段名称。该字段应对应于 Collection Schema 中定义的向量字段。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名。

- `description(String description)`

    对函数用途的简要说明。这对于文档编写或在较大型项目中提升清晰度会很有帮助，默认值为空字符串。

**返回类型：**

*Function*

**返回：**

一个 `Function` 对象

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;

import java.util.Collections;

schema.addFunction(Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_bm25_emb")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("vector"))
        .build());
```
