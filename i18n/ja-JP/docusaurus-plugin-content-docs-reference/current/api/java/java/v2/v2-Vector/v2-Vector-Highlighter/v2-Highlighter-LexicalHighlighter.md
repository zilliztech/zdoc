---
title: "LexicalHighlighter | Java | v2"
slug: /java/java/v2-Highlighter-LexicalHighlighter
sidebar_label: "LexicalHighlighter"
beta: false
added_since: v2.6.x
last_modified: v3.0.x
deprecate_since: false
notebook: false
description: "LexicalHighlighter インスタンスは、検索結果のテキストフィールドに対する後処理の用語ハイライトを設定します。ハイライトは、カスタマイズ可能なタグを使用して一致した範囲に注釈を付け、読みやすさと UI レンダリングを向上させるためのフラグメントベースのスニペットを返すことができます。取得、フィルタリング、ランキング、スコアリングには影響しません。 | Java | v2"
type: docx
token: VNw2dXf4wopDtYxVSvlc21aDn2g
sidebar_position: 2
keywords: 
  - Zilliz データベース
  - 非構造化データ
  - ベクトルデータベース
  - IVF
  - zilliz
  - Zilliz Cloud
  - クラウド
  - LexicalHighlighter
  - javaV230
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# LexicalHighlighter

LexicalHighlighter インスタンスは、検索結果のテキストフィールドに対する後処理の用語ハイライトを設定します。ハイライトは、カスタマイズ可能なタグを使用して一致した範囲に注釈を付け、読みやすさと UI レンダリングを向上させるためのフラグメントベースのスニペットを返すことができます。取得、フィルタリング、ランキング、スコアリングには影響しません。

```java
io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter
```

## コンストラクター\{#constructor}

このコンストラクターは、新しい `LexicalHighlighter` インスタンスを初期化します。

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

**ビルダーメソッド:**

- `highlightQueries(List<HighlightQuery>)`

    テキストベースのフィルターからのどのクエリ語をハイライトするかを定義します。各エントリは `HighlightQuery` インスタンスである必要があります。

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

    未設定の場合、フィルタリング用語はハイライトされません。

    詳細は、Text Highlighter を参照してください。

- `highlightSearchText(Boolean)`

    BM25 全文検索で使用される検索語をハイライトするかどうか。true の場合、BM25 クエリ語がハイライト対象語のソースとして使用されます。未設定の場合、BM25 検索語はハイライトされません。

- `preTags(List<String>)`

    返されるハイライト内で、一致した各用語の前に挿入されるタグです。プレーン文字列（例: `{`）または HTML セーフなマーカー（例: &lt;em>、&lt;mark>）をサポートします。複数のタグを指定した場合、タグは一致ごとに順番にローテーションされます。

- `postTags(List<String>)`

    一致した各用語の後に挿入されるタグで、`pre_tags` と組み合わせて使用します。複数のタグを指定した場合、ローテーションは pre_tags と同じ順序に従います。

- `fragmentOffset(Integer)`

    フラグメントベースの出力を返すときに、最初に一致したハイライトの前にコンテキストとして保持する先頭文字数です。デフォルトの動作では、先頭に追加のコンテキストは保持されません。

- `fragmentSize(Integer)`

    返される各フラグメントの最大長（文字数）です。ハイライターは、フラグメントの長さをこのサイズ程度に制限します。

- `numOfFragments(Integer)`

    1 つのテキスト値に対して返すフラグメントの最大数です。未設定の場合、複数のフラグメントが返されます（実装のデフォルトです。一般的な値については、例を参照してください）。

**戻り値の型:**

*LexicalHighlighter*

**戻り値:**

**LexicalHighlighter** インスタンス。

**パラメーター:**

- **highlightQueries** (*List&lt;HighlightQuery&gt;*) -

    ハイライトするクエリ語です。各エントリは、テキストベースのフィルターからマークする用語を選択する **HighlightQuery** インスタンスです。

- **highlightSearchText** (*Boolean*) -

    BM25 検索語をハイライト対象語のソースとして使用するかどうか。

- **preTags** (*List&lt;String&gt;*) -

    一致した各用語の前に挿入されるタグです。複数のタグは、一致ごとに順番にローテーションされます。

- **postTags** (*List&lt;String&gt;*) -

    一致した各用語の後に挿入されるタグで、pre タグと組み合わせて使用します。

- **fragmentOffset** (*Integer*) -

    フラグメントベースの出力で、最初にハイライトされた一致の前にコンテキストとして保持される先頭文字数。

- **fragmentSize** (*Integer*) -

    返される各フラグメントの最大長（文字数）。

- **numOfFragments** (*Integer*) -

    テキスト値ごとに返されるフラグメントの最大数。

## 例\{#example}

BM25 全文検索で検索語をハイライトします。

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

Text Match でクエリ語をハイライトします。

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
