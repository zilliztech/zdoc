---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /resume-cluster
title: 恢复集群
---

import RestHeader from '@site/src/components/RestHeader';

恢复当前已挂起的集群。

<RestHeader method="post" endpoint="https://controller.api.{cloud-region}.cloud.zilliz.com.cn/v1/clusters/{clusterId}/resume" />

---

## 示例


恢复当前已挂起的集群。

:::info 说明

此处请使用您的 API Key 做为 Token。
请在添加支付方式后使用该功能。

:::

```shell
curl --request POST \ "https://controller.api.${CLOUD_REGION_ID}.cloud.zilliz.com.cn/v1/clusters/<Cluster-ID>/resume" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json"
```

成功响应示例：

```shell
{
  code: 200,
  data: {
     "clusterId": "cluster01",
     "prompt": "Submission successful. Cluster is currently resuming, which typically takes several minutes. You can use the DescribeCluster interface to obtain the creation progress and the status of the Cluster. When the Cluster's status is RUNNING, you can access your vector database using the SDK."
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

集群 ID。

### 响应体

- 处理请求成功后返回

```json
{
    "code": 200,
    "data": {
        "clusterId": "string",
        "prompt": "string"
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
| `data.prompt`   | **string**<br/>操作成功的回显信息。 |
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80021 | Serverless cluster not support this operation. |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90117 | Invalid domain name used, please check the domain name you're using. |
