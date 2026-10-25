---
title: "SemanticHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-SemanticHighlighter
sidebar_label: "SemanticHighlighter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "SemanticHighlighter 实例用于为搜索结果中的文本字段配置后处理语义高亮。与匹配精确词项的词汇高亮不同，语义高亮会根据文本与查询之间的语义相似度识别并标记相关文本 Segment。高亮功能使用可自定义的标签标注匹配的文本片段。它不会影响检索、过滤、排序或评分。 | Java | v2"
type: docx
token: Q1M5dNmqoo9wizxhCD6cSJVcn8b
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

---

import Admonition from '@theme/Admonition';


# SemanticHighlighter

SemanticHighlighter 实例用于为搜索结果中的文本字段配置后处理语义高亮。与匹配精确词项的词汇高亮不同，语义高亮会根据文本与查询之间的语义相似度识别并标记相关文本 Segment。高亮功能使用可自定义的标签标注匹配的文本片段。它不会影响检索、过滤、排序或评分。

```java
io.milvus.v2.service.vector.request.highlighter.SemanticHighlighter
```

## 构造函数\{#constructor}

此构造函数用于初始化一个新的 `SemanticHighlighter` 实例。

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

    用于与文档匹配的搜索查询列表。高亮器使用这些查询来识别结果中语义相关的文本 Segment。

- `inputFields(List<String>)`

    要高亮的 Schema 字段。指定搜索结果中哪些文本字段应进行语义高亮处理。

- `preTags(List<String>)`

    插入到返回的高亮内容中每个匹配 Segment 之前的标签。支持纯字符串（例如 `{`）或 HTML 安全标记（例如 `<em>`、`<mark>`）。如果提供了多个标签，标签会按匹配顺序轮换使用。

- `postTags(List<String>)`

    插入到每个匹配 Segment 之后的标签，与 `pre_tags` 配对使用。如果提供了多个标签，轮换顺序与 `pre_tags` 相同。

- `threshold(Float)`

    定义高亮“充分匹配”的最低置信度分数（0.0 到 1.0）。语义高亮会在 top-k 检索后逐项执行——只有语义上高于此阈值并与查询匹配的 Segment，才会返回带有 `pre_tags`/`post_tags` 的高亮片段。如果未设置该值，低于阈值的 Segment 将返回空结果（`fragments=[], scores=[]`）

- `highlightOnly(Boolean)`

    如果为 `True`（默认值），则仅返回与查询语义相关的句子级片段，这有助于聚焦最相关的上下文。如果设置为 `False`，则改为返回包含这些片段的完整段落，前提是其长度不超过模型的上下文限制。但是，返回完整段落时，`scores` 字段将不再有意义。

- `modelDeploymentID(String)`

    用于语义推理的已部署高亮模型 ID。此模型决定如何计算查询与文档 Segment 之间的语义相似度。

- `maxClientBatchSize(Integer)`

    限制单个批次中处理的项数。可用于控制内存使用量和处理吞吐量。

**返回类型：**

*SemanticHighlighter*

**返回：**

一个 **SemanticHighlighter** 实例。

**参数：**

- **queries** (*List&lt;String&gt;*) -

    用于识别结果中语义相关文本 Segment 的搜索查询。

- **inputFields** (*List&lt;String&gt;*) -

    搜索结果中要高亮的 Schema 文本字段。

- **preTags** (*List&lt;String&gt;*) -

    插入到每个匹配 Segment 之前的标签。提供多个标签时，标签会按匹配顺序轮换使用。

- **postTags** (*List&lt;String&gt;*) -

    插入到每个匹配 Segment 之后的标签，与前置标签配对使用。

- **threshold** (*Float*) -

    高亮一个 Segment 所需的最低置信度分数（0.0 到 1.0）。

- **highlightOnly** (*Boolean*) -

    是否仅返回句子级相关片段，而不是完整段落。

- **modelDeploymentID** (*String*) -

    用于语义推理的已部署高亮模型 ID。

- **maxClientBatchSize** (*Integer*) -

    单个批次中处理的最大项数。

## 示例\{#examples}

在稠密向量搜索中高亮语义相关的文本：

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.SemanticHighlighter;

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
    .postTags(postTags)
    .modelDeploymentID("your-model-deployment-id")
    .build(); 
    
SearchResp searchR = client.search(SearchReq.builder()
    .collectionName("your_collection")
    .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f})))
    .annsField("dense")
    .topK(3)
    .outputFields(Collections.singletonList("document"))
    .highlighter(highlighter)
    .build());
```

搜索结果包含一个 `highlight` 字段，其中含有高亮片段及其置信度分数：

```java
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

使用 `threshold` 过滤置信度较低的高亮内容：

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.SemanticHighlighter;

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
    .postTags(postTags)
    .threshold(0.8f)
    .modelDeploymentID("your-model-deployment-id")
    .build(); 
    
SearchResp searchR = client.search(SearchReq.builder()
    .collectionName("your_collection")
    .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f, 0.3f})))
    .annsField("dense")
    .topK(10)
    .outputFields(Collections.singletonList("content"))
    .highlighter(highlighter)
    .build());
```
