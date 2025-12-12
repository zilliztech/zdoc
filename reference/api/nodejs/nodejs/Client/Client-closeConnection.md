---
title: "closeConnection() | Node.js"
slug: /node/node/Client-closeConnection
sidebar_label: "closeConnection()"
beta: false
added_since: v2.3.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation closes the current connection to the Milvus server. | Node.js"
type: docx
token: HtOGdjTpOoG0RcxpGv1cCBcEnAh
sidebar_position: 3
keywords: 
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - zilliz
  - zilliz cloud
  - cloud
  - closeConnection()
  - nodejs26
  - semantic search
  - Anomaly Detection
  - sentence transformers
  - Recommender systems
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# closeConnection()

This operation closes the current connection to the Milvus server.

```javascript
closeConnection(): Promise<CONNECT_STATUS>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.closeConnection()
```

**RETURN TYPE:**

*Promise*\<*CONNECT_STATUS*>

**RETURNS:**

A promise that resolves to the final status of the current connection to the Milvus server, which should be `SHUTDOWN`.

## Example\{#example}

```javascript
milvusClient.closeConnection()
```
