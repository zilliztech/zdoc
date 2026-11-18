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
  - Neural Network
  - Deep Learning
  - Knowledge base
  - natural language processing
  - zilliz
  - zilliz cloud
  - cloud
  - closeConnection()
  - nodejs30
displayed_sidebar: nodeSidebar

---

# closeConnection()

This operation closes the current connection to the Milvus server.

```javascript
await milvusClient.closeConnection()
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.closeConnection()
```

**RETURNS:**

*Promise&lt;CONNECT_STATUS&gt;*

A promise that resolves to the final status of the current connection to the Milvus server, which should be `SHUTDOWN`.


**EXCEPTIONS:**

- **Error**

    This exception is raised when any error occurs during this operation.

## Example\{#example}

```javascript
milvusClient.closeConnection()
```
