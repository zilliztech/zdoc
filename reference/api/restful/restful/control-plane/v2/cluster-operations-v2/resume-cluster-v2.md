---
displayed_sidebar: restfulSidebar
sidebar_position: 81
slug: /restful/resume-cluster-v2
title: Resume Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Resume a dedicated cluster.

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/clusters/{clusterId}/resume" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""

curl --request GET \
    --url "https://api.cloud.zilliz.com/v2/clusters/inxx-xxxxxxxxxxxxxxx/resume" \
    --header "Authorization: Bearer ${API_KEY}"   \
    --header "accept: application/json"
```

Possible response is similar to the following
```json
{
  "code": 0,
  "data" {
     "clusterId": "inxx-xxxxxxxxxxxxxxx",
     "prompt": "Successfully Submitted. Cluster is being resumed, which is expected to takes several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
  }
}
```



## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __clusterId__  | **string**(required)<br/>ID of the cluster to resume.|

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**(required)<br/>The authorization token. You should always use an API key with appropriate permissions.|
    | __Accept__  | **string**<br/>Use `application/json`.|

### Request Body

No request body required

## Response

Returns the ID of the resumed cluster.

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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/>Response payload. |
| __data.clusterId__ | __string__  <br/>ID of the cluster that has been resumed.  |
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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

