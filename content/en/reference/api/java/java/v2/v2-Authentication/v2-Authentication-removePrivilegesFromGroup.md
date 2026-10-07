---
title: "removePrivilegesFromGroup() | Java | v2"
slug: /java/java/v2-Authentication-removePrivilegesFromGroup
sidebar_label: "removePrivilegesFromGroup()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation removes privileges from a specific privilege group. | Java | v2"
type: docx
token: PsIEd5UbFoIHIzxkXyCcgKwXnoe
sidebar_position: 16
keywords: 
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - zilliz
  - zilliz cloud
  - cloud
  - removePrivilegesFromGroup()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# removePrivilegesFromGroup()

This operation removes privileges from a specific privilege group.

```java
public Void removePrivilegesFromGroup(RemovePrivilegesFromGroupReq request)
```

## Request Syntax\{#request-syntax}

```java
removePrivilegesFromGroup(RemovePrivilegesFromGroupReq.builder()
    .groupName(String groupName)
    .privileges(List<String> privileges)
    .build()
)
```

**BUILDER METHODS:**

- `groupName(String groupName)`

    The name of the target privilege group.

- `privileges(List<String> privileges)`

    The privileges to be deleted from the specified privilege groups. For details on possible privileges, refer to Grant Privileges or Privilege Group to Roles.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.RemovePrivilegesFromGroupReq;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Remove privileges from a group
List<String> privileges = new ArrayList<>();
privileges.add("Query");
privileges.add("Search");

RemovePrivilegesFromGroupReq removePrivilegesFromGroupReq = RemovePrivilegesFromGroupReq.builder()
        .groupName("read_only")
        .privileges(privileges)
        .build();
        
client.removePrivilegesFromGroup(removePrivilegesFromGroupReq);
```
