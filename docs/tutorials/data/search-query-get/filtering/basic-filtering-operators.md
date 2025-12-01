---
title: "Basic Operators | Cloud"
slug: /basic-filtering-operators
sidebar_label: "Basic Operators"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud provides a rich set of basic operators to help you filter and query data efficiently. These operators allow you to refine your search conditions based on scalar fields, numeric calculations, logical conditions, and more. Understanding how to use these operators is crucial for building precise queries and maximizing the efficiency of your searches. | Cloud"
type: origin
token: LBbUwOGcwi1UMak3eE2cM1gvnUe
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - data
  - filter
  - filtering expressions
  - filtering
  - basic operators
  - Pinecone vs Milvus
  - Chroma vs Milvus
  - Annoy vector search
  - milvus

---

import Admonition from '@theme/Admonition';


# Basic Operators

Zilliz Cloud provides a rich set of basic operators to help you filter and query data efficiently. These operators allow you to refine your search conditions based on scalar fields, numeric calculations, logical conditions, and more. Understanding how to use these operators is crucial for building precise queries and maximizing the efficiency of your searches.

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

```python
filter = 'status == "active"'
```

### Example 2: Filtering with Not Equal To (`!=`)\{#example-2-filtering-with-not-equal-to}

To find entities where `status` is not "inactive":

```python
filter = 'status != "inactive"'
```

### Example 3: Filtering with Greater Than (`>`)\{#example-3-filtering-with-greater-than-greater}

If you want to find all entities with an `age` greater than 30:

```python
filter = 'age > 30'
```

### Example 4: Filtering with Less Than\{#example-4-filtering-with-less-than}

To find entities where `price` is less than 100:

```python
filter = 'price < 100'
```

### Example 5: Filtering with Greater Than or Equal To (`>=`)\{#example-5-filtering-with-greater-than-or-equal-to-greater}

If you want to find all entities with `rating` greater than or equal to 4:

```python
filter = 'rating >= 4'
```

### Example 6: Filtering with Less Than or Equal To\{#example-6-filtering-with-less-than-or-equal-to}

To find entities with `discount` less than or equal to 10%:

```python
filter = 'discount <= 10'
```

## Range operators\{#range-operators}

Range operators help filter data based on specific sets or ranges of values.

### Supported Range Operators:\{#supported-range-operators}

- `IN`: Used to match values within a specific set or range.

- `LIKE`: Used to match a pattern (mostly for text fields).

### Example 1: Using `IN` to Match Multiple Values\{#example-1-using-in-to-match-multiple-values}

If you want to find all entities where the `color` is either "red", "green", or "blue":

```python
filter = 'color in ["red", "green", "blue"]'
```

This is useful when you want to check for membership in a list of values.

### Example 2: Using `LIKE` for Pattern Matching\{#example-2-using-like-for-pattern-matching}

The `LIKE` operator is used for pattern matching in string fields. It can match substrings in different positions within the text: as a **prefix**, **infix**, or **suffix**. The `LIKE` operator uses the `%` symbol as a wildcard, which can match any number of characters (including zero).

<Admonition type="info" icon="📘" title="Notes">

<p>In most cases, <strong>infix</strong> or <strong>suffix</strong> matching is significantly slower than prefix matching. Use them with caution if performance is critical.</p>

</Admonition>

### Prefix Match (Starts With)\{#prefix-match-starts-with}

To perform a **prefix** match, where the string starts with a given pattern, you can place the pattern at the beginning and use `%` to match any characters following it. For example, to find all products whose `name` starts with "Prod":

```python
filter = 'name LIKE "Prod%"'
```

This will match any product whose name starts with "Prod", such as "Product A", "Product B", etc.

### Suffix Match (Ends With)\{#suffix-match-ends-with}

For a **suffix** match, where the string ends with a given pattern, place the `%` symbol at the beginning of the pattern. For example, to find all products whose `name` ends with "XYZ":

```python
filter = 'name LIKE "%XYZ"'
```

This will match any product whose name ends with "XYZ", such as "ProductXYZ", "SampleXYZ", etc.

### Infix Match (Contains)\{#infix-match-contains}

To perform an **infix** match, where the pattern can appear anywhere in the string, you can place the `%` symbol at both the beginning and the end of the pattern. For example, to find all products whose `name` contains the word "Pro":

```python
filter = 'name LIKE "%Pro%"'
```

This will match any product whose name contains the substring "Pro", such as "Product", "ProLine", or "SuperPro".

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

```python
filter = 'id % 2 == 0'
```

### Example 2: Using Exponentiation (`**`)\{#example-2-using-exponentiation}

To find entities where `price` raised to the power of 2 is greater than 1000:

```python
filter = 'price ** 2 > 1000'
```

## Logical Operators\{#logical-operators}

Logical operators are used to combine multiple conditions into a more complex filter expression. These include `AND`, `OR`, and `NOT`.

### Supported Logical Operators:\{#supported-logical-operators}

- `AND`: Combines multiple conditions that must all be true.

- `OR`: Combines conditions where at least one must be true.

- `NOT`: Negates a condition.

### Example 1: Using `AND` to Combine Conditions\{#example-1-using-and-to-combine-conditions}

To find all products where `price` is greater than 100 and `stock` is greater than 50:

```python
filter = 'price > 100 AND stock > 50'
```

### Example 2: Using `OR` to Combine Conditions\{#example-2-using-or-to-combine-conditions}

To find all products where `color` is either "red" or "blue":

```python
filter = 'color == "red" OR color == "blue"'
```

### Example 3: Using `NOT` to Exclude a Condition\{#example-3-using-not-to-exclude-a-condition}

To find all products where `color` is not "green":

```python
filter = 'NOT color == "green"'
```

## IS NULL and IS NOT NULL Operators\{#is-null-and-is-not-null-operators}

The `IS NULL` and `IS NOT NULL` operators are used to filter fields based on whether they contain a null value (absence of data).

- `IS NULL`: Identifies entities where a specific field contains a null value, i.e., the value is absent or undefined.

- `IS NOT NULL`: Identifies entities where a specific field contains any value other than null, meaning the field has a valid, defined value.

<Admonition type="info" icon="📘" title="Notes">

<p>The operators are case-insensitive, so you can use <code>IS NULL</code> or <code>is null</code>, and <code>IS NOT NULL</code> or <code>is not null</code>.</p>

</Admonition>

### Regular Scalar Fields with Null Values\{#regular-scalar-fields-with-null-values}

Zilliz Cloud allows filtering on regular scalar fields, such as strings or numbers, with null values.

<Admonition type="info" icon="📘" title="Notes">

<p>An empty string <code>""</code> is not treated as a null value for a <code>VARCHAR</code> field.</p>

</Admonition>

To retrieve entities where the `description` field is null:

```python
filter = 'description IS NULL'
```

To retrieve entities where the `description` field is not null:

```python
filter = 'description IS NOT NULL'
```

To retrieve entities where the `description` field is not null and the `price` field is higher than 10:

```python
filter = 'description IS NOT NULL AND price > 10'
```

### JSON Fields with Null Values\{#json-fields-with-null-values}

Zilliz Cloud allows filtering on JSON fields that contain null values. A JSON field is treated as null in the following ways:

- The entire JSON object is explicitly set to None (null), for example, `{"metadata": None}`.

- The JSON field itself is completely missing from the entity.

<Admonition type="info" icon="📘" title="Notes">

<p>If some elements within a JSON object are null (e.g. individual keys), the field is still considered non-null. For example, <code>\{"metadata": \{"category": None, "price": 99.99}}</code> is not treated as null, even though the <code>category</code> key is null.</p>

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

**Example 1: Retrieve entities where metadata is null**

To find entities where the `metadata` field is either missing or explicitly set to None:

```python
filter = 'metadata IS NULL'

# Example output:
# data: [
#     "{'metadata': None, 'pk': 2}",
#     "{'metadata': None, 'pk': 3}"
# ]
```

**Example 2: Retrieve entities where metadata is not null**

To find entities where the `metadata` field is not null:

```python
filter = 'metadata IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

### ARRAY Fields with Null Values\{#array-fields-with-null-values}

Zilliz Cloud allows filtering on ARRAY fields that contain null values. An ARRAY field is treated as null in the following ways:

- The entire ARRAY field is explicitly set to None (null), for example, `"tags": None`.

- The ARRAY field is completely missing from the entity.

<Admonition type="info" icon="📘" title="Notes">

<p>An ARRAY field cannot contain partial null values as all elements in an ARRAY field must have the same data type. For details, refer to <a href="./use-array-fields">Array Field</a>.</p>

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

**Example 1: Retrieve entities where tags is null**

To retrieve entities where the `tags` field is either missing or explicitly set to `None`:

```python
filter = 'tags IS NULL'

# Example output:
# data: [
#     "{'tags': None, 'ratings': [4, 5], 'embedding': [0.78, 0.91, 0.23], 'pk': 2}",
#     "{'tags': None, 'ratings': [9, 5], 'embedding': [0.18, 0.11, 0.23], 'pk': 3}"
# ]
```

**Example 2: Retrieve entities where tags is not null**

To retrieve entities where the `tags` field is not null:

```python
filter = 'tags IS NOT NULL'

# Example output:
# data: [
#     "{'metadata': {'category': 'electronics', 'price': 99.99, 'brand': 'BrandA'}, 'pk': 1}",
#     "{'metadata': {'category': None, 'price': 99.99, 'brand': 'BrandA'}, 'pk': 4}"
# ]
```

## Tips on Using Basic Operators with JSON and ARRAY Fields\{#tips-on-using-basic-operators-with-json-and-array-fields}

While the basic operators in Zilliz Cloud clusters are versatile and can be applied to scalar fields, they can also be effectively used with the keys and indexes in the JSON and ARRAY fields.

For example, if you have a `product` field that contains multiple keys like `price`, `model`, and `tags`, always reference the key directly:

```python
filter = 'product["price"] > 1000'
```

To find records where the first temperature in an array of recorded temperatures exceeds a certain value, use:

```python
filter = 'history_temperatures[0] > 30'
```

## Conclusion\{#conclusion}

Zilliz Cloud offers a range of basic operators that give you flexibility in filtering and querying your data. By combining comparison, range, arithmetic, and logical operators, you can create powerful filter expressions to narrow down your search results and retrieve the data you need efficiently.

## FAQ\{#faq}

**Is there a limit to the length of the match value list in filter conditions (e.g., filter='color in ["red", "green", "blue"]')? What should I do if the list is too long?**

Zilliz Cloud does not impose a length limit on the match value list in filter conditions. However, an excessively long list can significantly impact query performance.
If your filter condition includes a long list of match values or a complex expression with many elements, we recommend using [Filter Templating](./filtering-templating) to improve query performance.