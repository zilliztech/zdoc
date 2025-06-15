---
displayed_sidbar: javaSidebar
title: "describeAlias() | Java | v2"
slug: /java/java/v2-Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
notebook: false
description: "This operation displays the details of an alias. | Java | v2"
type: docx
token: B57cdiaEkotJQnxl7I9cJqotnPb
sidebar_position: 11
keywords: 
  - milvus database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - zilliz
  - zilliz cloud
  - cloud
  - describeAlias()
  - javaV225
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeAlias()

This operation displays the details of an alias.

```java
public DescribeAliasResp describeAlias(DescribeAliasReq request)
```

## Request Syntax{#request-syntax}

```java
describeAlias(DescribeAliasReq.builder()
    .alias(String alias)
    .build()
)
```

**BUILDER METHODS:**

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

## Example{#example}

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
        .alias("test_alias")
        .build();
DescribeAliasResp describeAliasResp = client.describeAlias(describeAliasReq);
```

