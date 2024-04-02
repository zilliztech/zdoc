---
displayed_sidbar: javaSidebar
slug: /java/Collections-describeAlias
beta: false
notebook: false
type: docx
token: UIkbdQl4ToHwesxlyRmc8RUFn3b
sidebar_position: 8
---

import Admonition from '@theme/Admonition';


# describeAlias()

This operation displays the details of an alias.

```java
public DescribeAliasResp describeAlias(DescribeAliasReq request)
```

## Request Syntax{#request-syntax}

```java
describeAlias(DescribeAliasReq.builder()
    .alias(String alias)
    .build()
)
```

__BUILDER METHODS:__

- `alias(String alias)`

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

__RETURN TYPE:__

_DescribeAliasResp_

__RETURNS:__

A __DescribeAliasResp__ object containing the alias details.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
        .alias("test_alias")
        .build();
DescribeAliasResp describeAliasResp = client.describeAlias(describeAliasReq);
```

