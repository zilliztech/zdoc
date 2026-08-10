---
title: "CreateSchema() | Java | v2"
slug: /java/java/v2-Collections-CreateSchema
sidebar_label: "CreateSchema()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作创建 Collection Schema。 | Java | v2"
type: docx
token: DAIfdXKk5oCHeNxOUvCc1KcpnNh
sidebar_position: 24
keywords: 
  - 语义搜索
  - 异常检测
  - 句子转换器
  - 推荐系统
  - zilliz
  - zilliz cloud
  - 云
  - CreateSchema()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# CreateSchema()

此操作创建 Collection Schema。

```java
public static CreateCollectionReq.CollectionSchema CreateSchema()
```

## 请求语法\{#request-syntax}

```java
MilvusClientV2.createSchema()
```

**参数：**

无

**返回类型：**

*CreateCollectionReq.CollectionSchema*

**返回：**

一个 **CreateCollectionReq.CollectionSchema** 对象。

## 示例\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2 Quickly create a collectionSchema
CreateCollectionReq.CollectionSchema collectionSchema = client.CreateSchema();
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(dim).build());
```

