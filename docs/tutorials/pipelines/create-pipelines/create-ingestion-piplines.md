---
slug: /create-ingestion-piplines
beta: TRUE
notebook: FALSE
token: QFsIwkbwVi7CWdkMVGQcFnPonLc
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Create Ingestion Pipeline

The Zilliz Cloud web UI provides a simplified and intuitive way of creating Pipelines while creating pipelines via RESTful API offers more flexibility and customization compared to the Web UI.

In Zilliz Cloud, you must create an [Ingestion pipeline](./understanding-pipelines#ingestion-pipelines) first. Upon successful creation of an Ingestion pipeline, you can create a [Search pipeline](./create-search-piplines) and a [Deletion pipeline](./create-deletion-pipelines) to work with your newly created Ingestion pipeline.

A collection will be created automatically as part of Ingestion pipeline creation.

<Admonition type="info" icon="📘" title="Notes">

- Currently, pipelines only work with collections in a [serverless cluster](./create-cluster#set-up-a-serverless-cluster) or a dedicated cluster deployed on GCP us-west1.

- In one project, you can only create up to 10 pipelines of the same type.

</Admonition>

## On web UI{#on-web-ui}

1. Navigate to your project.

1. Click on **Pipelines** from the navigation panel. Then click** + Pipeline**.

    ![create-pipeline](/img/create-pipeline.png)

1. Choose the type of pipeline to create. Click on **+ Pipeline **button in the **Ingestion Pipeline **column.

    <Admonition type="info" icon="📘" title="Notes">

    You must create an Ingestion pipeline first before creating Search and Deletion pipelines.

    </Admonition>

    ![choose-pipeline](/img/choose-pipeline.png)

1. Configure the Ingestion pipeline you wish to create.

    |  **Parameters**         |  **Description**                                                                                                                                                                                  |
    | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  Target Cluster         |  The cluster where a new collection will be automatically created with this Ingestion pipeline. Currently, this can only be a serverless cluster or a dedicated cluster deployed on GCP us-west1. |
    |  Collection Name        |  The name of the auto-created collection.                                                                                                                                                         |
    |  Pipeline Name          |  Name of the new Ingestion pipeline. It should only contain lowercase letters, numbers, and underscores.                                                                                          |
    |  Description (Optional) |  The description of the new Ingestion pipeline.                                                                                                                                                   |

    ![configure-ingestion-pipeline](/img/configure-ingestion-pipeline.png)

1. Add a function to the Ingestion pipeline. For each Ingestion pipeline, you can add exactly one **INDEX_DOC** function and up to five **PRESERVE** functions.

    - Add an **INDEX_DOC** function.

        An **INDEX_DOC** function splits your document into multiple smaller chunks, vectorizes each of them, and saves the generated vector embeddings into the collection. 

        1. Enter function name.

        1. Choose the embedding model used to generate vector embeddings. Different document languages have distinct embedding models. Currently, there are 5 available models for the English language: **zilliz/bge-base-en-v1.5**, **voyageai/voyage-2**,** voyageai/voyage-code-2**,** openai/text-embedding-3-small**, and **openai/text-embedding-3-large**. For the Chinese language, only **zilliz/bge-base-zh-v1.5** is available. The following chart briefly introduces each embedding model.

            |  **Embedding Model **           |  **Description**                                                                                                                                                                                                                                                          |
            | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
            |  zilliz/bge-base-en-v1.5        |  Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model when `language` is `ENGLISH`.                             |
            |  voyageai/voyage-2              |  Hosted by Voyage AI. This general purpose model excels in retrieving technical documentation containing descriptive text and code. Its lighter version voyage-lite-02-instruct ranks top on MTEB leaderboard. This model is only available when `language` is `ENGLISH`. |
            |  voyageai/voyage-code-2         |  Hosted by Voyage AI. This model is optimized for programming code, providing outstanding quality for retrieval code blocks. This model is only available when `language` is `ENGLISH`.                                                                                   |
            |  openai/text-embedding-3-small  |  Hosted by OpenAI. This highly efficient embedding model has stronger performance over its predecessor text-embedding-ada-002 and balances inference cost and quality. This model is only available when `language` is `ENGLISH`.                                         |
            |  openai/text-embedding-3-large  |  Hosted by OpenAI. This is OpenAI's best performing model. Compared to text-embedding-ada-002, the MTEB score has increased from 61.0% to 64.6%. This model is only available when `language` is `ENGLISH`.                                                               |
            |  zilliz/bge-base-zh-v1.5        |  Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model when `language` is `CHINESE`.                             |

        1. (Optional) Customize the chunk size. The function segments each document into smaller chunks. By default, each chunk contains no more than 500 tokens, but you can adjust the size for custom chunking strategies. Moreover, for markdown or HTML files, the function first divides the document by headers, then further by larger sections based on the specified chunk size.

            The following table lists the mapping relationship between applicable models and their corresponding chunk sizes.

            |  **Model**                     |  **Chunk Size Range (tokens)** |
            | ------------------------------ | ------------------------------ |
            |  zilliz/bge-base-en-v1.5       |  20-500 tokens                 |
            |  zilliz/bge-base-zh-v1.5       |  20-500 tokens                 |
            |  voyageai/voyage-2             |  20-3,000   tokens             |
            |  voyageai/voyage-code-2        |  20-12,000 tokens              |
            |  openai/text-embedding-3-small |  20-8,191 tokens               |
            |  openai/text-embedding-3-large |  20-8,191 tokens               |

            ![customize-chunk-size](/img/customize-chunk-size.png)

        1. Click **Add** to save your function.

    - Add a **PRESERVE** function.

        A **PRESERVE** function adds additional scalar fields to the collection along with data ingestion.

        1. Enter function name.

        1. Configure the input field name and type. Supported input field types include **Bool**, **Int8**, **Int16**, **Int32**, **Int64**, **Float**, **Double**, and **VarChar**.

            <Admonition type="info" icon="📘" title="Notes">

            - Currently, the output field name must be identical to the input field name. The input field name defines the field name used when running the Ingestion pipeline. The output field name defines the field name in the vector collection schema where the preserved value is kept.            
            
            - For **VarChar** fields, the value should be a string with a maximum length of **4,000** alphanumeric characters.            
            
            - When storing date-time in scalar fields, it is recommended to use the **Int16** data type for year data, and **Int32** for timestamps.

            </Admonition>

        1. Click **Add** to save your function.

1. Click** Create Ingestion Pipeline**.

1. Continue creating a [Search pipeline ](./understanding-pipelines#search-pipelines)and a [Deletion pipeline](./understanding-pipelines#deletion-pipelines) that is auto-configured to be compatible with the just-created Ingestion pipeline. 

    ![ingestion-pipeline-created-successfully](/img/ingestion-pipeline-created-successfully.png)

## Via RESTful API{#via-restful-api}

The following example creates an Ingestion pipeline named `my_doc_ingestion_pipeline` with an **INDEX_DOC** function and a **PRESERVE** function added. 

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
                "embedding": "zilliz/bge-base-en-v1.5"
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
    }
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](./manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `projectId`: The ID of the project in which you want to create a pipeline. Learn more about [How Can I Obtain the Project ID?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`: The name of the pipeline to create. The pipeline name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

- `description` (optional): The description of the pipeline to create

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. **An Ingestion pipeline can have only one INDEX_DOC function and up to five PRESERVE functions.**

    - `name`: The name of the function. The function name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

    - `action`: The type of the function to add. You add an `INDEX_DOC` or a `PRESERVE` function to an Ingestion pipeline.

    - `inputField`: The name of the `inputField`. For the `INDEX_DOC` function, the value should be `doc_url`. For the `PRESERVE` function, the you can customize the value but it should be identical with the `outputField`.

    - `language`: The language of your document to ingest. Possible values include `ENGLISH` and `CHINESE`. *(This parameter is only used in the `INDEX_DOC` function.)*

    - `embedding` (optional): The embedding model used to generate vector embeddings for your document. Available options are as follows. If not specified, **zilliz/bge-base-en-v1.5** will be used for **English** documents and **zilliz/bge-base-zh-v1.5** will be used for **Chinese** documents. *(This parameter is only used in the `INDEX_DOC` function.)*

        |  **Embedding Model **           |  **Description**                                                                                                                                                                                                                                                          |
        | ------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
        |  zilliz/bge-base-en-v1.5        |  Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model when `language` is `ENGLISH`.                             |
        |  voyageai/voyage-2              |  Hosted by Voyage AI. This general purpose model excels in retrieving technical documentation containing descriptive text and code. Its lighter version voyage-lite-02-instruct ranks top on MTEB leaderboard. This model is only available when `language` is `ENGLISH`. |
        |  voyageai/voyage-code-2         |  Hosted by Voyage AI. This model is optimized for programming code, providing outstanding quality for retrieval code blocks. This model is only available when `language` is `ENGLISH`.                                                                                   |
        |  openai/text-embedding-3-small  |  Hosted by OpenAI. This highly efficient embedding model has stronger performance over its predecessor text-embedding-ada-002 and balances inference cost and quality. This model is only available when `language` is `ENGLISH`.                                         |
        |  openai/text-embedding-3-large  |  Hosted by OpenAI. This is OpenAI's best performing model. Compared to text-embedding-ada-002, the MTEB score has increased from 61.0% to 64.6%. This model is only available when `language` is `ENGLISH`.                                                               |
        |  zilliz/bge-base-zh-v1.5        |  Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model when `language` is `CHINESE`.                             |

    - `chunkSize` (optional): The INDEX_DOC function segments each document into smaller chunks. By default, each chunk contains no more than 500 tokens, but you can adjust the size for custom chunking strategies. Moreover, for markdown or HTML files, the function first divides the document by headers, then further by larger sections based on the specified chunk size. *(This parameter is only used in the `INDEX_DOC` function.)*

        The following table lists the mapping relationship between applicable models and their corresponding chunk sizes.

        |  **Model**                     |  **Chunk Size Range (tokens)** |
        | ------------------------------ | ------------------------------ |
        |  zilliz/bge-base-en-v1.5       |  20-500 tokens                 |
        |  zilliz/bge-base-zh-v1.5       |  20-500 tokens                 |
        |  voyageai/voyage-2             |  20-3,000   tokens             |
        |  voyageai/voyage-code-2        |  20-12,000 tokens              |
        |  openai/text-embedding-3-small |  20-8,191 tokens               |
        |  openai/text-embedding-3-large |  20-8,191 tokens               |

    - `outputField`: The name of the output field which will be used in the collection schema. Currently, the output field name must be identical to the input field name. *(This parameter is only used in the `PRESERVE` function.)*

    - `fieldType`: The data type of the input and output fields. Possible values include `Bool`, `Int8`, `Int16`, `Int32`, `Int64`, `Float`, `Double`, and `VarChar`. *(This parameter is only used in the `PRESERVE` function.)*

        <Admonition type="info" icon="📘" title="Notes">

        When storing date-time in scalar fields, it is recommended to use the **Int16** data type for year data, and **Int32** for timestamps.        
        
        For `VarChar` field type, the `max_length` of the data in this field cannot exceed 4,000.

        </Admonition>

    - `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a serverless cluster or a dedicated cluster deployed on GCP us-west1. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

    - `newCollectionName`: The name of the collection in which you want to create a pipeline.

Below is an example output.

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

When the Ingestion pipeline is created, a collection named `my_new_collection` is automatically created.

This collection contains six fields: one ID field that is automatically generated, four output fields of the **INDEX_DOC** function, and one output field for each **PRESERVE** function. The collection schema is as follows.

|  id<br/> (Data Type: Int64) |  doc_name<br/> (Data type: VarChar) |  chunk_id<br/> (Data type: Int64) |  chunk_text<br/> (Data type: VarChar) |  embedding<br/> (Data type: FLOAT_VECTOR) |  publish_year<br/> (Data type: Int16) |
| ------------------------------ | -------------------------------------- | ------------------------------------ | ---------------------------------------- | -------------------------------------------- | ---------------------------------------- |

## Related topics{#related-topics}

- [[WIP] Manage Pipelines](./manage-pipelines)

- [[WIP] Run Ingestion Pipeline](./run-ingestion-pipelines)

- [Estimate Pipelines Usage](./estimate-pipelines-usage)

- [Zilliz Cloud Limits](./limits#pipelines)

- https://zilliverse.feishu.cn/wiki/EV41wG08BiOWW8kbo9xcTGoPnKd#BjfidFi9FoqCXvxCTt2cQJPJnTf

