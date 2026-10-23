---
title: "with_query() | Python | MilvusClient"
slug: /python/python/Highlighter-with_query
sidebar_label: "with_query()"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "Adds a query-term definition to a `LexicalHighlighter` configuration for highlighting text matched by filtering expressions (e.g., TEXTMATCH). This augments `highlightquery` with one entry describing which field and terms to highlight and which filter type produced them. Highlighting runs as post-processing and does not affect retrieval, filtering, ranking, or scoring. | Python | MilvusClient"
type: docx
token: SzT2dS1cko3x0RxjkAEcMJLwnlf
sidebar_position: 3
keywords: 
  - vector database
  - IVF
  - knn
  - Image Search
  - zilliz
  - zilliz cloud
  - cloud
  - with_query()
  - pymilvus30
displayed_sidebar: pythonSidebar

displayed_sidbar: pythonSidebar
---

import Admonition from '@theme/Admonition';


# with_query()

Adds a query-term definition to a `LexicalHighlighter` configuration for highlighting text matched by filtering expressions (e.g., TEXT_MATCH). This augments `highlight_query` with one entry describing which field and terms to highlight and which filter type produced them. Highlighting runs as post-processing and does not affect retrieval, filtering, ranking, or scoring.

**RETURN TYPE:**

*with_query*

**RETURNS:**

*None*.

## Examples\{#examples}

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
)

highlighter.with_query(
    field="text",
    text="my doc",
    query_type="TextMatch",
)

results = client.search(
    collection_name="your_collection",
    data=["test"],
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```
