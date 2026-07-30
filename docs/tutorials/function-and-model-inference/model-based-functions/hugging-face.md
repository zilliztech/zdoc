---
title: "Hugging Face | Cloud"
slug: /hugging-face
sidebar_key: hugging-face
sidebar_label: "Hugging Face"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Using a Hugging Face embedding model normally requires your application to manage credentials, call the model separately, and generate embeddings consistently for inserted data and search queries. With a Hugging Face model provider integration and a Text Embedding Function, Zilliz Cloud converts raw text into vectors during insert and search. | Cloud"
type: origin
token: ETsNwO7T0iR5GDkvuMxcJG7JnIb
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - function
  - model
  - inference
  - text
  - embedding
  - hugging face

---

import Admonition from '@theme/Admonition';


# Hugging Face

Using a Hugging Face embedding model normally requires your application to manage credentials, call the model separately, and generate embeddings consistently for inserted data and search queries. With a [Hugging Face model provider integration](null) and a Text Embedding Function, Zilliz Cloud converts raw text into vectors during insert and search.

## How it works\{#how-it-works}

![XCxpwN8JvhevN8bAvbzcI72Fngg](https://zdoc-images.s3.us-west-2.amazonaws.com/XCxpwN8JvhevN8bAvbzcI72Fngg.png)

The workflow has three steps:

1. **Send raw text.** Your application provides raw text in an insert or search request.

1. **Generate an embedding.** The Text Embedding Function uses `integration_id` to reference the Hugging Face model provider integration and `model_name` to select the model. Zilliz Cloud sends the text to Hugging Face through `hf-inference` for the [Feature Extraction](https://huggingface.co/docs/inference-providers/en/tasks/feature-extraction) task.

1. **Use the embedding.** Hugging Face returns a floating-point embedding vector. During insert, Zilliz Cloud stores the vector in the Function's output field. During search, Zilliz Cloud uses the vector as the query vector.

The same Function configuration is used for insert and search, which keeps the model and inference parameters consistent across both operations.

## Model compatibility\{#model-compatibility}

To use a Hugging Face model with the Text Embedding Function, the model must have the [Feature Extraction](https://huggingface.co/docs/inference-providers/tasks/feature-extraction#api-specification) capability and successfully return embeddings through the configured [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) integration. The Function output field must be a `FLOAT_VECTOR` field whose `dim` matches the model's embedding dimension.

The following models passed compatibility testing with Zilliz Cloud on the listed date.

<table>
   <tr>
     <th><p>Model</p></th>
     <th><p>Capability</p></th>
     <th><p>Dimension</p></th>
     <th><p>Last tested</p></th>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/BAAI/bge-m3"><code>BAAI/bge-m3</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/BAAI/bge-large-zh-v1.5"><code>BAAI/bge-large-zh-v1.5</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/BAAI/bge-large-en-v1.5"><code>BAAI/bge-large-en-v1.5</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/BAAI/bge-small-en-v1.5"><code>BAAI/bge-small-en-v1.5</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>384</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/dragonkue/snowflake-arctic-embed-l-v2.0-ko"><code>dragonkue/snowflake-arctic-embed-l-v2.0-ko</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
   <tr>
     <td><p><a href="https://huggingface.co/upskyy/bge-m3-korean"><code>upskyy/bge-m3-korean</code></a></p></td>
     <td><p>Feature Extraction</p></td>
     <td><p>1024</p></td>
     <td><p>2026-07-27</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

This table is not an exhaustive list of compatible models. Models not listed may still be compatible with the integration.

Compatibility results reflect testing on the listed date. Zilliz Cloud does not control whether a model remains available through [`hf-inference`](https://huggingface.co/docs/inference-providers/providers/hf-inference) or meets your stability, latency, and output-quality requirements. Zilliz Cloud does not commit to regularly retesting historical results. Verify the selected model on Hugging Face and evaluate it for your workload before using it in production.

</Admonition>

## Before you start\{#before-you-start}

Before using Hugging Face text embedding:

- Create a Hugging Face model provider integration and copy its integration ID. Set **Provider** to `hf-inference`. For instructions, see [Integrate with Model Providers](./integrate-with-moddel-providers).

- Open the model's Hugging Face page and check the **Inference Providers** section. Verify that `hf-inference` currently serves the model for the `feature-extraction` task.

- Check the model's output dimension. The Function output field must be a `FLOAT_VECTOR` field whose `dim` matches the model output. Custom output dimensions are not supported.

The examples use `BAAI/bge-small-en-v1.5`, which produces 384-dimensional embeddings through `hf-inference` at the time of writing. The model is used only to demonstrate the configuration and is not a Zilliz Cloud recommendation or certification.

## Use Hugging Face text embedding\{#use-hugging-face-text-embedding}

### Step 1: Create a collection with a text embedding function\{#step-1-create-a-collection-with-a-text-embedding-function}

#### Define schema fields\{#define-schema-fields}

Create a collection schema containing:

- A primary field that uniquely identifies each entity.

- A `VARCHAR` field that stores the raw text.

- A `FLOAT_VECTOR` field whose dimension matches the selected model's output dimension.

The following example uses `BAAI/bge-small-en-v1.5`, which produces 384-dimensional vectors.

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN",
)

schema = client.create_schema()

schema.add_field(
    field_name="id",
    datatype=DataType.INT64,
    is_primary=True,
    auto_id=False,
)

schema.add_field(
    field_name="document",
    datatype=DataType.VARCHAR,
    max_length=9000
,
)

# The vector dimension must match the model's output dimension.
schema.add_field(
    field_name="dense",
    datatype=DataType.FLOAT_VECTOR,
    # highlight-next-line
    dim=384,
)
```

#### Define the text embedding function\{#define-the-text-embedding-function}

Define a `TEXTEMBEDDING` Function that converts values from the `document` field into embeddings and writes them to the `dense` field.

```python
text_embedding_function = Function(
    name="hugging_face_embedding",
    input_field_names=["document"],
    output_field_names=["dense"],
    function_type=FunctionType.TEXTEMBEDDING,
    # highlight-start
    params={
        "provider": "huggingface",
        "model_name": "BAAI/bge-small-en-v1.5",
        "integration_id": "YOUR_INTEGRATION_ID",
        "normalize": "true",
        "truncate": "true",
    },
    # highlight-end
)

schema.add_function(text_embedding_function)
```

The following table describes all supported entries in `params`. The Hugging Face request options follow the [Feature Extraction API specification](https://huggingface.co/docs/inference-providers/en/tasks/feature-extraction#api-specification); `provider`, `model_name`, `integration_id`, and `max_client_batch_size` configure the Zilliz Cloud integration.

<table>
   <tr>
     <th><p>Parameter</p></th>
     <th><p>Required</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>provider</code></p></td>
     <td><p>Yes</p></td>
     <td><p>The Zilliz Cloud model provider. Set this value to <code>huggingface</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>model_name</code></p></td>
     <td><p>Yes</p></td>
     <td><p>The Hugging Face Model ID for a model currently served through <code>hf-inference</code> for the <code>feature-extraction</code> task.</p></td>
   </tr>
   <tr>
     <td><p><code>integration_id</code></p></td>
     <td><p>Yes</p></td>
     <td><p>The ID of the Hugging Face model provider integration. For instructions, see <a href="./integrate-with-model-providers">Integrate with Model Providers</a>.</p></td>
   </tr>
   <tr>
     <td><p><code>normalize</code></p></td>
     <td><p>No</p></td>
     <td><p>Whether to request normalized embeddings. If omitted, Zilliz Cloud does not set this option in the Hugging Face request; behavior follows the selected model.</p></td>
   </tr>
   <tr>
     <td><p><code>prompt_name</code></p></td>
     <td><p>No</p></td>
     <td><p>The name of a prompt defined in the selected model's Sentence Transformers configuration. Hugging Face prepends the corresponding prompt text before encoding. If omitted, no prompt is requested.</p></td>
   </tr>
   <tr>
     <td><p><code>truncate</code></p></td>
     <td><p>No</p></td>
     <td><p>Whether to request truncation when an input exceeds the model's supported length. If omitted, Zilliz Cloud does not set this option in the Hugging Face request; behavior follows the selected model.</p></td>
   </tr>
   <tr>
     <td><p><code>truncation_direction</code></p></td>
     <td><p>No</p></td>
     <td><p>The direction from which Hugging Face truncates an input. Supported values are <code>left</code> and <code>right</code>.</p></td>
   </tr>
   <tr>
     <td><p><code>max_client_batch_size</code></p></td>
     <td><p>No</p></td>
     <td><p>The maximum number of input texts sent to Hugging Face in one request. The default value is <code>128</code>. The value must be greater than <code>0</code>.</p></td>
   </tr>
</table>

#### Configure the index\{#configure-the-index}

Configure an index for the output vector field. The following example uses `AUTOINDEX` and cosine similarity.

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="dense",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)
```

#### Create the collection\{#create-the-collection}

Create the collection with the schema and index parameters.

```python
client.create_collection(
    collection_name="hugging_face_demo",
    schema=schema,
    index_params=index_params,
)
```

The collection is created with a text embedding function that writes 384-dimensional vectors to the `dense` field.

### Step 2: Insert data\{#step-2-insert-data}

Insert raw text without providing vectors. Zilliz Cloud calls the Hugging Face model and writes the generated embeddings to the `dense` field.

```python
client.insert(
    collection_name="hugging_face_demo",
    data=[
        {
            "id": 1,
            "document": "Milvus simplifies semantic search through embeddings.",
        },
        {
            "id": 2,
            "document": "Vector embeddings convert text into searchable numeric data.",
        },
        {
            "id": 3,
            "document": "Semantic search helps users find relevant information quickly.",
        },
    ],
)
```

The insert operation stores the raw text and generates one embedding for each entity.

### Step 3: Search with text\{#step-3-search-with-text}

Search using raw query text. Zilliz Cloud uses the same Function, model, and optional inference parameters to convert the query text into an embedding before running vector search.

```python
results = client.search(
    collection_name="hugging_face_demo",
    data=["How does Milvus handle semantic search?"],
    anns_field="dense",
    limit=3,
    output_fields=["document"],
)

print(results)
```

The search result contains the documents most relevant to the query text, ordered by cosine similarity.

## Troubleshooting\{#troubleshooting}

### The model is unavailable for the feature-extraction task\{#the-model-is-unavailable-for-the-feature-extraction-task}

Open the model page on Hugging Face and check the **Inference Providers** section. Confirm that `hf-inference` currently serves the model and that the model supports `feature-extraction`. If either requirement is not met, select another model and verify it on its model page. The Model compatibility table is not exhaustive, and models not listed may still be compatible. If you change models, make sure that the Function output field dimension matches the replacement model.

### The returned vector dimension does not match the schema\{#the-returned-vector-dimension-does-not-match-the-schema}

Check the model's output dimension and compare it with the `dim` configured for the Function's `FLOAT_VECTOR` output field. To use a model with a different dimension, create a compatible vector field or collection. Custom output dimensions are not supported.

## Next steps\{#next-steps}

For general information about Functions, see [Function Overview](./function-and-model-inference-overview).

To rerank vector-search candidates using Hugging Face Sentence Similarity scores, see [Hugging Face Ranker](./hugging-face-ranker).