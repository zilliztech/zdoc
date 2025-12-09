---
title: "dropUser() | Java | v2"
slug: /java/java/v2-Authentication-dropUser
sidebar_label: "dropUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation drops a user. | Java | v2"
type: docx
token: RFv2dtZ1qoP9XQxJEGqcgLGUnhc
sidebar_position: 9
keywords: 
  - Large language model
  - Vectorization
  - k nearest neighbor algorithm
  - ANNS
  - zilliz
  - zilliz cloud
  - cloud
  - dropUser()
  - javaV226
  - vector database
  - IVF
  - knn
  - Image Search
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# dropUser()

This operation drops a user.

```java
public void dropUser(DropUserReq request)
```

## Request Syntax\{#request-syntax}

```java
dropUser(DropUserReq.builder()
    .userName(String userName)
    .build()
)
```

**BUILDER METHODS:**

- `userName(String userName)`

    The name of the user to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropUserReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a user
DropUserReq dropUserReq = DropUserReq.builder()
        .userName("test")
        .build();
client.dropUser(dropUserReq);
```
