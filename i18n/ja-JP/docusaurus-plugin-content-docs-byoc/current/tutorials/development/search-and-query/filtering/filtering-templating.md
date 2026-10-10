---
title: "フィルターテンプレート | BYOC"
slug: /filtering-templating
sidebar_label: "テンプレート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、多数の要素を含む複雑なフィルター式、特に CJK 文字のような非 ASCII 文字を含むものは、クエリ性能に大きな影響を与える可能性があります。これに対処するため、Zilliz Cloud では、複雑な式の解析に費やす時間を削減して効率を向上させるよう設計されたフィルター式テンプレート化メカニズムを導入しています。このページでは、search、query、および delete 操作でフィルター式テンプレート化を使用する方法について説明します。 | BYOC"
type: origin
token: TumJwDYrhiDYcUkKsUIcuSnbnCf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フィルターテンプレート

Zilliz Cloud では、多数の要素を含む複雑なフィルター式、特に CJK 文字のような非 ASCII 文字を含むものは、クエリ性能に大きな影響を与える可能性があります。これに対処するため、Zilliz Cloud では、複雑な式の解析に費やす時間を削減して効率を向上させるよう設計されたフィルター式テンプレート化メカニズムを導入しています。このページでは、search、query、および delete 操作でフィルター式テンプレート化を使用する方法について説明します。

<Admonition type="info" title="Notes">

フィルタリング式の左辺にあるリテラルには、以下の例で使用されている `age`、`city` などのコレクションフィールド名、または `filter = 'struct[0][subfield] > {var}'` のように特定の要素インデックスにある StructArray サブフィールドの名前を指定できます。 

StructArray フィールドにおけるスカラーフィルタリングの詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## 概要\{#overview}

フィルター式テンプレート化を使用すると、クエリ実行時に値へ動的に置き換えられるプレースホルダー付きのフィルター式を作成できます。テンプレート化を使うことで、大きな配列や複雑な式を直接フィルターに埋め込む必要がなくなり、解析時間を短縮してクエリ性能を向上させることができます。

たとえば、`age` と `city` という 2 つのフィールドを含むフィルター式があり、年齢が 25 より大きく、かつ "北京"（Beijing）または "上海"（Shanghai）に住んでいるすべての人を見つけたいとします。値をフィルター式に直接埋め込む代わりに、テンプレートを使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.*;

String filter = "age > {age} AND city IN {city}";
Map<String, Object> filterTemplateValues = new HashMap<>();
filterTemplateValues.put("age", 25);
filterTemplateValues.put("city", Arrays.asList("北京", "上海"));
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > {age} AND city IN {city}"
filterTemplates := map[string]any{
    "age":  25,
    "city": []string{"北京", "上海"},
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let filter = "age > {age} AND city IN {city}";
let filter_templates: HashMap<String, FilterTemplateValue> = HashMap::from([
    ("age".into(), FilterTemplateValue::Int64(25)),
    ("city".into(), FilterTemplateValue::StringArray(vec!["北京".to_string(), "上海".to_string()])),
]);
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "age > {age} AND city IN {city}";
std::unordered_map<std::string, nlohmann::json> filterTemplates = {
    {"age", 25},
    {"city", nlohmann::json::array({"北京", "上海"})}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = "age > {age} AND city IN {city}";
const exprValues = { age: 25, city: ["北京", "上海"] };
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

filter="age > {age} AND city IN {city}"
filter_params='{"age": 25, "city": ["北京", "上海"]}'
```

</TabItem>
</Tabs>

ここで、`{age}` と `{city}` はプレースホルダーであり、クエリ実行時に `filter_params` 内の実際の値に置き換えられます。

Zilliz Cloud でフィルター式テンプレート化を使用することには、いくつかの重要な利点があります。

- **解析時間の短縮**: 大きいまたは複雑なフィルター式をプレースホルダーに置き換えることで、システムがフィルターを解析および処理する時間を削減できます。

- **クエリ性能の向上**: 解析オーバーヘッドが減ることでクエリ性能が向上し、より高い QPS とより速い応答時間が実現します。

- **スケーラビリティ**: データセットが大きくなり、フィルター式がより複雑になっても、テンプレート化によって性能を効率的かつスケーラブルに維持できます。

## 検索操作\{#search-operations}

Zilliz Cloud の search 操作では、`filter` 式を使用してフィルタリング条件を定義し、`filter_params` パラメーターを使用してプレースホルダーの値を指定します。`filter_params` ディクショナリには、Zilliz Cloud がフィルター式に代入する動的な値が含まれます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.search(
    "hello_milvus",
    [[0.1, 0.2]],
    filter=expr,
    limit=10,
    output_fields=["age", "city"],
    search_params={"params": {"search_list": 100}},
    filter_params=filter_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.request.data.FloatVec;
import io.milvus.v2.service.vector.response.SearchResp;
import java.util.*;

String expr = "age > {age} AND city IN {city}";
Map<String, Object> filterTemplateValues = new HashMap<>();
filterTemplateValues.put("age", 25);
filterTemplateValues.put("city", Arrays.asList("北京", "上海"));

SearchReq searchReq = SearchReq.builder()
        .collectionName("hello_milvus")
        .data(Collections.singletonList(new FloatVec(new float[]{0.1f, 0.2f})))
        .filter(expr)
        .topK(10)
        .outputFields(Arrays.asList("age", "city"))
        .filterTemplateValues(filterTemplateValues)
        .build();

SearchResp searchResp = client.search(searchReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/entity"
    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

expr := "age > {age} AND city IN {city}"

resultSets, err := client.Search(ctx, milvusclient.NewSearchOption(
    "hello_milvus", // collectionName
    10,             // limit
    []entity.Vector{entity.FloatVector([]float32{0.1, 0.2})},
).WithANNSField("vector").
    WithFilter(expr).
    WithTemplateParam("age", 25).
    WithTemplateParam("city", []string{"北京", "上海"}).
    WithOutputFields("age", "city"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let expr = "age > {age} AND city IN {city}";
let filter_templates: HashMap<String, FilterTemplateValue> = HashMap::from([
    ("age".into(), FilterTemplateValue::Int64(25)),
    ("city".into(), FilterTemplateValue::StringArray(vec!["北京".to_string(), "上海".to_string()])),
]);

let res = client
    .search(
        SearchRequest::builder()
            .collection_name("hello_milvus")
            .vector_field("vector")
            .vectors(SearchVectors::Float(vec![vec![0.1, 0.2]]))
            .filter(expr)
            .limit(10)
            .output_fields(["age", "city"])
            .filter_templates(filter_templates)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::string expr = "age > {age} AND city IN {city}";
std::unordered_map<std::string, nlohmann::json> filterTemplates = {
    {"age", 25},
    {"city", nlohmann::json::array({"北京", "上海"})}
};

auto searchRequest = milvus::SearchRequest()
                         .WithCollectionName("hello_milvus")
                         .WithAnnsField("vector")
                         .WithLimit(10)
                         .WithOutputFields({"age", "city"})
                         .WithFilter(expr)
                         .WithFilterTemplates(std::move(filterTemplates))
                         .AddFloatVector({0.1f, 0.2f});

milvus::SearchResponse searchResponse;
client->Search(searchRequest, searchResponse);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const expr = "age > {age} AND city IN {city}";
const exprValues = { age: 25, city: ["北京", "上海"] };

const res = await client.search({
    collection_name: "hello_milvus",
    data: [[0.1, 0.2]],
    filter: expr,
    limit: 10,
    output_fields: ["age", "city"],
    exprValues
});
```

</TabItem>

<TabItem value='bash'>

```bash
filter="age > {age} AND city IN {city}"
filter_params='{"age": 25, "city": ["北京", "上海"]}'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "hello_milvus",
      "data": [[0.1, 0.2]],
      "annsField": "vector",
      "limit": 10,
      "filter": "age > {age} AND city IN {city}",
      "exprParams": {"age": 25, "city": ["北京", "上海"]},
      "outputFields": ["age", "city"]
  }'
```

</TabItem>
</Tabs>

この例では、Zilliz Cloud は search の実行時に `{age}` を `25` に、`{city}` を `["北京", "上海"]` に動的に置き換えます。

## クエリ操作\{#query-operations}

同じテンプレート化メカニズムは、Zilliz Cloud の query 操作にも適用できます。`query` 関数では、フィルター式を定義し、`filter_params` を使用して置き換える値を指定します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.query(
    "hello_milvus",
    filter=expr,
    output_fields=["age", "city"],
    filter_params=filter_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

String expr = "age > {age} AND city IN {city}";
Map<String, Object> filterTemplateValues = new HashMap<>();
filterTemplateValues.put("age", 25);
filterTemplateValues.put("city", Arrays.asList("北京", "上海"));

QueryReq queryReq = QueryReq.builder()
        .collectionName("hello_milvus")
        .filter(expr)
        .outputFields(Arrays.asList("age", "city"))
        .filterTemplateValues(filterTemplateValues)
        .build();

QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

expr := "age > {age} AND city IN {city}"

resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("hello_milvus").
    WithFilter(expr).
    WithTemplateParam("age", 25).
    WithTemplateParam("city", []string{"北京", "上海"}).
    WithOutputFields("age", "city"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let expr = "age > {age} AND city IN {city}";
let filter_templates: HashMap<String, FilterTemplateValue> = HashMap::from([
    ("age".into(), FilterTemplateValue::Int64(25)),
    ("city".into(), FilterTemplateValue::StringArray(vec!["北京".to_string(), "上海".to_string()])),
]);

let res = client
    .query(
        QueryRequest::builder()
            .collection_name("hello_milvus")
            .filter(expr)
            .output_fields(["age", "city"])
            .filter_templates(filter_templates)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::string expr = "age > {age} AND city IN {city}";
std::unordered_map<std::string, nlohmann::json> filterTemplates = {
    {"age", 25},
    {"city", nlohmann::json::array({"北京", "上海"})}
};

auto queryRequest = milvus::QueryRequest()
                         .WithCollectionName("hello_milvus")
                         .WithFilter(expr)
                         .WithOutputFields({"age", "city"})
                         .WithFilterTemplates(std::move(filterTemplates));

milvus::QueryResponse queryResponse;
client->Query(queryRequest, queryResponse);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const expr = "age > {age} AND city IN {city}";
const exprValues = { age: 25, city: ["北京", "上海"] };

const res = await client.query({
    collection_name: "hello_milvus",
    filter: expr,
    output_fields: ["age", "city"],
    exprValues
});
```

</TabItem>

<TabItem value='bash'>

```bash
filter="age > {age} AND city IN {city}"
filter_params='{"age": 25, "city": ["北京", "上海"]}'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "hello_milvus",
      "filter": "age > {age} AND city IN {city}",
      "exprParams": {"age": 25, "city": ["北京", "上海"]},
      "outputFields": ["age", "city"]
  }'
```

</TabItem>
</Tabs>

`filter_params` を使用することで、Zilliz Cloud は値の動的な挿入を効率的に処理し、query 実行速度を向上させます。

## 削除操作\{#delete-operations}

delete 操作でもフィルター式テンプレート化を使用できます。search や query と同様に、`filter` 式で条件を定義し、`filter_params` でプレースホルダー用の動的な値を提供します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.delete(
    "hello_milvus",
    filter=expr,
    filter_params=filter_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.DeleteReq;
import java.util.*;

String expr = "age > {age} AND city IN {city}";
Map<String, Object> filterTemplateValues = new HashMap<>();
filterTemplateValues.put("age", 25);
filterTemplateValues.put("city", Arrays.asList("北京", "上海"));

DeleteReq deleteReq = DeleteReq.builder()
        .collectionName("hello_milvus")
        .filter(expr)
        .filterTemplateValues(filterTemplateValues)
        .build();

client.delete(deleteReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

expr := "age > {age} AND city IN {city}"

result, err := client.Delete(ctx, milvusclient.NewDeleteOption("hello_milvus").
    WithFilter(expr).
    WithTemplateParam("age", 25).
    WithTemplateParam("city", []string{"北京", "上海"}))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let expr = "age > {age} AND city IN {city}";
let filter_templates: HashMap<String, FilterTemplateValue> = HashMap::from([
    ("age".into(), FilterTemplateValue::Int64(25)),
    ("city".into(), FilterTemplateValue::StringArray(vec!["北京".to_string(), "上海".to_string()])),
]);

let res = client
    .delete(
        DeleteRequest::builder()
            .collection_name("hello_milvus")
            .filter(expr)
            .filter_templates(filter_templates)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::string expr = "age > {age} AND city IN {city}";
std::unordered_map<std::string, nlohmann::json> filterTemplates = {
    {"age", 25},
    {"city", nlohmann::json::array({"北京", "上海"})}
};

auto deleteRequest = milvus::DeleteRequest()
                         .WithCollectionName("hello_milvus")
                         .WithFilter(expr)
                         .WithFilterTemplates(std::move(filterTemplates));

milvus::DeleteResponse deleteResponse;
client->Delete(deleteRequest, deleteResponse);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const expr = "age > {age} AND city IN {city}";
const exprValues = { age: 25, city: ["北京", "上海"] };

const res = await client.delete({
    collection_name: "hello_milvus",
    filter: expr,
    exprValues
});
```

</TabItem>

<TabItem value='bash'>

```bash
filter="age > {age} AND city IN {city}"
filter_params='{"age": 25, "city": ["北京", "上海"]}'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "hello_milvus",
      "filter": "age > {age} AND city IN {city}",
      "exprParams": {"age": 25, "city": ["北京", "上海"]}
  }'
```

</TabItem>
</Tabs>

このアプローチは、特に複雑なフィルター条件を扱う場合に、delete 操作の性能を向上させます。

## 正規表現フィルターテンプレート\{#regex-filter-templates}

正規表現フィルターでもフィルター式テンプレート化を使用できます。これは、正規表現パターンがリクエスト時に提供される場合に便利です。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "message =~ {pattern}"
filter_params = {"pattern": "E[0-9]{4}"}
res = client.query(
    "hello_milvus",
    filter=expr,
    output_fields=["message"],
    filter_params=filter_params,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.*;

String expr = "message =~ {pattern}";
Map<String, Object> filterTemplateValues = new HashMap<>();
filterTemplateValues.put("pattern", "E[0-9]{4}");

QueryReq queryReq = QueryReq.builder()
        .collectionName("hello_milvus")
        .filter(expr)
        .outputFields(Arrays.asList("message"))
        .filterTemplateValues(filterTemplateValues)
        .build();

QueryResp queryResp = client.query(queryReq);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "fmt"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

expr := "message =~ {pattern}"

resultSet, err := client.Query(ctx, milvusclient.NewQueryOption("hello_milvus").
    WithFilter(expr).
    WithTemplateParam("pattern", "E[0-9]{4}").
    WithOutputFields("message"))
if err != nil {
    fmt.Println(err.Error())
    // handle error
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let expr = "message =~ {pattern}";
let filter_templates: HashMap<String, FilterTemplateValue> = HashMap::from([
    ("pattern".into(), FilterTemplateValue::String("E[0-9]{4}".to_string())),
]);

let res = client
    .query(
        QueryRequest::builder()
            .collection_name("hello_milvus")
            .filter(expr)
            .output_fields(["message"])
            .filter_templates(filter_templates)
            .build()?,
    )
    .await?;
```

</TabItem>

<TabItem value='c++'>

```c++
std::string expr = "message =~ {pattern}";
std::unordered_map<std::string, nlohmann::json> filterTemplates = {
    {"pattern", "E[0-9]{4}"}
};

auto queryRequest = milvus::QueryRequest()
                         .WithCollectionName("hello_milvus")
                         .WithFilter(expr)
                         .WithOutputFields({"message"})
                         .WithFilterTemplates(std::move(filterTemplates));

milvus::QueryResponse queryResponse;
client->Query(queryRequest, queryResponse);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const expr = "message =~ {pattern}";
const exprValues = { pattern: "E[0-9]{4}" };

const res = await client.query({
    collection_name: "hello_milvus",
    filter: expr,
    output_fields: ["message"],
    exprValues
});
```

</TabItem>

<TabItem value='bash'>

```bash
filter="message =~ {pattern}"
filter_params='{"pattern": "E[0-9]{4}"}'

curl --request POST \
  --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
  --header "Authorization: Bearer ${TOKEN}" \
  --header "Content-Type: application/json" \
  --data '{
      "collectionName": "hello_milvus",
      "filter": "message =~ {pattern}",
      "exprParams": {"pattern": "E[0-9]{4}"},
      "outputFields": ["message"]
  }'
```

</TabItem>
</Tabs>

`!~` でもテンプレートパラメーターを使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "message !~ {pattern}"
filter_params = {"pattern": "^DEBUG"}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.*;

String expr = "message !~ {pattern}";
Map<String, Object> filterTemplateValues = new HashMap<>();
filterTemplateValues.put("pattern", "^DEBUG");
```

</TabItem>

<TabItem value='go'>

```go
expr := "message !~ {pattern}"
filterTemplates := map[string]any{
    "pattern": "^DEBUG",
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let expr = "message !~ {pattern}";
let filter_templates: HashMap<String, FilterTemplateValue> = HashMap::from([
    ("pattern".into(), FilterTemplateValue::String("^DEBUG".to_string())),
]);
```

</TabItem>

<TabItem value='c++'>

```c++
std::string expr = "message !~ {pattern}";
std::unordered_map<std::string, nlohmann::json> filterTemplates = {
    {"pattern", "^DEBUG"}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const expr = "message !~ {pattern}";
const exprValues = { pattern: "^DEBUG" };
```

</TabItem>

<TabItem value='bash'>

```bash
filter="message !~ {pattern}"
filter_params='{"pattern": "^DEBUG"}'
```

</TabItem>
</Tabs>

テンプレート値は、有効な RE2 正規表現パターンを含む文字列である必要があります。Zilliz Cloud はフィルターを実行する前にそのパターンを検証します。

フィルターテンプレートでは、正規表現パターンをフィルター式に連結するのではなく、値として渡します。これにより、式解析のオーバーヘッドが削減され、パターンに引用符や演算子が含まれている場合でも誤ってフィルター構造が変更されるのを防げます。

## まとめ\{#conclusion}

フィルター式テンプレート化は、Zilliz Cloud におけるクエリ性能最適化のための重要なツールです。プレースホルダーと `filter_params` ディクショナリを使用することで、複雑なフィルター式の解析に費やす時間を大幅に削減できます。これにより、クエリ実行が高速化され、全体的な性能が向上します。
