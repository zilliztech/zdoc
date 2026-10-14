---
title: "search() | Node.js"
slug: /node/node/Vector-search
sidebar_label: "search()"
beta: false
added_since: v2.3.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "This operation performs a vector similarity search in a collection. | Node.js"
type: docx
token: HYv3d0NiRoc09Bx4rz0cIhqknb5
sidebar_position: 7
keywords: 
  - multimodal RAG
  - llm hallucinations
  - hybrid search
  - lexical search
  - zilliz
  - zilliz cloud
  - cloud
  - search()
  - nodejs30
displayed_sidebar: nodeSidebar

displayed_sidbar: nodeSidebar
---

import Admonition from '@theme/Admonition';


# search()

This operation performs a vector similarity search in a collection.

## Request Syntax\{#request-syntax}

```typescript
milvusClient.search({ collection_name, data, ... })
```

**PARAMETERS:**

- **collection_name** (*string*) -

    The name of the collection.

- **db_name** (*string*) -

    The name of the database (optional).

- **data** (*SearchData | SearchData[]*) -

    Vector or text to search. Not required when ids is provided.

- **vector** (*SearchData | SearchData[]*) -

    Alias for data (optional).

- **ids** (*number[] | string[]*) -

    Primary key IDs for Search By PK. When provided, vector data is not required.

- **partition_names** (*string[]*) -

    Array of partition names (optional).

- **anns_field** (*string*) -

    Vector field name, required for multi-vector collections (optional).

- **output_fields** (*string[]*) -

    Fields to return (optional).

- **limit** (*number*) -

    Number of results to return (optional).

- **topk** (*number*) -

    Alias for limit (optional).

- **offset** (*number*) -

    Number of results to skip (optional).

- **filter** (*string*) -

    Filter expression (optional).

- **expr** (*string*) -

    Alias for filter (optional).

- **exprValues** (*keyValueObj*) -

    Template values for the filter expression (optional).

- **params** (*keyValueObj*) -

    Extra search parameters (optional).

- **metric_type** (*string*) -

    Distance metric type (optional).

- **consistency_level** (*ConsistencyLevelEnum*) -

    Consistency level (optional).

- **ignore_growing** (*boolean*) -

    Whether to ignore growing segments (optional).

- **group_by_field** (*string*) -

    Field to group results by (optional).

- **group_size** (*number*) -

    Size of each group (optional).

- **strict_group_size** (*boolean*) -

    Whether to enforce strict group size (optional).

- **order_by_fields** (*OrderByFields*) -

    Fields to sort search results by, for example `price:asc` or `[{ field: "price", order: "asc" }]` (optional).

- **hints** (*string*) -

    Hints to improve search performance (optional).

- **round_decimal** (*number*) -

    Number of decimal places to round scores to (optional).

- **transformers** (*OutputTransformers*) -

    Custom data transformers for bf16/f16 vectors (optional).

- **rerank** (*RerankerObj | FunctionObject*) -

    Reranker configuration (optional).

- **nq** (*number*) -

    Number of query vectors (optional).

- **timeout** (*number*) -

    An optional duration of time in milliseconds to allow for the RPC. Default is undefined.

**RETURN TYPE:**

*SearchResults&lt;T&gt;*

**RETURNS:**

The search results with status, recalls, session_ts, collection_name, and result entries.

**PARAMETERS:**

- **status** (*ResStatus*) -

    The response status: `{error_code, reason}`.

- **recalls** (*number[]*) -

    The recalls of the search operation.

- **session_ts** (*number*) -

    The timestamp of the search session.

- **collection_name** (*string*) -

    The name of the collection that was searched.

- **results** (*DetermineResultsType&lt;T&gt;*) -

    Array of search results; the shape depends on the input parameters.

- **all_search_count** (*number*) -

    The total number of search operations (optional).

- **search_iterator_v2_results** (*Record&lt;string, any&gt;*) -

    Search iterator v2 results (optional).

**EXCEPTIONS:**

- **MilvusError**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for the exact failure reason.

## Example\{#example}

```javascript
const milvusClient = new MilvusClient(MILVUS_ADDRESS);
const searchResults = await milvusClient.search({
  collection_name: 'my_collection',
  data: [1, 2, 3, 4],
  limit: 10,
});
```
