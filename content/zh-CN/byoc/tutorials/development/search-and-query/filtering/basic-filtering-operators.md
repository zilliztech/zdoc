---
title: "基本操作符 | BYOC"
slug: /basic-filtering-operators
sidebar_label: "基本操作符"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud 提供了丰富的基本操作符，可帮助您高效过滤和查询数据。您可以使用这些操作符，根据标量字段、数值计算、逻辑条件等细化搜索条件。掌握这些操作符的用法，是构建精确查询并提升搜索效率的关键。 | BYOC"
type: origin
token: OEw6wSUvXiKQKpkOLIAcYk6unbc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基本操作符

Zilliz Cloud 提供了丰富的基本操作符，可帮助您高效过滤和查询数据。您可以使用这些操作符，根据标量字段、数值计算、逻辑条件等细化搜索条件。掌握这些操作符的用法，是构建精确查询并提升搜索效率的关键。

<Admonition type="info" title="说明">

过滤表达式左侧的值既可以是 Collection 字段名称（例如下文示例中的 `status`、`color` 等），也可以是指定元素索引处的 StructArray 子字段名称，例如 `filter = 'struct[0][subfield] > 10'`。

有关 StructArray 字段中标量过滤的详细信息，请参阅 [StructArray 操作符](./struct-array-filtering)。

</Admonition>

## 比较操作符\{#comparison-operators}

比较操作符用于根据相等、不等或大小关系过滤数据，适用于数值字段和文本字段。

### 支持的比较操作符\{#supported-comparison-operators}

- `==`（等于）

- `!=`（不等于）

- `>`（大于）

- `<`（小于）

- `>=`（大于或等于）

- `<=`（小于或等于）

### 示例 1：使用等于（`==`）操作符过滤\{#example-1-filtering-with-equal-to}

假设有一个名为 `status` 的字段，您需要查找 `status` 为 "active" 的所有实体。可以使用等于操作符 `==`：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'status == "active"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "status == \"active\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := "status == \"active\""
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "status == \"active\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "status == \"active\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'status == "active"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='status == "active"'
```

</TabItem>
</Tabs>

### 示例 2：使用不等于（`!=`）操作符过滤\{#example-2-filtering-with-not-equal-to}

要查找 `status` 不为 "inactive" 的实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'status != "inactive"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "status != \"inactive\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := "status != \"inactive\""
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "status != \"inactive\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "status != \"inactive\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'status != "inactive"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='status != "inactive"'
```

</TabItem>
</Tabs>

### 示例 3：使用大于（`>`）操作符过滤\{#example-3-filtering-with-greater-than-greater}

要查找 `age` 大于 30 的所有实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'age > 30'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "age > 30";
```

</TabItem>

<TabItem value='go'>

```go
filter := "age > 30"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "age > 30";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "age > 30";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'age > 30';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='age > 30'
```

</TabItem>
</Tabs>

### 示例 4：使用小于（`<`）操作符过滤\{#example-4-filtering-with-less-than}

要查找 `price` 小于 100 的实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'price < 100'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "price < 100";
```

</TabItem>

<TabItem value='go'>

```go
filter := "price < 100"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "price < 100";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "price < 100";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'price < 100';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='price < 100'
```

</TabItem>
</Tabs>

### 示例 5：使用大于或等于（`>=`）操作符过滤\{#example-5-filtering-with-greater-than-or-equal-to-greater}

要查找 `rating` 大于或等于 4 的所有实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'rating >= 4'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "rating >= 4";
```

</TabItem>

<TabItem value='go'>

```go
filter := "rating >= 4"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "rating >= 4";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "rating >= 4";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'rating >= 4';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='rating >= 4'
```

</TabItem>
</Tabs>

### 示例 6：使用小于或等于（`<=`）操作符过滤\{#example-6-filtering-with-less-than-or-equal-to}

要查找 `discount` 小于或等于 10% 的实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'discount <= 10'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "discount <= 10";
```

</TabItem>

<TabItem value='go'>

```go
filter := "discount <= 10"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "discount <= 10";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "discount <= 10";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'discount <= 10';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='discount <= 10'
```

</TabItem>
</Tabs>

## 范围操作符\{#range-operators}

范围操作符用于根据一组特定值过滤数据。Zilliz Cloud 支持使用 `IN` 检查值是否属于指定集合。

要查找 `color` 为 "red"、"green" 或 "blue" 的所有实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'color in ["red", "green", "blue"]'
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

需要检查某个值是否属于值列表时，这种方法非常有用。

## 模式匹配操作符\{#pattern-matching-operators}

模式匹配操作符用于根据通配符模式或正则表达式过滤字符串值。

- `LIKE`：用于匹配字符串值中的简单通配符模式。例如，`name LIKE "Prod%"` 可以匹配以 `Prod` 开头的值。

- `=~`：使用 RE2 正则表达式匹配字符串值。例如，`code =~ "E[0-9]{4}"` 可以匹配包含 `E1001` 等错误代码的值。

- `!~`：排除与 RE2 正则表达式匹配的字符串值，等同于 `NOT (field =~ "pattern")`。

要查找 `name` 以 `Prod` 开头的实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'name LIKE "Prod%"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "name LIKE \"Prod%\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := "name LIKE \"Prod%\""
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "name LIKE \"Prod%\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "name LIKE \"Prod%\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'name LIKE "Prod%"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='name LIKE "Prod%"'
```

</TabItem>
</Tabs>

要查找 `code` 中包含 `E1001` 等错误代码的实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'code =~ "E[0-9]{4}"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "code =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := "code =~ \"E[0-9]{4}\""
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "code =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "code =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'code =~ "E[0-9]{4}"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='code =~ "E[0-9]{4}"'
```

</TabItem>
</Tabs>

要排除 `message` 以 `DEBUG` 开头的实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'message !~ "^DEBUG"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "message !~ \"^DEBUG\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := "message !~ \"^DEBUG\""
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "message !~ \"^DEBUG\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "message !~ \"^DEBUG\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'message !~ "^DEBUG"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message !~ "^DEBUG"'
```

</TabItem>
</Tabs>

有关如何选择 `LIKE` 或正则表达式，以及支持的字段类型、正则表达式语法、转义规则和性能等详细信息，请参阅[模式匹配](./pattern-match)。Zilliz Cloud 还支持在 `VARCHAR` 字段或 JSON 字符串路径上构建 `NGRAM` 索引，以加速符合条件的模式匹配过滤。有关详细信息，请参阅 [NGRAM](./ngram-index-type)。

## 算术操作符\{#arithmetic-operators}

算术操作符用于根据数值字段的计算结果构建过滤条件。

### 支持的算术操作符\{#supported-arithmetic-operators}

- `+`（加法）

- `-`（减法）

- `*`（乘法）

- `/`（除法）

- `%`（取模）

- `**`（幂运算）

### 示例 1：使用取模（`%`）操作符\{#example-1-using-modulus-percent}

要查找 `id` 为偶数（即能被 2 整除）的实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'id % 2 == 0'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "id % 2 == 0";
```

</TabItem>

<TabItem value='go'>

```go
filter := "id % 2 == 0"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "id % 2 == 0";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "id % 2 == 0";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'id % 2 == 0';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='id % 2 == 0'
```

</TabItem>
</Tabs>

### 示例 2：使用幂运算（`**`）操作符\{#example-2-using-exponentiation}

要查找 `price` 的平方大于 1000 的实体：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'price ** 2 > 1000'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "price ** 2 > 1000";
```

</TabItem>

<TabItem value='go'>

```go
filter := "price ** 2 > 1000"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "price ** 2 > 1000";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "price ** 2 > 1000";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'price ** 2 > 1000';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='price ** 2 > 1000'
```

</TabItem>
</Tabs>

## 按位操作符\{#bitwise-operators}

当整数值用于编码权限、功能开关或状态位等多个标志时，按位操作符非常有用。您可以在过滤表达式中使用这些操作符，检查、组合或比较整数值中的各个位。

对于标量字段，按位操作符适用于 `INT8`、`INT16`、`INT32` 和 `INT64` 等整数字段类型。

### 支持的按位操作符\{#supported-bitwise-operators}

| **操作符** | **名称** | **典型用途** |
| --- | --- | --- |
| `&` | 按位与 | 检查特定位是否已设置。 |
| `\|` | 按位或 | 在比较前组合多个位。 |
| `^` | 按位异或 | 比较两个值之间不同的位。 |

### 示例：按权限位过滤\{#example-filtering-by-permission-bits}

假设有一个名为 `permissions` 的整数字段，其中每一位分别代表一个权限标志：

| **权限标志** | **位值** |
| --- | --- |
| `READ` | `1` |
| `WRITE` | `2` |
| `SHARE` | `4` |
| `ADMIN` | `8` |

例如，`permissions = 5` 表示 `READ` 和 `SHARE` 位已设置，因为 `5 = 1 + 4`。

要查找已设置 `SHARE` 位的实体，请使用按位与（`&`）：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "(permissions & 4) == 4"
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

要查找设置 `WRITE` 位后得到 `READ + WRITE + SHARE` 权限组合的实体，请使用按位或（`|`）：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "(permissions | 2) == 7"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "(permissions | 2) == 7";
```

</TabItem>

<TabItem value='go'>

```go
filter := "(permissions | 2) == 7"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "(permissions | 2) == 7";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "(permissions | 2) == 7";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = '(permissions | 2) == 7';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='(permissions | 2) == 7'
```

</TabItem>
</Tabs>

要查找权限位与 `READ + WRITE + SHARE` 仅相差 `WRITE` 位的实体，请使用按位异或（`^`）：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = "(permissions ^ 7) == 2"
```

</TabItem>

<TabItem value='java'>

```java
String filter = "(permissions ^ 7) == 2";
```

</TabItem>

<TabItem value='go'>

```go
filter := "(permissions ^ 7) == 2"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "(permissions ^ 7) == 2";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "(permissions ^ 7) == 2";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = '(permissions ^ 7) == 2';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='(permissions ^ 7) == 2'
```

</TabItem>
</Tabs>

注意：在比较结果前，始终需要用括号包裹按位运算，例如 `(permissions & 4) == 4`。

## 逻辑操作符\{#logical-operators}

逻辑操作符用于将多个条件组合成更复杂的过滤表达式，包括 `AND`、`OR` 和 `NOT`。

### 支持的逻辑操作符\{#logical-operators}

- `AND`：组合多个必须全部为真的条件。

- `OR`：组合多个条件，其中至少一个条件必须为真。

- `NOT`：对条件取反。

### 示例 1：使用 `AND` 组合条件\{#example-1-using-and-to-combine-conditions}

要查找 `price` 大于 100 且 `stock` 大于 50 的所有产品：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'price > 100 AND stock > 50'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "price > 100 AND stock > 50";
```

</TabItem>

<TabItem value='go'>

```go
filter := "price > 100 AND stock > 50"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "price > 100 AND stock > 50";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "price > 100 AND stock > 50";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'price > 100 AND stock > 50';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='price > 100 AND stock > 50'
```

</TabItem>
</Tabs>

### 示例 2：使用 `OR` 组合条件\{#example-2-using-or-to-combine-conditions}

要查找 `color` 为 "red" 或 "blue" 的所有产品：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'color == "red" OR color == "blue"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "color == \"red\" OR color == \"blue\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := "color == \"red\" OR color == \"blue\""
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "color == \"red\" OR color == \"blue\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "color == \"red\" OR color == \"blue\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'color == "red" OR color == "blue"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='color == "red" OR color == "blue"'
```

</TabItem>
</Tabs>

### 示例 3：使用 `NOT` 排除条件\{#example-3-using-not-to-exclude-a-condition}

要查找 `color` 不为 "green" 的所有产品：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'NOT color == "green"'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "NOT color == \"green\"";
```

</TabItem>

<TabItem value='go'>

```go
filter := "NOT color == \"green\""
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "NOT color == \"green\"";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "NOT color == \"green\"";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'NOT color == "green"';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='NOT color == "green"'
```

</TabItem>
</Tabs>

## IS NULL 和 IS NOT NULL 操作符\{#is-null-and-is-not-null-operators}

使用 `IS NULL` 和 `IS NOT NULL` 可以查找字段值缺失或已有值的实体。例如，你可以查找尚未设置分类的商品，或已生成向量、可以参与搜索的实体。这两个操作符都适用于受支持的标量字段和向量字段，含义相同：

| 操作符 | 匹配的实体 |
| --- | --- |
| `<field> IS NULL` | 指定字段的值为 NULL 的实体 |
| `<field> IS NOT NULL` | 指定字段的值为非 NULL 的实体 |

支持的标量字段包括布尔、数值、`VARCHAR`、`JSON` 和 `ARRAY` 字段。这两个操作符不支持 TEXT 字段。

从 Milvus 3.0.3 开始，这两个操作符还支持普通向量字段：`FLOAT_VECTOR`、`BINARY_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`SPARSE_FLOAT_VECTOR` 和 `INT8_VECTOR`。

操作符不区分大小写：`IS NULL` 与 `is null` 等价，`IS NOT NULL` 与 `is not null` 等价。

### 示例：查找字段值缺失或已有值的实体\{#example-find-entities-with-missing-or-available-values}

假设集合 `products` 已建立索引并加载。集合包含名为 `id` 的 `INT64` 主键字段、允许 NULL 值的 `VARCHAR` 字段 `category`，以及允许 NULL 值的三维 `FLOAT_VECTOR` 字段 `embedding`。集合中已有以下实体：

| `id` | `category` | `embedding` |
| --- | --- | --- |
| `1` | `"book"` | `[0.1, 0.2, 0.3]` |
| `2` | NULL | `[0.4, 0.5, 0.6]` |
| `3` | `"book"` | NULL |

此处省略集合创建和数据插入步骤。有关这些步骤，请参阅可空字段。

要查找尚未生成向量的实体，请使用 `embedding IS NULL` 进行查询。请根据你的服务配置调整连接设置。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

results = client.query(
    collection_name="products",
    filter="embedding IS NULL",
    output_fields=["id"],
    limit=10,
)
print(sorted(entity["id"] for entity in results))
# Expected: [3]
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='rust'>

```rust
// rust
```

</TabItem>

<TabItem value='c++'>

```c++
// cpp
```

</TabItem>

<TabItem value='javascript'>

```javascript
// nodejs
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

在同一个查询中替换 `filter`，即可检查任一字段，或组合多个条件：

| 过滤表达式 | 匹配的 ID | 用途 |
| --- | --- | --- |
| `category IS NULL` | `2` | 查找未设置分类的实体 |
| `category IS NOT NULL` | `1`、`3` | 查找已设置分类的实体 |
| `embedding IS NULL` | `3` | 查找没有向量的实体 |
| `embedding IS NOT NULL` | `1`、`2` | 查找已有向量的实体 |
| `category IS NOT NULL AND embedding IS NOT NULL` | `1` | 查找两个字段均已有值的实体 |

### 字段值如何判定\{#how-field-values-are-treated}

操作符检查的是字段实际存储的值。对于允许 NULL 值且未设置默认值的字段，插入时省略该字段或显式将其设置为 NULL，都会存储 NULL。配置默认值可能改变实际存储的值。详情请参阅可空字段和默认值。

| 字段类型 | NULL 判定规则 |
| --- | --- |
| `VARCHAR` | 空字符串 `""` 是非 NULL 值。 |
| `JSON` | 整个字段的值为 NULL 时，匹配 `IS NULL`。`{"category": null}` 这样的 JSON 对象是非 NULL 值，即使其中某个键的值为 NULL。 |
| `ARRAY` | 整个字段的值为 NULL 时，匹配 `IS NULL`。数组元素不能为 NULL，且 `IS NULL` / `IS NOT NULL` 不支持 `tags[0]` 这样的数组元素访问。请参阅 [Array 类型](./use-array-fields)。 |
| 普通向量类型 | NULL 表示向量值缺失。各分量均为零的向量不是 NULL。 |

对于定义为 `nullable=False` 的受支持字段，`IS NULL` 不匹配任何实体，`IS NOT NULL` 匹配所有可见实体。过滤表达式中的其他条件仍然生效。

### 在向量搜索中使用 NULL 过滤\{#use-null-filters-in-vector-search}

这两个操作符也可以用于搜索过滤条件。不过，实体只有在被搜索的向量字段中有向量值，才能参与相似性搜索。

以上述数据为例，假设搜索指定了 `anns_field="embedding"`：

| 过滤表达式 | 可参与相似性搜索的实体 | 原因 |
| --- | --- | --- |
| `category IS NULL` | `2` | 实体 `2` 没有分类，但有 `embedding` 向量。 |
| `embedding IS NULL` | 无 | 实体 `3` 满足过滤条件，但没有可与查询向量比较的 `embedding` 向量。 |
| `embedding IS NOT NULL` | `1`、`2` | 两个实体都有 `embedding` 向量。 |

这三个过滤表达式都是有效的。搜索 `embedding` 时，如果同时使用 `embedding IS NULL` 过滤，将没有命中结果，因为没有实体能同时满足“字段为 NULL”和“具有可用于比较的向量”这两个条件。要获取缺失向量的实体，请使用上文示例中的 `query()`。

向量搜索本身就会跳过被搜索的向量字段为 NULL 的实体，因此在搜索 `embedding` 时，`embedding IS NOT NULL` 不会进一步缩小候选范围。排序、其他过滤条件和搜索结果数量限制仍会决定最终返回哪些候选实体。

## 在 JSON 和 ARRAY 字段中使用基本操作符的注意事项\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloud 集群 中的基本操作符用途广泛，不仅适用于标量字段，也可以有效应用于 JSON 和 ARRAY 字段中的键和索引。

例如，如果 `product` 字段包含 `price`、`model` 和 `tags` 等多个键，应始终直接引用目标键：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'product["price"] > 1000'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "product[\"price\"] > 1000";
```

</TabItem>

<TabItem value='go'>

```go
filter := "product[\"price\"] > 1000"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "product[\"price\"] > 1000";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "product[\"price\"] > 1000";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'product["price"] > 1000';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='product["price"] > 1000'
```

</TabItem>
</Tabs>

要查找温度记录数组中第一个温度值超过指定数值的记录，可以使用：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'history_temperatures[0] > 30'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "history_temperatures[0] > 30";
```

</TabItem>

<TabItem value='go'>

```go
filter := "history_temperatures[0] > 30"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "history_temperatures[0] > 30";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "history_temperatures[0] > 30";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'history_temperatures[0] > 30';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='history_temperatures[0] > 30'
```

</TabItem>
</Tabs>

## 总结\{#conclusion}

Zilliz Cloud 提供了多种基本操作符，使您可以灵活地过滤和查询数据。通过组合比较、范围、算术和逻辑操作符，您可以构建功能强大的过滤表达式，缩小搜索结果范围并高效检索所需数据。

## 常见问题\{#faq}

**过滤条件中的匹配值列表是否有长度限制（例如** `filter='color in ["red", "green", "blue"]'`**）？列表过长时应该怎么办？**

Zilliz Cloud 不限制过滤条件中匹配值列表的长度。但是，列表过长会显著影响查询性能。
如果过滤条件包含很长的匹配值列表，或包含大量元素的复杂表达式，建议使用[过滤表达式模板](./filtering-templating)来提升查询性能。