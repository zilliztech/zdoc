---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /describe-cluster
title: 查看集群详情
---

import RestHeader from '@site/src/components/RestHeader';

描述集群的详细信息。

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.cloud.zilliz.com.cn/v1/clusters/{clusterId}" />

---

## 示例


描述集群的详细信息。

:::info 说明

此处请使用您的 API Key 做为 Token。

:::

```shell
curl --request GET \
     --url "https://controller.api.${CLOUD_REGION_ID}.cloud.zilliz.com.cn/v1/clusters/<Cluster-ID>" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json"
```

成功响应示例：

```shell
{
    "code": 200,
    "data": {
        "clusterId": "string",
        "clusterName": "string",
        "description": "string",
        "regionId": "string",
        "clusterType": "string",
        "cuSize": "string",
        "status": "string",
        "connectAddress": "string",
        "privateLinkAddress": "string",
        "createTime": "string",
        "storageSize": "string",
        "snapshotNumber": "string",
        "createProgress": "string"
    }
}
```



## 请求

### 参数

- 无查询参数。

- 路径参数

    | 参数名称        | 参数说明                                                                             |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLOUD_REGION_ID`  | **string**（必选）<br/>一组可用的云服务提供商和云服务区域，如“ali-cn-hangzhou”。|
    | `clusterId`  | **string**（必选）<br/>目标集群 ID。|

### 请求体

无请求体。

## 响应

集群信息，以数组形式返回。

### 响应体

- 处理请求成功后返回

```json
{
    "code": 200,
    "data": {
        "clusterId": "string",
        "clusterName": "string",
        "clusterType": "string",
        "connectAddress": "string",
        "createProgress": "integer",
        "createTime": "string",
        "cuSize": "integer",
        "description": "string",
        "privateLinkAddress": "string",
        "regionId": "string",
        "snapshotNumber": "integer",
        "status": "string",
        "storageSize": "integer"
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
| `data.clusterId`   | **string**<br/>集群 ID。 |
| `data.clusterName`   | **string**<br/>集群名称。 |
| `data.description`   | **string**<br/>（可选）集群描述信息。 |
| `data.regionId`   | **string**<br/>集群所在的地域 ID。 |
| `data.clusterType`   | **string**<br/>集群使用的 CU 类型。 |
| `data.cuSize`   | **integer**<br/>集群使用的 CU 大小。 |
| `data.status`   | **string**<br/>集群当前状态。有效值：**创建中**、**运行中**、**挂起中**和**恢复中**。 |
| `data.connectAddress`   | **string**<br/>集群的公共 Endpoint。您可以通过此地址从公网连接到集群。 |
| `data.privateLinkAddress`   | **string**<br/>集群的私有 Endpoint。您可以为集群设置私有链接，允许同一云区域中的 VPS 访问您的集群。 |
| `data.createTime`   | **string**<br/>集群创建时间。 |
| `data.storageSize`   | **integer(sint64)**<br/>集群的存储容量。 |
| `data.snapshotNumber`   | **integer**<br/>集群的快照数量。 |
| `data.createProgress`   | **integer**<br/>集群创建进程。 |
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90117 | Invalid domain name used, please check the domain name you're using. |
