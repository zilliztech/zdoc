---
title: "describeDatabase() | Java | v2"
slug: /java/java/v2-Database-describeDatabase
sidebar_label: "describeDatabase()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作用于获取特定 Database 的详细信息。 | Java | v2"
type: docx
token: MJjHd3uGcoxEYBx0laKcAIKNnhg
sidebar_position: 3
keywords: 
  - 稀疏向量
  - 向量维度
  - ANN 搜索
  - 什么是向量嵌入
  - zilliz
  - zilliz cloud
  - cloud
  - describeDatabase()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeDatabase()

此操作用于获取特定 Database 的详细信息。

```java
public DescribeDatabaseResp describeDatabase(DescribeDatabaseReq request)
```

## 请求语法\{#request-syntax}

```java
describeDatabase(DescribeDatabaseReq.builder()
    .databaseName(String databaseName)
    .build()
)
```

**构建器方法：**

- `databaseName(String databaseName)`

    Database 的名称。

**返回类型**：

*DescribeDatabaseResp*

**返回值：**

包含指定 Database 详细信息的 **DescribeDatabaseResp** 对象。

**异常：**

- **MilvusClientExceptions**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.param.Constant;
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.database.request.DescribeDatabaseReq;
import io.milvus.v2.service.database.response.DescribeDatabaseResp;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe database
DescribeDatabaseResp descResp = client.describeDatabase(DescribeDatabaseReq.builder()
        .databaseName(databaseName)
        .build());
Map<String,String> propertiesResp = descResp.getProperties();
System.out.println(propertiesResp.get(Constant.DATABASE_REPLICA_NUMBER));
```

