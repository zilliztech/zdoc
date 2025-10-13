---
title: "listStages() | Java | v2"
slug: /java/java/v2-StageManager-listStages
sidebar_label: "listStages()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation lists all stages within a specific project in a paginated manner. | Java | v2"
type: docx
token: Cde1dlUbDosa86xjuShcoKgQnvg
sidebar_position: 3
keywords: 
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model
  - zilliz
  - zilliz cloud
  - cloud
  - listStages()
  - javaV225
  - Zilliz
  - milvus vector database
  - milvus db
  - milvus vector db
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# listStages()

This operation lists all stages within a specific project in a paginated manner.

```java
public ListStagesResponse listStages(ListStagesRequest request)
```

## Request Syntax{#request-syntax}

```java
listStages(ListStagesRequest.builder()
    .projectId(String projectId)
    .currentPage(Integer currentPage)
    .pageSize(Integer pageSize)
    .build();
)
```

**PARAMETERS**

- **projectId** (*str*) -

    **&#91;REQUIRED&#93;**

    The ID of the project to which the stage to be created belongs.

- **currentPage** (*int*) -

    The current page of the stage lists. When specified, only the stages on the specified page will be returned.

    This parameter is optional and its value defaults to `1`, indicating that the first page will be returned.

- **pageSize** (*int*) -

    The name of the stage to create. When specified, only the specified number of stages will be returned.

    This parameter is optional and its value defaults to `10`, indicating that a list of up to 10 stages will be returned.

**RETURN TYPE**

*ListStagesResponse*

**RETURNS**

A **ListStagesResponse** object that contains a list of stages in a paginated manner.

- **count** (*Integer*) -

    The total number of stages found.

- **currentPage** (*Integer*) -

    The current page.

- **pageSize** (*Integer*) -

    The maximum number of stages per page.

- **stages** (*List&lt;StageInfo&gt;*) -

    A list of `StageInfo` instances.

    - **stageName** (*String*) -

        The name of a stage.

## Example{#example}

```java
import io.milvus.bulkwriter.StageManager;
import io.milvus.bulkwriter.StageManagerParam;
import io.milvus.bulkwriter.request.stage.CreateStageRequest;

StageManagerParam stageManagerParam = StageManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
StageManager stageManager = new StageManager(stageManagerParam);

ListStagesRequest request = ListStagesRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .currentPage(1)
    .pageSize(10)
    .build();
    
ListStagesResponse listStagesResponse = stageManager.listStages(request);

System.out.println("\nlistStages results: " + new Gson().toJson(listStagesResponse));

// listStages results: 
// 
// {
//     "count": 1,
//     "currentPage": 1,
//     "pageSize": 10,
//     "stages": [
//         {
//             "stageName": "my_stage"
//         }        
//     ]
// }
```

