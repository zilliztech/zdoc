---
title: "AWS KMS | BYOC"
slug: /aws-kms
sidebar_label: "AWS KMS"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "AWS Key Management Service (KMS) is an AWS-managed service that makes it easy for you to create and control the keys used to encrypt and sign your data. | BYOC"
type: origin
token: FOamwIi07ia7kpkBPW8cEuIpniu
sidebar_position: 1
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# AWS KMS

AWS Key Management Service (KMS) is an AWS-managed service that makes it easy for you to create and control the keys used to encrypt and sign your data.

## Overview\{#overview}

In typical cases, you do not use your KMS key to encrypt your data in a Zilliz Cloud cluster. Instead, you use the KMS key to encrypt an encryption zone key (EZK), use the EZK to encrypt a data encryption key (DEK), and use the DEK to encrypt your data.

![YJRcwu5BLhm8Hub1eiZcDiIdnDh](https://zdoc-images.s3.us-west-2.amazonaws.com/YJRcwu5BLhm8Hub1eiZcDiIdnDh.png)

For details on how encryption works and its scope, refer to [this section](./cmek#how-encryption-works). For more information on the CMEK feature's limitations, refer to [this section](./cmek#limitations). To use the CMEK feature, follow the procedure on this page.

## Before you start\{#before-you-start}

- You have installed AWS CLI or have access to AWS CloudShell. 

    For details, refer to [this page](https://docs.aws.amazon.com/cli/latest/userguide/cli-chap-getting-started.html).

- You have sufficient permissions to run KMS-related commands.

## Add a KMS key\{#add-a-kms-key}

Each project allows up to **20** keys, regardless of the KMS providers. You can either add an existing KMS key or follow the instructions in the Zilliz Cloud console to create a KMS key and add it to Zilliz Cloud.

If the drop-down list in the **Select AWS IAM Role** step is empty, you need to add a CMEK role using [Zilliz Cloud Terraform provider](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs) in advance.

<Procedures>

1. Click the drop-down in the **Select AWS IAM Role** step, select an IAM role, and click **Next**.

    ![FbqvwpUuahSvMyb02IUcT1iNn6f](https://zdoc-images.s3.us-west-2.amazonaws.com/FbqvwpUuahSvMyb02IUcT1iNn6f.png)

1. Add the KMS key.

    ![OVdjw9ZFghQKnsbaX67cAPkWn2b](https://zdoc-images.s3.us-west-2.amazonaws.com/OVdjw9ZFghQKnsbaX67cAPkWn2b.png)

    1. Select the target region in step 1.

    1. **(Optional)** Copy the command in step 2 and execute it in your AWS CloudShell.

        This step is optional. If you already have a KMS key created with the specified IAM role, you can skip this step and proceed to the next. This is useful for adding multi-region replica keys.

        <Admonition type="info" icon="📘" title="Notes">

        <p>After you back up an encrypted Zilliz Cloud cluster from one cloud region to another, you must use the same key that encrypted the original cluster to decrypt the backup in the target region. </p>
        <p>In this case, you can replicate the key to the region hosting the backup and submit it to Zilliz Cloud using an existing IAM role.</p>
        <p>For details on creating multi-region replica keys, read <a href="https://docs.aws.amazon.com/kms/latest/developerguide/multi-region-keys-replicate.html">this page</a> in the AWS documentation.</p>

        </Admonition>

    1. Copy and paste the KMS key ARN in the following locations:

        - Your IAM role's policy [on the AWS console](https://console.aws.amazon.com/iam/home#/roles).

            Click the name of the role in the role list, find the role policy in the **Permissions** tab, and append the copied KMS key to the `Resource` node.

            ```json
            {
                    "Version": "2012-10-17",
                    "Statement": [
                            {
                                    "Effect": "Allow",
                                    "Action": [
                                            "kms:Decrypt",
                                            "kms:Encrypt",
                                            "kms:DescribeKey"
                                    ],
                                    "Resource": [
                                            // highlight-start
                                            "arn:aws:kms:us-west-2:xxxx:key/mrk-...",
                                            "PASTE-THE-COPIED-KEY-ARN-HERE"
                                            // highlight-end
                                    ]
                            }
                    ]
            }
            ```

        - Step 3 in the above dialog box on Zilliz Cloud.

    1. Click **Validate KMS Key** at the bottom of the dialog box.

    1. Once the validation succeeds, click **Add**.

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

<p>When you use a KMS key to encrypt a Zilliz Cloud cluster, the cluster checks the key's availability every 10 minutes. It becomes available only after it detects that the key is available.</p>

</Admonition>

## Manage AWS KMS keys\{#manage-aws-kms-keys}

You can view the added AWS KMS keys on the Zilliz Cloud console.

![OyNQwDHFhhUIXDbRMjac08Xdn1g](https://zdoc-images.s3.us-west-2.amazonaws.com/OyNQwDHFhhUIXDbRMjac08Xdn1g.png)

When a KMS key is no longer needed, you can delete it if any clusters do not use it.

## Use AWS KMS keys\{#use-aws-kms-keys}

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

