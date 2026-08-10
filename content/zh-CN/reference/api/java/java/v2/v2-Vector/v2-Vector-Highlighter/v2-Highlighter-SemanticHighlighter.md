---
title: "SemanticHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-SemanticHighlighter
sidebar_label: "SemanticHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "`SemanticHighlighter` 实例用于为搜索结果中文本字段的后处理语义高亮配置。不同于匹配精确术语的词法高亮，语义高亮会根据与查询的语义相似度来识别并标记相关文本 Segment。高亮会使用可自定义标签对匹配到的范围进行标注。它不会影响检索、过滤、排序或评分。 | Java | v2"
type: docx
token: LNRldueDGotZ1kx5wwlc63SDnLe
sidebar_position: 3
keywords: 
  - RAG
  - NLP
  - 神经网络
  - 深度学习
  - zilliz
  - zilliz cloud
  - 云
  - SemanticHighlighter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# SemanticHighlighter

`SemanticHighlighter` 实例用于为搜索结果中文本字段的后处理语义高亮配置。不同于匹配精确术语的词法高亮，语义高亮会根据与查询的语义相似度来识别并标记相关文本 Segment。高亮会使用可自定义标签对匹配到的范围进行标注。它不会影响检索、过滤、排序或评分。

```java
io.milvus.v2.service.vector.request.highlighter.SemanticHighlighter
```

## 构造函数\{#constructor}

此构造函数会初始化一个新的 `SemanticHighlighter` 实例。

```java
SemanticHighlighter.builder()
    .queries(List<String>)
    .inputFields(List<String>)
    .preTags(List<String>)
    .postTags(List<String>)
    .threshold(Float)
    .highlightOnly(Boolean)
    .modelDeploymentID(String)
    .maxClientBatchSize(Integer)
    .build(); 
```

**构建器方法：**

- `queries(List<String>)`

    要与文档匹配的搜索查询列表。高亮器使用这些查询来识别结果中语义相关的文本 Segment。

- `inputFields(List<String>)`

    要高亮的 Schema 字段。指定搜索结果中哪些文本字段应进行语义高亮处理。

- `preTags(List<String>)`

    在返回的高亮结果中插入到每个匹配 Segment 之前的标签。支持纯字符串（例如 `{`）或 HTML 安全标记（例如 `<em>`、`<mark>`）。如果提供多个标签，则会按匹配顺序轮换使用这些标签。

- `postTags(List<String>)`

    在每个匹配 Segment 之后插入的标签，与 `pre_tags` 配对使用。提供多个标签时，会按照与 `pre_tags` 相同的顺序轮换。

- `threshold(Float)`

    定义可用于高亮的“足够匹配”最小置信度分数（0.0 到 1.0）。语义高亮会在 top-k 检索之后按项应用——只有与查询语义匹配且高于此阈值的 Segment，才会返回带有 `pre_tags`/`post_tags` 的高亮片段。如果未设置，低于该阈值的 Segment 会返回空结果（`fragments=[], scores=[]`）

- `highlightOnly(Boolean)`

    如果为 `True`（默认值），则仅返回与查询在语义上相关的句子级片段，这有助于聚焦最相关的上下文。如果设置为 `False`，则会返回包含这些片段的完整段落，前提是其长度不超过模型的上下文限制。不过，当返回完整段落时，`scores` 字段将不再具有实际意义。

- `modelDeploymentID(String)`

    用于语义推理的已部署高亮模型的 ID。该模型决定如何计算查询与文档 Segment 之间的语义相似度。

- `maxClientBatchSize(Integer)`

    限制单个批次中处理的项目数量。可用于控制内存使用量和处理吞吐量。

**返回类型：**

*SemanticHighlighter*

**返回值：**

一个 **SemanticHighlighter** 实例。

## 示例\{#examples}

在稠密向量搜索中高亮语义相关的文本：

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

List<String> queries = new ArrayList<>();
queries.add("When was artificial intelligence founded");
queries.add("Where was Alan Turing born?");

List<String> inputFields = new ArrayList<>();
inputFields.add("document");

List<String> preTags = new ArrayList<>();
preTags.add("<mark>");

List<String> postTags = new ArrayList<>();
postTags.add("</mark>");

SemanticHighlighter highlighter = SemanticHighlighter.builder()
    .queries(queries)
    .inputFields(inputFields)
    .preTags(preTags)
    .postTags(PostTags)
    .modelDeploymentID("your-model-deployment-id")
    .build(); 
    
SearchResp searchR = client.search(SearchReq.builder()
    .collectionName("your_collection")
    .data(Collections.singletonList("test"))
    .annsField("dense")
    .topK(3)
    .outputFields(Collections.singletonList("document"))
    .highlighter(highlighter)
    .build());
```

搜索结果中包含一个 `highlight` 字段，其中含有高亮片段及其置信度分数：

```python
# Example output:
# hit: {
#     'id': 1,
#     'distance': 0.766,
#     'entity': {'document': 'Artificial intelligence was founded as an academic discipline in 1956.'},
#     'highlight': {
#         'document': {
#             'fragments': ['<mark>Artificial intelligence was founded as an academic discipline in 1956.</mark>'],
#             'scores': [1.0]
#         }
#     }
# }
```

使用 `threshold` 过滤低置信度高亮：

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

List<String> queries = new ArrayList<>();
queries.add("When was artificial intelligence founded");
queries.add("Where was Alan Turing born?");

List<String> inputFields = new ArrayList<>();
inputFields.add("document");

List<String> preTags = new ArrayList<>();
preTags.add("<mark>");

List<String> postTags = new ArrayList<>();
postTags.add("</mark>");

SemanticHighlighter highlighter = SemanticHighlighter.builder()
    .queries(queries)
    .inputFields(inputFields)
    .preTags(preTags)
    .postTags(PostTags)
    .threshold(0.8f)
    .modelDeploymentID("your-model-deployment-id")
    .build(); 
    
SearchResp searchR = client.search(SearchReq.builder()
    .collectionName("your_collection")
    .data(Collections.singletonList("machine learning applications"))
    .annsField("dense")
    .topK(10)
    .outputFields(Collections.singletonList("content"))
    .highlighter(highlighter)
    .build());
```

