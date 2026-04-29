---
title: "オンデマンド検索のクイックスタート | Cloud"
slug: /quick-start-to-on-demand-search
sidebar_key: quick-start-to-on-demand-search
sidebar_label: "オンデマンド検索のクイックスタート"
beta: PUBLIC
notebook: FALSE
description: "プロジェクト固有のオンデマンドコンピューティングエンドポイントを使用して、オンデマンドコンピューティングリソースに接続できます。これにより、データベースとオンデマンドクラスターを作成できます。データベースは外部ストレージ内のデータファイルに対応し、計算集約型の検索のためにそれらのデータベースにオンデマンドクラスターをアタッチできます。| Cloud"
type: origin
token: KdwFwQnDNisT4skHH6Hc16uInji
sidebar_position: 9
keywords: 
  - zilliz
  - ベクトルデータベース
  - クイックスタート
  - cloud
  - milvus
  - オンデマンド検索

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# クイックスタート：オンデマンド検索

プロジェクト固有のオンデマンドコンピュートエンドポイントを使用して、オンデマンドコンピュートリソースに接続できます。これを使用して、データベースとオンデマンドクラスターを作成できます。データベースは外部ストレージ内のデータファイルに対応し、それらのデータベースにオンデマンドクラスターをアタッチして、計算集約型の検索を実行できます。

そのための手順は以下の通りです。

<Procedures>

1. **外部ボリュームを作成する。**

    外部ボリュームを作成する前に、ストレージ統合を設定する必要があります。そのためには、[AWS S3](null)、[Google GCS](null)、または [Azure](null) のストレージ統合を作成する手順に従って、統合 ID を取得してください。

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

    <TabItem value='java'>

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

1. **オンデマンドコンピューティングエンドポイントに接続します。**

    データベースを操作する前に、以下の手順でオンデマンドコンピューティングエンドポイントに接続してください。

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

    <TabItem value='java'>

    ```bash
    export ON_DEMAND_COMPUTE_ENDPOINT="https://{proj-xxxxxxxx}.{region}.api.zillizcloud.com"
    ```

    </TabItem>
    </Tabs>

    使用する Milvus クライアント設定用のエンドポイントは、プロジェクト固有のオンデマンドコンピュートエンドポイントです。このプロジェクト固有のエンドポイントに接続すると、データベースとオンデマンドクラスターを作成できます。

1. （オプション）**データベースを作成します。**

    Zilliz Cloud にはデフォルトのデータベースが付属しています。それを使用する場合は、このステップをスキップしてください。以下のようにしてデータベースを作成することもできます。

    <Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
    <TabItem value='python'>

    ```python
    client.create_database(
        db_name="my_database"
    )
    ```

    </TabItem>

    <TabItem value='java'>

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

1. **コレクションを作成します。**

    データベースの準備が整ったら、その中に外部コレクションを作成できます。外部コレクションは、そのカラムを指定したデータファイルにマッピングし、そのコレクション内の検索用にオンデマンドのコンピューティングリソースをアタッチします。

    次の例では、コレクションフィールドとデータファイル間のマッピング関係を設定する方法を示します。スキーマを初期化する際に、データのボリュームパスとファイル形式を渡します。

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
        collection_name="test_collection",
        schema=schema
    )
    ```

    </TabItem>

    <TabItem value='java'>

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

1. **インデックスを作成し、コレクションを更新します。**

    管理対象コレクションと同様に、外部データベースでインデックスを作成できます。すべてのベクトルフィールドにインデックスを付与する必要があり、メタデータの高速フィルタリングのために一部のスカラーフィールドにインデックスを選択して付与することも可能です。ただし、インデックスを構築するには refresh を呼び出す必要があります。

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

    その後、外部コレクションを更新する必要があります。更新操作は通常サブ秒で完了し、Zilliz Cloud がベクトル類似検索用のメタデータとインデックスファイルを作成できるようになります。

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

    <TabItem value='java'>

    ```bash
    # restful
    ```

    </TabItem>
    </Tabs>

1. **検索を実行する。**

    検索、クエリ、またはハイブリッド検索を実行する必要がある場合、セッションを介して既存のオンデマンドクラスターに接続する必要があります。

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

    <TabItem value='java'>

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

1. **データを探索して最も価値のあるサブセットを見つけます。その後、サービングクラスターに接続し、データをインポートして本番環境で提供できます。**

</Procedures>