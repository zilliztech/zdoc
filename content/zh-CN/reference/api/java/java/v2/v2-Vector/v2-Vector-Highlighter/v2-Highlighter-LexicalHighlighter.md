---
title: "LexicalHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "LexicalHighlighter 实例用于为搜索结果中的文本字段配置后处理术语高亮。高亮功能使用可自定义的标签标注匹配的文本范围，并可返回基于片段的摘录，以提升可读性和 UI 渲染效果。它不会影响检索、过滤、排序或评分。 | Java | v2"
type: docx
token: VNw2dXf4wopDtYxVSvlc21aDn2g
sidebar_position: 2
keywords: 
  - Zilliz Database
  - 非结构化数据
  - 向量 Database
  - IVF
  - Zilliz
  - Zilliz Cloud
  - 云
  - LexicalHighlighter
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# LexicalHighlighter

LexicalHighlighter 实例用于为搜索结果中的文本字段配置后处理术语高亮。高亮功能使用可自定义的标签标注匹配的文本范围，并可返回基于片段的摘录，以提升可读性和 UI 渲染效果。它不会影响检索、过滤、排序或评分。

```java
io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter
```

## 构造函数\{#constructor}

此构造函数用于初始化一个新的 `LexicalHighlighter` 实例。

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

**构建器方法：**

- `highlightQueries(List<HighlightQuery>)`

    定义来自基于文本的过滤条件的哪些查询词会被高亮。每个条目必须是 `HighlightQuery` 实例。

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

    如果未设置，则不会高亮任何过滤词。

    详情请参见 Text Highlighter。

- `highlightSearchText(Boolean)`

    是否高亮 BM25 全文搜索中使用的搜索词。如果为 true，则 BM25 查询词将用作高亮词的来源。如果未设置，则不会高亮 BM25 搜索词。

- `preTags(List<String>)`

    在返回的高亮内容中，插入到每个匹配词之前的标签。支持普通字符串（例如 `{`）或 HTML 安全标记（例如 &lt;em>、&lt;mark>）。如果提供多个标签，则会按顺序在各个匹配项之间轮换使用这些标签。

- `postTags(List<String>)`

    插入到每个匹配词之后的标签，与 `pre_tags` 配对使用。如果提供多个标签，则按照与 pre_tags 相同的顺序轮换。

- `fragmentOffset(Integer)`

    返回基于片段的输出时，保留在第一个高亮匹配项之前作为上下文的前导字符数。默认行为不保留额外的前导上下文。

- `fragmentSize(Integer)`

    每个返回片段的最大长度（按字符计）。高亮器会将片段长度限制在大约此大小。

- `numOfFragments(Integer)`

    每个文本值最多返回的片段数。如果未设置，则会返回多个片段（实现默认值；典型值请参见示例）。

**返回类型：**

*LexicalHighlighter*

**返回：**

一个 **LexicalHighlighter** 实例。

**参数：**

- **highlightQueries** (*List&lt;HighlightQuery&gt;*) -

    要高亮的查询词。每个条目都是一个 **HighlightQuery** 实例，用于从基于文本的过滤条件中选择要标记的词。

- **highlightSearchText** (*Boolean*) -

    BM25 搜索词是否用作高亮词的来源。

- **preTags** (*List&lt;String&gt;*) -

    插入到每个匹配词之前的标签。多个标签会按顺序在各个匹配项之间轮换。

- **postTags** (*List&lt;String&gt;*) -

    插入到每个匹配词之后的标签，与 pre-tags 配对使用。

- **fragmentOffset** (*Integer*) -

    在基于片段的输出中，保留在第一个高亮匹配项之前作为上下文的前导字符数。

- **fragmentSize** (*Integer*) -

    每个返回片段的最大长度（按字符计）。

- **numOfFragments** (*Integer*) -

    每个文本值最多返回的片段数。

## 示例\{#example}

在 BM25 全文搜索中高亮搜索词：

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

在 Text Match 中高亮查询词：

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
