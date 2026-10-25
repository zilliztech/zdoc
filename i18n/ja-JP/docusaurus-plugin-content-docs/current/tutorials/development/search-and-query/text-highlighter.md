---
title: "Lexical Highlighter | Cloud"
slug: /text-highlighter
sidebar_label: "Lexical Highlighter"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud の Highlighter は、テキストフィールド内で一致した用語をカスタマイズ可能なタグで囲んで注釈を付けます。ハイライトは、ドキュメントが一致した理由の説明、結果の可読性の向上、検索および RAG アプリケーションでのリッチレンダリングのサポートに役立ちます。 | Cloud"
type: origin
token: BJCjwpj8JizP0nkI11uci1pPndh
sidebar_position: 14
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Lexical Highlighter

Zilliz Cloud の Highlighter は、テキストフィールド内で一致した用語をカスタマイズ可能なタグで囲んで注釈を付けます。ハイライトは、ドキュメントが一致した理由の説明、結果の可読性の向上、検索および RAG アプリケーションでのリッチレンダリングのサポートに役立ちます。

ハイライトは、最終的な検索結果セットに対する後処理ステップとして実行されます。候補の取得、フィルタリングロジック、ランキング、スコアリングには影響しません。

Highlighter には、互いに独立した 3 つの制御軸があります。

- **ハイライト対象となる用語**

    ハイライト対象の用語をどこから取得するかを選択できます。たとえば、**BM25 full text search** で使用される検索語や、**テキストベースのフィルタリング式**（`TEXT_MATCH` 条件など）で指定されたクエリ語をハイライトできます。

- **ハイライトされた用語のレンダリング方法**

    一致ごとの前後に挿入するタグを設定することで、ハイライト出力内で一致した用語がどのように表示されるかを制御できます。たとえば、`{}` のような単純なマーカーや、リッチレンダリング用の `<em></em>` のような HTML タグを使用できます。

- **ハイライトされたテキストの返し方**

    フラグメントの開始位置、長さ、返されるフラグメント数など、ハイライト結果をフラグメントとして返す方法を制御できます。

以下のセクションでは、これらのシナリオを順に説明します。

## BM25 full text search における検索語のハイライト\{#search-term-highlighting-in-bm25-full-text-search}

BM25 full text search を実行する際、返された結果内で **検索語** をハイライトして、ドキュメントがクエリに一致した理由を説明しやすくできます。BM25 full text search の詳細については、[フルテキスト検索](./full-text-search) を参照してください。

このシナリオでは、ハイライト対象の用語は BM25 full text search で使用された検索語から直接取得されます。Highlighter はこれらの用語を使用して、最終結果内の一致したテキストに注釈を付けます。

次の内容がテキストフィールドに保存されているとします。

```plaintext
Milvus supports full text search. Use BM25 for keyword relevance. Filters can narrow results.
```

**Highlighter の設定**

BM25 full text search で検索語をハイライトするには、`LexicalHighlighter` を作成し、BM25 full text search 用の検索語ハイライトを有効にします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],              # Tag inserted before each highlighted term
    post_tags=["}"],             # Tag inserted after each highlighted term
    highlight_search_text=True   # Enable search term highlighting for BM25 full text search
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import java.util.*;

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .highlightSearchText(true)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .highlight_search_text(true);
```

</TabItem>

<TabItem value='c++'>

```c++
auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->WithHighlightSearchText(true);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_search_text: true,
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var highlighter = new SearchParameters
{
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",            // Tag inserted before each highlighted term
        ["post_tags"] = "[\"}\"]",           // Tag inserted after each highlighted term
        ["highlight_search_text"] = "true"   // Enable search term highlighting for BM25 full text search
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

この例では次のようになります。

- `pre_tags` と `post_tags` は、出力内でハイライトされたテキストがどのように表示されるかを制御します。この場合、一致した用語は `{}` で囲まれます（例: `{term}`）。複数のタグをリストとして指定することもできます（例: `["<b>", "<i>"]`）。複数の用語がハイライトされる場合、タグは順番に適用され、一致シーケンスに応じてローテーションされます。

- `highlight_search_text=True` は、Zilliz Cloud に対して、BM25 full text search の検索語をハイライト対象用語のソースとして使用するよう指示します。

Highlighter オブジェクトを作成したら、その設定を BM25 full text search リクエストに適用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
results = client.search(
    collection_name="highlighter_demo",
    data=["BM25"],      # Search term used in BM25 full text search
    search_params={"metric_type": "BM25"},
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import io.milvus.v2.common.IndexParam;
import java.util.*;

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .highlightSearchText(true)
        .build();

SearchReq searchReq = SearchReq.builder()
        .collectionName("highlighter_demo")
        .data(Collections.singletonList(new EmbeddedText("BM25")))
        .annsField("sparse_vector")
        .topK(10)
        .outputFields(Collections.singletonList("text"))
        .metricType(IndexParam.MetricType.BM25)
        .highlighter(highlighter)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .highlight_search_text(true);

let res = client
    .search(
        SearchRequest::builder()
            .collection_name("highlighter_demo")
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec!["BM25".to_string()]))
            .limit(10)
            .metric_type(MetricType::Bm25)
            .output_fields(["text"])
            .highlighter(highlighter)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->WithHighlightSearchText(true);

auto request = milvus::SearchRequest()
    .WithCollectionName("highlighter_demo")
    .WithAnnsField("sparse_vector")
    .WithLimit(10)
    .AddOutputField("text")
    .AddEmbeddedText("BM25")
    .WithHighlighter(highlighter);

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_search_text: true,
};

const res = await client.search({
    collection_name: "highlighter_demo",
    data: ["BM25"],
    anns_field: "sparse_vector",
    limit: 10,
    output_fields: ["text"],
    highlighter,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var highlighter = new SearchParameters
{
    OutputFields = { "text" },
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",
        ["post_tags"] = "[\"}\"]",
        ["highlight_search_text"] = "true"
    }
};

var results = await client.SearchAsync(new SearchReq
{
    CollectionName = "highlighter_demo",
    VectorFieldName = "sparse_vector",
    Texts = new[] { "BM25" },        // Search term used in BM25 full text search
    MetricType = MetricType.Bm25,
    Limit = 10,
    Parameters = highlighter         // Pass highlighter config here
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

**ハイライト出力**

ハイライトが有効な場合、Zilliz Cloud は専用の `highlight` フィールドにハイライト済みテキストを返します。デフォルトでは、ハイライト出力は最初に一致した用語から始まるフラグメントとして返されます。

この例では、検索語が `"BM25"` であるため、返された結果ではそれがハイライトされます。

```json
{
    ...,
    "highlight": {
        "text": [
            "{BM25} for keyword relevance. Filters can narrow results."
        ]
    }
}
```

返されるフラグメントの位置、長さ、数を制御するには、[ハイライトされたテキストをフラグメントとして返す](./text-highlighter#fragment-based-highlighting-output) を参照してください。

## フィルタリングにおけるクエリ語のハイライト\{#query-term-highlighting-in-filtering}

検索語のハイライトに加えて、テキストベースのフィルタリング式で使用される用語もハイライトできます。

<Admonition type="info" title="Notes">

現在、クエリ語のハイライトでサポートされているフィルタリング条件は `TEXT_MATCH` のみです。詳細については、[テキストマッチ](./text-match) を参照してください。

</Admonition>

このシナリオでは、ハイライト対象の用語はテキストベースのフィルタリング式から取得されます。フィルタリングはどのドキュメントが一致するかを決定し、Highlighter は一致したテキスト範囲に注釈を付けます。

次の内容がテキストフィールドに保存されているとします。

```plaintext
This document explains how text filtering works in Milvus.
```

**Highlighter の設定**

フィルタリングで使用されるクエリ語をハイライトするには、`LexicalHighlighter` を作成し、フィルタリング条件に対応する `highlight_query` を定義します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],              # Tag inserted before each highlighted term
    post_tags=["}"],             # Tag inserted after each highlighted term
    highlight_query=[{
        "type": "TextMatch",     # Text filtering type
        "field": "text",         # Target text field
        "text": "text filtering" # Terms to highlight
    }]
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import java.util.*;

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .addHighlightQuery(new LexicalHighlighter.HighlightQuery("TextMatch", "text", "text filtering"))
        .build();
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .add_highlight_query(HighlightQuery::new()
        .query_type("TextMatch")
        .field("text")
        .text("text filtering"));
```

</TabItem>

<TabItem value='c++'>

```c++
auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->AddHighlightQuery("TextMatch", "text", "text filtering");
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_query: [
        { type: "TextMatch", field: "text", text: "text filtering" },
    ],
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var highlighter = new SearchParameters
{
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",                       // Tag inserted before each highlighted term
        ["post_tags"] = "[\"}\"]",                      // Tag inserted after each highlighted term
        ["highlight_query"] = "[{\"type\":\"TextMatch\",\"field\":\"text\",\"text\":\"text filtering\"}]"
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

この設定では次のようになります。

- `pre_tags` と `post_tags` は、出力内でハイライトされたテキストがどのように表示されるかを制御します。この場合、一致した用語は `{}` で囲まれます（例: `{term}`）。複数のタグをリストとして指定することもできます（例: `["<b>", "<i>"]`）。複数の用語がハイライトされる場合、タグは順番に適用され、一致シーケンスに応じてローテーションされます。

- `highlight_query` は、どのフィルタリング用語をハイライトするかを定義します。

Highlighter オブジェクトを作成したら、同じフィルタリング式と Highlighter の設定を検索リクエストに適用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
results = client.search(
    collection_name="highlighter_demo",
    data=["BM25"],
    filter='TEXT_MATCH(text, "text filtering")',
    search_params={"metric_type": "BM25"},
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import io.milvus.v2.common.IndexParam;
import java.util.*;

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .addHighlightQuery(new LexicalHighlighter.HighlightQuery("TextMatch", "text", "text filtering"))
        .build();

SearchReq searchReq = SearchReq.builder()
        .collectionName("highlighter_demo")
        .data(Collections.singletonList(new EmbeddedText("BM25")))
        .annsField("sparse_vector")
        .filter("TEXT_MATCH(text, \"text filtering\")")
        .topK(10)
        .outputFields(Collections.singletonList("text"))
        .metricType(IndexParam.MetricType.BM25)
        .highlighter(highlighter)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .add_highlight_query(HighlightQuery::new()
        .query_type("TextMatch")
        .field("text")
        .text("text filtering"));

let res = client
    .search(
        SearchRequest::builder()
            .collection_name("highlighter_demo")
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec!["BM25".to_string()]))
            .filter(r#"TEXT_MATCH(text, "text filtering")"#)
            .limit(10)
            .metric_type(MetricType::Bm25)
            .output_fields(["text"])
            .highlighter(highlighter)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->AddHighlightQuery("TextMatch", "text", "text filtering");

auto request = milvus::SearchRequest()
    .WithCollectionName("highlighter_demo")
    .WithAnnsField("sparse_vector")
    .WithFilter(R"(TEXT_MATCH(text, "text filtering"))")
    .WithLimit(10)
    .AddOutputField("text")
    .AddEmbeddedText("BM25")
    .WithHighlighter(highlighter);

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_query: [
        { type: "TextMatch", field: "text", text: "text filtering" },
    ],
};

const res = await client.search({
    collection_name: "highlighter_demo",
    data: ["BM25"],
    anns_field: "sparse_vector",
    filter: 'TEXT_MATCH(text, "text filtering")',
    limit: 10,
    output_fields: ["text"],
    highlighter,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var highlighter = new SearchParameters
{
    OutputFields = { "text" },
    Expression = "TEXT_MATCH(text, \"text filtering\")",
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",
        ["post_tags"] = "[\"}\"]",
        ["highlight_query"] = "[{\"type\":\"TextMatch\",\"field\":\"text\",\"text\":\"text filtering\"}]"
    }
};

var results = await client.SearchAsync(new SearchReq
{
    CollectionName = "highlighter_demo",
    VectorFieldName = "sparse_vector",
    Texts = new[] { "BM25" },
    MetricType = MetricType.Bm25,
    Limit = 10,
    Parameters = highlighter
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

**ハイライト出力**

フィルタリング用のクエリ語ハイライトが有効な場合、Zilliz Cloud は専用の `highlight` フィールドにハイライト済みテキストを返します。デフォルトでは、ハイライト出力は最初に一致した用語から始まるフラグメントとして返されます。

この例では、最初に一致した用語は `"text"` であるため、返されるハイライト済みテキストはその位置から始まります。

```json
{
    ...,
    "highlight": {
        "text": [
            "{text} {filtering} works in Milvus."
        ]
    }
}
```

返されるフラグメントの位置、長さ、数を制御するには、[ハイライトされたテキストをフラグメントとして返す](./text-highlighter#fragment-based-highlighting-output) を参照してください。

## フラグメントベースのハイライト出力\{#fragment-based-highlighting-output}

デフォルトでは、Zilliz Cloud は最初に一致した用語から始まるフラグメントとしてハイライト済みテキストを返します。フラグメント関連の設定を使用すると、どの用語をハイライトするかを変更せずに、フラグメントの返し方をさらに制御できます。

次の内容がテキストフィールドに保存されているとします。

```plaintext
Milvus supports full text search. Use BM25 for keyword relevance. Filters can narrow results.
```

**Highlighter の設定**

ハイライトフラグメントの形を制御するには、`LexicalHighlighter` でフラグメント関連のオプションを設定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import LexicalHighlighter

highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
    fragment_offset=5,     # Number of characters to reserve before the first matched term
    fragment_size=60,      # Max. length of each fragment to return
    num_of_fragments=1     # Max. number of fragments to return
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import java.util.*;

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .highlightSearchText(true)
        .fragmentOffset(5)
        .fragmentSize(60)
        .numOfFragments(1)
        .build();
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .highlight_search_text(true)
    .fragment_offset(5)
    .fragment_size(60)
    .num_of_fragments(1);
```

</TabItem>

<TabItem value='c++'>

```c++
auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->WithHighlightSearchText(true);
highlighter->WithFragmentOffset(5);
highlighter->WithFragmentSize(60);
highlighter->WithNumOfFragments(1);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_search_text: true,
    fragment_offset: 5,
    fragment_size: 60,
    num_of_fragments: 1,
};
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var highlighter = new SearchParameters
{
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",
        ["post_tags"] = "[\"}\"]",
        ["highlight_search_text"] = "true",
        ["fragment_offset"] = "5",      // Number of characters to reserve before the first matched term
        ["fragment_size"] = "60",       // Max. length of each fragment to return
        ["num_of_fragments"] = "1"      // Max. number of fragments to return
    }
};
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

この設定では次のようになります。

- `fragment_offset` は、最初にハイライトされた用語の前に先行コンテキストを確保します。

- `fragment_size` は、各フラグメントに含めるテキスト量を制限します。

- `num_of_fragments` は、返されるフラグメント数を制御します。

Highlighter オブジェクトを作成したら、Highlighter の設定を検索リクエストに適用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
results = client.search(
    collection_name="highlighter_demo",
    data=["BM25"],
    search_params={"metric_type": "BM25"},
    # highlight-next-line
    highlighter=highlighter # Pass highlighter config here
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import io.milvus.v2.common.IndexParam;
import java.util.*;

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .highlightSearchText(true)
        .build();

SearchReq searchReq = SearchReq.builder()
        .collectionName("highlighter_demo")
        .data(Collections.singletonList(new EmbeddedText("BM25")))
        .annsField("sparse_vector")
        .topK(10)
        .outputFields(Collections.singletonList("text"))
        .metricType(IndexParam.MetricType.BM25)
        .highlighter(highlighter)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .highlight_search_text(true);

let res = client
    .search(
        SearchRequest::builder()
            .collection_name("highlighter_demo")
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec!["BM25".to_string()]))
            .limit(10)
            .metric_type(MetricType::Bm25)
            .output_fields(["text"])
            .highlighter(highlighter)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->WithHighlightSearchText(true);

auto request = milvus::SearchRequest()
    .WithCollectionName("highlighter_demo")
    .WithAnnsField("sparse_vector")
    .WithLimit(10)
    .AddOutputField("text")
    .AddEmbeddedText("BM25")
    .WithHighlighter(highlighter);

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_search_text: true,
};

const res = await client.search({
    collection_name: "highlighter_demo",
    data: ["BM25"],
    anns_field: "sparse_vector",
    limit: 10,
    output_fields: ["text"],
    highlighter,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var highlighter = new SearchParameters
{
    OutputFields = { "text" },
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",
        ["post_tags"] = "[\"}\"]",
        ["highlight_search_text"] = "true",
        ["fragment_offset"] = "5",
        ["fragment_size"] = "60",
        ["num_of_fragments"] = "1"
    }
};

var results = await client.SearchAsync(new SearchReq
{
    CollectionName = "highlighter_demo",
    VectorFieldName = "sparse_vector",
    Texts = new[] { "BM25" },
    MetricType = MetricType.Bm25,
    Limit = 10,
    Parameters = highlighter
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

**ハイライト出力**

フラグメントベースのハイライトが有効な場合、Zilliz Cloud は `highlight` フィールドにハイライト済みテキストをフラグメントとして返します。

```json
{
    ...,
    "highlight": {
        "text": [
            "Use {BM25} for keyword relevance. Filters can narrow results."
        ]
    }
}
```

この出力では次のようになります。

- `fragment_offset` が設定されているため、フラグメントは `{BM25}` から正確に始まるわけではありません。

- `num_of_fragments` が 1 であるため、返されるフラグメントは 1 つだけです。

- フラグメントの長さは `fragment_size` によって上限が設定されます。

## 例\{#examples}

### 事前準備\{#preparation}

Highlighter を使用する前に、コレクションが適切に設定されていることを確認してください。

以下の例では、BM25 full text search と `TEXT_MATCH` クエリをサポートするコレクションを作成し、その後サンプルドキュメントを挿入します。

<details>

<summary><strong>コレクションを準備する</strong></summary>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
from pymilvus import (
    MilvusClient,
    DataType,
    Function,
    FunctionType,
    LexicalHighlighter,
)

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")
COLLECTION_NAME = "highlighter_demo"

# Clean up existing collection
if client.has_collection(COLLECTION_NAME):
    client.drop_collection(COLLECTION_NAME)

# Define schema
schema = client.create_schema(enable_dynamic_field=False)
schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True, auto_id=True)
schema.add_field(
    field_name="text",
    datatype=DataType.VARCHAR,
    max_length=2000,
    enable_analyzer=True,  # Required for BM25
    enable_match=True,     # Required for TEXT_MATCH
)
schema.add_field(field_name="sparse_vector", datatype=DataType.SPARSE_FLOAT_VECTOR)

# Add BM25 function
schema.add_function(Function(
    name="text_bm25",
    function_type=FunctionType.BM25,
    input_field_names=["text"],
    output_field_names=["sparse_vector"],
))

# Create index
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="sparse_vector",
    index_type="SPARSE_INVERTED_INDEX",
    metric_type="BM25",
    params={"inverted_index_algo": "DAAT_MAXSCORE", "bm25_k1": 1.2, "bm25_b": 0.75},
)

client.create_collection(collection_name=COLLECTION_NAME, schema=schema, index_params=index_params)

# Insert sample documents
docs = [
    "my first test doc",
    "my second test doc",
    "my first test doc. Milvus is an open-source vector database built for GenAI applications.",
    "my second test doc. Milvus is an open-source vector database that suits AI applications "
    "of every size from running a demo chatbot to building web-scale search.",
]
client.insert(collection_name=COLLECTION_NAME, data=[{"text": t} for t in docs])
print(f"✓ Collection created with {len(docs)} documents\n")

# Helper for search params
SEARCH_PARAMS = {"metric_type": "BM25", "params": {"drop_ratio_search": 0.0}}

# Expected output:
# ✓ Collection created with 4 documents
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.common.clientenum.FunctionType;
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq.Function;
import io.milvus.v2.service.collection.request.DropCollectionReq;
import io.milvus.v2.service.collection.request.HasCollectionReq;
import io.milvus.v2.service.vector.request.InsertReq;
import com.google.gson.JsonObject;
import java.util.*;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());
String COLLECTION_NAME = "highlighter_demo";

if (client.hasCollection(HasCollectionReq.builder().collectionName(COLLECTION_NAME).build())) {
    client.dropCollection(DropCollectionReq.builder().collectionName(COLLECTION_NAME).build());
}

CreateCollectionReq.CollectionSchema schema = client.createSchema();
schema.addField(AddFieldReq.builder()
        .fieldName("id")
        .dataType(DataType.Int64)
        .isPrimaryKey(true)
        .autoID(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("text")
        .dataType(DataType.VarChar)
        .maxLength(2000)
        .enableAnalyzer(true)
        .enableMatch(true)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("sparse_vector")
        .dataType(DataType.SparseFloatVector)
        .build());
schema.addFunction(Function.builder()
        .functionType(FunctionType.BM25)
        .name("text_bm25")
        .inputFieldNames(Collections.singletonList("text"))
        .outputFieldNames(Collections.singletonList("sparse_vector"))
        .build());

IndexParam indexParam = IndexParam.builder()
        .fieldName("sparse_vector")
        .indexType(IndexParam.IndexType.SPARSE_INVERTED_INDEX)
        .metricType(IndexParam.MetricType.BM25)
        .build();

client.createCollection(CreateCollectionReq.builder()
        .collectionName(COLLECTION_NAME)
        .collectionSchema(schema)
        .indexParams(Collections.singletonList(indexParam))
        .build());

List<String> docs = Arrays.asList(
        "my first test doc",
        "my second test doc",
        "my first test doc. Milvus is an open-source vector database built for GenAI applications.",
        "my second test doc. Milvus is an open-source vector database that suits AI applications of every size from running a demo chatbot to building web-scale search."
);
List<JsonObject> rows = new ArrayList<>();
for (String doc : docs) {
    JsonObject row = new JsonObject();
    row.addProperty("text", doc);
    rows.add(row);
}
client.insert(InsertReq.builder().collectionName(COLLECTION_NAME).data(rows).build());
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let client = ClientV2::new(&ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT")).await?;
const COLLECTION_NAME: &str = "highlighter_demo";

if client.has_collection(HasCollectionRequest::builder().collection_name(COLLECTION_NAME).build()?).await?.exists() {
    client.drop_collection(DropCollectionRequest::builder().collection_name(COLLECTION_NAME).build()?).await?;
}

let schema = CollectionSchema::new()
    .add_field(FieldSchema::new().name("id").data_type(DataType::Int64).primary_key(true).auto_id(true))
    .add_field(FieldSchema::new().name("text").data_type(DataType::VarChar).max_length(2000).enable_analyzer(true).enable_match(true))
    .add_field(FieldSchema::new().name("sparse_vector").data_type(DataType::SparseFloatVector))
    .add_function(Function::new().name("text_bm25").function_type(FunctionType::Bm25).input_fields(["text"]).output_fields(["sparse_vector"]));

let index_param = IndexParam::new()
    .field_name("sparse_vector")
    .index_type(IndexType::SparseInvertedIndex)
    .metric_type(MetricType::Bm25)
    .extra_params(HashMap::from([
        ("inverted_index_algo".into(), "DAAT_MAXSCORE".into()),
        ("bm25_k1".into(), "1.2".into()),
        ("bm25_b".into(), "0.75".into()),
    ]));

client
    .create_collection(
        CreateCollectionRequest::builder()
            .collection_name(COLLECTION_NAME)
            .schema(schema)
            .index_param(index_param)
            .build()?,
    )
    .await?;

// insert + SEARCH_PARAMS (see full text search guide)
```

</TabItem>

<TabItem value='c++'>

```c++
#include "milvus/MilvusClientV2.h"
#include <iostream>

auto client = milvus::MilvusClientV2::Create();
auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT"));

const std::string COLLECTION_NAME = "highlighter_demo";
if (client->HasCollection(COLLECTION_NAME)) {
    client->DropCollection(COLLECTION_NAME);
}

milvus::CreateCollectionRequest request;
request.WithCollectionName(COLLECTION_NAME);
request.AddField(milvus::FieldSchema("id", milvus::DataType::INT64, "", true, true));
request.AddField(milvus::FieldSchema("text", milvus::DataType::VARCHAR, "", false, false, 2000));
request.AddField(milvus::FieldSchema("sparse_vector", milvus::DataType::SPARSE_FLOAT_VECTOR, "", false, false));
request.AddFunction(milvus::FunctionSchema("text_bm25", milvus::FunctionType::BM25, {"text"}, {"sparse_vector"}));

status = client->CreateCollection(request);
if (!status.IsOk()) {
    std::cerr << status.Message() << std::endl;
}

// index + insert + SEARCH_PARAMS (see full text search guide)
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT" });
const COLLECTION_NAME = "highlighter_demo";

if (await client.hasCollection({ collection_name: COLLECTION_NAME })) {
    await client.dropCollection({ collection_name: COLLECTION_NAME });
}

await client.createCollection({
    collection_name: COLLECTION_NAME,
    schema: [
        { name: "id", data_type: DataType.Int64, is_primary_key: true, auto_id: true },
        { name: "text", data_type: DataType.VarChar, max_length: 2000, enable_analyzer: true, enable_match: true },
        { name: "sparse_vector", data_type: DataType.SparseFloatVector },
    ],
    functions: [
        {
            name: "text_bm25",
            type: "BM25",
            input_field_names: ["text"],
            output_field_names: ["sparse_vector"],
        },
    ],
    index_params: [
        {
            field_name: "sparse_vector",
            index_type: "SPARSE_INVERTED_INDEX",
            metric_type: "BM25",
            params: { inverted_index_algo: "DAAT_MAXSCORE", bm25_k1: 1.2, bm25_b: 0.75 },
        },
    ],
});

const docs = [
    "my first test doc",
    "my second test doc",
    "my first test doc. Milvus is an open-source vector database built for GenAI applications.",
    "my second test doc. Milvus is an open-source vector database that suits AI applications of every size from running a demo chatbot to building web-scale search.",
];
await client.insert({ collection_name: COLLECTION_NAME, data: docs.map(text => ({ text })) });

const SEARCH_PARAMS = { params: { drop_ratio_search: 0.0 } };
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

var client = new MilvusClientV2(new ConnectConfig { Uri = "YOUR_CLUSTER_ENDPOINT" });
const string collectionName = "highlighter_demo";

// Clean up existing collection
if ((await client.HasCollectionAsync(new HasCollectionReq { CollectionName = collectionName })).Has)
{
    await client.DropCollectionAsync(new DropCollectionReq { CollectionName = collectionName });
}

// Define schema
var schema = new CollectionSchema { Name = collectionName };
schema.Fields.Add(new FieldSchema("id", DataType.Int64, isPrimaryKey: true, autoId: true));
schema.Fields.Add(FieldSchema.CreateVarchar("text", maxLength: 2000, enableAnalyzer: true, enableMatch: true));
schema.Fields.Add(new FieldSchema("sparse_vector", DataType.SparseFloatVector));
schema.Functions.Add(FunctionSchema.CreateBm25("text_bm25", "text", "sparse_vector"));

// Create collection and index
await client.CreateCollectionAsync(new CreateCollectionReq
{
    CollectionName = collectionName,
    Schema = schema,
    Indexes = new[] { new IndexParam("sparse_vector", null, IndexType.SparseInvertedIndex, MetricType.Bm25)
    {
        ExtraParams = { ["inverted_index_algo"] = "DAAT_MAXSCORE", ["bm25_k1"] = "1.2", ["bm25_b"] = "0.75" }
    } }
});

// Insert sample documents
string[] docs =
[
    "my first test doc",
    "my second test doc",
    "my first test doc. Milvus is an open-source vector database built for GenAI applications.",
    "my second test doc. Milvus is an open-source vector database that suits AI applications of every size from running a demo chatbot to building web-scale search."
];
await client.InsertAsync(new InsertReq
{
    CollectionName = collectionName,
    RowsData = docs.Select(text => (IDictionary<string, object?>)new Dictionary<string, object?> { ["text"] = text }).ToList()
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

</details>

### 例 1: BM25 full text search で検索語をハイライトする\{#example-1-highlight-search-terms-in-bm25-full-text-search}

この例では、BM25 full text search で検索語をハイライトする方法を示します。

- BM25 full text search は `"test"` を検索語として使用します

- Highlighter は "test" のすべての出現箇所を `{` と `}` タグで囲みます

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,  # Highlight BM25 query terms
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["test"],
    anns_field="sparse_vector",
    limit=10,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for hit in results[0]:
    print(f"  {hit.get('highlight', {}).get('text', {}).get('fragments', [])}")
print()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import io.milvus.v2.common.IndexParam;
import java.util.*;

String COLLECTION_NAME = "highlighter_demo";

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .highlightSearchText(true)
        .build();

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("test")))
        .annsField("sparse_vector")
        .topK(10)
        .outputFields(Collections.singletonList("text"))
        .metricType(IndexParam.MetricType.BM25)
        .highlighter(highlighter)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .highlight_search_text(true);

let res = client
    .search(
        SearchRequest::builder()
            .collection_name(COLLECTION_NAME)
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec!["test".to_string()]))
            .limit(10)
            .metric_type(MetricType::Bm25)
            .output_fields(["text"])
            .highlighter(highlighter)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
const std::string COLLECTION_NAME = "highlighter_demo";

auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->WithHighlightSearchText(true);

auto request = milvus::SearchRequest()
    .WithCollectionName(COLLECTION_NAME)
    .WithAnnsField("sparse_vector")
    .WithLimit(10)
    .AddOutputField("text")
    .AddEmbeddedText("test")
    .WithHighlighter(highlighter);

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";
const COLLECTION_NAME = "highlighter_demo";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_search_text: true,
};

const res = await client.search({
    collection_name: COLLECTION_NAME,
    data: ["test"],
    anns_field: "sparse_vector",
    limit: 10,
    output_fields: ["text"],
    highlighter,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

const string collectionName = "highlighter_demo";

var highlighter = new SearchParameters
{
    OutputFields = { "text" },
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",
        ["post_tags"] = "[\"}\"]",
        ["highlight_search_text"] = "true"   // Highlight BM25 query terms
    }
};

var results = await client.SearchAsync(new SearchReq
{
    CollectionName = collectionName,
    VectorFieldName = "sparse_vector",
    Texts = new[] { "test" },
    MetricType = MetricType.Bm25,
    Limit = 10,
    Parameters = highlighter
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

<details>

<summary>期待される出力</summary>

```plaintext
['{test} doc']
['{test} doc']
['{test} doc. Milvus is an open-source vector database built for GenAI applications.']
['{test} doc. Milvus is an open-source vector database that suits AI applications of every size from run']
```

</details>

### 例 2: フィルタリングでクエリ語をハイライトする\{#example-2-highlight-query-terms-in-filtering}

この例では、`TEXT_MATCH` フィルターに一致した用語をハイライトする方法を示します。

- BM25 full text search は `"test"` をクエリ語として使用します

- `queries` パラメーターは `"my doc"` をハイライト対象リストに追加します

- Highlighter は、一致したすべての用語（`"my"`、`"test"`、`"doc"`）を `{` と `}` で囲みます

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,   # Also highlight BM25 term
    highlight_query=[                     # Additional TEXT_MATCH terms to highlight
        {"type": "TextMatch", "field": "text", "text": "my doc"},
    ],
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["test"],
    anns_field="sparse_vector",
    limit=10,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for hit in results[0]:
    print(f"  {hit.get('highlight', {}).get('text', {}).get('fragments', [])}")
print()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import io.milvus.v2.common.IndexParam;
import java.util.*;

String COLLECTION_NAME = "highlighter_demo";

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .highlightSearchText(true)
        .addHighlightQuery(new LexicalHighlighter.HighlightQuery("TextMatch", "text", "my doc"))
        .build();

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("test")))
        .annsField("sparse_vector")
        .topK(10)
        .outputFields(Collections.singletonList("text"))
        .metricType(IndexParam.MetricType.BM25)
        .highlighter(highlighter)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .highlight_search_text(true)
    .add_highlight_query(HighlightQuery::new()
        .query_type("TextMatch")
        .field("text")
        .text("my doc"));

let res = client
    .search(
        SearchRequest::builder()
            .collection_name(COLLECTION_NAME)
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec!["test".to_string()]))
            .limit(10)
            .metric_type(MetricType::Bm25)
            .output_fields(["text"])
            .highlighter(highlighter)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
const std::string COLLECTION_NAME = "highlighter_demo";

auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->WithHighlightSearchText(true);
highlighter->AddHighlightQuery("TextMatch", "text", "my doc");

auto request = milvus::SearchRequest()
    .WithCollectionName(COLLECTION_NAME)
    .WithAnnsField("sparse_vector")
    .WithLimit(10)
    .AddOutputField("text")
    .AddEmbeddedText("test")
    .WithHighlighter(highlighter);

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";
const COLLECTION_NAME = "highlighter_demo";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_search_text: true,
    highlight_query: [
        { type: "TextMatch", field: "text", text: "my doc" },
    ],
};

const res = await client.search({
    collection_name: COLLECTION_NAME,
    data: ["test"],
    anns_field: "sparse_vector",
    limit: 10,
    output_fields: ["text"],
    highlighter,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

const string collectionName = "highlighter_demo";

var highlighter = new SearchParameters
{
    OutputFields = { "text" },
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",
        ["post_tags"] = "[\"}\"]",
        ["highlight_search_text"] = "true",   // Also highlight BM25 term
        ["highlight_query"] = "[{\"type\":\"TextMatch\",\"field\":\"text\",\"text\":\"my doc\"}]"
    }
};

var results = await client.SearchAsync(new SearchReq
{
    CollectionName = collectionName,
    VectorFieldName = "sparse_vector",
    Texts = new[] { "test" },
    MetricType = MetricType.Bm25,
    Limit = 10,
    Parameters = highlighter
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

<details>

<summary>期待される出力</summary>

```plaintext
['{my} first {test} {doc}']
['{my} second {test} {doc}']
['{my} first {test} {doc}. Milvus is an open-source vector database built for GenAI applications.']
['{my} second {test} {doc}. Milvus is an open-source vector database that suits AI applications of every siz']
```

</details>

### 例 3: ハイライトをフラグメントとして返す\{#example-3-return-highlights-as-fragments}

この例では、クエリが `"Milvus"` を検索し、以下の設定でハイライトフラグメントを返します。

- `fragment_offset` は、最初のハイライト範囲の前に最大 20 文字の先行コンテキストを保持します（デフォルトは 0）。

- `fragment_size` は、各フラグメントを約 60 文字に制限します（デフォルトは 100）。

- `num_of_fragments` は、各テキスト値に対して返されるフラグメント数を制限します（デフォルトは 5）。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
    fragment_offset=20,  # Keep 20 chars before match
    fragment_size=60,    # Max ~60 chars per fragment
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["Milvus"],
    anns_field="sparse_vector",
    limit=10,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for i, hit in enumerate(results[0]):
    frags = hit.get('highlight', {}).get('text', {}).get('fragments', [])
    print(f"  Doc {i+1}: {frags}")
print()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import io.milvus.v2.common.IndexParam;
import java.util.*;

String COLLECTION_NAME = "highlighter_demo";

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .highlightSearchText(true)
        .fragmentOffset(20)
        .fragmentSize(60)
        .build();

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("Milvus")))
        .annsField("sparse_vector")
        .topK(10)
        .outputFields(Collections.singletonList("text"))
        .metricType(IndexParam.MetricType.BM25)
        .highlighter(highlighter)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .highlight_search_text(true)
    .fragment_offset(20)
    .fragment_size(60);

let res = client
    .search(
        SearchRequest::builder()
            .collection_name(COLLECTION_NAME)
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec!["Milvus".to_string()]))
            .limit(10)
            .metric_type(MetricType::Bm25)
            .output_fields(["text"])
            .highlighter(highlighter)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
const std::string COLLECTION_NAME = "highlighter_demo";

auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->WithHighlightSearchText(true);
highlighter->WithFragmentOffset(20);
highlighter->WithFragmentSize(60);

auto request = milvus::SearchRequest()
    .WithCollectionName(COLLECTION_NAME)
    .WithAnnsField("sparse_vector")
    .WithLimit(10)
    .AddOutputField("text")
    .AddEmbeddedText("Milvus")
    .WithHighlighter(highlighter);

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";
const COLLECTION_NAME = "highlighter_demo";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_search_text: true,
    fragment_offset: 20,
    fragment_size: 60,
};

const res = await client.search({
    collection_name: COLLECTION_NAME,
    data: ["Milvus"],
    anns_field: "sparse_vector",
    limit: 10,
    output_fields: ["text"],
    highlighter,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

const string collectionName = "highlighter_demo";

var highlighter = new SearchParameters
{
    OutputFields = { "text" },
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",
        ["post_tags"] = "[\"}\"]",
        ["highlight_search_text"] = "true",
        ["fragment_offset"] = "20",   // Keep 20 chars before match
        ["fragment_size"] = "60"      // Max ~60 chars per fragment
    }
};

var results = await client.SearchAsync(new SearchReq
{
    CollectionName = collectionName,
    VectorFieldName = "sparse_vector",
    Texts = new[] { "Milvus" },
    MetricType = MetricType.Bm25,
    Limit = 10,
    Parameters = highlighter
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

<details>

<summary>期待される出力</summary>

```plaintext
Doc 1: ['my first test doc. {Milvus} is an open-source vector database ']
Doc 2: ['my second test doc. {Milvus} is an open-source vector database']
```

</details>

### 例 4: マルチクエリのハイライト\{#example-4-multi-query-highlighting}

BM25 full text search で複数のクエリを使用して検索する場合、各クエリの結果はそれぞれ独立してハイライトされます。1 つ目のクエリの結果にはその検索語のハイライトが含まれ、2 つ目のクエリの結果にはその検索語のハイライトが含まれ、以降も同様です。各クエリは同じ `highlighter` 設定を使用しますが、独立して適用されます。

以下の例では次のようになります。

- 1 つ目のクエリは、その結果セット内で `"test"` をハイライトします

- 2 つ目のクエリは、その結果セット内で `"Milvus"` をハイライトします

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["{"],
    post_tags=["}"],
    highlight_search_text=True,
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["test", "Milvus"],  # Two queries
    anns_field="sparse_vector",
    limit=2,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for nq_idx, hits in enumerate(results):
    query_term = ["test", "Milvus"][nq_idx]
    print(f"  Query '{query_term}':")
    for hit in hits:
        print(f"    {hit.get('highlight', {}).get('text', {}).get('fragments', [])}")
print()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import io.milvus.v2.common.IndexParam;
import java.util.*;

String COLLECTION_NAME = "highlighter_demo";

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("{"))
        .postTags(Arrays.asList("}"))
        .highlightSearchText(true)
        .build();

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Arrays.asList(new EmbeddedText("test"), new EmbeddedText("Milvus")))
        .annsField("sparse_vector")
        .topK(10)
        .outputFields(Collections.singletonList("text"))
        .metricType(IndexParam.MetricType.BM25)
        .highlighter(highlighter)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["{"])
    .post_tags(["}"])
    .highlight_search_text(true);

let res = client
    .search(
        SearchRequest::builder()
            .collection_name(COLLECTION_NAME)
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec!["test".to_string(), "Milvus".to_string()]))
            .limit(10)
            .metric_type(MetricType::Bm25)
            .output_fields(["text"])
            .highlighter(highlighter)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
const std::string COLLECTION_NAME = "highlighter_demo";

auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"{"});
highlighter->WithPostTags({"}"});
highlighter->WithHighlightSearchText(true);

auto request = milvus::SearchRequest()
    .WithCollectionName(COLLECTION_NAME)
    .WithAnnsField("sparse_vector")
    .WithLimit(10)
    .AddOutputField("text")
    .AddEmbeddedText("test")
    .AddEmbeddedText("Milvus")
    .WithHighlighter(highlighter);

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";
const COLLECTION_NAME = "highlighter_demo";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["{"],
    post_tags: ["}"],
    highlight_search_text: true,
};

const res = await client.search({
    collection_name: COLLECTION_NAME,
    data: ["test", "Milvus"],
    anns_field: "sparse_vector",
    limit: 10,
    output_fields: ["text"],
    highlighter,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

const string collectionName = "highlighter_demo";

var highlighter = new SearchParameters
{
    OutputFields = { "text" },
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"{\"]",
        ["post_tags"] = "[\"}\"]",
        ["highlight_search_text"] = "true"
    }
};

var results = await client.SearchAsync(new SearchReq
{
    CollectionName = collectionName,
    VectorFieldName = "sparse_vector",
    Texts = new[] { "test", "Milvus" },   // Two queries
    MetricType = MetricType.Bm25,
    Limit = 2,
    Parameters = highlighter
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

<details>

<summary>期待される出力</summary>

```plaintext
Query 'test':
  ['{test} doc']
  ['{test} doc']
Query 'Milvus':
  ['{Milvus} is an open-source vector database built for GenAI applications.']
  ['{Milvus} is an open-source vector database that suits AI applications of every size from running a dem']
```

</details>

### 例 5: カスタム HTML タグ\{#example-5-custom-html-tags}

ハイライトには、Web UI 向けの HTML-safe なタグなど、任意のタグを使用できます。これは、ブラウザーで検索結果をレンダリングする際に便利です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"},{"label":"Zilliz CLI","value":"shell"}]}>
<TabItem value='python'>

```python
# highlight-start
highlighter = LexicalHighlighter(
    pre_tags=["<mark>"],
    post_tags=["</mark>"],
    highlight_search_text=True,
)
# highlight-end

results = client.search(
    collection_name=COLLECTION_NAME,
    data=["test"],
    anns_field="sparse_vector",
    limit=2,
    search_params=SEARCH_PARAMS,
    output_fields=["text"],
    # highlight-next-line
    highlighter=highlighter,
)

for hit in results[0]:
    print(f"  {hit.get('highlight', {}).get('text', {}).get('fragments', [])}")
print()
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.EmbeddedText;
import io.milvus.v2.service.vector.response.SearchResp;
import io.milvus.v2.service.vector.request.highlighter.LexicalHighlighter;
import io.milvus.v2.common.IndexParam;
import java.util.*;

String COLLECTION_NAME = "highlighter_demo";

LexicalHighlighter highlighter = LexicalHighlighter.builder()
        .preTags(Arrays.asList("<mark>"))
        .postTags(Arrays.asList("</mark>"))
        .highlightSearchText(true)
        .build();

SearchReq searchReq = SearchReq.builder()
        .collectionName(COLLECTION_NAME)
        .data(Collections.singletonList(new EmbeddedText("test")))
        .annsField("sparse_vector")
        .topK(10)
        .outputFields(Collections.singletonList("text"))
        .metricType(IndexParam.MetricType.BM25)
        .highlighter(highlighter)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
// Note: the highlighter is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

let highlighter = LexicalHighlighter::new()
    .pre_tags(["<mark>"])
    .post_tags(["</mark>"])
    .highlight_search_text(true);

let res = client
    .search(
        SearchRequest::builder()
            .collection_name(COLLECTION_NAME)
            .vector_field("sparse_vector")
            .vectors(SearchVectors::EmbeddedText(vec!["test".to_string()]))
            .limit(10)
            .metric_type(MetricType::Bm25)
            .output_fields(["text"])
            .highlighter(highlighter)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
const std::string COLLECTION_NAME = "highlighter_demo";

auto highlighter = std::make_shared<milvus::LexicalHighlighter>();
highlighter->WithPreTags({"<mark>"});
highlighter->WithPostTags({"</mark>"});
highlighter->WithHighlightSearchText(true);

auto request = milvus::SearchRequest()
    .WithCollectionName(COLLECTION_NAME)
    .WithAnnsField("sparse_vector")
    .WithLimit(10)
    .AddOutputField("text")
    .AddEmbeddedText("test")
    .WithHighlighter(highlighter);

milvus::SearchResponse response;
auto status = client->Search(request, response);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { HighlightType } from "@zilliz/milvus2-sdk-node";
const COLLECTION_NAME = "highlighter_demo";

const highlighter = {
    type: HighlightType.Lexical,
    pre_tags: ["<mark>"],
    post_tags: ["</mark>"],
    highlight_search_text: true,
};

const res = await client.search({
    collection_name: COLLECTION_NAME,
    data: ["test"],
    anns_field: "sparse_vector",
    limit: 10,
    output_fields: ["text"],
    highlighter,
});
```

</TabItem>

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Collection;
using Milvus.Client.V2.Requests.Dml;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Requests.Index;
using Milvus.Client.V2.Types;

const string collectionName = "highlighter_demo";

var highlighter = new SearchParameters
{
    OutputFields = { "text" },
    HighlightType = HighlightType.Lexical,
    Highlighter =
    {
        ["pre_tags"] = "[\"<mark>\"]",
        ["post_tags"] = "[\"</mark>\"]",
        ["highlight_search_text"] = "true"
    }
};

var results = await client.SearchAsync(new SearchReq
{
    CollectionName = collectionName,
    VectorFieldName = "sparse_vector",
    Texts = new[] { "test" },
    MetricType = MetricType.Bm25,
    Limit = 2,
    Parameters = highlighter
});
```

</TabItem>

<TabItem value='bash'>

```bash
# Note: the highlighter is not yet supported in the RESTful API.
```

</TabItem>

<TabItem value='shell'>

```shell
# Zilliz CLI 
```

</TabItem>
</Tabs>

<details>

<summary>期待される出力</summary>

```plaintext
['<mark>test</mark> doc']
['<mark>test</mark> doc']
```

</details>
