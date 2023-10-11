---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /list-import-jobs
title: 查看数据导入任务
---

import RestHeader from '@site/src/components/RestHeader';

列出指定集群上的数据导入任务。

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.cloud.zilliz.com.cn/v1/vector/collections/import/list" />

---

## 示例


列出指定集群上的数据导入任务。

:::info 说明

此处请使用您的 API Key 做为 Token。

:::

```shell
curl --request GET \
     --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import/list?clusterId=${CLUSTERID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
```

## 请求

### 参数

- 查询参数

    | 参数名称          | 参数说明                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `clusterId`  | **string**（必选）<br/>Zilliz Cloud 集群 ID。|
    | `pageSize`  | **string**<br/>每次返回的导入任务数量。|
    | `currentPage`  | **string**<br/>当前页码。|

- 路径参数

    | 参数名称        | 参数说明                                                                             |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLOUD_REGION_ID`  | **string**（必选）<br/>|

### 请求体

无请求体。

## 响应

返回一个导入任务列表。

### 响应体

- 处理请求成功后返回

```json
{
    "code": 200,
    "data": {
        "count": "string",
        "currentPage": "string",
        "pageSize": "string",
        "records": [
            {
                "collectionName": "string",
                "jobId": "string",
                "state": "string"
            }
        ]
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
| `data.count`   | **string**<br/>当前响应中包含的导入任务数量。 |
| `data.currentPage`   | **string**<br/>当前页码。 |
| `data.pageSize`   | **string**<br/>每次返回的最大记录数量。 |
| `data.records`   | **array**<br/> |
| `data.records[].collectionName`   | **string**<br/>当前导入任务对应的目标 Collection 名称。 |
| `data.records[].jobId`   | **string**<br/>当前导入任务的 ID。 |
| `data.records[].state`   | **string**<br/>当前导入任务的状态。可能的取值有： <b>ImportRunning</b>、<b>ImportCompleted</b> 和 <b>ImportFailed</b>. |
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 40021 | The cluster ID does not exist. |
| 40022 | No access to this cluster. Please request access from your admin. |
| 80000 | Incorrect parameter: xxx |
| 80003 | The parameter value for 'pageSize' should be between 5 and 100. |
| 80004 | The parameter 'currentPage' should have a value between 1 and the maximum value of Int. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 90102 | The cluster does not exist in current region. |
| 90104 | The clusterId parameter is empty in the request parameter. |
| 90117 | Invalid domain name used, please check the domain name you're using. |
