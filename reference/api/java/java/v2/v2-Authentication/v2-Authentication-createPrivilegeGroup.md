---
displayed_sidbar: javaSidebar
title: "createPrivilegeGroup() | Java | v2"
slug: /java/java/v2-Authentication-createPrivilegeGroup
sidebar_label: "createPrivilegeGroup()"
beta: false
notebook: false
description: "This operation creates a privilege group. | Java | v2"
type: docx
token: MF3tdne4DoEiC0xlAe0ctyxHn9g
sidebar_position: 2
keywords: 
  - AI chatbots
  - cosine distance
  - what is a vector database
  - vectordb
  - zilliz
  - zilliz cloud
  - cloud
  - createPrivilegeGroup()
  - javaV225
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createPrivilegeGroup()

This operation creates a privilege group.

```java
public Void createPrivilegeGroup(CreatePrivilegeGroupReq request)
```

## Request Syntax{#request-syntax}

```java
createPrivilegeGroup(CreatePrivilegeGroupReq.builder()
    .groupName(String groupName)
    .build()
)
```

**BUILDER METHODS:**

- `groupName(String groupName)`

    The name of the privilege group to create.

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

// 2. Create a privilege group
CreatePrivilegeGroupReq createPrivilegeGroupReq = CreatePrivilegeGroupReq.builder()
        .groupName("read_only")
        .build();
        
client.createPrivilegeGroup(createPrivilegeGroupReq);
```

