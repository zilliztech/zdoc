---
displayed_sidbar: javaSidebar
title: "dropRole() | Java | v2"
slug: /java/java/v2-Authentication-dropRole
sidebar_label: "dropRole()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation drops a custom role. | Java | v2"
type: docx
token: OLVbdsTOAoQwybx7oLPcZE3wnCf
sidebar_position: 8
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - dropRole()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropRole()

This operation drops a custom role.

```java
public void dropRole(DropRoleReq request)
```

## Request Syntax

```java
dropRole(DropRoleReq.builder()
    .roleName(String roleName)
    .build()
)
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the role to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.DropRoleReq;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a role
DropRoleReq dropRoleReq = DropRoleReq.builder()
        .roleName("test")
        .build();
client.dropRole(dropRoleReq);
```
