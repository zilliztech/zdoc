---
slug: /enable-dynamic-schema
beta: FALSE
notebook: 02_enable_dynamic_schema.ipynb
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Enable Dynamic Schema

Schema design is crucial for Zilliz Cloud cluster data processing. Before inserting entities into a collection, clarify the schema design and ensure that all data entities inserted afterward match the schema. However, this puts limits on collections, making them similar to tables in relational databases.

Dynamic schema enables users to insert entities with new fields into a collection without modifying the existing schema. This means that users can insert data without knowing the full schema of a collection and can include fields that are not yet defined.

Dynamic schema also provides flexibility in data processing, enabling users to store and retrieve complex data structures in their collections. This includes nested data, arrays, and other complex data types.

:::info Notes

You can [download the source code](https://www.notion.so/fe9cfe916ecc4487b107d70f34192028?pvs=21) of this guide for your reference while reading this guide.

:::

## Create collection with dynamic schema enabled{#create-collection-with-dynamic-schema-enabled}

To create a collection using a dynamic schema, set `enable_dynamic_field` to `True` when defining the data model. Afterward, all undefined fields and their values in the data entities inserted afterward will be treated as pre-defined fields. We prefer to use the term "dynamic fields" to refer to these key-value pairs.

With these dynamic fields, you can ask Zilliz Cloud to output dynamic fields in search/query results and include them in search and query filter expressions just as they are already defined in the collection schema.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType, utility

# 1. define fields
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True, max_length=100),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768)
]
# 2. enable dynamic schema in schema definition
schema = CollectionSchema(
                fields, 
                "The schema for a medium news collection", 
                enable_dynamic_field=True
)

# 3. reference the schema in a collection
collection = Collection("medium_articles_with_dynamic", schema)

# 4. index the vector field
index_params = {
    "index_type": "AUTOINDEX",
    "metric_type": "L2",
    "params": {}
}

collection.create_index(
  field_name="title_vector", 
  index_params=index_params
)

# 5. load the collection
collection.load()

# Get loading progress
progress = utility.loading_progress("medium_articles")

print(f"Collection loaded successfully: {progress}")
```

</TabItem>

<TabItem value='javascript'>

```javascript
async function main() {
    // 1. define fields
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
    ];
    
    
    const collection_name = "medium_articles_with_dynamic"

    // 2. enable dynamic schema
    const req = {
        collection_name,
        fields,
        enable_dynamic_field: true
    }

    // 3. reference the schema in a collection
    let res = await client.createCollection(req);

    console.log(res);

    // 4. index the vector field
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

    // 5. load the collection
    res = await client.loadCollection({
        collection_name
    });

    console.log(res);

    // get loading progress
    res = await client.getLoadingProgress({
        collection_name
    });

    console.log(res);
}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.client.*;
import io.milvus.param.*;
import io.milvus.param.R;
import io.milvus.param.collection.FieldType;
import io.milvus.param.index.CreateIndexParam;
import io.milvus.param.collection.CreateCollectionParam;
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

import java.util.List;
import java.util.ArrayList;
import java.nio.file.Files;
import java.nio.file.Path;

// You should include the following in the main function

// 1. define fields.
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

// 2. enable dynamic schema
CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
    .withCollectionName("medium_articles_with_dynamic")
    .withDescription("Medium articles published between Jan and August in 2020 in prominent publications")
    .addFieldType(id)
    .addFieldType(title)
    .addFieldType(title_vector)
                .withEnableDynamicField(true)

// 3. reference the parameters in a collection creation request
R<RpcStatus> collection = client.createCollection(createCollectionParam);

if (collection.getException() != null) {
    System.out.println("Failed to create collection: " + collection.getException().getMessage());
    return;
}

// 4. create index
CreateIndexParam createIndexParam = CreateIndexParam.newBuilder()
    .withCollectionName("medium_articles_with_dynamic")
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

// 5.load collection
LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
    .withCollectionName("medium_articles_with_dynamic")
    .build();

R<RpcStatus> loadCollectionRes = client.loadCollection(loadCollectionParam);

if (loadCollectionRes.getException() != null) {
    System.out.println("Failed to load collection: " + loadCollectionRes.getException().getMessage());
    return;
}

GetLoadingProgressParam getLoadingProgressParam = GetLoadingProgressParam.newBuilder()
    .withCollectionName("medium_articles_with_dynamic")
    .build();

R<GetLoadingProgressResponse> getLoadingProgressRes = client.getLoadingProgress(getLoadingProgressParam);

if (getLoadingProgressRes.getException() != null) {
    System.out.println("Failed to get loading progress: " + getLoadingProgressRes.getException().getMessage());
    return;
}

// Output:
// 2023-06-10 12:02:04 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: CreateCollectionParam(collectionName=medium_articles_with_dynamic, shardsNum=2, description=Schema of Medium articles, fieldTypes=[FieldType{name='id', type='Int64', primaryKey=true, partitionKey=false, autoID=true, params={}}, FieldType{name='title', type='VarChar', primaryKey=false, partitionKey=false, autoID=false, params={max_length=512}}, FieldType{name='title_vector', type='FloatVector', primaryKey=false, partitionKey=false, autoID=false, params={dim=768}}], partitionsNum=0, consistencyLevel=BOUNDED, databaseName=null, enableDynamicField=true)
// Successfully read file
// 2023-06-10 12:02:07 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: CreateIndexParam(databaseName=null, collectionName=medium_articles_with_dynamic, fieldName=title_vector, indexName=title_vector_index, extraParam={metric_type=L2, index_type=AUTOINDEX}, syncMode=true, syncWaitingInterval=500, syncWaitingTimeout=600)
```

</TabItem>

<TabItem value='go'>

```go
import "github.com/milvus-io/milvus-sdk-go/v2/entity"

// You should include the following in the main function

// 1. Define fields
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

// 2. Define schema
schema := &entity.Schema{
        CollectionName: "medium_articles_with_dynamic",
        Description:    "Medium articles published between Jan and August in 2020 in prominent publications",
        AutoID:         true,
        Fields: []*entity.Field{
                id,
                title,
                title_vector,
        },
        EnableDynamicField: true, // Enable dynamic fiel
}

colerr := conn.CreateCollection(context.Background(), schema, 2)

if colerr != nil {
        log.Fatal("Failed to create collection:", colerr.Error())
}

// 3. Create index
index, err := entity.NewIndexAUTOINDEX(entity.MetricType("L2"))

if err != nil {
        log.Fatal("Failed to prepare the index:", err.Error())
}

err = conn.CreateIndex(
    context.Background(), 
    "medium_articles_with_dynamic", 
    "title_vector", 
    index, 
    false
)

if err != nil {
        log.Fatal("Failed to create the index:", err.Error())
}

// 4. Load collection
loadCollErr := conn.LoadCollection(
    context.Background(), 
    "medium_articles_with_dynamic", 
    false
)

if loadCollErr != nil {
        log.Fatal("Failed to load collection:", loadCollErr.Error())
}

// 5. Load progress
progress, err := conn.GetLoadingProgress(
    context.Background(), 
    "medium_articles_with_dynamic", 
    nil
)

if err != nil {
        log.Fatal("Failed to get loading progress:", err.Error())
}

println("Loading progress:", progress)

// Output
// Loading progress: 100
```

</TabItem>
</Tabs>

## Insert dynamic data{#insert-dynamic-data}

Once the collection is created, you can start inserting data, including the dynamic data into the collection.

### Prepare data{#prepare-data}

Now we need to prepare a piece of applicable data out of the [Example Dataset](https://www.notion.so/Example-Dataset-2df10a1ffe454c52a2be0ec069f4424e?pvs=21).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
import json

# 5. prepare data
with open("path/to/medium_articles_2020_dpr.json") as f:
    data = json.load(f)
    list_of_rows = data['rows']

                # prepare a list of 5 entities
    data_rows = []
    for row in list_of_rows[:5]:
        del row['id']
        data_rows.append(row)

  print(data_rows[0])

# Output:
# 
# {
#    'title': 'The Reported Mortality Rate of Coronavirus Is Not Important',
#    'title_vector': [0.041732933, 0.013779674, -0.027564144, ..., 0.030096486],
#    'link': '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>',
#    'reading_time': 13,
#    'publication': 'The Startup',
#    'claps': 1100,
#           'responses': 18
# }
```

</TabItem>

<TabItem value='javascript'>

```javascript
// You should include the following in the async function declaration

// 5. prepare data
const data = JSON.parse(fs.readFileSync("path/to/medium_articles_2020_dpr.json", "utf-8"));
const rows = data.rows;

console.log(rows[0])

// Output:
// {
//   id: 0,
//   title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
//   title_vector: [
//       0.041732933,   0.013779674,   -0.027564144, -0.013061441,
//       0.009748648, 0.00082446384, -0.00071647146,  0.048612226,
//       -0.04836573,   -0.04567751,    0.018008126, 0.0063936645,
//      -0.011913628,   0.030776596,   -0.018274948,  0.019929802,
//       0.020547243,   0.032735646,   -0.031652678, -0.033816382,
//      -0.051087562,  -0.033748355,   0.0039493158,  0.009246126,
//      -0.060236514,  -0.017136049,    0.028754413, -0.008433934,
//       0.011168004,  -0.012391256,   -0.011225835,  0.031775184,
//       0.002929508,  -0.007448661,   -0.005337719, -0.010999258,
//       -0.01515909,  -0.005130484,   0.0060212007, 0.0034560722,
//      -0.022935811,   -0.04970116,  -0.0155887455,   0.06627353,
//      -0.006052789,  -0.051570725,   -0.109865054,  0.033205193,
//     0.00041118253,  0.0029823708,    0.036160238, -0.011256539,
//     0.00023560718,   0.058322437,    0.022275906,  0.015206677,
//       -0.02884609,  0.0016338055,   0.0049200393,  0.014388571,
//     -0.0049061654,   -0.04664761,   -0.027454877,  0.017526226,
//      -0.005100602,   0.018090058,     0.02700998,   0.04031944,
//        -0.0097965,   -0.03674761,  -0.0043163053, -0.023320708,
//       0.012654851,  -0.014262311,   -0.008081833, -0.018334744,
//      0.0014025003,  -0.003053399,   -0.002636383, -0.022398386,
//      -0.004725274, 0.00036367847,   -0.012368711, 0.0014739085,
//        0.03450414,   0.009684024,    0.017912658,   0.06594397,
//       0.021381201,   0.029343689,  -0.0069561847,  0.026152428,
//        0.04635037,   0.014746184,   -0.002119602,  0.034359712,
//      -0.013705124,   0.010691518,     0.04060854,  0.013679299,
//     ... 668 more items
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
// You should include the following in the main function

// 5. prepare data
String content;

Path file = Path.of("path/to/medium_articles_2020_dpr.json");
try {
    content = Files.readString(file);
} catch (Exception e) {
    System.out.println("Failed to read file: " + e.getMessage());
    return;
}

System.out.println("Successfully read file");

// Output:
// Successfully read file

// Load all records 
JSONObject dataset = JSON.parseObject(content);
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);

// The following is the function used to prepare the dataset.
public static List<JSONObject> getRows(JSONArray dataset, int counts) {
    List<JSONObject> rows = new ArrayList<JSONObject>();
    for (int i = 0; i < counts; i++) {
        JSONObject row = dataset.getJSONObject(i);
        Long reading_time = row.getLong("reading_time");
        Long claps = row.getLong("claps");
        Long responses = row.getLong("responses");
        List<Float> vectors = row.getJSONArray("title_vector").toJavaList(Float.class);
        row.put("title_vector", vectors);
        row.put("reading_time", reading_time);
        row.put("claps", claps);
        row.put("responses", responses);
        row.remove("id");
        rows.add(row);
    }
    return rows;
}
```

</TabItem>

<TabItem value='go'>

```go
// You should include the following in the main function

// 5. prepare data
file, err := os.ReadFile("path/to/medium_articles_2020_dpr.json")
if err != nil {
        log.Fatal("Failed to read file:", err.Error())
}

var data Dataset

if err := json.Unmarshal(file, &data); err != nil {
        log.Fatal(err.Error())
}

log.Println("Dataset loaded, row number: ", len(data.Rows))

// Output
// 2023/06/10 16:26:22 Dataset loaded, row number:  5979

// The struct used in this step are as follows:
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
```

</TabItem>
</Tabs>

### Insert data{#insert-data}

Then you can safely insert the data into the collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 6. insert data
collection.insert(data_rows)
collection.flush()

print("Entity counts: ", collection.num_entities)

# Output
# Entity counts:  5979
```

</TabItem>

<TabItem value='javascript'>

```javascript
// You should include the following in the async function declaration

// 6. insert data
res = await client.insert({
    collection_name,
    data: rows
});

console.log(res);

// Output
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
//   timestamp: '442281413171740674'
// }

res = await client.flush({
    collection_name
});

console.log(res);

// Output
// {
//   coll_segIDs: { medium_articles_with_dynamic: { data: [Array] } },
//   flush_coll_segIDs: { medium_articles_with_dynamic: { data: [] } },
//   coll_seal_times: { medium_articles_with_dynamic: '1687170502' },
//   status: { error_code: 'Success', reason: '' },
//   db_name: 'default'
// }
```

</TabItem>

<TabItem value='java'>

```java
// You should include the following in the main function

// 6. insert data
InsertParam insertParam = InsertParam.newBuilder()
    .withCollectionName("medium_articles_with_dynamic")
    .withRows(rows)
    .build();

R<MutationResult> insertResponse = client.insert(insertParam);

if (insertResponse.getStatus() != R.Status.Success.getCode()) {
    System.out.println(insertResponse.getMessage());
}

MutationResultWrapper mutationResultWrapper = new MutationResultWrapper(insertResponse.getData());

System.out.println("Successfully insert entities: " + mutationResultWrapper.getInsertCount());

// Output:
// 2023-06-10 12:02:10 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: InsertParam{collectionName='medium_articles_with_dynamic', partitionName='', rowCount=1000}
// 2023-06-10 12:02:10 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: DescribeCollectionParam(databaseName=null, collectionName=medium_articles_with_dynamic)
// Successfully insert entities: 5979

// Flush the inserted entities
FlushParam flushParam = FlushParam.newBuilder()
    .withCollectionNames(collectionNames)
    .build();

R<FlushResponse> flushResponse = client.flush(flushParam);

if (flushResponse.getException() != null) {
    System.out.println("Failed to flush: " + flushResponse.getException().getMessage());
    return;
}

System.out.println("Successfully flushed");

// Output:
// 2023-06-19 18:32:13 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: FlushParam{collectionNames='[medium_articles_with_dynamic]', syncFlush=true, syncFlushWaitingInterval=500, syncFlushWaitingTimeout=60}
// Successfully flushed
```

</TabItem>

<TabItem value='go'>

```go
// You should include the following in the main function

// 6. insert data
rows := make([]interface{}, 0, 1)

for i := 0; i < len(data.Rows); i++ {
        rows = append(rows, data.Rows[i])
}

col, err := conn.InsertRows(context.Background(), "medium_articles_with_dynamic", "", rows)
if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
}

log.Println("Rows inserted:", col.Len())

// Output
// 2023/06/19 18:38:09 Rows inserted: 5979

fluerr := conn.Flush(context.Background(), "medium_articles_with_dynamic", false)

if fluerr != nil {
        log.Fatal("Failed to flush:", fluerr.Error())
}

log.Println("Collection flushed")

// Output
// 2023/06/19 18:38:12 Collection flushed
```

</TabItem>
</Tabs>

## Search with dynamic fields{#search-with-dynamic-fields}

If you have created `medium_articles_with_dynamic` with dynamic field enabled,  and inserted data with dynamic fields into, index, and load the collection, you can use dynamic fields in the filter expression of a search or a query as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 7. search with the vector field of the first entity as the query vector.
result = collection.search(
    data=[data_rows[0]['title_vector']],
    anns_field="title_vector",
    param={"metric_type": "L2", "params": {"nprobe": 10}},
    limit=3,
    expr='$meta["claps"] > 30 and reading_time < 10',
    output_fields=["title", "reading_time", "claps"],
)

for hits in result:
    print("Matched IDs: ", hits.ids)
    print("Distance to the query vector: ", hits.distances)
    print("Matched articles: ")
    for hit in hits:
        print(
            "Title: ", 
            hit.entity.get("title"), 
            ", Reading time: ", 
            hit.entity.get("reading_time"), 
            ", Claps", hit.entity.get("claps")
        )

# Output:
# Matched IDs:  [442005795759615782, 442005795759615816, 442005795759613616]
# Distance to the query vector:  [0.36103832721710205, 0.3767401874065399, 0.4162980318069458]
# Matched articles: 
# Title:  The Hidden Side Effect of the Coronavirus , Reading time:  8 , Claps 83
# Title:  Why The Coronavirus Mortality Rate is Misleading , Reading time:  9 , Claps 2900
# Title:  Coronavirus shows what ethical Amazon could look like , Reading time:  4 , Claps 51
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.search({
    collection_name,
    vector: rows[0]['title_vector'],
    filter: '$meta["claps"] > 30 and reading_time < 10',
    output_fields: ["id", "title", "reading_time", "claps"],
});

console.log(res);

// Output
// {
//   status: { error_code: 'Success', reason: '' },
//   results: [
//     {
//       score: -0.8194807767868042,
//       id: '5607',
//       title: 'The Hidden Side Effect of the Coronavirus',
//       reading_time: 8,
//       claps: 83
//     },
//     {
//       score: -0.8116300106048584,
//       id: '5641',
//       title: 'Why The Coronavirus Mortality Rate is Misleading',
//       reading_time: 9,
//       claps: 2900
//     },
//     {
//       score: -0.7918509244918823,
//       id: '3441',
//       title: 'Coronavirus shows what ethical Amazon could look like',
//       reading_time: 4,
//       claps: 51
//     }
//   ]
// }
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
outputFields.add("claps");   
outputFields.add("reading_time"); 

// Search vectors in a collection

SearchParam searchParam = SearchParam.newBuilder()
    .withCollectionName("medium_articles_with_dynamic")
    .withVectorFieldName("title_vector")
    .withVectors(queryVectors)
    .withTopK(3)   
    .withOutFields(outputFields)
    .withExpr("$meta[\\"claps\\"] > 30 and reading_time < 10")
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
        System.out.println("Claps: " + scores.get(j).get("claps"));
        System.out.println("Reading time:" + scores.get(j).get("reading_time"));
    }
    System.out.print("=====================================\\n");
}

// Output
// Search results
// Top 0 ID:442206870370114527 Distance:0.36103836
// Title: The Hidden Side Effect of the Coronavirus
// Claps: 83
// Reading time:8
// Top 1 ID:442206870370114561 Distance:0.37674016
// Title: Why The Coronavirus Mortality Rate is Misleading
// Claps: 2900
// Reading time:9
// Top 2 ID:442206870370112361 Distance:0.41629803
// Title: Coronavirus shows what ethical Amazon could look like
// Claps: 51
// Reading time:4
```

</TabItem>

<TabItem value='go'>

```go
vectors := []entity.Vector{}

for _, row := range data.Rows[:1] {
        vector := make(entity.FloatVector, 0, 768)
        vector = append(vector, row.TitleVector...)
        vectors = append(vectors, vector)
}

sp := searchParams{10, 0, 16}

searchResults, err := conn.Search(
        context.Background(),
        "medium_articles_with_dynamic",
        []string{},
        "$meta[\\"claps\\"] > 30 and reading_time < 10",
        []string{"title", "claps", "reading_time"},
        vectors,
        "title_vector",
        entity.MetricType("L2"),
        3,
        sp,
)

if err != nil {
        log.Fatal("Failed to search:", err.Error())
}

for i, sr := range searchResults {
        log.Println("Result counts", i, ":", sr.ResultCount)

        ids := sr.IDs.FieldData().GetScalars().GetLongData().GetData()
        scores := sr.Scores
        titles := sr.Fields.GetColumn("title").FieldData().GetScalars().GetStringData().GetData()
        dynamics := sr.Fields.GetColumn("claps").FieldData().GetScalars().GetJsonData().GetData()

        for i, record := range ids {
                var dynamic Dynamic
                json.Unmarshal(dynamics[i], &dynamic)

                log.Println("ID:", record, "Score:", scores[i], "Title:", titles[i], "Claps:", dynamic.Claps, "Reading time:", dynamic.ReadingTime)
        }

}

// Output
// 2023/06/19 18:38:12 Result counts 0 : 3
// 2023/06/19 18:38:12 ID: 5607 Score: 0.36103836 Title: The Hidden Side Effect of the Coronavirus Claps: 83 Reading time: 8
// 2023/06/19 18:38:12 ID: 5641 Score: 0.37674016 Title: Why The Coronavirus Mortality Rate is Misleading Claps: 2900 Reading time: 9
// 2023/06/19 18:38:12 ID: 3441 Score: 0.41629803 Title: Coronavirus shows what ethical Amazon could look like Claps: 51 Reading time: 4

// The structs and functions used in this step are as follows:
type Dynamic struct {
        Link        string `json:"link" milvus:"name:link"`
        ReadingTime int64  `json:"reading_time" milvus:"name:reading_time"`
        Publication string `json:"publication" milvus:"name:publication"`
        Claps       int64  `json:"claps" milvus:"name:claps"`
        Response    int64  `json:"response" milvus:"name:responses"`
}

type searchParams struct {
        limit  int64
        offset int64
        nprobe int64
}

func (sp searchParams) Params() map[string]interface{} {
        return map[string]interface{}{
                "limit":  sp.limit,
                "offset": sp.offset,
                "nprobe": sp.nprobe,
        }
}
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

- [Use Customized Schema](./create-collection-with-schema) 

- [Use Partition Key](./use-partition-key) 

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json-1) 
