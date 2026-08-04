---
title: "addCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-addCollectionFunction
sidebar_label: "addCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "向现有集合添加函数定义。在 Milvus 3.0 中，当需要同时添加函数输出字段及其索引时，请使用 `addFunctionField()`。 | Java | v2"
type: docx
token: Qbvcd9DG1ofMpuxVdEqcToU1nIb
sidebar_position: 30
keywords: 
  - sentence transformers
  - Recommender systems
  - information retrieval
  - dimension reduction
  - zilliz
  - zilliz cloud
  - cloud
  - addCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addCollectionFunction()

向现有集合添加函数定义。在 Milvus 3.0 中，当需要同时添加函数输出字段及其索引时，请使用 [`addFunctionField()`](./v2-Collections-addFunctionField)。

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

**BUILDER 方法：**

- `collectionName(String collectionName)`

    目标集合的名称。

- `databaseName(String databaseName)`

    数据库名称。省略时默认使用当前数据库。

- `function(CreateCollectionReq.Function function)`

    要添加到现有集合字段中的函数定义。

**返回：**

*void*

此操作不返回任何值。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时抛出。请检查异常消息以获取确切的失败原因。

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
