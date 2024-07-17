---
displayed_sidebar: restfulSidebar
sidebar_position: 23
slug: /restful/list-cloud-providers-v2
title: List Cloud Providers
---

import RestHeader from '@site/src/components/RestHeader';

Lists all cloud providers available on Zilliz Cloud.

<RestHeader method="get" endpoint="https://api.cloud.zilliz.com/v2/clouds" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""

curl --request GET \
    --url "https://api.cloud.zilliz.com/v2/clouds" \
    --header "Authorization: Bearer ${API_KEY}"   \
    --header "accept: application/json"
```

Possible response is similar to the following

```json
{
    "code": 0,
    "data": [
        {
            "cloudId": "aws",
            "description": "Amazon Web Services"
        },
        {
            "cloudId": "gcp",
            "description": "Google Cloud Platform"
        },
        {
            "cloudId": "azure",
            "description": "Microsoft Azure"
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
    | __Authorization__  | **string**(required)<br/>The authorization token. You should always use an API key with appropriate permissions.|
    | __Accept__  | **string**<br/>Use `application/json`.|

### Request Body

No request body required

## Response

Returns a list of cloud providers in detail.

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
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/>Response payload. |
| __data[]__ | __object__<br/>List of applicable cloud providers. |
| __data[].cloudId__ | __string__  <br/>ID of a cloud provider.  |
| __data[].description__ | __string__  <br/>Description of the cloud provider.  |

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

