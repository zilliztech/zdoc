---
title: "按需 DQL 操作 | Cloud"
slug: /dql-sessions-external-collection
sidebar_label: "按需 DQL 操作"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "对于按需计算 Collection，DQL 操作（例如 search、query、get 和 hybrid search）需要从按需 cluster 挂载计算资源。Zilliz Cloud 允许你创建 session 来满足按需计算需求。 | Cloud"
type: origin
token: H877wYI5hiZybfknCX4c9MBvnNb
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 按需 DQL 操作

对于按需计算 Collection，DQL 操作（例如 search、query、get 和 hybrid search）需要从按需 cluster 挂载计算资源。Zilliz Cloud 允许你创建 session 来满足按需计算需求。

本文假设你已使用 project endpoint 在 Database 中创建了 Collection。详情请参见[创建 External Collection](./create-external-collection)。

## 连接到 project endpoint\{#connect-to-a-project-endpoint}

project endpoint 用于访问按需计算资源。你可以使用它管理按需 cluster 和 Database，也可以操作 Collection 中存储的数据。

以下代码示例假设你已在默认 Database 中创建了一个名为 `my_collection` 的 External Collection。建立连接时，请始终使用具有足够权限的有效 API key。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
client = MilvusClient(
    uri="https://{project-id}.{region}.vectordb.zillizcloud.com",
    token="YOUR_API_KEY"
)

client.has_collection(
    collection_name="my_collection"
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const client = new MilvusClient({
    address: "https://{project-id}.{region}.vectordb.zillizcloud.com",
    token: "YOUR_API_KEY"
});

client.has_collection({
    collection_name: "my_collection"
});
```

</TabItem>

<TabItem value='bash'>

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

</TabItem>
</Tabs>

## 创建 session\{#create-a-session}

连接到 project endpoint 后，请创建一个 session，以便从指定的按需 cluster 挂载计算资源。

以下示例假设你已经创建了一个按需 cluster，其 ID 为 `inxx-xxxxxxxxxxxxxxxxx`。

<Admonition type="info" icon="📘" title="Notes">

对于 RESTful 请求，无需创建 session。你应将 cluster ID 作为 query parameter 传给 DQL 调用。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
session = client.session(
    cluster_id="inxx-xxxxxxxxxxxxxxxxx"
)
```

</TabItem>

<TabItem value='javascript'>

```javascript
const session = client.session("inxx-xxxxxxxxxxxxxxxxx");
```

</TabItem>

<TabItem value='bash'>

```bash
export CLUSTER_ID="inxx-xxxxxxxxxxxxxxxxx"
```

</TabItem>
</Tabs>

## 执行 DQL 操作\{#conduct-dql-operations}

session 准备好后，即可执行搜索。以下示例以基础向量搜索为例。该流程同样适用于 query、get 和 hybrid search。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
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

<TabItem value='javascript'>

```javascript
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

## 关闭 session\{#close-a-session}

按需计算任务完成后，可以关闭 session。已关闭的 session 不能继续用于 DQL 操作。

<Admonition type="info" icon="📘" title="Notes">

RESTful 调用不需要执行此步骤。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"NodeJS","value":"javascript"}]}>
<TabItem value='python'>

```python
session.close()
```

</TabItem>

<TabItem value='javascript'>

```javascript
session.close();
```

</TabItem>
</Tabs>