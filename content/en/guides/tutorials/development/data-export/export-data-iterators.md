---
title: "Export Data Using Iterators | Cloud"
slug: /export-data-iterators
sidebar_label: "Using Iterators"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This guide provides an example of how to export data from a Zilliz Cloud collection. | Cloud"
type: origin
token: N6fZwCUXqiqoJEkFiVNcvDJEnnc
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Export Data Using Iterators

This guide provides an example of how to export data from a Zilliz Cloud collection.

## Overview\{#overview}

Both Milvus' Python and Java SDKs provide a set of iterator APIs for you to iterate over the entities within a collection in a memory-efficient manner. For details, refer to [Search Iterator](./with-iterators).

Using iterators offers the following benefits:

- **Simplicity**: Eliminates the complex **offset** and **limit** settings.

- **Efficiency**: Provides scalable data retrieval by fetching only the data in need.

- **Consistency**: Ensures a consistent dataset size with boolean filters.

You can make use of these APIs to export certain or all of the entities from a Zilliz Cloud collection.

<Admonition type="info" title="Notes">

This feature is available for the Zilliz Cloud clusters that are compatible with Milvus 2.3.x and above.

</Admonition>

## Preparations\{#preparations}

The following steps repurpose the code to connect to a Zilliz Cloud cluster, quickly set up a collection, and insert over 10,000 randomly generated entities into the collection.

### Step 1: Create a collection\{#step-1-create-a-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"}]}>
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
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Set up a Milvus client
MilvusClientV2 client = new MilvusClientV2(ConnectConfig.builder()
        .uri(CLUSTER_ENDPOINT)
        .token(TOKEN)
        .build());

// 2. Create a collection
client.createCollection(CreateCollectionReq.builder()
        .collectionName("quick_setup")
        .dimension(5)
        .build());
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "log"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

func main() {
    ctx := context.Background()

    const CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
    const TOKEN = "YOUR_CLUSTER_TOKEN"

    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: CLUSTER_ENDPOINT,
        APIKey:  TOKEN,
    })
    if err != nil {
        log.Fatal(err)
    }

    err = cli.CreateCollection(ctx, milvusclient.SimpleCreateCollectionOptions("quick_setup", 5))
    if err != nil {
        log.Fatal(err)
    }
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    client
        .create_collection(
            CreateSimpleCollectionRequest::builder()
                .collection_name("quick_setup")
                .dimension(5)
                .build()?,
        )
        .await?;

    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

int main() {
    auto client = milvus::MilvusClientV2::Create();
    auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        return 1;
    }

    status = client->CreateCollection(milvus::CreateSimpleCollectionRequest()
        .WithCollectionName("quick_setup")
        .WithDimension(5));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        return 1;
    }

    return 0;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
const TOKEN = "YOUR_CLUSTER_TOKEN";

const client = new MilvusClient({
  address: CLUSTER_ENDPOINT,
  token: TOKEN,
});

await client.createCollection({
  collection_name: "quick_setup",
  dimension: 5,
  vector_field_name: "vector",
});
```

</TabItem>
</Tabs>

### Step 2: Insert randomly generated entities\{#step-2-insert-randomly-generated-entities}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
import random
from pymilvus import MilvusClient

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
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

// 3. Insert randomly generated vectors into the collection
List<String> colors = Arrays.asList("green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey");
List<JsonObject> data = new ArrayList<>();
Random random = new Random();
Gson gson = new Gson();

for (int i = 0; i < 10000; i++) {
    String currentColor = colors.get(random.nextInt(colors.size()));
    int currentTag = random.nextInt(9000) + 1000;
    JsonObject row = new JsonObject();
    row.addProperty("id", (long) i);
    row.add("vector", gson.toJsonTree(Arrays.asList(
            (float) (random.nextDouble() * 2 - 1),
            (float) (random.nextDouble() * 2 - 1),
            (float) (random.nextDouble() * 2 - 1),
            (float) (random.nextDouble() * 2 - 1),
            (float) (random.nextDouble() * 2 - 1))));
    row.addProperty("color", currentColor);
    row.addProperty("tag", currentTag);
    row.addProperty("color_tag", currentColor + "_" + currentTag);
    data.add(row);
}

InsertResp resp = client.insert(InsertReq.builder()
        .collectionName("quick_setup")
        .data(data)
        .build());

System.out.println(resp.getInsertCnt());
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "fmt"
    "log"
    "math/rand"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

func main() {
    ctx := context.Background()

    const CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
    const TOKEN = "YOUR_CLUSTER_TOKEN"
    const COLLECTION_NAME = "quick_setup"

    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: CLUSTER_ENDPOINT,
        APIKey:  TOKEN,
    })
    if err != nil {
        log.Fatal(err)
    }

    colors := []string{"green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"}
    rows := make([]any, 0, 10000)
    for i := 0; i < 10000; i++ {
        currentColor := colors[rand.Intn(len(colors))]
        currentTag := rand.Intn(9000) + 1000
        rows = append(rows, map[string]any{
            "id":        int64(i),
            "vector":    []float32{rand.Float32()*2 - 1, rand.Float32()*2 - 1, rand.Float32()*2 - 1, rand.Float32()*2 - 1, rand.Float32()*2 - 1},
            "color":     currentColor,
            "tag":       currentTag,
            "color_tag": fmt.Sprintf("%s_%d", currentColor, currentTag),
        })
    }

    result, err := cli.Insert(ctx, milvusclient.NewRowBasedInsertOption(COLLECTION_NAME, rows...))
    if err != nil {
        log.Fatal(err)
    }
    fmt.Println(result.InsertCount)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;
use serde_json::json;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let colors = ["green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"];
    let mut rows = Vec::new();
    for i in 0..10000 {
        let current_color = colors[i % colors.len()];
        let current_tag = 1000 + (i % 9000);
        rows.push(json!({
            "id": i as i64,
            "vector": vec![0.1f32, 0.2, 0.3, 0.4, 0.5],
            "color": current_color,
            "tag": current_tag,
            "color_tag": format!("{}_{}", current_color, current_tag),
        }));
    }

    let resp = client
        .insert(
            InsertRequest::builder()
                .collection_name("quick_setup")
                .rows(rows)
                .build()?,
        )
        .await?;
    println!("insert count: {}", resp.insert_count());
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include <random>
#include <string>
#include <vector>
#include "milvus/MilvusClientV2.h"

int main() {
    auto client = milvus::MilvusClientV2::Create();
    auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        return 1;
    }

    std::vector<std::string> colors = {"green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"};
    std::mt19937 rng(42);
    std::uniform_int_distribution<int> color_dist(0, (int)colors.size() - 1);
    std::uniform_int_distribution<int> tag_dist(1000, 9999);
    std::uniform_real_distribution<float> vec_dist(-1.0f, 1.0f);

    milvus::EntityRows rows;
    for (int i = 0; i < 10000; i++) {
        std::string current_color = colors[color_dist(rng)];
        int current_tag = tag_dist(rng);
        rows.push_back({
            {"id", i},
            {"vector", std::vector<float>{vec_dist(rng), vec_dist(rng), vec_dist(rng), vec_dist(rng), vec_dist(rng)}},
            {"color", current_color},
            {"tag", current_tag},
            {"color_tag", current_color + "_" + std::to_string(current_tag)}
        });
    }

    milvus::InsertResponse response;
    status = client->Insert(milvus::InsertRequest().WithCollectionName("quick_setup").WithRowsData(std::move(rows)), response);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        return 1;
    }
    std::cout << "insert count: " << response.Results().InsertCount() << std::endl;
    return 0;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
const TOKEN = "YOUR_CLUSTER_TOKEN";
const COLLECTION_NAME = "quick_setup";

const client = new MilvusClient({
  address: CLUSTER_ENDPOINT,
  token: TOKEN,
});

const colors = ["green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"];
const data = [];
for (let i = 0; i < 10000; i++) {
  const currentColor = colors[Math.floor(Math.random() * colors.length)];
  const currentTag = Math.floor(Math.random() * 9000) + 1000;
  data.push({
    id: i,
    vector: Array.from({ length: 5 }, () => Math.random() * 2 - 1),
    color: currentColor,
    tag: currentTag,
    color_tag: `${currentColor}_${currentTag}`,
  });
}

await client.insert({
  collection_name: COLLECTION_NAME,
  fields_data: data,
});
```

</TabItem>
</Tabs>

## Export data using iterators\{#export-data-using-iterators}

To export data using iterators, do as follows:

1. Initialize the search iterator to define the search parameters and output fields. You can limit the number of entities to export per iteration by setting the `batch_size` parameter.

1. Use the `next()` method within a loop to paginate through the search results.

    - If the method returns an empty array, the loop terminates.

    - Otherwise, save the returns in any manner that you see fit. For example, you can append the returns to a file, save them into a database, or feed them to other consumer programs.

1. Call the `close()` method to close the iterator once all data has been retrieved.

The following code snippets demonstrate how to append the exported data into a file using the **QueryIterator** API.  

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"Go","value":"go"},{"label":"Rust","value":"rust"},{"label":"C++","value":"c++"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
import json
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

client = MilvusClient(uri=CLUSTER_ENDPOINT, token=TOKEN)

# 6. Query with iterator

# Initiate an empty JSON file
with open('results.json', 'w') as fp:
    fp.write(json.dumps([]))

iterator = client.query_iterator(
    collection_name="quick_setup",
    batch_size=10,
    filter='color_tag like "brown_8%"',
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
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import com.google.gson.Gson;
import com.google.gson.JsonObject;
import com.google.gson.reflect.TypeToken;
import io.milvus.orm.iterator.QueryIterator;
import io.milvus.response.QueryResultsWrapper;
import io.milvus.v2.service.vector.request.QueryIteratorReq;

// 6. Query with iterators

try {
    Files.write(Paths.get("results.json"), new Gson().toJson(new ArrayList<>()).getBytes(),
            StandardOpenOption.CREATE, StandardOpenOption.TRUNCATE_EXISTING);
} catch (Exception e) {
    e.printStackTrace();
}

QueryIteratorReq queryIteratorReq = QueryIteratorReq.builder()
        .collectionName("quick_setup")
        .expr("color_tag like \"brown_8%\"")
        .batchSize(50)
        .outputFields(Arrays.asList("vector", "color_tag"))
        .build();

QueryIterator queryIterator = client.queryIterator(queryIteratorReq);

while (true) {
    List<QueryResultsWrapper.RowRecord> batchResults = queryIterator.next();
    if (batchResults.isEmpty()) {
        queryIterator.close();
        break;
    }

    List<JsonObject> jsonObject = new ArrayList<>();
    try {
        jsonObject = new Gson().fromJson(new String(Files.readAllBytes(Paths.get("results.json"))), new TypeToken<List<JsonObject>>() {}.getType());
    } catch (IOException e) {
        e.printStackTrace();
    }

    for (QueryResultsWrapper.RowRecord queryResult : batchResults) {
        JsonObject row = new JsonObject();
        row.add("id", new Gson().toJsonTree(queryResult.get("id")));
        row.add("vector", new Gson().toJsonTree(queryResult.get("vector")));
        row.add("color_tag", new Gson().toJsonTree(queryResult.get("color_tag")));
        jsonObject.add(row);
    }

    try {
        Files.write(Paths.get("results.json"), new Gson().toJson(jsonObject).getBytes(),
                StandardOpenOption.WRITE, StandardOpenOption.TRUNCATE_EXISTING);
    } catch (IOException e) {
        e.printStackTrace();
    }
}
```

</TabItem>

<TabItem value='go'>

```go
package main

import (
    "context"
    "encoding/json"
    "errors"
    "io"
    "log"
    "os"

    "github.com/milvus-io/milvus/client/v3/milvusclient"
)

func main() {
    ctx := context.Background()

    const CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
    const TOKEN = "YOUR_CLUSTER_TOKEN"
    const COLLECTION_NAME = "quick_setup"

    cli, err := milvusclient.New(ctx, &milvusclient.ClientConfig{
        Address: CLUSTER_ENDPOINT,
        APIKey:  TOKEN,
    })
    if err != nil {
        log.Fatal(err)
    }

    it, err := cli.QueryIterator(ctx, milvusclient.NewQueryIteratorOption(COLLECTION_NAME).
        WithBatchSize(50).
        WithFilter("color_tag like \"brown_8%\"").
        WithOutputFields("color_tag", "vector"))
    if err != nil {
        log.Fatal(err)
    }

    var results []map[string]any
    for {
        rs, err := it.Next(ctx)
        if errors.Is(err, io.EOF) {
            break
        }
        if err != nil {
            log.Fatal(err)
        }
        idCol := rs.GetColumn("id")
        colorTagCol := rs.GetColumn("color_tag")
        for i := 0; i < rs.Len(); i++ {
            id, _ := idCol.Get(i)
            colorTag, _ := colorTagCol.Get(i)
            results = append(results, map[string]any{
                "id":        id,
                "color_tag": colorTag,
            })
        }
    }

    data, _ := json.Marshal(results)
    os.WriteFile("results.json", data, 0644)
}
```

</TabItem>

<TabItem value='rust'>

```rust
use milvus::v2::prelude::*;

#[tokio::main]
async fn main() -> Result<()> {
    let config = ConnectConfig::new().uri("YOUR_CLUSTER_ENDPOINT").token("YOUR_CLUSTER_TOKEN");
    let client = ClientV2::new(&config).await?;

    let mut iterator = client
        .query_iterator(
            QueryIteratorRequest::builder()
                .query(
                    QueryRequest::builder()
                        .collection_name("quick_setup")
                        .filter("color_tag like \"brown_8%\"")
                        .output_fields(["color_tag", "vector"])
                        .build()?,
                )
                .batch_size(50)
                .build()?,
        )
        .await?;

    let mut count = 0usize;
    while let Some(batch) = iterator.next().await? {
        for _row in batch.results().rows()? {
            count += 1;
        }
    }
    println!("exported {} rows", count);
    Ok(())
}
```

</TabItem>

<TabItem value='c++'>

```c++
#include <iostream>
#include "milvus/MilvusClientV2.h"

int main() {
    auto client = milvus::MilvusClientV2::Create();
    auto status = client->Connect(milvus::ConnectParam("YOUR_CLUSTER_ENDPOINT").WithToken("YOUR_CLUSTER_TOKEN"));
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        return 1;
    }

    milvus::QueryIteratorRequest request;
    request.WithCollectionName("quick_setup")
           .WithFilter("color_tag like \"brown_8%\"")
           .WithOutputFields({"color_tag", "vector"});
    request.SetBatchSize(50);

    milvus::QueryIteratorPtr iterator;
    status = client->QueryIterator(request, iterator);
    if (!status.IsOk()) {
        std::cout << status.Message() << std::endl;
        return 1;
    }

    int count = 0;
    milvus::EntityRows rows;
    while (true) {
        milvus::QueryResults results;
        status = iterator->Next(results);
        if (!status.IsOk() || results.GetRowCount() == 0) {
            break;
        }
        rows.clear();
        results.OutputRows(rows);
        count += (int)rows.size();
    }
    std::cout << "exported " << count << " rows" << std::endl;
    return 0;
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
import { MilvusClient } from "@zilliz/milvus2-sdk-node";

const CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
const TOKEN = "YOUR_CLUSTER_TOKEN";
const COLLECTION_NAME = "quick_setup";

const client = new MilvusClient({
  address: CLUSTER_ENDPOINT,
  token: TOKEN,
});

const iterator = await client.queryIterator({
  collection_name: COLLECTION_NAME,
  expr: 'color_tag like "brown_8%"',
  output_fields: ["color_tag", "vector"],
  batchSize: 50,
});

let count = 0;
for await (const batch of iterator) {
  if (!batch) continue;
  count += batch.length;
}
console.log("exported " + count + " rows");
```

</TabItem>
</Tabs>

