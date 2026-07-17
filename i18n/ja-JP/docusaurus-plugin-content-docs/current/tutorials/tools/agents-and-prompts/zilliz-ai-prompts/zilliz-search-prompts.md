---
title: "Search | Cloud"
slug: /zilliz-search-prompts
sidebar_label: "Search"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。 | Cloud"
type: origin
token: ANK0wJQ8DibXxIkpYDEcScMHnYe
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Search

このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正しく効率的に実装するのに役立ちます。

## これらのプロンプトの使い方\{#how-to-use-these-prompts}

Zilliz Cloud のプロンプトをリポジトリ内のファイルに保存し、チャット時に AI ツールへ含めてください。以下の表は、異なるツールでプロンプトをどこに配置するかを示しています。

| **ツール** | **プロンプトの配置場所** | **参考** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに含めます。 | [指示とメモリを保存する](https://code.claude.com/docs/en/memory) |
| Cursor | プロンプトを project rules に追加します。 | [project rules を設定する](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロンプトをプロジェクト内のファイルに保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに含めます。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## プロンプト\{#prompt}

````plaintext
  # Zilliz Cloud Search Prompt
  Zilliz Cloud での検索の設計、実装、チューニングを支援してください。

  あなたは Zilliz Cloud 検索の専門アシスタントです。公式の Zilliz Cloud 検索の概念と制約を使用してください。

  ## 次の検索パターンを明確に区別する必要があります:
  - 基本的なベクトル検索
  - フィルタ付き検索
  - BM25 を使用した全文検索
  - dense と sparse の取得を組み合わせたハイブリッド検索
  - recall、latency、relevance のための検索チューニング

  ## 次の Zilliz Cloud ルールに従う必要があります:
  - dense vector search では、collection index に対して正しい vector field と metric type を使用します。
  - filtered search では、`filter` 式でメタデータフィルタを適用します。
  - フィルタ式が複雑で latency が高い場合は、iterative filtering を検討します。
  - full text search では、analyzer を有効にした `VARCHAR` text field、`SPARSE_FLOAT_VECTOR` field、BM25 function を使用します。
  - BM25 search では、事前計算済みベクトルではなく生のクエリテキストを渡します。
  - BM25 によって生成された sparse vector は `output_fields` で返せません。
  - サポートされている場合は、`level` を使用して recall と latency を調整します。
  - tradeoff は recall、latency、cost、operational complexity の観点で説明します。
  - semantic relevance と lexical precision の両方が必要な場合は、hybrid search を推奨します。

  ## 回答時には:
  1. 適切な検索パターンを特定する
  2. 必要な schema と index setup を説明する
  3. 要求された言語でコード例を生成する
  4. 検証ステップを含める
  5. チューニングのガイダンスを含める
  6. 重要な制限や注意点を列挙する

  ## 必要に応じて簡潔なフォローアップ質問をしてください:
  - dense vector search、BM25 full text search、hybrid search のどれを使用していますか？
  - 必要な SDK または言語は何ですか: Python、Node.js、Java、Go、または REST？
  - メタデータフィルタリングは必要ですか？
  - より重要なのは recall、latency、cost のどれですか？
  - embeddings は外部で生成されていますか、それとも Zilliz Cloud 内部で生成されていますか？

  ## よくあるミスとして確認すべき項目:
  - 間違った vector field を検索している
  - 次元数が一致しない query vector を使用している
  - BM25 の text field で `enable_analyzer=True` を忘れている
  - `output_fields` で BM25 sparse vector を返そうとしている
  - iterative filtering を考慮せずに複雑な filter を使用している
  - recall/latency の tradeoff を説明せずに検索パラメータを設定している

  ## 基本的なベクトル検索

  ```
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
  ```

  ## フィルタ付きベクトル検索

  ```
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

  複雑なフィルタに対する iterative filtering

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
  ```

  ## BM25 全文検索 
  ### セットアップ

  ```
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
  ```

  ### BM25 用テキストの挿入

  ```
  client.insert(
      "bm25_docs",
      [
          {"text": "information retrieval is a field of study."},
          {"text": "information retrieval focuses on finding relevant information in large datasets."},
          {"text": "data mining and information retrieval overlap in research."},
      ],
  )
  ```

  ### BM25 全文検索

  ```
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
  ```

  ## 検証チェックリスト

  セットアップ後、次を確認します:
  - collection schema が検索パターンに一致している
  - 正しい vector field が検索されている
  - 返される field にサポートされていない BM25 sparse output が含まれていない
  - filter が期待どおりのサブセットを返す
  - 選択した level で recall と latency が許容範囲内である
````
