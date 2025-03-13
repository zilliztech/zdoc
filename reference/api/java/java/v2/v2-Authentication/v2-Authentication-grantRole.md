---
displayed_sidbar: javaSidebar
title: "grantRole() | Java | v2"
slug: /java/java/v2-Authentication-grantRole
sidebar_label: "grantRole()"
beta: false
notebook: false
description: "This operation grants a role to a user. | Java | v2"
type: docx
token: JB90dbBNRoz1I2xZY5rcSmJ1nSb
sidebar_position: 12
keywords: 
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
  - zilliz
  - zilliz cloud
  - cloud
  - grantRole()
  - javaV225
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# grantRole()

This operation grants a role to a user.

```java
public void grantRole(GrantRoleReq request)
```

## Request Syntax{#request-syntax}

```java
grantRole(GrantRoleReq.builder()
    .roleName(String roleName)
    .userName(String userName)
    .build()
)
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    The name of the role to assign.

- `userName(String userName)`

    The name of an existing user.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
GrantRoleReq grantRoleReq = GrantRoleReq.builder()
        .roleName("db_ro")
        .userName("test")
        .build();
client.grantRole(grantRoleReq);
```

