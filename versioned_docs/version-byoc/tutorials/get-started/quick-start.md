---
slug: /quick-start
beta: FALSE
notebook: FALSE
type: origin
token: GQN0wDCrni4n36kyeVQcF41Lned
sidebar_position: 2
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart

This guide explains how to set up your Zilliz Cloud cluster and perform CRUD operations in minutes.

## Before you start{#before-you-start}

- You have [signed up with Zilliz Cloud](https://cloud.zilliz.com). For details, refer to [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You can click the __Open in Colab__ button above if you prefer to start right away in the browser.

## Install an SDK{#install-an-sdk}

Zilliz Cloud supports the Milvus SDKs and all [RESTful API endpoints](/reference/restful/cloud-meta). You can use the RESTful API directly, or choose one of the following SDKs to start with:

- [Install the Python SDK.](./install-sdks#install-pymilvus-python-sdk)

- [Install the Java SDK.](./install-sdks#install-java-sdk)

- [Install the Go SDK.](./install-sdks#install-go-sdk)

- [Install the Node.js SDK.](./install-sdks#install-nodejs-sdk)

## Create a Cluster{#create-a-cluster}

You can create a cluster with the subscription plan of your choice using either the RESTful API endpoints or on the Zilliz Cloud console. 

The following demonstrates how to create a dedicated cluster using the RESTful API.

```bash
curl --request POST \
    --url "https://controller.api.${CLOUD_REGION}.cloud-uat3.zilliz.com/v1/clusters/create" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    --data-raw "{
        \"plan\": \"Standard\",
        \"clusterName\": \"cluster-standard\",
        \"cuSize\": 1,
        \"cuType\": \"Performance-optimized\",
        \"projectId\": \"${PROJECT_ID}\"
    }"
```

To obtain the cloud region, API key, and project ID, refer to [On Zilliz Cloud Console](./on-zilliz-cloud-console). If you prefer to create a serverless cluster on the Zilliz Cloud console, refer to [Create Cluster](./create-cluster).

Once your cluster is running, you will be prompted with the [cluster credentials](./cluster-credentials) for once. Download and save it in a safe place. You will need it to connect to your cluster later.

Alternatively, you can [create an API key](./manage-api-keys) instead of using the cluster credentials for the connection.

## Connect to Cluster{#connect-to-cluster}

Once you have obtained the cluster credentials or an API key, you can use it to connect to your cluster now.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT = ""
TOKEN = ""

# Replace CLUSTER_ENDPOINT and TOKEN with your own
client = MilvusClient(
    uri=CLUSTER_ENDPOINT, # Cluster endpoint obtained from the console
    token=TOKEN # A colon-separated cluster username and password
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.client.MilvusServiceClient;
import io.milvus.param.ConnectParam;

public static void main() {
    String CLUSTER_ENDPOINT = "";
    String TOKEN = "";
    
    ConnectParam connectParam = ConnectParam.newBuilder()
        .withUri(CLUSTER_ENDPOINT)
        .withToken(TOKEN)
        .build();
        
    MilvusServiceClient client = new MilvusServiceClient(connectParam);
    
    // You should add the code snippets that follow here.
    // ...
}
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

async function main() {
    // 1. Connect to the cluster
    const client = new MilvusClient({address, token})
        
    // 2. Create a collection
    let res = await client.createCollection({
        collection_name: "quick_setup",
        dimension: 5,
    });  

    console.log(res)

    // Output
    // 
    // {
    //   error_code: 'Success',
    //   reason: '',
    //   code: 0,
    //   retriable: false,
    //   detail: ''
    // }
    // 
    
    // You should add the code snippets that follow blow.
    // ...
 }
 
 main()
```

</TabItem>

<TabItem value='go'>

```go
import (
    "context"
    "encoding/json"
    "fmt"
    "log"
    "math/rand"
    "time"

    "github.com/milvus-io/milvus-sdk-go/v2/client"
    "github.com/milvus-io/milvus-sdk-go/v2/entity"
)

func main() {
    CLUSTER_ENDPOINT := "YOUR_CLUSTER_ENDPOINT"
    TOKEN := "YOUR_CLUSTER_TOKEN"

    // 1. Connect to cluster

    connParams := client.Config{
        Address: CLUSTER_ENDPOINT,
        APIKey:  TOKEN,
    }

    conn, err := client.NewClient(context.Background(), connParams)

    if err != nil {
        log.Fatal("Failed to connect to Zilliz Cloud:", err.Error())
    }

    fmt.Println("Connected to Milvus")

    // Output: 
    //
    // Connected to Milvus
    
    // ...
    // You should add the code snippets that follow here.
    // ...
}
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>Due to language differences, you should <strong>include your code in a main function</strong> if you prefer to code in <strong>Java</strong>, <strong>Golang</strong>, or <strong>Node.js</strong>.</p>

</Admonition>

## Create a Collection{#create-a-collection}

On Zilliz Cloud, you need to store your vector embeddings in collections. All vector embeddings stored in a collection share the same dimensionality and distance metric for measuring similarity.

<Tabs groupId="setupCol" defaultValue='quick' values={[{"label":"Quick Setup","value":"quick"},{"label":"Customized Setup","value":"custom"}]}>

<TabItem value="quick">

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# 2. Create a collection in quick setup mode
client.create_collection(
    collection_name="quick_setup",
    dimension=5
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.R;
import io.milvus.param.RpcStatus;
import io.milvus.param.highlevel.collection.CreateSimpleCollectionParam;

// 2. Create a collection in quick setup mode
CreateSimpleCollectionParam createSimpleCollectionParam = CreateSimpleCollectionParam.newBuilder()
    .withCollectionName("quick_setup")
    .withDimension(5)
    .build();
    
R<RpcStatus> quickSetup = client.createCollection(createSimpleCollectionParam);

System.out.println("Quick Setup Status: " + quickSetup.getStatus());

// Output:
// Quick Setup Status: 0
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 2. Create a collection
let res = await client.createCollection({
    collection_name: "quick_setup",
    dimension: 5,
});  

console.log(res)

// Output
// 
// {
//   error_code: 'Success',
//   reason: '',
//   code: 0,
//   retriable: false,
//   detail: ''
// }
// 
```

</TabItem>

<TabItem value='bash'>

```bash
COLLECTION_NAME="quick_setup"

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/collections/create" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    --data-raw "{   
        \"collectionName\": \"${COLLECTION_NAME}\",
        \"dimension\": 32
    }"

# [Note]    
# When creating a collection using RESTful API, the minimum dimension allowed is 32.
```

</TabItem>
</Tabs>

In the above setup, 

- The primary and vector fields use their default names (__id__ and __vector__).

- The metric type is also set to its default value (__IP__).

- The primary field accepts integers and does not automatically increments.

- A reserved JSON field named __$meta__ is used to store non-schema-defined fields and their values.

</TabItem>

<TabItem value="custom">

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# 3. Create a collection in customized setup mode

# 3.1. Create schema
schema = MilvusClient.create_schema(
    auto_id=False,
    enable_dynamic_field=True,
)

# 3.2. Add fields to schema
schema.add_field(field_name="my_id", datatype=DataType.INT64, is_primary=True)
schema.add_field(field_name="my_vector", datatype=DataType.FLOAT_VECTOR, dim=5)

# 3.3. Prepare index parameters
index_params = client.prepare_index_params()

# 3.4. Add indexes
index_params.add_index(
    field_name="my_id",
    index_type="TRIE"
)

index_params.add_index(
    field_name="my_vector", 
    index_type="AUTOINDEX",
    metric_type="IP"
)

# 3.5. Create a collection
client.create_collection(
    collection_name="customized_setup",
    schema=schema,
    index_params=index_params
)

# [NOTE]
# Collection created in this way are automatically indexed and loaded.
# Skip the "index_params" parameter leaves you to manually index and load the collection.

```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.grpc.DataType;
import io.milvus.param.IndexType;
import io.milvus.param.MetricType;
import io.milvus.param.collection.CreateCollectionParam;
import io.milvus.param.collection.FieldType;
import io.milvus.param.collection.LoadCollectionParam;
import io.milvus.param.index.CreateIndexParam;

// 3. Create a collection in customized setup mode

// 3.1 Define fields
FieldType id = FieldType.newBuilder()
    .withName("my_id")
    .withDataType(DataType.Int64)
    .withPrimaryKey(true)
    .withAutoID(false)
    .build();

FieldType vector = FieldType.newBuilder()
    .withName("my_vector")
    .withDataType(DataType.FloatVector)
    .withDimension(5)
    .build();    
    
// 3.2 Create collection
CreateCollectionParam createCollectionParam = CreateCollectionParam.newBuilder()
    .withCollectionName("customized_setup")
    .addFieldType(id)
    .addFieldType(vector)
    .withEnableDynamicField(true)
    .build();

R<RpcStatus> customizedSetup = client.createCollection(createCollectionParam);   

System.out.println("Customized Setup Status: " + customizedSetup.getStatus());

// Output:
// Customized Setup Status: 0

// 3.3 Create index
CreateIndexParam createIndexParam = CreateIndexParam.newBuilder()
    .withCollectionName("customized_setup")
    .withFieldName("my_vector")
    .withIndexType(IndexType.AUTOINDEX)
    .withMetricType(MetricType.IP)
    .build();

R<RpcStatus> index = client.createIndex(createIndexParam);        

System.out.println("Create Index Status: " + index.getStatus());

// Output:
// Create Index Status: 0

// 3.4 Load collection
LoadCollectionParam loadCollectionParam = LoadCollectionParam.newBuilder()
    .withCollectionName("customized_setup")
    .build();

R<RpcStatus> load = client.loadCollection(loadCollectionParam);    

System.out.println("Load Collection Status: " +load.getStatus());

// Output:
// Load Collection Status: 0
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. Create a collection with a schema
const fields = [
    {
        name: "my_id",
        data_type: DataType.Int64,
        is_primary_key: true,
        auto_id: false
    },
    {
        name: "my_vector",
        data_type: DataType.FloatVector,
        dim: 5
    },
]

res = await client.createCollection({
    collection_name: "customized_setup",
    fields: fields,
    enable_dynamic_field: true
})

console.log(res)

// Output
// 
// {
//   error_code: 'Success',
//   reason: '',
//   code: 0,
//   retriable: false,
//   detail: ''
// }
// 

res = await client.createIndex({
    collection_name: "customized_setup",
    field_name: "my_vector",
    index_ttype: "AUTOINDEX",
    metric_type: "L2",
    params: {}
})

console.log(res)

// Output
// 
// {
//   error_code: 'Success',
//   reason: '',
//   code: 0,
//   retriable: false,
//   detail: ''
// }
// 

res = await client.loadCollection({
    collection_name: "customized_setup"
})

console.log(res)

// Output
// 
// {
//   error_code: 'Success',
//   reason: '',
//   code: 0,
//   retriable: false,
//   detail: ''
// }
// 
```

</TabItem>

<TabItem value='go'>

```go
// 2. Create a collection
collectionName := "quick_setup"

id := entity.NewField().
    WithName("id").
    WithDataType(entity.FieldTypeInt64).
    WithIsPrimaryKey(true)

vector := entity.NewField().
    WithName("vector").
    WithDataType(entity.FieldTypeFloatVector).
    WithDim(5)

schema := &entity.Schema{
    CollectionName: collectionName,
    AutoID:         false,
    Fields: []*entity.Field{
        id,
        vector,
    },
    EnableDynamicField: true,
}

err = conn.CreateCollection(
    context.Background(), // ctx
    schema,               // schema
    1,                    // shards
)

if err != nil {
    log.Fatal("Failed to create collection:", err.Error())
}

fmt.Println("Collection created")

// Output: 
//
// Collection created

// 3. Create the index
index, err := entity.NewIndexAUTOINDEX(entity.MetricType("IP"))

if err != nil {
    log.Fatal("Failed to prepare the index:", err.Error())
}

err = conn.CreateIndex(
    context.Background(), // ctx
    collectionName,       // collection name
    "vector",             // target field name
    index,                // index type
    false,                // async
)

if err != nil {
    log.Fatal("Failed to create the index:", err.Error())
}

fmt.Println("Index created")

// Output: 
//
// Index created

// 4. Load the collection
err = conn.LoadCollection(
    context.Background(), // ctx
    collectionName,       // collection name
    false,                // async
)

if err != nil {
    log.Fatal("Failed to load the collection:", err.Error())
}

fmt.Println("Collection loaded")

// Output: 
//
// Collection loaded
```

</TabItem>

<TabItem value='bash'>

```bash
COLLECTION_NAME="customized_setup"

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/collections/create" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    --data-raw "{   
        \"collectionName\": \"${COLLECTION_NAME}\",
        \"dimension\": 32,
        \"metricType\": \"L2\",
        \"primaryField\": \"my_id\",
        \"vectorField\": \"my_vector\"
    }"
    
 # [Note]
 # When creating a collection using RESTful API, you can customize the metric type and the names of the primary and vector fields.
```

</TabItem>
</Tabs>

In the above setup, you have the flexibility to define various aspects of the collection during its creation, including its schema and index parameters.

- __Schema__

    The schema defines the structure of a collection. Except for adding pre-defined fields and setting their attributes, you have the option of enabling and disabling

    - __AutoID__

        Whether to enable the collection to automatically increment the primary field.

    - __Dynamic Field__

        Whether to use the reserved JSON field __$meta__ to store non-schema-defined fields and their values. 

     For a detailed explanation of the schema, refer to [Schema Explained](./schema-explained).

- __Index parameters__

    Index parameters dictate how Zilliz Cloud organizes your data within a collection. You can assign specific indexes to fields by configuring their __metric types__ and __index types__. 

    - For the vector field, you can use `AUTOINDEX` as the index type and use `COSINE`, `L2`, or `IP` as the `metric_type`.

    - For scalar fields, including the primary field, Zilliz Cloud uses `TRIE` for integers and `STL_SORT` for strings.

    For additional insights into index types, refer to[AUTOINDEX Explained](./autoindex-explained).

</TabItem>

</Tabs>

## Insert Data{#insert-data}

Collections created in either of the preceding ways have been indexed and loaded. Once you are ready, insert some example data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# 4. Insert data into the collection
# 4.1. Prepare data
data=[
    {"id": 0, "vector": [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], "color": "pink_8682"},
    {"id": 1, "vector": [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], "color": "red_7025"},
    {"id": 2, "vector": [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], "color": "orange_6781"},
    {"id": 3, "vector": [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], "color": "pink_9298"},
    {"id": 4, "vector": [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], "color": "red_4794"},
    {"id": 5, "vector": [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], "color": "yellow_4222"},
    {"id": 6, "vector": [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], "color": "red_9392"},
    {"id": 7, "vector": [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], "color": "grey_8510"},
    {"id": 8, "vector": [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], "color": "white_9381"},
    {"id": 9, "vector": [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], "color": "purple_4976"}
]

# 4.2. Insert data
res = client.insert(
    collection_name="quick_setup",
    data=data
)

print(res)

# Output
#
# {
#     "insert_count": 10
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.param.highlevel.dml.InsertRowsParam;
import io.milvus.param.highlevel.dml.response.InsertResponse;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;

import com.alibaba.fastjson.JSONObject;

// 4. Insert data into the collection

// 4.1 Prepare data
List<JSONObject> data = new ArrayList<>();

JSONObject row1 = new JSONObject();
row1.put("id", 0L);
row1.put("vector", Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f));
row1.put("color", "pink_8682");
data.add(row1);

JSONObject row2 = new JSONObject();
row2.put("id", 1L);
row2.put("vector", Arrays.asList(0.19886812562848388f, 0.06023560599112088f, 0.6976963061752597f, 0.2614474506242501f, 0.838729485096104f));
row2.put("color", "red_7025");
data.add(row2);

JSONObject row3 = new JSONObject();
row3.put("id", 2L);
row3.put("vector", Arrays.asList(0.43742130801983836f, -0.5597502546264526f, 0.6457887650909682f, 0.7894058910881185f, 0.20785793220625592f));
row3.put("color", "orange_6781");
data.add(row3);

JSONObject row4 = new JSONObject();
row4.put("id", 3L);
row4.put("vector", Arrays.asList(0.16228770231628418f, -0.1996217642211914f, 0.5229960446357727f, 0.7976727294921875f, 0.3812752212524414f));
row4.put("color", "blue_5219");
data.add(row4);

JSONObject row5 = new JSONObject();
row5.put("id", 4L);
row5.put("vector", Arrays.asList(0.26286205330961354f, 0.9029438446296592f, 0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f));
row5.put("color", "green_3898");
data.add(row5);

// 4.2 Insert data

InsertRowsParam insertRowsParam = InsertRowsParam.newBuilder()
    .withCollectionName("quick_setup")
    .withRows(data)
    .build();

R<InsertResponse> insert = client.insert(insertRowsParam);

System.out.println("Insert Counts: " + insert.getData().getInsertCount());

// Output:
// Insert Counts: 5
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 4. Insert data into the collection
var data = [
    {id: 0, vector: [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], color: "pink_8682"},
    {id: 1, vector: [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104], color: "red_7025"},
    {id: 2, vector: [0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592], color: "orange_6781"},
    {id: 3, vector: [0.3172005263489739, 0.9719044792798428, -0.36981146090600725, -0.4860894583077995, 0.95791889146345], color: "pink_9298"},
    {id: 4, vector: [0.4452349528804562, -0.8757026943054742, 0.8220779437047674, 0.46406290649483184, 0.30337481143159106], color: "red_4794"},
    {id: 5, vector: [0.985825131989184, -0.8144651566660419, 0.6299267002202009, 0.1206906911183383, -0.1446277761879955], color: "yellow_4222"},
    {id: 6, vector: [0.8371977790571115, -0.015764369584852833, -0.31062937026679327, -0.562666951622192, -0.8984947637863987], color: "red_9392"},
    {id: 7, vector: [-0.33445148015177995, -0.2567135004164067, 0.8987539745369246, 0.9402995886420709, 0.5378064918413052], color: "grey_8510"},
    {id: 8, vector: [0.39524717779832685, 0.4000257286739164, -0.5890507376891594, -0.8650502298996872, -0.6140360785406336], color: "white_9381"},
    {id: 9, vector: [0.5718280481994695, 0.24070317428066512, -0.3737913482606834, -0.06726932177492717, -0.6980531615588608], color: "purple_4976"}
]

res = await client.insert({
    collection_name: "quick_setup",
    data: data
})

console.log(res)

// Output
// 
// {
//   succ_index: [
//     0, 1, 2, 3, 4,
//     5, 6, 7, 8, 9
//   ],
//   err_index: [],
//   status: {
//     error_code: 'Success',
//     reason: '',
//     code: 0,
//     retriable: false,
//     detail: ''
//   },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '10',
//   delete_cnt: '0',
//   upsert_cnt: '0',
//   timestamp: '447460747229265922'
// }
// 
```

</TabItem>

<TabItem value='go'>

<Tabs groupId="go" defaultValue='go' values={[{"label":"Demo Code","value":"go"},{"label":"Row Struct Definition","value":"go_1"}]}>
<TabItem value='go'>

```go
// 5. Prepare the data
rows := make([]interface{}, 0, 1)

rows = append(rows, Row{
    ID:     0,
    Vector: []float32{0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592},
    Color:  "pink_8682",
})

rows = append(rows, Row{
    ID:     1,
    Vector: []float32{0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104},
    Color:  "red_7025",
})

rows = append(rows, Row{
    ID:     2,
    Vector: []float32{0.43742130801983836, -0.5597502546264526, 0.6457887650909682, 0.7894058910881185, 0.20785793220625592},
    Color:  "orange_6781",
})

rows = append(rows, Row{
    ID:     3,
    Vector: []float32{0.2923324203491211, -0.14941246032714844, 0.5195220947265625, -0.8015365600585938, 0.12919048309326172},
    Color:  "blue_5452",
})

rows = append(rows, Row{
    ID:     4,
    Vector: []float32{0.6222862243652344, -0.7742881774902344, 0.13988418579101562, -0.1562347412109375, 0.1722564697265625},
    Color:  "green_4620",
})

// 6. Insert the data
col, err := conn.InsertRows(
    context.Background(), // ctx
    collectionName,       // collection name
    "",                   // partition name
    rows,                 // rows
)

if err != nil {
    log.Fatal("Failed to insert the data:", err.Error())
}

fmt.Println("Insert Counts:", col.Len())

// Output: 
//
// Insert Counts: 5

```

</TabItem>
<TabItem value='go_1'>

```go
type Row struct {
    ID     int64     `json:"id" milvus:"name:id"`
    Vector []float32 `json:"vector" milvus:"name:vector"`
    Color  string    `json:"color" milvus:"name:color"`
}
```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='bash'>

```bash
curl -s --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/insert" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    --data-raw '{
        "collectionName": "quick_setup",
        "data": [
          {"vector": [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231, 0.5785260847050646, -0.054715415380102606, -0.5397764260208828, 0.43017743102321027, 0.9806353568812998, -0.24673180651795223, 0.34881128643815407, -0.32534925835429895, 0.7241025896770166, -0.9310390347090534, -0.00517733162532541, 0.35907388281139796, 0.18688386131011714, -0.8001861303343061, -0.5566607389660039, 0.04377295852369856, 0.8581396389536908, -0.978968045358507, -0.4880334792710488, 0.5358685336203941, -0.7193875502048268, -0.4532291009652729, -0.11581052480270215, 0.10653024983528492, -0.8627130991811947, -0.25257559931666673, -0.5504183627361223], "color": "grey_4070"},
          {"vector": [-0.3909198248479646, -0.8726174312444843, 0.4981267572657442, -0.9392508698102204, -0.5470572556090092, -0.3935189142612121, 0.1352989877734332, 0.024264294653546514, 0.7264052115187281, -0.6808533057244894, 0.7351664405855725, 0.005931211564576433, -0.0697782425914808, 0.6040296457830396, -0.47872914502564345, -0.5288260741725077, -0.5362319321619846, -0.8108472036219292, -0.8577528226667432, -0.2048056936793683, -0.6943943334329779, -0.8299930135359141, 0.49330825099195597, 0.6527186109414937, -0.6682390594575318, -0.9522414136501673, -0.8932844905587374, 0.6156902872360595, 0.4407973007703412, 0.36692826296755854, -0.019596585511122644, 0.5003546782774693], "color": "black_3737"},
          {"vector": [-0.9098169905660276, -0.9307025336058208, -0.5308685343695865, -0.3852032359431963, -0.8050806646961366, -0.7553958648430483, -0.04746686780074083, 0.3159553062289606, 0.7370698278509888, -0.6989962887777352, 0.8064774943951307, 0.4263340869435144, -0.8213814014479408, 0.6238869984219455, 0.13179555217281624, -0.5249440937384842, 0.3112418861757056, -0.009645837220139786, -0.34449540620045216, -0.16945013209894366, -0.08038078340201227, -0.5288249245667362, -0.26255967229065824, -0.2601166677919182, -0.9203887463545513, 0.4976565748955917, -0.8474289284878807, -0.7117411686814676, -0.05565836948920677, 0.6094714291840837, -0.0020195585026894225, 0.362204588344899], "color": "yellow_7436"},
          {"vector": [-0.05064204615748724, 0.6058571389881378, 0.26812302147792155, 0.4862225881265785, -0.27042586524166445, -0.10680573214013545, -0.7152960094489149, -0.7053115315538734, -0.5081969178297439, -0.07475606674958946, -0.7587226116897114, 0.7886604365718077, -0.528645030042241, 0.86863376110431, 0.28607868071957854, -0.5571199703709493, 0.8499541027352635, 0.5813793976730512, -0.5556154008368948, -0.36544531446924267, 0.019021916423604956, -0.6436002715728013, 0.6630699558027113, -0.5903357545674612, -0.5324197660811583, 0.5397005035747773, -0.8636516266354666, 0.6514205420589516, 0.18186014054232635, -0.6579510629936576, 0.9154204121171494, -0.588373370919973], "color": "grey_9883"},
          {"vector": [-0.8610792440629793, 0.5278969698864726, 0.09065723848982965, -0.8685651142668274, 0.5912780986996793, 0.7718057232138666, -0.6930251121964992, -0.17342634825314818, 0.061179249376206, -0.837569096833388, -0.3767257369548458, -0.8687434527488724, -0.06111062357392094, 0.6072631561858302, 0.4725979771913693, -0.08096083856280956, -0.5442650638494355, 0.5091961466254937, 0.2921502370985445, 0.9443668573144401, 0.8571520725555872, 0.17127995370389137, -0.7250695774062459, -0.5881549461813231, 0.38032084480540296, -0.030410542912708394, -0.3805227007958596, 0.43257136753925574, 0.5753379480674585, 0.7776080918850938, 0.3290459466010087, 0.44644425336832505], "color": "green_8111"},
          {"vector": [0.4814454540587043, -0.23573937400668377, -0.14938260011601723, 0.08275006479687019, 0.6726732239961157, -0.31385042293554943, 0.9065116066382561, -0.07376617502043659, -0.15985076697373835, 0.8263269726712981, 0.7132277417959834, 0.5844650108623501, 0.020362603272864988, 0.9082939898010478, -0.919972930439023, 0.7046162221439936, 0.8553697519202315, -0.07825115185283904, 0.7391763987156941, -0.41400552255842027, 0.35433032483330784, 0.9985892288882159, -0.9516074554318614, 0.22832313108038482, -0.21336772684586625, 0.23130728052337313, -0.18432662864762395, 0.003069103769209436, -0.24614748888766202, -0.42442199335438135, -0.8464531066031178, 0.9721537266896632], "color": "orange_2725"},
          {"vector": [0.9763298348098068, 0.5777919290849443, 0.9579310732153326, 0.8951091168874232, 0.46917481926682525, -0.3061975140935782, -0.16434109070432057, -0.6434953092266336, 0.6075700936951791, 0.7286632067443393, -0.8441327280179198, 0.36851370865411615, 0.35737333933348236, 0.6662206497349656, 0.5937307976280566, 0.9988743075763993, -0.25270272864064935, -0.7279204320769948, 0.8063165272147106, 0.9371129579799526, -0.13546107168994004, 0.08170978985509914, -0.12002219980690865, -0.4541366824231243, -0.9991267995837836, 0.30319946122207386, -0.5678648848761576, 0.47977343131413464, 0.5368586513295002, -0.8628460510223892, 0.047832472509733215, 0.42742619692820605], "color": "black_6073"},
          {"vector": [0.326134221411539, 0.6870356809753577, 0.7977120714123429, 0.4305198158670587, -0.14894148480426983, 0.33293178404139834, 0.989645830971488, 0.9694029045116572, -0.9665991194957253, 0.3494360539847803, 0.9214746589945242, -0.9837563715221675, 0.19427528567061514, 0.9480034805808477, 0.44987272210144713, 0.140189550857855, 0.3467104580971587, 0.2114891340667513, -0.17782796206191853, 0.5987574466521213, -0.15394322442802588, -0.8119407476074019, 0.24952406054263054, -0.8707940028976195, 0.29912917392406735, 0.35946930014146994, 0.7351955477319807, -0.49286540351167396, -0.5563489486554862, 0.7526768798984209, -0.6701129581899767, -0.4130966219244212], "color": "purple_1285"},
          {"vector": [0.8709056428858379, 0.021264532993509055, -0.8042932327188321, -0.007299919034885249, 0.14411861700299666, 0.4241829662545695, 0.7975746278107849, -0.4458631108150193, 0.9884543861771473, 0.3130286915737188, -0.22046712292493242, -0.45285286937302316, -0.018640592787550814, 0.8799940941813773, 0.035261311713563614, 0.4658267779876306, -0.7413463515490162, -0.7759814759030597, -0.4529594870928504, -0.19067842917654443, 0.5011790741277351, 0.3757039803466302, -0.6209543465851151, -0.42329482992153356, 0.33756431637161577, -0.5507021636838432, -0.2560901440100689, 0.2674794972696948, -0.6657069132148055, 0.9336993159102207, -0.7371725139286605, -0.02842483808811025], "color": "green_3127"},
          {"vector": [-0.8182282159972083, -0.7882247281939101, -0.1870871133115657, 0.07914806834708976, 0.9825978431531959, 0.6376417285837821, 0.03471891555076656, -0.528573240192042, -0.3120101879340418, 0.7310244200318836, 0.3667663237097627, 0.9999351024798635, 0.07293451060816847, 0.6677216710145908, -0.22314582717085552, 0.40498852077068226, 0.2795560683848244, 0.9332235971261622, -0.9714034189529892, 0.913281723620643, -0.7104703586519907, 0.5913739340519524, 0.04391242994176703, 0.07074627854378579, 0.9076826088747483, 0.9438187849605835, 0.5835538442072998, 0.960003211421663, 0.35362751894674815, -0.7583360985487917, -0.8714012832349345, 0.48642391194514345], "color": "blue_6372"}
        ]
    }'
    
# [NOTE]
# For collections created using RESTful API, exclude the primary field from the data to insert.
```

</TabItem>
</Tabs>

The provided code assumes that you have created a collection in the __Quick Setup__ manner. As shown in the above code, 

- The data to insert is organized into a list of dictionaries, where each dictionary represents a data record, termed as an entity.

- Each dictionary contains a non-schema-defined field named __color__.

- Each dictionary contains the keys corresponding to both pre-defined and dynamic fields.

For the sake of the search later, you can use the following code snippet to add more entities into the collection.

<Admonition type="info" icon="📘" title="Notes">

<p>The following code snippets demonstrate how to generate random data and insert the generated data into the collection. You can safely skip this section if you do not need more data.</p>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# 5. Insert more data into the collection
# 5.1. Prepare data

colors = ["green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"]
data = [ {
    "id": i, 
    "vector": [ random.uniform(-1, 1) for _ in range(5) ], 
    "color": f"{random.choice(colors)}_{str(random.randint(1000, 9999))}" 
} for i in range(1000) ]

# 5.2. Insert data
res = client.insert(
    collection_name="quick_setup",
    data=data[10:]
)

print(res)

# Output
#
# {
#     "insert_count": 990
# }
```

</TabItem>

<TabItem value='java'>

```java
// 4.3 Insert more data

data.clear();

for (int i = 5; i < 1000; i++) {
    Random random = new Random();
    String[] colors = {"green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"};
    JSONObject row = new JSONObject();
    row.put("id", Long.valueOf(i));
    row.put("vector", Arrays.asList(random.nextFloat(), random.nextFloat(), random.nextFloat(), random.nextFloat(), random.nextFloat()));
    row.put("color", colors[random.nextInt(colors.length)] + "_" + String.format("%04d",random.nextInt(9999)));
    data.add(row);
}

insertRowsParam = InsertRowsParam.newBuilder()
    .withCollectionName("quick_setup")
    .withRows(data)
    .build();

insert = client.insert(insertRowsParam);

System.out.println("Insert Counts: " + insert.getData().getInsertCount());

// Output:
// Insert Counts: 995
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. Insert more records
data = []
colors = ["green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"]

for (i =5; i < 1000; i++) {
    vector = [(Math.random() * (0.99 - 0.01) + 0.01), (Math.random() * (0.99 - 0.01) + 0.01), (Math.random() * (0.99 - 0.01) + 0.01), (Math.random() * (0.99 - 0.01) + 0.01), (Math.random() * (0.99 - 0.01) + 0.01)]
    color = colors[Math.floor(Math.random() * colors.length)] + "_" + Math.floor(Math.random() * (9999 - 1000) + 1000)

    data.push({id: i, vector: vector, color: color})
}

res = await client.insert({
    collection_name: "quick_setup",
    data: data
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
//     ... 895 more items
//   ],
//   err_index: [],
//   status: {
//     error_code: 'Success',
//     reason: '',
//     code: 0,
//     retriable: false,
//     detail: ''
//   },
//   IDs: { int_id: { data: [Array] }, id_field: 'int_id' },
//   acknowledged: false,
//   insert_cnt: '995',
//   delete_cnt: '0',
//   upsert_cnt: '0',
//   timestamp: '447460747268849665'
// }
// 
```

</TabItem>

<TabItem value='go'>

```go
// 7. Insert more data
rows = make([]interface{}, 0, 1)
colors := []string{"green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey"}

for i := 5; i < 1000; i++ {
    rows = append(rows, Row{
        ID:     int64(i),
        Vector: []float32{rand.Float32(), rand.Float32(), rand.Float32(), rand.Float32(), rand.Float32()},
        Color:  "color_" + colors[rand.Intn(len(colors))],
    })
}

col, err = conn.InsertRows(
    context.Background(), // ctx
    collectionName,       // collection name
    "",                   // partition name
    rows,                 // rows
)

if err != nil {
    log.Fatal("Failed to insert the data:", err.Error())
}

fmt.Println("Insert Counts:", col.Len())

// Output: 
//
// Insert Counts: 995
```

</TabItem>

<TabItem value='bash'>

<Tabs groupId="bash" defaultValue='bash' values={[{"label":"Bash Code","value":"bash"},{"label":"Code for Generating Random Floats ","value":"bash_1"}]}>
<TabItem value='bash'>

```bash
# 7. Insert more fields
for i in {1..10}; do
  DATA=$(python random_floats.py)

  curl --request POST \
      --url "${CLUSTER_ENDPOINT}/v1/vector/insert" \
      --header "Authorization: Bearer ${API_KEY}" \
      --header "accept: application/json" \
      --header "content-type: application/json" \
      --data-raw "{
          \"collectionName\": \"quick_setup\",
          \"data\": ${DATA}
      }"

  sleep 1
done  

# [NOTE]
# You can insert a maximum of 100 records per insert request.

```

</TabItem>
<TabItem value='bash_1'>

```bash
# random_floats.py
import random, json
from sys import argv

if __name__ == '__main__':
    data = []
    colors = ['red', 'green', 'blue', 'yellow', 'orange', 'purple']

    for i in range(100):
        data.append({
            'vector': [random.uniform(-1, 1) for _ in range(32)],
            'color': random.choice(colors) + '_' + str(random.randint(1000, 9999))
        })

    print(json.dumps(data))
```

</TabItem>
</Tabs>
</TabItem>
</Tabs>

## Similarity Search{#similarity-search}

You can conduct similarity searches based on one or more vector embeddings.

<Admonition type="info" icon="📘" title="Notes">

<p>Conducting searches immediately after inserting data may result in an empty set, because the inserted data may be still streaming into the collection. </p>
<p>You are advised to wait for a few seconds before conducting the following operations.</p>

</Admonition>

- __Search with a single vector embedding.__

    The value of the __query_vectors__ variable is a list containing a sub-list of floats. The sub-list represents a vector embedding of 5 dimensions. 

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # 6. Search with a single vector
    # 6.1. Prepare query vectors
    query_vectors = [
        [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648]
    ]
    
    # 6.2. Start search
    res = client.search(
        collection_name="quick_setup",     # target collection
        data=query_vectors,                # query vectors
        limit=3,                           # number of returned entities
    )
    
    print(res)
    
    # Output
    #
    # [
    #     [
    #         {
    #             "id": 548,
    #             "distance": 0.08589144051074982,
    #             "entity": {}
    #         },
    #         {
    #             "id": 736,
    #             "distance": 0.07866684347391129,
    #             "entity": {}
    #         },
    #         {
    #             "id": 928,
    #             "distance": 0.07650312781333923,
    #             "entity": {}
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.param.highlevel.dml.SearchSimpleParam;
    import io.milvus.param.highlevel.dml.response.SearchResponse;
    import io.milvus.response.QueryResultsWrapper;
    
    // 6. Search data
    
    // 6.1 Prepare query vectors for single-vector search
    List<List<Float>> queryVectors = new ArrayList<>();
    queryVectors.add(Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f));
    
    // 6.2 Search data
    SearchSimpleParam searchSimpleParam = SearchSimpleParam.newBuilder()
        .withCollectionName("quick_setup")
        .withVectors(queryVectors)
        .withLimit(3L)
        .build();
    
    R<SearchResponse> search = client.search(searchSimpleParam);
    
    List<List<JSONObject>> searchResults = new ArrayList<>();
    
    for (int i = 0; i < queryVectors.size(); i++) {
        List<JSONObject> rowSet = new ArrayList<>();
        for (QueryResultsWrapper.RowRecord rowRecord: search.getData().getRowRecords(i)) {
            JSONObject object = new JSONObject();
            object.put("id", rowRecord.getFieldValues().get("id"));
            object.put("distance", rowRecord.getFieldValues().get("distance"));
            rowSet.add(object);
        }
        searchResults.add(rowSet);
    };
    
    System.out.println(searchResults);
    
    // Output:
    // [[
    //     {
    //         "distance": 0,
    //         "id": 0
    //     },
    //     {
    //         "distance": 0.68204224,
    //         "id": 42
    //     },
    //     {
    //         "distance": 0.68476903,
    //         "id": 352
    //     }
    // ]]
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 6. Search with a single vector
    const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592]
    
    res = await client.search({
        collection_name: "quick_setup",
        vectors: query_vector,
        limit: 5,
    })
    
    console.log(res.results)
    
    // Output
    // 
    // [
    //   { score: 1.4093276262283325, id: '0' },
    //   { score: 1.1681138277053833, id: '949' },
    //   { score: 1.1286306381225586, id: '257' },
    //   { score: 1.1050969362258911, id: '55' },
    //   { score: 1.0776047706604004, id: '273' }
    // ]
    // 
    ```

    </TabItem>

    <TabItem value='go'>

    <Tabs groupId="go" defaultValue='go' values={[{"label":"Demo code ","value":"go"},{"label":"Result Format Functions","value":"go_1"}]}>
    <TabItem value='go'>

    ```go
    // 8. Search with a single vector
    queryVector := make(entity.FloatVector, 0, 5)
    queryVector = append(queryVector, 0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592)
    queryVectors := []entity.Vector{}
    queryVectors = append(queryVectors, queryVector)
    expr := ""
    outputFields := []string{"id", "color"}
    topK := 3
    
    sp, _ := entity.NewIndexAUTOINDEXSearchParam(1)
    
    search, err := conn.Search(
        context.Background(),    // ctx
        collectionName,          // collection name
        []string{},              // partition names
        expr,                    // expression
        outputFields,            // output fields
        queryVectors,            // query vectors
        "vector",                // target field name
        entity.MetricType("IP"), // metric type
        topK,                    // topK
        sp,                      // search param
    )
    
    if err != nil {
        log.Fatal("Failed to search the data:", err.Error())
    }
    
    fmt.Println(resultsToJSON(search))
    
    // Output: 
    // [
    //  {
    //      "counts": 3,
    //      "distances": [
    //          1.4093276,
    //          1.2094578,
    //          1.1929908
    //      ],
    //      "rows": [
    //          {
    //              "color": "pink_8682",
    //              "id": 0
    //          },
    //          {
    //              "color": "color_red",
    //              "id": 960
    //          },
    //          {
    //              "color": "color_yellow",
    //              "id": 253
    //          }
    //      ]
    //  }
    // ]

    ```

    </TabItem>
    <TabItem value='go_1'>

    ```go
    func resultsToJSON(results []client.SearchResult) string {
        var result []map[string]interface{}
        for _, r := range results {
            result = append(result, map[string]interface{}{
                "counts": r.ResultCount,
                // "fields": fieldsToJSON(results, true),
                "rows":      fieldsToJSON(results, false),
                "distances": r.Scores,
            })
        }
    
        jsonData, _ := json.Marshal(result)
        return string(jsonData)
    }
    
    func fieldsToJSON(results []client.SearchResult, inFields bool) []map[string]interface{} {
        var fields []map[string]interface{}
        var rows []map[string]interface{}
        var ret []map[string]interface{}
        for _, r := range results {
            for _, f := range r.Fields {
                field := make(map[string]interface{})
                name := f.Name()
                data := typeSwitch(f)
    
                for i, v := range data {
                    if len(rows) < i+1 {
                        row := make(map[string]interface{})
                        row[name] = v
                        rows = append(rows, row)
                    } else {
                        rows[i][name] = v
                    }
                }
    
                field[name] = data
                fields = append(fields, field)
            }
        }
    
        if inFields {
            ret = fields
        } else {
            ret = rows
        }
    
        return ret
    }
    
    func typeSwitch(c entity.Column) []interface{} {
        ctype := c.FieldData().GetType().String()
    
        var data []interface{}
        switch ctype {
        case "Int64":
            longData := c.FieldData().GetScalars().GetLongData().Data
            for _, d := range longData {
                data = append(data, d)
            }
        case "VarChar":
            stringData := c.FieldData().GetScalars().GetStringData().Data
            for _, d := range stringData {
                data = append(data, d)
            }
        case "JSON":
            jsonData := c.FieldData().GetScalars().GetJsonData().Data
            for _, d := range jsonData {
                var jsonValue interface{}
                err := json.Unmarshal(d, &jsonValue)
                if err != nil {
                    log.Fatal("Failed to unmarshal")
                    continue
                }
                value, _ := jsonValue.(map[string]interface{})
                data = append(data, value[c.Name()])
            }
        }
        // You should add more types here
        return data
    }
    
    ```

    </TabItem>
    </Tabs>
    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 8. Conduct a single vector search
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v1/vector/search" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json" \
        --header "content-type: application/json" \
        -d '{
           "collectionName": "quick_setup",
           "vector": [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231, 0.5785260847050646, -0.054715415380102606, -0.5397764260208828, 0.43017743102321027, 0.9806353568812998, -0.24673180651795223, 0.34881128643815407, -0.32534925835429895, 0.7241025896770166, -0.9310390347090534, -0.00517733162532541, 0.35907388281139796, 0.18688386131011714, -0.8001861303343061, -0.5566607389660039, 0.04377295852369856, 0.8581396389536908, -0.978968045358507, -0.4880334792710488, 0.5358685336203941, -0.7193875502048268, -0.4532291009652729, -0.11581052480270215, 0.10653024983528492, -0.8627130991811947, -0.25257559931666673, -0.5504183627361223]
        }'
    ```

    </TabItem>
    </Tabs>

    The output is a list containing a sub-list of three dictionaries, representing the returned entities with their IDs and distances.

- __Search with multiple vector embeddings.__

    You can also include multiple vector-embeddings in the __query_vectors__ variable to conduct a bulk similarity search.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 7. Search with multiple vectors
    # 7.1. Prepare query vectors
    query_vectors = [
        [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648],
        [0.0039737443, 0.003020432, -0.0006188639, 0.03913546, -0.00089768134]
    ]
    
    # 7.2. Start search
    res = client.search(
        collection_name="quick_setup",
        data=query_vectors,
        limit=3,
    )
    
    print(res)
    
    # Output
    #
    # [
    #     [
    #         {
    #             "id": 548,
    #             "distance": 0.08589144051074982,
    #             "entity": {}
    #         },
    #         {
    #             "id": 736,
    #             "distance": 0.07866684347391129,
    #             "entity": {}
    #         },
    #         {
    #             "id": 928,
    #             "distance": 0.07650312781333923,
    #             "entity": {}
    #         }
    #     ],
    #     [
    #         {
    #             "id": 532,
    #             "distance": 0.044551681727170944,
    #             "entity": {}
    #         },
    #         {
    #             "id": 149,
    #             "distance": 0.044386886060237885,
    #             "entity": {}
    #         },
    #         {
    #             "id": 271,
    #             "distance": 0.0442606583237648,
    #             "entity": {}
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 6.3 Prepare query vectors for multi-vector search
    queryVectors.clear();
    queryVectors.add(Arrays.asList(0.19886812562848388f, 0.06023560599112088f, 0.6976963061752597f, 0.2614474506242501f, 0.838729485096104f));
    queryVectors.add(Arrays.asList(0.43742130801983836f, -0.5597502546264526f, 0.6457887650909682f, 0.7894058910881185f, 0.20785793220625592f));
    
    // 6.4 Search data
    searchSimpleParam = SearchSimpleParam.newBuilder()
        .withCollectionName("quick_setup")
        .withVectors(queryVectors)
        .withLimit(3L)
        .build();
    
    search = client.search(searchSimpleParam);
    
    searchResults = new ArrayList<>();
    
    for (int i = 0; i < queryVectors.size(); i++) {
        List<JSONObject> rowSet = new ArrayList<>();
        for (QueryResultsWrapper.RowRecord rowRecord: search.getData().getRowRecords(i)) {
            JSONObject object = new JSONObject();
            object.put("id", rowRecord.getFieldValues().get("id"));
            object.put("distance", rowRecord.getFieldValues().get("distance"));
            rowSet.add(object);
        }
        searchResults.add(rowSet);
    };
    
    System.out.println(searchResults);
    
    // Output:
    // [
    //     [
    //         {
    //             "distance": 0,
    //             "id": 1
    //         },
    //         {
    //             "distance": 0.023562228,
    //             "id": 495
    //         },
    //         {
    //             "distance": 0.034179505,
    //             "id": 953
    //         }
    //     ],
    //     [
    //         {
    //             "distance": 0,
    //             "id": 2
    //         },
    //         {
    //             "distance": 0.25061098,
    //             "id": 3
    //         },
    //         {
    //             "distance": 0.36550486,
    //             "id": 841
    //         }
    //     ]
    // ]
    
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 7. Search with multiple vectors
    const query_vectors = [
        [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592], 
        [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
    ]
    
    res = await client.search({
        collection_name: "quick_setup",
        vectors: query_vectors,
        limit: 5,
    })
    
    console.log(res.results)
    
    // Output
    // 
    // [
    //   [
    //     { score: 1.4093276262283325, id: '0' },
    //     { score: 1.1681138277053833, id: '949' },
    //     { score: 1.1286306381225586, id: '257' },
    //     { score: 1.1050969362258911, id: '55' },
    //     { score: 1.0776047706604004, id: '273' }
    //   ],
    //   [
    //     { score: 1.7927448749542236, id: '631' },
    //     { score: 1.7744147777557373, id: '549' },
    //     { score: 1.765260934829712, id: '357' },
    //     { score: 1.7636831998825073, id: '522' },
    //     { score: 1.7498563528060913, id: '740' }
    //   ]
    // ]
    // 
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 9. Search with multiple vectors
    queryVector1 := make(entity.FloatVector, 0, 5)
    queryVector2 := make(entity.FloatVector, 0, 5)
    queryVector1 = append(queryVector1, 0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592)
    queryVector2 = append(queryVector2, 0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104)
    queryVectors = []entity.Vector{}
    queryVectors = append(queryVectors, queryVector1)
    queryVectors = append(queryVectors, queryVector2)
    expr = ""
    outputFields = []string{"id", "color"}
    topK = 3
    
    sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
    search, err = conn.Search(
        context.Background(),    // ctx
        collectionName,          // collection name
        []string{},              // partition names
        expr,                    // expression
        outputFields,            // output fields
        queryVectors,            // query vectors
        "vector",                // target field name
        entity.MetricType("IP"), // metric type
        topK,                    // topK
        sp,                      // search param
    )
    
    if err != nil {
        log.Fatal("Failed to search the data:", err.Error())
    }
    
    fmt.Println(resultsToJSON(search))
    
    // Output: 
    // [
    //  {
    //      "counts": 3,
    //      "distances": [
    //          1.4093276,
    //          1.2094578,
    //          1.1929908
    //      ],
    //      "rows": [
    //          {
    //              "color": "color_black",
    //              "id": 488
    //          },
    //          {
    //              "color": "color_black",
    //              "id": 338
    //          },
    //          {
    //              "color": "color_green",
    //              "id": 160
    //          }
    //      ]
    //  },
    //  {
    //      "counts": 3,
    //      "distances": [
    //          1.8348937,
    //          1.807337,
    //          1.7894672
    //      ],
    //      "rows": [
    //          {
    //              "color": "color_black",
    //              "id": 488
    //          },
    //          {
    //              "color": "color_black",
    //              "id": 338
    //          },
    //          {
    //              "color": "color_green",
    //              "id": 160
    //          }
    //      ]
    //  }
    // ]
    ```

    </TabItem>
    </Tabs>

    The output should be a list of two sub-lists, each of which contains three dictionaries, representing the returned entities with their IDs and distances. 

- __Search with filter expressions using fields defined in the schema.__

    You can also enhance the search result by including a filter and specifying certain output fields in the search request.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 8. Search with a filter expression using schema-defined fields
    # 1 Prepare query vectors
    query_vectors = [
        [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648]
    ]
    
    # 2. Start search
    res = client.search(
        collection_name="quick_setup",
        data=query_vectors,
        filter="500 < id < 800",
        limit=3
    )
    
    print(res)
    
    # Output
    #
    # [
    #     [
    #         {
    #             "id": 548,
    #             "distance": 0.08589144051074982,
    #             "entity": {}
    #         },
    #         {
    #             "id": 736,
    #             "distance": 0.07866684347391129,
    #             "entity": {}
    #         },
    #         {
    #             "id": 505,
    #             "distance": 0.0749310627579689,
    #             "entity": {}
    #         }
    #     ]
    # ]
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 6.5 Prepare query vectors 
    queryVectors.clear();
    queryVectors.add(Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f));
    String filter = "500 < id < 800";
    
    // 6.6 Search data
    searchSimpleParam = SearchSimpleParam.newBuilder()
        .withCollectionName("quick_setup")
        .withVectors(queryVectors)
        .withLimit(3L)
        .withFilter(filter)
        .build();
    
    search = client.search(searchSimpleParam);
    
    searchResults = new ArrayList<>();
    
    for (int i = 0; i < queryVectors.size(); i++) {
        List<JSONObject> rowSet = new ArrayList<>();
        for (QueryResultsWrapper.RowRecord rowRecord: search.getData().getRowRecords(i)) {
            JSONObject object = new JSONObject();
            object.put("id", rowRecord.getFieldValues().get("id"));
            object.put("distance", rowRecord.getFieldValues().get("distance"));
            rowSet.add(object);
        }
        searchResults.add(rowSet);
    };
    
    System.out.println(searchResults);
    
    // Output:
    // [[
    //     {
    //         "distance": 0.83093774,
    //         "id": 550
    //     },
    //     {
    //         "distance": 0.85608006,
    //         "id": 630
    //     },
    //     {
    //         "distance": 0.96230835,
    //         "id": 762
    //     }
    // ]]
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 8. Search with a filter expression using schema-defined fields
    res = await client.search({
        collection_name: "quick_setup",
        vectors: query_vector,
        limit: 5,
        filter: "500 < id < 800",
        output_fields: ["id"]
    })
    
    console.log(res.results)
    
    // Output
    // 
    // [
    //   { score: 1.0726149082183838, id: '596' },
    //   { score: 0.9994362592697144, id: '709' },
    //   { score: 0.9901663064956665, id: '613' },
    //   { score: 0.9756573438644409, id: '722' },
    //   { score: 0.9303033351898193, id: '595' }
    // ]
    // 
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 10. Search with filter expressions using schema-defined fields
    queryVector = make(entity.FloatVector, 0, 5)
    queryVector = append(queryVector, 0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592)
    queryVectors = []entity.Vector{}
    queryVectors = append(queryVectors, queryVector)
    expr = "500 < id < 800"
    outputFields = []string{"id", "color"}
    topK = 3
    
    sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
    search, err = conn.Search(
        context.Background(),    // ctx
        collectionName,          // collection name
        []string{},              // partition names
        expr,                    // expression
        outputFields,            // output fields
        queryVectors,            // query vectors
        "vector",                // target field name
        entity.MetricType("IP"), // metric type
        topK,                    // topK
        sp,                      // search param
    )
    
    if err != nil {
        log.Fatal("Failed to search the data:", err.Error())
    }
    
    fmt.Println(resultsToJSON(search))
    
    // Output: 
    // [
    //  {
    //      "counts": 3,
    //      "distances": [
    //          1.1309906,
    //          1.0854248,
    //          1.0046971
    //      ],
    //      "rows": [
    //          {
    //              "color": "color_brown",
    //              "id": 750
    //          },
    //          {
    //              "color": "color_black",
    //              "id": 771
    //          },
    //          {
    //              "color": "color_black",
    //              "id": 683
    //          }
    //      ]
    //  }
    // ]
    ```

    </TabItem>
    </Tabs>

    The output should be a list containing a sub-list of three dictionaries, each representing a searched entity with its ID, distance, and the specified output fields.

- __Search with filter expressions using a non-schema-defined field.__

    You can also include dynamic fields in a filter expression. In the following code snippet, `color` is a non-schema-defined field. You can include them either as keys in the magic `$meta` field, such as `$meta["color"]`, or directly use it like a schema-defined field, such as `color`.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # 9. Search with a filter expression using custom fields
    # 9.1.Prepare query vectors
    query_vectors = [
        [0.041732933, 0.013779674, -0.027564144, -0.013061441, 0.009748648]
    ]
    
    # 9.2.Start search
    res = client.search(
        collection_name="quick_setup",
        data=query_vectors,
        filter='$meta["color"] like "red%"',
        limit=3,
        output_fields=["color"]
    )
    
    print(res)
    
    # Output
    #
    # [
    #     [
    #         {
    #             "id": 240,
    #             "distance": 0.0694073885679245,
    #             "entity": {
    #                 "color": "red_8667"
    #             }
    #         },
    #         {
    #             "id": 581,
    #             "distance": 0.059804242104291916,
    #             "entity": {
    #                 "color": "red_1786"
    #             }
    #         },
    #         {
    #             "id": 372,
    #             "distance": 0.049707964062690735,
    #             "entity": {
    #                 "color": "red_2186"
    #             }
    #         }
    #     ]
    # ]
    
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 6.7 Search with non-schema-defined fields
    
    filter = "$meta[\"color\"] like \"red%\"";
    List<String> outputFields = Arrays.asList("id", "color");
    
    searchSimpleParam = SearchSimpleParam.newBuilder()
        .withCollectionName("quick_setup")
        .withVectors(queryVectors)
        .withLimit(3L)
        .withFilter(filter)
        .withOutputFields(outputFields)
        .build();
    
    search = client.search(searchSimpleParam);
    
    searchResults = new ArrayList<>();
    
    for (int i = 0; i < queryVectors.size(); i++) {
        List<JSONObject> rowSet = new ArrayList<>();
        for (QueryResultsWrapper.RowRecord rowRecord: search.getData().getRowRecords(i)) {
            JSONObject object = new JSONObject();
            object.put("id", rowRecord.getFieldValues().get("id"));
            object.put("distance", rowRecord.getFieldValues().get("distance"));
            object.put("color", rowRecord.getFieldValues().get("color"));
            rowSet.add(object);
        }
        searchResults.add(rowSet);
    };
    
    System.out.println(searchResults);
    
    // Output:
    // [[
    //     {
    //         "distance": 0.7879871,
    //         "color": "red_2427",
    //         "id": 382
    //     },
    //     {
    //         "distance": 0.99741167,
    //         "color": "red_6226",
    //         "id": 567
    //     },
    //     {
    //         "distance": 1.007118,
    //         "color": "red_7025",
    //         "id": 1
    //     }
    // ]]
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 9. Search with a filter expression using non-schema-defined fields
    res = await client.search({
        collection_name: "quick_setup",
        vectors: query_vector,
        limit: 5,
        filter: '$meta["color"] like "red%"',
        output_fields: ["color"]
    })
    
    console.log(res)
    
    // Output
    // 
    // {
    //   status: {
    //     error_code: 'Success',
    //     reason: '',
    //     code: 0,
    //     retriable: false,
    //     detail: ''
    //   },
    //   results: [
    //     { score: 1.1681138277053833, id: '949', color: 'red_7798' },
    //     { score: 0.9946126937866211, id: '898', color: 'red_7664' },
    //     { score: 0.9902134537696838, id: '4', color: 'red_4794' },
    //     { score: 0.9756573438644409, id: '722', color: 'red_1496' },
    //     { score: 0.931635856628418, id: '916', color: 'red_1816' }
    //   ]
    // }
    // 
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 10. Search with filter expressions using non-schema-defined fields
    queryVector = make(entity.FloatVector, 0, 5)
    queryVector = append(queryVector, 0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, 0.9029438446296592)
    queryVectors = []entity.Vector{}
    queryVectors = append(queryVectors, queryVector)
    expr = "$meta[\"color\"] like \"red%\""
    outputFields = []string{"id", "color"}
    topK = 3
    
    sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
    search, err = conn.Search(
        context.Background(),    // ctx
        collectionName,          // collection name
        []string{},              // partition names
        expr,                    // expression
        outputFields,            // output fields
        queryVectors,            // query vectors
        "vector",                // target field name
        entity.MetricType("IP"), // metric type
        topK,                    // topK
        sp,                      // search param
    )
    
    if err != nil {
        log.Fatal("Failed to search the data:", err.Error())
    }
    
    fmt.Println(resultsToJSON(search))
    
    // Output: 
    // [
    //  {
    //      "counts": 1,
    //      "distances": [
    //          0.8519943
    //      ],
    //      "rows": [
    //          {
    //              "color": "red_7025",
    //              "id": 1
    //          }
    //      ]
    //  }
    // ]
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 9. Conduct a single vector search with filters and output fields
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v1/vector/search" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json" \
        --header "content-type: application/json" \
        -d '{
           "collectionName": "quick_setup",
           "vector": [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231, 0.5785260847050646, -0.054715415380102606, -0.5397764260208828, 0.43017743102321027, 0.9806353568812998, -0.24673180651795223, 0.34881128643815407, -0.32534925835429895, 0.7241025896770166, -0.9310390347090534, -0.00517733162532541, 0.35907388281139796, 0.18688386131011714, -0.8001861303343061, -0.5566607389660039, 0.04377295852369856, 0.8581396389536908, -0.978968045358507, -0.4880334792710488, 0.5358685336203941, -0.7193875502048268, -0.4532291009652729, -0.11581052480270215, 0.10653024983528492, -0.8627130991811947, -0.25257559931666673, -0.5504183627361223],
           "filter": "color like \"red%\"",
           "outputFields": ["color"]
        }'
    ```

    </TabItem>
    </Tabs>

## Scalar Query{#scalar-query}

Unlike a vector similarity search, a query retrieves vectors via scalar filtering based on [filter expressions](https://milvus.io/docs/boolean.md).

- __Query with filter using schema-defined fields__

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 10. Query with a filter expression using a schema-defined field
    res = client.query(
        collection_name="quick_setup",
        filter="10 < id < 15",
        output_fields=["color"]
    )
    
    print(res)
    
    # Output
    #
    # [
    #     {
    #         "color": "green_7413",
    #         "id": 11
    #     },
    #     {
    #         "color": "orange_1417",
    #         "id": 12
    #     },
    #     {
    #         "color": "orange_6143",
    #         "id": 13
    #     },
    #     {
    #         "color": "white_4084",
    #         "id": 14
    #     }
    # ]
    
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.param.highlevel.dml.QuerySimpleParam;
    import io.milvus.response.QueryResultsWrapper;
    
    QuerySimpleParam querySimpleParam = QuerySimpleParam.newBuilder()
        .withCollectionName("quick_setup")
        .withFilter("10 < id < 15")
        .withOutputFields(Arrays.asList("id", "color"))
        .build();
    
    R<QueryResponse> query = client.query(querySimpleParam);
    
    List<JSONObject> queryResults = new ArrayList<>();
    
    for (QueryResultsWrapper.RowRecord rowRecord: query.getData().getRowRecords()) {
        JSONObject object = new JSONObject();
        object.put("id", rowRecord.getFieldValues().get("id"));
        object.put("color", rowRecord.getFieldValues().get("color"));
        queryResults.add(object);
    }
    
    System.out.println(queryResults);
    
    // Output:
    // [
    //     {
    //         "color": "grey_1631",
    //         "id": 11
    //     },
    //     {
    //         "color": "green_7524",
    //         "id": 12
    //     },
    //     {
    //         "color": "black_3071",
    //         "id": 13
    //     },
    //     {
    //         "color": "green_0242",
    //         "id": 14
    //     }
    // ]
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 10. query with schema-defined fields
    res = await client.query({
        collection_name: "quick_setup",
        expr: "id in [0, 1, 2, 3, 4]",
        output_fields: ["id", "color"]  
    })
    
    console.log(res.data)
    
    // Output
    // 
    // [
    //   { id: '0', '$meta': { color: 'pink_8682' } },
    //   { id: '1', '$meta': { color: 'red_7025' } },
    //   { id: '2', '$meta': { color: 'orange_6781' } },
    //   { id: '3', '$meta': { color: 'pink_9298' } },
    //   { id: '4', '$meta': { color: 'red_4794' } }
    // ]
    // 
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 10. Query using schema-defined fields
    expr = "10 < id < 15"
    outputFields = []string{"id", "color"}
    topK = 3
    
    sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
    query, err := conn.Query(
        context.Background(), // ctx
        collectionName,       // collection name
        []string{},           // partition names
        expr,                 // expression
        outputFields,         // output fields
    )
    
    if err != nil {
        log.Fatal("Failed to query the data:", err.Error())
    }
    
    fmt.Println(resultSetToJSON(query, true))
    
    // Output: 
    // [
    //  {
    //      "id": [
    //          11,
    //          12,
    //          13,
    //          14
    //      ]
    //  },
    //  {
    //      "$meta": [
    //          "color_purple",
    //          "color_green",
    //          "color_white",
    //          "color_blue"
    //      ]
    //  }
    // ]
    ```

    </TabItem>
    </Tabs>

- __Query with filter using dynamic fields.__

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # 11. Query with a filter expression using a custom field
    res = client.query(
        collection_name="quick_setup",
        filter='$meta["color"] like "brown_8%"',
        output_fields=["color"],
        limit=5
    )
    
    print(res)
    
    # Output
    #
    # [
    #     {
    #         "color": "brown_8856",
    #         "id": 38
    #     },
    #     {
    #         "color": "brown_8216",
    #         "id": 165
    #     },
    #     {
    #         "color": "brown_8788",
    #         "id": 207
    #     },
    #     {
    #         "color": "brown_8750",
    #         "id": 383
    #     },
    #     {
    #         "color": "brown_8712",
    #         "id": 414
    #     }
    # ]
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    querySimpleParam = QuerySimpleParam.newBuilder()
        .withCollectionName("quick_setup")
        .withFilter("$meta[\"color\"] like \"brown_8%\"")
        .withOutputFields(Arrays.asList("id", "color"))
        .withLimit(5L)
        .build();
    
    query = client.query(querySimpleParam);
    
    queryResults = new ArrayList<>();
    
    for (QueryResultsWrapper.RowRecord rowRecord: query.getData().getRowRecords()) {
        JSONObject object = new JSONObject();
        object.put("id", rowRecord.getFieldValues().get("id"));
        object.put("color", rowRecord.getFieldValues().get("color"));
        queryResults.add(object);
    }
    
    System.out.println(queryResults);
    
    // Output:
    // [
    //     {
    //         "color": "brown_8828",
    //         "id": 171
    //     },
    //     {
    //         "color": "brown_8384",
    //         "id": 226
    //     },
    //     {
    //         "color": "brown_8695",
    //         "id": 227
    //     },
    //     {
    //         "color": "brown_8198",
    //         "id": 390
    //     },
    //     {
    //         "color": "brown_8484",
    //         "id": 392
    //     }
    // ]
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 11. query with non-schema-defined fields
    res = await client.query({
        collection_name: "quick_setup",
        expr: '$meta["color"] like "brown_8%"',
        output_fields: ["color"]
    })
    
    console.log(res.data)
    
    // Output
    // 
    // [
    //   { '$meta': { color: 'brown_8980' }, id: '36' },
    //   { '$meta': { color: 'brown_8005' }, id: '43' },
    //   { '$meta': { color: 'brown_8719' }, id: '181' },
    //   { '$meta': { color: 'brown_8589' }, id: '184' },
    //   { '$meta': { color: 'brown_8335' }, id: '209' },
    //   { '$meta': { color: 'brown_8678' }, id: '280' },
    //   { '$meta': { color: 'brown_8640' }, id: '430' },
    //   { '$meta': { color: 'brown_8032' }, id: '676' },
    //   { '$meta': { color: 'brown_8345' }, id: '692' },
    //   { '$meta': { color: 'brown_8056' }, id: '756' },
    //   { '$meta': { color: 'brown_8906' }, id: '953' }
    // ]
    // 
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 11. Query using schema-defined fields
    expr = "$meta[\"color\"] like \"brown_8%\""
    outputFields = []string{"id", "color"}
    topK = 3
    
    sp, _ = entity.NewIndexAUTOINDEXSearchParam(1)
    
    query, err = conn.Query(
        context.Background(), // ctx
        collectionName,       // collection name
        []string{},           // partition names
        expr,                 // expression
        outputFields,         // output fields
    )
    
    if err != nil {
        log.Fatal("Failed to query the data:", err.Error())
    }
    
    fmt.Println(resultSetToJSON(query, true))
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 10. Conduct a scalar query with filters and output fields
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v1/vector/query" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json" \
        --header "content-type: application/json" \
        -d '{
           "collectionName": "quick_setup",
           "query": "color like \"red%\"",
           "outputFields": ["color"],
           "limit": 3
        }'
    ```

    </TabItem>
    </Tabs>

## Get Entities{#get-entities}

If you know the IDs of the entities to retrieve, you can get entities by their IDs as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"}]}>
<TabItem value='python'>

```python
# 12. Get entities by IDs
res = client.get(
    collection_name="quick_setup",
    ids=[1,2,3],
    output_fields=["title", "vector"]
)

print(res)

# Output
#
# [
#     {
#         "id": 1,
#         "vector": [
#             0.19886813,
#             0.060235605,
#             0.6976963,
#             0.26144746,
#             0.8387295
#         ]
#     },
#     {
#         "id": 2,
#         "vector": [
#             0.43742132,
#             -0.55975026,
#             0.6457888,
#             0.7894059,
#             0.20785794
#         ]
#     },
#     {
#         "id": 3,
#         "vector": [
#             0.3172005,
#             0.97190446,
#             -0.36981148,
#             -0.48608947,
#             0.9579189
#         ]
#     }
# ]
```

</TabItem>

<TabItem value='java'>

```java
// 8. Get entities by IDs

List<Long> ids = Arrays.asList(0L, 1L, 2L, 3L, 4L);

GetIdsParam getIdsParam = GetIdsParam.newBuilder()
    .withCollectionName("quick_setup")
    .withPrimaryIds(ids)
    .withOutputFields(Arrays.asList("id", "vector", "color"))
    .build();

R<GetResponse> get = client.get(getIdsParam);

List<JSONObject> getResults = new ArrayList<>();

for (QueryResultsWrapper.RowRecord entity: get.getData().getRowRecords()) {
    JSONObject object = new JSONObject();
    object.put("id", entity.getFieldValues().get("id"));
    object.put("vector", entity.getFieldValues().get("vector"));
    object.put("color", entity.getFieldValues().get("color"));
    getResults.add(object);
}

System.out.println(getResults);

// Output:
// [
//     {
//         "color": "pink_8682",
//         "vector": [
//             0.35803765,
//             -0.6023496,
//             0.18414013,
//             -0.26286206,
//             0.90294385
//         ],
//         "id": 0
//     },
//     {
//         "color": "red_7025",
//         "vector": [
//             0.19886813,
//             0.060235605,
//             0.6976963,
//             0.26144746,
//             0.8387295
//         ],
//         "id": 1
//     },
//     {
//         "color": "orange_6781",
//         "vector": [
//             0.43742132,
//             -0.55975026,
//             0.6457888,
//             0.7894059,
//             0.20785794
//         ],
//         "id": 2
//     },
//     {
//         "color": "blue_5219",
//         "vector": [
//             0.1622877,
//             -0.19962177,
//             0.52299607,
//             0.79767275,
//             0.3812752
//         ],
//         "id": 3
//     },
//     {
//         "color": "green_3898",
//         "vector": [
//             0.26286206,
//             0.90294385,
//             0.35803765,
//             -0.6023496,
//             0.18414013
//         ],
//         "id": 4
//     }
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 12. Get entities by IDs
res = await client.get({
    collection_name: "quick_setup",
    ids: [0, 1, 2, 3, 4]
})

console.log(res.data)

// Output
// 
// [ { id: '0' }, { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' } ]
// 
```

</TabItem>

<TabItem value='go'>

```go
// 12. Get entity by ID
ids := entity.NewColumnInt64("id", []int64{0, 1, 2, 3, 4})

get, err := conn.Get(
    context.Background(), // ctx
    collectionName,       // collection name
    ids,                  // ids
)

if err != nil {
    log.Fatal("Failed to get the data:", err.Error())
}

fmt.Println(resultSetToJSON(get, true))

```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, the RESTful API does not provide a get endpoint.</p>

</Admonition>

## Delete Entities{#delete-entities}

Zilliz Cloud allows deleting entities by IDs and by filters.

- __Delete entities by IDs.__

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # 13. Delete entities by IDs
    res = client.delete(
        collection_name="quick_setup",
        ids=[0,1,2,3,4]
    )
    
    print(res)
    
    # Output
    #
    # {
    #     "delete_count": 5
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 9. Delete entities by IDs
    
    DeleteIdsParam deleteIdsParam = DeleteIdsParam.newBuilder()
        .withCollectionName("quick_setup")
        .withPrimaryIds(ids)
        .build();
    
    R<DeleteResponse> deleteByIds = client.delete(deleteIdsParam);
    
    System.out.println("Delete Operation Status: " + deleteByIds.getStatus());
    
    // Output:
    // Delete Operation Status: 0
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 13. Delete entities by IDs
    res = await client.deleteEntities({
        collection_name: "quick_setup",
        expr: "id in [5, 6, 7, 8, 9]"
    })
    
    console.log(res)
    
    // Output
    // 
    // {
    //   succ_index: [],
    //   err_index: [],
    //   status: {
    //     error_code: 'Success',
    //     reason: '',
    //     code: 0,
    //     retriable: false,
    //     detail: ''
    //   },
    //   IDs: {},
    //   acknowledged: false,
    //   insert_cnt: '0',
    //   delete_cnt: '5',
    //   upsert_cnt: '0',
    //   timestamp: '0'
    // }
    // 
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 13. Delete entities by ID
    ids = entity.NewColumnInt64("id", []int64{0, 1, 2, 3, 4})
    
    err = conn.DeleteByPks(
        context.Background(), // ctx
        collectionName,       // collection name
        "",                   // partition names
        ids,                  // ids
    )
    
    if err != nil {
        log.Fatal("Failed to delete the data:", err.Error())
    }
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 12. Delete entities by IDs
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json" \
        --header "content-type: application/json" \
        -d "{
           \"collectionName\": \"quick_setup\",
           \"id\": ${IDs},
        }"
    ```

    </TabItem>
    </Tabs>

- __Delete entities by filter__

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"}]}>
    <TabItem value='python'>

    ```python
    # 14. Delete entities by a filter expression
    res = client.delete(
        collection_name="quick_setup",
        filter="id in [5,6,7,8,9]"
    )
    
    print(res)
    
    # Output
    #
    # {
    #     "delete_count": 5
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 9. Delete entities by Filter
    
    DeleteParam deleteParam = DeleteParam.newBuilder()
        .withCollectionName("quick_setup")
        .withExpr("id in [5, 6, 7, 8, 9]")
        .build();
    
    R<MutationResult> deleteByFilter = client.delete(deleteParam);
    
    System.out.println("Delete Counts: " + new MutationResultWrapper(deleteByFilter.getData()).getDeleteCount());
    
    // Output:
    // Delete Counts: 5
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 14. Delete entities by filter
    res = await client.delete({
        collection_name: "quick_setup",
        ids: [0, 1, 2, 3, 4]
    })
    
    console.log(res)
    
    // Output
    // 
    // {
    //   succ_index: [],
    //   err_index: [],
    //   status: {
    //     error_code: 'Success',
    //     reason: '',
    //     code: 0,
    //     retriable: false,
    //     detail: ''
    //   },
    //   IDs: {},
    //   acknowledged: false,
    //   insert_cnt: '0',
    //   delete_cnt: '5',
    //   upsert_cnt: '0',
    //   timestamp: '0'
    // }
    // 
    ```

    </TabItem>

    <TabItem value='go'>

    ```go
    // 13. Delete entities by filter expressions
    expr = "id in [5,6,7,8,9]"
    
    err = conn.Delete(
        context.Background(), // ctx
        collectionName,       // collection name
        "",                   // partition names
        expr,                 // expression
    )
    ```

    </TabItem>
    </Tabs>

    <Admonition type="info" icon="📘" title="Notes">

    <p>Currently, the delete endpoint of the RESTful API does not support filters.</p>

    </Admonition>

## Drop the collection{#drop-the-collection}

The Starter plan allows up to two collections in the serverless cluster. Once you have done this guide, you can drop the collection as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
client.drop_collection(
    collection_name="quick_setup"
)
```

</TabItem>

<TabItem value='java'>

```java
// 8. Drop collection

DropCollectionParam dropCollectionParam = DropCollectionParam.newBuilder()
    .withCollectionName("quick_setup")
    .build();

R<RpcStatus> drop = client.dropCollection(dropCollectionParam);

System.out.println("Drop Collection Status: " + drop.getStatus());

// Output:
// Drop Collection Status: 0
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 15. Drop the collection
res = await client.dropCollection({
    collection_name: "quick_setup"
})

console.log(res)

// Output
// 
// {
//   error_code: 'Success',
//   reason: '',
//   code: 0,
//   retriable: false,
//   detail: ''
// }
// 
```

</TabItem>

<TabItem value='go'>

```go
// 14. Drop the collection
err = conn.DropCollection(
    context.Background(), // ctx
    collectionName,       // collection name
)

if err != nil {
    log.Fatal("Failed to drop the collection:", err.Error())
}

fmt.Println("Collection dropped")

// Output:
//
// Collection dropped
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/collections/drop" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    --data-raw '{
        "collectionName": "quick_setup"
    }'
```

</TabItem>
</Tabs>

## Recaps{#recaps}

- There are two ways to create a collection. The first is the quick setup, which only requires you to provide a name and the dimension of the vector field. The second is the customized setup, which allows you to customize almost every aspect of the collection.

- The data insertion process may take some time to complete. It is recommended to wait a few seconds after inserting data and before conducting similarity searches.

- Filter expressions can be used in both search and query requests. However, they are mandatory for query requests.

