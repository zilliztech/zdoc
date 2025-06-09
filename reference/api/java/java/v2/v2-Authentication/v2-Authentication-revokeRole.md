---
displayed_sidbar: javaSidebar
title: "revokeRole() | Java | v2"
slug: /java/java/v2-Authentication-revokeRole
sidebar_label: "revokeRole()"
beta: false
notebook: false
description: "This operation revokes the role assigned to a user. | Java | v2"
type: docx
token: Znb7dcNoeobIkkxGLGfcpVfUnIX
sidebar_position: 19
keywords: 
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database
  - zilliz
  - zilliz cloud
  - cloud
  - revokeRole()
  - javaV225
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# revokeRole()

This operation revokes the role assigned to a user.

```java
public void revokeRole(RevokeRoleReq request)
```

## Request Syntax{#request-syntax}

```java
revokeRole(RevokeRoleReq.builder()
    .roleName(String roleName)
    .userName(String userName)
    .build()
)
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the role to revoke.

- `userName(String userName)`

    The name of an existing user.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RevokeRoleReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Revoke a role from a user
RevokeRoleReq revokeRoleReq = RevokeRoleReq.builder()
        .roleName("db_ro")
        .userName("test")
        .build();
client.revokeRole(revokeRoleReq);
```

