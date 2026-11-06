---
title: "快速开始：External Data Lake Search | Cloud"
slug: /quick-start-to-external-data-lake-search
sidebar_label: "快速开始：External Data Lake Search"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "按需搜索使您能够在无需持续运行计算资源的情况下，对存储在外部存储中的数据或已导入 Zilliz Cloud 的数据进行搜索。您可以基于 External Volume 或导入的文件创建 Collection，通过项目数据面 Endpoint 构建索引并 Refresh 元数据，并仅在需要执行 Search 或 Query 工作负载时启动 On-demand 集群。 | Cloud"
type: origin
token: XweAwx0lriFJXhkMyb1c40v9nNh
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 快速开始：External Data Lake Search

按需搜索使您能够在无需持续运行计算资源的情况下，对存储在外部存储中的数据或已导入 Zilliz Cloud 的数据进行搜索。您可以基于 External Volume 或导入的文件创建 Collection，通过项目数据面 Endpoint 构建索引并 Refresh 元数据，并仅在需要执行 Search 或 Query 工作负载时启动 On-demand 集群。

您可以按以下流程操作：

## 开始之前\{#before-you-start}

- **创建存储集成**

    存储集成是一种记录数据位置及访问凭证的配置对象。要设置存储集成，请按照步骤创建[阿里云对象存储](./integrate-with-alibaba-cloud-oss)或 [Amazon S3](./integrate-with-amazon-s3-cn) 集成，并获取其 ID。

- **创建 External Volume**

    External volume 是存储集成下的一个路径。请确保您的原始数据位于该路径中。您可以基于同一个存储集成创建多个 External Volume。详情请参见 [External Volume](./external-volume)。

## 步骤 1：连接项目 Endpoint \{#step-1-connect-to-a-project-endpoint}

在操作 Database 之前，请先连接到项目 Endpoint。启用 Zilliz Cloud Console 中的按需计算后，您可以在**快速开始**页面获取项目 Endpoint。

<Admonition type="info" title="说明">

External Collection 操作需要使用 **API 密钥**进行身份验证。此流程不支持 `username:password` 身份验证。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# connect to database
client = MilvusClient(
    # a project-specific on-demand compute endpoint
    uri="https://{project-id}.{region}.api.zillizcloud.com.cn",
    token="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com.cn"
```

</TabItem>
</Tabs>

## 步骤 2：（可选）创建 Database\{#step-2-optional-create-a-database}

 Zilliz Cloud 会默认提供一个 Default Database。如果您使用 Default Database，可以跳过此步骤。您也可以按如下方式创建 Database。

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

## 步骤 3：创建 External Collection\{#step-3-create-an-external-collection}

Database 准备就绪后，您可以在其中创建 External Collection。External Collection 会将其列映射到您指定的数据文件，并为该 Collection 中的搜索附加按需计算资源。

与需要将原始数据导入 Collection 的 Managed Collection 不同，External Collection 通过亚秒级的 Refresh 操作从原始数据生成元数据。

以下示例演示了如何建立 Collection 字段与数据文件之间的映射关系。创建 Schema 时，请指定数据所在的 Volume 路径和数据格式。本快速入门使用 Iceberg 表作为示例。有关支持的数据源和格式的完整列表，请参阅[支持的数据源和格式](./create-external-collection#support-data-sources)。

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

然后，您可以使用上述 schema 创建一个 Collection。如果您决定使用 Default Database，可以直接省略 `db_name` 参数。

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

### 将 Serving 集群的 Collection 用作数据源\{#use-a-collection-from-a-serving-cluster-as-the-data-source}

上面的步骤基于 External Volume 中的数据文件创建 External Collection。您也可以使用另一 Serving 集群上的 Collection 作为数据源：创建 Schema 时，将 `external_source` 设置为源 Collection 的 `milvus://` URI。

在 Zilliz Cloud 上，`external_source` 支持两种格式：`volume://<volume_name>/<path>` 与 `milvus://<instance_id>/<db_name>/<collection_name>`。`milvus://` 指向与目标集群同项目、同地域的另一 Serving 集群（兼容 Milvus v3.0.x）上的 Collection。前缀必须小写；三段（实例/数据库/Collection）缺一不可，数据库为 `default` 时也须写明；末尾允许多一个 `/`。

- 源为与目标**同项目、同地域**的另一 Serving 集群（**兼容 Milvus v3.0.x**）上的普通 Collection（不能是另一张外表）。

- 连接项目端点时，请使用 API key 并传入查询集群 ID（Python 中为 `option={"cluster_id": "<query cluster id>"}`）。

- 跨集群源（`milvus://`）当前仅支持 SDK 与 RESTful API，控制台不支持此源类型。云厂商：**阿里云、腾讯云即将支持。**

随后按常规方式使用该 Schema 创建 Collection。为每个字段设置 `external_field`，取值为源 Collection 中对应字段的名称。`external_spec` 可以省略，因为 `milvus://` 源的格式默认为 `milvus-table`。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# 使用 API key 和查询集群 ID 连接项目端点
client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com.cn",
    token="YOUR_API_KEY",
    db_name="my_database",
    option={"cluster_id": "<query cluster id>"}
)

# 将 Schema 指向源 Collection，省略 external_spec
schema = MilvusClient.create_schema(
    external_source="milvus://in01-xxxxxxxxxxxxxxx/default/products"
)

# 将每个字段映射到源 Collection 中的对应字段
schema.add_field(
    field_name="vector",
    datatype=DataType.FLOAT_VECTOR,
    dim=1536,
    external_field="embedding"
)

schema.add_field(
    field_name="product_id",
    datatype=DataType.VARCHAR,
    max_length=32,
    external_field="product_id"
)

schema.add_field(
    field_name="title",
    datatype=DataType.VARCHAR,
    max_length=512,
    external_field="title"
)

# 创建 Collection
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
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection",
    "schema": {
        "externalSource": "milvus://in01-xxxxxxxxxxxxxxx/default/products",
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
                "externalField": "product_id"
            },
            {
                "fieldName": "title",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": "512"
                },
                "externalField": "title"
            }
        ]
    }
}'
```

</TabItem>
</Tabs>

按步骤 4 所述创建索引并 Refresh Collection。对于以 `milvus://` 源创建的 Collection：

refresh 的本质是将外部 Collection 重新绑定到本次请求传入的 `external_source` 并同步最新数据。每次 refresh 都必须传入 `external_source`；省略该参数时本次刷新不生效，Collection 仍对外提供此前同步的数据。

任务状态从 `RefreshInProgress` 变为 `RefreshCompleted` 或 `RefreshFailed`。若已有刷新任务进行中，新请求会被拒绝。Zilliz Cloud 上的 refresh 需等待索引构建完成，耗时随数据量增长——从秒级到小时级。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
job_id = client.refresh_external_collection(
    collection_name="my_collection",
    external_source="milvus://in01-xxxxxxxxxxxxxxx/default/products"
)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/jobs/external_collection/refresh" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "my_collection",
    "externalSource": "milvus://in01-xxxxxxxxxxxxxxx/default/products"
}'
```

</TabItem>
</Tabs>

Refresh 完成后，按步骤 5 与步骤 6 创建 On-demand 集群并执行搜索。有关详细信息，请参见[将 Serving 集群的 Collection 用作数据源](./use-collection-from-a-serving-cluster-as-data-source)。

## 步骤 4：创建索引并 Refresh Collection\{#step-4-create-indexes-and-refresh-the-collection}

像在 Managed Collection 中一样，您也可以为 External  Collection 创建索引。所有向量字段都应创建索引，您也可以选择为部分标量字段创建索引，以加速元数据过滤。不过，您需要调用 Refresh 来真正构建索引。

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

然后 Refresh External Collection。您可以省略 `externalSource` 和 `externalSpec` 以复用 Collection Schema，也可以同时提供这两个参数，以基于新的数据源 Refresh Collection Schema。

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

然后，您可以通过循环调用进度监控接口来跟踪 Refresh 操作的进度。

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

## 步骤 5：创建 On-demand 集群\{#step-5-create-an-on-demand-cluster}

External Collection 准备就绪后，您需要将其附加到 On-demand 集群，以执行按需搜索。以下命令将创建一个集群并返回其 ID。

```bash
export CONTROL_PLANE_ENDPOINT="https://api.cloud.zilliz.com.cn"

curl --request POST \
--url "${CONTROL_PLANE_ENDPOINT}/v2/clusters/createOnDemandCluster" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxx",
    "regionId": "ali-cn-hangzhou",
    "clusterName": "my-on-demand",
    "cuSize": 8,
    "autoSuspend": 60
}'

# inxx-xxxxxxxxxxxxx
```

## 步骤 6：执行搜索\{#step-6-conduct-searches}

当您需要执行 Search、Query 或 Hybrid Search 时，可以通过 session 将请求附加到上一步创建的 On-demand 集群。

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
    output_fields=["product_id", "title", "main_category", "price", "average_rating", "rating_number"],
    search_params={"metric_type": "COSINE"}
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

随后，您可以进一步探索数据并找出最有价值的数据子集。然后，您可以连接到 Serving Cluster，将这些数据导入其中，并用于生产环境服务。