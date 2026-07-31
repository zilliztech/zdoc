---
title: "LexicalHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`LexicalHighlighter` 实例用于为搜索结果中文本字段的后处理词项高亮配置参数。高亮会使用可自定义的标签标注匹配到的片段，并且可以返回基于片段的摘要，以提升可读性和 UI 渲染效果。它不会影响检索、过滤、排序或评分。 | Java | v2"
type: docx
token: Krd6dVuQbohTF5xFHGYcomHsnEg
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

`LexicalHighlighter` 实例用于为搜索结果中文本字段的后处理词项高亮配置参数。高亮会使用可自定义的标签标注匹配到的片段，并且可以返回基于片段的摘要，以提升可读性和 UI 渲染效果。它不会影响检索、过滤、排序或评分。

```java
io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter
```

## Constructor\{#constructor}

此构造器用于初始化一个新的 `LexicalHighlighter` 实例。

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

**BUILDER METHODS：**

- `highlightQueries(List<HighlightQuery>)`

    定义要高亮显示的、来自基于文本过滤条件的查询词项。每个条目都必须是一个 `HighlightQuery` 实例。

    ```java
    import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
    import java.util.ArrayList;
    import java.util.List;
    
    LexicalHighter.HighlightQuery q = new LexicalHighlighter.HighlighterQuery(
        "<QueryType>",
        "<text field name>",
        "<terms to highlight>"
    )
    
    List<LexicalHighter.HighlightQuery> queries = new ArrayList<>();
    queries.add(q);
    ```

    如果未设置，则不会高亮任何过滤词项。

    更多详情，请参见 [Text Highlighter](https://milvus.io/docs/text-highlighter.md)。

- `highlightSearchText(Boolean)`

    是否高亮 BM25 全文搜索中使用的搜索词项。如果为 True，则使用 BM25 查询词项作为高亮词项的来源。如果未设置，则不会高亮 BM25 搜索词项。

- `preTags(List<String>)`

    在返回的高亮结果中，插入到每个匹配词项之前的标签。支持纯字符串（例如 `{`）或 HTML 安全标记（例如 `<em>`、`<mark>`）。如果提供了多个标签，则标签会按匹配顺序轮换使用。

- `postTags(List<String>)`

    插入到每个匹配词项之后的标签，与 `pre_tags` 配对使用。如果提供了多个标签，则其轮换顺序与 pre_tags 相同。

- `fragmentOffset(Integer)`

    在返回基于片段的输出时，在第一个高亮匹配项之前保留的前导上下文字符数。默认行为是不保留额外的前导上下文。

- `fragmentSize(Integer)`

    每个返回片段的最大长度（按字符数计）。高亮器会将片段长度大致限制在该大小内。

- `numOfFragments(Integer)`

    每个文本值返回的最大片段数。如果未设置，则默认为返回多个片段（实现默认值；典型取值请参见示例）。

**RETURN TYPE：**

*LexicalHighlighter*

**RETURNS：**

一个 **LexicalHighlighter** 实例。

## Example\{#example}

在 BM25 全文搜索中高亮搜索词项：

```java
import io.milvus.v2.service.vector.request.SearchReq;
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
    .postTags(PostTags)
    .build(); 
    
SearchResp searchR = client.search(SearchReq.builder()
    .collectionName("your_collection")
    .data(Collections.singletonList("test"))
    .annsField("sparse_vector")
    .topK(10)
    .outputFields(Collections.singletonList("text"))
    .highlighter(highlighter)
    .build());
```

在 Text Match 中高亮查询词项：

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

LexicalHighter.HighlightQuery q = new LexicalHighlighter.HighlighterQuery(
    "TextMatch",
    "text",
    "my doc"
)

List<LexicalHighter.HighlightQuery> queries = new ArrayList<>();
queries.add(q);

List<String> preTags = new ArrayList<>();
preTags.add("<mark>");

List<String> postTags = new ArrayList<>();
postTags.add("</mark>");

LexicalHighlighter highlighter = LexicalHighlighter.builder()
    .highlightQueries(Collections.singletonlist(q))
    .preTags(preTags)
    .postTags(PostTags)
    .build(); 
    
SearchResp searchR = client.search(SearchReq.builder()
    .collectionName("your_collection")
    .data(Collections.singletonList("test"))
    .annsField("sparse_vector")
    .topK(10)
    .outputFields(Collections.singletonList("text"))
    .highlighter(highlighter)
    .build());
```
