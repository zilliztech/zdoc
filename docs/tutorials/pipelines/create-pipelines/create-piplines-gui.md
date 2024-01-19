---
slug: /create-piplines-gui
beta: TRUE
notebook: FALSE
token: RfYVwRuvkicVqBkDugacSQOinvc
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Create Pipelines (Console)

The Zilliz Cloud web UI provides a simplified and intuitive way of creating Pipelines.

<Admonition type="info" icon="📘" title="Notes">

Currently, pipelines only work with collections in a [serverless cluster](./create-cluster#set-up-a-serverless-cluster). In one project, you can only create up to 5 pipelines of the same type.

</Admonition>

## Create an Ingestion pipeline{#create-an-ingestion-pipeline}

1. Navigate to your project.

1. Click on **Pipelines** from the navigation panel. Then click** + Pipeline**.

    ![create-pipeline](/img/create-pipeline.png)

1. Choose the type of pipeline to create. Click on **+ Pipeline **button in the **Ingestion Pipeline **column.

    <Admonition type="info" icon="📘" title="Notes">

    You must create an Ingestion pipeline first before creating Search and Deletion pipelines.

    </Admonition>

    ![choose-pipeline](/img/choose-pipeline.png)

1. Configure the Ingestion pipeline you wish to create.

    |  **Parameters**         |  **Description**                                                                                                                                  |
    | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
    |  Target Cluster         |  The cluster where a new collection will be automatically created with this Ingestion pipeline. Currently, this can only be a serverless cluster. |
    |  Collection Name        |  The name of the auto-created collection.                                                                                                         |
    |  Pipeline Name          |  Name of the new Ingestion pipeline. It should only contain lowercase letters, numbers, and underscores.                                          |
    |  Description (Optional) |  The description of the new Ingestion pipeline.                                                                                                   |

    ![configure-ingestion-pipeline](/img/configure-ingestion-pipeline.png)

1. Add a function to the Ingestion pipeline. For each Ingestion pipeline, you can add exactly one **INDEX_DOC** function and up to five **PRESERVE** functions.

    - Add an **INDEX_DOC** function.

        An **INDEX_DOC** function splits your document into multiple smaller chunks, vectorizes each of them, and saves the generated vector embeddings into the collection. 

        1. Enter function name.

        1. Choose document language. The language you choose will help decide the model used for generating vector embeddings.

        1. The function segments each document into smaller chunks. By default, each chunk contains no more than 500 tokens, but you can adjust the size (20-500 tokens) for custom chunking strategies. Moreover, for markdown or HTML files, the function first divides the document by headers, then further by larger sections based on the specified chunk size.

            ![customize-chunk-size](/img/customize-chunk-size.png)

        1. Click **Add** to save your function.

    - Add a **PRESERVE** function.

        A **PRESERVE** function adds additional scalar fields to the collection along with data ingestion.

        1. Enter function name.

        1. Configure the input field name and type. Supported input field types include **Bool**, **Int8**, **Int16**, **Int32**, **Int64**, **Float**, **Double**, and **VarChar**.

            <Admonition type="info" icon="📘" title="Notes">

            - Currently, the output field name must be identical to the input field name. The input field name defines the field name used when running the Ingestion pipeline. The output field name defines the field name in the vector collection schema where the preserved value is kept.            
            
            - For **VarChar** fields, the value should be a string with a maximum length of **100** alphanumeric characters.            
            
            - When storing date-time in scalar fields, it is recommended to use the **Int16** data type for year data, and **Int32** for timestamps.

            </Admonition>

        1. Click **Add** to save your function.

1. Click** Create Ingestion Pipeline**.

1. Optionally, you can continue creating a Search pipeline and a Deletion pipeline that is auto-configured to be compatible with the just-created Ingestion pipeline. We strongly recommend accepting it to save the hassle of creating them manually.

    ![ingestion-pipeline-created-successfully](/img/ingestion-pipeline-created-successfully.png)

## Create a Search pipeline{#create-a-search-pipeline}

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

    For convenience, the web UI forces the input field name to be `query_text`. To customize it, you can [create a Search pipeline via RESTful API](./create-piplines-rest#create-a-search-pipeline).

    </Admonition>

    1. Enter function name.

    1. Choose **Target Cluster** and **Target collection**. The Target Cluster must be serverless cluster and the Target Collection must be created by an Ingestion pipeline, otherwise the Search pipeline won't be compatible.

    1. Click **Add** to save your function.

1. Click** Create Search Pipeline**.

## Create a Deletion pipeline{#create-a-deletion-pipeline}

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

## Manage your pipelines{#manage-your-pipelines}

### View your pipelines{#view-your-pipelines}

Click **Pipelines** on the left navigation. You will see all the available pipelines, their detailed information, and the token usage of each pipeline. 

### Run a pipeline{#run-a-pipeline}

To run a pipeline, click on the "▶︎" icon next to it under **Actions**.

![run-pipeline](/img/run-pipeline.png)

### Drop a pipeline{#drop-a-pipeline}

If you no longer need a pipeline, simply click the "🗑" icon to drop it. Note that dropping a pipeline will not remove the auto-created collection where it ingested data.

<Admonition type="caution" icon="🚧" title="Warning">

- Dropped pipelines cannot be recovered. Please be cautious with the action.

- Dropping a data-ingestion pipeline does not affect the collection created along with the pipeline. Your data is safe.

</Admonition>

![delete-pipeline](/img/delete-pipeline.png)

