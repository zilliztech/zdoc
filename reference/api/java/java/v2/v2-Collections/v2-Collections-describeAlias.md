---
title: "describeAlias() | Java | v2"
slug: /java/java/v2-Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation displays the details of an alias. | Java | v2"
type: docx
token: RWaHdvzdvoxGdbxj44cc5SmBnzd
sidebar_position: 11
keywords: 
  - Deep Learning
  - Knowledge base
  - natural language processing
  - AI chatbots
  - zilliz
  - zilliz cloud
  - cloud
  - describeAlias()
  - javaV226
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# describeAlias()

This operation displays the details of an alias.

```java
public DescribeAliasResp describeAlias(DescribeAliasReq request)
```

## Request Syntax\{#request-syntax}

```java
describeAlias(DescribeAliasReq.builder()
    .databaseName(String databaseName)
    .collection(String collectionName)
    .alias(String alias)
    .build()
)
```

**BUILDER METHODS:**

- `databaseName(String databaseName)`

    The name of the database to which the target collection belongs.

- `collectionName(String collectionName)`

    The name of the target collection of this operation.

- `alias(String alias)`

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

**RETURN TYPE:**

*DescribeAliasResp*

**RETURNS:**

A **DescribeAliasResp** object containing the alias details.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.utility.request.DescribeAliasReq;
import io.milvus.v2.service.utility.response.DescribeAliasResp;

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

