---
displayed_sidebar: referenceSidebar
sidebar_position: 0
slug: /list-pipelines
title: List Pipelines
---

import RestHeader from '@site/src/components/RestHeader';

List all pipelines in a project.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" />

---

## Example


List all pipelines in detail.

```curl
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
    --url "${ZILLIZ_CLOUD_API_ENDPOINT_PREFIX}/v1/pipelines/"
```


## Request

### Parameters

- No query parameters required

- No path parameters required

### Request Body

No request body required

## Response

Possible responses

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "string",
    "data": [
        {}
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
| `data`  | **array**<br/>A data array of s. |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
|  | (to be added) |

