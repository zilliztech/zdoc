---
title: "hybrid_search() | Python | MilvusClient"
slug: /python/python/Vector-hybrid_search
sidebar_label: "hybrid_search()"
beta: false
added_since: v2.5.x
last_modified: v2.6.x
deprecate_since: false
notebook: false
description: "This operation conducts a hybrid vector search across multiple vector fields, combining and reranking the results of several ANN searches. | Python | MilvusClient"
type: docx
token: Iv1PdIVxYoDOMax47xDcLnbEnXb
sidebar_position: 9
keywords: 
  - HNSW
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - zilliz
  - zilliz cloud
  - cloud
  - hybrid_search()
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# hybrid_search()

This operation conducts a hybrid vector search across multiple vector fields, combining and reranking the results of several ANN searches.

## Request Syntax\{#request-syntax}

```python
hybrid_search(
    collection_name: str,
    reqs: List[AnnSearchRequest],
    ranker: Union[BaseRanker, Function],
    limit: int = 10,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    partition_names: Optional[List[str]] = None,
    **kwargs,
) -> SearchResult
```

**PARAMETERS:**

- **collection_name** (*str*) -<br/>
  **[REQUIRED]**<br/>
  The name of the collection to search.

- **reqs** (*List[AnnSearchRequest]*) -<br/>
  **[REQUIRED]**<br/>
  The ANN search requests combined by the hybrid search. Construct each request with `AnnSearchRequest(data, anns_field, param, limit, expr=None, expr_params=None, filter=None)`.

    - **data** (*Union[List, SparseMatrixInputType]*) -

**[REQUIRED]**
The query vectors or sparse matrix used for this ANN search request.

```plaintext
- **anns_field** (*str*) -
```

**[REQUIRED]**
The name of the vector field to search.

```plaintext
- **param** (*Dict*) -
```

**[REQUIRED]**
The ANN search parameters, such as the metric type and search-specific settings.

```plaintext
- **limit** (*int*) -
```

**[REQUIRED]**
The maximum number of matches returned by this ANN search request.

```plaintext
- **expr** (*Optional[str]*) -
```

Default: `None`
The Boolean filtering expression applied before the ANN search. Do not provide both `expr` and `filter`.

```plaintext
- **expr_params** (*Optional[dict]*) -
```

Default: `None`
The values substituted into expression-template placeholders.

```plaintext
- **filter** (*Optional[str]*) -
```

Default: `None`
The alias for `expr`. Do not provide both values. The resolved expression is available through the read-only `filter` property as `request.filter`.

- **ranker** (*Union[BaseRanker, Function]*) -<br/>
  **[REQUIRED]**<br/>
  The ranker used to combine and order results from the search requests.

- **limit** (*int*) -<br/>
  Default: `10`<br/>
  The maximum number of records to return, also known as `topk`.

- **output_fields** (*Optional[List[str]]*) -<br/>
  Default: `None`<br/>
  The scalar fields to include in each search result.

- **timeout** (*Optional[float]*) -<br/>
  Default: `None`<br/>
  The maximum time, in seconds, to wait for the RPC. When omitted, the client waits until the server responds or an error occurs.

- **partition_names** (*Optional[List[str]]*) -<br/>
  Default: `None`<br/>
  The names of the partitions to search.

- **kwargs** (*Any*) -<br/>
  The additional search options, including the top-level `offset` for pagination and the `consistency_level` for the search.

    The top-level `offset` is applied to the final results after candidate fusion and reranking. Note that the `offset` inside the `param` of an **AnnSearchRequest** is not supported in hybrid search and is ignored by Milvus.

    To make pagination work as expected, the `limit` of each **AnnSearchRequest** in **reqs** should cover the pagination window, that is, the sum of the top-level `offset` and `limit`. The sum of these two values should be less than or equal to 16,384.

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

Search results for the combined ANN requests after applying each request's expression or filter.

**EXCEPTIONS:**

- **MilvusException**

    Raised when the server rejects the request or the RPC fails. Inspect the server error message for exact failure details.

## Examples\{#examples}

The example runs a hybrid search with pagination. The top-level `offset` is applied to the final results after candidate fusion and reranking, so each `AnnSearchRequest.limit` covers the pagination window (`offset + limit`).

```python
from pymilvus import AnnSearchRequest, MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT", token="YOUR_CLUSTER_TOKEN")

# Create a collection, insert data, and load it
schema = client.create_schema(auto_id=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="text_vector", datatype=DataType.FLOAT_VECTOR, dim=3)
schema.add_field(field_name="image_vector", datatype=DataType.FLOAT_VECTOR, dim=3)
client.create_collection(collection_name="book_chunks", schema=schema)
index_params = client.prepare_index_params()
index_params.add_index(field_name="text_vector", index_type="AUTOINDEX", metric_type="IP")
index_params.add_index(field_name="image_vector", index_type="AUTOINDEX", metric_type="IP")
client.create_index(collection_name="book_chunks", index_params=index_params)
client.insert(collection_name="book_chunks", data=[
    {"id": i, "text_vector": [0.1, 0.2, 0.3], "image_vector": [0.3, 0.2, 0.1]}
    for i in range(30)
])
client.load_collection(collection_name="book_chunks")

requests = [
    AnnSearchRequest(
        data=[[0.1, 0.2, 0.3]],
        anns_field="text_vector",
        param={"metric_type": "IP"},
        limit=30,  # cover the pagination window (offset 20 + limit 10)
    ),
    AnnSearchRequest(
        data=[[0.3, 0.2, 0.1]],
        anns_field="image_vector",
        param={"metric_type": "IP"},
        limit=30,
    ),
]

# NOTE: Set the consistency level to Strong so that the entities inserted above
# are immediately visible and the example returns results. In production,
# choose a consistency level (for example, Bounded) that fits your scenario.
results = client.hybrid_search(
    collection_name="book_chunks",
    reqs=requests,
    ranker=None,
    limit=10,
    offset=20,  # return the third page of the fused and reranked results
    consistency_level="Strong",
)
print(results)
```
