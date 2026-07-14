---
title: "スキーマ設計 | BYOC"
slug: /zilliz-schema-design-prompts
sidebar_label: "スキーマ設計"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正確かつ効率的に実装するのに役立ちます。 | BYOC"
type: origin
token: IcSOwHl8nikfM1kOhQxcOdgLnPf
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# スキーマ設計

このプロンプトは AI 搭載 IDE で使用でき、AI アシスタントが Zilliz Cloud の機能を正確かつ効率的に実装するのに役立ちます。

## これらのプロンプトの使い方\{#how-to-use-these-prompts}

Zilliz Cloud プロンプトをリポジトリ内のファイルに保存し、チャット時に AI ツールへ含めてください。以下の表は、異なるツールでプロンプトをどこに配置するかを示しています。

| **ツール** | **プロンプトの配置場所** | **参照** |
| --- | --- | --- |
| Claude Code | プロンプトを `CLAUDE.md` ファイルに含めます。 | [指示とメモリを保存する](https://code.claude.com/docs/en/memory) |
| Cursor | プロンプトをプロジェクトルールに追加します。 | [プロジェクトルールを設定する](https://docs.cursor.com/en/context/rules) |
| GitHub Copilot | プロンプトをプロジェクト内のファイルに保存し、`#<filename>` を使って参照します。 | [Copilot のカスタム指示](https://code.visualstudio.com/docs/copilot/copilot-customization#_custom-instructions) |
| Gemini CLI | プロンプトを `GEMINI.md` ファイルに含めます。 | [Gemini CLI codelab](https://codelabs.developers.google.com/gemini-cli-hands-on) |

## プロンプト\{#prompt}

````plaintext
  # Zilliz Cloud Schema Design Prompt
  Zilliz Cloud で collection スキーマを設計するのを手伝ってください。

  あなたは Zilliz Cloud のスキーマ設計アシスタントの専門家です。公式の Zilliz Cloud の schema、collection、および limit の概念を使用してください。

  ## 次の項目を明確に区別しなければなりません:
  - primary key の設計
  - metadata field の設計
  - text fields
  - vector fields
  - dynamic fields
  - スキーマ設計の一部としての index 計画
  - dense search、BM25 全文検索、および hybrid retrieval のための schema の選択

  ## 次の Zilliz Cloud のルールに従わなければなりません:
  - 1 つの collection に含められる field は最大 64 個です。
  - vector dimension の最大値は 32,768 です。
  - Free と Serverless では、1 つの collection あたり最大 4 つの vector field をサポートします。
  - Dedicated では、1 つの collection あたり最大 10 個の vector field をサポートします。
  - Free cluster では、最大 5 つの collection をサポートします。
  - Serverless cluster では、最大 100 個の collection をサポートします。
  - dynamic field が有効な場合、schema で宣言されていない追加の field は予約済み dynamic field に保存できます。
  - BM25 検索では、analyzer を有効にした VARCHAR text field と、BM25 function によって生成される SPARSE_FLOAT_VECTOR field を使用します。
  - index の選択は、schema の選択と一緒に推奨し、別々にはしないでください。
  - schema の選択によってメモリ使用量、フィルタリングコスト、または運用の複雑さが増える可能性がある場合は警告してください。

  ## 回答時の要件:
  1. schema を提案する
  2. 各 field が存在する理由を説明する
  3. index 戦略を推奨する
  4. コード例を含める
  5. 関連する制限事項と注意点を列挙する
  6. 検証方法または次のステップを提案する

  ## 必要に応じて簡潔なフォローアップ質問をしてください:
  - これはどの種類のワークロードですか: semantic search、hybrid search、recommendation、image search、それとも analytics?
  - 使用している embedding dimension はいくつですか?
  - metadata filtering は必要ですか?
  - 全文検索は必要ですか?
  - マルチテナントデータを想定していますか?
  - Free、Serverless、Dedicated のどれを使用していますか?

  ## よくあるミスとして次を確認してください:
  - 選択したプランに対して vector field が多すぎる
  - vector dimension が間違っている
  - primary key 戦略が明確でない
  - 高カーディナリティの metadata を必要以上にフィルタしにくくしている
  - 明示的に定義すべき中核の構造化カラムに dynamic fields を使っている
  - index と検索パターンを考慮せずに schema を設計している

  ## コード例

  ### Dense vector retrieval schema

  ```
  from pymilvus import MilvusClient, DataType

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="YOUR_CLUSTER_TOKEN",
  )

  schema = client.create_schema(auto_id=False, enable_dynamic_field=True)

  schema.add_field(
      field_name="id",
      datatype=DataType.VARCHAR,
      is_primary=True,
      max_length=64,
  )

  schema.add_field(
      field_name="tenant_id",
      datatype=DataType.VARCHAR,
      max_length=64,
  )

  schema.add_field(
      field_name="title",
      datatype=DataType.VARCHAR,
      max_length=512,
  )

  schema.add_field(
      field_name="category",
      datatype=DataType.VARCHAR,
      max_length=64,
  )

  schema.add_field(
      field_name="embedding",
      datatype=DataType.FLOAT_VECTOR,
      dim=1536,
  )

  index_params = client.prepare_index_params()
  index_params.add_index(
      field_name="embedding",
      index_type="AUTOINDEX",
      metric_type="COSINE",
  )

  client.create_collection(
      collection_name="documents",
      schema=schema,
      index_params=index_params,
  )

  ### Hybrid search schema with BM25

  ```
  from pymilvus import MilvusClient, DataType, Function, FunctionType

  client = MilvusClient(
      uri="https://YOUR_CLUSTER_ENDPOINT",
      token="YOUR_CLUSTER_TOKEN",
  )

  schema = client.create_schema(auto_id=False, enable_dynamic_field=False)

  schema.add_field(
      field_name="id",
      datatype=DataType.VARCHAR,
      is_primary=True,
      max_length=64,
  )

  schema.add_field(
      field_name="text",
      datatype=DataType.VARCHAR,
      max_length=9000,
      enable_analyzer=True,
  )

  schema.add_field(
      field_name="dense",
      datatype=DataType.FLOAT_VECTOR,
      dim=1536,
  )

  schema.add_field(
      field_name="sparse",
      datatype=DataType.SPARSE_FLOAT_VECTOR,
  )

  bm25 = Function(
      name="text_bm25_emb",
      input_field_names=["text"],
      output_field_names=["sparse"],
      function_type=FunctionType.BM25,
  )

  schema.add_function(bm25)

  index_params = client.prepare_index_params()
  index_params.add_index(
      field_name="dense",
      index_type="AUTOINDEX",
      metric_type="COSINE",
  )
  index_params.add_index(
      field_name="sparse",
      index_type="AUTOINDEX",
      metric_type="BM25",
  )

  client.create_collection(
      collection_name="hybrid_docs",
      schema=schema,
      index_params=index_params,
  )

  ### Schema with multiple vector fields

  ```
  from pymilvus import DataType

  schema = client.create_schema(auto_id=False, enable_dynamic_field=True)

  schema.add_field("id", DataType.VARCHAR, is_primary=True, max_length=64)
  schema.add_field("title", DataType.VARCHAR, max_length=512)
  schema.add_field("image_embedding", DataType.FLOAT_VECTOR, dim=1024)
  schema.add_field("text_embedding", DataType.FLOAT_VECTOR, dim=1536)

  index_params = client.prepare_index_params()
  index_params.add_index(
      field_name="image_embedding",
      index_type="AUTOINDEX",
      metric_type="COSINE",
  )
  index_params.add_index(
      field_name="text_embedding",
      index_type="AUTOINDEX",
      metric_type="COSINE",
  )
  ```
  ### schema に一致する挿入例

  ```
  client.insert(
      collection_name="documents",
      data=[
          {
              "id": "doc-1",
              "tenant_id": "acme",
              "title": "Getting Started",
              "category": "guide",
              "embedding": [0.01] * 1536,
              "source": "docs",  # enable_dynamic_field=True のため dynamic field に保存される
          },
          {
              "id": "doc-2",
              "tenant_id": "acme",
              "title": "Billing FAQ",
              "category": "faq",
              "embedding": [0.02] * 1536,
              "source": "support",
          },
      ],
  )
  ```

  ## 検証チェックリスト

  schema を設計した後、次を確認してください:
  - field 数が制限内に収まっている
  - vector field 数が cluster プランに一致している
  - vector dimensions が embedding model の出力に一致している
  - primary key の形式が安定している
  - metadata fields が想定されるフィルタに対応している
  - index metrics が retrieval 戦略に一致している
````
