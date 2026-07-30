---
displayed_sidbar: javaSidebar
title: "CreateSchema() | Java | v2"
slug: /java/java/v2-Collections-CreateSchema
sidebar_label: "CreateSchema()"
added_since: v2.5.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a collection schema. | Java | v2"
type: docx
token: DAIfdXKk5oCHeNxOUvCc1KcpnNh
sidebar_position: 24
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - CreateSchema()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# CreateSchema()

This operation creates a collection schema.

```java
public static CreateCollectionReq.CollectionSchema CreateSchema()
```

## Request Syntax

```java
MilvusClientV2.createSchema()
```

**PARAMETERS:**

None

**RETURN TYPE:**

*CreateCollectionReq.CollectionSchema*

**RETURNS:**

A **CreateCollectionReq.CollectionSchema** object.

## Example

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

