---
title: "alterRole() | Java | v2"
slug: /java/java/v2-Authentication-alterRole
sidebar_label: "alterRole()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates the description of an existing role. | Java | v2"
type: docx
token: Ufpqdh2gaossHmxZ4CacIO0Hnyc
sidebar_position: 21
keywords: 
  - LLMs
  - Machine Learning
  - RAG
  - NLP
  - zilliz
  - zilliz cloud
  - cloud
  - alterRole()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# alterRole()

This operation updates the description of an existing role.

```java
public void alterRole(AlterRoleReq request)
```

## Request Syntax\{#request-syntax}

```java
client.alterRole(AlterRoleReq.builder()
    .roleName(String roleName)
    .description(String description)
    .build()
);
```

**BUILDER METHODS:**

- `roleName(String roleName)`

    **[REQUIRED]**

    The name of the role to update.

- `description(String description)`

    The new description of the role. Use an empty string to clear the description.

**RETURNS:**

*void*

This operation returns no value.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.AlterRoleReq;

client.alterRole(AlterRoleReq.builder()
    .roleName("analytics_reader")
    .description("Grants read-only access to analytics collections")
    .build());
```
