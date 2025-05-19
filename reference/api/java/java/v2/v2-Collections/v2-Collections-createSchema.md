---
displayed_sidbar: javaSidebar
title: "createSchema() | Java | v2"
slug: /java/java/v2-Collections-createSchema
sidebar_label: "createSchema()"
beta: false
notebook: false
description: "This operation creates a collection schema. | Java | v2"
type: docx
token: V5KXdwdO0oqkhnxsKb9c3xaKn4c
sidebar_position: 9
keywords: 
  - nn search
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - zilliz
  - zilliz cloud
  - cloud
  - createSchema()
  - javaV225
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createSchema()

This operation creates a collection schema.

```java
public CreateCollectionReq.CollectionSchema createSchema()
```

## Request Syntax{#request-syntax}

```java
MilvusClientV2.createSchema()
```

**PARAMETERS:**

None

**RETURN TYPE:**

*CreateCollectionReq.CollectionSchema*

**RETURNS:**

A **CreateCollectionReq.CollectionSchema** object.

## Example{#example}

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
CreateCollectionReq.CollectionSchema collectionSchema = client.createSchema();
collectionSchema.addField(AddFieldReq.builder().fieldName("id").dataType(DataType.Int64).isPrimaryKey(Boolean.TRUE).autoID(Boolean.FALSE).description("id").build());
collectionSchema.addField(AddFieldReq.builder().fieldName("vector").dataType(DataType.FloatVector).dimension(dim).build());
```
