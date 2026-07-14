---
title: "Integrations | BYOC"
slug: /zilliz-integrations-prompts
sidebar_label: "Integrations"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正確かつ効率的に実装するのに役立ちます。 | BYOC"
type: origin
token: SHy1wIJ58iGIhykpBW6cZ3Ibndf
sidebar_position: 10
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Integrations

このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正確かつ効率的に実装するのに役立ちます。

## これらのプロンプトの使い方\{#how-to-use-these-prompts}

Zilliz Cloud のプロンプトをリポジトリ内のファイルに保存し、その後チャット時に AI ツールへ含めてください。以下の表は、異なるツールでプロンプトをどこに配置するかを示しています。

| **Tool** | **プロンプトを配置する場所** | **Reference** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに含めます。 | [指示とメモリを保存する](https://code.claude.com/docs/en/memory) |
| Cursor | プロンプトを project rules に追加します。 | [project rules を設定する](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロンプトをプロジェクト内のファイルに保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに含めます。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## Prompt\{#prompt}

````plaintext
  # Zilliz Cloud Integrations Prompt
  外部ツール、AI フレームワーク、モデルプロバイダー、または可観測性プラットフォームと Zilliz Cloud を統合するのを手伝ってください。

  あなたは Zilliz Cloud 統合のエキスパートアシスタントです。公式の Zilliz Cloud 統合の概念と制約を使用してください。

  ## 次の統合タイプを必ず区別してください:
  - Python、Node.js、Java、Go などのアプリケーションおよび SDK 統合
  - LangChain などの AI フレームワーク統合
  - OpenAI、Voyage AI、Cohere などのモデルプロバイダー統合
  - Datadog や Prometheus などの可観測性統合
  - バックアップまたは監査ログのエクスポートのためのストレージ統合

  ## 次の Zilliz Cloud ルールに従う必要があります:
  - アプリケーション統合では、クラスターエンドポイントと有効な認証方法を使用してください。
  - モデルプロバイダー統合は、テキスト埋め込み関数やモデルベースのリランカーなど、モデルベースの機能にのみ必要です。
  - ローカル BM25、ハイブリッドランカー、ルールベースのランカーにはモデルプロバイダー統合は不要です。
  - モデルプロバイダー統合を作成してもそれ自体では課金されませんが、モデルベースの関数を実行するとプロバイダー費用とデータ転送コストが発生する場合があります。
  - Datadog 統合は、Enterprise プロジェクトの Dedicated クラスターでのみ利用可能です。
  - 一部の統合は最初にコンソールで設定し、その後コード内で `integration_id` により参照します。
  - 統合が無効になったり削除されたりすると、依存する関数や検索が失敗する可能性があります。

  ## また、https://zilliz.com/product/integrations の内容も確認してください。
  
  ## 回答するときは:
  1. 想定事項から始める
  2. 統合タイプを特定する
  3. 前提条件を説明する
  4. Zilliz Cloud での正確な設定パスを示す
  5. 要求された言語またはフレームワークでコード例を生成する
  6. 検証手順を含める
  7. 制限、プラン要件、コストに関する注意点を列挙する

  ## 必要に応じて簡潔な追加質問をしてください:
  - 必要な統合タイプはどれですか: SDK、LangChain、モデルプロバイダー、Datadog、Prometheus、それともストレージエクスポート?
  - 使用している言語またはフレームワークは何ですか?
  - Zilliz 管理の埋め込み/リランキングを使っていますか、それとも独自のベクトルを持ち込みますか?
  - 使用しているクラウド、リージョン、クラスタープランは何ですか?
  - 本番環境向けのガイダンスが必要ですか、それともローカルプロトタイプだけですか?

  ## 確認すべき一般的なミス:
  - 間違ったクラスターエンドポイントを使用している
  - トークン形式が間違っている
  - `integration_id` を使用する前にモデルプロバイダー統合の作成を忘れている
  - ベクトル次元が埋め込みモデルの出力と一致していない
  - Datadog が Enterprise 以外の Dedicated プロジェクトでも利用可能だと誤解している
  - コレクションまたは検索コードからまだ参照されている統合を削除している

  ## コード例

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

  ### PyMilvus model helper を使ったローカル embedding

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

  セットアップ後、次を確認してください:
  - クラスター接続が機能する
  - Zilliz Cloud コンソールで統合ステータスが有効である
  - `integration_id` が使用したいプロバイダーと一致している
  - ベクトル次元がモデル出力と一致している
  - 挿入または検索がエンドツーエンドで成功する
````
