---
slug: /run-ingestion-pipelines
beta: TRUE
notebook: FALSE
token: IEoHwfIsBioVCRkHU7AcJdANn9c
sidebar_position: 1
---

import Admonition from '@theme/Admonition';


# Run Ingestion Pipeline

After creating an Ingestion pipeline, you can run it to convert unstructured data into searchable vector embeddings and store them in a Zilliz Cloud vector database.

## On web UI{#on-web-ui}

1. Click the "▶︎" button next to your Ingestion pipeline. Alternatively, you can also click on the **Run Pipelines** tab.

![run-pipeline](/img/run-pipeline.png)

1. Ingest your file. Zilliz Cloud provides two ways to ingest your data.

    1. If you need to ingest a file in an object storage, you can directly input an [S3 presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) or a [GCS](https://cloud.google.com/storage/docs/access-control/signed-urls)[ signed URL](https://cloud.google.com/storage/docs/access-control/signed-urls) in the `doc_url` field in the code.

        ![run-ingestion-pipeline-url](/img/run-ingestion-pipeline-url.png)

    - If you need to upload a local filed, click **Attach File**. In the dialog popup, upload your local file. The file should be no more than 10 MB. Supported file formats include `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`,` .docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`. Once the upload is successful, click **Attach**. If you have added a preserve function to this Ingestion pipeline, please configure the `data` field. 

        ![run-ingestion-pipeline-attach-file](/img/run-ingestion-pipeline-attach-file.png)

1. Check the results.

1. Remove the document to run again.

## Via RESTful API{#via-restful-api}

1. Before running the pipeline, upload your document to [AWS S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/upload-objects.html) or [Google Cloud Storage (GCS)](https://cloud.google.com/storage/docs/uploads-downloads). Supported file types include `.txt`, `.pdf`, `.md`, `.html`, `.epub`, `.csv`, `.doc`, `.docx`, `.xls`, `.xlsx`, `.ppt`, `.pptx`.

1. Once you have uploaded the document, obtain an [S3 presigned URL](https://docs.aws.amazon.com/AmazonS3/latest/userguide/ShareObjectPreSignedURL.html) or a [GCS](https://cloud.google.com/storage/docs/access-control/signed-urls)[ signed URL](https://cloud.google.com/storage/docs/access-control/signed-urls).

1. Run the command. The following example runs the Ingestion pipeline `my_doc_ingestion_pipeline` (assuming its `pipelineId` is `pipe-6ca5dd1b4672659d3c3487`). `publish_year` is the metadata field we want to preserve.

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

The parameters in the above code are described as follows:

- `YOUR_CLUSTER_TOKEN`: The token used to authenticate API requests. This token can be an [API key](./manage-api-keys) or a [cluster credential](./cluster-credentials) that consists of a username and password pair.

- `cloud-region`: The ID of the cloud region where your cluster exists. Currently, only `gcp-us-west1` is supported.

- `doc_url`: The URL of the document stored on an object storage. You should use a URL that is either not encoded or encoded in UTF-8. Ensure that the URL remains valid for at least one hour.

- Metadata field (optional): The metadata field to preserve. The input field name should be consistent with what you defined when [creating the Ingestion pipeline](./create-ingestion-piplines) and adding the **PRESERVE** function. The value of this field should also follow the predefined field type.

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

<Admonition type="info" icon="📘" title="Notes">

The `doc_name` field in the output  will play a crucial role. If identical documents are assigned different `doc_name` values, they will be ingested as separate entities. This means the same content could be stored twice in the database.

</Admonition>

## Related topics{#related-topics}

- [Manage Pipelines](./manage-pipelines)

- [Estimate Pipelines Usage](./estimate-pipelines-usage)

- [Zilliz Cloud Limits](./limits#pipelines)

- [FAQs](./faqs#faq-pipelines) 

