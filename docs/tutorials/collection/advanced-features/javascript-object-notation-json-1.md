---
slug: /javascript-object-notation-json-1
beta: FALSE
notebook: 04_use_json_field.ipynb
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Use JSON Fields

JSON stands for **Javascript Object Notation**, which is a lightweight and easy-to-use text-based data format. JSON fields consist of key-value pairs, where each key is a string and its corresponding value can be a number, string, boolean, list, or array. You can insert dictionaries as a field value into collections of your Zilliz Cloud clusters.

For instance, here's an example of a JSON field that stores the metadata of a published article.

```python
{
          'title': 'The Reported Mortality Rate of Coronavirus Is Not Important', 
          'title_vector': [0.041732933, 0.013779674, -0.027564144, ..., 0.030096486], 
          'article_meta': {
        'link': '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>', 
        'reading_time': 13, 
        'publication': 'The Startup', 
        'claps': 1100, 
        'responses': 18
          }
}
```

Please keep in mind that when creating a list or array, it's important to ensure that all values are of the same type. Additionally, any nested dictionaries will be treated as strings. When defining JSON keys, it's recommended to only use alphanumeric characters and underscores, as other characters may cause issues with filtering or searching.

:::info Notes

You can [download the source code](https://assets.zilliz.com/zdoc/zilliz_cloud_sdk_examples.zip) of this guide for your reference while reading this guide.

:::

## Define JSON field{#define-json-field}

To define a JSON field, simply follow the same procedure as defining fields of other types.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
import json
from pymilvus import connections, Collection, FieldSchema, CollectionSchema, DataType

# 1. define fields
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True, auto_id=True, max_length=100),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="article_meta", dtype=DataType.JSON),
]
# 2. create schema
schema = CollectionSchema(
                fields
)
# 3. reference the schema in a collection
collection = Collection("medium_articles_with_json", schema)

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
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType } = require("@zilliz/milvus2-sdk-node");
const fs = require("fs");

async function main() {
    const client = new MilvusClient({
        address,
        token
    }, true);

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
        {
            name: "article_meta",
            data_type: DataType.JSON,
        }
    ]; 
    
    const collection_name = "medium_articles_with_json"

    // 2. load the fields in a req
    const req = {
        collection_name,
        fields,
    }

    // 3. reference the req in a collection
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

    res = await client.dropCollection({ collection_name });

    console.log(res);
}

main();
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

// 1. define fields
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

// This is the JSON field
FieldType article_meta = FieldType.newBuilder()
    .withName("article_meta")
    .withDataType(DataType.JSON)
    .build();

// 2. reference the fields to prepare the req     
CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
    .withCollectionName("medium_articles_with_json")
    .withDescription("Schema of Medium articles")
    .addFieldType(id)
    .addFieldType(title)
    .addFieldType(title_vector)
    .addFieldType(article_meta)
    .withEnableDynamicField(false)
    .build();

// 3. create a collection with the prepared req
R<RpcStatus> collection = client.createCollection(createCollectionParam);

if (collection.getException() != null) {
    System.out.println("Failed to create collection: " + collection.getException().getMessage());
    return;
}

// 4. create index
CreateIndexParam createIndexParam = CreateIndexParam.newBuilder()
    .withCollectionName("medium_articles_with_json")
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

// 5. load the collection
LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
    .withCollectionName("medium_articles_with_json")
    .build();

R<RpcStatus> loadCollectionRes = client.loadCollection(loadCollectionParam);

if (loadCollectionRes.getException() != null) {
    System.out.println("Failed to load collection: " + loadCollectionRes.getException().getMessage());
    return;
}

GetLoadingProgressParam getLoadingProgressParam = GetLoadingProgressParam.newBuilder()
    .withCollectionName("medium_articles_with_json")
    .build();

R<GetLoadingProgressResponse> getLoadingProgressRes = client.getLoadingProgress(getLoadingProgressParam);

if (getLoadingProgressRes.getException() != null) {
    System.out.println("Failed to get loading progress: " + getLoadingProgressRes.getException().getMessage());
    return;
}

// Output:
// 2023-06-10 15:37:45 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: CreateCollectionParam(collectionName=medium_articles_with_json, shardsNum=2, description=Schema of Medium articles, fieldTypes=[FieldType{name='id', type='Int64', primaryKey=true, partitionKey=false, autoID=true, params={}}, FieldType{name='title', type='VarChar', primaryKey=false, partitionKey=false, autoID=false, params={max_length=512}}, FieldType{name='title_vector', type='FloatVector', primaryKey=false, partitionKey=false, autoID=false, params={dim=768}}, FieldType{name='article_meta', type='JSON', primaryKey=false, partitionKey=false, autoID=false, params={}}], partitionsNum=0, consistencyLevel=BOUNDED, databaseName=null, enableDynamicField=false)
// 2023-06-10 15:37:46 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: CreateIndexParam(databaseName=null, collectionName=medium_articles_with_json, fieldName=title_vector, indexName=title_vector_index, extraParam={metric_type=L2, index_type=AUTOINDEX}, syncMode=true, syncWaitingInterval=500, syncWaitingTimeout=600)
// 2023-06-10 15:37:48 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: LoadCollectionParam(databaseName=null, collectionName=medium_articles_with_json, syncLoad=true, syncLoadWaitingInterval=500, syncLoadWaitingTimeout=60, replicaNumber=1, refresh=false)
// 2023-06-10 15:37:50 io.milvus.client.AbstractMilvusGrpcClient logInfo 
// INFO: GetLoadingProgressParam{collectionName='medium_articles_with_json', partitionNames='[]'}
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

// This is the JSON field
article_meta := entity.NewField().
        WithName("article_meta").
        WithDataType(entity.FieldTypeJSON)

// 2. create schema
schema := &entity.Schema{
        CollectionName: "medium_articles_with_json",
        Description:    "Medium articles published between Jan and August in 2020 in prominent publications",
        AutoID:         true,
        Fields: []*entity.Field{
                id,
                title,
                title_vector,
                article_meta,
        },
        EnableDynamicField: true,
}

// 3. create a collection with the schema
colerr := conn.CreateCollection(context.Background(), schema, 2)

if colerr != nil {
        log.Fatal("Failed to create collection:", colerr.Error())
}

// 4. create index
index, err := entity.NewIndexAUTOINDEX(entity.MetricType("L2"))

if err != nil {
        log.Fatal("Failed to prepare the index:", err.Error())
}

err = conn.CreateIndex(
        context.Background(),
        "medium_articles_with_json",
        "title_vector",
        index,
        false,
)

if err != nil {
        log.Fatal("Failed to create the index:", err.Error())
}

// 5. Load collection
loadCollErr := conn.LoadCollection(
        context.Background(),
        "medium_articles_with_json",
        false,
)

if loadCollErr != nil {
        log.Fatal("Failed to load collection:", loadCollErr.Error())
}

// Load progress
progress, err := conn.GetLoadingProgress(
        context.Background(),
        "medium_articles_with_json",
        nil,
)

if err != nil {
        log.Fatal("Failed to get loading progress:", err.Error())
}

println("Loading progress:", progress)
```

</TabItem>
</Tabs>

To accomplish the task described above, you'll need to create a `FieldSchema` object that corresponds to the JSON field, and set its `dtype` attribute to `DataType.JSON`.

## Insert field values{#insert-field-values}

After creating a collection from the `CollectionSchema` object, dictionaries such as the one above can be inserted into it.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 6. prepare data
with open("path/to/medium_articles_2020_dpr.json") as f:
    data = json.load(f)
    list_of_rows = data['rows']

    data_rows = []
    for row in list_of_rows:
        data_rows.append({
            "title": row["title"],
            "title_vector": row["title_vector"],
            "article_meta": dict(
                link=row["link"],
                reading_time=row['reading_time'],
                publication=row["publication"],
                claps=row["claps"],
                responses=row["responses"],
            )
        })

    print(data_rows[0])

# Output:
# {
#           'title': 'The Reported Mortality Rate of Coronavirus Is Not Important', 
#           'title_vector': [0.041732933, 0.013779674, -0.027564144, ..., 0.030096486], 
#           'article_meta': {
#        'link': '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>', 
#         'reading_time': 13, 
#         'publication': 'The Startup', 
#         'claps': 1100, 
#         'responses': 18
#           }
# }

# 7. insert data
collection.insert(data_rows)
collection.flush()

# Output
# Number of entities in collection:  5979
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6. prepare data
const data = JSON.parse(fs.readFileSync("medium_articles_2020_dpr.json", { encoding: "utf-8" }));
const rows = data.rows.map((row, index) => {
    return {
        id: row.id,
        title: row.title,
        title_vector: row.title_vector,
        article_meta: {
            link: row.link,
            reading_time: row.reading_time,
            publication: row.publication,
            claps: row.claps,
            responses: row.responses,
        }
    }
});

console.log(rows[0]);

// {
//   id: 0,
//   title: 'The Reported Mortality Rate of Coronavirus Is Not Important',
//   title_vector: [
//       0.041732933,   0.013779674,   -0.027564144, -0.013061441,
//     ... 764 more items
//   ],
//   article_meta: {
//     link: '<https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912>',
//     reading_time: 13,
//     publication: 'The Startup',
//     claps: 1100,
//     responses: 18
//   }
// }

//7. insert data

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
//   timestamp: '442282689587576833'
// }

res = await client.flush({
    collection_names: [collection_name]
});

console.log(res);

// Output
// {
//   coll_segIDs: { medium_articles_with_json: { data: [Array] } },
//   flush_coll_segIDs: { medium_articles_with_json: { data: [] } },
//   coll_seal_times: { medium_articles_with_json: '1687174567' },
//   status: { error_code: 'Success', reason: '' },
//   db_name: 'default'
// }
```

</TabItem>

<TabItem value='java'>

```java
// 6. read a local file

String content;

Path file = Path.of("medium_articles_2020_dpr.json");
try {
    content = Files.readString(file);
} catch (Exception e) {
    System.out.println("Failed to read file: " + e.getMessage());
    return;
}

System.out.println("Successfully read file");

JSONObject dataset = JSON.parseObject(content);
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);

// 7. insert data
InsertParam insertParam = InsertParam.newBuilder()
    .withCollectionName("medium_articles_with_json")
    .withRows(rows)
    .build();

R<MutationResult> insertResponse = client.insert(insertParam);

if (insertResponse.getStatus() != R.Status.Success.getCode()) {
    System.out.println(insertResponse.getMessage());
}

MutationResultWrapper mutationResultWrapper = new MutationResultWrapper(insertResponse.getData());

System.out.println("Successfully insert entities: " + mutationResultWrapper.getInsertCount());

// Output:
// Successfully insert entities: 5979

// The following is the function used to prepare the data
public static List<JSONObject> getRows(JSONArray dataset, int counts) {
    List<JSONObject> rows = new ArrayList<JSONObject>();
    for (int i = 0; i < counts; i++) {
        JSONObject json_row = new JSONObject(1, true);
        JSONObject article_meta = new JSONObject(1, true);
        JSONObject original_row = dataset.getJSONObject(i);

        String title = original_row.getString("title");
        String link = original_row.getString("link");
        String publication = original_row.getString("publication");
        Long reading_time = original_row.getLong("reading_time");
        Long claps = original_row.getLong("claps");
        Long responses = original_row.getLong("responses");
        List<Float> vectors = original_row.getJSONArray("title_vector").toJavaList(Float.class);

        article_meta.put("link", link);
        article_meta.put("publication", publication);
        article_meta.put("reading_time", reading_time);
        article_meta.put("claps", claps);
        article_meta.put("responses", responses);
        json_row.put("title", title);
        json_row.put("title_vector", vectors);
        json_row.put("article_meta", article_meta);
        rows.add(json_row);
    }
    return rows;
}
```

</TabItem>

<TabItem value='go'>

```go
// 6. read a local file
file, err := os.ReadFile("medium_articles_2020_dpr.json")
if err != nil {
        log.Fatal("Failed to read file:", err.Error())
}

var data Dataset

if err := json.Unmarshal(file, &data); err != nil {
        log.Fatal(err.Error())
}

log.Println("Dataset loaded, row number: ", len(data.Rows))

// Output
// 2023/06/19 19:53:40 Dataset loaded, row number:  5979

rows := make([]interface{}, 0, 1)

// 7. insert rows
for i := 0; i < len(data.Rows); i++ {
        id := data.Rows[i].ID
        title := data.Rows[i].Title
        titleVector := data.Rows[i].TitleVector
        articleMeta := Meta{
                Link:        data.Rows[i].Link,
                ReadingTime: data.Rows[i].ReadingTime,
                Publication: data.Rows[i].Publication,
                Claps:       data.Rows[i].Claps,
                Responses:   data.Rows[i].Responses,
        }

        jsonRow := JsonRow{
                ID:          id,
                Title:       title,
                TitleVector: titleVector,
                ArticleMeta: articleMeta,
        }

        rows = append(rows, jsonRow)
}

col, err := conn.InsertRows(context.Background(), "medium_articles_with_json", "", rows)
if err != nil {
        log.Fatal("Failed to insert rows:", err.Error())
}

log.Println("Number of entitie inserted", col.Len())

// Output:
// 2023/06/19 19:53:52 Number of entitie inserted 5979

// Structs and functions used in this section are 
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
        Responses   int64     `json:"responses" milvus:"name:responses"`
}

type JsonRow struct {
        ID          int64     `json:"id" milvus:"name:id"`
        Title       string    `json:"title" milvus:"name:title"`
        TitleVector []float32 `json:"title_vector" milvus:"name:title_vector"`
        ArticleMeta Meta      `json:"article_meta" milvus:"name:article_meta"`
}

type Meta struct {
        Link        string `json:"link" milvus:"name:link"`
        ReadingTime int64  `json:"reading_time" milvus:"name:reading_time"`
        Publication string `json:"publication" milvus:"name:publication"`
        Claps       int64  `json:"claps" milvus:"name:claps"`
        Responses   int64  `json:"responses" milvus:"name:responses"`
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

## Search within JSON field{#search-within-json-field}

Once all of your data has been added, you can conduct searches using the keys in the JSON field in the same manner as you would with a standard scalar field. Simply follow these steps:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 8. search data
result = collection.search(
    data=[data_rows[0]['title_vector']],
    anns_field="title_vector",
    param={"metric_type": "L2", "params": {"nprobe": 10}},
    limit=3,
    expr='article_meta["claps"] > 30 and article_meta["reading_time"] < 10',
    output_fields=["title", "article_meta" ],
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
            hit.entity.get("article_meta")['reading_time'], 
            ", Claps", 
            hit.entity.get("article_meta")['claps']
        )

# Output:
# Matched IDs:  [442206870370198289, 442206870370198323, 442206870370196123]
# Distance to the query vector:  [0.36103835701942444, 0.37674015760421753, 0.4162980318069458]
# Matched articles: 
# Title:  The Hidden Side Effect of the Coronavirus , Reading time:  8 , Claps 83
# Title:  Why The Coronavirus Mortality Rate is Misleading , Reading time:  9 , Claps 2900
# Title:  Coronavirus shows what ethical Amazon could look like , Reading time:  4 , Claps 51
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. search data

res = await client.search({
    collection_name,
    data: rows[0]["title_vector"],
    limit: 3,
    filter: 'article_meta["claps"] > 30 and article_meta["reading_time"] < 10',
    output_fields: ["title", "article_meta"]
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
//       article_meta: [Object]
//     },
//     {
//       score: -0.8116300106048584,
//       id: '5641',
//       title: 'Why The Coronavirus Mortality Rate is Misleading',
//       article_meta: [Object]
//     },
//     {
//       score: -0.7918509244918823,
//       id: '3441',
//       title: 'Coronavirus shows what ethical Amazon could look like',
//       article_meta: [Object]
//     }
//   ]
// }
```

</TabItem>

<TabItem value='java'>

```java
// 8. prepare query vector
List<List<Float>> queryVectors = new ArrayList<>();
List<Float> queryVector1 = rows.get(0).getJSONArray("title_vector").toJavaList(Float.class);
queryVectors.add(queryVector1);

// 9. prepare output field
List<String> outputFields = new ArrayList<>();
outputFields.add("title");
outputFields.add("article_meta");   

// 10. Search vectors in a collection
SearchParam searchParam = SearchParam.newBuilder()
    .withCollectionName("medium_articles_with_json")
    .withVectorFieldName("title_vector")
    .withVectors(queryVectors)
    .withTopK(3)   
    .withMetricType(MetricType.L2)  
    .withParams("{\\"nprobe\\":10,\\"offset\\":2, \\"limit\\":3}")
    .withOutFields(outputFields)
    .withExpr("article_meta[\\"claps\\"] > 30 and article_meta['reading_time'] < 10")
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
        System.out.println("Reading time: " + ((JSONObject) scores.get(j).get("article_meta")).getLong("reading_time"));
        System.out.println("Claps: " + ((JSONObject) scores.get(j).get("article_meta")).getLong("claps"));
    }
    System.out.print("=====================================\\n");
}

// Output:
// Search results
// Top 0 ID:442206870370214072 Distance:0.41629803
// Title: Coronavirus shows what ethical Amazon could look like
// Reading time: 4
// Claps: 51
// Top 1 ID:442206870370211569 Distance:0.4360938
// Title: Mortality Rate As an Indicator of an Epidemic Outbreak
// Reading time: 6
// Claps: 65
// Top 2 ID:442206870370214906 Distance:0.48886314
// Title: How Can AI Help Fight Coronavirus?
// Reading time: 9
// Claps: 255
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
        "medium_articles_with_json",
        []string{},
        "article_meta[\\"claps\\"] > 30 and article_meta['reading_time'] < 10",
        []string{"title", "article_meta"},
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
        article_metas := sr.Fields.GetColumn("article_meta").FieldData().GetScalars().GetJsonData().GetData()

        log.Println(article_metas)

        for i, record := range ids {
                var article_meta Meta
                json.Unmarshal(article_metas[i], &article_meta)

                log.Println("ID:", record, "Score:", scores[i], "Title:", titles[i], "Claps:", article_meta.Link, "Reading time:", article_meta.ReadingTime)
        }

}

// Output
// 2023/06/19 20:08:47 ID: 5607 Score: 0.36103836 Title: The Hidden Side Effect of the Coronavirus Claps: <https://medium.com/swlh/the-hidden-side-effect-of-the-coronavirus-b6a7a5ee9586> Reading time: 8
// 2023/06/19 20:08:47 ID: 5641 Score: 0.37674016 Title: Why The Coronavirus Mortality Rate is Misleading Claps: <https://towardsdatascience.com/why-the-coronavirus-mortality-rate-is-misleading-cc63f571b6a6> Reading time: 9
// 2023/06/19 20:08:47 ID: 3441 Score: 0.41629803 Title: Coronavirus shows what ethical Amazon could look like Claps: <https://medium.com/swlh/coronavirus-shows-what-ethical-amazon-could-look-like-7c80baf2c663> Reading time: 4
```

</TabItem>
</Tabs>

To access a particular key within a JSON field, you can reference the key name by including the JSON field name (such as `article_meta["claps"]` in `expr`) and include the name of the JSON field in `output_fields`. Then you can access the keys in the returned JSON value as normal dictionaries.

## Limits{#limits}

When working with JSON fields, you can enclose a string value with either double quotation marks ("") or single quotation marks (''). It's important to note that Milvus stores string values in the JSON field as is without performing semantic escape or conversion. For instance, `'a"b'`, `"a'b"`, `'a\\\\'b'`, and `"a\\\\"b"` will be saved as is, while `'a'b'` and `"a"b"` will be treated as invalid values.

To build filter expressions using a JSON field, you can utilize the keys within the field. If a key's value is an integer or a float, you can compare it with another integer or float key or an INT32/64 or FLOAT32/64 field. If a key's value is a string, you can compare it only with another string key or a VARCHAR field.

The following table assumes that the value of a JSON field named `json_key` has a key named `A`. Use it as a reference when constructing boolean expressions using JSON field keys.

|  **Operator** |  **Examples**                                   |  **Remarks**                                                                                                                                                                                                                                                                                                          |
| ------------- | ----------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  <            |  `'json_field["A"] < 3'`                        |  This expression evaluates to true if the value of `json_field["A"]` is less than `3`.                                                                                                                                                                                                                                |
|  >            |  `'json_field["A"] > 1'`                        |  This expression evaluates to true if the value of `json_field["A"]` is greater than `1`.                                                                                                                                                                                                                             |
|  ==           |  `'json_field["A"] == 1'`                       |  This expression evaluates to true if the value of `json_field["A"]` is equal to `1`.                                                                                                                                                                                                                                 |
|  !=           |  `'json_field["A"][0]' != "abc"'`               |  This expression evaluates to true if<br/> <br/>  - `json_field` does not have a key named `A`.<br/> <br/>  - `json_field` has a key named `A` but `json_field["A"]` is not an array.<br/> <br/>  - `json_field["A"]` is an empty array.<br/> <br/>  - `json_field["A"]` is an array but the first element is not `abc`.<br/>  |
|  <=           |  `'json_field["A"] <= 5'`                       |  This expression evaluates to true if the value of `json_field["A"]` is less than or equal to `5`.                                                                                                                                                                                                                    |
|  >=           |  `'json_field["A"] >= 1'`                       |  This expression evaluates to true if the value of `json_field["A"]` is greater than or equal to `1`.                                                                                                                                                                                                                 |
|  not          |  `'not json_field["A"] == 1'`                   |  This expression evaluates to true if<br/> <br/>  - `json_field` does not have a key named `A`.<br/> <br/>  - `json_field["A"]` is not equal to `1`.<br/>                                                                                                                                                                  |
|  in           |  `'json_field["A"] in [1, 2, 3]'`               |  This expression evaluates to true if the value of `json_field["A"]` is `1`, `2`, or `3`.                                                                                                                                                                                                                             |
|  and (&&)     |  `'json_field["A"] > 1 && json_field["A"] < 3'` |  This expression evaluates to true if the value of `json_field["A"]` is greater than 1 and less than `3`.                                                                                                                                                                                                             |
|  or (\|\|)    |  `'json_field["A"] > 1 || json_field["A"] < 3'` |  This expression evaluates to true if the value of `json_field["A"]` is greater than `1` or less than `3`.                                                                                                                                                                                                            |
|  exists       |  `'exists json_field["A"]'`                     |  This expression evaluates to true if `json_field` does not have a key named `A`.                                                                                                                                                                                                                                     |

## Related topics{#related-topics}

- [Use Customized Schema](./create-collection-with-schema) 

- [Enable Dynamic Schema](./enable-dynamic-schema) 

- [Use Partition Key](./use-partition-key) 
