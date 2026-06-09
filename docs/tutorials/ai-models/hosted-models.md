---
title: "Hosted Models | Cloud"
slug: /hosted-models
sidebar_label: "Hosted Models"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud can host embedding and reranking models on Zilliz-managed infrastructure. You can deploy dedicated, fully managed model instances and use them directly from Zilliz Cloud for stable and high-performance inference. | Cloud"
type: origin
token: DMrCwn4LXi1uKBkbHGfcpGnsnyh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Hosted Models

Zilliz Cloud can host **embedding** and **reranking** models on Zilliz-managed infrastructure. You can deploy dedicated, fully managed model instances and use them directly from Zilliz Cloud for stable and high-performance inference. 

With a managed model instance, you can insert raw data into a collection. Zilliz Cloud automatically generates vector embeddings with the deployed model during ingestion. For semantic search, you only provide the raw query text. Zilliz Cloud uses the same model to create a query vector, compares it with stored vectors, and returns the most relevant results.

The following diagram shows the procedures for using hosted models.

![NkgEwmrJDhyXiubY6HpcssaynHg](https://zdoc-images.s3.us-west-2.amazonaws.com/NkgEwmrJDhyXiubY6HpcssaynHg.png)

## Deploy a model\{#deploy-a-model}

Currently, Zilliz Cloud supports the following regions, instance types, and models.

<Admonition type="info" icon="📘" title="Notes">

<p>If you have specific requirements for hosted models, please <a href="http://support.zilliz.com">contact us</a>.</p>

</Admonition>

### Supported regions\{#supported-regions}

The model deployment region should be consistent with your cluster region. Available options include:

<table>
   <tr>
     <th><p><strong>Region</strong></p></th>
     <th><p><strong>Location</strong></p></th>
   </tr>
   <tr>
     <td><p>aws-us-west-2</p></td>
     <td><p>Oregon, USA</p></td>
   </tr>
</table>

### Supported instance type\{#supported-instance-type}

The instance type determines the available compute resources. Available options include:

<table>
   <tr>
     <th><p><strong>Instance Type</strong></p></th>
     <th><p><strong>Resources</strong></p></th>
   </tr>
   <tr>
     <td><p>g6.xlarge </p></td>
     <td><ul><li><p>1 Nvidia L4 GPU</p></li><li><p>8 vCPU</p></li><li><p>32 GB RAM</p></li></ul></td>
   </tr>
</table>

### Supported models\{#supported-models}

Available options include:

<table>
   <tr>
     <th><p><strong>Type</strong></p></th>
     <th><p><strong>Model</strong></p></th>
     <th><p><strong>Description</strong></p></th>
   </tr>
   <tr>
     <td rowspan="9"><p>Embedding</p></td>
     <td><p><code>Qwen/Qwen3-Embedding-0.6B</code></p></td>
     <td><p>Lightweight multilingual embedding model for efficient semantic retrieval, code retrieval, classification, and clustering; supports 100+ languages, 32K context, and up to 1024-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Embedding-4B</code></p></td>
     <td><p>Balanced Qwen3 embedding model for stronger multilingual and cross-lingual retrieval quality while keeping deployment cost lower than the 8B model; supports 32K context and up to 2560-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Embedding-8B</code></p></td>
     <td><p>Highest-capacity Qwen3 embedding model for accuracy-focused multilingual, long-text, and code retrieval workloads; supports 32K context and up to 4096-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-small-en-v1.5</code></p></td>
     <td><p>Compact English BGE embedding model for low-cost, low-latency semantic search and retrieval; uses 384-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-small-zh-v1.5</code></p></td>
     <td><p>Compact Chinese BGE embedding model for efficient Chinese semantic search and retrieval; uses 512-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-base-en-v1.5</code></p></td>
     <td><p>Mid-size English BGE embedding model that balances retrieval quality and efficiency; uses 768-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-base-zh-v1.5</code></p></td>
     <td><p>Mid-size Chinese BGE embedding model that balances quality and efficiency for Chinese retrieval workloads; uses 768-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-large-en-v1.5</code></p></td>
     <td><p>High-quality English BGE embedding model for accuracy-sensitive semantic search, RAG, and retrieval workloads; uses 1024-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-large-zh-v1.5</code></p></td>
     <td><p>High-quality Chinese BGE embedding model for accuracy-sensitive Chinese semantic search and retrieval; uses 1024-dimensional embeddings.</p></td>
   </tr>
   <tr>
     <td rowspan="5"><p>Reranking</p></td>
     <td><p><code>BAAI/bge-reranker-base</code></p></td>
     <td><p>Lightweight English and Chinese cross-encoder reranker for reordering retrieved candidates with fast inference and easy deployment.</p></td>
   </tr>
   <tr>
     <td><p><code>BAAI/bge-reranker-large</code></p></td>
     <td><p>Larger English and Chinese cross-encoder reranker for higher-quality reranking when accuracy matters more than inference cost.</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Reranker-0.6B</code></p></td>
     <td><p>Lightweight Qwen3 text reranking model for efficient multilingual and code-related retrieval workflows; supports 100+ languages, 32K context, and instruction-aware reranking.</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Reranker-4B</code></p></td>
     <td><p>Balanced Qwen3 reranking model for stronger multilingual, cross-lingual, long-text, and code retrieval quality while keeping deployment cost below the 8B model.</p></td>
   </tr>
   <tr>
     <td><p><code>Qwen/Qwen3-Reranker-8B</code></p></td>
     <td><p>Highest-capacity Qwen3 reranking model for accuracy-focused retrieval scenarios that need strong multilingual, long-context, and instruction-aware ranking performance.</p></td>
   </tr>
   <tr>
     <td><p>Semantic Highlighter</p></td>
     <td><p><code>zilliz/semantic-highlight-bilingual-v1</code></p></td>
     <td><p>Lightweight bilingual semantic highlighting model for RAG and search workflows; identifies English or Chinese text segments that are semantically relevant to a query, helping users highlight useful context and reduce unnecessary tokens before generation.</p></td>
   </tr>
</table>

## Obtain a deployment ID\{#obtain-a-deployment-id}

Using the information you provide, Zilliz will deploy the model for you which takes about 15 minutes. When the deployment is ready, Zilliz Cloud Support will return a **deployment ID**, which you will use when creating embedding or reranking functions.

```bash
"deploymentId": "68f8889be4b01215a275972a"
```

## Use the deployed model in a function\{#use-the-deployed-model-in-a-function}

Once you have the **deployment ID**, you can create collections that use the deployed model through embedding or reranking functions.

### Use an embedding function\{#use-an-embedding-function}

1. Create a collection with embedding function.

    - Define at least one `VARCHAR` field for the raw text.

    - Define at least one vector field for the embedding vectors generated by the model.

    - Set the vector field dimension to match the model’s output dimension.

    ```python
    schema = milvus_client.create_schema()
    schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
    schema.add_field("document", DataType.VARCHAR, max_length=9000)
    schema.add_field("dense", DataType.FLOAT_VECTOR, dim=384) # important, the dimension must be supported by the deployed model.
    
    # define embedding function
    text_embedding_function = Function(
        name="zilliz-bge-small-en-v1.5",
        function_type=FunctionType.TEXTEMBEDDING,
        input_field_names=["document"], # Scalar field(s) containing text data to embed
        output_field_names="dense", # Vector field(s) for storing embeddings
     # highlight-start
        params={
            "provider": "zilliz",
            "model_deployment_id": "...", # Use the model deployment ID we provide you
            "truncation": True, # Optional: if true, inputs greater than the max supported input length of the model will be truncated
            "dimension": "384",                # Optional: Shorten the output vector dimension, only if supported by the model
        }
    # highlight-end
    )
    
    schema.add_function(text_embedding_function)
    
    index_params = milvus_client.prepare_index_params()
    index_params.add_index(
        field_name="dense",
        index_name="dense_index",
        index_type="AUTOINDEX",
        metric_type="IP",
    )
    
    ret = milvus_client.create_collection(collection_name, schema=schema, index_params=index_params, consistency_level="Strong")
    ```

1. Insert raw text data.

    Insert only the raw text into the collection. Zilliz Cloud automatically calls the embedding function and populates the vector field.

    ```python
    rows = [
            {"id": 1, "document": "Artificial intelligence was founded as an academic discipline in 1956."},
            {"id": 2, "document": "Alan Turing was the first person to conduct substantial research in AI."},
            {"id": 3, "document": "Born in Maida Vale, London, Turing was raised in southern England."},
    ]
    
    insert_result = milvus_client.insert(collection_name, rows, progress_bar=True)
    
    ```

1. Conduct a similarity search with raw text data.

    Provide the query as raw text. Zilliz Cloud generates the query vector using the same model and performs the similarity search.

    ```python
    search_params = {
        "params": {"nprobe": 10},
    }
    queries = ["When was artificial intelligence founded", 
               "Where was Alan Turing born?"]
    
    result = milvus_client.search(collection_name, data=queries, anns_field="dense", search_params=search_params, limit=3, output_fields=["document"], consistency_level="Strong")
    ```

### Use a reranking function\{#use-a-reranking-function}

You can also configure a reranking function that uses the deployed model to rerank search results.

```python
import numpy as np
rng = np.random.default_rng(seed=19530)
vectors_to_search = rng.random((1, dim))

# define reranking function
ranker = Function(
    name="model_rerank_fn",
    input_field_names=["document"],
    function_type=FunctionType.RERANK,
    params={
        "reranker": "model", 
        "provider": "zilliz",
        "model_deployment_id": "...", # Use the model deployment ID we provide you,
        "queries": ["machine learning for time series"] * len(vectors_to_search),  # Query text, the number of query strings must match exactly the number of queries in your search operation
    }
)

# Use it during search
result = milvus_client.search(collection_name, vectors_to_search, limit=3, output_fields=["*"], ranker=ranker)
```

### Use a semantic highlighter function\{#use-a-semantic-highlighter-function}

During search, you can use a hosted highlighter model to post-process your search results by highlighting text segments that are semantically related to the user's query.  

```python
from pymilvus import SemanticHighlighter

# Define the search query
queries = ["When was artificial intelligence founded"]

# Configure semantic highlighter
# highlight-start
highlighter = SemanticHighlighter(
    queries,
    ["document"],                           # Fields to highlight
    pre_tags=["<mark>"],                    # Tag before highlighted text
    post_tags=["</mark>"],                  # Tag after highlighted text
    model_deployment_id="YOUR_MODEL_ID",    # Deployed highlight model ID
)
# highlight-end

# Perform search with highlighting
results = milvus_client.search(
    collection_name,
    data=queries,
    anns_field="dense",
    search_params={"params": {"nprobe": 10}},
    limit=3,
    output_fields=["document"],
    highlighter=highlighter
)

# Process results
for hits in results:
    for hit in hits:
        highlight = hit.get("highlight", {}).get("document", {})
        print(f"ID: {hit['id']}")
        print(f"Search Score: {hit['distance']:.4f}")      # Vector similarity score
        print(f"Fragments: {highlight.get('fragments', [])}")
        print(f"Highlight Confidence: {highlight.get('scores', [])}")  # Semantic relevance score
        print()
```

## Billing\{#billing}

Using hosted models only incurs function and model services charges. Because inference runs within Zilliz Cloud, your data does not traverse the public internet—so you will not incur data transfer charges.

For model unit prices by region, please [contact sales](http://zilliz.com/contact-sales).

### Cost calculation\{#cost-calculation}

```plaintext
Function and Model Services Cost = Model Unit Price x Usage Time
```

- **Model Unit Price**: For details, [contact sales](http://zilliz.com/contact-sales).

- **Usage Time**: The total time the model deployment is running, measured in hours, regardless of whether the model is actively used.

