---
title: "过滤表达式模板 | Cloud"
slug: /filtering-templating
sidebar_label: "过滤表达式模板"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "在 Zilliz Cloud 中，具有众多元素的复杂过滤表达式，特别是那些涉及非ASCII字符（如CJK字符）的表达式，会显着影响查询性能。为了解决这个问题，Zilliz Cloud 引入了一种过滤表达式模板机制，旨在通过减少解析复杂表达式所花费的时间来提高效率。本页解释了在搜索、查询和删除操作中使用过滤表达式模板。 | Cloud"
type: origin
token: V0Tkw5vEJit4TYkKcEGcAwwanwB
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 过滤表达式模板

在 Zilliz Cloud 中，具有众多元素的复杂过滤表达式，特别是那些涉及非ASCII字符（如CJK字符）的表达式，会显着影响查询性能。为了解决这个问题，Zilliz Cloud 引入了一种过滤表达式模板机制，旨在通过减少解析复杂表达式所花费的时间来提高效率。本页解释了在搜索、查询和删除操作中使用过滤表达式模板。

<Admonition type="info" title="说明">

过滤表达式左侧的字面量可以是 Collection Field 名称，例如以下示例中使用的 `age`、`city` 等；也可以是特定元素索引处的 StructArray 子字段名称，例如 `filter = 'struct[0][subfield] > {var}'`。

有关在 StructArray Field 中进行标量过滤的详细信息，请参阅 [StructArray 操作符](./struct-array-filtering)。

</Admonition>

## 概述\{#overview}

过滤表达式模板允许您使用占位符创建过滤表达式，并在查询执行过程中动态地用具体值替换这些占位符。使用模板可以避免直接 Embedding 大型数组或复杂表达式，从而缩短解析时间并提升查询性能。

假设你有一个包含两个字段的过滤表达式，年龄和城市，你想找到所有年龄大于25且居住在“北京”或“上海”的人。你可以使用模板来代替直接嵌入过滤表达式中的值：

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
// Note: filter expression templating is not yet supported in milvus-sdk-go.
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
filter="age > {age} AND city IN {city}"
filter_params='{"age": 25, "city": ["北京", "上海"]}'
```

</TabItem>
</Tabs>

在这里，`{age}`和`{city}`是占位符，将在执行查询时替换为`filter_params`中的实际值。

在 Zilliz Cloud 中使用过滤表达式模板有几个关键优势：

- **减少解析时间**：通过用占位符替换大型或复杂的过滤表达式，系统花费更少的时间解析和处理过滤器。

- **改进的查询性能**：减少了解析开销，提高了查询性能，从而提高了QPS和更快的响应时间。

- **可扩展性**：随着数据集的增长和过滤表达式变得更加复杂，模板可确保性能保持高效和可扩展。

## 搜索操作\{#search-operations}

对于 Zilliz Cloud 中的搜索操作，过滤表达式用于定义过滤条件，`filter_params`参数用于指定占位符的值。`filter_params`字典包含 Zilliz Cloud 将用于替换到过滤表达式中的动态值。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > {age} AND city IN {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
res = client.search(
    "hello_milvus",
    vectors[:nq],
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
// Note: filter expression templating is not yet supported in milvus-sdk-go.
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

在此示例中，Zilliz Cloud 将在执行搜索时动态地将`{age}`替换为`25`，将`{city}`替换为`["北京"，"上海"]`。

## 查询操作\{#query-operations}

相同的模板机制可以应用于 Zilliz Cloud 中的查询操作。在Query 方法中，您定义过滤表达式并使用`filter_params`指定要替换的值。

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
// Note: filter expression templating is not yet supported in milvus-sdk-go.
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

通过使用`filter_params`，Zilliz Cloud 有效地处理值的动态插入，提高了查询执行的速度。

## 删除操作\{#delete-operations}

您还可以在删除操作中使用过滤表达式模板。与搜索和查询类似，过滤表达式定义条件，`filter_params`为占位符提供动态值。

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
// Note: filter expression templating is not yet supported in milvus-sdk-go.
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

这种方法提高了删除操作的性能，尤其是在处理复杂的过滤条件时。

## 正则表达式过滤模板\{#regex-filter-templates}

您可以将过滤表达式模板与正则表达式过滤条件结合使用。当正则表达式模式在请求时提供时，此功能尤其有用。

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
// Note: filter expression templating is not yet supported in milvus-sdk-go.
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

您还可以将模板参数与 `!~` 结合使用：

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
// Note: filter expression templating is not yet supported in milvus-sdk-go.
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

模板值必须是包含有效 RE2 正则表达式模式的字符串。Zilliz Cloud 会在执行过滤操作前验证该模式。

过滤模板会将正则表达式模式作为值传递，而不是将其拼接到过滤表达式中。这样既能降低表达式解析开销，也能避免模式包含引号或操作符时意外改变过滤表达式的结构。

## 小结\{#conclusion}

过滤表达式模板是 Zilliz Cloud 中优化查询性能的必备工具。通过使用占位符和`filter_params`字典，您可以显著减少解析复杂过滤表达式所花费的时间。这导致更快的查询执行和更好的整体性能。