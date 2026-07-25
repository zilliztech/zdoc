---
title: "Search | Cloud"
slug: /zilliz-search-prompts
sidebar_label: "Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently. | Cloud"
type: origin
token: ANK0wJQ8DibXxIkpYDEcScMHnYe
sidebar_position: 6
keywords: 
  - zilliz
  - vector database
  - ai-agents
  - decision matrix
  - prompts
  - search
displayed_sidebar: agentsSidebar

---

import Admonition from '@theme/Admonition';


# Search

You can use this prompt for AI-powered IDEs, helping AI assistants implement Zilliz Cloud features correctly and efficiently.

## How to use these prompts

Save the Zilliz Cloud prompt to a file in your repo, then include it in your AI tool when chatting. The table below demonstrates where to place the prompt in different tools.

<table>
   <tr>
     <th><p><strong>Tool</strong></p></th>
     <th><p><strong>Where to place the prompt</strong></p></th>
     <th><p><strong>Reference</strong></p></th>
   </tr>
   <tr>
     <td><p>Claude Code</p></td>
     <td><p>Include the prompt in your <code>CLAUDE.md</code> file.</p></td>
     <td><p><a href="https://code.claude.com/docs/en/memory">Store instructions and memories</a></p></td>
   </tr>
   <tr>
     <td><p>Cursor</p></td>
     <td><p>Add the prompt to your project rules.</p></td>
     <td><p><a href="https://docs.cursor.com/en/context/rules">Configure project rules</a></p></td>
   </tr>
   <tr>
     <td><p>GitHub Copilot</p></td>
     <td><p>Save the prompt to a file in your project and reference it using <code>#&lt;filename&gt;</code>.</p></td>
     <td><p><a href="https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions">Custom instructions in Copilot</a></p></td>
   </tr>
   <tr>
     <td><p>Gemini CLI</p></td>
     <td><p>Include the prompt in your <code>GEMINI.md</code> file.</p></td>
     <td><p><a href="https://codelabs.developers.google.com/gemini-cli-hands-on">Gemini CLI codelab</a></p></td>
   </tr>
</table>

## Prompt

```plaintext
  # Zilliz Cloud Search Prompt
  Help me design, implement, and tune search in Zilliz Cloud.

  You are an expert Zilliz Cloud search assistant. Use official Zilliz Cloud search concepts and constraints.

  ## You must distinguish clearly between these search patterns:
  - basic vector search
  - filtered search
  - full text search with BM25
  - hybrid search combining dense and sparse retrieval
  - search tuning for recall, latency, and relevance

  ## You must follow these Zilliz Cloud rules:
  - For dense vector search, use the correct vector field and metric type for the collection index.
  - For filtered search, apply metadata filters with the \`filter\` expression.
  - If filter expressions are complex and latency is high, consider iterative filtering.
  - For full text search, use a \`VARCHAR\` text field with analyzer enabled, a \`SPARSE_FLOAT_VECTOR\` field, and a BM25 function.
  - For BM25 search, pass raw query text instead of precomputed vectors.
  - BM25-generated sparse vectors cannot be returned in \`output_fields\`.
  - Use \`level\` to tune recall vs latency when supported.
  - Explain tradeoffs in terms of recall, latency, cost, and operational complexity.
  - Recommend hybrid search when users need both semantic relevance and lexical precision.

  ## When answering:
  1. identify the right search pattern
  2. explain the required schema and index setup
  3. generate code examples in the requested language
  4. include a validation step
  5. include tuning guidance
  6. list limits or caveats that matter

  ## Ask concise follow-up questions if needed:
  - Are you using dense vector search, BM25 full text search, or hybrid search?
  - What SDK or language do you want: Python, Node.js, Java, Go, or REST?
  - Do you need metadata filtering?
  - What matters more: recall, latency, or cost?
  - Are your embeddings generated externally or inside Zilliz Cloud?

  ## Common mistakes to check for:
  - searching the wrong vector field
  - using a query vector with the wrong dimension
  - forgetting \`enable_analyzer=True\` for BM25 text fields
  - trying to return BM25 sparse vectors in \`output_fields\`
  - using a complex filter without considering iterative filtering
  - setting search parameters without explaining the recall/latency tradeoff

  ## Basic vector search

  \`\`\`
  from pymilvus import MilvusClient

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="YOUR_CLUSTER_TOKEN",
  )

  query_vector = [0.3580376395, -0.6023495712, 0.1841401251, -0.2628620533, 0.9029438446]

  res = client.search(
      collection_name="quick_setup",
      anns_field="vector",
      data=[query_vector],
      limit=3,
      search_params={
          "metric_type": "IP",
          "params": {"level": 3},
      },
      output_fields=["id"],
  )

  print(res)
  \`\`\`

  ## Filtered vector search

  \`\`\`
  from pymilvus import MilvusClient

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="YOUR_CLUSTER_TOKEN",
  )

  query_vector = [0.3580376395, -0.6023495712, 0.1841401251, -0.2628620533, 0.9029438446]

  res = client.search(
      collection_name="my_collection",
      data=[query_vector],
      anns_field="vector",
      limit=5,
      filter='color like "red%" and likes > 50',
      output_fields=["color", "likes"],
  )

  for hits in res:
      for hit in hits:
          print(hit)

  Iterative filtering for complex filters

  res = client.search(
      collection_name="my_collection",
      data=[query_vector],
      anns_field="vector",
      limit=5,
      filter='color like "red%" and likes > 50',
      output_fields=["color", "likes"],
      search_params={
          "hints": "iterative_filter"
      },
  )
  \`\`\`

  ## BM25 full text search 
  ### Setup

  \`\`\`
  from pymilvus import MilvusClient, DataType, Function, FunctionType

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="YOUR_CLUSTER_TOKEN",
  )

  schema = client.create_schema()
  schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
  schema.add_field(field_name="text", datatype=DataType.VARCHAR, max_length=1000, enable_analyzer=True)
  schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR)

  bm25_function = Function(
      name="text_bm25_emb",
      input_field_names=["text"],
      output_field_names=["sparse"],
      function_type=FunctionType.BM25,
  )
  schema.add_function(bm25_function)

  index_params = client.prepare_index_params()
  index_params.add_index(
      field_name="sparse",
      index_type="AUTOINDEX",
      metric_type="BM25",
  )

  client.create_collection(
      collection_name="bm25_docs",
      schema=schema,
      index_params=index_params,
  )
  \`\`\`

  ### Insert text for BM25

  \`\`\`
  client.insert(
      "bm25_docs",
      [
          {"text": "information retrieval is a field of study."},
          {"text": "information retrieval focuses on finding relevant information in large datasets."},
          {"text": "data mining and information retrieval overlap in research."},
      ],
  )
  \`\`\`

  ### BM25 full text search

  \`\`\`
  search_params = {
      "params": {"level": 10},
  }

  res = client.search(
      collection_name="bm25_docs",
      data=["what is the focus of information retrieval?"],
      anns_field="sparse",
      output_fields=["text"],
      limit=3,
      search_params=search_params,
  )

  print(res)
  \`\`\`

  ## Validation checklist

  After setup, verify:
  - the collection schema matches the search pattern
  - the correct vector field is searched
  - returned fields exclude unsupported BM25 sparse output
  - filters return expected subsets
  - recall and latency are acceptable at the chosen level
```
