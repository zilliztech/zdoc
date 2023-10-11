---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /delete
title: 删除 Entity
---

import RestHeader from '@site/src/components/RestHeader';

从 Collection 中删除一条或多条数据。

<RestHeader method="post" endpoint="https://{public_endpoint}/v1/vector/delete" />

---

## 示例


:::info 说明

此处请使用由冒号（:）连接的集群用户名和密码做为 Token，如 `user:password`。

:::

- 删除一个 ID 为整数的 Entity.

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
       "collectionName": "medium_articles",
       "id": 1
     }'
```

- 删除一个 ID 为字符串的 Entity.

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
       "collectionName": "medium_articles",
       "id": "id1"
     }'
```

- 删除一组 ID 为整数的 Entity.

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
        "collectionName": "medium_articles",
        "id": [1,2,3,4]
      }'
```

- 删除一组 ID 为字符串的 Entity.

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/delete" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
        "collectionName": "medium_articles",
        "id": ["id1", "id2", "id3","id4"]
      }'
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
    "id": "string"
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `id`  | **string**（必选）<br/>目标 Entity ID。|

```json
{
    "collectionName": "string",
    "id": []
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `id`  | **array**（必选）<br/>一组 Entity ID。|

```json
{
    "collectionName": "string",
    "id": "integer"
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `id`  | **integer**（必选）<br/>目标 Entity ID。|

```json
{
    "collectionName": "string",
    "id": []
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `id`  | **array**（必选）<br/>一组 Entity ID。|

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
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80022 | Dedicated cluster not support this operation. |
| 90001 | The collection xxx does not exist. You can use ListCollections to view the list of existing collections. |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90110 | No filter key field. |
| 90123 | The inputted ID value does not match the field xxx, expecting xxx but received xxx instead. |
| 90124 | no id key field, please check your request. |
| 90127 | Please use xxx in (a,b,c) filtering in the expression. |
| 90128 | Not contains data to filter, please check the filter field |
| 90129 | Filter dataType not support, please check the filter field |
| 90132 | No delete content provided. |
| 90139 | Type mismatch for field 'xxx'. expected type:xxx, but received input:xxx. |
| 90140 | The number of elements in parameter 'id' should not exceed 100. |
