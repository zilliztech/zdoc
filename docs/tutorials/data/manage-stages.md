---
title: "Manage Stages | Cloud"
slug: /manage-stages
sidebar_label: "Manage Stages"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "A stage is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. This page explains what a stage is on Zilliz Cloud and how you can use it when managing your data there. | Cloud"
type: origin
token: VCL7wmP6oieCkJkHEcicCsKQnxc
sidebar_position: 9
keywords: 
  - zilliz
  - vector database
  - cloud
  - stage
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Stages

A stage is an intermediate storage spot where you can hold your data for further processing, such as data merging, migration, or importing. This page explains what a stage is on Zilliz Cloud and how you can use it when managing your data there.

<Admonition type="info" icon="📘" title="Note">

<p>To import, merge, or migrate data from a stage to a cluster, ensure that the stage and the cluster are within the same cloud region. </p>

</Admonition>

## Overview\{#overview}

When using a Zilliz Cloud stage, you upload data from an applicable external source, such as local files and third-party object storage to create files in the stage for further processing. The following diagram shows the major application scenarios of Zilliz Cloud stages.

![UZ2YwYMuHhDkk4bEoOHctyWFnrO](/img/UZ2YwYMuHhDkk4bEoOHctyWFnrO.png)

You can use stages in data import, data migration, and data merging, all of which need to fetch data from external sources but use the fetched data in different ways. 

- **Data import**

    During data import, you can upload prepared datasets into a stage and import them from the stage into a Zilliz Cloud collection. For details, refer to [Import Data (RESTful API)](./import-data-via-restful-api) and [Import Data (SDK)](./import-data-via-sdks).

- **Data merging**

    You can merge data from an existing Zilliz Cloud collection and that from a local file uploaded to a stage to create a collection that combines the data from both sources. For details, refer to [Merge Data](./merge-data).

- **Data migration**

    In data migration, you upload backup files of your Milvus instance into a stage and use the staged data to restore the Milvus instance as a Zilliz Cloud cluster. For details, refer to [Migrate from Milvus to Zilliz Cloud Via Stage](./via-stage).

## Create, list, and delete stages\{#create-list-and-delete-stages}

You can manage the lifecycle of a stage by creating a stage, listing all available stages, and deleting a stage that you do not need, according to your service requirements.

### Initiate a stage manager\{#initiate-a-stage-manager}

A stage manager maintains the connection to Zilliz Cloud's Stage service. You need to initiate a stage manager before managing stages. 

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.stage_manager import StageManager

stage_manager = StageManager(
    cloud_endpoint="https://api.cloud.zilliz.com",
    api_key="YOUR_API_KEY"
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.StageManager;
import io.milvus.bulkwriter.StageManagerParam;

StageManagerParam stageManagerParam = StageManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .build();
        
StageManager stageManager = new StageManager(stageManagerParam);
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
```

</TabItem>
</Tabs>

### Create a stage\{#create-a-stage}

A stage is specific to a Zilliz Cloud project. When creating a stage, you need to provide the project ID, region ID, and the name of the stage, as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
stage_manager.create_stage(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx", 
    region_id="aws-us-west-1", 
    stage_name="my_stage"
)

print(f"\nStage my_stage created")

# Stage my_stage created
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.stage.CreateStageRequest;

CreateStageRequest request = CreateStageRequest.builder()
    .projectId("proj-xxxxxxxxxxxxxxxxxxxxxxx")
    .regionId("aws-us-west-1")
    .stageName("my_stage")
    .build();

stageManager.createStage(request);

System.out.printf("\nStage %s created%n", "my_stage");

// Stage my_stage created
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request POST \
--url "${BASE_URL}/v2/stages/create" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json" \
-d '{
    "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxxx",
    "regionId": "aws-us-west-1",
    "stageName": "my_stage"
}'

# {
#     "code": 0,
#     "data": {
#         "stageName": "my_stage"
#     }
# }
```

</TabItem>
</Tabs>

### List stages\{#list-stages}

You can check the stages already created within a specific Zilliz Cloud project as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
stage_list = stage_manager.list_stages(
    project_id="proj-xxxxxxxxxxxxxxxxxxxxxxx",
    current_page=1, 
    page_size=10
)

print(f"\nlistStages results: \n", stage_list.json()['data'])

# listStages results: 
# 
# {
#     "count": 1,
#     "currentPage": 1,
#     "pageSize": 10,
#     "stages": [
#         {
#             "stageName": "my_stage"
#         }        
#     ]
# }
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import io.milvus.bulkwriter.request.stage.ListStagesRequest;

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

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/stages?projectId=proj-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "count": 1,
#         "currentPage": 1,
#         "pageSize": 10,
#         "stages": [
#             {
#                 "stageName": "my_stage"
#             }        
#         ]
#     }
# }
```

</TabItem>
</Tabs>

### Delete a stage\{#delete-a-stage}

You can delete a stage once it is no longer needed. To delete a stage, do as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"},{"label":"cURL","value":"bash"}]}>
<TabItem value='python'>

```python
stage_manager.delete_stage(
    stage_name="my_stage"
)

print(f"\nStage my_stage deleted")

# Stage my_stage deleted
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.request.stage.DeleteStageRequest;

DeleteStageRequest request = DeleteStageRequest.builder()
    .stageName("my_stage")
    .build();

stageManager.deleteStage(request);

System.out.printf("\nStage %s deleted%n", "my_stage");

// Stage my_stage deleted
```

</TabItem>

<TabItem value='bash'>

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
export STAGE_NAME="my_stage"

curl --request DELETE \
--url "${BASE_URL}/v2/stages/${STAGE_NAME}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"

# {
#     "code": 0,
#     "data": {
#         "stageName": "my_stage"
#     }
# }
```

</TabItem>
</Tabs>

## Upload data into a stage\{#upload-data-into-a-stage}

Once a stage is ready, upload your data onto the stage.

### Initiate a stage file manager\{#initiate-a-stage-file-manager}

A stage file manager maintains the connection to a specific stage on Zilliz Cloud's Stage service. You need to initiate a stage file manager before uploading files to the stage.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
from pymilvus.bulk_writer.stage_file_manager import StageFileManager

stage_file_manager = StageFileManager(
    cloud_endpoint='https://api.cloud.zilliz.com',
    api_key='YOUR_API_KEY',
    stage_name='my_stage',
)
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.StageFileManager;
import io.milvus.bulkwriter.StageFileManagerParam;

StageFileManagerParam stageFileManagerParam = StageFileManagerParam.newBuilder()
    .withCloudEndpoint("https://api.cloud.zilliz.com")
    .withApiKey("YOUR_API_KEY")
    .withStageName("my_stage")
    .build();

StageFileManager stageFileManager = new StageFileManager(stageFileManagerParam);
```

</TabItem>
</Tabs>

### Upload files\{#upload-files}

Once the stage file manager is ready, use it to upload files to the specified stage. The following example uploads the local file at the source file path to the target file path within the stage.

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
result = stage_file_manager.upload_file_to_stage(
    source_file_path="/path/to/your/local/data/file", 
    target_stage_path="data/"
)

print(f"\nuploadFileToStage results: {result}")

# uploadFileToStage results: 
# 
# {
#     "stageName": "my_stage",
#     "path": "data/"
# }
```

</TabItem>

<TabItem value='java'>

```java
import com.google.gson.Gson;
import io.milvus.bulkwriter.model.UploadFilesResult;
import io.milvus.bulkwriter.request.stage.UploadFilesRequest;

UploadFilesRequest request = UploadFilesRequest.builder()
    .sourceFilePath("/path/to/your/local/data/file")
    .targetStagePath("data/")
    .build();

UploadFilesResult result = stageFileManager.uploadFilesAsync(request).get();

System.out.println("\nuploadFiles results: " + new Gson().toJson(result));

// uploadFileToStage results: 
// 
// {
//     "stageName": "my_stage",
//     "path": "data/"
// }
```

</TabItem>
</Tabs>