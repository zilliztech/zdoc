---
title: "LexicalHighlighter | Python | MilvusClient"
slug: /python/python/Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "The LexicalHighlighter configures post-processing term highlighting for text fields in search results. Highlighting annotates matched spans using customizable tags, and can return fragment-based snippets for improved readability and UI rendering. It does not impact retrieval, filtering, ranking, or scoring. | Python | MilvusClient"
type: docx
token: WytXd3BYFo2bY2xDrRIcCcoXnb0
sidebar_position: 1
keywords: 
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings
  - zilliz
  - zilliz cloud
  - cloud
  - LexicalHighlighter
  - pymilvus30
displayed_sidebar: pythonSidebar

---

import Admonition from '@theme/Admonition';


# LexicalHighlighter

The **LexicalHighlighter** configures post-processing term highlighting for text fields in search results. Highlighting annotates matched spans using customizable tags, and can return fragment-based snippets for improved readability and UI rendering. It does not impact retrieval, filtering, ranking, or scoring.

## Request Syntax\{#request-syntax}

```python
class pymilvus.LexicalHighlighter
```

**PARAMETERS:**

- **highlight_query** (*list[dict]*) -

    An option that defines which query terms from text-based filters are highlighted. Each entry must be a dict: If unset, no filtering terms are highlighted. For details, refer to Text Highlighter.

- **highlight_search_text** (*bool*) -

    A flag that indicates whether to highlight search terms used in BM25 full text search. If True, the BM25 query terms are used as the source of highlighted terms. If unset, BM25 search terms are not highlighted.

- **pre_tags** (*list[str]*) -

    An option that tags inserted before each matched term in the returned highlight. Supports plain strings (e.g., \{) or HTML-safe markers (e.g., &lt;em>, &lt;mark>). If multiple tags are provided, tags rotate by match sequence.

- **post_tags** (*list[str]*) -

    An option that tags inserted after each matched term, paired with pre_tags. Rotation follows the same order as pre_tags when multiple tags are provided.

- **fragment_offset** (*int*) -

    The number of characters of leading context to keep before the first highlighted match when returning fragment-based output. Default behavior keeps no extra leading context.

- **fragment_size** (*int*) -

    An option that maximum length of each returned fragment (in characters). The highlighter will cap fragment length approximately to this size.

- **num_of_fragments** (*int*) -

    An option that maximum number of fragments to return per text value. If unset, the default is multiple fragments (implementation default; see Examples for typical values).

**RETURN TYPE:**

*LexicalHighlighter*

**RETURNS:**

A LexicalHighlighter object.

## Examples\{#examples}

Highlight search terms in BM25 full text search:

```python
from pymilvus import MilvusClient, LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
)

results = client.search(
    collection_name="your_collection",
    data=["test"],                 # BM25 query term
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```

Highlight query terms in Text Match:

```python
from pymilvus import MilvusClient, LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    highlight_query=[{"type": "TextMatch", "field": "text", "text": "my doc"}],
)

results = client.search(
    collection_name="your_collection",
    data=["test"],                 # BM25 can be combined
    anns_field="sparse_vector",
    limit=10,
    search_params={"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}},
    output_fields=["text"],
    highlighter=highlighter,
)
```
