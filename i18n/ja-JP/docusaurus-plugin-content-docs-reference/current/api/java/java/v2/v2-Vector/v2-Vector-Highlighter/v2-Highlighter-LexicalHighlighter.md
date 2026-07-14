---
title: "LexicalHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: false
deprecate_since: false
notebook: false
description: "A `LexicalHighlighter` インスタンスは、検索結果内のテキストフィールドに対する後処理の用語ハイライトを設定します。ハイライトは、一致したスパンにカスタマイズ可能なタグで注釈を付け、可読性と UI レンダリングを向上させるためにフラグメントベースのスニペットを返すことができます。これは、取得、フィルタリング、ランキング、スコアリングには影響しません。 | Java | v2"
type: docx
token: Krd6dVuQbohTF5xFHGYcomHsnEg
sidebar_position: 2
keywords: 
  - Zilliz データベース
  - 非構造化データ
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

`LexicalHighlighter` インスタンスは、検索結果内のテキストフィールドに対する後処理の用語ハイライトを設定します。ハイライトは、一致したスパンにカスタマイズ可能なタグで注釈を付け、可読性と UI レンダリングを向上させるためにフラグメントベースのスニペットを返すことができます。これは、取得、フィルタリング、ランキング、スコアリングには影響しません。

```java
io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter
```

## Constructor\{#constructor}

このコンストラクタは、新しい `LexicalHighlighter` インスタンスを初期化します。

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

    テキストベースのフィルターからどのクエリ用語をハイライトするかを定義します。各エントリは `HighlightQuery` インスタンスである必要があります。

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

    設定されていない場合、フィルタリング用語はハイライトされません。

    詳細については、[Text Highlighter](https://milvus.io/docs/text-highlighter.md) を参照してください。

- `highlightSearchText(Boolean)`

    BM25 全文検索で使用される検索用語をハイライトするかどうかを指定します。True の場合、BM25 クエリ用語がハイライト対象の用語ソースとして使用されます。設定されていない場合、BM25 検索用語はハイライトされません。

- `preTags(List<String>)`

    返されるハイライト内で各一致用語の前に挿入されるタグです。プレーン文字列（例: `{`）または HTML セーフなマーカー（例: `<em>`, `<mark>`）をサポートします。複数のタグが指定された場合、タグは一致シーケンスごとにローテーションされます。

- `postTags(List<String>)`

    各一致用語の後に挿入されるタグで、`pre_tags` と対になります。複数のタグが指定された場合、ローテーションは pre_tags と同じ順序に従います。

- `fragmentOffset(Integer)`

    フラグメントベースの出力を返す際に、最初のハイライト一致の前に保持する先頭コンテキストの文字数です。デフォルトの動作では、追加の先頭コンテキストは保持されません。

- `fragmentSize(Integer)`

    返される各フラグメントの最大長（文字数）です。ハイライターはフラグメント長をおおよそこのサイズに制限します。

- `numOfFragments(Integer)`

    テキスト値ごとに返すフラグメントの最大数です。設定されていない場合、デフォルトは複数フラグメントです（実装依存のデフォルト。一般的な値については Examples を参照してください）。

**RETURN TYPE:**

*LexicalHighlighter*

**RETURNS:**

**LexicalHighlighter** インスタンス。

## Example\{#example}

BM25 全文検索で検索用語をハイライトします。

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

Text Match でクエリ用語をハイライトします。

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
