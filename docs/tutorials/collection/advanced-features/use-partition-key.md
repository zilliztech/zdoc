---
slug: /docs/use-partition-key
beta: FALSE
notebook: 03_use_partition_key.ipynb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use Partition Key

This guide walks you through using partition key to accelerate data retrieval from your collection.

Partition key enables Zilliz Cloud to store entities into different partitions based on their key values. This way, you can group entities with the same key together and avoid scanning irrelevant partitions when filtering by the key field. Partition keys can greatly speed up query performance compared to traditional filtering methods.

## Before you start{#before-you-start}

Before creating a collection, ensure that

- You have a blueprint of your data model (i.e. schema). For details, see [Schema Explained](./data-models-explained).

- You have created a dedicated cluster. For details, see [Create Cluster](./create-cluster).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset).

## Create collection with partition key enabled{#create-collection-with-partition-key-enabled}

To demonstrate the use of partition keys, we will continue to use the example dataset that contains over 5,000 articles, and `publication` will serve as the partition key.

The schema of the collection to be created is similar to the one specified in [Use Customized Schema](https://zilliverse.feishu.cn/wiki/ZTMdw1e2Wi4Q7mkoGHZc4OY0nZ4) except for the settings of the `publication` field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
import json, time
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token
COLLECTION_NAME="medium_articles_2020" # Set your collection name
DATASET_PATH="{}/../medium_articles_2020_dpr.json".format(os.path.dirname(__file__)) # Set your dataset path

connections.connect(
  alias='default', 
  #  Public endpoint obtained from Zilliz Cloud
  uri=CLUSTER_ENDPOINT,
  # API key or a colon-separated cluster username and password
  token=TOKEN, 
)

# 1. Define fields
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),   
    FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="reading_time", dtype=DataType.INT64),
    # The field "publication" acts as the partition key.
    FieldSchema(name="publication", dtype=DataType.VARCHAR, max_length=512, is_partition_key=True),
    FieldSchema(name="claps", dtype=DataType.INT64),
    FieldSchema(name="responses", dtype=DataType.INT64)
]
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

After you have defined the fields, create a schema for the collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 2. Build the schema
schema = CollectionSchema(
    fields,
    description="Schema of Medium articles",
    # As an alternative, you can set the partition key by its name in the collection schema
    # partition_key_field="publication"
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

Finally, you can create a collection using the collection schema just defined.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 3. Create collection
collection = Collection(
    name=COLLECTION_NAME, 
    description="Medium articles published between Jan and August in 2020 in prominent publications",
    schema=schema
)

print("Collection created successfully")

# Output
#
# Collection created successfully

# 4. Index collection
# 'index_type' defines the index algorithm to be used.
#    AUTOINDEX is the only option.
#
# 'metric_type' defines the way to measure the distance 
#    between vectors. Possible values are L2, IP, and Cosine,
#    and defaults to Cosine.
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "L2",
    "params": {}
}

# To name the index, do as follows:
collection.create_index(
  field_name="title_vector", 
  index_params=index_params,
  index_name='title_vector_index'
)

# 5. Load collection
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

## Conduct ANN search using partition key{#conduct-ann-search-using-partition-key}

Once you have indexed and loaded the collection as well as inserted data as described in [Use Customized Schema](https://zilliverse.feishu.cn/wiki/ZTMdw1e2Wi4Q7mkoGHZc4OY0nZ4), you can conduct an ANN search using the partition key. 

To conduct an ANN search using the partition key, you should include either of the following in the boolean expression of the search request:

- `expr='<partition_key>=="xxxx"'`

- `expr='<partition_key> in ["xxx", "xxx"]'`

Do replace `<partition_key>` with the name of the field that is designated as the partition key.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 8. Search data
# Metric type should be the same as
# that defined in the index parameters 
# used to create the index.
search_params = {
    "metric_type": "L2"
}

results = collection.search(
    data=[rows[0]['title_vector']],
    anns_field="title_vector",
    param=search_params,
    # When conducting searches and queries, include the partition key in the bolean expression
    expr="claps > 30 and reading_time < 10 and publication in ['Towards Data Science', 'Personal Growth']",
    output_fields=["title", "link"],
    limit=5
)

# Get all returned IDs
# results[0] indicates the result 
# of the first query vector in the 'data' list
ids = results[0].ids

print(ids)

# Output
#
# [5641, 938, 842, 70, 3954]

# Get the distance from 
# all returned vectors to the query vector.
distances = results[0].distances

print(distances)

# Output
#
# [0.37674015760421753, 0.436093807220459, 0.49443870782852173, 0.4948430061340332, 0.5028785467147827]

# Get the values of the output fields
# specified in the search request
entities = [ x.entity.to_dict()["entity"] for x in results[0]]

print(entities)

# Output
#
# [
#     {
#         "title": "Why The Coronavirus Mortality Rate is Misleading",
#         "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6"
#     },
#     {
#         "title": "Mortality Rate As an Indicator of an Epidemic Outbreak",
#         "link": "https://towardsdatascience.com/mortality-rate-as-an-indicator-of-an-epidemic-outbreak-704592f3bb39"
#     },
#     {
#         "title": "Choosing the right performance metrics can save lives against Coronavirus",
#         "link": "https://towardsdatascience.com/choosing-the-right-performance-metrics-can-save-lives-against-coronavirus-2f27492f6638"
#     },
#     {
#         "title": "How bad will the Coronavirus Outbreak get? \u2014 Predicting the outbreak figures",
#         "link": "https://towardsdatascience.com/how-bad-will-the-coronavirus-outbreak-get-predicting-the-outbreak-figures-f0b8e8b61991"
#     },
#     {
#         "title": "How similar is COVID-19 to previously discovered Coronaviruses",
#         "link": "https://towardsdatascience.com/how-similar-is-covid-19-to-previously-discovered-coronaviruses-c3d9f25840f7"
#     }
# ]
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

## Typical use cases{#typical-use-cases}

You can use the partition key feature to achieve multi-tenancy with better search performance.

To do this, you can assign a tenant-specific value as the partition key field for each entity. Then, when you search or query the collection, you can include the partition key field in the boolean expression to filter entities by the tenant-specific value. This way, you can implement data isolation by tenants and avoid scanning unnecessary partitions.

## Related topics{#related-topics}

- [Create Collection](./create-collection) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json) 

