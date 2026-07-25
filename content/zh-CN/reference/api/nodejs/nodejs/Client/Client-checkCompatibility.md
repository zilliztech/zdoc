---
displayed_sidbar: nodeSidebar
title: "checkCompatibility() | Node.js"
slug: /node/node/Client-checkCompatibility
sidebar_label: "checkCompatibility()"
added_since: v2.3.x
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation checks the compatibility of the SDK with the Milvus server. | Node.js"
type: docx
token: Tq1Md4GuIoNbfuxK03ncIa7onMc
sidebar_position: 1
keywords: 
  - Context Window
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - zilliz
  - zilliz cloud
  - cloud
  - checkCompatibility()
  - nodejs26
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# checkCompatibility()

This operation checks the compatibility of the SDK with the Milvus server.

```javascript
checkCompatibility(data?): Promise<any>
```

## Request Syntax

```javascript
milvusClient.checkCompatibility({
    checker?: Function,
    message?: string
})
```

**PARAMETERS:**

- **checker** (*Function*) -

    A callback function that will be called if the current SDK is compatible.

- **message** (*string*) -  

    The error message to throw if the SDK is incompatible.

**RETURN TYPE:**

*Promise*\<*any*>

**RETURNS:**

A promise that resolves to the result of the specified checker function.

## Examples

```javascript
milvusClient.checkCompatibility({
   checker: () => { console.log("compatible") },
   message: "incompatible"
});
```
