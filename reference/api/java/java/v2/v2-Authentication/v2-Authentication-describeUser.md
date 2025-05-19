---
displayed_sidbar: javaSidebar
title: "describeUser() | Java | v2"
slug: /java/java/v2-Authentication-describeUser
sidebar_label: "describeUser()"
beta: false
notebook: false
description: "This operation describes a specific user. | Java | v2"
type: docx
token: YLQJdvVA8odibAx7mQscYwMVn8g
sidebar_position: 6
keywords: 
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - describeUser()
  - javaV225
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# describeUser()

This operation describes a specific user.

```java
public DescribeUserResp describeUser(DescribeUserReq request)
```

## Request Syntax{#request-syntax}

```java
describeUser(DescribeUserReq.builder()
    .userName(String userName)
    .build()
)
```

**BUILDER METHODS:**

- `userName(String userName)`

    The name of the user to describe.

**RETURN TYPE:**

*DescribeUserResp*

**RETURNS:**

A **DescribeUserResp** object containing the details of the user.

**PARAMETERS:**

- **roles** (*List\<String\>*) -

    A list of role names associated with the user.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DescribeUserReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Describe a user
DescribeUserReq describeUserReq = DescribeUserReq.builder()
        .userName("test")
        .build();
DescribeUserResp describeUserResp = client.describeUser(describeUserReq);
```

