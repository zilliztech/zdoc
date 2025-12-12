---
title: "createUser() | Java | v2"
slug: /java/java/v2-Authentication-createUser
sidebar_label: "createUser()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates a user. | Java | v2"
type: docx
token: OTMXd9uNWoMwe4xvg70cg49Pnmh
sidebar_position: 4
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - createUser()
  - javaV226
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# createUser()

This operation creates a user.

```java
public void createUser(CreateUserReq request)
```

## Request Syntax\{#request-syntax}

```java
createUser(CreateUserReq.builder()
    .userName(String userName)
    .password(String password)
    .build()
)
```

**BUILDER METHODS:**

- `userName(String roleName)`

    The name of the user to create.

- `password(String password)`

    The password of the user to create.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig
import io.milvus.v2.client.MilvusClientV2
import io.milvus.v2.service.rbac.request.CreateUserReq

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("https://inxx-xxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530")
        .token("user:password")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a role
CreateUserReq createUserReq = CreateUserReq.builder()
        .userName("user_1")
        .password("P@ssw0rd")
        .build();
client.createUser(createUserReq);
```

