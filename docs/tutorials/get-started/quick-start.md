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

    On the [Starter plan](./select-zilliz-cloud-service-plans#select-a-cluster-plan), you can own a free serverless cluster with up to two collections to run small applications. Although not all advanced features are included in the Starter plan, [it is easy to upgrade](./manage-cluster#migrate-to-dedicated-cluster) when you are ready.

- You can click the __Open in Colab__ button above if you prefer to start right away in the browser.

## Install an SDK{#install-an-sdk}

Zilliz Cloud supports the Milvus SDKs and all [RESTful API endpoints](/reference/restful/cloud-meta). You can use the RESTful API directly, or choose one of the following SDKs to start with:

- [Install the Python SDK.](./install-sdks#install-pymilvus-python-sdk)

- [Install the Java SDK.](./install-sdks#install-java-sdk)

- [Install the Go SDK.](./install-sdks#install-go-sdk)

- [Install the Node.js SDK.](./install-sdks#install-nodejs-sdk)

## Create a Cluster{#create-a-cluster}

You can create a cluster with the subscription plan of your choice using either the RESTful API endpoints or on the Zilliz Cloud console.

The following demonstrates how to create a serverless cluster using the RESTful API.

```bash
curl --request POST \
    --url "https://controller.api.${CLOUD_REGION}.cloud-uat3.zilliz.com/v1/clusters/createServerless" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    --data-raw "{
        \"clusterName\": \"cluster-starter\",
        \"projectId\": \"${PROJECT_ID}\"
    }"
```

The following demonstrates how to create a  cluster using the RESTful API.

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

<Admonition type="info" icon="📘" title="Notes">

<p>You have to add a payment method before you can create a dedicated cluster.</p>

</Admonition>

To obtain the cloud region, API key, and project ID, refer to [On Zilliz Cloud Console](./on-zilliz-cloud-console). If you prefer to create a serverless cluster on the Zilliz Cloud console, refer to [Create Cluster](./create-cluster).

Once your cluster is running, you will be prompted with the [cluster credentials](./cluster-credentials) for once. Download and save it in a safe place. You will need it to connect to your cluster later.

Alternatively, you can [create an API key](./manage-api-keys) instead of using the cluster credentials for the connection.

## Connect to Zilliz Cloud cluster{#connect-to-zilliz-cloud-cluster}

Once you have obtained the cluster credentials or an API key, you can use it to connect to your cluster now.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT"
TOKEN = "YOUR_CLUSTER_TOKEN"

# 1. Set up a Milvus client
client = MilvusClient(
    uri=CLUSTER_ENDPOINT,
    token=TOKEN 
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.client.ConnectConfig;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_CLUSTER_TOKEN";

// 1. Connect to Milvus server
ConnectConfig connectConfig = ConnectConfig.builder()
    .uri(CLUSTER_ENDPOINT)
    .token(TOKEN)
    .build();

MilvusClientV2 client = new MilvusClientV2(connectConfig);
```

</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient, DataType, sleep } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"

// 1. Connect to the cluster
const client = new MilvusClient({address, token})
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>Due to language differences, you should <strong>include your code in the main function</strong> if you prefer to code in <strong>Java</strong> or <strong>Node.js</strong>.</p>

</Admonition>

## Create a Collection{#create-a-collection}

On Zilliz Cloud, you need to store your vector embeddings in collections. All vector embeddings stored in a collection share the same dimensionality and distance metric for measuring similarity. You can create a collection in either of the following manners.

### Quick setup{#quick-setup}

To set up a collection in quick setup mode, you only need to set the collection name and the dimension of the vector field of the collection.

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
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 2. Create a collection in quick setup mode
CreateCollectionReq quickSetupReq = CreateCollectionReq.builder()
    .collectionName("quick_setup")
    .dimension(5)
    .build();

client.createCollection(quickSetupReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 2. Create a collection
await client.createCollection({
    collection_name: "quick_setup",
    dimension: 5,
});  
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
```

</TabItem>
</Tabs>

In the above setup, 

- The primary and vector fields use their default names (__id__ and __vector__).

- The metric type is also set to its default value (__COSINE__).

- The primary field accepts integers and does not automatically increments.

- A reserved JSON field named __$meta__ is used to store non-schema-defined fields and their values.

<Admonition type="info" icon="📘" title="Notes">

<p>Collections created using the RESTful API supports a minimum of 32-dimensional vector field.</p>

</Admonition>

### Customized setup{#customized-setup}

To define the collection schema by yourself, use the customized setup. In this manner, you can define the attributes of each field in the collection, including its name, data type, and extra attributes of a specific field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
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
    field_name="my_id"
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
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 3. Create a collection in customized setup mode

// 3.1 Craete schema
CreateCollectionReq.CollectionSchema schema = client.createSchema(false, "");

// 3.2 Add fields to schema
schema.addPrimaryField("my_id", DataType.Int64, true, false);
schema.addVectorField("my_vector", DataType.FloatVector, 5);

// 3.3 Prepare index parameters
IndexParam indexParamForIdField = IndexParam.builder()
    .fieldName("my_id")
    .indexType(IndexParam.IndexType.STL_SORT)
    .build();

IndexParam indexParamForVectorField = IndexParam.builder()
    .fieldName("my_vector")
    .indexType(IndexParam.IndexType.AUTOINDEX)
    .metricType(IndexParam.MetricType.IP)
    .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForIdField);
indexParams.add(indexParamForVectorField);

// 3.4 Create a collection with schema and index parameters
CreateCollectionReq customizedSetupReq = CreateCollectionReq.builder()
    .collectionName("customized_setup")
    .collectionSchema(schema)
    .indexParams(indexParams)
    .build();

client.createCollection(customizedSetupReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3. Create a collection in customized setup mode
// 3.1 Define fields
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

// 3.2 Prepare index parameters
const index_params = [{
    field_name: "my_vector",
    index_type: "IVF_FLAT",
    metric_type: "IP",
    params: { nlist: 1024}
}]

// 3.3 Create a collection with fields and index parameters
await client.createCollection({
    collection_name: "customized_setup",
    fields: fields,
    index_params: index_params,
})
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
```

</TabItem>
</Tabs>

In the above setup, you have the flexibility to define various aspects of the collection during its creation, including its schema and index parameters.

- __Schema__

    The schema defines the structure of a collection. Except for adding pre-defined fields and setting their attributes as demonstrated above, you have the option of enabling and disabling

    - __AutoID__

        Whether to enable the collection to automatically increment the primary field.

    - __Dynamic Field__

        Whether to use the reserved JSON field __$meta__ to store non-schema-defined fields and their values. 

     For a detailed explanation of the schema, refer to [Schema Explained](./schema-explained).

- __Index parameters__

    Index parameters dictate how Zilliz Cloud organizes your data within a collection. You can assign specific indexes to fields by configuring their __metric types__ and __index types__. 

    - For the vector field, you can use __AUTOINDEX__ as the index type and use __COSINE__, __L2__, or __IP__ as the `metric_type`.

    - For scalar fields, including the primary field, Zilliz Cloud uses __TRIE__ for integers and __STL_SORT__ for strings.

    For additional insights into index types, refer to[AUTOINDEX Explained](./autoindex-explained).

<Admonition type="info" icon="📘" title="Notes">

<p>The collection created in the preceding code snippets are automatically loaded. If you prefer not to create an automatically loaded collection, refer to <a href="./manage-collections-sdks#step-3-create-the-collection">Manage Collections (SDKs)</a>.</p>
<p>Collections created using the RESTful API are always automatically loaded.</p>

</Admonition>

## Insert Data{#insert-data}

Collections created in either of the preceding ways have been indexed and loaded. Once you are ready, insert some example data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
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
#     "insert_count": 10,
#     "ids": [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
# }
```

</TabItem>

<TabItem value='java'>

```java
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.Random;
import java.util.Arrays;
import com.alibaba.fastjson.JSONObject;

import io.milvus.v2.service.vector.request.InsertReq;
import io.milvus.v2.service.vector.response.InsertResp;

// 4. Insert data into the collection

// 4.1. Prepare data

List<JSONObject> insertData = Arrays.asList(
    new JSONObject(Map.of("id", 0L, "vector", Arrays.asList(0.3580376395471989f, -0.6023495712049978f, 0.18414012509913835f, -0.26286205330961354f, 0.9029438446296592f), "color", "pink_8682")),
    new JSONObject(Map.of("id", 1L, "vector", Arrays.asList(0.19886812562848388f, 0.06023560599112088f, 0.6976963061752597f, 0.2614474506242501f, 0.838729485096104f), "color", "red_7025")),
    new JSONObject(Map.of("id", 2L, "vector", Arrays.asList(0.43742130801983836f, -0.5597502546264526f, 0.6457887650909682f, 0.7894058910881185f, 0.20785793220625592f), "color", "orange_6781")),
    new JSONObject(Map.of("id", 3L, "vector", Arrays.asList(0.3172005263489739f, 0.9719044792798428f, -0.36981146090600725f, -0.4860894583077995f, 0.95791889146345f), "color", "pink_9298")),
    new JSONObject(Map.of("id", 4L, "vector", Arrays.asList(0.4452349528804562f, -0.8757026943054742f, 0.8220779437047674f, 0.46406290649483184f, 0.30337481143159106f), "color", "red_4794")),
    new JSONObject(Map.of("id", 5L, "vector", Arrays.asList(0.985825131989184f, -0.8144651566660419f, 0.6299267002202009f, 0.1206906911183383f, -0.1446277761879955f), "color", "yellow_4222")),
    new JSONObject(Map.of("id", 6L, "vector", Arrays.asList(0.8371977790571115f, -0.015764369584852833f, -0.31062937026679327f, -0.562666951622192f, -0.8984947637863987f), "color", "red_9392")),
    new JSONObject(Map.of("id", 7L, "vector", Arrays.asList(-0.33445148015177995f, -0.2567135004164067f, 0.8987539745369246f, 0.9402995886420709f, 0.5378064918413052f), "color", "grey_8510")),
    new JSONObject(Map.of("id", 8L, "vector", Arrays.asList(0.39524717779832685f, 0.4000257286739164f, -0.5890507376891594f, -0.8650502298996872f, -0.6140360785406336f), "color", "white_9381")),
    new JSONObject(Map.of("id", 9L, "vector", Arrays.asList(0.5718280481994695f, 0.24070317428066512f, -0.3737913482606834f, -0.06726932177492717f, -0.6980531615588608f), "color", "purple_4976"))
);

// 4.2. Insert data

InsertReq insertReq = InsertReq.builder()
    .collectionName("quick_setup")
    .data(insertData)
    .build();

InsertResp res = client.insert(insertReq);

System.out.println(JSONObject.toJSON(res));

// Output:
// {"insertCnt": 10}
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
//   timestamp: '448166012849487874'
// }
// 
```

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
```

</TabItem>
</Tabs>

The provided code assumes that you have created a collection in the __Quick Setup__ manner. As shown in the above code, 

- The data to insert is organized into a list of dictionaries, where each dictionary represents a data record, termed as an entity.

- Each dictionary contains a non-schema-defined field named __color__.

- Each dictionary contains the keys corresponding to both pre-defined and dynamic fields.

<Admonition type="info" icon="📘" title="Notes">

<p>Collections created using RESTful API enabled AutoID, and therefore you need to skip the primary field in the data to insert.</p>

</Admonition>

### Insert more data{#insert-more-data}

You can safely skip this section if you prefer to search with the inserted 10 entities later. To learn more about the search performance of Zilliz Cloud clusters, you are advised use the following code snippet to add more randomly generated entities into the collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
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

<Admonition type="info" icon="📘" title="Notes">

<p>You can insert a maximum of 100 entities in a batch upon each call to the Insert RESTful API.</p>

</Admonition>

## Similarity Search{#similarity-search}

You can conduct similarity searches based on one or more vector embeddings.

<Admonition type="info" icon="📘" title="Notes">

<p>The insert operations are asynchronous, and conducting a search immediately after data insertions may result in empty result set. To avoid this, you are advised to wait for a few seconds.</p>

</Admonition>

### Single-vector search{#single-vector-search}

The value of the __query_vectors__ variable is a list containing a sub-list of floats. The sub-list represents a vector embedding of 5 dimensions. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
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
import io.milvus.v2.service.vector.request.SearchReq;
import io.milvus.v2.service.vector.response.SearchResp;

// 6. Search with a single vector

List<List<Float>> singleVectorSearchData = new ArrayList<>();
singleVectorSearchData.add(Arrays.asList(0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f));

SearchReq searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(singleVectorSearchData)
    .topK(3)
    .build();

SearchResp singleVectorSearchRes = client.search(searchReq);

System.out.println(JSONObject.toJSON(singleVectorSearchRes));

// Output:
// {"searchResults": [[
//     {
//         "score": 0.05251121,
//         "fields": {
//             "vector": [
//                 0.3172005,
//                 0.97190446,
//                 -0.36981148,
//                 -0.48608947,
//                 0.9579189
//             ],
//             "id": 3
//         }
//     },
//     {
//         "score": 0.052370064,
//         "fields": {
//             "vector": [
//                 0.98410434,
//                 0.7426865,
//                 0.036831677,
//                 0.53017783,
//                 0.92388684
//             ],
//             "id": 256
//         }
//     },
//     {
//         "score": 0.05131025,
//         "fields": {
//             "vector": [
//                 0.9631593,
//                 0.9327511,
//                 0.0035189986,
//                 0.3523348,
//                 0.30371177
//             ],
//             "id": 365
//         }
//     }
// ]]}
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
//   { score: 0, id: '0' },
//   { score: 0.6279634237289429, id: '956' },
//   { score: 0.6972740292549133, id: '770' },
//   { score: 0.731235682964325, id: '127' },
//   { score: 0.7537508010864258, id: '734' }
// ]
// 
```

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

### Bulk-vector search{#bulk-vector-search}

You can also include multiple vector embeddings in the __query_vectors__ variable to conduct a batch similarity search.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
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
// 7. Search with multiple vectors
List<List<Float>> multiVectorSearchData = new ArrayList<>();
multiVectorSearchData.add(Arrays.asList(0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f));
multiVectorSearchData.add(Arrays.asList(0.0039737443f, 0.003020432f, -0.0006188639f, 0.03913546f, -0.00089768134f));

searchReq = SearchReq.builder()
    .collectionName("quick_setup")
    .data(multiVectorSearchData)
    .topK(3)
    .build();

SearchResp multiVectorSearchRes = client.search(searchReq);

System.out.println(JSONObject.toJSON(multiVectorSearchRes));

// Output:
// {"searchResults": [
//     [
//         {
//             "score": 0.05251121,
//             "fields": {
//                 "vector": [
//                     0.3172005,
//                     0.97190446,
//                     -0.36981148,
//                     -0.48608947,
//                     0.9579189
//                 ],
//                 "id": 3
//             }
//         },
//         {
//             "score": 0.052370064,
//             "fields": {
//                 "vector": [
//                     0.98410434,
//                     0.7426865,
//                     0.036831677,
//                     0.53017783,
//                     0.92388684
//                 ],
//                 "id": 256
//             }
//         },
//         {
//             "score": 0.05131025,
//             "fields": {
//                 "vector": [
//                     0.9631593,
//                     0.9327511,
//                     0.0035189986,
//                     0.3523348,
//                     0.30371177
//                 ],
//                 "id": 365
//             }
//         }
//     ],
//     [
//         {
//             "score": 0.044228386,
//             "fields": {
//                 "vector": [
//                     0.8481157,
//                     0.87862474,
//                     0.89253455,
//                     0.99449104,
//                     0.18173677
//                 ],
//                 "id": 889
//             }
//         },
//         {
//             "score": 0.044011116,
//             "fields": {
//                 "vector": [
//                     0.8525959,
//                     0.8243295,
//                     0.17058581,
//                     0.9792657,
//                     0.094860196
//                 ],
//                 "id": 303
//             }
//         },
//         {
//             "score": 0.04321113,
//             "fields": {
//                 "vector": [
//                     0.7514371,
//                     0.86968124,
//                     0.3645497,
//                     0.9844346,
//                     0.7824564
//                 ],
//                 "id": 379
//             }
//         }
//     ]
// ]}

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
//     { score: 0, id: '0' },
//     { score: 0.6279634237289429, id: '956' },
//     { score: 0.6972740292549133, id: '770' },
//     { score: 0.731235682964325, id: '127' },
//     { score: 0.7537508010864258, id: '734' }
//   ],
//   [
//     { score: 0, id: '1' },
//     { score: 0.026617102324962616, id: '217' },
//     { score: 0.026979688555002213, id: '111' },
//     { score: 0.04925869405269623, id: '287' },
//     { score: 0.05548785999417305, id: '893' }
//   ]
// ]
// 
```

</TabItem>
</Tabs>

The output should be a list of two sub-lists, each of which contains three dictionaries, representing the returned entities with their IDs and distances. 

### Filtered searches{#filtered-searches}

- __With schema-defined fields__

    You can also enhance the search result by including a filter and specifying certain output fields in the search request.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
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
    // 8. Search with a filter expression using schema-defined fields
    List<List<Float>> filteredVectorSearchData = new ArrayList<>();
    filteredVectorSearchData.add(Arrays.asList(0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f));
    
    searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(filteredVectorSearchData)
        .filter("500 < id < 800")
        .topK(3)
        .build();
    
    SearchResp filteredVectorSearchRes = client.search(searchReq);
    
    System.out.println(JSONObject.toJSON(filteredVectorSearchRes));
    
    // Output:
    // {"searchResults": [[
    //     {
    //         "score": 0.048790313,
    //         "fields": {
    //             "vector": [
    //                 0.9454012,
    //                 0.8308198,
    //                 0.27438205,
    //                 0.061423004,
    //                 0.64141226
    //             ],
    //             "id": 507
    //         }
    //     },
    //     {
    //         "score": 0.048747763,
    //         "fields": {
    //             "vector": [
    //                 0.9759776,
    //                 0.8752648,
    //                 0.16059041,
    //                 0.30487162,
    //                 0.4477638
    //             ],
    //             "id": 523
    //         }
    //     },
    //     {
    //         "score": 0.043513775,
    //         "fields": {
    //             "vector": [
    //                 0.97607815,
    //                 0.5138794,
    //                 0.12614381,
    //                 0.2045728,
    //                 0.18947655
    //             ],
    //             "id": 619
    //         }
    //     }
    // ]]}
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
    //   { score: 0.6972740292549133, id: '770' },
    //   { score: 0.7537508010864258, id: '734' },
    //   { score: 0.7619715332984924, id: '586' },
    //   { score: 0.7646334171295166, id: '698' },
    //   { score: 0.8964425921440125, id: '585' }
    // ]
    //  
    ```

    </TabItem>
    </Tabs>

    The output should be a list containing a sub-list of three dictionaries, each representing a searched entity with its ID, distance, and the specified output fields.

- __With non-schema-defined fields__

    You can also include dynamic fields in a filter expression. In the following code snippet, `color` is a non-schema-defined field. You can include them either as keys in the magic `$meta` field, such as `$meta["color"]`, or directly use it like a schema-defined field, such as `color`.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
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
    // 9. Search with a filter expression using custom fields
    List<List<Float>> customFilteredVectorSearchData = new ArrayList<>();
    customFilteredVectorSearchData.add(Arrays.asList(0.041732933f, 0.013779674f, -0.027564144f, -0.013061441f, 0.009748648f));
    
    searchReq = SearchReq.builder()
        .collectionName("quick_setup")
        .data(customFilteredVectorSearchData)
        .filter("$meta[\"color\"] like \"red%\"")
        .topK(3)
        .outputFields(Arrays.asList("color"))
        .build();
    
    SearchResp customFilteredVectorSearchRes = client.search(searchReq);
    
    System.out.println(JSONObject.toJSON(customFilteredVectorSearchRes));
    
    // Output:
    // {"searchResults": [[
    //     {
    //         "score": 0.048747763,
    //         "fields": {"color": "red_6571"}
    //     },
    //     {
    //         "score": 0.04689868,
    //         "fields": {"color": "red_3471"}
    //     },
    //     {
    //         "score": 0.046139073,
    //         "fields": {"color": "red_8272"}
    //     }
    // ]]}
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
    //     { score: 1.0071179866790771, id: '1', color: 'red_7025' },
    //     { score: 1.2565785646438599, id: '737', color: 'red_6152' },
    //     { score: 1.2968990802764893, id: '678', color: 'red_8746' },
    //     { score: 1.3497979640960693, id: '144', color: 'red_2888' },
    //     { score: 1.3581382036209106, id: '574', color: 'red_2877' }
    //   ]
    // }
    // 
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

- __With filter using schema-defined fields__

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
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
    import io.milvus.v2.service.vector.request.QueryReq;
    import io.milvus.v2.service.vector.response.QueryResp;
    
    // 10. Query with filter using schema-defined fields
    QueryReq queryReq = QueryReq.builder()
        .collectionName("quick_setup")
        .filter("10 < id < 15")
        .limit(5)
        .build();
    
    QueryResp queryRes = client.query(queryReq);
    
    System.out.println(JSONObject.toJSON(queryRes));
    
    // Output:
    // {"queryResults": [
    //     {"fields": {
    //         "vector": [
    //             0.5905076,
    //             0.91603523,
    //             0.5313443,
    //             0.40084702,
    //             0.9552809
    //         ],
    //         "id": 11
    //     }},
    //     {"fields": {
    //         "vector": [
    //             0.9673571,
    //             0.27244568,
    //             0.9686751,
    //             0.70798296,
    //             0.8697661
    //         ],
    //         "id": 12
    //     }},
    //     {"fields": {
    //         "vector": [
    //             0.1426422,
    //             0.029041886,
    //             0.5726654,
    //             0.6437685,
    //             0.3182432
    //         ],
    //         "id": 13
    //     }},
    //     {"fields": {
    //         "vector": [
    //             0.4762795,
    //             0.39644545,
    //             0.7544444,
    //             0.6410805,
    //             0.40819722
    //         ],
    //         "id": 14
    //     }}
    // ]}
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
    </Tabs>

- __With filter using non-schema-defined fields.__

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
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
    // 11. Query with filter using custom fields
    QueryReq customQueryReq = QueryReq.builder()
        .collectionName("quick_setup")
        .filter("$meta[\"color\"] like \"brown_8%\"")
        .outputFields(Arrays.asList("color"))
        .limit(5)
        .build();
    
    QueryResp customQueryRes = client.query(customQueryReq);
    
    System.out.println(JSONObject.toJSON(customQueryRes));
    
    // Output:
    // {"queryResults": [
    //     {"fields": {
    //         "color": "brown_8221",
    //         "id": 22
    //     }},
    //     {"fields": {
    //         "color": "brown_8615",
    //         "id": 78
    //     }},
    //     {"fields": {
    //         "color": "brown_8494",
    //         "id": 123
    //     }},
    //     {"fields": {
    //         "color": "brown_8327",
    //         "id": 176
    //     }},
    //     {"fields": {
    //         "color": "brown_8943",
    //         "id": 178
    //     }}
    // ]}
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
    //   { '$meta': { color: 'brown_8018' }, id: '14' },
    //   { '$meta': { color: 'brown_8172' }, id: '178' },
    //   { '$meta': { color: 'brown_8400' }, id: '357' },
    //   { '$meta': { color: 'brown_8363' }, id: '541' },
    //   { '$meta': { color: 'brown_8655' }, id: '626' },
    //   { '$meta': { color: 'brown_8135' }, id: '629' },
    //   { '$meta': { color: 'brown_8661' }, id: '941' }
    // ]
    //
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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
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
import io.milvus.v2.service.vector.request.GetReq;
import io.milvus.v2.service.vector.response.GetResp;

// 12. Get entities by IDs
GetReq getReq = GetReq.builder()
    .collectionName("quick_setup")
    .ids(Arrays.asList(0L, 1L, 2L))
    .build();

GetResp getRes = client.get(getReq);

System.out.println(JSONObject.toJSON(getRes));

// Output:
// {"getResults": [
//     {"fields": {
//         "vector": [
//             0.35803765,
//             -0.6023496,
//             0.18414013,
//             -0.26286206,
//             0.90294385
//         ],
//         "id": 0
//     }},
//     {"fields": {
//         "vector": [
//             0.19886813,
//             0.060235605,
//             0.6976963,
//             0.26144746,
//             0.8387295
//         ],
//         "id": 1
//     }},
//     {"fields": {
//         "vector": [
//             0.43742132,
//             -0.55975026,
//             0.6457888,
//             0.7894059,
//             0.20785794
//         ],
//         "id": 2
//     }}
// ]}
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 12. Get entities by IDs
res = await client.get({
    collection_name: "quick_setup",
    ids: [0, 1, 2, 3, 4],
    output_fields: ["vector"]
})

console.log(res.data)

// Output
// 
// [
//   {
//     vector: [
//       0.35803765058517456,
//       -0.602349579334259,
//       0.1841401308774948,
//       -0.26286205649375916,
//       0.9029438495635986
//     ],
//     id: '0'
//   },
//   {
//     vector: [
//       0.19886812567710876,
//       0.060235604643821716,
//       0.697696328163147,
//       0.2614474594593048,
//       0.8387295007705688
//     ],
//     id: '1'
//   },
//   {
//     vector: [
//       0.4374213218688965,
//       -0.5597502589225769,
//       0.6457887887954712,
//       0.789405882358551,
//       0.20785793662071228
//     ],
//     id: '2'
//   },
//   {
//     vector: [
//       0.31720051169395447,
//       0.971904456615448,
//       -0.369811475276947,
//       -0.48608946800231934,
//       0.9579188823699951
//     ],
//     id: '3'
//   },
//   {
//     vector: [
//       0.4452349543571472,
//       -0.8757026791572571,
//       0.8220779299736023,
//       0.46406289935112,
//       0.3033747971057892
//     ],
//     id: '4'
//   }
// ]
// 
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json" \
    -d '{
       "collectionName": "quick_setup",
       "query": "color like \"red%\"",
       "outputFields": ["color"],
       "id": [0,1,2]
    }'
```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, the RESTful API does not provide a get endpoint.</p>

</Admonition>

## Delete Entities{#delete-entities}

Zilliz Cloud allows deleting entities by IDs and by filters.

- __Delete entities by IDs.__

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Bash","value":"bash"}]}>
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
    import io.milvus.v2.service.vector.request.DeleteReq;
    import io.milvus.v2.service.vector.response.DeleteResp;
    
    // 13. Delete entities by IDs
    DeleteReq deleteReq = DeleteReq.builder()
        .collectionName("quick_setup")
        .ids(Arrays.asList(0L, 1L, 2L, 3L, 4L))
        .build();
    
    DeleteResp deleteRes = client.delete(deleteReq);
    
    System.out.println(JSONObject.toJSON(deleteRes));
    
    // Output:
    // {"deleteCnt": 5}
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 13. Delete entities by IDs
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
           \"id\": [0,1,2,3,4],
        }"
    ```

    </TabItem>
    </Tabs>

- __Delete entities by filter__

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
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
    // 14. Delete entities by filter
    DeleteReq filterDeleteReq = DeleteReq.builder()
        .collectionName("quick_setup")
        .filter("id in [5, 6, 7, 8, 9]")
        .build();
    
    DeleteResp filterDeleteRes = client.delete(filterDeleteReq);
    
    System.out.println(JSONObject.toJSON(filterDeleteRes));
    
    // Output:
    // {"deleteCnt": 5}
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 14. Delete entities by filter
    res = await client.deleteEntities({
        collection_name: "quick_setup",
        expr: "id in [5, 6, 7, 8, 9]",
        output_fields: ["vector"]
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
    </Tabs>

    <Admonition type="info" icon="📘" title="Notes">

    <p>Currently, the delete endpoint of the RESTful API does not support filters.</p>

    </Admonition>

## Drop the collection{#drop-the-collection}

The Starter plan allows up to two collections in the serverless cluster. Once you have done this guide, you can drop the collection as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"Go","value":"go"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

```python
# 15. Drop collection
client.drop_collection(
    collection_name="quick_setup"
)

client.drop_collection(
    collection_name="customized_setup"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.DropCollectionReq;

// 15. Drop collections
DropCollectionReq dropQuickSetupParam = DropCollectionReq.builder()
    .collectionName("quick_setup")
    .build();

client.dropCollection(dropQuickSetupParam);

DropCollectionReq dropCustomizedSetupParam = DropCollectionReq.builder()
    .collectionName("customized_setup")
    .build();

client.dropCollection(dropCustomizedSetupParam);
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

res = await client.dropCollection({
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

