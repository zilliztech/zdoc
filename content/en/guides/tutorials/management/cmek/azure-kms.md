---
title: "Microsoft Azure KMS | Cloud"
slug: /azure-kms
sidebar_label: "Microsoft Azure KMS"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "Microsoft Azure Key Vault Service is a Microsoft Azure-managed service that makes it easy for you to create and control the keys used to encrypt and sign your data. | Cloud"
type: origin
token: R6pDwUeXti5GiOkkAHBcKxeJnNQ
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Microsoft Azure KMS

Microsoft Azure Key Vault Service is a Microsoft Azure-managed service that makes it easy for you to create and control the keys used to encrypt and sign your data. 

## Overview\{#overview}

In typical cases, you do not use an Azure Key Vault key to encrypt your data in a Zilliz Cloud cluster. Instead, you use the key to encrypt an encryption zone key (EZK), use the EZK to encrypt a data encryption key (DEK), and use the DEK to encrypt your data.

![ZVyiwdgROhq7tfbmQFDccgdJnmb](https://zdoc-images.s3.us-west-2.amazonaws.com/ZVyiwdgROhq7tfbmQFDccgdJnmb.png)

For details on how encryption works and its scope, refer to [this section](./cmek#how-encryption-works). For more information on the CMEK feature's limitations, refer to [this section](./cmek#limitations). To use the CMEK feature, follow the procedure on this page.

## Before you start\{#before-you-start}

- All Bash commands in this guide run in [Azure Cloud Shell](https://learn.microsoft.com/en-us/azure/cloud-shell/overview). 

    For more information, see  [Get started with Azure Cloud Shell](https://learn.microsoft.com/en-us/azure/cloud-shell/quickstart).

- You have sufficient permissions to run key management commands on Zilliz Cloud.

## Prepare in Azure Portal\{#prepare-in-azure-portal}

When creating a Zilliz Cloud CMEK for data encryption in your clusters, you need a registered Microsoft Entra application and a Microsoft Azure key vault. In this section, you will learn how to prepare them in Azure Cloud Shell and the Azure Portal. Creating a new resource group, key vault, or key is on demand: if you already have a Premium key vault with Azure RBAC authorization enabled and a compliant AES-256 oct-HSM key, you can reuse them directly.

<details>

<summary>Click here to view the detailed settings.</summary>

### Create a resource group\{#create-a-resource-group}

A resource group is a container that holds related resources for an Azure solution. You can use an existing one or create one as follows:

![P1cAwgAO9hqnbUbdqAsc5GY2nLf](https://zdoc-images.s3.us-west-2.amazonaws.com/P1cAwgAO9hqnbUbdqAsc5GY2nLf.png)

<Procedures>

1. Open the [Create a resource group](https://portal.azure.com/#view/HubsExtension/ResourceGroupCreate.ReactView) page in Azure Portal.

1. Select a subscription from the dropdown list, name the resource group, and choose a region.

    The location of a resource group is where Azure stores the resource metadata, so you can choose any region.

1. Click **Review + create**.

</Procedures>

As an alternative, you can run the following shell commands:

```bash
# Define variables
RG_NAME="my-zilliz-cmek-rg"  # Change to your preferred name
LOCATION="eastus"          # Change to your preferred Azure region (e.g., westus2, chinanorth)

# Create the Resource Group
az group create \
  --name "$RG_NAME" \
  --location "$LOCATION"
```

Note down the resource group name for later use.

### Register a Microsoft Entra application\{#register-a-microsoft-entra-application}

An Entra application is also a container that is used to hold authentication credentials in our use case. You can use an existing one or create a new one as follows:

![OAJYw3jkthDAQRbuxKicV34xnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/OAJYw3jkthDAQRbuxKicV34xnCe.png)

<Procedures>

1. Open the [Register an application](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/CreateApplicationBlade/quickStartType~/null/isMSAApp~/false) page in Azure Portal.

1. Name the application and select a supported account type from the drop-down list.

    Click **Help me choose** to find the option that matches your needs.

1. Click **Register**.

</Procedures>

Alternatively, you can run the following command to register the app.

```bash
# Define the app name
APP_NAME="my-zilliz-cmek-entra-app" # Change to your preferred app name

# Create the App Registration
az ad app create --display-name "$APP_NAME"
```

### Create a key vault\{#create-a-key-vault}

Azure Key Vault is a cloud service for managing keys, secrets, and certificates. You can reuse an existing Premium key vault with Azure RBAC authorization enabled, or create a new one as follows:

![WQmHw0X4IhAHOsbi9eNcZmalncb](https://zdoc-images.s3.us-west-2.amazonaws.com/WQmHw0X4IhAHOsbi9eNcZmalncb.png)

<Procedures>

1. Open the [Create a key vault](https://portal.azure.com/#view/Microsoft_Azure_KeyVault/CreateKeyVaultBlade) page in Azure Portal.

1. Select a resource group created in the above section from the dropdown list, name the key vault, and choose a region.

1. Change the pricing tier from **Standard** to **Premium** to use HSM-backed keys.

1. Keep the default settings for other options on all the tabs.

1. Click **Review + create**.

</Procedures>

As an alternative, you can run the following shell commands:

```bash
# Define your variables
KV_NAME="my-zilliz-cmek-kv" # Or your preferred unique name
RESOURCE_GROUP="<your-resource-group-name>"
LOCATION="<your-region>" # e.g., eastus, chinanorth, etc.

# Create the Key Vault
az keyvault create \
  --name "$KV_NAME" \
  --resource-group "$RESOURCE_GROUP" \
  --location "$LOCATION" \
  --sku premium \
  --enable-rbac-authorization true
```

The identity running the create-key commands may not automatically have permission to create keys in the vault, even if you created the vault yourself. Ask your administrator to grant the **Key Vault Crypto Officer** role to that identity, at the scope of the target key vault, using either of the following ways:

- **Azure Portal**

    Open the target key vault, choose **Access control (IAM)** from the left navigation, click **+ Add** > **Add role assignment**, and assign **Key Vault Crypto Officer** to the identity that runs the create-key commands.

- **Azure CLI**

    Run the following commands as an administrator.

    ```bash
    # Get the Object ID of the identity that will run the create-key commands:
    # - Signed-in user:    az ad signed-in-user show --query id -o tsv
    # - Service principal: az ad sp show --id "<application-client-id>" --query id -o tsv
    ASSIGNEE_OBJECT_ID="<object-id-of-the-identity-that-creates-keys>"
    
    # Build the scope of the target key vault from the Azure subscription and resource group:
    SUBSCRIPTION_ID=$(az account show --query id -o tsv)
    RESOURCE_GROUP="<your-resource-group-name>"
    VAULT_NAME="my-zilliz-cmek-kv"
    
    # Grant the role at the vault scope.
    # Set --assignee-principal-type to "ServicePrincipal" if the assignee is a service principal.
    az role assignment create \
      --assignee-object-id "$ASSIGNEE_OBJECT_ID" \
      --assignee-principal-type "User" \
      --role "Key Vault Crypto Officer" \
      --scope "/subscriptions/$SUBSCRIPTION_ID/resourceGroups/$RESOURCE_GROUP/providers/Microsoft.KeyVault/vaults/$VAULT_NAME"
    ```

</details>

At the end of this step, you should have the following information, split by where it is used:

- For Azure-side operations

    Your Azure Subscription ID, resource group name, and key vault name. You use them to create resources or grant permissions in Azure.

- For the Zilliz Cloud console

    The console wizard asks you to select a **Region** for the target cluster and fill in your Microsoft Entra **Application (client) ID**, **Directory (tenant) ID**, and a **Key Identifier** in the form `https://<vault>.vault.azure.net/keys/<key>` without a version suffix.

## Add an Azure Key Vault key on Zilliz Cloud\{#add-an-azure-key-vault-key-on-zilliz-cloud}

To add an Azure Key Vault key, log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login), choose **Security** > **CMEK** from the left navigation pane, go into one of your projects with an applicable Azure region, open the **Azure KMS** tab, and click **Create CMEK**. Then follow the steps in the **Add CMEK (Azure KMS)** dialog box to complete the process.

Before you start, determine the Microsoft Entra application to use during the procedure. Applications that have already been registered in the same project and region are listed in the drop-down list in the **Select an Existing Application** step in the **Existing Application** tab. 

First-time registrations go to the **New Application** tab, which also applies to an application already registered in Microsoft Entra but has not yet been registered in the current project and region.

- If the application you need is listed, go to [Add a Key Vault key using an existing app](./azure-kms#add-an-azure-key-vault-key-using-an-existing-app).

- Otherwise, go to [Add a Key Vault key using a new app](./azure-kms#add-an-azure-key-vault-key-using-a-new-app).

### Add an Azure Key Vault key using an existing app\{#add-an-azure-key-vault-key-using-an-existing-app}

If the drop-down list in **Select an Existing Application** on the **Existing Application** tab contains the application you need, follow the steps in this section. Otherwise, refer to [Add an Azure Key Vault key using a new app](./azure-kms#add-an-azure-key-vault-key-using-a-new-app).

<Procedures>

1. Select **Region** and **Application** in **Select an Existing Application**.

    ![VcfbwAQCWhRCFpbt9rIcP7Jrn3g](https://zdoc-images.s3.us-west-2.amazonaws.com/VcfbwAQCWhRCFpbt9rIcP7Jrn3g.png)

    <Procedures>

    1. Select the target region from the drop-down list.

    1. Select the target Entra Application ID from the drop-down list.

    1. Review the **Application (client) ID** and **Directory (tenant) ID** displayed below, and click Next.

    </Procedures>

1. Create or use an existing key and submit the key identifier.

    ![X7FRwIkoHh4GFbbqDmtc7G1Xn2c](https://zdoc-images.s3.us-west-2.amazonaws.com/X7FRwIkoHh4GFbbqDmtc7G1Xn2c.png)

    <Procedures>

    1. Create a new key by setting its name and the key vault it belongs to, then run the given command in Azure Cloud Shell. Make sure the identity that runs Azure CLI is allowed to create keys in the target key vault before running the command.

    1. Fill the key identifier included in the command output back into **Key Identifier**.

        The key identifier must be in the form https://&lt;vault&gt;.vault.azure.net/keys/&lt;key&gt; without a version suffix. If the address copied from the command output or the Azure Portal ends with a version segment, remove that trailing segment before pasting; a key identifier with a version suffix is rejected.
        If the command fails with a permission error, ask your administrator to grant the **Key Vault Crypto Officer** role to the identity that runs the command, at the scope of the target key vault. For details, refer to [Create a key vault](./azure-kms#create-a-key-vault). Rerun the command with the original identity after the grant takes effect.

    1. Click **Next**.

    </Procedures>

1. Validate the key.

    ![KqouwgKN2hF7ihbZxQYczLTWnhh](https://zdoc-images.s3.us-west-2.amazonaws.com/KqouwgKN2hF7ihbZxQYczLTWnhh.png)

    <Procedures>

    1. Go to the Azure Portal, open **Key Vaults**, open the target vault, click **Keys**, and open the key name displayed in the Zilliz Cloud console.

    1. Choose **Access Control (IAM)** from the left navigation and click **+ Add** > **Add role assignment**.

    1. In the **Role** tab, click **Job function roles**, search for **Key Vault Crypto User**, select the role, and click **Next**.

    1. In the **Members** tab, select **User, group, or service principal**, click **+ Select members**, enter your Entra application name in the search box, select the service principal of your Entra application, and click **Select**.

    1. Click **Review + assign** twice to assign the role to the application's service principal at the scope of the selected key.

    1. Select **This application has read, encrypt, and decrypt permissions on this key.**

    1. Go back to the Zilliz Cloud console and click **Validate Key**.

    1. Once the validation passes, click **Add**.

    </Procedures>

    **Note**: This grants the **Key Vault Crypto User** role to the service principal of your Entra application at the scope of the target key. It is separate from the **Key Vault Crypto Officer** role granted at the vault scope for the identity that creates keys. If you use a custom role instead of **Key Vault Crypto User**, the role must include the read, encrypt, and decrypt permissions on the key.

</Procedures>

### Add an Azure Key Vault key using a new app\{#add-an-azure-key-vault-key-using-a-new-app}

If the drop-down list in **Select an Existing Application** on the **Existing Application** tab does not contain the application you need, switch to the **New Application** tab and follow the steps in this section. Otherwise, refer to [Add an Azure Key Vault key using an existing app](./azure-kms#add-an-azure-key-vault-key-using-an-existing-app).

<Procedures>

1. Select **Region**, set **Application (client) ID** and Directory (tenant) ID in Set Up the Application and Federated Credential.

    ![IPTPw02X0hVb8Bb2W2LcYRS3ncc](https://zdoc-images.s3.us-west-2.amazonaws.com/IPTPw02X0hVb8Bb2W2LcYRS3ncc.png)

    <Procedures>

    1. Select the target region from the drop-down list.

    1. Set the **Application (client) ID** and **Directory (tenant) ID**.

    1. Go to the Azure Portal, locate your Entra application, and click the application name.

    1. Choose **Manage** > **Certificates & secrets** in the left navigation, click **Federated credentials**, and click **+ Add credential**.

    1. In the **Add a credential** page, select **Kubernetes accessing Azure resources** in **Federated credential scenario**.

    1. Fill in **Cluster issuer URL**, **Namespace**, and **Service account name** with the values that are displayed on the Zilliz Cloud console, and validate **Subject identifier** and **Audience**.

    1. Name the credential, and click **Add**.

    </Procedures>

1. Create or use an existing key and submit the key identifier.

    ![M9unwFmYhhfd0Hb0E9ZcVxbnnhb](https://zdoc-images.s3.us-west-2.amazonaws.com/M9unwFmYhhfd0Hb0E9ZcVxbnnhb.png)

    <Procedures>

    1. Create a new key by setting its name and the key vault it belongs to, then run the given command in Azure Cloud Shell. Make sure the identity that runs Azure CLI is allowed to create keys in the target key vault before running the command.

    1. Fill the key identifier included in the command output back into **Key Identifier**.

        The key identifier must be in the form `https://<vault>.vault.azure.net/keys/<key>` without a version suffix. If the address copied from the command output or the Azure Portal ends with a version segment, remove that trailing segment before pasting; a key identifier with a version suffix is rejected.

        If the command fails with a permission error, ask your administrator to grant the **Key Vault Crypto Officer** role to the identity that runs the command, at the scope of the target key vault. For details, refer to [Create a key vault](./azure-kms#create-a-key-vault). Rerun the command with the original identity after the grant takes effect.

    1. Click **Next**.

    </Procedures>

1. Validate the key.

    ![SyC7wz0QKh8XlHbMpNzcdCYEnyd](https://zdoc-images.s3.us-west-2.amazonaws.com/SyC7wz0QKh8XlHbMpNzcdCYEnyd.png)

    <Procedures>

    1. Go to the Azure Portal, open **Key Vaults**, open the target vault, click **Keys**, and open the key name displayed in the Zilliz Cloud console.

    1. Choose **Access Control (IAM)** from the left navigation and click **+ Add** > **Add role assignment**.

    1. In the **Role** tab, click **Job function roles**, search for **Key Vault Crypto User**, select the role, and click **Next**.

    1. In the **Members** tab, select **User, group, or service principal**, click **+ Select members**, enter your Entra application name in the search box, select the service principal of your Entra application, and click **Select**.

    1. Click **Review + assign** twice to assign the role to the application's service principal at the scope of the selected key.

    1. Select **This application has read, encrypt, and decrypt permissions on this key.**

    1. Go back to the Zilliz Cloud console and click **Validate Key**.

    1. Once the validation passes, click **Add**.

    </Procedures>

    <Admonition type="info" title="Notes">

    This grants the **Key Vault Crypto User** role to the service principal of your Entra application at the scope of the target key. It is separate from the **Key Vault Crypto Officer** role granted at the vault scope for the identity that creates keys. If you use a custom role instead of **Key Vault Crypto User**, the role must include the read, encrypt, and decrypt permissions on the key.

    </Admonition>

</Procedures>

## Manage Azure Key Vault keys\{#manage-azure-key-vault-keys}

You can view the added Azure Key Vault keys on the Zilliz Cloud console.

![Q5lCwkbomhYAwbbE8wQcOnTgnkd](https://zdoc-images.s3.us-west-2.amazonaws.com/Q5lCwkbomhYAwbbE8wQcOnTgnkd.png)

<Procedures>

1. Find your target project.

1. In the left navigation pane, click on **Security** > **CMEK**.

1. Click **Azure KMS** to view added keys.

1. (Optional) Click **Remove** to remove obsolete ones.

</Procedures>

Zilliz Cloud will scan the availability of the listed keys every 10 minutes. You can also create project alerts regarding the status of the listed KMS keys. For details, refer to [Manage Project Alerts](./manage-project-alerts#create-a-project-alert).

When a KMS key is no longer needed, you can delete it if no clusters use it.

## Use Azure KMS keys\{#use-azure-kms-keys}

Once you add a KMS key to Zilliz Cloud, you can use it to create encrypted clusters and to back up and restore them.

### Create an encrypted cluster\{#create-an-encrypted-cluster}

Select a KMS key in the region where you want to create the cluster.

![RGUrbElsSoc61JxikfWcoTCrnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rgurbelssoc61jxikfwcotcrnhe.png "RGUrbElsSoc61JxikfWcoTCrnHe")

Once you have added a KMS key, you can create an encrypted cluster as follows:

<Procedures>

1. Click **Dedicated** in the **Choose Deployment Option** section.

1. Choose the cloud provider and region for the cluster.

1. Enable **Encryption at Rest with CMEK** and select an existing KMS key. Only a KMS key in the same region as the cluster to create can be selected.

1. Review the summary, then click **Create Cluster**.

    ![Iy8JbR19eoBQ4YxV1PjcLfUinl7](https://zdoc-images.s3.us-west-2.amazonaws.com/iy8jbr19eobq4yxv1pjclfuinl7.png "Iy8JbR19eoBQ4YxV1PjcLfUinl7")

    On the **Overview** page of an encrypted cluster, there is a key icon to the right of the cluster name, as shown in the above figure. All collections created in an encrypted cluster are encrypted by default.

</Procedures>

### Restore from an encrypted backup file\{#restore-from-an-encrypted-backup-file}

When you restore an encrypted backup to a new cluster, Zilliz Cloud will use the KMS key associated with the backup file to decrypt the data before restoration. Therefore, you can restore the backup to a new cluster with or without encryption. 

![WaApbDlaYoywaMxxUMxcQLAOnDe](https://zdoc-images.s3.us-west-2.amazonaws.com/waapbdlayoywamxxumxcqlaonde.png "WaApbDlaYoywaMxxUMxcQLAOnDe")

The restoration procedure from an encrypted backup is almost the same as a normal restoration, except for whether to enable **Encryption at Rest with CMEK**.

![V1QJb3SK1oGa11xLljhcxKQEnkc](https://zdoc-images.s3.us-west-2.amazonaws.com/v1qjb3sk1oga11xlljhcxkqenkc.png "V1QJb3SK1oGa11xLljhcxKQEnkc")

- When this option is enabled, the cluster created after the restoration is encrypted using the KMS key specified below.

- When this option is disabled, the cluster created after the restoration is unencrypted.

## FAQ\{#faq}

### The create-key command fails with an error like "Failed to resolve ..."\{#the-create-key-command-fails-with-an-error-like-failed-to-resolve}

The key vault name in the command cannot be resolved. Check the following:

- Open the target key vault in the Azure Portal and verify the exact vault name on the **Overview** page, along with the **Vault URI** derived from it. Make sure the command uses the exact name.

- Confirm that the terminal where you run Azure CLI can resolve public DNS names.

### The create-key command fails with `ForbiddenByRbac`\{#the-create-key-command-fails-with-forbiddenbyrbac}

The identity that runs the command lacks the data-plane permission to create keys in the vault. If the error message contains the operation `Microsoft.KeyVault/vaults/keys/create/action`, check the following:

- The **Key Vault Crypto Officer** role is granted to the identity that runs the command, at the scope of the target key vault. For details, refer to [Create a key vault](./azure-kms#create-a-key-vault).

- Azure role assignments can take a few minutes to propagate. Wait for the grant to take effect and rerun the command with the original identity.

