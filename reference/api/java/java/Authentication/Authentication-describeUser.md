---
displayed_sidbar: javaSidebar
slug: /java/Authentication-describeUser
beta: false
notebook: false
type: docx
token: QCV6dOuKtoVyxDxPwXQczOclnxc
sidebar_position: 4
---

import Admonition from '@theme/Admonition';


# describeUser()

This operation describes a specific user.

```java
public DescribeUserResp describeUser(DescribeUserReq request)
```

## Request Syntax{#request-syntax}

```java
describeUser(DescribeUserReq.builder()
    .userName(String userName)
    .build()
)
```

__BUILDER METHODS:__

- `userName(String userName)`

    The name of the user to describe.

__RETURN TYPE:__

_DescribeUserResp_

__RETURNS:__

A __DescribeUserResp__ object containing the details of the user.

__PARAMETERS:__

- __roles__ (_List\<String\>_) -

    A list of role names associated with the user.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DescribeUserReq describeUserReq = DescribeUserReq.builder()
        .userName("test")
        .build();
DescribeUserResp describeUserResp = client.describeUser(describeUserReq);
```

