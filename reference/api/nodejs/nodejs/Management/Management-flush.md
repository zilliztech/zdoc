---
displayed_sidbar: nodeSidebar
title: "flush() | Node.js"
slug: /node/node/Management-flush
sidebar_label: "flush()"
beta: false
notebook: false
description: "This operation manually seals a segment and persists the data on disk. It is recommended that this operation be called after all the data has been inserted into a collection. | Node.js"
type: docx
token: E2XJd4ZHvoc7QlxyrEJcrOJOn9f
sidebar_position: 6
keywords: 
  - Faiss
  - Video search
  - AI Hallucination
  - AI Agent
  - zilliz
  - zilliz cloud
  - cloud
  - flush()
  - nodejs25
  - lexical search
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# flush()

This operation manually seals a segment and persists the data on disk. It is recommended that this operation be called after all the data has been inserted into a collection.

```javascript
flush(data): Promise<FlushResult>
```

<Admonition type="info" icon="📘" title="Notes">

<p>Milvus automatically flushes data into persistent storage at intervals. You are advised to rely on this automatic data persistence mechnism.</p>

</Admonition>

## Request Syntax{#request-syntax}

```javascript
milvusClient.flush({
    db_name?: string,
    collection_names: string[],
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the target database to which the target collections belong.

- **collection_names** (*string[]*) -

    **[REQUIRED]**

    A list of the target collection names.

- **timeout** (*number*)  

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise\<FlushResult>*

This method returns a promise that resolves to a **FlushResult** object.

```javascript
{
    coll_segIDs: any,
    status: {
        code: number,
        error_code: string | number,
        reason: string
    }
}
```

**PARAMETERS:**

- **coll_segIDs** (*number*) -

    The IDs of the segments that this operation affects.

- **status** (*ResStatus*) - 

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example{#example}

```java
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const flushStatus = await milvusClient.flush({
    collection_names: ['my_collection'],
});
```

