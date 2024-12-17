---
title: "Basic ANN Search | BYOC"
slug: /single-vector-search
sidebar_label: "Basic ANN Search"
beta: FALSE
notebook: FALSE
description: "Based on an index file recording the sorted order of vector embeddings, the Approximate Nearest Neighbor (ANN) search locates a subset of vector embeddings based on the query vector carried in a received search request, compares the query vector with those in the subgroup, and returns the most similar results. With ANN search, Zilliz Cloud provides an efficient search experience. This page helps you to learn how to conduct basic ANN searches. | BYOC"
type: origin
token: BaGlwzDmyiyVvVk6NurcFclInCd
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - vector search
  - ann

---

import Admonition from '@theme/Admonition';


# Basic ANN Search

Based on an index file recording the sorted order of vector embeddings, the Approximate Nearest Neighbor (ANN) search locates a subset of vector embeddings based on the query vector carried in a received search request, compares the query vector with those in the subgroup, and returns the most similar results. With ANN search, Zilliz Cloud provides an efficient search experience. This page helps you to learn how to conduct basic ANN searches.

## Overview{#overview}

The ANN and the k-Nearest Neighbors (kNN) search are the usual methods in vector similarity searches. In a kNN search, you must compare all vectors in a vector space with the query vector carried in the search request before figuring out the most similar ones, which is time-consuming and resource-intensive.

Unlike kNN searches, an ANN search algorithm asks for an **index** file that records the sorted order of vector embeddings. When a search request comes in, you can use the index file as a reference to quickly locate a subgroup probably containing vector embeddings most similar to the query vector. Then, you can use the specified **metric type** to measure the similarity between the query vector and those in the subgroup, sort the group members based on similarity to the query vector, and figure out the **top-K** group members.

ANN searches depend on pre-built indexes, and the search throughput, memory usage, and search correctness may vary with the index types you choose. You need to balance search performance and correctness. 

To reduce the learning curve, Zilliz Cloud provides **AUTOINDEX**. With **AUTOINDEX**, Zilliz Cloud can analyze the data distribution within your collection while building the index and sets the most optimized index parameters based on the analysis to strike a balance between search performance and correctness. 

For details on AUTOINDEX and applicable metric types, refer to [AUTOINDEX Explained](./autoindex-explained) and [Metric Types](./search-metrics-explained). In this section, you will find detailed information about the following topics:

- [Single-vector search](./single-vector-search#single-vector-search)

- [Bulk-vector search](./single-vector-search#bulk-vector-search)

- [ANN search in partition](./single-vector-search#ann-search-in-partition)

- [Use output fields](./single-vector-search#use-output-fields)

- [Use limit and offset](./single-vector-search#use-limit-and-offset)

- [Use level](./single-vector-search#use-level)

- [Enhancing ANN search](./single-vector-search#enhancing-ann-search)

## Single-Vector Search{#single-vector-search}

In ANN searches, a single-vector search refers to a search that involves only one query vector. Based on the pre-built index and the metric type carried in the search request, Zilliz Cloud will find the top-K vectors most similar to the query vector.

In this section, you will learn how to conduct a single-vector search. The code snippet assumes you have created a collection in a [quick-setup](./quick-setup-collections#quick-setup) manner. The search request carries a single query vector and asks Zilliz Cloud to use Inner Product (IP) to calculate the similarity between query vectors and vectors in the collection and returns the three most similar ones.

[Unsupported block type]

Milvus ranks the search results by their similarity scores to the query vector in descending order. The similarity score is also termed the distance to the query vector, and its value ranges vary with the metric types in use.

The following table lists the applicable metric types and the corresponding distance ranges.

<table>
   <tr>
     <th><p>Metric Type</p></th>
     <th><p>Characteristics</p></th>
     <th><p>Distance Range</p></th>
   </tr>
   <tr>
     <td><p><code>L2</code></p></td>
     <td><p>A smaller value indicates a higher similarity.</p></td>
     <td><p>[0, ∞)</p></td>
   </tr>
   <tr>
     <td><p><code>IP</code></p></td>
     <td><p>A greater value indicates a higher similarity.</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>COSINE</code></p></td>
     <td><p>A greater value indicates a higher similarity.</p></td>
     <td><p>[-1, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>JACCARD</code></p></td>
     <td><p>A smaller value indicates a higher similarity.</p></td>
     <td><p>[0, 1]</p></td>
   </tr>
   <tr>
     <td><p><code>HAMMING</code></p></td>
     <td><p>A smaller value indicates a higher similarity.</p></td>
     <td><p>[0, dim(vector)]</p></td>
   </tr>
</table>

## Bulk-Vector Search{#bulk-vector-search}

Similarly, you can include multiple query vectors in a search request. Zilliz Cloud will conduct ANN searches for the query vectors in parallel and return two sets of results.

[Unsupported block type]

## ANN Search in Partition{#ann-search-in-partition}

Suppose you have created multiple partitions in a collection, and you can narrow the search scope to a specific number of partitions. In that case, you can include the target partition names in the search request to restrict the search scope within the specified partitions. Reducing the number of partitions involved in the search improves search performance.

The following code snippet assumes a partition named **PartitionA** in your collection.

[Unsupported block type]

## Use Output Fields{#use-output-fields}

In a search result, Zilliz Cloud includes the primary field values and similarity distances/scores of the entities that contain the top-K vector embeddings by default. You can include the target field names in a search request as the output fields to make the search results carry the values from other fields in these entities.

[Unsupported block type]

## Use Limit and Offset{#use-limit-and-offset}

You may notice that the parameter `limit` carried in the search requests determines the number of entities to include in the search results. This parameter specifies the maximum number of entities to return in a single search, and it is usually termed **top-K**.

If you wish to perform paginated queries, you can use a loop to send multiple Search requests, with the **Limit** and **Offset** parameters carried in each query request. Specifically, you can set the **Limit** parameter to the number of Entities you want to include in the current query results, and set the **Offset** to the total number of Entities that have already been returned.

The table below outlines how to set the **Limit** and **Offset** parameters for paginated queries when returning 100 Entities at a time.

<table>
   <tr>
     <th><p>Queries</p></th>
     <th><p>Entities to return per query</p></th>
     <th><p>Entities already been returned in total</p></th>
   </tr>
   <tr>
     <td><p>The <strong>1st</strong> query</p></td>
     <td><p>100</p></td>
     <td><p>0</p></td>
   </tr>
   <tr>
     <td><p>The <strong>2nd</strong> query</p></td>
     <td><p>100</p></td>
     <td><p>100</p></td>
   </tr>
   <tr>
     <td><p>The <strong>3rd</strong> query</p></td>
     <td><p>100</p></td>
     <td><p>200</p></td>
   </tr>
   <tr>
     <td><p>The <strong>nth</strong> query</p></td>
     <td><p>100</p></td>
     <td><p>100 x (n-1)</p></td>
   </tr>
</table>

Note that, the sum of `limit` and `offset` in a single ANN search should be less than 16,384.

[Unsupported block type]

## Use Level{#use-level}

To optimize ANN searches, Zilliz Cloud provides a parameter named `level` to control the search precision with simplified search optimization.

This parameter ranges from `1` to `5` and defaults to `1`. Increasing the value improves search precisions with a degradation in search performance. In common cases, the default value yields a maximum of 90% recall rate. You can increase the value as required.

[Unsupported block type]

## Enhancing ANN Search{#enhancing-ann-search}

AUTOINDEX considerably flattens the learning curve of ANN searches. However, the search results may not always be correct as the top-K increases. By reducing the search scope, improving search result relevancy, and diversifying the search results, Zilliz Cloud works out the following search enhancements.

- Filtered Search

    You can include filtering conditions in a search request so that Zilliz Cloud conducts metadata filtering before conducting ANN searches, reducing the search scope from the whole collection to only the entities matching the specified filtering conditions.

    For more about metadata filtering and filtering conditions, refer to [Filtered Search](./filtered-search) and [Filtering](./filtering).

- Range Search

    You can improve search result relevancy by restricting the distance or score of the returned entities within a specific range. In Zilliz Cloud, a range search involves drawing two concentric circles with the vector embedding most similar to the query vector as the center. The search request specifies the radius of both circles, and Zilliz Cloud returns all vector embeddings that fall within the outer circle but not the inner circle.

    For more about range search, refer to [Range Search](./range-search).

- Grouping Search

    If the returned entities hold the same value in a specific field, the search results may not represent the distribution of all vector embeddings in the vector space. To diversify the search results, consider using the grouping search.

    For more about grouping search, refer to [Grouping Search](./grouping-search),

- Hybrid Search

    A collection can include up to four vector fields to save the vector embeddings generated using different embedding models. By doing so, you can use a hybrid search to rerank the search results from these vector fields, improving the recall rate.

    For more about hybrid search, refer to [Hybrid Search](./hybrid-search).

- Search Iterator

    A single ANN search returns a maximum of 16,384 entities. Consider using search iterators if you need more entities to return in a single search.

    For details on search iterators, refer to [Search Iterator](./with-iterators).

- Full-Text Search

    Full text search is a feature that retrieves documents containing specific terms or phrases in text datasets, then ranking the results based on relevance. This feature overcomes semantic search limitations, which might overlook precise terms, ensuring you receive the most accurate and contextually relevant results. Additionally, it simplifies vector searches by accepting raw text input, automatically converting your text data into sparse embeddings without the need to manually generate vector embeddings.

    For details on full-text search, refer to [Full Text Search](./full-text-search).

- Keyword Match

    Keyword match in Milvus enables precise document retrieval based on specific terms. This feature is primarily used for filtered search to satisfy specific conditions and can incorporate scalar filtering to refine query results, allowing similarity searches within vectors that meet scalar criteria.

    For details on keyword match, refer to [Keyword Match](./text-match).

- Use Partition Key

    Involving multiple scalar fields in metadata filtering and using a rather complicated filtering condition may affect search efficiency. Once you set a scalar field as the partition key and use a filtering condition involving the partition key in the search request, it can help restrict the search scope within the partitions corresponding to the specified partition key values. 

    For details on the partition key, refer to [Use Partition Key](./use-partition-key).

- Use mmap

    For details on mmap-settings, refer to [Use mmap](./use-mmap).

- Clustering Compaction

    For details on clustering compactions, refer to [Clustering Compaction](./clustering-compaction).