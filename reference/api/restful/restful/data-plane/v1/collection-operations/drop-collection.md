---
displayed_sidebar: restfulSidebar
sidebar_position: 52
slug: /restful/drop-collection
title: Drop Collection
---

import RestHeader from '@site/src/components/RestHeader';

Drops a collection. This operation erases your collection data. Exercise caution when performing this operation.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/vector/collections/drop" />

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

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v1/vector/collections/drop" \
</include>
<include target="zilliz">
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com:19530"
export TOKEN="db_admin:xxxxxxxxxxx"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v1/vector/collections/drop" \
</include>
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" 
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": {}
}
```



## Request

### Parameters

- No query parameters required

- No path parameters required

- No header parameters required

### Request Body

```json
{
    "collectionName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to delete.  |

## Response

Returns an empty object.

### Response Body

```json
{
    "code": "integer",
    "data": {}
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

