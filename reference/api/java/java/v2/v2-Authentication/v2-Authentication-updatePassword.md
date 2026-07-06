---
title: "updatePassword() | Java | v2"
slug: /java/java/v2-Authentication-updatePassword
sidebar_label: "updatePassword()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation updates a user password and can also update the user description. | Java | v2"
type: docx
token: AnuCd3jgDojhA8x2kNFcddCynLh
sidebar_position: 20
keywords: 
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - zilliz
  - zilliz cloud
  - cloud
  - updatePassword()
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# updatePassword()

This operation updates a user password and can also update the user description.

```java
public void updatePassword(UpdatePasswordReq request)
```

## Request Syntax\{#request-syntax}

```java
client.updatePassword(UpdatePasswordReq.builder()
    .userName(String userName)
    .password(String password)
    .newPassword(String newPassword)
    .resetConnection(Boolean resetConnection)
    .description(String description)
    .build()
);
```

**BUILDER METHODS:**

- `userName(String userName)`

    **[REQUIRED]**

    The name of the user to update.

- `password(String password)`

    The current password of the user. Provide this together with `newPassword` when changing the password.

- `newPassword(String newPassword)`

    The new password for the user. Provide this together with `password` when changing the password.

- `resetConnection(Boolean resetConnection)`

    Whether to reset the current client connection after the password is updated. Defaults to `false`.

- `description(String description)`

    An optional new description of the user. Defaults to an empty string.

**RETURNS:**

*void*

This operation returns no value.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.UpdatePasswordReq;

client.updatePassword(UpdatePasswordReq.builder()
    .userName("analyst_user")
    .password("P@ssw0rd!")
    .newPassword("N3wP@ssw0rd!")
    .resetConnection(true)
    .description("Read-only analyst account")
    .build());
```
