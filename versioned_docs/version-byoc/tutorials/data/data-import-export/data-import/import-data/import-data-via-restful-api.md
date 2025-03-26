---
title: "Import Data (RESTful API) | BYOC"
slug: /import-data-via-restful-api
sidebar_label: "RESTful API"
beta: FALSE
notebook: FALSE
description: "This page introduces how to import the prepared data via the Zilliz Cloud RESTful API. | BYOC"
type: origin
token: ZOikw2pIUiAZj9kuLYRcdhLnnoc
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - data import
  - restful
  - what is semantic search
  - Embedding model
  - image similarity search
  - Context Window

---

import Admonition from '@theme/Admonition';


# Import Data (RESTful API)

This page introduces how to import the prepared data via the Zilliz Cloud RESTful API.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have obtained an API key for your cluster. For details, see [API Keys](./manage-api-keys).

- You have prepared your data in either of the supported formats. 

    For details on how to prepare your data, refer to [Storage Options](./data-import-storage-options) and [Format Options](./data-import-format-options). You can also refer to the end-to-end notebook [Data Import Hands-On](./data-import-zero-to-hero) to get more.

- You have created a collection with a schema matching the example dataset and already have the collection indexed and loaded. For details on creating a collection, see [Manage Collections (Console)](./manage-collections-console).

## Import data using the RESTful API{#import-data-using-the-restful-api}

To import data from files using the RESTful API, you must first upload the files to an object storage bucket. Once uploaded, obtain the path to the files in the remote bucket and bucket credentials for Zilliz Cloud to pull data from your bucket. For details on supported object paths, refer to [Storage Options](./data-import-storage-options).

Based on your data security requirements, you can use either long-term credentials or session tokens during data import. 

For more information about obtaining credentials, refer to:

- Amazon S3: [Authenticate using long-term credentials](https://docs.aws.amazon.com/sdkref/latest/guide/access-iam-users.html)

- Google Cloud Storage: [Manage HMAC keys for service accounts](https://cloud.google.com/storage/docs/authentication/managing-hmackeys)

- Azure Blob Storage: [View account access keys](https://learn.microsoft.com/en-us/azure/storage/common/storage-account-keys-manage?tabs=azure-portal#view-account-access-keys)

For more information about using session tokens, refer to [the FAQ](/docs/faq-data-import#can-i-use-session-tokens-when-importing-data-from-an-object-storage-service).

<Admonition type="info" icon="📘" title="Notes">

<p>For successful data import, ensure the target collection has less than 10,000 running or pending import jobs.</p>

</Admonition>

Once the object path and bucket credentials are obtained, call the API as follows:

```bash
# replace url and token with your own
curl --request POST \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/create" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "collectionName": "medium_articles",
        "partitionName": "",
        "objectUrl": "https://assets.zilliz.com/docs/example-data-import.json",
        "accessKey": "",
        "secretKey": ""
    }'
```

To import data into a specific partition, you need to include `partitionName` in the request.

After Zilliz Cloud processes the above request, you will receive a job ID. Use this job ID to monitor the import progress with the following command:

```bash
curl --request GET \
     --url "https://api.cloud.zilliz.com/v2/vectordb/jobs/import/getProgress" \
     --header "Authorization: Bearer ${TOKEN}" \
     --header "Accept: application/json" \
     --header "Content-Type: application/json" \
     -d '{
        "clusterId": "inxx-xxxxxxxxxxxxxxx",
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }'
```

For details, see [Import](/reference/restful/create-import-jobs-v2) and [Get Import Progress](/reference/restful/get-import-job-progress-v2).

## Verify the result{#verify-the-result}

If the command output is similar as follows, the import job is successfully submitted:

```bash
{
    "code": 0,
    "data": {
        "jobId": "job-xxxxxxxxxxxxxxxxxxxxx"
    }
}
```

You can also call RESTful APIs to [get the progress of the current import job](/reference/restful/get-import-job-progress-v2) and [list all import jobs](/reference/restful/list-import-jobs-v2) to get more. As an alternative, you can also go to the [job center](./job-center) on the Zilliz Cloud console to view the result and job details.

