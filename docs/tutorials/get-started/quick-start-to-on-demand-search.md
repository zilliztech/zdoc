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
description: "You can connect to on-demand compute resources using a project-specific on-demand compute endpoint. Using that, you can create databases and on-demand clusters. Databases map to your data files in external storage, while you can attach on-demand clusters to those databases for compute-intensive searches. | Cloud"
type: origin
token: KdwFwQnDNisT4skHH6Hc16uInji
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - quickstart
  - cloud
  - milvus
  - on-demand search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Quickstart to On-Demand Search

You can connect to on-demand compute resources using a project-specific on-demand compute endpoint. Using that, you can create databases and on-demand clusters. Databases map to your data files in external storage, while you can attach on-demand clusters to those databases for compute-intensive searches. 

To do so, the procedure is as follows:

<Procedures>

1. **Create an external volume.**

    You need to set up a storage integration before creating an external volume. To do so, follow the steps to create an [AWS S3](null), [Google GCS](null), or [Azure](null) storage integration and obtain the storage integration ID.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # Initiate a volume manager
    from pymilvus.bulk_writer.volume_manager import VolumeManager
    
    volume_manager = VolumeManager(
        cloud_endpoint="https://api.cloud.zilliz.com",
        api_key="YOUR_API_KEY"
    )
    
    # Create a volume
    volume_manager.create_volume(
        project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx", 
        region_id="aws-us-west-2", 
        volume_name="ext_volume",
        volume_type="EXTERNAL",
        storage_integration_id="integ-xxxx",
        path="data/",
    )
    
    print(f"\nVolume ext_volume created")
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export CLOUD_PLATFORM_ENDPOINT="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${CLOUD_PLATFORM_ENDPOINT}/v2/volumes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxx",
        "regionId": "aws-us-west-2",
        "volumeName": "ext_volume",
        "type": "EXTERNAL",
        "storageIntegrationId": "integ-xxxx",
        "path": "/data/"
    }'
    
    # {
    #     "code": 0,
    #     "data": {
    #         "volumeName": "ext_volume"
    #     }
    # }
    ```

    </TabItem>
    </Tabs>

1. **Connect to an on-demand compute endpoint.**

    Before working on a database, connect to an on-demand compute endpoint as follows.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # connect the database
    client = MilvusClient(
        # a project-specific on-demand compute endpoint
        uri="https://{proj-xxxxxxxx}.{region}.api.zillizcloud.com",
        token="YOUR_API_KEY"
    )
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    export ON_DEMAND_COMPUTE_ENDPOINT="https://{proj-xxxxxxxx}.{region}.api.zillizcloud.com"
    ```

    </TabItem>
    </Tabs>

    Note that the endpoint you use to set up the Milvus client is a project-specific on-demand compute endpoint. Once you connect to that project-specific endpoint, you can create databases and on-demand clusters.

1. （Optional) **Create a database.**

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
    --url "${ON_DEMAND_COMPUTE_ENDPOINT}/v2/vectordb/databases/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "dbName": "my_database"
    }'
    ```

    </TabItem>
    </Tabs>

1. **Create a collection.**

    Once the database is ready, you can create external collections in it. An external collection maps its columns to the data files you specify and attaches on-demand compute resources for the searches in that collection.

    The following example demonstrates how to set up the mapping relationship between collection fields and your data files. When initiating the schema, pass in the volume path and file format of your data.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    from pymilvus import MilvusClient, DataType
    
    schema = MilvusClient.create_schema(
        external_source='volume://ext_volume/my_path/',
        external_spec='{
            "format": "parquet"
        }'
    )
    
    schema.add_field(
        field_name="product_id",
        datatype=DataType.INT64,
        # highlight-next
        external_field="id" # field name in the external data file
    )
    
    schema.add_field(
        field_name="product_name",
        datatype=DataType.VARCHAR,
        max_length=256,
        # highlight-next
        external_field="name"
    )
    
    schema.add_field(
        field_name="embedding",
        datatype=DataType.FLOAT_VECTOR,
        dim=768,
        # highlight-next
        external_field="vector"
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
        collection_name="test_collection",
        schema=schema
    )
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    curl --request POST \
    --url "${ON_DEMAND_COMPUTE_ENDPOINT}/v2/vectordb/collections/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d "{
        \"dbName\": \"my_database\",
        \"collectionName\": \"test_collection\",
        \"schema\": $schema
    }"
    ```

    </TabItem>
    </Tabs>

1. **Create indexes and refresh the collection.**

    You can create indexes in an external database as you do in managed collections. All vector fields should be indexed, and you can select to index some scalar fields for fast metadata filtering. However, you need to call refresh to build the index.

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
    
    client.create_index(
        collection_name="test_collection",
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
    --url "${ON_DEMAND_COMPUTE_ENDPOINT}/v2/vectordb/indexes/create" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d "{
        \"collectionName\": \"test_collection\",
        \"indexParams\": $indexParams
    }"
    ```

    </TabItem>
    </Tabs>

    Then you should refresh the external collection. The refresh operation usually completes in sub-seconds, which enables Zilliz Cloud to create metadata and index files for vector similarity searches.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # refresh the external database
    job_id = client.refresh_external_collection(
        collection_name="test_collection"
    )
    
    # watch the progress
    while True:

        print(f"  {progress.state}: {progress.progress}%")
    
        if progress.state == "RefreshCompleted":
            elapsed = progress.end_time - progress.start_time
            print(f"  Completed in {elapsed}ms")
            return job_id
        elif progress.state == "RefreshFailed":
            print(f"  Failed: {progress.reason}")
            return job_id
    
        time.sleep(2)
    ```

    </TabItem>

    <TabItem value='bash'>

    ```bash
    # restful
    ```

    </TabItem>
    </Tabs>

1. **Conduct searches.**

    When you need to conduct searches, queries, or hybrid searches, you must attach to an existing on-demand cluster through a session.

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    # highlight-start
    session = client.session(
        cluster_id="inxx-xxxxxxxxxxxxx"
    )
    # highlight-end
    
    query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592]
    res = session.search(
        collection_name="test_collection",
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
    --url "${ON_DEMAND_COMPUTE_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxxxx" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "collectionName": "test_collection",
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

1. **Explore your data and find the most valuable subset. Then you can connect to a serving cluster, import the data into it, and serve it for production.**

</Procedures>