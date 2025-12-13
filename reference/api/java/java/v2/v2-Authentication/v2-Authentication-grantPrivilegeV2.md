---
title: "grantPrivilegeV2() | Java | v2"
slug: /java/java/v2-Authentication-grantPrivilegeV2
sidebar_label: "grantPrivilegeV2()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation grants privileges or privilege groups to a specific role. | Java | v2"
type: docx
token: MFv3drbbXouqVxxE1OicBBl5ndf
sidebar_position: 11
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - grantPrivilegeV2()
  - javaV226
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# grantPrivilegeV2()

This operation grants privileges or privilege groups to a specific role.

```java
public Void grantPrivilegeV2(GrantPrivilegeReqV2 request)
```

## Request Syntax\{#request-syntax}

```java
grantPrivilegeV2(GrantPrivilegeReqV2.builder()
    .roleName(String roleName)
    .privilege(String privilege)
    .dbName(String dbName)
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the target role.

- `privilege(String privilege)`

    The privilege or privilege group to be granted to the specified role. For details on possible privileges, refer to [Privileges](/docs/cluster-privileges).

- `dbName(String dbName)`

    The target resource database. The specified role has access to the specified privileges within the specified database.

- `collectionName(String collectionName)`

    The target resource collection in the specified database. The specified role has access to the specified privileges within the specified collection.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.rbac.request.GrantPrivilegeReqV2;

// 1. Set up a client
ConnectConfig connectConfig = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .token("YOUR_CLUSTER_TOKEN")
        .build();
        
MilvusClientV2 client = new MilvusClientV2(connectConfig);

// 2. Grant privilege or privilege group
GrantPrivilegeReqV2 grantPrivilegeReqV2 = GrantPrivilegeReqV2.builder()
    .roleName("my_role")
    .privilege("Search")
    .dbName("my_db")
    .collectionName("my_collection")
    .build()
        
client.grantPrivilegeV2(grantPrivilegeReqV2);
```

