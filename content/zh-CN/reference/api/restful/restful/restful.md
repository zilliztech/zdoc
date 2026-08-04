---
displayed_sidbar: restfulSidebar
slug: /restful
title: RESTful API 概览
description: Zilliz Cloud 提供 RESTful API，供您操作集群、集合以及其中存储的数据。
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

import Admonition from '@theme/Admonition';


# RESTful API 概览

Zilliz Cloud 提供 RESTful API，供您操作集群、集合以及其中存储的数据。这些 API 覆盖的对象包括集群本身、集群中的集合，以及集合内保存的数据。您可以根据要操作的资源类型，选择相应的 API 类别并准备对应的认证信息。

Zilliz Cloud 使用控制平面集中管理集群及相关资源，而数据平面负责特定集合中的数据存储和处理。也就是说，控制平面与集群及其相关资源的管理相关；数据平面则与指定集合内的数据存储和处理相关。理解这一区分有助于在阅读本 RESTful API 参考时判断应使用哪一类 API，以及应采用哪种凭据来完成请求认证。

以下小节分别介绍控制平面 API 和数据平面 API 的认证要求，并给出对应的请求示例。控制平面 API 示例展示如何列出所有可用的云服务提供商；数据平面 API 示例展示如何列出指定集群中的所有可用集合。示例中的占位符（例如 `${API_KEY}`、`${TOKEN}` 和 `${CLUSTER_ENDPOINT}`）需要按实际环境替换为有效值。

## 控制平面 API

- 使用控制平面 API 时，您需要使用**有效的 API key**对请求进行身份验证。

    控制平面 API 用于通过控制平面集中管理集群及相关资源。因此，在调用这类 API 时，请在请求中提供有效的 API key。该凭据用于对您的请求进行认证，确保请求可以被识别为来自具备相应凭据的调用方。

    以下示例展示了如何列出所有可用的云服务提供商。

    ```shell
    export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

    curl --request GET \
        --url "https://api.cloud.zilliz.com/v2/clouds" \
        --header "Authorization: Bearer ${API_KEY}" \
        --header "accept: application/json" \
        --header "content-type: application/json"
    ```

## 数据平面 API

- 使用数据平面 API 时，您可以使用**有效的 API key，或有效的集群用户名和密码组合**对请求进行身份验证。

    数据平面 API 与特定集合中的数据存储和处理相关。调用这类 API 时，认证方式可以是有效的 API key，也可以是有效的集群用户名和密码组合。请根据您准备用于认证的凭据类型，在请求中提供相应的认证信息。

    以下示例展示了如何列出指定集群中所有可用的集合。

    ```shell
    export CLUSTER_ENDPOINT="YOUR_CLUSTER_ENDPOINT"
    export TOKEN="db_admin:xxxxxxxxxxxx"

    curl --request GET \
        --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
        --header "Authorization: Bearer ${TOKEN}" \
        --header "accept: application/json" \
        --header "content-type: application/json" \
        -d '{}'
    ```
