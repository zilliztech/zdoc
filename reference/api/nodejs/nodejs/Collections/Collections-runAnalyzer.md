---
title: "runAnalyzer() | Node.js"
slug: /node/node/Collections-runAnalyzer
sidebar_label: "runAnalyzer()"
beta: false
added_since: v2.5.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation runs an analyzer on the provided text for test purposes. | Node.js"
type: docx
token: LsMldPd8GodoVqxCAZUcWYjdnwh
sidebar_position: 18
keywords: 
  - Vector search
  - knn algorithm
  - HNSW
  - What is unstructured data
  - zilliz
  - zilliz cloud
  - cloud
  - runAnalyzer()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# runAnalyzer()

This operation runs an analyzer on the provided text for test purposes.

```javascript
await milvusClient.runAnalyzer(data)
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

- **analyzer_params** (*Record&lt;string, any&gt;*) -

    The parameter for the analyzer.

- **text** (*string* | *string[]*) -

    The input text or a list of texts to be analyzed.

- **with_detail** (*boolean*) -

    Optional flag indicating whether to return detailed analysis output.

- **with_hash** (*boolean*) -

    Optional flag indicating whether to include hash-based processing.

**RETURNS** *Promise&lt;RunAnalyzerResponse&gt;*

This method returns a promise that resolves to a **RunAnalyzerResponse** object.

```typescript
{
    results: AnalyzerResult[],
    status:  ResStatus
}
```

**PARAMETERS:**

- **results** (*AnalyzerResult[]*) -
The tokenization output. When **text** is a single string, this list has one entry; when **text** is an array, the entries align with the input order.

    - **tokens** (*AnalyzerToken[]*) -

        The tokens produced by the analyzer.

        - **token** (*string*) -

        The token text.

        - **start_offset** (*number*) -

        The zero-based character offset where the token begins in the input.

        - **end_offset** (*number*) -

        The zero-based character offset immediately after the token.

        - **position** (*number*) -

        The token position in the stream, used by phrase queries.

        - **position_length** (*number*) -

        The number of stream positions the token spans.

        - **hash** (*number*) -

        The token hash, populated when the request set **with_hash** to **true**.

        - **token** (*string*) -

            The token text.

        - **start_offset** (*number*) -

            The zero-based character offset where the token begins in the input.

        - **end_offset** (*number*) -

            The zero-based character offset immediately after the token.

        - **position** (*number*) -

            The token position in the stream, used by phrase queries.

        - **position_length** (*number*) -

            The number of stream positions the token spans.

        - **hash** (*number*) -

            The token hash, populated when the request set **with_hash** to **true**.

- **ResStatus**
A **ResStatus** object.

    - **code** (*number*) -

        A code that indicates the operation result. It remains **0** if this operation succeeds.

    - **error_code** (*string* | *number*) -

        An error code that indicates an occurred error. It remains **Success** if this operation succeeds.

    - **reason** (*string*) -

        The reason that indicates the reason for the reported error. It remains an empty string if this operation succeeds.