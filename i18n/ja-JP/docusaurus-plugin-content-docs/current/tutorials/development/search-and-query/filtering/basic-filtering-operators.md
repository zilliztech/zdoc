---
title: "基本演算子 | Cloud"
slug: /basic-filtering-operators
sidebar_label: "基本"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud は、エンティティをフィルタリングするための比較、範囲、算術、論理、および NULL 演算子を提供します。各演算子は特定のフィールド型をサポートします。 | Cloud"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 基本演算子

Zilliz Cloud は、エンティティをフィルタリングするための比較、範囲、算術、論理、および NULL 演算子を提供します。各演算子は特定のフィールド型をサポートします。

<Admonition type="info" title="Notes">

フィルタ式の左辺のリテラルには、以下の例で使用されている `status` や `color` などのコレクションフィールド名、または `filter = 'struct[0][subfield] > 10'` のように、特定の要素インデックスにある StructArray サブフィールドの名前を指定できます。

StructArray フィールドでのスカラーフィルタリングの詳細については、[StructArray 演算子](./struct-array-filtering) を参照してください。

</Admonition>

## 比較演算子\{#comparison-operators}

比較演算子は、等価性、非等価性、または大小に基づいてデータをフィルタリングするために使用します。数値フィールドとテキストフィールドに適用されます。

### サポートされる比較演算子：\{#supported-comparison-operators}

- `==`（等しい）

- `!=`（等しくない）

- `>`（より大きい）

- `<`（より小さい）

- `>=`（以上）

- `<=`（以下）

### 例 1：等しい（`==`）によるフィルタリング\{#example-1-filtering-with-equal-to}

`status` という名前のフィールドがあり、`status` が "active" であるすべてのエンティティを検索するとします。等価演算子 `==` を使用できます：

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

### 例 2：等しくない（`!=`）によるフィルタリング\{#example-2-filtering-with-not-equal-to}

`status` が "inactive" でないエンティティを検索するには：

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

### 例 3：より大きい（`>`）によるフィルタリング\{#example-3-filtering-with-greater-than-greater}

`age` が 30 より大きいすべてのエンティティを検索する場合は、次のようにします：

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

### 例 4：より小さいによるフィルタリング\{#example-4-filtering-with-less-than}

`price` が 100 より小さいエンティティを検索するには：

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

### 例 5：以上（`>=`）によるフィルタリング\{#example-5-filtering-with-greater-than-or-equal-to-greater}

`rating` が 4 以上のすべてのエンティティを検索する場合は、次のようにします：

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

### 例 6：以下によるフィルタリング\{#example-6-filtering-with-less-than-or-equal-to}

`discount` が 10% 以下のエンティティを検索するには：

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

## 範囲演算子\{#range-operators}

範囲演算子は、特定の値の集合に基づいてデータをフィルタリングするのに役立ちます。Zilliz Cloud は、集合のメンバーシップチェック用に `IN` をサポートしています。

`color` が "red"、"green"、"blue" のいずれかであるすべてのエンティティを検索するには：

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

これは、値のリストに含まれているかどうかを確認する場合に便利です。

## パターンマッチ演算子\{#pattern-matching-operators}

パターンマッチ演算子は、ワイルドカードパターンまたは正規表現に基づいて文字列値をフィルタリングするのに役立ちます。

- `LIKE`：文字列値に対する単純なワイルドカードパターンのマッチングに使用します。たとえば、`name LIKE "Prod%"` は `Prod` で始まる値にマッチします。

- `=~`：文字列値を RE2 正規表現でマッチングするために使用します。たとえば、`code =~ "E[0-9]{4}"` は `E1001` などのエラーコードを含む値にマッチします。

- `!~`：RE2 正規表現にマッチする文字列値を除外するために使用します。これは `NOT (field =~ "pattern")` と同等です。

`name` が `Prod` で始まるエンティティを検索するには：

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

`code` に `E1001` などのエラーコードが含まれるエンティティを検索するには：

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

`message` が `DEBUG` で始まるエンティティを除外するには：

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

`LIKE` と正規表現の選択、サポートされるフィールド型、正規表現の構文、エスケープ規則、パフォーマンスの詳細については、[パターンマッチング](./pattern-match) を参照してください。Zilliz Cloud では、`VARCHAR` フィールドまたは JSON 文字列パスに `NGRAM` インデックスを構築して、対象となるパターンマッチフィルターを高速化することもできます。詳細については、[NGRAM](./ngram-index-type) を参照してください。

## 算術演算子\{#arithmetic-operators}

算術演算子を使用すると、数値フィールドを含む計算に基づいて条件を作成できます。

### サポートされる算術演算子：\{#supported-arithmetic-operators}

- `+`（加算）

- `-`（減算）

- `*`（乗算）

- `/`（除算）

- `%`（剰余）

- `**`（べき乗）

### 例 1：剰余（`%`）の使用\{#example-1-using-modulus-percent}

`id` が偶数（つまり 2 で割り切れる）であるエンティティを検索するには：

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

### 例 2：べき乗（`**`）の使用\{#example-2-using-exponentiation}

`price` を 2 乗した値が 1000 より大きいエンティティを検索するには：

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

## ビット演算子\{#bitwise-operators}

ビット演算子は、整数フィールドがパーミッション、機能フラグ、ステータスビットなどの複数のフラグをエンコードしている場合に役立ちます。これらの演算子をフィルタ式で使用すると、整数値の個々のビットをチェック、結合、または比較できます。

スカラーフィールドの場合、ビット演算子は `INT8`、`INT16`、`INT32`、`INT64` などの整数フィールド型に適用されます。

### サポートされるビット演算子\{#supported-bitwise-operators}

| **演算子** | **名前** | **一般的な用途** |
| --- | --- | --- |
| `&` | ビット単位の AND | 特定のビットがセットされているかを確認します。 |
| `\|` | ビット単位の OR | 比較の前にビットを結合します。 |
| `^` | ビット単位の XOR | 2 つの値間のビットの差異を比較します。 |

### 例：パーミッションビットによるフィルタリング\{#example-filtering-by-permission-bits}

`permissions` という名前の整数フィールドがあり、整数の各ビットがパーミッションフラグを表しているとします：

| **パーミッションフラグ** | **ビット値** |
| --- | --- |
| `READ` | `1` |
| `WRITE` | `2` |
| `SHARE` | `4` |
| `ADMIN` | `8` |

たとえば、`permissions = 5` は、`5 = 1 + 4` であるため、`READ` ビットと `SHARE` ビットがセットされていることを意味します。

`SHARE` ビットがセットされているエンティティを検索するには、ビット単位の AND（`&`）を使用します：

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

`WRITE` ビットをセットすると `READ + WRITE + SHARE` のパーミッションセットになるエンティティを検索するには、ビット単位の OR（`|`）を使用します：

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

パーミッションビットが `READ + WRITE + SHARE` と `WRITE` ビットだけ異なるエンティティを検索するには、ビット単位の XOR（`^`）を使用します：

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

注記：結果を比較する前に、`(permissions & 4) == 4` のように、ビット演算を必ず括弧で囲んでください。

## 論理演算子\{#logical-operators}

論理演算子は、複数の条件をより複雑なフィルタ式に結合するために使用します。これには `AND`、`OR`、`NOT` が含まれます。

### サポートされる論理演算子：\{#supported-logical-operators}

- `AND`：すべてが true でなければならない複数の条件を結合します。

- `OR`：少なくとも 1 つが true でなければならない条件を結合します。

- `NOT`：条件を否定します。

### 例 1：`AND` を使用した条件の結合\{#example-1-using-and-to-combine-conditions}

`price` が 100 より大きく、かつ `stock` が 50 より大きいすべての製品を検索するには：

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

### 例 2：`OR` を使用した条件の結合\{#example-2-using-or-to-combine-conditions}

`color` が "red" または "blue" のいずれかであるすべての製品を検索するには：

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

### 例 3：`NOT` を使用した条件の除外\{#example-3-using-not-to-exclude-a-condition}

`color` が "green" でないすべての製品を検索するには：

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

## IS NULL 演算子と IS NOT NULL 演算子\{#is-null-and-is-not-null-operators}

`IS NULL` と `IS NOT NULL` は、フィールド値が欠落しているエンティティまたは利用可能なエンティティを検索するために使用します。たとえば、カテゴリを持たない製品や、埋め込みが検索可能な状態にあるエンティティを検索できます。どちらの演算子も、サポートされているスカラーフィールドとベクトルフィールドに対して同じ意味で機能します：

| 演算子 | 一致する対象 |
| --- | --- |
| `<field> IS NULL` | 指定されたフィールドが NULL 値を持つエンティティ |
| `<field> IS NOT NULL` | 指定されたフィールドが非 NULL 値を持つエンティティ |

サポートされるスカラーフィールドには、Boolean、数値、`VARCHAR`、`JSON`、`ARRAY` フィールドが含まれます。これらの演算子は [TEXT フィールド](./use-text-field) をサポートしていません。

Milvus 3.0.3 以降では、これらの演算子は通常のベクトルフィールドもサポートします：`FLOAT_VECTOR`、`BINARY_VECTOR`、`FLOAT16_VECTOR`、`BFLOAT16_VECTOR`、`SPARSE_FLOAT_VECTOR`、`INT8_VECTOR`。

これらの演算子では大文字と小文字が区別されません：`IS NULL` と `is null` は同等であり、`IS NOT NULL` と `is not null` も同様です。

### 例：値が欠落しているエンティティまたは利用可能な値を持つエンティティの検索\{#example-find-entities-with-missing-or-available-values}

`products` という名前のコレクションがインデックス化され、ロードされているとします。このコレクションには、`id` という名前の `INT64` プライマリキー、`category` という名前の Null 許容 `VARCHAR` フィールド、および `embedding` という名前の Null 許容の 3 次元 `FLOAT_VECTOR` フィールドがあります。すでに次のエンティティが含まれています：

| `id` | `category` | `embedding` |
| --- | --- | --- |
| `1` | `"book"` | `[0.1, 0.2, 0.3]` |
| `2` | NULL | `[0.4, 0.5, 0.6]` |
| `3` | `"book"` | NULL |

コレクションの作成とデータの挿入は省略します。これらの手順については、[Null 許容フィールド](./nullable-fields) を参照してください。

まだ埋め込みが必要なエンティティを検索するには、`embedding IS NULL` でクエリを実行します。サーバーに合わせて接続設定を調整してください。

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

同じクエリ内の `filter` を置き換えて、いずれかのフィールドをチェックしたり、条件を組み合わせたりします：

| フィルタ式 | 一致する ID | 目的 |
| --- | --- | --- |
| `category IS NULL` | `2` | カテゴリを持たないエンティティを検索します。 |
| `category IS NOT NULL` | `1`, `3` | カテゴリを持つエンティティを検索します。 |
| `embedding IS NULL` | `3` | 埋め込みを持たないエンティティを検索します。 |
| `embedding IS NOT NULL` | `1`, `2` | 埋め込みを持つエンティティを検索します。 |
| `category IS NOT NULL AND embedding IS NOT NULL` | `1` | 両方の値を持つエンティティを検索します。 |

### フィールド値の扱い\{#how-field-values-are-treated}

演算子は保存されているフィールド値をチェックします。デフォルト値のない Null 許容フィールドでは、挿入時にフィールドを省略するか、明示的に NULL に設定すると、NULL が保存されます。設定されたデフォルト値によって保存内容が変わることがあります。詳細については、[Null 許容フィールド](./nullable-fields) と [デフォルト値](./default-fields) を参照してください。

| フィールド型 | NULL の動作 |
| --- | --- |
| `VARCHAR` | 空文字列 `""` は非 NULL 値です。 |
| `JSON` | フィールド全体の NULL 値は `IS NULL` に一致します。`{"category": null}` のような JSON オブジェクトは、その内部の値が NULL であっても非 NULL です。 |
| `ARRAY` | フィールド全体の NULL 値は `IS NULL` に一致します。個々の要素は NULL にできず、`IS NULL` / `IS NOT NULL` は `tags[0]` のような配列要素へのアクセスをサポートしていません。[Array フィールド](./use-array-fields) を参照してください。 |
| 通常のベクトル型 | NULL はベクトル値が存在しないことを意味します。成分がゼロのベクトルは NULL ではありません。 |

`nullable=False` で定義されたサポート対象のフィールドの場合、`IS NULL` はどのエンティティにも一致せず、`IS NOT NULL` は表示可能なすべてのエンティティに一致します。フィルタ内のその他の条件は引き続き適用されます。

### ベクトル検索での NULL フィルターの使用\{#use-null-filters-in-vector-search}

同じ演算子を検索フィルターでも使用できますが、類似検索に参加するには、検索対象のフィールドにベクトルを持つエンティティである必要があります。

上記のサンプルデータを使用して、`anns_field="embedding"` を指定した検索を考えます：

| フィルタ式 | 類似検索の対象となるエンティティ | 理由 |
| --- | --- | --- |
| `category IS NULL` | `2` | エンティティ `2` はカテゴリを持ちませんが、`embedding` ベクトルを持っています。 |
| `embedding IS NULL` | なし | エンティティ `3` はフィルターに一致しますが、クエリベクトルと比較する `embedding` ベクトルを持っていません。 |
| `embedding IS NOT NULL` | `1`, `2` | どちらのエンティティも `embedding` ベクトルを持っています。 |

3 つのフィルターはすべて有効です。`embedding IS NULL` を指定して `embedding` を検索しても、両方の要件を満たせるエンティティがないため、ヒットは返されません。埋め込みが欠落しているエンティティを取得するには、上記のように `query()` を使用します。

ベクトル検索では、検索対象のベクトルフィールドが NULL であるエンティティはすでにスキップされるため、`embedding IS NOT NULL` を指定しても `embedding` の検索候補はさらに絞り込まれません。ランキング、その他のフィルター、検索上限によって、返される候補が決まります。

## JSON フィールドと ARRAY フィールドで基本演算子を使用する際のヒント\{#tips-on-using-basic-operators-with-json-and-array-fields}

Zilliz Cloud クラスターの基本演算子は汎用性が高く、スカラーフィールドに適用できますが、JSON フィールドと ARRAY フィールドのキーやインデックスに対しても効果的に使用できます。

たとえば、`price`、`model`、`tags` などの複数のキーを含む `product` フィールドがある場合は、常にキーを直接参照してください：

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

記録された気温の配列の最初の気温が特定の値を超えるレコードを検索するには、次のようにします：

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

## まとめ\{#conclusion}

Zilliz Cloud は、データのフィルタリングとクエリに柔軟性をもたらすさまざまな基本演算子を提供します。比較演算子、範囲演算子、算術演算子、論理演算子を組み合わせることで、強力なフィルタ式を作成して検索結果を絞り込み、必要なデータを効率的に取得できます。

## FAQ\{#faq}

**フィルタ条件内のマッチ値リストの長さに制限はありますか（例：`filter='color in ["red", "green", "blue"]'`）？リストが長すぎる場合はどうすればよいですか？**

Zilliz Cloud は、フィルタ条件内のマッチ値リストの長さに制限を設けていません。ただし、リストが過度に長いと、クエリのパフォーマンスに大きく影響する可能性があります。
フィルタ条件に長いマッチ値リストや、要素の多い複雑な式が含まれる場合は、クエリのパフォーマンスを向上させるために [フィルタテンプレート](./filtering-templating) の使用をお勧めします。
