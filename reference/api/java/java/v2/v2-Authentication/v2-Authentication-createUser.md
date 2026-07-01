---
title: "createUser() | Java | v2"
slug: /java/java/v2-Authentication-createUser
sidebar_key: java/v2-Authentication-createUser
sidebar_label: "createUser()"
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
beta: false
notebook: false
description: "This operation creates a user and optionally stores a description for that user. | Java | v2"
type: docx
token: DMr4dKSItoNvtYx2XFscQA8RnWf
sidebar_position: 4
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - createUser()
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createUser()

This operation creates a user and optionally stores a description for that user.

```java
public void createUser(CreateUserReq request)
```

## Request Syntax\{#request-syntax}

```java
client.createUser(CreateUserReq.builder()
    .userName(String userName)
    .password(String password)
    .description(String description)
    .build()
);
```

**BUILDER METHODS:**

- `userName(String userName)`

    **[REQUIRED]**

    The name of the user to create.

- `password(String password)`

    **[REQUIRED]**

    The password for the user.

- `description(String description)`

    An optional description of the user. Defaults to an empty string.

**RETURNS:**

*void*

This operation returns no value.

**EXCEPTIONS:**

- **MilvusClientException**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```java
import io.milvus.v2.service.rbac.request.CreateUserReq;

client.createUser(CreateUserReq.builder()
    .userName("analyst_user")
    .password("P@ssw0rd!")
    .description("Read-only analyst account")
    .build());
```
