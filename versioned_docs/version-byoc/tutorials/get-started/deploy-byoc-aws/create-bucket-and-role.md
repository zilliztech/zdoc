---
title: "Create S3 Bucket and IAM Role | BYOC"
slug: /create-bucket-and-role
sidebar_label: "Create S3 Bucket and IAM Role"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page describes the procedure for creating and configuring the root storage for a Bring-Your-Own-Cloud (BYOC) project with proper permissions. | BYOC"
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
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Create S3 Bucket and IAM Role

This page describes the procedure for creating and configuring the root storage for a Bring-Your-Own-Cloud (BYOC) project with proper permissions.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## Best practices for the S3 bucket\{#best-practices-for-the-s3-bucket}

The bucket you specify during the project deployment will be used as the root storage for the clusters created in the project. Before you create your S3 bucket, review the following best practices:

- The S3 bucket must be in the same AWS region as the project deployment.

- All clusters in a project share the S3 bucket created during the project deployment. Zilliz Cloud recommends using an S3 bucket dedicated to the project and not sharing it with other services and resources.

## Procedure\{#procedure}

You can use the AWS console to create the bucket and role. As an alternative, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on AWS. For details, refer to [Terraform Provider](./terraform-provider).

### Step 1: Create the S3 bucket\{#step-1-create-the-s3-bucket}

In this step, you will create an S3 bucket on AWS for the BYOC project deployment. If you prefer to use an existing S3 bucket, ensure that the bucket is in the same region as the BYOC project. Once it is created, enter the bucket name in **Storage settings** on the Zilliz Cloud console.

<Supademo id="cmb5xlhej39irppkpeihkx9eg" title=""  />

1. Log in to your AWS console as a user with administrator privileges and go to the S3 service.

1. On the **General purpose bucket** tab, click **Create bucket**.

1. In **Bucket name**, enter the name for the bucket and keep the default values for other settings.

1. Click **Create bucket**.

1. Return to the **Zilliz Cloud console** and paste the bucket name in **Bucket** under **Storage settings**.

### Step 2: Create an IAM role to access the S3 bucket\{#step-2-create-an-iam-role-to-access-the-s3-bucket}

In this step, you will create an IAM role on AWS for Zilliz Cloud to access the S3 bucket that you created in the previous step on your behalf.

<Supademo id="cmb5y39ss39r5ppkplsrz1nqd" title=""  />

1. Log into your **AWS Console** as a user with administrator privileges and go to the **IAM** dashboard.

1. Expand your account information, and click the copy button before your **AWS Account ID**.

1. Click the **Roles** tab in the left sidebar, then **Create Role**.

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

1. Click **Next** and skip adding permissions.

1. In the **Name, review, and create** step, name the role, review the trusted entities, and click **Create role**.

1. Once the role has been created, click **View role** in the green bar to go to the role details

1. Click the copy icon in front of the role's **ARN**.

1. Go back to the Zilliz Cloud console, paste the role ARN in **IAM Role ARN** under **Storage settings**.

### Step 3: Add permissions\{#step-3-add-permissions}

This step is solely on the AWS console. In this step, you will create an inline policy for the role created in [Step 2](./create-bucket-and-role#step-2-create-an-iam-role-to-access-the-s3-bucket).

<Supademo id="cmb65arpv3e11ppkpgy2d4q1v" title=""  />

1. Go to the details page of the created role. In the **Permissions policies** section, click **Add permissions**, and choose **Create inline policy**.

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

1. In **Review and create**, enter a policy name, review the permissions, and click **Create policy**.

    