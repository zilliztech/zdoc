---
displayed_sidbar: javaSidebar
slug: /java/Authentication-createUser
beta: false
notebook: false
type: docx
token: BYksdftJSon0EMxNYn2c2FCpncd
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# createUser()

This operation creates a user.

```java
public void createUser(CreateUserReq request)
```

## Request Syntax{#request-syntax}

```java
createUser(CreateUserReq.builder()
    .userName(String userName)
    .password(String password)
    .build()
)
```

__BUILDER METHODS:__

- `userName(String roleName)`

    The name of the user to create.

- `password(String password)`

    The password of the user to create.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
CreateUserReq createUserReq = CreateUserReq._builder_()
        .userName("test")
        .password("Zilliz@2023")
        .build();
client.createUser(createUserReq);
```

