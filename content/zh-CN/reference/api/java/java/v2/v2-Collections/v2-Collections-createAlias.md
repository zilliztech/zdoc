---
title: "createAlias() | Java | v2"
slug: /java/java/v2-Collections-createAlias
sidebar_label: "createAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作为现有集合创建别名。 | Java | v2"
type: docx
token: BujpdsEJnozVT4xY3NFczyfrnDe
sidebar_position: 6
keywords: 
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db
  - zilliz
  - zilliz cloud
  - cloud
  - createAlias()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createAlias()

此操作为现有集合创建别名。

```java
public void createAlias(CreateAliasReq request)
```

## 请求语法\{#request-syntax}

```java
createAlias(CreateAliasReq.builder()
    .databaseName(String databaseName)
    .collectionName(String collectionName)
    .alias(String alias)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    数据库名称。如果未指定，则默认使用当前数据库。

- `collectionName(String collectionName)` -

    目标集合的名称。

- `alias(String alias)` -

    别名名称。

**返回：**

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.CreateAliasReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create an alias "test_alias" for collection "test"
CreateAliasReq createAliasReq = CreateAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
client.createAlias(createAliasReq);
```
