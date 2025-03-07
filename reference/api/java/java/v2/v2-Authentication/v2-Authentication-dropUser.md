---
displayed_sidbar: javaSidebar
title: "dropUser() | Java | v2"
slug: /java/java/v2-Authentication-dropUser
sidebar_label: "dropUser()"
beta: false
notebook: false
description: "This operation drops a user. | Java | v2"
type: docx
token: RFv2dtZ1qoP9XQxJEGqcgLGUnhc
sidebar_position: 6
keywords: 
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
  - zilliz
  - zilliz cloud
  - cloud
  - dropUser()
  - javaV225
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# dropUser()

This operation drops a user.

```java
public void dropUser(DropUserReq request)
```

## Request Syntax{#request-syntax}

```java
dropUser(DropUserReq.builder()
    .userName(String userName)
    .build()
)
```

**BUILDER METHODS:**

- `userName(String userName)`

    The name of the user to drop.

**RETURNS:**

*void*

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DropUserReq dropUserReq = DropUserReq.builder()
        .userName("test")
        .build();
client.dropUser(dropUserReq);
```
