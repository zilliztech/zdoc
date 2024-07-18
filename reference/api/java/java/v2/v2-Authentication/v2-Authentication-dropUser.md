---
displayed_sidbar: javaSidebar
slug: /java/java/v2-Authentication-dropUser
beta: false
notebook: false
type: docx
token: RFv2dtZ1qoP9XQxJEGqcgLGUnhc
sidebar_position: 6
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
