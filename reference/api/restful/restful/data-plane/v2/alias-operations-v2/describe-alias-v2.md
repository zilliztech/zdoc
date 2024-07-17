---
displayed_sidebar: restfulSidebar
sidebar_position: 37
slug: /restful/describe-alias-v2
title: Describe Alias
---

import RestHeader from '@site/src/components/RestHeader';

This operation describes the details of a specific alias.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" />

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

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/aliases/describe" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw  '{
    "aliasName": "bob"
}'
```
Possible response is similar to the following
```shell
{
    "code": 0,
    "data": {
        "aliasName": "bob",
        "collectionName": "quick_setup",
    }
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
    "aliasName": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __aliasName__ | __string__  <br/>The name of the alias whose details are to be listed.  |

## Response

An alias object that contains the detailed description of an alias.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "collectionName": "string",
        "aliasName": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.collectionName__ | __string__  <br/>the name of the collection to which an alias belongs.  |
| __data.aliasName__ | __string__  <br/>The name of the alias.  |

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

