---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /get
title: 按 ID 查询
---

import RestHeader from '@site/src/components/RestHeader';

在 Collection 按指定 ID 返回对应的 Entity。

<RestHeader method="post" endpoint="https://{public_endpoint}/v1/vector/get" />

---

## 示例


:::info 说明

此处请使用由冒号（:）连接的集群用户名和密码做为 Token，如 `user:password`。

:::

- 获取一个 ID 为整数的 Entity.

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
       "collectionName": "medium_articles",
       "outputFields": ["id", "title", "link"],
       "id": 1
     }'
```

- 获取一个 ID 为字符串的 Entity.

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
       "collectionName": "medium_articles",
       "outputFields": ["id", "title", "link"],
       "id": "id1"
     }'
```

- 获取一组 ID 为整数的 Entity.

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
       "collectionName": "medium_articles",
       "outputFields": ["id", "title", "link"],
       "id": [1, 2]
     }'
```

- 获取一组 ID 为字符串的 Entity.

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/get" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d "{
       "collectionName": "medium_articles",
       "outputFields": ["id", "title", "link"],
       "id": ["id1", "id2"]
     }"
```



## 请求

### 参数

- 无查询参数。

- 路径参数

    | 参数名称        | 参数说明                                                                             |
    |------------------|-------------------------------------------------------------------------------------------|
    | `public-endpoint`  | **string**（必选）<br/>目标集群的 Endpoint。|

### 请求体

```json
{
    "collectionName": "string",
    "id": "string",
    "outputFields": []
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `outputFields`  | **array**<br/>返回字段，以数组形式表示。|
| `id`  | **string**（必选）<br/>待查询的 Entity ID。|

```json
{
    "collectionName": "string",
    "id": [],
    "outputFields": []
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `outputFields`  | **array**<br/>目标集群名称。|
| `id`  | **array**（必选）<br/>一组待查询的 Entity ID。|

```json
{
    "collectionName": "string",
    "id": "integer",
    "outputFields": []
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `outputFields`  | **array**<br/>返回字段，以数组形式表示。|
| `id`  | **integer**（必选）<br/>待查询的 Entity ID。|

```json
{
    "collectionName": "string",
    "id": [],
    "outputFields": []
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `outputFields`  | **array**<br/>返回字段，以数组形式表示。|
| `id`  | **array**（必选）<br/>一组待查询的 Entity ID。|

## 响应

返回查询结果。

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
| `data`  | **array**<br/>表示响应中携带的 object 数组. |
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 80000 | Incorrect parameter: xxx |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 90001 | The collection xxx does not exist. You can use ListCollections to view the list of existing collections. |
| 90002 | The return value property xxx does not exist on collection xxx. |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90110 | No filter key field. |
| 90133 | No get content provided. |
| 90139 | Type mismatch for field 'xxx'. expected type:xxx, but received input:xxx. |
| 90140 | The number of elements in parameter 'id' should not exceed 100. |
