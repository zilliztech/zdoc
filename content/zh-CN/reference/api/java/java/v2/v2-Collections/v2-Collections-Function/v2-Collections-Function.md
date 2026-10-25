---
title: "Function | Java | v2"
slug: /java/java/v2-Collections-Function
sidebar_label: "Function"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Function 实例用于根据用户提供的原始数据生成向量嵌入，或为搜索配置重排器。 | Java | v2"
type: docx
token: FktXdVmoQoR9pcxSzlgcp3Iknjh
sidebar_position: 1
keywords: 
  - RAG
  - NLP
  - 神经网络
  - 深度学习
  - Zilliz
  - Zilliz Cloud
  - 云
  - Function
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# Function

Function 实例用于根据用户提供的原始数据生成向量嵌入，或为搜索配置重排器。

```java
io.milvus.v2.service.collection.request.CreateCollectionReq.Function
```

## 构造函数\{#constructor}

此构造函数会初始化一个新的 `Function` 实例，用于将用户的原始数据转换为向量嵌入，或为搜索配置重排器。这一过程通过自动化流程实现，可简化相似性搜索操作。

```java
CreateCollectionReq.Function.builder()
    .name(String name)
    .description(String description)
    .functionType(FunctionType functionType)
    .inputFieldNames(List<String> inputFieldNames)
    .outputFieldNames(List<String> outputFieldNames)
    .params(Map<String, String> params)
    .build()
```

**构建器方法：**

- `name(String name)`

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。

- `description(String description)`

    函数用途的简要说明。此说明有助于文档编写或在大型项目中保持清晰，该值默认为空字符串。

- `functionType(FunctionType functionType)`

    用于处理原始数据的函数类型。可选值：

    - `FunctionType.BM25`：使用 BM25 算法从 `VARCHAR` 字段生成稀疏嵌入。

- `inputFieldNames(List<String> inputFieldNames)`

    包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- `outputFieldNames(List<String> outputFieldNames)`

    用于存储生成的嵌入的字段名称。此字段应对应 Collection Schema 中定义的向量字段。对于使用 `FunctionType.BM25` 的函数，此参数仅接受一个字段名称。

- `params(Map<String, String> params)`

    一组用于配置函数属性的键值对。

**返回类型：**

*Function*

**返回：**

一个可注册到 Milvus Collection 的 `Function` 对象，可在数据插入期间自动生成嵌入。

**参数：**

- **name**（*String*） -

    函数的名称，用于在查询和 Collection 中引用该函数。

- **description**（*String*） -

    函数用途的简要说明。该值默认为空字符串。

- **functionType**（*FunctionType*） -

    用于处理原始数据的函数类型，例如 `FunctionType.BM25`。

- **inputFieldNames**（*List&lt;String&gt;*） -

    包含要转换为向量表示的原始数据的字段的名称。

- **outputFieldNames**（*List&lt;String&gt;*） -

    存储生成的嵌入的向量字段的名称。

- **params**（*Map&lt;String, String&gt;*） -

    用于配置函数属性的键值对。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

import java.util.Collections;

CreateCollectionReq.Function function = CreateCollectionReq.Function.builder()
    .functionType(FunctionType.BM25)
    .name("text_bm25_emb")
    .inputFieldNames(Collections.singletonList("text"))
    .outputFieldNames(Collections.singletonList("vector"))
    .build();
```
