---
title: "Lexical Highlighter | Cloud"
slug: /text-highlighter
sidebar_label: "Lexical Highlighter"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Highlighter は、テキストフィールド内の一致した用語をカスタマイズ可能なタグで囲んで注釈を付けます。ハイライトは、ドキュメントが一致した理由の説明、結果の可読性向上、検索および RAG アプリケーションでのリッチなレンダリングのサポートに役立ちます。 | Cloud"
type: origin
token: BJCjwpj8JizP0nkI11uci1pPndh
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Lexical Highlighter

Zilliz Cloud の Highlighter は、テキストフィールド内の一致した用語をカスタマイズ可能なタグで囲んで注釈を付けます。ハイライトは、ドキュメントがクエリに一致した理由の説明、結果の可読性向上、検索および RAG アプリケーションでのリッチなレンダリングのサポートに役立ちます。

ハイライトは、最終的な検索結果セットに対する後処理ステップとして実行されます。候補の取得、フィルタリングロジック、ランキング、スコアリングには影響しません。

Highlighter は、独立した 3 つの制御軸を提供します。

- **どの用語をハイライトするか**

    ハイライト対象の用語をどこから取得するかを選択できます。たとえば、**BM25 full text search** で使用される検索語や、**テキストベースのフィルタリング式**（`TEXT_MATCH` 条件など）で指定されたクエリ用語をハイライトできます。

- **ハイライトされた用語をどのようにレンダリングするか**

    各一致の前後に挿入するタグを設定することで、ハイライト出力内で一致した用語をどのように表示するかを制御できます。たとえば、`{}` のような単純なマーカーや、リッチレンダリング用の `<em></em>` のような HTML タグを使用できます。

- **ハイライトされたテキストをどのように返すか**

    フラグメントの開始位置、長さ、返すフラグメント数などを含め、ハイライト結果をフラグメントとしてどのように返すかを制御できます。

以降のセクションで、これらのシナリオを順に説明します。

## BM25 full text search における検索語のハイライト\{#search-term-highlighting-in-bm25-full-text-search}

BM25 full text search を実行すると、返される結果内で **検索語** をハイライトして、ドキュメントがクエリに一致した理由を説明しやすくできます。BM25 full text search の詳細については、[Full Text Search](./full-text-search) を参照してください。

このシナリオでは、ハイライト対象の用語は BM25 full text search で使用された検索語から直接取得されます。Highlighter はこれらの用語を使って、最終結果内の一致したテキストに注釈を付けます。

次の内容がテキストフィールドに保存されているとします。

```plaintext
Milvus supports full text search. Use BM25 for keyword relevance. Filters can narrow results.
```

**Highlighter の設定**

BM25 full text search で検索語をハイライトするには、`LexicalHighlighter` を作成し、BM25 full text search 用の検索語ハイライトを有効にします。

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],              # 各ハイライト用語の前に挿入するタグ
    post_tags=["}"],             # 各ハイライト用語の後に挿入するタグ
    highlight_search_text=True   # BM25 full text search の検索語ハイライトを有効化
)
```

この例では、次のようになっています。

- `pre_tags` と `post_tags` は、出力内でハイライトされたテキストをどのように表示するかを制御します。この場合、一致した用語は `{}` で囲まれます（例: `{term}`）。複数のタグをリストとして指定することもできます（例: `["<b>", "<i>"]`）。複数の用語がハイライトされる場合、タグは順番に適用され、一致順に応じてローテーションされます。

- `highlight_search_text=True` は、BM25 full text search の検索語をハイライト対象用語のソースとして使用するよう Zilliz Cloud に指示します。

Highlighter オブジェクトを作成したら、その設定を BM25 full text search リクエストに適用します。

```python
results = client.search(
    ...,
    data=["BM25"],      # BM25 full text search で使用する検索語
    # highlight-next-line
    highlighter=highlighter # ここで highlighter 設定を渡す
)
```

**ハイライト出力**

ハイライトを有効にすると、Zilliz Cloud は専用の `highlight` フィールドにハイライト済みテキストを返します。デフォルトでは、ハイライト出力は最初に一致した用語から始まるフラグメントとして返されます。

この例では、検索語は `"BM25"` なので、返される結果内でこれがハイライトされます。

```json
{
    ...,
    "highlight": {
        "text": [
            "{BM25} for keyword relevance. Filters can narrow results."
        ]
    }
}
```

返されるフラグメントの位置、長さ、数を制御するには、[ハイライトされたテキストをフラグメントとして返す](./text-highlighter#fragment-based-highlighting-output) を参照してください。

## フィルタリングにおけるクエリ用語のハイライト\{#query-term-highlighting-in-filtering}

検索語のハイライトに加えて、テキストベースのフィルタリング式で使用される用語をハイライトすることもできます。

<Admonition type="info" icon="📘" title="注">

現在、クエリ用語のハイライトでサポートされているフィルタリング条件は `TEXT_MATCH` のみです。詳細については、[Text Match](./text-match) を参照してください。

</Admonition>

このシナリオでは、ハイライト対象の用語はテキストベースのフィルタリング式から取得されます。フィルタリングはどのドキュメントが一致するかを決定し、Highlighter は一致したテキスト範囲に注釈を付けます。

次の内容がテキストフィールドに保存されているとします。

```python
This document explains how text filtering works in Milvus.
```

**Highlighter の設定**

フィルタリングで使用されるクエリ用語をハイライトするには、`LexicalHighlighter` を作成し、フィルタリング条件に対応する `highlight_query` を定義します。

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],              # 各ハイライト用語の前に挿入するタグ
    post_tags=["}"],             # 各ハイライト用語の後に挿入するタグ
    highlight_query=[{
        "type": "TextMatch",     # テキストフィルタリングの種類
        "field": "text",         # 対象のテキストフィールド
        "text": "text filtering" # ハイライトする用語
    }]
)
```

この設定では、次のようになっています。

- `pre_tags` と `post_tags` は、出力内でハイライトされたテキストをどのように表示するかを制御します。この場合、一致した用語は `{}` で囲まれます（例: `{term}`）。複数のタグをリストとして指定することもできます（例: `["<b>", "<i>"]`）。複数の用語がハイライトされる場合、タグは順番に適用され、一致順に応じてローテーションされます。

- `highlight_query` は、どのフィルタリング用語をハイライトするかを定義します。

Highlighter オブジェクトを作成したら、同じフィルタリング式と highlighter 設定を検索リクエストに適用します。

```python
results = client.search(
    ...,
    filter='TEXT_MATCH(text, "text filtering")',
    # highlight-next-line
    highlighter=highlighter # ここで highlighter 設定を渡す
)
```

**ハイライト出力**

フィルタリング向けのクエリ用語ハイライトを有効にすると、Zilliz Cloud は専用の `highlight` フィールドにハイライト済みテキストを返します。デフォルトでは、ハイライト出力は最初に一致した用語から始まるフラグメントとして返されます。

この例では、最初に一致した用語は `"text"` なので、返されるハイライト済みテキストはその位置から始まります。

```json
{
    ...,
    "highlight": {
        "text": [
            "{text} {filtering} works in Milvus."
        ]
    }
}
```

返されるフラグメントの位置、長さ、数を制御するには、[ハイライトされたテキストをフラグメントとして返す](./text-highlighter#fragment-based-highlighting-output) を参照してください。

## フラグメントベースのハイライト出力\{#fragment-based-highlighting-output}

デフォルトでは、Zilliz Cloud は最初に一致した用語から始まるフラグメントとしてハイライト済みテキストを返します。フラグメント関連の設定を使うことで、どの用語をハイライトするかを変更せずに、フラグメントの返し方をさらに細かく制御できます。

次の内容がテキストフィールドに保存されているとします。

```plaintext
Milvus supports full text search. Use BM25 for keyword relevance. Filters can narrow results.
```

**Highlighter の設定**

ハイライトフラグメントの形状を制御するには、`LexicalHighlighter` でフラグメント関連のオプションを設定します。

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
    fragment_offset=5,     # 最初に一致した用語の前に確保する文字数
    fragment_size=60,      # 返す各フラグメントの最大長
    num_of_fragments=1     # 返すフラグメント数の上限
)
```

この設定では、次のようになっています。

- `fragment_offset` は、最初にハイライトされた用語の前に先行コンテキストを確保します。

- `fragment_size` は、各フラグメントに含めるテキスト量を制限します。

- `num_of_fragments` は、返すフラグメント数を制御します。

Highlighter オブジェクトを作成したら、highlighter 設定を検索リクエストに適用します。

```python
results = client.search(
    ...,
    data=["BM25"],
    # highlight-next-line
    highlighter=highlighter # ここで highlighter 設定を渡す
)
```

**ハイライト出力**

フラグメントベースのハイライトを有効にすると、Zilliz Cloud は `highlight` フィールド内にフラグメントとしてハイライト済みテキストを返します。

```json
{
    ...,
    "highlight": {
        "text": [
            "Use {BM25} for keyword relevance. Filters can narrow results."
        ]
    }
}
```

この出力では、次のようになります。

- `fragment_offset` が設定されているため、フラグメントは `{BM25}` からぴったり始まりません。

- `num_of_fragments` が 1 のため、返されるフラグメントは 1 つだけです。

- フラグメントの長さは `fragment_size` によって制限されます。

## 例\{#examples}

### 準備\{#preparation}

highlighter を使用する前に、collection が適切に設定されていることを確認してください。

以下の例では、BM25 full text search と `TEXT_MATCH` クエリをサポートする collection を作成し、サンプルドキュメントを挿入します。

<details>

<summary><strong>collection を準備する</strong></summary>

```python
from pymilvus import (
    MilvusClient,
    DataType,
    Function,
    FunctionType,
    LexicalHighlighter,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
COLLECTION_NAME = "highlighter_demo"

# 既存の collection をクリーンアップ
if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

# スキーマを定義
schema = client.create_schema(enable_dynamic_field=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(
    field_name="text",
    datatype=DataType.VARCHAR,
    max_length=2000,
    enable_analyzer=True,  # BM25 に必須
    enable_match=True,     # TEXT_MATCH に必須
)
schema.add_field(field_name="sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)

# BM25 関数を追加
schema.add_function(Function(
    name="text_bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
))

# インデックスを作成
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="sparse_vector",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={"inverted_index_algo": "DAAT_MAXSCORE", "bm25_k1": 1.2, "bm25_b": 0.75},
)

client.create_collection(collection_name=COLLECTION_NAME, schema=schema, index_params=index_params)

# サンプルドキュメントを挿入
docs = [
    "my first test doc",
    "my second test doc",
    "my first test doc. Milvus is an open-source vector database built for GenAI applications.",
    "my second test doc. Milvus is an open-source vector database that suits AI applications "
    "of every size from running a demo chatbot to building web-scale search.",
]
client.insert(collection_name=COLLECTION_NAME, data=[{"text": t} for t in docs])
print(f"✓ Collection created with {len(docs)} documents\n")

# search params 用ヘルパー
SEARCH_PARAMS = {"params": {"drop_ratio_search": 0.0}}

# 期待される出力:
# ✓ Collection created with 4 documents
```

</details>

### 例 1: BM25 full text search で検索語をハイライトする\{#example-1-highlight-search-terms-in-bm25-full-text-search}

この例では、BM25 full text search で検索語をハイライトする方法を示します。

- BM25 full text search では `"test"` を検索語として使用します

- highlighter は "test" のすべての出現箇所を `{` と `}` タグで囲みます

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,  # BM25 クエリ用語をハイライト
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["test"],
    anns_field="sparse_vector",
    limit=10,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for hit in results[0]:
    print(f"  {hit.get('highlight', {}).get('text', [])}")
print()
```

<details>

<summary>期待される出力</summary>

```plaintext
['{test} doc']
['{test} doc']
['{test} doc. Milvus is an open-source vector database built for GenAI applications.']
['{test} doc. Milvus is an open-source vector database that suits AI applications of every size from run']
```

</details>

### 例 2: フィルタリングでクエリ用語をハイライトする\{#example-2-highlight-query-terms-in-filtering}

この例では、`TEXT_MATCH` フィルタに一致した用語をハイライトする方法を示します。

- BM25 full text search では `"test"` をクエリ用語として使用します

- `queries` パラメータで `"my doc"` をハイライト対象リストに追加します

- highlighter は一致したすべての用語（`"my"`、`"test"`、`"doc"`）を `{` と `}` で囲みます

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,   # BM25 用語もハイライト
    highlight_query=[                     # 追加でハイライトする TEXT_MATCH 用語
        {"type": "TextMatch", "field": "text", "text": "my doc"},
    ],
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["test"],
    anns_field="sparse_vector",
    limit=10,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for hit in results[0]:
    print(f"  {hit.get('highlight', {}).get('text', [])}")
print()
```

<details>

<summary>期待される出力</summary>

```plaintext
['{my} first {test} {doc}']
['{my} second {test} {doc}']
['{my} first {test} {doc}. Milvus is an open-source vector database built for GenAI applications.']
['{my} second {test} {doc}. Milvus is an open-source vector database that suits AI applications of every siz']
```

</details>

### 例 3: ハイライトをフラグメントとして返す\{#example-3-return-highlights-as-fragments}

この例では、クエリは `"Milvus"` を検索し、以下の設定でハイライトフラグメントを返します。

- `fragment_offset` は、最初にハイライトされた範囲の前に最大 20 文字の先行コンテキストを保持します（デフォルトは 0）。

- `fragment_size` は、各フラグメントを約 60 文字に制限します（デフォルトは 100）。

- `num_of_fragments` は、各テキスト値ごとに返されるフラグメント数を制限します（デフォルトは 5）。

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
    fragment_offset=20,  # 一致前の 20 文字を保持
    fragment_size=60,    # 各フラグメントは最大約 60 文字
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["Milvus"],
    anns_field="sparse_vector",
    limit=10,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for i, hit in enumerate(results[0]):
    frags = hit.get('highlight', {}).get('text', [])
    print(f"  Doc {i+1}: {frags}")
print()
```

<details>

<summary>期待される出力</summary>

```plaintext
Doc 1: ['my first test doc. {Milvus} is an open-source vector database ']
Doc 2: ['my second test doc. {Milvus} is an open-source vector database']
```

</details>

### 例 4: 複数クエリのハイライト\{#example-4-multi-query-highlighting}

BM25 full text search で複数のクエリを使用して検索する場合、各クエリの結果はそれぞれ独立してハイライトされます。1 つ目のクエリの結果にはその検索語に対するハイライトが含まれ、2 つ目のクエリの結果にはその検索語に対するハイライトが含まれます。以降も同様です。各クエリは同じ `highlighter` 設定を使用しますが、独立して適用されます。

以下の例では、次のようになります。

- 1 つ目のクエリは、その結果セットで `"test"` をハイライトします

- 2 つ目のクエリは、その結果セットで `"Milvus"` をハイライトします

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["test", "Milvus"],  # 2 つのクエリ
    anns_field="sparse_vector",
    limit=2,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for nq_idx, hits in enumerate(results):
    query_term = ["test", "Milvus"][nq_idx]
    print(f"  Query '{query_term}':")
    for hit in hits:
        print(f"    {hit.get('highlight', {}).get('text', [])}")
print()
```

<details>

<summary>期待される出力</summary>

```plaintext
Query 'test':
  ['{test} doc']
  ['{test} doc']
Query 'Milvus':
  ['{Milvus} is an open-source vector database built for GenAI applications.']
  ['{Milvus} is an open-source vector database that suits AI applications of every size from running a dem']
```

</details>

### 例 5: カスタム HTML タグ\{#example-5-custom-html-tags}

ハイライトには任意のタグを使用できます。たとえば、Web UI 向けの HTML セーフなタグを使用できます。これは、ブラウザで検索結果をレンダリングする際に便利です。

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    highlight_search_text=True,
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["test"],
    anns_field="sparse_vector",
    limit=2,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for hit in results[0]:
    print(f"  {hit.get('highlight', {}).get('text', [])}")
print()
```

<details>

<summary>期待される出力</summary>

```plaintext
['<mark>test</mark> doc']
['<mark>test</mark> doc']
```

</details>

