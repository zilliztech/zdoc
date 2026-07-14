---
title: "External Data Lake Search クイックスタート | Cloud"
slug: /quick-start-to-external-data-lake-search
sidebar_label: "External Data Lake Search クイックスタート"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "External data lake search を使用すると、外部ストレージ上または Zilliz Cloud にインポートされたデータにゼロコピーでアクセスして大規模データセットを検索でき、コンピュートリソースを継続的に稼働させておく必要がありません。外部 volume またはインポート済みファイルから collection を作成し、プロジェクトのデータプレーンエンドポイント経由で index の構築やメタデータの更新を行い、検索またはクエリワークロードを実行する必要があるときだけオンデマンド cluster を起動できます。 | Cloud"
type: origin
token: KdwFwQnDNisT4skHH6Hc16uInji
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# External Data Lake Search クイックスタート

External data lake search を使用すると、外部ストレージ上または Zilliz Cloud にインポートされたデータにゼロコピーでアクセスして大規模データセットを検索でき、コンピュートリソースを継続的に稼働させておく必要がありません。外部 volume またはインポート済みファイルから collection を作成し、プロジェクトのデータプレーンエンドポイント経由で index の構築やメタデータの更新を行い、検索またはクエリワークロードを実行する必要があるときだけオンデマンド cluster を起動できます。

これを行うには、手順は次のとおりです。

## 始める前に\{#before-you-start}

- **ストレージ統合を作成します。**

    ストレージ統合は、アクセス認証情報とともにデータの場所を記録するプロファイルです。ストレージ統合を設定するには、[AWS S3](./integrate-with-aws-s3)、[Google GCS](./integrate-with-gcp)、または [Azure](./integrate-with-azure-blob-storage) のストレージ統合を作成する手順に従い、ストレージ統合 ID を取得します。

- **外部 volume を作成します。**

    外部 volume は、ストレージ統合内のパスです。未加工データがそのパス上にあることを確認してください。同じストレージ統合から複数の外部 volume を作成できます。外部 volume を作成するには、[External Volumes](./external-volume#create-an-external-volume) を参照してください。

## ステップ 1: プロジェクトエンドポイントに接続する\{#step-1-connect-to-a-project-endpoint}

データベースで作業する前に、プロジェクトエンドポイントに接続します。Zilliz Cloud コンソールでオンデマンドコンピュートを有効化すると、クイックスタートページでプロジェクトエンドポイントを取得できます。

<Admonition type="info" icon="📘" title="注意">

外部 collection の操作では、認証に **API key** が必要です。このフローでは `username:password` 認証はサポートされていません。

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

## ステップ 2: （任意）データベースを作成する\{#step-2-optional-create-a-database}

Zilliz Cloud にはデフォルトのデータベースが用意されています。それを使用する場合は、このステップをスキップしてください。次のようにデータベースを作成することもできます。

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

## ステップ 3: 外部 collection を作成する\{#step-3-create-an-external-collection}

データベースの準備ができたら、その中に外部 collection を作成できます。外部 collection は、その collection での検索のために、指定したデータファイルに列をマッピングし、オンデマンドのコンピュートリソースを関連付けます。

未加工データを collection にインポートする必要がある managed collection とは異なり、外部 collection はサブ秒の更新操作によって未加工データからメタデータを生成します。

次の例は、collection フィールドとデータファイルの間のマッピング関係を設定する方法を示しています。スキーマを初期化するときに、データの volume パスとファイル形式を渡します。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

schema = MilvusClient.create_schema(
    external_source='volume://my_volume/iceberg/metadata/00001-xxx.metadata.json',
    external_spec='{
        "format": "iceberg-table",
        "snapshot_id": "1234567890123456789"
    }'
)

schema.add_field(
    field_name="vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=1536,
    # highlight-next
    external_field="embedding" # field name in the external data file
)

schema.add_field(
    field_name="product_id",
    datatype=DataType.VARCHAR,
    max_length=32,
    nullable=True,
    # highlight-next
    external_field="product_id"
)

schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512,
    nullable=True,
    # highlight-next
    external_field="title"
)

schema.add_field(
    field_name="main_category",
    datatype=DataType.VARCHAR,
    max_length=64,
    nullable=True,
    # highlight-next
    external_field="main_category"
)

schema.add_field(
    field_name="price",
    datatype=DataType.DOUBLE,
    nullable=True,
    # highlight-next
    external_field="price"
)

schema.add_field(
    field_name="average_rating",
    datatype=DataType.DOUBLE,
    nullable=True,
    # highlight-next
    external_field="average_rating"
)

schema.add_field(
    field_name="rating_number",
    datatype=DataType.INT64,
    nullable=True,
    # highlight-next
    external_field="rating_number"
)
```

</TabItem>

<TabItem value='bash'>

```bash
export schema='{
    "externalSource": "volume://my_volume/iceberg/metadata/00001-xxx.metadata.json",
    "externalSpec": "{\"format\": \"iceberg-table\", \"snapshot_id\": \"1234567890123456789\"}",
    "fields": [
        {
            "fieldName": "vector",
            "dataType": "FloatVector",
            "elementTypeParams": {
                "dim": "1536"
            },
            "externalField": "embedding"
        },
        {
            "fieldName": "product_id",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "32"
            },
            "nullable": true,
            "externalField": "product_id"
        },
        {
            "fieldName": "title",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "512"
            },
            "nullable": true,
            "externalField": "title"
        },
        {
            "fieldName": "main_category",
            "dataType": "VarChar",
            "elementTypeParams": {
                "max_length": "64"
            },
            "nullable": true,
            "externalField": "main_category"
        },
        {
            "fieldName": "price",
            "dataType": "Double",
            "nullable": true,
            "externalField": "price"
        },
        {
            "fieldName": "average_rating",
            "dataType": "Double",
            "nullable": true,
            "externalField": "average_rating"
        },
        {
            "fieldName": "rating_number",
            "dataType": "Int64",
            "nullable": true,
            "externalField": "rating_number"
        }
    ]
}'
```

</TabItem>
</Tabs>

次に、上記のスキーマを使用して collection を作成できます。デフォルトのデータベースを使用する場合は、`db_name` パラメータを安全に省略できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.use_database(
    db_name="my_database"
)

# create the collection
client.create_collection(
    collection_name="my_collection",
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
    \"collectionName\": \"my_collection\",
    \"schema\": $schema
}"
```

</TabItem>
</Tabs>

## ステップ 4: index を作成して collection を更新する\{#step-4-create-indexes-and-refresh-the-collection}

managed collection と同様に、外部データベースでも index を作成できます。すべての vector フィールドには index を作成する必要があり、高速なメタデータフィルタリングのために一部の scalar フィールドに index を作成することもできます。ただし、index を構築するには refresh を呼び出す必要があります。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Add indexes
index_params.add_index(
    field_name="vector",
    index_type="AUTOINDEX",
    metric_type="COSINE"
)

index_params.add_index(
    field_name="main_category", 
    index_type="AUTOINDEX"
)

client.create_index(
    db_name="my_database",
    collection_name="my_collection",
    index_params=index_params
)
```

</TabItem>

<TabItem value='bash'>

```bash
export indexParams='[
    {
        "fieldName": "vector",
        "metricType": "COSINE",
        "indexName": "vector",
        "indexType": "AUTOINDEX"
    },
    {
        "fieldName": "main_category",
        "indexName": "main_category",
        "indexType": "AUTOINDEX"
    }
]'

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/indexes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d "{
    \"dbName\": \"my_database\",
    \"collectionName\": \"my_collection\",
    \"indexParams\": $indexParams
}"
```

</TabItem>
</Tabs>

次に、外部 collection を更新します。`externalSource` と `externalSpec` を省略して collection スキーマを再利用することも、新しいソースから collection スキーマを更新するために両方を指定することもできます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# refresh the external database
job_id = client.refresh_external_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='bash'>

```bash
# Refresh the external collection
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/refresh" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "default",
    "collectionName": "my_collection"
}'

# job-xxxxxxxxxxxxxxxxxxx
```

</TabItem>
</Tabs>

次に、進行状況監視の呼び出しをラップするループを作成して、更新処理の進行状況を追跡できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
progress = client.get_refresh_external_collection_progress(job_id=job_id)
```

</TabItem>

<TabItem value='bash'>

```bash
curl -s --request POST \
    --url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/describe" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{
        "jobId": "job-xxxxxxxxxxxxxxxxxxx"
    }'
```

</TabItem>
</Tabs>

## ステップ 5: オンデマンド cluster を作成する\{#step-5-create-an-on-demand-cluster}

外部 collection の準備ができたら、オンデマンド検索のためにそれをオンデマンド cluster に関連付ける必要があります。次のコマンドは cluster を作成し、その ID を返します。

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

デフォルトでは、cluster は最後のリクエストから 60 秒後に自動的にサスペンドされます。ユースケースに合わせてこの値を設定できます。 

## ステップ 6: 検索を実行する\{#step-6-conduct-searches}

検索、クエリ、またはハイブリッド検索を実行する必要がある場合は、セッションを通じて前のステップで作成したオンデマンド cluster に接続できます。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# highlight-start
session = client.session(
    cluster_id="inxx-xxxxxxxxxxxxx"
)
# highlight-end

# 1536-dimensional vector
query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592]
res = session.search(
    db_name="my_database",
    collection_name="my_collection",
    anns_field="vector",
    data=[query_vector],
    limit=3,
    output_fields=["product_id", "title", "main_category", "price", "average_rating", "rating_number"]
)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/entities/search?cluster_id=inxx-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection",
    "data": [
        [
            0.3580376395471989,
            -0.6023495712049978,
            0.18414012509913835,
            -0.26286205330961354,
            0.9029438446296592
        ]
    ],
    "annsField": "vector",
    "limit": 3,
    "outputFields": [
        "product_id",
        "title",
        "main_category",
        "price",
        "average_rating",
        "rating_number"
    ]
}'
```

</TabItem>
</Tabs>

その後、データを探索して、最も価値の高いサブセットを見つけることができます。次に、serving cluster に接続してデータをそこにインポートし、本番環境向けに提供できます。
