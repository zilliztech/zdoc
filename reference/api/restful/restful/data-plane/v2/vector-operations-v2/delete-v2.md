---
displayed_sidebar: restfulSidebar
sidebar_position: 8
slug: /restful/delete-v2
title: Delete
---

import RestHeader from '@site/src/components/RestHeader';

This operation deletes entities by their IDs or with a boolean expression.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" />

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

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/entities/delete" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup",
    "filter": "id in [0,1]"
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": {}
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
    "collectionName": "string",
    "filter": "string",
    "partitionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of an existing collection.  |
| __filter__ | __string__  <br/>A scalar filtering condition to filter matching entities.    The value defaults to an empty string, indicating that no condition applies. Setting both **id** and **filter** results in an error.<br/>You can set this parameter to an empty string to skip scalar filtering. To build a scalar filtering condition, refer to [Boolean Expression Rules](https://milvus.io/docs/boolean.md).  |
| __partitionName__ | __string__  <br/>The name of a partition in the current collection. <br/>If specified, the data is to be deleted from the specified partition.  |

## Response

A dictionary contains the number of deleted entities.

### Response Body

```json
{
    "code": "integer",
    "data": {}
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |

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

