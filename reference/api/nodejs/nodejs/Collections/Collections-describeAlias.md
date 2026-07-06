---
title: "describeAlias() | Node.js"
slug: /node/node/Collections-describeAlias
sidebar_label: "describeAlias()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation describes a specific alias. | Node.js"
type: docx
token: YCzNdg5yWoeZVrxj7jGcb1UXnBd
sidebar_position: 7
keywords: 
  - k nearest neighbor algorithm
  - ANNS
  - Vector search
  - knn algorithm
  - zilliz
  - zilliz cloud
  - cloud
  - describeAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeAlias()

This operation describes a specific alias.

```javascript
await milvusClient.describeAlias(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.describeAlias({
    db_name: string,
    alias: string,
    collection_name: string
})
```

**PARAMETERS:**

- **db_name** (*str*) -

    The name of the database that holds the target collection.

- **alias** (*str*) -

    **[REQUIRED]**

    The alias of a collection. Note that the alias should exist beforehand.

    <Admonition type="info" icon="📘" title="Note">

    What is a collection alias?
    
        A collection alias is an additional name for a collection. Collection aliases are useful when you want to switch your application to a new collection without any changes to your code. 
    
        On Zilliz Cloud, a collection alias is a globally unique identifier. One alias can only be assigned to exactly one collection. Conversely, a collection can have multiple aliases.
    
        Below is an example of reassigning the alias of one collection to another:
    
        Suppose there are two collections: `collection_1` and `collection_2`. There is also a collection alias named `bob`, which was originally assigned to `collection_1`:
    
        - `collection_1`'s alias = ["bob"]
    
        - `collection_2`'s alias = []
    
        After calling `alter_alias("collection_2", "bob")`:
    
        - `collection_1`'s alias = []
    
        - `collection_2`'s alias = ["bob"]

    </Admonition>

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection that has the specified alias.

**RETURNS** *Promise&lt;DescribeAliasResponse&gt;*

This method returns a promise that resolves to a **DescribeAliasResponse** object.

```typescript
{
    db_name: string,
    alias: string,
    collection: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **db_name** (*string*) -
The database that owns the alias.

- **alias** (*string*) -
The alias name.

- **collection** (*string*) -
The collection name to which the alias currently points.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const res = await milvusClient.describeAlias({
   alias: 'my_collection_alias',
   collection_name: 'my_collection',
});
```
