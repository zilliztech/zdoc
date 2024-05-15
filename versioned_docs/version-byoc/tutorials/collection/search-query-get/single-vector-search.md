---
slug: /single-vector-search
beta: FALSE
notebook: FALSE
type: origin
token: Ri1IwbgN6ilzMrkoIjycmpkZn9d
sidebar_position: 1

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Single-Vector Search

After your data is inserted, the next step is to send a `search` request to search for vectors that are similar to your query vector. A single-vector search compares your query vector against the existing vectors in your collection to find the most similar entities, returning their IDs and the distances between them. This process can optionally return the vector values and metadata of the results.

## Overview{#overview}

There are a variety of search types to meet different requirements:

- [Basic search](./single-vector-search#basic-search): Includes single-vector search, bulk-vector search, partition search, and search with specified output fields.

- [Filtered search](./single-vector-search#filtered-search): Applies filtering criteria based on scalar fields to refine search results.

- [Range search](./single-vector-search#range-search): Finds vectors within a specific distance range from the query vector.

## Preparations{#preparations}

The code snippets below repurpose the existing code to establish connections to a Zilliz Cloud cluster, quickly set up a collection and two partitions, and insert data into them.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)

# 2. Create a collection
client.create_collection(
    collection_name="quick_setup",
    dimension=5,
    metric_type="IP"
)

# 3. Insert randomly generated vectors 
colors = ["green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"]
data = []

for i in range(1000):
    current_color = random.choice(colors)
    data.append({
        "id": i,
        "vector": [ random.uniform(-1, 1) for _ in range(5) ],
        "color": current_color,
        "color_tag": f"\{current_color}_{str(random.randint(1000, 9999))}"
    })

res = client.insert(
    collection_name="quick_setup",
    data=data
)

print(res)

# Output
#
# {
#     "insert_count": 1000,
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
#         "(990 more items hidden)"
#     ]
# }

# 6.1 Create partitions 
client.create_partition(
    collection_name="quick_setup",
    partition_name="red"
)

client.create_partition(
    collection_name="quick_setup",
    partition_name="blue"
)

# 6.1 Insert data into partitions
red_data = [ {"id": i, "vector": [ random.uniform(-1, 1) for _ in range(5) ], "color": "red", "color_tag": f"red_{str(random.randint(1000, 9999))}" } for i in range(500) ]
blue_data = [ {"id": i, "vector": [ random.uniform(-1, 1) for _ in range(5) ], "color": "blue", "color_tag": f"blue_{str(random.randint(1000, 9999))}" } for i in range(500) ]

res = client.insert(
    collection_name="quick_setup",
    data=red_data,
    partition_name="red"
)

print(res)

# Output
#
# {
#     "insert_count": 500,
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
#         "(490 more items hidden)"
#     ]
# }

res = client.insert(
    collection_name="quick_setup",
    data=blue_data,
    partition_name="blue"
)

print(res)

# Output
#
# {
#     "insert_count": 500,
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
#         "(490 more items hidden)"
#     ]
# }
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Random;

import com.alibaba.fastjson.JSONObject;

import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.CreateCollectionReq;
import io.milvus.v2.service.collection.request.GetLoadStateReq;
import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp; 

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);  

// 2. Create a collection in quick setup mode
CreateCollectionReq quickSetupReq = CreateCollectionReq.builder()
    .collectionName("quick_setup")
    .dimension(5)
    .metricType("IP")
    .build();

client.createCollection(quickSetupReq);

GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .build();

boolean state = client.getLoadState(loadStateReq);

System.out.println(state);

// Output:
// true

// 3. Insert randomly generated vectors into the collection
List<String> colors = Arrays.asList("green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey");
List<JSONObject> data = new ArrayList<>();

for (int i=0; i<1000; i++) {
    Random rand = new Random();
    String current_color = colors.get(rand.nextInt(colors.size()-1));
    JSONObject row = new JSONObject();
    row.put("id", Long.valueOf(i));
    row.put("vector", Arrays.asList(rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat()));
    row.put("color_tag", current_color + "_" + String.valueOf(rand.nextInt(8999) + 1000));
    data.add(row);
}

InsertReq insertReq = InsertReq.builder()
    .collectionName("quick_setup")
    .data(data)
    .build();

InsertResp insertResp = client.insert(insertReq);

System.out.println(JSONObject.toJSON(insertResp));

// Output:
// {"insertCnt": 1000}

// 6.1. Create a partition
CreatePartitionReq partitionReq = CreatePartitionReq.builder()
    .collectionName("quick_setup")
    .partitionName("red")
    .build();

client.createPartition(partitionReq);

partitionReq = CreatePartitionReq.builder()
    .collectionName("quick_setup")
    .partitionName("blue")
    .build();

client.createPartition(partitionReq);

// 6.2 Insert data into the partition
data = new ArrayList<>();

for (int i=1000; i<1500; i++) {
    Random rand = new Random();
    String current_color = "red";
    JSONObject row = new JSONObject();
    row.put("id", Long.valueOf(i));
    row.put("vector", Arrays.asList(rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat()));
    row.put("color", current_color);
    row.put("color_tag", current_color + "_" + String.valueOf(rand.nextInt(8999) + 1000));
    data.add(row);
}     

insertReq = InsertReq.builder()
    .collectionName("quick_setup")
    .data(data)
    .partitionName("red")
    .build();

insertResp = client.insert(insertReq);

System.out.println(JSONObject.toJSON(insertResp));

// Output:
// {"insertCnt": 500}

data = new ArrayList<>();

for (int i=1500; i<2000; i++) {
    Random rand = new Random();
    String current_color = "blue";
    JSONObject row = new JSONObject();
    row.put("id", Long.valueOf(i));
    row.put("vector", Arrays.asList(rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat()));
    row.put("color", current_color);
    row.put("color_tag", current_color + "_" + String.valueOf(rand.nextInt(8999) + 1000));
    data.add(row);
}

insertReq = InsertReq.builder()
    .collectionName("quick_setup")
    .data(data)
    .partitionName("blue")
    .build();

insertResp = client.insert(insertReq);

System.out.println(JSONObject.toJSON(insertResp));

// Output:
// {"insertCnt": 500}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

// 1. Set up a Milvus Client
client = new MilvusClient({address, token});

// 2. Create a collection in quick setup mode
await client.createCollection({
    collection_name: "quick_setup",
    dimension: 5,
    metric_type: "IP"
});  

// 3. Insert randomly generated vectors
const colors = ["green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"]
data = []

for (let i = 0; i < 1000; i++) {
    current_color = colors[Math.floor(Math.random() * colors.length)]
    data.push({
        id: i,
        vector: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
        color: current_color,
        color_tag: `${current_color}_${Math.floor(Math.random() * 8999) + 1000}`
    })
}

var res = await client.insert({
    collection_name: "quick_setup",
    data: data
})

console.log(res.insert_cnt)

// Output
// 
// 1000
// 

await client.createPartition({
    collection_name: "quick_setup",
    partition_name: "red"
})

await client.createPartition({
    collection_name: "quick_setup",
    partition_name: "blue"
})

// 6.1 Insert data into partitions
var red_data = []
var blue_data = []

for (let i = 1000; i < 1500; i++) {
    red_data.push({
        id: i,
        vector: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
        color: "red",
        color_tag: `red_${Math.floor(Math.random() * 8999) + 1000}`
    })
}

for (let i = 1500; i < 2000; i++) {
    blue_data.push({
        id: i,
        vector: [Math.random(), Math.random(), Math.random(), Math.random(), Math.random()],
        color: "blue",
        color_tag: `blue_${Math.floor(Math.random() * 8999) + 1000}`
    })
}

res = await client.insert({
    collection_name: "quick_setup",
    data: red_data,
    partition_name: "red"
})

console.log(res.insert_cnt)

// Output
// 
// 500
// 

res = await client.insert({
    collection_name: "quick_setup",
    data: blue_data,
    partition_name: "blue"
})

console.log(res.insert_cnt)

// Output
// 
// 500
// 
```

</TabItem>
</Tabs>

## Basic search{#basic-search}

When sending a `search` request, you can provide one or more vector values representing your query embeddings and a `limit` value indicating the number of results to return.

Depending on your data and your query vector, you may get fewer than `limit` results. This happens when `limit` is larger than the number of possible matching vectors for your query.

### Single-vector search{#single-vector-search}

Single-vector search is the simplest form of `search` operations in Zilliz Cloud, designed to find the most similar vectors to a given query vector.

To perform a single-vector search, specify the target collection name, the query vector, and the desired number of results (`limit`). This operation returns a result set comprising the most similar vectors, their IDs, and distances from the query vector.

Here is an example of searching for the top 3 entities that are most similar to the query vector:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 4. Single vector search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=3, # The number of results to return
    search_params={"metric_type": "IP", "params": {"level": 1}}
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
// 4. Single vector search
List<List<Float>> query_vectors = Arrays.asList(Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f));

SearchReq searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(query_vectors)
    .topK(3) // The number of results to return
    .build();

SearchResp searchResp = client.search(searchReq);

System.out.println(JSONObject.toJSON(searchResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Single vector search
var query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],

res = await client.search({
    collection_name: "quick_setup",
    data: [query_vector],
    limit: 3, // The number of results to return
})

console.log(res.results)
```

</TabItem>
</Tabs>

The output is similar to the following:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
[
    [
        {
            "id": 206,
            "distance": 2.50616455078125,
            "entity": {}
        },
        {
            "id": 138,
            "distance": 2.500145435333252,
            "entity": {}
        },
        {
            "id": 224,
            "distance": 2.484044313430786,
            "entity": {}
        }
    ]
]
```

</TabItem>

<TabItem value='java'>

```java
{"searchResults": [[
    {
        "score": 1.263043,
        "fields": {
            "vector": [
                0.9533119,
                0.02538395,
                0.76714665,
                0.35481733,
                0.9845762
            ],
            "id": 740
        }
    },
    {
        "score": 1.2377806,
        "fields": {
            "vector": [
                0.7411156,
                0.08687937,
                0.8254139,
                0.08370924,
                0.99095553
            ],
            "id": 640
        }
    },
    {
        "score": 1.1869997,
        "fields": {
            "vector": [
                0.87928146,
                0.05324632,
                0.6312755,
                0.28005534,
                0.9542448
            ],
            "id": 455
        }
    }
]]}
```

</TabItem>

<TabItem value='javascript'>

```javascript
[
  { score: 1.7463608980178833, id: '854' },
  { score: 1.744946002960205, id: '425' },
  { score: 1.7258622646331787, id: '718' }
]
```

</TabItem>
</Tabs>

The output showcases the top 3 neighbors nearest to your query vector, including their unique IDs and the calculated distances.

### Bulk-vector search{#bulk-vector-search}

A bulk-vector search extends the [single-vector search](./single-vector-search#single-vector-search) concept by allowing multiple query vectors to be searched in a single request. This type of search is ideal for scenarios where you need to find similar vectors for a set of query vectors, significantly reducing the time and computational resources required.

In a bulk-vector search, you can include several query vectors in the `data` field. The system processes these vectors in parallel, returning a separate result set for each query vector, each set containing the closest matches found within the collection.

Here is an example of searching for two distinct sets of the most similar entities from two query vectors:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 5. Batch-vector search
query_vectors = [
    [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
    [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
] # A list of two vectors

res = client.search(
    collection_name="quick_setup",
    data=query_vectors, 
    limit=2,
    search_params={"metric_type": "IP", "params": {"level": 1}}
)

print(res) # Two sets of results are to return
```

</TabItem>

<TabItem value='java'>

```java
// 5. Batch vector search
query_vectors = Arrays.asList(
    Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f),
    Arrays.asList(0.19886812562848388f, 0.06023560599112088f, 0.6976963061752597f, 0.2614474506242501f, 0.838729485096104f)
);

searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(query_vectors)
    .topK(2)
    .build();

searchResp = client.search(searchReq);

System.out.println(JSONObject.toJSON(searchResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. Batch vector search
var query_vectors = [
    [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592],
    [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
]

res = await client.search({
    collection_name: "quick_setup",
    data: query_vectors,
    limit: 2,
})

console.log(res.results)
```

</TabItem>
</Tabs>

The output is similar to the following:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# Two sets of vectors are returned as expected

[
    [
        {
            "id": 81,
            "distance": 1.633650779724121,
            "entity": {}
        },
        {
            "id": 428,
            "distance": 1.6174099445343018,
            "entity": {}
        }
    ],
    [
        {
            "id": 972,
            "distance": 1.7308459281921387,
            "entity": {}
        },
        {
            "id": 545,
            "distance": 1.670518398284912,
            "entity": {}
        }
    ]
]
```

</TabItem>

<TabItem value='java'>

```java
// Two sets of vectors are returned as expected

{"searchResults": [
    [
        {
            "score": 1.263043,
            "fields": {
                "vector": [
                    0.9533119,
                    0.02538395,
                    0.76714665,
                    0.35481733,
                    0.9845762
                ],
                "id": 740
            }
        },
        {
            "score": 1.2377806,
            "fields": {
                "vector": [
                    0.7411156,
                    0.08687937,
                    0.8254139,
                    0.08370924,
                    0.99095553
                ],
                "id": 640
            }
        }
    ],
    [
        {
            "score": 1.8654699,
            "fields": {
                "vector": [
                    0.4671427,
                    0.8378432,
                    0.98844475,
                    0.82763994,
                    0.9729997
                ],
                "id": 638
            }
        },
        {
            "score": 1.8581753,
            "fields": {
                "vector": [
                    0.735541,
                    0.60140246,
                    0.86730254,
                    0.93152493,
                    0.98603314
                ],
                "id": 855
            }
        }
    ]
]}
```

</TabItem>

<TabItem value='javascript'>

```javascript
[
  [
    { score: 2.3590476512908936, id: '854' },
    { score: 2.2896690368652344, id: '59' }
  [
    { score: 2.664059638977051, id: '59' },
    { score: 2.59483003616333, id: '854' }
  ]
]

```

</TabItem>
</Tabs>

The results include two sets of nearest neighbors, one for each query vector, showcasing the efficiency of bulk-vector searches in handling multiple query vectors at once.

### Partition search{#partition-search}

Partition search narrows the scope of your search to a specific subset or partition of your collection. This is particularly useful for organized datasets where data is segmented into logical or categorical divisions, allowing for faster search operations by reducing the volume of data to scan.

To conduct a partition search, simply include the name of the target partition in `partition_names` of your search request. This specifies that the `search` operation only considers vectors within the specified partition.

Here is an example of searching for entities in the partition named `red`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 6.2 Search within a partition
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=5,
    search_params={"metric_type": "IP", "params": {"level": 1}},
    partition_names=["red"]
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
// 6.3 Search within partitions
query_vectors = Arrays.asList(Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f));

searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(query_vectors)
    .partitionNames(Arrays.asList("red"))
    .topK(5)
    .build();

searchResp = client.search(searchReq);

System.out.println(JSONObject.toJSON(searchResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 6.2 Search within partitions
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = await client.search({
    collection_name: "quick_setup",
    data: [query_vector],
    partition_names: ["red"],
    limit: 5,
})

console.log(res.results)
```

</TabItem>
</Tabs>

The output is similar to the following:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
[
    [
        {
            "id": 320,
            "distance": 1.243729591369629,
            "entity": {}
        },
        {
            "id": 200,
            "distance": 1.2299367189407349,
            "entity": {}
        },
        {
            "id": 154,
            "distance": 1.1562182903289795,
            "entity": {}
        },
        {
            "id": 29,
            "distance": 1.1135238409042358,
            "entity": {}
        },
        {
            "id": 109,
            "distance": 1.0907914638519287,
            "entity": {}
        }
    ]
]
```

</TabItem>

<TabItem value='java'>

```java
{"searchResults": [
    [
        {
            "score": 1.1677284,
            "fields": {
                "vector": [
                    0.9986977,
                    0.17964739,
                    0.49086612,
                    0.23155272,
                    0.98438674
                ],
                "id": 1435
            }
        },
        {
            "score": 1.1476475,
            "fields": {
                "vector": [
                    0.6952647,
                    0.13417172,
                    0.91045254,
                    0.119336545,
                    0.9338931
                ],
                "id": 1291
            }
        },
        {
            "score": 1.0969629,
            "fields": {
                "vector": [
                    0.3363194,
                    0.028906643,
                    0.6675426,
                    0.030419827,
                    0.9735209
                ],
                "id": 1168
            }
        },
        {
            "score": 1.0741848,
            "fields": {
                "vector": [
                    0.9980543,
                    0.36063594,
                    0.66427994,
                    0.17359233,
                    0.94954175
                ],
                "id": 1164
            }
        },
        {
            "score": 1.0584627,
            "fields": {
                "vector": [
                    0.7187005,
                    0.12674773,
                    0.987718,
                    0.3110777,
                    0.86093885
                ],
                "id": 1085
            }
        }
    ],
    [
        {
            "score": 1.8030131,
            "fields": {
                "vector": [
                    0.59726167,
                    0.7054632,
                    0.9573117,
                    0.94529945,
                    0.8664103
                ],
                "id": 1203
            }
        },
        {
            "score": 1.7728865,
            "fields": {
                "vector": [
                    0.6672442,
                    0.60448086,
                    0.9325822,
                    0.80272985,
                    0.8861626
                ],
                "id": 1448
            }
        },
        {
            "score": 1.7536311,
            "fields": {
                "vector": [
                    0.59663296,
                    0.77831805,
                    0.8578314,
                    0.88818026,
                    0.9030075
                ],
                "id": 1010
            }
        },
        {
            "score": 1.7520742,
            "fields": {
                "vector": [
                    0.854198,
                    0.72294194,
                    0.9245805,
                    0.86126596,
                    0.7969224
                ],
                "id": 1219
            }
        },
        {
            "score": 1.7452049,
            "fields": {
                "vector": [
                    0.96419,
                    0.943535,
                    0.87611496,
                    0.8268136,
                    0.79786557
                ],
                "id": 1149
            }
        }
    ]
]}
```

</TabItem>

<TabItem value='javascript'>

```javascript
[
  { score: 3.0258803367614746, id: '1201' },
  { score: 3.004319190979004, id: '1458' },
  { score: 2.880324363708496, id: '1187' },
  { score: 2.8246407508850098, id: '1347' },
  { score: 2.797295093536377, id: '1406' }
]
```

</TabItem>
</Tabs>

Then, search for entities in the partition named `blue`:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=5,
    search_params={"metric_type": "IP", "params": {"level": 1}},
    partition_names=["blue"]
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(query_vectors)
    .partitionNames(Arrays.asList("blue"))
    .topK(5)
    .build();

searchResp = client.search(searchReq);

System.out.println(JSONObject.toJSON(searchResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
res = await client.search({
    collection_name: "quick_setup",
    data: [query_vector],
    partition_names: ["blue"],
    limit: 5,
})

console.log(res.results)
```

</TabItem>
</Tabs>

The output is similar to the following:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
[
    [
        {
            "id": 59,
            "distance": 1.3296087980270386,
            "entity": {}
        },
        {
            "id": 139,
            "distance": 1.1872179508209229,
            "entity": {}
        },
        {
            "id": 201,
            "distance": 1.1474100351333618,
            "entity": {}
        },
        {
            "id": 298,
            "distance": 1.117565631866455,
            "entity": {}
        },
        {
            "id": 435,
            "distance": 1.0910152196884155,
            "entity": {}
        }
    ]
]
```

</TabItem>

<TabItem value='java'>

```java
{"searchResults": [
    [
        {
            "score": 1.1628494,
            "fields": {
                "vector": [
                    0.7442872,
                    0.046407282,
                    0.71031404,
                    0.3544345,
                    0.9819991
                ],
                "id": 1992
            }
        },
        {
            "score": 1.1470042,
            "fields": {
                "vector": [
                    0.5505825,
                    0.04367262,
                    0.9985836,
                    0.18922359,
                    0.93255126
                ],
                "id": 1977
            }
        },
        {
            "score": 1.1450152,
            "fields": {
                "vector": [
                    0.89994013,
                    0.052991092,
                    0.8645576,
                    0.6406729,
                    0.95679337
                ],
                "id": 1573
            }
        },
        {
            "score": 1.1439825,
            "fields": {
                "vector": [
                    0.9253267,
                    0.15890503,
                    0.7999555,
                    0.19126713,
                    0.898583
                ],
                "id": 1552
            }
        },
        {
            "score": 1.1029172,
            "fields": {
                "vector": [
                    0.95661926,
                    0.18777144,
                    0.38115507,
                    0.14323527,
                    0.93137646
                ],
                "id": 1823
            }
        }
    ],
    [
        {
            "score": 1.8005109,
            "fields": {
                "vector": [
                    0.5953582,
                    0.7794224,
                    0.9388869,
                    0.79825854,
                    0.9197286
                ],
                "id": 1888
            }
        },
        {
            "score": 1.7714822,
            "fields": {
                "vector": [
                    0.56805456,
                    0.89422905,
                    0.88187534,
                    0.914824,
                    0.8944365
                ],
                "id": 1648
            }
        },
        {
            "score": 1.7561421,
            "fields": {
                "vector": [
                    0.83421993,
                    0.39865613,
                    0.92319834,
                    0.42695504,
                    0.96633124
                ],
                "id": 1688
            }
        },
        {
            "score": 1.7553532,
            "fields": {
                "vector": [
                    0.89994013,
                    0.052991092,
                    0.8645576,
                    0.6406729,
                    0.95679337
                ],
                "id": 1573
            }
        },
        {
            "score": 1.7543385,
            "fields": {
                "vector": [
                    0.16542226,
                    0.38248396,
                    0.9888778,
                    0.80913955,
                    0.9501492
                ],
                "id": 1544
            }
        }
    ]
]}
```

</TabItem>

<TabItem value='javascript'>

```javascript
[
  { score: 2.8421106338500977, id: '1745' },
  { score: 2.838560104370117, id: '1782' },
  { score: 2.8134000301361084, id: '1511' },
  { score: 2.718268871307373, id: '1679' },
  { score: 2.7014894485473633, id: '1597' }
]
```

</TabItem>
</Tabs>

The data in `partition_1` differs from that in `partition_2`. Therefore, the search results will be constrained to the specified partition, reflecting the unique characteristics and data distribution of that subset.

### Search with output fields{#search-with-output-fields}

Search with output fields allows you to specify which attributes or fields of the matched vectors should be included in the search results.

You can specify `output_fields` in a request to return results with specific fields.

Here is an example of returning results with `color` attribute values:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 7. Search with output fields
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=5,
    search_params={"metric_type": "IP", "params": {"level": 1}},
    output_fields=["color"]
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
// 7. Search with output fields
query_vectors = Arrays.asList(Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f));

searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(query_vectors)
    .outputFields(Arrays.asList("color"))
    .topK(5)
    .build();

searchResp = client.search(searchReq);

System.out.println(JSONObject.toJSON(searchResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 7. Search with output fields
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = await client.search({
    collection_name: "quick_setup",
    data: [query_vector],
    limit: 5,
    output_fields: ["color"],
})

console.log(res.results)
```

</TabItem>
</Tabs>

The output is similar to the following:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
[
    [
        {
            "id": 29,
            "distance": 2.6317718029022217,
            "entity": {
                "color": "red"
            }
        },
        {
            "id": 405,
            "distance": 2.6302318572998047,
            "entity": {
                "color": "blue"
            }
        },
        {
            "id": 458,
            "distance": 2.3892529010772705,
            "entity": {
                "color": "green"
            }
        },
        {
            "id": 555,
            "distance": 2.350921154022217,
            "entity": {
                "color": "orange"
            }
        },
        {
            "id": 435,
            "distance": 2.29063081741333,
            "entity": {
                "color": "blue"
            }
        }
    ]
]
```

</TabItem>

<TabItem value='java'>

```java
{"searchResults": [
    [
        {
            "score": 1.263043,
            "fields": {}
        },
        {
            "score": 1.2377806,
            "fields": {}
        },
        {
            "score": 1.1869997,
            "fields": {}
        },
        {
            "score": 1.1748955,
            "fields": {}
        },
        {
            "score": 1.1720343,
            "fields": {}
        }
    ]
]}
```

</TabItem>

<TabItem value='javascript'>

```javascript

[
  { score: 3.036271572113037, id: '59', color: 'orange' },
  { score: 3.0267879962921143, id: '1745', color: 'blue' },
  { score: 3.0069446563720703, id: '854', color: 'black' },
  { score: 2.984386682510376, id: '718', color: 'black' },
  { score: 2.916019916534424, id: '425', color: 'purple' }
]

```

</TabItem>
</Tabs>

Alongside the nearest neighbors, the search results will include the specified field `color`, providing a richer set of information for each matching vector.

## Filtered search{#filtered-search}

Filtered search applies scalar filters to vector searches, allowing you to refine the search results based on specific criteria. You can find more about filter expressions in [Boolean Expression Rules](https://milvus.io/docs/boolean.md) and examples in [Get & Scalar Query](./get-and-scalar-query).

Filter results whose **color** is prefixed with **red**:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 8. Filtered search
# 8.1 Filter with "like" operator and prefix wildcard
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup",
    data=[query_vector],
    limit=5,
    search_params={"metric_type": "IP", "params": {"level": 1}},
    filter='color_tag like "red%"',
    output_fields=["color_tag"]
)

print(res)
```

</TabItem>

<TabItem value='java'>

```java
// 8. Filtered search
query_vectors = Arrays.asList(Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f));

searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(query_vectors)
    .outputFields(Arrays.asList("color_tag"))
    .filter("color_tag like \"red%\"")
    .topK(5)
    .build();

searchResp = client.search(searchReq);

System.out.println(JSONObject.toJSON(searchResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. Filtered search
// 8.1 Filter with "like" operator and prefix wildcard
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = await client.search({
    collection_name: "quick_setup",
    data: [query_vector],
    limit: 5,
    filters: "color_tag like \"red%\"",
    output_fields: ["color_tag"]
})

console.log(res.results)
```

</TabItem>
</Tabs>

The output is similar to the following:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
[
    [
        {
            "id": 58,
            "distance": 1.4645483493804932,
            "entity": {
                "color_tag": "red_8218"
            }
        },
        {
            "id": 307,
            "distance": 1.4149816036224365,
            "entity": {
                "color_tag": "red_3923"
            }
        },
        {
            "id": 16,
            "distance": 1.3404488563537598,
            "entity": {
                "color_tag": "red_9524"
            }
        },
        {
            "id": 142,
            "distance": 1.31600022315979,
            "entity": {
                "color_tag": "red_4160"
            }
        },
        {
            "id": 438,
            "distance": 1.315270185470581,
            "entity": {
                "color_tag": "red_8131"
            }
        }
    ]
]
```

</TabItem>

<TabItem value='java'>

```java
{"searchResults": [
    [
        {
            "score": 1.1869997,
            "fields": {"color_tag": "red_3026"}
        },
        {
            "score": 1.1677284,
            "fields": {"color_tag": "red_9030"}
        },
        {
            "score": 1.1476475,
            "fields": {"color_tag": "red_3744"}
        },
        {
            "score": 1.0969629,
            "fields": {"color_tag": "red_4168"}
        },
        {
            "score": 1.0741848,
            "fields": {"color_tag": "red_9678"}
        }
    ]
]}
```

</TabItem>

<TabItem value='javascript'>

```javascript
[
  { score: 2.5080761909484863, id: '1201', color_tag: 'red_8904' },
  { score: 2.491129159927368, id: '425', color_tag: 'purple_8212' },
  { score: 2.4889798164367676, id: '1458', color_tag: 'red_6891' },
  { score: 2.42964243888855, id: '724', color_tag: 'black_9885' },
  { score: 2.4004223346710205, id: '854', color_tag: 'black_5990' }
]

```

</TabItem>
</Tabs>

## Range search{#range-search}

Range search allows you to find vectors that lie within a specified distance range from your query vector.

By setting `radius` and optionally `range_filter`, you can adjust the breadth of your search to include vectors that are somewhat similar to the query vector, providing a more comprehensive view of potential matches.

- `radius`: Defines the outer boundary of your search space. Only vectors that are within this distance from the query vector are considered potential matches.

- `range_filter`: While `radius` sets the outer limit of the search, `range_filter` can be optionally used to define an inner boundary, creating a distance range within which vectors must fall to be considered matches.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# Conduct a range search
search_params = {
    "metric_type": "IP",
    "params": {
        "radius": 0.8, # Radius of the search circle
        "range_filter": 1.0 # Range filter to filter out vectors that are not within the search circle
    }
}

query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = client.search(
    collection_name="quick_setup", # Replace with the actual name of your collection
    data=[query_vector],
    limit=3, # Max. number of search results to return
    search_params=search_params, # Search parameters
    output_fields=["color_tag"], # Output fields to return
)

result = json.dumps(res, indent=4)
print(result)
```

</TabItem>

<TabItem value='java'>

```java
// 9. Range search
query_vectors = Arrays.asList(Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f));

searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(query_vectors)
    .outputFields(Arrays.asList("color_tag"))
    .searchParams(Map.of("radius", 0.1, "range", 1.0))
    .topK(5)
    .build();

searchResp = client.search(searchReq);

System.out.println(JSONObject.toJSON(searchResp));
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9. Range search
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]

res = await client.search({
    collection_name: "quick_setup",
    data: [query_vector],
    limit: 5,
    params: {
        radius: 0.1,
        range: 1.0
    },
    output_fields: ["color_tag"]
})

console.log(res.results)
```

</TabItem>
</Tabs>

The output is similar to the following:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
[
    [
        {
            "id": 136,
            "distance": 2.4410910606384277,
            "entity": {}
        },
        {
            "id": 897,
            "distance": 2.2852015495300293,
            "entity": {}
        },
        {
            "id": 336,
            "distance": 2.2819623947143555,
            "entity": {}
        },
        {
            "id": 50,
            "distance": 2.2552754878997803,
            "entity": {}
        },
        {
            "id": 462,
            "distance": 2.2343976497650146,
            "entity": {}
        }
    ]
]
```

</TabItem>

<TabItem value='java'>

```java
{"searchResults": [
    [
        {
            "score": 1.263043,
            "fields": {"color_tag": "green_2052"}
        },
        {
            "score": 1.2377806,
            "fields": {"color_tag": "purple_3709"}
        },
        {
            "score": 1.1869997,
            "fields": {"color_tag": "red_3026"}
        },
        {
            "score": 1.1748955,
            "fields": {"color_tag": "black_1646"}
        },
        {
            "score": 1.1720343,
            "fields": {"color_tag": "green_4853"}
        }
    ]
]}
```

</TabItem>

<TabItem value='javascript'>

```javascript
[
  { score: 2.3387961387634277, id: '718', color_tag: 'black_7154' },
  { score: 2.3352415561676025, id: '1745', color_tag: 'blue_8741' },
  { score: 2.290485382080078, id: '1408', color_tag: 'red_2324' },
  { score: 2.285870313644409, id: '854', color_tag: 'black_5990' },
  { score: 2.2593345642089844, id: '1309', color_tag: 'red_8458' }
]
```

</TabItem>
</Tabs>

The parameter settings for `radius` and `range_filter` vary with the metric type in use.

<table>
   <tr>
     <th><strong>Metric Type</strong></th>
     <th><strong>Charactericstics</strong></th>
     <th><strong>Range Search Settings</strong></th>
   </tr>
   <tr>
     <td><code>L2</code></td>
     <td>Smaller L2 distances indicate higher similarity.</td>
     <td>To exclude the closest vectors from results, ensure that:<br/> <code>range_filter</code> \&lt;= distance \&lt; <code>radius</code></td>
   </tr>
   <tr>
     <td><code>IP</code></td>
     <td>Larger IP distances indicate higher similarity.</td>
     <td>To exclude the closest vectors from results, ensure that:<br/> <code>radius</code> \&lt; distance \&lt;= <code>range_filter</code></td>
   </tr>
</table>

## Search parameters{#search-parameters}

In the above searches except the range search and grouping search, the default search parameters apply. In normal cases, you do not need to manually set search parameters. 

```python
# In normal cases, you do not need to set search parameters manually
# Except for range searches.
search_parameters = {
    'metric_type': 'L2',
    'params': {
        'nprobe': 10,
        'level': 1，
        'radius': 1.0
        'range_filter': 0.8
    }
}
```

The following table lists all possible settings in the search parameters.

<table>
   <tr>
     <th><strong>Parameter Name</strong></th>
     <th><strong>Parameter Description</strong></th>
   </tr>
   <tr>
     <td><code>metric_type</code></td>
     <td>How to measure similarity between vector embeddings.<br/> Possible values are <code>IP</code>, <code>L2</code>, and <code>COSINE</code>, and defaults to that of the loaded index file.</td>
   </tr>
   <tr>
     <td><code>params.nprobe</code></td>
     <td>Number of units to query during the search.<br/> The value falls in the range [1, nlist<sub>[1]</sub>].</td>
   </tr>
   <tr>
     <td><code>params.level</code></td>
     <td>Search precision level.<br/> Possible values are <code>1</code>, <code>2</code>, <code>3</code>, <code>4</code>, and <code>5</code>, and defaults to <code>1</code>. Higher values yield more accurate results but slower performance.</td>
   </tr>
   <tr>
     <td><code>params.radius</code></td>
     <td>Minimum similarity between the query vector and candidate vectors.<br/> The value falls in the range [1, nlist<sub>[1]</sub>].</td>
   </tr>
   <tr>
     <td><code>params.range_filter</code></td>
     <td>A similarity range, optionally refining the search for vectors that fall in the range.<br/> The value falls in the range [top-K<sub>[2]</sub>, ∞].</td>
   </tr>
</table>

<Admonition type="info" icon="📘" title="Notes">

<p>[1] Number of cluster units after indexing. When indexing a collection, Zilliz Cloud sub-divides the vector data into multiple cluster units, the number of which varies with the actual index settings.</p>
<p>[2] Number of entities to return in a search.</p>

</Admonition>

