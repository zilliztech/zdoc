---
displayed_sidebar: restfulSidebar
sidebar_position: 28
slug: /list-projects
title: List Projects
---

import RestHeader from '@site/src/components/RestHeader';

Lists all projects in the specified cloud region.

<RestHeader method="get" endpoint="https://{CLUSTER_ENDPOINT}/v1/projects" />

---

## Example


:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

:::

```shell
curl --request GET \
    --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/projects" \
    --header "Authorization: Bearer ${API_KEY}" \
    --header "accept: application/json" \
    --header "content-type: application/json"
```

Success response:

```shell
{
    "code": 200,
    "data": [
       {
          "instanceCount": 1,
          "projectId": "proj-********************",
          "projectName": "test"
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

Returns a list of projects.

### Response Bodies

- Response body if we process your request successfully

```json
{
    "code": "integer",
    "data": [
        {
            "instanceCount": "integer",
            "projectId": "string",
            "projectName": "string"
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
| `data.instanceCount`   | **integer**<br/>Number of clusters in the current project. |
| `data.projectId`   | **string**<br/>ID of the current project |
| `data.projectName`   | **string**<br/>Name of the current project |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |

## Possible Errors

| Code | Error Message |
| ---- | ------------- |
|  | (to be added) |

