---
title: "getCompactionState() | Node.js"
slug: /node/node/Management-getCompactionState
sidebar_label: "getCompactionState()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation lists the statistics collected on a specific collection. | Node.js"
type: docx
token: CRFLdvgkhoeRikxMcMAcJk3qnIc
sidebar_position: 9
keywords: 
  - milvus benchmark
  - managed milvus
  - Serverless vector database
  - milvus open source
  - zilliz
  - zilliz cloud
  - cloud
  - getCompactionState()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getCompactionState()

This operation lists the statistics collected on a specific collection.

```javascript
await milvusClient.getCompactionState(data)
```

## Request Syntax\{#request-syntax}

```javascript
await milvusClient.getCompactionState({ 
    compactionID: string | number,
    timeout?: number 
})
```

**PARAMETERS:**

- **compactionID** (*string | number*) -

    **[REQUIRED]**

    The ID of a compaction job that is returned by a call to [`compact()`](./Management-compact).

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURNS** *Promise&lt;GetCompactionStateResponse&gt;*

This method returns a promise that resolves to a **GetCompactionStateResponse** object.

```typescript
{
    state: CompactionState,
    executingPlanNo: string,
    timeoutPlanNo: string,
    completedPlanNo: string,
    failedPlanNo: string,
    status:  ResStatus
}
```

**PARAMETERS:**

- **state** (*CompactionState*) -
The aggregate state of the compaction. Possible values are **UndefiedState**, **Executing**, and **Completed**.

- **executingPlanNo** (*string*) -
The number of plans still executing.

- **timeoutPlanNo** (*string*) -
The number of plans that timed out.

- **completedPlanNo** (*string*) -
The number of plans that completed successfully.

- **failedPlanNo** (*string*) -
The number of plans that failed.

- **ResStatus**
A **ResStatus** object.

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
const resStatus = await milvusClient.getCompactionState({
    compactionID: 'your_compaction_id',
});
```

