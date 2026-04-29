---
title: "Function & Model Inference Overview | Cloud"
slug: /function-and-model-inference-overview
sidebar_key: function-and-model-inference-overview
sidebar_label: "Overview"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud provides a unified search architecture for building modern retrieval systems, including semantic search, lexical search, hybrid search, and intelligent reranking. Rather than exposing these capabilities as isolated features, Zilliz Cloud organizes them around a single core abstraction the Function. | Cloud"
type: origin
token: BanBwAm53iaLimkfLm3cFh0Fncb
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - function
  - model
  - inference
  - overview

---

import Admonition from '@theme/Admonition';


# Function & Model Inference Overview

Zilliz Cloud provides a unified search architecture for building modern retrieval systems, including semantic search, lexical search, hybrid search, and intelligent reranking. Rather than exposing these capabilities as isolated features, Zilliz Cloud organizes them around a single core abstraction: the **Function**.

## What is a Function?\{#what-is-a-function}

In Zilliz Cloud, a **Function** is a configurable execution unit that applies a specific operation at a defined stage of the search workflow.

A Function answers three practical questions:

- **When does this operation run?** Before search or after search.

- **What input does it operate on?** Raw text, vector representations or retrieved candidate results.

- **What output does it produce?** Vector embeddings used for retrieval, or reordered results returned to the user.

From a workflow perspective, Functions participate in search in two distinct stages:

- **Pre-search**: Functions run before search to convert text into vector representations. These vectors determine which candidates are retrieved.

- **Post-search**: Functions run after candidate retrieval to refine the ordering of results without changing the candidate set.

The following diagram provides an abstraction of how Functions work in the search workflow.

![HF6JwTJVfhXMmdb3qx3cm2YdnMe](https://zdoc-images.s3.us-west-2.amazonaws.com/HF6JwTJVfhXMmdb3qx3cm2YdnMe.png)

Every search request follows the same high-level flow:

1. The **Pre-search Function** generates vector representations from input text

1. The search engine retrieves candidate results based on those vectors

1. (Optional) The **Post-search Function** reranks the retrieved candidates

## Function categories\{#function-categories}

Functions in Zilliz Cloud are categorized based on **when they run in the search workflow** and **what role they play**. At a high level, Functions fall into two groups:

- **Pre-search Functions**, which convert text into vector embeddings and determine candidate retrieval

- **Post-search Functions**, which refine the ordering of retrieved candidates

### Pre-search Functions: Convert text to vector embeddings\{#pre-search-functions-convert-text-to-vector-embeddings}

**Pre-search Functions** run before candidate retrieval. Their role is to convert raw text—both stored documents and incoming queries—into vector representations that the search engine uses to identify relevant candidates.

Different Pre-search Functions generate different types of embeddings, which directly affects how retrieval is performed.

The table below summarizes the available Pre-search Functions:

<table>
   <tr>
     <th><p>Function Type</p></th>
     <th><p>Vector Type</p></th>
     <th><p>Description</p></th>
     <th><p>Typical Scenarios</p></th>
   </tr>
   <tr>
     <td><p>BM25 Function</p></td>
     <td><p>Sparse embeddings</p></td>
     <td><p>Computes lexical relevance based on term matching, term frequency, and document length normalization.</p><p>Executes entirely within the database engine as a local mechanism; <strong>no <a href="./function-and-model-inference-overview#understand-model-inference">model inference</a> required</strong>.</p></td>
     <td><p>Keyword-driven full text search, documentation and code search, and workloads where term matching, low latency, and deterministic behavior are critical.</p></td>
   </tr>
   <tr>
     <td><p>Model-based Embedding Functions</p></td>
     <td><p>Dense embeddings</p></td>
     <td><p>Encodes the semantic meaning of text using machine learning models, enabling similarity-based retrieval beyond exact keywords.</p><p><strong>Requires <a href="./function-and-model-inference-overview#understand-model-inference">model inference</a></strong> via hosted models or third-party model services.</p></td>
     <td><p>Semantic search, natural-language queries, Q&A and RAG pipelines, and use cases where conceptual similarity matters more than literal term overlap.</p></td>
   </tr>
</table>

All Pre-search Functions are applied consistently to both document data and query text, ensuring retrieval is performed within the same representation space.

### Post-search Functions: Rerank candidate results\{#post-search-functions-rerank-candidate-results}

Post-search Functions are applied **after candidate retrieval**. Their purpose is to **refine the ranking of retrieved candidates** without adding or removing items from the candidate set.

These functions operate exclusively on the results returned by the search stage and apply additional ranking logic or relevance signals to improve result quality. They **do not** affect indexing, retrieval, or filtering behavior—only the final ordering of results.

The table below summarizes the available Post-search Functions:

<table>
   <tr>
     <th><p>Function Type</p></th>
     <th><p>Operates On</p></th>
     <th><p>Description</p></th>
     <th><p>Typical Scenarios</p></th>
   </tr>
   <tr>
     <td><p>Hybrid Search Rankers</p></td>
     <td><p>Multiple result sets retrieved from hybrid search</p></td>
     <td><p>Combine and rebalance results retrieved from different retrieval strategies using methods such as <a href="./reranking-weighted-reranker">weighted ranking</a> or <a href="./reranking-rrf">reciprocal rank fusion</a> (RRF).</p></td>
     <td><p>Hybrid search scenarios that combine semantic and lexical retrieval and require balanced result fusion.</p></td>
   </tr>
   <tr>
     <td><p>Rule-based Rankers</p></td>
     <td><p>Candidate results from single-vector or hybrid search</p></td>
     <td><p>Adjust ranking based on predefined rules or numeric signals, such as <a href="./boost-ranker">boosting</a> or <a href="./decay-ranker-oveview">decay-based</a> scoring.</p></td>
     <td><p>Business-driven ranking logic, recency or popularity boosts, and scenarios requiring predictable, non-ML reranking.</p></td>
   </tr>
   <tr>
     <td><p>Model-based Rankers</p></td>
     <td><p>Candidate results from single-vector or hybrid search</p></td>
     <td><p>Use machine learning models to evaluate relevance and reorder results based on learned or semantic signals.</p></td>
     <td><p>Intelligent reranking, relevance refinement using semantic understanding, and LLM-based relevance evaluation.</p></td>
   </tr>
</table>

Because Post-search Functions operate only on retrieved candidates, they are refinement steps that affect result order but not retrieval scope.

## Understand model inference\{#understand-model-inference}

In the Function-based architecture of Zilliz Cloud, **model inference is not a standalone concept or execution stage**. Instead, it is an implementation detail used by specific Function types when machine learning-based signals are required.

### Where model inference fits in\{#where-model-inference-fits-in}

Model inference refers to the runtime execution of machine learning models to generate semantic signals, such as:

- Dense vector embeddings derived from text

- Relevance scores used to rerank search results

Within Zilliz Cloud, model inference is used only by **model-based functions**, including:

- [Model-based Pre-search Functions](./function-and-model-inference-overview#pre-search-functions-convert-text-to-vector-embeddings), which convert raw text into dense vector embeddings

- [Model-based Rankers](./function-and-model-inference-overview#post-search-functions-rerank-candidate-results), which evaluate relevance and reorder retrieved candidates

Other Functions, such as the BM25 Function and rule-based rankers, run entirely within the database engine and **do not require model inference**.

### Sources of model inference\{#sources-of-model-inference}

Zilliz Cloud supports two sources of model inference. Both provide model-based capabilities, but differ in how models are provisioned and managed:

<table>
   <tr>
     <th><p>Aspect</p></th>
     <th><p>Hosted Models</p></th>
     <th><p>Third-Party Model Services</p></th>
   </tr>
   <tr>
     <td><p><strong>Where models run</strong></p></td>
     <td><p>Inside Zilliz Cloud</p></td>
     <td><p>External model provider (OpenAI, Voyage AI, etc.)</p></td>
   </tr>
   <tr>
     <td><p><strong>Who manages models</strong></p></td>
     <td><p>Zilliz Cloud</p></td>
     <td><p>External model provider</p></td>
   </tr>
   <tr>
     <td><p><strong>How access is set up</strong></p></td>
     <td><p>See <a href="./hosted-models">Hosted Models</a></p></td>
     <td><p>Through <a href="./integrate-with-model-providers">model provider integration</a> on your own</p></td>
   </tr>
   <tr>
     <td><p><strong>Credentials</strong></p></td>
     <td><p>Provided during onboarding with Zilliz Cloud support</p></td>
     <td><p>Provided by you (for example, API keys)</p></td>
   </tr>
   <tr>
     <td><p><strong>Typical use cases</strong></p></td>
     <td><p>Tightly integrated or customized deployments</p></td>
     <td><p>Using standard models from established providers</p></td>
   </tr>
   <tr>
     <td><p><strong>Setup complexity</strong></p></td>
     <td><p>Higher (requires onboarding)</p></td>
     <td><p>Lower (connect your existing API keys)</p></td>
   </tr>
</table>

**Choose Hosted Models if you need**:

- Tight integration with Zilliz Cloud (single vendor, unified support)

- Custom model fine-tuning or specialized models

- Predictable performance and latency

- Simplified credential management

**Choose Third-Party Model Services if you**:

- Already have an existing relationship with a model provider

- Want to leverage the latest models from providers like OpenAI

- Prefer flexibility to switch providers

### Supported model providers\{#supported-model-providers}

Zilliz Cloud integrates with leading model providers that offer different capabilities. The table below shows which providers support text embedding and reranking:

<Admonition type="info" icon="📘" title="Notes">

<p>Provider availability and supported capabilities may vary by region and release. Refer to provider-specific documentation for the most up-to-date information.</p>

</Admonition>

<table>
   <tr>
     <th><p>Model Provider</p></th>
     <th><p>Text Embedding</p></th>
     <th><p>Reranking</p></th>
   </tr>
   <tr>
     <td><p>OpenAI</p></td>
     <td><p><a href="https://platform.openai.com/docs/guides/embeddings#embedding-models">Yes</a></p></td>
     <td><p>No</p></td>
   </tr>
   <tr>
     <td><p>Voyage AI</p></td>
     <td><p><a href="https://docs.voyageai.com/docs/embeddings">Yes</a></p></td>
     <td><p><a href="https://docs.voyageai.com/docs/reranker">Yes</a></p></td>
   </tr>
   <tr>
     <td><p>Cohere</p></td>
     <td><p><a href="https://docs.cohere.com/docs/cohere-embed">Yes</a></p></td>
     <td><p><a href="https://docs.cohere.com/docs/rerank">Yes</a></p></td>
   </tr>
</table>

