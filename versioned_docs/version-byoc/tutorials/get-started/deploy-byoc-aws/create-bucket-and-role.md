---
title: "Create S3 Bucket and IAM Role | BYOC"
slug: /create-bucket-and-role
sidebar_label: "Create S3 Bucket and IAM Role"
beta: CONTACT SALES
notebook: FALSE
description: "This page describes how to create and configure root storage for a Bring-Your-Own-Cloud (BYOC) project with proper permissions. | BYOC"
type: origin
token: Lv1Pw8lORiaX44kjGL0cNnpPnub
sidebar_position: 1
keywords: 
  - zilliz
  - byoc
  - aws
  - s3 bucket
  - IAM role
  - milvus
  - vector database
  - Embedding model
  - image similarity search
  - Context Window
  - Natural language search

---

import Admonition from '@theme/Admonition';


# Create S3 Bucket and IAM Role

This page describes how to create and configure root storage for a Bring-Your-Own-Cloud (BYOC) project with proper permissions.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Best practices for the S3 bucket{#best-practices-for-the-s3-bucket}

The bucket that you specify during the project deployment will be used as the root storage for the clusters created in the project. Before you create your S3 bucket, review the following best practices:

- The S3 bucket must be in the same AWS region as the project deployment.

- All clusters in a project share the S3 bucket created during the project deployment. Zilliz Cloud recommends using an S3 bucket dedicated to the project and not sharing it with other services and resources.

## Procedure{#procedure}

You can use the AWS console to create the bucket and role. As an alternative, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on AWS. For details, refer to [Bootstrap Project Infrastructure (Terraform)](./bootstrap-infrastructure-terraform).

### Step 1: Create the S3 bucket{#step-1-create-the-s3-bucket}

In this step, you will create an S3 bucket on AWS for the BYOC project deployment. If you prefer to use an existing S3 bucket, ensure that the bucket is in the same region as the BYOC project. You need to enter the bucket name in **Storage settings** on the Zilliz Cloud console.

1. Log into your AWS console as a user with the administrator privilege and go to the **S3** service.

1. On the **General purpose bucket** tab, click **Create bucket**.

    ![GDckbxxzSoKSGQxaKCfcWgaunjh](/byoc/GDckbxxzSoKSGQxaKCfcWgaunjh.png)

1. In **Bucket name**, enter the name for the bucket and keep the default values for other settings.

    ![ZYyabX878ohfxYx95OmciUrPnMc](/byoc/ZYyabX878ohfxYx95OmciUrPnMc.png)

1. Click **Create bucket**.

    ![YA58bgisNoCF3qxF4gLch0kcnJe](/byoc/YA58bgisNoCF3qxF4gLch0kcnJe.png)

1. Go back to the **Zilliz Cloud console** and paste the bucket name in **Bucket** under **Storage settings**.

    ![A032bxjnpoSChuxJiNCc5EEDnFe](/byoc/A032bxjnpoSChuxJiNCc5EEDnFe.png)

### Step 2: Create an IAM role to access the S3 bucket{#step-2-create-an-iam-role-to-access-the-s3-bucket}

In this step, you will create an IAM role on AWS for Zilliz Cloud to access the S3 bucket that you created in the previous step on your behalf.

1. Log into your **AWS Console** as a user with administrator privileges and go to the **IAM** dashboard.

1. Expand your account information, and click the copy button in front of your **AWS Account ID**.

    ![Gzzqbp3xhoRbLqxaRHmc8gIbnvc](/byoc/Gzzqbp3xhoRbLqxaRHmc8gIbnvc.png)

1. Click the **Roles** tab in the left sidebar, and then click **Create Role**.

    ![KlbBb0D1soRfNxxA9b2cvRSWn7g](/byoc/KlbBb0D1soRfNxxA9b2cvRSWn7g.png)

1. In **Select trusted entity**, click the **Custom trust policy** tile. In **Common trust policy**, paste the trust JSON from below into the editor in the **Custom trust policy** section and replace `{accountId}` with your **AWS Account ID**.

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Principal": {
                    "Federated": "arn:aws:iam::{accountId}:oidc-provider/eks_oidc_url"
                },
                "Action": "sts:AssumeRoleWithWebIdentity",
                "Condition": {
                    "StringLike": {
                        "eks_oidc_url:sub": [
                            "system:serviceaccount:milvus-*:milvus*",
                            "system:serviceaccount:loki:loki*",
                            "system:serviceaccount:index-pool:milvus*"
                        ],
                        "eks_oidc_url:aud": "sts.amazonaws.com"
                    }
                }
            }
        ]
    }
    ```

    ![W6vnbUhMeohadJxc3Rlc4NXbnbb](/byoc/W6vnbUhMeohadJxc3Rlc4NXbnbb.png)

1. Click **Next** and skip adding permissions.

1. In the **Name, review, and create** step, name the role, review the trusted entities, and click **Create role**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>When naming the role, use the prefix <code>zilliz-byoc</code>.</p>

    </Admonition>

1. Once the role has been created, click **View role** in the green bar to go to the role details

    ![TWpFbSb3IooqTBxAoCXcTfC4n2c](/byoc/TWpFbSb3IooqTBxAoCXcTfC4n2c.png)

1. Click the copy icon in front of the role's **ARN**.

    ![BSImbWeTloGRhjxMCRWc26ZUntg](/byoc/BSImbWeTloGRhjxMCRWc26ZUntg.png)

1. Go back to the Zilliz Cloud console, paste the role ARN in **IAM Role ARN** under **Storage settings**. 

    ![WOIHbocGko9GYzxiVVycHCLLnVb](/byoc/WOIHbocGko9GYzxiVVycHCLLnVb.png)

### Step 3: Add permissions{#step-3-add-permissions}

This step is solely on the AWS console. In this step, you will create an inline policy for the role created in [Step 2](./create-bucket-and-role#step-2-create-an-iam-role-to-access-the-s3-bucket).

1. Go to the details page of the created role. In the **Permissions policies** section, click **Add permissions**, and choose **Create inline policy**.

    ![VoLMbB9VfoVzfDx0NPTcfFCWn7c](/byoc/VoLMbB9VfoVzfDx0NPTcfFCWn7c.png)

1. On the **Specify permissions** page, click **JSON** in the **Policy editor** section to open the policy editor. Then copy the permissions from below and paste it into the policy editor.

    You need to replace `{bucketName}` with that of the bucket created in [Step 1](./create-bucket-and-role#step-1-create-the-s3-bucket), copy the modified policy JSON, and paste it into **Policy editor** on AWS.

    ```json
    {
        "Version": "2012-10-17",
         "Statement": [
            {
              "Effect": "Allow",
              "Action": [
                "s3:ListBucket"
              ],
              "Resource": "arn:aws:s3:::{bucketName}"
            },
            {
                "Sid": "AllowS3ReadWrite",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:DeleteObject"
                ],
                "Resource": [
                    "arn:aws:s3:::{bucketName}/*"
                ]
            }
        ]
    }
    ```

    ![U7fFb8rNXoEC06xrSl3c7SOznkY](/byoc/U7fFb8rNXoEC06xrSl3c7SOznkY.png)

1. In **Review and create**, enter a policy name, review the permissions, and click **Create policy**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>When naming the policy, use the prefix <code>zilliz-byoc</code>.</p>

    </Admonition>

    ![ZxlGbt5dzoTmpzxpS2Uc8rkBnHe](/byoc/ZxlGbt5dzoTmpzxpS2Uc8rkBnHe.png)

    