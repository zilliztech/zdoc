---
displayed_sidebar: restfulSidebar
sidebar_position: 40
slug: /restful/describe-user-v2
title: Describe User
---

import RestHeader from '@site/src/components/RestHeader';

This operation describes the detailed information of a specific user.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/users/describe" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>You can use either of the following ways to authorize:</p>
<ul>
<li> An API Key with appropriate permissions.</li>
<li>A colon-joined username and password of the target cluster. For example, `username:passowrd`.</li>
</ul>

<p>Any clusters compatible with Milvus 2.4.x or those created after the latest release (Jul 23, 2024) support this API. For clusters created before the latest release, contact us for further assistance.</p>
    
</Admonition>
```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/users/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "userName": "milvusAdmin"
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": [
        "admin"
    ]
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation.<br/>Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "userName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __userName__ | __string__  <br/>The name of the user to describe.  |

## Response

Returns the name of the roles assigned to the specified user.

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
| __data__ | __array__<br/>A list of roles already assigned to the user. |
| __data[]__ | __string__  <br/>A list of item objects.  |

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

