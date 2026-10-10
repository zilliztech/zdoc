---
title: "フィルターテンプレート | Cloud"
slug: /filtering-templating
sidebar_label: "テンプレート"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud では、要素の多い複雑なフィルター式、特に CJK 文字などの非 ASCII 文字を含むフィルター式は、クエリのパフォーマンスに大きな影響を与える可能性があります。これに対処するため、Zilliz Cloud は、複雑な式の解析にかかる時間を削減して効率を高めるフィルター式テンプレートの仕組みを導入しました。このページでは、検索、クエリ、削除の各操作でフィルター式テンプレートを使用する方法について説明します。 | Cloud"
type: origin
token: TumJwDYrhiDYcUkKsUIcuSnbnCf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フィルターテンプレート

Zilliz Cloud では、要素の多い複雑なフィルター式、特に CJK 文字などの非 ASCII 文字を含むフィルター式は、クエリのパフォーマンスに大きく影響する可能性があります。これに対処するため、Zilliz Cloud では、複雑な式の解析にかかる時間を削減して効率を高めるフィルター式テンプレートの仕組みを導入しています。このページでは、検索、クエリ、削除の各操作でフィルター式テンプレートを使用する方法について説明します。

<Admonition type="info" title="Notes">

フィルター式の左辺のリテラルには、以下の例で使用されている `age`、`city` などのコレクションのフィールド名、または `filter = 'struct[0][subfield] > {var}'` のように特定の要素インデックスにある StructArray サブフィールドの名前を指定できます。 

StructArray フィールドでのスカラーフィルタリングの詳細については、[StructArray Operators](./struct-array-filtering) を参照してください。

</Admonition>

## 概要\{#overview}

フィルター式テンプレートを使用すると、クエリ実行時に値が動的に置き換えられるプレースホルダーを含むフィルター式を作成できます。テンプレートを使用することで、大きな配列や複雑な式をフィルターに直接埋め込むことを避けられ、解析時間を短縮してクエリのパフォーマンスを向上させます。

`age` と `city` の 2 つのフィールドを含むフィルター式があり、年齢が 25 より大きく、「北京」（Beijing）または「上海」（Shanghai）に住んでいるすべての人を検索したいとします。値をフィルター式に直接埋め込む代わりに、テンプレートを使用できます：

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

ここで、`{age}` と `{city}` は、クエリの実行時に `filter_params` 内の実際の値に置き換えられるプレースホルダーです。

Zilliz Cloud でフィルター式テンプレートを使用すると、いくつかの主な利点があります：

- **解析時間の短縮**: 大きな、または複雑なフィルター式をプレースホルダーに置き換えることで、システムがフィルターの解析と処理に費やす時間が短くなります。

- **クエリパフォーマンスの向上**: 解析のオーバーヘッドが減ることでクエリのパフォーマンスが向上し、QPS の増加と応答時間の短縮につながります。

- **スケーラビリティ**: データセットが増大し、フィルター式がより複雑になっても、テンプレート化によってパフォーマンスを効率的かつスケーラブルに保つことができます。

## 検索操作\{#search-operations}

Zilliz Cloud の検索操作では、`filter` 式を使用してフィルター条件を定義し、`filter_params` パラメーターを使用してプレースホルダーの値を指定します。`filter_params` ディクショナリーには、Zilliz Cloud がフィルター式に代入するために使用する動的な値が含まれます。

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

この例では、Zilliz Cloud は検索の実行時に `{age}` を `25` に、`{city}` を `["北京", "上海"]` に動的に置き換えます。

## クエリ操作\{#query-operations}

同じテンプレートの仕組みは、Zilliz Cloud のクエリ操作にも適用できます。`query` 関数では、フィルター式を定義し、`filter_params` を使用して代入する値を指定します。

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

`filter_params` を使用することで、Zilliz Cloud は値の動的な挿入を効率的に処理し、クエリ実行の速度を向上させます。

## 削除操作\{#delete-operations}

削除操作でもフィルター式テンプレートを使用できます。検索やクエリと同様に、`filter` 式で条件を定義し、`filter_params` でプレースホルダーの動的な値を指定します。

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

このアプローチにより、特に複雑なフィルター条件を扱う場合に、削除操作のパフォーマンスが向上します。

## 正規表現フィルターテンプレート\{#regex-filter-templates}

フィルター式テンプレートは、正規表現フィルターと組み合わせて使用できます。これは、リクエスト時に正規表現パターンが指定される場合に便利です。

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

`!~` と組み合わせてテンプレートパラメーターを使用することもできます：

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

テンプレートの値は、有効な RE2 正規表現パターンを含む文字列である必要があります。Zilliz Cloud は、フィルターを実行する前にパターンを検証します。

フィルターテンプレートは、正規表現パターンをフィルター式に連結するのではなく、値として渡します。これにより、式の解析オーバーヘッドが減り、パターンに引用符や演算子が含まれる場合にフィルター構造を誤って変更することを防ぎます。

## まとめ\{#conclusion}

フィルター式テンプレートは、Zilliz Cloud でクエリのパフォーマンスを最適化するための不可欠なツールです。プレースホルダーと `filter_params` ディクショナリーを使用することで、複雑なフィルター式の解析にかかる時間を大幅に削減できます。これにより、クエリの実行が高速化され、全体的なパフォーマンスが向上します。
