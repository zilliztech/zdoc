---
slug: /use-customized-schema
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use Customized Schema

This guide walks you through how to use a customized schema in a collection.

## Before you start{#before-you-start}

Before creating a collection, ensure that

- You have a blueprint of your data model (i.e. schema). For details, see [Schema Explained](./data-models-explained).

- You have created a dedicated cluster. For details, see [Create Cluster](./create-cluster).

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

:::info Notes

You can [download the source code](https://assets.zilliz.com/zdoc/zilliz_cloud_sdk_examples.zip) of this guide for your reference while reading this guide.

:::

## Connect to cluster{#connect-to-cluster}

When creating a dedicated cluster, you need to configure a cluster credential consisting of a pair of username and password. Be sure to take note of these details, as you’ll need them to connect to the cluster.

If you prefer private links, just replace the **uri** with your private links. Before that, ensure you have access to your private links. For details, see [Set up a Private Link](./set-up-a-private-link).

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
import json
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

# Connect to cluster
connections.connect(
  alias='default', 
  #  Public endpoint obtained from Zilliz Cloud
  uri='https://<CLUSTER-ID>.<CLOUD-REGION>.vectordb.zillizcloud.com:<ACCESS-PORT>',
  secure=True,
  token='user:password', # Username and password specified when you created this cluster
        # Or continue using legacy method `user` and `password` to replace `token`:
        # user='',
        # password='' 
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const address = "https://<CLUSTER-ID>.<CLOUD-REGION>.vectordb.zillizcloud.com:<ACCESS-PORT>"
const token = "user:password"

// You should include the following in the asyn function declaration.
const client = new MilvusClient({
    address,
    token
}, true);
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.client.*;
import io.milvus.param.*;
import io.milvus.param.collection.FieldType;
import io.milvus.param.collection.FlushParam;
import io.milvus.param.index.CreateIndexParam;
import io.milvus.param.collection.CreateCollectionParam;
import io.milvus.param.collection.DropCollectionParam;
import io.milvus.grpc.DataType;
import io.milvus.grpc.FlushResponse;
import io.milvus.param.dml.InsertParam;
import io.milvus.param.dml.InsertParam.Field;
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

import java.util.List;
import java.util.ArrayList;
import java.nio.file.Files;
import java.nio.file.Path;

// 1. Connect to Zilliz Cloud cluster

// You should include the following in the 'main' function

ConnectParam connectParam = ConnectParam.newBuilder()
    .withUri("https://<CLUSTER-ID>.<CLOUD-REGION>.vectordb.zillizcloud.com:<ACCESS-PORT>")
    .withToken("db_admin:<password>")
    .build();

MilvusServiceClient client = new MilvusServiceClient(connectParam);

System.out.println("Connected to Zilliz Cloud!");
```

</TabItem>

<TabItem value='go'>

```go
import (
        "context"
        "encoding/json"
        "fmt"
        "log"
        "os"

        "github.com/milvus-io/milvus-sdk-go/v2/client"
        "github.com/milvus-io/milvus-sdk-go/v2/entity"
)

// 1. Connect to Zilliz Cloud cluster

// You should include the following in the main function.

connParams := client.Config{
        Address: "https://<CLUSTER-ID>.<CLOUD-REGION>.vectordb.zillizcloud.com:<ACCESS-PORT>",
        APIKey:  "db_admin:<password>",
        // Username:      "db_admin",
        // Password:      "<password>",
        EnableTLSAuth: true,
}

conn, err := client.NewClient(context.Background(), connParams)

if err != nil {
        log.Fatal("Failed to connect to Zilliz Cloud:", err.Error())
}
```

</TabItem>
</Tabs>

## Create collection{#create-collection}

Dynamic data models are designed to reduce the learning curve and complexity in inserting entities. For production environments, we recommend that you use a custom schema instead of a dynamic one to ensure that all your data is stored as expected.

You can define a custom data model by specifying the name and data type of each field in a collection.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 2. Define fields
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),   
    FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="reading_time", dtype=DataType.INT64),
    FieldSchema(name="publication", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="claps", dtype=DataType.INT64),
    FieldSchema(name="responses", dtype=DataType.INT64)
]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 2. Define Fields

// You should include the following in the async function declaration.

const fields = [
    {
        name: "id",
        data_type: DataType.Int64,
        is_primary_key: true
    },
    {
        name: "title",
        data_type: DataType.VarChar,
        max_length: 512,
    },
    {
        name: "title_vector",
        data_type: DataType.FloatVector,
        dim: 768,
    },
    {
        name: "link",
        data_type: DataType.VarChar,
        max_length: 512,
    },
    {
        name: "reading_time",
        data_type: DataType.Int64,
    },
    {
        name: "publication",
        data_type: DataType.VarChar,
        max_length: 512,
    },
    {
        name: "claps",
        data_type: DataType.Int64,
    },
    {
        name: "responses",
        data_type: DataType.Int64,
    },
];
```

</TabItem>

<TabItem value='java'>

```java
// 2. Define fields

// You should include the following in the main function

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
// 2. Define fields

// You should include the following in the main function

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

publication := entity.NewField().
        WithName("publication").
        WithDataType(entity.FieldTypeVarChar).
        WithMaxLength(512)

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

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 3. Build the schema
schema = CollectionSchema(
    fields,
    description="Schema of Medium articles",
    enable_dynamic_field=False
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. Build the requst for creating a collection

// You should include the following in the async function declaration.

const collection_name = "medium_articles";

const req = {
    collection_name,
    fields
}
```

</TabItem>

<TabItem value='java'>

```java
// 3. Build the schema

// You should include the following in the main function

CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
    .withCollectionName("medium_articles")
    .withDescription("Schema of Medium articles")
    .addFieldType(id)
    .addFieldType(title)
    .addFieldType(title_vector)
    .addFieldType(link)
    .addFieldType(reading_time)
    .addFieldType(publication)
    .addFieldType(claps)
    .addFieldType(responses)
    .withEnableDynamicField(true)
    .build();
```

</TabItem>

<TabItem value='go'>

```go
// 3. Build the schema

// You should include the following in the main function

schema := &entity.Schema{
        CollectionName: "medium_articles",
        Description:    "Medium articles published between Jan and August in 2020 in prominent publications",
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

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 4. Create collection
collection = Collection(
    name="medium_articles", 
    description="Medium articles published between Jan and August in 2020 in prominent publications",
    schema=schema
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Create collection

// You should include the following in the async function declaration

let res = await client.createCollection(req);

console.log(res)

// Output
// { error_code: 'Success', reason: '' }
```

</TabItem>

<TabItem value='java'>

```java
// 4. Create collection

// You should include the following in the main function

R<RpcStatus> collection = client.createCollection(createCollectionParam);

if (collection.getException() != null) {
    System.out.println("Failed to create collection: " + collection.getException().getMessage());
    return;
}

System.out.println("Collection created!");
```

</TabItem>

<TabItem value='go'>

```go
// 4. Create collection

// You should include the following in the main function

colerr := conn.CreateCollection(context.Background(), schema, 2)

if colerr != nil {
        log.Fatal("Failed to create collection:", colerr.Error())
}
```

</TabItem>
</Tabs>

## Index collection{#index-collection}

Indexes are necessary to achieve extremely high performance in ANN searches on Zilliz Cloud. Zilliz Cloud clusters support indexing only on the vector field. Indexing a collection is equivalent to indexing the vector field in that collection.

The only supported index type for Zilliz Cloud clusters is **AUTOINDEX**. Once an index type rather than **AUTOINDEX** is specified, **AUTOINDEX** automatically applies.  For details, see [AUTOINDEX Explained](https://www.notion.so/AUTOINDEX-Explained-ddd66d7bc1c74ceaa4ef65793e2d2c75?pvs=21).

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 5. Create index

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
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. Create index

// You should include the following in the async function declaration

index_param = {
    index_type: "AUTOINDEX",
    metric_type: "L2",
    params: {}
}

res = await client.createIndex({
    collection_name,
    field_name: "title_vector",
    index_param
});

console.log(res);

// Output:
// { error_code: 'Success', reason: '' }
```

</TabItem>

<TabItem value='java'>

```java
// 5. Create index

// You should include the following in the main function.

CreateIndexParam createIndexParam = CreateIndexParam.newBuilder()
    .withCollectionName("medium_articles")
    .withFieldName("title_vector")
    .withIndexName("title_vector_index")
    .withIndexType(IndexType.AUTOINDEX)
    .withMetricType(MetricType.L2)
    .build();

R<RpcStatus> res = client.createIndex(createIndexParam);

if (res.getException() != null) {
    System.out.println("Failed to create index: " + res.getException().getMessage());
    return;
}

System.out.println("Index created!");
```

</TabItem>

<TabItem value='go'>

```go
// 5. Create index

// You should include the following in the main function.

index, err := entity.NewIndexAUTOINDEX(entity.MetricType("L2"))

if err != nil {
        log.Fatal("Failed to prepare the index:", err.Error())
}

println(index.Name())

err = conn.CreateIndex(context.Background(), "medium_articles", "title_vector", index, false)

if err != nil {
        log.Fatal("Failed to create the index:", err.Error())
}
```

</TabItem>
</Tabs>

## Load and release collection{#load-and-release-collection}

For collections created using SDKs, you should load them before you can perform searches and queries. You can also release collections to save the expense if the collections are not needed temporarily.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 6. Load collection
collection.load()

# Get loading progress
progress = utility.loading_progress("medium_articles")

print(f"Collection loaded successfully: {progress}")

# Output
# Collection loaded successfully: 100%
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. Load collection

// You should include the following in the async function declaration

res = await client.loadCollection({
    collection_name
});

console.log(res);

// Output
// { error_code: 'Success', reason: '' }

res = await client.getLoadingProgress({
    collection_name
});

console.log(res);

// Output:
// { status: { error_code: 'Success', reason: '' }, progress: '0' }
```

</TabItem>

<TabItem value='java'>

```java
// 6. Load collection

// You should include the following in the main function

LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
    .withCollectionName("medium_articles")
    .build();

R<RpcStatus> loadCollectionRes = client.loadCollection(loadCollectionParam);

// Get loading progress
GetLoadingProgressParam getLoadingProgressParam = GetLoadingProgressParam.newBuilder()
    .withCollectionName("medium_articles")
    .build();

R<GetLoadingProgressResponse> getLoadingProgressRes = client.getLoadingProgress(getLoadingProgressParam);

System.out.println("Loading progress: " + getLoadingProgressRes.getData().getProgress());

// Output:
// Loading progress: 100
```

</TabItem>

<TabItem value='go'>

```go
// 6. Load collection

// You should include the following in the main function

loadCollErr := conn.LoadCollection(context.Background(), "medium_articles", false)

if loadCollErr != nil {
        log.Fatal("Failed to load collection:", loadCollErr.Error())
}

// Load progress
progress, err := conn.GetLoadingProgress(context.Background(), "medium_articles", nil)

if err != nil {
        log.Fatal("Failed to get loading progress:", err.Error())
}

println("Loading progress:", progress)
```

</TabItem>
</Tabs>

To release a collection, do as follows:

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
collection.release()
```

</TabItem>

<TabItem value='javascript'>

```javascript
// You should include the following in the async function declaration

res = await client.releaseCollection({
    collection_name
});

console.log(res);

// Output
// { error_code: 'Success', reason: '' }
```

</TabItem>

<TabItem value='java'>

```java
ReleaseCollectionParam releaseCollectionParam = ReleaseCollectionParam.newBuilder()
    .withCollectionName("medium_articles")
    .build();

R<RpcStatus> releaseCollectionRes = client.releaseCollection(releaseCollectionParam);
```

</TabItem>

<TabItem value='go'>

```go
releaseCollErr := conn.ReleaseCollection(context.Background(), "medium_articles")

if releaseCollErr != nil {
        log.Fatal("Failed to release collection:", releaseCollErr.Error())
}
```

</TabItem>
</Tabs>

## Insert entities{#insert-entities}

To add items to a collection, make sure that the format of these items complies with the schema of the collection.

### Prepare data{#prepare-data}

You may arrange your data as either a list of rows or a list of columns.

- Arrange your data as a list of rows.

- To arrange your data in a list of rows, each row should be a dictionary where the field name serves as the key and the field value is its corresponding value. The following code snippet prepares a list of two hundred rows from the [Example Dataset](./example-dataset-1). You can change the slicing to include more or all rows in the dataset.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# Do not include the following in your code
# Demonstration purpose only!

with open('/path/to/downloaded/medium_articles_2020_dpr.json') as f:
        data = json.load(f)
        rows = data['rows'][0:200]

print(rows[:2])
# Output:
# [
#   {
#      'id': 0,
#      'title': 'The Reported Mortality Rate of Coronavirus Is Not Important',
#      'title_vector': [0.041732933, 0.013779674, -0.027564144, ..., 0.030096486],
#      'link': '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>',
#      'reading_time': 13,
#      'publication': 'The Startup',
#      'claps': 1100,
#             'responses': 18
#   },
#   {
#      'id': 1, 
#      'title': 'Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else', 
#      'title_vector': [0.0039737443, 0.003020432, -0.0006188639, 0.03913546, ..., 0.021713957], 
#      'link': '<https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a>', 
#      'reading_time': 14, 
#      'publication': 'The Startup', 
#      'claps': 726, 
#      'responses': 3
#   }
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// Do not include the following in your code
// Demonstration purpose only!

const data = JSON.parse(fs.readFileSync("path/to/downloaded/medium_articles_2020_dpr.json", "utf-8"));
const rows = data.rows;

console.log(rows[0])

// Output
// {
//   id: 0,
//   title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
//   title_vector: [
//       0.041732933,   0.013779674,   -0.027564144, -0.013061441,
//       0.009748648, 0.00082446384, -0.00071647146,  0.048612226,
//     ... 764 more items
//   ],
//   link: '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>',
//   reading_time: 13,
//   publication: 'The Startup',
//   claps: 1100,
//   responses: 18
// }
```

</TabItem>

<TabItem value='java'>

```java
// Do not include the following in your code
// Demonstration purpose only!

// Read the dataset file
String content;

Path file = Path.of("/path/to/downloaded/medium_articles_2020_dpr.json");
try {
    String content = Files.readString(file);
} catch (Exception e) {
    System.out.println("Failed to read file: " + e.getMessage());
    return;
}

System.out.println("Successfully read file");

// Load dataset
JSONObject dataset = JSON.parseObject(content);
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 200);

// ===================================================================
// You should include the following as a sibling of the main function

// Retrieves the specified number of records from the example dataset,
// and arrange them in a list of JSON objects.
public static List<JSONObject> getRows(JSONArray dataset, int counts) {
    List<JSONObject> rows = new ArrayList<JSONObject>();
    for (int i = 0; i < counts; i++) {
        JSONObject row = dataset.getJSONObject(i);
        List<Float> vectors = row.getJSONArray("title_vector").toJavaList(Float.class);
        Long reading_time = row.getLong("reading_time");
        Long claps = row.getLong("claps");
        Long responses = row.getLong("responses");
        row.put("title_vector", vectors);
        row.put("reading_time", reading_time);
        row.put("claps", claps);
        row.put("responses", responses);
        row.remove("id");
        rows.add(row);
    }
    return rows;
}

System.out.println(rows)

// Output
// [{"reading_time":13,"publication":"The Startup","title_vector":[0.041732933,0.013779674,...,0.030096486],"link":"<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912","responses":18,"title":"The> Reported Mortality Rate of Coronavirus Is Not Important","claps":1100}, 
//  {"reading_time":14,"publication":"The Startup","title_vector":[0.0039737443,0.003020432,-6.188639E-4,...,0.021713957],"link":"<https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a","responses":3,"title":"Dashboards> in Python: 3 Advanced Examples for Dash Beginners and Everyone Else","claps":726}]
```

</TabItem>

<TabItem value='go'>

```go
// Do not include the following in your code
// Demonstration purpose only!

// Read the downloaded dataset file
file, err := os.ReadFile("path/to/downloaded/medium_articles_2020_dpr.json")
if err != nil {
        log.Fatal("Failed to read file:", err.Error())
}

// Load the dataset
var data Dataset

if err := json.Unmarshal(file, &data); err != nil {
        log.Fatal(err.Error())
}

log.Println("Dataset loaded, row number: ", len(data.Rows))

rows, err := getRows(data, 5979)

log.Println("Rows prepared: ", len(rows))

// Output
// 2023/06/09 16:54:10 Dataset loaded, row number:  5979
// 2023/06/09 16:54:11 Rows prepared:  5979

// =====================================================
// You should include the following in type definitions

// Structs 
// Define the structs according to the structure of the dataset
type Dataset struct {
        Rows []Row `json:"rows"`
}

type Row struct {
        ID          int64     `json:"id" milvus:"name:id"`
        Title       string    `json:"title" milvus:"name:title"`
        TitleVector []float32 `json:"title_vector" milvus:"name:title_vector"`
        Link        string    `json:"link" milvus:"name:link"`
        ReadingTime int64     `json:"reading_time" milvus:"name:reading_time"`
        Publication string    `json:"publication" milvus:"name:publication"`
        Claps       int64     `json:"claps" milvus:"name:claps"`
        Response    int64     `json:"response" milvus:"name:responses"`
}

func getRows(dataset Dataset, counts int64) ([]interface{}, error) {
        // Convert dataset into acceptable rows
        rows := make([]interface{}, 0, 2)

        for _, row := range dataset.Rows[:counts] {
                rows = append(rows, row)
        }

        return rows, nil
}
```

</TabItem>
</Tabs>

- Arrange your data as a list of columns.

- To add a list of columns, each column is represented by a nested list containing the values of all rows within that column. The following code snippet prepares a list of columns containing two records from the [Example Dataset](https://www.notion.so/Example-Dataset-2df10a1ffe454c52a2be0ec069f4424e?pvs=21). You can change the slicing to include more or all records.

- The Node.js SDK does not support inserting data arranged as a list of columns.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# Do not include the following in your code
# Demonstration purpose only!

with open('/path/to/downloaded/medium_articles_2020_dpr.json') as f:
    data = json.load(f)
    rows = data['rows']
    keys = list(rows[0].keys())
    columns = [ [] for x in keys ]
    for row in rows:
        for x in keys:
            columns[keys.index(x)].append(row[x])

    print("A list of columns is as follows")
    columns_demo = [ [] for x in keys ]
    for row in rows[:3]:
        for x in keys:
            columns_demo[keys.index(x)].append(row[x])

          print(json.dumps(columns_demo, indent=2))

        # Output:
  #   [
        #     [1, 2],
        #     ['Dashboards in Python: 3 Advanced Examples for Dash Beginners and Everyone Else', 'How Can We Best Switch in Python?'],
        #     [[0.0039737443, 0.003020432, -0.0006188639, ..., 0.021713957], [0.031961977, 0.00047043373, -0.018263113, ..., 0.034458436]],
        #     ['<https://medium.com/swlh/dashboards-in-python-3-advanced-examples-for-dash-beginners-and-everyone-else-b1daf4e2ec0a>', '<https://medium.com/swlh/how-can-we-best-switch-in-python-458fb33f7835>'],
        #     [14, 6]
        #     ['The Startup', 'The Startup'],
        #     [726, 500], 
        #            [3, 7]
  #   ]
```

</TabItem>

<TabItem value='java'>

```java
// Do not include the following in your code
// Demonstration purpose only!

// Read the dataset file
String content;

Path file = Path.of("/path/to/downloaded/medium_articles_2020_dpr.json");
try {
    String content = Files.readString(file);
} catch (Exception e) {
    System.out.println("Failed to read file: " + e.getMessage());
    return;
}

// Load dataset
JSONObject dataset = JSON.parseObject(content);
List<Field> fields = getFields(dataset.getJSONArray("rows"), 1);

// ====================================================================
// You should include the following side by side with the main function

// Retrieves the specified number of records from the example dataset,
// and arrange them in a field arrays.
public static List<Field> getFields(JSONArray dataset, int counts) {
    List<Field> fields = new ArrayList<Field>();
    List<String> titles = new ArrayList<String>();
    List<List<Float>> title_vectors = new ArrayList<List<Float>>();
    List<String> links = new ArrayList<String>();
    List<Long> reading_times = new ArrayList<Long>();
    List<String> publications = new ArrayList<String>();
    List<Long> claps_list = new ArrayList<Long>();
    List<Long> responses_list = new ArrayList<Long>();

    for (int i = 0; i < counts; i++) {
        JSONObject row = dataset.getJSONObject(i);
        titles.add(row.getString("title"));
        title_vectors.add(row.getJSONArray("title_vector").toJavaList(Float.class));
        links.add(row.getString("link"));
        reading_times.add(row.getLong("reading_time"));
        publications.add(row.getString("publication"));
        claps_list.add(row.getLong("claps"));
        responses_list.add(row.getLong("responses"));
    }

    fields.add(new Field("title", titles));
    fields.add(new Field("title_vector", title_vectors));
    fields.add(new Field("link", links));
    fields.add(new Field("reading_time", reading_times));
    fields.add(new Field("publication", publications));
    fields.add(new Field("claps", claps_list));
    fields.add(new Field("responses", responses_list));

    return fields;
}

System.out.println(field)

// Output
// [Field{fieldName='title', row_count=1}, Field{fieldName='title_vector', row_count=1}, Field{fieldName='link', row_count=1}, Field{fieldName='reading_time', row_count=1}, Field{fieldName='publication', row_count=1}, Field{fieldName='claps', row_count=1}, Field{fieldName='responses', row_count=1}]
```

</TabItem>

<TabItem value='go'>

```go
// Do not include the following in your code
// Demonstration purpose only!

// Still use the structs defined above

// You should include the following in the main function

// Read the dataset
file, err := os.ReadFile("path/to/downloaded/medium_articles_2020_dpr.json")
if err != nil {
        log.Fatal("Failed to read file:", err.Error())
}

var data Dataset

if err := json.Unmarshal(file, &data); err != nil {
        log.Fatal(err.Error())
}

columns, err := getColumns(data, 1)

for _, column := range columns {
        log.Println(column.Name())
}

// Output
// 2023/06/17 16:32:50 Dataset loaded, row number:  5979
// 2023/06/17 16:32:50 title
// 2023/06/17 16:32:50 title_vector
// 2023/06/17 16:32:50 link
// 2023/06/17 16:32:50 reading_time
// 2023/06/17 16:32:50 publication
// 2023/06/17 16:32:50 claps
// 2023/06/17 16:32:50 responses

// ====================================================================
// You should include the following side by side with the main function

func getColumns(dataset Dataset, counts int64) ([]entity.Column, error) {
        // Make several arrays
        ids := make([]int64, 0, 1)
        titles := make([]string, 0, 1)
        titleVectors := make([][]float32, 0, 1)
        links := make([]string, 0, 1)
        readingTimes := make([]int64, 0, 1)
        publications := make([]string, 0, 1)
        claps := make([]int64, 0, 1)
        responses := make([]int64, 0, 1)

        for _, row := range dataset.Rows[:counts] {
                ids = append(ids, row.ID)
                titles = append(titles, row.Title)
                titleVectors = append(titleVectors, row.TitleVector)
                links = append(links, row.Link)
                readingTimes = append(readingTimes, row.ReadingTime)
                publications = append(publications, row.Publication)
                claps = append(claps, row.Claps)
                responses = append(responses, row.Response)
        }

        // Make columns
        idColumn := entity.NewColumnInt64("id", ids)
        titleColumn := entity.NewColumnVarChar("title", titles)
        titleVectorColumn := entity.NewColumnFloatVector("title_vector", 768, titleVectors)
        linkColumn := entity.NewColumnVarChar("link", links)
        readingTimeColumn := entity.NewColumnInt64("reading_time", readingTimes)
        publicationColumn := entity.NewColumnVarChar("publication", publications)
        clapColumn := entity.NewColumnInt64("claps", claps)
        responseColumn := entity.NewColumnInt64("responses", responses)

        return []entity.Column{
                idColumn,
                titleColumn,
                titleVectorColumn,
                linkColumn,
                readingTimeColumn,
                publicationColumn,
                clapColumn,
                responseColumn,
        }, nil
}
```

</TabItem>
</Tabs>

### Insert data{#insert-data}

Once your data is ready, you can insert it as follows:

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 7. Insert data

with open('/path/to/downloaded/medium_articles_2020_dpr.json') as f:
    data = json.load(f)
    rows = data['rows']

results = collection.insert(rows)

# with open('medium_articles_2020_dpr.json') as f:
#     data = json.load(f)
#     rows = data['rows']
#     keys = list(rows[0].keys())
#     columns = [ [] for x in keys ]
#     for row in rows:
#         for x in keys:
#             columns[keys.index(x)].append(row[x])

#     columns = [ [] for x in keys ]
#     for row in rows:
#         for x in keys:
#             columns[keys.index(x)].append(row[x])

# results = collection.insert(columns) # also works

collection.flush()

print(f"Data inserted successfully! Inserted rows: {results.insert_count}")

# Output:
# Data inserted successfully! Inserted rows: 5979
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 7. Insert data

// You should include the following in the async function declaration

const data = JSON.parse(fs.readFileSync("path/to/downloaded/medium_articles_2020_dpr.json", "utf-8"));
const rows = data.rows;

res = await client.insert({
    collection_name,
    data: rows
});

console.log(res);

// Output:
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
//   status: { error_code: 'Success', reason: '' },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '5979',
//   delete_cnt: '0',
//   upsert_cnt: '0',
//   timestamp: '442251330624684034'
// }

res = await client.flush({
    collection_names: [collection_name]
});

console.log(res);

// Output
// {
//    coll_segIDs: { medium_articles: { data: [Array] } },
//    flush_coll_segIDs: { medium_articles: { data: [] } },
//    coll_seal_times: { medium_articles: '1687054942' },
//    status: { error_code: 'Success', reason: '' },
//    db_name: 'default'
// }
```

</TabItem>

<TabItem value='java'>

```java
// 7. Insert entities

// You should include the following in the main function

// Read the dataset file
String content;

Path file = Path.of("medium_articles_2020_dpr.json");
try {
    content = Files.readString(file);
} catch (Exception e) {
    System.out.println("Failed to read file: " + e.getMessage());
    return;
}

System.out.println("Successfully read file");

// Load dataset
JSONObject dataset = JSON.parseObject(content);
// List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);
List<Field> fields = getFields(dataset.getJSONArray("rows"), 5979); // also works

// Insert columns
InsertParam insertParam = InsertParam.newBuilder()
    .withCollectionName("medium_articles")
    .withFields(fields)
    // .withRows(rows)
    .build();

R<MutationResult> insertResponse = client.insert(insertParam);

if (insertResponse.getStatus() != R.Status.Success.getCode()) {
    System.out.println(insertResponse.getMessage());
}

MutationResultWrapper mutationResultWrapper = new MutationResultWrapper(insertResponse.getData());

System.out.println("Successfully insert entities: " + mutationResultWrapper.getInsertCount());

// Output:
// 2023-06-17 17:06:59 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: InsertParam{collectionName='medium_articles', partitionName='', rowCount=5979}
// 2023-06-17 17:06:59 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: DescribeCollectionParam(databaseName=null, collectionName=medium_articles)
// Successfully insert entities: 5979

List<String> collectionNames = new ArrayList();
collectionNames.add("medium_articles");

FlushParam flushParam = FlushParam.newBuilder()
    .withCollectionNames(collectionNames)
    .withSyncFlush(true)
    .build();

R<FlushResponse> flush = client.flush(flushParam);

if (flush.getException() != null) {
    System.out.println("Failed to flush: " + flush.getException().getMessage());
    return;
}

System.out.println("Flushed!");

// Output:
// 2023-06-17 17:07:04 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: DropCollectionParam{collectionName='medium_articles'}
// 2023-06-17 17:07:05 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: FlushParam{collectionNames='[medium_articles]', syncFlush=true, syncFlushWaitingInterval=500, syncFlushWaitingTimeout=60}
// Flushed!
```

</TabItem>

<TabItem value='go'>

```go
// 7. Insert entities

// You should include the following in the main function

// Read the downloaded dataset file
file, err := os.ReadFile("path/to/downloaded/medium_articles_2020_dpr.json")
if err != nil {
        log.Fatal("Failed to read file:", err.Error())
}

// Load the dataset
var data Dataset

if err := json.Unmarshal(file, &data); err != nil {
        log.Fatal(err.Error())
}

log.Println("Dataset loaded, row number: ", len(data.Rows))

// Insert rows
rows, err := getRows(data, 5979)

log.Println("Rows prepared: ", len(rows))

results, err := conn.InsertRows(context.Background(), "medium_articles", "", rows)

if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
}

// Or insert columns
// columns, err := getColumns(data, 5979)
// 
// for _, column := range columns {
//         log.Println(column.Name())
// }
// 
// results, err := conn.Insert(context.Background(), "medium_articles", "", columns...)
// 
// if err != nil {
//         log.Fatal("Failed to insert rows:", err.Error())
// 
// }

log.Println("Entities inserted:", results.Len())

// Output
// 2023/06/17 16:47:35 Entities inserted: 5979

fluerr := conn.Flush(context.Background(), "medium_articles", false)

if fluerr != nil {
        log.Fatal("Failed to flush collection:", fluerr.Error())
}

log.Println("Collection flushed")

// Output
// 2023/06/17 17:09:32 Collection flushed
```

</TabItem>
</Tabs>

## Search and query{#search-and-query}

A single-vector search request involves using only one vector and asking for the top-K entities that are most similar to the input query vector.

You can also conduct a bulk search by providing multiple query vectors in a single request. In most cases, bulk search is more efficient than conducting single-vector searches because the total latency is much lower than searching against these query vectors in individual requests.

Before searching a collection, you must define the search parameters. Ensure that the metric type matches the one defined in the index parameters. Then, reference the search parameters in the search request and set the query vector, vector field name, limits, and any other applicable parameters.

The following uses a single-vector search as an example. The results display the top 5 most similar entities, along with their primary keys and distances.

<Tabs defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 8. Search data

result = collection.search(
    data=[rows[0]['title_vector']],
    anns_field="title_vector",
    param={"metric_type": "L2", "params": {"nprobe": 10}},
    limit=3,
    expr='claps > 30 and reading_time < 10',
    output_fields=["title", "link" ],
)

# Get all returned IDs
# results[0] indicates the result 
# of the first query vector in the 'data' list
ids = result[0].ids

print(ids)

# Output:
#
# [5607, 5641, 3441]

# Get the distance from 
# all returned vectors to the query vector.
distances = result[0].distances

print(distances)

# Output:
#
# [0.36103835701942444, 0.37674015760421753, 0.4162980318069458]

# Get the values of the output fields
# specified in the search request
hits = result[0]
for hit in hits:
    print(hit.entity.get("title"))
    print(hit.entity.get("link"))

# Output:
#
# The Hidden Side Effect of the Coronavirus
# <https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586>
# Why The Coronavirus Mortality Rate is Misleading
# <https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6>
# Coronavirus shows what ethical Amazon could look like
# <https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663>
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. Search data

// You should include the following in the async function declaration

res = await client.search({
    collection_name,
    vector: rows[0].title_vector,
    limit: 3,
    filter: "claps > 30 and reading_time < 10",
    output_fields: ["title", "link"]
});

console.log(res);

// Output:
// {
//   status: { error_code: 'Success', reason: '' },
//   results: [
//     {
//       score: -0.8194807767868042,
//       id: '5607',
//       title: 'The Hidden Side Effect of the Coronavirus',
//       link: '<https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586>'
//     },
//     {
//       score: -0.8116300106048584,
//       id: '5641',
//       title: 'Why The Coronavirus Mortality Rate is Misleading',
//       link: '<https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6>'
//     },
//     {
//       score: -0.7918509244918823,
//       id: '3441',
//       title: 'Coronavirus shows what ethical Amazon could look like',
//       link: '<https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663>'
//     }
//   ]
// }
```

</TabItem>

<TabItem value='java'>

```java
// 8. Search data

// You should include the following in the main function

List<List<Float>> queryVectors = new ArrayList<>();
List<Float> queryVector = rows.get(0).getJSONArray("title_vector").toJavaList(Float.class);
queryVectors.add(queryVector);

// Prepare the outputFields
List<String> outputFields = new ArrayList<>();
outputFields.add("title");
outputFields.add("link");

// Search vectors in a collection
SearchParam searchParam = SearchParam.newBuilder()
    .withCollectionName("medium_articles")
    .withVectorFieldName("title_vector")
    .withVectors(queryVectors)
    .withExpr("claps > 30 and reading_time < 10")
    .withTopK(3)   
    .withMetricType(MetricType.L2)  
    .withParams("{\\"nprobe\\":10,\\"offset\\":2, \\"limit\\":3}")
    .withConsistencyLevel(ConsistencyLevelEnum.BOUNDED)
    .withOutFields(outputFields)
    .build();

R<SearchResults> response = client.search(searchParam);

SearchResultsWrapper wrapper = new SearchResultsWrapper(response.getData().getResults());
System.out.println("Search results");

for (int i = 0; i < queryVectors.size(); ++i) {
    List<SearchResultsWrapper.IDScore> scores = wrapper.getIDScore(i);
        List<String> titles = (List<String>) wrapper.getFieldData("title", i);
    for (int j = 0; j < scores.size(); ++j) {
        SearchResultsWrapper.IDScore score = scores.get(j);
        System.out.println("Top " + j + " ID:" + score.getLongID() + " Distance:" + score.getScore());
                System.out.println("Title: " + titles.get(j));    
        }
}

// Output
// Search results
// Top 0 ID:442206870369024034 Distance:0.41629803
// Title: Coronavirus shows what ethical Amazon could look like
// Top 1 ID:442206870369021531 Distance:0.4360938
// Title: Mortality Rate As an Indicator of an Epidemic Outbreak
// Top 2 ID:442206870369024868 Distance:0.48886314
// Title: How Can AI Help Fight Coronavirus?
```

</TabItem>

<TabItem value='go'>

```go

// 8. Search data

// You should include the following in the main function

vectors := []entity.Vector{}

for _, row := range data.Rows[:1] {
        vector := make(entity.FloatVector, 0, 768)
        vector = append(vector, row.TitleVector...)
        vectors = append(vectors, vector)
}

// Prepare the search parameters
sp := searchParams{10}

// Start the search
searchResults, err := conn.Search(
        context.Background(),
        "medium_articles",                // collection name
        []string{},                       // partition name
        "",                               // boolean expression
        []string{"title", "publication"}, // output fields
        vectors,                          // query vectors
        "title_vector",                   // vector field name
        entity.MetricType("L2"),          // metric type
        3,                                // topK
        sp,                               // search parameters
)

if err != nil {
        log.Fatal("Failed to search:", err.Error())
}

// Parse the search results
for i, sr := range searchResults {
        log.Println("Result counts", i, ":", sr.ResultCount)

        ids := sr.IDs.FieldData().GetScalars().GetLongData().GetData()
        scores := sr.Scores
        titles := sr.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        publications := sr.Fields.GetColumn("publication").FieldData().GetScalars().GetStringData().GetData()

        for i, record := range ids {
                log.Println("ID:", record, "Score:", scores[i], "Title:", titles[i], "Publication:", publications[i])
        }

}

// Output
// 2023/06/17 17:28:28 Result counts 0 : 3
// 2023/06/17 17:28:28 ID: 0 Score: 0 Title: The Reported Mortality Rate of Coronavirus Is Not Important Publication: The Startup
// 2023/06/17 17:28:28 ID: 3177 Score: 0.29999837 Title: Following the Spread of Coronavirus Publication: Towards Data Science
// 2023/06/17 17:28:28 ID: 5607 Score: 0.36103836 Title: The Hidden Side Effect of the Coronavirus Publication: The Startup

// =======================================================
// You should include the following in type definitions

// Define these struct and function to prepare the search parameters
type searchParams struct {
        nprobe int64
}

func (sp searchParams) Params() map[string]interface{} {
        return map[string]interface{}{
                "nprobe": sp.nprobe,
        }
}
```

</TabItem>
</Tabs>

## Related topics{#related-topics}

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [Use Partition Key](./use-partition-key) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 
