---
displayed_sidebar: restfulSidebar
sidebar_position: 89
slug: /restful/modify-cluster-v2
title: Modify Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Modiy a dedicated cluster. Currently support upgrading dedicated clusters CU size.

<RestHeader method="post" endpoint="https://api.cloud.zilliz.com/v2/clusters/{clusterId}/modify" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""

curl --request POST \
     --url https://api.cloud.zilliz.com/v2/clusters/inxx-xxxxxxxxxxxxxxx/modify \
     --header 'Authorization: Bearer ${API_KEY}' \
     --header 'accept: application/json' \
     --header 'content-type: application/json' \
     --data-raw '{
        "cuSize": 2
      }'
```

Possible response is similar to the following
```json
{
  "code": 0,
  "data" {
     "clusterId": "inxx-xxxxxxxxxxxxxxx",
     "prompt": "Successfully submitted. Cluster is being upgraded, which is expected to take several minutes. You can access data about the creation progress and status of your cluster by DescribeCluster API. Once the cluster status is RUNNING, you may access your vector database using the SDK."
  }
}
```



## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __clusterId__  | **string**(required)<br/>ID of the cluster to modify.|

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**(required)<br/>The authorization token. You should always use an API key with appropriate permissions.|
    | __Accept__  | **string**<br/>Use `application/json`.|
    | __Content-Type__  | **string**<br/>Use `application/json`.|

### Request Body

```json
{
    "cuSize": "integer"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __cuSize__ | __integer__  <br/>Number of CUs allocated to this cluster after the modification.  |

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
| __data.clusterId__ | __string__  <br/>ID of the cluster that has been modified.  |
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

