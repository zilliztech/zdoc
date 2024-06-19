---
displayed_sidebar: restfulSidebar
sidebar_position: 16
slug: /restful/create-pipeline
title: Create Pipeline
---

import RestHeader from '@site/src/components/RestHeader';

Create a pipeline.

<RestHeader method="post" endpoint="https://controller.api.${CLOUD_REGION}.zillizcloud.com/v1/pipelines" />

---

## Example




:::info Notes

- This API requires an [API Key](/docs/manage-api-keys) as the authentication token.

Currently, data of the JSON and Array types are not supported in RESTful API requests..
:::

- Create a text ingestion pipeline.

    ```shell
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

    Possible response:

    ```shell
    {
        "code": 200,
        "data": {
            "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxx",
            "name": "my_text_ingestion_pipeline",
            "type": "INGESTION",
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "collectionName": "my_collection"
            "description": "A pipeline that generates text embeddings and stores additional fields.",
            "status": "SERVING",
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
        }
    }  
    ```

- Create a document ingestion pipeline.

    ```shell
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
            "newCollectionName": "my_collection"
        }'
    ```

    Possible response:

    ```shell
    {
        "code": 200,
        "data": {
            "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxx",
            "name": "my_doc_ingestion_pipeline",
            "type": "INGESTION",
            "description": "A pipeline that splits a doc file into chunks and generates embeddings. It also stores the publish_year with each chunk.",
            "status": "SERVING",
            "totalTokenUsage": 0,
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
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "newCollectionName": "my_collection"
        }
    }
    ```

- Create an image ingestion pipeline.

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
        -d '{
            "name": "my_image_ingestion_pipeline",
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "projectId": "proj-xxxx"，
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

    Possible response:

    ```shell
    {
        "code": 200,
        "data": {
            "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxx",
            "name": "my_image_ingestion_pipeline",
            "type": "INGESTION",
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "collectionName": "my_collection"
            "description": "A pipeline that converts an image into vector embeddings and store in efficient index for search.",
            "status": "SERVING",
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

- Create a text search pipeline

    ```shell
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

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxx",
            "name": "my_text_search_pipeline",
            "type": "SEARCH",
            "description": "A pipeline that receives text and search for semantically similar texts",
            "status": "SERVING",
            "functions": 
            {
                "action": "SEARCH_TEXT",
                "name": "search_text",
                "inputFields": "query_text",
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_collection",
                "embedding": "zilliz/bge-base-en-v1.5",
                "reranker": "zilliz/bge-reranker-base"
            }
        }
    }
    ```

- Create a doc search pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
        -d '{
            "projectId": "proj-xxxxxxxxxxxxxxxxxxxx",       
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

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "result": [
                {
                    "id": "445951244000281783",
                    "distance": 0.7270776033401489,
                    "chunk_id": 123,
                    "doc_name": "zilliz_concept_doc.md",
                    "chunk_text": "After determining the CU type, you must also specify its size. Note that the\nnumber of collections a cluster can hold varies based on its CU size. A\ncluster with less than 8 CUs can hold no more than 32 collections, while a\ncluster with more than 8 CUs can hold as many as 256 collections.\n\nAll collections in a cluster share the CUs associated with the cluster. To\nsave CUs, you can unload some collections. When a collection is unloaded, its\ndata is moved to disk storage and its CUs are freed up for use by other\ncollections. You can load the collection back into memory when you need to\nquery it. Keep in mind that loading a collection requires some time, so you\nshould only do so when necessary.\n\n## Collection\n\nA collection collects data in a two-dimensional table with a fixed number of\ncolumns and a variable number of rows. In the table, each column corresponds\nto a field, and each row represents an entity.\n\nThe following figure shows a sample collection that comprises six entities and\neight fields.\n\n### Fields\n\nIn most cases, people describe an object in terms of its attributes, including\nsize, weight, position, etc. These attributes of the object are similar to the\nfields in a collection.\n\nAmong all the fields in a collection, the primary key is one of the most\nspecial, because the values stored in this field are unique throughout the\nentire collection. Each primary key maps to a different record in the\ncollection."
                },
                {
                    "id": "450524927755095513",
                    "distance": 0.4568396508693695,
                    "chunk_id": 125,
                    "doc_name": "zilliz_concept_doc.md",
                    "chunk_text": "# Cluster, Collection & Entities\n## Collection\n### Fields\nIn most cases, people describe an object in terms of its attributes, including size, weight, position, etc. These attributes of the object are similar to the fields in a collection.  \nAmong all the fields in a collection, the primary key is one of the most special, because the values stored in this field are unique throughout the entire collection. Each primary key maps to a different record in the collection.  \nIn the collection shown in Figure 1, the **id** field is the primary key. The first ID **0** maps to the article titled *The Mortality Rate of Coronavirus is Not Important*, and will not be used in any other records in this collection.\\n\\n# Cluster, Collection & Entities\n## Collection\n### Schema\nFields have their own properties, such as data types and related constraints for storing data in the field, like vector dimensions and distance metrics. By defining fields and their order, you will get a skeletal data structure termed schema, which shapes a collection in a way that resembles constructing the structure of a data table.  \nFor your reference, Zilliz Cloud supports the following field data types:  \n- Boolean value (BOOLEAN)\n- 8-byte floating-point (DOUBLE)\n- 4-byte floating-point (FLOAT)\n- Float vector (FLOAT_VECTOR)\n- 8-bit integer (INT8)\n- 32-bit integer (INT32)\n- 64-bit integer (INT64)\n- Variable character (VARCHAR)\n- [JSON](https://zilliverse.feishu.cn/wiki/H04VwNGoaimjcLkxoH4cs5TQnNd)  \nZilliz Cloud provides three types of CUs, each of which have its own application scenarios, and they are also the factor that impacts search performance.  \n> 📘 Notes\n>\n> **FLOAT_VECTOR** is the only data type that supports vector embeddings in Zilliz Cloud clusters."
                }
            ],  
            "usage": {
                "embedding": 21,
                "rerank": 5110
            }
        }
    }
    ```   

- Create an image search pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
        -d '{
            "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",       
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

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxxx",
            "name": "my_image_search_pipeline",
            "type": "SEARCH",
            "description": "A pipeline that searches image by image.",
            "status": "SERVING",
            "functions": 
            {
                "action": "SEARCH_IMAGE_BY_IMAGE",
                "name": "search_image_by_image",
                "inputFields": ["query_image_url"],
                "clusterId": "inxx-xxxxxxxxxxxxxxx",
                "collectionName": "my_collection",
                "embedding": "zilliz/vit-base-patch16-224"
            }
        }
    }
    ```    

- Create a text deletion pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
        -d '{
            "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
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

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "pipelineId": "pipe-xxxxxxxxxxxxxxxxxxxxxx",
            "name": "my_text_deletion_pipeline",
            "type": "DELETION",
            "description": "A pipeline that deletes entities by expression",
            "status": "SERVING",
            "functions": [
                {
                    "action": "PURGE_BY_EXPRESSION",
                    "name": "purge_data_by_expression",
                    "inputFields": ["expression"]
                }
            ],
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "collectionName": "my_collection"
        }
    }
    ```

- Create a doc deletion pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
        -d '{
            "projectId": "proj-xxxxxxxxxxxxxxxxxxxx",
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

    Possible response

    ```shell
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
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "collectionName": "my_collection"
        }
    }
    ``` 

- Create an image deletion pipeline

    ```shell
    curl --request POST \
        --header "Content-Type: application/json" \
        --header "Authorization: Bearer ${YOUR_API_KEY}" \
        --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines" \
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

    Possible response

    ```shell
    {
        "code": 200,
        "data": {
            "id": 0,
            "name": "my_image_deletion_pipeline",
            "type": "DELETION",
            "description": "A pipeline that deletes image by id",
            "status": "SERVING",
            "functions": [
                {
                    "name": "purge_image_by_id",
                    "action": "PURGE_IMAGE_INDEX",
                    "inputFields": ["image_id"]
                }
            ],
            "clusterId": "inxx-xxxxxxxxxxxxxxx",
            "collectionName":" my_collection"
        }
    }
    ```    




## Request

### Parameters

- No query parameters required

- No path parameters required

- No header parameters required

### Request Body

#### Option 1: 

```json
{
    "name": "string",
    "type": "string",
    "description": "string",
    "functions": [
        {
            "name": "string",
            "action": "string",
            "inputField": "string",
            "outputField": "string",
            "fieldType": "string"
        }
    ],
    "clusterId": "string",
    "collectionName": "string",
    "projectId": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __name__ | __string__  <br/>Name of the pipeline to create.  |
| __type__ | __string__  <br/>Type of the pipeline to create. For an ingestion pipeline, the value should be `INGESTION`.  |
| __description__ | __string__  <br/>Description of the pipeline to create.  |
| __functions__ | __array__<br/>Actions to take in the pipeline to create. For an ingestion pipeline, you can add only one doc-indexing function and multilpe preserve functions. |
| __functions[]__ | __object__ \| __object__ \| __object__ \| __object__<br/> |
| __functions[][opt_1]__ | __object__<br/> |
| __functions[][opt_1].name__ | __string__  <br/>Name of the function to create.  |
| __functions[][opt_1].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC`, `INDEX_TEXT`, `INDEX_IMAGE`, and `PRESERVE`.  |
| __functions[][opt_1].embedding__ | __string__  <br/>Name of the embedding model used to convert the text into vector embeddings. For possible values, refer to [Ingest, Search, and Delete Data](/docs/pipelines-ingest-search-delete-data).  |
| __functions[][opt_1].language__ | __string__  <br/>Language of your documents. Possible values are `ENGLISH` and `CHINESE`.  |
| __functions[][opt_2]__ | __object__<br/> |
| __functions[][opt_2].name__ | __string__  <br/>Name of the function to create.  |
| __functions[][opt_2].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC`, `INDEX_TEXT`, `INDEX_IMAGE`, and `PRESERVE`.  |
| __functions[][opt_2].embedding__ | __string__  <br/>Name of the embedding model used to convert the text into vector embeddings. For possible values, refer to [Ingest, Search, and Delete Data](/docs/pipelines-ingest-search-delete-data).  |
| __functions[][opt_2].language__ | __string__  <br/>Language of your documents. Possible values are `ENGLISH` and `CHINESE`.  |
| __functions[][opt_2].chunkSize__ | __string__  <br/>The maximum size of a splitted doc segment<br/>The value defaults to 500  |
| __functions[][opt_2][].splitBy__ | __array__<br/>The splitters for Zilliz Cloud to split the specified document into smaller chunks. The value defaults to `["\n\n", "\n", " ", ""]`. |
| __functions[][opt_2][].splitBy[]__ | __string__  <br/>A splitter.  |
| __functions[][opt_3]__ | __object__<br/> |
| __functions[][opt_3].name__ | __string__  <br/>Name of the function to create.  |
| __functions[][opt_3].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC`, `INDEX_TEXT`, `INDEX_IMAGE`, and `PRESERVE`.  |
| __functions[][opt_3].embedding__ | __string__  <br/>Name of the embedding model used to convert the text into vector embeddings. For possible values, refer to [Ingest, Search, and Delete Data](/docs/pipelines-ingest-search-delete-data).  |
| __functions[][opt_4]__ | __object__<br/> |
| __functions[][opt_4].name__ | __string__  <br/>Name of the function to create.  |
| __functions[][opt_4].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[][opt_4].inputField__ | __string__  <br/>Name the field according to your needs. In a preserve function of an ingestion pipeline, Zilliz Cloud uses the value as the name of a field in the collection to create.  |
| __functions[][opt_4].outputField__ | __string__  <br/>Name of the output field. The value should be the same as that of `input_field`.  |
| __functions[][opt_4].fieldType__ | __string__  <br/>Data type of the field to create in the target collection. Possible values are `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`, and `VARCHAR`.  |
| __clusterId__ | __string__  <br/>ID of a target cluster. You can find it in cluster details on Zilliz Cloud console.  |
| __collectionName__ | __string__  <br/>Name of the collection to create in the specified cluster. Zilliz Cloud creates a new collection and name it using this value.  |
| __projectId__ | __string__  <br/>ID of the project to which the target cluster belongs.  |

#### Option 2: 

```json
{
    "name": "string",
    "description": "string",
    "type": "string",
    "functions": [
        {
            "name": "string",
            "action": "string",
            "clusterId": "string",
            "collectionName": "string",
            "embedding": "string",
            "reranker": "string"
        }
    ],
    "projectId": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __name__ | __string__  <br/>Name of the pipeline to create.  |
| __description__ | __string__  <br/>Description of the pipeline to create.  |
| __type__ | __string__  <br/>Type of the pipeline to create. For a search pipeline, the value should be `SEARCH`.  |
| __functions__ | __array__<br/>Actions to take in the search pipeline to create. You can define multiple functions to retrieve results from different collections. |
| __functions[]__ | __object__<br/> |
| __functions[].name__ | __string__  <br/>Name of the function to create.  |
| __functions[].action__ | __string__  <br/>Type of the function to create. For a search pipeline, possible value is `SEARCH_TEXT`, `SEARCH_DOC_CHUNK`, and `SEARCH_IMAGE_BY_IMAGE`.  |
| __functions[].clusterId__ | __string__  <br/>ID of a target collection in which Zilliz Cloud concducts the search.  |
| __functions[].collectionName__ | __string__  <br/>Name of the collection in which ZIlliz Cloud conducts the search.  |
| __functions[].embedding__ | __string__  <br/>The embedding model used during vector search. The model should be consistent with the one chosen in the compatible collection.  |
| __functions[].reranker__ | __string__  <br/>If you need to reorder or rank a set of candidate outputs to improve the quality of the search results, set this parameter to a reranker model. This parameter applies only to pipelines for Text and Doc Data. Currently, only `zilliz/bge-reranker-base` is available as the parameter value.  |
| __projectId__ | __string__  <br/>ID of the project to which the target cluster belongs  |

#### Option 3: 

```json
{
    "name": "string",
    "description": "string",
    "type": "string",
    "functions": [
        {
            "name": "string",
            "action": "string"
        }
    ],
    "clusterId": "string",
    "collectionName": "string",
    "projectId": "string"
}
```

| Parameter        | Description                                                                               |
|------------------|-------------------------------------------------------------------------------------------|
| __name__ | __string__  <br/>Name of the pipeline to create.  |
| __description__ | __string__  <br/>Description of the pipeline to create.  |
| __type__ | __string__  <br/>Type of the pipeline to create. For a deletion pipeline, the value should be `DELETION`  |
| __functions__ | __array__<br/>Actions to take in the pipeline to create. |
| __functions[]__ | __object__<br/> |
| __functions[].name__ | __string__  <br/>Name of the function to create.  |
| __functions[].action__ | __string__  <br/>Type of the function to create. For a delete pipeline, possible value is `PURGE_BY_EXPRESSION`, `PURGE_DOC_INDEX`, and `PURGE_IMAGE_INDEX`.  |
| __clusterId__ | __string__  <br/>ID of a target cluster. You can find it in cluster details on Zilliz Cloud console.  |
| __collectionName__ | __string__  <br/>Name of the collection to create in the specified cluster. Zilliz Cloud creates a new collection and name it using this value.  |
| __projectId__ | __string__  <br/>ID of the project to which the target cluster belongs.  |

## Response

Returns information about the pipeline just created.

### Response Body

#### Option 1: 

```json
{
    "code": "integer",
    "data": {
        "pipelineId": "integer",
        "name": "string",
        "type": "string",
        "description": "string",
        "status": "string",
        "functions": {
            "oneOf": [
                {
                    "name": "string",
                    "action": "string",
                    "inputFields": [
                        {}
                    ],
                    "langauge": "string",
                    "embedding": "string"
                },
                {},
                {
                    "name": "string",
                    "action": "string",
                    "inputFields": [
                        {}
                    ],
                    "embedding": "string"
                },
                {
                    "name": "string",
                    "action": "string",
                    "inputField": "string",
                    "outputField": "string",
                    "fieldType": "string"
                }
            ]
        },
        "clusterID": "string",
        "collectionName": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data.name__ | __string__  <br/>Name of the pipeline.  |
| __data.type__ | __string__  <br/>Type of the pipeline. For an ingestion pipeline, the value should be `INGESTION`.  |
| __data.description__ | __string__  <br/>Description of the pipeline.  |
| __data.status__ | __string__  <br/>Current status of the pipeline. If the value is other than `SERVING`, the pipeline is not working.  |
| __functions__ | __object__ \| __object__ \| __object__ \| __object__<br/>Functions in the pipeline. For an ingestion pipeline, there should be only one `INDEX_DOC` function. |
| __functions[opt_1]__ | __object__<br/> |
| __functions[opt_1].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_1].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_1][].inputFields__ | __array__<br/>Names the fields according to your needs. In an `INDEX_TEXT` function of an ingestion pipeline, use them for the user-provided texts. |
| __functions[opt_1][].inputFields[]__ | __string__  <br/>An input field.  |
| __functions[opt_1].langauge__ | __string__  <br/>Language that your document is in. Possible values are `english` or `chinese`. The parameter applies only to ingestion pipelines.  |
| __functions[opt_1].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __functions[opt_2]__ | __object__<br/> |
| __functions[opt_3]__ | __object__<br/> |
| __functions[opt_3].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_3].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_3][].inputFields__ | __array__<br/>Names the fields according to your needs. In an `INDEX_IMAGE` function of an ingestion pipeline: `image_url` stands for pre-signed image URLs in GCS or AWS S3 buckets, and `image_id` stands for the image ID. |
| __functions[opt_3][].inputFields[]__ | __string__  <br/>An input field.  |
| __functions[opt_3].embedding__ | __string__  <br/>Name of the embedding model in use.  |
| __functions[opt_4]__ | __object__<br/> |
| __functions[opt_4].name__ | __string__  <br/>Name of the function to create.  |
| __functions[opt_4].action__ | __string__  <br/>Type of the function to create. For an ingestion pipeline,  possible values are `INDEX_DOC` and `PRESERVE`.  |
| __functions[opt_4].inputField__ | __string__  <br/>Name the field according to your needs. In a preserve function of an ingestion pipeline, Zilliz Cloud uses the value as the name of a field in the collection to create.  |
| __functions[opt_4].outputField__ | __string__  <br/>Name of the output field. The value should be the same as that of `input_field`.  |
| __functions[opt_4].fieldType__ | __string__  <br/>Data type of the field to create in the target collection. Possible values are `BOOL`, `INT8`, `INT16`, `INT32`, `INT64`, `FLOAT`, `DOUBLE`, and `VARCHAR`.  |
| __data.clusterID__ | __string__  <br/>The target cluster to which the pipeline applies.  |
| __data.collectionName__ | __string__  <br/>The target collection to which the pipeline applies.  |

#### Option 2: 

```json
{
    "code": "integer",
    "data": {
        "pipelineId": "integer",
        "name": "string",
        "type": "string",
        "description": "string",
        "status": "string",
        "functions": [
            {
                "name": "string",
                "action": "string",
                "inputField": "string",
                "clusterID": "string",
                "collectionName": "string",
                "reranker": "string"
            }
        ]
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data.name__ | __string__  <br/>Name of the pipeline  |
| __data.type__ | __string__  <br/>Type of the pipeline. For a search pipeline, the value should be `SEARCH`.  |
| __data.description__ | __string__  <br/>Description of the pipeline.  |
| __data.status__ | __string__  <br/>Current status of the pipeline. If the value is not `SERVING`, the pipeline is not working.  |
| __data[].functions__ | __array__<br/>Functions in the pipeline. For a search pipeline, each of its member functions targets at a different collection. |
| __data[].functions[]__ | __object__<br/> |
| __data[].functions[].name__ | __string__  <br/>Name of the function.  |
| __data[].functions[].action__ | __string__  <br/>Type of the function. For a search function, the value should be `SEARCH_DOC_CHUNKS`, `SEARCH_TEXT`, and `SEARCH_IMAGE_BY_IMAGE`.  |
| __data[].functions[].inputField__ | __string__  <br/>Name of the input field. For a `SEARCH_DOC_CHUNKS` function, the value should be your query text.  |
| __data[].functions[].clusterID__ | __string__  <br/>Target cluster of this function.  |
| __data[].functions[].collectionName__ | __string__  <br/>Target collection of this function.  |
| __data[].functions[].reranker__ | __string__  <br/>If you need to reorder or rank a set of candidate outputs to improve the quality of the search results, set this parameter to a reranker model. This parameter applies only to pipelines for Text and Doc Data. Currently, only `zilliz/bge-reranker-base` is available as the parameter value.  |

#### Option 3: 

```json
{
    "code": "integer",
    "data": {
        "pipelineId": "integer",
        "name": "string",
        "type": "string",
        "description": "string",
        "status": "string",
        "functions": [
            {
                "name": "string",
                "action": "string",
                "inputField": "string"
            }
        ],
        "clusterID": "string",
        "collectionName": "string"
    }
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __data__ | __object__<br/> |
| __data.pipelineId__ | __integer__  <br/>A pipeline ID.  |
| __data.name__ | __string__  <br/>Name of the pipeline.  |
| __data.type__ | __string__  <br/>Type of the pipeline. For a deletion pipeline, the value should be `DELETION`.  |
| __data.description__ | __string__  <br/>Description of the pipeline.  |
| __data.status__ | __string__  <br/>Current status of the pipeline. If the value is not `SERVING`, the pipeline is not working.  |
| __data[].functions__ | __array__<br/>Functions in the pipeline. For a deletion pipeline, there can be multiple member functions with each representing a deletion request. |
| __data[].functions[]__ | __object__<br/> |
| __data[].functions[].name__ | __string__  <br/>Name of the function.  |
| __data[].functions[].action__ | __string__  <br/>Type of the function. For a deletion pipeline, its member functions should be of `PURGE_BY_EXPRESSION`, `PURGE_DOC_INDEX`, and `PURGE_IMAGE_BY_ID`.  |
| __data[].functions[].inputField__ | __string__  <br/>Name of the input field. For a `PURGE_DOC_INDEX` function, the value should be the name of the doc to delete.  |
| __data.clusterID__ | __string__  <br/>Target cluster of the pipeline.  |
| __data.collectionName__ | __string__  <br/>Target collection of the pipeline.  |

### Error Response

```json
{
    "code": integer,
    "message": string
}
```

| Property | Description                                                                                                                                 |
|----------|---------------------------------------------------------------------------------------------------------------------------------------------|
| __code__   | **integer**<br/>Indicates whether the request succeeds.<br/><ul><li>`200`: The request succeeds.</li><li>Others: Some error occurs.</li></ul> |
| __message__  | **string**<br/>Indicates the possible reason for the reported error. |

