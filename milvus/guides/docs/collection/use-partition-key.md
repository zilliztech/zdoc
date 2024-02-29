---
slug: /use-partition-key
beta: FALSE
notebook: FALSE
type: origin
token: SbP2wIzHIiRFxwkmojHc02zknsk
sidebar_position: 7
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use Partition Key

This guide walks you through using the partition key to accelerate data retrieval from your collection.

## Overview{#overview}

The partition key in Zilliz Cloud allows for the distribution of incoming entities into different partitions based on their respective partition key values. This allows entities with the same key value to be grouped together in a partition, which in turn accelerates search performance by avoiding the need to scan irrelevant partitions when filtering by the key field. Compared to traditional filtering methods, the partition key can greatly enhance query performance.

You can use the partition key to implement multi-tenancy. For details on multi-tenancy, read [Multi-tenancy](https://milvus.io/docs/multi_tenancy.md) for more.

## Before you start{#before-you-start}

Before creating a collection, ensure that

- You have a blueprint of your data model (i.e. schema). For details, see [Schema Explained](./schema-explained).

- You have created a dedicated cluster. For details, see [Create Cluster](./create-cluster).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset).

## Enable partition key{#enable-partition-key}

To demonstrate the use of partition keys, we will continue to use the example dataset that contains over 5,000 articles, and the __publication__ field will serve as the partition key. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
import json, time
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token
COLLECTION_NAME="medium_articles_2020" # Set your collection name
DATASET_PATH="{}/../medium_articles_2020_dpr.json".format(os.path.dirname(__file__)) # Set your dataset path

# 1. Connect to cluster
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN
)

# 2. Define collection schema
schema = MilvusClient.create_schema(
    auto_id=True,
    partition_key_field="publication"
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="title_vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="link", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="reading_time", datatype=DataType.INT64)
schema.add_field(field_name="publication", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="claps", datatype=DataType.INT64)
schema.add_field(field_name="responses", datatype=DataType.INT64)
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
    // Connect to the cluster
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
        {
            name: "link",
            data_type: DataType.VarChar,
            max_length: 512
        },
        {
            name: "reading_time",
            data_type: DataType.Int64
        },
        {
            name: "publication",
            data_type: DataType.VarChar,
            max_length: 512,
            // The field "publication" acts as the primary key
            is_partition_key: true
        },
        {
            name: "claps",
            data_type: DataType.Int64
        },
        {
            name: "responses",
            data_type: DataType.Int64
        }
    ]
```

</TabItem>

<TabItem value='java'>

```java
// You should include the following in the main function

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

FieldType link = FieldType.newBuilder()
    .withName("link")
    .withDataType(DataType.VarChar)
    .withMaxLength(512)
    .build();

FieldType reading_time = FieldType.newBuilder()
    .withName("reading_time")
    .withDataType(DataType.Int64)
    .build();

FieldType publication = FieldType.newBuilder()
    .withName("publication")
    .withDataType(DataType.VarChar)
    .withMaxLength(512)
    // This field is set as the partition key.
    .withPartitionKey(true)
    .build();

FieldType claps = FieldType.newBuilder()
    .withName("claps")
    .withDataType(DataType.Int64)
    .build();

FieldType responses = FieldType.newBuilder()
    .withName("responses")
    .withDataType(DataType.Int64)
    .build();
```

</TabItem>

<TabItem value='go'>

```go
// You should include the following in the main function

CLUSTER_ENDPOINT := "YOUR_CLUSTER_ENDPOINT"
TOKEN := "YOUR_CLUSTER_TOKEN"
COLLNAME := "medium_articles_2020"
DATA_FILE := "../../medium_articles_2020_dpr.json"

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

link := entity.NewField().
    WithName("link").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512)

reading_time := entity.NewField().
    WithName("reading_time").
    WithDataType(entity.FieldTypeInt64)

// The following field is set as the partition key.
publication := entity.NewField().
    WithName("publication").
    WithDataType(entity.FieldTypeVarChar).
    WithMaxLength(512).
    WithIsPartitionKey(true)

claps := entity.NewField().
    WithName("claps").
    WithDataType(entity.FieldTypeInt64)

responses := entity.NewField().
    WithName("responses").
    WithDataType(entity.FieldTypeInt64)
```

</TabItem>
</Tabs>

After you have defined the fields, set other necessary parameters.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 3. Define index parameters
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="title_vector",
    index_type="AUTOINDEX",
    metric_type="L2"
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. Build the requst for creating a collection

// You should include the following in the async function declaration.

const collection_name = "medium_articles";

const req = {
    collection_name: collectionName,
    fields: fields,
}
```

</TabItem>

<TabItem value='java'>

```java
// 3. Build the schema

// You should include the following in the main function

CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
    .withCollectionName(collectionName)
    .addFieldType(id)
    .addFieldType(title)
    .addFieldType(title_vector)
    .addFieldType(link)
    .addFieldType(reading_time)
    .addFieldType(publication)
    .addFieldType(claps)
    .addFieldType(responses)
    .build();
```

</TabItem>

<TabItem value='go'>

```go
// Define schema
schema := &entity.Schema{
    CollectionName: COLLNAME,
    AutoID:         true,
    Fields: []*entity.Field{
        id,
        title,
        title_vector,
        link,
        reading_time,
        publication,
        claps,
        responses,
    },
}
```

</TabItem>
</Tabs>

Finally, you can create a collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 4. Create a collection
client.create_collection(
    collection_name=COLLECTION_NAME,
    schema=schema,
    index_params=index_params
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. Create collection

res = await client.createCollection({
    collection_name: collectionName,
    fields: fields,
    // As an alternative, you can set the partition key by its name when creating a collection.
    // partition_key_field: "publication"
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
        nlist: 16384
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
// 
```

</TabItem>

<TabItem value='java'>

```java
// 3. Create collection
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
```

</TabItem>

<TabItem value='go'>

```go
// Create collection

err = conn.CreateCollection(context.Background(), schema, 2)

if err != nil {
    log.Fatal("Failed to create collection:", err.Error())
}

// Create index for cluster
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

// Load collection
loadCollErr := conn.LoadCollection(context.Background(), COLLNAME, false)

if loadCollErr != nil {
    log.Fatal("Failed to load collection:", loadCollErr.Error())
}

// Get load progress
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

## Insert data{#insert-data}

Once the collection is ready, start inserting data as follows:

### Prepare data{#prepare-data}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 7. Insert data
res = client.insert(
    collection_name=COLLECTION_NAME,
    data=data_rows,
)

# Output
#
# {
#     "insert_count": 5979
# }

time.sleep(5000)
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

## Use partition key{#use-partition-key}

Once you have indexed and loaded the collection as well as inserted data, you can conduct a similarity search using the partition key. 

<Admonition type="info" icon="📘" title="Notes">

<p>To conduct a similarity search using the partition key, you should include either of the following in the boolean expression of the search request:</p>
<ul>
<li><p><code>expr='&lt;partition_key&gt;=="xxxx"'</code></p></li>
<li><p><code>expr='&lt;partition_key&gt; in ["xxx", "xxx"]'</code></p></li>
</ul>
<p>Do replace <code>&lt;partition_key&gt;</code> with the name of the field that is designated as the partition key.</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name=COLLECTION_NAME,
    data=[data_rows[0]['title_vector']],
    filter='claps > 30 and reading_time < 10',
    limit=3,
    output_fields=["title", "reading_time", "claps"],
    search_params={"metric_type": "L2", "params": {}}
)

print(result)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. Conduct an ANN search

res = await client.search({
    collection_name: collectionName,
    vector: rows[0].title_vector,
    limit: 3,
    filter: "claps > 30 and reading_time < 10 and publication in ['Towards Data Science', 'Personal Growth']",
    output_fields: ["title", "link"]
});

console.log(res);

// Output
// 
// {
//   status: { error_code: 'Success', reason: '', code: 0 },
//   results: [
//     {
//       score: 0.37674015760421753,
//       id: '5641',
//       title: 'Why The Coronavirus Mortality Rate is Misleading',
//       link: 'https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6'
//     },
//     {
//       score: 0.436093807220459,
//       id: '938',
//       title: 'Mortality Rate As an Indicator of an Epidemic Outbreak',
//       link: 'https://towardsdatascience.com/mortality-rate-as-an-indicator-of-an-epidemic-outbreak-704592f3bb39'
//     },
//     {
//       score: 0.49443864822387695,
//       id: '842',
//       title: 'Choosing the right performance metrics can save lives against Coronavirus',
//       link: 'https://towardsdatascience.com/choosing-the-right-performance-metrics-can-save-lives-against-coronavirus-2f27492f6638'
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
//   virtual_channel_names: [ 'by-dev-rootcoord-dml_11_445311585782775508v0' ],
//   physical_channel_names: [ 'by-dev-rootcoord-dml_11' ],
//   aliases: [],
//   start_positions: [],
//   properties: [],
//   status: { error_code: 'Success', reason: '', code: 0 },
//   schema: {
//     fields: [
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object],
//       [Object], [Object]
//     ],
//     name: 'medium_articles_2020',
//     description: '',
//     autoID: false,
//     enable_dynamic_field: false
//   },
//   collectionID: '445311585782775508',
//   created_timestamp: '445316810423664644',
//   created_utc_timestamp: '1698748819060',
//   shards_num: 1,
//   consistency_level: 'Bounded',
//   collection_name: 'medium_articles_2020',
//   db_name: 'default',
//   num_partitions: '64'
// }
// 
```

</TabItem>

<TabItem value='java'>

```java
// 7. Search vectors

List<List<Float>> queryVectors = new ArrayList<>();
List<Float> queryVector1 = rows.get(0).getJSONArray("title_vector").toJavaList(Float.class);
queryVectors.add(queryVector1);

List<String> outputFields = new ArrayList<>();
outputFields.add("title");
outputFields.add("link");

// Search vectors in a collection

SearchParam searchParam = SearchParam.newBuilder()
    .withCollectionName(collectionName)
    .withVectorFieldName("title_vector")
    .withVectors(queryVectors)
    .withTopK(5)   
    .withMetricType(MetricType.L2)  
    .withParams("{\"nprobe\":10,\"offset\":2, \"limit\":3}")
    .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
    .withOutFields(outputFields)
    .withExpr("(publication == \"Towards Data Science\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))")
    .build();

R<SearchResults> response = client.search(searchParam);

SearchResultsWrapper wrapper = new SearchResultsWrapper(response.getData().getResults());

List<List<JSONObject>> results = new ArrayList<>();

for (int i = 0; i < queryVectors.size(); ++i) {
    List<SearchResultsWrapper.IDScore> scores = wrapper.getIDScore(i);
    List<JSONObject> entities = new ArrayList<>();
    for (int j = 0; j < scores.size(); ++j) {
        SearchResultsWrapper.IDScore score = scores.get(j);
        JSONObject entity = new JSONObject(1, true);
        entity.put("id", score.getLongID());
        entity.put("distance", score.getScore());
        entity.put("title", scores.get(j).get("title"));
        entity.put("link", scores.get(j).get("link"));
        entities.add(entity);
    }
    
    results.add(entities);
} 

System.out.println(results);

// Output:
// [[
//     {
//         "distance": 0.85477614,
//         "link": "https://towardsdatascience.com/finding-optimal-nba-physiques-using-data-visualization-with-python-6ce27ac5b68f",
//         "id": 445297206350548235,
//         "title": "Finding optimal NBA physiques using data visualization with Python"
//     },
//     {
//         "distance": 0.8702322,
//         "link": "https://towardsdatascience.com/understanding-nlp-how-ai-understands-our-languages-77601002cffc",
//         "id": 445297206350548216,
//         "title": "Understanding Natural Language Processing: how AI understands our languages"
//     },
//     {
//         "distance": 0.9109591,
//         "link": "https://towardsdatascience.com/rage-quitting-cancer-research-5e79cb04801",
//         "id": 445297206350548215,
//         "title": "Rage Quitting Cancer Research"
//     },
//     {
//         "distance": 0.9840777,
//         "link": "https://towardsdatascience.com/data-cleaning-in-python-the-ultimate-guide-2020-c63b88bf0a0d",
//         "id": 445297206350548209,
//         "title": "Data Cleaning in Python: the Ultimate Guide (2020)"
//     },
//     {
//         "distance": 1.091625,
//         "link": "https://towardsdatascience.com/top-10-in-demand-programming-languages-to-learn-in-2020-4462eb7d8d3e",
//         "id": 445297206350548205,
//         "title": "Top 10 In-Demand programming languages to learn in 2020"
//     }
// ]]
```

</TabItem>

<TabItem value='go'>

```go
// Search

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
outputFields := []string{"title", "claps", "publication", "responses", "reading_time"}
expr := "(publication == \"Towards Data Science\") and ((claps > 1500 and responses > 15) or (10 < reading_time < 15))"

res, err := conn.Search(
    context.Background(),    // context
    COLLNAME,                // collectionName
    []string{},              // partitionNames
    expr,                    // expr
    outputFields,            // outputFields
    vectors,                 // vectors
    "title_vector",          // vectorField
    entity.MetricType("L2"), // metricType
    topK,                    // topK
    sp,                      // sp
    limit,                   // opts
    offset,                  // opts
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
//          0.37674016,
//          0.45862228,
//          0.5037479,
//          0.52556163,
//          0.58774835
//      ],
//      "rows": [
//          {
//              "claps": 2900,
//              "publication": "Towards Data Science",
//              "reading_time": 9,
//              "responses": 47,
//              "title": "Why The Coronavirus Mortality Rate is Misleading"
//          },
//          {
//              "claps": 15,
//              "publication": "Towards Data Science",
//              "reading_time": 12,
//              "responses": 0,
//              "title": "Heart Disease Risk Assessment Using Machine Learning"
//          },
//          {
//              "claps": 161,
//              "publication": "Towards Data Science",
//              "reading_time": 13,
//              "responses": 3,
//              "title": "New Data Shows a Lower Covid-19 Fatality Rate"
//          },
//          {
//              "claps": 20,
//              "publication": "Towards Data Science",
//              "reading_time": 11,
//              "responses": 1,
//              "title": "Common Pipenv Errors"
//          },
//          {
//              "claps": 61,
//              "publication": "Towards Data Science",
//              "reading_time": 12,
//              "responses": 0,
//              "title": "Data quality impact on the dataset"
//          }
//      ]
//  }
// ]
```

</TabItem>
</Tabs>

## Use cases{#use-cases}

To achieve better search performance and enable multi-tenancy, you can utilize the partition key feature. This can be done by assigning a tenant-specific value as the partition key field for each entity. When searching or querying the collection, you can filter entities by the tenant-specific value by including the partition key field in the boolean expression. This approach ensures data isolation by tenants and avoids scanning unnecessary partitions.

