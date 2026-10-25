---
title: "getFunctionList() | Java | v2"
slug: /java/java/v2-CollectionSchema-getFunctionList
sidebar_label: "getFunctionList()"
beta: false
added_since: v2.6.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作返回 Collection Schema 中定义的函数列表。 | Java | v2"
type: docx
token: UJg8dnXiUoB6FnxanBicIzcLnsb
sidebar_position: 6
keywords: 
  - Embedding 模型
  - 图像相似度搜索
  - 上下文窗口
  - 自然语言搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - getFunctionList()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getFunctionList()

此操作返回 Collection Schema 中定义的函数列表。

```java
public List<CreateCollectionReq.Function> getFunctionList()
```

**返回类型：**

*List&lt;CreateCollectionReq.Function&gt;*

**返回：**

**CreateCollectionReq.Function** 对象的列表。每个 **CreateCollectionReq.Function** 对象包含以下字段：

**参数：**

- **name**（*String*） -

    函数的名称。此标识符用于在查询和 Collection 中引用该函数。该值默认为空字符串。

- **description**（*String*） -

    关于函数用途的简要说明。该值默认为空字符串。

- **functionType**（*FunctionType*） -

    函数的类型。例如，`FunctionType.BM25` 使用 BM25 算法从 `VARCHAR` 字段生成稀疏向量嵌入。

- **inputFieldNames**（*List&lt;String&gt;*） -

    包含需要转换为向量表示的原始数据的字段名称。对于使用 `FunctionType.BM25` 的函数，此列表仅接受一个字段名称。

- **outputFieldNames**（*List&lt;String&gt;*） -

    用于存储所生成输出的字段名称。该列表应对应 Collection Schema 中定义的向量字段。对于使用 `FunctionType.BM25` 的函数，此列表仅接受一个字段名称。

- **params**（*Map&lt;String, String&gt;*） -

    传递给服务器的函数专属参数，例如 BM25 函数的 Analyzer 参数。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
CollectionSchema schema = CollectionSchema.builder().build();
List<CreateCollectionReq.Function> functions = schema.getFunctionList();
```
