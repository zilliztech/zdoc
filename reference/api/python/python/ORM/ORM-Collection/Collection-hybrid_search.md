---
displayed_sidbar: pythonSidebar
title: "hybrid_search() | Python | ORM"
slug: /python/python/Collection-hybrid_search
sidebar_label: "hybrid_search()"
beta: NEAR DEPRECATE
notebook: false
description: "This operation performs multi-vector search on a collection and returns search results after reranking. | Python | ORM"
type: docx
token: QqOSdTDaLoOKGRxiKEtcuuiAnrf
sidebar_position: 17
keywords: 
  - rag llm architecture
  - private llms
  - nn search
  - llm eval
  - zilliz
  - zilliz cloud
  - cloud
  - hybrid_search()
  - pymilvus25
  - Recommender systems
  - information retrieval
  - dimension reduction
  - hnsw algorithm
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# hybrid_search()

This operation performs multi-vector search on a collection and returns search results after reranking.

## Request Syntax{#request-syntax}

```python
hybrid_search(
    reqs: List,
    rerank: BaseRanker,
    limit: int,
    partition_names: Optional[List[str]] = None,
    output_fields: Optional[List[str]] = None,
    timeout: Optional[float] = None,
    round_decimal: int = -1,
)
```

**PARAMETERS:**

- **reqs** (*List[AnnSearchRequest]*) -

    A list of search requests, where each request is an **ANNSearchRequest** object. Each request corresponds to a different vector field and a different set of search parameters.

    - **ANNSearchRequest**: A class representing an ANN search request.

        ```python
        ├── AnnSearchRequest
        │   └── data  
        │   └── anns_field
        │   └── param 
        │   └── limit 
        │   └── expr
        ```

        - **data** (*List*): The query vector to search in the request. This parameter accepts a list containing one element.

        - **anns_field** (*str*): The vector field to use in the request.

        - **param** (*dict*): A dictionary of search parameters for the request. For details, refer to [Search parameters](https://milvus.io/docs/single-vector-search#search-parameters).

        - **limit** (*int*): The maximum number of results to return in the request. When performing a hybrid search with multiple ANN search requests, the top results defined by **limit** from each request will be combined and re-ranked before returning the final search results.

        - **expr** (*str*): (Optional) The expression to filter the results.

- **rerank** (*BaseRanker*) -

    The reranking strategy to use for hybrid search. Valid values: `WeightedRanker` and `RRFRanker`.

    - `WeightedRanker`: The Average Weighted Scoring reranking strategy, which prioritizes vectors based on relevance, averaging their significance.

    - `RRFRanker`: The RRF reranking strategy, which merges results from multiple searches, favoring items that consistently appear.

- **limit** (*int*) -

    The total number of entities to return.

    You can use this parameter in combination with `offset` in **param** to enable pagination.

    The sum of this value and `offset` in **param** should be less than 16,384.

- **partition_names** (*List[str]*) -

    A list of partition names.

    The value defaults to **None**. If specified, only the specified partitions are involved in queries.

- **output_fields** (*List[str]*) -

    A list of field names to include in each entity in return.

    The value defaults to **None**. If left unspecified, only the primary field is included.

- **timeout** (*float*) -

    The timeout duration for this operation. Setting this to **None** indicates that this operation timeouts when any response arrives or any error occurs.

- **round_decimal** (int) -

    The number of decimal places that Milvus rounds the calculated distances to.

    The value defaults to **-1**, indicating that Milvus skips rounding the calculated distances and returns the raw value.

- **group_by_field** (*str*)

    Groups search results by a specified field to ensure diversity and avoid returning multiple results from the same group. For details, refer to [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search).

- **group_size** (*int*)

    The target number of entities to return within each group in a grouping search. For details, refer to [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search).

- **strict_group_size** (*bool*)

    Controls whether **group_size** should be strictly enforced. For details, refer to [Grouping Search](https://milvus.io/docs/grouping-search.md#Grouping-Search).

**RETURN TYPE:**

*SearchResult*

**RETURNS:**

A **SearchResult** object that contains a list of **Hits** objects. 

- Response structure

    <Admonition type="info" icon="📘" title="Notes">

    <p>A <strong>SearchResult</strong> object contains a list of <strong>Hits</strong> objects, each corresponding to a query vector in the search request. </p>
    <p>A <strong>Hits</strong> object contains a list of <strong>Hit</strong> objects, each corresponding to an entity hit by the search.</p>

    </Admonition>

    ```plaintext
    ├── SearchResult
    │   └── Hits  
    │       ├── ids
    │       ├── distances
    │       └── Hit
    │           ├── id
    │           ├── distance
    │           ├── score
    │           ├── vector
    │           └── get()
    ```

- Properties and methods

    - A **Hits** object has the following fields:

        - **ids** (*list[int]* | *list[str]*)

            A list containing the IDs of the hit entities.

        - **distances** (list[float]) 

            A list of distances from the hit entities' vector fields to the query vector.

    - A **Hit** object has the following fields:

        - **id** (*int* | *str*)

            The ID of a hit entity.

        - **distance** (*float*)

            The distance from a hit entity's vector field to the query vector.

        - **score** (*float*)

            An alias to **distance**.

        - **vector** (*list[float]*)   

            The vector field of a hit entity.

        - **get(*field_name: str*)**

            A function to get the value of the specified field in a hit entity. 

**EXCEPTIONS:**

- **MilvusException**

    This exception will be raised when any error occurs during this operation.

## Examples{#examples}

```python
collection = Collection(name='{your_collection_name}') # Replace with the actual name of your collection

res = collection.hybrid_search(
    reqs=[
        AnnSearchRequest(
            data=[['{your_text_query_vector}']],  # Replace with your text vector data
            anns_field='{text_vector_field_name}',  # Textual data vector field
            param={"metric_type": "IP", "params": {"nprobe": 10}}, # Search parameters
            limit=2
        ),
        AnnSearchRequest(
            data=[['{your_image_query_vector}']],  # Replace with your image vector data
            anns_field='{image_vector_field_name}',  # Image data vector field
            param={"metric_type": "IP", "params": {"nprobe": 10}}, # Search parameters
            limit=2
        )
    ],
    # Use WeightedRanker to combine results with specified weights
    rerank=WeightedRanker(0.8, 0.2), # Assign weights of 0.8 to text search and 0.2 to image search
    # Alternatively, use RRFRanker for reciprocal rank fusion reranking
    # rerank=RRFRanker(),
    limit=2
)
```
