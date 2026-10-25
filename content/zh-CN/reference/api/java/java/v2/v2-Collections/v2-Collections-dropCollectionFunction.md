---
title: "dropCollectionFunction() | Java | v2"
slug: /java/java/v2-Collections-dropCollectionFunction
sidebar_label: "dropCollectionFunction()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作从现有 Collection 中移除函数定义，而不删除其输出字段。使用 `dropFunctionField()` 可同时删除两者。 | Java | v2"
type: docx
token: K0wedJ57uoHCyXxOFtNc673tnuA
sidebar_position: 31
keywords: 
  - Milvus 向量 Database
  - Milvus 数据库
  - Milvus 向量 DB
  - Zilliz Cloud
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropCollectionFunction()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropCollectionFunction()

此操作从现有 Collection 中移除函数定义，而不删除其输出字段。使用 `dropFunctionField()` 可同时删除两者。

```java
public void dropCollectionFunction(DropCollectionFunctionReq request)
```

## 请求语法\{#request-syntax}

```java
DropCollectionFunctionReq.builder()
    .collectionName(collectionName)
    .databaseName(databaseName)
    .functionName(functionName)
    .build();
```

**构建器方法：**

- `collectionName(String collectionName)`

    目标 Collection 的名称。

- `databaseName(String databaseName)`

    Database 的名称。省略时默认为当前 Database。

- `functionName(String functionName)`

    要移除的函数定义名称。

**异常：**

- **MilvusClientException**

    当请求校验、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
client.dropCollectionFunction(DropCollectionFunctionReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
