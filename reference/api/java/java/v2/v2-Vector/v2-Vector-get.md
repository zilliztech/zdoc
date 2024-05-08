---
displayed_sidbar: this.displayedSidebar
slug: /java/java/v2-Vector-get
beta: FALSE
notebook: FALSE
type: docx
token: XeXxd6ylAoSZ05xkXEqcS84XnIc
sidebar_position: 2
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# get()

This operation gets specific entities by their IDs.

```java
public GetResp get(GetReq request)
```

## Request Syntax{#request-syntax}

```java
get(GetReq.builder()
    .collectionName(String collectionName)
    .partitionName(String partitionName)
    .ids(List<Object> ids)
    .outputFields(List<String> outputFields)
    .build()
)
```

**BUILDER METHODS:**

- `collectionName(String collectionName)`

    The name of an existing collection.

- `partitionName(String partitionName)`

    The name of a partition.

- `ids(List<Object> ids)`

    A specific entity ID or a list of entity IDs.

- `outputFields(List<String> outputFields)`

    A list of names of the fields to be included in the query result.

**RETURN TYPE:**

*GetResp*

**RETURNS:**

A **GetResp** object representing one or more queried entities.

**PARAMETERS:**

- **getResults** (*List\<QueryResp.QueryResult\>*)

    A list of **QueryResp.QueryResult** objects.

- **fields** (*Map\<String,Object\>*)

    A map that contains key-value pairs of field names and their values.

**EXCEPTIONS:**

- **MilvusClientExceptions**

    This exception will be raised when any error occurs during this operation.

## Example{#example}

```java
// get entity with id 0
GetReq getReq = GetReq.builder()
        .collectionName("test")
        .ids(Collections.singletonList("0"))
        .build();
GetResp statusR = client.get(getReq);
```

