---
displayed_sidebar: restfulSidebar
sidebar_position: 86
slug: /restful/get-collection-load-state-v2
title: Get Collection Load State
---

import RestHeader from '@site/src/components/RestHeader';

This operation returns the load status of a specific collection.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" />

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
curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/collections/get_load_state" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup"
}'
```
Possible response is similar to the following:
```json
{
    "code": 0,
    "data": {
        "loadProgress": 100,
        "loadState": "LoadStateLoaded"
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
    | __Request-Timeout__  | **integer**<br/>The timeout duration for this operation. Setting this to None indicates that this operation times out when any response returns or an error occurs.|
    | __Authorization__  | **string**<br/>|

### Request Body

```json
{
    "collectionName": "string",
    "partitionNames": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of a collection.  |
| __partitionNames__ | __string__  <br/>A list of partition names. If any partition names are specified, releasing any of these partitions results in the return of a NotLoad state.  |

## Response

A LoadState object that indicates the load status of the specified collection.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "loadState": "string",
        "loadProgress": "integer"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.loadState__ | __string__  <br/>An object that indicates the load status of the specified collection.  |
| __data.loadProgress__ | __integer__  <br/>An integer that indicates the load progress in the percentage of the specified collection.  |

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

