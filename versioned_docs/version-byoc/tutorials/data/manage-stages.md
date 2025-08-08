---
title: "Manage Stages | BYOC"
slug: /manage-stages
sidebar_label: "Manage Stages"
beta: PRIVATE
notebook: FALSE
description: "A stage is an intermediate storage spot where you can hold your data for further processing, such as data merging or importing. This page explains what a stage is on Zilliz Cloud and how you can use it when managing your data there. | BYOC"
type: origin
token: VCL7wmP6oieCkJkHEcicCsKQnxc
sidebar_position: 0
keywords: 
  - zilliz
  - vector database
  - cloud
  - stage
  - LLMs
  - Machine Learning
  - RAG
  - NLP

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Manage Stages

A stage is an intermediate storage spot where you can hold your data for further processing, such as data merging or importing. This page explains what a stage is on Zilliz Cloud and how you can use it when managing your data there.

## Overview{#overview}

When using a Zilliz Cloud stage, you upload data from an applicable external source, such as local files and third-party object storage to create files in the stage for further processing. The following diagram shows the major application scenarios of Zilliz Cloud stages.

![MtkDwzhs5hbLxobwTiccEdfPnoc](/img/MtkDwzhs5hbLxobwTiccEdfPnoc.png)

You can use stages in data import and data merging, all of which need to fetch data from external sources but use the fetched data in different ways. 

- **Data import**

    During data import, you can upload prepared datasets into a stage and import them from the stage into a Zilliz Cloud collection. For details, refer to Import Data (RESTful API) and Import Data (SDK).

- **Data merging**

    You can merge data from an existing Zilliz Cloud collection and that from a local file uploaded to a stage to create a collection that combines the data from both sources. For details, refer to [Merge Data](./merge-data).

## Create, list, and delete stages{#create-list-and-delete-stages}

You can manage the lifecycle of a stage by creating a stage, listing all available stages, and deleting a stage that you do not need, according to your service requirements.

### Create a stage{#create-a-stage}

A stage is specific to a Zilliz Cloud project. When creating a stage, you need to provide the project ID, region ID, and the name of the stage, as follows:

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
```

The output is similar to the following:

```json
{
    "code": 0,
    "data": {
        "stageName": "my_stage"
    }
}
```

### List stages{#list-stages}

You are advised to use a stage for a specific purpose and not reuse it for different purposes. You can check the stages already created within a specific Zilliz Cloud project as follows:

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/stages?projectId=proj-xxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
```

The output would be similar to the following:

```json
{
    "code": 200,
    "data": {
        "count": 1,
        "currentPage": 1,
        "pageSize": 10,
        "stages": [
            {
                "stageName": "my_stage"
            }        
        ]
    }
}
```

### Delete a stage{#delete-a-stage}

You can delete a stage once it is no longer needed. To delete a stage, do as follows:

```bash
export BASE_URL="https://api.cloud.zilliz.com"
export TOKEN="YOUR_API_KEY"
export STAGE_NAME="my_stage"

curl --request DELETE \
--url "${BASE_URL}/v2/stages/${STAGE_NAME}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Content-Type: application/json"
```

The output would be similar to the following:

```json
{
    "code": 0,
    "data": {
        "stageName": "my_stage"
    }
}
```

## Upload data into a stage{#upload-data-into-a-stage}

Once a stage is ready, upload your data into the stage as follows:

<Tabs groupId="code" defaultValue='python' values={[{"label":"Python","value":"python"},{"label":"Java","value":"java"}]}>
<TabItem value='python'>

```python
import os
from pymilvus.stage.stage_operation import StageOperation

# You need to upload the local file path or folder path for import & migration & spark.
LOCAL_DIR_OR_FILE_PATH = "/Users/zilliz/Desktop/1.parquet"

# The value of the URL is fixed.
# For overseas regions, it is: https://api.cloud.zilliz.com
# For regions in China, it is: https://api.cloud.zilliz.com.cn
CLOUD_ENDPOINT = "https://api.cloud.zilliz.com"
API_KEY = "YOUR_API_KEY"

# This is currently a private preview feature. If you need to use it, please submit a request and contact us.
# Before using this feature, you need to create a stage using the stage API.
STAGE_NAME = "my_stage"
PATH = "data/"

def main():
    stage_operation = StageOperation(
        cloud_endpoint=CLOUD_ENDPOINT,
        api_key=API_KEY,
        stage_name=STAGE_NAME,
        path=PATH
    )
    result = stage_operation.upload_file_to_stage(LOCAL_DIR_OR_FILE_PATH)
    print(f"\nuploadFileToStage results: {result}")
```

</TabItem>

<TabItem value='java'>

```java
import io.milvus.bulkwriter.StageOperation;
import io.milvus.bulkwriter.StageOperationParam;
import io.milvus.bulkwriter.model.StageUploadResult;

/**
 * You need to upload the local file path or folder path for import.
 */
public static final String LOCAL_DIR_OR_FILE_PATH = "/Users/zilliz/Desktop/1.parquet";

/**
 * The value of the URL is fixed.
 * For overseas regions, it is: https://api.cloud.zilliz.com
 * For regions in China, it is: https://api.cloud.zilliz.com.cn
 */
public static final String CLOUD_ENDPOINT = "https://api.cloud.zilliz.com";
public static final String API_KEY = "YOUR_API_KEY";

/**
 * This is currently a private preview feature. If you need to use it, please submit a request and contact us.
 * Before using this feature, you need to create a stage using the stage API.
 */
public static final String STAGE_NAME = "my_stage";
public static final String PATH = "data/";

private static void uploadFileToStage() throws Exception {
    StageOperationParam stageOperationParam = StageOperationParam.newBuilder()
            .withCloudEndpoint(CLOUD_ENDPOINT).withApiKey(API_KEY)
            .withStageName(STAGE_NAME).withPath(PATH)
            .build();
    StageOperation stageOperation = new StageOperation(stageOperationParam);
    StageUploadResult result = stageOperation.uploadFileToStage(LOCAL_DIR_OR_FILE_PATH);
    System.out.println("\nuploadFileToStage results: " + result);
}
```

</TabItem>
</Tabs>

