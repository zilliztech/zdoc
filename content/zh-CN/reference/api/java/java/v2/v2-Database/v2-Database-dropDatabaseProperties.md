---
title: "dropDatabaseProperties() | Java | v2"
slug: /java/java/v2-Database-dropDatabaseProperties
sidebar_label: "dropDatabaseProperties()"
beta: false
added_since: v2.4.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "此操作会将数据库属性重置为其默认值。 | Java | v2"
type: docx
token: HSYzdg59FoBzeIxymrLc0EbBnyd
sidebar_position: 5
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabaseProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabaseProperties()

此操作会将数据库属性重置为其默认值。

```java
public void dropDatabaseProperties(DropDatabasePropertiesReq request)
```

## 请求语法\{#request-syntax}

```java
dropDatabaseProperties(DropDatabasePropertiesReq.builder()
    .databaseName(String databaseName)
    .propertyKeys(List<String> propertyKeys)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    数据库名称。如果未指定，则默认为当前数据库。

- `propertyKeys(List<String> propertyKeys)` -

    要删除的属性键名称列表。

**返回：**

*void*

*void*

**异常：**

- **MilvusClientException**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.DropDatabasePropertiesReq;

// 1. 设置客户端
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. 删除数据库属性
List<String> propertyKeys = new ArrayList<>();
propertyKeys.add("database.replica.number");

DropDatabasePropertiesReq dropDatabasePropertiesReq = DropDatabasePropertiesReq.builder()
        .databaseName(databaseName)
        .propertyKeys(propertyKeys)
        .build();
client.dropDatabaseProperties(alterDatabaseReq);
```
