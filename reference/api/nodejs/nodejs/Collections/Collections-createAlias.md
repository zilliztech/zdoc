---
title: "createAlias() | Node.js"
slug: /node/node/Collections-createAlias
sidebar_label: "createAlias()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation creates an alias for an existing collection. | Node.js"
type: docx
token: MPuIdwujBoXM6rx7Okfc3lhZnUd
sidebar_position: 4
keywords: 
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
  - zilliz
  - zilliz cloud
  - cloud
  - createAlias()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# createAlias()

This operation creates an alias for an existing collection.

```javascript
await milvusClient.createAlias(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.createAlias({
   alias: string,
   db_name: string,
   collection_name: string,
   timeout?: number
 })
```

**PARAMETERS:**

- **alias** (*str*) -

    **[REQUIRED]**

    The alias of the collection. Before this operation, ensure that the alias does not already exist. If it does, exceptions will occur.

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

- **db_name** (*str*) -

    The name of the database that holds the target collection.

- **collection_name** (*str*) -

    **[REQUIRED]**

    The name of the collection to create an alias for.

- **timeout** (*number*)  

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<ResStatus>*

This method returns a promise that resolves to a **ResStatus** object.

```javascript
{
    code: number,
    error_code: string | number,
    reason: string
}
```

**PARAMETERS:**

- **code** (*number*) -

    A code that indicates the operation result. It remains **0** if this operation succeeds.

- **error_code** (*string* | *number*) -

    An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

- **reason** (*string*) - 

    The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```java
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
 const resStatus = await milvusClient.createAlias({
   alias: 'my_collection_alias',
   collection_name: 'my_collection',
 });
```

