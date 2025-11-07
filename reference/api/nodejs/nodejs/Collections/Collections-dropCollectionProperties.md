---
title: "dropCollectionProperties() | Node.js"
slug: /node/node/Collections-dropCollectionProperties
sidebar_label: "dropCollectionProperties()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation resets the properties of a specific collection to their default values. | Node.js"
type: docx
token: EjFMdRFz0ofehXxxCPqc6raSnAg
sidebar_position: 11
keywords: 
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database
  - zilliz
  - zilliz cloud
  - cloud
  - dropCollectionProperties()
  - nodejs26
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropCollectionProperties()

This operation resets the properties of a specific collection to their default values.

```javascript
dropCollectionProperties(data): Promise<ResStatus>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.dropCollectionProperties({
   db_name?: string
   collection_name: string,
   properties: string[],
   timeout?: number
 })
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **properties** (*string[]*) -

    **[REQUIRED]**

    The properties to change and their expected values in a TypeScript **Record**. Possible values are as follows:

    - **collection.ttl.seconds** -

        The time-to-live (TTL) of a collection in seconds.

    - **mmap.enabled** -

        Whether to enable mmap for the raw data and indexes of all fields in the collection.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

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
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.dropCollectionProperties({
    collection_name: 'my-collection',
    delete_keys: ["collection.ttl.seconds"]
});
```

