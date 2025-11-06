---
title: "deleteStage() | Java | v2"
slug: /java/java/v2-StageManager-deleteStage
sidebar_label: "deleteStage()"
beta: false
added_since: v2.5.x
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes a stage. | Java | v2"
type: docx
token: OalndLUMRoUqpMxr2QscYTCenre
sidebar_position: 2
keywords: 
  - Hierarchical Navigable Small Worlds
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - zilliz
  - zilliz cloud
  - cloud
  - deleteStage()
  - javaV226
  - Annoy vector search
  - milvus
  - Zilliz
  - milvus vector database
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# deleteStage()

This operation deletes a stage.

```java
public void deleteStage(DeleteStageRequest request)
```

## Request Syntax\{#request-syntax}

```java
deleteStage(DeleteStageRequest.builder()
    .stageName(String stageName)
    .build();
)
```

**PARAMETERS**

- **stageName** (*str*) -

    **[REQUIRED]**

    The name of the stage to delete.

**RETURN TYPE**

*void*

**RETURNS**

None

## Example\{#example}

```java
import io.milvus.bulkwriter.StageManager;
import io.milvus.bulkwriter.StageManagerParam;
import io.milvus.bulkwriter.request.stage.DeleteStageRequest;

StageManagerParam stageManagerParam = StageManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
StageManager stageManager = new StageManager(stageManagerParam);

DeleteStageRequest request = DeleteStageRequest.builder()
    .stageName("my_stage")
    .build();

stageManager.deleteStage(request);

System.out.printf("\nStage %s deleted%n", "my_stage");

// Stage my_stage deleted
```

