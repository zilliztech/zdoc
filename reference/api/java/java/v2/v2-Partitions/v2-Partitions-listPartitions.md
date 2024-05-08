---
displayed_sidbar: this.displayedSidebar
slug: /java/java/v2-Partitions-listPartitions
beta: FALSE
notebook: FALSE
type: docx
token: M2l0dCikPouRErxA1bccCswpnKh
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# listPartitions()

This operation lists the partitions in a specified collection.

```java
public List<String> listPartitions(ListPartitionsReq request)
```

## Request Syntax{#request-syntax}

```java
listPartitions(ListPartitionsReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

**RETURN TYPE:**

*List\<String\>*

**RETURNS:**

A list of partition names.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// list partitions in collection
ListPartitionsReq listPartitionsReq = ListPartitionsReq.builder()
        .collectionName("test")
        .build();
List<String> res = client.listPartitions(listPartitionsReq);
```

