---
title: "getCompactionState() | Node.js"
slug: /node/node/Management-getCompactionState
sidebar_label: "getCompactionState()"
beta: false
added_since: v2.4.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists the statistics collected on a specific collection. | Node.js"
type: docx
token: CRFLdvgkhoeRikxMcMAcJk3qnIc
sidebar_position: 9
keywords: 
  - Similarity Search
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - zilliz
  - zilliz cloud
  - cloud
  - getCompactionState()
  - nodejs26
  - Vector store
  - open source vector database
  - Vector index
  - vector database open source
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# getCompactionState()

This operation lists the statistics collected on a specific collection.

```javascript
getCompactionState(data): Promise<GetCompactionStateResponse>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient.getCompactionState({ 
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

**RETURNS** *Promise\<GetCompactionStateResponse>*

This method returns a promise that resolves to a **GetCompactionStateResponse** object.

```javascript
{
    completedPlanNo: string,
    executingPlanNo: string,
    state: CompactionState,
    status: ResStatus,
    timeoutPlanNo: string,
}
```

**PARAMETERS:**

- **completedPlanNo** (*string*) -

    The serial number of the completed plan for the specified compaction job.

- **executingPlanNo** (*string*) -

    The serial number of the executing plan for the specified compaction job.

- **state** (*CompactionState*) -

    The state of the specified compaction job. Possible values are as follows:

    - **Completed** (2)

    - **Executing** (1)

    - **UndefiedState** (0)

- **status** (*ResStatus*) -

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.

- **timeoutPlanNo** (*string*) -

    The serial number of the timeout plan for the specified compaction job.

## Example\{#example}

```javascript
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.getCompactionState({
    compactionID: 'your_compaction_id',
});
```

