---
title: "Text Field | BYOC"
slug: /use-text-field
sidebar_label: "Text Field"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AI検索アプリケーションでは、ベクトル検索によって意味的に類似したエンティティを見つけられますが、多くの場合、各検索結果に対応する元のソーステキストも必要になります。LLMやエージェントはそのテキストをコンテキストとして活用し、内容の読み取り、引用、要約、あるいはプロンプトへの組み込みを行うことができます。 | BYOC"
type: origin
token: GBynwwkyBihIHukvJXfc76dMnth
sidebar_position: 7
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Text Field

AI検索アプリケーションでは、ベクトル検索によって意味的に類似したエンティティを見つけられますが、多くの場合、各検索結果に対応する元のソーステキストも必要になります。LLMやエージェントはそのテキストをコンテキストとして活用し、内容の読み取り、引用、要約、あるいはプロンプトへの組み込みを行うことができます。

Zilliz Cloud は、長いソーステキストをエンティティに直接保存するための `TEXT` スカラーフィールド型を提供します。代表的な値としては、パッセージ、長文ドキュメント、記事本文、チケット、ログなどがあります。固定の `max_length` を必要とする `VARCHAR` とは異なり、`TEXT` ではコレクションスキーマに最大バイト長を設定する必要はありません。

コレクションスキーマで `TEXT` フィールドを定義するには、`datatype` を `DataType.TEXT` に設定します。

```python
schema.add_field(
    field_name="content",
    # highlight-next-line
    datatype=DataType.TEXT,
)
```

フィールド定義後、各エンティティにそのフィールドの文字列値を含めることができます。他のスカラーフィールドと同様に値を挿入でき、`output_fields` にフィールド名を指定することで、クエリや検索結果から値を取得できます。

<Admonition type="info" icon="📘" title="Notes">

TEXTフィールドはnull値をサポートしています。この機能を有効にするには、nullable を True に設定してください。詳細については、[Nullable Fields](./nullable-fields) を参照してください。

</Admonition>

## 制限事項\{#limits}

- `TEXT` フィールドをプライマリフィールドとして使用することはできません。プライマリフィールドとしてサポートされるのは `INT64` および `VARCHAR` です。

- `TEXT` フィールドは `PHRASE_MATCH` をサポートしていません。

- `TEXT` フィールドはデフォルト値をサポートしていません。

- `TEXT` フィールドはスカラーインデックスをサポートしていません。

- `TEXT` は一般的なメタデータのフィルタリングを目的としたものではありません。短い文字列メタデータに基づいてフィルタリングを行いたい場合で、かつ値が `VARCHAR` の長さ制限内に収まる場合は、`VARCHAR` を使用してください。

- 外部コレクションでは `TEXT` フィールドはサポートされていません。

## TEXT と VARCHAR の使い分け\{#choose-text-or-varchar}

`TEXT` と `VARCHAR` はいずれも文字列値を保存しますが、適した用途が異なります。エンティティの識別、分類、フィルタリングに用いる短いメタデータには `VARCHAR` を使用します。一方、LLMやエージェントが読み取り、引用、要約、プロンプト生成などに活用できる十分なコンテキストを含む長いソースコンテンツには `TEXT` を使用します。

| **比較項目** | **VARCHAR** | **TEXT** |
| --- | --- | --- |
| 推奨用途 | エンティティの識別、分類、フィルタリングに使用する短いメタデータ（例: `title`、`tag`、`category`、`external_id`） | LLMやエージェントのワークフローで利用される長いソースコンテンツ（例: `content`、`passage`、`article_body`、`log_message`） |
| 長さの設定 | `max_length` の指定が必須で、フィールドに保存できる最大バイト数を定義します。上限は65,535バイトです。値がこの制限を超える可能性がある場合は `TEXT` を使用してください。 | `max_length` の指定は不要であり、スキーマでテキスト値の固定バイト制限を設定する必要はありません。 |
| ストレージの動作 | 各値はフィールドに設定された `max_length` の範囲内で保存されます。 | サイズの大きいテキスト値に対しては、自動的に最適なストレージ方式が選択されます。 |
| プライマリフィールドとしての使用 | プライマリフィールドとして使用可能です。 | プライマリフィールドとして使用できません。 |
| フィルタリング | フィルター式で使用したい短い文字列メタデータ（`category == "news"` や `tag in ["ai", "database"]` など）に適しています。 | 一般的なメタデータのフィルタリングには適していません。 |

`VARCHAR` フィールドの詳細については、[VARCHAR Field](https://milvus.io/docs/string.md) を参照してください。

`TEXT` の代表的な用途は、BM25を用いた全文検索です。このパターンでは、`TEXT` フィールドに元のソースコンテンツを保存し、BM25がテキストを解析してキーワードベースのマッチング順位付け用のスパースベクトルを生成します。検索結果では、一致した `TEXT` の値をLLMやエージェントのワークフロー向けコンテキストとして返すことができます。以下の例では、BM25の入力フィールドとして `TEXT` フィールドを使用する方法を示しています。全文検索の概念やクエリオプションの詳細については、[Full Text Search](./full-text-search) を参照してください。

## ステップ1: TEXTフィールドを持つコレクションを作成する\{#step-1-create-a-collection-with-a-text-field}

以下の例では、ソースコンテンツ用の `TEXT` フィールドと、BM25で生成されるスパースベクトル用のスパースベクトルフィールドを持つコレクションを作成します。BM25関数は `content` のトークン化済みテキストをスパースベクトルに変換し、`sparse` に保存します。

BM25による全文検索を行う場合、入力となる `TEXT` フィールドには `enable_analyzer=True` を設定する必要があります。

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

## ステップ2: スパースベクトルインデックスを作成する\{#step-2-create-a-sparse-vector-index}

BM25関数によって生成されたスパースベクトルフィールドにインデックスを作成します。メトリックタイプは `BM25` に設定する必要があります。

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

## ステップ3: TEXTデータを挿入する\{#step-3-insert-text-data}

`TEXT` フィールドにテキストを直接挿入します。`sparse` フィールドに値を指定する必要はありません。Milvus がBM25関数を `content` に適用し、内部でスパースベクトルを自動生成します。

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

## ステップ4: BM25全文検索を実行する\{#step-4-perform-bm25-full-text-search}

生のクエリテキストを検索データとして、スパースベクトルフィールドに対して検索を実行します。Milvus がクエリテキストをスパースベクトルに変換し、BM25スコアに基づいて結果をランク付けした後、`output_fields` で指定された `TEXT` フィールドの値を返します。

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

## ステップ5: 返されたTEXT値を確認する\{#step-5-read-the-returned-text-values}

各検索ヒットには、BM25スコアと元の `TEXT` 値が含まれます。

```python
for hit in results[0]:
    print(f"id: {hit['id']}, score: {hit['distance']}")
    print(hit["entity"]["content"])
```

BM25関数、スパースベクトルインデックス、全文検索のクエリ構文に関する詳細情報は、[Full Text Search](./full-text-search) を参照してください。
