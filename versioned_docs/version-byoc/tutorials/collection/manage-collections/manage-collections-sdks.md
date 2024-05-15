---
slug: /manage-collections-sdks
sidebar_label: SDKs
beta: FALSE
notebook: FALSE
type: origin
token: USQ2w6yj0i3WN1k3eEYciscinkc
sidebar_position: 3

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Collections (SDKs)

This guide walks you through creating and managing collections using the SDK of your choice, which is more flexible and customizable when compared with the operations on the intuitive Web UI of the Zilliz Cloud console.

## Before you start{#before-you-start}

- You have created a cluster. To create a cluster, refer to [Create Cluster (Dev)](./create-cluster).

- You have installed the SDK of your choice. To install an SDK, refer to [Install SDKs](./install-sdks).

## Overview{#overview}

On Zilliz Cloud, you store your vector embeddings in collections. All vector embeddings within a collection share the same dimensionality and distance metric for measuring similarity. 

Zilliz Cloud collections support dynamic fields (i.e., fields not pre-defined in the schema) and automatic incrementation of primary keys.

To accommodate different preferences, Zilliz Cloud offers two methods for creating a collection. One provides a quick setup, while the other allows for detailed customization of the collection schema and index parameters.

Additionally, you can view, load, release, and drop a collection when necessary.

## Create Collection{#create-collection}

You can create a collection in either of the following manners:

- **Quick setup**

    In this manner, you can create a collection by simply giving it a name and specifying the number of dimensions of the vector embeddings to be stored in this collection. For details, refer to [Quick setup](./manage-collections-sdks#quick-setup).

- **Customized setup**

    Instead of letting Zilliz Cloud decide almost everything for your collection, you can determine the **schema** and **index parameters** of the collection on your own. For details, refer to [Customized setup](./manage-collections-sdks#customized-setup).

### Quick setup{#quick-setup}

Against the backdrop of the great leap in the AI industry, most developers just need a simple yet dynamic collection to start with. Zilliz Cloud allows a quick setup of such a collection with just three arguments: 

- Name of the collection to create,

- Dimension of the vector embeddings to insert, and

- Metric type used to measure similarities between vector embeddings.

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

# 2. Create a collection in quick setup mode
client.create_collection(
    collection_name="quick_setup",
    dimension=5
)

res = client.get_load_state(
    collection_name="quick_setup"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.client.ConnectConfig;
import io.milvus.v2.client.MilvusClientV2;
import io.milvus.v2.service.collection.request.GetLoadStateReq;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

String CLUSTER_ENDPOINT = "YOUR_CLUSTER_ENDPOINT";
String TOKEN = "YOUR_TOKEN";

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
    .build();

client.createCollection(quickSetupReq);

// Thread.sleep(5000);

GetLoadStateReq quickSetupLoadStateReq = GetLoadStateReq.builder()
    .collectionName("quick_setup")
    .build();

Boolean res = client.getLoadState(quickSetupLoadStateReq);

System.out.println(res);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 1. Set up a Milvus Client
client = new MilvusClient({address, token});

// 2. Create a collection in quick setup mode
let res = await client.createCollection({
    collection_name: "quick_setup",
    dimension: 5,
});  

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.getLoadState({
    collection_name: "quick_setup"
})

console.log(res.state)

// Output
// 
// LoadStateLoaded
// 
```

</TabItem>
</Tabs>

The collection generated in the above code contains only two fields: `id` (as the primary key) and `vector` (as the vector field), with `auto_id` and `enable_dynamic_field` settings enabled by default.

- `auto_id` 

    Enabling this setting ensures that the primary key increments automatically. There's no need for manual provision of primary keys during data insertion.

- `enable_dynamic_field`

    When enabled, all fields, excluding `id` and `vector` in the data to be inserted, are treated as dynamic fields. These additional fields are saved as key-value pairs within a special field named `$meta`. This feature allows the inclusion of extra fields during data insertion.

The automatically indexed and loaded collection from the provided code is ready for immediate data insertions.

### Customized setup{#customized-setup}

Instead of letting Zilliz Cloud decide almost everything for your collection, you can determine the **schema** and **index parameters** of the collection on your own.

#### Step 1: Set up schema{#step-1-set-up-schema}

A schema defines the structure of a collection. Within the schema, you have the option to enable or disable `enable_dynamic_field`, add pre-defined fields, and set attributes for each field. For a detailed explanation of the concept and available data types, refer to [Schema Explained](./schema-explained).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
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
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.DataType;
import io.milvus.v2.service.collection.request.CreateCollectionReq;

// 3. Create a collection in customized setup mode

// 3.1 Create schema
CreateCollectionReq.CollectionSchema schema = client.createSchema();

// 3.2 Add fields to schema
schema.addField(AddFieldReq.builder()
    .fieldName("my_id")
    .dataType(DataType.Int64).
    isPrimaryKey(true)
    .autoID(false)
    .build());

schema.addField(AddFieldReq.builder()
    .fieldName("my_vector")
    .dataType(DataType.FloatVector)
    .dimension(5)
    .build());
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
```

</TabItem>
</Tabs>

In the provided code snippet for Python, the `enable_dynamic_field` is set to `True`, and `auto_id` is enabled for the primary key. Additionally, a `vector` field is introduced, configured with a dimensionality of 768, along with the inclusion of four scalar fields, each with its respective attributes.

#### Step 2: Set up index parameters{#step-2-set-up-index-parameters}

Index parameters dictate how Zilliz Cloud organizes your data within a collection. You can tailor the indexing process for specific fields by adjusting their `metric_type` and `index_type`. On Zilliz Cloud, the recommended index type is always `AUTOINDEX`. For the vector field, you have the flexibility to select `COSINE`, `L2`, or `IP` as the `metric_type`. For additional insights into index types, refer to [AUTOINDEX Explained](./autoindex-explained).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 3.3. Prepare index parameters
index_params = client.prepare_index_params()

# 3.4. Add indexes
index_params.add_index(
    field_name="my_id",
    index_type="STL_SORT"
)

index_params.add_index(
    field_name="my_vector", 
    index_type="IVF_FLAT",
    metric_type="IP",
    params={ "nlist": 128 }
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.common.IndexParam;

// 3.3 Prepare index parameters
IndexParam indexParamForIdField = IndexParam.builder()
    .fieldName("my_id")
    .indexType(IndexParam.IndexType.STL_SORT)
    .build();

IndexParam indexParamForVectorField = IndexParam.builder()
    .fieldName("my_vector")
    .indexType(IndexParam.IndexType.IVF_FLAT)
    .metricType(IndexParam.MetricType.L2)
    .extraParams(Map.of("nlist", 1024))
    .build();

List<IndexParam> indexParams = new ArrayList<>();
indexParams.add(indexParamForIdField);
indexParams.add(indexParamForVectorField);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 3.2 Prepare index parameters
const index_params = [{
    field_name: "my_id",
    index_type: "STL_SORT"
},{
    field_name: "my_vector",
    index_type: "IVF_FLAT",
    metric_type: "IP",
    params: { nlist: 1024}
}]
```

</TabItem>
</Tabs>

The code snippet above demonstrates how to set up index parameters for the vector field and a scalar field, respectively. For the vector field, set both the metric type and the index type. For a scalar field, set only the index type. It is recommended to create an index for the vector field and any scalar fields that are frequently used for filtering.

#### Step 3: Create the collection{#step-3-create-the-collection}

You have the option to create a collection and an index file separately or to create a collection with the index loaded simultaneously upon creation.

- **Create a collection with the index loaded simultaneously upon creation.**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
    <TabItem value='python'>

    ```python
    # 3.5. Create a collection with the index loaded simultaneously
    client.create_collection(
        collection_name="customized_setup_1",
        schema=schema,
        index_params=index_params
    )
    
    time.sleep(5)
    
    res = client.get_load_state(
        collection_name="customized_setup_1"
    )
    
    print(res)
    
    # Output
    #
    # {
    #     "state": "<LoadState: Loaded>"
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    import io.milvus.v2.service.collection.request.CreateCollectionReq;
    import io.milvus.v2.service.collection.request.GetLoadStateReq;
    
    // 3.4 Create a collection with schema and index parameters
    CreateCollectionReq customizedSetupReq1 = CreateCollectionReq.builder()
        .collectionName("customized_setup_1")
        .collectionSchema(schema)
        .indexParams(indexParams)
        .build();
    
    client.createCollection(customizedSetupReq1);
    
    // Thread.sleep(5000);
    
    // 3.5 Get load state of the collection
    GetLoadStateReq customSetupLoadStateReq1 = GetLoadStateReq.builder()
        .collectionName("customized_setup_1")
        .build();
    
    res = client.getLoadState(customSetupLoadStateReq1);
    
    System.out.println(res);
    
    // Output:
    // true
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 3.3 Create a collection with fields and index parameters
    res = await client.createCollection({
        collection_name: "customized_setup_1",
        fields: fields,
        index_params: index_params,
    })
    
    console.log(res.error_code)  
    
    // Output
    // 
    // Success
    // 
    
    res = await client.getLoadState({
        collection_name: "customized_setup_1"
    })
    
    console.log(res.state)
    
    // Output
    // 
    // LoadStateLoaded
    // 
    ```

    </TabItem>
    </Tabs>

    The collection created above is loaded automatically. To learn more about loading and releasing a collection, refer to [Load & Release Collection](./manage-collections-sdks#load-and-release-collection). 

- **Create a collection and an index file separately.**

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
    <TabItem value='python'>

    ```python
    # 3.6. Create a collection and index it separately
    client.create_collection(
        collection_name="customized_setup_2",
        schema=schema,
    )
    
    res = client.get_load_state(
        collection_name="customized_setup_2"
    )
    
    print(res)
    
    # Output
    #
    # {
    #     "state": "<LoadState: NotLoad>"
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    // 3.6 Create a collection and index it separately
    CreateCollectionReq customizedSetupReq2 = CreateCollectionReq.builder()
        .collectionName("customized_setup_2")
        .collectionSchema(schema)
        .build();
    
    client.createCollection(customizedSetupReq2);
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 3.4 Create a collection and index it seperately
    res = await client.createCollection({
        collection_name: "customized_setup_2",
        fields: fields,
    })
    
    console.log(res.error_code)
    
    // Output
    // 
    // Success
    // 
    
    res = await client.getLoadState({
        collection_name: "customized_setup_2"
    })
    
    console.log(res.state)
    
    // Output
    // 
    // LoadStateNotLoad
    // 
    ```

    </TabItem>
    </Tabs>

    The collection created above is not loaded automatically. You can create an index for the collection as follows. Creating an index for the collection in a separate manner does not automatically load the collection. For details, refer to [Load & Release Collection](./manage-collections-sdks#load-and-release-collection).

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
    <TabItem value='python'>

    ```python
    # 3.6 Create index
    client.create_index(
        collection_name="customized_setup_2",
        index_params=index_params
    )
    
    res = client.get_load_state(
        collection_name="customized_setup_2"
    )
    
    print(res)
    
    # Output
    #
    # {
    #     "state": "<LoadState: NotLoad>"
    # }
    ```

    </TabItem>

    <TabItem value='java'>

    ```java
    CreateIndexReq  createIndexReq = CreateIndexReq.builder()
        .collectionName("customized_setup_2")
        .indexParams(indexParams)
        .build();
    
    client.createIndex(createIndexReq);
    
    // Thread.sleep(1000);
    
    // 3.7 Get load state of the collection
    GetLoadStateReq customSetupLoadStateReq2 = GetLoadStateReq.builder()
        .collectionName("customized_setup_2")
        .build();
    
    res = client.getLoadState(customSetupLoadStateReq2);
    
    System.out.println(res);
    
    // Output:
    // false
    ```

    </TabItem>

    <TabItem value='javascript'>

    ```javascript
    // 3.5 Create index
    res = await client.createIndex({
        collection_name: "customized_setup_2",
        field_name: "my_vector",
        index_type: "IVF_FLAT",
        metric_type: "IP",
        params: { nlist: 1024}
    })
    
    res = await client.getLoadState({
        collection_name: "customized_setup_2"
    })
    
    console.log(res.state)
    
    // Output
    // 
    // LoadStateNotLoad
    // 
    ```

    </TabItem>
    </Tabs>

## View Collections{#view-collections}

You can check the details of an existing collection as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 5. View Collections
res = client.describe_collection(
    collection_name="customized_setup_2"
)

print(res)

# Output
#
# {
#     "collection_name": "customized_setup_2",
#     "auto_id": false,
#     "num_shards": 1,
#     "description": "",
#     "fields": [
#         {
#             "field_id": 100,
#             "name": "my_id",
#             "description": "",
#             "type": 5,
#             "params": {},
#             "element_type": 0,
#             "is_primary": true
#         },
#         {
#             "field_id": 101,
#             "name": "my_vector",
#             "description": "",
#             "type": 101,
#             "params": {
#                 "dim": 5
#             },
#             "element_type": 0
#         }
#     ],
#     "aliases": [],
#     "collection_id": 448143479230158446,
#     "consistency_level": 2,
#     "properties": {},
#     "num_partitions": 1,
#     "enable_dynamic_field": true
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.DescribeCollectionReq;
import io.milvus.v2.service.collection.response.DescribeCollectionResp;

// 4. View collections
DescribeCollectionReq describeCollectionReq = DescribeCollectionReq.builder()
    .collectionName("customized_setup_2")
    .build();

DescribeCollectionResp describeCollectionRes = client.describeCollection(describeCollectionReq);

System.out.println(JSONObject.toJSON(describeCollectionRes));

// Output:
// {
//     "createTime": 449005822816026627,
//     "collectionSchema": {"fieldSchemaList": [
//         {
//             "autoID": false,
//             "dataType": "Int64",
//             "name": "my_id",
//             "description": "",
//             "isPrimaryKey": true,
//             "maxLength": 65535,
//             "isPartitionKey": false
//         },
//         {
//             "autoID": false,
//             "dataType": "FloatVector",
//             "name": "my_vector",
//             "description": "",
//             "isPrimaryKey": false,
//             "dimension": 5,
//             "maxLength": 65535,
//             "isPartitionKey": false
//         }
//     ]},
//     "vectorFieldName": ["my_vector"],
//     "autoID": false,
//     "fieldNames": [
//         "my_id",
//         "my_vector"
//     ],
//     "description": "",
//     "numOfPartitions": 1,
//     "primaryFieldName": "my_id",
//     "enableDynamicField": true,
//     "collectionName": "customized_setup_2"
// }
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. View Collections
res = await client.describeCollection({
    collection_name: "customized_setup_2"
})

console.log(res)

// Output
// 
// {
//   virtual_channel_names: [ 'by-dev-rootcoord-dml_13_449007919953017716v0' ],
//   physical_channel_names: [ 'by-dev-rootcoord-dml_13' ],
//   aliases: [],
//   start_positions: [],
//   properties: [],
//   status: {
//     extra_info: {},
//     error_code: 'Success',
//     reason: '',
//     code: 0,
//     retriable: false,
//     detail: ''
//   },
//   schema: {
//     fields: [ [Object], [Object] ],
//     properties: [],
//     name: 'customized_setup_2',
//     description: '',
//     autoID: false,
//     enable_dynamic_field: false
//   },
//   collectionID: '449007919953017716',
//   created_timestamp: '449024569603784707',
//   created_utc_timestamp: '1712892797866',
//   shards_num: 1,
//   consistency_level: 'Bounded',
//   collection_name: 'customized_setup_2',
//   db_name: 'default',
//   num_partitions: '1'
// }
// 
```

</TabItem>
</Tabs>

To list all existing collections, you can do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 6. List all collection names
res = client.list_collections()

print(res)

# Output
#
# [
#     "customized_setup_2",
#     "quick_setup",
#     "customized_setup_1"
# ]
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.response.ListCollectionsResp;

// 5. List all collection names
ListCollectionsResp listCollectionsRes = client.listCollections();

System.out.println(listCollectionsRes.getCollectionNames());

// Output:
// [
//     "customized_setup_2",
//     "quick_setup",
//     "customized_setup_1"
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 5. List all collection names
ListCollectionsResp listCollectionsRes = client.listCollections();

System.out.println(listCollectionsRes.getCollectionNames());

// Output:
// [
//     "customized_setup_1",
//     "quick_setup",
//     "customized_setup_2"
// ]
```

</TabItem>
</Tabs>

## Load & Release Collection{#load-and-release-collection}

During the loading process of a collection, Zilliz Cloud loads the collection's index file into memory. Conversely, when releasing a collection, Zilliz Cloud unloads the index file from memory. Before conducting searches in a collection, ensure that the collection is loaded.

### Load a collection{#load-a-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 7. Load the collection
client.load_collection(
    collection_name="customized_setup_2"
)

res = client.get_load_state(
    collection_name="customized_setup_2"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: Loaded>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.LoadCollectionReq;

// 6. Load the collection
LoadCollectionReq loadCollectionReq = LoadCollectionReq.builder()
    .collectionName("customized_setup_2")
    .build();

client.loadCollection(loadCollectionReq);

// Thread.sleep(5000);

// 7. Get load state of the collection
GetLoadStateReq loadStateReq = GetLoadStateReq.builder()
    .collectionName("customized_setup_2")
    .build();

res = client.getLoadState(loadStateReq);

System.out.println(res);

// Output:
// true
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 7. Load the collection
res = await client.loadCollection({
    collection_name: "customized_setup_2"
})

console.log(res.error_code)

// Output
// 
// Success
// 

await sleep(3000)

res = await client.getLoadState({
    collection_name: "customized_setup_2"
})

console.log(res.state)

// Output
// 
// LoadStateLoaded
// 
```

</TabItem>
</Tabs>

### Release a collection{#release-a-collection}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 8. Release the collection
client.release_collection(
    collection_name="customized_setup_2"
)

res = client.get_load_state(
    collection_name="customized_setup_2"
)

print(res)

# Output
#
# {
#     "state": "<LoadState: NotLoad>"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.ReleaseCollectionReq;

// 8. Release the collection
ReleaseCollectionReq releaseCollectionReq = ReleaseCollectionReq.builder()
    .collectionName("customized_setup_2")
    .build();

client.releaseCollection(releaseCollectionReq);

// Thread.sleep(1000);

res = client.getLoadState(loadStateReq);

System.out.println(res);

// Output:
// false
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 8. Release the collection
res = await client.releaseCollection({
    collection_name: "customized_setup_2"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.getLoadState({
    collection_name: "customized_setup_2"
})

console.log(res.state)

// Output
// 
// LoadStateNotLoad
// 
```

</TabItem>
</Tabs>

## Set up aliases{#set-up-aliases}

You can assign aliases for collections to make them more meaningful in a specific context. You can assign multiple aliases for a collection, but multiple collections cannot share an alias.

### Create aliases{#create-aliases}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 9. Manage aliases
# 9.1. Create aliases
client.create_alias(
    collection_name="customized_setup_2",
    alias="bob"
)

client.create_alias(
    collection_name="customized_setup_2",
    alias="alice"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.CreateAliasReq;

// 9. Manage aliases

// 9.1 Create alias
CreateAliasReq createAliasReq = CreateAliasReq.builder()
    .collectionName("customized_setup_2")
    .alias("bob")
    .build();

client.createAlias(createAliasReq);

createAliasReq = CreateAliasReq.builder()
    .collectionName("customized_setup_2")
    .alias("alice")
    .build();

client.createAlias(createAliasReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9. Manage aliases
// 9.1 Create aliases
res = await client.createAlias({
    collection_name: "customized_setup_2",
    alias: "bob"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.createAlias({
    collection_name: "customized_setup_2",
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>
</Tabs>

### List aliases{#list-aliases}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 9.2. List aliases
res = client.list_aliases(
    collection_name="customized_setup_2"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "bob",
#         "alice"
#     ],
#     "collection_name": "customized_setup_2",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.ListAliasesReq;
import io.milvus.v2.service.utility.response.ListAliasResp;

// 9.2 List alises
ListAliasesReq listAliasesReq = ListAliasesReq.builder()
    .collectionName("customized_setup_2")
    .build();

ListAliasResp listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

// Output:
// [
//     "bob",
//     "alice"
// ]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.2 List aliases
res = await client.listAliases({
    collection_name: "customized_setup_2"
})

console.log(res.aliases)

// Output
// 
// [ 'bob', 'alice' ]
// 
```

</TabItem>
</Tabs>

### Describe aliases{#describe-aliases}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 9.3. Describe aliases
res = client.describe_alias(
    alias="bob"
)

print(res)

# Output
#
# {
#     "alias": "bob",
#     "collection_name": "customized_setup_2",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.DescribeAliasReq;
import io.milvus.v2.service.utility.response.DescribeAliasResp;

// 9.3 Describe alias
DescribeAliasReq describeAliasReq = DescribeAliasReq.builder()
    .alias("bob")
    .build();

DescribeAliasResp describeAliasRes = client.describeAlias(describeAliasReq);

System.out.println(JSONObject.toJSON(describeAliasRes));

// Output:
// {
//     "alias": "bob",
//     "collectionName": "customized_setup_2"
// }
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.3 Describe aliases
res = await client.describeAlias({
    collection_name: "customized_setup_2",
    alias: "bob"
})

console.log(res)

// Output
// 
// {
//   status: {
//     extra_info: {},
//     error_code: 'Success',
//     reason: '',
//     code: 0,
//     retriable: false,
//     detail: ''
//   },
//   db_name: 'default',
//   alias: 'bob',
//   collection: 'customized_setup_2'
// }
// 
```

</TabItem>
</Tabs>

### Reassign aliases{#reassign-aliases}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 9.4 Reassign aliases to other collections
client.alter_alias(
    collection_name="customized_setup_1",
    alias="alice"
)

res = client.list_aliases(
    collection_name="customized_setup_1"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "alice"
#     ],
#     "collection_name": "customized_setup_1",
#     "db_name": "default"
# }

res = client.list_aliases(
    collection_name="customized_setup_2"
)

print(res)

# Output
#
# {
#     "aliases": [
#         "bob"
#     ],
#     "collection_name": "customized_setup_2",
#     "db_name": "default"
# }
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.AlterAliasReq;

// 9.4 Reassign alias to other collections
AlterAliasReq alterAliasReq = AlterAliasReq.builder()
    .collectionName("customized_setup_1")
    .alias("alice")
    .build();

client.alterAlias(alterAliasReq);

listAliasesReq = ListAliasesReq.builder()
    .collectionName("customized_setup_1")
    .build();

listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

// Output:
// ["alice"]

listAliasesReq = ListAliasesReq.builder()
    .collectionName("customized_setup_2")
    .build();

listAliasRes = client.listAliases(listAliasesReq);

System.out.println(listAliasRes.getAlias());

// Output:
// ["bob"]
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.4 Reassign aliases to other collections
res = await client.alterAlias({
    collection_name: "customized_setup_1",
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.listAliases({
    collection_name: "customized_setup_1"
})

console.log(res.aliases)

// Output
// 
// [ 'alice' ]
// 

res = await client.listAliases({
    collection_name: "customized_setup_2"
})

console.log(res.aliases)

// Output
// 
// [ 'bob' ]
// 

```

</TabItem>
</Tabs>

### Drop aliases{#drop-aliases}

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 9.5 Drop aliases
client.drop_alias(
    alias="bob"
)

client.drop_alias(
    alias="alice"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.utility.request.DropAliasReq;

// 9.5 Drop alias
DropAliasReq dropAliasReq = DropAliasReq.builder()
    .alias("bob")
    .build();

client.dropAlias(dropAliasReq);

dropAliasReq = DropAliasReq.builder()
    .alias("alice")
    .build();

client.dropAlias(dropAliasReq);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 9.5 Drop aliases
res = await client.dropAlias({
    alias: "bob"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.dropAlias({
    alias: "alice"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>
</Tabs>

## Drop a Collection{#drop-a-collection}

If a collection is no longer needed, you can drop the collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
# 10. Drop the collections
client.drop_collection(
    collection_name="quick_setup"
)

client.drop_collection(
    collection_name="customized_setup_1"
)

client.drop_collection(
    collection_name="customized_setup_2"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.v2.service.collection.request.DropCollectionReq;

// 10. Drop collections

DropCollectionReq dropQuickSetupParam = DropCollectionReq.builder()
    .collectionName("quick_setup")
    .build();

client.dropCollection(dropQuickSetupParam);

DropCollectionReq dropCustomizedSetupParam = DropCollectionReq.builder()
    .collectionName("customized_setup_1")
    .build();

client.dropCollection(dropCustomizedSetupParam);

dropCustomizedSetupParam = DropCollectionReq.builder()
    .collectionName("customized_setup_2")
    .build();

client.dropCollection(dropCustomizedSetupParam);
```

</TabItem>

<TabItem value='javascript'>

```javascript
// 10. Drop the collection
res = await client.dropCollection({
    collection_name: "customized_setup_2"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.dropCollection({
    collection_name: "customized_setup_1"
})

console.log(res.error_code)

// Output
// 
// Success
// 

res = await client.dropCollection({
    collection_name: "quick_setup"
})

console.log(res.error_code)

// Output
// 
// Success
// 
```

</TabItem>
</Tabs>

## Collection Limits{#collection-limits}

The number of collections you can create varies with the CU that your cluster uses.

<table>
   <tr>
     <th></th>
     <th>Maximum number of collections</th>
   </tr>
   <tr>
     <td>8 CUs and less</td>
     <td><strong>32</strong></td>
   </tr>
   <tr>
     <td>More than 8 CUs</td>
     <td><strong>256</strong></td>
   </tr>
</table>

