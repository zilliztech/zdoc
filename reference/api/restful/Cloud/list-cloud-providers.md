---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /list-cloud-providers
title: List Cloud Providers
---

import RestHeader from '@site/src/components/RestHeader';

Lists all cloud providers available on Zilliz Cloud.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clouds" />

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

### Request Body

No request body required

## Response

Returns a list of all available cloud providers on Zilliz Cloud.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": [
        {
            "cloudId": "string",
            "description": "string"
        }
    ]
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
| `data`  | **array**<br/>A data array of objects. |
| `data.cloudId`   | **string**<br/>The ID of a cloud provider. |
| `data.description`   | **string**<br/>The description of the cloud provider. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
| 63032 | CloudId not exists. |
| 80001 | The token is illegal |
| 80002 | The token is invalid |
| 90117 | "Invalid domain name used |

