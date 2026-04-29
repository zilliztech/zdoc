---
title: "Quickstart to Serving Cluster | Cloud"
slug: /quick-start-to-serving-cluster
sidebar_key: quick-start-to-serving-cluster
sidebar_label: "Quickstart to Serving Cluster"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "A serving cluster is a self-contained server that combines both compute and storage for real-time production serving. Once you have cleaned your data through your Extract-Transform-Load (ETL) pipelines, you can import it into a serving cluster to serve it with significant performance gains. | Cloud"
type: origin
token: B1XTwQgNRizAMTkZQvrclGSonyc
sidebar_position: 10
keywords: 
  - zilliz
  - vector database
  - quickstart
  - cloud
  - milvus
  - real-time serving

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Quickstart to Serving Cluster

A serving cluster is a self-contained server that combines both compute and storage for real-time production serving. Once you have cleaned your data through your Extract-Transform-Load (ETL) pipelines, you can import it into a serving cluster to serve it with significant performance gains.

To do so, the procedure is as follows:

<Procedures>

1. (Optional) **Create a database.**

    A serving cluster ships with a default database. If you choose that, skip this step. You can also create a database as follows:

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # connect to the serving cluster
    client = MilvusClient(
        # a cluster-specific endpoint
        uri="https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530",
        token="YOUR_API_KEY"
    )
    
    client.create_database(
        db_name="my_database"
    )
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export CLOUD_PLATFORM_ENDPOINT="https://api.cloud.zilliz.com"
    export SERVING_CLUSTER_ENDPOINT="https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${SERVING_CLUSTER_ENDPOINT}/v2/vectordb/databases/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "dbName": "my_database"
    }'
    ```

    </TabItem>
    </Tabs>

1. **Create a collection.**

    Once the database is ready, you can create managed collections in it. Unlike an external collection that maps collection columns to external data files, a managed collection asks you to import data for significant performance gains. 

    The following example demonstrates how to set up the collection schema and create a collection.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import MilvusClient, DataType
    
    schema = MilvusClient.create_schema()
    
    schema.add_field(
        field_name="product_id",
        datatype=DataType.INT64
    )
    
    schema.add_field(
        field_name="product_name",
        datatype=DataType.VARCHAR,
        max_length=256
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
    # create the collection
    client.create_collection(
        db_name="my_database",
        collection_name="prod_collection",
        schema=schema
    )
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    curl --request POST \
    --url "${SERVING_CLUSTER_ENDPOINT}/v2/vectordb/collections/create" \
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

1. **Create indexes.**

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
        index_type="AUTOINDEX",
        metric_type="COSINE"
    )
    
    clent.create_index(
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
    --url "${SERVING_CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d "{
        \"collectionName\": \"prod_collection\",
        \"indexParams\": $indexParams
    }"
    ```

    </TabItem>
    </Tabs>

1. **Import data.**

    Once everything is set up, you can import the processed data. The following example assumes that you have stored the processed data in an external storage bucket.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus.bulk_writer import bulk_import
    
    # The path should be relative to the root 
    # of a zilliz cloud volume or an external storage
    STORAGE_PATH = "s3://your/data/path/in/external/storage"
    ACCESS_KEY = "YOUR_STORAGE_ACCESS_KEY"
    SECRET_KEY = "YOUR_STORAGE_SECRET_KEY"
    
    res = bulk_import(
        api_key="YOUR_ZILLIZ_API_KEY",
        url="https://api.cloud.zilliz.com",
        cluster_id="inxx-xxxxxxxxxxxxxxxxxxx",
        collection_name="prod_collection",
        object_url="s3://your/data/path/in/external/storage.json",
        access_key="YOUR_STORAGE_ACCESS_KEY",
        secret_key="YOUR_STORAGE_SECRET_KEY"
    )
    
    # job-xxxxxxxxxxxxxxxxxxxxx
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export CLOUD_PLATFORM_ENDPOINT="https://api.cloud.zilliz.com"
    
    # replace url and token with your own
    curl --request POST \
         --url "${CLOUD_PLATFORM_ENDPOINT}/v2/vectordb/jobs/import/create" \
         --header "Authorization: Bearer ${TOKEN}" \
         --header "Accept: application/json" \
         --header "Content-Type: application/json" \
         -d '{
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "collectionName": "prod_collection",
            "objectUrl": "s3://your/data/path/in/external/storage.json",
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

1. **Serve your data.**

    Once the import completes, you can invite users to consume your data through searches, queries, and hybrid searches.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592]
    res = client.search(
        collection_name="prod_collection",
        anns_field="embedding",
        data=[query_vector],
        limit=3,
        output_fields=["product_name"],
        search_params={"metric_type": "IP"}
    )
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    curl --request POST \
    --url "${SERVING_CLUSTER_ENDPOINT}/v2/vectordb/entities/search" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "collectionName": "prod_collection",
        "data": [
            [
                0.3580376395471989,
                -0.6023495712049978,
                0.18414012509913835,
                -0.26286205330961354,
                0.9029438446296592
            ]
        ],
        "annsField": "embedding",
        "limit": 3,
        "outputFields": [
            "product_name"
        ]
    }'
    ```

    </TabItem>
    </Tabs>

</Procedures>