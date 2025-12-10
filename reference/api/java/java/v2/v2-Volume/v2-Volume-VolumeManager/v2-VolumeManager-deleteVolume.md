---
title: "deleteVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-deleteVolume
sidebar_label: "deleteVolume()"
beta: false
added_since: false
last_modified: false
deprecate_since: false
notebook: false
description: "This operation deletes a volume. | Java | v2"
type: docx
token: OalndLUMRoUqpMxr2QscYTCenre
sidebar_position: 2
keywords: 
  - vector database example
  - rag vector database
  - what is vector db
  - what are vector databases
  - zilliz
  - zilliz cloud
  - cloud
  - deleteVolume()
  - javaV226
  - vector database tutorial
  - how do vector databases work
  - vector db comparison
  - openai vector db
displayed_sidebar: javaSidebar

displayed_sidbar: javaSidebar
---

import Admonition from '@theme/Admonition';


# deleteVolume()

This operation deletes a volume.

```java
public void deleteVolume(DeleteVolumeRequest request)
```

## Request Syntax\{#request-syntax}

```java
deleteVolume(DeleteVolumeRequest.builder()
    .volumeName(String volumeName)
    .build();
)
```

**PARAMETERS**

- **volumeName** (*str*) -

    **[REQUIRED]**

    The name of the volume to delete.

**RETURN TYPE**

*void*

**RETURNS**

None

## Example\{#example}

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;
import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);

DeleteVolumeRequest request = DeleteVolumeRequest.builder()
    .volumeName("my_volume")
    .build();

volumeManager.deleteVolume(request);

System.out.printf("\nVolume %s deleted%n", "my_volume");

// Volume my_volume deleted
```

