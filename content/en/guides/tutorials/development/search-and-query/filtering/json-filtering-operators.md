---
title: "JSON Operators | Cloud"
slug: /json-filtering-operators
sidebar_label: "JSON"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud supports advanced operators for querying and filtering JSON fields, making them perfect for managing complex, structured data. These operators enable highly effective querying of JSON documents, allowing you to retrieve entities based on specific elements, values, or conditions within the JSON fields. This section will guide you through using JSON-specific operators in Zilliz Cloud, providing practical examples to illustrate their functionality. | Cloud"
type: origin
token: Py6zwu6r4iPMqVkKAYXcUYLEnXg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON Operators

Zilliz Cloud supports advanced operators for querying and filtering JSON fields, making them perfect for managing complex, structured data. These operators enable highly effective querying of JSON documents, allowing you to retrieve entities based on specific elements, values, or conditions within the JSON fields. This section will guide you through using JSON-specific operators in Zilliz Cloud, providing practical examples to illustrate their functionality.

<Admonition type="info" title="Notes">

JSON fields cannot deal with complex, nested structures and treats all nested structures as plain strings. Therefore, when working with JSON fields, it is advisable to avoid excessively deep nesting and ensure that your data structures are as flat as possible for optimal performance.

</Admonition>

## Available JSON Operators\{#available-json-operators}

Zilliz Cloud provides several powerful JSON operators that help filter and query JSON data, and these operators are:

- [`JSON_CONTAINS(identifier, expr)`](./json-filtering-operators#jsoncontains): Filters entities where the specified JSON expression is found within the field.

- [`JSON_CONTAINS_ALL(identifier, expr)`](./json-filtering-operators#jsoncontainsall): Ensures that all elements of the specified JSON expression are present in the field.

- [`JSON_CONTAINS_ANY(identifier, expr)`](./json-filtering-operators#jsoncontainsany): Filters entities where at least one member of the JSON expression exists within the field.

Let’s explore these operators with examples to see how they can be applied in real-world scenarios.

## JSON_CONTAINS\{#jsoncontains}

The `json_contains` operator checks if a specific element or subarray exists within a JSON field. It’s useful when you want to ensure that a JSON array or object contains a particular value.

**Example**

Imagine you have a collection of products, each with a `tags` field that contains a JSON array of strings, such as `["electronics", "sale", "new"]`. You want to filter products that have the tag `"sale"`.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains(product["tags"], "sale")'
```

</TabItem>

<TabItem value='java'>

```java
// JSON data: {"tags": ["electronics", "sale", "new"]}
String filter = "json_contains(product[\"tags\"], \"sale\")";
```

</TabItem>

<TabItem value='go'>

```go
// JSON data: {"tags": ["electronics", "sale", "new"]}
filter := "json_contains(product[\"tags\"], \"sale\")"
```

</TabItem>
</Tabs>

```rust
// JSON data: {"tags": ["electronics", "sale", "new"]}
let filter = "json_contains(product[\"tags\"], \"sale\")";
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
// JSON data: {"tags": ["electronics", "sale", "new"]}
std::string filter = "json_contains(product[\"tags\"], \"sale\")";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// JSON data: {"tags": ["electronics", "sale", "new"]}
const filter = 'json_contains(product["tags"], "sale")';
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(product["tags"], "sale")'
```

</TabItem>
</Tabs>

In this example, Zilliz Cloud will return all products where the `tags` field contains the element `"sale"`.

## JSON_CONTAINS_ALL\{#jsoncontainsall}

The `json_contains_all` operator ensures that all elements of a specified JSON expression are present in the target field. It is particularly useful when you need to match multiple values within a JSON array.

**Example**

Continuing with the product tags scenario, if you want to find all products that have the tags `"electronics"`, `"sale"`, and `"new"`, you can use the `json_contains_all` operator.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

</TabItem>

<TabItem value='java'>

```java
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
String filter = "json_contains_all(product[\"tags\"], [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

<TabItem value='go'>

```go
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter := "json_contains_all(product[\"tags\"], [\"electronics\", \"sale\", \"new\"])"
```

</TabItem>
</Tabs>

```rust
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
let filter = "json_contains_all(product[\"tags\"], [\"electronics\", \"sale\", \"new\"])";
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
std::string filter = "json_contains_all(product[\"tags\"], [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
const filter = 'json_contains_all(product["tags"], ["electronics", "sale", "new"])';
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

</TabItem>
</Tabs>

This query will return all products where the `tags` array contains all three specified elements: `"electronics"`, `"sale"`, and `"new"`.

## JSON_CONTAINS_ANY\{#jsoncontainsany}

The `json_contains_any` operator filters entities where at least one member of the JSON expression exists within the field. This is useful when you want to match entities based on any one of several possible values.

**Example**

Let’s say you want to filter products that have at least one of the tags `"electronics"`, `"sale"`, or `"new"`. You can use the `json_contains_any` operator to achieve this.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter = 'json_contains_any(product["tags"], ["electronics", "new", "clearance"])'
```

</TabItem>

<TabItem value='java'>

```java
// JSON data: {"tags": ["electronics", "sale", "new"]}
String filter = "json_contains_any(product[\"tags\"], [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

<TabItem value='go'>

```go
// JSON data: {"tags": ["electronics", "sale", "new"]}
filter := "json_contains_any(product[\"tags\"], [\"electronics\", \"new\", \"clearance\"])"
```

</TabItem>
</Tabs>

```rust
// JSON data: {"tags": ["electronics", "sale", "new"]}
let filter = "json_contains_any(product[\"tags\"], [\"electronics\", \"new\", \"clearance\"])";
```

<Tabs groupId="code" defaultValue='c++' values={[{"label":"C++","value":"c++"}]}>
<TabItem value='c++'>

```c++
// JSON data: {"tags": ["electronics", "sale", "new"]}
std::string filter = "json_contains_any(product[\"tags\"], [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

<TabItem value='javascript'>

```javascript
// JSON data: {"tags": ["electronics", "sale", "new"]}
const filter = 'json_contains_any(product["tags"], ["electronics", "new", "clearance"])';
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(product["tags"], ["electronics", "new", "clearance"])'
```

</TabItem>
</Tabs>

In this case, Zilliz Cloud will return all products that have at least one of the tags in the list `["electronics", "new", "clearance"]`. Even if a product only has one of these tags, it will be included in the result.