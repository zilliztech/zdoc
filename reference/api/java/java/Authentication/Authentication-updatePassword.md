---
displayed_sidbar: javaSidebar
slug: /java/Authentication-updatePassword
beta: false
notebook: false
type: docx
token: Fw4DdZmCxov8EBxnJlZceWton1e
sidebar_position: 13
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
    .newPassword(String newPassword)
    .password(String password)
    .userName(String userName)
    .build()
)
```

__BUILDER METHODS:__

- `newPassword(String newPassword)`

    The new password of the user.

- `password(String password)`

    The original password of the user.

- `userName(String userName)`

    The name of an existing user.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
UpdatePasswordReq updatePasswordReq = UpdatePasswordReq._builder_()
        .userName("test")
        .password("Zilliz@2023")
        .newPassword("Zilliz@2024")
        .build();
client.updatePassword(updatePasswordReq);
```
