---
title: "外部データレイク検索のクイックスタート | BYOC"
slug: /quick-start-to-external-data-lake-search
sidebar_label: "外部データレイク検索のクイックスタート"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "外部データレイク検索では、コンピュートリソースを常時稼働させることなく、外部ストレージ内のデータや Zilliz Cloud にインポートされたデータへゼロコピーでアクセスし、大規模なデータセットを検索できます。外部ボリュームやインポート済みファイルからコレクションを作成し、プロジェクトデータプレーンエンドポイント経由でインデックスの構築やメタデータの更新を行い、検索やクエリワークロードの実行時にのみオンデマンドクラスターを起動できます。 | BYOC"
type: origin
token: KdwFwQnDNisT4skHH6Hc16uInji
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 外部データレイク検索のクイックスタート

外部データレイク検索では、コンピュートリソースを常時稼働させることなく、外部ストレージ内のデータや Zilliz Cloud にインポートされたデータへゼロコピーでアクセスし、大規模なデータセットを検索できます。外部ボリュームやインポート済みファイルからコレクションを作成し、プロジェクトデータプレーンエンドポイント経由でインデックスの構築やメタデータの更新を行い、検索やクエリワークロードの実行時にのみオンデマンドクラスターを起動できます。

手順は以下のとおりです。

## 事前準備\{#before-you-start}

- **ストレージインテグレーションを作成する。**

    ストレージインテグレーションは、アクセス認証情報を含むデータ保存場所を記録するプロファイルです。ストレージインテグレーションを設定するには、[AWS S3](./integrate-with-aws-s3)、[Google GCS](./integrate-with-gcp)、または [Azure](./integrate-with-azure-blob-storage) のストレージインテグレーションを作成する手順に従い、ストレージインテグレーション ID を取得してください。

- **外部ボリュームを作成する。**

    外部ボリュームは、ストレージインテグレーション内のパスです。生データがそのパスに配置されていることを確認してください。同じストレージインテグレーションから複数の外部ボリュームを作成できます。外部ボリュームの作成については、[外部ボリューム](./external-volume#create-an-external-volume) を参照してください。

## ステップ 1: プロジェクトエンドポイントに接続する\{#step-1-connect-to-a-project-endpoint}

データベースを操作する前に、プロジェクトエンドポイントに接続します。プロジェクトエンドポイントは、Zilliz Cloud コンソールでオンデマンドコンピュートを有効化した後、クイックスタートページで確認できます。

<Admonition type="info" icon="📘" title="Notes">

外部コレクションの操作には、認証に **API キー** が必要です。このフローでは `username:password` 認証はサポートされていません。

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

Zilliz Cloud にはデフォルトのデータベースが用意されています。デフォルトのデータベースを使用する場合は、このステップをスキップしてください。以下のように新しいデータベースを作成することもできます。

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

## ステップ 3: 外部コレクションを作成する\{#step-3-create-an-external-collection}

データベースの準備ができたら、その中に外部コレクションを作成できます。外部コレクションは、指定したデータファイルにカラムをマッピングし、そのコレクションでの検索用にオンデマンドコンピュートリソースを割り当てます。

生データをコレクションにインポートする必要があるマネージドコレクションとは異なり、外部コレクションはサブ秒単位の更新操作によって生データからメタデータを生成します。

次の例では、コレクションフィールドとデータファイルのマッピング関係を設定する方法を示します。スキーマ作成時に、ボリュームパスとデータ形式を指定します。このクイックスタートでは Iceberg テーブルを使用します。サポートされているデータソースと形式の完全なリストについては、[サポートされているデータソースと形式](./create-external-collection#support-data-sources) を参照してください。

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

次に、上記のスキーマを使用してコレクションを作成できます。デフォルトのデータベースを使用する場合は、`db_name` パラメーターを省略しても問題ありません。

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

## ステップ 4: インデックスの作成とコレクションのリフレッシュ\{#step-4-create-indexes-and-refresh-the-collection}

外部データベースでも、マネージドコレクションと同様にインデックスを作成できます。すべてのベクトルフィールドにはインデックスを作成する必要があり、メタデータフィルタリングを高速化するために一部のスカラーフィールドにもインデックスを作成できます。ただし、インデックスを構築するには refresh を呼び出す必要があります。

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

次に、外部コレクションをリフレッシュします。`externalSource` と `externalSpec` を省略してコレクションスキーマを再利用することも、両方を指定して新しいソースからコレクションスキーマを更新することもできます。

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

続いて、進捗監視の呼び出しをラップするループを作成し、リフレッシュ操作の進捗状況を追跡できます。

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

## ステップ 5: オンデマンドクラスターの作成\{#step-5-create-an-on-demand-cluster}

外部コレクションの準備ができたら、オンデマンド検索を行うためにオンデマンドクラスターにアタッチする必要があります。次のコマンドはクラスターを作成し、その ID を返します。

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

デフォルトでは、クラスターは最後のリクエストから 60 秒後に自動的にサスペンドされますが、ユースケースに合わせてこの値を変更できます。

## ステップ 6: 検索の実行\{#step-6-conduct-searches}

検索、クエリ、またはハイブリッド検索を実行する際は、セッションを通じて前のステップで作成したオンデマンドクラスターにアタッチできます。

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

データを探索して最も価値のあるサブセットを見つけたら、サービングクラスターに接続してデータをインポートし、本番環境で利用できるようになります。
