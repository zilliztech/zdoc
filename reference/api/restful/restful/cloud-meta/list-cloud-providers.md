---
displayed_sidebar: restfulSidebar
sidebar_position: 0
slug: /restful/list-cloud-providers
title: List Cloud Providers
---

import RestHeader from '@site/src/components/RestHeader';

Lists all cloud providers available on Zilliz Cloud.

<RestHeader method="get" endpoint="https://controller.api.{cloud-region}.zillizcloud.com/v1/clouds" />

---

## Example


:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request GET \
    --url "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clouds" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```

Success response:

```shell
{
    code: 200,
    data: [
    {
       "cloudId": "aws",
       "description": "amazon cloud"
    },
    {
       "cloudId": "gcp",
       "description": "google cloud"
    }
    ]
}
```


## Request

### Parameters

- No query parameters required

- No path parameters required

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
| 90117 | Invalid domain name used |
