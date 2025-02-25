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
sidebar_position: 12
keywords: 
  - image similarity search
  - Context Window
  - Natural language search
  - Similarity Search
  - zilliz
  - zilliz cloud
  - cloud
  - revokeRole()
  - javaV225
  - Zilliz Cloud
  - what is milvus
  - milvus database
  - milvus lite
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
RevokeRoleReq revokeRoleReq = RevokeRoleReq.builder()
        .roleName("db_ro")
        .userName("test")
        .build();
client.revokeRole(revokeRoleReq);
```

