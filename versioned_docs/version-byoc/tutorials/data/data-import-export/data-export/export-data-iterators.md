---
title: "Export Data Using Iterators | BYOC"
slug: /export-data-iterators
sidebar_label: "Using Iterators"
beta: FALSE
notebook: FALSE
description: "This guide provides an example of how to export data from a Zilliz Cloud collection. | BYOC"
type: origin
token: N6fZwCUXqiqoJEkFiVNcvDJEnnc
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - data export
  - iterator
  - ANNS
  - Vector search
  - knn algorithm
  - HNSW

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Export Data Using Iterators

This guide provides an example of how to export data from a Zilliz Cloud collection.

## Overview{#overview}

Both Milvus' Python and Java SDKs provide a set of iterator APIs for you to iterate over the entities within a collection in a memory-efficient manner. For details, refer to [Search Iterator](./with-iterators).

Using iterators offers the following benefits:

- **Simplicity**: Eliminates the complex **offset** and **limit** settings.

- **Efficiency**: Provides scalable data retrieval by fetching only the data in need.

- **Consistency**: Ensures a consistent dataset size with boolean filters.

You can make use of these APIs to export certain or all of the entities from a Zilliz Cloud collection.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available for the Zilliz Cloud clusters that are compatible with Milvus 2.3.x and above.</p>

</Admonition>

## Preparations{#preparations}

The following steps repurpose the code to connect to a Zilliz Cloud cluster, quickly set up a collection, and insert over 10,000 randomly generated entities into the collection.

### Step 1: Create a collection{#step-1-create-a-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. Create a collection
client.create_collection(
    collection_name="quick_setup",
    dimension=5,
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;
import io.milvus.param.highlevel.collection.CreateSimpleCollectionParam;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectParam connectParam = ConnectParam.newBuilder()
        .withUri(CLUSTER_ENDPOINT)
        .withToken(TOKEN)
        .build();

MilvusServiceClient client  = new MilvusServiceClient(connectParam);

// 2. Create a collection
CreateSimpleCollectionParam createCollectionParam = CreateSimpleCollectionParam.newBuilder()
        .withCollectionName("quick_setup")
        .withDimension(5)
        .build();

client.createCollection(createCollectionParam);
```

</TabItem>
</Tabs>

### Step 2: Insert randomly generated entities{#step-2-insert-randomly-generated-entities}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
# 3. Insert randomly generated vectors 
colors = ["green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"]
data = []

for i in range(10000):
    current_color = random.choice(colors)
    current_tag = random.randint(1000, 9999)
    data.append({
        "id": i,
        "vector": [ random.uniform(-1, 1) for _ in range(5) ],
        "color": current_color,
        "tag": current_tag,
        "color_tag": f"{current_color}_{str(current_tag)}"
    })

print(data[0])

# Output
#
# {
#     "id": 0,
#     "vector": [
#         -0.5705990742218152,
#         0.39844925120642083,
#         -0.8791287928610869,
#         0.024163154953680932,
#         0.6837669917169638
#     ],
#     "color": "purple",
#     "tag": 7774,
#     "color_tag": "purple_7774"
# }

res = client.insert(
    collection_name="quick_setup",
    data=data,
)

print(res)

# Output
#
# {
#     "insert_count": 10000,
#     "ids": [
#         0,
#         1,
#         2,
#         3,
#         4,
#         5,
#         6,
#         7,
#         8,
#         9,
#         "(9990 more items hidden)"
#     ]
# }
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Random;

import com.alibaba.fastjson.JSONObject;

import io.milvus.param.R;
import io.milvus.param.dml.InsertParam;
import io.milvus.response.MutationResultWrapper;
import io.milvus.grpc.MutationResult;

// 3. Insert randomly generated vectors into the collection
List<String> colors = Arrays.asList("green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey");
List<JSONObject> data = new ArrayList<>();

for (int i=0; i<10000; i++) {
    Random rand = new Random();
    String current_color = colors.get(rand.nextInt(colors.size()-1));
    JSONObject row = new JSONObject();
    row.put("id", Long.valueOf(i));
    row.put("vector", Arrays.asList(rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat()));
    row.put("color_tag", current_color + "_" + String.valueOf(rand.nextInt(8999) + 1000));
    data.add(row);
}

InsertParam insertParam = InsertParam.newBuilder()
    .withCollectionName("quick_setup")
    .withRows(data)
    .build();

R<MutationResult> insertRes = client.insert(insertParam);

if (insertRes.getStatus() != R.Status.Success.getCode()) {
    System.err.println(insertRes.getMessage());
}

MutationResultWrapper wrapper = new MutationResultWrapper(insertRes.getData());
System.out.println(wrapper.getInsertCount());
```

</TabItem>
</Tabs>

## Export data using iterators{#export-data-using-iterators}

To export data using iterators, do as follows:

1. Initialize the search iterator to define the search parameters and output fields. You can limit the number of entities to export per iteration by setting the `batch_size` parameter.

1. Use the `next()` method within a loop to paginate through the search results.

    - If the method returns an empty array, the loop terminates.

    - Otherwise, save the returns in any manner that you see fit. For example, you can append the returns to a file, save them into a database, or feed them to other consumer programs.

1. Call the `close()` method to close the iterator once all data has been retrieved.

The following code snippets demonstrate how to append the exported data into a file using the **QueryIterator** API.  

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import json
from pymilvus import connections, Collection

connections.connect(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

collection = Collection("quick_setup")

# 6. Query with iterator

# Initiate an empty JSON file
with open('results.json', 'w') as fp:
    fp.write(json.dumps([]))

iterator = collection.query_iterator(
    batch_size=10,
    expr="color_tag like \"brown_8%\"",
    output_fields=["color_tag"]
)

while True:
    result = iterator.next()
    if not result:
        iterator.close()
        break
    
    # Read existing records and append the returns    
    with open('results.json', 'r') as fp:
        results = json.loads(fp.read())
        results += result
    
    # Save the result set    
    with open('results.json', 'w') as fp:
        fp.write(json.dumps(results))
```

</TabItem>

<TabItem value='java'>

```java
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import io.milvus.param.dml.QueryIteratorParam;
import io.milvus.orm.iterator.QueryIterator;

// 5. Query with iterators

try {
    Files.write(Path.of("results.json"), JSON.toJSONString(new ArrayList<>()).getBytes(), StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
} catch (Exception e) {
    // TODO: handle exception
    e.printStackTrace();
}

QueryIteratorParam queryIteratorParam = QueryIteratorParam.newBuilder()
    .withCollectionName("quick_setup")
    .withExpr("color_tag like \"brown_8%\"")
    .withBatchSize(50L)
    .addOutField("vector")
    .addOutField("color_tag")
    .build();

R<QueryIterator> queryIteratRes = client.queryIterator(queryIteratorParam);

if (queryIteratRes.getStatus() != R.Status.Success.getCode()) {
    System.err.println(queryIteratRes.getMessage());
}

QueryIterator queryIterator = queryIteratRes.getData();

while (true) {
    List<QueryResultsWrapper.RowRecord> batchResults = queryIterator.next();
    if (batchResults.isEmpty()) {
        queryIterator.close();
        break;
    }

    String jsonString = "";
    List<JSONObject> jsonObject = new ArrayList<>();
    try {
        jsonString = Files.readString(Path.of("results.json"));
        jsonObject = JSON.parseArray(jsonString).toJavaList(null);
    } catch (IOException e) {
        e.printStackTrace();
    }

    for (QueryResultsWrapper.RowRecord queryResult : batchResults) {
        JSONObject row = new JSONObject();
        row.put("id", queryResult.get("id"));
        row.put("vector", queryResult.get("vector"));
        row.put("color_tag", queryResult.get("color_tag"));
        jsonObject.add(row);
    }

    try {
        Files.write(
            Path.of("results.json"),
            JSON.toJSONString(jsonObject).getBytes(), 
            StandardOpenOption.WRITE
        );
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

</TabItem>
</Tabs>

