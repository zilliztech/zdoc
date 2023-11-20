---
slug: /docs/byoc/enable-dynamic-schema
beta: FALSE
notebook: 02_enable_dynamic_schema.ipynb
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Enable Dynamic Schema

Schema design is crucial for Zilliz Cloud cluster data processing. Before inserting entities into a collection, clarify the schema design and ensure that all data entities inserted afterward match the schema. However, this puts limits on collections, making them similar to tables in relational databases.

Dynamic schema enables users to insert entities with new fields into a collection without modifying the existing schema. This means that users can insert data without knowing the full schema of a collection and can include fields that are not yet defined.

Dynamic schema also provides flexibility in data processing, enabling users to store and retrieve complex data structures in their collections. This includes nested data, arrays, and other complex data types.

## Create collection with dynamic schema enabled{#create-collection-with-dynamic-schema-enabled}

To create a collection using a dynamic schema, set `enable_dynamic_field` to `True` when defining the data model. Afterward, all undefined fields and their values in the data entities inserted afterward will be treated as pre-defined fields. We prefer to use the term "dynamic fields" to refer to these key-value pairs.

With these dynamic fields, you can ask Zilliz Cloud to output dynamic fields in search/query results and include them in search and query filter expressions just as they are already defined in the collection schema.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
import json, os, time
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token
COLLECTION_NAME="medium_articles_2020" # Set your collection name
DATASET_PATH="{}/../medium_articles_2020_dpr.json".format(os.path.dirname(__file__)) # Set your dataset path

# 1. Connect to cluster
connections.connect(
  alias='default', 
  #  Public endpoint obtained from Zilliz Cloud
  uri=CLUSTER_ENDPOINT,
  # API key or a colon-separated cluster username and password
  token=TOKEN, 
)

# 2. Define fields
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True, max_length=100),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768)
]

# 3. Create schema with dynamic field enabled
schema = CollectionSchema(
    fields,
    "The schema for a medium news collection",
    enable_dynamic_field=True
)

# 4. Create collection
collection = Collection(COLLECTION_NAME, schema)

# 5. Index collection
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "L2",
    "params": {}
}

collection.create_index(
  field_name="title_vector", 
  index_params=index_params
)

collection.load()

# Get loading progress
progress = utility.loading_progress(COLLECTION_NAME)

print(progress)

# Output
#
# {
#     "loading_progress": "100%"
# }
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("fs")
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"
const collectionName = "medium_articles_2020"
const data_file = `./medium_articles_2020_dpr.json`

async function main() {
    // 1. Connect to cluster
    const client = new MilvusClient({address, token})
    
    // 2. Define fields
    fields = [
        {
            name: "id",
            data_type: DataType.Int64,
            is_primary_key: true,
            auto_id: true
        },
        {
            name: "title",
            data_type: DataType.VarChar,
            max_length: 512
        },
        {
            name: "title_vector",
            data_type: DataType.FloatVector,
            dim: 768
        },
    ]
    
    // 3. Create collection
    res = await client.createCollection({
        collection_name: collectionName,
        fields: fields,
        enable_dynamic_field: true
    })

    console.log(res)

    // Output
    // 
    // { error_code: 'Success', reason: '', code: 0 }
    // 

    // 4. Create index
    res = await client.createIndex({
        collection_name: collectionName,
        field_name: "title_vector",
        index_type: "IVF_FLAT",
        metric_type: "L2",
        params: {
            nlist: 1024
        }
    })

    console.log(res)

    // Output
    // 
    // { error_code: 'Success', reason: '', code: 0 }
    // 

    res = await client.loadCollection({
        collection_name: collectionName
    })

    console.log(res)    

    // Output
    // 
    // { error_code: 'Success', reason: '', code: 0 }
```

</TabItem>

<TabItem value='java'>

```java
package com.zilliz.docs;

import io.milvus.client.*;
import io.milvus.param.*;
import io.milvus.param.collection.FieldType;
import io.milvus.param.index.CreateIndexParam;
import io.milvus.param.collection.CreateCollectionParam;
import io.milvus.param.collection.DropCollectionParam;
import io.milvus.grpc.DataType;
import io.milvus.param.dml.InsertParam;
import io.milvus.grpc.MutationResult;
import io.milvus.response.MutationResultWrapper;
import io.milvus.param.dml.SearchParam;
import io.milvus.grpc.SearchResults;
import io.milvus.response.SearchResultsWrapper;
import io.milvus.param.collection.LoadCollectionParam;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import java.util.List;
import java.util.ArrayList;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * Hello world!
 */
public final class EnableDynamicSchemaDemo {
    private EnableDynamicSchemaDemo() {
    }

    /**
     * Says hello to the world.
     * @param args The arguments of the program.
     */
    public static void main(String[] args) {
        String clusterEndpoint = "YOUR_CLUSTER_ENDPOINT";
        String token = "YOUR_CLUSTER_TOKEN";
        String collectionName = "medium_articles";
        String data_file = System.getProperty("user.dir") + "/medium_articles_2020_dpr.json";

        // 1. Connect to Zilliz Cloud cluster
        ConnectParam connectParam = ConnectParam.newBuilder()
            .withUri(clusterEndpoint)
            .withToken(token)
            .build();

        MilvusServiceClient client = new MilvusServiceClient(connectParam);

        System.out.println("Connected to Zilliz Cloud!");

        // Output:
        // Connected to Zilliz Cloud!

        // 2. Define fields

        FieldType id = FieldType.newBuilder()
            .withName("id")
            .withDataType(DataType.Int64)
            .withPrimaryKey(true)
            .withAutoID(true)
            .build();

        FieldType title = FieldType.newBuilder()
            .withName("title")
            .withDataType(DataType.VarChar)
            .withMaxLength(512)
            .build();

        FieldType title_vector = FieldType.newBuilder()
            .withName("title_vector")
            .withDataType(DataType.FloatVector)
            .withDimension(768)
            .build();

        // 3. Create collection

        CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
            .withCollectionName(collectionName)
            .withDescription("Schema of Medium articles")
            .addFieldType(id)
            .addFieldType(title)
            .addFieldType(title_vector)
            // Enable dynamic schema
            .withEnableDynamicField(true)
            .build();

        R<RpcStatus> collection = client.createCollection(createCollectionParam);

        if (collection.getException() != null) {
            System.err.println("Failed to create collection: " + collection.getException().getMessage());
            return;
        }

        System.out.println("Collection created!");

        // Output:
        // Collection created!

        // 4. Create index

        CreateIndexParam createIndexParam = CreateIndexParam.newBuilder()
            .withCollectionName(collectionName)
            .withFieldName("title_vector")
            .withIndexName("title_vector_index")
            .withIndexType(IndexType.AUTOINDEX)
            .withMetricType(MetricType.L2)
            .build();

        R<RpcStatus> res = client.createIndex(createIndexParam);

        if (res.getException() != null) {
            System.err.println("Failed to create index: " + res.getException().getMessage());
            return;
        }

        System.out.println("Index created!");

        // Output:
        // Index created!

        // 5. Load collection

        LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
            .withCollectionName(collectionName)
            .build();

        R<RpcStatus> loadCollectionRes = client.loadCollection(loadCollectionParam);

        if (loadCollectionRes.getException() != null) {
            System.err.println("Failed to load collection: " + loadCollectionRes.getException().getMessage());
            return;
        }

        System.out.println("Collection loaded!");

        // Output:
        // Collection loaded!
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus-sdk-go/v2/entity"

// You should include the following in the main function

// 1. Connect to cluster

connParams := client.Config{
    Address: CLUSTER_ENDPOINT,
    APIKey:  TOKEN,
}

conn, err := client.NewClient(context.Background(), connParams)

if err != nil {
    log.Fatal("Failed to connect to Zilliz Cloud:", err.Error())
}

// 2. Create collection

// Define fields
id := entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true)

title := entity.NewField().
    WithName("title").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512)

title_vector := entity.NewField().
    WithName("title_vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(768)

// Define schema
schema := &entity.Schema{
    CollectionName: COLLNAME,
    AutoID:         true,
    Fields: []*entity.Field{
        id,
        title,
        title_vector,
    },
    EnableDynamicField: true,
}

err = conn.CreateCollection(context.Background(), schema, 2)

if err != nil {
    log.Fatal("Failed to create collection:", err.Error())
}

// 3. Create index for cluster
index, err := entity.NewIndexAUTOINDEX(entity.MetricType("L2"))

if err != nil {
    log.Fatal("Failed to prepare the index:", err.Error())
}

fmt.Println(index.Name())

// Output: 
//
// AUTOINDEX

err = conn.CreateIndex(context.Background(), COLLNAME, "title_vector", index, false)

if err != nil {
    log.Fatal("Failed to create the index:", err.Error())
}

// 4. Load collection
loadCollErr := conn.LoadCollection(context.Background(), COLLNAME, false)

if loadCollErr != nil {
    log.Fatal("Failed to load collection:", loadCollErr.Error())
}

// 5. Get load progress
progress, err := conn.GetLoadingProgress(context.Background(), COLLNAME, nil)

if err != nil {
    log.Fatal("Failed to get loading progress:", err.Error())
}

fmt.Println("Loading progress:", progress)

// Output: 
//
// Loading progress: 100
```

</TabItem>
</Tabs>

## Insert dynamic data{#insert-dynamic-data}

Once the collection is created, you can start inserting data, including the dynamic data into the collection.

### Prepare data{#prepare-data}

Now we need to prepare a piece of applicable data out of the [Example Dataset](./example-dataset).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 6. Prepare data
with open(DATASET_PATH) as f:
    data = json.load(f)
    list_of_rows = data['rows']

    data_rows = []
    for row in list_of_rows:
        # Remove the id field because the primary key has auto_id enabled.
        del row['id']
        # Other keys except the title and title_vector fields in the row 
        # will be treated as dynamic fields.
        data_rows.append(row)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// You should include the following in the async function declaration

// 5. prepare data
const data = JSON.parse(fs.readFileSync(data_file, {encoding: "utf-8"}))

// read rows
const rows = data["rows"]
const row = rows[0]

console.log(Object.keys(row))

// Output
// 
// [
//   'id',
//   'title',
//   'title_vector',
//   'link',
//   'reading_time',
//   'publication',
//   'claps',
//   'responses'
// ]
// 
```

</TabItem>

<TabItem value='java'>

```java
// You should include the following in the main function

// 5. prepare data
String content;

// read a local file
Path file = Path.of(data_file);
try {
    content = Files.readString(file);
} catch (Exception e) {
    System.err.println("Failed to read file: " + e.getMessage());
    return;
}

System.out.println("Successfully read file");

// Output:
// Successfully read file
```

</TabItem>

<TabItem value='go'>

```go
// You should include the following in the main function

// 6. Read the dataset
file, err := os.ReadFile(DATA_FILE)
if err != nil {
    log.Fatal("Failed to read file:", err.Error())
}

var data Dataset

if err := json.Unmarshal(file, &data); err != nil {
    log.Fatal(err.Error())
}

fmt.Println("Dataset loaded, row number: ", len(data.Rows))

// Output: 
//
// Dataset loaded, row number:  5979
```

</TabItem>
</Tabs>

### Insert data{#insert-data}

Then you can safely insert the data into the collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 7. Insert data
result = collection.insert(data_rows)
collection.flush()

print(f"Data inserted successfully! Inserted counts: {result.insert_count}")

# Output
#
# Data inserted successfully! Inserted counts: 5979
```

</TabItem>

<TabItem value='javascript'>

```javascript
// You should include the following in the async function declaration

// 6. insert data
res = await client.insert({
    collection_name: collectionName,
    data: rows
})

console.log(res)

// Output
// 
// {
//   succ_index: [
//      0,  1,  2,  3,  4,  5,  6,  7,  8,  9, 10, 11,
//     12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23,
//     24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35,
//     36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47,
//     48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59,
//     60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71,
//     72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83,
//     84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95,
//     96, 97, 98, 99,
//     ... 5879 more items
//   ],
//   err_index: [],
//   status: { error_code: 'Success', reason: '', code: 0 },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '5979',
//   delete_cnt: '0',
//   upsert_cnt: '0',
//   timestamp: '445316728739856387'
// }
// 

await sleep(5000)
```

</TabItem>

<TabItem value='java'>

```java
// You should include the following in the main function

// Load dataset
JSONObject dataset = JSON.parseObject(content);

// Insert your data in rows, all the fields not pre-defined in the schema 
// are recognized as pre-defined schema
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 1000);

InsertParam insertParam = InsertParam.newBuilder()
    .withCollectionName(collectionName)
    .withRows(rows)
    .build();

R<MutationResult> insertResponse = client.insert(insertParam);

if (insertResponse.getStatus() != R.Status.Success.getCode()) {
    System.err.println(insertResponse.getMessage());
}

MutationResultWrapper mutationResultWrapper = new MutationResultWrapper(insertResponse.getData());

System.out.println("Successfully insert entities: " + mutationResultWrapper.getInsertCount());  

// Output:
// Successfully insert entities: 1000

// wait for a while
try {
    // pause execution for 5 seconds
    Thread.sleep(5000);
} catch (InterruptedException e) {
    // handle the exception
    Thread.currentThread().interrupt();
} 
```

</TabItem>

<TabItem value='go'>

```go
// You should include the following in the main function

// 6. Insert data
fmt.Println("Start inserting ...")

// Output: 
//
// Start inserting ...

rows := make([]interface{}, 0, 1)

for i := 0; i < len(data.Rows); i++ {
    rows = append(rows, data.Rows[i])
}

col, err := conn.InsertRows(context.Background(), COLLNAME, "", rows)

if err != nil {
    log.Fatal("Failed to insert rows:", err.Error())
}

fmt.Println("Inserted entities: ", col.Len())

// Output: 
//
// Inserted entities:  5979

time.Sleep(5 * time.Second)
```

</TabItem>
</Tabs>

## Search with dynamic fields{#search-with-dynamic-fields}

If you have created `medium_articles_with_dynamic` with dynamic field enabled,  and inserted data with dynamic fields into, index, and load the collection, you can use dynamic fields in the filter expression of a search or a query as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 8. Search data
result = collection.search(
    data=[data_rows[0]['title_vector']],
    anns_field="title_vector",
    param={"metric_type": "L2", "params": {"nprobe": 10}},
    limit=3,
    # Access dynamic fields in the boolean expression
    expr='claps > 30 and reading_time < 10',
    # Include dynamic fields in the output to return
    output_fields=["title", "reading_time", "claps"],
)

result = [ list(map(lambda y: y.entity.to_dict(), x)) for x in result ]

print(result)

# Output
#
# [
#     [
#         {
#             "id": 443943328732915404,
#             "distance": 0.36103835701942444,
#             "entity": {
#                 "title": "The Hidden Side Effect of the Coronavirus",
#                 "reading_time": 8,
#                 "claps": 83
#             }
#         },
#         {
#             "id": 443943328732915438,
#             "distance": 0.37674015760421753,
#             "entity": {
#                 "title": "Why The Coronavirus Mortality Rate is Misleading",
#                 "reading_time": 9,
#                 "claps": 2900
#             }
#         },
#         {
#             "id": 443943328732913238,
#             "distance": 0.4162980318069458,
#             "entity": {
#                 "title": "Coronavirus shows what ethical Amazon could look like",
#                 "reading_time": 4,
#                 "claps": 51
#             }
#         }
#     ]
# ]

# get collection info
print("Entity counts: ", collection.num_entities)

# Output
#
# Entity counts:  5979
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.search({
    collection_name: collectionName,
    vector: rows[0].title_vector,
    limit: 3,
    filter: "claps > 30 and reading_time < 10",
    output_fields: ["title", "link"]
});

console.log(res);

// Output
// 
// {
//   status: { error_code: 'Success', reason: '', code: 0 },
//   results: [
//     {
//       score: 0.36103832721710205,
//       id: '5607',
//       link: 'https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586',
//       title: 'The Hidden Side Effect of the Coronavirus'
//     },
//     {
//       score: 0.37674015760421753,
//       id: '5641',
//       link: 'https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6',
//       title: 'Why The Coronavirus Mortality Rate is Misleading'
//     },
//     {
//       score: 0.416297972202301,
//       id: '3441',
//       link: 'https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663',
//       title: 'Coronavirus shows what ethical Amazon could look like'
//     }
//   ]
// }
// 

// 7. Get collection info

res = await client.describeCollection({
    collection_name: collectionName
})

console.log(res);

// Output
// 
// {
//   virtual_channel_names: [ 'by-dev-rootcoord-dml_11_445311585782773304v0' ],
//   physical_channel_names: [ 'by-dev-rootcoord-dml_11' ],
//   aliases: [],
//   start_positions: [],
//   properties: [],
//   status: { error_code: 'Success', reason: '', code: 0 },
//   schema: {
//     fields: [ [Object], [Object], [Object] ],
//     name: 'medium_articles_2020',
//     description: '',
//     autoID: false,
//     enable_dynamic_field: true
//   },
//   collectionID: '445311585782773304',
//   created_timestamp: '445316708672733190',
//   created_utc_timestamp: '1698748430911',
//   shards_num: 1,
//   consistency_level: 'Bounded',
//   collection_name: 'medium_articles_2020',
//   db_name: 'default',
//   num_partitions: '1'
// }
// 
```

</TabItem>

<TabItem value='java'>

```java
// prepare query vector

List<List<Float>> queryVectors = new ArrayList<>();
List<Float> queryVector1 = rows.get(0).getJSONArray("title_vector").toJavaList(Float.class);
queryVectors.add(queryVector1);

List<String> outputFields = new ArrayList<>();
outputFields.add("title");
// The following two fields are dynamic fields.
outputFields.add("claps");
outputFields.add("reading_time");

// Search vectors in a collection

SearchParam searchParam = SearchParam.newBuilder()
    .withCollectionName(collectionName)
    .withVectorFieldName("title_vector")
    .withVectors(queryVectors)
    .withTopK(5)   
    .withMetricType(MetricType.L2)  
    .withParams("{\"nprobe\":10,\"offset\":2, \"limit\":3}")
    .withOutFields(outputFields)
    .withExpr("$meta[\"claps\"] > 30 and reading_time < 10")
    .build();

R<SearchResults> response = client.search(searchParam);

SearchResultsWrapper wrapper = new SearchResultsWrapper(response.getData().getResults());

List<List<JSONObject>> results = new ArrayList<>();

for (int i = 0; i < queryVectors.size(); ++i) {
    List<SearchResultsWrapper.IDScore> scores = wrapper.getIDScore(i);
    List<JSONObject> entities = new ArrayList<>();
    for (int j = 0; j < scores.size(); ++j) {
        SearchResultsWrapper.IDScore score = scores.get(j);
        JSONObject entity = new JSONObject();
        entity.put("id", score.getLongID());
        entity.put("distance", score.getScore());
        entity.put("title", scores.get(j).get("title"));
        // The following are dynamic fields.
        entity.put("claps", scores.get(j).get("claps"));
        entity.put("reading_time", scores.get(j).get("reading_time"));
        entities.add(entity);
    }
    
    results.add(entities);
}

System.out.println(results);

// Output:
// [[
//     {
//         "reading_time": 6,
//         "distance": 0.494843,
//         "id": 445297206350523266,
//         "title": "How bad will the Coronavirus Outbreak get? \u2014 Predicting the outbreak figures",
//         "claps": 1100
//     },
//     {
//         "reading_time": 7,
//         "distance": 0.50522643,
//         "id": 445297206350523757,
//         "title": "What Does Coronavirus Mean For Your Startup?",
//         "claps": 111
//     },
//     {
//         "reading_time": 4,
//         "distance": 0.50953895,
//         "id": 445297206350524005,
//         "title": "The Definitive Guide to Leading Remote Work Teams During Coronavirus",
//         "claps": 753
//     },
//     {
//         "reading_time": 6,
//         "distance": 0.53836524,
//         "id": 445297206350523435,
//         "title": "The Relocation Problem of Field-Calibrated Low-Cost Air Quality Monitoring Systems",
//         "claps": 51
//     },
//     {
//         "reading_time": 7,
//         "distance": 0.57358503,
//         "id": 445297206350523356,
//         "title": "The Funeral Industry is a Killer",
//         "claps": 407
//     }
// ]]

```

</TabItem>

<TabItem value='go'>

```go
// 8. Search
fmt.Println("Start searching ...")

// Output: 
//
// Start searching ...

vectors := []entity.Vector{}

for _, row := range data.Rows[:1] {
    vector := make(entity.FloatVector, 0, 768)
    vector = append(vector, row.TitleVector...)
    vectors = append(vectors, vector)
}

sp, _ := entity.NewIndexAUTOINDEXSearchParam(1)

limit := client.WithLimit(10)
offset := client.WithOffset(0)
topK := 5
outputFields := []string{"id", "title", "claps", "reading_time"}

res, err := conn.Search(
    context.Background(),               // context
    COLLNAME,                           // collectionName
    []string{},                         // partitionNames
    "claps > 30 and reading_time < 10", // expr
    outputFields,                       // outputFields
    vectors,                            // vectors
    "title_vector",                     // vectorField
    entity.MetricType("L2"),            // metricType
    topK,                               // topK
    sp,                                 // sp
    limit,                              // opts
    offset,                             // opts
)

if err != nil {
    log.Fatal("Failed to insert rows:", err.Error())
}

fmt.Println(resultsToJSON(res))

// Output: 
// [
//  {
//      "counts": 5,
//      "distances": [
//          0.36103836,
//          0.37674016,
//          0.41629803,
//          0.4360938,
//          0.48886314
//      ],
//      "rows": [
//          {
//              "claps": 83,
//              "id": 5607,
//              "reading_time": 8,
//              "title": "The Hidden Side Effect of the Coronavirus"
//          },
//          {
//              "claps": 2900,
//              "id": 5641,
//              "reading_time": 9,
//              "title": "Why The Coronavirus Mortality Rate is Misleading"
//          },
//          {
//              "claps": 51,
//              "id": 3441,
//              "reading_time": 4,
//              "title": "Coronavirus shows what ethical Amazon could look like"
//          },
//          {
//              "claps": 65,
//              "id": 938,
//              "reading_time": 6,
//              "title": "Mortality Rate As an Indicator of an Epidemic Outbreak"
//          },
//          {
//              "claps": 255,
//              "id": 4275,
//              "reading_time": 9,
//              "title": "How Can AI Help Fight Coronavirus?"
//          }
//      ]
//  }
// ]
```

</TabItem>
</Tabs>

It is worth noting that `claps` and `reading_time` are not present when you define the schema, which does not prevent you from using them in the filter expression and including them in the output fields if the data entities inserted have these fields, just like you normally do in the past.

If the key of a dynamic field contains characters other than digits, letters, and underscores (e.g. plus signs, asterisks, or dollar signs), you need to include the key within `$meta[]` as shown in the following code snippet when using it in a boolean expression or including it in the output fields.

```python
... 
expr='$meta["#key"] in ["a", "b", "c"]', 
output_fields='$meta["#key"]'  
...
```

## Related topics{#related-topics}

- [Create Collection](./create-collection) 

- [Use Partition Key](./use-partition-key) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 
