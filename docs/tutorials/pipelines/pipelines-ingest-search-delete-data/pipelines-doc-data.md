---
title: "Doc Data | Cloud"
slug: /pipelines-doc-data
sidebar_label: "Doc Data"
beta: FALSE
notebook: FALSE
description: "The Zilliz Cloud web UI provides a simplified and intuitive way of creating, running, and managing Pipelines while the RESTful API offers more flexibility and customization compared to the Web UI. | Cloud"
type: origin
token: N7vtw2NiviYxvTkDs1lcAoZtnag
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - doc data
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Doc Data

The Zilliz Cloud web UI provides a simplified and intuitive way of creating, running, and managing Pipelines while the RESTful API offers more flexibility and customization compared to the Web UI.

This guide walks you through the necessary steps to create doc pipelines, conduct a semantic search on your embedded doc data, and delete the pipeline if it is no longer needed.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud Pipelines will be discontinued by the end of Q2 2025 and replaced by a new feature, “Data In, Data Out,” to streamline embedding generation in both Milvus and Zilliz Cloud. As of December 24, 2024, new user registrations are no longer accepted. Current users can continue using the service within the $20 monthly free allowance until the sunset date; however, no SLA is provided. Please consider using embedding APIs from model providers or open-source models to generate vector embeddings.</p>

</Admonition>

## Prerequisites and limitations{#prerequisites-and-limitations}

- Ensure you have created a cluster deployed in us-west1 on Google Cloud Platform (GCP).

- In one project, you can only create up to 100 pipelines of the same type. For more information, refer to [Zilliz Cloud Limits](./limits#pipelines).

## Ingest doc data{#ingest-doc-data}

To ingest any data, you need to first create an ingestion pipeline and then run it.

### Create doc ingestion pipeline{#create-doc-ingestion-pipeline}

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
         <td><p>The cluster where a new collection will be automatically created with this Ingestion pipeline. Currently, this can only be a cluster deployed on GCP us-west1.</p></td>
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

    1. Select **INDEX_DOC** as the function type. An **INDEX_DOC** function can split doc file from object storage (as pre-signed url)  or local upload into chunks and  generate vector embeddings for the chunks.

    1. Choose the embedding model used to generate vector embeddings. Different document languages have distinct embedding models. Currently, there are 5 available models for the English language: **zilliz/bge-base-en-v1.5**, **voyageai/voyage-2**, **voyageai/voyage-code-2**, **openai/text-embedding-3-small**, and **openai/text-embedding-3-large**. For the Chinese language, only **zilliz/bge-base-zh-v1.5** is available. The following chart briefly introduces each embedding model.

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

        ![add-index-doc-function](/img/add-index-doc-function.png)

    1. Click **Add** to save your function.

1. (Optional) Continue to add another **PRESERVE** function if you need to preserve the metadata for your docs. A **PRESERVE** function adds additional scalar fields to the collection along with data ingestion.

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

    1. Click **Add** to save your function.

        ![add-preserve-function](/img/add-preserve-function.png)

1. Click **Create Ingestion Pipeline**.

1. Continue creating a Search pipeline and a Deletion pipeline that is auto-configured to be compatible with the just-created Ingestion pipeline. 

    ![auto-create-doc-search-and-delete-pipelines](/img/auto-create-doc-search-and-delete-pipelines.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>By default, the reranker feature is disabled in the auto-configured search pipeline. If you need to enable reranker, please manually <a href="./pipelines-doc-data#create-doc-search-pipeline">create a new search pipeline</a>.</p>

    </Admonition>

</TabItem>

<TabItem value="Bash">

The following example creates an Ingestion pipeline named `my_doc_ingestion_pipeline` with an **INDEX_DOC** function and a **PRESERVE** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx"，
        "name": "my_doc_ingestion_pipeline",
        "description": "A pipeline that splits a doc file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
        "type": "INGESTION",  
        "functions": [
            { 
                "name": "index_my_doc",
                "action": "INDEX_DOC", 
                "language": "ENGLISH",
                "chunkSize": 500,
                "embedding": "zilliz/bge-base-en-v1.5",
                "splitBy": ["\n\n", "\n", " ", ""]
            },
            {
                "name": "keep_doc_info",
                "action": "PRESERVE", 
                "inputField": "publish_year", 
                "outputField": "publish_year",
                "fieldType": "Int16" 
            }
        ],
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "my_collection"
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

    - `language`: The language of your document to ingest. Possible values include `ENGLISH` and `CHINESE`. *(This parameter is only used in the `INDEX_DOC` function.)*

    - `embedding`: The embedding model used to generate vector embeddings for your document. Available options are as follows. *(This parameter is only used in the `Index` function.)*

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

    - `chunkSize` (optional): The INDEX_DOC function segments each document into smaller chunks. By default, each chunk contains no more than 500 tokens, but you can adjust the size for custom chunking strategies. For more information about the supported chunk size range of each embedding model, please refer to [Zilliz Cloud Limits](./limits#ingestion).

        Moreover, for markdown or HTML files, the function first divides the document by headers, then further by larger sections based on the specified chunk size. *(This parameter is only used in the `INDEX_DOC` function.)*

    - `splitBy` (optional): Splitters are used to split the document based on a list of separators in order until the chunks are small enough - smaller or equal to the defined chunk size. By default, Zilliz Cloud Pipelines uses `["\n\n", "\n", " ", ""]` as separators. *(This parameter is only used in the `INDEX_DOC` function.)*

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
    "pipelineId": "pipe-xxxx",
    "name": "my_doc_ingestion_pipeline",
    "type": "INGESTION",
    "createTimestamp": 1721187300000,
    "description": "A pipeline that splits a doc file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": [
      {
        "action": "INDEX_DOC",
        "name": "index_my_doc",
        "inputField": "doc_url",
        "language": "ENGLISH",
        "chunkSize": 500,
        "embedding": "zilliz/bge-base-en-v1.5"，
        "splitBy": ["\n\n", "\n", " ", ""]
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
    "collectionName": "my_collection"
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

When the Ingestion pipeline is created, a collection named `my_collection` is automatically created.

This collection contains six fields: one ID field that is automatically generated, four output fields of the **INDEX_DOC** function, and one output field for each **PRESERVE** function. The collection schema is as follows.

<table>
   <tr>
     <th><p>id</p><p>(Data Type: Int64)</p></th>
     <th><p>doc_name</p><p>(Data type: VarChar)</p></th>
     <th><p>chunk_id</p><p>(Data type: Int64)</p></th>
     <th><p>chunk_text</p><p>(Data type: VarChar)</p></th>
     <th><p>embedding</p><p>(Data type: FLOAT_VECTOR)</p></th>
     <th><p>publish_year</p><p>(Data type: Int16)</p></th>
   </tr>
</table>

</TabItem>

</Tabs>

### Run doc ingestion pipeline{#run-doc-ingestion-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Ingestion pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Ingest your file. Zilliz Cloud provides two ways to ingest your data.

    1. If you need to ingest a file in an object storage, you can directly input an [S3 presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) or a [GCS](https://cloud.google.com/storage/docs/access-control/signed-urls)[ signed URL](https://cloud.google.com/storage/docs/access-control/signed-urls) in the `doc_url` field in the code.

    - If you need to upload a local file, click **Attach File**. In the dialog popup, upload your local file. The file should be no more than 10 MB. Supported file formats include `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`. Once the upload is successful, click **Attach**. If you have added a preserve function to this Ingestion pipeline, please configure the `data` field.

1. Check the results.

1. Remove the document to run again.

</TabItem>

<TabItem value="Bash">

You can either run ingestion pipeline with a file from an object storage or run with a local file.

#### Run ingestion pipeline with a file in an object storage{#run-ingestion-pipeline-with-a-file-in-an-object-storage}

1. Before running the pipeline, upload your document to [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) or [Google Cloud Storage (GCS)](https://cloud.google.com/storage/docs/uploads-downloads). Supported file types include `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`.

1. Once you have uploaded the document, obtain an [S3 presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) or a [GCS](https://cloud.google.com/storage/docs/access-control/signed-urls)[ signed URL](https://cloud.google.com/storage/docs/access-control/signed-urls).

1. Run the command. The following example runs the Ingestion pipeline `my_doc_ingestion_pipeline`. `publish_year` is the metadata field we want to preserve. 

    ```bash
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
        -d '{
            "data": {
                "doc_url": "https://storage.googleapis.com/example-bucket/zilliz_concept_doc.md?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=example%40example-project.iam.gserviceaccount.com%2F20181026%2Fus-central1%2Fstorage%2Fgoog4_request&X-Goog-Date=20181026T181309Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=247a2aa45f169edf4d187d54e7cc46e4731b1e6273242c4f4c39a1d2507a0e58706e25e3a85a7dbb891d62afa8496def8e260c1db863d9ace85ff0a184b894b117fe46d1225c82f2aa19efd52cf21d3e2022b3b868dcc1aca2741951ed5bf3bb25a34f5e9316a2841e8ff4c530b22ceaa1c5ce09c7cbb5732631510c20580e61723f5594de3aea497f195456a2ff2bdd0d13bad47289d8611b6f9cfeef0c46c91a455b94e90a66924f722292d21e24d31dcfb38ce0c0f353ffa5a9756fc2a9f2b40bc2113206a81e324fc4fd6823a29163fa845c8ae7eca1fcf6e5bb48b3200983c56c5ca81fffb151cca7402beddfc4a76b133447032ea7abedc098d2eb14a7", 
                "publish_year": 2023
            }
        }'
    ```

    The parameters in the above code are described as follows:

    - `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

    - `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

    - `doc_url`: The URL of the document stored on an object storage. You should use a URL that is either not encoded or encoded in UTF-8. Ensure that the URL remains valid for at least one hour.

    - `{YOUR_PRESERVED_FIELD}` (optional): The metadata field to preserve. The input field name should be consistent with what you defined when creating the Ingestion pipeline and adding the **PRESERVE** function. The value of this field should also follow the predefined field type.

    Below is an example response.

    ```bash
    {
      "code": 200,
      "data": {
        "doc_name": "zilliz_concept_doc.md",
        "usage": {
          "embedding": 1241
        },
        "num_chunks": 3
      }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p>The <code>doc_name</code> field in the output  will play a crucial role. If identical documents are assigned different <code>doc_name</code> values, they will be ingested as separate entities. This means the same content could be stored twice in the database.</p>

    </Admonition>

#### Run ingestion pipeline with a local file{#run-ingestion-pipeline-with-a-local-file}

Run the command below to ingest a local file.

```python
curl --request POST \
     --header "Content-Type: multipart/form-data" \
     --header "Authorization: Bearer ${YOUR_API_KEY}" \
     --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run_ingestion_with_file" \
     --form 'data={"year": 2023}' \
     --form 'file=@path/to/local/file.ext'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `YOUR_PIPELINE_ID`: The ID of the ingestion pipelines to run.

- `file`: The path to your local file. Supported file types include `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`.

- `data` (optional): The metadata field to preserve. The input field name should be consistent with what you defined when creating the Ingestion pipeline and adding the **PRESERVE** function. The value of this field should also follow the predefined field type.

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "doc_name": "zilliz_concept_doc.md",
    "usage": {
      "embedding": 1241
    },
    "num_chunks": 3
  }
```

<Admonition type="info" icon="📘" title="Notes">

<p>The usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

</TabItem>

</Tabs>

## Search doc data{#search-doc-data}

To search any data, you need to first create a search pipeline and then run it. Unlike Ingestion and Deletion pipelines, when creating a Search pipeline, the cluster and collection are defined at the function level instead of the pipeline level. This is because Zilliz Cloud allows you to search from multiple collections at a time.

### Create doc search pipeline{#create-doc-search-pipeline}

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

    1. Select **SEARCH_DOC_CHUNK** as the **Function Type**. A **SEARCH_DOC_CHUNK** function can convert the input query text to a vector embedding and retrieve the topK most relevant doc chunks.

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

        ![add-search-doc-function](/img/add-search-doc-function.png)

    1. Click **Add** to save your function.

1. Click **Create Search Pipeline**.

</TabItem>

<TabItem value="Bash">

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

    - `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a cluster deployed on GCP us-west1. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

    - `collectionName`: The name of the collection in which you want to create a pipeline.

    - `embedding`: The embedding model used during vector search. The model should be consistent with the one chosen in the compatible collection.

    - `reranker`(Optional): This is an optional parameter for those who want to reorder or rank a set of candidate outputs to improve the quality of the search results. If you do not need the [reranker](./reranker), you can omit this parameter. Currently, only `zilliz/bge-reranker-base` is available as the parameter value.

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-84e6d9dba930e035150972",
    "name": "my_text_search_pipeline",
    "type": "SEARCH",
    "createTimestamp": 1721187655000,
    "description": "A pipeline that receives text and search for semantically similar doc chunks",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0,
      "rerank": 0
    },
    "functions": 
      {
        "action": "SEARCH_DOC_CHUNK",
        "name": "search_chunk_text_and_title",
        "inputField": "query_text",
        "clusterId": "in03-***************",
        "collectionName": "my_collection",
        "embedding": "zilliz/bge-base-en-v1.5",
        "reranker": "zilliz/bge-reranker-base"
      }
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

</TabItem>

</Tabs>

### Run doc search pipeline{#run-doc-search-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Search pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Configure the required parameters. Click **Run**.

1. Check the results.

1. Enter new query text to rerun the pipeline.

</TabItem>

<TabItem value="Bash">

The following example runs the Search pipeline named `my_text_search_pipeline`. The query text is "How many collections can a cluster with more than 8 CUs hold?".

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
      "data": {
        "query_text": "How many collections can a cluster with more than 8 CUs hold?"
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": [ "chunk_id", "doc_name" ],
          "filter": "id >= 0", 
      }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `query_text`: Input the text string you want to query in the value of this field.

- `params`: The search parameters to configure.

    - `limit`: The maximum number of entities to return. The value should be an integer ranging from **1** to **500**. The sum of this value of that of `offset` should be less than **1024**.

    - `offset`: The number of entities to skip in the search results.

        The sum of this value and that of `limit` should not be greater than **1024**.The maximum value is **1024**.

    - `outputFields`: An array of fields to return along with the search results. Note that `id`（entity ID）, `distance`, and `chunk_text` will be returned in the search result by default. If you need other output fields in the returned result, you can configure this parameter.

    - `filter`: The [filter](./filtering) in boolean expression used to find matches for the search

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": 450524927755105957,
        "distance": 0.99967360496521,
        "chunk_id": 0,
        "doc_name": "zilliz_concept_doc.md",
        "chunk_text": "# Cluster, Collection & Entities\nA Zilliz Cloud cluster is a managed Milvus instance associated with certain computing resources. You can create collections in the cluster and insert entities into them. In comparison to a relational database, a collection in a cluster is similar to a table in the database, and an entity in a collection is similar to a record in the table.\\n\\n# Cluster, Collection & Entities\n## Cluster\nWhen creating a cluster on Zilliz Cloud, you must specify the type of CU associated with the cluster. There are three types of CUs available: performance-optimized and capacity-optimized. You can learn how to choose among these types in [Select the Right CU](https://zilliverse.feishu.cn/wiki/UgqvwKh2QiKE1kkYNLJcaHt0nkg).  \nAfter determining the CU type, you must also specify its size. Note that the number of collections a cluster can hold varies based on its CU size. A cluster with less than 8 CUs can hold no more than 32 collections, while a cluster with more than 8 CUs can hold as many as 256 collections.  \nAll collections in a cluster share the CUs associated with the cluster. To save CUs, you can unload some collections. When a collection is unloaded, its data is moved to disk storage and its CUs are freed up for use by other collections. You can load the collection back into memory when you need to query it. Keep in mind that loading a collection requires some time, so you should only do so when necessary.\\n\\n# Cluster, Collection & Entities\n## Collection\nA collection collects data in a two-dimensional table with a fixed number of columns and a variable number of rows. In the table, each column corresponds to a field, and each row represents an entity.  \nThe following figure shows a sample collection that comprises six entities and eight fields."
      },
      {
        "id": 450524927755105959,
        "distance": 0.07810573279857635,
        "chunk_id": 2,
        "doc_name": "zilliz_concept_doc.md",
        "chunk_text": "# Cluster, Collection & Entities\n## Collection\n### Index\nUnlike Milvus instances, Zilliz Cloud clusters only support the **AUTOINDEX** algorithm for indexing. This algorithm is optimized for the three types of computing units (CUs) supported by Zilliz Cloud. For more information, see [AUTOINDEX Explained](https://zilliverse.feishu.cn/wiki/EA2twSf5oiERMDkriKScU9GInc4).\\n\\n# Cluster, Collection & Entities\n## Entities\nEntities in a collection are data records sharing the same set of fields, like a book in a library or a gene in a genome. As to an entity, the data stored in each field forms the entity.  \nBy specifying a query vector, search metrics, and optional filtering conditions, you can conduct vector searches among the entities in a collection. For example, if you search with the keyword \"Interesting Python demo\", any article whose title implies such semantic meaning will be returned as a relevant result. During this process, the search is actually conducted on the vector field **title_vector** to retrieve the top K nearest results. For details on vector searches, see [Search and Query](https://zilliverse.feishu.cn/wiki/YfMEwLHzeisARCk4VZ3cVhJmnjd).  \nYou can add as many entities to a collection as you want. However, the size that an entity takes grows along with the increase of the dimensions of the vectors in the entity, reversely affecting the performance of searches within the collection. Therefore, plan your collection wisely on Zilliz Cloud by referring to [Schema Explained](https://zilliverse.feishu.cn/wiki/Vs4YwNnvzitoQ8kunlGcWMJInbf)."
      },
      {
        "id": 450524927755105958,
        "distance": 0.046239592134952545,
        "chunk_id": 1,
        "doc_name": "zilliz_concept_doc.md",
        "chunk_text": "# Cluster, Collection & Entities\n## Collection\n### Fields\nIn most cases, people describe an object in terms of its attributes, including size, weight, position, etc. These attributes of the object are similar to the fields in a collection.  \nAmong all the fields in a collection, the primary key is one of the most special, because the values stored in this field are unique throughout the entire collection. Each primary key maps to a different record in the collection.  \nIn the collection shown in Figure 1, the **id** field is the primary key. The first ID **0** maps to the article titled *The Mortality Rate of Coronavirus is Not Important*, and will not be used in any other records in this collection.\\n\\n# Cluster, Collection & Entities\n## Collection\n### Schema\nFields have their own properties, such as data types and related constraints for storing data in the field, like vector dimensions and distance metrics. By defining fields and their order, you will get a skeletal data structure termed schema, which shapes a collection in a way that resembles constructing the structure of a data table.  \nFor your reference, Zilliz Cloud supports the following field data types:  \n- Boolean value (BOOLEAN)\n- 8-byte floating-point (DOUBLE)\n- 4-byte floating-point (FLOAT)\n- Float vector (FLOAT_VECTOR)\n- 8-bit integer (INT8)\n- 32-bit integer (INT32)\n- 64-bit integer (INT64)\n- Variable character (VARCHAR)\n- [JSON](https://zilliverse.feishu.cn/wiki/H04VwNGoaimjcLkxoH4cs5TQnNd)  \nZilliz Cloud provides three types of CUs, each of which have its own application scenarios, and they are also the factor that impacts search performance.  \n> 📘 Notes\n>\n> **FLOAT_VECTOR** is the only data type that supports vector embeddings in Zilliz Cloud clusters."
      }
    ],
    "usage": {
      "embedding": 24,
      "rerank": 1437
    }
  }
}
```

</TabItem>

</Tabs>

## Delete doc data{#delete-doc-data}

To delete any data, you need to first create a deletion pipeline and then run it.

<Admonition type="info" icon="📘" title="Notes">

<p>You must <a href="./pipelines-doc-data#create-doc-ingestion-pipeline">create an </a><a href="./pipelines-doc-data#create-doc-ingestion-pipeline">Ingestion pipeline</a> first. Upon successful creation of an Ingestion pipeline, you can create a Search pipeline and a Deletion pipeline to work with your newly created Ingestion pipeline. </p>

</Admonition>

### Create doc deletion pipeline{#create-doc-deletion-pipeline}

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

    1. Select either **PURGE_DOC_INDEX** or **PURGE_BY_EXPRESSION** as the **Function Type**. A **PURGE_DOC_INDEX** function can delete all doc chunks with the specified doc_name while a **PURGE_BY_EXPRESSION** function can delete all entities matching the specified filter expression.

    1. Click **Add** to save your function.

1. Click **Create Deletion Pipeline**.

</TabItem>

<TabItem value="Bash">

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
                "action": "PURGE_DOC_INDEX"
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

- `description` (optional): The description of the pipeline to create

- `type`: The type of the pipeline to create. Currently, available pipeline types include `INGESTION`, `SEARCH`, and `DELETION`.

- `functions`: The function(s) to add in the pipeline. **A Deletion pipeline can only have one function.**

    - `name`: The name of the function. The function name should be a string of 3-64 characters and can contain only alphanumeric letters and underscores.

    - `action`: The type of the function to add. Available options include `PURGE_DOC_INDEX`, `PURGE_TEXT_INDEX`, `PURGE_BY_EXPRESSION`, and `PURGE_IMAGE_INDEX`.

- `clusterId`: The ID of the cluster in which you want to create a pipeline. Currently, you can only choose a  cluster deployed on GCP us-west1. Learn more about [How can I find my CLUSTER_ID?](https://support.zilliz.com/hc/en-us/articles/21129365415067-How-can-I-find-my-CLUSTER-ID-and-CLOUD-REGION-ID)

- `collectionName`: The name of the collection in which you want to create a pipeline.

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-ab2874d8138c8554375bb0",
    "name": "my_doc_deletion_pipeline",
    "type": "DELETION",
    "createTimestamp": 1721187655000,
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
    "collectionName": "my_collection"
  }
}
```

</TabItem>

</Tabs>

### Run doc deletion pipeline{#run-doc-deletion-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Deletion pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Input the name of the document to delete in the `doc_name` field. Click **Run**.

1. Check the results.

</TabItem>

<TabItem value="Bash">

The following example runs the Deletion pipeline named `my_doc_deletion_pipeline`. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
            "doc_name": "zilliz_concept_doc.md",
        }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `doc_name`: the name of the document to delete. If a document with the `doc_name` you specified exists, all chunks in this document will be deleted. If the document with the `doc_name` does not exist, the request can still be executed but the value of `num_deleted_chunks` in the output will be 0.

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "num_deleted_chunks": 567
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

