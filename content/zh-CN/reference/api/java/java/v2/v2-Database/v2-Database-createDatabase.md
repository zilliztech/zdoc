---
title: "createDatabase() | Java | v2"
slug: /java/java/v2-Database-createDatabase
sidebar_label: "createDatabase()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作使用指定名称创建一个 Database。 | Java | v2"
type: docx
token: LirKdHD5lomrfSxXrZzcOAWpnMf
sidebar_position: 2
keywords: 
  - 信息检索
  - 降维
  - hnsw 算法
  - 向量相似性搜索
  - zilliz
  - zilliz cloud
  - 云
  - createDatabase()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createDatabase()

此操作使用指定名称创建一个 Database。

```java
public void createDatabase(CreateDatabaseReq request)
```

## Request Syntax\{#request-syntax}

```java
createDatabase(CreateDatabaseReq.builder()
    .databaseName(String databaseName)
    .properties(Map<String, String> properties)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    要创建的 Database 的名称。

- `properties(Map<String, String> properties)`

    Database 的属性，例如副本数量和资源组。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时都会引发此异常。

## Example\{#example}

```java
import io.milvus.param.Constant;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.CreateDatabaseReq;
import java.util.HashMap;
import java.util.Map;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a database
Map<String, String> properties = new HashMap<>();
properties.put(Constant.DATABASE_REPLICA_NUMBER, "2");
CreateDatabaseReq createDatabaseReq = CreateDatabaseReq.builder()
        .databaseName(databaseName)
        .properties(properties)
        .build();
client.createDatabase(createDatabaseReq);
```
