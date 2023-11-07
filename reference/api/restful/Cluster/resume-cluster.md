---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /resume-cluster
title: Resume Cluster
---

import RestHeader from '@site/src/components/RestHeader';

Resume a suspended cluster.

<RestHeader method="post" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clusters/{clusterId}/resume" />

---

## Example

# RESTful API Examples


## Request

### Parameters

- No query parameters required

- Path parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | `CLOUD_REGION_ID`  | **string**(required)<br/>|
    | `clusterId`  | **string**(required)<br/>The ID of a cluster to which this operation applies.|

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
| `data`    | **object**<br/>A data object. |
| `data.clusterId`   | **string**<br/>The ID of a cluster. |
| `data.prompt`   | **string**<br/>The statement indicating that the current operation succeeds. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 80020 | Invalid clusterId or you do not have permission to access that Cluster. |
| 80021 | Serverless cluster not support this operation. |
| 90102 | The cluster does not exist in current region. |
| 90103 | The clusterId parameter is empty in the request path. |
| 90117 | "Invalid domain name used |

