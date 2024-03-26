---
slug: /manage-pipelines
beta: FALSE
notebook: FALSE
type: origin
token: RxmuwIgydiN3vkkKmATcam59nDc
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Manage Pipelines

This guide walks you through how to manage your created pipelines.

## View pipeline{#view-pipeline}

### On web UI{#on-web-ui}

Click __Pipelines__ on the left navigation. Choose the __Pipelines__ tab. You will see all the available pipelines, their detailed information, and the token usage of each pipeline. 

![view-pipelines-on-web-ui](/img/view-pipelines-on-web-ui.png)

You can also check the pipeline activities on the web UI.

![view-pipelines-activities-on-web-ui](/img/view-pipelines-activities-on-web-ui.png)

### Via RESTful API{#via-restful-api}

You can call the API to list all existing pipelines or view the details of a particular pipeline.

- __View all existing pipelines__

    Follow the example below and specify your `projectId`.  Learn more about [how to obtain the project ID](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID-).

    ```bash
    curl --request GET \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines?projectId=proj-xxxx"
    ```

    Below is an example output.

    ```bash
    {
      "code": 200,
      "data": [
        {
          "pipelineId": "pipe-6ca5dd1b4672659d3c3487",
          "name": "my_doc_ingestion_pipeline",
          "type": "INGESTION",
          "description": "A pipeline that splits a text file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
          "status": "SERVING",
          "totalTokenUsage": 0,
          "functions": [
            {
              "action": "INDEX_DOC",
              "name": "index_my_doc",
              "inputField": "doc_url",
              "language": "ENGLISH",
              "chunkSize": 500,
              "embedding": "zilliz/bge-base-en-v1.5"
            },
            {
              "action": "PRESERVE",
              "name": "keep_doc_info",
              "inputField": "publish_year",
              "outputField": "publish_year",
              "fieldType": "Int16"
            }
          ],
          "clusterId": "in03-***************",
          "newCollectionName": "my_new_collection"
        },
        {
          "pipelineId": "pipe-26a18a66ffc8c0edfdb874",
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
          ]
        },
        {
          "pipelineId": "pipe-7227d0729d73e63002ed46",
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
      ]
    }
    ```

- __View the details of a specific pipeline__

    Follow the example below to view the details of a pipeline. Replace the value of `pipelineId`(`pipe-6ca5dd1b4672659d3c3487`) with your own pipeline ID.

    ```bash
    curl --request GET \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-6ca5dd1b4672659d3c3487"
    ```

    Below is example output.

    ```bash
    {
      "code": 200,
      "data": {
        "pipelineId": "pipe-6ca5dd1b4672659d3c3487",
        "name": "my_doc_ingestion_pipeline",
        "type": "INGESTION",
        "description": "A pipeline that splits a text file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
        "status": "SERVING",
        "totalTokenUsage": 0,
        "functions": [
          {
            "action": "INDEX_DOC",
            "name": "index_my_doc",
            "inputField": "doc_url",
            "language": "ENGLISH",
            "chunkSize": 500,
            "embedding": "zilliz/bge-base-en-v1.5"
          },
          {
            "action": "PRESERVE",
            "name": "keep_doc_info",
            "inputField": "publish_year",
            "outputField": "publish_year",
            "fieldType": "Int16"
          }
        ],
        "clusterId": "in03-***************",
        "newCollectionName": "my_new_collection"
      }
    }
    ```

## Drop pipeline{#drop-pipeline}

If you no longer need a pipeline, you can drop it.  Note that dropping a pipeline will not remove the auto-created collection where it ingested data.

<Admonition type="caution" icon="🚧" title="Warning">

<ul>
<li><p>Dropped pipelines cannot be recovered. Please be cautious with the action.</p></li>
<li><p>Dropping a data-ingestion pipeline does not affect the collection created along with the pipeline. Your data is safe.</p></li>
</ul>

</Admonition>

### On web UI{#on-web-ui}

To drop a pipeline on the web UI, click the __...__ button under the __Actions__ column. Then click __Drop__.

![delete-pipeline](/img/delete-pipeline.png)

### Via RESTful API{#via-restful-api}

Follow the example below to drop a pipeline. Replace the value of `pipelineId`(`pipe-6ca5dd1b4672659d3c3487`) with your own pipeline ID.

```bash
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-6ca5dd1b4672659d3c3487"
```

The following is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-6ca5dd1b4672659d3c3487",
    "name": "my_doc_ingestion_pipeline",
    "type": "INGESTION",
    "description": "A pipeline that splits a text file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
    "status": "SERVING",
    "totalTokenUsage": 0,
    "functions": [
      {
        "action": "INDEX_DOC",
        "name": "index_my_doc",
        "inputField": "doc_url",
        "language": "ENGLISH",
        "chunkSize": 500,
        "embedding": "zilliz/bge-base-en-v1.5"
      },
      {
        "action": "PRESERVE",
        "name": "keep_doc_info",
        "inputField": "publish_year",
        "outputField": "publish_year",
        "fieldType": "Int16"
      }
    ],
    "clusterId": "in03-***************",
    "newCollectionName": "my_new_collection"
  }
}
```

## Related topics{#related-topics}

- [Estimate Pipelines Usage](./estimate-pipelines-usage)

- [Run Ingestion Pipeline](./run-ingestion-pipelines)

- [Run Search Pipeline](./run-search-pipelines)

- [Run Deletion Pipeline](./run-deletion-pipelines)

- [Zilliz Cloud Limits](./limits#pipelines)

- [FAQs](/docs/faq-pipelines)

