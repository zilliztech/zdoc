---
displayed_sidbar: javaSidebar
title: "dropPrivilegeGroup() | Java | v2"
slug: /java/java/v2-Authentication-dropPrivilegeGroup
sidebar_label: "dropPrivilegeGroup()"
beta: false
notebook: false
description: "This operation creates a privilege group. | Java | v2"
type: docx
token: CIYQd12MNoiC4QxW97mcQLWYnYd
sidebar_position: 7
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - dropPrivilegeGroup()
  - javaV225
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropPrivilegeGroup()

This operation creates a privilege group.

```java
public Void dropPrivilegeGroup(DropPrivilegeGroupReq request)
```

## Request Syntax{#request-syntax}

```java
dropPrivilegeGroup(DropPrivilegeGroupReq.builder()
    .groupName(String groupName)
    .build()
)
```

**BUILDER METHODS:**

- `groupName(String groupName)`

    The name of the privilege group to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
import io.milvus.v2.client.ConnectConfig
import io.milvus.v2.client.MilvusClientV2
import io.milvus.v2.service.rbac.request.CreateRoleReq

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Drop a privilege group
DropPrivilegeGroupReq dropPrivilegeGroupReq = DropPrivilegeGroupReq.builder()
        .groupName("read_only")
        .build();
        
client.dropPrivilegeGroup(dropPrivilegeGroupReq);
```

