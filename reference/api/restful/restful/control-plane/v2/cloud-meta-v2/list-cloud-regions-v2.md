---
displayed_sidebar: restfulSidebar
sidebar_position: 41
slug: /restful/list-cloud-regions-v2
title: List Cloud Regions
---

import RestHeader from '@site/src/components/RestHeader';

Lists all available cloud regions. You may list only the applicable regions of a specific cloud provider.

<RestHeader method="get" endpoint="https://api.cloud.zilliz.com/v2/regions" />

---

## Example



import Admonition from '@theme/Admonition';

<Admonition type="info" icon="📘" title="Notes">
    
<p>This API requires an <a href="/docs/manage_api_keys">API key</a> as the authentication token.</p>
    
</Admonition>

```shell
export API_KEY=""
export CLOUD_ID=""

# List all available cloud regions.
curl --request GET \
    --url "https://api.cloud.zilliz.com/v2/regions" \
    --header "Authorization: Bearer ${API_KEY}"   \
    --header "accept: application/json"

# List all available cloud regions of a specific provider.
curl -i --request GET \
    --url "https://api.cloud.zilliz.com/v2/regions?cloudId=${CLOUD_ID}" \
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
            "regionId": "aws-us-west-2",
            "domain": "api.cloud.zilliz.com"
        },
        {
            "cloudId": "gcp",
            "regionId": "gcp-us-west1",
            "domain": "api.cloud.zilliz.com"
        },
        {
            "cloudId": "azure",
            "regionId": "az-westus3",
            "domain": "api.cloud.zilliz.com"
        }
    ]
}
```



## Request

### Parameters

- Query parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __cloudId__  | **string**<br/>ID of a cloud provider. You can list applicable cloud providers using [List Cloud Providers](/reference/restful/list-cloud-providers-v2)|

- No path parameters required

- Header parameters

    | Parameter        | Description                                                                               |
    |------------------|-------------------------------------------------------------------------------------------|
    | __Authorization__  | **string**(required)<br/>The authorization token. You should always use an API key with appropriate permissions.|
    | __Accept__  | **string**<br/>Use `application/json`.|

### Request Body

No request body required

## Response

Return a list of cloud regions in detail.

### Response Body

```json
{
    "code": "integer",
    "data": [
        {
            "cloudId": "string",
            "regionId": "string",
            "domain": "string"
        }
    ]
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`0`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __array__<br/>Response payload. |
| __data[]__ | __object__<br/>List of applicable cloud regions. |
| __data[].cloudId__ | __string__  <br/>ID of the cloud provider that provides the region.  |
| __data[].regionId__ | __string__  <br/>ID of the cloud region.  |
| __data[].domain__ | __string__  <br/>Base URL of the V2 API server at the control plane.  |

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

