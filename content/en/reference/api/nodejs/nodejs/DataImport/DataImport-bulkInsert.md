---
title: "bulkInsert() | Node.js"
slug: /node/node/DataImport-bulkInsert
sidebar_label: "bulkInsert()"
beta: false
added_since: inherit
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation imports the data from a specified data file into Milvus. | Node.js"
type: docx
token: V65MdZWnsoMwpfxkt0sc5qQPnbb
sidebar_position: 9
keywords: 
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - zilliz
  - zilliz cloud
  - cloud
  - bulkInsert()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# bulkInsert()

This operation imports the data from a specified data file into Milvus.

```javascript
await milvusClient.bulkInsert(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.bulkInsert({
    db_name?: string,
    collection_name: string,
    partition_name?: string,
    files: string[],
    timeout?: number,
    options?: KeyValuePair<string, string | number>[]
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database to which the target collection belongs.

- **collection_name** (*string*) -

    **[REQUIRED]**

    The name of the target collection.

- **partition_name** (*string*) -

    The name of the target partition.

- **files** (*string[]*) -

    A list of paths to the data files from which the import is conducted.

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **options** (*KeyValuePair&lt;string, string | number&gt;[]*) -   

    Extra options for the current operation in key-value pairs.

**RETURN TYPE:**

*Promise*\<*ImportResponse*>

**RETURNS** *Promise&lt;ImportResponse&gt;*

This method returns a promise that resolves to a **ImportResponse** object.

```typescript
{
    tasks: number[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **tasks** (*number[]*) -
The identifiers of the asynchronous import tasks dispatched to the data nodes. Pass these values to `listImportTasks()` to poll for completion.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Examples\{#examples}

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const importResponse = await milvusClient.bulkInsert({
  collection_name: 'my_collection',
  files: ['path-to-data-file.json'],
});
```
