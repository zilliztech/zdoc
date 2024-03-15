---
slug: /reranker
beta: FALSE
notebook: FALSE
token: DOcRwUYLPi1C5bkiTq8c5dEQnP9
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Reranker

In information retrieval tasks, a reranker might reorganize search results ranked by relevance scores obtained from the initial retrieval such as vector Approximate Nearest Neighbor (ANN) search. This can help improve the overall quality of search results by prioritizing the documents most relevant to the query. Using a reranker is an effective approach to enhance the answer quality of RAG applications. Note that reranker is computationally heavy thus incurring higher cost and higher query latency.

## What is reranker?{#what-is-reranker}

![what-is-a-reranker](/img/what-is-a-reranker.png)

Reranker is typically a machine learning model trained to better assess the semantic relevance between query text and a specific document. Production-level information retrieval systems such as web search and recommender system usually consists of two stages: the initial retrieval and reranking. The initial retrieval phase, often utilizing vector Approximate Nearest Neighbor (ANN) search, efficiently sifts through vast datasets to identify relevant information, such as retrieving the top 20 candidates from millions of options. Once this initial set is obtained, the reranker steps in to further refine the ranking based on relevance to the query text. Then a smaller set, say top 5 from the reranked list, is used to provide better quality than if selecting the first 5 based on the original order.

## Using reranker in RAG application{#using-reranker-in-rag-application}

The RAG application consists of the retrieval phase, which is responsible for retrieving information pieces most relevant to the user's query, and the generation phase using LLM to summarize and reason about the retrieved knowledge. The relevancy of the context provided to the LLM in the retrieval phase is crucial to final answer quality. Reranker is an effective tool to improve retrieval thus enhancing the answer quality of the RAG application.  

The diagram below illustrates the position of a reranker in an RAG pipeline:  

![reranker-in-rag-application](/img/reranker-in-rag-application.png)

## When to use reranker{#when-to-use-reranker}

The initial multi-way retrieval stage retrieves candidates from a massive amount of data, requiring fast speed but allowing for some errors. Therefore, in practical scenarios, fast retrieval methods are usually adopted, such as Approximate Nearest Neighbor (ANN) based on vector search algorithms, which can retrieve more candidate results and allow for certain erroneous candidates. 

The initial retrieval with Approximate Nearest Neighbor (ANN) vector search is very efficient and often yields satisfactory results. In many scenarios, the secondary stage of reranking may not be deemed essential. Nevertheless, applications with stringent quality standards may opt to integrate a reranker model to enhance quality, albeit at the expense of increased computational overhead and longer search latency. Using reranker model generally adds 100ms to a few seconds of latency to the search query, depending on the size of topK. In situations where the initial retrieval result contains incorrect or irrelevant docs, using a reranker can effectively filter them out which in turn improve quality of final answer from LLM.

If a reranker is deemed necessary for your use case, you can choose to [enable it in your Search pipeline](./create-search-piplines):

![add-function-to-search-pipeline](/img/add-function-to-search-pipeline.png)

