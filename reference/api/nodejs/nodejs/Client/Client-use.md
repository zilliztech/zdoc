---
title: "use() | Node.js"
slug: /node/node/Client-use
sidebar_label: "use()"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation sets the active database for the gRPC client. After calling this method, all subsequent operations will target the specified database. | Node.js"
type: docx
token: Dc3JdXF5dogLOLxqUPGclM6jn6f
sidebar_position: 9
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - use()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# use()

This operation sets the active database for the gRPC client. After calling this method, all subsequent operations will target the specified database.

```javascript
await milvusClient.use({ db_name: string })
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.use({
    db_name: string,
})
```

**PARAMETERS:**

- **db_name** (*string*) -

    The name of the database to use.

**RETURNS:**

*Promise\<ResStatus\>*

**EXCEPTIONS:**

- **MilvusError**

    This exception will be raised when any error occurs during this operation.

## Example\{#example}

```javascript
import { MilvusClient } from '@zilliz/milvus2-sdk-node';

const client = new MilvusClient({
    address: 'YOUR_CLUSTER_ENDPOINT',
    token: 'YOUR_CLUSTER_TOKEN',
});
await client.use({ db_name: 'my_database' });
```
