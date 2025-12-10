---
title: "Integrate with Azure Blob Storage | Cloud"
slug: /integrate-with-azure-blob-storage
sidebar_label: "Azure Blob Storage"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to integrate with Azure Blob Storage to export backup files or audit logs to designated containers. | Cloud"
type: origin
token: IzXPwUlJ5isTa4kH9KTcC6SfnvZ
sidebar_position: 3
keywords: 
  - zilliz
  - vector database
  - cloud
  - third-party
  - services
  - azure
  - blob
  - storage
  - rag vector database
  - what is vector db
  - what are vector databases
  - vector databases comparison

---

import Admonition from '@theme/Admonition';


# Integrate with Azure Blob Storage

Zilliz Cloud allows you to integrate with [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) to export backup files or audit logs to designated containers.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters in an <strong>Enterprise</strong> project.</p>

</Admonition>

The following digram illustrates the necessary steps on Zilliz Cloud and Azure Portal.

![EFqDwDiAIhoOPXbvLBDcO7DrnJd](https://zdoc-images.s3.us-west-2.amazonaws.com/EFqDwDiAIhoOPXbvLBDcO7DrnJd.png)

## Before you start\{#before-you-start}

- To integrate Zilliz Cloud with Azure Blob, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

- You have administrative access to the Azure Portal.

## Step 1: Start integration on Zilliz Cloud\{#step-1-start-integration-on-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On your project page, navigate to **Integrations** from the left-side navigation pane.

1. Under the **Azure Blob Storage** section, click **+ Integration**.

    ![Pxw7bG0keosOCDxfVdmcCC1rnBg](https://zdoc-images.s3.us-west-2.amazonaws.com/pxw7bg0keosocdxfvdmccc1rnbg.png "Pxw7bG0keosOCDxfVdmcCC1rnBg")

1. In the dialog box that appears, complete **Basic Settings**:

    - **Integration Name**: A unique name for this integration (e.g., `container_for_backup`).

    - **Integration Description** *(optional)*: A description for this integration (e.g., `for backupfile export`).

    Then, click **Next** to proceed.

## Step 2: Create a container on Azure Portal\{#step-2-create-a-container-on-azure-portal}

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

## Step 3: Register an application and add credential\{#step-3-register-an-application-and-add-credential}

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

## Step 4: Add role assignment\{#step-4-add-role-assignment}

1. In the [Azure Portal](https://portal.azure.com/#home),  go to **Access Control (IAM)** > **+ Add** > **Add role assignment**.

    ![integrate-with-azure-blob-6](https://zdoc-images.s3.us-west-2.amazonaws.com/integrate-with-azure-blob-6.png "integrate-with-azure-blob-6")

1. On the **Job function roles** tab, choose the **Storage Blob Data Contributor** role.

    ![CXjcbs7q9oitdRxKzkhcrhnznh0](https://zdoc-images.s3.us-west-2.amazonaws.com/cxjcbs7q9oitdrxkzkhcrhnznh0.png "CXjcbs7q9oitdRxKzkhcrhnznh0")

1. On the **Members** tab, select your registered application to assign the role.

    ![SbSgbe9tzo45z3xtKLicm64ingc](https://zdoc-images.s3.us-west-2.amazonaws.com/sbsgbe9tzo45z3xtklicm64ingc.png "SbSgbe9tzo45z3xtKLicm64ingc")

1. On the **Review + assign** tab, click **Review + assign** to confirm.

## Step 5: Validate and create integration\{#step-5-validate-and-create-integration}

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/login), click **Validate Integration** to verify that the container and role assignment settings are valid.

1. Once validation is successful, click **Create** to finalize the integration.

Your Azure Blob Storage is now integrated with Zilliz Cloud for exporting backup files. For more information, refer to  [Export Backup Files](./export-backup-files).

## Manage integrations\{#manage-integrations}

Once the integration is added, you can view its details or remove the integration as needed.

![DN2GbaT6momqNzxZeLwc0fe2nuh](https://zdoc-images.s3.us-west-2.amazonaws.com/dn2gbat6momqnzxzelwc0fe2nuh.png "DN2GbaT6momqNzxZeLwc0fe2nuh")

## Troubleshooting\{#troubleshooting}

- **Validation Errors:**

    If integration validation fails, check that:

    - The Azure Storage account and Zilliz Cloud cluster regions match.

    - All Application IDs, tenant IDs, and credential details are correct.

- **Permission Issues:**

    Verify that you have the necessary permissions in both Zilliz Cloud and Azure Portal.