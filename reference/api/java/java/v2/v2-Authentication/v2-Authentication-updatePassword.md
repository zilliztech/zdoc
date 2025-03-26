---
displayed_sidbar: javaSidebar
title: "updatePassword() | Java | v2"
slug: /java/java/v2-Authentication-updatePassword
sidebar_label: "updatePassword()"
beta: false
notebook: false
description: "This operation updates the password of a specific user. | Java | v2"
type: docx
token: GQH8dgqlPoRY1sxFhCRcLlgInNc
sidebar_position: 20
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - updatePassword()
  - javaV225
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# updatePassword()

This operation updates the password of a specific user.

```java
public void updatePassword(UpdatePasswordReq request)
```

## Request Syntax{#request-syntax}

```java
updatePassword(UpdatePasswordReq.builder()
    .userName(String userName)
    .password(String password)
    .newPassword(String newPassword)
    .build()
)
```

**BUILDER METHODS:**

- `userName(String userName)`

    The name of an existing user.

- `password(String password)`

    The original password of the user.

- `newPassword(String newPassword)`

    The new password of the user.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
UpdatePasswordReq updatePasswordReq = UpdatePasswordReq.builder()
        .userName("test")
        .password("Zilliz@2023")
        .newPassword("Zilliz@2024")
        .build();
client.updatePassword(updatePasswordReq);
```
