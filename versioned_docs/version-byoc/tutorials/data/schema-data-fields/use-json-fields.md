---
title: "JSON Field | BYOC"
slug: /use-json-fields
sidebar_label: "JSON Field"
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to store and index structured data within a single field using the `JSON` data type. This enables flexible schemas with nested attributes while still allowing efficient filtering via JSON path indexing. | BYOC"
type: origin
token: BkDMwo71MiZMazk7gbtc7fqknbh
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - cloud
  - collection
  - schema
  - json field
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSON Field

Zilliz Cloud allows you to store and index structured data within a single field using the `JSON` data type. This enables flexible schemas with nested attributes while still allowing efficient filtering via JSON path indexing.

## What is a JSON field?{#what-is-a-json-field}

A JSON field is a schema-defined field in Zilliz Cloud that stores structured key-value data. The values can include strings, numbers, booleans, arrays, or deeply nested objects.

Here’s an example of what a JSON field might look like in a document:

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

In this example:

- `metadata` is the JSON field defined in the schema.

- You can store flat values (e.g. `category`, `in_stock`), arrays (`tags`), and nested objects (`supplier`).

## Define a JSON field in the schema{#define-a-json-field-in-the-schema}

To use a JSON field, explicitly define it in the collection schema by specifying the `DataType` as `JSON`.

The example below creates a collection with its schema containing these fields:

- The primary key (`product_id`)

- A `vector` field (mandatory for each collection)

- A `metadata` field of type `JSON`, which can store structured data like flat values, arrays, or nested objects

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

client = MilvusClient(uri="YOUR_CLUSTER_ENDPOINT")

# Create schema with a JSON field
schema = client.create_schema(auto_id=False, enable_dynamic_field=True)

schema.add_field(field_name="product_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="vector", datatype=DataType.FLOAT_VECTOR, dim=5)
# highlight-next-line
schema.add_field(field_name="metadata", datatype=DataType.JSON, nullable=True)  # JSON field that allows null values

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

const client = new MilvusClient({
  address: 'YOUR_CLUSTER_ENDPOINT'
});

// Create collection
await client.createCollection({
collection_name: "product_catalog",
fields: [
  {
    name: "product_id",
    data_type: DataType.Int64,
    is_primary_key: true,
    autoID: false
  },
  {
    name: "vector",
    data_type: DataType.FloatVector,
    dim: 5
  },
  {
    name: "metadata",
    data_type: DataType.JSON,
    nullable: true  // JSON field that allows null values
  }
],
enable_dynamic_field: true
});

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
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

# 字段定义
export productIdField='{
  "fieldName": "product_id",
  "dataType": "Int64",
  "isPrimary": true,
  "autoID": false
}'

export vectorField='{
  "fieldName": "vector",
  "dataType": "FloatVector",
  "typeParams": {
    "dim": 5
  }
}'

export metadataField='{
  "fieldName": "metadata",
  "dataType": "JSON",
  "isNullable": true
}'

# 构造 schema
export schema="{
  \"autoID\": false,
  \"enableDynamicField\": true,
  \"fields\": [
    $productIdField,
    $vectorField,
    $metadataField
  ]
}"

# 创建集合
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

<p>You can also enable the dynamic field feature to store undeclared fields flexibly, but it's not required for JSON fields to function. For more information, refer to <a href="./enable-dynamic-field">Dynamic Field</a>.</p>

</Admonition>

## Insert entities with JSON data{#insert-entities-with-json-data}

Once the collection is created, insert entities that contain structured JSON objects in the `metadata` JSON field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
entities = [
    {
        "product_id": 1,
        "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
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
    }
]

client.insert(collection_name="product_catalog", data=entities)
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import io.milvus.v2.service.vector.request.InsertReq;

Gson gson = new Gson();
JsonObject row = new JsonObject();
row.addProperty("product_id", 1);
row.add("vector", gson.toJsonTree(Arrays.asList(0.1, 0.2, 0.3, 0.4, 0.5)));

JsonObject metadata = new JsonObject();
metadata.addProperty("category", "electronics");
metadata.addProperty("brand", "BrandA");
metadata.addProperty("in_stock", true);
metadata.addProperty("price", 99.99);
metadata.addProperty("string_price", "99.99");
metadata.add("tags", gson.toJsonTree(Arrays.asList("clearance", "summer_sale")));

JsonObject supplier = new JsonObject();
supplier.addProperty("name", "SupplierX");
supplier.addProperty("country", "USA");

JsonObject contact = new JsonObject();
contact.addProperty("email", "support@supplierx.com");
contact.addProperty("phone", "+1-800-555-0199");

supplier.add("contact", contact);
metadata.add("supplier", supplier);
row.add("metadata", metadata);

client.insert(InsertReq.builder()
        .collectionName("product_catalog")
        .data(Collections.singletonList(row))
        .build());
```

</TabItem>

<TabItem value='javascript'>

```javascript
const entities = [
    {
        "product_id": 1,
        "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
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
    }
]

await client.insert({
    collection_name: "product_catalog", 
    data: entities
});
```

</TabItem>

<TabItem value='go'>

```go
_, err = client.Insert(ctx, milvusclient.NewColumnBasedInsertOption("product_catalog").
    WithInt64Column("product_id", []int64{1}).
    WithFloatVectorColumn("vector", 5, [][]float32{
        {0.1, 0.2, 0.3, 0.4, 0.5},
    }).WithColumns(
    column.NewColumnJSONBytes("metadata", [][]byte{
        []byte(`{
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
        }`),
    }),
))
if err != nil {
    return err
}
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export TOKEN="YOUR_CLUSTER_TOKEN"
export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"

export entities='[
  {
    "product_id": 1,
    "vector": [0.1, 0.2, 0.3, 0.4, 0.5],
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
]'

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/product_catalog/insert" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data "{
  \"data\": $entities
}"

```

</TabItem>
</Tabs>

## Index values inside the JSON field{#index-values-inside-the-json-field}

To accelerate scalar filtering on JSON fields, Zilliz Cloud supports indexing JSON fields using **JSON path indexing**. This allows you to filter by keys or nested values inside a JSON object without scanning the entire field.

<Admonition type="info" icon="📘" title="Notes">

<p>Indexing JSON fields is <strong>optional</strong>. You can still query or filter by JSON paths without an index, but it may result in slower performance due to brute-force search.</p>

</Admonition>

### JSON path indexing syntax{#json-path-indexing-syntax}

To create a JSON path index, specify:

- **JSON path** (`json_path`): The path to the key or nested field within your JSON object that you want to index.

    - Example: `metadata["category"]`

        This defines where the indexing engine should look inside the JSON structure.

- **JSON cast type** (`json_cast_type`): The data type that Zilliz Cloud should use when interpreting and indexing the value at the specified path.

    - This type must match the actual data type of the field being indexed. If you want to convert the data type to another during indexing, consider [using a cast function](./use-json-fields#use-json-cast-functions-for-type-conversion).

    - For a complete list, see [below](./use-json-fields#supported-json-cast-types).

#### Supported JSON cast types{#supported-json-cast-types}

Cast types are case-insensitive. The following types are supported:

<table>
   <tr>
     <th><p>Cast Type</p></th>
     <th><p>Description</p></th>
     <th><p>Example JSON Value</p></th>
   </tr>
   <tr>
     <td><p><code>bool</code></p></td>
     <td><p>Boolean value</p></td>
     <td><p><code>true</code>, <code>false</code></p></td>
   </tr>
   <tr>
     <td><p><code>double</code></p></td>
     <td><p>Numeric value (integer or float)</p></td>
     <td><p><code>42</code>, <code>99.99</code>, <code>-15.5</code></p></td>
   </tr>
   <tr>
     <td><p><code>varchar</code></p></td>
     <td><p>String value</p></td>
     <td><p><code>"electronics"</code>, <code>"BrandA"</code></p></td>
   </tr>
   <tr>
     <td><p><code>array_bool</code></p></td>
     <td><p>Array of booleans</p></td>
     <td><p><code>[true, false, true]</code></p></td>
   </tr>
   <tr>
     <td><p><code>array_double</code></p></td>
     <td><p>Array of numbers</p></td>
     <td><p><code>[1.2, 3.14, 42]</code></p></td>
   </tr>
   <tr>
     <td><p><code>array_varchar</code></p></td>
     <td><p>Array of strings</p></td>
     <td><p><code>["tag1", "tag2", "tag3"]</code></p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>Arrays should contain elements of the same type for optimal indexing. For more information, refer to <a href="./use-array-fields">Array Field</a>.</p>

</Admonition>

#### Example: Create JSON path indexes{#example-create-json-path-indexes}

Using the `metadata` JSON structure from our introduction, here are examples of how to create indexes on different JSON paths:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Index the category field as a string
index_params = client.prepare_index_params()

index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="category_index",  # Unique index name
    # highlight-start
    params={
        "json_path": "metadata[\"category\"]", # Path to the JSON key to be indexed
        "json_cast_type": "varchar" # Data cast type
    }
    # highlight-end
)

# Index the tags array as string array
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="tags_array_index", # Unique index name
    # highlight-start
    params={
        "json_path": "metadata[\"tags\"]", # Path to the JSON key to be indexed
        "json_cast_type": "array_varchar" # Data cast type
    }
    # highlight-end
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

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
const indexParams = [
  {
    collection_name: "product_catalog",
    field_name: "metadata",
    index_name: "category_index",
    index_type: "AUTOINDEX", // Can also use "INVERTED" for JSON path indexing
    extra_params: {
      json_path: 'metadata["category"]',
      json_cast_type: "varchar",
    },
  },
  {
    collection_name: "product_catalog",
    field_name: "metadata",
    index_name: "tags_array_index",
    index_type: "AUTOINDEX", // Can also use "INVERTED" for JSON path indexing
    extra_params: {
      json_path: 'metadata["tags"]',
      json_cast_type: "array_varchar",
    },
  },
];

```

</TabItem>

<TabItem value='go'>

```go
import (
    "github.com/milvus-io/milvus/client/v2/index"
)

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
# restful
export categoryIndex='{
  "fieldName": "metadata",
  "indexName": "category_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\"category\\"]",
    "json_cast_type": "varchar"
  }
}'

export tagsArrayIndex='{
  "fieldName": "metadata",
  "indexName": "tags_array_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\"tags\\"]",
    "json_cast_type": "array_varchar"
  }
}'
```

</TabItem>
</Tabs>

### Use JSON cast functions for type conversion{#use-json-cast-functions-for-type-conversion}

If your JSON field key contains values in an incorrect format (e.g., numbers stored as strings), you can use cast functions to convert values during indexing.

#### Supported cast functions{#supported-cast-functions}

Cast functions are case-insensitive. The following types are supported:

<table>
   <tr>
     <th><p>Cast Function</p></th>
     <th><p>Converts From → To</p></th>
     <th><p>Use Case</p></th>
   </tr>
   <tr>
     <td><p><code>"STRING_TO_DOUBLE"</code></p></td>
     <td><p>String → Numeric (double)</p></td>
     <td><p>Convert <code>"99.99"</code> to <code>99.99</code></p></td>
   </tr>
</table>

#### Example: Cast string numbers to double{#example-cast-string-numbers-to-double}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# Convert string numbers to double for indexing
index_params.add_index(
    field_name="metadata",
    # highlight-next-line
    index_type="AUTOINDEX", # Must be set to AUTOINDEX for JSON path indexing
    index_name="string_to_double_index", # Unique index name
    params={
        "json_path": "metadata[\"string_price\"]", # Path to the JSON key to be indexed
        "json_cast_type": "double", # Data cast type
        # highlight-next-line
        "json_cast_function": "STRING_TO_DOUBLE" # Cast function; case insensitive
    }
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
  collection_name: "product_catalog",
  field_name: "metadata",
  index_name: "string_to_double_index",
  index_type: "AUTOINDEX", // Can also use "INVERTED"
  extra_params: {
    json_path: 'metadata["string_price"]',
    json_cast_type: "double",
    json_cast_function: "STRING_TO_DOUBLE", // Case insensitive
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
# restful
export stringToDoubleIndex='{
  "fieldName": "metadata",
  "indexName": "string_to_double_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\"string_price\\"]",
    "json_cast_type": "double",
    "json_cast_function": "STRING_TO_DOUBLE"
  }
}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>The <code>json_cast_type</code> parameter is mandatory and must be the same as the cast function's output type.</p></li>
<li><p>If conversion fails (e.g., non-numeric string), the value is skipped and not indexed.</p></li>
</ul>

</Admonition>

### Apply indexes to the collection{#apply-indexes-to-the-collection}

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
await client.createIndex(indexParams)
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
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export indexParams="[
  $categoryIndex,
  $tagsArrayIndex,
  $stringToDoubleIndex
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

## Filter by JSON field values{#filter-by-json-field-values}

After inserting and indexing JSON fields, you can filter on them using standard filter expressions with JSON path syntax.

For example:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
filter = 'metadata["category"] == "electronics"'
filter = 'metadata["price"] > 50'
filter = 'json_contains(metadata["tags"], "featured")'
```

</TabItem>

<TabItem value='java'>

```java
String filter = 'metadata["category"] == "electronics"';
String filter = 'metadata["price"] > 50';
String filter = 'json_contains(metadata["tags"], "featured")';
```

</TabItem>

<TabItem value='javascript'>

```javascript
let filter = 'metadata["category"] == "electronics"'
let filter = 'metadata["price"] > 50'
let filter = 'json_contains(metadata["tags"], "featured")'
```

</TabItem>

<TabItem value='go'>

```go
filter := 'metadata["category"] == "electronics"'
filter := 'metadata["price"] > 50'
filter := 'json_contains(metadata["tags"], "featured")'
```

</TabItem>

<TabItem value='bash'>

```bash
# restful
export filterCategory='metadata["category"] == "electronics"'
export filterPrice='metadata["price"] > 50'
export filterTags='json_contains(metadata["tags"], "featured")'
```

</TabItem>
</Tabs>

To use these expressions in a search or query, make sure:

- You have created an index on each vector field.

- The collection is loaded into memory.

For a full list of supported operators and expressions, refer to [JSON Operators](./json-filtering-operators).

## Pull it all together{#pull-it-all-together}

By now, you’ve learned how to define, insert, and optionally index structured values inside a JSON field.

To complete the workflow in a real-world application, you’ll also need to:

- **Create an index on your vector fields** (mandatory for each vector field in a collection)  

    Refer to [Index Vector Fields](./index-vector-fields)

- **Load the collection**

    Refer to [Load & Release](./load-release-collections)

- **Search or query using JSON path filters**  

    Refer to [Filtered Search](./filtered-search) and [JSON Operators](./json-filtering-operators)

## FAQ{#faq}

### What are the differences between a JSON field and the dynamic field?{#what-are-the-differences-between-a-json-field-and-the-dynamic-field}

- **JSON field** is schema-defined. You must explicitly declare the field in the schema.

- **Dynamic field** is a hidden JSON object (`$meta`) that automatically stores any field not defined in the schema.

Both support nested structures and JSON path indexing, but dynamic fields are more suitable for optional or evolving data structures.

Refer to [Dynamic Field](./enable-dynamic-field) for details.

### Are there any limitations on the size of a JSON field?{#are-there-any-limitations-on-the-size-of-a-json-field}

Yes. Each JSON field is limited to 65,536 bytes.

### Does a JSON field support setting a default value?{#does-a-json-field-support-setting-a-default-value}

No, JSON fields do not support default values. However, you can set `nullable=True` when defining the field to allow empty entries.

Refer to [Nullable & Default](./nullable-and-default) for details.

### Are there any naming conventions for JSON field keys?{#are-there-any-naming-conventions-for-json-field-keys}

Yes, to ensure compatibility with queries and indexing:

- Use only letters, numbers, and underscores in JSON keys.

- Avoid using special characters, spaces, or dots (`.`, `/`, etc.).

- Incompatible keys may cause parsing issues in filter expressions.

### How does Zilliz Cloud handle string values in JSON fields?{#how-does-zilliz-cloud-handle-string-values-in-json-fields}

Zilliz Cloud stores string values exactly as they appear in the JSON input—without semantic transformation. Improperly quoted strings may result in errors during parsing.

**Examples of valid strings**:

```plaintext
"a\"b", "a'b", "a\b"
```

**Examples of invalid strings**:

```plaintext
'a"b', 'a\'b'
```

### What filtering logic does Zilliz Cloud use for indexed JSON paths?{#what-filtering-logic-does-zilliz-cloud-use-for-indexed-json-paths}

- **Numeric Indexing**:

    If an index is created with `json_cast_type="double"`, only numeric filter conditions (e.g., `>`, `<`, `== 42`) will leverage the index. Non-numeric conditions may fall back to a brute-force scan.

- **String Indexing**:

    If an index uses `json_cast_type="varchar"`, only string filter conditions will benefit from the index; other types may fall back to a brute-force scan.

- **Boolean Indexing**:

    Boolean indexing behaves similarly to string indexing, with index usage only when the condition strictly matches true or false.

### What about numeric precision when indexing JSON fields?{#what-about-numeric-precision-when-indexing-json-fields}

Zilliz Cloud stores all indexed numeric values as doubles.

If a numeric value exceeds **2^53**, it may lose precision. This loss of precision can result in filter queries not matching out-of-range values exactly.

### Can I create multiple indexes on the same JSON path with different cast types?{#can-i-create-multiple-indexes-on-the-same-json-path-with-different-cast-types}

No, each JSON path supports **only one index**. You must choose a single `json_cast_type` that matches your data. Creating multiple indexes on the same path with different cast types is not supported.

### What if values on a JSON path have inconsistent types?{#what-if-values-on-a-json-path-have-inconsistent-types}

Inconsistent types across entities can lead to **partial indexing**. For example, if `metadata["price"]` is stored as both a number (`99.99`) and a string (`"99.99"`), and the index is defined with `json_cast_type="double"`, only the numeric values will be indexed. The string-form entries will be skipped and not appear in filter results.

### Can I use filters with a different type than the indexed cast type?{#can-i-use-filters-with-a-different-type-than-the-indexed-cast-type}

If your filter expression uses a different type than the index's `json_cast_type`, the system will **not use the index**, and may fall back to a slower brute-force scan—if the data allows. For best performance, always align your filter expression with the cast type of the index.