---
title: "Image Data | Cloud"
slug: /pipelines-image-data
sidebar_label: "Image Data"
beta: FALSE
notebook: FALSE
description: "The Zilliz Cloud web UI provides a simplified and intuitive way of creating, running, and managing Pipelines while the RESTful API offers more flexibility and customization compared to the Web UI. | Cloud"
type: origin
token: QpFSwxXbni8lM9kj22uc8THsnzg
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - pipelines
  - image data
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Image Data

The Zilliz Cloud web UI provides a simplified and intuitive way of creating, running, and managing Pipelines while the RESTful API offers more flexibility and customization compared to the Web UI.

This guide walks you through the necessary steps to create image pipelines, conduct a reverse image search on your embedded image data, and delete the pipeline if it is no longer needed.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud Pipelines will be discontinued by the end of Q2 2025 and replaced by a new feature, “Data In, Data Out,” to streamline embedding generation in both Milvus and Zilliz Cloud. As of December 24, 2024, new user registrations are no longer accepted. Current users can continue using the service within the $20 monthly free allowance until the sunset date; however, no SLA is provided. Please consider using embedding APIs from model providers or open-source models to generate vector embeddings.</p>

</Admonition>

## Prerequisites and limitations{#prerequisites-and-limitations}

- Ensure you have created a cluster deployed in us-west1 on Google Cloud Platform (GCP).

- In one project, you can only create up to 100 pipelines of the same type. For more information, refer to [Zilliz Cloud Limits](./limits#pipelines).

## Ingest image data{#ingest-image-data}

To ingest any data, you need to first create an ingestion pipeline and then run it.

### Create image ingestion pipeline{#create-image-ingestion-pipeline}

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

    1. Select **INDEX_IMAGE** as the function type. An **INDEX_IMAGE** function can generate vector embeddings for the images in the provided URLs.

    1. Choose the embedding model used to generate vector embeddings. Currently, there are 2 available models: **zilliz/vit-base-patch16-224** and **zilliz/clip-vit-base-patch32**. The following chart briefly introduces each embedding model.

        <table>
           <tr>
             <th><p><strong>Embedding Model</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>zilliz/<a href="https://huggingface.co/google/vit-base-patch16-224">vit-base-patch16-224</a></p></td>
             <td><p>The Vision Transformer (ViT) is a transformer encoder model (BERT-like) open-sourced by Google. The model is pretrained on a large collection of images to embed the semantic of image content to a vector space. The model is hosted on Zilliz Cloud to provide the best latency.</p></td>
           </tr>
           <tr>
             <td><p>zilliz/<a href="https://huggingface.co/openai/clip-vit-base-patch32">clip-vit-base-patch32</a></p></td>
             <td><p>A multi-modal model released by OpenAI. This vision model and its pairing text model are capable of embedding images and texts into the same vector space, enabling semantic search between visual and textual information. The model is hosted on Zilliz Cloud to provide the best latency.</p></td>
           </tr>
        </table>

        ![add-index-image-function](/img/add-index-image-function.png)

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

    ![auto-create-image-search-and-delete-pipelines](/img/auto-create-image-search-and-delete-pipelines.png)

</TabItem>

<TabItem value="Bash">

The following example creates an Ingestion pipeline named `my_image_ingestion_pipeline` with an **INDEX_IMAGE** function and a **PRESERVE** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "name": "my_image_ingestion_pipeline",
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "projectId": "proj-xxxx",
        "collectionName": "my_collection",
        "description": "A pipeline that converts an image into vector embeddings and store in efficient index for search.",
        "type": "INGESTION",  
        "functions": [
            { 
                "name": "index_my_image",
                "action": "INDEX_IMAGE", 
                "embedding": "zilliz/vit-base-patch16-224"
            },
            {
                "name": "keep_image_tag",
                "action": "PRESERVE", 
                "inputField": "image_title", 
                "outputField": "image_title",
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

    - `embedding`: The embedding model used to generate vector embeddings for your image. Available options are as follows. *(This parameter is only used in the `INDEX` function.)*

        <table>
           <tr>
             <th><p><strong>Embedding Model</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>zilliz/vit-base-patch16-224</p></td>
             <td><p>The Vision Transformer (ViT) is a transformer encoder model (BERT-like) open-sourced by Google. The model is pretrained on a large collection of images to embed the semantic of image content to a vector space. The model is hosted on Zilliz Cloud to provide the best latency.</p></td>
           </tr>
           <tr>
             <td><p>zilliz/clip-vit-base-patch32</p></td>
             <td><p>A multi-modal model released by OpenAI. This vision model and its pairing text model are capable of embedding images and texts into the same vector space, enabling semantic search between visual and textual information. The model is hosted on Zilliz Cloud to provide the best latency.</p></td>
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
    "pipelineId": "pipe-xxxx",
    "name": "my_image_ingestion_pipeline",
    "type": "INGESTION",
    "createTimestamp": 1721187300000,
    "clusterId": "in03-***************",
    "collectionName": "my_collection"
    "description": "A pipeline that converts an image into vector embeddings and store in efficient index for search.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": [
      {
        "action": "INDEX_IMAGE",
        "name": "index_my_image",
        "inputFields": ["image_url", "image_id"],
        "embedding": "zilliz/vit-base-patch16-224"
      },
      {
        "action": "PRESERVE",
        "name": "keep_image_tag",
        "inputField": "image_title",
        "outputField": "image_title",
        "fieldType": "VarChar"
      }
    ]
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

When the Ingestion pipeline is created, a collection named `my_collection` is automatically created.

This collection contains three fields:  two output fields of the **INDEX_IMAGE** function, and one output field for each **PRESERVE** function. The collection schema is as follows.

<table>
   <tr>
     <th><p>image_id</p><p>(Data Type: Int64)</p></th>
     <th><p>embedding</p><p>(Data type: FLOAT_VECTOR)</p></th>
     <th><p>image_title</p><p>(Data type: VarChar)</p></th>
   </tr>
</table>

</TabItem>

</Tabs>

### Run image ingestion pipeline{#run-image-ingestion-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Ingestion pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Input the query image ID and URL in the `image_id` and `image_url` fields. If you have added a PRESERVE function, enter the value in the defined preserved field as well. Click **Run**.

1. Check the results.

1. Input other texts to run again.

</TabItem>

<TabItem value="Bash">

The following example runs the Ingestion pipeline `my_image_ingestion_pipeline`. 

```python
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
            "image_id": "my-img-123456",
            "image_url": "xxx",
            "image_title": "A cute yellow cat"
        }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `image_id`: The ID of the image stored on an object storage.

- `image_url`: The URL of the image stored on an object storage. You should use a URL that is either not encoded or encoded in UTF-8. Ensure that the URL remains valid for at least one hour.

- `image_title`：The metadata field that needs to be preserved.

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "num_entities": 1,
    "usage": {
      "embedding": 1
    }
  }
}
```

</TabItem>

</Tabs>

## Search image data{#search-image-data}

To search any data, you need to first create a search pipeline and then run it. Unlike Ingestion and Deletion pipelines, when creating a Search pipeline, the cluster and collection are defined at the function level instead of the pipeline level. This is because Zilliz Cloud allows you to search from multiple collections at a time.

There are two ways to search image data: [conduct a reverse image search](./pipelines-image-data#conduct-a-reverse-image-search) or [search image by text](./pipelines-image-data#search-image-by-text).

### Conduct a reverse image search{#conduct-a-reverse-image-search}

#### Create image search pipeline{#create-image-search-pipeline}

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

    1. Select **SEARCH_IMAGE_BY_IMAGE** as the **Function Type**. A **SEARCH_IMAGE_BY_IMAGE** function can convert the query image to a vector embedding and retrieve topK most similar images.

        ![add-search-image-function](/img/add-search-image-function.png)

    1. Click **Add** to save your function.

1. Click **Create Search Pipeline**.

</TabItem>

<TabItem value="Bash">

The following example creates a Search pipeline named `my_image_search_pipeline` with a **SEARCH_IMAGE_BY_IMAGE** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",       
        "name": "my_image_search_pipeline",
        "description": "A pipeline that searches image by image.",
        "type": "SEARCH",
        "functions": [
            {
                "name": "search_image_by_image",
                "action": "SEARCH_IMAGE_BY_IMAGE",
                "embedding": "zilliz/vit-base-patch16-224",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_collection"
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

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxxx",
    "name": "my_image_search_pipeline",
    "type": "SEARCH",
    "createTimestamp": 1721187300000,
    "description": "A pipeline that searches image by image.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": 
      {
        "action": "SEARCH_IMAGE_BY_IMAGE",
        "name": "search_image_by_image",
        "inputFields": ["query_image_url"],
        "clusterId": "in03-***************",
        "collectionName": "my_collection",
        "embedding": "zilliz/vit-base-patch16-224"
      }
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

</TabItem>

</Tabs>

#### Run image search pipeline{#run-image-search-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Search pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Input the query image URL. Click **Run**.

1. Check the results.

1. Enter a new query image URL to rerun the pipeline.

</TabItem>

<TabItem value="Bash">

The following example runs the Search pipeline named `my_image_search_pipeline`. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
      "data": {
        "query_image_url": "xxx"
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": ["image_id", "image_title"],
          "filter": "id >= 0"
      }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `query_image_url`: The URL of the query image used to conduct a similarity search.

- `params`: The search parameters to configure.

    - `limit`: The maximum number of entities to return. The value should be an integer ranging from **1** to **500**. The sum of this value of that of `offset` should be less than **1024**.

    - `offset`: The number of entities to skip in the search results.

        The sum of this value and that of `limit` should not be greater than **1024**.The maximum value is **1024**.

    - `outputFields`: An array of fields to return along with the search results. Note that `id`（entity ID）, `distance` will be returned in the search result by default. If you need other output fields in the returned result, you can configure this parameter.

    - `filter`: The [filter](./filtering) in boolean expression used to find matches for the search

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": "my-img-123456",
        "distance": 0.40448662638664246,
        "image_id": "my-img-123456",
        "image_title": "A cute yellow cat"
      }
    ],
    "usage": {
      "embedding": 1
    }
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

</TabItem>

</Tabs>

### Search image by text{#search-image-by-text}

#### Create image search pipeline{#create-image-search-pipeline}

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

        <Admonition type="info" icon="📘" title="Notes">

        <p>The SEARCH<em>IMAGE</em>BY_TEXT function is only available when there is a compatible image ingestion pipeline using the multimodal image model service <code>zilliz/clip-vit-base-patch32</code>.</p>

        </Admonition>

    1. Select **SEARCH_IMAGE_BY_TEXT** as the **Function Type**. A **SEARCH_IMAGE_BY_TEXT** function can convert the query text to a vector embedding and retrieve topK most similar images.

        If you choose the **SEARCH_IMAGE_BY_TEXT** function, the  multimodal text embedding service `zilliz/clip-vit-base-patch32-multilingual-v1` will be used by default to match the corresponding ingestion pipeline and target collection.

        ![add-search-image-by-text-function](/img/add-search-image-by-text-function.png)

    1. Click **Add** to save your function.

1. Click **Create Search Pipeline**.

</TabItem>

<TabItem value="Bash">

The following example creates a Search pipeline named `my_image_search_pipeline` with a **SEARCH_IMAGE_BY_TEXT** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",       
        "name": "my_image_search_pipeline",
        "description": "A pipeline that searches image by text.",
        "type": "SEARCH",
        "functions": [
            {
                "name": "search_image_by_text",
                "action": "SEARCH_IMAGE_BY_TEXT",
                "embedding": "zilliz/clip-vit-base-patch32-multilingual-v1",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_collection"
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

    - `embedding`: The embedding model used during vector search. Here, you should use the embedding model `zilliz/clip-vit-base-patch32-multilingual-v1`. This model is a multi-lingual variant of OpenAI's [CLIP-ViT-B32](https://huggingface.co/openai/clip-vit-base-patch32) model. It is designed to work together with `zilliz/clip-vit-base-patch32` vision model and can process text in more than 50 languages.

Below is an example output.

```bash
{
  "code": 200,
  "data": {
    "pipelineId": "pipe-xxxx",
    "name": "my_image_search_pipeline",
    "type": "SEARCH",
    "createTimestamp": 1721187300000,
    "description": "A pipeline that searches image by image.",
    "status": "SERVING",
    "totalUsage": {
      "embedding": 0
    },
    "functions": 
      {
        "action": "SEARCH_IMAGE_BY_TEXT",
        "name": "search_image_by_text",
        "inputFields": ["query_text"],
        "clusterId": "in03-***************",
        "collectionName": "my_collection",
        "embedding": "zilliz/clip-vit-base-patch32-multilingual-v1"
      }
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The total usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

</TabItem>

</Tabs>

#### Run image search pipeline{#run-image-search-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Search pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Input the query text. Click **Run**.

1. Check the results.

1. Enter a new query text to rerun the pipeline.

</TabItem>

<TabItem value="Bash">

The following example runs the Search pipeline named `my_image_search_pipeline`. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
      "data": {
        "query_text": "Can you show me the image of a cat?",
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": ["image_id", "image_title"],
          "filter": "id >= 0"
      }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `query_text`: The query text used to conduct a similarity search.

- `params`: The search parameters to configure.

    - `limit`: The maximum number of entities to return. The value should be an integer ranging from **1** to **100**. The sum of this value of that of `offset` should be less than **1024**.

    - `offset`: The number of entities to skip in the search results.

        The sum of this value and that of `limit` should not be greater than **1024**.The maximum value is **1024**.

    - `outputFields`: An array of fields to return along with the search results. Note that `id`（entity ID）, `distance` will be returned in the search result by default. If you need other output fields in the returned result, you can configure this parameter.

    - `filter`: The [filter](./filtering) in boolean expression used to find matches for the search

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": "my-img-123456",
        "distance": 0.40448662638664246,
        "image_id": "my-img-123456",
        "image_title": "A cute yellow cat"
      }
    ],
    "usage": {
      "embedding": 1
    }
  }
}
```

<Admonition type="info" icon="📘" title="Notes">

<p>The usage data could delay by a few hours due to technical limitation.</p>

</Admonition>

</TabItem>

</Tabs>

## Delete image data{#delete-image-data}

To delete any data, you need to first create a deletion pipeline and then run it.

<Admonition type="info" icon="📘" title="Notes">

<p>You must <a href="./pipelines-image-data#create-image-ingestion-pipeline">create an </a><a href="./pipelines-image-data#create-image-ingestion-pipeline">Ingestion pipeline</a> first. Upon successful creation of an Ingestion pipeline, you can create a Search pipeline and a Deletion pipeline to work with your newly created Ingestion pipeline. </p>

</Admonition>

### Create image deletion pipeline{#create-image-deletion-pipeline}

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

    1. Select either **PURGE_IMAGE_INDEX** or **PURGE_BY_EXPRESSION** as the **Function Type**. A **PURGE_IMAGE_INDEX** function can delete all images with the specified image_id while a **PURGE_BY_EXPRESSION** function can delete all text entities matching the specified filter expression.

    1. Click **Add** to save your function.

1. Click **Create Deletion Pipeline**.

</TabItem>

<TabItem value="Bash">

The example below creates a Deletion pipeline named `my_image_deletion_pipeline` with a **PURGE_IMAGE_INDEX** function added. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zilliz.cloud.com/v1/pipelines" \
    -d '{
        "projectId": "proj-xxxx",
        "name": "my_image_deletion_pipeline",
        "description": "A pipeline that deletes image by id",
        "type": "DELETION",
        "functions": [
            {
                "name": "purge_image_by_id",
                "action": "PURGE_IMAGE_INDEX"
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
        "id": 0,
        "name": "my_image_deletion_pipeline",
        "type": "DELETION",
        "createTimestamp": 1721187655000,
        "description": "A pipeline that deletes image by id",
        "status": "SERVING",
        "functions": [
            {
                "name": "purge_image_by_id",
                "action": "PURGE_IMAGE_INDEX",
                "inputFields": ["image_id"]
            }
        ],
        "clusterId": "in03-xxxx",
        "collectionName":" my_collection"
    }
}
```

</TabItem>

</Tabs>

### Run image deletion pipeline{#run-image-deletion-pipeline}

<Tabs groupId="cluster" defaultValue="Cloud Console" values={[{"label":"Cloud Console","value":"Cloud Console"},{"label":"Bash","value":"Bash"}]}>

<TabItem value="Cloud Console">

1. Click the "▶︎" button next to your Deletion pipeline. Alternatively, you can also click on the **Playground** tab.

    ![run-pipeline](/img/run-pipeline.png)

1. Input the filter expression. Click **Run**.

1. Check the results.

</TabItem>

<TabItem value="Bash">

The following example runs the Deletion pipeline named `my_image_deletion_pipeline`. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_API_KEY}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/${YOUR_PIPELINE_ID}/run" \
    -d '{
        "data": {
            "image_id": "my-img-123456"
        }
    }'
```

The parameters in the above code are described as follows:

- `YOUR_API_KEY`: The credential used to authenticate API requests. Learn more about how to [View API Keys](/docs/manage-api-keys#view-api-keys).

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `image_id`: The ID of the image to delete.

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "num_deleted_entities": 1
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