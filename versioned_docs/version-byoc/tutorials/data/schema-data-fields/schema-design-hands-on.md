---
title: "Schema Design Hands-On | BYOC"
slug: /schema-design-hands-on
sidebar_label: "Hands-On"
beta: FALSE
notebook: FALSE
description: "Information Retrieval (IR) systems, also known as search engines, are essential for various AI applications such as Retrieval-augmented generation (RAG), image search, and product recommendation. The first step in developing an IR system is designing the data model, which involves analyzing business requirements, determining how to organize information, and indexing data to make it semantically searchable. | BYOC"
type: origin
token: PV2bwNENViEjXWkOgzZcXoKHnce
sidebar_position: 13
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - schema design
  - hands-on
  - Natural language search
  - Similarity Search
  - multimodal RAG
  - llm hallucinations

---

import Admonition from '@theme/Admonition';


# Schema Design Hands-On

Information Retrieval (IR) systems, also known as search engines, are essential for various AI applications such as Retrieval-augmented generation (RAG), image search, and product recommendation. The first step in developing an IR system is designing the data model, which involves analyzing business requirements, determining how to organize information, and indexing data to make it semantically searchable.

Zilliz Cloud supports defining the data model through a collection schema. A collection organizes unstructured data like text and images, along with their vector representations, including dense and sparse vectors in various precision used for semantic search. Additionally, Zilliz Cloud supports storing and filtering non-vector data types called "Scalar". Scalar types include BOOL, INT8/16/32/64, FLOAT/DOUBLE, VARCHAR, JSON, and Array.

![WeYVbC63So5YT2xSV5EcHf8qn3f](/byoc/WeYVbC63So5YT2xSV5EcHf8qn3f.png)

The data model design of a search system involves analyzing business needs and abstracting information into a schema-expressed data model. For instance, to search a piece of text, it must be "indexed" by converting the literal string into a vector through "embedding", enabling vector search. Beyond this basic requirement, it may be necessary to store other properties such as publication timestamp and author. This metadata allows for semantic searches to be refined through filtering, returning only texts published after a specific date or by a particular author. They may also need to be retrieved together with the main text, for rendering the search result in the application. To organize these text pieces, each should be assigned a unique identifier, expressed as an integer or string. These elements are essential for achieving sophisticated search logic.

A well-designed schema is important as it abstracts the data model and decides if the business objectives can be achieved through search. Furthermore, since every row of data inserted into the collection needs to follow the schema, it greatly helps to maintain data consistency and long-term quality. From a technical perspective, a well-defined schema leads to well-organized column data storage and a cleaner index structure, which can boost search performance.

# An Example: News Search{#an-example-news-search}

Let's say we want to build search for a news website and we have a corpus of news with text, thumbnail images, and other metadata. First, we need to analyze how we want to utilize the data to support the business requirement of search. Imagine the requirement is to retrieve the news based the thumbnail image and the summary of the content, and taking the metadata such as author info and publishing time as criteria to filter the search result. These requirements can be further broken down into:

- To search images via text, we can embed images into vectors via multimodal embedding model that can map text and image data into the same latent space.

- The summary text of an article is embedded into vectors via text embedding model.

- To filter based on the publish time, the dates are stored as a scalar field and an index is needed for the scalar field for efficient filtering. Other more complex data structures such a JSON can be stored in a scalar and a filtered search performed on their contents (indexing JSON is an upcoming feature).

- To retrieve the image thumbnail bytes and render it on the search result page, the image url is also stored. Similarly, for the summary text and title. (Alternatively, we could store the raw text and image file data as scalar fields if required.)

- To improve the search result on the summary text, we design a hybrid search approach. For one retrieval path, we use regular embedding model to generate dense vector from the text, such as OpenAI's `text-embedding-3-large` or the open-source `bge-large-en-v1.5`. These models are good at representing the overall semantic of the text. The other path is to use sparse embedding models such as BM25 or SPLADE to generate a sparse vector, resembling the full-text search which is good at grasping the details and individual concepts in the text. Zilliz Cloud supports using both in the same data collection thanks to its multi-vector feature. The search on multiple vectors can be done in a single `hybrid_search()` operation.

- Finally, we also need an ID field to identify each individual news page, formally referred to as an "entity" in Zilliz Cloud terminology. This field is used as the primary key (or "pk" for short).

<table>
   <tr>
     <th><p>Field Name</p></th>
     <th><p>article_id (Primary Key)</p></th>
     <th><p>title</p></th>
     <th><p>author_info</p></th>
     <th><p>publish_ts</p></th>
     <th><p>image_url</p></th>
     <th><p>image_vector</p></th>
     <th><p>summary</p></th>
     <th><p>summary_dense_vector</p></th>
     <th><p>summary_sparse_vector</p></th>
   </tr>
   <tr>
     <td><p>Type</p></td>
     <td><p>INT64</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>JSON</p></td>
     <td><p>INT32</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>VARCHAR</p></td>
     <td><p>FLOAT_VECTOR</p></td>
     <td><p>SPARSE_FLOAT_VECTOR</p></td>
   </tr>
   <tr>
     <td><p>Need Index</p></td>
     <td><p>N</p></td>
     <td><p>N</p></td>
     <td><p>N (Support coming soon)</p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>N</p></td>
     <td><p>Y</p></td>
     <td><p>Y</p></td>
   </tr>
</table>

# How to Implement the Example Schema{#how-to-implement-the-example-schema}

## Create Schema{#create-schema}

First, we create a Milvus client instance, which can be used to connect to the Zilliz Cloud cluster and manage collections and data. 

To set up a schema, we use `create_schema()` to create a schema object and `add_field()` to add fields to the schema.

```python
from pymilvus import MilvusClient, DataType

collection_name = "my_collection"

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="TOKEN_OR_API_KEY"
)

schema = MilvusClient.create_schema(
    auto_id=False,
)

schema.add_field(field_name="article_id", datatype=DataType.INT64, is_primary=True, description="article id")
schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=200, description="article title")
schema.add_field(field_name="author_info", datatype=DataType.JSON, description="author information")
schema.add_field(field_name="publish_ts", datatype=DataType.INT32, description="publish timestamp")
schema.add_field(field_name="image_url", datatype=DataType.VARCHAR,  max_length=500, description="image URL")
schema.add_field(field_name="image_vector", datatype=DataType.FLOAT_VECTOR, dim=768, description="image vector")
schema.add_field(field_name="summary", datatype=DataType.VARCHAR, max_length=1000, description="article summary")
schema.add_field(field_name="summary_dense_vector", datatype=DataType.FLOAT_VECTOR, dim=768, description="summary dense vector")
schema.add_field(field_name="summary_sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR, description="summary sparse vector")
```

You might notice the argument `uri` in `MilvusClient`, which is used to connect to the Zilliz Cloud cluster. You can set the arguments as follows:

Set `uri` to your Zilliz Cloud cluster's endpoint and `token` to either a colon-separated username and password of a cluster user or a valid Zilliz Cloud API key with the necessary permissions.

As for the `auto_id` in `MilvusClient.create_schema`, AutoID is an attribute of the primary field that determines whether to enable auto increment for the primary field.  Since we set the field`article_id` as the primary key and want to add article id manually, we set `auto_id` False to disable this feature.

After adding all the fields to the schema object, our schema object agrees with the entries in the table above.

## Define Index{#define-index}

After defining the schema with various fields, including metadata and vector fields for image and summary data, the next step involves preparing the index parameters. Indexing is crucial for optimizing the search and retrieval of vectors, ensuring efficient query performance. In the following section, we will define the index parameters for the specified vector and scalar fields in the collection.

```python
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="image_vector",
    index_type="AUTOINDEX",
    metric_type="IP",
)
index_params.add_index(
    field_name="summary_dense_vector",
    index_type="AUTOINDEX",
    metric_type="IP",
)
index_params.add_index(
    field_name="summary_sparse_vector",
    index_type="AUTOINDEX",
    metric_type="IP",
)
index_params.add_index(
    field_name="publish_ts",
    index_type="AUTOINDEX",
)
```

Once the index parameters are set up and applied, Zilliz Cloud clusters are optimized for handling complex queries on vector and scalar data. This indexing enhances the performance and accuracy of similarity searches within the collection, allowing for efficient retrieval of articles based on image vectors and summary vectors. By leveraging the `AUTOINDEX` for both the specified vector and scalar fields, Zilliz Cloud can quickly identify and return the most relevant results, significantly improving the overall user experience and effectiveness of the data retrieval process.

Zilliz Cloud supports AUTOINDEX as the only index type, but provides multiple metric types. For more information about them, you can refer to [AUTOINDEX Explained](./autoindex-explained) and [Metric Types](./search-metrics-explained)..

## Create Collection{#create-collection}

With the schema and indexes defined, we create a "collection" with these parameters. Collection to a Zilliz Cloud cluster is like a table to a relational DB.

```python
client.create_collection(
    collection_name=collection_name,
    schema=schema,
    index_params=index_params,
)
```

We can verify that the collection has been successfully created by describing the collection.

```python
collection_desc = client.describe_collection(
    collection_name=collection_name
)
print(collection_desc)
```

# Other Considerations{#other-considerations}

## Loading Index{#loading-index}

When creating a collection in a Zilliz Cloud cluster, you can choose to load the index immediately or defer it until after bulk ingesting some data. Typically, you don't need to make an explicit choice about this, as the above examples show that the index is automatically built for any ingested data right after collection creation. This allows for immediate searchability of the ingested data. However, if you have a large bulk insert after collection creation and don't need to search for any data until a certain point, you can defer the index building by omitting index_params in the collection creation and build the index by calling load explicitly after ingesting all the data. This method is more efficient for building the index on a large collection, but no searches can be done until calling load().

## How to Define Data Model For Multi-tenancy{#how-to-define-data-model-for-multi-tenancy}

The concept of multiple tenants is commonly used in scenarios where a single software application or service needs to serve multiple independent users or organizations, each with their own isolated environment. This is frequently seen in cloud computing, SaaS (Software as a Service) applications, and database systems. For example, a cloud storage service may utilize multi-tenancy to allow different companies to store and manage their data separately while sharing the same underlying infrastructure. This approach maximizes resource utilization and efficiency while ensuring data security and privacy for each tenant.

The easiest way to differentiate tenants is by isolating their data and resources from each other. Each tenant either has exclusive access to specific resources or shares resources with others to manage Zilliz Cloud entities such as databases, collections, and partitions. There are specific methods aligned with these entities to implement multi-tenancy. You can refer to the [Milvus multi-tenancy page](https://milvus.io/docs/multi_tenancy.md#Multi-tenancy-strategies) for more information.