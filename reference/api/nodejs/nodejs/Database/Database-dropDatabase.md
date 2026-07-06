---
title: "dropDatabase() | Node.js"
slug: /node/node/Database-dropDatabase
sidebar_label: "dropDatabase()"
beta: false
added_since: v2.3.x
last_modified: v2.5.x
deprecate_since: false
notebook: false
description: "This operation drops a database. | Node.js"
type: docx
token: Ja99dnnaOoncwbx2zIPc4PjunXx
sidebar_position: 3
keywords: 
  - vector databases comparison
  - Faiss
  - Video search
  - AI Hallucination
  - zilliz
  - zilliz cloud
  - cloud
  - dropDatabase()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# dropDatabase()

This operation drops a database.

```javascript
await milvusClient.dropDatabase(data?)
```

<Admonition type="info" icon="📘" title="Notes">

This method applies only to dedicated clusters.

</Admonition>

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.dropDatabase({
    db_name: string,
    timeout?: number
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database to drop.

    There should be a database with the specified name. Otherwise, exceptions will occur.

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

**RETURNS** *Promise |&lt;ResStatus&gt;*

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

```javascript
const milvusClient = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
const resStatus = await milvusClient.dropDatabase({ db_name: 'db_to_drop' });
```

