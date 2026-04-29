---
title: "Lexical Highlighter | BYOC"
slug: /text-highlighter
sidebar_key: text-highlighter
sidebar_label: "Lexical Highlighter"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud のハイライターは、テキストフィールド内の一致した用語をカスタマイズ可能なタグで囲むことで注釈を付けます。ハイライト機能は、ドキュメントがなぜ一致したのかを説明し、結果の可読性を向上させ、検索や RAG アプリケーションにおけるリッチなレンダリングをサポートします。| BYOC"
type: origin
token: BJCjwpj8JizP0nkI11uci1pPndh
sidebar_position: 12
keywords: 
  - zilliz
  - ベクトルデータベース
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - text-match
  - lexical

---

import Admonition from '@theme/Admonition';


# Lexical ハイライター

Zilliz Cloud のハイライターは、テキストフィールド内で一致した用語をカスタマイズ可能なタグで囲むことで注釈を付与します。ハイライト機能は、なぜそのドキュメントが検索条件に一致したのかを説明したり、検索結果の可読性を向上させたり、検索およびRAGアプリケーションでのリッチなレンダリングをサポートしたりします。

ハイライト処理は、最終的な検索結果セットに対して後処理として実行されます。この処理は、候補の取得、フィルタリングロジック、ランキング、スコアリングには一切影響しません。

ハイライターは、以下の3つの独立した制御次元を提供します。

- **強調表示される用語**

    強調表示する用語の出所を選択できます。たとえば、**BM25全文検索**で使用された検索語や、**テキストベースのフィルタリング式**（`TEXT_MATCH` 条件など）で指定されたクエリ語をハイライトできます。

- **強調表示される用語のレンダリング方法**

    一致した用語をハイライト出力内でどのように表示するかを制御できます。具体的には、各一致箇所の前後に挿入されるタグを設定します。たとえば、`{}` のようなシンプルなマーカーを使用することも、リッチなレンダリングのために `<em></em>` のようなHTMLタグを使用することも可能です。

- **強調表示されたテキストの返却方法**

    ハイライト結果をフラグメントとして返す方法を制御できます。これには、フラグメントの開始位置、長さ、返却されるフラグメント数などが含まれます。

次のセクションでは、これらのシナリオについて詳しく説明します。

## BM25全文検索における検索語のハイライト\{#search-term-highlighting-in-bm25-full-text-search}

BM25全文検索を実行する際、返却される結果内の**検索語**をハイライトすることで、なぜそのドキュメントがクエリに一致したのかを説明できます。BM25全文検索の詳細については、[Full Text Search](./full-text-search) を参照してください。

このシナリオでは、ハイライト対象の用語はBM25全文検索で使用された検索語そのものです。ハイライターはこれらの用語を使って、最終結果内の一致テキストに注釈を付けます。

以下のようなコンテンツがテキストフィールドに格納されていると仮定します。

```plaintext
Milvus supports full text search. Use BM25 for keyword relevance. Filters can narrow results.
```

**ハイライター設定**

BM25全文検索で検索語をハイライトするには、`Lexicalハイライター` を作成し、BM25全文検索の検索語ハイライトを有効にしてください。

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],              # Tag inserted before each highlighted term
    post_tags=["}"],             # Tag inserted after each highlighted term
    highlight_search_text=True   # Enable search term highlighting for BM25 full text search
)
```

この例では、以下のようになります。

- `pre_tags` および `post_tags` は、出力におけるハイライトされたテキストの表示方法を制御します。この場合、マッチした語は `{}` で囲まれます（例: `{term}`）。また、タグをリスト形式で複数指定することも可能です（例: `["<b>", "<i>"]`）。複数の語がハイライトされる場合、マッチの順序に従ってタグが順番に適用され、繰り返されます。

- `highlight_search_text=True` は、Zilliz Cloud に対して BM25全文検索の検索語をハイライト対象語のソースとして使用するよう指示します。

ハイライター オブジェクトを作成したら、その設定を BM25全文検索リクエストに適用します。

```python
results = client.search(
    ...,
    data=["BM25"],      # Search term used in BM25 full text search
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

**ハイライト出力**

ハイライトが有効になっている場合、Zilliz Cloud は専用の `highlight` フィールドにハイライトされたテキストを返します。デフォルトでは、ハイライト出力は最初に一致した語から始まるフラグメントとして返されます。

この例では、検索語は `"BM25"` であるため、返された結果内でハイライトされています：

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

返されるフラグメントの位置、長さ、および数を制御するには、「[ハイライトされたテキストをフラグメントとして返す](./text-highlighter#fragment-based-highlighting-output)」を参照してください。

## フィルタリングにおけるクエリ用語のハイライト\{#query-term-highlighting-in-filtering}

検索語のハイライトに加えて、テキストベースのフィルタリング式で使用された用語もハイライトできます。

<Admonition type="info" icon="📘" title="Notes">

<p>現在、クエリ用語のハイライトには <code>TEXT_MATCH</code> フィルタリング条件のみがサポートされています。詳細については、「<a href="./text-match">Text Match</a>」を参照してください。</p>

</Admonition>

このシナリオでは、ハイライトされる用語はテキストベースのフィルタリング式に由来します。フィルタリングはどのドキュメントが一致するかを決定し、ハイライター は一致したテキスト範囲に注釈を付けます。

以下のコンテンツがテキストフィールドに格納されていると仮定します：

```python
This document explains how text filtering works in Milvus.
```

**ハイライター設定**

フィルタリングに使用されるクエリ用語をハイライトするには、`Lexicalハイライター` を作成し、フィルタリング条件に対応する `highlight_query` を定義します。

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],              # Tag inserted before each highlighted term
    post_tags=["}"],             # Tag inserted after each highlighted term
    highlight_query=[{
        "type": "TextMatch",     # Text filtering type
        "field": "text",         # Target text field
        "text": "text filtering" # Terms to highlight
    }]
)
```

この設定では、以下のようになります。

- `pre_tags` および `post_tags` は、出力におけるハイライトされたテキストの表示方法を制御します。この例では、マッチした語が `{}` で囲まれます（例：`{term}`）。また、タグをリスト形式で複数指定することも可能です（例：`["<b>", "<i>"]`）。複数の語がハイライトされる場合、タグはマッチの順序に従って順番に適用され、繰り返されます。

- `highlight_query` は、ハイライト対象となるフィルタリング条件を定義します。

ハイライター・オブジェクトを作成したら、同じフィルタリング式とハイライター設定を検索リクエストに適用します。

```python
results = client.search(
    ...,
    filter='TEXT_MATCH(text, "text filtering")',
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

**ハイライト出力**

フィルタリング時にクエリ用語のハイライトが有効になっている場合、Zilliz Cloud は専用の `highlight` フィールドにハイライトされたテキストを返します。デフォルトでは、ハイライト出力は最初に一致した用語から始まるフラグメントとして返されます。

この例では、最初に一致した用語は `"text"` であるため、返されるハイライトテキストはその位置から始まります:

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

返されるフラグメントの位置、長さ、および数を制御するには、「[ハイライトされたテキストをフラグメントとして返す](./text-highlighter#fragment-based-highlighting-output)」を参照してください。

## フラグメントベースのハイライト出力\{#fragment-based-highlighting-output}

デフォルトでは、Zilliz Cloud は最初にマッチした語から始まるフラグメントとしてハイライトされたテキストを返します。フラグメント関連の設定を使用すると、どの語がハイライトされるかを変更せずに、フラグメントの返し方をさらに細かく制御できます。

以下のコンテンツがテキストフィールドに格納されていると仮定します：

```plaintext
Milvus supports full text search. Use BM25 for keyword relevance. Filters can narrow results.
```

**ハイライター設定**

ハイライトされたフラグメントの形状を制御するには、`Lexicalハイライター` でフラグメント関連のオプションを設定します。

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
    fragment_offset=5,     # Number of characters to reserve before the first matched term
    fragment_size=60,      # Max. length of each fragment to return
    num_of_fragments=1     # Max. number of fragments to return
)
```

この設定では：

- `fragment_offset` は、最初のハイライトされた語の前に表示する先頭のコンテキストを確保します。

- `fragment_size` は、各フラグメントに含めるテキスト量を制限します。

- `num_of_fragments` は、返されるフラグメントの数を制御します。

ハイライター オブジェクトを作成したら、ハイライターの設定を検索リクエストに適用します：

```python
results = client.search(
    ...,
    data=["BM25"],
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

**ハイライト出力**

フラグメントベースのハイライトが有効になっている場合、Zilliz Cloud は `highlight` フィールドにフラグメントとしてハイライトされたテキストを返します。

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

この出力において：

- `fragment_offset` が設定されているため、フラグメントは `{BM25}` から正確に開始されません。

- `num_of_fragments` が 1 に設定されているため、フラグメントは 1 つだけ返されます。

- フラグメントの長さは `fragment_size` によって制限されています。

## 例\{#examples}

### 準備\{#preparation}

ハイライターを使用する前に、コレクションが適切に設定されていることを確認してください。

以下の例では、BM25全文検索および `TEXT_MATCH` クエリをサポートするコレクションを作成し、サンプルドキュメントを挿入します。

<details>

<summary><strong>コレクションの準備</strong></summary>

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

# Clean up existing collection
if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

# Define schema
schema = client.create_schema(enable_dynamic_field=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(
    field_name="text",
    datatype=DataType.VARCHAR,
    max_length=2000,
    enable_analyzer=True,  # Required for BM25
    enable_match=True,     # Required for TEXT_MATCH
)
schema.add_field(field_name="sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)

# Add BM25 function
schema.add_function(Function(
    name="text_bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
))

# Create index
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="sparse_vector",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={"inverted_index_algo": "DAAT_MAXSCORE", "bm25_k1": 1.2, "bm25_b": 0.75},
)

client.create_collection(collection_name=COLLECTION_NAME, schema=schema, index_params=index_params)

# Insert sample documents
docs = [
    "my first test doc",
    "my second test doc",
    "my first test doc. Milvus is an open-source vector database built for GenAI applications.",
    "my second test doc. Milvus is an open-source vector database that suits AI applications "
    "of every size from running a demo chatbot to building web-scale search.",
]
client.insert(collection_name=COLLECTION_NAME, data=[{"text": t} for t in docs])
print(f"✓ Collection created with {len(docs)} documents\n")

# Helper for search params
SEARCH_PARAMS = {"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}}

# Expected output:
# ✓ Collection created with 4 documents
```

</details>

### 例1: BM25全文検索で検索語をハイライトする\{#example-1-highlight-search-terms-in-bm25-full-text-search}

この例では、BM25全文検索で検索語をハイライトする方法を示します。

- BM25全文検索では、検索語として `"test"` を使用します

- ハイライト機能は、"test" のすべての出現箇所を `{` および `}` タグで囲みます

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,  # Highlight BM25 query terms
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

### 例2: フィルタリングでのクエリ用語のハイライト\{#example-2-highlight-query-terms-in-filtering}

この例では、`TEXT_MATCH`フィルターによってマッチした用語をハイライトする方法を示します。

- BM25全文検索では、クエリ用語として`"test"`を使用します

- `queries`パラメータにより、ハイライト対象リストに`"my doc"`が追加されます

- ハイライト機能は、すべてのマッチした用語（`"my"`、`"test"`、`"doc"`）を`{`および`}`で囲みます

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,   # Also highlight BM25 term
    highlight_query=[                     # Additional TEXT_MATCH terms to highlight
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

この例では、クエリが `"Milvus"` を検索し、以下の設定でハイライトされたフラグメントを返します。

- `fragment_offset` は、最初のハイライト範囲の前に最大20文字の先行コンテキストを保持します（デフォルトは0）。

- `fragment_size` は、各フラグメントの長さを約60文字に制限します（デフォルトは100）。

- `num_of_fragments` は、テキスト値ごとに返されるフラグメント数を制限します（デフォルトは5）。

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
    fragment_offset=20,  # Keep 20 chars before match
    fragment_size=60,    # Max ~60 chars per fragment
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

### 例4: 複数クエリのハイライト\{#example-4-multi-query-highlighting}

BM25全文検索で複数のクエリを使用して検索する場合、各クエリの結果は個別にハイライトされます。最初のクエリの結果にはその検索語に対するハイライトが含まれ、2番目のクエリの結果にはその検索語に対するハイライトが含まれます。以下同様です。各クエリは同じ `highlighter` 設定を使用しますが、それを独立して適用します。

以下の例では：

- 最初のクエリは結果セット内で `"test"` をハイライトします

- 2番目のクエリは結果セット内で `"Milvus"` をハイライトします

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
    data=["test", "Milvus"],  # Two queries
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

### 例5: カスタムHTMLタグ\{#example-5-custom-html-tags}

ハイライト表示に任意のタグを使用できます。たとえば、Web UI向けのHTMLセーフなタグなどが該当します。これは、ブラウザで検索結果をレンダリングする際に役立ちます。

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

