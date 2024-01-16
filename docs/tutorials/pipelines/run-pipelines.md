---
slug: /run-pipelines
beta: TRUE
notebook: FALSE
token: XFEcwie5GiRlH5kLtvzcA8lWnNb
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Run Pipelines

On the Web UI, you can run Pipelines by simply clicking the "▶︎" button next to each pipeline. In this guide, you will learn how to run Pipelines via RESTful API.

## Run an Ingestion pipeline{#run-an-ingestion-pipeline}

1. Before running the pipeline, upload your document to [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) or [Google Cloud Storage (GCS)](https://cloud.google.com/storage/docs/uploads-downloads). Supported file types include `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`.

1. Once you have uploaded the document, obtain an [S3 presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) or a [GCS](https://cloud.google.com/storage/docs/access-control/signed-urls)[ signed URL](https://cloud.google.com/storage/docs/access-control/signed-urls).

1. Input the URL in the `doc_url` field. 

    <Admonition type="info" icon="📘" title="Notes">

    You should use a URL that is either not encoded or encoded in UTF-8. Ensure that the URL remains valid for at least one hour.

    </Admonition>

1. Define the metadata field to store. The input field name should be consistent with what you defined when [creating the Ingestion pipeline](./create-piplines-rest#create-an-ingestion-pipeline) and adding the **PRESERVE** function. The value of this field should also follow the predefined field type.

The following example runs the Ingestion pipeline `my_doc_ingestion_pipeline` (assuming its `pipelineId` is `pipe-6ca5dd1b4672659d3c3487`). `publish_year` is the metadata field we want to preserve. 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-6ca5dd1b4672659d3c3487/run" \
    -d '{
        "data": {
            "doc_url": "https://storage.googleapis.com/example-bucket/zilliz_concept_doc.md?X-Goog-Algorithm=GOOG4-RSA-SHA256&X-Goog-Credential=example%40example-project.iam.gserviceaccount.com%2F20181026%2Fus-central1%2Fstorage%2Fgoog4_request&X-Goog-Date=20181026T181309Z&X-Goog-Expires=900&X-Goog-SignedHeaders=host&X-Goog-Signature=247a2aa45f169edf4d187d54e7cc46e4731b1e6273242c4f4c39a1d2507a0e58706e25e3a85a7dbb891d62afa8496def8e260c1db863d9ace85ff0a184b894b117fe46d1225c82f2aa19efd52cf21d3e2022b3b868dcc1aca2741951ed5bf3bb25a34f5e9316a2841e8ff4c530b22ceaa1c5ce09c7cbb5732631510c20580e61723f5594de3aea497f195456a2ff2bdd0d13bad47289d8611b6f9cfeef0c46c91a455b94e90a66924f722292d21e24d31dcfb38ce0c0f353ffa5a9756fc2a9f2b40bc2113206a81e324fc4fd6823a29163fa845c8ae7eca1fcf6e5bb48b3200983c56c5ca81fffb151cca7402beddfc4a76b133447032ea7abedc098d2eb14a7", 
            "publish_year": 2023
        }
    }'
```

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "doc_name": "zilliz_concept_doc.md",
    "token_usage": 200,
    "num_chunks": 123
  }
}

```

The field `doc_name` plays a crucial role in document deduplication within Zilliz Cloud Ingestion pipelines.

- Overwriting Documents: If two documents have the same `doc_name` in separate Ingestions, the document from the first Ingestion will be overwritten by the one in the second Ingestion.

- Duplicate Documents: Conversely, if identical documents are assigned different `doc_name` values, they will be ingested as separate entities. This means the same content could be stored twice in the database.

## Run a Search pipeline{#run-a-search-pipeline}

The following example runs the Search pipeline named `my_text_search_pipeline` (assuming its `pipelineId` is `pipe-26a18a66ffc8c0edfdb874`). The query text is "How many collections can a cluster with more than 8 CUs hold?".

The query input field name should be consistent with what you defined when adding the **SEARCH_DOC_CHUNK** function. The `limit` parameter defines the number of results to return in a vector similarity search. The maximum value of the `limit` parameter is 100.

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-26a18a66ffc8c0edfdb874/run" \
    -d '{
      "data": {
        "query_text": "How many collections can a cluster with more than 8 CUs hold?"
      },
      "params":{
          "limit": 1,
          "offset": 0,
          "outputFields": [ "chunk_text", "chunk_id", "doc_name" ],
          "filter": "chunk_id >= 0", 
      }
    }'

```

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "result": [
      {
        "id": "445951244000281783",
        "distance": 0.7270776033401489,
        "chunk_text": "After determining the CU type, you must also specify its size. Note that the\nnumber of collections a cluster can hold varies based on its CU size. A\ncluster with less than 8 CUs can hold no more than 32 collections, while a\ncluster with more than 8 CUs can hold as many as 256 collections.\n\nAll collections in a cluster share the CUs associated with the cluster. To\nsave CUs, you can unload some collections. When a collection is unloaded, its\ndata is moved to disk storage and its CUs are freed up for use by other\ncollections. You can load the collection back into memory when you need to\nquery it. Keep in mind that loading a collection requires some time, so you\nshould only do so when necessary.\n\n## Collection\n\nA collection collects data in a two-dimensional table with a fixed number of\ncolumns and a variable number of rows. In the table, each column corresponds\nto a field, and each row represents an entity.\n\nThe following figure shows a sample collection that comprises six entities and\neight fields.\n\n### Fields\n\nIn most cases, people describe an object in terms of its attributes, including\nsize, weight, position, etc. These attributes of the object are similar to the\nfields in a collection.\n\nAmong all the fields in a collection, the primary key is one of the most\nspecial, because the values stored in this field are unique throughout the\nentire collection. Each primary key maps to a different record in the\ncollection.",
        "chunk_id": 123,
        "doc_name": "zilliz_concept_doc.md",
        "token_usage": 200
      }
    ],
  }
}
```

## Run a Deletion pipeline{#run-a-deletion-pipeline}

The following example runs the Deletion pipeline named `my_doc_deletion_pipeline` (assuming its `pipelineId` is `pipe-7227d0729d73e63002ed46`). 

```bash
curl --request POST \
    --header "Content-Type: application/json" \
    --header "Authorization: Bearer ${YOUR_CLUSTER_TOKEN}" \
    --url "https://controller.api.{cloud-region}.zillizcloud.com/v1/pipelines/pipe-7227d0729d73e63002ed46/run" \
    -d '{
        "data": {
            "doc_name": "zilliz_concept_doc.md",
        }
    }'
```

If a document with the `doc_name` you specified exists, all chunks in this document will be deleted. If the document with the `doc_name` does not exist, the request can still be executed but the value of `num_deleted_chunks` in the output will be 0.

Below is an example response.

```bash
{
  "code": 200,
  "data": {
    "num_deleted_chunks": 567
  }
}
```
