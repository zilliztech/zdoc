---
slug: /upsert-entities
beta: TRUE
notebook: 08_insert_and_upsert.ipynb
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Upsert Entities

This topic describes how to upsert data into a collection in Zilliz Cloud.

Upserting data is a combination of update and insert operations. In Zilliz Cloud, an upsert operation performs a data-level action to either insert or update an entity based on whether its primary key already exists in a collection. Specifically:

- If the primary key of the entity already exists in the collection, the existing entity will be overwritten.

- If the primary key does not exist in the collection, a new entity will be inserted.

:::info Notes

The support for data upsert is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

:::

## Before you start{#before-you-start}

Before upserting data, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset-1).

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Use Customized Schema](./create-collection-with-schema).

## Prepare data{#prepare-data}

In this example, we upsert the first 100 entities in the example dataset. You can use the following code to process data:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# retrieve the first 100 entities in the example dataset
import json

with open('medium_articles_2020_dpr.json') as f:
    data = json.load(f)
    data_to_upsert = data["rows"][:100]

display(data_to_upsert[:1])

# Output:
# [{'id': 0,
#   'title': 'The Reported Mortality Rate of Coronavirus Is Not Important',
#   'title_vector': [0.041732933,
#    0.013779674,
#    -0.027564144,
#    -0.013061441,
#    0.009748648,
#    0.00082446384,
#    -0.00071647146,
#    0.048612226,
#    -0.04836573,
#    -0.04567751,
#    0.018008126,
#    0.0063936645,
#    -0.011913628,
#    0.030776596,
#    -0.018274948,
#    0.019929802,
#    0.020547243,
#    0.032735646,
#    -0.031652678,
#    -0.033816382,
#    -0.051087562,
#    -0.033748355,
#    0.0039493158,
# ...
#   'link': 'https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912',
#   'reading_time': 13,
#   'publication': 'The Startup',
#   'claps': 1100,
#   'responses': 18}]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require("node:fs")

const data = JSON.parse(fs.readFileSync('path/to/medium_articles_2020_dpr.json'))
const rows = data["rows"]
const row = rows[0]
console.log("Data: ", Object.keys(row))   
```

</TabItem>

<TabItem value='java'>

```java
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.List;

import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;

String content;

Path file = Path.of("path/to/medium_articles_2020_dpr.json");
try {
    content = Files.readString(file);
} catch (Exception e) {
    System.out.println("Failed to read file: " + e.getMessage());
    return;
}

System.out.println("Successfully read file");  

// Load dataset
JSONObject dataset = JSON.parseObject(content);

// Change the second argument of the `getRows` function to limit the number of rows obtained from the dataset.
List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);

System.out.println(rows.get(0).toString());
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

type Dataset struct {
    Rows []Row `json:"rows"`
}

// ====

// Read the dataset
file, err := os.ReadFile("path/to/medium_articles_2020_dpr.json")
if err != nil {
    log.Fatal("Failed to read file:", err.Error())
}

var data Dataset

   if err := json.Unmarshal(file, &data); err != nil {
    log.Fatal(err.Error())
}

rows := make([]interface{}, 0, 1)

for i := 0; i < len(data.Rows); i++ {
    rows = append(rows, data.Rows[i])
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first 100 records from the dataset
data="$(cat path/to/medium_articles_2020_dpr.json \\
        | jq '.rows' \\
        | jq '.[1:100]' \\
        | jq -r '.[] | . + {"vector": .title_vector} | del(.title_vector) | del(.id)' \\
        | jq -s -c '.')"
        
 
```

</TabItem>
</Tabs>

## Upsert data{#upsert-data}

Once the data is ready, use the following code to upsert it to the collection:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# upsert entities
from pymilvus import connections, Collection

connections.connect(
    alias="default",
    uri="CLUSTER_ENDPOINT",
    token="TOKEN"
    secure=True
)

# get existing collection
collection = Collection("medium_articles")

# upsert data
result = collection.upsert(data_to_upsert)

# flush data into memory
collection.flush()

print(f"Data upserted successfully! Upserted rows: {result.upsert_count}")

# Output:
# Data upserted successfully! Upserted rows: 100
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

res = await client.upsert({
    collection_name: "medium_articles",
    entities: rows
})

console.log("Insert vectors: ", res)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.dml.UpsertParam;
import io.milvus.grpc.MutationResult;

UpsertParam upsertParam = UpsertParam.newBuilder()
    .withCollectionName("medium_articles")
    .withRows(rows)
    .build();
    
R<MutationResult> res = client.upsert(upsertParam);

if (res.getException() != null) {
    System.out.println("Failed to insert: " + res.getException().getMessage());
    return;
}

System.out.println("Successfully inserted " + res.getData().getUpsertCnt() + " records");
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

col, err := conn.Upsert(context.Background(), COLLNAME, "", rows)

if err != nil {
    log.Fatal("Failed to insert rows:", err.Error())
}

fmt.Println("Upserted entities: ", col.Len())
```

</TabItem>

<TabItem value='bash'>

```bash
# insert record 
curl --request POST \\
     --url "${PUBLIC_ENDPOINT}/v1/vector/upsert" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header 'accept: application/json' \\
     --header 'content-type: application/json' \\
     --data "{
        \\"collectionName\\": \\"medium_articles_2020\\",
        \\"data\\": ${data}
    }"

# Response
#
# {
#     "code": 200,
#     "data": {
#         "upsertCount": 99,
#         "upsertIds": [
#             "442169042773493965",
#             "442169042773493966"，
#             ...
#         ]
#     }
# }
```

</TabItem>
</Tabs>

## Understand flushing data{#understand-flushing-data}

In Zilliz Cloud, data from your insert operations naturally finds its way to storage. 

In most cases, you don't need to bother with the `flush()` API every time you insert data. But if you're keen on searching for your newly added data right away, it might be a good idea to call `flush()`. 

What `flush()` does is it wraps up the data segments, ensuring your recent entries are ready for immediate searches. Otherwise, without this step, you might not see your latest additions in immediate search results, because they're not yet properly indexed. 

But remember, for most users and most scenarios, there's no rush to call `flush()`. The system handles it gracefully for you.

## Limits{#limits}

- Upsert operations do not allow updating the primary key field.

- Upsert operations cannot be used on collections where `autoID` is set to `True` for the primary key field.

## Related topics{#related-topics}

- [Use Customized Schema](./create-collection-with-schema)

- [Enable Dynamic Schema](./enable-dynamic-schema)

- [Use Partition Key](./use-partition-key)
