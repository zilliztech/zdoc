---
title: "Integrate with Azure Blob Storage | Cloud"
slug: /integrate-with-azure-blob-storage
sidebar_key: integrate-with-azure-blob-storage
sidebar_label: "Azure Blob Storage"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to integrate with Azure Blob Storage to export backup files or audit logs to designated containers. | Cloud"
type: origin
token: IzXPwUlJ5isTa4kH9KTcC6SfnvZ
sidebar_position: 4
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - azure
  - blob
  - storage

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Integrate with Azure Blob Storage

Zilliz Cloud allows you to integrate with [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) to export backup files or audit logs to designated containers.

The following digram illustrates the necessary steps on Zilliz Cloud and Azure Portal.

![EFqDwDiAIhoOPXbvLBDcO7DrnJd](https://zdoc-images.s3.us-west-2.amazonaws.com/EFqDwDiAIhoOPXbvLBDcO7DrnJd.png)

## Before you start\{#before-you-start}

- To integrate Zilliz Cloud with Azure Blob, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

- You have administrative access to the Azure Portal.

## Step 1: Start integration on Zilliz Cloud\{#step-1-start-integration-on-zilliz-cloud}

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On your project page, navigate to **Integrations** from the left-side navigation pane.

1. Under the **Azure Blob Storage** section, click **+ Integration**.

    ![Pxw7bG0keosOCDxfVdmcCC1rnBg](https://zdoc-images.s3.us-west-2.amazonaws.com/pxw7bg0keosocdxfvdmccc1rnbg.png "Pxw7bG0keosOCDxfVdmcCC1rnBg")

1. In the dialog box that appears, complete **Basic Settings**:

    - **Integration Name**: A unique name for this integration (e.g., `container_for_backup`).

    - **Integration Description** *(optional)*: A description for this integration (e.g., `for backupfile export`).

    Then, click **Next** to proceed.

</Procedures>

## Step 2: Create a container on Azure Portal\{#step-2-create-a-container-on-azure-portal}

<Procedures>

1. Log in to [Azure Portal](https://portal.azure.com/#home).

1. In the search bar, type **Storage accounts** and select the option.

    ![integrate-with-azure-blob-1](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-1.png "integrate-with-azure-blob-1")

1. On the **Storage accounts** page, choose an existing storage account or click **+ Create** to set up a new one. **Note:** The storage account must be in the same region as your Zilliz Cloud cluster.

    ![integrate-with-azure-blob-2](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-2.png "integrate-with-azure-blob-2")

1. On the storage account details page, go to **Data Storage** > **Containers** and click **+ Container**.

    ![S3Evbdfp1o5JWnxhCkEcUZktnme](https://zdoc-images.s3.us-west-2.amazonaws.com/s3evbdfp1o5jwnxhckecuzktnme.png "S3Evbdfp1o5JWnxhCkEcUZktnme")

1. On the panel that appears, enter a container name. Make a note of this container name as this will be required in the Zilliz Cloud console.

1. Return to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and complete settings in the **Create Azure Blob Storage Container** step:

    - **Zilliz Cloud Cluster Region**: Select the cloud region where your Zilliz Cloud cluster resides.

    - **Storage Account Name**: Enter your Azure storage account name.

    - **Container Name**: Enter the name of the container you created.

    Then, click **Next** to proceed.

    ![integrate-with-azure-blob-3](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-3.png "integrate-with-azure-blob-3")

</Procedures>

## Step 3: Register an application and add credential\{#step-3-register-an-application-and-add-credential}

<Procedures>

1. Return to [Azure Portal](https://portal.azure.com/#home), search for **App registrations**, and select it.

    ![integrate-with-azure-blob-4](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-4.png "integrate-with-azure-blob-4")

1. On the **Application registrations** page, click **+ New registration**.

    ![integrate-with-azure-blob-5](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-5.png "integrate-with-azure-blob-5")

1. In the **Register an application** panel, enter a name for the application, keep the default settings for other fields, then click **Register**.

    ![RLaubwh94oRrLqxf8R4cd3xvnPg](https://zdoc-images.s3.us-west-2.amazonaws.com/rlaubwh94orrlqxf8r4cd3xvnpg.png "RLaubwh94oRrLqxf8R4cd3xvnPg")

1. On the **Overview** page of the application, copy **Application (client) ID** and **Directory (tenant) ID**. These values will be needed in the Zilliz Cloud console.

    ![Dgwnbb77ToK38Vx8WHdcN2ylnSh](https://zdoc-images.s3.us-west-2.amazonaws.com/dgwnbb77tok38vx8whdcn2ylnsh.png "Dgwnbb77ToK38Vx8WHdcN2ylnSh")

1. Return to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and input the copied **Application (client) ID** and **Directory (tenant) ID** in the **Register a New Application** step.

    Also, make a note of the **Cluster Issuer URL**, **Service Name**, and **Service Account Name** provided by Zilliz Cloud. These values will be required in Azure Portal.

1. Navigate back to your application’s page in [Azure Portal](https://portal.azure.com/#home). Go to **Manage** > **Certificates & secrets** > **Federated credentials**, then click **Add credential**.

    ![UGgmb9dKnoPlk9xtrFvcDl3Dnfd](https://zdoc-images.s3.us-west-2.amazonaws.com/uggmb9dknoplk9xtrfvcdl3dnfd.png "UGgmb9dKnoPlk9xtrFvcDl3Dnfd")

1. On the **Add a credential** panel, configure credential settings:

    - **Federated credential scenario**: Select **Kubernetes accessing Azure resources**.

    - **Cluster issuer URL**: Enter the value provided by Zilliz Cloud.

    - **Namespace**: Set to **milvus-tool**.

    - **Service account name**: Set to **milvus-bucket**.

    - **Name**:  Enter a custom name (e.g., include **zilliz** for clarity).

    - **Audience**:  Use the default value.

    Then, click **Add** to save the credential.

    ![integrate-with-azure-blob-7](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-7.png "integrate-with-azure-blob-7")

1. Return to the [Zilliz Cloud console](https://cloud.zilliz.com/login), then click **Next** to proceed.

</Procedures>

## Step 4: Add role assignment\{#step-4-add-role-assignment}

<Procedures>

1. In the [Azure Portal](https://portal.azure.com/#home),  go to **Access Control (IAM)** > **+ Add** > **Add role assignment**.

    ![integrate-with-azure-blob-6](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-6.png "integrate-with-azure-blob-6")

1. On the **Job function roles** tab, choose the **Storage Blob Data Contributor** role.

    ![CXjcbs7q9oitdRxKzkhcrhnznh0](https://zdoc-images.s3.us-west-2.amazonaws.com/cxjcbs7q9oitdrxkzkhcrhnznh0.png "CXjcbs7q9oitdRxKzkhcrhnznh0")

1. On the **Members** tab, select your registered application to assign the role.

    ![SbSgbe9tzo45z3xtKLicm64ingc](https://zdoc-images.s3.us-west-2.amazonaws.com/sbsgbe9tzo45z3xtklicm64ingc.png "SbSgbe9tzo45z3xtKLicm64ingc")

1. On the **Review + assign** tab, click **Review + assign** to confirm.

</Procedures>

## Step 5: Validate and create integration\{#step-5-validate-and-create-integration}

<Procedures>

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/login), click **Validate Integration** to verify that the container and role assignment settings are valid.

1. Once validation is successful, click **Create** to finalize the integration.

</Procedures>

Your Azure Blob Storage is now integrated with Zilliz Cloud for exporting backup files. For more information, refer to  [Export Backup Files](./export-backup-files).

## Create storage integration programmatically\{#create-storage-integration-programmatically}

As an alternative to working on Zilliz Cloud console, you can also programmatically create the storage integration.

<Procedures>

1. Create a container.

    For details, refer to [Create a container on Azure Portal](./integrate-with-gcp#step-3-create-a-bucket-in-google-admin-console) above or the [Create Container](https://learn.microsoft.com/en-us/rest/api/storageservices/create-container?tabs=microsoft-entra-id) API doc.

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
        "regionId": "az-eastus",
        "bucketName": "my-container"
    }'
    ```

    The above request generates the necessary credentials for you to create permissions and roles on the GCP admin console. 

    A possible response is as follows:

    ```bash
    {
        "code": 0,
        "data": {
            "credential": {
                "clusterIssuerUrl": "https://issuer.example.com/",
                "namespace": "milvus-tool",
                "serviceAccountName": "milvus-bucket"
            }
        }
    }
    ```

    For details on parameter descriptions, refer to [Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2).

1. Use the returned `clusterIssuerUrl`, `namespace`, and `serviceAccountName` to register an application and add credentials. 

    For details, refer to [Register an application and add credentials](./integrate-with-azure-blob-storage#step-3-register-an-application-and-add-credential).

1. Validate the obtained credentials.

    In the request, set `externalCred.accountName` to your Azure storage account name displayed on the portal, and `externalCred.clientId` and `externalCred.tenantId` to those noted down when you register the application.

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
            "accountName": "mystorageaccount",
            "clientId": "00000000-0000-0000-0000-000000000000",
            "tenantId": "11111111-1111-1111-1111-111111111111"
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
        "name": "analytics-azure",
        "description": "Azure container for external tables",
        "regionId": "az-eastus",
        "bucketName": "my-bucket",
        "externalCred": {
            "accountName": "mystorageaccount",
            "clientId": "00000000-0000-0000-0000-000000000000",
            "tenantId": "11111111-1111-1111-1111-111111111111"
        }
    }'
    ```

    The response is similar to the following:

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-azure"
        }
    }
    ```

    For details on parameter descriptions, refer to [Create Storage Integration](/reference/restful/create-storage-integration-v2).

</Procedures>

## Manage integrations\{#manage-integrations}

Once the integration is added, you can view its details or remove the integration as needed.

![DN2GbaT6momqNzxZeLwc0fe2nuh](https://zdoc-images.s3.us-west-2.amazonaws.com/dn2gbat6momqnzxzelwc0fe2nuh.png "DN2GbaT6momqNzxZeLwc0fe2nuh")

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
                "name": "analytics-azure",
                "status": "ACTIVE",
                "message": "",
                "regionId": "az-eastus",
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
        "name": "analytics-azure",
        "description": "Azure container for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "az-eastus",
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
        "name": "analytics-azure"
    }
}
```

For details on parameter descriptions, refer to [Delete Storage Integration](/reference/restful/delete-storage-integration-v2).

## Troubleshooting\{#troubleshooting}

- **Validation Errors:**

    If integration validation fails, check that:

    - The Azure Storage account and Zilliz Cloud cluster regions match.

    - All Application IDs, tenant IDs, and credential details are correct.

- **Permission Issues:**

    Verify that you have the necessary permissions in both Zilliz Cloud and Azure Portal.