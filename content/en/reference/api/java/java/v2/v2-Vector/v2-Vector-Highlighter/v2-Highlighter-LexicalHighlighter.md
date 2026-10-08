---
title: "LexicalHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "A LexicalHighlighter instance configures post-processing term highlighting for text fields in search results. Highlighting annotates matched spans using customizable tags, and can return fragment-based snippets for improved readability and UI rendering. It does not affect retrieval, filtering, ranking, or scoring. | Java | v2"
type: docx
token: VNw2dXf4wopDtYxVSvlc21aDn2g
sidebar_position: 2
keywords: 
  - Zilliz database
  - Unstructured Data
  - vector database
  - IVF
  - zilliz
  - zilliz cloud
  - cloud
  - LexicalHighlighter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# LexicalHighlighter

A LexicalHighlighter instance configures post-processing term highlighting for text fields in search results. Highlighting annotates matched spans using customizable tags, and can return fragment-based snippets for improved readability and UI rendering. It does not affect retrieval, filtering, ranking, or scoring.

```java
io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter
```

## Constructor\{#constructor}

This constructor initializes a new `LexicalHighlighter` instance.

```java
LexicalHighlighter.builder()
    .highlightQueries(List<HighlightQuery>)
    .highlightSearchText(Boolean)
    .preTags(List<String>)
    .postTags(List<String>)
    .fragmentOffset(Integer)
    .fragmentSize(Integer)
    .numOfFragments(Integer)
    .build(); 
```

**BUILDER METHODS:**

- `highlightQueries(List<HighlightQuery>)`

    Defines which query terms from text-based filters are highlighted. Each entry must be a `HighlightQuery` instance.

    ```java
    import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
    import java.util.ArrayList;
    import java.util.List;
    
    LexicalHighlighter.HighlightQuery q = new LexicalHighlighter.HighlightQuery(
        "<QueryType>",
        "<text field name>",
        "<terms to highlight>"
    );
    
    List<LexicalHighlighter.HighlightQuery> queries = new ArrayList<>();
    queries.add(q);
    ```

    If unset, no filtering terms are highlighted.

    For details, refer to Text Highlighter.

- `highlightSearchText(Boolean)`

    Whether to highlight search terms used in BM25 full text search. If true, the BM25 query terms are used as the source of highlighted terms. If unset, BM25 search terms are not highlighted.

- `preTags(List<String>)`

    Tags inserted before each matched term in the returned highlight. Supports plain strings (e.g., `{`) or HTML-safe markers (e.g., &lt;em>, &lt;mark>). If multiple tags are provided, the tags rotate across matches in order.

- `postTags(List<String>)`

    Tags inserted after each matched term, paired with `pre_tags`. Rotation follows the same order as pre_tags when multiple tags are provided.

- `fragmentOffset(Integer)`

    Number of leading characters to keep as context before the first highlighted match when returning fragment-based output. Default behavior keeps no extra leading context.

- `fragmentSize(Integer)`

    Maximum length of each returned fragment (in characters). The highlighter caps fragment length at approximately this size.

- `numOfFragments(Integer)`

    Maximum number of fragments to return per text value. If unset, multiple fragments are returned (implementation default; see Examples for typical values).

**RETURN TYPE:**

*LexicalHighlighter*

**RETURNS:**

A **LexicalHighlighter** instance.

**PARAMETERS:**

- **highlightQueries** (*List&lt;HighlightQuery&gt;*) -

    The query terms to highlight. Each entry is a **HighlightQuery** instance that selects the terms to mark from a text-based filter.

- **highlightSearchText** (*Boolean*) -

    Whether the BM25 search terms are used as the source of highlighted terms.

- **preTags** (*List&lt;String&gt;*) -

    Tags inserted before each matched term. Multiple tags rotate across matches in order.

- **postTags** (*List&lt;String&gt;*) -

    Tags inserted after each matched term, paired with the pre-tags.

- **fragmentOffset** (*Integer*) -

    Number of leading characters kept as context before the first highlighted match in fragment-based output.

- **fragmentSize** (*Integer*) -

    Maximum length of each returned fragment, in characters.

- **numOfFragments** (*Integer*) -

    Maximum number of fragments returned per text value.

## Example\{#example}

Highlight search terms in BM25 full text search:

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

List<String> preTags = new ArrayList<>();
preTags.add("{");

List<String> postTags = new ArrayList<>();
postTags.add("}");

LexicalHighlighter highlighter = LexicalHighlighter.builder()
    .highlightSearchText(true)
    .preTags(preTags)
    .postTags(postTags)
    .build();

SearchResp searchR = client.search(SearchReq.builder()
    .collectionName("your_collection")
    .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f})))
    .annsField("sparse_vector")
    .topK(10)
    .outputFields(Collections.singletonList("text"))
    .highlighter(highlighter)
    .build());
```

Highlight query terms in Text Match:

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

LexicalHighlighter.HighlightQuery q = new LexicalHighlighter.HighlightQuery(
    "TextMatch",
    "text",
    "my doc"
);

List<LexicalHighlighter.HighlightQuery> queries = new ArrayList<>();
queries.add(q);

List<String> preTags = new ArrayList<>();
preTags.add("<mark>");

List<String> postTags = new ArrayList<>();
postTags.add("</mark>");

LexicalHighlighter highlighter = LexicalHighlighter.builder()
    .highlightQueries(queries)
    .preTags(preTags)
    .postTags(postTags)
    .build();

SearchResp searchR = client.search(SearchReq.builder()
    .collectionName("your_collection")
    .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f})))
    .annsField("sparse_vector")
    .topK(10)
    .outputFields(Collections.singletonList("text"))
    .highlighter(highlighter)
    .build());
```
