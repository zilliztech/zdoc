---
title: "フィルタリングの仕組み | BYOC"
slug: /filtering-overview
sidebar_label: "概要"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、データを正確にクエリできる強力なフィルタリング機能を提供します。フィルター式を使用すると、フィールド値に基づいてエンティティを選択し、さまざまな条件で検索結果を絞り込めます。このガイドでは、クエリ操作を中心とした例を用いて、Zilliz Cloud のクラスターでフィルター式を使用する方法を説明します。これらのフィルターは、検索リクエストと削除リクエストにも適用できます。 | BYOC"
type: origin
token: AIb1wNAE3iiKVSk8MHAcVA4QnJb
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# フィルタリングの仕組み

Zilliz Cloud は、データを正確にクエリできる強力なフィルタリング機能を提供します。フィルター式を使用すると、フィールド値に基づいてエンティティを選択し、さまざまな条件で検索結果を絞り込めます。このガイドでは、クエリ操作を中心とした例を用いて、Zilliz Cloud のクラスターでフィルター式を使用する方法を説明します。これらのフィルターは、検索リクエストと削除リクエストにも適用できます。

## 基本演算子\{#basic-operators}

Zilliz Cloud は、データのフィルタリングに使用できるいくつかの基本演算子をサポートしています：

- **比較演算子**: `==`、`!=`、`>`、`<`、`>=`、`<=` は、数値フィールドまたはテキストフィールドに基づくフィルタリングを可能にします。

- **範囲フィルターとパターンフィルター**: `IN`、`LIKE`、`=~`、`!~` は、値、ワイルドカードパターン、または正規表現パターンに一致します。文字列パターンの詳細については、[Pattern Matching](https://milvus.io/docs/pattern-matching.md) を参照してください。

- **算術演算子**: `+`、`-`、`*`、`/`、`%`、`**` は、数値フィールドを含む計算に使用します。

- **ビット演算子**: 以降では、`&`、`|`、`^` は、権限やステータスビットなど、複数のフラグをエンコードした整数フィールドをフィルタリングします。詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md#Bitwise-operators) を参照してください。

- **論理演算子**: `AND`、`OR`、`NOT` は、複数の条件を複雑な式に結合します。

- **IS NULL 演算子と IS NOT NULL 演算子**: `IS NULL` を使用して、フィールド値が NULL のエンティティを選択するか、`IS NOT NULL` を使用して、フィールド値が NULL でないエンティティを選択します。これらの演算子はスカラーフィールドをサポートします。サポートされる型、構文、例については、[IS NULL and IS NOT NULL operators](./basic-filtering-operators#is-null-and-is-not-null-operators) を参照してください。

### 例：色によるフィルタリング\{#example-filtering-by-color}

スカラーフィールド `color` で原色（赤、緑、青）を持つエンティティを検索するには、次のフィルター式を使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "color in [\"red\", \"green\", \"blue\"]";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='color in ["red", "green", "blue"]'
```

</TabItem>
</Tabs>

### 例：権限ビットによるフィルタリング\{#example-filtering-by-permission-bits}

整数の `permissions` フィールドで `SHARE` ビットが設定されているエンティティを検索するには、ビット単位の AND 演算子（`&`）を使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "(permissions & 4) == 4";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='(permissions & 4) == 4'
```

</TabItem>
</Tabs>

### 例：正規表現パターンによるフィルタリング\{#example-filtering-by-regex-pattern}

`message` フィールドに `E1001` などのエラーコードが含まれるエンティティを検索するには、正規表現一致演算子 `=~` を使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "message =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message =~ "E[0-9]{4}"'
```

</TabItem>
</Tabs>

正規表現フィルターは部分文字列マッチングを使用します。フィールド値全体がパターンに一致する必要がある場合は、`^` と `$` のアンカーを追加します。詳細については、[Pattern Matching](https://milvus.io/docs/pattern-matching.md) を参照してください。

### 例：JSON フィールドのフィルタリング\{#example-filtering-json-fields}

Zilliz Cloud では、JSON フィールドのキーを参照できます。たとえば、`price` と `model` というキーを持つ JSON フィールド `product` があり、特定のモデルで価格が 1,850 未満の商品を検索する場合は、次のフィルター式を使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "product[\"model\"] == \"JSN-087\" AND product[\"price\"] < 1850";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='product["model"] == "JSN-087" AND product["price"] < 1850'
```

</TabItem>
</Tabs>

### 例：配列フィールドのフィルタリング\{#example-filtering-array-fields}

2000 年以降に観測所が報告した平均気温の記録を含む配列フィールド `history_temperatures` があり、2009 年の気温（記録された 10 番目の値）が 23°C を超える観測所を検索する場合は、次の式を使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "history_temperatures[10] > 23";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='history_temperatures[10] > 23'
```

</TabItem>
</Tabs>

これらの基本演算子の詳細については、[Basic Operators](https://milvus.io/docs/basic-operators.md) を参照してください。

## フィルター式テンプレート\{#filter-expression-templates}

CJK 文字を使用してフィルタリングする場合、文字セットが大きくエンコーディングが異なるため、処理が複雑になることがあります。特に `IN` 演算子では、パフォーマンスが低下する可能性があります。

Zilliz Cloud は、CJK 文字を扱う際のパフォーマンスを最適化するために、フィルター式テンプレートを導入しています。動的な値をフィルター式から分離することで、クエリエンジンはパラメーターの挿入をより効率的に処理します。

`25` 歳を超え、`"北京"`（北京）または `"上海"`（上海）に住む個人を検索するには、次のテンプレート式を使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "age > 25 AND city IN ['北京', '上海']";
```

</TabItem>

<TabItem value='bash'>

```bash
filter="age > 25 AND city IN ['北京', '上海']"
```

</TabItem>
</Tabs>

パフォーマンスを向上させるには、パラメーターを使用する次のバリエーションを使用します：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
using System.Collections.Generic;

string filter = "age > {age} AND city in {city}";
var filterTemplateValues = new Dictionary<string, object>
{
    ["age"] = 25,
    ["city"] = new[] { "北京", "上海" }
};
```

</TabItem>

<TabItem value='bash'>

```bash
filter="age > {age} AND city in {city}"
filter_params='{"age": 25, "city": ["北京", "上海"]}'
```

</TabItem>
</Tabs>

このアプローチでは、解析のオーバーヘッドが削減され、クエリ速度が向上します。詳細については、[Filter Templating](./filtering-templating) を参照してください。

## データ型固有の演算子\{#data-type-specific-operators}

Zilliz Cloud は、JSON、ARRAY、VARCHAR フィールドなど、特定のデータ型向けの高度なフィルタリング演算子を提供します。

### JSON フィールド固有の演算子\{#json-field-specific-operators}

Zilliz Cloud は、JSON フィールドをクエリするための高度な演算子を提供し、複雑な JSON 構造内での正確なフィルタリングを可能にします：

**`JSON_CONTAINS(identifier, jsonExpr)`**: フィールドに JSON 式が存在するかどうかを確認します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
// JSON data: {"tags": ["electronics", "sale", "new"]}
string filter = "json_contains(tags, \"sale\")";
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains(tags, "sale")'
```

</TabItem>
</Tabs>

**`JSON_CONTAINS_ALL(identifier, jsonExpr)`**: JSON 式のすべての要素が存在することを保証します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
// JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
string filter = "json_contains_all(tags, [\"electronics\", \"sale\", \"new\"])";
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new", "discount"]}
filter='json_contains_all(tags, ["electronics", "sale", "new"])'
```

</TabItem>
</Tabs>

**`JSON_CONTAINS_ANY(identifier, jsonExpr)`**: JSON 式内の少なくとも 1 つの要素が存在するエンティティをフィルタリングします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
// JSON data: {"tags": ["electronics", "sale", "new"]}
string filter = "json_contains_any(tags, [\"electronics\", \"new\", \"clearance\"])";
```

</TabItem>

<TabItem value='bash'>

```bash
# JSON data: {"tags": ["electronics", "sale", "new"]}
filter='json_contains_any(tags, ["electronics", "new", "clearance"])'
```

</TabItem>
</Tabs>

JSON 演算子の詳細については、[JSON Operators](./json-filtering-operators) を参照してください。

### ARRAY フィールド固有の演算子\{#array-field-specific-operators}

Zilliz Cloud は、`ARRAY_CONTAINS`、`ARRAY_CONTAINS_ALL`、`ARRAY_CONTAINS_ANY`、`ARRAY_LENGTH` など、配列フィールド向けの高度なフィルタリング演算子を提供し、配列データをきめ細かく制御できます：

**`ARRAY_CONTAINS`**: 特定の要素を含むエンティティをフィルタリングします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "ARRAY_CONTAINS(history_temperatures, 23)";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS(history_temperatures, 23)'
```

</TabItem>
</Tabs>

**`ARRAY_CONTAINS_ALL`**: リスト内のすべての要素が存在するエンティティをフィルタリングします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS_ALL(history_temperatures, [23, 24])'
```

</TabItem>
</Tabs>

**`ARRAY_CONTAINS_ANY`**: リストのいずれかの要素を含むエンティティをフィルタリングします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_CONTAINS_ANY(history_temperatures, [23, 24])'
```

</TabItem>
</Tabs>

**`ARRAY_LENGTH`**: 配列の長さに基づいてフィルタリングします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "ARRAY_LENGTH(history_temperatures) < 10";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='ARRAY_LENGTH(history_temperatures) < 10'
```

</TabItem>
</Tabs>

配列演算子の詳細については、[ARRAY Operators](./array-filtering-operators) を参照してください。

### VARCHAR フィールド固有の演算子\{#varchar-field-specific-operators}

Zilliz Cloud は、VARCHAR フィールドでの正確なテキスト検索用の専用演算子を提供します：

#### パターンマッチング演算子\{#pattern-matching-operators}

`LIKE`、`=~`、`!~` 演算子は、`VARCHAR` フィールド、JSON 文字列パス、および特定の `ARRAY<VARCHAR>` 要素の文字列パターンに一致します。単純なワイルドカードパターンには `LIKE` を使用します。RE2 正規表現には `=~` と `!~` を使用します。

詳細については、[Pattern Matching](./pattern-match) を参照してください。

#### `TEXT_MATCH` 演算子\{#textmatch-operator}

`TEXT_MATCH` 演算子を使用すると、特定のクエリ語句に基づいてドキュメントを正確に取得できます。これは、スカラーフィルターとベクトル類似性検索を組み合わせたフィルター検索に特に役立ちます。セマンティック検索とは異なり、Text Match は語句の完全な出現に焦点を当てます。

Zilliz Cloud は、Tantivy を使用して転置インデックスと語句ベースのテキスト検索をサポートしています。このプロセスには次のものが含まれます：

1. **アナライザー**: 入力テキストをトークン化して処理します。

1. **インデックス作成**: 一意のトークンをドキュメントにマッピングする転置インデックスを作成します。

詳細については、Text Match を参照してください。

#### `PHRASE_MATCH` 演算子\{#phrasematch-operator}

**PHRASE_MATCH** 演算子は、クエリ語句の順序と隣接性の両方を考慮し、完全なフレーズ一致に基づいてドキュメントを正確に取得できるようにします。

詳細については、[Phrase Match](./phrase-match) を参照してください。
