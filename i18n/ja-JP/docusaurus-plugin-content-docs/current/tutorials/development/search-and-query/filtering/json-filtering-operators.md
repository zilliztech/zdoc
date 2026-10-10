---
title: "JSON 演算子 | Cloud"
slug: /json-filtering-operators
sidebar_label: "JSON"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、JSON フィールドのクエリとフィルタリングのための高度な演算子をサポートしており、複雑で構造化されたデータの管理に最適です。これらの演算子により、JSON ドキュメントを効率的にクエリでき、JSON フィールド内の特定の要素、値、条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud で JSON 固有の演算子を使用する方法を、機能を説明する実践的な例とともに説明します。 | Cloud"
type: origin
token: Py6zwu6r4iPMqVkKAYXcUYLEnXg
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON 演算子

Zilliz Cloud は、JSON フィールドのクエリとフィルタリングのための高度な演算子をサポートしており、複雑で構造化されたデータの管理に最適です。これらの演算子により、JSON ドキュメントを効率的にクエリでき、JSON フィールド内の特定の要素、値、条件に基づいてエンティティを取得できます。このセクションでは、Zilliz Cloud で JSON 固有の演算子を使用する方法を、機能を説明する実践的な例とともに説明します。

<Admonition type="info" title="Notes">

JSON フィールドは複雑でネストされた構造を扱うことができず、ネストされた構造をすべてプレーン文字列として扱います。そのため、JSON フィールドを扱う場合は、過度に深いネストを避け、最適なパフォーマンスを得るためにデータ構造をできるだけフラットに保つことをお勧めします。

</Admonition>

## 利用可能な JSON 演算子\{#available-json-operators}

Zilliz Cloud は、JSON データのフィルタリングとクエリに役立つ強力な JSON 演算子をいくつか提供しています。これらの演算子は次のとおりです。

- [`JSON_CONTAINS(identifier, expr)`](./json-filtering-operators#jsoncontains): 指定された JSON 式がフィールド内に見つかったエンティティをフィルタリングします。

- [`JSON_CONTAINS_ALL(identifier, expr)`](./json-filtering-operators#jsoncontainsall): 指定された JSON 式のすべての要素がフィールドに存在することを保証します。

- [`JSON_CONTAINS_ANY(identifier, expr)`](./json-filtering-operators#jsoncontainsany): JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルタリングします。

これらの演算子を実際のシナリオでどのように適用できるかを、例を交えて見ていきましょう。

## JSON_CONTAINS\{#jsoncontains}

`json_contains` 演算子は、特定の要素またはサブ配列が JSON フィールド内に存在するかどうかをチェックします。JSON 配列またはオブジェクトに特定の値が含まれていることを確認したい場合に便利です。

**例**

製品のコレクションがあり、各製品に `["electronics", "sale", "new"]` などの文字列の JSON 配列を含む `tags` フィールドがあるとします。タグ `"sale"` を持つ製品をフィルタリングしたいとします。

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

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new"]}
let filter = "json_contains(product[\"tags\"], \"sale\")";
```

</TabItem>

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

この例では、Zilliz Cloud は `tags` フィールドに要素 `"sale"` を含むすべての製品を返します。

## JSON_CONTAINS_ALL\{#jsoncontainsall}

`json_contains_all` 演算子は、指定された JSON 式のすべての要素が対象フィールドに存在することを保証します。JSON 配列内で複数の値に一致させる必要がある場合に特に便利です。

**例**

製品タグのシナリオを引き続き使用して、タグ `"electronics"`、`"sale"`、`"new"` を持つすべての製品を検索する場合は、`json_contains_all` 演算子を使用できます。

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

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
let filter = "json_contains_all(product[\"tags\"], [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

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

このクエリは、`tags` 配列に指定された 3 つの要素 `"electronics"`、`"sale"`、`"new"` をすべて含むすべての製品を返します。

## JSON_CONTAINS_ANY\{#jsoncontainsany}

`json_contains_any` 演算子は、JSON 式の少なくとも 1 つのメンバーがフィールド内に存在するエンティティをフィルタリングします。複数の候補値のいずれかに基づいてエンティティを一致させたい場合に便利です。

**例**

タグ `"electronics"`、`"sale"`、`"new"` の少なくとも 1 つを持つ製品をフィルタリングしたいとします。これは `json_contains_any` 演算子を使用して実現できます。

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

<TabItem value='rust'>

```rust
// JSON data: {"tags": ["electronics", "sale", "new"]}
let filter = "json_contains_any(product[\"tags\"], [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

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

この場合、Zilliz Cloud は、リスト `["electronics", "new", "clearance"]` 内のタグの少なくとも 1 つを持つすべての製品を返します。製品がこれらのタグの 1 つだけを持つ場合でも、結果に含まれます。
