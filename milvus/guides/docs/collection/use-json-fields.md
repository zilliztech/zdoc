---
slug: /use-json-fields
beta: FALSE
notebook: FALSE
type: origin
token: LTa6we6DziWCb9kmpm5cIRL0nld
sidebar_position: 8
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use JSON Fields

This guide explains how to use the JSON fields, such as inserting JSON values as well as searching and querying in JSON fields with basic and advanced operators

## Overview{#overview}

JSON is an acronym for Javascript Object Notation. It is a simple and lightweight text-based data format. The data in JSON is structured in key-value pairs. Every key is a string and it corresponds to a value that can be a number, string, boolean, list, or array. With Zilliz Cloud clusters, you can store dictionaries as a field value in collections.

For instance, the following is an example of a JSON field that stores the metadata of a published article.

```python
{
    'title': 'The Reported Mortality Rate of Coronavirus Is Not Important', 
    'title_vector': [0.041732933, 0.013779674, -0.027564144, ..., 0.030096486], 
    'article_meta': {
        'link': 'https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912', 
        'reading_time': 13, 
        'publication': 'The Startup', 
        'claps': 1100, 
        'responses': 18,
        'tag_1': [4, 15, 6, 7, 9],
        'tag_2': [[2, 3, 4], [7, 8, 9], [5, 6, 1]]
    }
}
```

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Ensure that all values in a list or array are of the same data type.</p></li>
<li><p>Any nested dictionaries in a JSON field value will be considered strings.</p></li>
<li><p>Use only alphanumeric characters and underscores to name JSON keys, as other characters may cause problems with filtering or searching.</p></li>
</ul>

</Admonition>

## Define JSON field{#define-json-field}

To define a JSON field, simply follow the same procedure as defining fields of other types.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
import os, json, time
from pymilvus import MilvusClient, DataType

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
    auto_id=False,
    enable_dynamic_field=True
)

schema.add_field(field_name="id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="title", datatype=DataType.VARCHAR, max_length=512)
schema.add_field(field_name="title_vector", datatype=DataType.FLOAT_VECTOR, dim=768)
schema.add_field(field_name="article_meta", datatype=DataType.JSON)

# 3. Define index parameters
index_params = MilvusClient.prepare_index_params()

index_params.add_index(
    field_name="title_vector",
    index_type="AUTOINDEX",
    metric_type="L2"
)

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
            auto_id: false
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
            name: "article_meta",
            // This field is a JSON field.
            data_type: DataType.JSON
        }
    ]
    
    // 3. Create collection
    res = await client.createCollection({
        collection_name: collectionName,
        fields: fields
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
```

</TabItem>

<TabItem value='java'>

```java
package com.zilliz.docs;

import io.milvus.param.*;
import io.milvus.client.*;
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
import io.milvus.common.clientenum.ConsistencyLevelEnum;
import io.milvus.param.collection.LoadCollectionParam;
import io.milvus.grpc.GetLoadingProgressResponse;
import io.milvus.param.collection.GetLoadingProgressParam;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.ArrayList;
import java.util.List;

String clusterEndpoint = "YOUR_CLUSTER_ENDPOINT";
String token = "YOUR_CLUSTER_TOKEN";
String collectionName = "medium_articles";
String data_file = System.getProperty("user.dir") + "/medium_articles_2020_dpr.json";

ConnectParam connectParam = ConnectParam.newBuilder()
    .withUri(clusterEndpoint)
    .withToken(token)
    .build();

MilvusServiceClient client = new MilvusServiceClient(connectParam);

System.out.println("Connected to Zilliz Cloud!");

// Output:
// Connected to Zilliz Cloud!

// 1. define fields
FieldType id = FieldType.newBuilder()
    .withName("id")
    .withDataType(DataType.Int64)
    .withPrimaryKey(true)
    .withAutoID(false)
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

// The following field is a JSON field.
FieldType article_meta = FieldType.newBuilder()
    .withName("article_meta")
    .withDataType(DataType.JSON)
    .build();

CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
    .withCollectionName(collectionName)
    .withDescription("Schema of Medium articles")
    .addFieldType(id)
    .addFieldType(title)
    .addFieldType(title_vector)
    .addFieldType(article_meta)
    .build();

R<RpcStatus> collection = client.createCollection(createCollectionParam);

if (collection.getException() != null) {
System.err.println("Failed to create collection: " + collection.getException().getMessage());
return;
}

String content;

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

LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
    .withCollectionName(collectionName)
    .build();

R<RpcStatus> loadCollectionRes = client.loadCollection(loadCollectionParam);

if (loadCollectionRes.getException() != null) {
System.err.println("Failed to load collection: " + loadCollectionRes.getException().getMessage());
return;
}

GetLoadingProgressParam getLoadingProgressParam = GetLoadingProgressParam.newBuilder()
    .withCollectionName(collectionName)
    .build();

R<GetLoadingProgressResponse> getLoadingProgressRes = client.getLoadingProgress(getLoadingProgressParam);

if (getLoadingProgressRes.getException() != null) {
System.err.println("Failed to get loading progress: " + getLoadingProgressRes.getException().getMessage());
return;
}
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "os"
    "time"

    "github.com/milvus-io/milvus-sdk-go/v2/client"
    "github.com/milvus-io/milvus-sdk-go/v2/entity"
)

type DatasetRow struct {
    ID          int64     `json:"id" milvus:"name:id"`
    Title       string    `json:"title" milvus:"name:title"`
    TitleVector []float32 `json:"title_vector" milvus:"name:title_vector"`
    Link        string    `json:"link" milvus:"name:link"`
    ReadingTime int64     `json:"reading_time" milvus:"name:reading_time"`
    Publication string    `json:"publication" milvus:"name:publication"`
    Claps       int64     `json:"claps" milvus:"name:claps"`
    Responses   int64     `json:"responses" milvus:"name:responses"`
}

type Dataset struct {
    Rows []DatasetRow `json:"rows"`
}

type CollSchema struct {
    ID          int64      `json:"id" milvus:"name:id"`
    Title       string     `json:"title" milvus:"name:title"`
    TitleVector []float32  `json:"title_vector" milvus:"name:title_vector"`
    ArticleMeta JsonFields `json:"article_meta" milvus:"name:article_meta"`
}

type JsonFields struct {
    Link        string     `json:"link" milvus:"name:link"`
    ReadingTime int64      `json:"reading_time" milvus:"name:reading_time"`
    Publication string     `json:"publication" milvus:"name:publication"`
    Claps       int64      `json:"claps" milvus:"name:claps"`
    Responses   int64      `json:"responses" milvus:"name:responses"`
    Tag_1       []int64    `json: "tag_1" milvus:"name:tag_1"`
    Tag_2       [][]int64  `json: "tag_2" milvus:"name:tag_2"`
}

func main() {
    CLUSTER_ENDPOINT := "http://localhost:19530"
    TOKEN := "root:Milvus"
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

    article_meta := entity.NewField().
        WithName("article_meta").
        WithDataType(entity.FieldTypeJSON)

    // Define schema
    schema := &entity.Schema{
        CollectionName: COLLNAME,
        AutoID:         false,
        Fields: []*entity.Field{
            id,
            title,
            title_vector,
            article_meta,
        },
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

## Insert field values{#insert-field-values}

After creating a collection from the `CollectionSchema` object, dictionaries such as the one above can be inserted into it.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 6. Prepare data
import random

with open(DATASET_PATH) as f:
    data = json.load(f)
    list_of_rows = data['rows']

    data_rows = []
    for row in list_of_rows:
        # Remove the id field because auto-id is enabled for the primary key
        del row['id']
        # Create the article_meta field and 
        row['article_meta'] = {}
        # Move the following keys into the article_meta field
        row['article_meta']['link'] = row.pop('link')
        row['article_meta']['reading_time'] = row.pop('reading_time')
        row['article_meta']['publication'] = row.pop('publication')
        row['article_meta']['claps'] = row.pop('claps')
        row['article_meta']['responses'] = row.pop('responses')
        row['article_meta']['tag_1'] = [ random.randint(0, 40) for _ in range(5)],
        row['article_meta']['tag_2'] = [ [ random.randint(0, 10) for _ in range(3) ] for _ in range(3)]
        # Append this row to the data_rows list
        data_rows.append(row)

# 7. Insert data

res = client.insert(
    collection_name=COLLECTION_NAME,
    data=data_rows
)

print(res)

# Output
#
# Data inserted successfully! Inserted counts: 5979
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. prepare data
const data = JSON.parse(fs.readFileSync(data_file, 'utf-8'))

// read rows
const rows = data["rows"]
rows.forEach(row => {
    // add a new field in the row object
    row.article_meta = {}
    // move the following fields into the new field
    row.article_meta.link = row.link
    delete row.link
    row.article_meta.reading_time = row.reading_time
    delete row.reading_time
    row.article_meta.publication = row.publication
    delete row.publication
    row.article_meta.claps = row.claps
    delete row.claps
    row.article_meta.responses = row.responses
    delete row.responses
    row.article_meta.tag_1 = [ 
        Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 40),
        Math.floor(Math.random() * 40)
    ]
    row.article_meta.tag_2 = [
        [ Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10) ],
        [ Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10) ],
        [ Math.floor(Math.random() * 10), Math.floor(Math.random() * 10), Math.floor(Math.random() * 10) ]
    ]
});

console.log(Object.keys(rows[0]))

// Output
// 
// [ 'id', 'title', 'title_vector', 'article_meta' ]
// 

//insert vectors
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
//   timestamp: '445316891046051842'
// }
// 

await sleep(5000)
```

</TabItem>

<TabItem value='java'>

```java
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

// Load dataset
JSONObject dataset = JSON.parseObject(content);
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);
Random random = new Random();

for (int i = 0; i < rows.size(); i++) {
    JSONObject articleMeta = new JSONObject();
    articleMeta.put("link", rows.get(i).getString("link"));
    articleMeta.put("reading_time", rows.get(i).getLong("reading_time"));
    articleMeta.put("publication", rows.get(i).getString("publication"));
    articleMeta.put("claps", rows.get(i).getLong("claps"));
    articleMeta.put("responses", rows.get(i).getLong("responses"));
    articleMeta.put("tag_1", Arrays.asList(random.nextInt(40), random.nextInt(40), random.nextInt(40), random.nextInt(40), random.nextInt(40)));
    articleMeta.put("tag_2", Arrays.asList(
        Arrays.asList(random.nextInt(10), random.nextInt(10), random.nextInt(10)),
        Arrays.asList(random.nextInt(10), random.nextInt(10), random.nextInt(10)),
        Arrays.asList(random.nextInt(10), random.nextInt(10), random.nextInt(10))
    ));

    rows.get(i).remove("link");
    rows.get(i).remove("reading_time");
    rows.get(i).remove("publication");
    rows.get(i).remove("claps");
    rows.get(i).remove("responses");

}      

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
// Successfully insert entities: 5979

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
// 6. read the dataset
file, err := os.ReadFile(DATA_FILE)
if err != nil {
    log.Fatal("Failed to read file:", err.Error())
}

var data Dataset

if err := json.Unmarshal(file, &data); err != nil {
    log.Fatal(err.Error())
}

rows := make([]interface{}, 0, 1)

for i := 0; i < len(data.Rows); i++ {
    id := data.Rows[i].ID
    title := data.Rows[i].Title
    titleVector := data.Rows[i].TitleVector
    articleMeta := JsonFields{
        Link:        data.Rows[i].Link,
        ReadingTime: data.Rows[i].ReadingTime,
        Publication: data.Rows[i].Publication,
        Claps:       data.Rows[i].Claps,
        Responses:   data.Rows[i].Responses,
    }

    collSchema := CollSchema{
        ID:          id,
        Title:       title,
        TitleVector: titleVector,
        ArticleMeta: articleMeta,
    }

    rows = append(rows, collSchema)
}

fmt.Println("Dataset loaded, row number: ", len(data.Rows))

// Output: 
//
// Dataset loaded, row number:  5979

// 7. Insert data
fmt.Println("Start inserting ...")

// Output: 
//
// Start inserting ...

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

## Search within JSON field{#search-within-json-field}

Once all of your data has been added, you can conduct searches using the keys in the JSON field in the same manner as you would with a standard scalar field. Simply follow these steps:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 8. Search data
result = collection.search(
    data=[data_rows[0]['title_vector']],
    anns_field="title_vector",
    param={"metric_type": "L2", "params": {"nprobe": 10}},
    limit=3,
    # Access the keys in the JSON field
    expr='article_meta["claps"] > 30 and article_meta["reading_time"] < 10',
    # Include the JSON field in the output to return
    output_fields=["title", "article_meta"],
)

print([ list(map(lambda y: y.entity.to_dict(),  x)) for x in result ])

# Output
#
# [
#     [
#         {
#             "id": 443943328732940369,
#             "distance": 0.36103835701942444,
#             "entity": {
#                 "title": "The Hidden Side Effect of the Coronavirus",
#                 "article_meta": {
#                     "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586",
#                     "reading_time": 8,
#                     "publication": "The Startup",
#                     "claps": 83,
#                     "responses": 0
#                 }
#             }
#         },
#         {
#             "id": 443943328732940403,
#             "distance": 0.37674015760421753,
#             "entity": {
#                 "title": "Why The Coronavirus Mortality Rate is Misleading",
#                 "article_meta": {
#                     "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6",
#                     "reading_time": 9,
#                     "publication": "Towards Data Science",
#                     "claps": 2900,
#                     "responses": 47
#                 }
#             }
#         },
#         {
#             "id": 443943328732938203,
#             "distance": 0.4162980318069458,
#             "entity": {
#                 "title": "Coronavirus shows what ethical Amazon could look like",
#                 "article_meta": {
#                     "link": "https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663",
#                     "reading_time": 4,
#                     "publication": "The Startup",
#                     "claps": 51,
#                     "responses": 0
#                 }
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
// 6. Conduct an ANN search

res = await client.search({
    collection_name: collectionName,
    vector: rows[0].title_vector,
    limit: 3,
    // Access the keys in the JSON field
    filter: "article_meta['claps'] > 30 and article_meta['reading_time'] < 10",
    // Include the JSON field in the output to return
    output_fields: ["title", "article_meta"]
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
//       title: 'The Hidden Side Effect of the Coronavirus',
//       article_meta: [Object]
//     },
//     {
//       score: 0.37674015760421753,
//       id: '5641',
//       title: 'Why The Coronavirus Mortality Rate is Misleading',
//       article_meta: [Object]
//     },
//     {
//       score: 0.416297972202301,
//       id: '3441',
//       title: 'Coronavirus shows what ethical Amazon could look like',
//       article_meta: [Object]
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
//   virtual_channel_names: [ 'by-dev-rootcoord-dml_11_445311585782777108v0' ],
//   physical_channel_names: [ 'by-dev-rootcoord-dml_11' ],
//   aliases: [],
//   start_positions: [],
//   properties: [],
//   status: { error_code: 'Success', reason: '', code: 0 },
//   schema: {
//     fields: [ [Object], [Object], [Object], [Object] ],
//     name: 'medium_articles_2020',
//     description: '',
//     autoID: false,
//     enable_dynamic_field: false
//   },
//   collectionID: '445311585782777108',
//   created_timestamp: '445316885488599046',
//   created_utc_timestamp: '1698749105410',
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

// prepare output field
List<String> outputFields = new ArrayList<>();
outputFields.add("title");
outputFields.add("article_meta");   

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
    .withExpr("article_meta[\"claps\"] > 30 and article_meta['reading_time'] < 10")
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
        entity.put("reading_time", ((JSONObject) scores.get(j).get("article_meta")).getLong("reading_time"));
        entity.put("claps", ((JSONObject) scores.get(j).get("article_meta")).getLong("claps"));
        entities.add(entity);
    }
    
    results.add(entities);
}

System.out.println(results);

// Output:
// [[
//     {
//         "reading_time": 4,
//         "distance": 0.41629803,
//         "id": 445297206350527638,
//         "title": "Coronavirus shows what ethical Amazon could look like",
//         "claps": 51
//     },
//     {
//         "reading_time": 6,
//         "distance": 0.4360938,
//         "id": 445297206350525135,
//         "title": "Mortality Rate As an Indicator of an Epidemic Outbreak",
//         "claps": 65
//     },
//     {
//         "reading_time": 9,
//         "distance": 0.48886314,
//         "id": 445297206350528472,
//         "title": "How Can AI Help Fight Coronavirus?",
//         "claps": 255
//     },
//     {
//         "reading_time": 5,
//         "distance": 0.49283177,
//         "id": 445297206350528342,
//         "title": "Will Coronavirus Impact Freelancers\u2019 Ability to Rent?",
//         "claps": 63
//     },
//     {
//         "reading_time": 9,
//         "distance": 0.4944387,
//         "id": 445297206350525039,
//         "title": "Choosing the right performance metrics can save lives against Coronavirus",
//         "claps": 202
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
outputFields := []string{"id", "title", "article_meta"}
expr := "article_meta['claps'] > 30 and article_meta['reading_time'] < 10"

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
//          0.36103833,
//          0.37674016,
//          0.41629797,
//          0.4360938,
//          0.48886317
//      ],
//      "rows": [
//          {
//              "article_meta": {
//                  "link": "https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586",
//                  "reading_time": 8,
//                  "publication": "The Startup",
//                  "claps": 83,
//                  "responses": 0
//              },
//              "id": 5607,
//              "title": "The Hidden Side Effect of the Coronavirus"
//          },
//          {
//              "article_meta": {
//                  "link": "https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6",
//                  "reading_time": 9,
//                  "publication": "Towards Data Science",
//                  "claps": 2900,
//                  "responses": 47
//              },
//              "id": 5641,
//              "title": "Why The Coronavirus Mortality Rate is Misleading"
//          },
//          {
//              "article_meta": {
//                  "link": "https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663",
//                  "reading_time": 4,
//                  "publication": "The Startup",
//                  "claps": 51,
//                  "responses": 0
//              },
//              "id": 3441,
//              "title": "Coronavirus shows what ethical Amazon could look like"
//          },
//          {
//              "article_meta": {
//                  "link": "https://towardsdatascience.com/mortality-rate-as-an-indicator-of-an-epidemic-outbreak-704592f3bb39",
//                  "reading_time": 6,
//                  "publication": "Towards Data Science",
//                  "claps": 65,
//                  "responses": 0
//              },
//              "id": 938,
//              "title": "Mortality Rate As an Indicator of an Epidemic Outbreak"
//          },
//          {
//              "article_meta": {
//                  "link": "https://medium.com/swlh/how-can-ai-help-fight-coronavirus-60f2182de93a",
//                  "reading_time": 9,
//                  "publication": "The Startup",
//                  "claps": 255,
//                  "responses": 1
//              },
//              "id": 4275,
//              "title": "How Can AI Help Fight Coronavirus?"
//          }
//      ]
//  }
// ]

```

</TabItem>
</Tabs>

## Query with JSON keys{#query-with-json-keys}

To access a particular key within a JSON field, you can reference the key name by including the JSON field name (such as `article_meta["claps"]`) in `expr` and include the name of the JSON field in `output_fields`. Then you can access the keys in the returned JSON value as normal dictionaries.

- Filters articles whose `tag_1` contains `4` and `14`.

    ```python
    # Solution 1
    res = client.query(
        collection_name="medium_articles_2020",
        # highlight-start
        filter='json_contains(tag_1, 4) and json_contains(tag_1, 14)',
        output_fields=["title", "tag_1"],
        # highlight-end
        limit=3
    )
    
    # Output
    #
    # 
    
    # Solution 2
    res = client.query(
        collection_name="medium_articles_2020",
        # highlight-start
        filter='json_contains_all(tag_1, [4, 14])',
        output_fields=["title", "tag_1"],
        # highlight-end
        limit=3
    )
    
    # Output
    #
    # 
    ```

- Filters articles whose `tag_2` contains `[2, 12]`.

    ```python
    res = client.query(
        collection_name="medium_articles_2020",
        # highlight-start
        filter='json_contains(tag_2, [2, 12])',
        output_fields=["title", "tag_2"],
        # highlight-end
        limit=3
    )
    
    # Output
    #
    # 
    ```

- Filters articles whose `tag_1` contains any of `5`, `7`, and `9`.

    ```python
    res = client.query(
        collection_name="medium_articles_2020",
        # highlight-start
        filter='json_contains_any(tag_1, [5, 7, 9])',
        output_fields=["title", "tag_1"],
        # highlight-end
        limit=3
    )
    
    # Output
    #
    # 
    ```

## Reference on JSON filters{#reference-on-json-filters}

When working with JSON fields, you can either use the JSON fields as filters or some of its specific keys.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>Zilliz Cloud stores string values in the JSON field as is without performing semantic escape or conversion. </li>
</ul>
<p>For instance, <code>'a"b'</code>, <code>"a'b"</code>, <code>'a\\\\'b'</code>, and <code>"a\\\\"b"</code> will be saved as is, while <code>'a'b'</code> and <code>"a"b"</code> will be treated as invalid values.</p>
<ul>
<li><p>To build filter expressions using a JSON field, you can utilize the keys within the field. </p></li>
<li><p>If a key's value is an integer or a float, you can compare it with another integer or float key or an INT32/64 or FLOAT32/64 field.</p></li>
<li><p>If a key's value is a string, you can compare it only with another string key or a VARCHAR field.</p></li>
</ul>

</Admonition>

### Basic Operators in JSON Fields{#basic-operators-in-json-fields}

The following table assumes that the value of a JSON field named `json_key` has a key named `A`. Use it as a reference when constructing boolean expressions using JSON field keys.

|  __Operator__  |  __Examples__                                   |  __Remarks__                                                                                                                                                                                                                                                                                                     |
| -------------- | ----------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  __<__         |  `'json_field["A"] < 3'`                        |  This expression evaluates to true if the value of `json_field["A"]` is less than `3`.                                                                                                                                                                                                                           |
|  __>__         |  `'json_field["A"] > 1'`                        |  This expression evaluates to true if the value of `json_field["A"]` is greater than `1`.                                                                                                                                                                                                                        |
|  __==__        |  `'json_field["A"] == 1'`                       |  This expression evaluates to true if the value of `json_field["A"]` is equal to `1`.                                                                                                                                                                                                                            |
|  __!=__        |  `'json_field["A"][0]' != "abc"'`               |  This expression evaluates to true if<br/> - `json_field` does not have a key named `A`.<br/> - `json_field` has a key named `A` but `json_field["A"]` is not an array.<br/> - `json_field["A"]` is an empty array.<br/> - `json_field["A"]` is an array but the first element is not `abc`.<br/> |
|  __<=__        |  `'json_field["A"] <= 5'`                       |  This expression evaluates to true if the value of `json_field["A"]` is less than or equal to `5`.                                                                                                                                                                                                               |
|  __>=__        |  `'json_field["A"] >= 1'`                       |  This expression evaluates to true if the value of `json_field["A"]` is greater than or equal to `1`.                                                                                                                                                                                                            |
|  __not__       |  `'not json_field["A"] == 1'`                   |  This expression evaluates to true if<br/> - `json_field` does not have a key named `A`.<br/> - `json_field["A"]` is not equal to `1`.<br/>                                                                                                                                                             |
|  __in__        |  `'json_field["A"] in [1, 2, 3]'`               |  This expression evaluates to true if the value of `json_field["A"]` is `1`, `2`, or `3`.                                                                                                                                                                                                                        |
|  __and (&&)__  |  `'json_field["A"] > 1 && json_field["A"] < 3'` |  This expression evaluates to true if the value of `json_field["A"]` is greater than 1 and less than `3`.                                                                                                                                                                                                        |
|  __or (\|\|)__ |  `'json_field["A"] > 1 || json_field["A"] < 3'` |  This expression evaluates to true if the value of `json_field["A"]` is greater than `1` or less than `3`.                                                                                                                                                                                                       |
|  __exists__    |  `'exists json_field["A"]'`                     |  This expression evaluates to true if `json_field` does not have a key named `A`.                                                                                                                                                                                                                                |

### Advanced Operators{#advanced-operators}

The following operators are specific to JSON fields:

- `json_contains(identifier, jsonExpr)`

    This operator filters entities whose identifier contains the specified JSON expression. 

    - Example 1: `{"x": [1,2,3]}`

        ```python
        json_contains(x, 1) # => True (x contains 1.)
        json_contains(x, "a") # => False (x does not contain a member "a".)
        ```

    - Example 2: `{"x", [[1,2,3], [4,5,6], [7,8,9]]}`

        ```python
        json_contains(x, [1,2,3]) # => True (x contains [1,2,3].)
        json_contains(x, [3,2,1]) # => False (x does contain a member [3,2,1].)
        ```

- `json_contains_all(identifier, jsonExpr)`

    This operator filters entities whose identifier contains all the members of the JSON expression.

    Example: `{"x": [1,2,3,4,5,7,8]}`

    ```python
    json_contains_all(x, [1,2,8]) # => True (x contains 1, 2, and 8.)
    json_contains_all(x, [4,5,6]) # => False (x does not has a member 6.)
    ```

- `json_contains_any(identifier, jsonExpr)`

    This operator filters entities whose identifier contains any members of the JSON expression.

    Example: `{"x": [1,2,3,4,5,7,8]}`

    ```python
    json_contains_any(x, [1,2,8]) # => True (x contains 1, 2, and 8.)
    json_contains_any(x, [4,5,6]) # => True (x contains 4 and 5.)
    json_contains_any(x, [6,9]) # => False (x contains none of 6 and 9.)
    ```
