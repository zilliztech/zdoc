---
displayed_sidbar: nodeSidebar
title: "getCompactionState() | Node.js"
slug: /node/node/Collections-getCompactionState
sidebar_label: "getCompactionState()"
beta: false
notebook: false
description: "This operation lists the statistics collected on a specific collection. | Node.js"
type: docx
token: CRFLdvgkhoeRikxMcMAcJk3qnIc
sidebar_position: 14
keywords: 
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search
  - zilliz
  - zilliz cloud
  - cloud
  - getCompactionState()
  - nodejs25
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database
displayed_sidebar: nodeSidebar

---

import Admonition from '@theme/Admonition';


# getCompactionState()

This operation lists the statistics collected on a specific collection.

```javascript
getCompactionState(data): Promise<GetCompactionStateResponse>
```

## Request Syntax{#request-syntax}

```javascript
milvusClient.getCompactionState({ 
    compactionID: string | number,
    timeout?: number 
})
```

**PARAMETERS:**

- **compactionID** (*string | number*) -

    **&#91;REQUIRED&#93;**

    The ID of a compaction job that is returned by a call to [`compact()`](./Collections-compact).

- **timeout** (*number*) -

    The timeout duration for this operation. 

    Setting this to **None** indicates that this operation timeouts when any response returns or error occurs.

**RETURNS** *Promise\&lt;GetCompactionStateResponse&gt;*

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

## Example{#example}

```javascript
const milvusClient = new milvusClient(MILUVS_ADDRESS);
const resStatus = await milvusClient.getCompactionState({
    compactionID: 'your_compaction_id',
});
```

