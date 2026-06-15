---
title: "JSON Indexing | Cloud"
slug: /json-indexing
sidebar_label: "Indexing"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "JSON fields provide a flexible way to store structured metadata in Zilliz Cloud. Without indexing, queries on JSON fields require full collection scans, which become slow as your dataset grows. JSON indexing creates an index on a specific path within your JSON data so equality, range, and other filter queries on that path run fast. | Cloud"
type: origin
token: MBVVww2Zii8k6Bk77GJcXbZJnpf
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# JSON Indexing

JSON fields provide a flexible way to store structured metadata in Zilliz Cloud. Without indexing, queries on JSON fields require full collection scans, which become slow as your dataset grows. JSON indexing creates an index on a specific path within your JSON data so equality, range, and other filter queries on that path run fast.

JSON indexing is ideal for:

- Structured schemas with consistent, known keys

- Equality, `IN`, range, and text-match queries on specific JSON paths

- Scenarios where you need precise control over which keys are indexed

For complex JSON documents with diverse query patterns, consider [JSON Shredding](./json-shredding) as an alternative.

## Index type overview\{#index-type-overview}

Zilliz Cloud offers four index types for JSON paths. Each is suited to a different query pattern.

Before choosing an index type, identify the **cast type** for the JSON path. The cast type determines how Zilliz Cloud interprets the value at that path and which index types are available.

### Understand cast types\{#understand-cast-types}

`json_cast_type` is the data type used to interpret and index the value at `json_path`. It is different from the field schema type: the field is still a `JSON` field, but each indexed path is treated as a specific scalar, array, or JSON object type.

Choose the cast type that matches the values stored at the path. To check whether a cast type works with a specific index type, see [Compatibility reference](./json-indexing#compatibility-reference).

| Cast type | Use when the path value is... | Example value |
| --- | --- | --- |
| `BOOL` | A Boolean value | `true` |
| `DOUBLE` | A numeric value | `99.99` |
| `VARCHAR` | A string value | `"electronics"` |
| `ARRAY_BOOL` | An array of Boolean values | `[true, false]` |
| `ARRAY_DOUBLE` | An array of numeric values | `[1.2, 3.14]` |
| `ARRAY_VARCHAR` | An array of string values | `["tag1", "tag2"]` |
| `JSON` | An entire JSON object or sub-object | `{"supplier": {"country": "USA"}}` |

If values at the same path have inconsistent types, only values that match the cast type are indexed. For example, if `metadata["price"]` contains both `99.99` and `"99.99"`, an index of the `DOUBLE` cast type includes the numeric value and skips the string value. To convert string values during indexing, use `json_cast_function`; see [Example 5: Convert data type at index time](./json-indexing#example-5-convert-data-type-at-index-time).

### Choose an index type\{#choose-an-index-type}

After you choose a cast type, choose the index type according to your query pattern.

| Query pattern | Recommended index type | Cast type requirement | Notes |
| --- | --- | --- | --- |
| Mixed equality and range filters on scalar values | `AUTOINDEX` | Use `BOOL`, `DOUBLE`, or `VARCHAR`. | Lets Zilliz Cloud choose the internal index layout based on value cardinality. |
| Filters on values inside JSON arrays | `INVERTED` | Use `ARRAY_BOOL`, `ARRAY_DOUBLE`, or `ARRAY_VARCHAR`. | Required for all array cast types. |
| Whole-object or sub-object indexing | `INVERTED` or `AUTOINDEX` | Use `JSON`. | `AUTOINDEX` uses `INVERTED` instead of cardinality-based selection for `JSON` cast type. |
| Range filters on numbers or sortable strings | `STL_SORT` or `AUTOINDEX` | Use `DOUBLE` or `VARCHAR`. | Use `STL_SORT` to force a sorted layout; use `AUTOINDEX` when you want automatic selection. |
| Equality or `IN` filters on low-cardinality values | `BITMAP` or `AUTOINDEX` | Use `BOOL` or `VARCHAR`. | Use `BITMAP` to force a bitmap layout. For numeric values, use `AUTOINDEX` or `STL_SORT`. |

When in doubt, start with `AUTOINDEX` for scalar paths. Use `INVERTED` explicitly for array cast types and text-match queries. For whole-object JSON indexing, use either `INVERTED` or `AUTOINDEX`.

### AUTOINDEX\{#autoindex}

`AUTOINDEX` behavior depends on the `json_cast_type` you specify. 

| Cast type | `AUTOINDEX` behavior |
| --- | --- |
| `BOOL`, `DOUBLE`, `VARCHAR` | Chooses between `BITMAP` and `STL_SORT` based on value cardinality. |
| `ARRAY_BOOL`, `ARRAY_DOUBLE`, `ARRAY_VARCHAR` | Not supported. Use `INVERTED` explicitly as the index type. |
| `JSON` | Uses `INVERTED` for whole-object or sub-object indexing. |

For scalar cast types (`BOOL`, `DOUBLE`, and `VARCHAR`), `AUTOINDEX` is the recommended starting point when you want Zilliz Cloud to choose the internal index layout. During index build, Zilliz Cloud measures the **cardinality** of the values at the JSON path. Cardinality means the number of distinct values at that path.

Based on cardinality, Zilliz Cloud chooses one of two internal layouts:

- **Low cardinality**: Values repeat often, such as `metadata["in_stock"]` with `true` and `false`, or `metadata["status"]` with a small set of status strings. Zilliz Cloud builds a `BITMAP` index internally for fast equality and `IN` filters.

- **High cardinality**: Most values are distinct, such as `metadata["price"]`, `metadata["created_at"]`, or `metadata["product_id"]`. Zilliz Cloud builds an `STL_SORT` index internally for fast range filters such as `>`, `<`, `>=`, and `<=`.

The default `BITMAP`-vs-`STL_SORT` threshold is **100 distinct values**. You can tune this threshold with `bitmap_cardinality_limit`; see [How do I tune AUTOINDEX's BITMAP-vs-STL_SORT threshold](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)[?](./json-indexing#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold)

### INVERTED\{#inverted}

`INVERTED` is the best fit when you need text-match queries, array indexing, or whole-object JSON indexing.

Specify `INVERTED` explicitly when:

- You need to index values inside JSON arrays.

- You need to index an entire JSON object or sub-object and want to make the `INVERTED` behavior explicit.

- You want one index type that handles equality, `IN`, range, text-match, array, and object-level queries, at the cost of a larger index size.

For entire JSON objects (`json_cast_type="JSON"`), you can use either `INVERTED` or `AUTOINDEX`. `AUTOINDEX` uses `INVERTED` for this cast type.

For details, see [INVERTED](./inverted-index-type).

### STL_SORT\{#stlsort}

`STL_SORT` stores values from a JSON path in sorted order. It is optimized for range filters on numeric values or sortable string values.

`STL_SORT` supports only `DOUBLE` and `VARCHAR` cast types. Use it when:

- Your filters compare values with `>`, `<`, `>=`, or `<=`.

- The indexed values have high cardinality, such as prices, timestamps, IDs, or sortable codes.

- You want to force a sorted layout instead of letting `AUTOINDEX` choose.

`STL_SORT` does not support `BOOL`, `ARRAY_*`, or `JSON` cast types. Use `INVERTED` for arrays or whole-object indexing.

For details, see [STL_SORT](./slt-sort-index-type).

### BITMAP\{#bitmap}

`BITMAP` creates a compact bitmap for each distinct value at a JSON path. It is optimized for equality and `IN` filters on values that repeat often.

`BITMAP` supports only `BOOL` and `VARCHAR` cast types. Use it when:

- Your filters use `==` or `IN`.

- The indexed values have low cardinality, such as booleans, status values, or a small set of categories.

- You want to force a bitmap layout instead of letting `AUTOINDEX` choose.

`BITMAP` does not support `DOUBLE`, `ARRAY_*`, or `JSON` cast types. For numeric values, use `AUTOINDEX`, `STL_SORT`, or `INVERTED` instead.

For details, see [BITMAP](./bitmap-index-type).

### Compatibility reference\{#compatibility-reference}

Use the following matrix as a quick reference for supported `(cast type, index type)` combinations.

| Cast type | Description | Example value | AUTOINDEX | INVERTED | STL_SORT | BITMAP |
| --- | --- | --- | --- | --- | --- | --- |
| `BOOL` | Boolean values (`true`/`false`). | `true` | ✓ | ✓ | — | ✓ |
| `DOUBLE` | Numeric values (integers or floats). | `99.99` | ✓ | ✓ | ✓ | — |
| `VARCHAR` | String values. | `"electronics"` | ✓ | ✓ | ✓ | ✓ |
| `ARRAY_BOOL` | Array of booleans. | `[true, false]` | — | ✓ | — | — |
| `ARRAY_DOUBLE` | Array of numbers. | `[1.2, 3.14]` | — | ✓ | — | — |
| `ARRAY_VARCHAR` | Array of strings. | `["tag1", "tag2"]` | — | ✓ | — | — |
| `JSON` | An entire JSON object or sub-object with automatic type inference and flattening. | any nested object | ✓ | ✓ | — | — |

For cells marked `—`, Zilliz Cloud rejects the request at index-creation time. For array cast types, use `INVERTED` explicitly (`AUTOINDEX` does not cover arrays).

## Create a JSON index\{#create-a-json-index}

This section walks through indexing different shapes of JSON data. All examples use the sample structure below and assume you already have a collection that includes a `JSON` field named `metadata`.

### Sample JSON structure\{#sample-json-structure}

```json
{
  "metadata": {
    "category": "electronics",
    "brand": "BrandA",
    "in_stock": true,
    "price": 99.99,
    "string_price": "99.99",
    "tags": ["clearance", "summer_sale"],
    "supplier": {
      "name": "SupplierX",
      "country": "USA",
      "contact": {
        "email": "support@supplierx.com",
        "phone": "+1-800-555-0199"
      }
    }
  }
}
```

### Basic setup\{#basic-setup}

The examples below assume you have a `MilvusClient` named `client` connected to your Zilliz Cloud deployment, and a collection that already includes a `JSON` field named `metadata`. If you need to set those up from scratch, expand the block below.

<details>

<summary>Connect and create a sample collection</summary>

```python
from pymilvus import DataType, MilvusClient

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Define a schema with a JSON field
schema = client.create_schema(enable_dynamic_field=False)
schema.add_field("pk", DataType.INT64, is_primary=True, auto_id=False)
schema.add_field("vec", DataType.FLOAT_VECTOR, dim=4)
schema.add_field("metadata", DataType.JSON, nullable=True)

# Minimal vector index so the collection can be loaded
vec_index = client.prepare_index_params()
vec_index.add_index(field_name="vec", index_type="AUTOINDEX", metric_type="L2")

client.create_collection(
    collection_name="your_collection_name",
    schema=schema,
    index_params=vec_index,
)

# Insert one row that matches the sample JSON structure above
client.insert(
    collection_name="your_collection_name",
    data=[{
        "pk": 1,
        "vec": [0.1, 0.2, 0.3, 0.4],
        "metadata": {
            "category": "electronics",
            "brand": "BrandA",
            "in_stock": True,
            "price": 99.99,
            "string_price": "99.99",
            "tags": ["clearance", "summer_sale"],
            "supplier": {
                "name": "SupplierX",
                "country": "USA",
                "contact": {
                    "email": "support@supplierx.com",
                    "phone": "+1-800-555-0199"
                }
            }
        }
    }],
)
```

</details>

Prepare an index-params object to collect the index definitions added in the examples below:

```python
index_params = client.prepare_index_params()
```

Each example that follows shows one `index_params.add_index(...)` call. Pick the ones that match your data and call them on the same `index_params` object — then apply everything in a single `client.create_index(...)` call at the end (see Apply the index).

### Example 1: Index a top-level key with AUTOINDEX\{#example-1-index-a-top-level-key-with-autoindex}

Index the `category` field for fast filtering by product category. With `AUTOINDEX`, Zilliz Cloud picks `BITMAP` or `STL_SORT` based on how many distinct categories exist in your data.

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="category_index",
    # highlight-start
    params={
        "json_path": 'metadata["category"]',
        "json_cast_type": "VARCHAR",
    }
    # highlight-end
)
```

### Example 2: Index a nested key\{#example-2-index-a-nested-key}

Index the deeply nested `email` field for supplier contact lookups. The `json_path` parameter accepts any depth of bracket notation.

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="email_index",
    # highlight-start
    params={
        "json_path": 'metadata["supplier"]["contact"]["email"]',
        "json_cast_type": "VARCHAR",
    }
    # highlight-end
)
```

### Example 3: Range queries with STL_SORT\{#example-3-range-queries-with-stlsort}

When you know your queries on a path will be dominated by range comparisons (`>`, `<`, `>=`, `<=`), pick `STL_SORT` directly. This bypasses cardinality measurement and builds the sorted layout immediately.

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="STL_SORT",
    index_name="price_index",
    params={
        "json_path": 'metadata["price"]',
        "json_cast_type": "DOUBLE",
    }
)
```

After indexing, range queries like `metadata["price"] > 50 AND metadata["price"] < 100` use binary search instead of a full scan.

### Example 4: Equality queries with BITMAP\{#example-4-equality-queries-with-bitmap}

For low-cardinality keys — status codes, booleans, enum-like strings — pick `BITMAP` directly. Equality and `IN` queries become bitmap operations.

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="BITMAP",
    index_name="in_stock_index",
    params={
        "json_path": 'metadata["in_stock"]',
        "json_cast_type": "BOOL",
    }
)
```

`BITMAP` is also a strong fit for fields like a `status` column with a handful of distinct string values.

### Example 5: Convert data type at index time\{#example-5-convert-data-type-at-index-time}

When numeric data is mistakenly stored as strings, use `STRING_TO_DOUBLE` to convert the value to a number during index build.

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="string_to_double_index",
    params={
        "json_path": 'metadata["string_price"]',
        "json_cast_type": "DOUBLE",
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE",
    }
)
```

If conversion fails for a row (e.g., a non-numeric string like `"invalid"`), that row is skipped during indexing.

### Example 6: Index entire JSON objects\{#example-6-index-entire-json-objects}

Setting `json_cast_type="JSON"` indexes the full structure at the given path. Zilliz Cloud flattens nested objects into paths and automatically infers each value's type. All keys under the path become searchable.

`AUTOINDEX` transparently uses `INVERTED` for `JSON` cast type, since flattening and type inference are inverted-index capabilities.

Index the entire `metadata` object:

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="metadata_full_index",
    params={
        # highlight-start
        "json_path": "metadata",
        "json_cast_type": "JSON",
        # highlight-end
    }
)
```

Or index a sub-object — for example, all `supplier` information:

```python
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX",
    index_name="supplier_index",
    params={
        # highlight-start
        "json_path": 'metadata["supplier"]',
        "json_cast_type": "JSON",
        # highlight-end
    }
)
```

Indexing entire objects increases index size. For deeply nested documents with diverse query patterns, consider JSON Shredding.

### Apply the index\{#apply-the-index}

After adding all your index parameters, apply them to your collection:

```python
client.create_index(
    collection_name="your_collection_name",
    index_params=index_params
)
```

Index builds run asynchronously. Use `client.describe_index(...)` to check the build state of a specific index — the `state` field shows `Finished` once the build is done, and `total_rows` / `indexed_rows` / `pending_index_rows` show progress along the way.

```python
client.describe_index(
    collection_name="your_collection_name",
    index_name="category_index",
)
```

Sample response:

```json
{
  "json_path": "metadata[\"category\"]",
  "json_cast_type": "VARCHAR",
  "index_type": "AUTOINDEX",
  "field_name": "metadata",
  "index_name": "category_index",
  "total_rows": 20,
  "indexed_rows": 20,
  "pending_index_rows": 0,
  "state": "Finished"
}
```

Once `state` reports `Finished`, queries against the indexed path use the new index automatically.

For `AUTOINDEX` entries, the `index_type` field in this response is reported as `AUTOINDEX` — Zilliz Cloud does not currently expose which underlying layout (`BITMAP` or `STL_SORT`) was chosen at build time. Treat the choice as an internal optimization: equality, `IN`, and range queries against the path will work regardless of which layout was selected.

## FAQ\{#faq}

### How do I choose between AUTOINDEX and an explicit index type?\{#how-do-i-choose-between-autoindex-and-an-explicit-index-type}

Start with `AUTOINDEX`. It picks the right layout from your data's cardinality, and it covers most equality, `IN`, and range queries on JSON paths. Pick an explicit type when:

- You know your query pattern (e.g., always range → `STL_SORT`; always equality on low-cardinality → `BITMAP`) and want to skip cardinality measurement.

- You need text-match or substring queries → `INVERTED`.

- You're indexing array cast types or an entire JSON object → `INVERTED` (or `AUTOINDEX` for the entire-object case).

### What happens if a query's filter expression uses a different type than the indexed cast type?\{#what-happens-if-a-querys-filter-expression-uses-a-different-type-than-the-indexed-cast-type}

If your filter expression uses a different type than the index's `json_cast_type`, Zilliz Cloud does not use the index and may fall back to a slower brute-force scan if the data allows. For best performance, always align your filter expression with the cast type of the index. For example, if a numeric index is created with `json_cast_type="DOUBLE"`, only numeric filter conditions will leverage the index.

### What if a JSON key has inconsistent data types across different entities?\{#what-if-a-json-key-has-inconsistent-data-types-across-different-entities}

Inconsistent types can lead to **partial indexing**. For example, if `metadata["price"]` is stored as both a number (`99.99`) and a string (`"99.99"`) and you create an index with `json_cast_type="DOUBLE"`, only the numeric values are indexed. String-form entries are skipped and won't appear in filter results. Use `json_cast_function="STRING_TO_DOUBLE"` to coerce strings to numbers at index time, or fix the source data so all entries share one type.

### Can I create multiple indexes on the same JSON key?\{#can-i-create-multiple-indexes-on-the-same-json-key}

No. Zilliz Cloud allows at most one index per `(field, json_path)` pair, regardless of cast type or index type. You cannot create both an `INVERTED` and a `BITMAP` index on the same path, or two indexes on the same path with different cast types. You can, however, create an index on the entire JSON object and a separate index on a nested key within that object — those are different paths.

### How do I tune AUTOINDEX's BITMAP-vs-STL_SORT threshold?\{#how-do-i-tune-autoindexs-bitmap-vs-stlsort-threshold}

By default, `AUTOINDEX` picks `BITMAP` when the indexed values have **100 or fewer distinct values** and `STL_SORT` otherwise. You can override this threshold by adding `"bitmap_cardinality_limit"` to your index parameters (range: 1–1000):

```python
index_params.add_index(
    field_name="metadata",
    index_type="AUTOINDEX",
    index_name="string_to_double_index",
    params={
    "json_path": 'metadata["category"]',
    "json_cast_type": "VARCHAR",
    # highlight-next-line
    "bitmap_cardinality_limit": 200,  # use BITMAP up to 200 distinct values
    }
)
```

Most users don't need to tune this. Raise it if you have a moderately-cardinal field you'd prefer bitmapped; lower it to push `AUTOINDEX` toward `STL_SORT` sooner. The setting is ignored when you specify `INVERTED`, `STL_SORT`, or `BITMAP` explicitly.