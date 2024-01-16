---
slug: /create-piplines-rest
beta: TRUE
notebook: FALSE
token: Frj7wEoUgiSDeYkkZ59cyYu1nEg
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Create Pipelines (RESTful API)

Creating Pipelines via RESTful API offers more flexibility and customization compared to the Web UI.

In Zilliz Cloud, you must create an Ingestion pipeline first. Upon successful creation of an Ingestion pipeline, you can create a Search pipeline and a Deletion pipeline to work with your newly created Ingestion pipeline.

## Create a pipeline{#create-a-pipeline}

### Create an Ingestion pipeline{#create-an-ingestion-pipeline}

A collection will be created as part of Ingestion pipeline creation. The cluster and name of newly created collection must be specified. Replace `${CLUSTER_ID}` with your own cluster ID.

<Admonition type="info" icon="📘" title="Notes">

Currently pipelines only work with collections in a [serverless cluster](./create-cluster#set-up-a-serverless-cluster).

</Admonition>

The following example creates an Ingestion pipeline named `my_doc_ingestion_pipeline` with an **INDEX_DOC** function and a **PRESERVE** function.

<Admonition type="info" icon="📘" title="Notes">

- By specifying the `projectId`, you indicate in which project to create the pipeline. Learn more about [how to obtain the project ID](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID-).

- For the PRESERVE function, `inputField` must be identical with the `outputField`.

- Possible field types are `Bool`, `Int8`, `Int16`, `Int32`, `Int64`, `Float`, `Double`, and `VarChar`.

- Possible language options are `ENGLISH` and `CHINESE`.

- The name of a pipeline and a function should not include hyphens (-).

- For the INDEX_DOC function, by default, Zilliz Cloud segments the header-separated sections in Markdown or HTML documents or the documents of other supported types into chunks of 500 tokens. You can change the chunk size within the range from 20 to 500 to apply your own chunking strategy.

</Admonition>

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx"，
        "name": "my_doc_ingestion_pipeline",
        "description": "A pipeline that splits a text file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
        "type": "INGESTION",  
        "functions": [
            { 
                "name": "index_my_doc",
                "action": "INDEX_DOC", 
                "inputField": "doc_url", 
                "language": "ENGLISH",
                "chunkSize": 500,
            },
            {
                "name": "keep_doc_info",
                "action": "PRESERVE", 
                "inputField": "publish_year", 
                "outputField": "publish_year",
                "fieldType": "Int16" 
            }
        ],
        "clusterId": "${CLUSTER_ID}",
        "newCollectionName": "my_new_collection"
    }'
```

If the Ingestion pipeline is created successfully, the response will be similar to the following:

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
        "chunkSize": 500
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

When the Ingestion pipeline is created, a collection named `my_new_collection` is automatically created.

This collection contains six fields: one ID field that is automatically generated, four output fields of the **INDEX_DOC** function, and one output field for each **PRESERVE** function. The collection schema of above example is as follows.

|  id<br/> (Data Type: Int64) |  doc_name<br/> (Data type: VarChar) |  chunk_id<br/> (Data type: Int64) |  chunk_text<br/> (Data type: VarChar) |  embedding<br/> (Data type: FLOAT_VECTOR) |  publish_year<br/> (Data type: Int16) |
| ------------------------------ | -------------------------------------- | ------------------------------------ | ---------------------------------------- | -------------------------------------------- | ---------------------------------------- |

### Create a Search pipeline{#create-a-search-pipeline}

Once you have created an Ingestion pipeline, you can call the API as follows to create a Search pipeline. Unlike Ingestion pipelines, when creating a Search pipeline, the cluster and collection are defined at the function level instead of the pipeline level. This is because Zilliz Cloud allows you to search from multiple collections at a time.

Currently, only one function is allowed in a Search pipeline.

The following example creates a Search pipeline named `my_text_search_pipeline` with a **SEARCH_DOC_CHUNK** function added. You can specify the name of the `inputField` as you wish. But when [running the pipeline](./run-pipelines), you should always use a consistent input field name.

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
    }'
```

If the command output is similar as follows, the Search pipeline is created successfully.

```bash
{
  "code": 200,
  "data": {
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
        "collectionName": "my_new_collection"
      }
    ]
  }
}
```

### Create a Deletion pipeline{#create-a-deletion-pipeline}

To create a Deletion pipeline, you need to have a compatible Ingestion pipeline created in advance. Similar to the Ingestion pipeline, cluster and collection are defined at the pipeline level when creating a Deletion pipeline.

The example below creates a Deletion pipeline named `my_doc_deletion_pipeline`. 

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

If the command output is similar as follows, the Deletion pipeline is created successfully.

```bash
{
  "code": 200,
  "data": {
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
}
```

## List pipelines{#list-pipelines}

You can also call the API to list all existing pipelines in a project or view a particular pipeline.

### List all pipelines in a project{#list-all-pipelines-in-a-project}

To list all pipelines in a project, you need to specify the `projectId`.  Learn more about [how to obtain the project ID](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID-).

```bash
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines?projectId=proj-xxxx"
```

After calling the API, you will get a list of existing pipelines in this project. Below is an example. We can see the Ingestion, Search, and Deletion pipeline we just created.

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
          "chunkSize": 500
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
          "collectionName": "my_new_collection"
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

### Get the details of a pipeline{#get-the-details-of-a-pipeline}

To view the details of a particular pipeline, call the API as follows. The following example lists the details of the pipeline `my_doc_ingestion_pipeline` (assuming its `pipelineId` is `pipe-6ca5dd1b4672659d3c3487`).

```bash
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-6ca5dd1b4672659d3c3487"
```

The command output shows the details of the Ingestion pipeline we created.

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
        "chunkSize": 500
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

## Drop a pipeline{#drop-a-pipeline}

When you no longer need a pipeline, you can drop it. 

<Admonition type="caution" icon="🚧" title="Warning">

Dropped pipelines cannot be recovered. Please be cautious with the action.

</Admonition>

The following example drops the Ingestion pipeline `my_doc_ingestion_pipeline` (assuming its `pipelineId` is `pipe-6ca5dd1b4672659d3c3487` ).

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
        "chunkSize": 500
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
