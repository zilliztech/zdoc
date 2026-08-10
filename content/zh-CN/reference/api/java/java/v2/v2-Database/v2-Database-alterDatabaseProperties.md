---
title: "alterDatabaseProperties() | Java | v2"
slug: /java/java/v2-Database-alterDatabaseProperties
sidebar_label: "alterDatabaseProperties()"
beta: false
added_since: v2.4.x
last_modified: v2.4.x
deprecate_since: false
notebook: false
description: "此操作会更改 Database 的属性。 | Java | v2"
type: docx
token: PBYIdLALvoHd0pxwI8Ec4JsTnBX
sidebar_position: 1
keywords: 
  - 机器学习
  - RAG
  - NLP
  - 神经网络
  - zilliz
  - zilliz cloud
  - 云
  - alterDatabaseProperties()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterDatabaseProperties()

此操作会更改 Database 的属性。 

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

**构建器方法：**

- `databaseName(String databaseName)`

    Database 的名称。

- `properties(Map<String, String> properties)`

    Database 的属性，例如副本数、资源组。支持的 Database 属性如下：

    - **database.replica.number** -

        Database 的副本数量。

    - **database.resource_groups**  -

        专用于该 Database 的资源组。

    - **database.diskQuota.mb** -

        分配给该 Database 的磁盘配额，单位为兆字节（**MB**）。

    - **database.max.collections** -

        该 Database 中允许的 Collection 最大数量。

    - **database.force.deny.writing** -

        是否禁止该 Database 中的所有写入操作。

    - **database.force.deny.reading** -

        是否禁止该 Database 中的所有读取操作。

**返回：**

*void*

**异常：**

- **MilvusClientExceptions**

    此操作过程中发生任何错误时，都会引发此异常。

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

