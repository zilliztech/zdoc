---
title: "Reranker | Cloud"
slug: /reranker
sidebar_label: "Reranker"
beta: NEAR DEPRECATE
notebook: FALSE
description: "In information retrieval, a reranker rearranges results from intial retrieval. Compared to using only vector Approximate Nearest Neighbor (ANN) search for retrieval, adding reranker can improve search quality as it can better judge the semantic relevancy between docs and the query. Using a reranker can also enhance accuracy of generated answer in RAG applications, as fewer but higher quality docs are put in the context. Note that rerankers can be computationally heavy, leading to higher costs and longer query latency. | Cloud"
type: origin
token: DOcRwUYLPi1C5bkiTq8c5dEQnP9
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - concepts
  - rerankers
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database

---

import Admonition from '@theme/Admonition';


# Reranker

In information retrieval, a reranker rearranges results from intial retrieval. Compared to using only vector Approximate Nearest Neighbor (ANN) search for retrieval, adding reranker can improve search quality as it can better judge the semantic relevancy between docs and the query. Using a reranker can also enhance accuracy of generated answer in RAG applications, as fewer but higher quality docs are put in the context. Note that rerankers can be computationally heavy, leading to higher costs and longer query latency.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud Pipelines will be discontinued by the end of Q2 2025 and replaced by a new feature, “Data In, Data Out,” to streamline embedding generation in both Milvus and Zilliz Cloud. As of December 24, 2024, new user registrations are no longer accepted. Current users can continue using the service within the &#36;20 monthly free allowance until the sunset date; however, no SLA is provided. Please consider using embedding APIs from model providers or open-source models to generate vector embeddings.</p>

</Admonition>

## What is reranker?{#what-is-reranker}

![what-is-a-reranker](/img/what-is-a-reranker.png)

Reranker is typically a machine learning model trained to score the semantic relevance between query text and a specific document. Production-level information retrieval systems such as web search and recommender system usually consists of two stages: the initial retrieval and reranking. The initial retrieval phase, often utilizing vector Approximate Nearest Neighbor (ANN) search, efficiently sifts through vast datasets to identify relevant information, such as retrieving the top 20 items from millions of candidates. Once this initial set is obtained, the reranker steps in to further refine the ranking based on relevance to the query text. A smaller set, say top 5 from the reranked list, is used to provide better quality than if selecting the first 5 based on the original order.

## Using reranker in RAG application{#using-reranker-in-rag-application}

The RAG application consists of two phases: the retrieval phase, which is responsible for retrieving relevant information from knowledge base, and the generation phase, which uses LLM to summarize and reason about the retrieved knowledge. The relevancy of the context provided to the LLM in the retrieval phase is crucial to final answer quality. Reranker is an effective tool to improve retrieval thus enhancing the answer quality of the RAG application.  

The diagram below illustrates the position of a reranker in an RAG pipeline:  

![reranker-in-rag-application](/img/reranker-in-rag-application.png)

## When to use reranker{#when-to-use-reranker}

The initial retrieval with Approximate Nearest Neighbor (ANN) vector search alone is very efficient and often yields satisfactory results. In many scenarios, the secondary stage of reranking may not be deemed essential. For applications with high quality standards, employing a reranker can enhance accuracy, albeit with increased computational demands and longer search times. Typically, integrating a reranker model can add 100ms to a few seconds of latency to the search query, depending on factors like topK selection and reranker model size. When the initial retrieval yields incorrect or irrelevant documents, using a reranker effectively filters them out, thus improving the quality of the final generated response.

If a reranker is deemed necessary for your use case, you can choose to enable it in your Search pipeline:

![add-search-doc-function](/img/add-search-doc-function.png)

