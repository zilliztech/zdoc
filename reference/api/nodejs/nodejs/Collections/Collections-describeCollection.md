---
title: "describeCollection() | Node.js"
slug: /node/node/Collections-describeCollection
sidebar_label: "describeCollection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists detailed information about a specific collection. | Node.js"
type: docx
token: FEnwdB0eCotS7wxpPXmcwgQwn8g
sidebar_position: 8
keywords: 
  - Question answering system
  - llm-as-a-judge
  - hybrid vector search
  - Video deduplication
  - zilliz
  - zilliz cloud
  - cloud
  - describeCollection()
  - nodejs26
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# describeCollection()

This operation lists detailed information about a specific collection.

```javascript
describeCollection(data): Promise<DescribeCollectionResponse>
```

## Request Syntax\{#request-syntax}

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
    collectionName: string,
    consistency_level: string,
    created_timestamp: string,
    created_utc_timestamp: string,
    db_name: string,
    functions: FunctionObject[],
    num_partitions: string,
    physical_channel_names: string,
    properties: KeyValuePair<string, string | number>[],
    schema: object,
    shards_num: int,
    start_positions: string,
    status: object,
    update_timestamp: number,
    update_timestamp_str: string,
    virtual_channel_names: string  
}
```

**PARAMETERS:**

- **aliases** (*string*)-

    A list of the aliases of the collection.

- **collectionID** (*string*)-

    The ID of the collection.

- **collectionName** (*string*) -

    The name of the collection.

- **consistency_level** (*string*)-

    The consistency level of the collection.

- **created_timestamp** (*string*)-

    The timestamp indicating the creation time of the collection.

- **created_utc_timestamp** (*string*)-

    The timestamp in UTC indicating the creation time of the collection.

- **db_name** (*string*)-

    The name of the cluster to which the collection belongs.

- **functions** (*FunctionObject[]*) -

    The list of functions configured in the collection.

- **num_partitions** (*string*)-

    The number of partitions in the collection.

- **physical_channel_names** (*string*)-

    A list of the names of the physical channels in this collection.

- **properties** (*KeyValuePair\<string, string | number>*) -

    The collection properties in key-value pairs. 

- **schema** (*object*)-

    The CollectionSchema object.

    - **autoID** (*boolean*) -

        Whether the primary field automatically increments along with data insertions.

    - **description** (*string*) -

        Collection description.

    - **enable_dynamic_field** (*boolean*) -

        Whether the reserved JSON field **&#36;meta** is used to store non-schema-defined fields in key-value pairs.

    - **fields** (*FieldSchema[]*) -

        A list of schema-defined fields. 

    - **name** (*string*) -   

        The name of **CollectionSchema** object.

- **shards_num** (*string*)-

    The number of shards in the collection.

- **start_positions** (*string[]*) -

    A list of start positions.

- **status** (*object*)-

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

- **update_timestamp** (*number*) -

    The timestamp at which the collection has been updated.

- **update_timestamp_str** (*string*) -

    The update timestamp in string format.

- **virtual_channel_names** (*string[]*) -

    A list of the names of the virtual channels in this collection.

## Example\{#example}

```java
const milvusClient = new milvusClient(MILUVS_ADDRESS);
 const res = await milvusClient.describeCollection({ collection_name: 'my_collection' });
```

