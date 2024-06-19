---
displayed_sidebar: restfulSidebar
sidebar_position: 7
slug: /restful/resume-cluster
title: Resume Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Resume a suspended cluster.

<RestHeader method="post" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/{CLUSTER_ID}/resume" />

---

## Example




:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.
- Using this API requires you to add a valid payment method.

:::

```shell
curl --request POST \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/${clusterId}/resume" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```

Success response:

```shell
{
  code: 200,
  data: {
    "clusterId": "cluster01",
    "prompt": "Submission successful. Cluster is currently resuming, which typically takes several minutes. You can use the DescribeCluster interface to obtain the creation progress and the status of the Cluster. When the Cluster's status is RUNNING, you can access your vector database using the SDK."
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

