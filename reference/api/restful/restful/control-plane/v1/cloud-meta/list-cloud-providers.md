---
displayed_sidebar: restfulSidebar
sidebar_position: 0
slug: /restful/list-cloud-providers
title: List Cloud Providers
---

import RestHeader from '@site/src/components/RestHeader';

Lists all cloud providers available on Zilliz Cloud.

<RestHeader method="get" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clouds" />

---

## Example



```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/clouds" \
--header "Authorization: Bearer ${API_KEY}"
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": [
        {
            "cloudId": "aws",
            "description": "amazon aws"
        },
        {
            "cloudId": "gcp",
            "description": "GCP"
        },
        {
            "cloudId": "azure",
            "description": "azure"
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
| __code__ | integer  <br/>  |
| __data__ | array<br/> |
| __data[]__ | object<br/> |
| __data[].cloudId__ | string  <br/>The ID of a cloud provider.  |
| __data[].description__ | string  <br/>The description of the cloud provider.  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |
