---
title: "Voyage AI Ranker | Cloud"
slug: /voyage-ai-model-ranker
sidebar_label: "Voyage AI Ranker"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Voyage AI Ranker leverages Voyage AI's and search applications. | Cloud"
type: origin
token: PpGlwYU6PiSsfVkZ7doco50vnKg
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Voyage AI Ranker

The Voyage AI Ranker leverages [Voyage AI's](https://www.voyageai.com/) specialized rerankers to enhance search relevance through semantic reranking. It provides high-performance reranking capabilities optimized for retrieval-augmented generation (RAG) and search applications.

Voyage AI Ranker is particularly valuable for applications requiring:

- Advanced semantic understanding with models specifically trained for reranking tasks

- High-performance processing with optimized inference for production workloads

- Flexible truncation controls for handling diverse document lengths

- Fine-tuned performance across different model variants (rerank-2, rerank-lite, etc.)

## Before you start\{#before-you-start}

Before using the Voyage AI Ranker, make sure the following prerequisites are met.

- **Choose a rerank model**

    Decide which Cohere rerank model to use, such as `rerank-2.5`. Your choice determines how semantic relevance is evaluated during reranking. For details, see [Voyage AI official documentation](https://docs.voyageai.com/docs/reranker).

- **Integrate with Voyage AI and get your integration ID**

    To use Voyage AI Ranker, you must first integrate Voyage AI as a model provider in the [Zilliz Cloud console](https://cloud.zilliz.com/login).

    After integration, Zilliz Cloud generates an **integration ID**, which you will reference when defining the rerank function. For detailed steps, see [Integrate with Model Providers](./integrate-with-model-providers).

- **Plan a collection schema with a rerankable text field**

    Ensure that your collection includes one `VARCHAR` field containing the text to be reranked.

## Use Voyage AI Ranker\{#use-voyage-ai-ranker}

This section shows how to apply Voyage AI Ranker during search to rerank retrieved results.

The rerank function is defined and applied at search time, allowing you to enable, disable, or change reranking behavior on a per-query basis.

### Preparations\{#preparations}

The following setup prepares a collection and sample data for search and reranking.

<details>

<summary><strong>Prepare a collection with sample data</strong></summary>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_ZILLIZ_CLOUD_URI",
    token="YOUR_ZILLIZ_CLOUD_TOKEN",
)

collection_name = "voyage_rerank_demo"

# Define collection schema
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("document", DataType.VARCHAR, max_length=1000)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=4)

# Configure index
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

# Create collection
client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params
)

# Insert sample data
data = [
    {
        "id": 1,
        "document": "Recent renewable energy developments include improved solar efficiency.",
        "dense": [0.10, 0.20, 0.30, 0.40],
    },
    {
        "id": 2,
        "document": "Climate policy and carbon markets have evolved rapidly in recent years.",
        "dense": [0.11, 0.19, 0.28, 0.39],
    },
    {
        "id": 3,
        "document": "New battery technology helps stabilize wind and solar power generation.",
        "dense": [0.90, 0.10, 0.05, 0.02],
    },
    {
        "id": 4,
        "document": "Vector databases support similarity search for machine learning applications.",
        "dense": [0.01, 0.02, 0.03, 0.04],
    },
]

client.insert(collection_name, data)
```

</details>

### Define the rerank function\{#define-the-rerank-function}

Voyage AI Ranker is defined **at search time**, not as part of the collection schema.

The rerank function specifies:

- which text field (`VARCHAR`) to rerank

- which Voyage AI model to use

- how queries and documents are truncated or validated

```python
from pymilvus import Function, FunctionType

voyage_ranker = Function(
    name="voyage_semantic_ranker",
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model",
        "provider": "voyageai",
        "model_name": "rerank-2.5",
        "queries": ["renewable energy developments"],
        "truncation": True,

        "integration_id": "YOUR_INTEGRATION_ID",

    }
)
```

<Admonition type="info" icon="📘" title="Notes">

<p>The number of strings in <code>queries</code> must match the number of queries issued in the search request.</p>

</Admonition>

### Search with the rerank function\{#search-with-the-rerank-function}

```python
query_vector = [0.12, 0.21, 0.29, 0.41]

results = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    # highlight-next-line
    ranker=voyage_ranker,
)

print(results)
```

During this search:

1. Candidates are retrieved using vector search.

1. Voyage AI Ranker evaluates semantic relevance for each candidate.

1. The result set is reordered before being returned.

## Next steps\{#next-steps}

Voyage AI Ranker can also be used with hybrid search.

Search and hybrid search apply the ranker in the same manner:

In both cases, you pass the rerank function via the `ranker` parameter at search time.

For details, see [Multi-Vector Hybrid Search](./hybrid-search).