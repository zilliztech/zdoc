---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /get-import-progress
title: 查看导入进度
---

import RestHeader from '@site/src/components/RestHeader';

获取指定导入任务的进度。

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.cloud.zilliz.com.cn/v1/vector/collections/import/get" />

---

## 示例


获取指定导入任务的进度。

:::info 说明

此处请使用您的 API Key 做为 Token。

:::

```shell
curl --request GET \
     --url "https://controller.api.${CLOUD_REGION_ID}.cloud.zilliz.com.cn/v1/vector/collections/import/get?jobId=${JOBID}&clusterId=${CLUSTERID}" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json" \
```



## 请求

### 参数

- 查询参数

    | 参数名称          | 参数说明                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `jobId`  | **string**（必选）<br/>指定的导入任务 ID。|
    | `clusterId`  | **string**（必选）<br/>应用当前操作的集群 ID。|

- 路径参数

    | 参数名称        | 参数说明                                                                             |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLOUD_REGION_ID`  | **string**（必选）<br/>一组可用的云服务提供商和云服务区域，如“ali-cn-hangzhou”。|

### 请求体

无请求体。

## 响应

以百分比的形式返回指定的导入任务的进度。

### 响应体

- 处理请求成功后返回

```json
{
    "code": 200,
    "data": {
        "collectionName": "string",
        "completeTime": "string",
        "details": [
            {
                "completeTime": "string",
                "errorMessage": "string",
                "fileName": "string",
                "fileSize": "integer",
                "readyPercentage": "number"
            }
        ],
        "errorMessage": "string",
        "fileName": "string",
        "fileSize": "integer",
        "jobId": "string",
        "readyPercentage": "number"
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
| `data.fileName`   | **string**<br/>对象存储中数据文件对象的路径。 |
| `data.fileSize`   | **integer(int64)**<br/>数据文件对象的大小。 |
| `data.readyPercentage`   | **number(float)**<br/>导入进度的百分比指示器。 |
| `data.completeTime`   | **string**<br/>导入任务完成的预计持续时间（以秒为单位）。 |
| `data.errorMessage`   | **string**<br/>导入失败的原因说明。 |
| `data.collectionName`   | **string**<br/>导入任务对应的目标 Collection 名称。 |
| `data.jobId`   | **string**<br/>导入任务的 ID。 |
| `data.details`   | **array**<br/>导入任务详情。 |
| `data.details[].fileName`   | **string**<br/>正在导入的文件路径。 |
| `data.details[].fileSize`   | **integer(int64)**<br/>正在导入的文件大小。 |
| `data.details[].readyPercentage`   | **number(float)**<br/>当前文件的导入进度。 |
| `data.details[].completeTime`   | **string**<br/>当前文件完成导入的时间。值为 `null` 时表示文件正在导入。 |
| `data.details[].errorMessage`   | **string**<br/>对于导入失败的提示信息。值为 `null` 时表示无错误发生。 |
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 40021 | The cluster ID does not exist. |
| 40022 | No access to this cluster. Please request access from your admin. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 90102 | The cluster does not exist in current region. |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90104 | The clusterId parameter is empty in the request parameter. |
| 90117 | Invalid domain name used, please check the domain name you're using. |
| 90144 | No jobId record found under this cluster |
