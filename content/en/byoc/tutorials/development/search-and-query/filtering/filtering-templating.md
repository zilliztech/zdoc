---
title: "Filter Templating | BYOC"
slug: /filtering-templating
sidebar_label: "Template"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "In Zilliz Cloud, complex filter expressions with numerous elements, especially those involving non-ASCII characters like CJK characters, can significantly affect query performance. To address this, Zilliz Cloud introduces a filter expression templating mechanism designed to improve efficiency by reducing the time spent parsing complex expressions. This page explains using filter expression templating in search, query, and delete operations. | BYOC"
type: origin
token: TumJwDYrhiDYcUkKsUIcuSnbnCf
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Filter Templating

In Zilliz Cloud, complex filter expressions with numerous elements, especially those involving non-ASCII characters like CJK characters, can significantly affect query performance. To address this, Zilliz Cloud introduces a filter expression templating mechanism designed to improve efficiency by reducing the time spent parsing complex expressions. This page explains using filter expression templating in search, query, and delete operations.

<Admonition type="info" title="Notes">

The literal on the left-hand side of a filtering expression can either be a collection field name, such as `age`, `city`, etc., used in examples below, or the name of a StructArray subfield at a specific element index, as in `filter = 'struct[0][subfield] > {var}'`. 

For details on scalar filtering in a StructArray field, refer to [StructArray Operators](./struct-array-filtering).

</Admonition>

## Overview\{#overview}

Filter expression templating allows you to create filter expressions with placeholders that are dynamically substituted with values during query execution. Using templating, you avoid embedding large arrays or complex expressions directly into the filter, reducing parsing time and improving query performance.

Let's say you have a filter expression involving two fields, `age` and `city`, and you want to find all people whose age is greater than 25 and who live in either "北京" (Beijing) or "上海" (Shanghai). Instead of directly embedding the values in the filter expression, you can use a template:

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

Here, `{age}` and `{city}` are placeholders that will be replaced with the actual values in `filter_params` when the query is executed.

Using filter expression templating in Zilliz Cloud has several key advantages:

- **Reduced Parsing Time**: By replacing large or complex filter expressions with placeholders, the system spends less time parsing and processing the filter.

- **Improved Query Performance**: With reduced parsing overhead, query performance improves, leading to higher QPS and faster response times.

- **Scalability**: As your datasets grow and filter expressions become more complex, templating ensures that performance remains efficient and scalable.

## Search Operations\{#search-operations}

For search operations in Zilliz Cloud, the `filter` expression is used to define the filtering condition, and the `filter_params` parameter is used to specify the values for the placeholders. The `filter_params` dictionary contains the dynamic values that Zilliz Cloud will use to substitute into the filter expression.

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

In this example, Zilliz Cloud will dynamically replace `{age}` with `25` and `{city}` with `["北京", "上海"]` when executing the search.

## Query Operations\{#query-operations}

The same templating mechanism can be applied to query operations in Zilliz Cloud. In the `query` function, you define the filter expression and use the `filter_params` to specify the values to substitute.

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

By using `filter_params`, Zilliz Cloud efficiently handles the dynamic insertion of values, improving the speed of query execution.

## Delete Operations\{#delete-operations}

You can also use filter expression templating in delete operations. Similar to search and query, the `filter` expression defines the conditions, and the `filter_params` provides the dynamic values for the placeholders.

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

This approach improves the performance of delete operations, especially when dealing with complex filter conditions.

## Regex filter templates\{#regex-filter-templates}

You can use filter expression templating with regex filters. This is useful when the regex pattern is provided at request time.

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

You can also use template parameters with `!~`:

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

The template value must be a string containing a valid RE2 regex pattern. Zilliz Cloud validates the pattern before executing the filter.

Filter templates pass the regex pattern as a value instead of concatenating it into the filter expression. This reduces expression parsing overhead and avoids accidentally changing the filter structure when the pattern contains quotes or operators.

## Conclusion\{#conclusion}

Filter expression templating is an essential tool for optimizing query performance in Zilliz Cloud. By using placeholders and the `filter_params` dictionary, you can significantly reduce the time spent parsing complex filter expressions. This leads to faster query execution and better overall performance.