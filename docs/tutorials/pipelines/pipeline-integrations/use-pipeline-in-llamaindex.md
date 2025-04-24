---
title: "Using Pipelines in LlamaIndex | Cloud"
slug: /use-pipeline-in-llamaindex
sidebar_label: "Using Pipelines in LlamaIndex"
beta: NEAR DEPRECATE
notebook: FALSE
description: "Zilliz Cloud Pipelines](./pipelines) is a scalable API service for retrieval. You can use Zilliz Cloud Pipelines as managed indexes in [LLamaIndex. This service can transform documents into vector embeddings and store them in Zilliz Cloud for effective semantic search. | Cloud"
type: origin
token: Wg3kwOqKXiJQK9k7wh2ccanlnhg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - integration
  - llamaindex
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';


# Using Pipelines in LlamaIndex

[Zilliz Cloud Pipelines](./pipelines) is a scalable API service for retrieval. You can use Zilliz Cloud Pipelines as managed indexes in [LLamaIndex](https://docs.llamaindex.ai/en/stable/examples/managed/zcpDemo.html). This service can transform documents into vector embeddings and store them in Zilliz Cloud for effective semantic search.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud Pipelines will be discontinued by the end of Q2 2025 and replaced by a new feature, “Data In, Data Out,” to streamline embedding generation in both Milvus and Zilliz Cloud. As of December 24, 2024, new user registrations are no longer accepted. Current users can continue using the service within the $20 monthly free allowance until the sunset date; however, no SLA is provided. Please consider using embedding APIs from model providers or open-source models to generate vector embeddings.</p>

</Admonition>

## Before you start{#before-you-start}

You should

- Install LLamaIndex Python SDK

    ```bash
    pip install llama-index
    ```

- Configure credentials of your [OpenAI](https://platform.openai.com/) & [Zilliz Cloud](https://cloud.zilliz.com/signup?utm_source=twitter&amp;utm_medium=social%20&amp;utm_campaign=2023-12-22_social_pipeline-llamaindex_twitter) accounts.

    ```python
    from getpass import getpass
    import os
    
    os.environ["OPENAI_API_KEY"] = getpass("Enter your OpenAI API Key:")
    
    ZILLIZ_PROJECT_ID = getpass("Enter your Zilliz Project ID:")
    ZILLIZ_CLUSTER_ID = getpass("Enter your Zilliz Cluster ID:")
    ZILLIZ_TOKEN = getpass("Enter your Zilliz API Key:")
    ```

## Index documents{#index-documents}

Zilliz Cloud Pipelines accepts files from AWS S3 and Google Cloud Storage. You can generate a presigned url from the Object Storage and use `from_document_url()` or `insert_doc_url()` to ingest the file. It can automatically index the document and store the doc chunks as vectors on Zilliz Cloud.

```python
from llama_index.indices import ZillizCloudPipelineIndex

zcp_index = ZillizCloudPipelineIndex.from_document_url(
    # a public or pre-signed url of a file stored on AWS S3 or Google Cloud Storage
    url="https://raw.githubusercontent.com/milvus-io/milvus-docs/refs/heads/v2.5.x/site/en/about/overview.md",
    project_id=ZILLIZ_PROJECT_ID,
    cluster_id=ZILLIZ_CLUSTER_ID,
    token=ZILLIZ_TOKEN,
    # optional
    metadata={"version": "2.3"},  # used for filtering
    collection_name="zcp_llamalection",  # change this value will specify customized collection name
)

# Insert more docs, eg. a Milvus v2.2 document
zcp_index.insert_doc_url(
    url="https://raw.githubusercontent.com/milvus-io/milvus-docs/refs/heads/v2.2.x/site/en/about/overview.md",
    metadata={"version": "2.2"},
)

# Output
# {'token_usage': 984, 'doc_name': 'milvus_doc_22.md', 'num_chunks': 7}

# # Delete docs by doc name
# zcp_index.delete_by_doc_name(doc_name="milvus_doc_22.md")
```

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz Cloud pipelines are to be created automatically if there is none.</p></li>
<li><p>It is optional to add metadata for each document. The metadata can be used to filter doc chunks during retrieval.</p></li>
</ul>

</Admonition>

## Use pipelines as query engine{#use-pipelines-as-query-engine}

To conduct semantic search with `ZillizCloudPipelineIndex`, you can use it `as_query_engine()` by specifying a few parameters:

- **search_top_k**: The number of text nodes/chunks to retrieve. defaults to `DEFAULT_SIMILARITY_TOP_K` (2).

- **filters**: The metadata filters. Defaults to None.

- **output_metadata**: A list of names of the metadata fields to return with the retrieved text node. Defaults to `[]`.

```python
from llama_index.vector_stores.types import ExactMatchFilter, MetadataFilters

query_engine_milvus23 = zcp_index.as_query_engine(
    search_top_k=3,
    filters=MetadataFilters(
        filters=[
            ExactMatchFilter(key="version", value="2.3")
        ]  # version == "2.3"
    ),
    output_metadata=["version"],
)
```

Then the query engine is ready for Semantic Search or Retrieval Augmented Generation with Milvus 2.3 documents.

### Retrieve{#retrieve}

The following code snippet demonstrates how to use Zilliz Cloud Pipelines to conduct semantic searches.

```python
question = "Can users delete entities by filtering non-primary fields?"
retrieved_nodes = query_engine_milvus23.retrieve(question)
print(retrieved_nodes)

# Output
# [NodeWithScore(node=TextNode(id_='447198459513870883', embedding=None, metadata={'version': '2.3'}, excluded_embed_metadata_keys=[], excluded_llm_metadata_keys=[], relationships={}, text='# Delete Entities\nThis topic describes how to delete entities in Milvus.  \nMilvus supports deleting entities by primary key or complex boolean expressions. Deleting entities by primary key is much faster and lighter than deleting them by complex boolean expressions. This is because Milvus executes queries first when deleting data by complex boolean expressions.  \nDeleted entities can still be retrieved immediately after the deletion if the consistency level is set lower than Strong.\nEntities deleted beyond the pre-specified span of time for Time Travel cannot be retrieved again.\nFrequent deletion operations will impact the system performance.  \nBefore deleting entities by comlpex boolean expressions, make sure the collection has been loaded.\nDeleting entities by complex boolean expressions is not an atomic operation. Therefore, if it fails halfway through, some data may still be deleted.\nDeleting entities by complex boolean expressions is supported only when the consistency is set to Bounded. For details, see Consistency.', start_char_idx=None, end_char_idx=None, text_template='{metadata_str}\n\n{content}', metadata_template='{key}: {value}', metadata_seperator='\n'), score=0.728226900100708), NodeWithScore(node=TextNode(id_='447198459513870886', embedding=None, metadata={'version': '2.3'}, excluded_embed_metadata_keys=[], excluded_llm_metadata_keys=[], relationships={}, text='# Delete Entities\n## Prepare boolean expression\n### Complex boolean expression\nTo filter entities that meet specific conditions, define complex boolean expressions.  \nFilter entities whose word_count is greater than or equal to 11000:  \n```python\nexpr = "word_count >= 11000"\n```  \nFilter entities whose book_name is not Unknown:  \n```python\nexpr = "book_name != Unknown"\n```  \nFilter entities whose primary key values are greater than 5 and word_count is smaller than or equal to 9999:  \n```python\nexpr = "book_id > 5 && word_count <= 9999"\n```', start_char_idx=None, end_char_idx=None, text_template='{metadata_str}\n\n{content}', metadata_template='{key}: {value}', metadata_seperator='\n'), score=0.687866747379303), NodeWithScore(node=TextNode(id_='447198459513870884', embedding=None, metadata={'version': '2.3'}, excluded_embed_metadata_keys=[], excluded_llm_metadata_keys=[], relationships={}, text='# Delete Entities\n## Prepare boolean expression\nPrepare the boolean expression that filters the entities to delete.  \nMilvus supports deleting entities by primary key or complex boolean expressions. For more information on expression rules and supported operators, see Boolean Expression Rules.', start_char_idx=None, end_char_idx=None, text_template='{metadata_str}\n\n{content}', metadata_template='{key}: {value}', metadata_seperator='\n'), score=0.6814976334571838)]

```

The query engine with filters retrieves only text nodes with the "version 2.3" tag.

### Query{#query}

The following code snippet demonstrates how to use the query engine as a RAG agent backed by Zilliz Cloud Pipelines and OpenAI's LLMs.

```python
response = query_engine_milvus23.query(question)
print(response.response)

# Output
# Yes, users can delete entities by filtering non-primary fields using complex boolean expressions in Milvus. The complex boolean expressions allow users to define specific conditions to filter entities based on non-primary fields, such as word_count or book_name. By specifying the desired conditions in the boolean expression, users can delete entities that meet those conditions. However, it is important to note that deleting entities by complex boolean expressions is not an atomic operation, and if it fails halfway through, some data may still be deleted.
```

## Advanced use cases{#advanced-use-cases}

You can get the managed index without running data ingestion. To get ready with Zilliz Cloud Pipelines, you need to provide either pipeline IDs or the associated collection name:

- **Pipeline IDs**

    A dictionary that contains the IDs of INGESTION, SEARCH, and DELETION pipelines, such as `{"INGESTION": "pipe-xx1", "SEARCH": "pipe-xx2", "DELETION": “pipe-xx3”}`

- **Collection name**

    The collection name defaults to `zcp_llamalection`. If no pipeline IDs are given, the index will try to get pipelines with the name of an associated collection.

```python
from llama_index.indices import ZillizCloudPipelineIndex

advanced_zcp_index = ZillizCloudPipelineIndex(
    project_id=ZILLIZ_PROJECT_ID,
    cluster_id=ZILLIZ_CLUSTER_ID,
    token=ZILLIZ_TOKEN,
    collection_name="zcp_llamalection_advanced",
)

# Output
# No available pipelines. Please create pipelines first.
```

### Customize pipelines{#customize-pipelines}

If no pipelines are provided or found, then you can manually create and customize pipelines with the following **optional** parameters:

- **metadata_schema**: A dictionary of metadata schema with field name as key and data type as value. For example, `{"user_id": "VarChar"}`.

- **chunkSize**: An integer of chunk size using token as unit. If no chunk size is specified, then Zilliz Cloud Pipeline will use a built-in default chunk size (500 tokens) to split documents.

For other applicable parameters, refer to [Zilliz Cloud Pipelines](/docs/pipelines) for more available pipeline parameters.

```python
advanced_zcp_index.create_pipelines(
    metadata_schema={"user_id": "VarChar"},
    chunkSize=350,
    # other pipeline params
)

# Output
# {'INGESTION': 'pipe-***********************,
#  'SEARCH': 'pipe-***********************',
#  'DELETION': 'pipe-***********************'}
```

### Multi-tenancy{#multi-tenancy}

With the tenant-specific value (eg. user id) as metadata, the managed index can achieve multi-tenancy by applying metadata filters.

By specifying metadata value, each document is tagged with the tenant-specific field at ingestion.

```python
advanced_zcp_index.insert_doc_url(
    url="https://raw.githubusercontent.com/milvus-io/milvus-docs/refs/heads/v2.5.x/site/en/about/overview.md",
    metadata={"user_id": "user_001"},
)

# Output
# {'token_usage': 1247, 'doc_name': 'milvus_doc.md', 'num_chunks': 10}
```

Then the managed index can build a query engine for each tenant by filtering the tenant-specific field.

```python
from llama_index.vector_stores.types import ExactMatchFilter, MetadataFilters

query_engine_for_user_001 = advanced_zcp_index.as_query_engine(
    search_top_k=3,
    filters=MetadataFilters(
        filters=[ExactMatchFilter(key="user_id", value="user_001")]
    ),
    output_metadata=["user_id"],  # optional, display user_id in outputs
)
```

You can change `filters` to build query engines with different conditions.

```python
question = "Can I delete entities by filtering non-primary fields?"

# search_results = query_engine_for_user_001.retrieve(question)
response = query_engine_for_user_001.query(question)
print(response.response)

# Output
# Yes, you can delete entities by filtering non-primary fields. Milvus supports deleting entities by complex boolean expressions, which allows you to filter entities based on specific conditions on non-primary fields. You can define complex boolean expressions using operators such as greater than or equal to, not equal to, and logical operators like AND and OR. By using these expressions, you can filter entities based on the values of non-primary fields and delete them accordingly.
```
