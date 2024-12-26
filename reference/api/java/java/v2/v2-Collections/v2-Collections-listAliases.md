---
displayed_sidbar: javaSidebar
title: "listAliases() | Java | v2"
slug: /java/java/v2-Collections-listAliases
sidebar_label: "listAliases()"
beta: false
notebook: false
description: "This operation lists all existing aliases for a specific collection. | Java | v2"
type: docx
token: RvZDdxU1howmQ7x2V31c8eC7nJb
sidebar_position: 15
keywords: 
  - llm eval
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - zilliz
  - zilliz cloud
  - cloud
  - listAliases()
  - javaV2
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work
displayed_sidebar: javaSidebar

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

**RETURN TYPE:**

*ListAliasResp*

**RETURNS:**

A **ListAliasResp** object containing a list of aliases for the specified collection. If the collection has no aliases, an empty list will be returned.

**PARAMETERS:**

- **alias** (*List\<String\>*)

    A list of strings containing the aliases.

- **collectionName** (*String*)

    The name of the collection.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
ListAliasesReq listAliasesReq = ListAliasesReq.builder()
        .collectionName("test")
        .build();
ListAliasResp listAliasResp = client.listAliases(listAliasesReq);
```
