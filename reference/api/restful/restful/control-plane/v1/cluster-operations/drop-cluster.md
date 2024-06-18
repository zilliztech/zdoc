---
displayed_sidebar: restfulSidebar
sidebar_position: 5
slug: /restful/drop-cluster
title: Drop Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Deletes a cluster. This operation moves your cluster to the recycle bin. All clusters in the recycle bin are pending permanent deletion in 30 days.

<RestHeader method="delete" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clusters/{CLUSTER_ID}/drop" />

---

## Example



```shell



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

Returns the ID of the deleted cluster.

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
