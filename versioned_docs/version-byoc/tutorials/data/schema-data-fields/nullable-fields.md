---
title: "Nullable Fields | BYOC"
slug: /nullable-fields
sidebar_key: nullable-fields
sidebar_label: "Nullable Fields"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud supports nullable fields, which allow a field value to be missing or explicitly set to NULL. Nullability is defined at the schema level and applies consistently across data ingestion, indexing, search, and query operations. | BYOC"
type: origin
token: DjROwgK6ziCf7Rkoji6ccyEUnsg
sidebar_position: 14
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - nullable

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Nullable Fields

Zilliz Cloud supports nullable fields, which allow a field value to be missing or explicitly set to NULL. Nullability is defined at the schema level and applies consistently across data ingestion, indexing, search, and query operations.

Use nullable fields when:

- Data is ingested from external systems that allow missing values

- Some metadata is optional or only available for part of the dataset

- Vector embeddings are generated asynchronously and inserted later

## Limits\{#limits}

- Vector fields that allow NULL values do not support `IS NULL` or `IS NOT NULL` filter expressions. You cannot explicitly filter entities based on whether a vector field value is NULL.

- Array of Structs fields do not support NULL values. You cannot mark an Array of Structs field or any field nested inside it as nullable.

- The `nullable` attribute is defined when a field is created and cannot be modified afterward. You cannot enable or disable nullability for an existing field.

- Fields marked as nullable cannot be used as partition keys. Partition key fields must always contain valid, non-null values.

## What is a nullable field?\{#what-is-a-nullable-field}

In Zilliz Cloud, whether a field is allowed to store a NULL value is controlled by a schema-level field attribute named `nullable`.

When a field is defined with `nullable=True`, Zilliz Cloud allows the field value to be missing during data ingestion. In practice, Zilliz Cloud treats the following two inputs as equivalent and stores the field value as NULL:

- The field is omitted from the input entity

- The field is explicitly set to NULL (for example, `None` in Python)

If a field is not defined as nullable (the default behavior), every entity must provide a valid value for that field. Omitting the field or explicitly assigning a NULL value will cause the insert or import operation to fail.

The nullable attribute is supported for both **scalar and vector fields** in a collection schema. However, Array of Structs fields do not support the nullable attribute.

<Admonition type="info" icon="📘" title="Notes">

<p>Nullability determines whether a field value may be missing; it does not define what value is used when a field is missing.</p>
<ul>
<li><p>If a nullable field is configured without a default value, omitting the field results in a stored NULL value.</p></li>
<li><p>If a default value is configured, Zilliz Cloud may store the default value instead. For details, see <a href="./default-fields">Default Values</a>.</p></li>
</ul>

</Admonition>

## Define a nullable field in the collection schema\{#define-a-nullable-field-in-the-collection-schema}

To use nullable fields, you must enable the `nullable` attribute when defining the collection schema.

In this example, the collection schema defines a vector field named `embedding` with `nullable=True`. This allows entities in the collection to omit the vector value or explicitly set it to NULL during data ingestion.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(
    uri="YOUR_CLUSTER_ENDPOINT",
    token="YOUR_CLUSTER_TOKEN"
)

# Define schema fields
schema = client.create_schema()
schema.add_field("id", DataType.INT64, is_primary=True) # Primary field
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=4,
    # highlight-next-line
    nullable=True, # Enable the nullable attribute; defaults to False
)

client.create_collection(
    collection_name="my_collection",
    schema=schema,
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

In this schema:

- The `embedding` field is explicitly marked as nullable.

- Entities may omit the `embedding` field or assign it a NULL value during insertion.

- The decision to allow NULL values is fixed at collection creation time.

For clarity, the following examples focus on a nullable vector field (`embedding`). Defining nullable scalar fields is optional and not required to follow the rest of this guide.

<details>

<summary>**Optional: Define a nullable scalar field**</summary>

Scalar fields can also be defined as nullable using the same `nullable` attribute and follow the same rules during ingestion. For example:

```python
schema.add_field(
    field_name="age",
    datatype=DataType.INT64,
    # highlight-next-line
    nullable=True,
)
```

</details>

## Insert behavior with missing or NULL values\{#insert-behavior-with-missing-or-null-values}

Once a field is defined as nullable in the collection schema, Zilliz Cloud allows the field value to be missing or explicitly set to NULL during data ingestion.

The example below inserts three entities into the collection created in [Step 1](./nullable-fields#define-a-nullable-field-in-the-collection-schema), demonstrating these different cases.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
data = [
    {
        "id": 1,
        "embedding": [0.1, 0.2, 0.3, 0.4],
    },
    {
        "id": 2,
        "embedding": None,   # Explicitly set to NULL
    },
    {
        "id": 3,             # Field omitted → stored as NULL
    },
]

client.insert(
    collection_name="my_collection",
    data=data,
)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

In this example:

- Entity **id = 1** provides a valid vector value.

- Entity **id = 2** explicitly assigns a NULL value to the embedding field.

- Entity **id = 3** omits the embedding field entirely; Zilliz Cloud stores it as NULL.

## Index behavior on nullable fields\{#index-behavior-on-nullable-fields}

After inserting data, you can build an index on a nullable field as usual. The key difference is how Zilliz Cloud handles NULL values during index construction:

- Only entities with non-null values are added to the index.

- Entities with NULL values are skipped and do not participate in index building.

For a nullable vector field, this means only entities with valid vectors become searchable by vector similarity.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Set index parameters
index_params = client.prepare_index_params()
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE",
)

# Create index
client.create_index(
    collection_name="my_collection",
    index_params=index_params,
)

# Load collection for future search operations
client.load_collection(collection_name="my_collection")
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

At this point:

- Entities with valid `embedding` values are indexed and ready for search.

- Entities whose `embedding` is NULL remain in the collection, but they are not included in the vector index.

## Search behavior with nullable fields\{#search-behavior-with-nullable-fields}

When you perform search operations on a nullable field, Zilliz Cloud evaluates only entities with non-null values for the field used in the search. Entities whose vector field is NULL are skipped automatically.

For a nullable vector field such as `embedding` in this example:

- Only entities with valid vector values are evaluated and ranked.

- Entities with NULL vectors do not cause errors.

- If the number of valid vectors is smaller than the requested topK (`limit`), Zilliz Cloud may return fewer results than `limit`.

The following example performs a vector search on the nullable vector field `embedding`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="my_collection",
    data=[[0.1, 0.2, 0.3, 0.4]],
    anns_field="embedding",
    limit=3,
    output_fields=["embedding"],
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

In this search:

- Only entities with non-null `embedding` values are considered candidates.

- Entities with NULL values for `embedding` are excluded from evaluation.

- The number of returned results depends on how many valid vectors exist in the collection.

## Query & filtering implications\{#query-and-filtering-implications}

The previous examples focus on vector fields. This section describes how NULL values behave in **scalar filter expressions**.

Scalar fields can be defined with `nullable=True` and follow the same ingestion rules as vector fields. However, **NULL scalar values always evaluate to false in filter expressions**.

For example, given a nullable scalar field `age`, the following filter selects entities whose `age` is greater than 18:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "age > 18"
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

Entities where `age` is NULL are excluded from the results because a NULL value does not satisfy the filter condition.

Similarly, equality checks do not match NULL values. For example:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
expr = "status == \"active\""
```

</TabItem>

<TabItem value='java'>

```java
// java
```

</TabItem>

<TabItem value='javascript'>

```javascript
// js
```

</TabItem>

<TabItem value='go'>

```go
// go
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
```

</TabItem>
</Tabs>

Entities where `status` is NULL are excluded from the results.

## Applicable rules\{#applicable-rules}

When both `nullable` and `default_value` are configured for a field, the following rules determine how Zilliz Cloud handles NULL input or missing field values during insertion.

<table>
   <tr>
     <th><p>Nullable</p></th>
     <th><p>Default Value</p></th>
     <th><p>User Input</p></th>
     <th><p>Result</p></th>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>✅ (non-NULL)</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Uses the default value</p></td>
   </tr>
   <tr>
     <td><p>✅</p></td>
     <td><p>❌</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Stored as NULL</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅ (non-NULL)</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Uses the default value</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>❌</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Throws an error</p></td>
   </tr>
   <tr>
     <td><p>❌</p></td>
     <td><p>✅ (NULL)</p></td>
     <td><p>NULL or omitted</p></td>
     <td><p>Throws an error</p></td>
   </tr>
</table>

**Key takeaways:**

- When a field has a non-NULL default value, that value is used regardless of whether `nullable` is enabled.

- When `nullable=True` but no default value is set, the field stores NULL.

- When `nullable=False` and no default value is set, insertion fails with an error.

- Setting a NULL default value on a non-nullable field is invalid and causes an error.

