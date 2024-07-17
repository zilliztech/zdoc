---
displayed_sidebar: restfulSidebar
sidebar_position: 74
slug: /restful/get-v2
title: Get
---

import RestHeader from '@site/src/components/RestHeader';

This operation gets specific entities by their IDs.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v2/vectordb/entities/get" />

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

curl --location --request POST "http://${CLUSTER_ENDPOINT}/v2/vectordb/entities/get" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
--data-raw '{
    "collectionName": "quick_setup",
    "id": [
        1,3,5
    ],
    "outputFields": [
        "color"
    ]
}'
```
Possible response is similar to the following.
```json
{
    "code": 0,
    "data": [
        {
            "color": "red_7025",
            "id": 1
        },
        {
            "color": "pink_9298",
            "id": 3
        },
        {
            "color": "yellow_4222",
            "id": 5
        }
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
    "collectionName": "string",
    "outputFields": [],
    "partitionNames": []
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __collectionName__ | __string__  <br/>The name of the collection to which this operation applies.  |
| __id__ | __integer__ \| __string__ \| __array__ \| __array__<br/>A specific entity ID or a list of entity IDs. |
| __id[opt_1]__ | __integer__  <br/>  |
| __id[opt_2]__ | __string__  <br/>  |
| __id[][opt_3]__ | __array__<br/> |
| __id[][opt_3][]__ | __integer__  <br/>  |
| __id[][opt_4]__ | __array__<br/> |
| __id[][opt_4][]__ | __string__  <br/>  |
| __outputFields__ | __array__<br/>An array of fields to return along with the search results. |
| __outputFields[]__ | __string__  <br/>  |
| __partitionNames__ | __array__<br/>The name of the partitions to which this operation applies. |
| __partitionNames[]__ | __string__  <br/>PartitionName  |

## Response

A list of dictionaries with each dictionary representing a queried entity.

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
| __data[]__ | __object__<br/> |

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

