---
slug: /create-deletion-pipelines
beta: TRUE
notebook: FALSE
token: PPAbwMvgdiGvS2kRyrLc7bJvn9e
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Create Deletion Pipeline

The Zilliz Cloud web UI provides a simplified and intuitive way of creating pipelines in addition to an easy-to-use RESTful API.

<Admonition type="info" icon="📘" title="Notes">

- Currently, pipelines only work with collections in a [serverless cluster](./create-cluster#set-up-a-serverless-cluster) or a dedicated cluster deployed on GCP us-west1.

- You must [create an ](./create-ingestion-piplines)[Ingestion pipeline](./create-ingestion-piplines) first before creating a Search pipeline.

- In one project, you can only create up to 10 pipelines of the same type.

</Admonition>

## On web UI{#on-web-ui}

1. Navigate to your project.

1. Click on **Pipelines** from the navigation panel. Then click** + Pipeline**.

1. Choose the type of pipeline to create. Click on **+ Pipeline **button in the **Deletion Pipeline **column.

    ![create-deletion-pipeline](/img/create-deletion-pipeline.png)

1. Configure the Deletion pipeline you wish to create.

    |  **Parameters**         |  **Description**                                                                                            |
    | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
    |  Pipeline Name          |  The name of the new Deletion pipeline. It should only contain lowercase letters, numbers, and underscores. |
    |  Description (Optional) |  The description of the new Deletion pipeline.                                                              |

    ![configure-deletion-pipeline](/img/configure-deletion-pipeline.png)

1. Add a function to the Deletion pipeline. You can add exactly one **PURGE_DOC_INDEX** function.

    1. Enter function name.

    1. The input field name must be doc_name.

    1. Click **Add** to save your function.

1. Click** Create Deletion Pipeline**.

## Via RESTful API{#via-restful-api}

The example below creates a Deletion pipeline named `my_doc_deletion_pipeline` with a **PURGE_DOC_INDEX** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",
        "name": "my_doc_deletion_pipeline",
        "description": "A pipeline that deletes all info associated with a doc",
        "type": "DELETION",
        "functions": [
            {
                "name": "purge_chunks_by_doc_name",
                "action": "PURGE_DOC_INDEX",
                "inputField": "doc_name"
            }
        ],
    
        "clusterId": "${CLUSTER_ID}",
        "collectionName": "my_new_collection"
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](./manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `projectId`: The ID of the project in which you want to create a pipeline. Learn more about [How Can I Obtain the Project ID?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`: The name of the pipeline to create. The pipeline name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

- `description` (optional): The description of the pipeline to create

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. **A Deletion pipeline can only have one function.**

    - `name`: The name of the function. The function name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

    - `action`: The type of the function to add. You can only add a `PURGE_DOC_INDEX` function to a Deletion pipeline.

    - `inputField`: The name of the `inputField`. The value should be `doc_name`.

- `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a serverless cluster or a dedicated cluster deployed on GCP us-west1. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

- `collectionName`: The name of the collection in which you want to create a pipeline.

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-ab2874d8138c8554375bb0",
    "name": "my_doc_deletion_pipeline",
    "type": "DELETION",
    "description": "A pipeline that deletes all info associated with a doc",
    "status": "SERVING",
    "functions": [
      {
        "action": "PURGE_DOC_INDEX",
        "name": "purge_chunks_by_doc_name",
        "inputField": "doc_name"
      }
    ],
    "clusterId": "in03-***************",
    "collectionName": "my_new_collection"
  }
}
```

## Related topics{#related-topics}

- [[WIP] Manage Pipelines](./manage-pipelines)

- [[WIP] Run Deletion Pipeline](./run-deletion-pipelines)

- [Zilliz Cloud Limits](./limits#pipelines)

- [FAQs](./faqs#faq-pipelines) 

