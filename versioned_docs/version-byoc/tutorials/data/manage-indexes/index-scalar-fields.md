---
title: "Index Scalar Fields | BYOC"
slug: /index-scalar-fields
sidebar_label: "Index Scalar Fields"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud supports indexing on scalar fields (non-vector fields) to significantly accelerate filtering and search performance, especially on large datasets. | BYOC"
type: origin
token: XCCwwOLqKi2nYGkfy5Gc0Vnfnpb
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - scalar field
  - index
  - Video search
  - AI Hallucination
  - AI Agent
  - semantic search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Index Scalar Fields

Zilliz Cloud supports indexing on scalar fields (non-vector fields) to significantly accelerate filtering and search performance, especially on large datasets.

<Admonition type="info" icon="📘" title="Notes">

<p>Indexing scalar fields is <strong>optional</strong>, but highly recommended for fields that are frequently used in filter conditions.</p>

</Admonition>

## What you can index{#what-you-can-index}

Zilliz Cloud supports `AUTOINDEX` for the following field types:

<table>
   <tr>
     <th><p>Field Type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>VARCHAR</code></p></td>
     <td><p>String</p></td>
   </tr>
   <tr>
     <td><p><code>INT8</code>, <code>INT32</code>, <code>INT64</code></p></td>
     <td><p>Integer</p></td>
   </tr>
   <tr>
     <td><p><code>FLOAT</code>, <code>DOUBLE</code></p></td>
     <td><p>Floating point</p></td>
   </tr>
   <tr>
     <td><p><code>BOOL</code></p></td>
     <td><p>Boolean</p></td>
   </tr>
   <tr>
     <td><p><code>ARRAY</code></p></td>
     <td><p>Homogeneous array of scalar values</p></td>
   </tr>
   <tr>
     <td><p><code>JSON</code></p></td>
     <td><p>Schema-defined or dynamic field (with specific path targeting)</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Indexing the entire JSON object is not supported. You must specify a path to a scalar value within the JSON field. For more information, refer to <a href="./use-json-fields">JSON Field</a>。</p>

</Admonition>

## Define a collection schema{#define-a-collection-schema}

Before creating indexes, define a collection that includes both vector and scalar fields. Zilliz Cloud requires a vector field in every collection.

In this example, we define a schema for a product catalog, including scalar fields, a JSON `metadata` field, and a required vector field, with the dynamic field feature enabled:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT") # Replace with your cluster endpoint

# Define schema with dynamic field support
schema = client.create_schema(
    auto_id=False,
    # highlight-next-line
    enable_dynamic_field=True # Enable dynamic field
)

# Required fields
schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# Scalar and JSON fields
# highlight-start
schema.add_field(field_name="price", datatype=DataType.DOUBLE)
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)
# highlight-end

# Create the collection
client.create_collection(
    collection_name="product_catalog",
    schema=schema
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.*;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.AddFieldReq;

ConnectConfig config = ConnectConfig.builder()
        .uri("YOUR_CLUSTER_ENDPOINT")
        .build();
MilvusClientV2 client = new MilvusClientV2(config);

CreateCollectionReq.CollectionSchema schema = CreateCollectionReq.CollectionSchema.builder()
        .enableDynamicField(true)
        .build();
schema.addField(AddFieldReq.builder()
        .fieldName("product_id")
        .dataType(DataType.Int64)
        .isPrimaryKey(Boolean.TRUE)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("vector")
        .dataType(DataType.FloatVector)
        .dimension(5)
        .build());

schema.addField(AddFieldReq.builder()
        .fieldName("price")
        .dataType(DataType.Double)
        .build());
schema.addField(AddFieldReq.builder()
        .fieldName("metadata")
        .dataType(DataType.JSON)
        .isNullable(true)
        .build());

CreateCollectionReq requestCreate = CreateCollectionReq.builder()
        .collectionName("product_catalog")
        .collectionSchema(schema)
        .build();
client.createCollection(requestCreate);
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient, DataType } from '@zilliz/milvus2-sdk-node';

// initialize client
const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT', // Replace with your cluster endpoint
});

const collectionName = 'product_catalog';

// define schema
const schema = [
  {
    name: 'product_id',
    description: 'Primary key',
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: false,
  },
  {
    name: 'vector',
    description: 'Embedding vector',
    data_type: DataType.FloatVector,
    type_params: {
      dim: '5',
    },
  },
  {
    name: 'price',
    description: 'Product price',
    data_type: DataType.Double,
  },
  {
    name: 'metadata',
    description: 'Additional metadata',
    data_type: DataType.JSON,
    is_nullable: true,
  },
];

// create collection
const res = await client.createCollection({
    collection_name: collectionName,
    fields: schema,
    enable_dynamic_field: true,
});

console.log('Create collection result:', res);
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"

    "github.com/milvus-io/milvus/client/v2/entity"
    "github.com/milvus-io/milvus/client/v2/milvusclient"
)

ctx, cancel := context.WithCancel(context.Background())
defer cancel()

client, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
    Address: "YOUR_CLUSTER_ENDPOINT",
})
if err != nil {
    return err
}

schema := entity.NewSchema().WithDynamicFieldEnabled(true)
schema.WithField(entity.NewField().
    WithName("product_id").pk
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true),
).WithField(entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5),
).WithField(entity.NewField().
    WithName("price").
    WithDataType(entity.FieldTypeDouble),
).WithField(entity.NewField().
    WithName("metadata").
    WithDataType(entity.FieldTypeJSON).
    WithNullable(true),
)

err = client.CreateCollection(ctx, milvusclient.NewCreateCollectionOption("product_catalog", schema))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export productIdField='{
  "fieldName": "product_id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": false
}'

export vectorField='{
  "fieldName": "vector",
  "dataType": "FloatVector",
  "elementTypeParams": {
    "dim": 5
  }
}'

export priceField='{
  "fieldName": "price",
  "dataType": "Double"
}'

export metadataField='{
  "fieldName": "metadata",
  "dataType": "JSON",
  "isNullable": true
}'

export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $productIdField,
    $vectorField,
    $priceField,
    $metadataField
  ]
}"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"schema\": $schema
}"

```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>For more information on how to use JSON fields and the dynamic field, refer to <a href="./use-json-fields">JSON Field</a> and <a href="./enable-dynamic-field">Dynamic Field</a>.</p>

</Admonition>

## Index a non-JSON field{#index-a-non-json-field}

You can create an index on any non-JSON scalar field using `AUTOINDEX`. No additional index parameters are needed.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params() # Prepare an empty IndexParams object, without having to specify any index parameters

index_params.add_index(
    field_name="price", # Name of the scalar field to be indexed
    # highlight-next-line
    index_type="AUTOINDEX", # Type of index to be created
    index_name="price_index" # Name of the index to be created
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(IndexParam.builder()
        .fieldName("price")
        .indexName("price_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const indexParams = [{
    collection_name: collectionName,
    field_name: 'price',
    index_type: 'AUTOINDEX',
    index_name: 'price_index'
}];
```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/index"
)

indexOpt := client.NewCreateIndexOption("product_catalog", "price",
        index.NewInvertedIndex())
```

</TabItem>

<TabItem value='bash'>

```bash
export priceIndex='{
  "fieldName": "price",
  "indexName": "price_index",
  "params": {
    "index_type": "AUTOINDEX"
  }
}'

```

</TabItem>
</Tabs>

## Index a JSON field{#index-a-json-field}

Zilliz Cloud supports indexing a JSON field using **JSON path indexing**. This allows you to filter by keys or nested values inside a JSON object without scanning the entire field.

### Example JSON field{#example-json-field}

Consider a schema-defined `metadata` field:

```json
{
  "metadata": {
    "category": "electronics",
    "brand": "BrandA",
    "in_stock": true,
    "tags": ["clearance", "summer_sale"],
    "string_price": "99.99"
  }
}
```

You can create indexes on paths like:

- `metadata["category"]`

- `metadata["tags"]`

- `metadata["string_price"]` → using a [cast function](./index-scalar-fields#use-json-cast-functions-for-type-conversion) to convert string numbers into double

### JSON path indexing syntax{#json-path-indexing-syntax}

To create a JSON path index, specify:

- **JSON path** (`json_path`): The path to the key or nested field within your JSON object that you want to index.

    - Example: `metadata["category"]`

        This defines where the indexing engine should look inside the JSON structure.

- **JSON cast type** (`json_cast_type`): The data type that Zilliz Cloud should use when interpreting and indexing the value at the specified path.

    - This type must match the actual data type of the field being indexed.

    - For a complete list, refer to [Supported JSON cast types](./use-json-fields#supported-json-cast-types).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Index the category field as a string
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="category_index",
    # highlight-start
    params={
        "json_path": "metadata[\"category\"]",
        "json_cast_type": "varchar"
    }
    # highlight-end
)

# Index the tags array as string array
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="tags_array_index", 
    # highlight-start
    params={
        "json_path": "metadata[\"tags\"]",
        "json_cast_type": "array_varchar"
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> extraParams1 = new HashMap<>();
extraParams1.put("json_path", "metadata[\"category\"]");
extraParams1.put("json_cast_type", "varchar");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("category_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams1)
        .build());

Map<String,Object> extraParams2 = new HashMap<>();
extraParams2.put("json_path", "metadata[\"tags\"]");
extraParams2.put("json_cast_type", "array_varchar");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("tags_array_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams2)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    collection_name: collectionName,
    field_name: 'metadata',
    index_name: 'category_index',
    index_type: 'AUTOINDEX',
    params: {
      json_path: 'metadata["category"]',
      json_cast_type: 'varchar',
    },
  });
  
indexParams.push({
    collection_name: collectionName,
    field_name: 'metadata',
    index_name: 'tags_array_index',
    index_type: 'AUTOINDEX',
    params: {
      json_path: 'metadata["tags"]',
      json_cast_type: 'array_varchar',
    },
  });
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex1 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", `metadata["category"]`)
    .WithIndexName("category_index")
jsonIndex2 := index.NewJSONPathIndex(index.AUTOINDEX, "array_varchar", `metadata["tags"]`)
    .WithIndexName("tags_array_index")

indexOpt1 := milvusclient.NewCreateIndexOption("product_catalog", "metadata", jsonIndex1)
indexOpt2 := milvusclient.NewCreateIndexOption("product_catalog", "metadata", jsonIndex2)
```

</TabItem>

<TabItem value='bash'>

```bash
export categoryIndex='{
  "fieldName": "metadata",
  "indexName": "category_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\"category\"]",
    "json_cast_type": "varchar"
  }
}'

export tagsArrayIndex='{
  "fieldName": "metadata",
  "indexName": "tags_array_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\"tags\"]",
    "json_cast_type": "array_varchar"
  }
}'
```

</TabItem>
</Tabs>

### Use JSON cast functions for type conversion{#use-json-cast-functions-for-type-conversion}

When your JSON contains values in an incorrect format (e.g., numbers stored as strings), you can use cast functions to convert values during indexing.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Convert string numbers to double for indexing
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="string_to_double_index",
    # highlight-start
    params={
        "json_path": "metadata[\"string_price\"]",
        "json_cast_type": "double", # # Must be the output type of the cast function
        "json_cast_function": "STRING_TO_DOUBLE" # Case insensitive
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> extraParams3 = new HashMap<>();
extraParams3.put("json_path", "metadata[\"string_price\"]");
extraParams3.put("json_cast_type", "double");
extraParams3.put("json_cast_function", "STRING_TO_DOUBLE");
indexParams.add(IndexParam.builder()
        .fieldName("metadata")
        .indexName("string_to_double_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams3)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    collection_name: collectionName,
    field_name: 'metadata',
    index_name: 'string_to_double_index',
    index_type: 'AUTOINDEX',
    params: {
      json_path: 'metadata["string_price"]',
      json_cast_type: 'double',                   
      json_cast_function: 'STRING_TO_DOUBLE',     
    },
});
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex3 := index.NewJSONPathIndex(index.AUTOINDEX, "double", `metadata["string_price"]`)
                    .WithIndexName("string_to_double_index")

indexOpt3 := milvusclient.NewCreateIndexOption("product_catalog", "metadata", jsonIndex3)

```

</TabItem>

<TabItem value='bash'>

```bash
export stringToDoubleIndex='{
  "fieldName": "metadata",
  "indexName": "string_to_double_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\"string_price\"]",
    "json_cast_type": "double",
    "json_cast_function": "STRING_TO_DOUBLE"
  }
}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>If type conversion fails (e.g. value <code>"not_a_number"</code> cannot be converted to a number), the value is skipped and unindexed.</p></li>
<li><p>For details on cast function parameters, refer to <a href="./use-json-fields#use-json-cast-functions-for-type-conversion">JSON Field</a>.</p></li>
</ul>

</Admonition>

## Index keys in the dynamic field{#index-keys-in-the-dynamic-field}

If you have dynamic field enabled, you can index specific scalar keys that were not explicitly defined in the schema. These keys are stored in a hidden JSON field and treated just like other scalar fields for indexing purposes.

<Admonition type="info" icon="📘" title="Notes">

<p>For details on the dynamic field, refer to <a href="./enable-dynamic-field">Dynamic Field</a>.</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Index a dynamic key (e.g., inserted but not defined in schema)
index_params.add_index(
    field_name="overview",  # Key name in the dynamic field
    index_type="AUTOINDEX",
    index_name="overview_index",
    # highlight-start
    params={
        "json_path": "overview", # Key name in the dynamic field
        "json_cast_type": "varchar" # # Data type that Zilliz Cloud uses when indexing the values
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
Map<String,Object> extraParams4 = new HashMap<>();
extraParams4.put("json_path", "overview");
extraParams4.put("json_cast_type", "varchar");
indexParams.add(IndexParam.builder()
        .fieldName("overview")
        .indexName("overview_index")
        .indexType(IndexParam.IndexType.AUTOINDEX)
        .extraParams(extraParams4)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
indexParams.push({
    collection_name: collectionName,
    field_name: 'overview', 
    index_name: 'overview_index',
    index_type: 'AUTOINDEX',
    params: {
      json_path: 'overview',
      json_cast_type: 'varchar',
    },
});
```

</TabItem>

<TabItem value='go'>

```go
jsonIndex4 := index.NewJSONPathIndex(index.AUTOINDEX, "varchar", "overview")
                    .WithIndexName("overview_index")

indexOpt4 := milvusclient.NewCreateIndexOption("product_catalog", "overview", jsonIndex4)
```

</TabItem>

<TabItem value='bash'>

```bash
export overviewIndex='{
  "fieldName": "overview",
  "indexName": "overview_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "overview",
    "json_cast_type": "varchar"
  }
}'
```

</TabItem>
</Tabs>

## Apply indexes to the collection{#apply-indexes-to-the-collection}

After defining the index parameters, you can apply them to the collection using `create_index()`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_index(
    collection_name="product_catalog",
    index_params=index_params
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.index.request.CreateIndexReq;

client.createIndex(CreateIndexReq.builder()
        .collectionName("product_catalog")
        .indexParams(indexParams)
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
client.createIndex(indexParams)
```

</TabItem>

<TabItem value='go'>

```go
indexTask1, err := client.CreateIndex(ctx, indexOpt1)
if err != nil {
    return err
}
indexTask2, err := client.CreateIndex(ctx, indexOpt2)
if err != nil {
    return err
}
indexTask3, err := client.CreateIndex(ctx, indexOpt3)
if err != nil {
    return err
}
indexTask4, err := client.CreateIndex(ctx, indexOpt4)
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams="[
  $categoryIndex,
  $tagsArrayIndex,
  $stringToDoubleIndex,
  $overviewIndex
]"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"collectionName\": \"product_catalog\",
  \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## FAQ{#faq}

### When should I create indexes on scalar fields?{#when-should-i-create-indexes-on-scalar-fields}

Creating scalar indexes is **optional**—but highly recommended when the field is frequently used in filter conditions. Without an index, Zilliz Cloud performs a full collection scan during filtering, which can significantly impact performance on large datasets. Indexing such fields enables faster filtering using scalar indexes.

### Can I create multiple indexes on the same JSON field?{#can-i-create-multiple-indexes-on-the-same-json-field}

Yes, you can index different paths within the same JSON field, but only one index per unique path is allowed.

### When indexing a specific JSON path, what if the JSON path doesn't exist in some rows?{#when-indexing-a-specific-json-path-what-if-the-json-path-doesnt-exist-in-some-rows}

Those rows are silently skipped during indexing. No errors will be raised.

### When indexing a JSON field, what happens when cast functions fail?{#when-indexing-a-json-field-what-happens-when-cast-functions-fail}

Zilliz Cloud silently ignores values that cannot be converted, such as a string that can't be parsed to a number.

### Can I index specific array elements?{#can-i-index-specific-array-elements}

Yes, you can index specific array positions like `metadata["tags"][0]` for the first element of an array.

### What happens if some values in a JSON field can’t be cast to the index type?{#what-happens-if-some-values-in-a-json-field-cant-be-cast-to-the-index-type}

They will be skipped silently during indexing and excluded from index-based query results. This can cause partial results if your data has inconsistent types.

### Can I index the same JSON field path multiple times with different types?{#can-i-index-the-same-json-field-path-multiple-times-with-different-types}

No, a single JSON path or dynamic field key supports only one index at a time. You must choose one `json_cast_type` for indexing.

### Where can I find full details about indexing JSON fields or dynamic fields?{#where-can-i-find-full-details-about-indexing-json-fields-or-dynamic-fields}

Refer to the [JSON Field](./use-json-fields) and [Dynamic Field](./enable-dynamic-field) sections for more information.