---
displayed_sidbar: javaSidebar
slug: /java/java/v2-Management-getLoadState
beta: FALSE
notebook: FALSE
type: docx
token: AzwPdR4pSoSSUAx5vsEc14x3nGf
sidebar_position: 4
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# getLoadState()

This operation displays whether a specified collection or partition is loaded or not.

```java
public Boolean getLoadState(GetLoadStateReq request)
```

## Request Syntax{#request-syntax}

```java
getLoadState(GetLoadStateReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of a collection.

- `partitionName(String partitionName)`

    The name of a partition.

**RETURN TYPE:**

*Boolean*

**RETURNS:**

A Boolean value that indicates the status of the specified collection or partition. 

<Admonition type="info" icon="📘" title="Notes">

<p>A collection is in the loaded state if any or all of its partitions are loaded.</p>

</Admonition>

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// get load state for collection "test"
GetLoadStateReq getLoadStateReq = GetLoadStateReq.builder()
        .collectionName("test")
        .build();
Boolean resp = client.getLoadState(getLoadStateReq);
// return true or false
```
