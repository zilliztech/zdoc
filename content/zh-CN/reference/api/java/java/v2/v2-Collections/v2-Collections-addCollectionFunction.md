---
title: "addCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "向现有 Collection 添加函数定义。在 Milvus 3.0 中，当需要同时添加函数输出字段及其索引时，请使用 `addFunctionField()`。 | Java | v2"
type: docx
token: Qbvcd9DG1ofMpuxVdEqcToU1nIb
sidebar_position: 30
keywords: 
  - 句子转换器
  - 推荐系统
  - 信息检索
  - 降维
  - zilliz
  - zilliz cloud
  - 云
  - addCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionFunction()

向现有 Collection 添加函数定义。在 Milvus 3.0 中，当需要同时添加函数输出字段及其索引时，请使用 [`addFunctionField()`](./v2-Collections-addFunctionField)。

```java
public void addCollectionFunction(AddCollectionFunctionReq request)
```

## 请求语法\{#request-syntax}

```java
AddCollectionFunctionReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .function(function)
    .build();
```

**构建器方法：**

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `databaseName(String databaseName)`

    Database 的名称。省略时默认使用当前 Database。

- `function(CreateCollectionReq.Function function)`

    要添加到现有 Collection 字段中的函数定义。

**返回：**

*void*

此操作不返回任何值。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
CreateCollectionReq.Function bm25Function = CreateCollectionReq.Function.builder()
    .name("bm25")
    .functionType(FunctionType.BM25)
    .inputFieldNames(Collections.singletonList("text"))
    .outputFieldNames(Collections.singletonList("sparse"))
    .build();

client.addCollectionFunction(AddCollectionFunctionReq.builder()
    .collectionName("books")
    .function(bm25Function)
    .build());
```
