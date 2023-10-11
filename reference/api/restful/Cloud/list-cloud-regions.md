---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /list-cloud-regions
title: 查看云服务区域
---

import RestHeader from '@site/src/components/RestHeader';

列出指定云服务提供商的所有可用云区域。

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.cloud.zilliz.com.cn/v1/regions" />

---

## 示例


列出指定云服务提供商的所有可用云区域。

:::info 说明

此处请使用您的 API Key 做为 Token。

:::

```shell
curl --request GET \
     --url "https://controller.api.${CLOUD_REGION_ID}.cloud.zilliz.com.cn/v1/regions?cloudId=ali" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "accept: application/json" \
     --header "content-type: application/json"
```

您可以使用 `ListClouds` 接口获取 `cloudId`。

成功响应示例：

```shell
{
    "code": 200,
    "data": [
        {
            "apiBaseUrl": "https://api.ali-cn-hangzhou.cloud.zilliz.com.cn",
            "cloudId": "ali",
            "regionId": "ali-cn-hangzhou"
        }
    ]
}
```



## 请求

### 参数

- 查询参数

    | 参数名称          | 参数说明                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `cloudId`  | **string**<br/>云服务提供商 ID。|

- 路径参数

    | 参数名称        | 参数说明                                                                             |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLOUD_REGION_ID`  | **string**（必选）<br/>一组可用的云服务提供商和云服务区域，如“ali-cn-hangzhou”。|

### 请求体

无请求体。

## 响应

返回指定云服务提供商的所有可用云区域。

### 响应体

- 处理请求成功后返回

```json
{
    "code": 200,
    "data": [
        {
            "apiBaseUrl": "string",
            "cloudId": "string",
            "regionId": "string"
        }
    ]
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
| `data.cloudId`   | **string**<br/>云服务提供商的 ID。 |
| `data.regionId`   | **string**<br/>可用云区域的 ID。 |
| `data.apiBaseUrl`   | **string**<br/>公共 API Endpoint 的 Base URL。 |
| `message`  | **string**<br/>具体描述请示错误的原因。 |

## 错误码清单

| 错误码 | 错误消息 |
| ---- | ------------- |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 90117 | Invalid domain name used, please check the domain name you're using. |
