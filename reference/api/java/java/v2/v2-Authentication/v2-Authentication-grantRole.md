---
title: "grantRole() | Java | v2"
slug: /java/java/v2-Authentication-grantRole
sidebar_label: "grantRole()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants a role to a user. | Java | v2"
type: docx
token: JB90dbBNRoz1I2xZY5rcSmJ1nSb
sidebar_position: 12
keywords: 
  - nlp search
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - zilliz
  - zilliz cloud
  - cloud
  - grantRole()
  - javaV226
  - what is vector db
  - what are vector databases
  - vector databases comparison
  - Faiss
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# grantRole()

This operation grants a role to a user.

```java
public void grantRole(GrantRoleReq request)
```

## Request Syntax\{#request-syntax}

```java
grantRole(GrantRoleReq.builder()
    .roleName(String roleName)
    .userName(String userName)
    .build()
)
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the role to assign.

- `userName(String userName)`

    The name of an existing user.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantRoleReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Grant role to a user
GrantRoleReq grantRoleReq = GrantRoleReq.builder()
        .roleName("db_ro")
        .userName("test")
        .build();
client.grantRole(grantRoleReq);
```

