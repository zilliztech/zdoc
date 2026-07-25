---
displayed_sidbar: nodeSidebar
title: "closeConnection() | Node.js"
slug: /node/node/Client-closeConnection
sidebar_label: "closeConnection()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation closes the current connection to the Milvus server. | Node.js"
type: docx
token: HtOGdjTpOoG0RcxpGv1cCBcEnAh
sidebar_position: 3
keywords: 
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - zilliz
  - zilliz cloud
  - cloud
  - closeConnection()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# closeConnection()

This operation closes the current connection to the Milvus server.

```javascript
closeConnection(): Promise<CONNECT_STATUS>
```

## Request Syntax

```javascript
milvusClient.closeConnection()
```

**RETURN TYPE:**

*Promise*\<*CONNECT_STATUS*>

**RETURNS:**

A promise that resolves to the final status of the current connection to the Milvus server, which should be `SHUTDOWN`.

## Example

```javascript
milvusClient.closeConnection()
```
