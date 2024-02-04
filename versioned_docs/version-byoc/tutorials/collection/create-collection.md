---
slug: /create-collection
beta: FALSE
notebook: 00_quick_start.ipynb,01_use_customized_schema.ipynb
token: QnKCw0v4TiFkITkneCmcy0mZnre
sidebar_position: 1
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Create Collection

This tutorial will guide you through the steps to set up a collection for your cluster. You can find[ the detailed explanations about collections, schema, and index here](./cluster-collection-and-entities).

## Procedure{#procedure}

If the idea of jumping right into the creation process without pre-defining every field sounds appealing, then the starter API is tailor-made for you. It offers a streamlined approach, demanding only the collection's name and the count of dimensions for the vector field.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"Java","value":"java"},{"label":"Bash","value":"bash"}]}>
<TabItem value='python'>

<Tabs groupId="python" defaultValue='python' values={[{"label":"Starter API","value":"python"},{"label":"Advanced API","value":"python_1"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token
COLLECTION_NAME="medium_articles_2020" # Set your collection name

# Initialize a MilvusClient instance
# Replace uri and token with your own
client = MilvusClient(
    uri=CLUSTER_ENDPOINT, # Cluster endpoint obtained from the console
    token=TOKEN # a colon-separated cluster username and password
)

# Create a collection
client.create_collection(
    collection_name=COLLECTION_NAME,
    dimension=768
)

res = client.describe_collection(
    collection_name=COLLECTION_NAME
)

print(res)

# Output
#
# {
#     "collection_name": "medium_articles_2020",
#     "auto_id": false,
#     "num_shards": 1,
#     "description": "",
#     "fields": [
#         {
#             "field_id": 100,
#             "name": "id",
#             "description": "",
#             "type": 5,
#             "params": {},
#             "is_primary": true
#         },
#         {
#             "field_id": 101,
#             "name": "vector",
#             "description": "",
#             "type": 101,
#             "params": {
#                 "dim": 768
#             }
#         }
#     ],
#     "aliases": [],
#     "collection_id": 443943328732839733,
#     "consistency_level": 2,
#     "properties": [],
#     "num_partitions": 1,
#     "enable_dynamic_field": true
# }

```

</TabItem>
<TabItem value='python_1'>

```python
from pymilvus import connections, FieldSchema, CollectionSchema, DataType, Collection, utility

CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT" # Set your cluster endpoint
TOKEN="YOUR_CLUSTER_TOKEN" # Set your token
COLLECTION_NAME="medium_articles_2020" # Set your collection name

connections.connect(
  alias='default', 
  #  Public endpoint obtained from Zilliz Cloud
  uri=CLUSTER_ENDPOINT,
  # API key or a colon-separated cluster username and password
  token=TOKEN, 
)

# 1. Define fields
fields = [
    FieldSchema(name="id", dtype=DataType.INT64, is_primary=True),
    FieldSchema(name="title", dtype=DataType.VARCHAR, max_length=512),   
    FieldSchema(name="title_vector", dtype=DataType.FLOAT_VECTOR, dim=768),
    FieldSchema(name="link", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="reading_time", dtype=DataType.INT64),
    FieldSchema(name="publication", dtype=DataType.VARCHAR, max_length=512),
    FieldSchema(name="claps", dtype=DataType.INT64),
    FieldSchema(name="responses", dtype=DataType.INT64)
]

# 2. Build the schema
schema = CollectionSchema(
    fields,
    description="Schema of Medium articles",
    enable_dynamic_field=False
)

# 3. Create collection
collection = Collection(
    name=COLLECTION_NAME, 
    description="Medium articles published between Jan and August in 2020 in prominent publications",
    schema=schema
)
```

</TabItem>
</Tabs>
</TabItem>

<TabItem value='javascript'>

```javascript
const { MilvusClient } = require("@zilliz/milvus2-sdk-node")

const address = "YOUR_CLUSTER_ENDPOINT"
const token = "YOUR_CLUSTER_TOKEN"
const collectionName = "medium_articles_2020"
const data_file = `./medium_articles_2020_dpr.json`

async function main() {

    // Connect to the cluster
    const client = new MilvusClient({address, token})

    // Create a collection
    let res = await client.createCollection({
        collection_name: collectionName,
        dimension: 768,
    });

    console.log(res)

    // Output
    // 
    // { error_code: 'Success', reason: '', code: 0 }
    //

    // Describe the created collection
    res = await client.describeCollection({
        collection_name: collectionName
    });
   
    console.log(res)

    // Output
    // 
    // {
    //   virtual_channel_names: [ 'by-dev-rootcoord-dml_0_445337000187266398v0' ],
    //   physical_channel_names: [ 'by-dev-rootcoord-dml_0' ],
    //   aliases: [],
    //   start_positions: [],
    //   properties: [],
    //   status: { error_code: 'Success', reason: '', code: 0 },
    //   schema: {
    //     fields: [ [Object], [Object] ],
    //     name: 'medium_articles_2020',
    //     description: '',
    //     autoID: false,
    //     enable_dynamic_field: true
    //   },
    //   collectionID: '445337000187266398',
    //   created_timestamp: '445337085300965381',
    //   created_utc_timestamp: '1698826161579',
    //   shards_num: 1,
    //   consistency_level: 'Bounded',
    //   collection_name: 'medium_articles_2020',
    //   db_name: 'default',
    //   num_partitions: '1'
    // }
    // 
}
```

</TabItem>

<TabItem value='java'>

```java
public final class QuickStartDemo {

    public static void main(String[] args) {
    
        String clusterEndpoint = "YOUR_CLUSTER_ENDPOINT";
        String token = "YOUR_CLUSTER_TOKEN";
        String collectionName = "medium_articles";
        String data_file = System.getProperty("user.dir") + "/medium_articles_2020_dpr.json";

        // 1. Connect to Zilliz Cloud

        ConnectParam connectParam = ConnectParam.newBuilder()
            .withUri(clusterEndpoint)
            .withToken(token)
            .build();   
            
        MilvusServiceClient client = new MilvusServiceClient(connectParam);

        System.out.println("Connected to Zilliz Cloud!");

        // Output:
        // Connected to Zilliz Cloud!
    
        // 2. Create collection

        CreateSimpleCollectionParam createCollectionParam = CreateSimpleCollectionParam.newBuilder()
            .withCollectionName(collectionName)
            .withDimension(768)
            .build();

        R<RpcStatus> createCollection = client.createCollection(createCollectionParam);

        if (createCollection.getException() != null) {
            System.err.println("Failed to create collection: " + createCollection.getException().getMessage());
            return;            
        }

        // 3. Describe collection

        DescribeCollectionParam describeCollectionParam = DescribeCollectionParam.newBuilder()
            .withCollectionName(collectionName)
            .build();

        R<DescribeCollectionResponse> collectionInfo = client.describeCollection(describeCollectionParam);

        if (collectionInfo.getException() != null) {
            System.err.println("Failed to describe collection: " + collectionInfo.getException().getMessage());
            return;            
        }

        DescCollResponseWrapper descCollResponseWrapper = new DescCollResponseWrapper(collectionInfo.getData());

        System.out.println(descCollResponseWrapper);

        // Output:
        // Collection Description{name:'medium_articles', description:'', id:445337000188271120, shardNumber:1, createdUtcTimestamp:1698906291178, aliases:[], fields:[FieldType{name='id', type='Int64', elementType='None', primaryKey=true, partitionKey=false, autoID=false, params={}}, FieldType{name='vector', type='FloatVector', elementType='None', primaryKey=false, partitionKey=false, autoID=false, params={dim=768}}], isDynamicFieldEnabled:true}
    }
    
}
    
```

</TabItem>

<TabItem value='bash'>

```bash
# token="username:password" or token="your-api-key"
curl --location --request POST "${PUBLIC_ENDPOINT}/v1/vector/collections/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    --header "Accept: */*" \
    --data '{
        "collectionName": "medium_articles_2020",
        "dimension": 768
    }'

# Output:
# {"code":200,"data":{}}
```

</TabItem>
</Tabs>

By running the above snippets, you are allowing Zilliz Cloud to take charge of some default settings:

- Primary key

    Zilliz Cloud automatically creates a primary key and dubs it `id`.

- Vector field

    A default vector field named `vector` is initialized.

Additionally, collections established using this method automatically enable the dynamic schema feature. With this capability active, Zilliz Cloud seamlessly saves each undefined field in the data as dynamic fields upon insertion.

## Supported data types{#supported-data-types}

To aid in your schema design, here are the data types Zilliz Cloud can accommodate:

- **Boolean values**: BOOLEAN

- **Floating points**: DOUBLE (8-byte) and FLOAT (4-byte)

- **Integers**: INT8 (8-bit), INT32 (32-bit), and INT64 (64-bit)

- **Float vectors**:  FLOAT_VECTOR

- **Characters**: VARCHAR

- **Structured data types**: [JSON](./javascript-object-notation-json)

Harness these types as building blocks for your collection's schema.

## Limits{#limits}

The number of collections you can create varies with the CU that your cluster uses.

|                  |  Maximum number of collections |
| ---------------- | ------------------------------ |
|  8 CUs and less  |  **32**                        |
|  More than 8 CUs |  **256**                       |

## Related topics{#related-topics}

- [Insert Entities](./insert-entities)

- [Search and Query](./search-query-and-get)

- [Drop Collection](./drop-collection)

- [Enable Dynamic Schema](./enable-dynamic-schema)

- [JavaScript Object Notation (JSON)](./javascript-object-notation-json) 

