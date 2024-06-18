---
displayed_sidebar: restfulSidebar
sidebar_position: 8
slug: /restful/suspend-cluster
title: Suspend Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Suspend a specified cluster. This operation will only stop the cluster and your data will remain intact.

<RestHeader method="post" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/{CLUSTER_ID}/suspend" />

---

## Example




:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request POST \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/${clusterId}/suspend" \
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
    "prompt": "Submission successful. Your vector database computing cost is free until you Resume the Cluster, and only storage costs will be charged."
  }
}
```




## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLUSTER_ID`  | **string**(required)<br/>|

### Request Body

No request body required

## Response

Returns the ID of the affected cluster.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": {
        "clusterId": "string",
        "prompt": "string"
    }
}
```

- Response body if we failed to process your request

```json
{
    "code": integer,
    "message": string
}
```

### Properties

The properties in the returned response are listed in the following table.

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| `code`   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __code__ | integer  <br/>  |
| __data__ | object<br/> |
| __data.clusterId__ | string  <br/>The ID of a cluster.  |
| __data.prompt__ | string  <br/>The statement indicating that the current operation succeeds.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |
