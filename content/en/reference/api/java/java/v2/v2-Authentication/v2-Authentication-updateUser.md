---
title: "updateUser() | Java | v2"
slug: /java/java/v2-Authentication-updateUser
sidebar_label: "updateUser()"
beta: false
added_since: v3.0.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates the description of an existing user without changing the user password. | Java | v2"
type: docx
token: AAudd8xDRoRfNLx6OpgcsfkpnVb
sidebar_position: 22
keywords: 
  - open source vector database
  - Vector index
  - vector database open source
  - open source vector db
  - zilliz
  - zilliz cloud
  - cloud
  - updateUser()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updateUser()

This operation updates the description of an existing user without changing the user password.

```java
public void updateUser(UpdateUserReq request)
```

## Request Syntax\{#request-syntax}

```java
client.updateUser(UpdateUserReq.builder()
    .userName(String userName)
    .description(String description)
    .build()
);
```

**BUILDER METHODS:**

- `userName(String userName)`

    **[REQUIRED]**

    The name of the user to update.

- `description(String description)`

    The new description of the user. Use an empty string to clear the description.

**RETURNS:**

*void*

This operation returns no value.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.UpdateUserReq;

client.updateUser(UpdateUserReq.builder()
    .userName("analyst_user")
    .description("Read-only analyst account")
    .build());
```
