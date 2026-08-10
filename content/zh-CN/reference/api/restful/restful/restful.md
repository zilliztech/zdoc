---
displayed_sidbar: restfulSidebar
slug: /restful
title: RESTful API 概述
description: Zilliz Cloud 提供 RESTful API，供您管理集群、Collection 以及其中存储的数据。
beta: FALSE
notebook: FALSE
sidebar_label: RESTful API 参考
sidebar_position: 0
keywords: 
    - Zilliz Cloud
    - zilliz
    - 云
    - API
    - RESTful
    - 概述
---

import Admonition from '@theme/Admonition';


# RESTful API 概述

Zilliz Cloud 提供 RESTful API，供您管理集群、Collection 以及其中存储的数据。 

Zilliz Cloud 使用控制平面对集群及相关资源进行集中管理，而数据平面则负责特定 Collection 内的数据存储与处理。

## 控制平面 API

- 使用控制平面 API 时，您需要使用**有效的 API 密钥**对请求进行身份验证。

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

- 使用数据平面 API 时，您可以使用**有效的 API 密钥，或有效的一组集群用户名和密码**对请求进行身份验证。

    以下示例展示了如何列出指定集群中的所有可用 Collection。

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
