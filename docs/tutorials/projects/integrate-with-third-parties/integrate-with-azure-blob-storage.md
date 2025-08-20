---
title: "Integrate with Azure Blob Storage | Cloud"
slug: /integrate-with-azure-blob-storage
sidebar_label: "Azure Blob Storage"
beta: PRIVATE
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
  - vectordb
  - multimodal vector database retrieval
  - Retrieval Augmented Generation
  - Large language model

---

import Admonition from '@theme/Admonition';


# Integrate with Azure Blob Storage

Zilliz Cloud allows you to integrate with [Azure Blob Storage](https://azure.microsoft.com/en-us/products/storage/blobs) to export backup files or audit logs to designated containers.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only for clusters on the <strong>Dedicated-Enterprise</strong> plan. To upgrade your plan tier, refer to <a href="./manage-cluster">Manage Cluster</a>.</p>

</Admonition>

The following digram illustrates the necessary steps on Zilliz Cloud and Azure Portal.

![EFqDwDiAIhoOPXbvLBDcO7DrnJd](/img/EFqDwDiAIhoOPXbvLBDcO7DrnJd.png)

## Before you start{#before-you-start}

- To integrate Zilliz Cloud with Azure Blob, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

- You have administrative access to the Azure Portal.

## Step 1: Start integration on Zilliz Cloud{#step-1-start-integration-on-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On your project page, navigate to **Integrations** from the left-side navigation pane.

1. Under the **Azure Blob Storage** section, click **+ Integration**.

    ![Pxw7bG0keosOCDxfVdmcCC1rnBg](/img/Pxw7bG0keosOCDxfVdmcCC1rnBg.png)

1. In the dialog box that appears, complete **Basic Settings**:

    - **Integration Name**: A unique name for this integration (e.g., `container_for_backup`).

    - **Integration Description** *(optional)*: A description for this integration (e.g., `for backupfile export`).

    Then, click **Next** to proceed.

## Step 2: Create a container on Azure Portal{#step-2-create-a-container-on-azure-portal}

1. Log in to [Azure Portal](https://portal.azure.com/#home).

1. In the search bar, type **Storage accounts** and select the option.

    ![integrate-with-azure-blob-1](/img/integrate-with-azure-blob-1.png)

1. On the **Storage accounts** page, choose an existing storage account or click **+ Create** to set up a new one. **Note:** The storage account must be in the same region as your Zilliz Cloud cluster.

    ![integrate-with-azure-blob-2](/img/integrate-with-azure-blob-2.png)

1. On the storage account details page, go to **Data Storage** &gt; **Containers** and click **+ Container**.

    ![S3Evbdfp1o5JWnxhCkEcUZktnme](/img/S3Evbdfp1o5JWnxhCkEcUZktnme.png)

1. On the panel that appears, enter a container name. Make a note of this container name as this will be required in the Zilliz Cloud console.

1. Return to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and complete settings in the **Create Azure Blob Storage Container** step:

    - **Zilliz Cloud Cluster Region**: Select the cloud region where your Zilliz Cloud cluster resides.

    - **Storage Account Name**: Enter your Azure storage account name.

    - **Container Name**: Enter the name of the container you created.

    Then, click **Next** to proceed.

    ![integrate-with-azure-blob-3](/img/integrate-with-azure-blob-3.png)

## Step 3: Register an application and add credential{#step-3-register-an-application-and-add-credential}

1. Return to [Azure Portal](https://portal.azure.com/#home), search for **App registrations**, and select it.

    ![integrate-with-azure-blob-4](/img/integrate-with-azure-blob-4.png)

1. On the **Application registrations** page, click **+ New registration**.

    ![integrate-with-azure-blob-5](/img/integrate-with-azure-blob-5.png)

1. In the **Register an application** panel, enter a name for the application, keep the default settings for other fields, then click **Register**.

    ![RLaubwh94oRrLqxf8R4cd3xvnPg](/img/RLaubwh94oRrLqxf8R4cd3xvnPg.png)

1. On the **Overview** page of the application, copy **Application (client) ID** and **Directory (tenant) ID**. These values will be needed in the Zilliz Cloud console.

    ![Dgwnbb77ToK38Vx8WHdcN2ylnSh](/img/Dgwnbb77ToK38Vx8WHdcN2ylnSh.png)

1. Return to the [Zilliz Cloud console](https://cloud.zilliz.com/login) and input the copied **Application (client) ID** and **Directory (tenant) ID** in the **Register a New Application** step.

    Also, make a note of the **Cluster Issuer URL**, **Service Name**, and **Service Account Name** provided by Zilliz Cloud. These values will be required in Azure Portal.

1. Navigate back to your application’s page in [Azure Portal](https://portal.azure.com/#home). Go to **Manage** &gt; **Certificates & secrets** &gt; **Federated credentials**, then click **Add credential**.

    ![UGgmb9dKnoPlk9xtrFvcDl3Dnfd](/img/UGgmb9dKnoPlk9xtrFvcDl3Dnfd.png)

1. On the **Add a credential** panel, configure credential settings:

    - **Federated credential scenario**: Select **Kubernetes accessing Azure resources**.

    - **Cluster issuer URL**: Enter the value provided by Zilliz Cloud.

    - **Namespace**: Set to **milvus-tool**.

    - **Service account name**: Set to **milvus-bucket**.

    - **Name**:  Enter a custom name (e.g., include **zilliz** for clarity).

    - **Audience**:  Use the default value.

    Then, click **Add** to save the credential.

    ![integrate-with-azure-blob-7](/img/integrate-with-azure-blob-7.png)

1. Return to the [Zilliz Cloud console](https://cloud.zilliz.com/login), then click **Next** to proceed.

## Step 4: Add role assignment{#step-4-add-role-assignment}

1. In the [Azure Portal](https://portal.azure.com/#home),  go to **Access Control (IAM)** &gt; **+ Add** &gt; **Add role assignment**.

    ![integrate-with-azure-blob-6](/img/integrate-with-azure-blob-6.png)

1. On the **Job function roles** tab, choose the **Storage Blob Data Contributor** role.

    ![CXjcbs7q9oitdRxKzkhcrhnznh0](/img/CXjcbs7q9oitdRxKzkhcrhnznh0.png)

1. On the **Members** tab, select your registered application to assign the role.

    ![SbSgbe9tzo45z3xtKLicm64ingc](/img/SbSgbe9tzo45z3xtKLicm64ingc.png)

1. On the **Review + assign** tab, click **Review + assign** to confirm.

## Step 5: Validate and create integration{#step-5-validate-and-create-integration}

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/login), click **Validate Integration** to verify that the container and role assignment settings are valid.

1. Once validation is successful, click **Create** to finalize the integration.

Your Azure Blob Storage is now integrated with Zilliz Cloud for exporting backup files. For more information, refer to  [Export Backup Files](./export-backup-files).

## Manage integrations{#manage-integrations}

Once the integration is added, you can view its details or remove the integration as needed.

![DN2GbaT6momqNzxZeLwc0fe2nuh](/img/DN2GbaT6momqNzxZeLwc0fe2nuh.png)

## Troubleshooting{#troubleshooting}

- **Validation Errors:**

    If integration validation fails, check that:

    - The Azure Storage account and Zilliz Cloud cluster regions match.

    - All Application IDs, tenant IDs, and credential details are correct.

- **Permission Issues:**

    Verify that you have the necessary permissions in both Zilliz Cloud and Azure Portal.