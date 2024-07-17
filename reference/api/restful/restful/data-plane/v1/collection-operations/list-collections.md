---
displayed_sidebar: restfulSidebar
sidebar_position: 6
slug: /restful/list-collections
title: List Collections
---

import RestHeader from '@site/src/components/RestHeader';

Lists collections in a cluster.

<RestHeader method="get" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/collections" />

---

## Example



<include target="zilliz">
import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
You can use eitehr of the following ways to authorize:
<ul>
<li> An API Key with appropriate permissions.</li>
<li>A colon-joined username and password of the target cluster. For example, `username:passowrd`.</li>
</ul>
    
</Admonition>
</include>

```shell
<include target="milvus">
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v1/vector/collections" \
</include>
<include target="zilliz">
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530"
export TOKEN="db_admin:xxxxxxxxxxx"

curl --location --request POST "http://${CLOUD_ENDPOINT}/v1/vector/collections" \
</include>
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" 
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": [
        "custom_setup_not_indexed",
        "quick_setup",
        "custom_setup_indexed"
    ]
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

- No header parameters required

### Request Body

No request body required

## Response

Returns a list of collections in the specified cluster.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {}
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __string__  <br/>  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

