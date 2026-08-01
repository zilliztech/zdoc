---
title: "Hugging Face Ranker | Cloud"
slug: /hugging-face-ranker
sidebar_label: "Hugging Face Ranker"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Vector search orders results by vector distance, but the initial order may not reflect how well each candidate's text answers the query. With a Hugging Face model provider integration, Hugging Face Ranker uses scores from the Hugging Face sentence-similarity task to reorder the candidates returned by vector search. | Cloud"
type: origin
token: P4UywHFH2iDFJWk2kwwcs22SnRc
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Hugging Face Ranker

Vector search orders results by vector distance, but the initial order may not reflect how well each candidate's text answers the query. With a [Hugging Face model provider integration](./integrate-with-model-providers), Hugging Face Ranker uses scores from the Hugging Face sentence-similarity task to reorder the candidates returned by vector search.

## How it works\{#how-it-works}

Hugging Face Ranker reranks candidate entities after vector search. The following diagram shows the general workflow between your application, Zilliz Cloud, and Hugging Face.

![KDOBw9YpBhRHkJbwjL3cmZfWnvf](https://zdoc-images.s3.us-west-2.amazonaws.com/KDOBw9YpBhRHkJbwjL3cmZfWnvf.png)

The general workflow has four steps:

1. **Retrieve candidate entities.** Zilliz Cloud runs vector search against the configured vector field and returns candidate entities.

1. **Prepare text for reranking.** The Ranker reads the query text from `params.queries` and the candidate text from the non-nullable `VARCHAR` field specified in `input_field_names`.

1. **Request reranking scores.** Zilliz Cloud sends the query and candidate text to Hugging Face and receives a newly calculated similarity score for each candidate.

1. **Rerank and return the results.** Zilliz Cloud maps the scores to the candidate entities, orders them from highest to lowest score, and returns the reranked results.

**How reranking scores are calculated**

The general workflow above shows where reranking occurs. The following process explains how Hugging Face calculates a new similarity score for each candidate.

![L1jQwyef6hP51bb9EYjc6pV6nTd](https://zdoc-images.s3.us-west-2.amazonaws.com/L1jQwyef6hP51bb9EYjc6pV6nTd.png)

1. **Prepare the text inputs.** The Ranker reads the query text from `params.queries` and the non-empty candidate text from the `VARCHAR` field specified in `input_field_names`.

1. **Create embeddings.** Zilliz Cloud sends the query text as `source_sentence` and the candidate texts as `sentences` to Hugging Face through `hf-inference` for the [Sentence Similarity](https://huggingface.co/docs/huggingface_hub/package_reference/inference_client#huggingface_hub.InferenceClient.sentence_similarity) task. The model conceptually creates a query embedding and separate embeddings for the candidate texts.

1. **Calculate and return scores.** The model compares the query embedding with each candidate embedding and returns one similarity score per candidate.

The embeddings shown in the diagram are intermediate model processing; the Hugging Face API returns only similarity scores. Vector retrieval and reranking use separate representations and scores. Hugging Face Ranker does not reuse the candidate vectors or retrieval scores. The embedding model used to create the search vectors and the Hugging Face model used for reranking are independent and can be different.

If you insert precomputed vectors, also store the original candidate text in a `VARCHAR` field so that Hugging Face Ranker can read it during reranking.

## Before you start\{#before-you-start}

Before using Hugging Face Ranker:

<Admonition type="info" icon="📘" title="Notes">

Zilliz Cloud connects to Hugging Face through [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) and uses the [`sentence-similarity`](https://huggingface.co/tasks/sentence-similarity) task for Hugging Face Ranker. Zilliz Cloud does not control whether a specific model is currently served by `hf-inference`, remains available, or meets your stability, latency, and output-quality requirements. Verify the selected model on Hugging Face and evaluate it for your workload before using it in production.

</Admonition>

- Create a Hugging Face model provider integration and copy its integration ID. For instructions, see [Integrate with Model Providers](./integrate-with-model-providers).

- Open the model's Hugging Face page and check the **Inference Providers** section. Verify that `hf-inference` currently serves the model for the `sentence-similarity` task.

- Ensure that the collection stores the candidate text in a non-nullable `VARCHAR` field. The rerank function must reference exactly one such field in `input_field_names`. The collection can contain other text fields.

## Use Hugging Face Ranker\{#use-hugging-face-ranker}

Hugging Face Ranker is defined and applied at search time. You can enable, disable, or change the ranker for each search request without changing the collection schema.

### Preparations\{#preparations}

The following setup creates a collection with three fields: `id` as the primary key, `document` as the `VARCHAR` field that stores the candidate text used for reranking, and `dense` as the vector field used for the initial search. It also inserts sample data for the search and reranking examples.

<details>

<summary>**Prepare a collection with sample data**</summary>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(
    uri="YOUR_ZILLIZ_CLOUD_URI",
    token="YOUR_ZILLIZ_CLOUD_TOKEN",
)

collection_name = "hugging_face_rerank_demo"

schema = client.create_schema()

schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("document", DataType.VARCHAR, max_length=1000)
schema.add_field("dense", DataType.FLOAT_VECTOR, dim=4)

index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params,
)

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

client.insert(collection_name=collection_name, data=data)
```

</details>

### Define the rerank function\{#define-the-rerank-function}

Define a `RERANK` function that uses the text stored in `document` to rerank the candidates returned by vector search. The function also specifies the query text, Hugging Face model, and model provider integration.

```python
from pymilvus import Function, FunctionType

hugging_face_ranker = Function(
    name="hugging_face_semantic_ranker",
    # Use the text stored in the "document" VARCHAR field for reranking.
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    # highlight-start
    params={
        "reranker": "model",
        "provider": "huggingface",
        "model_name": "sentence-transformers/all-MiniLM-L6-v2",
        "queries": ["renewable energy developments"],
        "integration_id": "YOUR_INTEGRATION_ID",
        "max_client_batch_size": 32,
    },
    # highlight-end
)
```

The example uses `sentence-transformers/all-MiniLM-L6-v2` only to demonstrate the configuration. The model is not a Zilliz Cloud recommendation or certification.

The following table describes all user-configurable entries in `params` for Hugging Face Ranker:

| Parameter | Required | Description |
| --- | --- | --- |
| `reranker` | Yes | The reranking implementation. Set this value to `model`. |
| `provider` | Yes | The Zilliz Cloud model provider. Set this value to `huggingface`. |
| `model_name` | Yes | The Hugging Face Model ID for a model currently served through `hf-inference` for the `sentence-similarity` task. |
| `queries` | Yes | A list of query texts used for reranking. Provide one string for each search query (`nq`), even when the initial search uses query vectors. |
| `integration_id` | Yes | The ID of the Hugging Face model provider integration. For instructions, see [Integrate with Model Providers](./integrate-with-model-providers). |
| `max_client_batch_size` | No | The maximum number of candidate texts sent to Hugging Face in one request. The default value is `32`. The value must be greater than `0`. |

Do not include the Hugging Face credential in the function definition.

### Search with the rerank function\{#search-with-the-rerank-function}

Pass the function to `search()` through the `ranker` parameter.

```python
query_vector = [0.12, 0.21, 0.29, 0.41]

results = client.search(
    collection_name=collection_name,
    data=[query_vector],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
    # highlight-next-line
    ranker=hugging_face_ranker,
)

print(results)
```

The search first retrieves candidate entities from the `dense` vector field. Hugging Face Ranker then uses the query text in `queries` and the `document` text from each candidate to calculate similarity scores through the sentence-similarity task. Zilliz Cloud returns the candidates in descending score order.

## Troubleshooting\{#troubleshooting}

### The model is unavailable for the sentence-similarity task\{#the-model-is-unavailable-for-the-sentence-similarity-task}

Open the model page on Hugging Face and check the **Inference Providers** section. Confirm that `hf-inference` currently serves the model and that the model supports `sentence-similarity`. If either requirement is not met, select another model and verify it on its model page. Zilliz Cloud does not maintain a supported-model catalog for Hugging Face models.

### The number of query texts does not match the search request\{#the-number-of-query-texts-does-not-match-the-search-request}

The number of strings in `queries` must equal the number of search queries (`nq`). For a search with one query vector, provide exactly one query string.

## Next steps\{#next-steps}

Hugging Face Ranker can also be used with hybrid search. Search and hybrid search apply the ranker in the same manner: pass the rerank function through the `ranker` parameter at search time.

For details, see [Multi-Vector Hybrid Search](./hybrid-search).