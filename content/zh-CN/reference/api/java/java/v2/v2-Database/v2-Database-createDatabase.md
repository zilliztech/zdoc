---
title: "createDatabase() | Java | v2"
slug: /java/java/v2-Database-createDatabase
sidebar_label: "createDatabase()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作使用名称创建一个 Database。 | Java | v2"
type: docx
token: IqQudFVIKot4mVxWD4xclJymn8g
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

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createDatabase()

此操作使用名称创建一个 Database。 

```java
public void createDatabase(CreateDatabaseReq request)
```

## 请求语法\{#request-syntax}

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

Database 的属性，例如副本数量、资源组。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.param.Constant;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.CreateDatabaseReq;

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

