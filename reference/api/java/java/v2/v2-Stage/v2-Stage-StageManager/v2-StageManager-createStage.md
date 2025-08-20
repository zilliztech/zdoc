---
displayed_sidbar: javaSidebar
title: "createStage() | Java | v2"
slug: /java/java/v2-StageManager-createStage
sidebar_label: "createStage()"
beta: false
notebook: false
description: "This operation creates a stage. | Java | v2"
type: docx
token: Efi4dCKhFoYpEZxRfWRcvFEXnBg
sidebar_position: 1
keywords: 
  - hallucinations llm
  - Multimodal search
  - vector search algorithms
  - Question answering system
  - zilliz
  - zilliz cloud
  - cloud
  - createStage()
  - javaV225
  - Pinecone vector database
  - Audio search
  - what is semantic search
  - Embedding model
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# createStage()

This operation creates a stage.

```java
public void createStage(CreateStageRequest request)
```

## Request Syntax{#request-syntax}

```java
createStage(CreateStageRequest.builder()
    .projectId(String projectId)
    .regionId(String regionId)
    .stageName(String stageName)
    .build();
)
```

**PARAMETERS**

- **projectId** (*str*) -

    **&#91;REQUIRED&#93;**

    The ID of the project to which the stage to be created belongs.

- **regionId** (*str*) -

    **&#91;REQUIRED&#93;**

    The ID of the cloud region in which the stage will be created. You can use [List Cloud Regions](/reference/restful/list-cloud-regions-v2) to view possible values.

- **stageName** (*str*) -

    **&#91;REQUIRED&#93;**

    The name of the stage to create.

**RETURN TYPE**

*void*

**RETURNS**

None

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

CreateStageRequest request = CreateStageRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .regionId("aws-us-west-1")
    .stageName("my_stage")
    .build();

stageManager.createStage(request);

System.out.printf("\nStage %s created%n", "my_stage");

// Stage my_stage created
```

