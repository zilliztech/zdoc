---
title: "JSON 演算子 | Cloud"
slug: /json-filtering-operators
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、JSON フィールドのクエリとフィルタリングに使用できる高度な演算子をサポートしており、複雑で構造化されたデータの管理に最適です。これらの演算子を使用すると、JSON ドキュメントを効果的にクエリし、JSON フィールド内の特定の要素、値、条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud で JSON 固有の演算子を使用する方法を、実際の例を交えて説明します。 | Cloud"
type: origin
displayed_sidebar: default
token: shared-json-filtering-operators
sidebar_label: "JSON"
sidebar_position: 5
custom_edit_url: "https://github.com/milvus-io/milvus-docs/edit/v3.0.x/site/en/userGuide/search-query-get/boolean/json-operators.md"

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON 演算子

Zilliz Cloud は、JSON フィールドのクエリとフィルタリングに使用できる高度な演算子をサポートしており、複雑で構造化されたデータの管理に最適です。これらの演算子を使用すると、JSON ドキュメントを効果的にクエリし、JSON フィールド内の特定の要素、値、条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud で JSON 固有の演算子を使用する方法を、実際の例を交えて説明します。

<Admonition type="info" icon="📘" title="Notes">

JSON フィールドは複雑なネスト構造を扱えず、すべてのネスト構造をプレーン文字列として扱います。そのため、JSON フィールドを使用する場合は、過度に深いネストを避け、最適なパフォーマンスを得るためにデータ構造をできるだけフラットに保つことをお勧めします。

</Admonition>

## 使用可能な JSON 演算子\{#available-json-operators}

Zilliz Cloud は、JSON データのフィルタリングとクエリに役立つ強力な JSON 演算子をいくつか提供しています。演算子は次のとおりです。

- [`JSON_CONTAINS(identifier, expr)`](#jsoncontains): 指定した JSON 式がフィールド内に見つかったエンティティをフィルタリングします。

- [`JSON_CONTAINS_ALL(identifier, expr)`](#jsoncontainsall): 指定した JSON 式のすべての要素がフィールドに存在することを保証します。

- [`JSON_CONTAINS_ANY(identifier, expr)`](#jsoncontainsany): JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルタリングします。

実際のシナリオでこれらの演算子をどのように適用できるかを、例を交えて確認します。

## JSON_CONTAINS\{#jsoncontains}

`json_contains` 演算子は、特定の要素またはサブ配列が JSON フィールド内に存在するかどうかを確認します。JSON 配列またはオブジェクトに特定の値が含まれていることを確認したい場合に便利です。

**例**

商品のコレクションがあり、各商品の `tags` フィールドに `["electronics", "sale", "new"]` のような文字列の JSON 配列が含まれているとします。タグ `"sale"` を持つ商品をフィルタリングするとします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new"]}
let filter = "json_contains(product[\"tags\"], \"sale\")";
```

</TabItem>

<TabItem value='c++'>

```cpp
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

<TabItem value='csharp'>

```csharp
// JSON data: {"tags": ["electronics", "sale", "new"]}
string filter = "json_contains(product[\"tags\"], \"sale\")";
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(product["tags"], "sale")'
```

</TabItem>

</Tabs>

この例では、Zilliz Cloud は `tags` フィールドに要素 `"sale"` が含まれているすべての商品を返します。

## JSON_CONTAINS_ALL\{#jsoncontainsall}

`json_contains_all` 演算子は、指定した JSON 式のすべての要素が対象のフィールドに存在することを保証します。JSON 配列内で複数の値を一致させたい場合に特に便利です。

**例**

商品タグのシナリオを引き続き使用し、タグ `"electronics"`、`"sale"`、`"new"` を持つすべての商品を検索する場合は、`json_contains_all` 演算子を使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
let filter = "json_contains_all(product[\"tags\"], [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

<TabItem value='c++'>

```cpp
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

<TabItem value='csharp'>

```csharp
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
string filter = "json_contains_all(product[\"tags\"], [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(product["tags"], ["electronics", "sale", "new"])'
```

</TabItem>

</Tabs>

このクエリは、`tags` 配列に指定した 3 つの要素 `"electronics"`、`"sale"`、`"new"` がすべて含まれているすべての商品を返します。

## JSON_CONTAINS_ANY\{#jsoncontainsany}

`json_contains_any` 演算子は、JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルタリングします。複数の候補値のいずれかに基づいてエンティティを一致させたい場合に便利です。

**例**

タグ `"electronics"`、`"sale"`、`"new"` の少なくとも 1 つを持つ商品をフィルタリングするとします。これは `json_contains_any` 演算子を使用して実現できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new"]}
let filter = "json_contains_any(product[\"tags\"], [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

<TabItem value='c++'>

```cpp
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

<TabItem value='csharp'>

```csharp
// JSON data: {"tags": ["electronics", "sale", "new"]}
string filter = "json_contains_any(product[\"tags\"], [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(product["tags"], ["electronics", "new", "clearance"])'
```

</TabItem>

</Tabs>

この場合、Zilliz Cloud はリスト `["electronics", "new", "clearance"]` 内のタグを少なくとも 1 つ持つすべての商品を返します。商品がこれらのタグの 1 つだけを持つ場合でも、結果に含まれます。
