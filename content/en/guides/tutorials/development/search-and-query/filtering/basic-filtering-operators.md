---
title: "Basic Operators | Cloud"
slug: /basic-filtering-operators
sidebar_label: "Basic"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud provides comparison, range, arithmetic, logical, and NULL operators for filtering entities. Each operator supports specific field types. | Cloud"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Basic Operators

Zilliz Cloud provides comparison, range, arithmetic, logical, and NULL operators for filtering entities. Each operator supports specific field types.

<Admonition type="info" title="Notes">

The literal on the left-hand side of a filtering expression can either be a collection field name, such as `status`, `color`, etc., used in examples below, or the name of a StructArray subfield at a specific element index, as in `filter = 'struct[0][subfield] > 10'`. 

For details on scalar filtering in a StructArray field, refer to [StructArray Operators](./struct-array-filtering).

</Admonition>

## Comparison operators\{#comparison-operators}

Comparison operators are used to filter data based on equality, inequality, or size. They are applicable to numeric and text fields.

### Supported Comparison Operators:\{#supported-comparison-operators}

- `==` (Equal to)

- `!=` (Not equal to)

- `>` (Greater than)

- `<` (Less than)

- `>=` (Greater than or equal to)

- `<=` (Less than or equal to)

### Example 1: Filtering with Equal To (`==`)\{#example-1-filtering-with-equal-to}

Assume you have a field named `status` and you want to find all entities where `status` is "active". You can use the equality operator `==`:

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

### Example 2: Filtering with Not Equal To (`!=`)\{#example-2-filtering-with-not-equal-to}

To find entities where `status` is not "inactive":

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

### Example 3: Filtering with Greater Than (`>`)\{#example-3-filtering-with-greater-than-greater}

If you want to find all entities with an `age` greater than 30:

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

### Example 4: Filtering with Less Than\{#example-4-filtering-with-less-than}

To find entities where `price` is less than 100:

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

### Example 5: Filtering with Greater Than or Equal To (`>=`)\{#example-5-filtering-with-greater-than-or-equal-to-greater}

If you want to find all entities with `rating` greater than or equal to 4:

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

### Example 6: Filtering with Less Than or Equal To\{#example-6-filtering-with-less-than-or-equal-to}

To find entities with `discount` less than or equal to 10%:

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

## Range operators\{#range-operators}

Range operators help filter data based on a specific set of values. Zilliz Cloud supports `IN` for set membership checks.

If you want to find all entities where the `color` is either "red", "green", or "blue":

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

This is useful when you want to check for membership in a list of values.

## Pattern matching operators\{#pattern-matching-operators}

Pattern matching operators help filter string values based on wildcard patterns or regular expressions.

- `LIKE`: Used to match simple wildcard patterns on string values. For example, `name LIKE "Prod%"` matches values that start with `Prod`.

- `=~`: Used to match a string value with an RE2 regular expression. For example, `code =~ "E[0-9]{4}"` matches values that contain an error code such as `E1001`.

- `!~`: Used to exclude string values that match an RE2 regular expression. This is equivalent to `NOT (field =~ "pattern")`.

To find entities where `name` starts with `Prod`:

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

To find entities whose `code` contains an error code such as `E1001`:

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

To exclude entities whose `message` starts with `DEBUG`:

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

For more details about choosing between `LIKE` and regex, supported field types, regex syntax, escaping rules, and performance, refer to [Pattern Matching](./pattern-match). Zilliz Cloud also allows you to build an `NGRAM` index on `VARCHAR` fields or JSON string paths to accelerate eligible pattern matching filters. For details, refer to [NGRAM](./ngram-index-type).

## Arithmetic Operators\{#arithmetic-operators}

Arithmetic operators allow you to create conditions based on calculations involving numeric fields.

### Supported Arithmetic Operators:\{#supported-arithmetic-operators}

- `+` (Addition)

- `-` (Subtraction)

- `*` (Multiplication)

- `/` (Division)

- `%` (Modulus)

- `**` (Exponentiation)

### Example 1: Using Modulus (`%`)\{#example-1-using-modulus-percent}

To find entities where the `id` is an even number (i.e., divisible by 2):

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

### Example 2: Using Exponentiation (`**`)\{#example-2-using-exponentiation}

To find entities where `price` raised to the power of 2 is greater than 1000:

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

## Bitwise operators\{#bitwise-operators}

Bitwise operators are useful when an integer field encodes multiple flags, such as permissions, feature flags, or status bits. You can use these operators in filter expressions to check, combine, or compare individual bits in an integer value.

For scalar fields, bitwise operators apply to integer field types, such as `INT8`, `INT16`, `INT32`, and `INT64`.

### Supported bitwise operators\{#supported-bitwise-operators}

| **Operator** | **Name** | **Typical use** |
| --- | --- | --- |
| `&` | Bitwise AND | Check whether specific bits are set. |
| `\|` | Bitwise OR | Combine bits before comparison. |
| `^` | Bitwise XOR | Compare bit differences between two values. |

### Example: Filtering by permission bits\{#example-filtering-by-permission-bits}

Assume you have an integer field named `permissions`, and each bit in the integer represents a permission flag:

| **Permission flag** | **Bit value** |
| --- | --- |
| `READ` | `1` |
| `WRITE` | `2` |
| `SHARE` | `4` |
| `ADMIN` | `8` |

For example, `permissions = 5` means that the `READ` and `SHARE` bits are set, because `5 = 1 + 4`.

To find entities where the `SHARE` bit is set, use bitwise AND (`&`):

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

To find entities where setting the `WRITE` bit produces the `READ + WRITE + SHARE` permission set, use bitwise OR (`|`):

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

To find entities whose permission bits differ from `READ + WRITE + SHARE` by only the `WRITE` bit, use bitwise XOR (`^`):

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

Note: Always wrap the bitwise operation in parentheses before comparing the result, such as `(permissions & 4) == 4`. 

## Logical Operators\{#logical-operators}

Logical operators are used to combine multiple conditions into a more complex filter expression. These include `AND`, `OR`, and `NOT`.

### Supported Logical Operators:\{#supported-logical-operators}

- `AND`: Combines multiple conditions that must all be true.

- `OR`: Combines conditions where at least one must be true.

- `NOT`: Negates a condition.

### Example 1: Using `AND` to Combine Conditions\{#example-1-using-and-to-combine-conditions}

To find all products where `price` is greater than 100 and `stock` is greater than 50:

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

### Example 2: Using `OR` to Combine Conditions\{#example-2-using-or-to-combine-conditions}

To find all products where `color` is either "red" or "blue":

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

### Example 3: Using `NOT` to Exclude a Condition\{#example-3-using-not-to-exclude-a-condition}

To find all products where `color` is not "green":

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

## IS NULL and IS NOT NULL Operators\{#is-null-and-is-not-null-operators}

Use `IS NULL` and `IS NOT NULL` to find entities with missing or available field values. For example, you can find products without a category or entities whose embeddings are ready for search. Both operators work on supported scalar and vector fields, with the same meaning:

| Operator | Matches |
| --- | --- |
| `<field> IS NULL` | Entities whose specified field has a NULL value |
| `<field> IS NOT NULL` | Entities whose specified field has a non-NULL value |

Supported scalar fields include Boolean, numeric, `VARCHAR`, `JSON`, and `ARRAY` fields. These operators do not support [TEXT fields](./use-text-field).

Starting in Milvus 3.0.3, the operators also support ordinary vector fields: `FLOAT_VECTOR`, `BINARY_VECTOR`, `FLOAT16_VECTOR`, `BFLOAT16_VECTOR`, `SPARSE_FLOAT_VECTOR`, and `INT8_VECTOR`.

The operators are case-insensitive: `IS NULL` and `is null` are equivalent, as are `IS NOT NULL` and `is not null`.

### Example: Find entities with missing or available values\{#example-find-entities-with-missing-or-available-values}

Assume a collection named `products` is indexed and loaded. The collection has an `INT64` primary key named `id`, a nullable `VARCHAR` field named `category`, and a nullable, three-dimensional `FLOAT_VECTOR` field named `embedding`. It already contains the following entities:

| `id` | `category` | `embedding` |
| --- | --- | --- |
| `1` | `"book"` | `[0.1, 0.2, 0.3]` |
| `2` | NULL | `[0.4, 0.5, 0.6]` |
| `3` | `"book"` | NULL |

Collection creation and data insertion are omitted. For those steps, see [Nullable Fields](./nullable-fields).

To find entities that still need an embedding, query for `embedding IS NULL`. Adjust the connection settings for your server.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

results = client.query(
    collection_name="products",
    filter="category IS NULL",
    output_fields=["id"],
    limit=10,
)
print(sorted(entity["id"] for entity in results))
# Expected: [2]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.vector.request.QueryReq;
import io.milvus.v2.service.vector.response.QueryResp;
import java.util.Collections;

MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build());

QueryReq queryReq = QueryReq.builder()
        .collectionName("products")
        .filter("category IS NULL")
        .outputFields(Collections.singletonList("id"))
        .limit(10)
        .build();
QueryResp queryResp = client.query(queryReq);
System.out.println(queryResp.getQueryResults());
```

</TabItem>

<TabItem value='go'>

```go
ctx := context.Background()
cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
    APIKey:  "YOUR_CLUSTER_TOKEN",
})
if err != nil {
    log.Fatal("failed to connect to milvus server: ", err.Error())
}
defer cli.Close(ctx)

rs, err := cli.Query(ctx, milvusclient.NewQueryOption("products").
    WithFilter("category IS NULL").
    WithOutputFields("id").
    WithLimit(10))
if err != nil {
    log.Fatal("failed to query: ", err.Error())
}
ids := rs.GetColumn("id")
var result []int64
for i := 0; i < ids.Len(); i++ {
    v, _ := ids.GetAsInt64(i)
    result = append(result, v)
}
fmt.Println(result)
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let client = ClientV2::new(
        &ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN"),
    )
    .await?;

    let request = QueryRequest::builder()
        .collection_name("products")
        .filter("category IS NULL")
        .output_fields(["id"])
        .limit(10)
        .build()?;
    let response = client.query(request).await?;
    for row in response.results().rows()? {
        println!("{:?}", row.get_i64("id")?);
    }
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <string>
#include "milvus/MilvusClientV2.h"

auto client = milvus::MilvusClientV2::Create();

milvus::ConnectParam connect_param{"YOUR_CLUSTER_ENDPOINT"};
auto status = client->Connect(connect_param);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}

auto request = milvus::QueryRequest()
                   .WithCollectionName("products")
                   .WithFilter("category IS NULL")
                   .AddOutputField("id")
                   .WithLimit(10);

milvus::QueryResponse response;
status = client->Query(request, response);
if (!status.IsOk()) {
    std::cout << status.Message() << std::endl;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const client = new MilvusClient({ address: "YOUR_CLUSTER_ENDPOINT", token: "YOUR_CLUSTER_TOKEN" });

const results = await client.query({
  collection_name: "products",
  filter: "category IS NULL",
  output_fields: ["id"],
  limit: 10,
});
console.log(results);
```

</TabItem>

<TabItem value='bash'>

```bash
curl -X 'POST' \
  'YOUR_CLUSTER_ENDPOINT/v2/vectordb/entities/query' \
  -H 'accept: application/json' \
  -H 'Authorization: Bearer YOUR_CLUSTER_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "collectionName": "products",
    "filter": "category IS NULL",
    "outputFields": ["id"],
    "limit": 10
  }'
```

</TabItem>
</Tabs>

Replace the `filter` in the same query to check either field or combine conditions:

| Filter expression | Matching IDs | Purpose |
| --- | --- | --- |
| `category IS NULL` | `2` | Find entities without a category |
| `category IS NOT NULL` | `1`, `3` | Find entities with a category |
| `embedding IS NULL` | `3` | Find entities without an embedding |
| `embedding IS NOT NULL` | `1`, `2` | Find entities with an embedding |
| `category IS NOT NULL AND embedding IS NOT NULL` | `1` | Find entities with both values |

### How field values are treated\{#how-field-values-are-treated}

The operators check the stored field value. For a nullable field without a default value, omitting the field during insertion or explicitly setting it to NULL stores NULL. A configured default value can change what is stored. For details, see [Nullable Fields](./nullable-fields) and [Default Values](./default-fields).

| Field type | NULL behavior |
| --- | --- |
| `VARCHAR` | An empty string `""` is a non-NULL value. |
| `JSON` | A NULL value for the entire field matches `IS NULL`. A JSON object such as `{"category": null}` is non-NULL, even though a value inside it is NULL. |
| `ARRAY` | A NULL value for the entire field matches `IS NULL`. Individual elements cannot be NULL, and `IS NULL` / `IS NOT NULL` do not support array element access such as `tags[0]`. See [Array Field](./use-array-fields). |
| Ordinary vector types | NULL means the vector value is absent. A vector whose components are zero is not NULL. |

For a supported field defined with `nullable=False`, `IS NULL` matches no entities and `IS NOT NULL` matches all visible entities. Other conditions in the filter still apply.

### Use NULL filters in vector search\{#use-null-filters-in-vector-search}

The same operators can be used in search filters, but an entity also needs a vector in the field being searched to participate in similarity search.

Using the example data above, consider a search with `anns_field="embedding"`:

| Filter expression | Entities eligible for similarity search | Reason |
| --- | --- | --- |
| `category IS NULL` | `2` | Entity `2` has no category, but has an `embedding` vector. |
| `embedding IS NULL` | None | Entity `3` matches the filter, but has no `embedding` vector to compare with the query vector. |
| `embedding IS NOT NULL` | `1`, `2` | Both entities have an `embedding` vector. |

All three filters are valid. A search on `embedding` with `embedding IS NULL` returns no hits because no entity can satisfy both requirements. To retrieve the entities with missing embeddings, use `query()` as shown above.

Vector search already skips entities whose searched vector field is NULL, so `embedding IS NOT NULL` does not further narrow the candidates for a search on `embedding`. Ranking, other filters, and the search limit still determine which candidates are returned.

## Tips on Using Basic Operators with JSON and ARRAY Fields\{#tips-on-using-basic-operators-with-json-and-array-fields}

While the basic operators in Zilliz Cloud clusters are versatile and can be applied to scalar fields, they can also be effectively used with the keys and indexes in the JSON and ARRAY fields.

For example, if you have a `product` field that contains multiple keys like `price`, `model`, and `tags`, always reference the key directly:

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

To find records where the first temperature in an array of recorded temperatures exceeds a certain value, use:

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

## Conclusion\{#conclusion}

Zilliz Cloud offers a range of basic operators that give you flexibility in filtering and querying your data. By combining comparison, range, arithmetic, and logical operators, you can create powerful filter expressions to narrow down your search results and retrieve the data you need efficiently.

## FAQ\{#faq}

**Is there a limit to the length of the match value list in filter conditions (e.g., `filter='color in ["red", "green", "blue"]'`)? What should I do if the list is too long?**

Zilliz Cloud does not impose a length limit on the match value list in filter conditions. However, an excessively long list can significantly impact query performance.
If your filter condition includes a long list of match values or a complex expression with many elements, we recommend using [Filter Templating](./filtering-templating) to improve query performance.