---
displayed_sidebar: restfulSidebar
slug: /restful
title: RESTful API 参考
description: Zilliz Cloud 提供 RESTful API，供您管理集群、集合以及其中存储的数据。
beta: FALSE
notebook: FALSE
sidebar_label: RESTful API 参考
sidebar_position: 0
keywords:
  - zilliz cloud
  - zilliz
  - cloud
  - api
  - restful
  - overview
---

# RESTful API 参考

Zilliz Cloud 提供 RESTful API，供您操作集群、Collection 以及其中存储的数据。

Zilliz Cloud 使用控制平面（Control Plane）对集群及相关资源进行集中管理，而数据平面（Data Plane）负责特定 Collection 内的数据存储与处理。

## 控制平面 API

使用控制平面 API 时，您需要使用**有效的 API Key**来进行请求鉴权。

以下示例用于列出所有可用的云服务提供商。

```shell
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
    --url "https://api.cloud.zilliz.com.cn/v2/clouds" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Content-Type: application/json"
```

## 数据平面 API

使用数据平面 API 时，您需要使用正确的凭证进行鉴权。

以下示例用于列出指定服务集群中的所有 Collection。您可以使用**有效的 API Key**，或使用**有效的集群用户名与密码组合**进行鉴权。

```shell
export CLUSTER_ENDPOINT="https://{cluster_id}.{region}.vectordb.zilliz.com.cn"
export TOKEN="db_admin:xxxxxxxxxxxx"

curl --request GET \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{}'
```

以下示例展示如何通过项目端点列出所有可用 Collection。此方式仅支持使用**有效的 API Key**进行鉴权。

```shell
export PROJECT_ENDPOINT="https://{project_id}.{region}.api.cloud.zilliz.com.cn"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

## 请求超时

对于控制平面 API，如果请求发出后 1 分钟内未收到响应，则请求超时。

对于数据平面 API，您可以在请求头中设置 `Request-Timeout` 以指定服务端的超时时长。如下示例中，请求超时设置为 5，表示请求发出 5 秒后若仍未收到响应，将返回 HTTP 408。

合理设置请求超时有助于 Zilliz Cloud 集群及时释放资源。通常情况下，5 到 10 秒的超时时间已足够；但您仍应根据实际情况（如网络状况和服务负载）进行调整。

```shell
export CLUSTER_ENDPOINT="https://{cluster_id}.{region}.vectordb.zilliz.com.cn"
export TOKEN="db_admin:xxxxxxxxxxxx"

curl --request GET \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 10"
    --header "Content-Type: application/json" \
    -d '{}'
```

<!-- openapi-downloads -->
