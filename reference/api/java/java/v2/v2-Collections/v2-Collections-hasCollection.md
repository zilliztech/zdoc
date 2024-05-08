---
displayed_sidbar: this.displayedSidebar
slug: /java/java/v2-Collections-hasCollection
beta: false
notebook: false
type: docx
token: HOgkdNByyoAO4GxnLZjcpC8an8c
sidebar_position: 14
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# hasCollection()

This operation checks whether a specific collection exists.

```java
public Boolean hasCollection(HasCollectionReq request)
```

## Request Syntax{#request-syntax}

```java
hasCollection(HasCollectionReq.builder()
    .collectionName(String collectionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

**RETURN TYPE:**

*bool*

**RETURNS:**

A boolean value indicating whether the specified collection exists.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// check whether collection test exists
HasCollectionReq hasCollectionReq = HasCollectionReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.hasCollection(hasCollectionReq);
```

