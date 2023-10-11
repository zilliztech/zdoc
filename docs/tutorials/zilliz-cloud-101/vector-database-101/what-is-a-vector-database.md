---
slug: /what-is-a-vector-database
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# What is a Vector Database

In the era with an ever-increasing amount of data being generated on a daily basis, most of them can be classified as semi-structured and unstructured data types. Approximate Nearest Neighbor (ANN) search is an efficient way to process such data. A vector database is a database management system that helps deal with the ever-increasing amount of unstructured data.

## What is a vector database?{#what-is-a-vector-database}

A vector database is a fully managed, no-frills solution for storing, indexing, and searching across a massive dataset of unstructured data that leverages the power of embeddings from machine learning models.

[video][https://youtu.be/4yQjsY5iD9Q](https://youtu.be/4yQjsY5iD9Q)[video]

## Vector databases from 1000 feet{#vector-databases-from-1000-feet}

Guess how many curators it took to label the now-famous *ImageNet* dataset. Ready for the answer?

*25000* people (that's a lot).

Being able to search across images, video, text, audio, and other forms of unstructured data via their content rather than human-generated labels or tags is exactly what vector databases were meant to solve. When combined with powerful machine learning models, vector databases such as [Milvus](https://milvus.io) have the ability to revolutionize e-commerce solutions, recommendation systems, semantic search, computer security, pharmaceuticals, and many other industries.

Let’s think about it from a user perspective. What good is a piece of technology without strong usability and a good user API? In concert with the underlying technology, multi-tenancy and usability are also incredibly important attributes for vector databases. Let’s list out all of the vector database features to look out for (many of these features overlap with those of databases for structured/semi-structured data):

- **Scalability and tunability**: As the number of unstructured data elements stored in a vector database grows into the hundreds of millions or billions, horizontal scaling across multiple nodes becomes paramount (scaling up by manually inserting sticks of RAM into a server rack every 3 months is no fun). Furthermore, differences in insert rate, query rate, and underlying hardware may result in different application needs, making overall system tunability mandatory for the best vector databases.

- **Multi-tenancy and data isolation**: Supporting multiple users is an obvious feature for all database systems. However, going guns blazing and creating a new vector database for every new user will probably turn out poorly for everyone. Parallel to this notion is data isolation - the idea that any inserts, deletes, or queries made to one collection in a database should be invisible to the rest of the system unless the collection owner explicitly wishes to share the information.

- **A complete suite of APIs**: A database without a full suite of APIs and SDKs is, frankly speaking, not a real database. For example, Milvus maintains [Python](./install-sdks#install-pymilvus-python-sdk), [Java](./install-sdks#install-java-sdk), [Go](./install-sdks#install-go-sdk), and [Node.js](./install-sdks#install-nodejs-sdk) SDKs for communicating with and administering a Milvus vector database.

- **An intuitive user interface/administrative console**: User interfaces can help significantly reduce the learning curve associated with vector databases. These interfaces also expose new vector database features and tools that would otherwise be inaccessible.

That was quite a bit of info, so we’ll summarize it right here: a vector database should have the following features: 1) scalability and tunability, 2) multi-tenancy and data isolation, 3) a complete suite of APIs, and 4) an intuitive user interface/administrative console. In the next two sections, we’ll follow up on this concept by comparing vector databases versus vector search libraries and vector search plugins, respectively.

# **Vector databases versus vector search libraries**{#vector-databases-versus-vector-search-libraries}

A common misconception that I hear around the industry is that vector databases are merely wrappers around ANN search algorithms. This could not be further from the truth!

**A vector database is, at its core, a full-fledged solution for unstructured data.** As we’ve already seen in the previous section, this means that user-friendly features present in today’s database management systems for structured/semi-structured data - cloud-nativity, multi-tenancy, scalability, etc - should also be attributes for a mature open source vector database as well. All of these features will become clear as we dive deeper into this tutorial.

On the other hand, projects such as FAISS, Scalable Nearest Neighbors (ScaNN), and Hierarchical Navigable Small World (HNSW) are lightweight [ANN](https://zilliz.com/glossary/anns) libraries rather than managed solutions. The intention of these libraries is to aid in the construction of vector indices - data structures designed to significantly speed up nearest neighbor search for multi-dimensional vectors[[1]](https://zilliz.com/learn/what-is-vector-database#fn1). If your dataset is small and limited, these libraries can prove to be sufficient for unstructured data processing, even for systems running in production. However, as dataset sizes increase and more users are onboarded, the problem of scale becomes increasingly difficult to solve.

High-level overview of Milvus's architecture. It looks confusing, I know, but don't worry, we'll dive into each component in the next tutorial.

![BpX2bfdVTo9PhTxhBysclfI8nDg](/img/BpX2bfdVTo9PhTxhBysclfI8nDg.png)

Vector databases also operate in a totally different layer of abstraction from vector search libraries - vector databases are full-fledged services, while ANN libraries are meant to be integrated into the application that you’re developing. In this sense, ANN libraries are one of the many components that vector databases are built on top of, similar to how [Elasticsearch is built on top of Apache Lucene](https://en.wikipedia.org/wiki/Elasticsearch).

To give an example of why this abstraction is so important, let’s take a look at inserting a new unstructured data element into a vector database. This is super easy in Milvus:

```python
from pymilvus import Collection
collection = Collection('book')
mr = collection.insert(data)
```

It’s really as easy as that - 3 lines of code. With a library such as FAISS or ScaNN, there is unfortunately no easy way of doing this without manually re-creating the entire index at certain checkpoints. Even if you could, vector search libraries still lack scalability and multi-tenancy, two of the most important vector database features.

# **Vector search plugins for traditional databases**{#vector-search-plugins-for-traditional-databases}

Great, now that we’ve established the difference between vector search libraries and vector databases, let’s take a look at how vector databases differ from **vector search plugins**.

An increasing number of traditional relational databases and search systems such as ClickHouse and Elasticsearch are including built-in vector search plugins. Elasticsearch 8.0, for example, includes vector insertion and ANN search functionality that can be called via restful API endpoints. The problem with vector search plugins should be clear as night and day - **these solutions do not take a full-stack approach to embedding management and vector search**. Instead, these plugins are meant to be enhancements on top of existing architectures, thereby making them limited and unoptimized. Developing an unstructured data application atop a traditional database would be like trying to fit lithium batteries and electric motors inside a frame of a gas-powered car - not a great idea!

To illustrate why this is, let’s go back to the list of features that a vector database should implement (from the first section). Vector search plugins are missing two of these features - tunability and user-friendly APIs/SDKs. I’ll continue to use Elasticsearch’s ANN engine as an example; other vector search plugins operate very similarly so I won’t go too much further into detail. Elasticsearch supports vector storage via the `dense_vector` data field type and allows for querying via the `knnsearch endpoint`:

```bash
PUT index
{
 "mappings": {
   "properties": {
     "image-vector": {
       "type": "dense_vector",
       "dims": 128,
       "index": true,
       "similarity": "l2_norm"
     }
   }
 }
}

PUT index/_doc
{
 "image-vector": [0.12, 1.34, ...]
}
```

```bash
GET index/_knn_search
{
 "knn": {
   "field": "image-vector",
   "query_vector": [-0.5, 9.4, ...],
   "k": 10,
   "num_candidates": 100
 }
}
```

Elasticsearch's ANN plugin supports only one indexing algorithm: Hierarchical Navigable Small Worlds, also known as HNSW (I like to think that the creator was ahead of Marvel when it came to popularizing the multiverse). On top of that, only L2/Euclidean distance is supported as a distance metric. This is an okay start, but let's compare it to Milvus, a full-fledged vector database. Using `pymilvus`:

```python
field1 = FieldSchema(name='id', dtype=DataType.INT64, description='int64', is_primary=True)
field2 = FieldSchema(name='embedding', dtype=DataType.FLOAT_VECTOR, description='embedding', dim=128, is_primary=False)

schema = CollectionSchema(fields=[field1, field2], description='hello world collection')
collection = Collection(name='my_collection', data=None, schema=schema)

index_params = {
  'index_type': 'IVF_FLAT',
  'params': {'nlist': 1024},
  "metric_type": 'L2'
}
collection.create_index('embedding', index_params
```

```python
search_param = {
  'data': vector,
  'anns_field': 'embedding',
  'param': {'metric_type': 'L2', 'params': {'nprobe': 16}},
  'limit': 10,
  'expr': 'id_field > 0'
}

results = collection.search(**search_param)
```

While both [Elasticsearch and Milvus](https://zilliz.com/comparison/elastic-vs-milvus) have methods for creating indexes, inserting embedding vectors, and performing nearest neighbor search, it’s clear from these examples that Milvus has a more intuitive vector search API (better user-facing API) and broader vector index + distance metric support (better tunability). Milvus also plans to support more vector indices and allow for querying via SQL-like statements in the future, further improving both tunability and usability.

We just blew through quite a bit of content. This section was admittedly fairly long, so for those of you who skimmed it, here’s a quick wrap-up: Milvus is better than vector search plugins because Milvus was built from the ground up as a vector database, allowing for a richer set of features and an architecture more suited towards unstructured data.

# **Technical challenges**{#technical-challenges}

Earlier in this tutorial, I listed the desired features a vector database should implement, before comparing vector databases to vector search libraries and vector search plugins. Now, let’s briefly go over some high-level technical challenges of vector databases. In future tutorials, we’ll provide an overview of how Milvus tackles each of these, in addition to how these technical decisions improve Milvus’ performance over other [open-source vector databases](https://zilliz.com/comparison).

Picture an airplane. The airplane itself contains a number of interconnected mechanical, electrical, and embedded systems, all working in harmony to provide us with a smooth and pleasurable in-flight experience. Likewise, vector databases are composed of a number of evolving software components. Roughly speaking, these can be broken down into storage, index, and service. Although these three components are tightly integrated[[2]](https://zilliz.com/learn/what-is-vector-database#fn2), companies such as Snowflake have shown the broader storage industry that "shared nothing" database architectures are arguably superior to the traditional "shared storage" cloud database models. Thus, the first technical challenge associated with vector databases is **designing a flexible and scalable data model**.

Great, so we have a data model. What's next? With data already stored in a vector database, being able to search across that data, i.e. querying and indexing, is the next important component. The compute-heavy nature of machine learning and multi-layer neural networks has allowed GPUs, NPUs/TPUs, FPGAs, and other general-purpose compute hardware to flourish. Vector indexing and querying are also compute-heavy, operating at maximum speed and efficiency when run on accelerators. This diverse set of compute resources gives way to the second main technical challenge, **developing a heterogeneous computing architecture**.

With a data model and architecture in place, the last step is making sure your application can, well, read from the database - this ties closely into the API and user interface bullet points mentioned in the first section. While a new category of database necessitates a new architecture in order to extract maximal performance at minimal cost, the majority of vector database users are still acclimated to traditional CRUD operations (e.g. `INSERT`, `SELECT`, `UPDATE`, and `DELETE` in SQL). Therefore, the final primary challenge is **developing a set of APIs and GUIs that leverage existing user interface conventions** while maintaining compatibility with the underlying architecture.

Note how each of the three components corresponds to a primary technical challenge. With that being said, there is no one-size-fits-all vector database architecture. The best vector databases will fulfill all of these technical challenges by focusing on delivering the features mentioned in the first section.

# **What are the advantages of vector databases?**{#what-are-the-advantages-of-vector-databases}

Vector databases offer several advantages over traditional databases for use cases that involve similarity search, machine learning, and AI applications. Here are some of the benefits of vector databases:

- High-dimensional search: Vector databases can efficiently perform similarity searches on high-dimensional vectors, commonly used in machine learning and AI applications, such as image recognition, natural language processing, and recommendation systems.

- Scalability: Vector databases can scale horizontally, efficiently storing and retrieving large amounts of vector data. Scalability is significant for applications that require real-time search and retrieval of large amounts of data.

- Flexibility: Vector databases can handle various vector data types, including sparse and dense vectors. They can also handle multiple data types, including numerical, text, and binary.

- Performance: Vector databases perform similarity searches efficiently, often providing faster search times than traditional databases.

- Customizable indexing: Vector databases allow custom indexing schemes for specific use cases and data types.

Overall, vector databases offer significant advantages for applications that involve similarity search and machine learning, providing fast and efficient search and retrieval of high-dimensional vector data.

# **What is the fastest vector database**{#what-is-the-fastest-vector-database}

[ANN-Benchmarks](http://ann-benchmarks.com/) is a benchmarking environment to evaluate the performance of various vector databases and nearest neighbor search algorithms. The main functions of ANN Benchmarks include the following:

- Dataset and parameter specification: The benchmark provides a variety of datasets of different sizes and dimensions, along with a set of parameters for each dataset, such as the number of neighbors to search for and the distance metric to use.

- Search recall calculation: The benchmark calculates the search recall, the proportion of queries for which the true nearest neighbors are found among the k returned neighbors. Search recall is a metric for evaluating the accuracy of nearest-neighbor search algorithms.

- RPS calculation: The benchmark also calculates the RPS (queries per second), the rate at which the vector database or search algorithm can process queries. This metric is vital for evaluating the speed and scalability of the system.

Using the ANN Benchmarks, users can compare the performance of different vector databases and search algorithms under a standardized set of conditions, making it easier to identify the most suitable option for a particular use case.

# **Wrapping up**{#wrapping-up}

In this tutorial, we took a quick tour of vector databases. Specifically, we looked at 

- What features go into a mature vector database, 

- How a vector database differs from vector search libraries, 

- How a vector database differs from vector search plugins in traditional databases or search systems, and 

- Key challenges associated with building a vector database.

This tutorial is not meant to be a deep dive into vector databases, nor is it meant to show how it can be used in applications. Rather, the goal is to provide an overview. This is where your journey truly begins!

In the next tutorial, we’ll provide an introduction to Milvus, the world’s most popular open-source vector database:

- Provide a brief history of Milvus, including the most important question - where does the name come from!

- Cover how Milvus 1.0 differs from Milvus 2.0 and where the future of Milvus lies.

- Discuss the differences between Milvus and other vector databases such as Google Vertex AI’s Matching Engine.

- Go over some common vector database applications.

## Related topics{#related-topics}

- [Introduction to Vector Similarity Search](./introduction-to-vector-similarity-search) 

- [Vector Index Basics and the Inverted File Index](./vector-index-basics-and-the-inverted-file-index) 

- [Scalar Quantization and Product Quantization](./scalar-quantization-and-product-quantization) 

- [Hierarchical Navigable Small World (HNSW)](./hierarchical-navigable-small-world-hnsw) 
