---
displayed_sidbar: javaSidebar
title: "addPrivilegesToGroup() | Java | v2"
slug: /java/java/v2-Authentication-addPrivilegesToGroup
sidebar_label: "addPrivilegesToGroup()"
beta: false
notebook: false
description: "This operation adds privileges to a specific privilege group. | Java | v2"
type: docx
token: T9Jqd5JfdoW5Jxxwx1eckCOCn6c
sidebar_position: 1
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - addPrivilegesToGroup()
  - javaV225
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
  - information retrieval
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# addPrivilegesToGroup()

This operation adds privileges to a specific privilege group.

```java
public Void addPrivilegesToGroup(AddPrivilegesToGroupReq request)
```

## Request Syntax{#request-syntax}

```java
addPrivilegesToGroup(AddPrivilegesToGroupReq.builder()
    .groupName(String groupName)
    .privileges(List<String> privileges)
    .build()
)
```

**BUILDER METHODS:**

- `groupName(String groupName)`

    The name of the target privilege group.

- `privileges(List<String> privileges)`

    The privileges to be added into the specified privilege groups. For details on possible privileges, refer to [Privileges](/docs/cluster-privileges).

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

// 2. add privileges to group
List<String> privileges = new ArrayList<>();
privileges.add("Query", "Search")

AddPrivilegesToGroupReq addPrivilegesToGroupReq = AddPrivilegesToGroupReq.builder()
        .groupName("read_only")
        .privileges(privileges)
        .build();
        
client.addPrivilegesToGroup(addPrivilegesToGroupReq);
```

