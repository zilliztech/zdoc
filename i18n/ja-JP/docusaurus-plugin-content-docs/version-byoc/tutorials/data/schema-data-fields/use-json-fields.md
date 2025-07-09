---
title: "JSONフィールド | BYOC"
slug: /use-json-fields
sidebar_label: "JSONフィールド"
beta: FALSE
notebook: FALSE
description: "Zillizクラウド`JSON`データ型を使用して、構造化データを1つのフィールドに格納してインデックス化することができます。これにより、ネストされた属性を持つ柔軟なスキーマが可能になり、JSONパスインデックスによる効率的なフィルタリングも可能になります。 | BYOC"
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
  - rag llm architecture
  - private llms
  - nn search
  - llm eval

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# JSONフィールド

Zillizクラウド`JSON`データ型を使用して、構造化データを1つのフィールドに格納してインデックス化することができます。これにより、ネストされた属性を持つ柔軟なスキーマが可能になり、JSONパスインデックスによる効率的なフィルタリングも可能になります。

## JSONフィールドとは何ですか?{#what-is-a-json-field}

JSONフィールドはスキーマ定義フィールドですZillizクラウド構造化されたキーと値のデータを格納します。値には、文字列、数値、ブール値、配列、または深くネストされたオブジェクトが含まれる場合があります。

ドキュメント内のJSONフィールドがどのように見えるかの例を以下に示します。

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

この例では:

- `metadata`は、スキーマで定義されたJSONフィールドです。

- フラットな値(例: `category`、`in_stock`)、配列(`tags`)、ネストされたオブジェクト(`supplier`)を保存できます。

## スキーマにJSONフィールドを定義する{#define-a-json-field-in-the-schema}

JSONフィールドを使用するには、`DataType`を`JSON`としてコレクションスキーマで明示的に定義します。

以下の例は、これらのフィールドを含むスキーマを持つコレクションを作成します

- 主キー(`product_id`)

- `vector`フィールド(各コレクションに必須)

- `JSON`型の`metadata`フィールドで、フラット値、配列、ネストされたオブジェクトなどの構造化データを格納できます

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

<Admonition type="info" icon="📘" title="ノート">

<p>動的フィールド機能を有効にして、未宣言のフィールドを柔軟に保存することもできますが、JSONフィールドが機能するためには必須ではありません。詳細については、<a href="./enable-dynamic-field">ダイナミックフィールド</a>を参照してください。</p>

</Admonition>

## JSONデータを含むエンティティを挿入する{#insert-entities-with-json-data}

コレクションが作成されたら、`metadata` JSONフィールドに構造化JSONオブジェクトを含むエンティティを挿入します。

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

## JSONフィールド内のインデックス値{#index-values-inside-the-json-field}

JSONフィールドのスカラーフィルタリングを加速するには、Zillizクラウド**JSONパスインデックス**を使用してJSONフィールドのインデックスをサポートします。これにより、フィールド全体をスキャンすることなく、JSONオブジェクト内のキーまたはネストされた値でフィルタリングできます。

<Admonition type="info" icon="📘" title="ノート">

<p>JSONフィールドのインデックス化は<strong>オプション</strong>です。インデックスなしでJSONパスをクエリまたはフィルタリングすることはできますが、ブルートフォース検索によりパフォーマンスが低下する可能性があります。</p>

</Admonition>

### JSONパスインデックスの構文{#json-path-indexing-syntax}

JSONパスインデックスを作成するには、次のように指定します。

- JSONパス(`json_path`):インデックス化したいJSONオブジェクト内のキーまたはネストされたフィールドへのパス。

    - 例: `metadata["category"]`の場合

        これにより、インデックスエンジンがJSON構造内のどこを見るべきかが定義されます。

- **JSONキャストタイプ**(`json_cast_type`):データ型Zillizクラウド指定されたパスの値を解釈およびインデックス化する場合に使用する必要があります。

    - インデックスを作成するフィールドの実際のデータ型と一致する必要があります。インデックス作成時にデータ型を別のデータ型に変換する場合は、[キャスト関数を使用する](./use-json-fields#use-json-cast-functions-for-type-conversion)を検討してください。

    - 完全なリストについては、[下に](./use-json-fields#supported-json-cast-types)を参照してください。

#### サポートされているJSONキャストタイプ{#supported-json-cast-types}

キャストタイプは大文字と小文字を区別しません。以下のタイプがサポートされています:

<table>
   <tr>
     <th><p>キャストタイプ</p></th>
     <th><p>説明する</p></th>
     <th><p>JSONの値の例</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>ブール値</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>数値（整数または浮動小数点数）</p></td>
     <td><p><code>42</code>, <code>99.99</code>,<code>-15.5</code>,インラインコードプレースホルダー</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>ストリング値</p></td>
     <td><p>インラインコードプレースホルダー0、インラインコードプレースホルダー1</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>booleanの配列</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>数字の配列</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>文字列の配列</p></td>
     <td><p>インラインコードプレースホルダー0</p></td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="ノート">

<p>インデックスを最適化するために、配列には同じ型の要素を含める必要があります。詳細については、<a href="./use-array-fields">配列フィールド</a>を参照してください。</p>

</Admonition>

#### 例: JSONパスインデックスを作成する{#example-create-json-path-indexes}

イントロダクションから`metadata` JSON構造体を使用して、異なるJSONパスにインデックスを作成する方法の例を以下に示します。

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
    "json_path": "metadata[\\\"category\\\"]",
    "json_cast_type": "varchar"
  }
}'

export tagsArrayIndex='{
  "fieldName": "metadata",
  "indexName": "tags_array_index",
  "params": {
    "index_type": "AUTOINDEX",
    "json_path": "metadata[\\\"tags\\\"]",
    "json_cast_type": "array_varchar"
  }
}'
```

</TabItem>
</Tabs>

### 型変換にJSONキャスト関数を使用する{#use-json-cast-functions-for-type-conversion}

JSONフィールドキーに正しくない形式の値が含まれている場合(文字列として格納されている数値など)、インデックス作成中にキャスト関数を使用して値を変換できます。

#### キャスト関数をサポート{#supported-cast-functions}

キャスト関数は大文字と小文字を区別しません。以下の型がサポートされています:

<table>
   <tr>
     <th><p>キャスト関数</p></th>
     <th><p>From→Toに変換</p></th>
     <th><p>ユースケース</p></th>
   </tr>
   <tr>
     <td><p>インラインコードプレースホルダー0</p></td>
     <td><p>文字列→数値（ダブル）</p></td>
     <td><p><code>"99.99"</code>を<code>99.99</code>に変換する</p></td>
   </tr>
</table>

#### 例:文字列番号をdoubleにキャストする{#example-cast-string-numbers-to-double}

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
    "json_path": "metadata[\\\"string_price\\\"]",
    "json_cast_type": "double",
    "json_cast_function": "STRING_TO_DOUBLE"
  }
}'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="ノート">

<ul>
<li><p><code>json_cast_type</code>パラメーターは必須であり、キャスト関数の出力型と同じである必要があります。</p></li>
<li><p>変換が失敗した場合(例:数値以外の文字列)、値はスキップされ、インデックス化されません。</p></li>
</ul>

</Admonition>

### コレクションにインデックスを適用する{#apply-indexes-to-the-collection}

インデックスパラメータを定義した後、`create_index()`を使用してコレクションに適用できます。

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

## JSONフィールドの値でフィルタリングする{#filter-by-json-field-values}

JSONフィールドを挿入してインデックスを作成した後、JSONパス構文を使用した標準フィルター式を使用してフィルターをかけることができます。

例えば:

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

検索やクエリでこれらの式を使用するには、次のことを確認してください:

- 各ベクトルフィールドにインデックスを作成しました。

- コレクションがメモリにロードされます。

サポートされている演算子と式の一覧については、[JSON演算子](./json-filtering-operators)を参照してください。

## すべてをまとめる{#pull-it-all-together}

今までに、JSONフィールド内で構造化された値を定義、挿入、オプションでインデックス化する方法を学びました。

実世界のアプリケーションでワークフローを完了するには、次のことも必要です:

- コレクション内の各ベクトルフィールドに必須のインデックスを作成してください  

    参照するリンク_PLACEHOLDER_0

- **コレクションを読み込む**

    [ロード&リリース](./load-release-collections)を参照してください。

- **JSONパスフィルターを使用した検索またはクエリ**  

    [フィルター検索](./filtered-search)と[JSON演算子](./json-filtering-operators)を参照してください。

## よくある質問(FAQ){#faq}

### JSONフィールドと動的フィールドの違いは何ですか?{#what-are-the-differences-between-a-json-field-and-the-dynamic-field}

- **JSONフィールド**はスキーマ定義です。スキーマ内でフィールドを明示的に宣言する必要があります。

- **ダイナミックフィールド**は、スキーマで定義されていないフィールドを自動的に保存する隠しJSONオブジェクト(`$meta`)です。

両方ともネストされた構造とJSONパスインデックスをサポートしていますが、動的フィールドはオプションまたは進化するデータ構造に適しています。

詳細は[ダイナミックフィールド](./enable-dynamic-field)を参照してください。

### JSONフィールドの体格に制限はありますか?{#are-there-any-limitations-on-the-size-of-a-json-field}

はい。各JSONフィールドは65,536バイトに制限されています。

### JSONフィールドはデフォルト値の設定をサポートしていますか?{#does-a-json-field-support-setting-a-default-value}

いいえ、JSONフィールドはデフォルト値をサポートしていません。ただし、フィールドを定義する際に`nullable=True`を設定して、空のエントリを許可することができます。

詳細は[Nullableデフォルト(D)](./nullable-and-default)を参照してください。

### JSONフィールドキーの命名規則はありますか?{#are-there-any-naming-conventions-for-json-field-keys}

はい、クエリとインデックスとの互換性を確保するために:

- JSONキーには、文字、数字、アンダースコアのみを使用してください。

- 特殊文字、スペース、ドット(`.`、`/`など)の使用は避けてください。

- 互換性のないキーは、フィルタ式の解析問題を引き起こす可能性があります。

### どうですかZillizクラウドJSONフィールドで文字列値を処理しますか?{#how-does-lessinclude-targetzillizgreaterzilliz-cloudlessincludegreaterlessinclude-targetmilvusgreatermilvuslessincludegreater-handle-string-values-in-json-fields}

ZillizクラウドJSON入力に表示される文字列値を意味変換なしで正確に保存します。不適切に引用された文字列は解析中にエラーが発生する可能性があります。

**有効な文字列の例**:

```plaintext
"a\"b", "a'b", "a\\b"
```

**無効な文字列の例**:

```plaintext
'a"b', 'a\'b'
```

### フィルタリングロジックが行うことZillizクラウドインデックス化されたJSONパスに使用しますか?{#what-filtering-logic-does-lessinclude-targetzillizgreaterzilliz-cloudlessincludegreaterlessinclude-targetmilvusgreatermilvuslessincludegreater-use-for-indexed-json-paths}

- **数値インデックス**:

    インデックスが`json_cast_type="double"`で作成された場合、数値フィルター条件(例: `>`、`<`、`== 42`)のみがインデックスを利用します。数値以外の条件は総当たりスキャンにフォールバックされる場合があります。

- **文字列インデックス**:

    インデックスが`json_cast_type="varchar"`を使用する場合、文字列フィルター条件のみがインデックスの恩恵を受けます。

- **ブールインデックス**:

    ブールインデックスは文字列インデックスと同様に動作し、条件がtrueまたはfalseに厳密に一致する場合にのみインデックスが使用されます。

### JSONフィールドをインデックス化する際の数値精度はどうですか?{#what-about-numeric-precision-when-indexing-json-fields}

Zillizクラウドすべてのインデックス付き数値をdoubleとして格納します。

数値が**2^53**を超えると、精度が低下する可能性があります。この精度の低下により、フィルタークエリが範囲外の値と完全に一致しなくなる可能性があります。

### 同じJSONパスに異なるキャストタイプで複数のインデックスを作成できますか?{#can-i-create-multiple-indexes-on-the-same-json-path-with-different-cast-types}

いいえ、各JSONパスは**1つのインデックス**のみをサポートしています。データに一致する単一の`json_cast_type`を選択する必要があります。異なるキャストタイプで同じパスに複数のインデックスを作成することはサポートされていません。

### JSONパス上の値に一貫性のない型がある場合はどうなりますか?{#what-if-values-on-a-json-path-have-inconsistent-types}

エンティティ間で一貫性のない型は**部分インデックス**につながる可能性があります。たとえば、`metadata["price"]`が数値(`99.99`)と文字列(`"99.99"`)の両方として格納され、インデックスが`json_cast_type="double"`で定義されている場合、数値のみがインデックス化されます。文字列形式のエントリはスキップされ、フィルタ結果に表示されません。

### インデックス化されたキャストタイプとは異なるタイプのフィルターを使用できますか?{#can-i-use-filters-with-a-different-type-than-the-indexed-cast-type}

もしフィルター式がインデックスの`json_cast_type`とは異なるタイプを使用している場合、システムはインデックスを使用せず、データが許す限り遅い総当たりスキャンに戻る可能性があります。最高のパフォーマンスを得るためには、常にフィルター式をインデックスのキャストタイプに合わせてください。