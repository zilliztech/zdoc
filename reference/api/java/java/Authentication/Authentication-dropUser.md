---
displayed_sidbar: javaSidebar
slug: /java/Authentication-dropUser
beta: false
notebook: false
type: docx
token: TS6PdnezOou20RxtG64coUpVn2b
sidebar_position: 6
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

__BUILDER METHODS:__

- `userName(String userName)`

    The name of the user to drop.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DropUserReq dropUserReq = DropUserReq._builder_()
        .userName("test")
        .build();
client.dropUser(dropUserReq);
```
