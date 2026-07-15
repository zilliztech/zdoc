---
title: "Integrate with Google Cloud Storage | Cloud"
slug: /integrate-with-gcp
sidebar_key: integrate-with-gcp
sidebar_label: "Google Cloud Storage"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to integrate with Google Cloud Storage to export audit logs or backup files to designated buckets. | Cloud"
type: origin
token: INoRwFTjfiindPkaNlwc9XAgnkh
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - google
  - cloud
  - storage

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Integrate with Google Cloud Storage

Zilliz Cloud allows you to integrate with [Google Cloud Storage](https://cloud.google.com/storage) to export audit logs or backup files to designated buckets.

The following digram illustrates the necessary steps on Zilliz Cloud and Google Admin console.

![UNmxw6LdCh60Dob3j7KcHGxynkg](https://zdoc-images.s3.us-west-2.amazonaws.com/UNmxw6LdCh60Dob3j7KcHGxynkg.png)

## Before you start\{#before-you-start}

- To integrate Zilliz Cloud with GCP, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

- You have administrative access to the Google Admin console.

## Step 1: Start integration in Zilliz Cloud console\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmdzpf4ze0t2bh5wkphtbn39l" title="Step 1: Start integration in Zilliz Cloud console" />

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On your project page, navigate to **Integrations** from the left-side navigation pane.

1. Under the **Google Cloud Storage Bucket** section, click **+ Integration**.

1. In the dialog box that appears, complete **Basic Settings**:

    - **Integration Name**: A unique name for this integration (e.g. `bucket_for_auditlog`).

    - **Integration Description** *(optional)*: A description for this integration (e.g. `for auditlog export`).

    Then, click **Next** to proceed to [Step 2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console).

</Procedures>

## Step 2: Create a role in Google Admin console\{#step-2-create-a-role-in-google-admin-console}

<Supademo id="cmdzqastn0uw1h5wklj65425w" title="Step 2: Create role in Google Admin console" />

<Procedures>

1. Log in to the [Google Admin console](https://admin.google.com/).

1. Go to the [IAM & Admin / Roles](https://console.cloud.google.com/iam-admin/roles) page, then click **+ Create role**.

1. On the page that appears, configure role settings and add permissions to the role:

    1. Customize **Title** and **ID** for the role (e.g. `ZillizBucketRole`) and optionally add **Description**

    1. Click **+ Add permissions**, then assign the following minimum permissions to the role:

        - `storage.buckets.get`

        - `storage.objects.create`

        - `storage.objects.list`

        - `storage.objects.get`

1. Click **Create**.

</Procedures>

## Step 3: Create a bucket in Google Admin console\{#step-3-create-a-bucket-in-google-admin-console}

<Supademo id="cme0qzcy102dbg56jx7ucft1c" title="Step 3: Create a bucket in Google Admin console (1)" />

<Procedures>

1. Go to the Google Cloud Storage **[Buckets](https://console.cloud.google.com/storage/browser)** page.

1. Click **+ Create**.

1. On the **Create a bucket** page, enter your bucket information. After each of the following steps, click **Continue** to proceed to the next step:

    1. In the **Get started** section, enter a globally unique name that meets the [bucket name requirements](https://cloud.google.com/storage/docs/buckets#naming). Remember your bucket name as you will need to enter the name in the Zilliz Cloud console.

    1. In the **Choose where to store your data** section: 

        1. Select the **Region** as the [Location type](https://cloud.google.com/storage/docs/locations). Do not choose the **Multi-region** or **Dual-region** option.

        1. Then, select the region where you want to create the bucket. The location you select must be the same as the cloud region where your Zilliz Cloud cluster resides.

1. Click **Create**.

</Procedures>

Once the bucket is created, go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login), and do the following:

<Supademo id="cme0rnexv02mng56joiwb4wrg" title="Step 3: Create a bucket in Google Admin console (2)" />

<Procedures>

1. In the **Add Google Cloud Storage Integration** dialog box, proceed to **Step 3 - Create Google Cloud Storage Bucket**

    1. In **Zilliz Cloud Cluster Region**, select the cloud region of your Zilliz Cloud cluster. This region must be the same as the region where your bucket is created.

    1. In **Bucket Name**, enter the name of the bucket you created.

1. Then, click **Next**.

1. After, copy the Google Cloud Service Account from Zilliz Cloud console. It will be required when granting access to the bucket in [Step 4](./integrate-with-gcp#step-4-grant-access-to-bucket-in-google-admin-console).

</Procedures>

## Step 4: Grant access to bucket in Google Admin console\{#step-4-grant-access-to-bucket-in-google-admin-console}

<Supademo id="cme0s7wmr02phg56jw9hix3q1" title="Step 4: Grant access to bucket in Google Admin console" />

<Procedures>

1. In the [Google Admin console](https://console.cloud.google.com/storage/), go to the details page of the bucket you created in [Step 3](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console).

1. On the **Permissions** tab, click **Grant access**.

1. In the **Add principals** area, paste the **Google Service Account** you get from Zilliz Cloud console.

1. In the **Assign roles** area, select the role you created in [Step 2](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console).

1. Click **Save**.

</Procedures>

## Step 5: Validate and add integration\{#step-5-validate-and-add-integration}

<Supademo id="cme0siceh02thg56jeh3wlbgw" title="Step 5: Validate and add integration" />

Once you grant access to the bucket, go back to the Zilliz Cloud console and do the following:

<Procedures>

1. Click **Validate Integration** to verify that the container and role assignment settings are valid.

1. Once validation is successful, click **Add** to finalize the integration.

</Procedures>

Your Google Cloud Storage is now integrated with Zilliz Cloud for exporting audit logs or backup files. For more information, refer to [Audit Logging](./audit-logs) or [Export Backup Files](./export-backup-files).

## Create storage integration programmatically\{#create-storage-integration-programmatically}

As an alternative to working on Zilliz Cloud console, you can also programmatically create the storage integration.

<Procedures>

1. Create a bucket.

    For details, refer to [Create a bucket in Google Admin Console](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console) above or the [Create a bucket](https://docs.cloud.google.com/storage/docs/creating-buckets#console) API doc.

1. Generate authentication materials.

    ```bash
    export BASE_URL="https://api.cloud.zilliz.com"
    export TOKEN="YOUR_API_KEY"
    
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/authorizationMaterials" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket"
    }'
    ```

    The above request generates the necessary credentials for you to create permissions and roles on the GCP admin console. 

    A possible response is as follows:

    ```bash
    {
        "code": 0,
        "data": {
            "permission": [
                "storage.objects.get",
                "storage.objects.create",
                "storage.objects.list",
                "storage.buckets.get"
            ],
            "googleCloudServiceAccount": "zilliz-xxxx@vdc-dev-test.iam.gserviceaccount.com"
        }
    }
    ```

    For details on parameter descriptions, refer to [Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2).

1. Use the returned `permission` and `googleCloudServiceAccount` to create a role that has sufficient permissions to operate the bucket. 

    Note down the service account email of the created role for the next step. For details on how to create a role, refer to [Create a role in Google Admin console](./integrate-with-gcp#step-2-create-a-role-in-google-admin-console) above.

1. Validate the obtained credentials.

    In the request, set `externalCred.gcpProjectId` to the your GCP project ID, and `externalCred.serviceAccountEmail` to the one of the role created in the previous step.

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/validate" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket",
        "externalCred": {
            "gcpProjectId": "my-gcp-project",
            "serviceAccountEmail": "bucket-access@my-gcp-project.iam.gserviceaccount.com"
        }
    }'
    ```

    A validation success response is as follows:

    ```bash
    {
        "code": 0,
        "data": {
            "success": true,
            "message": ""
        }
    }
    ```

    For details on parameter descriptions, refer to [Validate Storage Integration](/reference/restful/validate-storage-integration-v2).

1. Create storage integration.

    This request shares the most of the parameters as those of the validation request with an addition of `description`.

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "name": "analytics-gcp",
        "description": "GCP bucket for external tables",
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket",
        "externalCred": {
            "gcpProjectId": "my-gcp-project",
            "serviceAccountEmail": "bucket-access@my-gcp-project.iam.gserviceaccount.com"
        }
    }'
    ```

    The response is similar to the following:

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-gcp"
        }
    }
    ```

    For details on parameter descriptions, refer to [Create Storage Integration](/reference/restful/create-storage-integration-v2).

</Procedures>

## Manage integrations\{#manage-integrations}

Once the integration is added, you can view its details or remove the integration as needed.

![FKLYbB02LoDDA9xENiYccBTun5e](https://zdoc-images.s3.us-west-2.amazonaws.com/fklybb02lodda9xeniyccbtun5e.png "FKLYbB02LoDDA9xENiYccBTun5e")

### Obtain the integration ID\{#obtain-the-integration-id}

If you need to use the RESTful API to export backup files to one of your AWS S3 buckets integrated with Zilliz Cloud, click **View Details** to display the details of an integration and copy its integration ID.

Alternatively, you can obtain the integration ID by running the following command.

```bash
export TOKEN="YOUR_API_KEY"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations?projectId=proj-xxxxxxxxxxxxxxxxxxxxxx" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

The response is similar to the following:

```bash
{
    "code": 0,
    "data": {
        "storageIntegrations": [
            {
                "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
                "name": "analytics-gcp",
                "status": "ACTIVE",
                "message": "",
                "regionId": "gcp-us-central1",
                "bucketName": "my-bucket"
            }
        ],
        "count": 1,
        "currentPage": 1,
        "pageSize": 10
    }
}
```

For details on parameter descriptions, refer to [List Storage Integrations](/reference/restful/list-storage-integrations-v2).

### View integration details\{#view-integration-details}

You can use the following command to view integration details

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request GET \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

The response is similar to the following:

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-s3",
        "description": "GCP bucket for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "gcp-us-central1",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "arn:aws:iam::123456789012:role/zilliz-bucket-role",
            "externalId": "zilliz-external-AbCdEf12345678"
        },
        "createTime": "2024-07-30T16:49:50Z"
    }
}
```

For details on parameter descriptions, refer to [Describe Storage Integration](/reference/restful/describe-storage-integration-v2).

### Delete storage integration\{#delete-storage-integration}

As an alternative method for clicking **Remove** on the Zilliz Cloud console. You can use the following command to delete unnecessary storage integration.

```bash
export integrationId="integ-xxxxxxxxxxxxxxxxxxx"

curl --request DELETE \
--url "${BASE_URL}/v2/storageIntegrations/${integrationId}" \
--header "Authorization: Bearer ${TOKEN}" \
--header "Request-Timeout: 5" \
--header "Content-Type: application/json"
```

The response is similar to the following:

```bash
{
    "code": 0,
    "data": {
        "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
        "name": "analytics-gcp"
    }
}
```

For details on parameter descriptions, refer to [Delete Storage Integration](/reference/restful/delete-storage-integration-v2).

## FAQ\{#faq}

### Why do I get a "bucket region not match" error during validation?\{#why-do-i-get-a-bucket-region-not-match-error-during-validation}

This error can happen for two reasons:

1. You selected **Multi-region** or **Dual-region** as the **Location type** for your bucket. Zilliz Cloud only supports single **Region** buckets.

1. You selected **Region** as the **Location type**, but the chosen region does not exactly match your Zilliz Cloud cluster’s region.

For example, if your Zilliz Cloud cluster is in `us-east1`, you must create the bucket in the `us-east1` region—not in Multi-region "United States", and not in a different Region like `us-west1`.

If your bucket was created with the wrong **Location type** or region, delete it and recreate it with the correct single Region setting.