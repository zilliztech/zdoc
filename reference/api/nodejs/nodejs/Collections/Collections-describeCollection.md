---
displayed_sidbar: nodeSidebar
title: "describeCollection() | Node.js"
slug: /node/node/Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
notebook: false
description: "This operation lists detailed information about a specific collection. | Node.js"
type: docx
token: TjqHdZqO1oSwwYxuny2cchWzn6S
sidebar_position: 7
keywords: 
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - zilliz
  - zilliz cloud
  - cloud
  - describeCollection()
  - node
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# describeCollection()

This operation lists detailed information about a specific collection.

```javascript
describeCollection(data): Promise<DescribeCollectionResponse>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.describeCollection({ 
    db_name: string,
    collection_name: string 
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database that holds the target collection.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of an existing collection.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**Returns Promise\<DescribeCollectionResponse>*

This method returns a promise that resolves to a **DescribeCollectionResponse** object.

```javascript
{
    aliases: string,
    collectionID: string,
    consistency_level: string,
    created_timestamp: string,
    created_utc_timestamp: string,
    db_name: string,
    num_partitions: string,
    physical_channel_names: string,
    schema: object,
    shards_num: int,
    start_positions: string,
    status: object,
    virtual_channel_names: string  
}
```

**PARAMETERS:**

- **aliases** (*string*)-

    A list of the aliases of the collection.

- **collectionID** (*string*)-

    The ID of the collection.

- **consistency_level** (*string*)-

    The consistency level of the collection.

- **created_timestamp** (*string*)-

    The timestamp indicating the creation time of the collection.

- **created_utc_timestamp** (*string*)-

    The timestamp in UTC indicating the creation time of the collection.

- **db_name** (*string*)-

    The name of the cluster to which the collection belongs.

- **num_partitions** (*string*)-

    The number of partitions in the collection.

- **physical_channel_names** (*string*)-

    A list of the names of the physical channels in this collection.

- **schema** (*object*)-

    The CollectionSchema object.

    - **autoID** (*boolean*) -

        Whether the primary field automatically increments along with data insertions.

    - **description** (*string*) -

        Collection description.

    - **enable_dynamic_field** (*boolean*) -

        Whether the reserved JSON field **$meta** is used to store non-schema-defined fields in key-value pairs.

    - **fields** (*FieldSchema[]*) -

        A list of schema-defined fields. 

    - **name** (*string*) -   

        The name of **CollectionSchema** object.

- **shards_num** (*string*)-

    The number of shards in the collection.

- **virtual_channel_names** (*string*)-

A list of the names of the virtual channels in this collection.

- **status** (*object*)-

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

- **shards_num** (*string*)-

    The number of shards in the collection.

## Example{#example}

```java
const milvusClient = new milvusClient(MILUVS_ADDRESS);
 const res = await milvusClient.describeCollection({ collection_name: 'my_collection' });
```

