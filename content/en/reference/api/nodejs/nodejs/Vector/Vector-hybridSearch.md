---
title: "hybridSearch() | Node.js"
slug: /node/node/Vector-hybridSearch
sidebar_label: "hybridSearch()"
beta: false
added_since: v2.4.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation performs a hybrid search that runs multiple vector queries and returns aggregated results. | Node.js"
type: docx
token: Ph9ldBswooKwebxKI9EcqSu4nlc
sidebar_position: 4
keywords: 
  - Audio similarity search
  - Elastic vector database
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - zilliz
  - zilliz cloud
  - cloud
  - hybridSearch()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# hybridSearch()

This operation performs a hybrid search that runs multiple vector queries and returns aggregated results.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.hybridSearch(params: HybridSearchReq)
```

**PARAMETERS:**

- **collection_name** (*string*) -

    The name of the collection.

- **data** (*HybridSearchSingleReq[]*) -

    Array of search requests.

- **output_fields** (*string[]*) -

    Fields to return (optional).

- **partition_names** (*string[]*) -

    Array of partition names (optional).

- **filter** (*string*) -

    Filter expression (optional).

- **expr** (*string*) -

    Alias for filter (optional).

- **limit** (*number*) -

    Number of results to return (optional).

- **offset** (*number*) -

    Number of results to skip (optional).

- **rerank** (*RerankerObj | FunctionObject*) -

    Reranker configuration (optional).

- **consistency_level** (*ConsistencyLevelEnum*) -

    Consistency level (optional).

- **ignore_growing** (*boolean*) -

    Whether to ignore growing segments (optional).

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. Default is undefined.

**RETURN TYPE:**

*SearchResults&lt;T&gt;*

**RETURNS:**

The hybrid search results with status, recalls, and aggregated result entries. hybridSearch aliases search() for HybridSearchReq shapes.

**PARAMETERS:**

- **status** (*ResStatus*) -

    The response status: `{error_code, reason}`.

- **recalls** (*number[]*) -

    The recalls of the hybrid search.

- **session_ts** (*number*) -

    The timestamp of the search session.

- **collection_name** (*string*) -

    The name of the collection that was searched.

- **results** (*DetermineResultsType&lt;T&gt;*) -

    Array of aggregated search results; the shape depends on the input parameters.

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
const results = await milvusClient.hybridSearch({
  collection_name: 'my_collection',
  data: [
    {
      data: [1, 2, 3, 4],
      anns_field: 'float_vector',
      limit: 10,
    },
  ],
});
```
