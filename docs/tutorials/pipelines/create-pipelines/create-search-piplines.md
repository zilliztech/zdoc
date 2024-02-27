---
slug: /create-search-piplines
beta: TRUE
notebook: FALSE
type: origin
token: TQnswMmIpiTmUSkf1iscU05Lnfb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Create Search Pipeline

The Zilliz Cloud web UI provides a simplified and intuitive way of creating pipelines while the RESTful API offers more flexibility and customization.

Unlike Ingestion and Deletion pipelines, when creating a Search pipeline, the cluster and collection are defined at the function level instead of the pipeline level. This is because Zilliz Cloud allows you to search from multiple collections at a time.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Currently, pipelines only work with collections in a <a href="./create-cluster#set-up-a-serverless-cluster">serverless cluster</a> or a dedicated cluster deployed on GCP us-west1.</p></li>
<li><p>You must <a href="./create-ingestion-piplines">create an </a><a href="./create-ingestion-piplines">Ingestion pipeline</a> first before creating a Search pipeline.</p></li>
<li><p>In one project, you can only create up to 10 pipelines of the same type.</p></li>
</ul>

</Admonition>

## On web UI{#on-web-ui}

1. Navigate to your project.

1. Click on __Pipelines__ from the navigation panel. Then click__ + Pipeline__.

1. Choose the type of pipeline to create. Click on __+ Pipeline __button in the __Search Pipeline __column.

    ![create-search-pipeline](/img/create-search-pipeline.png)

1. Configure the Search pipeline you wish to create.

    |  __Parameters__         |  __Description__                                                                                               |
    | ----------------------- | -------------------------------------------------------------------------------------------------------------- |
    |  Pipeline Name          |  The name of the new Search pipeline. It should only contain lowercase letters, numbers, and underscores only. |
    |  Description (Optional) |  The description of the new Search pipeline.                                                                   |

    ![configure-search-pipeline](/img/configure-search-pipeline.png)

1. Add a function to the Search pipeline. You can add exactly one __SEARCH_DOC_CHUNK__ function.

    <Admonition type="info" icon="📘" title="Notes">

    <p>For convenience, the web UI forces the input field name to be <code>query_text</code>. To customize it, you can <a href="./create-search-piplines#via-restful-api">create a Search pipeline via RESTful API</a>.</p>

    </Admonition>

    1. Enter function name.

    1. Choose __Target Cluster__ and __Target collection__. The Target Cluster must be serverless cluster and the Target Collection must be created by an Ingestion pipeline, otherwise the Search pipeline won't be compatible.

    1. (Optional) Enable reranker if you want to reorder or rank a set of candidate outputs to improve the quality of the search results. By default, this feature is disabled. Once enabled, you can choose the model service used for reranking. Currently, only __zilliz/bge-reranker-base__ is available.

        |  __Reranker Mode Service__ |  __Description__                                                                                                                                                                                                    |
        | -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
        |  zilliz/bge-reranker-base  |  Open-source reranker model published by BAAI. This model is hosted on Zilliz Cloud and co-located with other Zilliz services, thus has the best latency. One of the best performers according to MTEB leaderboard. |

        ![add-function-to-search-pipeline](/img/add-function-to-search-pipeline.png)

    1. Click __Add__ to save your function.

1. Click__ Create Search Pipeline__.

## Via RESTful API{#via-restful-api}

<Admonition type="info" icon="📘" title="Notes">

<p>When creating a Search pipeline, the cluster and collection are defined at the function level instead of the pipeline level. </p>

</Admonition>

The following example creates a Search pipeline named `my_text_search_pipeline` with a __SEARCH_DOC_CHUNK__ function added. 

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
                "collectionName": "my_new_collection",
                "reranker": "zilliz/bge-reranker-base"
            }
        ]
    }
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `projectId`: The ID of the project in which you want to create a pipeline. Learn more about [How Can I Obtain the Project ID?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`: The name of the pipeline to create. The pipeline name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

- `description` (optional): The description of the pipeline to create

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. __A Search pipeline can only have one function.__

    - `name`: The name of the function. The function name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

    - `action`: The type of the function to add. You can only add a `SEARCH_DOC_CHUNK` function to a Search pipeline.

    - `inputField`: The name of the `inputField`. You can configure this parameter as you wish. But when [running the pipeline](./run-pipelines), you should always use a consistent input field name.

    - `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a serverless cluster or a dedicated cluster deployed on GCP us-west1. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

    - `collectionName`: The name of the collection in which you want to create a pipeline.

    - `reranker`(Optional): This is an optional parameter for those who want to reorder or rank a set of candidate outputs to improve the quality of the search results. If you do not need the reranker, you can omit this parameter. Currently, only `zilliz/bge-reranker-base` is available as the parameter value.

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
        "embedding": "zilliz/bge-base-en-v1.5",
        "reranker": "zilliz/bge-reranker-base"
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

- [FAQs](/docs/faq-pipelines)

