---
title: "runAnalyzer() | Node.js"
slug: /node/node/Collections-runAnalyzer
sidebar_label: "runAnalyzer()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation runs an analyzer on the provided text for test purposes. | Node.js"
type: docx
token: LsMldPd8GodoVqxCAZUcWYjdnwh
sidebar_position: 18
keywords: 
  - Serverless vector database
  - milvus open source
  - how does milvus work
  - Zilliz vector database
  - zilliz
  - zilliz cloud
  - cloud
  - runAnalyzer()
  - nodejs26
  - natural language processing database
  - cheap vector database
  - Managed vector database
  - Pinecone vector database
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# runAnalyzer()

This operation runs an analyzer on the provided text for test purposes.

```javascript
runAnalyzer(data): Promise<RunAnalyzerResponse>
```

## Request Syntax\{#request-syntax}

```javascript
milvusClient({
    analyzer_params: Record<string, any>,
    text: string | string[],
    with_detail: boolean,
    with_hash: boolean
})
```

**PARAMETERS:**

- **analyzer_params** (*Record\<string, any>*) -

    The parameter for the analyzer.

- **text** (*string* | *string[]*) -

    The input text or a list of texts to be analyzed.

- **with_detail** (*boolean*) -

    Optional flag indicating whether to return detailed analysis output.

- **with_hash** (*boolean*) -

    Optional flag indicating whether to include hash-based processing.

**RETURNS** *Promise*\<*RunAnalyzerResponse*>

This method returns a promise that resolves to a **RunAnalyzerResponse** object.

```javascript
{
    results: AnalyzerResult[],
    status: ResStatus
}
```

**PARAMETERS:**

- **results** (*AnalyzerResult[]*) -

    The results of this operation, containing a set of tokens generated based on the specified analyzer parameters.

    - **tokens** (*AnalyzerToken[]*) -

        A list of analyzed tokens. 

- **status** (*ResStatus*) -  

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds. 

    - **reason** (*string*) - 

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.