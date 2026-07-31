---
title: "alterDatabaseProperties() | Java | v2"
slug: /java/java/v2-Database-alterDatabaseProperties
sidebar_label: "alterDatabaseProperties()"
beta: false
added_since: v2.4.x
last_modified: v2.4.x
deprecate_since: false
notebook: false
description: "此操作用于更改数据库的属性。 | Java | v2"
type: docx
token: PBYIdLALvoHd0pxwI8Ec4JsTnBX
sidebar_position: 1
keywords: 
  - Machine Learning
  - RAG
  - NLP
  - Neural Network
  - zilliz
  - zilliz cloud
  - cloud
  - alterDatabaseProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabaseProperties()

此操作用于更改数据库的属性。 

```java
public Void alterDatabaseProperties(AlterDatabasePropertiesReq request)
```

## 请求语法\{#request-syntax}

```java
alterDatabaseProperties(AlterDatabasePropertiesReq.builder()
    .databaseName(String databaseName)
    .properties(Map<String, String> properties)
    .build()
)
```

**BUILDER METHODS：**

- `databaseName(String databaseName)`

    数据库名称。

- `properties(Map<String, String> properties)`

    数据库的属性，例如副本数量、资源组。可用的数据库属性如下：

    - **database.replica.number** -

        数据库的副本数量。

    - **database.resource_groups**  -

        专用于该数据库的资源组。

    - **database.diskQuota.mb** -

        分配给数据库的磁盘配额，以兆字节（**MB**）为单位。

    - **database.max.collections** -

        数据库中允许的 collection 最大数量。

    - **database.force.deny.writing** -

        是否拒绝数据库中的所有写操作。

    - **database.force.deny.reading** -

        是否拒绝数据库中的所有读操作。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    当此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.AlterDatabasePropertiesReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Alter database properties
Map<String, String> properties = new HashMap<>();
properties.put("database.replica.number", "1");
AlterDatabasePropertiesReq alterDatabasePropertiesReq = AlterDatabasePropertiesReq.builder()
        .databaseName(databaseName)
        .properties(properties)
        .build();
client.alterDatabaseProperties(alterDatabaseReq);
```

