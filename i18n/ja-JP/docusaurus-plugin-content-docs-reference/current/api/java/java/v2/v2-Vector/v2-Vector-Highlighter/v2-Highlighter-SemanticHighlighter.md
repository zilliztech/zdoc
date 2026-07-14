---
title: "SemanticHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-SemanticHighlighter
sidebar_label: "SemanticHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "A `SemanticHighlighter` インスタンスは、検索結果のテキストフィールドに対する後処理のセマンティックハイライトを設定します。正確な用語に一致する lexical highlighting とは異なり、semantic highlighting はクエリとの意味的類似性に基づいて関連するテキストセグメントを識別し、マークします。ハイライトは、カスタマイズ可能なタグを使用して一致したスパンに注釈を付けます。これは retrieval、filtering、ranking、または scoring には影響しません。 | Java | v2"
type: docx
token: LNRldueDGotZ1kx5wwlc63SDnLe
sidebar_position: 3
keywords: 
  - RAG
  - NLP
  - Neural Network
  - Deep Learning
  - zilliz
  - zilliz cloud
  - cloud
  - SemanticHighlighter
  - javaV230
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# SemanticHighlighter

`SemanticHighlighter` インスタンスは、検索結果のテキストフィールドに対する後処理のセマンティックハイライトを設定します。正確な用語に一致する lexical highlighting とは異なり、semantic highlighting はクエリとの意味的類似性に基づいて関連するテキストセグメントを識別し、マークします。ハイライトは、カスタマイズ可能なタグを使用して一致したスパンに注釈を付けます。これは retrieval、filtering、ranking、または scoring には影響しません。

```java
io.milvus.v2.service.vector.request.highlighter.SemanticHighlighter
```

## Constructor\{#constructor}

このコンストラクタは、新しい `SemanticHighlighter` インスタンスを初期化します。

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

**BUILDER METHODS:**

- `queries(List<String>)`

    ドキュメントに対して照合する検索クエリのリストです。highlighter は、これらのクエリを使用して結果内の意味的に関連するテキストセグメントを識別します。

- `inputFields(List<String>)`

    ハイライト対象のスキーマフィールドです。検索結果のどのテキストフィールドを semantic highlighting の対象として処理するかを指定します。

- `preTags(List<String>)`

    返されるハイライト内で、各一致セグメントの前に挿入されるタグです。プレーン文字列（例: `{`）または HTML-safe マーカー（例: `<em>`, `<mark>`）をサポートします。複数のタグが指定された場合、タグは一致順に従ってローテーションされます。

- `postTags(List<String>)`

    各一致セグメントの後に挿入されるタグで、`pre_tags` と対になります。複数のタグが指定された場合、ローテーションは `pre_tags` と同じ順序に従います。

- `threshold(Float)`

    ハイライトのための「十分な一致」を定義する最小信頼スコア（0.0 から 1.0）です。semantic highlighting は top-k retrieval の後に各項目ごとに適用され、このしきい値を上回ってクエリと意味的に一致するセグメントのみが、`pre_tags`/`post_tags` を含むハイライト断片として返されます。未設定の場合、しきい値を下回るセグメントは空の結果（`fragments=[], scores=[]`）を返します。

- `highlightOnly(Boolean)`

    `True`（デフォルト）の場合、クエリと意味的に関連する文レベルの断片のみが返されるため、最も関連性の高いコンテキストに集中しやすくなります。`False` に設定した場合は、長さが model のコンテキスト制限を超えない限り、それらの断片を含む完全な段落が代わりに返されます。ただし、完全な段落が返される場合、`scores` フィールドはもはや意味を持ちません。

- `modelDeploymentID(String)`

    セマンティック推論に使用されるデプロイ済みハイライト model の ID です。この model によって、クエリとドキュメントセグメント間の意味的類似性がどのように計算されるかが決まります。

- `maxClientBatchSize(Integer)`

    単一バッチで処理される項目数を制限します。メモリ使用量と処理スループットの制御に役立ちます。

**RETURN TYPE:**

*SemanticHighlighter*

**RETURNS:**

**SemanticHighlighter** インスタンス。

## Examples\{#examples}

dense vector search で意味的に関連するテキストをハイライトします。

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

検索結果には、ハイライトされた断片とその信頼スコアを含む `highlight` フィールドが含まれます。

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

低信頼のハイライトを除外するには `threshold` を使用します。

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

