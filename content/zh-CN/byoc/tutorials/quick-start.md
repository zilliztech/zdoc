---
title: "快速开始：使用 Serving 集群 | BYOC"
slug: /quick-start
sidebar_label: "快速开始：使用 Serving 集群"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Serving Cluster 同时集成了计算和存储能力，用于实时生产服务。在通过 Extract-Transform-Load（ETL）流水线清洗数据之后，您可以将数据导入 Serving Cluster。 | BYOC"
type: origin
token: TwqiwuXRli0B1nk43AJcxjewnUc
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 快速开始：使用 Serving 集群

Serving Cluster 同时集成了计算和存储能力，用于实时生产服务。在通过 Extract-Transform-Load（ETL）流水线清洗数据之后，您可以将数据导入 Serving Cluster。

## 开始之前\{#before-you-start}

Zilliz Cloud 提供 Bring-Your-Own-Cloud（BYOC）解决方案，使组织能够在自己的云账户中托管应用程序和数据，而不是托管在 Zilliz Cloud 的基础设施上。有关 BYOC 解决方案的详细信息，请参见[BYOC 简介](./byoc-intro)。

下图展示了如何开始使用 BYOC 解决方案的步骤。

![LwMFwwuSnhGASpbf4nscwD25nQe](https://zdoc-images.oss-cn-hangzhou.aliyuncs.com/LwMFwwuSnhGASpbf4nscwD25nQe.png)

在使用本指南前，请确保

- 您已[注册 Zilliz Cloud 账号](https://cloud.zilliz.com.cn/signup)。

    详情见[注册账号](https://docs.zilliz.com.cn/docs/byoc/register-with-zilliz-cloud)。

- 您已经联系了 Zilliz Cloud 技术支持并向我们提供您的账号信息。

    <Admonition type="info" icon="📘" title="说明">

    Zilliz BYOC 部署方案目前处于**正式可用**阶段。如需了解详情或试用，请联系 [Zilliz Cloud 技术支持](https://zilliz.com.cn/contact-sales)。

    </Admonition>

- 您的 BYOC 组织和项目均已就绪。

如下步骤假设您已经创建了 Zilliz Cloud Serving 集群，获取了可以访问该集群的 API Key 或鉴权凭据，并安装了相关 SDK。

## 步骤 1：建立连接\{#step-1-set-up-connection}

获取集群凭证后，您可以通过以下示例代码连接到集群。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

SERVING_CLUSTER_ENDPOINT = "https://{cluster-id}.{region}.vectordb.zillizcloud.com.cn:19530"
TOKEN = "YOUR_CLUSTER_TOKEN" 
# A valid token could be 
# 
# - A colon-joined cluster username and password, as in `user:pass`

# 1. Set up a Milvus client
client = MilvusClient(
    uri=SERVING_CLUSTER_ENDPOINT,
    token=TOKEN 
)
```

</TabItem>

<TabItem value='bash'>

```bash
export CLOUD_PLATFORM_ENDPOINT="https://api.cloud.zilliz.com.cn"
export SERVING_CLUSTER_ENDPOINT="https://{cluster-id}.{region}.vectordb.zillizcloud.com:19530"
export TOKEN="YOUR_CLUSTER_TOKEN"
# A valid token could be 
# 
# - A colon-joined cluster username and password, as in `user:pass`
```

</TabItem>
</Tabs>

## 步骤 2:（可选）创建 Database\{#step-2-optional-create-a-database}

Serving Cluster 默认会自带一个 Default Database。如果您使用 Default Database，可以跳过此步骤。您也可以按如下方式创建 Database：

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
# connect to the serving cluster
client = MilvusClient(
    # a cluster-specific endpoint
    uri=SERVING_CLUSTER_ENDPOINT,
    token=TOKEN
)

client.create_database(
    db_name="my_database"
)
```

</TabItem>

<TabItem value='bash'>

```bash
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

## 步骤 3：创建 Collection\{#step-3-create-a-collection}

Database 准备就绪后，您可以在其中创建 Managed Collection。与将 Collection 列映射到外部数据文件的 External Collection 不同，Managed Collection 需要您导入数据。

以下示例演示了如何定义 Collection Schema 并创建 Collection。

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

然后，您可以使用上述 Schema 创建一个 Collection。如果您决定使用 Default Database，可以直接省略 `db_name` 参数。

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

## 步骤 4：创建 Index\{#step-4-create-indexes}

 您需要为所有向量字段创建索引，并可按需为特定标量字段创建索引。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
index_params = client.prepare_index_params()

# Add indexes
index_params.add_index(
    field_name="embedding",
    index_type="AUTOINDEX",
    metric_type="COSINE"
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
--url "${SERVING_CLUSTER_ENDPOINT}/v2/vectordb/indexes/create" \
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

## 步骤 5：加载 Collection\{#step-5-load-the-collection}

索引准备好后，将 Collection 加载到内存中。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client.load_collection(
    db_name="my_database",
    collection_name="prod_collection"
)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${SERVING_CLUSTER_ENDPOINT}/v2/vectordb/collections/load" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "prod_collection"
}'
```

</TabItem>
</Tabs>

## 步骤 6：导入数据\{#step-6-import-data}

完成上述设置后，您可以导入已处理的数据。以下示例假设您已将处理后的数据存储在外部存储桶中。

有关存储桶或存储集成中支持的数据格式，请参见[支持的数据格式](./data-import-format-options)。

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
    url="https://api.cloud.zilliz.com.cn",
    project_id="proj-xxxxxxxxxxxxxxxxxxx",
    region_id="ali-cn-hangzhou",
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
export CLOUD_PLATFORM_ENDPOINT="https://api.cloud.zilliz.com.cn"

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

 获得返回的 job ID 后，您可以监控导入进度。

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

## 步骤 7：执行搜索\{#step-6-conduct-searches}

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

