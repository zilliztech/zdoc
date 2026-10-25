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
  - 图像搜索
  - 大语言模型
  - zilliz
  - zilliz cloud
  - 云
  - addFunction()
  - javaV230
displayed_sidebar: javaSidebar

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

    用于处理原始数据的函数类型。可选值：

    - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

- `name(String name)`

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。

- `inputFieldNames(List<String> inputFieldNames)`

    包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- `outputFieldNames(List<String> outputFieldNames)`

    用于存储所生成嵌入的字段名称。该字段应对应 Collection Schema 中定义的向量字段。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- `description(String description)`

    对函数用途的简要说明。这有助于文档记录或提升大型项目中的清晰度，并且默认为空字符串。

**返回类型：**

*Function*

**返回值：**

一个 `Function` 对象

**Function** 对象包含以下字段：

**参数：**

- **name** （*String*） -

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。该值默认为空字符串。

- **description** （*String*） -

    对函数用途的简要说明。该值默认为空字符串。

- **functionType** （*FunctionType*） -

    函数的类型。例如，`FunctionType.BM25` 使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

- **inputFieldNames** （*List&lt;String&gt;*） -

    包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- **outputFieldNames** （*List&lt;String&gt;*） -

    用于存储所生成输出的字段名称。该字段应对应 Collection Schema 中定义的向量字段。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- **params** （*Map&lt;String, String&gt;*） -

    传递给服务器的函数专属参数，例如 BM25 函数的 Analyzer 参数。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

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
