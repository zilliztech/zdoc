---
displayed_sidebar: restfulSidebar
sidebar_position: 68
slug: /restful/suspend-cluster
title: Suspend Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Suspend a specified cluster. This operation will only stop the cluster and your data will remain intact.

<RestHeader method="post" endpoint="https://${CLUSTER_ENDPOINT}/v1/clusters/{CLUSTER_ID}/suspend" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</li>
<li>This API requires applies only to dedicated clusters.</li>
</ul>
    
</Admonition>

```curl
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request POST "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/inxx-xxxxxxxxxxxxxxx/suspend" \
--header "Authorization: Bearer ${API_KEY}"
```

Possible return is similar to the following.

```json
{
    "code": 200,
    "data": {
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "prompt": "Successfully Submitted. The cluster will not incur any computing costs when suspended. You will only be billed for the storage costs during this time."
    }
}
```



## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __CLUSTER_ID__  | **string**(required)<br/>|

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>|

### Request Body

No request body required

## Response

Returns the ID of the affected cluster.

### Response Body

```json
{
    "code": "integer",
    "data": {
        "clusterId": "string",
        "prompt": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.clusterId__ | __string__  <br/>The ID of a cluster.  |
| __data.prompt__ | __string__  <br/>The statement indicating that the current operation succeeds.  |

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

