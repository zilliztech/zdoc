---
displayed_sidebar: restfulSidebar
sidebar_position: 10
slug: /restful/list-projects
title: List Projects
---

import RestHeader from '@site/src/components/RestHeader';

Lists all projects in the specified cloud region.

<RestHeader method="get" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/projects" />

---

## Example



```shell
export CLOUD_REGION="gcp-us-west1"
export API_KEY=""

curl --location --request GET "https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/projects" \
--header "Authorization: Bearer ${API_KEY}"
```
Possible response is similar to the following.
```json
{
    "code": 200,
    "data": [
        {
            "createTimeMilli": 1685006867000,
            "instanceCount": 1,
            "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
            "projectName": "Default Project"
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
| __code__ | integer  <br/>  |
| __data__ | array<br/> |
| __data[]__ | object<br/> |
| __data[].instanceCount__ | integer  <br/>  |
| __data[].projectId__ | string  <br/>  |
| __data[].projectName__ | string  <br/>  |
| `message`  | **string**<br/>Indicates the possible reason for the reported error. |
