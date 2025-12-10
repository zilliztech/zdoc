---
title: "Manage Volumes (SDK) | Cloud"
slug: /manage-stages
sidebar_label: "Manage Volumes (SDK)"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page explains how you can use a volume when managing your data on Zilliz Cloud. For details about managing volumes via web console, see Manage Volumes (Console). | Cloud"
type: origin
token: VCL7wmP6oieCkJkHEcicCsKQnxc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - volume
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Volumes (SDK)

This page explains how you can use a volume when managing your data on Zilliz Cloud. For details about managing volumes via web console, see [Manage Volumes (Console)](./manage-volumes-via-console).

<Admonition type="info" icon="📘" title="Note">

<p>You can only create volumes on AWS and Google Cloud. If you need to use a volume on Azure, please <a href="http://support.zilliz.com">contact support</a>.</p>
<p>To import, merge, or migrate data from a volume to a cluster, ensure that the volume and the cluster are within the same cloud region. </p>

</Admonition>

## Create, list, and delete volumes\{#create-list-and-delete-volumes}

You can manage the lifecycle of a volume by creating a volume, listing all available volumes, and deleting a volume that you do not need, according to your service requirements.

### Initiate a volume manager\{#initiate-a-volume-manager}

A volume manager maintains the connection to Zilliz Cloud's volume service. You need to initiate a volume manager before managing volumes. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.volume_manager import VolumeManager

volume_manager = VolumeManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.VolumeManager;
import io.milvus.bulkwriter.VolumeManagerParam;

VolumeManagerParam volumeManagerParam = VolumeManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
VolumeManager volumeManager = new VolumeManager(volumeManagerParam);
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
```

</TabItem>
</Tabs>

### Create a volume\{#create-a-volume}

A volume is specific to a Zilliz Cloud project. When creating a volume, you need to provide the project ID, region ID, and the name of the volume, as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
volume_manager.create_volume(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx", 
    region_id="aws-us-west-1", 
    volume_name="my_volume"
)

print(f"\nVolume my_volume created")

# Volume my_volume created
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.volume.CreateVolumeRequest;

CreateVolumeRequest request = CreateVolumeRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .regionId("aws-us-west-1")
    .volumeName("my_volume")
    .build();

volumeManager.createVolume(request);

System.out.printf("\nVolume %s created%n", "my_volume");

// Volume my_volume created
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/volumes/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-1",
    "volumeName": "my_volume"
}'

# {
#     "code": 0,
#     "data": {
#         "volumeName": "my_volume"
#     }
# }
```

</TabItem>
</Tabs>

In the command above, 

- `regionId`: The region of the volume to create must match the cloud provider and region of the target cluster you plan to import or migrate data into.

- `volumeName`: The name of the volume to create must be unique across the organization, no longer than 64 characters, start with a letter or underscore, and contain only letters, digits, hyphens, and underscores.

### List volumes\{#list-volumes}

You can check the volumes already created within a specific Zilliz Cloud project as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
volume_list = volume_manager.list_volumes(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx",
    current_page=1, 
    page_size=10
)

print(f"\nlistVolumes results: \n", volume_list.json()['data'])

# listVolumes results: 
# 
# {
#     "count": 1,
#     "currentPage": 1,
#     "pageSize": 10,
#     "volumes": [
#         {
#             "volumeName": "my_volume"
#         }        
#     ]
# }
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import io.milvus.bulkwriter.request.volume.ListVolumesRequest;

ListVolumesRequest request = ListVolumesRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .currentPage(1)
    .pageSize(10)
    .build();
    
ListVolumesResponse listVolumesResponse = volumeManager.listVolumes(request);

System.out.println("\nlistVolumes results: " + new Gson().toJson(listVolumesResponse));

// listVolumes results: 
// 
// {
//     "count": 1,
//     "currentPage": 1,
//     "pageSize": 10,
//     "volumes": [
//         {
//             "volumeName": "my_volume"
//         }        
//     ]
// }
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/volumes?projectId=proj-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "count": 1,
#         "currentPage": 1,
#         "pageSize": 10,
#         "volumes": [
#             {
#                 "volumeName": "my_volume"
#             }        
#         ]
#     }
# }
```

</TabItem>
</Tabs>

### Delete a volume\{#delete-a-volume}

You can delete a volume once it is no longer needed. To delete a volume, do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
volume_manager.delete_volume(
    volume_name="my_volume"
)

print(f"\nVolume my_volume deleted")

# Volume my_volume deleted
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.volume.DeleteVolumeRequest;

DeleteVolumeRequest request = DeleteVolumeRequest.builder()
    .volumeName("my_volume")
    .build();

volumeManager.deleteVolume(request);

System.out.printf("\nVolume %s deleted%n", "my_volume");

// Volume my_volume deleted
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
export VOLUME_NAME="my_volume"

curl --request DELETE \
--url "${BASE_URL}/v2/volumes/${VOLUME_NAME}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "volumeName": "my_volume"
#     }
# }
```

</TabItem>
</Tabs>

## Upload data into a volume\{#upload-data-into-a-volume}

Once a volume is ready, upload your data onto the volume.

### Initiate a volume file manager\{#initiate-a-volume-file-manager}

A volume file manager maintains the connection to a specific volume on Zilliz Cloud's volume service. You need to initiate a volume file manager before uploading files to the volume.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.volume_file_manager import VolumeFileManager

volume_file_manager = VolumeFileManager(
    cloud_endpoint='https://api.cloud.zilliz.com',
    api_key='YOUR_API_KEY',
    volume_name='my_volume',
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.VolumeFileManager;
import io.milvus.bulkwriter.VolumeFileManagerParam;

VolumeFileManagerParam volumeFileManagerParam = VolumeFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withVolumeName("my_volume")
    .build();

VolumeFileManager volumeFileManager = new VolumeFileManager(volumeFileManagerParam);
```

</TabItem>
</Tabs>

### Upload files\{#upload-files}

Once the volume file manager is ready, use it to upload files to the specified volume. The following example uploads the local file at the source file path to the target file path within the volume.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
result = volume_file_manager.upload_file_to_volume(
    source_file_path="/path/to/your/local/data/file", 
    target_volume_path="data/"
)

print(f"\nuploadFileToVolume results: {result}")

# uploadFileToVolume results: 
# 
# {
#     "volumeName": "my_volume",
#     "path": "data/"
# }
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import io.milvus.bulkwriter.model.UploadFilesResult;
import io.milvus.bulkwriter.request.volume.UploadFilesRequest;

UploadFilesRequest request = UploadFilesRequest.builder()
    .sourceFilePath("/path/to/your/local/data/file")
    .targetVolumePath("data/")
    .build();

UploadFilesResult result = volumeFileManager.uploadFilesAsync(request).get();

System.out.println("\nuploadFiles results: " + new Gson().toJson(result));

// uploadFileToVolume results: 
// 
// {
//     "volumeName": "my_volume",
//     "path": "data/"
// }
```

</TabItem>
</Tabs>