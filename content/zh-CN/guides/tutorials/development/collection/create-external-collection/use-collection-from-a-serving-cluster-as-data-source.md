---
title: "将 Serving 集群的 Collection 用作数据源 | Cloud"
slug: /use-collection-from-a-serving-cluster-as-data-source
sidebar_label: "Collection 用作数据源"
beta: PUBLIC
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "您可以将另一 Zilliz Cloud Serving 集群上的 Collection 用作 External Collection 的数据源。 | Cloud"
type: origin
token: YVhZw2z0AiuNNnkruztcOAfMnmg
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 将 Serving 集群的 Collection 用作数据源

您可以将另一 Zilliz Cloud Serving 集群上的 Collection 用作 External Collection 的数据源。

在 Zilliz Cloud 上，`external_source` 支持两种格式：`volume://<volume_name>/<path>` 与 `milvus://<instance_id>/<db_name>/<collection_name>`。`milvus://` 指向与目标集群同项目、同地域的另一 Serving 集群（兼容 Milvus v3.0.x）上的 Collection。前缀必须小写；三段（实例/数据库/Collection）缺一不可，数据库为 `default` 时也须写明；末尾允许多一个 `/`。

## 开始前\{#before-you-start}

- 已获取具有足够权限的 **API key**（跨集群源：对目标读写、对源只读）；不支持“用户名:密码”。

- 跨集群源：源为与目标**同项目、同地域**的另一 Serving 集群（**兼容 Milvus v3.0.x**）上的普通 Collection（不能是另一张外表）；目标为按需搜索数据库，经项目端点 + 查询集群访问。

- 跨集群源（`milvus://`）当前仅支持 SDK 与 RESTful API，控制台不支持此源类型。值得注意的是，`milvus://` 仅支持如下云厂商：**阿里云、腾讯云。**

## 创建 External Collection\{#create-the-collection}

创建 Schema 时，将 `external_source` 设置为源 Collection 的 `milvus://` URI，并为每个字段设置 `external_field`，取值为源 Collection 中对应字段的名称；本示例沿用源 Collection 的字段名。`external_spec` 可以省略，因为 `milvus://` 源的格式默认为 `milvus-table`。

<Admonition type="info" title="说明">

使用 Python 时，请使用 API key 连接项目端点，并传入 `option={"cluster_id": "<query cluster id>"}`，其中 `<query cluster id>` 为查询集群的 ID，即为目标数据库提供计算资源的按需集群。有关项目端点的详细信息，请参见[连接按需搜索](./connect-for-on-demand-search)。

</Admonition>

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus import MilvusClient, DataType

# 使用 API key 和查询集群 ID 连接项目端点
client = MilvusClient(
    uri="https://{project-id}.{region}.api.zillizcloud.com",
    token="YOUR_API_KEY",
    db_name="my_database",
    option={"cluster_id": "<query cluster id>"},
)

# 将 Schema 指向源集合，省略 external_spec
schema = MilvusClient.create_schema(
    external_source="milvus://in01-xxxxxxxxxxxxxxx/default/products",
)

# 将每个字段映射到源集合中的同名字段
schema.add_field(
    field_name="product_id",
    datatype=DataType.INT64,
    external_field="product_id",
)
schema.add_field(
    field_name="product_name",
    datatype=DataType.VARCHAR,
    max_length=512,
    external_field="product_name",
)
schema.add_field(
    field_name="embedding",
    datatype=DataType.FLOAT_VECTOR,
    dim=768,
    external_field="embedding",
)

client.create_collection(
    collection_name="products_external",
    schema=schema,
)
```

</TabItem>

<TabItem value='bash'>

```bash
export PROJECT_ENDPOINT="https://{project-id}.{region}.api.zillizcloud.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "products_external",
    "schema": {
        "externalSource": "milvus://in01-xxxxxxxxxxxxxxx/default/products",
        "fields": [
            {
                "fieldName": "product_id",
                "dataType": "Int64",
                "externalField": "product_id"
            },
            {
                "fieldName": "product_name",
                "dataType": "VarChar",
                "elementTypeParams": {
                    "max_length": "512"
                },
                "externalField": "product_name"
            },
            {
                "fieldName": "embedding",
                "dataType": "FloatVector",
                "elementTypeParams": {
                    "dim": "768"
                },
                "externalField": "embedding"
            }
        ]
    }
}'
```

</TabItem>
</Tabs>

## 使用 describe 验证\{#verify-with-describe}

创建完成后，可通过 describe 操作确认该 External Collection 已绑定到源 Collection。

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
res = client.describe_collection(
    collection_name="products_external",
)

print(res)
```

</TabItem>

<TabItem value='bash'>

```bash
curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "dbName": "my_database",
    "collectionName": "products_external"
}'
```

</TabItem>
</Tabs>

`describe_collection` 原样返回传入的 `external_source` URI；`external_spec` 包含 `format`（`milvus-table`）与源绑定信息——源实例、数据库与 Collection。字段 ID 与源 Collection 保持一致（`preserve_field_ids=true`）。不返回任何凭证。

## Refresh 数据\{#refresh-data}

refresh 的本质是将外部 Collection 重新绑定到本次请求传入的 `external_source` 并同步最新数据。省略 `external_source` 时将复用已持久化的源，refresh 同样会同步最新数据。

任务状态从 `RefreshInProgress` 变为 `RefreshCompleted` 或 `RefreshFailed`。若已有刷新任务进行中，新请求会被拒绝。Zilliz Cloud 上的 refresh 需等待索引构建完成，耗时随数据量增长——从秒级到小时级。

有关如何提交 refresh 请求及查看进度，请参见创建 External Collection 中的[步骤 5: Refresh 数据](./create-external-collection#step-5-refresh-data)。

## 故障排查\{#troubleshooting}

下表列出可能遇到的错误及应对方法。

| 场景 | 错误原文 | 应对 |
| --- | --- | --- |
| URI 格式错误/缺段 | `invalid external_source: external_source must be milvus://<instance_id>/<db_name>/<collection_name>` | 修正三段式 URI |
| 源实例不存在或无读权限 | `Source cluster <id> does not exist or you do not have permission to read it.` | 核对实例 ID 与 API key 权限 |
| 源集合不存在 | `Source collection <name> on cluster <id> is unavailable: ... collection not found ...` | 核对库名/集合名 |
| format 冲突 | `external_spec.format must be "milvus-table" (or omitted) for a milvus:// source, got "parquet"` | 省略 `external_spec` 或用 `milvus-table` |
| 并发刷新 | `Refresh job <id> is already in progress for collection <name>; wait for it to complete before refreshing again.` | 等当前任务完成 |
