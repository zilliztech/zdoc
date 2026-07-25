---
displayed_sidbar: javaSidebar
title: "deleteVolume() | Java | v2"
slug: /java/java/v2-VolumeManager-deleteVolume
sidebar_label: "deleteVolume()"
added_since: false
last_modified: false
deprecate_since: false
beta: false
notebook: false
description: "This operation deletes a volume. | Java | v2"
type: docx
token: OalndLUMRoUqpMxr2QscYTCenre
sidebar_position: 2
keywords: 
  - dimension reduction
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - zilliz
  - zilliz cloud
  - cloud
  - deleteVolume()
  - javaV226
displayed_sidebar: javaSidebar

---

import Admonition from '@theme/Admonition';


# deleteVolume()

This operation deletes a volume.

```java
public void deleteVolume(DeleteVolumeRequest request)
```

## Request Syntax

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

## Example

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;
import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com.cn")
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

