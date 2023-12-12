---
displayed_sidebar: referenceSidebar
sidebar_position: 5
slug: /drop-cluster
title: Drop Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Deletes a cluster. This operation moves your cluster to the recycle bin. All clusters in the recycle bin are pending permanent deletion in 30 days.

<RestHeader method="delete" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clusters/{clusterId}/drop" />

---

## Example


Drops a cluster. This operation moves your cluster to the recycle bin. All clusters in the recycle bin are pending permanent deletion in 30 days.

```shell
curl --request DELETE \
    --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/clusters/<Cluster-ID>/drop" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```

Success response:

```shell
{
    "code": 200,
    "data": {
       "clusterId": "in01-4d71039fd8754a4",
       "prompt": "The Cluster has been deleted. If you believe this was a mistake, you can restore the Cluster from the recycle bin within 30 days (this not include serverless)."
    }
}
```


## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `clusterId`  | **string**(required)<br/>The ID of a cluster to which this operation applies.|

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
| `data`    | **object**<br/>A data object. |
| `data.clusterId`   | **string**<br/>The ID of a cluster. |
| `data.prompt`   | **string**<br/>The statement indicating that the current operation succeeds. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Cluster not exist or you don't have permission. |
| 80021 | Serverless cluster not support this operation. |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |

