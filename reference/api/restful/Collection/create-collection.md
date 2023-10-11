---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /create-collection
title: 创建 Collection
---

import RestHeader from '@site/src/components/RestHeader';

在集群中创建 Collection。

<RestHeader method="post" endpoint="https://{public_endpoint}/v1/vector/collections/create" />

---

## 示例


在集群中创建 Collection。本示例将创建一个名为 `medium_articles` 的 Collection。

:::info 说明

此处请使用由冒号（:）连接的集群用户名和密码做为 Token，如 `user:password`。

:::

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/collections/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
       "dbName": "default",   
       "collectionName": "medium_articles",
       "dimension": 256,
       "metricType": "L2",
       "primaryField": "id",
       "vectorField": "vector"
      }'
```

成功响应示例：

```shell
{
    "code": 200,
    "data": {}
}
```



## 请求

### 参数

- 无查询参数。

- 路径参数

    | 参数名称        | 参数说明                                                                             |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLUSTER_ENDPOINT`  | **string**（必选）<br/>目标集群的 Endpoint。|

### 请求体

```json
{
    "collectionName": "string",
    "dbName": "string",
    "description": "string",
    "dimension": "integer",
    "metricType": "string",
    "primaryField": "string",
    "vectorField": "string"
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `dbName`  | **string**<br/>待创建的 Collection 所属数据库名称。|
| `collectionName`  | **string**（必选）<br/>待创建的 Collection 名称。 <zilliz>此参数仅适用于 Dedicated 集群。</zilliz>|
| `dimension`  | **integer**（必选）<br/>指定 Collection 的向量维度。<br/>参数取值在 **1** 和 **32768** 之间.|
| `metricType`  | **string**<br/>指定 Collection 的距离度量类型。<br/>默认值为 **L2**.|
| `primaryField`  | **string**<br/>主键字段。<br/>默认值为 **id**.|
| `vectorField`  | **string**<br/>向量字段。<br/>默认值为 **vector**.|
| `description`  | **string**<br/>Collection 描述信息。|

## 响应

返回空对象。

### 响应体

- 处理请求成功后返回

```json
{
    "code": 200,
    "data": {}
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
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 80000 | Incorrect parameter: xxx |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80007 |  This CU Size requires significant resource consumption. If you want to use it, please complete the card binding on the Billing page first. |
| 80010 | Duplicated ClusterName. You have already created a running Cluster with the same name. To avoid complexity in management, please modify the name and create a new one. |
| 80014 | Your input cuSize value is not supported yet. |
| 80022 | Dedicated cluster not support this operation. |
| 90013 | The parameter shardsNum should have a value range between 1 and 32. |
| 90014 | The length of parameter description can not exceed 4096. |
| 90015 | There are no fields. Please include at least 1 primary key field and 1 vector field in the table definition. |
| 90016 | No primary key field. |
| 90017 | There can only be one primary key field for each collection. |
| 90018 | The type of the primary key field must be int64 or varchar. |
| 90019 | AutoID can only be added to the primary key field. |
| 90020 | AutoID can only be added to a primary key field of type int64. |
| 90023 | The length of the Varchar type should be between 1 and 65535. |
| 90025 | The dimension of the vector column should be between 32 and 32768. |
| 90027 | Invalid parameter metricType. Only L2 or IP are allowed. Please refer to the documentation: https://milvus.io/docs/metric.md |
| 90100 | Parse number of field xxx type error. |
| 90102 | The cluster does not exist in current region. |
| 90106 | The collection already exists. |
| 90110 | No filter key field. |
| 90112 | The field name should not be empty. |
| 90113 | The field type of field xxx should not be empty. |
| 90114 | The index field name can only be added to a vector field. |
| 90122 | No dimension key field. |
| 90136 | No create collection content provided. |
| 90139 | Type mismatch for field 'xxx'. expected type:xxx, but received input:xxx. |
