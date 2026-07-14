---
title: "Text Field | BYOC"
slug: /use-text-field
sidebar_label: "Text Field"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AI 検索アプリケーションでは、vector search は意味的に類似したエンティティを見つけるのに役立ちますが、アプリケーションでは多くの場合、各一致の背後にある元のソーステキストも必要になります。LLM や agent は、そのテキストをコンテキストとして使用して、読み取り、引用、要約、またはプロンプトに結果を含めることができます。 | BYOC"
type: origin
token: GBynwwkyBihIHukvJXfc76dMnth
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Text Field

AI 検索アプリケーションでは、vector search は意味的に類似したエンティティを見つけるのに役立ちますが、アプリケーションでは多くの場合、各一致の背後にある元のソーステキストも必要になります。LLM や agent は、そのテキストをコンテキストとして使用して、読み取り、引用、要約、またはプロンプトに結果を含めることができます。

Zilliz Cloud は、長いソーステキストをエンティティとともに直接保存するための `TEXT` scalar field type を提供します。一般的な値には、passage、長文ドキュメント、記事本文、チケット、ログが含まれます。固定の `max_length` を必要とする `VARCHAR` とは異なり、`TEXT` では collection schema で最大バイト長を設定する必要がありません。

collection schema で `TEXT` field を定義するには、`datatype` を `DataType.TEXT` に設定します。

```python
schema.add_field(
    field_name="content",
    # highlight-next-line
    datatype=DataType.TEXT,
)
```

field を定義した後は、各エンティティがその field に文字列値を含めることができます。値の挿入は他の scalar field と同様に行い、query または search の結果から返すには、`output_fields` にその field を指定します。

<Admonition type="info" icon="📘" title="注意">

TEXT field は null 値をサポートします。この機能を有効にするには、nullable を True に設定します。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

</Admonition>

## Limits\{#limits}

- `TEXT` field は primary field にできません。primary field でサポートされるのは `INT64` と `VARCHAR` です。

- `TEXT` field は `PHRASE_MATCH` をサポートしません。

- `TEXT` field はデフォルト値をサポートしません。

- `TEXT` field は scalar index をサポートしません。

- `TEXT` は通常のメタデータフィルタリング向けではありません。短い文字列メタデータでフィルタリングする必要があり、その field の値が `VARCHAR` の長さ制限内に収まる場合は、`VARCHAR` を使用してください。

- `TEXT` field は external collections ではサポートされません。

## Choose TEXT or VARCHAR\{#choose-text-or-varchar}

`TEXT` と `VARCHAR` はどちらも文字列値を保存しますが、サポートするアプリケーション要件は異なります。`VARCHAR` は、エンティティを識別、分類、またはフィルタリングするための短く長さが制限されたメタデータに使用します。`TEXT` は、LLM や agent が読み取り、引用、要約、またはプロンプト構築を行うのに十分なコンテキストを提供する、より長いソースコンテンツに使用します。

| **Aspect** | **VARCHAR** | **TEXT** |
| --- | --- | --- |
| 最適な用途 | `title`、`tag`、`category`、`external_id` など、エンティティの識別、分類、フィルタリングに使用する短いメタデータ。 | `content`、`passage`、`article_body`、`log_message` など、LLM や agent のワークフローで使用される長いソースコンテンツ。 |
| 長さ設定 | field に保存できる最大バイト数を定義する `max_length` が必要です。最大値は 65,535 バイトです。値がこの制限を超える可能性がある場合は、`TEXT` を使用してください。 | `max_length` は不要なため、schema でテキスト値に対する固定バイト制限を設定する必要がありません。 |
| ストレージの動作 | field に設定された `max_length` の範囲内で各値を保存します。 | より大きなテキスト値に対して自動的にストレージ選択を行います。 |
| Primary field のサポート | primary field として使用できます。 | primary field として使用できません。 |
| Filtering | `category == "news"` や `tag in ["ai", "database"]` などの filter expression に含める必要がある短い文字列メタデータに使用します。 | 通常のメタデータフィルタリング向けではありません。 |

`VARCHAR` field の詳細については、[VARCHAR Field](https://milvus.io/docs/string.md) を参照してください。

`TEXT` の一般的な用途は、BM25 を使用した Full Text Search です。このパターンでは、`TEXT` field に元のソースコンテンツを保存し、BM25 がテキストを解析して、キーワードベースの一致をランキングするための sparse vector を生成します。その後、search 結果は、一致した `TEXT` 値を LLM や agent のワークフロー用のコンテキストとして返すことができます。次の例では、BM25 の入力 field として `TEXT` field を使用する方法を示します。Full Text Search の概念とクエリオプションについては、[Full Text Search](./full-text-search) を参照してください。

## Step 1: Create a collection with a TEXT field\{#step-1-create-a-collection-with-a-text-field}

次の例では、ソースコンテンツ用の `TEXT` field と、BM25 が生成する sparse vector 用の sparse vector field を持つ collection を作成します。BM25 function は、`content` からトークン化されたテキストを、`sparse` に保存される sparse vector に変換します。

BM25 full text search では、入力 `TEXT` field で `enable_analyzer=True` を設定する必要があります。

```python
from pymilvus import DataType, Function, FunctionType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
COLLECTION_NAME = "text_bm25_collection"

if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

schema = client.create_schema(auto_id=False, enable_dynamic_field=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
# highlight-start
schema.add_field(
    field_name="content",
    datatype=DataType.TEXT,
    enable_analyzer=True,
)
# highlight-end
schema.add_field(field_name="sparse", datatype=DataType.SPARSE_FLOAT_VECTOR)

# highlight-start
bm25_function = Function(
    name="content_bm25",
    input_field_names=["content"],
    output_field_names=["sparse"],
    function_type=FunctionType.BM25,
)
schema.add_function(bm25_function)
# highlight-end
```

## Step 2: Create a sparse vector index\{#step-2-create-a-sparse-vector-index}

BM25 function によって生成される sparse vector field に index を作成します。metric type は `BM25` に設定する必要があります。

```python
index_params = client.prepare_index_params()
# highlight-start
index_params.add_index(
    field_name="sparse",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={
        "inverted_index_algo": "DAAT_MAXSCORE",
        "bm25_k1": 1.2,
        "bm25_b": 0.75,
    },
)
# highlight-end

client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema,
    index_params=index_params,
)
```

## Step 3: Insert TEXT data\{#step-3-insert-text-data}

テキストを `TEXT` field に直接挿入します。`sparse` field には値を指定しないでください。Milvus は、`content` に BM25 function を適用することで、内部的に sparse vector を生成します。

```python
data = [
    {
        "id": 1,
        "content": "Milvus stores vector embeddings and scalar fields in collections. It supports vector search, full text search, and metadata filtering for retrieval applications.",
    },
    {
        "id": 2,
        "content": "Long documents are often split into passages before embedding. Store each passage in a TEXT field so search results can return the source text.",
    },
    {
        "id": 3,
        "content": "Operational logs and support tickets often contain long natural-language text. TEXT fields can store these values without a fixed max_length setting.",
    },
]

client.insert(collection_name=COLLECTION_NAME, data=data)
client.load_collection(collection_name=COLLECTION_NAME)
```

## Step 4: Perform BM25 full text search\{#step-4-perform-bm25-full-text-search}

生のクエリテキストを search データとして使用し、sparse vector field に対して search を実行します。Milvus はクエリテキストを sparse vector に変換し、BM25 で一致をランキングし、要求された `TEXT` field を `output_fields` で返します。

```python
results = client.search(
    collection_name=COLLECTION_NAME,
    # highlight-start
    data=["how does Milvus store source text for retrieval"],
    anns_field="sparse",
    limit=2,
    output_fields=["content"],
    # highlight-end
)
```

## Step 5: Read the returned TEXT values\{#step-5-read-the-returned-text-values}

各 search hit には、BM25 スコアと元の `TEXT` 値が含まれます。

```python
for hit in results[0]:
    print(f"id: {hit['id']}, score: {hit['distance']}")
    print(hit["entity"]["content"])
```

BM25 functions、sparse vector index、および full text search のクエリ構文の詳細については、[Full Text Search](./full-text-search) を参照してください。
