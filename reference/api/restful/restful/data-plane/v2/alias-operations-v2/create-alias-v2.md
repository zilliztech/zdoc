---
displayed_sidebar: restfulSidebar
sidebar_position: 70
slug: /restful/create-alias-v2
title: Create Alias
---

import RestHeader from '@site/src/components/RestHeader';

This operation creates an alias for an existing collection. A collection can have multiple aliases, while an alias can be associated with only one collection.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/create" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
You can use either of the following ways to authorize:
<ul>
<li> An API Key with appropriate permissions.</li>
<li>A colon-joined username and password of the target cluster. For example, `username:passowrd`.</li>
</ul>
    
</Admonition>
```shell
export CLUSTER_ENDPOINT="https://inxx-xxxxxxxxxxxxxxx.api.gcp-us-west1.zillizcloud.com"
export TOKEN="username:password"

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "aliasName": "bob",
    "collectionName": "quick_setup"
}'
```
Possible response is similar to the following
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
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation in seconds. Setting this to None indicates that this operation timeouts when any response arrives or any error occurs.|
    | __Authorization__  | **string**<br/>The authentication token.|

### Request Body

```json
{
    "collectionName": "string",
    "aliasName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the target collection to reassign an alias to.  |
| __aliasName__ | __string__  <br/>The alias of the collection.  |

## Response

None

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

