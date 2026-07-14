---
title: "テキストフィールド | Cloud"
slug: /use-text-field
sidebar_label: "テキストフィールド"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AI 検索アプリケーションでは、ベクトル検索によって意味的に類似したエンティティを見つけられますが、多くの場合、アプリケーションでは各一致結果の背後にある元のソーステキストも必要になります。LLM やエージェントは、そのテキストをコンテキストとして使用して、読み取り、引用、要約、または結果をプロンプトに含めることができます。 | Cloud"
type: origin
token: GBynwwkyBihIHukvJXfc76dMnth
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# テキストフィールド

AI 検索アプリケーションでは、ベクトル検索によって意味的に類似したエンティティを見つけられますが、多くの場合、アプリケーションでは各一致結果の背後にある元のソーステキストも必要になります。LLM やエージェントは、そのテキストをコンテキストとして使用して、読み取り、引用、要約、または結果をプロンプトに含めることができます。

Zilliz Cloud は、長いソーステキストをエンティティとともに直接保存するための `TEXT` スカラーフィールド型を提供します。一般的な値には、パッセージ、長いドキュメント、記事本文、チケット、ログなどがあります。固定の `max_length` を必要とする `VARCHAR` とは異なり、`TEXT` ではコレクションスキーマ内で最大バイト長を設定する必要がありません。

コレクションスキーマで `TEXT` フィールドを定義するには、`datatype` を `DataType.TEXT` に設定します。

```python
schema.add_field(
    field_name="content",
    # highlight-next-line
    datatype=DataType.TEXT,
)
```

フィールドを定義すると、各エンティティはそのフィールドに文字列値を含めることができます。他のスカラーフィールドと同様に値を挿入し、`output_fields` にフィールドを列挙することでクエリまたは検索の結果として返すことができます。

<Admonition type="info" icon="📘" title="注意">

TEXT フィールドは null 値をサポートします。この機能を有効にするには、nullable を True に設定します。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

</Admonition>

## 制限\{#limits}

- `TEXT` フィールドはプライマリフィールドにできません。プライマリフィールドでサポートされるのは `INT64` と `VARCHAR` です。

- `TEXT` フィールドは `PHRASE_MATCH` をサポートしません。

- `TEXT` フィールドはデフォルト値をサポートしません。

- `TEXT` フィールドはスカラーインデックスをサポートしません。

- `TEXT` は通常のメタデータフィルタリング向けではありません。短い文字列メタデータでフィルタリングする必要があり、かつフィールド値が `VARCHAR` の長さ制限内に収まる場合は、`VARCHAR` を使用してください。

- `TEXT` フィールドは外部コレクションではサポートされません。

## TEXT と VARCHAR の選択\{#choose-text-or-varchar}

`TEXT` と `VARCHAR` はどちらも文字列値を保存しますが、対応するアプリケーション要件は異なります。エンティティの識別、分類、またはフィルタリングに使用する短く制限のあるメタデータには `VARCHAR` を使用してください。LLM やエージェントが読み取り、引用、要約、またはプロンプトを構築するために十分なコンテキストを与える、より長いソースコンテンツには `TEXT` を使用してください。

| **観点** | **VARCHAR** | **TEXT** |
| --- | --- | --- |
| 最適な用途 | `title`、`tag`、`category`、`external_id` など、エンティティの識別、分類、またはフィルタリングに使用される短いメタデータ。 | `content`、`passage`、`article_body`、`log_message` など、LLM またはエージェントのワークフローで使用されるより長いソースコンテンツ。 |
| 長さの設定 | `max_length` が必要で、フィールドが保存できる最大バイト数を定義します。最大値は 65,535 バイトです。値がこの制限を超える可能性がある場合は、`TEXT` を使用してください。 | `max_length` を必要としないため、スキーマではテキスト値に固定のバイト制限を設定する必要がありません。 |
| ストレージ動作 | フィールドに設定された `max_length` 内に各値を保存します。 | より大きなテキスト値に対して自動ストレージ選択を使用します。 |
| プライマリフィールドのサポート | プライマリフィールドとして使用できます。 | プライマリフィールドとしては使用できません。 |
| フィルタリング | `category == "news"` や `tag in ["ai", "database"]` など、フィルター式に含める必要がある短い文字列メタデータに使用します。 | 通常のメタデータフィルタリング向けではありません。 |

`VARCHAR` フィールドの詳細については、[VARCHAR Field](https://milvus.io/docs/string.md) を参照してください。

`TEXT` の一般的な用途の 1 つは、BM25 を使用した全文検索です。このパターンでは、`TEXT` フィールドに元のソースコンテンツを保存し、BM25 がテキストを解析して、キーワードベースの一致をランキングするためのスパースベクトルを生成します。その後、検索結果は一致した `TEXT` 値を、LLM またはエージェントのワークフロー向けのコンテキストとして返すことができます。次の例は、BM25 の入力フィールドとして `TEXT` フィールドを使用する方法を示しています。全文検索の概念とクエリオプションについては、[Full Text Search](./full-text-search) を参照してください。

## ステップ 1: TEXT フィールドを含むコレクションを作成する\{#step-1-create-a-collection-with-a-text-field}

次の例では、ソースコンテンツ用の `TEXT` フィールドと、BM25 によって生成されるスパースベクトル用のスパースベクトルフィールドを含むコレクションを作成します。BM25 関数は、`content` からトークン化されたテキストを `sparse` に保存されるスパースベクトルに変換します。

BM25 全文検索の場合、入力 `TEXT` フィールドでは `enable_analyzer=True` を設定する必要があります。

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

## ステップ 2: スパースベクトルインデックスを作成する\{#step-2-create-a-sparse-vector-index}

BM25 関数によって生成されるスパースベクトルフィールドにインデックスを作成します。メトリックタイプは `BM25` に設定する必要があります。

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

## ステップ 3: TEXT データを挿入する\{#step-3-insert-text-data}

テキストを `TEXT` フィールドに直接挿入します。`sparse` フィールドには値を指定しないでください。Milvus は、`content` に BM25 関数を適用することで内部的にスパースベクトルを生成します。

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

## ステップ 4: BM25 全文検索を実行する\{#step-4-perform-bm25-full-text-search}

生のクエリテキストを検索データとして使用し、スパースベクトルフィールドに対して検索します。Milvus はクエリテキストをスパースベクトルに変換し、BM25 で一致をランキングし、要求された `TEXT` フィールドを `output_fields` で返します。

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

## ステップ 5: 返された TEXT 値を読み取る\{#step-5-read-the-returned-text-values}

各検索ヒットには、BM25 スコアと元の `TEXT` 値が含まれます。

```python
for hit in results[0]:
    print(f"id: {hit['id']}, score: {hit['distance']}")
    print(hit["entity"]["content"])
```

BM25 関数、スパースベクトルインデックス、および全文検索のクエリ構文の詳細については、[Full Text Search](./full-text-search) を参照してください。
