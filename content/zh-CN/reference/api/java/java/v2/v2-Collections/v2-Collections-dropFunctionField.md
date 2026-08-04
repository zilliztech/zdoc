---
title: "dropFunctionField() | Java | v2"
slug: /java/java/v2-Collections-dropFunctionField
sidebar_label: "dropFunctionField()"
beta: false
added_since: v3.0.x
last_modified: false
deprecate_since: false
notebook: false
description: "删除函数及其拥有的输出字段。| Java | v2"
type: docx
token: LUUvdGTqrog0AIxfea7cc9a1nCd
sidebar_position: 40
keywords: 
  - 什么是向量数据库
  - 向量数据库对比
  - Faiss
  - 视频搜索
  - zilliz
  - zilliz cloud
  - cloud
  - dropFunctionField()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropFunctionField()

删除函数及其拥有的输出字段。

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

**BUILDER METHODS：**

- `collectionName(String collectionName)`

    目标集合的名称。

- `databaseName(String databaseName)`

    数据库名称。省略时默认使用当前数据库。

- `functionName(String functionName)`

    要删除其定义及输出字段的函数名称。

**RETURNS：**

*void*

此操作不返回值。

**EXCEPTIONS：**

- **MilvusClientException**

    当请求验证、传输或服务端执行失败时引发。请检查异常消息以获取具体失败原因。

## 示例\{#example}

```java
client.dropFunctionField(DropFunctionFieldReq.builder()
    .collectionName("books")
    .functionName("bm25")
    .build());
```
