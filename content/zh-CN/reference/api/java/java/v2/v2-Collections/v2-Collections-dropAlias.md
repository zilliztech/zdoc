---
title: "dropAlias() | Java | v2"
slug: /java/java/v2-Collections-dropAlias
sidebar_label: "dropAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "此操作会删除指定 Collection 的别名。 | Java | v2"
type: docx
token: ARw0dIb0hojCNbxKkOacs1K7nQf
sidebar_position: 13
keywords: 
  - 机器学习
  - RAG
  - NLP
  - 神经网络
  - zilliz
  - zilliz cloud
  - cloud
  - dropAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropAlias()

此操作会删除指定 Collection 的别名。

```java
public void dropAlias(DropAliasReq request)
```

## 请求语法\{#request-syntax}

```java
dropAlias(DropAliasReq.builder()
    .databaseName(String databaseName)
    .alias(String alias)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    目标别名所属的 Database 名称。

- `alias(String alias)`

    Collection 的别名。

    执行此操作前，请确保该别名已存在。否则将发生异常。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.DropAliasReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop alias "test_alias"
DropAliasReq dropAliasReq = DropAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
client.dropAlias(dropAliasReq);
```
