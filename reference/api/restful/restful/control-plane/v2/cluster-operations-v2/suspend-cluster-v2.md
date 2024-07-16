---
displayed_sidebar: restfulSidebar
sidebar_position: 85
slug: /restful/suspend-cluster-v2
title: Suspend Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Suspend a dedicated cluster.

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/clusters/{clusterId}/suspend" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""

curl --request POST \
     --url https://api.cloud.zilliz.com/v2/clusters/inxx-xxxxxxxxxxxxxxx/suspend \
     --header 'Authorization: Bearer ${API_KEY}' \
     --header 'accept: application/json'
```

Possible response is similar to the following
```json
{
  "code": 0,
  "data" {
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
    | __clusterId__  | **string**(required)<br/>ID of the cluster to suspend.|

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**(required)<br/>The authorization token. You should always use an API key with appropriate permissions.|
    | __Accept__  | **string**<br/>Use `application/json`.|

### Request Body

No request body required

## Response

成功

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
| __data__ | __object__<br/>Response payload. |
| __data.clusterId__ | __string__  <br/>ID of the cluster that has been suspended.  |
| __data.prompt__ | __string__  <br/>Prompt message returned.  |

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

