---
title: "LlamaIn dexでパイプラインを使用する | Cloud"
slug: /use-pipeline-in-llamaindex
sidebar_label: "LlamaIn dexでパイプラインを使用する"
beta: NEAR DEPRECATE
notebook: FALSE
description: "Zilliz Cloudパイプライン](./pipelines)は、スケーラブルな検索APIサービスです。Zilliz Cloud Pipelinesを[LLamaIn dexのマネージドインデックスとして使用できます。このサービスは、ドキュメントをベクトル埋め込みに変換し、Zilliz Cloudに保存することで、効果的なセマンティック検索を実現します。 | Cloud"
type: origin
token: Wg3kwOqKXiJQK9k7wh2ccanlnhg
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - integration
  - llamaindex
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW

---

import Admonition from '@theme/Admonition';


# LlamaIn dexでパイプラインを使用する

[Zilliz Cloudパイプライン](./pipelines)は、スケーラブルな検索APIサービスです。Zilliz Cloud Pipelinesを[LLamaIn dex](https://docs.llamaindex.ai/en/stable/examples/managed/zcpDemo.html)のマネージドインデックスとして使用できます。このサービスは、ドキュメントをベクトル埋め込みに変換し、Zilliz Cloudに保存することで、効果的なセマンティック検索を実現します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz Cloud Pipelinesは、2025年第2四半期の終わりまでに廃止され、「Data In, Data Out」という新しい機能に置き換えられます。これにより、MilvusとZilliz Cloudの両方で埋め込み生成が効率化されます。2024年12月24日現在、新規ユーザー登録は受け付けられていません。現在のユーザーは、日没日まで月額20ドルの無料手当内でサービスを継続して利用できますが、SLAは提供されていません。モデルプロバイダーまたはオープンソースモデルの埋め込みAPIを使用してベクトル埋め込みを生成することを検討してください。</p>

</Admonition>

## 始める前に{#before-you-start}

あなたはすべきです

- LLamaIn dex Python SDKのインストール

    ```bash
    pip install llama-index
    ```

- [Open AI](https://platform.openai.com/)と[Zillizクラウド](https://cloud.zilliz.com/signup?utm_source=twitter&amp;utm_medium=social%20&amp;utm_campaign=2023-12-22_social_pipeline-llamaindex_twitter)アカウントの資格情報を設定してください。

    ```python
    from getpass import getpass
    import os
    
    os.environ["OPENAI_API_KEY"] = getpass("Enter your OpenAI API Key:")
    
    ZILLIZ_PROJECT_ID = getpass("Enter your Zilliz Project ID:")
    ZILLIZ_CLUSTER_ID = getpass("Enter your Zilliz Cluster ID:")
    ZILLIZ_TOKEN = getpass("Enter your Zilliz API Key:")
    ```

## インデックスドキュメント{#index-documents}

Zilliz Cloud Pipelinesは、AWS S 3およびGoogle Cloud Storageからファイルを受け入れます。オブジェクトストレージから事前署名付きURLを生成し、`from_document_url()`または`insert_doc_url()`を使用してファイルを取り込むことができます。ドキュメントを自動的にインデックス化し、ドキュメントチャンクをベクトルとしてZilliz Cloudに保存することができます。

```python
from llama_index.indices import ZillizCloudPipelineIndex

zcp_index = ZillizCloudPipelineIndex.from_document_url(
    # a public or pre-signed url of a file stored on AWS S3 or Google Cloud Storage
    url="https://raw.githubusercontent.com/milvus-io/milvus-docs/refs/heads/v2.5.x/site/en/about/overview.md",
    project_id=ZILLIZ_PROJECT_ID,
    cluster_id=ZILLIZ_CLUSTER_ID,
    token=ZILLIZ_TOKEN,
    # optional
    metadata={"version": "2.3"},  # used for filtering
    collection_name="zcp_llamalection",  # change this value will specify customized collection name
)

# Insert more docs, eg. a Milvus v2.2 document
zcp_index.insert_doc_url(
    url="https://raw.githubusercontent.com/milvus-io/milvus-docs/refs/heads/v2.2.x/site/en/about/overview.md",
    metadata={"version": "2.2"},
)

# Output
# {'token_usage': 984, 'doc_name': 'milvus_doc_22.md', 'num_chunks': 7}

# # Delete docs by doc name
# zcp_index.delete_by_doc_name(doc_name="milvus_doc_22.md")
```

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p>Zilliz Cloudパイプラインがない場合は、自動的に作成されます。</p></li>
<li><p>ドキュメントごとにメタデータを追加することは任意です。メタデータを使用して、取得時に文書チャンクをフィルタリングできます。</p></li>
</ul>

</Admonition>

## クエリエンジンとしてパイプラインを使用する{#use-pipelines-as-query-engine}

`ZillizCloudPipelineIndex`でセマンティック検索を実行するには、いくつかのパラメータを指定して`as_query_engine()`を使用できます。

- **search_top_k**:取得するテキストノード/チャンクの数。デフォルトは`DEFAULT_SIMILARITY_TOP_K`(2)です。

- **フィルター**:メタデータフィルター。デフォルトはNoneです。

- 出力メタデータ:取得したテキストノードとともに返すメタデータフィールドの名前のリスト。デフォルトは`[]`です。

```python
from llama_index.vector_stores.types import ExactMatchFilter, MetadataFilters

query_engine_milvus23 = zcp_index.as_query_engine(
    search_top_k=3,
    filters=MetadataFilters(
        filters=[
            ExactMatchFilter(key="version", value="2.3")
        ]  # version == "2.3"
    ),
    output_metadata=["version"],
)
```

その後、クエリエンジンはMilvus 2.3ドキュメントを使用したセマンティック検索または検索拡張生成の準備ができています。

### 取得する{#retrieve}

次のコードスニペットは、Zilliz Cloud Pipelinesを使用してセマンティック検索を実行する方法を示しています。

```python
question = "Can users delete entities by filtering non-primary fields?"
retrieved_nodes = query_engine_milvus23.retrieve(question)
print(retrieved_nodes)

# Output
# [NodeWithScore(node=TextNode(id_='447198459513870883', embedding=None, metadata={'version': '2.3'}, excluded_embed_metadata_keys=[], excluded_llm_metadata_keys=[], relationships={}, text='# Delete Entities\nThis topic describes how to delete entities in Milvus.  \nMilvus supports deleting entities by primary key or complex boolean expressions. Deleting entities by primary key is much faster and lighter than deleting them by complex boolean expressions. This is because Milvus executes queries first when deleting data by complex boolean expressions.  \nDeleted entities can still be retrieved immediately after the deletion if the consistency level is set lower than Strong.\nEntities deleted beyond the pre-specified span of time for Time Travel cannot be retrieved again.\nFrequent deletion operations will impact the system performance.  \nBefore deleting entities by comlpex boolean expressions, make sure the collection has been loaded.\nDeleting entities by complex boolean expressions is not an atomic operation. Therefore, if it fails halfway through, some data may still be deleted.\nDeleting entities by complex boolean expressions is supported only when the consistency is set to Bounded. For details, see Consistency.', start_char_idx=None, end_char_idx=None, text_template='{metadata_str}\n\n{content}', metadata_template='{key}: {value}', metadata_seperator='\n'), score=0.728226900100708), NodeWithScore(node=TextNode(id_='447198459513870886', embedding=None, metadata={'version': '2.3'}, excluded_embed_metadata_keys=[], excluded_llm_metadata_keys=[], relationships={}, text='# Delete Entities\n## Prepare boolean expression\n### Complex boolean expression\nTo filter entities that meet specific conditions, define complex boolean expressions.  \nFilter entities whose word_count is greater than or equal to 11000:  \n```python\nexpr = "word_count >= 11000"\n```  \nFilter entities whose book_name is not Unknown:  \n```python\nexpr = "book_name != Unknown"\n```  \nFilter entities whose primary key values are greater than 5 and word_count is smaller than or equal to 9999:  \n```python\nexpr = "book_id > 5 && word_count <= 9999"\n```', start_char_idx=None, end_char_idx=None, text_template='{metadata_str}\n\n{content}', metadata_template='{key}: {value}', metadata_seperator='\n'), score=0.687866747379303), NodeWithScore(node=TextNode(id_='447198459513870884', embedding=None, metadata={'version': '2.3'}, excluded_embed_metadata_keys=[], excluded_llm_metadata_keys=[], relationships={}, text='# Delete Entities\n## Prepare boolean expression\nPrepare the boolean expression that filters the entities to delete.  \nMilvus supports deleting entities by primary key or complex boolean expressions. For more information on expression rules and supported operators, see Boolean Expression Rules.', start_char_idx=None, end_char_idx=None, text_template='{metadata_str}\n\n{content}', metadata_template='{key}: {value}', metadata_seperator='\n'), score=0.6814976334571838)]

```

フィルターを備えたクエリエンジンは、「バージョン2.3」タグを持つテキストノードのみを取得します。

### クエリ{#query}

次のコードスニペットは、Zilliz Cloud PipelinesとOpen AIのLLMによってバックアップされたRAGエージェントとしてクエリエンジンを使用する方法を示しています。

```python
response = query_engine_milvus23.query(question)
print(response.response)

# Output
# Yes, users can delete entities by filtering non-primary fields using complex boolean expressions in Milvus. The complex boolean expressions allow users to define specific conditions to filter entities based on non-primary fields, such as word_count or book_name. By specifying the desired conditions in the boolean expression, users can delete entities that meet those conditions. However, it is important to note that deleting entities by complex boolean expressions is not an atomic operation, and if it fails halfway through, some data may still be deleted.
```

## 高度なユースケース{#advanced-use-cases}

データ取り込みを実行せずに、マネージドインデックスを取得できます。Zilliz Cloud Pipelinesを使用するには、パイプラインIDまたは関連するコレクション名を指定する必要があります。

- **パイプラインID**

    `{"INGESTION": "pipe-xx1", "SEARCH": "pipe-xx2", "DELETION": “pipe-xx3”}`などのINGESTION、SEARCH、DELETIONパイプラインのIDを含むディクショナリ

- **コレクション名**

    コレクション名のデフォルトは`zcp_llamalection`です。パイプラインIDが指定されていない場合、インデックスは関連するコレクションの名前を持つパイプラインを取得しようとします。

```python
from llama_index.indices import ZillizCloudPipelineIndex

advanced_zcp_index = ZillizCloudPipelineIndex(
    project_id=ZILLIZ_PROJECT_ID,
    cluster_id=ZILLIZ_CLUSTER_ID,
    token=ZILLIZ_TOKEN,
    collection_name="zcp_llamalection_advanced",
)

# Output
# No available pipelines. Please create pipelines first.
```

### パイプラインのカスタマイズ{#customize-pipelines}

パイプラインが指定されていない場合、または見つからない場合は、以下の**オプション**パラメータを使用して手動でパイプラインを作成およびカスタマイズできます。

- **metadata_schema**:フィールド名をキーとし、データ型を値とするメタデータスキーマの辞書です。例えば、`{"user_id": "VarChar"}`です。

- **chunkSize**:トークンを単位としたチャンク体格の整数。チャンク体格が指定されていない場合、Zilliz Cloud Pipelineは組み込みデフォルトのチャンク体格(500トークン)を使用してドキュメントを分割します。

その他の適用可能なパラメーターについては、[Zilliz Cloudパイプライン](/docs/pipelines)を参照してください。

```python
advanced_zcp_index.create_pipelines(
    metadata_schema={"user_id": "VarChar"},
    chunkSize=350,
    # other pipeline params
)

# Output
# {'INGESTION': 'pipe-***********************,
#  'SEARCH': 'pipe-***********************',
#  'DELETION': 'pipe-***********************'}
```

### マルチテナント{#multi-tenancy}

テナント固有の値(例:ユーザーID)をメタデータとして使用することで、管理対象インデックスはメタデータフィルターを適用することでマルチテナントを実現できます。

メタデータ値を指定することで、各ドキュメントは取り込み時にテナント固有のフィールドでタグ付けされます。

```python
advanced_zcp_index.insert_doc_url(
    url="https://raw.githubusercontent.com/milvus-io/milvus-docs/refs/heads/v2.5.x/site/en/about/overview.md",
    metadata={"user_id": "user_001"},
)

# Output
# {'token_usage': 1247, 'doc_name': 'milvus_doc.md', 'num_chunks': 10}
```

その後、管理されたインデックスは、テナント固有のフィールドをフィルタリングして、各テナントのクエリエンジンを構築できます。

```python
from llama_index.vector_stores.types import ExactMatchFilter, MetadataFilters

query_engine_for_user_001 = advanced_zcp_index.as_query_engine(
    search_top_k=3,
    filters=MetadataFilters(
        filters=[ExactMatchFilter(key="user_id", value="user_001")]
    ),
    output_metadata=["user_id"],  # optional, display user_id in outputs
)
```

`filters`を変更して、さまざまな条件でクエリエンジンを構築できます。

```python
question = "Can I delete entities by filtering non-primary fields?"

# search_results = query_engine_for_user_001.retrieve(question)
response = query_engine_for_user_001.query(question)
print(response.response)

# Output
# Yes, you can delete entities by filtering non-primary fields. Milvus supports deleting entities by complex boolean expressions, which allows you to filter entities based on specific conditions on non-primary fields. You can define complex boolean expressions using operators such as greater than or equal to, not equal to, and logical operators like AND and OR. By using these expressions, you can filter entities based on the values of non-primary fields and delete them accordingly.
```
