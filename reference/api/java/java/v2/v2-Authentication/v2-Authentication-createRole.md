---
displayed_sidbar: javaSidebar
title: "createRole() | Java | v2"
slug: /java/java/v2-Authentication-createRole
sidebar_label: "createRole()"
beta: false
notebook: false
description: "This operation creates a custom role. | Java | v2"
type: docx
token: V0xwdLOrhog7OBxTX76cQGQknSb
sidebar_position: 3
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - createRole()
  - javaV225
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createRole()

This operation creates a custom role.

```java
public void createRole(CreateRoleReq request)
```

## Request Syntax{#request-syntax}

```java
createRole(CreateRoleReq.builder()
    .roleName(String roleName)
    .build()
)
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the role to create.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.CreateRoleReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Create a role
CreateRoleReq createRoleReq = CreateRoleReq.builder()
        .roleName("read_only")
        .build();
        
client.createRole(createRoleReq);
```
