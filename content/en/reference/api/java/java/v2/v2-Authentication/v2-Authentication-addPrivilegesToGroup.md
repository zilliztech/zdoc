---
title: "addPrivilegesToGroup() | Java | v2"
slug: /java/java/v2-Authentication-addPrivilegesToGroup
sidebar_label: "addPrivilegesToGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation adds privileges to a specific privilege group. | Java | v2"
type: docx
token: Zk2sduIEOoytTDxSFy0cUxiinpg
sidebar_position: 1
keywords: 
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
  - zilliz
  - zilliz cloud
  - cloud
  - addPrivilegesToGroup()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# addPrivilegesToGroup()

This operation adds privileges to a specific privilege group.

```java
public Void addPrivilegesToGroup(AddPrivilegesToGroupReq request)
```

## Request Syntax\{#request-syntax}

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

    The privileges to be added into the specified privilege groups. For details on possible privileges, refer to [Manage Cluster Roles(SDK)](/docs/cluster-roles-sdk).

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.AddPrivilegesToGroupReq;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. add privileges to group
List<String> privileges = new ArrayList<>();
privileges.add("Query");
privileges.add("Search");

AddPrivilegesToGroupReq addPrivilegesToGroupReq = AddPrivilegesToGroupReq.builder()
        .groupName("read_only")
        .privileges(privileges)
        .build();
        
client.addPrivilegesToGroup(addPrivilegesToGroupReq);
```
