---
title: "createRole() | Java | v2"
slug: /java/java/v2-Authentication-createRole
sidebar_key: java/v2-Authentication-createRole
sidebar_label: "createRole()"
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a role and optionally stores a description for that role. | Java | v2"
type: docx
token: IzfldHDU4o8dDRx377ecqJmlnSf
sidebar_position: 3
keywords: 
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
  - zilliz
  - zilliz cloud
  - cloud
  - createRole()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createRole()

This operation creates a role and optionally stores a description for that role.

```java
public void createRole(CreateRoleReq request)
```

## Request Syntax\{#request-syntax}

```java
client.createRole(CreateRoleReq.builder()
    .roleName(String roleName)
    .description(String description)
    .build()
);
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    **[REQUIRED]**

    The name of the role to create.

- `description(String description)`

    An optional description of the role. Defaults to an empty string.

**RETURNS:**

*void*

This operation returns no value.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.CreateRoleReq;

client.createRole(CreateRoleReq.builder()
    .roleName("analytics_reader")
    .description("Grants read-only access to analytics collections")
    .build());
```
