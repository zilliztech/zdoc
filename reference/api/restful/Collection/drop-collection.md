---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /drop-collection
title: 删除 Collection
---

import RestHeader from '@site/src/components/RestHeader';

删除 Collection。本操作会清除 Collection 数据，请谨慎执行此操作。

<RestHeader method="post" endpoint="https://{public_endpoint}/v1/vector/collections/drop" />

---

## 示例


删除 Collection。本操作会清除 Collection 数据，请谨慎执行此操作。本示例将删除一个名为 `medium_articles` 的 Collection。

:::info 说明

此处请使用由冒号（:）连接的集群用户名和密码做为 Token，如 `user:password`。

:::

```shell
curl --request POST \
     --url "${CLUSTER_ENDPOINT}/v1/vector/collections/drop" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
        "collectionName": "medium_articles"
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
    "collectionName": "string"
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|

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
| 90138 | No drop collection content provided. |
| 90139 | Type mismatch for field 'xxx'. expected type:xxx, but received input:xxx. |
