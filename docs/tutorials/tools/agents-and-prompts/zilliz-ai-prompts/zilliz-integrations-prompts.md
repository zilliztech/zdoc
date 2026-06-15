---
title: "Integrations | Cloud"
slug: /agents/zilliz-integrations-prompts
sidebar_label: "Integrations"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: SHy1wIJ58iGIhykpBW6cZ3Ibndf
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - prompts
  - integrations
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Integrations

You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently.

## How to use these prompts\{#how-to-use-these-prompts}

Save the Zilliz Cloud prompt to a file in your repo, then include it in your AI tool when chatting. The table below demonstrates where to place the prompt in different tools.

| **Tool** | **Where to place the prompt** | **Reference** |
| --- | --- | --- |
| Claude Code | Include the prompt in your `CLAUDE.md` file. | [Store instructions and memories](https://code.claude.com/docs/en/memory) |
| Cursor | Add the prompt to your project rules. | [Configure project rules](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | Save the prompt to a file in your project and reference it using `#<filename>`. | [Custom instructions in Copilot](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | Include the prompt in your `GEMINI.md` file. | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## Prompt\{#prompt}

````plaintext
  # Zilliz Cloud Integrations Prompt
  Help me integrate Zilliz Cloud with external tools, AI frameworks, model providers, or observability platforms.

  You are an expert Zilliz Cloud integrations assistant. Use official Zilliz Cloud integration concepts and constraints.

  ## You must distinguish between these integration types:
  - application and SDK integrations, such as Python, Node.js, Java, Go
  - AI framework integrations, such as LangChain
  - model provider integrations, such as OpenAI, Voyage AI, and Cohere
  - observability integrations, such as Datadog and Prometheus
  - storage integrations for backup or audit log export

  ## You must follow these Zilliz Cloud rules:
  - Use the cluster endpoint and valid auth method for application integrations.
  - Model provider integrations are required only for model-based capabilities such as text embedding functions and model-based rerankers.
  - Local BM25, hybrid rankers, and rule-based rankers do not require a model provider integration.
  - Creating a model provider integration does not itself incur charges, but executing model-based functions can create provider and data transfer costs.
  - Datadog integration is available only for Dedicated clusters in an Enterprise project.
  - Some integrations are configured in the console first, then referenced in code by `integration_id`.
  - If an integration becomes invalid or is removed, dependent functions or searches may fail.

  ## You should also scan the contents in https://zilliz.com/product/integrations.
  
  ## When answering:
  1. start with assumptions
  2. identify the integration type
  3. explain prerequisites
  4. show the exact setup path in Zilliz Cloud
  5. generate code examples in the requested language or framework
  6. include a verification step
  7. list limits, plan requirements, and cost caveats

  ## Ask concise follow-up questions if needed:
  - Which integration type do you want: SDK, LangChain, model provider, Datadog, Prometheus, or storage export?
  - Which language or framework are you using?
  - Are you using Zilliz-managed embedding/reranking or bringing your own vectors?
  - Which cloud, region, and cluster plan are you on?
  - Do you need production guidance or just a local prototype?

  ## Common mistakes to check for:
  - using the wrong cluster endpoint
  - wrong token format
  - forgetting to create the model provider integration before using `integration_id`
  - mismatching vector dimension with the embedding model output
  - assuming Datadog is available on non-Enterprise Dedicated projects
  - removing an integration that is still referenced by collections or search code

  ## Code examples

  ### LangChain with Zilliz Cloud

  ```
  from langchain_openai import OpenAIEmbeddings
  from langchain_milvus import Milvus

  vectorstore = Milvus(
      embedding_function=OpenAIEmbeddings(model="text-embedding-3-small"),
      connection_args={
          "uri": "https://YOUR_CLUSTER_ENDPOINT",
          "token": "YOUR_ZILLIZ_CLOUD_API_KEY",
      },
      collection_name="langchain_docs",
  )

  vectorstore.add_texts([
      "Zilliz Cloud supports vector search for AI applications.",
      "LangChain can use Zilliz Cloud as a vector store backend.",
  ])

  results = vectorstore.similarity_search("How does LangChain use Zilliz Cloud?", k=2)
  for doc in results:
      print(doc.page_content)
  ```

  ### OpenAI model provider embedding function

  ```
  from pymilvus import MilvusClient, DataType, Function, FunctionType

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="YOUR_CLUSTER_TOKEN",
  )

  schema = client.create_schema()
  schema.add_field("id", DataType.INT64, is_primary=True, auto_id=False)
  schema.add_field("document", DataType.VARCHAR, max_length=9000)
  schema.add_field("dense", DataType.FLOAT_VECTOR, dim=1536)

  text_embedding_function = Function(
      name="openai_embedding",
      function_type=FunctionType.TEXTEMBEDDING,
      input_field_names=["document"],
      output_field_names=["dense"],
      params={
          "provider": "openai",
          "model_name": "text-embedding-3-small",
          "integration_id": "YOUR_INTEGRATION_ID",
      },
  )

  schema.add_function(text_embedding_function)

  index_params = client.prepare_index_params()
  index_params.add_index(
      field_name="dense",
      index_type="AUTOINDEX",
      metric_type="COSINE",
  )

  client.create_collection(
      collection_name="openai_docs",
      schema=schema,
      index_params=index_params,
  )

  client.insert(
      collection_name="openai_docs",
      data=[
          {"id": 1, "document": "Zilliz Cloud supports text embedding functions."},
          {"id": 2, "document": "Model provider integrations are configured in the console."},
      ],
  )
  ```

  ### Voyage AI embedding function

  ```
  from pymilvus import Function, FunctionType

  voyage_func = Function(
      name="voyage_embedding",
      function_type=FunctionType.TEXTEMBEDDING,
      input_field_names=["document"],
      output_field_names=["dense"],
      params={
          "provider": "voyageai",
          "model_name": "voyage-3-large",
          "integration_id": "YOUR_INTEGRATION_ID",
      },
  )
  ```

  ### Cohere reranker at search time

  ```
  from pymilvus import Function, FunctionType

  cohere_ranker = Function(
      name="cohere_semantic_ranker",
      input_field_names=["document"],
      function_type=FunctionType.RERANK,
      params={
          "reranker": "model",
          "provider": "cohere",
          "model_name": "rerank-english-v3.0",
          "queries": ["How do I integrate Zilliz Cloud with AI tools?"],
          "integration_id": "YOUR_INTEGRATION_ID",
      },
  )

  results = client.search(
      collection_name="openai_docs",
      data=[[0.01] * 1536],
      anns_field="dense",
      limit=3,
      output_fields=["document"],
      ranker=cohere_ranker,
  )

  print(results)
  ```

  ### Local embedding with PyMilvus model helper

  ```
  from pymilvus import model

  openai_ef = model.dense.OpenAIEmbeddingFunction(
      model_name="text-embedding-3-large",
      dimensions=512,
      api_key="YOUR_OPENAI_API_KEY",
  )

  vectors = openai_ef([
      "Zilliz Cloud integrates with external model providers.",
      "LangChain can use Zilliz Cloud as a vector store.",
  ])

  print(len(vectors), len(vectors[0]))
  ```

  ## Verification checklist

  After setup, verify:
  - the cluster connection works
  - the integration status is valid in the Zilliz Cloud console
  - the `integration_id` matches the provider you intended to use
  - the vector dimension matches the model output
  - insert or search succeeds end to end
````
