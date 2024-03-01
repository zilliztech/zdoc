---
displayed_sidbar: javaSidebar
slug: /java/Collections-dropAlias
beta: false
notebook: false
type: docx
token: C545ddO1qogYcJxeTLMc6FOgnlb
sidebar_position: 10
---

# dropAlias()

This operation drops a specified collection alias. 

```java
public void dropAlias(DropAliasReq request)
```

## Request Syntax{#request-syntax}

```java
dropAlias(DropAliasReq.builder()
    .alias(String alias)
    .build()
)
```

__BUILDER METHODS:__

- `alias(String alias)`

    The alias of a collection. 

    Before this operation, ensure that the alias exists. Otherwise, exceptions will occur.

__RETURNS:__

_void_

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
DropAliasReq dropAliasReq = DropAliasReq._builder_()
        .alias("test_alias")
        .build();
client_v2.dropAlias(dropAliasReq);
```
