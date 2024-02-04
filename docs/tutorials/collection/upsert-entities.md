---
slug: /upsert-entities
beta: TRUE
notebook: 08_upsert_entities.ipynb
token: FosYwomcEims6PkFvwgcwZbcn1e
sidebar_position: 4
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Upsert Entities

This topic describes how to upsert data into a collection in Zilliz Cloud.

Upserting data is a combination of update and insert operations. In Zilliz Cloud, an upsert operation performs a data-level action to either insert or update an entity based on whether its primary key already exists in a collection. Specifically:

- If the primary key of the entity already exists in the collection, the existing entity will be overwritten.

- If the primary key does not exist in the collection, a new entity will be inserted.

<Admonition type="info" icon="📘" title="Notes">

The support for data upsert is available as a Beta feature. The feature and the documentation may change anytime during the Beta stage.

</Admonition>

## Before you start{#before-you-start}

Before upserting data, make sure the following conditions are met:

- You have upgraded your cluster to the Beta version.

- You have downloaded the example dataset. For details, see [Example Dataset](./example-dataset).

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Create Collection](./create-collection).

## Prepare data{#prepare-data}

In this example, we upsert the entities in the example dataset. You can use the following code to process data:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# (Continued)

import json

DATASET_PATH="../medium_articles_2020_dpr.json" # Set your dataset path

with open('medium_articles_2020_dpr.json') as f:
    data = json.load(f)
    data_to_upsert = data["rows"][:100]

print(rows[0])

# Prepare a list of rows
with open(DATASET_PATH) as f:
    data = json.load(f)
    rows = data['rows']

print(rows[:3])

# Output
#
# [
#     {
#         "id": 0,
#         "title": "The Reported Mortality Rate of Coronavirus Is Not Important",
#         "title_vector": [
#             0.041732933,
#             0.013779674,
#             -0.027564144,
#             -0.013061441,
#             0.009748648,
#             0.00082446384,
#             -0.00071647146,
#             0.048612226,
#             -0.04836573,
#             -0.04567751,
#             "(758 more items hidden)"
#         ],
#         "link": "https://medium.com/swlh/the-reported-mortality-rate-of-coronavirus-is-not-important-369989c8d912",
#         "reading_time": 13,
#         "publication": "The Startup",
#         "claps": 1100,
#         "responses": 18
#     }
# ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
const fs = require('fs');
const data_file = `./medium_articles_2020_dpr.json`

async function main () {

    // (Continued)
    
    const data = JSON.parse(fs.readFileSync(data_file, "utf8"))

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

}
```

</TabItem>

<TabItem value='java'>

```java
public final class UseCustomizedSchemaDemo  {
    public static void main(String[] args) {
        
        // (Continued)
        
        String data_file = "../medium_articles_2020_dpr.json";
        
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
        
        // Load dataset
        JSONObject dataset = JSON.parseObject(content);
        List<JSONObject> rows = getRows(dataset.getJSONArray("rows"), 5979);
        
        // Also, you can get fields from dataset and insert them
        // List<Field> fields = getFields(dataset.getJSONArray("rows"), 5979);
    }
    
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
}
```

</TabItem>

<TabItem value='bash'>

```bash
# read the first 100 records from the dataset
data="$(cat path/to/medium_articles_2020_dpr.json \
        | jq '.rows' \
        | jq '.[1:100]' \
        | jq -r '.[] | . + {"vector": .title_vector} | del(.title_vector) | del(.id)' \
        | jq -s -c '.')"

```

</TabItem>
</Tabs>

## Upsert data{#upsert-data}

Once the data is ready, use the following code to upsert it to the collection:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# upsert entities
# MilvusClient does not support upsert yet.
from pymilvus import Collection
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
async function main () {

    // (Continued)
    
    //insert vectors
    res = await client.upsert({
        collection_name: collectionName,
        data: rows.slice(1, 1000)
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
    //     ... 899 more items
    //   ],
    //   err_index: [],
    //   status: { error_code: 'Success', reason: '', code: 0 },
    //   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
    //   acknowledged: false,
    //   insert_cnt: '999',
    //   delete_cnt: '999',
    //   upsert_cnt: '999',
    //   timestamp: '445315186586025986'
    // }
    // 

}
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.*;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

public class UseCustomizedSchemaDemo 
{
    public static void main( String[] args )
    {
        // (Continued)
        
        UpsertParam upsertParam = UpsertParam.newBuilder()
            .withCollectionName(collectionName)
            .withRows(rows)
            // .withFields(fields)
            .build();

        R<MutationResult> upsertResponse = client.upsert(upsertParam);

        if (upsertResponse.getStatus() != R.Status.Success.getCode()) {
            System.err.println(upsertResponse.getMessage());
        }

        MutationResultWrapper mutationResultWrapper = new MutationResultWrapper(upsertResponse.getData());

        System.out.println("Successfully insert entities: " + mutationResultWrapper.getInsertCount());  

        // Output:
        // Successfully insert entities: 100
    }
}
```

</TabItem>

<TabItem value='bash'>

```bash
# insert record 
curl --request POST \
     --url "${PUBLIC_ENDPOINT}/v1/vector/upsert" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data "{
        \"collectionName\": \"medium_articles_2020\",
        \"data\": ${data}
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

- [Create Collection](./create-collection)

- [Enable Dynamic Schema](./enable-dynamic-schema)

- [Use Partition Key](./use-partition-key)

