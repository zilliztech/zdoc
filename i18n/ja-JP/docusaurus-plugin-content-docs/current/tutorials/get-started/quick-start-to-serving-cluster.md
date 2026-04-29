---
title: "Serving Cluster へのクイックスタート | Cloud"
slug: /quick-start-to-serving-cluster
sidebar_key: quick-start-to-serving-cluster
sidebar_label: "Serving Cluster へのクイックスタート"
beta: FALSE
notebook: FALSE
description: "Serving クラスターは、リアルタイムの本番環境でのサービング向けにコンピューティングとストレージの両方を統合した自立型サーバーです。Extract-Transform-Load（ETL）パイプラインを通じてデータをクリーニングした後、そのデータを Serving クラスターにインポートすることで、大幅なパフォーマンス向上を実現して提供できます。 | Cloud"
type: origin
token: B1XTwQgNRizAMTkZQvrclGSonyc
sidebar_position: 10
keywords: 
  - zilliz
  - ベクトルデータベース
  - クイックスタート
  - cloud
  - milvus
  - リアルタイムサービング

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# クイックスタート：Serving Cluster

Serving Cluster は、リアルタイムの本番環境でのサービングのために、コンピューティングとストレージの両方を統合した独立型のサーバーです。Extract-Transform-Load（ETL）パイプラインを通じてデータをクリーニングした後、そのデータを Serving Cluster にインポートすることで、大幅なパフォーマンス向上を実現して提供できます。

そのための手順は以下の通りです。

<Procedures>

1. （オプション）**データベースを作成する。**

    Serving Cluster にはデフォルトのデータベースが付属しています。それを使用する場合は、このステップをスキップしてください。データベースは以下のように作成することもできます。

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

    <TabItem value='java'>

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

1. **コレクションを作成します。**

    データベースの準備が整ったら、その中にマネージドコレクションを作成できます。外部コレクションがコレクションの列を外部データファイルにマッピングするのとは異なり、マネージドコレクションでは、大幅なパフォーマンス向上のためにデータのインポートが必要です。

    以下の例では、コレクションスキーマを設定し、コレクションを作成する方法を示しています。

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

    <TabItem value='java'>

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

    次に、上記のスキーマを使用してコレクションを作成できます。デフォルトのデータベースを使用する場合は、`db_name` パラメータを安全に省略できます。

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

    <TabItem value='java'>

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

1. **インデックスを作成します。**

    すべてのベクトルフィールドに対してインデックスを作成し、必要に応じて選択したスカラーフィールドに対してもインデックスを作成する必要があります。

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

    <TabItem value='java'>

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

1. **データのインポート**

    設定が完了したら、処理済みのデータをインポートできます。以下の例では、処理済みのデータが外部ストレージバケットに保存されていることを前提としています。

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

    <TabItem value='java'>

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

    返されたジョブ ID を使用して、その進捗状況を確認できます。

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

    <TabItem value='java'>

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

1. **データを公開する。**

    インポートが完了したら、検索、クエリ、ハイブリッド検索を通じてデータを消費できるようユーザーを招待できます。

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

    <TabItem value='java'>

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