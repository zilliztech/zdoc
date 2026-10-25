---
title: "CreateSchema() | Java | v2"
slug: /java/java/v2-Collections-CreateSchema
sidebar_label: "CreateSchema()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "此操作会创建 Collection Schema。 | Java | v2"
type: docx
token: DAIfdXKk5oCHeNxOUvCc1KcpnNh
sidebar_position: 21
keywords: 
  - 语义搜索
  - 异常检测
  - sentence transformers
  - 推荐系统
  - Zilliz
  - Zilliz Cloud
  - 云
  - CreateSchema()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# CreateSchema()

此操作会创建 Collection Schema。

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

**返回值：**

一个 **CreateCollectionReq.CollectionSchema** 对象。

**CreateCollectionReq.CollectionSchema** 对象包含以下字段：

**参数：**

- **fieldSchemaList**（*List&lt;CreateCollectionReq.FieldSchema&gt;*）-

    用于定义 Collection Schema 中常规字段的 **FieldSchema** 对象列表。

- **structFields**（*List&lt;CreateCollectionReq.StructFieldSchema&gt;*）-

    用于定义 Collection Schema 中结构体字段（嵌套对象字段）的 **StructFieldSchema** 对象列表。

- **enableDynamicField**（*boolean*）-

    是否启用隐藏的动态字段（`$meta`），以便插入操作可以在声明的 Schema 之外携带任意键值属性。默认值：`false`。

- **functionList**（*List&lt;CreateCollectionReq.Function&gt;*）-

    附加到 Schema 的函数（例如 BM25、JSON 路径提取），这些函数在插入时从现有字段派生值。

- **externalSource**（*String*）-

    绑定到此 Collection 的外部源名称（例如 S3 存储桶或 Lakehouse 表）。默认值为空字符串。

- **externalSpec**（*JsonObject*）-

    外部源的规范，通常为描述连接详细信息和刷新策略的 JSON。

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
