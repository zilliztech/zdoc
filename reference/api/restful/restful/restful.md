---
displayed_sidbar: restfulSidebar
slug: /restful
title: RESTful API Overview
description: Zilliz Cloud offers RESTful APIs for you to manipulate your clusters, collections, and data stored in them.
beta: FALSE
notebook: FALSE
sidebar_label: RESTful API Reference
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


# RESTful API Overview

Zilliz Cloud offers RESTful APIs for you to manipulate your clusters, collections, and data stored in them. 

Zilliz Cloud uses the control plane to centralize the management of clusters and related resources, while the data plane is responsible for data storage and processing within a specific collection.

## Control plane API

When using the Control Plane APIs, you need to use **a valid API key** to authenticate your requests.

The following is an example of listing all the available cloud providers.

```shell
export API_KEY="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

curl --request GET \
    --url "https://api.cloud.zilliz.com/v2/clouds" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "Content-Type: application/json"
```

## Data plane API

When using the Data Plane APIs, you need to use the correct credentials to authenticate.

The following is an example of listing all the available collections in the specified serving cluster. You can use **either a valid API key or a valid pair of cluster username and password** to authenticate your requests.

```shell
export CLUSTER_ENDPOINT="https://{cluster_id}.{region}.vectordb.zillizcloud.com"
export TOKEN="db_admin:xxxxxxxxxxxx"

curl --request GET \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Content-Type: application/json" \
    -d '{}'
```

The following is an example of listing all available collections using project endpoint. You can only use **a valid API key** to authenticate your requests.

```shell
export PROJECT_ENDPOINT="https://{project_id}.{region}.api.zillizcloud.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${PROJECT_ENDPOINT}/v2/vectordb/collections/list" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{}'
```

## Request Timeout

For Control Plane APIs, requests time out 1 minute after the request is sent if no response is received.

For Data Plane APIs, you can set a `Request-Timeout` header for a request on the data plane to determine the timeout duration for the request at the server side. For example, the following request has its request timeout set to 5, indicating that the request fails with HTTP 408 if no response is received 5 seconds after the request is sent.

A proper request timeout may help your Zilliz Cloud clusters to release resources in time. In common cases, a timeout duration of 5 to 10 seconds suffices. However, you should set it based on your actual situations, such as network conditions and service payload.

```shell
export CLUSTER_ENDPOINT="https://{cluster_id}.{region}.vectordb.zillizcloud.com"
export TOKEN="db_admin:xxxxxxxxxxxx"

curl --request GET \
    --url "${CLUSTER_ENDPOINT}/v2/vectordb/collections/list" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 10"
    --header "Content-Type: application/json" \
    -d '{}'
```

<!-- openapi-downloads -->
