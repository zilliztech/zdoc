---
title: "Quickstart to On-Demand Search | Cloud"
slug: /quick-start-to-on-demand-search
sidebar_key: quick-start-to-on-demand-search
sidebar_label: "Quickstart to On-Demand Search"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "Zilliz Cloud provides on-demand compute resources, allowing you to run similarity searches and queries on demand. You pay only for the resources you use and can shut down clusters at no cost when you do not need them. | Cloud"
type: origin
token: GQN0wDCrni4n36kyeVQcF41Lned
sidebar_position: 8
keywords: 
  - zilliz
  - vector database
  - quickstart
  - cloud
  - milvus
  - on-demand search
  - data lake
  - search in external data lake

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Quickstart to On-Demand Search

Zilliz Cloud provides on-demand compute resources, allowing you to run similarity searches and queries on demand. You pay only for the resources you use and can shut down clusters at no cost when you do not need them.

## Step 1: Connect to a project endpoint.\{#step-1-connect-to-a-project-endpoint}

Before working on a database, connect to the project endpoint. You can obtain the project endpoint on the quickstart page after enabling on-demand compute on the Zilliz Cloud console.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Managed collection operations require an <strong>API key</strong> for authentication. This flow does not support <code>username:password</code> authentication.</p></li>
<li><p>Managed collections in databases for on-demand compute do not require load operations.</p></li>
</ul>

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# connect to database
client = MilvusClient(
    # a project-specific on-demand compute endpoint
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
```

</TabItem>
</Tabs>

## Step 2: (Optional) Create a database.\{#step-2-optional-create-a-database}

Zilliz Cloud ships with a default database. If you choose that, skip this step. You can also create a database as follows.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.create_database(
    db_name="my_database"
)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/databases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database"
}'
```

</TabItem>
</Tabs>

## Step 3: Create a managed collection.\{#step-3-create-a-managed-collection}

Once the database is ready, you can create managed collections in it. Unlike an external collection that maps collection columns to external data files, a managed collection asks you to import data for significant performance gains. 

The following example demonstrates how to set up the collection schema and create a collection.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema()

schema.add_field(
    field_name="product_id",
    datatype=DataType.INT64,
    is_primary=True
)

schema.add_field(
    field_name="product_name",
    datatype=DataType.VARCHAR,
    max_length=512
)

schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768
)
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
    "fields": [
        {
            "fieldName": "product_id",
            "dataType": "Int64",
            "isPrimary": true
        },
        {
            "fieldName": "embedding",
            "dataType": "FloatVector",
            "elementTypeParams": {
                "dim": "768"
            }
        },
        {
            "fieldName": "product_name",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": 512
            }
        }
    ]
}'
```

</TabItem>
</Tabs>

Then you can create a collection with the above schema. If you decide to use the default database, you can safely skip the `db_name` parameter.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.use_database(
    db_name="my_database"
)

# create the collection
client.create_collection(
    collection_name="prod_collection",
    schema=schema
)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"prod_collection\",
    \"schema\": $schema
}"
```

</TabItem>
</Tabs>

## Step 4: Create indexes.\{#step-4-create-indexes}

You need to create indexes for all vector fields and, optionally, for selected scalar fields.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Add indexes
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX"
)

index_params.add_index(
    field_name="product_name", 
    index_type="AUTOINDEX"
)

client.create_index(
    db_name="my_database",
    collection_name="prod_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
    {
        "fieldName": "embedding",
        "metricType": "COSINE",
        "indexName": "embedding",
        "indexType": "AUTOINDEX"
    },
    {
        "fieldName": "product_name",
        "indexName": "product_name",
        "indexType": "AUTOINDEX"
    }
]'

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"prod_collection\",
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

## Step 5: Import data.\{#step-5-import-data}

Once everything is set up, you can import the processed data. The following example assumes that you have stored the processed data in an external storage bucket.

For the data format in your bucket or storage integrations, refer to [Format Options](./data-import-format-options).

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer import bulk_import

# The path should be relative to the root 
# of a zilliz cloud volume or an external storage
OBJECT_URLS = [[                                                                                                             
    "https://s3.us-west-2.amazonaws.com/your-bucket/path/in/external/storage.json"                                           
]]                                                                                                                                                                                                                                                     
ACCESS_KEY = "YOUR_STORAGE_ACCESS_KEY"                                                                                       
SECRET_KEY = "YOUR_STORAGE_SECRET_KEY"

res = bulk_import(
    api_key="YOUR_ZILLIZ_API_KEY",
    url="https://api.cloud.zilliz.com",
    project_id="proj-xxxxxxxxxxxxxxxxxxx",
    region_id="aws-us-west-2",
    db_name="my_database",
    collection_name="prod_collection",
    object_url=OBJECT_URLS,
    access_key=ACCESS_KEY,
    secret_key=SECRET_KEY
)

# job-xxxxxxxxxxxxxxxxxxxxx
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \                                                                                                        
  --url "${CLOUD_PLATFORM_ENDPOINT}/v2/vectordb/jobs/import/create" \                                                        
  --header "Authorization: Bearer ${TOKEN}" \                                                                                
  --header "Accept: application/json" \                                                                                      
  --header "Content-Type: application/json" \                                                                                
  -d '{                                                                                                                      
    "projectId": "proj-xxxxxxxxxxxxxxxxxx",                                                                                  
    "regionId": "aws-us-west-2",                                                                                             
    "dbName": "my_database",                                                                                                 
    "collectionName": "prod_collection",                                                                                     
    "objectUrls": [["https://s3.us-west-2.amazonaws.com/your-bucket/path/in/external/storage.json"]],                        
    "accessKey": "YOUR_STORAGE_ACCESS_KEY",                                                                                  
    "secretKey": "YOUR_STORAGE_SECRET_KEY"                                                                                   
  }'
    
 # job-xxxxxxxxxxxxxxxxxxxxx
```

</TabItem>
</Tabs>

With the returned job ID, you can monitor its progress.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
import json
from pymilvus.bulk_writer import get_import_progress

# Get bulk-insert job progress
resp = get_import_progress(
    api_key="YOUR_ZILLIZ_API_KEY",
    url="https://api.cloud.zilliz.com",
    cluster_id="inxx-xxxxxxxxxxxxxxxxxxx",
    job_id="job-xxxxxxxxxxxxxxxxxxxxx",
)

print(json.dumps(resp.json(), indent=4))
```

</TabItem>

<TabItem value='bash'>

```bash
  # Use jobId returned from create API                                                                                         
  curl --request POST \                                                                                                        
    --url "${CLOUD_PLATFORM_ENDPOINT}/v2/vectordb/jobs/import/getProgress" \                                                   
    --header "Authorization: Bearer ${TOKEN}" \                                                                                
    --header "Accept: application/json" \                                                                                      
    --header "Content-Type: application/json" \                                                                                
    -d '{                                                                                                                      
      "clusterId": "inxx-xxxxxxxxxxxxxxx",                                                                                     
      "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"                                                                                     
    }'
```

</TabItem>
</Tabs>

## Step 6: Create an on-demand cluster\{#step-6-create-an-on-demand-cluster}

Once your external collection is ready, you need to attach it to an on-demand cluster for on-demand searches. The following command creates a cluster and returns its ID.

```bash
export CONTROL_PLANE_ENDPOINT="https://api.cloud.zilliz.com"

curl --request POST \
--url "${CONTROL_PLANE_ENDPOINT}/v2/clusters/createOnDemandCluster" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-2",
    "clusterName": "my-on-demand",
    "cuSize": 8,
    "autoSuspend": 60
}'

# inxx-xxxxxxxxxxxxx
```

By default, the cluster automatically suspends for 60 seconds after the last request, and you can set it to a value that suits your use cases. 

## Step 7: Conduct searches.\{#step-7-conduct-searches}

When you need to conduct searches, queries, or hybrid searches, you can attach to the on-demand cluster created in the previous step through a session.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient                         
                                                                                                                               
client = MilvusClient(                                                                                                       
    uri="https://{project-id}.{region}.api.zillizcloud.com",                                                                 
    token="YOUR_API_KEY"                                                                                                     
)                                                                                                                            
                                                                                                                               
session = client.session(cluster_id="inxx-xxxxxxxxxxxxxxx")                                                                  
                                                                                                                               
# Must match collection vector dimension (example: 768)                                                                      
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592]                                
                                                                                                                               
res = session.search(                                                                                                        
    db_name="my_database",                                                                                                   
    collection_name="prod_collection",                                                                                       
    anns_field="embedding",                                                                                                  
    data=[query_vector],                                                                                                     
    limit=3,                                                                                                                 
    output_fields=["product_id", "product_name"]                                                                                
) 
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \                                                                                                        
  --url "${PROJECT_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxx" \
  --header "Authorization: Bearer ${TOKEN}" \                                                                                
  --header "Content-Type: application/json" \                                                                                
  -d '{                                                                                                                      
    "dbName": "my_database",                                                                                                 
    "collectionName": "prod_collection",                                                                                     
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            ...
            0.9029438446296592
        ]
    ]                                                         
    "annsField": "embedding",                                                                                                
    "limit": 3,                                                                                                              
    "outputFields": ["product_id", "product_name"]                                                                           
  }'
```

</TabItem>
</Tabs>

Then, you can explore your data and find the most valuable subset. Then you can connect to a serving cluster, import the data into it, and serve it for production.

