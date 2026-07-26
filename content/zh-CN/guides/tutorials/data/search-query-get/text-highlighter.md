---
title: "Lexical Highlighter | Cloud"
slug: /text-highlighter
sidebar_key: text-highlighter
sidebar_label: "Lexical Highlighter"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud 中的 Highlighter 会在文本字段中对匹配到的词项进行标注，通过在其前后包裹可自定义的标签来实现高亮显示。高亮有助于解释文档为何被命中，提升结果的可读性，并支持在搜索与 RAG 应用中的富文本渲染。 | Cloud"
type: origin
token: UAiSwzyTxi8EJ4k45cwcXJ10neb
sidebar_position: 12
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - query
  - 查询
  - filter
  - 过滤
  - 过滤表达式
  - text highlighter
  - 文本高亮

---

import Admonition from '@theme/Admonition';


# Lexical Highlighter

Zilliz Cloud 中的 Highlighter 会在文本字段中对匹配到的词项进行标注，通过在其前后包裹可自定义的标签来实现高亮显示。高亮有助于解释文档为何被命中，提升结果的可读性，并支持在搜索与 RAG 应用中的富文本渲染。

高亮是在最终搜索结果集上的**后处理步骤**执行的。它不会影响候选召回、过滤逻辑、排序或打分。

Highlighter 提供了三个彼此独立的控制维度：

- **高亮哪些词项**

    你可以选择高亮词项的来源。例如，高亮 BM25 Full Text Search 中使用的搜索词，或在基于文本的过滤表达式（如 TEXT_MATCH 条件）中指定的查询词。

- **如何渲染高亮词项**

    你可以通过配置每个匹配项前后插入的标签来控制高亮的呈现方式。例如，使用 `{}` 这样的简单标记，或使用 `<em></em>` 等 HTML 标签进行富文本渲染。

- **如何返回高亮文本**

    你可以控制高亮结果以片段（fragment）的形式返回，包括片段的起始位置、长度以及返回的片段数量。

以下各节将分别介绍这些使用场景。

## BM25 Full Text Search 中的搜索词高亮\{#search-term-highlighting-in-bm25-full-text-search}

在执行 BM25 Full Text Search 时，你可以对返回结果中的搜索词进行高亮显示，以帮助解释文档为何与查询匹配。有关 BM25 全文搜索的更多信息，请参阅 [Full Text Search](./full-text-search)。

在该场景中，被高亮的词项直接来源于 BM25 Full Text Search 中使用的搜索词。Highlighter 会使用这些词项，对最终结果中的匹配文本进行标注。

假设某个文本字段中存储了如下内容：

```plaintext
Milvus supports full text search. Use BM25 for keyword relevance. Filters can narrow results.
```

**Highlighter 配置**

要在 BM25 Full Text Search 中高亮搜索词，需要创建一个 `LexicalHighlighter`，并为 BM25 Full Text Search 启用搜索词高亮：

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],              # Tag inserted before each highlighted term
    post_tags=["}"],             # Tag inserted after each highlighted term
    highlight_search_text=True   # Enable search term highlighting for BM25 full text search
)
```

在该示例中：

- `pre_tags` 和 `post_tags` 用于控制高亮文本在输出中的呈现方式。在这里，匹配到的词项会被 `{}` 包裹（例如 `{term}`）。你也可以以列表形式提供多个标签（例如 `["<b>", "<i>"]`）。当有多个词项被高亮时，标签会按照匹配顺序依次应用并循环使用。

- `highlight_search_text=True` 表示让 Zilliz Cloud 使用 BM25 Full Text Search 中的搜索词作为高亮词项的来源。

创建 Highlighter 对象后，将其配置应用到 BM25 全文搜索请求中：

```python
results = client.search(
    ...,
    data=["BM25"],      # Search term used in BM25 full text search
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

**高亮输出**

启用高亮后，Zilliz Cloud 会在返回结果中通过一个专门的 `highlight` 字段返回高亮文本。默认情况下，高亮结果以片段（fragment）的形式返回，片段从第一个匹配到的词项开始。

在该示例中，搜索词为 `"BM25"`，因此它会在返回结果中被高亮显示：

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

如需控制返回片段的位置、长度以及返回的片段数量，请参阅[基于片段的高亮输出](./text-highlighter#fragment-based-highlighting-output)。

## 过滤条件中的查询词高亮\{#query-term-highlighting-in-filtering}

除了高亮搜索词之外，你还可以对**基于文本的过滤表达式**中使用的查询词进行高亮显示。

<Admonition type="info" icon="📘" title="说明">

- 当前仅支持对 TEXT_MATCH 过滤条件中的查询词进行高亮。更多信息请参阅 [Text Match](./text-match)。

</Admonition>

在该场景中，被高亮的词项来源于文本过滤表达式。过滤条件用于决定哪些文档被匹配，而 Highlighter 负责对匹配到的文本片段进行标注。

假设某个文本字段中存储了如下内容：

```python
This document explains how text filtering works in Milvus.
```

**Highlighter 配置**

要高亮过滤条件中使用的查询词，需要创建一个 `LexicalHighlighter`，并定义一个与过滤条件对应的 `highlight_query`：

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

在该配置中：

- `pre_tags` 和 `post_tags` 用于控制高亮文本在输出中的呈现方式。在这里，匹配到的词项会被 `{}` 包裹（例如 `{term}`）。你也可以以列表形式提供多个标签（例如 `["<b>", "<i>"]`）。当有多个词项被高亮时，标签会按照匹配顺序依次应用并循环使用。

- `highlight_query` 用于定义需要被高亮的过滤查询词项。

创建 Highlighter 对象后，在搜索请求中同时使用相同的过滤表达式，并传入 Highlighter 配置：

```python
results = client.search(
    ...,
    filter='TEXT_MATCH(text, "text filtering")',
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

**高亮输出**

当为过滤条件启用查询词高亮后，Zilliz Cloud 会在返回结果中通过一个专门的 `highlight` 字段返回高亮文本。默认情况下，高亮结果以片段（fragment）的形式返回，并从第一个匹配到的词项开始。

在该示例中，第一个匹配到的词项是 `"text"`，因此返回的高亮文本会从该位置开始：

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

如需控制返回片段的位置、长度以及返回的片段数量，请参阅[基于片段的高亮输出](./text-highlighter#fragment-based-highlighting-output)。

## 基于片段的高亮输出\{#fragment-based-highlighting-output}

默认情况下，Zilliz Cloud 会将高亮文本以片段（fragment）的形式返回，并从第一个匹配到的词项开始。通过与片段相关的配置参数，你可以进一步控制片段的返回方式，而无需改变哪些词项会被高亮。

假设某个文本字段中存储了如下内容：

```plaintext
Milvus supports full text search. Use BM25 for keyword relevance. Filters can narrow results.
```

**Highlighter 配置**

要控制高亮片段的形态，需要在 `LexicalHighlighter` 中配置与片段相关的选项：

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

在该配置中：

- `fragment_offset` 用于在第一个被高亮的词项之前保留一定的上下文内容。

- `fragment_size` 用于限制每个片段中包含的文本长度。

- `num_of_fragments` 用于控制最多返回多少个片段。

创建 Highlighter 对象后，将其配置应用到搜索请求中：

```python
results = client.search(
    ...,
    data=["BM25"],
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

**高亮输出**

启用基于片段的高亮后，Zilliz Cloud 会在返回结果的 `highlight` 字段中以片段形式返回高亮文本：

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

在该输出中：

- 由于设置了 `fragment_offset`，返回的片段并不会严格从 `{BM25}` 处开始。

- 由于 `num_of_fragments` 被设置为 `1`，因此只返回一个片段。

- 片段的长度受到 `fragment_size` 的限制。

## 示例\{#examples}

### 准备工作\{#preparation}

在使用 Highlighter 之前，请确保你的集合已正确配置。

下面的示例将创建一个同时支持 **BM25 Full Text Search** 和 **TEXT_MATCH 查询** 的 Collection，并向其中插入示例文档。

<details>

<summary><strong>准备 Collection</strong></summary>

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

### 示例 1：在 BM25 Full Text Search 中高亮搜索词\{#example-1-highlight-search-terms-in-bm25-full-text-search}

本示例演示了如何在 BM25 Full Text Search 中对搜索词进行高亮显示。

- BM25 Full Text Search 使用 `"test"` 作为搜索词

- Highlighter 会使用 `{` 和 `}` 标签包裹文本中所有出现的 `"test"`

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

<summary>示例结果</summary>

```plaintext
['{test} doc']
['{test} doc']
['{test} doc. Milvus is an open-source vector database built for GenAI applications.']
['{test} doc. Milvus is an open-source vector database that suits AI applications of every size from run']
```

</details>

### 示例 2：在过滤条件中高亮查询词\{#example-2-highlight-query-terms-in-filtering}

本示例演示了如何对 TEXT_MATCH 过滤条件中匹配到的词项进行高亮显示。

- BM25 Full Text Search 使用 `"test"` 作为查询词

- `queries` 参数将 `"my doc"` 添加到高亮词项列表中

- Highlighter 会使用 `{` 和 `}` 包裹所有被匹配到的词项（`"my"`、`"test"`、`"doc"`）

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

<summary>示例结果</summary>

```plaintext
['{my} first {test} {doc}']
['{my} second {test} {doc}']
['{my} first {test} {doc}. Milvus is an open-source vector database built for GenAI applications.']
['{my} second {test} {doc}. Milvus is an open-source vector database that suits AI applications of every siz']
```

</details>

### 示例 3：以片段形式返回高亮结果\{#example-3-return-highlights-as-fragments}

在该示例中，查询搜索词为 `"Milvus"`，并在以下配置下返回高亮片段：

- `fragment_offset`：在第一个高亮片段之前最多保留 **20 个字符**作为前置上下文（默认值为 0）。

- `fragment_size`：将每个高亮片段的长度限制在约 **60 个字符**以内（默认值为 100）。

- `num_of_fragments`：限制每个文本值最多返回的高亮片段数量（默认值为 5）。

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

<summary>示例结果</summary>

```plaintext
Doc 1: ['my first test doc. {Milvus} is an open-source vector database ']
Doc 2: ['my second test doc. {Milvus} is an open-source vector database']
```

</details>

### 示例 4：多查询高亮\{#example-4-multi-query-highlighting}

在 BM25 Full Text Search 中使用多个查询时，每个查询的结果都会**独立进行高亮**。第一个查询返回的结果只包含其搜索词的高亮，第二个查询返回的结果只包含其搜索词的高亮，依此类推。所有查询共享同一套 Highlighter 配置，但会分别独立应用。

在下面的示例中：

- 第一个查询在其结果集中高亮 `"test"`

- 第二个查询在其结果集中高亮 `"Milvus"`

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

<summary>示例结果</summary>

```plaintext
Query 'test':
  ['{test} doc']
  ['{test} doc']
Query 'Milvus':
  ['{Milvus} is an open-source vector database built for GenAI applications.']
  ['{Milvus} is an open-source vector database that suits AI applications of every size from running a dem']
```

</details>

### 示例 5：自定义 HTML 标签\{#example-5-custom-html-tags}

你可以为高亮使用任意标签，例如适用于 Web UI 的 **HTML 安全标签**。这在浏览器中渲染搜索结果时非常有用。

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

<summary>示例结果</summary>

```plaintext
['<mark>test</mark> doc']
['<mark>test</mark> doc']
```

</details>