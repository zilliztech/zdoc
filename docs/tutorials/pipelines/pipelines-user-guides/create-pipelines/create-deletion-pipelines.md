---
slug: /create-deletion-pipelines
beta: FALSE
notebook: FALSE
type: origin
token: PPAbwMvgdiGvS2kRyrLc7bJvn9e
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Create Deletion Pipeline

The Zilliz Cloud web UI provides a simplified and intuitive way of creating pipelines in addition to an easy-to-use RESTful API.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Currently, pipelines only work with collections in a <a href="./create-cluster#set-up-a-serverless-cluster">serverless cluster</a> or a dedicated cluster deployed on GCP us-west1.</p></li>
<li><p>You must <a href="./create-ingestion-piplines">create an </a><a href="./create-ingestion-piplines">Ingestion pipeline</a> first before creating a Search pipeline.</p></li>
<li><p>In one project, you can only create up to 10 pipelines of the same type.</p></li>
</ul>

</Admonition>

## On web UI{#on-web-ui}

1. Navigate to your project.

1. Click on __Pipelines__ from the navigation panel. Then switch to the __Overview__ tab and click __Pipelines__. To create a pipeline, click __+ Pipeline__.

1. Choose the type of pipeline to create. Click on __+ Pipeline __button in the __Deletion Pipeline __column.

    ![create-deletion-pipeline](/img/create-deletion-pipeline.png)

1. Configure the Deletion pipeline you wish to create.

    |  __Parameters__         |  __Description__                                                                                            |
    | ----------------------- | ----------------------------------------------------------------------------------------------------------- |
    |  Pipeline Name          |  The name of the new Deletion pipeline. It should only contain lowercase letters, numbers, and underscores. |
    |  Description (Optional) |  The description of the new Deletion pipeline.                                                              |

    ![configure-deletion-pipeline](/img/configure-deletion-pipeline.png)

1. Add a function to the Deletion pipeline. You can add exactly one __PURGE_DOC_INDEX__ function.

    1. Enter function name.

    1. The input field name must be doc_name.

    1. Click __Add__ to save your function.

1. Click__ Create Deletion Pipeline__.

## Via RESTful API{#via-restful-api}

The example below creates a Deletion pipeline named `my_doc_deletion_pipeline` with a __PURGE_DOC_INDEX__ function added. 

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

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `projectId`: The ID of the project in which you want to create a pipeline. Learn more about [How Can I Obtain the Project ID?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`: The name of the pipeline to create. The pipeline name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

- `description` (optional): The description of the pipeline to create

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. __A Deletion pipeline can only have one function.__

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

- [Manage Pipelines](./manage-pipelines)

- [Run Deletion Pipeline](./run-deletion-pipelines)

- [Zilliz Cloud Limits](./limits#pipelines)

- [FAQs](/docs/faq-pipelines)

