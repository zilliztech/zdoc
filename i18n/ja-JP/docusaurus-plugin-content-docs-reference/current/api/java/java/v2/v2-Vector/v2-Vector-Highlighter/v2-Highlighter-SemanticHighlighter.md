---
title: "SemanticHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-SemanticHighlighter
sidebar_label: "SemanticHighlighter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "SemanticHighlighter インスタンスは、検索結果内のテキストフィールドに対する後処理のセマンティックハイライトを構成します。完全一致する用語を照合する字句ハイライトとは異なり、セマンティックハイライトは、クエリとの意味的類似性に基づいて関連するテキストセグメントを特定し、マーク付けします。ハイライトでは、カスタマイズ可能なタグを使用して、一致したスパンに注釈を付けます。取得、フィルタリング、ランキング、スコアリングには影響しません。 | Java | v2"
type: docx
token: Q1M5dNmqoo9wizxhCD6cSJVcn8b
sidebar_position: 3
keywords: 
  - RAG
  - NLP
  - ニューラルネットワーク
  - 深層学習
  - zilliz
  - zilliz cloud
  - クラウド
  - SemanticHighlighter
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# SemanticHighlighter

SemanticHighlighter インスタンスは、検索結果内のテキストフィールドに対する後処理のセマンティックハイライトを構成します。完全一致する用語を照合する字句ハイライトとは異なり、セマンティックハイライトは、クエリとの意味的類似性に基づいて関連するテキストセグメントを特定し、マーク付けします。ハイライトでは、カスタマイズ可能なタグを使用して、一致したスパンに注釈を付けます。取得、フィルタリング、ランキング、スコアリングには影響しません。

```java
io.milvus.v2.service.vector.request.highlighter.SemanticHighlighter
```

## コンストラクター\{#constructor}

このコンストラクターは、新しい `SemanticHighlighter` インスタンスを初期化します。

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

**ビルダーメソッド：**

- `queries(List<String>)`

    ドキュメントと照合する検索クエリのリストです。ハイライターは、これらのクエリを使用して、結果内の意味的に関連するテキストセグメントを特定します。

- `inputFields(List<String>)`

    ハイライトするスキーマフィールドです。検索結果内のどのテキストフィールドをセマンティックハイライトの対象として処理するかを指定します。

- `preTags(List<String>)`

    返されるハイライト内の各一致セグメントの前に挿入されるタグです。プレーン文字列（例：`{`）または HTML セーフなマーカー（例：`<em>`、`<mark>`）をサポートします。複数のタグを指定した場合、タグは一致順にローテーションされます。

- `postTags(List<String>)`

    各一致セグメントの後に挿入されるタグで、`pre_tags` とペアになります。複数のタグを指定した場合、ローテーションは `pre_tags` と同じ順序に従います。

- `threshold(Float)`

    ハイライトの「十分な一致」を定義する最小信頼スコア（0.0～1.0）です。セマンティックハイライトは top-k 取得後に項目ごとに適用され、このしきい値を超えてクエリに意味的に一致するセグメントだけが、`pre_tags`/`post_tags` を使用してハイライトされたフラグメントを返します。未設定の場合、しきい値を下回るセグメントは空の結果（`fragments=[], scores=[]`）を返します。

- `highlightOnly(Boolean)`

    `True`（デフォルト）の場合、クエリに意味的に関連する文レベルのフラグメントだけが返されるため、最も関連性の高いコンテキストに集中できます。`False` に設定した場合、その長さがモデルのコンテキスト制限を超えない限り、それらのフラグメントを含む完全な段落が代わりに返されます。ただし、完全な段落が返される場合、`scores` フィールドは意味を持たなくなります。

- `modelDeploymentID(String)`

    意味的推論に使用される、デプロイ済みハイライトモデルの ID です。このモデルは、クエリとドキュメントセグメントの間で意味的類似性がどのように計算されるかを決定します。

- `maxClientBatchSize(Integer)`

    1 回のバッチで処理される項目数を制限します。メモリ使用量と処理スループットを制御するのに役立ちます。

**戻り値の型：**

*SemanticHighlighter*

**戻り値：**

**SemanticHighlighter** のインスタンスです。

**パラメーター：**

- **queries** (*List&lt;String&gt;*) -

    結果内の意味的に関連するテキストセグメントを特定するために使用される検索クエリです。

- **inputFields** (*List&lt;String&gt;*) -

    検索結果内でハイライトするスキーマテキストフィールドです。

- **preTags** (*List&lt;String&gt;*) -

    各一致セグメントの前に挿入されるタグです。複数のタグは一致順にローテーションされます。

- **postTags** (*List&lt;String&gt;*) -

    各一致セグメントの後に挿入されるタグで、pre-tags とペアになります。

- **threshold** (*Float*) -

    セグメントをハイライトするための最小信頼スコア（0.0～1.0）です。

- **highlightOnly** (*Boolean*) -

    完全な段落ではなく、文レベルで関連するフラグメントだけを返すかどうかです。

- **modelDeploymentID** (*String*) -

    意味的推論に使用される、デプロイ済みハイライトモデルの ID です。

- **maxClientBatchSize** (*Integer*) -

    1 回のバッチで処理される項目の最大数です。

## 例\{#examples}

密なベクトル検索で、意味的に関連するテキストをハイライトします。

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

検索結果には、ハイライトされたフラグメントとその信頼スコアを含む `highlight` フィールドが含まれます。

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

`threshold` を使用して、信頼度の低いハイライトをフィルタリングします。

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
