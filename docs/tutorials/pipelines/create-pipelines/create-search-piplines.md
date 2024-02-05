---
slug: /create-search-piplines
beta: TRUE
notebook: FALSE
token: TQnswMmIpiTmUSkf1iscU05Lnfb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Create Search Pipeline

The Zilliz Cloud web UI provides a simplified and intuitive way of creating pipelines while the RESTful API offers more flexibility and customization.

Unlike Ingestion and Deletion pipelines, when creating a Search pipeline, the cluster and collection are defined at the function level instead of the pipeline level. This is because Zilliz Cloud allows you to search from multiple collections at a time.

<Admonition type="info" icon="📘" title="Notes">

- Currently, pipelines only work with collections in a [serverless cluster](./create-cluster#set-up-a-serverless-cluster) or a dedicated cluster deployed on GCP us-west1.

- You must [create an ](./create-ingestion-piplines)[Ingestion pipeline](./create-ingestion-piplines) first before creating a Search pipeline.

- In one project, you can only create up to 10 pipelines of the same type.

</Admonition>

## On web UI{#on-web-ui}

1. Navigate to your project.

1. Click on **Pipelines** from the navigation panel. Then click** + Pipeline**.

1. Choose the type of pipeline to create. Click on **+ Pipeline **button in the **Search Pipeline **column.

    ![create-search-pipeline](/img/create-search-pipeline.png)

1. Configure the Search pipeline you wish to create.

    |  **Parameters**         |  **Description**                                                                                               |
    | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
    |  Pipeline Name          |  The name of the new Search pipeline. It should only contain lowercase letters, numbers, and underscores only. |
    |  Description (Optional) |  The description of the new Search pipeline.                                                                   |

    ![configure-search-pipeline](/img/configure-search-pipeline.png)

1. Add a function to the Search pipeline. You can add exactly one **SEARCH_DOC_CHUNK** function.

    <Admonition type="info" icon="📘" title="Notes">

    For convenience, the web UI forces the input field name to be `query_text`. To customize it, you can [create a Search pipeline via RESTful API](./create-search-piplines#via-restful-api).

    </Admonition>

    1. Enter function name.

    1. Choose **Target Cluster** and **Target collection**. The Target Cluster must be serverless cluster and the Target Collection must be created by an Ingestion pipeline, otherwise the Search pipeline won't be compatible.

    1. Click **Add** to save your function.

1. Click** Create Search Pipeline**.

## Via RESTful API{#via-restful-api}

<Admonition type="info" icon="📘" title="Notes">

When creating a Search pipeline, the cluster and collection are defined at the function level instead of the pipeline level. 

</Admonition>

The following example creates a Search pipeline named `my_text_search_pipeline` with a **SEARCH_DOC_CHUNK** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",       
        "name": "my_text_search_pipeline",
        "description": "A pipeline that receives text and search for semantically similar doc chunks",
        "type": "SEARCH",
        "functions": [
            {
                "name": "search_chunk_text_and_title",
                "action": "SEARCH_DOC_CHUNK",
                "inputField": "query_text",
                "clusterId": "${CLUSTER_ID}",
                "collectionName": "my_new_collection"
            }
        ]
    }
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](./manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `projectId`: The ID of the project in which you want to create a pipeline. Learn more about [How Can I Obtain the Project ID?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`: The name of the pipeline to create. The pipeline name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

- `description` (optional): The description of the pipeline to create

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. **A Search pipeline can only have one function.**

    - `name`: The name of the function. The function name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

    - `action`: The type of the function to add. You can only add a `SEARCH_DOC_CHUNK` function to a Search pipeline.

    - `inputField`: The name of the `inputField`. You can configure this parameter as you wish. But when [running the pipeline](./run-pipelines), you should always use a consistent input field name.

    - `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a serverless cluster or a dedicated cluster deployed on GCP us-west1. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

    - `collectionName`: The name of the collection in which you want to create a pipeline.

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-84e6d9dba930e035150972",
    "name": "my_text_search_pipeline",
    "type": "SEARCH",
    "description": "A pipeline that receives text and search for semantically similar doc chunks",
    "status": "SERVING",
    "functions": [
      {
        "action": "SEARCH_DOC_CHUNK",
        "name": "search_chunk_text_and_title",
        "inputField": "query_text",
        "clusterId": "in03-***************",
        "collectionName": "my_new_collection",
        "embedding": "zilliz/bge-base-en-v1.5"
      }
    ],
    "totalTokenUsage": 0
  }
}
```

## Related topics{#related-topics}

- [Run Search Pipeline](./run-search-pipelines)

- [Manage Pipelines](./manage-pipelines)

- [Estimate Pipelines Usage](./estimate-pipelines-usage)

- [Zilliz Cloud Limits](./limits#pipelines)

- [FAQs](./faqs#faq-pipelines) 

