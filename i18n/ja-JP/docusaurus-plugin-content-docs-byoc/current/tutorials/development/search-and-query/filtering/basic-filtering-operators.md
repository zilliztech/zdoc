---
title: "基本演算子 | BYOC"
slug: /basic-filtering-operators
sidebar_label: "基本"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、エンティティをフィルタリングするための比較演算子、範囲演算子、算術演算子、論理演算子、NULL 演算子を提供します。各演算子は特定のフィールド型をサポートします。 | BYOC"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基本演算子

Zilliz Cloud は、エンティティをフィルタリングするための比較演算子、範囲演算子、算術演算子、論理演算子、NULL 演算子を提供します。各演算子は特定のフィールド型をサポートしています。

<Admonition type="info" title="Notes">

フィルタ式の左辺のリテラルには、以下の例で使用している `status`、`color` などのコレクションフィールド名、または `filter = 'struct[0][subfield] > 10'` のように特定の要素インデックスにある StructArray サブフィールドの名前を指定できます。

StructArray フィールドでのスカラーフィルタリングの詳細については、[StructArray 演算子](./struct-array-filtering) を参照してください。

</Admonition>

## 比較演算子\{#comparison-operators}

比較演算子は、等価性、不等価性、または大小関係に基づいてデータをフィルタリングするために使用します。数値フィールドとテキストフィールドに適用できます。

### サポートされている比較演算子：\{#supported-comparison-operators}

- `==`（等しい）

- `!=`（等しくない）

- `>`（より大きい）

- `<`（より小さい）

- `>=`（以上）

- `<=`（以下）

### 例 1：等価演算子（`==`）を使用したフィルタリング\{#example-1-filtering-with-equal-to}

`status` という名前のフィールドがあり、`status` が "active" であるすべてのエンティティを検索するとします。この場合は、等価演算子 `==` を使用できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "status == \"active\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='status == "active"'
```

</TabItem>
</Tabs>

### 例 2：不等演算子（`!=`）を使用したフィルタリング\{#example-2-filtering-with-not-equal-to}

`status` が "inactive" でないエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "status != \"inactive\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='status != "inactive"'
```

</TabItem>
</Tabs>

### 例 3：より大きい（`>`）を使用したフィルタリング\{#example-3-filtering-with-greater-than-greater}

`age` が 30 より大きいすべてのエンティティを検索する場合は、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "age > 30";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='age > 30'
```

</TabItem>
</Tabs>

### 例 4：より小さいを使用したフィルタリング\{#example-4-filtering-with-less-than}

`price` が 100 より小さいエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "price < 100";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='price < 100'
```

</TabItem>
</Tabs>

### 例 5：以上（`>=`）を使用したフィルタリング\{#example-5-filtering-with-greater-than-or-equal-to-greater}

`rating` が 4 以上であるすべてのエンティティを検索する場合は、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "rating >= 4";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='rating >= 4'
```

</TabItem>
</Tabs>

### 例 6：以下を使用したフィルタリング\{#example-6-filtering-with-less-than-or-equal-to}

`discount` が 10% 以下であるエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "discount <= 10";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='discount <= 10'
```

</TabItem>
</Tabs>

## 範囲演算子\{#range-operators}

範囲演算子は、特定の値のセットに基づいてデータをフィルタリングするのに役立ちます。Zilliz Cloud は、セットのメンバーシップチェックに `IN` をサポートしています。

`color` が "red"、"green"、"blue" のいずれかであるすべてのエンティティを検索する場合は、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

これは、値のリストに含まれているかどうかを確認する場合に便利です。

## パターンマッチング演算子\{#pattern-matching-operators}

パターンマッチング演算子は、ワイルドカードパターンまたは正規表現に基づいて文字列値をフィルタリングするのに役立ちます。

- `LIKE`：文字列値に対して単純なワイルドカードパターンを照合するために使用します。たとえば、`name LIKE "Prod%"` は `Prod` で始まる値に一致します。

- `=~`：文字列値を RE2 正規表現と照合するために使用します。たとえば、`code =~ "E[0-9]{4}"` は `E1001` などのエラーコードを含む値に一致します。

- `!~`：RE2 正規表現に一致する文字列値を除外するために使用します。これは `NOT (field =~ "pattern")` と同等です。

`name` が `Prod` で始まるエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "name LIKE \"Prod%\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='name LIKE "Prod%"'
```

</TabItem>
</Tabs>

`code` に `E1001` などのエラーコードが含まれるエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "code =~ \"E[0-9]{4}\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='code =~ "E[0-9]{4}"'
```

</TabItem>
</Tabs>

`message` が `DEBUG` で始まるエンティティを除外するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "message !~ \"^DEBUG\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='message !~ "^DEBUG"'
```

</TabItem>
</Tabs>

`LIKE` と正規表現の選択、サポートされているフィールド型、正規表現の構文、エスケープ規則、パフォーマンスの詳細については、[パターンマッチング](./pattern-match) を参照してください。Zilliz Cloud では、`VARCHAR` フィールドまたは JSON 文字列パスに `NGRAM` インデックスを構築して、対象となるパターンマッチングフィルタを高速化することもできます。詳細については、[NGRAM](./ngram-index-type) を参照してください。

## 算術演算子\{#arithmetic-operators}

算術演算子を使用すると、数値フィールドを含む計算に基づいて条件を作成できます。

### サポートされている算術演算子：\{#supported-arithmetic-operators}

- `+`（加算）

- `-`（減算）

- `*`（乗算）

- `/`（除算）

- `%`（剰余）

- `**`（べき乗）

### 例 1：剰余（`%`）を使用する\{#example-1-using-modulus-percent}

`id` が偶数（つまり、2 で割り切れる）であるエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "id % 2 == 0";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='id % 2 == 0'
```

</TabItem>
</Tabs>

### 例 2：べき乗（`**`）を使用する\{#example-2-using-exponentiation}

`price` の 2 乗が 1000 より大きいエンティティを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'price > 1000'
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

<TabItem value='csharp'>

```csharp
string filter = "price > 1000";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='price ** 2 > 1000'
```

</TabItem>
</Tabs>

## ビット演算子 | PUBLIC\{#bitwise-operators-or-public}

ビット演算子は、整数フィールドが権限、機能フラグ、ステータスビットなどの複数のフラグをエンコードしている場合に便利です。これらの演算子をフィルタ式で使用すると、整数値の個々のビットを確認、結合、または比較できます。

スカラーフィールドの場合、ビット演算子は `INT8`、`INT16`、`INT32`、`INT64` などの整数フィールド型に適用されます。

### サポートされているビット演算子\{#supported-bitwise-operators}

| **演算子** | **名前** | **一般的な用途** |
| --- | --- | --- |
| `&` | ビット単位の AND | 特定のビットが設定されているかどうかを確認します。 |
| `\|` | ビット単位の OR | 比較の前にビットを結合します。 |
| `^` | ビット単位の XOR | 2 つの値のビットの違いを比較します。 |

### 例：権限ビットによるフィルタリング\{#example-filtering-by-permission-bits}

`permissions` という名前の整数フィールドがあり、整数内の各ビットが権限フラグを表すとします。

| **権限フラグ** | **ビット値** |
| --- | --- |
| `READ` | `1` |
| `WRITE` | `2` |
| `SHARE` | `4` |
| `ADMIN` | `8` |

たとえば、`permissions = 5` は `READ` ビットと `SHARE` ビットが設定されていることを意味します。これは `5 = 1 + 4` であるためです。

`SHARE` ビットが設定されているエンティティを検索するには、ビット単位の AND（`&`）を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

`WRITE` ビットを設定すると `READ + WRITE + SHARE` の権限セットになるエンティティを検索するには、ビット単位の OR（`|`）を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "(permissions | 2) == 7";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='(permissions | 2) == 7'
```

</TabItem>
</Tabs>

権限ビットが `READ + WRITE + SHARE` と `WRITE` ビットだけ異なるエンティティを検索するには、ビット単位の XOR（`^`）を使用します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "(permissions ^ 7) == 2";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='(permissions ^ 7) == 2'
```

</TabItem>
</Tabs>

注：結果を比較する前に、`(permissions & 4) == 4` のようにビット演算を常にかっこで囲みます。

## 論理演算子\{#logical-operators}

論理演算子は、複数の条件を組み合わせて、より複雑なフィルタ式を作成するために使用します。これらには `AND`、`OR`、`NOT` が含まれます。

### サポートされている論理演算子：\{#supported-logical-operators}

- `AND`：複数の条件を結合し、すべてが true である必要があります。

- `OR`：条件を結合し、少なくとも 1 つが true である必要があります。

- `NOT`：条件を否定します。

### 例 1：`AND` を使用した条件の結合\{#example-1-using-and-to-combine-conditions}

`price` が 100 より大きく、`stock` が 50 より大きいすべての商品を検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "price > 100 AND stock > 50";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='price > 100 AND stock > 50'
```

</TabItem>
</Tabs>

### 例 2：`OR` を使用した条件の結合\{#example-2-using-or-to-combine-conditions}

`color` が "red" または "blue" であるすべての商品を検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "color == \"red\" OR color == \"blue\"";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='color == "red" OR color == "blue"'
```

</TabItem>
</Tabs>

### 例 3：`NOT` を使用した条件の除外\{#example-3-using-not-to-exclude-a-condition}

`color` が "green" でないすべての商品を検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'NOT (color == "green")'
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

<TabItem value='csharp'>

```csharp
string filter = "NOT (color == \"green\")";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='NOT color == "green"'
```

</TabItem>
</Tabs>

## IS NULL 演算子と IS NOT NULL 演算子\{#is-null-and-is-not-null-operators}

`IS NULL` と `IS NOT NULL` を使用して、フィールド値が見つからないエンティティまたは利用可能なエンティティを検索します。たとえば、カテゴリのない商品や、検索の準備ができた埋め込みを持つエンティティを検索できます。どちらの演算子も、サポートされているスカラーフィールドとベクトルフィールドで同じ意味で動作します。

| 演算子 | 一致する対象 |
| --- | --- |
| `<field> IS NULL` | 指定したフィールドに NULL 値があるエンティティ |
| `<field> IS NOT NULL` | 指定したフィールドに NULL 以外の値があるエンティティ |

サポートされているスカラーフィールドには、Boolean、数値、`VARCHAR`、`JSON`、`ARRAY` フィールドが含まれます。これらの演算子は [TEXT フィールド](./use-text-field) をサポートしていません。

Milvus 3.0.3 以降、これらの演算子は通常のベクトルフィールド（`FLOAT_VECTOR`、`BINARY_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`SPARSE_FLOAT_VECTOR`、`INT8_VECTOR`）もサポートしています。

演算子では大文字と小文字が区別されません。`IS NULL` と `is null`、および `IS NOT NULL` と `is not null` はそれぞれ同等です。

### 例：値が見つからない、または利用可能なエンティティを検索する\{#example-find-entities-with-missing-or-available-values}

`products` という名前のコレクションがインデックス化され、ロードされているとします。コレクションには、`id` という名前の `INT64` 主キー、`category` という名前の NULL 許容 `VARCHAR` フィールド、および `embedding` という名前の NULL 許容の 3 次元 `FLOAT_VECTOR` フィールドがあります。すでに次のエンティティが含まれています。

| `id` | `category` | `embedding` |
| --- | --- | --- |
| `1` | `"book"` | `[0.1, 0.2, 0.3]` |
| `2` | NULL | `[0.4, 0.5, 0.6]` |
| `3` | `"book"` | NULL |

コレクションの作成とデータの挿入は省略します。これらの手順については、[NULL 許容フィールド](./nullable-fields) を参照してください。

まだ埋め込みが必要なエンティティを検索するには、`embedding IS NULL` でクエリを実行します。サーバーに合わせて接続設定を調整してください。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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
import (
    "context"
    "fmt"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

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
// Expected: [2]
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

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

<TabItem value='csharp'>

```csharp
using Milvus.Client.V2;
using Milvus.Client.V2.Requests.Dql;
using Milvus.Client.V2.Types;

var config = new ConnectConfig
{
    Uri = "YOUR_CLUSTER_ENDPOINT"
};
using var client = new MilvusClientV2(config);
await client.ConnectAsync();

QueryResp results = await client.QueryAsync(new QueryReq
{
    CollectionName = "products",
    Expression = "category IS NULL",
    Parameters = new QueryParameters
    {
        OutputFields = { "id" },
        Limit = 10
    }
});

for (int i = 0; i < results.RowCount; i++)
{
    Console.WriteLine(results.GetRow(i)["id"]);
}
// Output
// 2
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

同じクエリ内の `filter` を置き換えて、いずれかのフィールドを確認するか、条件を組み合わせます。

| フィルタ式 | 一致する ID | 目的 |
| --- | --- | --- |
| `category IS NULL` | `2` | カテゴリのないエンティティを検索します。 |
| `category IS NOT NULL` | `1`、`3` | カテゴリのあるエンティティを検索します。 |
| `embedding IS NULL` | `3` | 埋め込みのないエンティティを検索します。 |
| `embedding IS NOT NULL` | `1`、`2` | 埋め込みのあるエンティティを検索します。 |
| `category IS NOT NULL AND embedding IS NOT NULL` | `1` | 両方の値を持つエンティティを検索します。 |

### フィールド値の扱い\{#how-field-values-are-treated}

演算子は、保存されているフィールド値を確認します。デフォルト値のない NULL 許容フィールドでは、挿入時にフィールドを省略するか、明示的に NULL に設定すると、NULL が保存されます。設定されたデフォルト値によって、保存される内容が変わる場合があります。詳細については、[NULL 許容フィールド](./nullable-fields) および [デフォルト値](./default-fields) を参照してください。

| フィールド型 | NULL の動作 |
| --- | --- |
| `VARCHAR` | 空文字列 `""` は NULL 以外の値です。 |
| `JSON` | フィールド全体の NULL 値は `IS NULL` に一致します。`{"category": null}` のような JSON オブジェクトは、内部の値が NULL であっても NULL 以外です。 |
| `ARRAY` | フィールド全体の NULL 値は `IS NULL` に一致します。個々の要素を NULL にすることはできず、`IS NULL` / `IS NOT NULL` は `tags[0]` のような配列要素へのアクセスをサポートしていません。[配列フィールド](./use-array-fields) を参照してください。 |
| 通常のベクトル型 | NULL はベクトル値が存在しないことを意味します。成分がゼロのベクトルは NULL ではありません。 |

`nullable=False` で定義されたサポート対象のフィールドでは、`IS NULL` はどのエンティティにも一致せず、`IS NOT NULL` は表示可能なすべてのエンティティに一致します。フィルタ内の他の条件も引き続き適用されます。

### ベクトル検索での NULL フィルタの使用\{#use-null-filters-in-vector-search}

同じ演算子を検索フィルタで使用できますが、類似検索に参加するには、検索対象のフィールドにベクトルを持つエンティティである必要もあります。

上記の例のデータを使用して、`anns_field="embedding"` を指定した検索を考えます。

| フィルタ式 | 類似検索の対象となるエンティティ | 理由 |
| --- | --- | --- |
| `category IS NULL` | `2` | エンティティ `2` にはカテゴリがありませんが、`embedding` ベクトルがあります。 |
| `embedding IS NULL` | なし | エンティティ `3` はフィルタに一致しますが、クエリベクトルと比較するための `embedding` ベクトルがありません。 |
| `embedding IS NOT NULL` | `1`、`2` | どちらのエンティティにも `embedding` ベクトルがあります。 |

3 つのフィルタはすべて有効です。`embedding IS NULL` を指定して `embedding` を検索しても、両方の要件を満たすエンティティはないため、ヒットは返されません。埋め込みがないエンティティを取得するには、上記のように `query()` を使用します。

ベクトル検索では、検索対象のベクトルフィールドが NULL のエンティティがすでにスキップされるため、`embedding IS NOT NULL` を指定しても、`embedding` の検索候補はさらに絞り込まれません。返される候補は、ランキング、他のフィルタ、検索制限によって決まります。

## JSON フィールドおよび ARRAY フィールドで基本演算子を使用するためのヒント\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloud クラスターの基本演算子は汎用性が高く、スカラーフィールドに適用できるだけでなく、JSON フィールドおよび ARRAY フィールドのキーとインデックスにも効果的に使用できます。

たとえば、`price`、`model`、`tags` などの複数のキーを含む `product` フィールドがある場合は、常にキーを直接参照します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "product[\"price\"] > 1000";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='product["price"] > 1000'
```

</TabItem>
</Tabs>

記録された気温の配列のうち、最初の気温が特定の値を超えるレコードを検索するには、次のようにします。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"},{"label":"CSharp","value":"csharp"},{"label":"cURL","value":"bash"}]}>
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

<TabItem value='csharp'>

```csharp
string filter = "history_temperatures[0] > 30";
```

</TabItem>

<TabItem value='bash'>

```bash
filter='history_temperatures[0] > 30'
```

</TabItem>
</Tabs>

## まとめ\{#conclusion}

Zilliz Cloud は、データのフィルタリングとクエリを柔軟に行える一連の基本演算子を提供します。比較演算子、範囲演算子、算術演算子、論理演算子を組み合わせることで、強力なフィルタ式を作成し、検索結果を絞り込んで、必要なデータを効率的に取得できます。

## FAQ\{#faq}

**フィルタ条件の一致値リストの長さに制限はありますか（たとえば、`filter='color in ["red", "green", "blue"]'`）。リストが長すぎる場合はどうすればよいですか？**

Zilliz Cloud は、フィルタ条件の一致値リストに長さの制限を設けていません。ただし、リストが過度に長いと、クエリのパフォーマンスに大きく影響する可能性があります。
フィルタ条件に長い一致値リストまたは多数の要素を含む複雑な式が含まれる場合は、クエリのパフォーマンスを向上させるために [フィルターテンプレート](./filtering-templating) の使用をお勧めします。
