---
title: "按需 DQL 操作 | Cloud"
slug: /dql-sessions-external-collection
sidebar_key: dql-sessions-external-collection
sidebar_label: "DQL Sessions"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: PUBLIC
notebook: FALSE
description: "按需计算中 Collection 的 DQL 操作（例如 Search、Query、Get 和 Hybrid Search）需要指定使用的 On-demand 集群计算资源。Zilliz Cloud 支持通过创建 Session 来满足您的按需计算需求。 | Cloud"
type: origin
token: M8sXwe8wjimmSMkDqMMcE5Ojnlc
sidebar_position: 3
keywords: 
  - 向量数据库
  - zilliz
  - milvus
  - 大模型向量数据库
  - 管理
  - external collection
  - collections
  - session

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 按需 DQL 操作

按需计算中 Collection 的 DQL 操作（例如 Search、Query、Get 和 Hybrid Search）需要指定使用的 On-demand 集群计算资源。Zilliz Cloud 支持通过创建 Session 来满足您的按需计算需求。

本文假设您已经通过项目 Endpoint 在某个数据库中创建了 Collection。有关详细信息，请参见[创建 External Collection](./create-external-collection).

## 连接项目 Endpoint\{#connect-to-a-project-endpoint}

项目 Endpoint 允许您访问按需计算资源。您可以使用它来管理 On-demand 集群和 Database，以及操作存储在 Collection 中的数据。

以下代码示例假设您在默认数据库中已有一个名为 `my_collection` 的 External Collection。另外，您应始终使用具有足够权限的有效 API 密钥来建立连接。

```python
client = MilvusClient(
    uri="https://{project-id}.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)

client.has_collection(
    collection_name="my_collection"
)
```

```typescript
const client = new MilvusClient({
    address: "https://{project-id}.{region}.vectordb.zillizcloud.com",
    token: "YOUR_API_KEY"
});

client.has_collection({
    collection_name: "my_collection"
});
```

```bash
export PROJECT_ENDPOINT='https://{project-id}.{region}.vectordb.zillizcloud.com'
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/has" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "collectionName": "my_collection"
}'
```

## 创建 Session\{#create-a-session}

连接项目 Endpoint 后，您可以创建一个 Session，以指定需要使用的 On-demand 集群的计算资源。

以下示例假设您已经创建了一个 On-demand 集群，其 ID 为 `inxx-xxxxxxxxxxxxxxxxx`。

<Admonition type="info" icon="📘" title="说明">

对于 RESTful 请求，您无需创建 session，只需在 DQL 调用中将集群 ID 作为查询参数传入即可。

</Admonition>

```python
session = client.session(
    cluster_id="inxx-xxxxxxxxxxxxxxxxx"
)
```

```typescript
const session = client.session("inxx-xxxxxxxxxxxxxxxxx");
```

```bash
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxxxx"
```

## 执行 DQL 操作\{#conduct-dql-operations}

Session 准备就绪后，您就可以执行 Search。以下示例以基础向量搜索为例。这同样适用于 Query、Get 和 Hybrid Search。

```python
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

```typescript
const query_vector = [0.3580376395471989, -0.6023495712049978, 0.18414012509913835, -0.26286205330961354, ..., 0.9029438446296592];
const res = session.search({
    db_name: "my_database",
    collection_name: "my_collection",
    anns_field: "vector",
    data: [query_vector],
    limit: 3,
    output_fields: ["product_id", "title", "main_category", "price", "average_rating", "rating_number"],
});
```

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

## 关闭 Session\{#close-a-session}

 按需计算任务完成后，您可以关闭 Session。关闭后的 Session 将无法继续用于后续 DQL 操作。

<Admonition type="info" icon="📘" title="说明">

RESTful 调用无需执行此操作。

</Admonition>

```python
session.close()
```

```typescript
session.close();
```

