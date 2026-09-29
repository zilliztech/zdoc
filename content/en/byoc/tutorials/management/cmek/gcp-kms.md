---
title: "Google Cloud KMS | BYOC"
slug: /gcp-kms
sidebar_label: "Google Cloud KMS"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
channel: next
sidebar_custom_props:
  channel: next
description: "Google Cloud Key Management Service (KMS) is a Google Cloud-managed service that makes it easy for you to create and control the keys used to encrypt and sign your data. | BYOC"
type: origin
token: MKAJwmebRiSsOrkgShUcaHS9nhe
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Google Cloud KMS

<FeatureNote variant="plan" titleHref="/docs/select-zilliz-cloud-service-plans">

This feature is available only on Business Critical (SaaS) and BYOC deployments.

</FeatureNote>

<FeatureNote variant="region" titleHref="/docs/cloud-providers-and-regions">

This feature is available in AWS. It is not available on Google Cloud and Microsoft Azure.

</FeatureNote>

Google Cloud Key Management Service (KMS) is a Google Cloud-managed service that makes it easy for you to create and control the keys used to encrypt and sign your data. 

## Overview\{#overview}

In Google Cloud KMS, an encryption key is represented as a **CryptoKey**, that belongs to a **key ring** in a specific Google Cloud location. When you configure CMEK for Zilliz Cloud, you provide the CryptoKey that Zilliz Cloud uses to encrypt data. The key ring organizes the key but is not itself an encryption key.

In typical cases, you do not use a CryptoKey to encrypt your data in a Zilliz Cloud cluster. Instead, you use the CryptoKey to encrypt an encryption zone key (EZK), use the EZK to encrypt a data encryption key (DEK), and use the DEK to encrypt your data.

![Cqi8wMUzHhKJD0bEzR2csNWAnNe](https://zdoc-images.s3.us-west-2.amazonaws.com/Cqi8wMUzHhKJD0bEzR2csNWAnNe.png)

For details on how encryption works and its scope, refer to [this section](./cmek#how-encryption-works). For more information on the CMEK feature's limitations, refer to [this section](./cmek#limitations). To use the CMEK feature, follow the procedure on this page.

## Before you start\{#before-you-start}

- You have sufficient permissions to run key management commands.

## Add Google Cloud CryptoKey\{#add-google-cloud-cryptokey}

Each project allows up to **20** keys, regardless of the KMS providers. To add a Google Cloud CryptoKey to Zilliz Cloud, you can either use an existing key ring or create a new one and create the CryptoKey in it.

To add a Google Cloud CryptoKey, log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login), choose **Network** > **CMEK** from the left navigation pane, go into one of your **Business Critical** projects located in an applicable Google Cloud region, click **+ CMEK**, and follow the steps in the **Add CMEK (Google Cloud KMS)** dialog box to complete the process. 

<Procedures>

1. Select region and prepare service account.

    ![F1IIwn3g9hxwxBb9DHlcmJKunig](https://zdoc-images.s3.us-west-2.amazonaws.com/F1IIwn3g9hxwxBb9DHlcmJKunig.png)

    1. Click the drop-down in the **Select the region** step.

    1. Click **Prepare Service Account** in the **Prepare a dedicated Google service account** step.

        Zilliz Cloud will generate a service account with short-lived credentials in the specified region. When you see **Ready** below the generated **Service Account Email**, click **Next**.

1. Create Google Cloud KMS key.

    ![HR1QwmmaCh3p6kbkS7IcvbDfnof](https://zdoc-images.s3.us-west-2.amazonaws.com/HR1QwmmaCh3p6kbkS7IcvbDfnof.png)

    1. Verify the displayed region and fill in your **GCP Project ID**, **Protection level**, **Key ring name**, and **Key name**. The values specified in these slots modify the commands listed in the template below. 

        If you do not already have an existing key ring, the name specified in **Key ring name** will be used to create one. Otherwise, select **Use an existing key ring**. If you do, ensure that the specified key ring actually exists.

    1. Copy the prepared commands and run them in [Google Cloud Shell](https://shell.cloud.google.com/).

    1. Copy the key resource name returned by the commands, and paste it in **Key resource name**.

1. Configure key permissions.

    ![SVbaw9LdQhOFJNbOhfHcQ6jHnPf](https://zdoc-images.s3.us-west-2.amazonaws.com/SVbaw9LdQhOFJNbOhfHcQ6jHnPf.png)

    1. Copy the commands displayed in the dialog box and run them in [Google Cloud Shell](https://shell.cloud.google.com/).

        Running these commands will associate the necessary key permissions to the Google Cloud service account prepared in step 1. 

    1. Click **Validate KMS Key**.

    1. Once the key is validated, click **Add** to add the key.

</Procedures>

## Manage Google Cloud KMS Keys\{#manage-google-cloud-kms-keys}

You can view the added Google Cloud KMS keys on the Zilliz Cloud console.

![JIOvwK1qghkys1b4drXcZUyFnCb](https://zdoc-images.s3.us-west-2.amazonaws.com/JIOvwK1qghkys1b4drXcZUyFnCb.png)

When a KMS key is no longer needed, you can delete it if any clusters do not use it.

## Use Google Cloud KMS keys\{#use-google-cloud-kms-keys}

Once you have added a KMS key to Zilliz Cloud, you can use it to create encrypted clusters and to back up and restore them.

### Create an encrypted cluster\{#create-an-encrypted-cluster}

You can select a KMS key available in the region where you want to create the cluster to encrypt it.

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

