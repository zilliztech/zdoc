---
title: "describeAlias() | Java | v2"
slug: /java/java/v2-Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "此操作会显示别名的详细信息。 | Java | v2"
type: docx
token: VStqdo03iougInxoHwMc8SJKnCe
sidebar_position: 10
keywords: 
  - rag 向量 Database
  - 什么是向量 Database
  - 什么是向量 Database
  - 向量 Database 对比
  - zilliz
  - zilliz cloud
  - 云
  - describeAlias()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeAlias()

此操作会显示别名的详细信息。

```java
public DescribeAliasResp describeAlias(DescribeAliasReq request)
```

## 请求语法\{#request-syntax}

```java
describeAlias(DescribeAliasReq.builder()
    .databaseName(String databaseName)
    .alias(String alias)
    .build()
);
```

**构建器方法：**

- `databaseName(String databaseName)` -

    Database 的名称。如果未指定，则默认为当前 Database。

- `alias(String alias)` -

    别名名称。

**返回类型：**

*DescribeAliasResp*

**返回：**

返回包含别名详细信息的 **DescribeAliasResp** 对象。

**参数：**

- **databaseName**（*String*）-

    该别名所属 Database 的名称。

- **collectionName**（*String*）-

    该别名指向的 Collection 的名称。

- **alias**（*String*）-

    别名名称。

**异常：**

- **MilvusClientException**

    此操作期间发生任何错误时，将引发此异常。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.DescribeAliasReq;
import io.milvus.v2.service.utility.response.DescribeAliasResp;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe alias
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
        .databaseName("my_database")
        .collectionName("my_collection")
        .alias("test_alias")
        .build();
DescribeAliasResp describeAliasResp = client.describeAlias(describeAliasReq);
```
