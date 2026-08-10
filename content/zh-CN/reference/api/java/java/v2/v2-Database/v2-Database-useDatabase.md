---
title: "useDatabase() | Java | v2"
slug: /java/java/v2-Database-useDatabase
sidebar_label: "useDatabase()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会更改当前使用的 Database。 | Java | v2"
type: docx
token: LAJHdQKQQoPjmYxcfQgcvjvLnqh
sidebar_position: 7
keywords: 
  - 相似性搜索
  - 多模态 RAG
  - llm 幻觉
  - 混合搜索
  - zilliz
  - zilliz cloud
  - cloud
  - useDatabase()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# useDatabase()

此操作会更改当前使用的 Database。

```java
public void useDatabase(String dbName)
```

## 请求语法\{#request-syntax}

```java
useDatabase(String dbName)
```

**参数**

- **dbName** (*String*) -

    目标 Database 的名称。

**返回值**

*void*

**异常**

- InterruptedException

    当从 Milvus 断开连接期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Switch the client to another database
client.useDatabase("my_database")
```
