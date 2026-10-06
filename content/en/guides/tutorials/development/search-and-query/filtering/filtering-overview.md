---
title: "Filtering Explained | Cloud"
slug: /filtering-overview
sidebar_label: "Overview"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud provides powerful filtering capabilities that enable precise querying of your data. Filter expressions allow you to target specific scalar fields and refine search results with different conditions. This guide explains how to use filter expressions in Zilliz Cloud clusters, with examples focused on query operations. You can also apply these filters in search and delete requests. | Cloud"
type: origin
token: AIb1wNAE3iiKVSk8MHAcVA4QnJb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Filtering Explained

Zilliz Cloud provides powerful filtering capabilities that enable precise querying of your data. Filter expressions allow you to target specific scalar fields and refine search results with different conditions. This guide explains how to use filter expressions in Zilliz Cloud clusters, with examples focused on query operations. You can also apply these filters in search and delete requests.

## Basic operators\{#basic-operators}

Zilliz Cloud supports several basic operators for filtering data:

- **Comparison Operators**: `==`, `!=`, `>`, `<`, `>=`, and `<=` allow filtering based on numeric or text fields.

- **Range and pattern filters**: `IN`, `LIKE`, `=~`, and `!~` match values, wildcard patterns, or regex patterns. For details about string patterns, refer to [Pattern Matching](https://milvus.io/docs/pattern-matching.md).

- **Arithmetic Operators**: `+`, `-`, `*`, `/`, `%`, and `**` are used for calculations involving numeric fields.

- **Bitwise Operators**: In  and later, `&`, `|`, and `^` filter integer fields that encode multiple flags, such as permissions or status bits. For details, refer to [Basic Operators](https://milvus.io/docs/basic-operators.md#Bitwise-operators).

- **Logical Operators**: `AND`, `OR`, and `NOT` combine multiple conditions into complex expressions.

- **IS NULL and IS NOT NULL Operators**: The `IS NULL` and `IS NOT NULL` operators are used to filter fields based on whether they contain a null value (absence of data). For details, refer to [Basic Operators](https://milvus.io/docs/basic-operators.md#IS-NULL-and-IS-NOT-NULL-operators).

### Example: Filtering by Color\{#example-filtering-by-color}

To find entities with primary colors (red, green, or blue) in a scalar field `color`, use the following filter expression:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter='color in ["red", "green", "blue"]'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "color in [\"red\", \"green\", \"blue\"]";
```

</TabItem>

<TabItem value='go'>

```go
filter := "color in [\"red\", \"green\", \"blue\"]"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "color in [\"red\", \"green\", \"blue\"]";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "color in [\"red\", \"green\", \"blue\"]";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'color in ["red", "green", "blue"]';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='color in ["red", "green", "blue"]'
```

</TabItem>
</Tabs>

### Example: Filtering by Permission Bits\{#example-filtering-by-permission-bits}

To find entities whose integer `permissions` field has the `SHARE` bit set, use the bitwise AND operator (`&`):

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter='(permissions & 4) == 4'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "(permissions & 4) == 4";
```

</TabItem>

<TabItem value='go'>

```go
filter := "(permissions & 4) == 4"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "(permissions & 4) == 4";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "(permissions & 4) == 4";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = '(permissions & 4) == 4';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='(permissions & 4) == 4'
```

</TabItem>
</Tabs>

### Example: Filtering by Regex Pattern\{#example-filtering-by-regex-pattern}

To find entities whose `message` field contains an error code such as `E1001`, use the regex match operator `=~`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter='message =~ "E[0-9]{4}"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "message =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := "message =~ \"E[0-9]{4}\""
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "message =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "message =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'message =~ "E[0-9]{4}"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message =~ "E[0-9]{4}"'
```

</TabItem>
</Tabs>

Regex filters use substring matching. To require the entire field value to match the pattern, add `^` and `$` anchors. For details, refer to [Pattern Matching](https://milvus.io/docs/pattern-matching.md).

### Example: Filtering JSON Fields\{#example-filtering-json-fields}

Zilliz Cloud allows referencing keys in JSON fields. For instance, if you have a JSON field `product` with keys `price` and `model`, and want to find products with a specific model and price lower than 1,850, use this filter expression:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "product[\"model\"] == \"JSN-087\" AND product[\"price\"] < 1850";
```

</TabItem>

<TabItem value='go'>

```go
filter := "product[\"model\"] == \"JSN-087\" AND product[\"price\"] < 1850"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "product[\"model\"] == \"JSN-087\" AND product[\"price\"] < 1850";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "product[\"model\"] == \"JSN-087\" AND product[\"price\"] < 1850";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'product["model"] == "JSN-087" AND product["price"] < 1850';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

</TabItem>
</Tabs>

### Example: Filtering Array Fields\{#example-filtering-array-fields}

If you have an array field `history_temperatures` containing the records of average temperatures reported by observatories since the year 2000, and want to find observatories where the temperature in 2009 (the 10th recorded ) exceeds 23°C, use this expression:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter='history_temperatures[10] > 23'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "history_temperatures[10] > 23";
```

</TabItem>

<TabItem value='go'>

```go
filter := "history_temperatures[10] > 23"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "history_temperatures[10] > 23";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "history_temperatures[10] > 23";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'history_temperatures[10] > 23';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='history_temperatures[10] > 23'
```

</TabItem>
</Tabs>

For more information on these basic operators, refer to [Basic Operators](https://milvus.io/docs/basic-operators.md).

## Filter expression templates\{#filter-expression-templates}

When filtering using CJK characters, processing can be more complex due to their larger character sets and encoding differences. This can result in slower performance, especially with the `IN` operator.

Zilliz Cloud introduces filter expression templating to optimize performance when working with CJK characters. By separating dynamic values from the filter expression, the query engine handles parameter insertion more efficiently.

To find individuals over the age of `25` living in either `"北京"` (Beijing) or `"上海"` (Shanghai), use the following template expression:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "age > 25 AND city IN ['北京', '上海']"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age > 25 AND city IN ['北京', '上海']";
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 25 AND city IN ['北京', '上海']"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "age > 25 AND city IN ['北京', '上海']";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "age > 25 AND city IN ['北京', '上海']";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = "age > 25 AND city IN ['北京', '上海']";
```

</TabItem>

<TabItem value='bash'>

```bash
filter="age > 25 AND city IN ['北京', '上海']"
```

</TabItem>
</Tabs>

To improve performance, use this variation with parameters:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "age > {age} AND city in {city}"
filter_params = {"age": 25, "city": ["北京", "上海"]}
```

</TabItem>

<TabItem value='java'>

```java
import java.util.*;

String filter = "age > {age} AND city in {city}";
Map<String, Object> filterTemplateValues = new HashMap<>();
filterTemplateValues.put("age", 25);
filterTemplateValues.put("city", Arrays.asList("北京", "上海"));
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > {age} AND city in {city}"
// Note: filter expression templating is not yet supported in milvus-sdk-go.
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use std::collections::HashMap;

let filter = "age > {age} AND city in {city}";
let filter_templates: HashMap<String, FilterTemplateValue> = HashMap::from([
    ("age".into(), FilterTemplateValue::Int64(25)),
    ("city".into(), FilterTemplateValue::StringArray(vec!["北京".to_string(), "上海".to_string()])),
]);
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "age > {age} AND city in {city}";
std::unordered_map<std::string, nlohmann::json> filterTemplates = {
    {"age", 25},
    {"city", nlohmann::json::array({"北京", "上海"})}
};
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = "age > {age} AND city in {city}";
const exprValues = { age: 25, city: ["北京", "上海"] };
```

</TabItem>

<TabItem value='bash'>

```bash
filter="age > {age} AND city in {city}"
filter_params='{"age": 25, "city": ["北京", "上海"]}'
```

</TabItem>
</Tabs>

This approach reduces parsing overhead and improves query speed. For more information, see [Filter Templating](./filtering-templating).

## Data type-specific operators\{#data-type-specific-operators}

Zilliz Cloud provides advanced filtering operators for specific data types, such as JSON, ARRAY, and VARCHAR fields.

### JSON field-specific operators\{#json-field-specific-operators}

Zilliz Cloud offers advanced operators for querying JSON fields, enabling precise filtering within complex JSON structures:

**`JSON_CONTAINS(identifier, jsonExpr)`**: Checks if a JSON expression exists in the field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

</TabItem>

<TabItem value='java'>

```java
// JSON data: {"tags": ["electronics", "sale", "new"]}
String filter = "json_contains(tags, \"sale\")";
```

</TabItem>

<TabItem value='go'>

```go
// JSON data: {"tags": ["electronics", "sale", "new"]}
filter := "json_contains(tags, \"sale\")"
```

</TabItem>

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new"]}
let filter = "json_contains(tags, \"sale\")";
```

</TabItem>

<TabItem value='c++'>

```c++
// JSON data: {"tags": ["electronics", "sale", "new"]}
std::string filter = "json_contains(tags, \"sale\")";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// JSON data: {"tags": ["electronics", "sale", "new"]}
const filter = 'json_contains(tags, "sale")';
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

</TabItem>
</Tabs>

**`JSON_CONTAINS_ALL(identifier, jsonExpr)`**: Ensures all elements of the JSON expression are present.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

</TabItem>

<TabItem value='java'>

```java
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
String filter = "json_contains_all(tags, [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

<TabItem value='go'>

```go
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter := "json_contains_all(tags, [\"electronics\", \"sale\", \"new\"])"
```

</TabItem>

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
let filter = "json_contains_all(tags, [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

<TabItem value='c++'>

```c++
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
std::string filter = "json_contains_all(tags, [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
const filter = 'json_contains_all(tags, ["electronics", "sale", "new"])';
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

</TabItem>
</Tabs>

**`JSON_CONTAINS_ANY(identifier, jsonExpr)`**: Filters for entities where at least one element exists in the JSON expression.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

</TabItem>

<TabItem value='java'>

```java
// JSON data: {"tags": ["electronics", "sale", "new"]}
String filter = "json_contains_any(tags, [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

<TabItem value='go'>

```go
// JSON data: {"tags": ["electronics", "sale", "new"]}
filter := "json_contains_any(tags, [\"electronics\", \"new\", \"clearance\"])"
```

</TabItem>

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new"]}
let filter = "json_contains_any(tags, [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

<TabItem value='c++'>

```c++
// JSON data: {"tags": ["electronics", "sale", "new"]}
std::string filter = "json_contains_any(tags, [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// JSON data: {"tags": ["electronics", "sale", "new"]}
const filter = 'json_contains_any(tags, ["electronics", "new", "clearance"])';
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

</TabItem>
</Tabs>

For more details on JSON operators, refer to [JSON Operators](./json-filtering-operators).

### ARRAY field-specific operators\{#array-field-specific-operators}

Zilliz Cloud provides advanced filtering operators for array fields, such as `ARRAY_CONTAINS`, `ARRAY_CONTAINS_ALL`, `ARRAY_CONTAINS_ANY`, and `ARRAY_LENGTH`, which allow fine-grained control over array data:

**`ARRAY_CONTAINS`**: Filters entities containing a specific element.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter="ARRAY_CONTAINS(history_temperatures, 23)"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ARRAY_CONTAINS(history_temperatures, 23)";
```

</TabItem>

<TabItem value='go'>

```go
filter := "ARRAY_CONTAINS(history_temperatures, 23)"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "ARRAY_CONTAINS(history_temperatures, 23)";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "ARRAY_CONTAINS(history_temperatures, 23)";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS(history_temperatures, 23)';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS(history_temperatures, 23)'
```

</TabItem>
</Tabs>

**`ARRAY_CONTAINS_ALL`**: Filters entities where all elements in a list are present.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter="ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='go'>

```go
filter := "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

</TabItem>
</Tabs>

**`ARRAY_CONTAINS_ANY`**: Filters entities containing any element from the list.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter="ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='go'>

```go
filter := "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

</TabItem>
</Tabs>

**`ARRAY_LENGTH`**: Filters based on the length of the array.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter="ARRAY_LENGTH(history_temperatures) < 10"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='go'>

```go
filter := "ARRAY_LENGTH(history_temperatures) < 10"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'ARRAY_LENGTH(history_temperatures) < 10';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_LENGTH(history_temperatures) < 10'
```

</TabItem>
</Tabs>

For more details on array operators, see [ARRAY Operators](./array-filtering-operators).

### VARCHAR field-specific operators\{#varchar-field-specific-operators}

Zilliz Cloud provides specialized operators for precise text-based searches on VARCHAR fields:

#### Pattern matching operators\{#pattern-matching-operators}

The `LIKE`, `=~`, and `!~` operators match string patterns on `VARCHAR` fields, JSON string paths, and specific `ARRAY<VARCHAR>` elements. Use `LIKE` for simple wildcard patterns. Use `=~` and `!~` for RE2 regular expressions.

For details, refer to [Pattern Matching](./pattern-match).

#### `TEXT_MATCH` operator\{#textmatch-operator}

The `TEXT_MATCH` operator allows precise document retrieval based on specific query terms. It is particularly useful for filtered searches that combine scalar filters with vector similarity searches. Unlike semantic searches, Text Match focuses on exact term occurrences.

Zilliz Cloud uses Tantivy to support inverted indexing and term-based text search. The process involves:

1. **Analyzer**: Tokenizes and processes input text.

1. **Indexing**: Creates an inverted index mapping unique tokens to documents.

For more details, refer to Text Match.

#### `PHRASE_MATCH` operator\{#phrasematch-operator}

The **PHRASE_MATCH** operator enables precise retrieval of documents based on exact phrase matches, considering both the order and adjacency of query terms.

For more details, refer to [Phrase Match](./phrase-match).