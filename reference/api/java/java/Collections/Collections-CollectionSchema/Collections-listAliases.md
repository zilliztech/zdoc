---
displayed_sidbar: javaSidebar
slug: /java/Collections-listAliases
beta: false
notebook: false
type: docx
token: DCZ5dAc1joTkAHx81epc8Z3Rnde
sidebar_position: 15
---

import Admonition from '@theme/Admonition';


# listAliases()

This operation lists all existing aliases for a specific collection.

```java
public ListAliasResp listAliases()
```

## Request Syntax{#request-syntax}

```java
MilvusClientV2.listAliases()
```

__RETURN TYPE:__

_ListAliasResp_

__RETURNS:__

A __ListAliasResp__ object containing a list of aliases for the specified collection. If the collection has no aliases, an empty list will be returned.

__PARAMETERS:__

- __alias__ (_List\<String\>_)

    A list of strings containing the aliases.

- __collectionName__

    The name of the collection.

__EXCEPTIONS:__

- __MilvusClientExceptions__

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
ListAliasesReq listAliasesReq = ListAliasesReq._builder_()
        .collectionName("test")
        .build();
ListAliasResp listAliasResp = client_v2.listAliases(listAliasesReq);
```
