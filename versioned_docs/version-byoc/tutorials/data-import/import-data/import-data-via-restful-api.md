---
slug: /import-data-via-restful-api
beta: FALSE
notebook: FALSE
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Import Data (RESTful API)

This page introduces how to import the prepared data via the Zilliz Cloud RESTful API.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have obtained an API key for your cluster. For details, see [API Keys](./manage-api-keys) and [On Zilliz Cloud Console](./on-zilliz-cloud-console).

- You have prepared your data in either of the supported formats. 

    For details on how to prepare your data, refer to [Prepare Source Data](./prepare-source-data). You can also refer to the end-to-end notebook [Data Import from Zero to Hero](./data-import-zero-to-hero) to get more.

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details, see [Example Dataset](./example-dataset) and [Manage Collections](./manage-collections).

## Import data using the RESTful API{#import-data-using-the-restful-api}

To import data from files using the RESTful API, you must first upload the files to an object storage bucket. Once uploaded, obtain the path to the files in the remote bucket and bucket credentials for Zilliz Cloud to pull data from your bucket. For details on supported object paths, refer to [Import Data (RESTful API)](./import-data-via-restful-api#supported-object-paths).

<Admonition type="info" icon="📘" title="Notes">

<p>For successful data import, you should upload your data to a bucket hosted on the same cloud as your cluster.</p>

</Admonition>

Once the object path and bucket credentials are obtained, call the API as follows:

```bash
# replace url and token with your own
curl --request POST \\
     --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header "accept: application/json" \\
     --header "content-type: application/json" \\
     -d '{
       "clusterId": "${CLUSTER_ID}",
       "collectionName": "medium_articles",
       "objectUrl": "gs://publicdataset-zillizcloud-com/medium_articles_2020.json"
       "accessKey": "your-access-key"
       "secretKey": "your-secret-key"
     }'
```

In the command above, replace `${CLOUD_REGION_ID}`, `${TOKEN}`, and `${CLUSTER_ID}` with your cloud region identifier, API key, and cluster ID, respectively. 

You can obtain `CLOUD_REGION_ID` and `CLUSTER_ID` from your cluster's public endpoint. For instance, in the public endpoint `https://in03-3bf3c31f4248e22.api.aws-us-east1.zillizcloud.com`, `CLOUD_REGION_ID` is `aws-us-east1` and `CLUSTER_ID` is `in03-3bf3c31f4248e22`. To find your cluster endpoint on the Zilliz Cloud console, refer to [On Zilliz Cloud Console](./on-zilliz-cloud-console).

Upon executing the request, you will receive a job ID. Use this job ID to monitor the import progress with the following command:

```bash
curl --request GET \\
     --url "https://controller.api.${CLOUD_REGION_ID}.zillizcloud.com/v1/vector/collections/import/get?jobId=${JOBID}&clusterId=${CLUSTERID}" \\
     --header "Authorization: Bearer ${TOKEN}" \\
     --header "accept: application/json" \\
     --header "content-type: application/json" \\
```

For details, see [Import](/reference/import) and [Get Import Progress](/reference/get-import-progress).

### Supported object paths{#supported-object-paths}

The following table lists applicable remote bucket URIs and some quick examples for you to build a valid import path.

- __Object access URIs__

    |  __URI Style__                            |  __URI Format__                                                 |
    | ----------------------------------------- | --------------------------------------------------------------- |
    |  __AWS S3 URI__                           |  `s3://bucket-name/object-name`                                 |
    |  __AWS Object URL, virtual-hosted–style__ |  `https://bucket-name.s3.region-code.amazonaws.com/object-name` |
    |  __AWS Object URL, path-style__           |  `https://s3.region-code.amazonaws.com/bucket-name/object-name` |

    For more details, see [Methods for accessing a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-bucket-intro.html).

- __Quick examples__

    |  __File Type__ |  __Quick Examples__                                                                        |
    | -------------- | ------------------------------------------------------------------------------------------ |
    |  __JSON__      |  `s3://bucket-name/json-folder/`<br/> `s3://bucket-name/json-folder/data.json`          |
    |  __NumPy__     |  `s3://bucket-name/numpy_folder/`<br/> `s3://bucket-name/folder/*.npy`                  |
    |  __Parquet__   |  `s3://bucket-name/parquet-folder/`<br/> `s3://bucket-name/parquet-folder/data.parquet` |

- __Required permissions__

    - `s3:GetObject`

    - `s3:ListBucket`

    - `s3:GetBucketLocation`

## Verify the result{#verify-the-result}

If the command output is similar as follows, the data is imported successfully:

```bash
{
    "code": 200,
    "data": {
        "jobId": "string"
    }
}
```

You can also call RESTful APIs to [get the progress of the current import job](/reference/get-import-progress) and [list all import jobs](/reference/list-import-jobs) to get more. As an alternative, you can also go to the Zilliz Cloud console to view the result and job details:

![data_import_complete_restful](/byoc/data_import_complete_restful.png)

