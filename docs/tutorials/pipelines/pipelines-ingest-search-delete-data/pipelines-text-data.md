---
title: "Text Data | Cloud"
slug: /pipelines-text-data
sidebar_label: "Text Data"
beta: NEAR DEPRECATE
notebook: FALSE
description: "The Zilliz Cloud web UI provides a simplified and intuitive way of creating, running, and managing Pipelines while the RESTful API offers more flexibility and customization compared to the Web UI. | Cloud"
type: origin
token: ISAjwB6VLiAdS5kGoXYcdPBJnbf
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - text data
  - vector database
  - IVF
  - knn
  - Image Search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Text Data

The Zilliz Cloud web UI provides a simplified and intuitive way of creating, running, and managing Pipelines while the RESTful API offers more flexibility and customization compared to the Web UI.

This guide walks you through the necessary steps to create text pipelines, conduct a semantic search on your embedded text data, and delete the pipeline if it is no longer needed.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud Pipelines will be discontinued by the end of Q2 2025 and replaced by a new feature, “Data In, Data Out,” to streamline embedding generation in both Milvus and Zilliz Cloud. As of December 24, 2024, new user registrations are no longer accepted. Current users can continue using the service within the $20 monthly free allowance until the sunset date; however, no SLA is provided. Please consider using embedding APIs from model providers or open-source models to generate vector embeddings.</p>

</Admonition>

## Prerequisites and limitations{#prerequisites-and-limitations}

- Ensure you have created a cluster deployed in us-west1 on Google Cloud Platform (GCP).

- In one project, you can only create up to 100 pipelines of the same type. For more information, refer to [Zilliz Cloud Limits](./limits).

## Ingest text data{#ingest-text-data}

To ingest any data, you need to first create an ingestion pipeline and then run it.

### Create text ingestion pipeline{#create-text-ingestion-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Navigate to your project.

1. Click on **Pipelines** from the navigation panel. Then switch to the **Overview** tab and click **Pipelines**. To create a pipeline, click **+ Pipeline**.

    ![create-pipeline](/img/create-pipeline.png)

1. Choose the type of pipeline to create. Click on **+ Pipeline** button in the **Ingestion Pipeline** column.

    ![choose-pipeline](/img/choose-pipeline.png)

1. Configure the Ingestion pipeline you wish to create.

    <table>
       <tr>
         <th><p><strong>Parameters</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p>Target Cluster</p></td>
         <td><p>The cluster where a new collection will be automatically created with this Ingestion pipeline. Currently, this can only be a cluster  deployed on GCP us-west1.</p></td>
       </tr>
       <tr>
         <td><p>Collection Name</p></td>
         <td><p>The name of the auto-created collection.</p></td>
       </tr>
       <tr>
         <td><p>Pipeline Name</p></td>
         <td><p>Name of the new Ingestion pipeline. It should only contain lowercase letters, numbers, and underscores.</p></td>
       </tr>
       <tr>
         <td><p>Description (Optional)</p></td>
         <td><p>The description of the new Ingestion pipeline.</p></td>
       </tr>
    </table>

    ![configure-ingestion-pipeline](/img/configure-ingestion-pipeline.png)

1. Add an **INDEX** function to the Ingestion pipeline by clicking **+ Function**. For each Ingestion pipeline, you can add exactly one **INDEX** function.

    1. Enter function name.

    1. Select **INDEX_TEXT** as the function type. An **INDEX_TEXT** function can generate vector embeddings for all provided text inputs.

    1. Choose the embedding model used to generate vector embeddings. Different text languages have distinct embedding models. Currently, there are 5 available models for the English language: **zilliz/bge-base-en-v1.5**, **voyageai/voyage-2**, **voyageai/voyage-code-2**, **openai/text-embedding-3-small**, and **openai/text-embedding-3-large**. For the Chinese language, only **zilliz/bge-base-zh-v1.5** is available. The following chart briefly introduces each embedding model.

        <table>
           <tr>
             <th><p><strong>Embedding Model</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>zilliz/bge-base-en-v1.5</p></td>
             <td><p>Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/voyage-2</a></p></td>
             <td><p>Hosted by Voyage AI. This general purpose model excels in retrieving technical documentation containing descriptive text and code. Its lighter version voyage-lite-02-instruct ranks top on MTEB leaderboard. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/voyage-code-2</a></p></td>
             <td><p>Hosted by Voyage AI. This model is optimized for software code, providing outstanding quality for retrieving software documents and source code. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/voyage-large-2</a></p></td>
             <td><p>Hosted by Voyage AI. This is the most powerful generalist embedding model from Voyage AI. It supports 16k context length (4x that of voyage-2) and excels on various types of text including technical and long-context documents. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://openai.com/index/new-embedding-models-and-api-updates/">openai/text-embedding-3-small </a></p></td>
             <td><p>Hosted by OpenAI. This highly efficient embedding model has stronger performance over its predecessor text-embedding-ada-002 and balances inference cost and quality. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://openai.com/index/new-embedding-models-and-api-updates/">openai/text-embedding-3-large</a></p></td>
             <td><p>Hosted by OpenAI. This is OpenAI's best performing model. Compared to text-embedding-ada-002, the MTEB score has increased from 61.0% to 64.6%. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p>zilliz/bge-base-zh-v1.5</p></td>
             <td><p>Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model when <code>language</code> is <code>CHINESE</code>.</p></td>
           </tr>
        </table>

        ![add-index-text-function](/img/add-index-text-function.png)

    1. Click **Add** to save your function.

1. (Optional) Continue to add another **PRESERVE** function if you need to preserve the metadata for your texts. A **PRESERVE** function adds additional scalar fields to the collection along with data ingestion.

    <Admonition type="info" icon="📘" title="Notes">

    <p>For each Ingestion pipeline, you can add up to 50 <strong>PRESERVE</strong> functions.</p>

    </Admonition>

    1. Click **+ Function**.

    1. Enter function name.

    1. Configure the input field name and type. Supported input field types include **Bool**, **Int8**, **Int16**, **Int32**, **Int64**, **Float**, **Double**, and **VarChar**.

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p>Currently, the output field name must be identical to the input field name. The input field name defines the field name used when running the Ingestion pipeline. The output field name defines the field name in the vector collection schema where the preserved value is kept.</p></li>
        <li><p>For <strong>VarChar</strong> fields, the value should be a string with a maximum length of <strong>4,000</strong> alphanumeric characters.</p></li>
        <li><p>When storing date-time in scalar fields, it is recommended to use the <strong>Int16</strong> data type for year data, and <strong>Int32</strong> for timestamps.</p></li>
        </ul>

        </Admonition>

        ![add-preserve-function](/img/add-preserve-function.png)

    1. Click **Add** to save your function.

1. Click **Create Ingestion Pipeline**.

1. Continue creating a Search pipeline and a Deletion pipeline that is auto-configured to be compatible with the just-created Ingestion pipeline. 

    ![ingestion-pipeline-created-successfully](/img/ingestion-pipeline-created-successfully.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>By default, the reranker feature is disabled in the auto-configured search pipeline. If you need to enable reranker, please manually <a href="./pipelines-text-data#search-text-data">create a new search pipeline</a>.</p>

    </Admonition>

</TabItem>

<TabItem value="Bash">

The following example creates an Ingestion pipeline named `my_text_ingestion_pipeline` with an **INDEX_TEXT** function and a **PRESERVE** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "name": "my_text_ingestion_pipeline",
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "projectId": "proj-xxxx"，
        "collectionName": "my_collection",
        "description": "A pipeline that generates text embeddings and stores additional fields.",
        "type": "INGESTION",  
        "functions": [
            { 
                "name": "index_my_text",
                "action": "INDEX_TEXT", 
                "language": "ENGLISH",
                "embedding": "zilliz/bge-base-en-v1.5"
            },
            {
                "name": "keep_text_info",
                "action": "PRESERVE", 
                "inputField": "source", 
                "outputField": "source",
                "fieldType": "VarChar" 
            }
        ]   
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a cluster deployed in us-west1 on GCP. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

- `projectId`: The ID of the project in which you want to create a pipeline. Learn more about [How Can I Obtain the Project ID?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `collectionName`: The name of the collection automatically generated with the ingestion pipeline to create. Alternatively, you can also specify an existing collection.

- `name`: The name of the pipeline to create. The pipeline name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

- `description` (optional): The description of the pipeline to create.

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. **An Ingestion pipeline can have only one INDEX function and up to 50 PRESERVE functions.**

    - `name`: The name of the function. The function name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

    - `action`: The type of the function to add. Currently, available options include `INDEX_DOC`, `INDEX_TEXT`, `INDEX_IMAGE` and `PRESERVE`.

    - `language`: The language of your text to ingest. Possible values include `ENGLISH` and `CHINESE`. *(This parameter is only used in the `INDEX_TEXT` and `INDEX_DOC_CHUNK` function.)*

    - `embedding`: The embedding model used to generate vector embeddings for your text. Available options are as follows. *(This parameter is only used in the `Index` function.)*

        <table>
           <tr>
             <th><p><strong>Embedding Model</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>zilliz/bge-base-en-v1.5</p></td>
             <td><p>Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/voyage-2</a></p></td>
             <td><p>Hosted by Voyage AI. This general purpose model excels in retrieving technical documentation containing descriptive text and code. Its lighter version voyage-lite-02-instruct ranks top on MTEB leaderboard. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/voyage-code-2</a></p></td>
             <td><p>Hosted by Voyage AI. This model is optimized for programming code, providing outstanding quality for retrieval code blocks. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://docs.voyageai.com/docs/embeddings">voyageai/voyage-large-2</a></p></td>
             <td><p>Hosted by Voyage AI. This is the most powerful generalist embedding model from Voyage AI. It supports 16k context length (4x that of voyage-2) and excels on various types of text including technical and long-context documents. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://openai.com/index/new-embedding-models-and-api-updates/">openai/text-embedding-3-small </a></p></td>
             <td><p>Hosted by OpenAI. This highly efficient embedding model has stronger performance over its predecessor text-embedding-ada-002 and balances inference cost and quality. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p><a href="https://openai.com/index/new-embedding-models-and-api-updates/">openai/text-embedding-3-large</a></p></td>
             <td><p>Hosted by OpenAI. This is OpenAI's best performing model. Compared to text-embedding-ada-002, the MTEB score has increased from 61.0% to 64.6%. This model is only available when <code>language</code> is <code>ENGLISH</code>.</p></td>
           </tr>
           <tr>
             <td><p>zilliz/bge-base-zh-v1.5</p></td>
             <td><p>Released by BAAI, this state-of-the-art open-source model is hosted on Zilliz Cloud and co-located with vector databases, providing good quality and best network latency. This is the default embedding model when <code>language</code> is <code>CHINESE</code>.</p></td>
           </tr>
        </table>

- `inputField`: The name of the `inputField`. You can customize the value but it should be identical with the `outputField`.*(This parameter is only used in the `PRESERVE` function.)*

- `outputField`: The name of the output field which will be used in the collection schema. Currently, the output field name must be identical to the input field name. *(This parameter is only used in the `PRESERVE` function.)*

- `fieldType`: The data type of the input and output fields. Possible values include `Bool`, `Int8`, `Int16`, `Int32`, `Int64`, `Float`, `Double`, and `VarChar`. *(This parameter is only used in the `PRESERVE` function.)*

    <Admonition type="info" icon="📘" title="Notes">

    <p>When storing date-time in scalar fields, it is recommended to use the <strong>Int16</strong> data type for year data, and <strong>Int32</strong> for timestamps.</p>
    <p>For <code>VarChar</code> field type, the <code>max_length</code> of the data in this field cannot exceed 4,000.</p>

    </Admonition>

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxx",
    "name": "my_text_ingestion_pipeline",
    "type": "INGESTION",
    "createTimestamp": 1721187300000,
    "description": "A pipeline that generates text embeddings and stores additional fields.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": [
      {
        "name": "index_my_text",
        "action": "INDEX_TEXT",
        "inputFields": ["text_list"],
        "language": "ENGLISH",
        "embedding": "zilliz/bge-base-en-v1.5"
      },
      {
        "name": "keep_text_info",
        "action": "PRESERVE",
        "inputField": "source",
        "outputField": "source",
        "fieldType": "VarChar"
      }
    ],
    "clusterId": "inxx-xxxx",
    "collectionName": "my_collection"
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

A collection named `my_collection` will be automatically if it does not exist in the cluster. However, if it exists, Zililz Cloud Pipelines will check whether the collection schema is consistent with the schema defined in the pipeline. 

This collection contains four fields:  three output fields of the **INDEX_TEXT** function, and one output field for each **PRESERVE** function. The collection schema is as follows.

<table>
   <tr>
     <th><p>id (Data Type: Int64)</p></th>
     <th><p>text (Data type: VarChar)</p></th>
     <th><p>embedding (Data type: FLOAT_VECTOR)</p></th>
     <th><p>source (Data type: VarChar)</p></th>
   </tr>
</table>

</TabItem>

</Tabs>

### Run text ingestion pipeline{#run-text-ingestion-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Ingestion pipeline. 

    ![run-pipeline](/img/run-pipeline.png)

1. Input the text or text lists that need to be ingested in the `text_list` field. If you have added a PRESERVE function, enter the value in the defined preserved field as well. Click **Run**.

1. Check the results.

1. Input other texts to run again.

</TabItem>

<TabItem value="Bash">

The following example runs the Ingestion pipeline `my_text_ingestion_pipeline`. `source` is the metadata field that needs to be preserved. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
        "text_list": [
          "Zilliz Cloud is a fully managed vector database and data services, empowering you to unlock the full potential of unstructured data for your AI applications.",
          "It can store, index, and manage massive embedding vectors generated by deep neural networks and other machine learning (ML) models."
        ],
        "source": "Zilliz official website"
      }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `text_list`: The text or text list to ingest.

- `source` (optional): The metadata field to preserve. The input field name should be consistent with what you defined when creating the Ingestion pipeline and adding the **PRESERVE** function. The value of this field should also follow the predefined field type.

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "num_entities": 2,
    "usage": {
      "embedding": 63
    },
    "ids": [
      450524927755105948,
      450524927755105949
    ]
  }
}
```

</TabItem>

</Tabs>

## Search text data{#search-text-data}

To search any data, you need to first create a search pipeline and then run it. Unlike Ingestion and Deletion pipelines, when creating a Search pipeline, the cluster and collection are defined at the function level instead of the pipeline level. This is because Zilliz Cloud allows you to search from multiple collections at a time.

### Create text search pipeline{#create-text-search-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Navigate to your project.

1. Click on **Pipelines** from the navigation panel. Then switch to the **Overview** tab and click **Pipelines**. To create a pipeline, click **+ Pipeline**.

1. Choose the type of pipeline to create. Click on **+ Pipeline** button in the **Search Pipeline** column.

    ![create-search-pipeline](/img/create-search-pipeline.png)

1. Configure the Search pipeline you wish to create.

    <table>
       <tr>
         <th><p><strong>Parameters</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p>Pipeline Name</p></td>
         <td><p>The name of the new Search pipeline. It should only contain lowercase letters, numbers, and underscores only.</p></td>
       </tr>
       <tr>
         <td><p>Description (Optional)</p></td>
         <td><p>The description of the new Search pipeline.</p></td>
       </tr>
    </table>

    ![configure-search-pipeline](/img/configure-search-pipeline.png)

1. Add a function to the Search pipeline by clicking **+ Function**. You can add exactly one function.

    1. Enter function name.

    1. Choose **Target Cluster** and **Target collection**. The **Target Cluster** must be a cluster deployed in **us-west1 on Google Cloud Platform (GCP)**. and the **Target Collection** must be created by an Ingestion pipeline, otherwise the Search pipeline will not be compatible.

    1. Select **SEARCH_TEXT** as the **Function Type**. A **SEARCH_TEXT** function can convert the query text to a vector embedding and retrieve topK most relevant text entities.

    1. (Optional) Enable [reranker](./reranker) if you want to rank the search results based on their relevance to the query to improve search quality. However, note that enabling reranker will lead to higher cost and search latency. By default, this feature is disabled. Once enabled, you can choose the model service used for reranking. Currently, only **zilliz/bge-reranker-base** is available.

        <table>
           <tr>
             <th><p><strong>Reranker Model Service</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>zilliz/bge-reranker-base</p></td>
             <td><p>Open-source cross-encoder architecture reranker model published by BAAI. This model is hosted on Zilliz Cloud.</p></td>
           </tr>
        </table>

        ![add-search-text-function](/img/add-search-text-function.png)

    1. Click **Add** to save your function.

1. Click **Create Search Pipeline**.

</TabItem>

<TabItem value="Bash">

The following example creates a Search pipeline named `my_text_search_pipeline` with a **SEARCH_TEXT** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",       
        "name": "my_text_search_pipeline",
        "description": "A pipeline that receives text and search for semantically similar texts",
        "type": "SEARCH",
        "functions": [
            {
                "name": "search_text",
                "action": "SEARCH_TEXT",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_collection",
                "embedding": "zilliz/bge-base-en-v1.5",
                "reranker": "zilliz/bge-reranker-base"
            }
        ]
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `projectId`: The ID of the project in which you want to create a pipeline. Learn more about [How Can I Obtain the Project ID?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`: The name of the pipeline to create. The pipeline name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

- `description` (optional): The description of the pipeline to create.

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. **A Search pipeline can only have one function.**

    - `name`: The name of the function. The function name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

    - `action`: The type of the function to add. Currently, available options include `SEARCH_DOC_CHUNK`, `SEARCH_TEXT`, `SEARCH_IMAGE_BY_IMAGE`, and `SEARCH_IMAGE_BY_TEXT`.

    - `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a cluster deployed in us-west1 on GCP. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

    - `collectionName`: The name of the collection in which you want to create a pipeline.

    - `embedding`: The embedding model used during vector search. The model should be consistent with the one chosen in the compatible collection.

    - `reranker`(Optional): This is an optional parameter for those who want to reorder or rank a set of candidate outputs to improve the quality of the search results. If you do not need the [reranker](./reranker), you can omit this parameter. Currently, only `zilliz/bge-reranker-base` is available as the parameter value.

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxxx",
    "name": "my_text_search_pipeline",
    "type": "SEARCH",
    "createTimestamp": 1721187655000,
    "description": "A pipeline that receives text and search for semantically similar texts",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0,
      "rerank": 0
    },
    "functions": [
      {
        "name": "search_text",
        "action": "SEARCH_TEXT",
        "inputFields": [
          "query_text"
        ],
        "clusterId": "inxx-xxxx",
        "collectionName": "my_collection",
        "reranker": "zilliz/bge-reranker-base",
        "embedding": "zilliz/bge-base-en-v1.5"
      }
    ]
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

</TabItem>

</Tabs>

### Run text search pipeline{#run-text-search-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Search pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Input the query text. Click **Run**.

1. Check the results.

1. Enter new query text to rerun the pipeline.

</TabItem>

<TabItem value="Bash">

The following example runs the Search pipeline named `my_text_search_pipeline`. The query text is "What is Zilliz Cloud?".

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
      "data": {
        "query_text": "What is Zilliz Cloud?"
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": [],
          "filter": "id >= 0" 
      }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `query_text`: The query text used to conduct a semantic search.

- `params`: The search parameters to configure.

    - `limit`: The maximum number of entities to return. The value should be an integer ranging from **1** to **500**. The sum of this value of that of `offset` should be less than **1024**.

    - `offset`: The number of entities to skip in the search results.

        The sum of this value and that of `limit` should not be greater than **1024**.The maximum value is **1024**.

    - `outputFields`: An array of fields to return along with the search results. Note that `id`（entity ID）, `distance`, and `text` will be returned in the search result by default. If you need other output fields in the returned result, you can configure this parameter.

    - `filter`: The [filter](./filtering) in boolean expression used to find matches for the search

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": 450524927755105948,
        "distance": 0.9997715353965759,
        "text": "Zilliz Cloud is a fully managed vector database and data services, empowering you to unlock the full potential of unstructured data for your AI applications."
      }
    ],
    "usage": {
      "embedding": 17,
      "rerank": 43
    }
  }
}
```

</TabItem>

</Tabs>

## Delete text data{#delete-text-data}

To delete any data, you need to first create a deletion pipeline and then run it.

### Create text deletion pipeline{#create-text-deletion-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Navigate to your project.

1. Click on **Pipelines** from the navigation panel. Then switch to the **Overview** tab and click **Pipelines**. To create a pipeline, click **+ Pipeline**.

1. Choose the type of pipeline to create. Click on **+ Pipeline** button in the **Deletion Pipeline** column.

    ![create-deletion-pipeline](/img/create-deletion-pipeline.png)

1. Configure the Deletion pipeline you wish to create.

    <table>
       <tr>
         <th><p><strong>Parameters</strong></p></th>
         <th><p><strong>Description</strong></p></th>
       </tr>
       <tr>
         <td><p>Pipeline Name</p></td>
         <td><p>The name of the new Deletion pipeline. It should only contain lowercase letters, numbers, and underscores.</p></td>
       </tr>
       <tr>
         <td><p>Description (Optional)</p></td>
         <td><p>The description of the new Deletion pipeline.</p></td>
       </tr>
    </table>

    ![configure-deletion-pipeline](/img/configure-deletion-pipeline.png)

1. Add a function to the Deletion pipeline by clicking **+ Function**. You can add exactly one function.

    1. Enter function name.

    1. Select either **PURGE_TEXT_INDEX** or **PURGE_BY_EXPRESSION** as the **Function Type**. A **PURGE_TEXT_INDEX** function can delete all text entities with the specified id while a **PURGE_BY_EXPRESSION** function can delete all text entities matching the specified filter expression.

    1. Click **Add** to save your function.

1. Click **Create Deletion Pipeline**.

</TabItem>

<TabItem value="Bash">

The example below creates a Deletion pipeline named `my_text_deletion_pipeline` with a **PURGE_BY_EXPRESSION** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",
        "name": "my_text_deletion_pipeline",
        "description": "A pipeline that deletes entities by expression",
        "type": "DELETION",
        "functions": [
            {
                "name": "purge_data_by_expression",
                "action": "PURGE_BY_EXPRESSION"
            }
        ], 
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "my_collection"
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `projectId`: The ID of the project in which you want to create a pipeline. Learn more about [How Can I Obtain the Project ID?](https://support.zilliz.com/hc/en-us/articles/22048954409755-How-Can-I-Obtain-the-Project-ID)

- `name`: The name of the pipeline to create. The pipeline name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

- `description` (optional): The description of the pipeline to create.

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. **A Deletion pipeline can only have one function.**

    - `name`: The name of the function. The function name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

    - `action`: The type of the function to add. Available options include `PURGE_DOC_INDEX`, `PURGE_TEXT_INDEX`, `PURGE_BY_EXPRESSION`, and `PURGE_IMAGE_INDEX`.

- `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a cluster deployed on GCP us-west1. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

- `collectionName`: The name of the collection in which you want to create a pipeline.

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxxx",
    "name": "my_text_deletion_pipeline",
    "type": "DELETION",
    "createTimestamp": 1721187655000,
    "description": "A pipeline that deletes entities by expression",
    "status": "SERVING",
    "functions": [
      {
        "action": "PURGE_BY_EXPRESSION",
        "name": "purge_data_by_expression",
        "inputFields": ["expression"]
      }
    ],
    "clusterId": "in03-***************",
    "collectionName": "my_collection"
  }
}
```

</TabItem>

</Tabs>

### Run text deletion pipeline{#run-text-deletion-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Deletion pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Input the filter expression. Click **Run**.

1. Check the results.

</TabItem>

<TabItem value="Bash">

The following example runs the Deletion pipeline named `my_text_deletion_pipeline`. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
            "expression": "id in [1, 2, 3]"
        }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `expression`: The boolean expression used to filter out entities that need to be deleted. For more information about how to write boolean expression, refer to [Filtering](./filtering).

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "num_deleted_entities": 3
  }
}
```

</TabItem>

</Tabs>

## Manage pipeline{#manage-pipeline}

The following are relevant operations that manages the created pipelines in the aforementioned steps.

### View pipeline{#view-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

Click **Pipelines** on the left navigation. Choose the **Pipelines** tab. You will see all the available pipelines. 

![view-pipelines-on-web-ui](/img/view-pipelines-on-web-ui.png)

Click on a specific pipeline to view its detailed information including its basic information, total usage, functions, and related connectors.

![view-pipeline-details](/img/view-pipeline-details.png)

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

You can also check the pipeline activities on the web UI.

![view-pipelines-activities-on-web-ui](/img/view-pipelines-activities-on-web-ui.png)

</TabItem>

<TabItem value="Bash">

You can call the API to list all existing pipelines or view the details of a particular pipeline.

- **View all existing pipelines**

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
          "pipelineId": "pipe-xxxx",
          "name": "my_text_ingestion_pipeline",
          "type": "INGESTION",
          "createTimestamp": 1721187655000,
          "clusterId": "in03-***************",
          "collectionName": "my_collection"
          "description": "A pipeline that generates text embeddings and stores additional fields.",
          "status": "SERVING",
          "totalUsage": {
            "embedding": 0
            },
          "functions": [
            {
              "action": "INDEX_TEXT",
              "name": "index_my_text",
              "inputFields": ["text_list"],
              "language": "ENGLISH",
              "embedding": "zilliz/bge-base-en-v1.5"
            },
            {
              "action": "PRESERVE",
              "name": "keep_text_info",
              "inputField": "source",
              "outputField": "source",
              "fieldType": "VarChar"
            }
          ]
        },
        {
          "pipelineId": "pipe-xxxx",
          "name": "my_text_search_pipeline",
          "type": "SEARCH",
          "createTimestamp": 1721187655000,
          "description": "A pipeline that receives text and search for semantically similar texts",
          "status": "SERVING",
          "totalUsage": {
            "embedding": 0,
            "rerank": 0
            },
          "functions": 
            {
              "action": "SEARCH_TEXT",
              "name": "search_text",
              "inputFields": "query_text",
              "clusterId": "in03-***************",
              "collectionName": "my_collection",
              "embedding": "zilliz/bge-base-en-v1.5",
              "reranker": "zilliz/bge-reranker-base"
            }
        },
        {
          "pipelineId": "pipe-xxxx",
          "name": "my_text_deletion_pipeline",
          "type": "DELETION",
          "createTimestamp": 1721187655000,
          "description": "A pipeline that deletes entities by expression",
          "status": "SERVING",
          "functions": 
            {
            "action": "PURGE_BY_EXPRESSION",
            "name": "purge_data_by_expression",
            "inputFields": ["expression"]
            },
        "clusterId": "in03-***************",
        "collectionName": "my_collection"
        }
      ]
    }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>The total usage data could delay by a few hours due to technical limitation.</p>

    </Admonition>

- **View the details of a specific pipeline**

    Follow the example below to view the details of a pipeline.

    ```bash
    curl --request GET \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}"
    ```

    Below is example output.

    ```bash
    {
      "code": 200,
      "data": {
        "pipelineId": "pipe-xxx",
        "name": "my_text_ingestion_pipeline",
        "type": "INGESTION",
        "createTimestamp": 1721187300000,
        "description": "A pipeline that generates text embeddings and stores additional fields.",
        "status": "SERVING",
        "totalUsage": {
          "embedding": 0
        },
        "functions": [
          {
            "name": "index_my_text",
            "action": "INDEX_TEXT",
            "inputFields": ["text_list"],
            "language": "ENGLISH",
            "embedding": "zilliz/bge-base-en-v1.5"
          },
          {
            "name": "keep_text_info",
            "action": "PRESERVE",
            "inputField": "source",
            "outputField": "source",
            "fieldType": "VarChar"
          }
        ],
        "clusterId": "inxx-xxxx",
        "collectionName": "my_collection"
      }
    }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>The total usage data could delay by a few hours due to technical limitation.</p>

    </Admonition>

</TabItem>

</Tabs>

### Delete pipeline{#delete-pipeline}

If you no longer need a pipeline, you can drop it.  Note that dropping a pipeline will not remove the auto-created collection where it ingested data.

<Admonition type="caution" icon="🚧" title="Warning">

<ul>
<li><p>Dropped pipelines cannot be recovered. Please be cautious with the action.</p></li>
<li><p>Dropping a data-ingestion pipeline does not affect the collection created along with the pipeline. Your data is safe.</p></li>
</ul>

</Admonition>

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

To drop a pipeline on the web UI, click the **...** button under the **Actions** column. Then click **Drop**.

![delete-pipeline](/img/delete-pipeline.png)

</TabItem>

<TabItem value="Bash">

Follow the example below to drop a pipeline. 

```bash
curl --request GET \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}"
```

The following is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxx",
    "name": "my_text_ingestion_pipeline",
    "type": "INGESTION",
    "createTimestamp": 1721187300000,
    "description": "A pipeline that generates text embeddings and stores additional fields.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": [
      {
        "name": "index_my_text",
        "action": "INDEX_TEXT",
        "inputFields": ["text_list"],
        "language": "ENGLISH",
        "embedding": "zilliz/bge-base-en-v1.5"
      },
      {
        "name": "keep_text_info",
        "action": "PRESERVE",
        "inputField": "source",
        "outputField": "source",
        "fieldType": "VarChar"
      }
    ],
    "clusterId": "inxx-xxxx",
    "collectionName": "my_collection"
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

</TabItem>

</Tabs>