---
title: "Quickstart | BYOC"
slug: /quick-start
sidebar_label: "Quickstart"
beta: FALSE
notebook: FALSE
description: "This guide explains how to set up your Zilliz Cloud cluster and perform CRUD operations in minutes. | BYOC"
type: origin
token: GQN0wDCrni4n36kyeVQcF41Lned
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - quickstart
  - cloud
  - milvus
  - Machine Learning
  - RAG
  - NLP
  - Neural Network

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart

This guide explains how to set up your Zilliz Cloud cluster and perform CRUD operations in minutes.

## Before you start{#before-you-start}

Zilliz Cloud provides a Bring-Your-Own-Cloud (BYOC) solution, allowing organizations to host applications and data in their own cloud accounts instead of using Zilliz Cloud's infrastructure. For details about our BYOC solution, read [BYOC Overview](./byoc-intro).

The following figure illustrates the procedures to start using our BYOC solution.

![ChT3woJqYhkzj1bipPxcXNZrnbc](/byoc/ChT3woJqYhkzj1bipPxcXNZrnbc.png)

Before going through this quick start, ensure that:

- You have registered an account with Zilliz Cloud. 

    For instructions, refer to [Register with Zilliz Cloud](./register-with-zilliz-cloud).

- You have contacted Zilliz Cloud sales and provided your account to us.

    <Admonition type="info" icon="📘" title="Notes">

    <p>Currently, Zilliz BYOC is in <strong>Private Preview</strong>. To participate in the trial, contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

    </Admonition>

- You have created a project in the BYOC organization and deployed the data plane infrastructure for the project.

    Zilliz BYOC operates within your Virtual Private Cloud (VPC), requiring you to initiate the deployment of data plane components. You can deploy the data plane in your VPCs hosted on the following cloud providers:

    - [Deploy BYOC on AWS](./deploy-byoc-aws)

    If your cloud provider is not available above, contact [Zilliz Cloud support](https://zilliz.com/contact-sales).

## Install an SDK{#install-an-sdk}

Zilliz Cloud supports the Milvus SDKs and all [RESTful API endpoints](/reference/restful). You can use the RESTful API directly, or choose one of the following SDKs to start with:

- [Install the Python SDK.](./install-sdks#install-pymilvus-python-sdk)

- [Install the Java SDK.](./install-sdks#install-java-sdk)

- [Install the Go SDK.](./install-sdks#install-go-sdk)

- [Install the Node.js SDK.](./install-sdks#install-nodejs-sdk)

## Create a Cluster{#create-a-cluster}

You can create a cluster with the subscription plan of your choice using either the RESTful API endpoints or on the Zilliz Cloud console.

The following demonstrates how to create a dedicated cluster using the RESTful API.

```bash
curl --request POST \
    --url "https://api.cloud.zilliz.com/v2/clusters/createDedicated" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --data-raw '{
        "clusterName": "Cluster-05",
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "plan": "Standard",
        "cuType": "Performance-optimized",
        "cuSize": 1
    }'
    
# {
#     "code": 0,
#     "data": {
#         "clusterId": "inxx-xxxxxxxxxxxxxxx",
#         "username": "db_admin",
#         "password": "*************",
#         "prompt": "successfully submitted, cluster is being created. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK with the admin account and the initial password you specified."
#     }
# }
```

You can find the cloud region and project ID on Zilliz Cloud console. If you prefer to create a free cluster on the Zilliz Cloud console, refer to [Create Cluster](./create-cluster).

Once your cluster is running, you will be prompted with the [cluster credentials](./cluster-credentials) for once. Download and save it in a safe place. You will need it to connect to your cluster later.

## Connect to Zilliz Cloud cluster{#connect-to-zilliz-cloud-cluster}

Once you have obtained the cluster credentials, you can use it to connect to your cluster now.

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

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 2. Create a collection in quick setup mode
client.create_collection(
    collection_name="quick_setup",
    dimension=5 # The dimensionality should be an integer greater than 1.
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 2. Create a collection in quick setup mode
CreateCollectionReq quickSetupReq = CreateCollectionReq.builder()
    .collectionName("quick_setup")
    .dimension(5) // The dimensionality should be an integer greater than 1.
    .build();

client.createCollection(quickSetupReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 2. Create a collection
await client.createCollection({
    collection_name: "quick_setup",
    dimension: 5, // The dimensionality should be an integer greater than 1.
});  
```

</TabItem>

<TabItem value='bash'>

```bash
COLLECTION_NAME="quick_setup"

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    -d '{
        "collectionName": "quick_setup",
        "dimension": 5
    }'
    
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

In the above setup, 

- The primary and vector fields use their default names (**id** and **vector**).

- The metric type is also set to its default value (**COSINE**).

- The primary field accepts integers and does not automatically increments.

- A reserved JSON field named **$meta** is used to store non-schema-defined fields and their values.

<Admonition type="info" icon="📘" title="Notes">

<p>Collections created using the RESTful API supports a minimum of 32-dimensional vector field.</p>

</Admonition>

### Customized setup{#customized-setup}

To define the collection schema by yourself, use the customized setup. In this manner, you can define the attributes of each field in the collection, including its name, data type, and extra attributes of a specific field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
import io.milvus.v2.service.collection.request.AddFieldReq;
import io.milvus.v2.common.DataType;
import io.milvus.v2.common.IndexParam;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 3.1 Create schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();

// 3.2 Add fields to schema

AddFieldReq myId = AddFieldReq.builder()
    .fieldName("my_id")
    .dataType(DataType.Int64)
    .isPrimaryKey(true)
    .autoID(false)
    .build();

schema.addField(myId);

AddFieldReq myVector = AddFieldReq.builder()
    .fieldName("my_vector")
    .dataType(DataType.FloatVector)
    .dimension(5)
    .build();

schema.addField(myVector);

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
    index_type: "AUTOINDEX",
    metric_type: "IP"
}]

// 3.3 Create a collection with fields and index parameters
await client.createCollection({
    collection_name: "customized_setup_1",
    fields: fields,
    index_params: index_params,
})
```

</TabItem>

<TabItem value='bash'>

```bash
COLLECTION_NAME="customized_setup"

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --d '{
        "collectionName": "custom_setup",
        "schema": {
            "autoId": false,
            "enabledDynamicField": false,
            "fields": [
                {
                    "fieldName": "my_id",
                    "dataType": "Int64",
                    "isPrimary": true
                },
                {
                    "fieldName": "my_vector",
                    "dataType": "FloatVector",
                    "elementTypeParams": {
                        "dim": "5"
                    }
                }
            ]
        }
    }'
    
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

In the above setup, you have the flexibility to define various aspects of the collection during its creation, including its schema and index parameters.

- **Schema**

    The schema defines the structure of a collection. Except for adding pre-defined fields and setting their attributes as demonstrated above, you have the option of enabling and disabling

    - **Auto ID**

        Whether to enable the collection to automatically increment the primary field.

    - **Dynamic Field**

        Whether to use the reserved JSON field **$meta** to store non-schema-defined fields and their values. 

     For a detailed explanation of the schema, refer to [Schema Explained](./schema-explained).

- **Index parameters**

    Index parameters dictate how Zilliz Cloud organizes your data within a collection. You can assign specific indexes to fields by configuring their **metric types** and **index types**. 

    - For the vector field, you can use **AUTOINDEX** as the index type and use **COSINE**, **L2**, or **IP** as the `metric_type`.

    - For scalar fields, including the primary field, Zilliz Cloud uses **TRIE** for integers and **STL_SORT** for strings.

    For additional insights into index types, refer to[AUTOINDEX Explained](./autoindex-explained).

<Admonition type="info" icon="📘" title="Notes">

<p>The collection created in the preceding code snippets are automatically loaded. If you prefer not to create an automatically loaded collection, refer to <a href="./manage-collections-sdks">Create Collection</a>.</p>
<p>Collections created using the RESTful API are always automatically loaded.</p>

</Admonition>

## Insert Data{#insert-data}

Collections created in either of the preceding ways have been indexed and loaded. Once you are ready, insert some example data.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

console.log(res.insert_cnt)

// Output
// 
// 10
```

</TabItem>

<TabItem value='bash'>

```bash
curl -s --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --d '{
        "collectionName": "quick_setup",
        "data": [
          {"vector": [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231], "color": "grey_4070"},
          {"vector": [-0.3909198248479646, -0.8726174312444843, 0.4981267572657442, -0.9392508698102204, -0.5470572556090092], "color": "black_3737"},
          {"vector": [-0.9098169905660276, -0.9307025336058208, -0.5308685343695865, -0.3852032359431963, -0.8050806646961366], "color": "yellow_7436"},
          {"vector": [-0.05064204615748724, 0.6058571389881378, 0.26812302147792155, 0.4862225881265785, -0.27042586524166445], "color": "grey_9883"},
          {"vector": [-0.8610792440629793, 0.5278969698864726, 0.09065723848982965, -0.8685651142668274, 0.5912780986996793], "color": "green_8111"},
          {"vector": [0.4814454540587043, -0.23573937400668377, -0.14938260011601723, 0.08275006479687019, 0.6726732239961157], "color": "orange_2725"},
          {"vector": [0.9763298348098068, 0.5777919290849443, 0.9579310732153326, 0.8951091168874232, 0.46917481926682525], "color": "black_6073"},
          {"vector": [0.326134221411539, 0.6870356809753577, 0.7977120714123429, 0.4305198158670587, -0.14894148480426983], "color": "purple_1285"},
          {"vector": [0.8709056428858379, 0.021264532993509055, -0.8042932327188321, -0.007299919034885249, 0.14411861700299666], "color": "green_3127"},
          {"vector": [-0.8182282159972083, -0.7882247281939101, -0.1870871133115657, 0.07914806834708976, 0.9825978431531959], "color": "blue_6372"}
        ]
    }'
    
# {
#   "code": 200,
#   "data": {
#       "insertCount": 10,
#       "insertIds": [
#           "448985546440864743",
#           "448985546440864744",
#           "448985546440864745",
#           "448985546440864746",
#           "448985546440864747",
#           "448985546440864748",
#           "448985546440864749",
#           "448985546440864750",
#           "448985546440864751",
#           "448985546440864752"
#       ]
#   }
# }

```

</TabItem>
</Tabs>

The provided code assumes that you have created a collection in the **Quick Setup** manner. As shown in the above code, 

- The data to insert is organized into a list of dictionaries, where each dictionary represents a data record, termed as an entity.

- Each dictionary contains a non-schema-defined field named **color**.

- Each dictionary contains the keys corresponding to both pre-defined and dynamic fields.

<Admonition type="info" icon="📘" title="Notes">

<p>Collections created using RESTful API enabled AutoID, and therefore you need to skip the primary field in the data to insert.</p>

</Admonition>

### Insert more data{#insert-more-data}

You can safely skip this section if you prefer to search with the inserted 10 entities later. To learn more about the search performance of Zilliz Cloud clusters, you are advised use the following code snippet to add more randomly generated entities into the collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import time

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

# Wait for a while
time.sleep(5)
```

</TabItem>

<TabItem value='java'>

```java
// 5. Insert more data for the sake of search

// 5.1 Prepare data
insertData = new ArrayList<>();
List<String> colors = Arrays.asList("green", "blue", "yellow", "red", "black", "white", "purple", "pink", "orange", "brown", "grey");

for (int i = 10; i < 1000; i++) {
    Random rand = new Random();
    JSONObject row = new JSONObject();
    row.put("id", Long.valueOf(i));
    row.put("vector", Arrays.asList(rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat(), rand.nextFloat()));
    row.put("color", colors.get(rand.nextInt(colors.size()-1)) + '_' + rand.nextInt(1000));
    insertData.add(row);
}

// 5.2 Insert data

insertReq = InsertReq.builder()
    .collectionName("quick_setup")
    .data(insertData)
    .build();

res = client.insert(insertReq);

System.out.println(JSONObject.toJSON(res));

// Output:
// {"insertCnt": 990}

// 5.3 Wait for a while to ensure data is indexed
Thread.sleep(5000);
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

console.log(res.insert_cnt)

// Output
// 
// 995

await sleep(5000)
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
      --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/insert" \
      --header "Authorization: Bearer ${TOKEN}" \
      --header "Accept: application/json" \
      --header "Content-Type: application/json" \
      --data-raw "{
          \"collectionName\": \"quick_setup\",
          \"data\": ${DATA}
      }"

  sleep 1
done  

# The above script inserts 1,000 records in an iteration of 10 times.
# The following is the response of a single request
# {
#   "code": 200,
#   "data": {
#       "insertCount": 100,
#       "insertIds": [
#           "448985546440864754",
#           "448985546440864755",
#           "448985546440864756",
#           "448985546440864757",
#           "448985546440864758",
#           "448985546440864759",
#           "448985546440864760",
#           "448985546440864761",
#           "448985546440864762",
#           "448985546440864763",
#           (there are 90 more insertIds)
#       ]
#   }
# }

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
            'vector': [random.uniform(-1, 1) for _ in range(5)],
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

The value of the **query_vectors** variable is a list containing a sub-list of floats. The sub-list represents a vector embedding of 5 dimensions. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
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
#             "id": 551,
#             "distance": 0.08821295201778412,
#             "entity": {}
#         },
#         {
#             "id": 296,
#             "distance": 0.0800950899720192,
#             "entity": {}
#         },
#         {
#             "id": 43,
#             "distance": 0.07794742286205292,
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
//         "distance": 0.77929854,
//         "id": 90,
//         "entity": {}
//     },
//     {
//         "distance": 0.76438016,
//         "id": 252,
//         "entity": {}
//     },
//     {
//         "distance": 0.76274073,
//         "id": 727,
//         "entity": {}
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
//   { score: 1, id: '0' },
//   { score: 0.749187171459198, id: '160' },
//   { score: 0.7374353408813477, id: '109' },
//   { score: 0.7352343797683716, id: '120' },
//   { score: 0.7103434205055237, id: '721' }
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
# 8. Conduct a single vector search
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    -d '{
       "collectionName": "quick_setup",
       "data": [
           [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231]
       ],
       "annsField": "vector",
       "limit": 3
    }'
    
# {
#   "code": 200,
#   "data": [
#       {
#           "distance": 0,
#           "id": 448985546440864743
#       },
#       {
#           "distance": 8.83172,
#           "id": 448985546440865160
#       },
#       {
#           "distance": 10.112098,
#           "id": 448985546440864927
#       }
#   ]
# }
```

</TabItem>
</Tabs>

The output is a list containing a sub-list of three dictionaries, representing the returned entities with their IDs and distances.

### Bulk-vector search{#bulk-vector-search}

You can also include multiple vector embeddings in the **query_vectors** variable to conduct a batch similarity search.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
#             "id": 551,
#             "distance": 0.08821295201778412,
#             "entity": {}
#         },
#         {
#             "id": 296,
#             "distance": 0.0800950899720192,
#             "entity": {}
#         },
#         {
#             "id": 43,
#             "distance": 0.07794742286205292,
#             "entity": {}
#         }
#     ],
#     [
#         {
#             "id": 730,
#             "distance": 0.04431751370429993,
#             "entity": {}
#         },
#         {
#             "id": 333,
#             "distance": 0.04231833666563034,
#             "entity": {}
#         },
#         {
#             "id": 232,
#             "distance": 0.04221535101532936,
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
//             "distance": 0.77929854,
//             "id": 90,
//             "entity": {}
//         },
//         {
//             "distance": 0.76438016,
//             "id": 252,
//             "entity": {}
//         },
//         {
//             "distance": 0.76274073,
//             "id": 727,
//             "entity": {}
//         }
//     ],
//     [
//         {
//             "distance": 0.96298015,
//             "id": 767,
//             "entity": {}
//         },
//         {
//             "distance": 0.94215965,
//             "id": 140,
//             "entity": {}
//         },
//         {
//             "distance": 0.9297105,
//             "id": 467,
//             "entity": {}
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
//     { score: 1, id: '0' },
//     { score: 0.749187171459198, id: '160' },
//     { score: 0.7374353408813477, id: '109' },
//     { score: 0.7352343797683716, id: '120' },
//     { score: 0.7103434205055237, id: '721' }
//   ],
//   [
//     { score: 0.9999998807907104, id: '1' },
//     { score: 0.983799934387207, id: '247' },
//     { score: 0.9833251237869263, id: '851' },
//     { score: 0.982724666595459, id: '871' },
//     { score: 0.9819263219833374, id: '80' }
//   ]
// ]
```

</TabItem>

<TabItem value='bash'>

```bash
# 8. Conduct a single vector search
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    -d '{
       "collectionName": "quick_setup",
       "data": [
           [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231],
           [0.19886812562848388, 0.06023560599112088, 0.6976963061752597, 0.2614474506242501, 0.838729485096104]
       ],
       "annsField": "vector",
       "limit": 3
    }'
    
# {
#   "code": 200,
#   "data": [
#       {
#           "distance": 0,
#           "id": 448985546440864743
#       },
#       {
#           "distance": 8.83172,
#           "id": 448985546440865160
#       },
#       {
#           "distance": 10.112098,
#           "id": 448985546440864927
#       }
#   ]
# }
```

</TabItem>
</Tabs>

The output should be a list of two sub-lists, each of which contains three dictionaries, representing the returned entities with their IDs and distances. 

### Filtered searches{#filtered-searches}

- **With schema-defined fields**

    You can also enhance the search result by including a filter and specifying certain output fields in the search request.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    #             "id": 551,
    #             "distance": 0.08821295201778412,
    #             "entity": {}
    #         },
    #         {
    #             "id": 760,
    #             "distance": 0.07432225346565247,
    #             "entity": {}
    #         },
    #         {
    #             "id": 539,
    #             "distance": 0.07279646396636963,
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
        .outputFields(Arrays.asList("id"))
        .topK(3)
        .build();
    
    SearchResp filteredVectorSearchRes = client.search(searchReq);
    
    System.out.println(JSONObject.toJSON(filteredVectorSearchRes));
    
    // Output:
    // {"searchResults": [[
    //     {
    //         "distance": 0.76274073,
    //         "id": 727,
    //         "entity": {"id": 727}
    //     },
    //     {
    //         "distance": 0.73705024,
    //         "id": 596,
    //         "entity": {"id": 596}
    //     },
    //     {
    //         "distance": 0.71537596,
    //         "id": 668,
    //         "entity": {"id": 668}
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
    //   { score: 0.7103434205055237, id: '721' },
    //   { score: 0.6970766186714172, id: '736' },
    //   { score: 0.69532310962677, id: '797' },
    //   { score: 0.6908581852912903, id: '642' },
    //   { score: 0.634956955909729, id: '715' }
    // ]  
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 8. Conduct a single vector search
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        -d '{
           "collectionName": "quick_setup",
           "data": [
               [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231]
           ],
           "annsField": "vector",
           "filter": "500 < id < 800",
           "limit": 3
        }'
        
    # {
    #   "code": 200,
    #   "data": [
    #       {
    #           "distance": 0,
    #           "id": 448985546440864743
    #       },
    #       {
    #           "distance": 8.83172,
    #           "id": 448985546440865160
    #       },
    #       {
    #           "distance": 10.112098,
    #           "id": 448985546440864927
    #       }
    #   ]
    # }
    ```

    </TabItem>
    </Tabs>

    The output should be a list containing a sub-list of three dictionaries, each representing a searched entity with its ID, distance, and the specified output fields.

- **With non-schema-defined fields**

    You can also include dynamic fields in a filter expression. In the following code snippet, `color` is a non-schema-defined field. You can include them either as keys in the magic `$meta` field, such as `$meta["color"]`, or directly use it like a schema-defined field, such as `color`.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    #             "id": 263,
    #             "distance": 0.0744686871767044,
    #             "entity": {
    #                 "color": "red_9369"
    #             }
    #         },
    #         {
    #             "id": 381,
    #             "distance": 0.06509696692228317,
    #             "entity": {
    #                 "color": "red_9315"
    #             }
    #         },
    #         {
    #             "id": 360,
    #             "distance": 0.057343415915966034,
    #             "entity": {
    #                 "color": "red_6066"
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
    //         "distance": 0.73705024,
    //         "id": 596,
    //         "entity": {"color": "red_691"}
    //     },
    //     {
    //         "distance": 0.7145017,
    //         "id": 170,
    //         "entity": {"color": "red_209"}
    //     },
    //     {
    //         "distance": 0.6979258,
    //         "id": 946,
    //         "entity": {"color": "red_958"}
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
    
    console.log(res.results)
    
    // Output
    // 
    // [
    //   { score: 0.6625675559043884, id: '844', color: 'red_6894' },
    //   { score: 0.634956955909729, id: '715', color: 'red_2506' },
    //   { score: 0.6290165185928345, id: '1', color: 'red_7025' },
    //   { score: 0.6236231327056885, id: '539', color: 'red_9562' },
    //   { score: 0.6213124990463257, id: '224', color: 'red_3419' }
    // ]
    // 
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 9. Conduct a single vector search with filters and output fields
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        -d '{
           "collectionName": "quick_setup",
           "data": [
               [0.3847391566891949, -0.5163308707041789, -0.5295937262122905, -0.3592193314357348, 0.9108593166893231]
           ],
           "annsField": "vector",
           "filter": "color like \"red%\"",
           "outputFields": ["color"],
           "limit": 3
        }'
        
    # {
    #   "code": 200,
    #   "data": [
    #       {
    #           "color": "red_7811",
    #           "distance": 8.83172
    #       },
    #       {
    #           "color": "red_9512",
    #           "distance": 10.654782
    #       },
    #       {
    #           "color": "red_1835",
    #           "distance": 11.009128
    #       }
    #   ]
    # }
    
    ```

    </TabItem>
    </Tabs>

## Scalar Query{#scalar-query}

Unlike a vector similarity search, a query retrieves vectors via scalar filtering based on [filter expressions](https://milvus.io/docs/boolean.md).

- **With filter using schema-defined fields**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    #         "color": "yellow_4104",
    #         "id": 11
    #     },
    #     {
    #         "color": "blue_7278",
    #         "id": 12
    #     },
    #     {
    #         "color": "orange_7136",
    #         "id": 13
    #     },
    #     {
    #         "color": "pink_7776",
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
        .outputFields(Arrays.asList("id"))
        .limit(5)
        .build();
    
    QueryResp queryRes = client.query(queryReq);
    
    System.out.println(JSONObject.toJSON(queryRes));
    
    // Output:
    // {"queryResults": [
    //     {"entity": {"id": 11}},
    //     {"entity": {"id": 12}},
    //     {"entity": {"id": 13}},
    //     {"entity": {"id": 14}}
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

    <TabItem value='bash'>

    ```bash
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        -d '{
           "collectionName": "quick_setup",
           "filter": "448985546440864757 > id > 448985546440864754"
        }'
        
    # {
    #   "code": 200,
    #   "data": [
    #       {
    #           "color": "green_3981",
    #           "id": 448985546440864755,
    #           "vector": [
    #               -0.21008596,
    #               0.21187402,
    #               -0.13025276,
    #               0.65599614,
    #               -0.11263288,
    #               -0.14722843,
    #               -0.5202873,
    #               0.5865673,
    #               0.33630264,
    #               -0.52600056,
    #                 (there are 22 more floats)
    #           ]
    #       },
    #       {
    #           "color": "yellow_6332",
    #           "id": 448985546440864756,
    #           "vector": [
    #               0.006998992,
    #               -0.67079985,
    #               -0.544248,
    #               -0.5742761,
    #               0.40825233,
    #               0.769003,
    #               -0.22952232,
    #               -0.20163013,
    #               -0.5665276,
    #               0.68300354,
    #                 (there are 22 more floats)
    #           ]
    #       }
    #   ]
    # }
    
    ```

    </TabItem>
    </Tabs>

- **With filter using non-schema-defined fields.**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    #         "color": "brown_8454",
    #         "id": 17
    #     },
    #     {
    #         "color": "brown_8390",
    #         "id": 35
    #     },
    #     {
    #         "color": "brown_8442",
    #         "id": 309
    #     },
    #     {
    #         "color": "brown_8429",
    #         "id": 468
    #     },
    #     {
    #         "color": "brown_8020",
    #         "id": 472
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
    //     {"entity": {
    //         "color": "brown_813",
    //         "id": 45
    //     }},
    //     {"entity": {
    //         "color": "brown_840",
    //         "id": 113
    //     }},
    //     {"entity": {
    //         "color": "brown_851",
    //         "id": 136
    //     }},
    //     {"entity": {
    //         "color": "brown_817",
    //         "id": 190
    //     }},
    //     {"entity": {
    //         "color": "brown_822",
    //         "id": 431
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
        output_fields: ["color"],
        limit: 5
    })
    
    console.log(res.data)
    
    // Output
    // 
    // [
    //   { '$meta': { color: 'brown_8242' }, id: '97' },
    //   { '$meta': { color: 'brown_8442' }, id: '137' },
    //   { '$meta': { color: 'brown_8243' }, id: '146' },
    //   { '$meta': { color: 'brown_8105' }, id: '278' },
    //   { '$meta': { color: 'brown_8447' }, id: '294' }
    // ]
    // 
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 10. Conduct a scalar query with filters and output fields
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/query" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        -d '{
           "collectionName": "quick_setup",
           "filter": "color like \"red%\"",
           "outputFields": ["color"],
           "limit": 3
        }'
        
    # {
    #   "code": 200,
    #   "data": [
    #       {
    #           "color": "red_8892",
    #           "id": 448985546440864758
    #       },
    #       {
    #           "color": "red_6248",
    #           "id": 448985546440864768
    #       },
    #       {
    #           "color": "red_8000",
    #           "id": 448985546440864771
    #       }
    #   ]
    # }

    ```

    </TabItem>
    </Tabs>

## Get Entities{#get-entities}

If you know the IDs of the entities to retrieve, you can get entities by their IDs as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# 12. Get entities by IDs
res = client.get(
    collection_name="quick_setup",
    ids=[1,2,3],
    output_fields=["vector"]
)

print(res)

# Output
#
# [
#     {
#         "vector": [
#             0.19886813,
#             0.060235605,
#             0.6976963,
#             0.26144746,
#             0.8387295
#         ],
#         "id": 1
#     },
#     {
#         "vector": [
#             0.43742132,
#             -0.55975026,
#             0.6457888,
#             0.7894059,
#             0.20785794
#         ],
#         "id": 2
#     },
#     {
#         "vector": [
#             0.3172005,
#             0.97190446,
#             -0.36981148,
#             -0.48608947,
#             0.9579189
#         ],
#         "id": 3
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
//     {"entity": {
//         "color": "pink_8682",
//         "vector": [
//             0.35803765,
//             -0.6023496,
//             0.18414013,
//             -0.26286206,
//             0.90294385
//         ],
//         "id": 0
//     }},
//     {"entity": {
//         "color": "red_7025",
//         "vector": [
//             0.19886813,
//             0.060235605,
//             0.6976963,
//             0.26144746,
//             0.8387295
//         ],
//         "id": 1
//     }},
//     {"entity": {
//         "color": "orange_6781",
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
//     id: '0',
//     vector: [
//       0.35803765058517456,
//       -0.602349579334259,
//       0.1841401308774948,
//       -0.26286205649375916,
//       0.9029438495635986
//     ]
//   },
//   {
//     id: '1',
//     vector: [
//       0.19886812567710876,
//       0.060235604643821716,
//       0.697696328163147,
//       0.2614474594593048,
//       0.8387295007705688
//     ]
//   },
//   {
//     id: '2',
//     vector: [
//       0.4374213218688965,
//       -0.5597502589225769,
//       0.6457887887954712,
//       0.789405882358551,
//       0.20785793662071228
//     ]
//   },
//   {
//     id: '3',
//     vector: [
//       0.31720051169395447,
//       0.971904456615448,
//       -0.369811475276947,
//       -0.48608946800231934,
//       0.9579188823699951
//     ]
//   },
//   {
//     id: '4',
//     vector: [
//       0.4452349543571472,
//       -0.8757026791572571,
//       0.8220779299736023,
//       0.46406289935112,
//       0.3033747971057892
//     ]
//   }
// ]
// 
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/get" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    -d '{
       "collectionName": "quick_setup",
       "query": "color like \"red%\"",
       "outputFields": ["color"],
       "id": ["448985546440865158","448985546440865159","448985546440865160"]
    }'
    
# {
#   "code": 200,
#   "data": [
#       {
#           "color": "blue_5660",
#           "id": 448985546440865158
#       },
#       {
#           "color": "yellow_4770",
#           "id": 448985546440865159
#       },
#       {
#           "color": "red_7811",
#           "id": 448985546440865160
#       }
#   ]
# }

```

</TabItem>
</Tabs>

<Admonition type="info" icon="📘" title="Notes">

<p>Currently, the RESTful API does not provide a get endpoint.</p>

</Admonition>

## Delete Entities{#delete-entities}

Zilliz Cloud allows deleting entities by IDs and by filters.

- **Delete entities by IDs.**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    res = await client.deleteEntities({
        collection_name: "quick_setup",
        expr: "id in [5, 6, 7, 8, 9]",
        output_fields: ["vector"]
    })
    
    console.log(res.delete_cnt)
    
    // Output
    // 
    // 5
    // 
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 12. Delete entities by IDs
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        -d '{
            "collectionName": "medium_articles",
            "filter": "id == 4321034832910"
        }'
        
    # {"code":200,"data":{}}
    ```

    </TabItem>
    </Tabs>

- **Delete entities by filter**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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
    res = await client.delete({
        collection_name: "quick_setup",
        ids: [0, 1, 2, 3, 4]
    })
    
    console.log(res.delete_cnt)
    
    // Output
    // 
    // 5
    // 
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # 12. Delete entities by IDs
    curl --request POST \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "Accept: application/json" \
        --header "Content-Type: application/json" \
        -d '{
            "collectionName": "medium_articles",
            "filter": "reading_time > 15"
        }'
        
    # {"code":200,"data":{}}
    ```

    </TabItem>
    </Tabs>

    <Admonition type="info" icon="📘" title="Notes">

    <p>Currently, the delete endpoint of the RESTful API does not support filters.</p>

    </Admonition>

## Drop the collection{#drop-the-collection}

The Free plan allows up to two collections in a cluster. Once you have done this guide, you can drop the collection as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
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

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.dropCollection({
    collection_name: "customized_setup"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --data-raw '{
        "collectionName": "quick_setup"
    }'
    
# {"code":200,"data":{}}

curl --request POST \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/drop" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Accept: application/json" \
    --header "Content-Type: application/json" \
    --data-raw '{
        "collectionName": "customized_setup"
    }'
    
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

## Recaps{#recaps}

- There are two ways to create a collection. The first is the quick setup, which only requires you to provide a name and the dimension of the vector field. The second is the customized setup, which allows you to customize almost every aspect of the collection.

- The data insertion process may take some time to complete. It is recommended to wait a few seconds after inserting data and before conducting similarity searches.

- Filter expressions can be used in both search and query requests. However, they are mandatory for query requests.

