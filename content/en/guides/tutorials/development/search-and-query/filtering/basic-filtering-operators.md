---
title: "Basic Operators | Cloud"
slug: /basic-filtering-operators
sidebar_label: "Basic"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud provides a rich set of basic operators to help you filter and query data efficiently. These operators allow you to refine your search conditions based on scalar fields, numeric calculations, logical conditions, and more. Understanding how to use these operators is crucial for building precise queries and maximizing the efficiency of your searches. | Cloud"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Basic Operators

Zilliz Cloud provides a rich set of basic operators to help you filter and query data efficiently. These operators allow you to refine your search conditions based on scalar fields, numeric calculations, logical conditions, and more. Understanding how to use these operators is crucial for building precise queries and maximizing the efficiency of your searches.

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

The `IS NULL` and `IS NOT NULL` operators are used to filter fields based on whether they contain a null value (absence of data).

- `IS NULL`: Identifies entities where a specific field contains a null value, i.e., the value is absent or undefined.

- `IS NOT NULL`: Identifies entities where a specific field contains any value other than null, meaning the field has a valid, defined value.

<Admonition type="info" title="Notes">

The operators are case-insensitive, so you can use `IS NULL` or `is null`, and `IS NOT NULL` or `is not null`.

</Admonition>

### Regular Scalar Fields with Null Values\{#regular-scalar-fields-with-null-values}

Zilliz Cloud allows filtering on regular scalar fields, such as strings or numbers, with null values.

<Admonition type="info" title="Notes">

An empty string `""` is not treated as a null value for a `VARCHAR` field.

</Admonition>

To retrieve entities where the `description` field is null:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'description IS NULL'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "description IS NULL";
```

</TabItem>

<TabItem value='go'>

```go
filter := "description IS NULL"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "description IS NULL";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "description IS NULL";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'description IS NULL';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='description IS NULL'
```

</TabItem>
</Tabs>

To retrieve entities where the `description` field is not null:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'description IS NOT NULL'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "description IS NOT NULL";
```

</TabItem>

<TabItem value='go'>

```go
filter := "description IS NOT NULL"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "description IS NOT NULL";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "description IS NOT NULL";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'description IS NOT NULL';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='description IS NOT NULL'
```

</TabItem>
</Tabs>

To retrieve entities where the `description` field is not null and the `price` field is higher than 10:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'description IS NOT NULL AND price > 10'
```

</TabItem>

<TabItem value='java'>

```java
String filter = "description IS NOT NULL AND price > 10";
```

</TabItem>

<TabItem value='go'>

```go
filter := "description IS NOT NULL AND price > 10"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "description IS NOT NULL AND price > 10";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "description IS NOT NULL AND price > 10";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'description IS NOT NULL AND price > 10';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='description IS NOT NULL AND price > 10'
```

</TabItem>
</Tabs>

### JSON Fields with Null Values\{#json-fields-with-null-values}

Zilliz Cloud allows filtering on JSON fields that contain null values. A JSON field is treated as null in the following ways:

- The entire JSON object is explicitly set to None (null), for example, `{"metadata": None}`.

- The JSON field itself is completely missing from the entity.

<Admonition type="info" title="Notes">

If some elements within a JSON object are null (e.g. individual keys), the field is still considered non-null. For example, `\{"metadata": \{"category": None, "price": 99.99}}` is not treated as null, even though the `category` key is null.

</Admonition>

To further illustrate how Zilliz Cloud handles JSON fields with null values, consider the following sample data with a JSON field `metadata`:

```python
data = [
  {
      "metadata": {"category": "electronics", "price": 99.99, "brand": "BrandA"},
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "metadata": None, # Entire JSON object is null
      "pk": 2,
      "embedding": [0.56, 0.78, 0.90]
  },
  {  # JSON field `metadata` is completely missing
      "pk": 3,
      "embedding": [0.91, 0.18, 0.23]
  },
  {
      "metadata": {"category": None, "price": 99.99, "brand": "BrandA"}, # Individual key value is null
      "pk": 4,
      "embedding": [0.56, 0.38, 0.21]
  }
]
```

**Example 1: Retrieve entities where `metadata` is null**

To find entities where the `metadata` field is either missing or explicitly set to None:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata IS NULL'

# Example output:
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "metadata IS NULL";
```

</TabItem>

<TabItem value='go'>

```go
filter := "metadata IS NULL"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "metadata IS NULL";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "metadata IS NULL";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'metadata IS NULL';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='metadata IS NULL'
```

</TabItem>
</Tabs>

**Example 2: Retrieve entities where `metadata` is not null**

To find entities where the `metadata` field is not null:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "metadata IS NOT NULL";
```

</TabItem>

<TabItem value='go'>

```go
filter := "metadata IS NOT NULL"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "metadata IS NOT NULL";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "metadata IS NOT NULL";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'metadata IS NOT NULL';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='metadata IS NOT NULL'
```

</TabItem>
</Tabs>

### ARRAY Fields with Null Values\{#array-fields-with-null-values}

Zilliz Cloud allows filtering on ARRAY fields that contain null values. An ARRAY field is treated as null in the following ways:

- The entire ARRAY field is explicitly set to None (null), for example, `"tags": None`.

- The ARRAY field is completely missing from the entity.

<Admonition type="info" title="Notes">

An ARRAY field cannot contain partial null values as all elements in an ARRAY field must have the same data type. For details, refer to [Array Field](./use-array-fields).

</Admonition>

To further illustrate how Zilliz Cloud handles ARRAY fields with null values, consider the following sample data with an ARRAY field `tags`:

```python
data = [
  {
      "tags": ["pop", "rock", "classic"],
      "ratings": [5, 4, 3],
      "pk": 1,
      "embedding": [0.12, 0.34, 0.56]
  },
  {
      "tags": None,  # Entire ARRAY is null
      "ratings": [4, 5],
      "pk": 2,
      "embedding": [0.78, 0.91, 0.23]
  },
  {  # The tags field is completely missing
      "ratings": [9, 5],
      "pk": 3,
      "embedding": [0.18, 0.11, 0.23]
  }
]
```

**Example 1: Retrieve entities where `tags` is null**

To retrieve entities where the `tags` field is either missing or explicitly set to `None`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'tags IS NULL'

# Example output:
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "tags IS NULL";
```

</TabItem>

<TabItem value='go'>

```go
filter := "tags IS NULL"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "tags IS NULL";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "tags IS NULL";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'tags IS NULL';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='tags IS NULL'
```

</TabItem>
</Tabs>

**Example 2: Retrieve entities where `tags` is not null**

To retrieve entities where the `tags` field is not null:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'tags IS NOT NULL'

# Example output:
# data: [
#     "{'tags': ['pop', 'rock', 'classic'], 'ratings': [5, 4, 3], 'embedding': [0.12, 0.34, 0.56], 'pk': 1}"
# ]
```

</TabItem>

<TabItem value='java'>

```java
String filter = "tags IS NOT NULL";
```

</TabItem>

<TabItem value='go'>

```go
filter := "tags IS NOT NULL"
```

</TabItem>

<TabItem value='rust'>

```rust
let filter = "tags IS NOT NULL";
```

</TabItem>

<TabItem value='c++'>

```c++
std::string filter = "tags IS NOT NULL";
```

</TabItem>

<TabItem value='javascript'>

```javascript
const filter = 'tags IS NOT NULL';
```

</TabItem>

<TabItem value='bash'>

```bash
filter='tags IS NOT NULL'
```

</TabItem>
</Tabs>

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