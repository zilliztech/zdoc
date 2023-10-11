---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /describe-collection
title: 查看 Collection 详情
---

import RestHeader from '@site/src/components/RestHeader';

描述 Collection 的详细信息。

<RestHeader method="get" endpoint="https://{public_endpoint}/v1/vector/collections/describe" />

---

## 示例


描述 Collection 的详细信息。本示例将查看一个名为 `medium_articles` 的 Collection。

:::info 说明

此处请使用由冒号（:）连接的集群用户名和密码做为 Token，如 `user:password`。

:::

```shell
curl --request GET \
     --url "${CLUSTER_ENDPOINT}/v1/vector/collections/describe?collectionName=medium_articles" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json"
```

成功响应示例：

```shell
{
    "code": 200,
    "data": {
        "collectionName": "string",
        "description": "string",
        "fields": [
            {
                "autoId": true,
                "description": "string",
                "name": "string",
                "primaryKey": true,
                "type": "string"
            }
        ],
        "indexes": [
            {
                "fieldName": "string",
                "indexName": "string",
                "metricType": "string"
            }
        ],
        "load": "string",
        "shardsNum": 0,
        "enableDynamicField": true
    }
}
```



## 请求

### 参数

- 查询参数

    | 参数名称          | 参数说明                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|

- 路径参数

    | 参数名称        | 参数说明                                                                             |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLUSTER_ENDPOINT`  | **string**（必选）<br/>目标集群的 Endpoint。|

### 请求体

无请求体。

## 响应

返回指定 Collection 的详细信息。

### 响应体

- 处理请求成功后返回

```json
{
    "code": 200,
    "data": {
        "collectionName": "string",
        "description": "string",
        "enableDynamicField": "boolean",
        "fields": [
            {
                "autoId": "boolean",
                "description": "string",
                "name": "string",
                "primaryKey": "boolean",
                "type": "string"
            }
        ],
        "indexes": [
            {
                "fieldName": "string",
                "indexName": "string",
                "metricType": "string"
            }
        ],
        "load": "string",
        "shardsNum": "integer"
    }
}
```

- 处理请求失败后返回

```json
{
    "code": integer,
    "message": string
}
```

### 属性

下表罗列了响应包含的所有属性。

| 属性名称  | 属性描述                                                                                                                               |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `code`   | **integer**<br/>表示请求是否成功。<br/><ul><li>`200`：请求成功。</li><li>其它：存在错误。</li></ul> |
| `data`    | **object**<br/>表示响应中携带的数据对象。 |
| `data.collectionName`   | **string**<br/>Collection 名称。 |
| `data.description`   | **string**<br/>（可选）Collection 描述信息。 |
| `data.fields`   | **array**<br/>字段数组。 |
| `data.fields[].autoId`   | **boolean**<br/>是否为主键启用自动 ID。 |
| `data.fields[].description`   | **string**<br/>（可选）字段描述。 |
| `data.fields[].name`   | **string**<br/>字段名称。 |
| `data.fields[].primaryKey`   | **boolean**<br/>是否为主键。 |
| `data.fields[].type`   | **string**<br/>该字段的数据类型。 |
| `data.indexes`   | **array**<br/>索引数组。 |
| `data.indexes[].fieldName`   | **string**<br/>索引字段名称。 |
| `data.indexes[].indexName`   | **string**<br/>生成的索引文件名称。 |
| `data.indexes[].metricType`   | **string**<br/>索引类型。 |
| `data.load`   | **string**<br/>Collection 的加载状态。有效值：**未加载**、**加载中**和**已加载**。 |
| `data.shardsNum`   | **integer**<br/>Collection 的分片数量。 |
| `data.enableDynamicField`   | **boolean**<br/>Collection 是否启用了动态 Schema。 |
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 80000 | Incorrect parameter: xxx |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80022 | Dedicated cluster not support this operation. |
| 90001 | The collection xxx does not exist. You can use ListCollections to view the list of existing collections. |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
