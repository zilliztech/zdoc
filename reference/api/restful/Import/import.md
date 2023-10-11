---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /import
title: 导入
---

import RestHeader from '@site/src/components/RestHeader';

从指定的对象存储桶中的文件导入数据。该对象存储桶须与目标集群处于同一公有云网络。

<RestHeader method="post" endpoint="https://controller.api.{cloud-region}.cloud.zilliz.com.cn/v1/vector/collections/import" />

---

## 示例


从指定的对象存储桶中的文件导入数据。该对象存储桶须与目标集群处于同一公有云网络。

:::info 说明

此处请使用您的 API Key 做为 Token。

:::

```shell
curl --request POST \
     --url "https://controller.api.${CLOUD_REGION_ID}.cloud.zilliz.com.cn/v1/vector/collections/import" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
     -d '{
       "clusterId": "in03-181766e3f9556b7",
       "collectionName": "medium_articles",
       "objectUrl": "gs://publicdataset-zillizcloud-com/medium_articles_2020.json"
       "accessKey": "your-access-key"
       "secretKey": "your-secret-key"
     }'
```



## 请求

### 参数

- 无查询参数。

- 路径参数

    | 参数名称        | 参数说明                                                                             |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLOUD_REGION_ID`  | **string**（必选）<br/>一组可用的云服务提供商和云服务区域，如“ali-cn-hangzhou”。|

### 请求体

```json
{
    "accessKey": "string",
    "clusterId": "string",
    "collectionName": "string",
    "objectUrl": "string",
    "secretKey": "string"
}
```

| 参数名称        | 参数描述                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| `clusterId`  | **string**（必选）<br/>目标集群 ID。|
| `collectionName`  | **string**（必选）<br/>目标 Collection 名称。|
| `objectUrl`  | **string**（必选）<br/>用于存储待导入数据的对象的 URL。|
| `accessKey`  | **string**<br/>用于访问指定对象的访问密钥（AK）。|
| `secretKey`  | **string**<br/>用于访问指定对象的访问密钥（SK）。|

## 响应

创建导入任务并返回该任务的Job ID。

### 响应体

- 处理请求成功后返回

```json
{
    "code": 200,
    "data": {
        "jobId": "string"
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
| `data.jobId`   | **string**<br/>已提交的导入任务 ID。 |
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 10003 | Invalid s3 ObjectUrl. [xxx] |
| 40003 | Action not available given the current status of the cluster. |
| 40021 | The cluster ID does not exist. |
| 40022 | No access to this cluster. Please request access from your admin. |
| 47005 | The specified cluster collection not exists. |
| 47005 | The specified cluster collection not exists. |
| 47035 | The specified object size exceeds limit. |
| 47036 | The number of objects not equal to the number of collection fields. |
| 47039 | The specified cluster do not support multiple imports at the same time. |
| 47053 | Failed to checkFiles {xxx}. |
| 47055 | The current cluster is currently importing data (xxx). To ensure more stable service of your Milvus cluster |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 83001 | Failed to getObjectMeta {xxx}. |
| 83001 | Failed to getObjectMeta {xxx}. |
| 83004 | Importing files across clouds is not currently supported |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90011 | Invalid CollectionName. Reason: Name contains only alphanumeric letters and underscores |
| 90102 | The cluster does not exist in current region. |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90104 | The clusterId parameter is empty in the request parameter. |
| 90117 | Invalid domain name used, please check the domain name you're using. |
| 90142 | No import content provided. |
| 90145 | No ObjectUrl key field. |
