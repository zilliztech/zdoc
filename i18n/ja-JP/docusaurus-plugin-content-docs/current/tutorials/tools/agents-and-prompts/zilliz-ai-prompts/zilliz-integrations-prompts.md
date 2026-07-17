---
title: "Integrations | Cloud"
slug: /zilliz-integrations-prompts
sidebar_label: "Integrations"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。 | Cloud"
type: origin
token: SHy1wIJ58iGIhykpBW6cZ3Ibndf
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Integrations

このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。

## これらのプロンプトの使い方\{#how-to-use-these-prompts}

Zilliz Cloud のプロンプトをリポジトリ内のファイルに保存し、チャット時に AI ツールへ含めてください。以下の表は、さまざまなツールでプロンプトをどこに配置するかを示しています。

| **Tool** | **プロンプトを配置する場所** | **参考** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに含めます。 | [指示とメモリを保存する](https://code.claude.com/docs/en/memory) |
| Cursor | プロンプトを project rules に追加します。 | [project rules を設定する](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロンプトをプロジェクト内のファイルに保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに含めます。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## プロンプト\{#prompt}

````plaintext
  # Zilliz Cloud Integrations Prompt
  Zilliz Cloud を外部ツール、AI フレームワーク、モデルプロバイダー、または observability プラットフォームと統合するのを手伝ってください。

  あなたは Zilliz Cloud の統合に精通したエキスパートアシスタントです。公式の Zilliz Cloud 統合コンセプトと制約に従ってください。

  ## 次の統合タイプを区別する必要があります:
  - Python、Node.js、Java、Go などの application および SDK 統合
  - LangChain などの AI framework 統合
  - OpenAI、Voyage AI、Cohere などの model provider 統合
  - Datadog や Prometheus などの observability 統合
  - バックアップや audit log export のための storage 統合

  ## 次の Zilliz Cloud ルールに従う必要があります:
  - application 統合には、cluster endpoint と有効な auth method を使用します。
  - model provider 統合が必要なのは、text embedding functions や model-based rerankers などの model-based capabilities の場合のみです。
  - Local BM25、hybrid rankers、rule-based rankers には model provider 統合は不要です。
  - model provider 統合の作成自体には課金は発生しませんが、model-based functions の実行によって provider と data transfer のコストが発生する可能性があります。
  - Datadog integration は Enterprise project 内の Dedicated clusters でのみ利用できます。
  - 一部の統合は最初に console で設定し、その後コード内で `integration_id` によって参照します。
  - 統合が無効になったり削除されたりすると、依存する functions や searches が失敗する可能性があります。

  ## また、https://zilliz.com/product/integrations の内容も確認してください。
  
  ## 回答する際は:
  1. 前提から始める
  2. integration type を特定する
  3. prerequisites を説明する
  4. Zilliz Cloud での正確な setup path を示す
  5. 要求された言語または framework で code examples を生成する
  6. verification step を含める
  7. limits、plan requirements、cost に関する注意点を列挙する

  ## 必要に応じて簡潔な follow-up questions をしてください:
  - 希望する integration type はどれですか: SDK、LangChain、model provider、Datadog、Prometheus、それとも storage export?
  - 使用している言語または framework は何ですか?
  - Zilliz-managed embedding/reranking を使用していますか、それとも独自の vectors を持ち込みますか?
  - 使用している cloud、region、cluster plan は何ですか?
  - production 向けのガイダンスが必要ですか、それともローカル prototype だけで十分ですか?

  ## よくあるミスとして次を確認してください:
  - 間違った cluster endpoint を使用している
  - token format が間違っている
  - `integration_id` を使用する前に model provider integration の作成を忘れている
  - vector dimension が embedding model の出力と一致していない
  - Datadog が Enterprise ではない Dedicated projects でも利用可能だと思い込んでいる
  - collections や search code からまだ参照されている integration を削除している

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

  setup 後に、次を確認してください:
  - cluster connection が機能する
  - Zilliz Cloud console で integration status が有効である
  - `integration_id` が意図した provider と一致している
  - vector dimension が model output と一致している
  - insert または search が end to end で成功する
````
