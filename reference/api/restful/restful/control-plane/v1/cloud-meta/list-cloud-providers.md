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



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

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

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**<br/>|

### Request Body

No request body required

## Response

Returns a list of all available cloud providers on Zilliz Cloud.

### Response Body

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

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/> |
| __data[]__ | __object__<br/> |
| __data[].cloudId__ | __string__  <br/>The ID of a cloud provider.  |
| __data[].description__ | __string__  <br/>The description of the cloud provider.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

