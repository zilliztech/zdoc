---
title: "listDatabases() | Node.js"
slug: /node/node/Database-listDatabases
sidebar_label: "listDatabases()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation lists all existing databases. | Node.js"
type: docx
token: Kp9Dd2dIgoxyDixuqtqctPZXnFb
sidebar_position: 5
keywords: 
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - Zilliz database
  - zilliz
  - zilliz cloud
  - cloud
  - listDatabases()
  - nodejs26
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# listDatabases()

This operation lists all existing databases.

```javascript
listDatabases(data?): Promise<ListDatabasesResponse>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.listDatabases({
    timeout?: number
})
```

**PARAMETERS:**

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise |\<ListDatabaseResponse>*

This method returns a promise that resolves to a **ListDatabaseResponse** object.

```javascript
{
    db_names: string[],
    status: {
        code: number,
        error_code: string | number,
        reason: string
    }
}
```

**PARAMETERS:**

- **db_names** (*string[]*) -

    A list of database names.

- **status** (**ResStatus**) -

    The operation status.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

## Example\{#example}

```javascript
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const res = await milvusClient.listDatabases();
```
