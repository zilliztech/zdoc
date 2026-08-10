---
title: "dropFunctionField() | Java | v2"
slug: /java/java/v2-Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "删除一个函数及该函数拥有的输出字段。 | Java | v2"
type: docx
token: LUUvdGTqrog0AIxfea7cc9a1nCd
sidebar_position: 40
keywords: 
  - 什么是向量 Database
  - 向量 Database 对比
  - Faiss
  - 视频搜索
  - Zilliz
  - Zilliz Cloud
  - 云
  - dropFunctionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropFunctionField()

删除一个函数及该函数拥有的输出字段。

```java
public void dropFunctionField(DropFunctionFieldReq request)
```

## 请求语法\{#request-syntax}

```java
DropFunctionFieldReq.builder()
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

    要删除其定义和输出字段的函数名称。

**返回：**

*void*

此操作不返回值。

**异常：**

- **MilvusClientException**

    当请求验证、传输或服务器执行失败时引发。请检查异常消息以获取确切的失败原因。

## 示例\{#example}

```java
client.dropFunctionField(DropFunctionFieldReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
