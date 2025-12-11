---
title: "Integrate with AWS S3 | Cloud"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: PRIVATE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "Zilliz Cloud allows you to integrate with Amazon Simple Storage Service (Amazon S3) to export backup files or audit logs to designated S3 buckets. | Cloud"
type: origin
token: PAViwMSb3iVMzuk56z3c1zfRnwh
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - backup
  - export
  - integrate
  - object
  - storage
  - hnsw algorithm
  - vector similarity search
  - approximate nearest neighbor search
  - DiskANN

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Integrate with AWS S3

Zilliz Cloud allows you to integrate with Amazon Simple Storage Service (Amazon S3) to export backup files or audit logs to designated S3 buckets.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is available only to <strong>Dedicated</strong> clusters in an <strong>Enterprise</strong> project.</p>

</Admonition>

![BUEcwkZiChJrTlbziBMc3V49nFe](https://zdoc-images.s3.us-west-2.amazonaws.com/BUEcwkZiChJrTlbziBMc3V49nFe.png)

## Before you start\{#before-you-start}

- To integrate Zilliz Cloud with AWS S3, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud Organization Owner.

- You have administrative access to the AWS Management Console.

## Step 1: Start integration in Zilliz Cloud console\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmeibltu49co2h3pytvtdthb2" title="Step 1: Start integration in Zilliz Cloud console" />

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On your project page, navigate to **Integrations** from the left-side navigation pane.

1. Under the **Amazon S3** section, click **+ Integration**.

1. In the dialog box that appears, configure **Basic Settings**:

    - **Integration Name**: A unique name for this integration (e.g., `integration_0819`).

    - **Integration Description** *(optional)*: A description for this integration (e.g., `for export backupfile`).

1. Click **Next**. You'll be redirected to the **Create Amazon S3 Bucket** step:

    1. In the **Zilliz Cloud Cluster** **Region** field, select the cloud region where your Zilliz Cloud cluster resides. The bucket you create later must be in the same region as your Zilliz Cloud cluster.

    1. Open the [S3 console](https://us-west-2.console.aws.amazon.com/s3/buckets) and proceed to [step 2](./integrate-with-aws-s3).

## Step 2: Create S3 bucket in AWS console\{#step-2-create-s3-bucket-in-aws-console}

<Supademo id="cmeibt2wt9cx1h3pyrojdocrn" title="Step 2: Create S3 bucket (1)" />

1. In the upper-right corner of the [Amazon S3 console](https://console.aws.amazon.com/s3/), choose the AWS region that matches your Zilliz Cloud cluster’s region.

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>The AWS region to create a bucket should be consistent with the region where your Zilliz Cloud cluster resides. For Zilliz Cloud-supported regions, refer to <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></li>
    <li><p>For clusters running in different regions, create separate integrations for each region to ensure backup files or audit logs can be exported properly.</p></li>
    </ul>

    </Admonition>

1. In the left navigation pane, choose **General purpose buckets**, and then click **Create bucket**.

1. Configure bucket settings:

    1. Under **Bucket type**, choose **General purpose**.

    1. For **Bucket name**, enter a name for your bucket (e.g., `zilliz-bucket-for-integration-0819`). Remember this bucket name, as you will need it for future steps.

    1. Keep other settings as default and click **Create bucket**.

    For more information, refer to [Creating a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html).

Once the bucket is created, go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login), and do the following:

<Supademo id="cmeibwrd19d3xh3pyx4h7r3d4" title="Step 2: Create S3 bucket (2)" />

1. In the **Bucket Name** field, enter the name of the bucket you just created (in this example, `zilliz-bucket-for-integration-0819`). Then, click **Next**.

1. In the **Create IAM Policy** step, copy the JSON policy. It will be required in [step 3](./integrate-with-aws-s3).

1. Once completed, open the [IAM console](https://console.aws.amazon.com/iam/) and proceed to [step 3](./integrate-with-aws-s3).

## Step 3: Create IAM policy in AWS console\{#step-3-create-iam-policy-in-aws-console}

To give Zilliz Cloud access to AWS S3, create an IAM policy. This policy should include specific actions and resources to facilitate the transfer of backup files between Zilliz Cloud and your S3 bucket.

<Supademo id="cmeibzhk09d4rh3pyaipwhqi7" title="Step 3: Create IAM policy (1)" />

For simplicity, create a policy using the JSON editor.

1. In the [IAM console](https://console.aws.amazon.com/iam/), choose **Policies** > **Create policy**.

1. In the **Policy editor** section, choose the **JSON** option.

1. Copy and paste the JSON policy document provided by Zilliz Cloud to the policy editor. Then, click **Next**.

    The following is a sample JSON policy document. For the exact policy tailored to your integration, refer to the **Create IAM Policy** step on the Zilliz Cloud console.

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:ListBucket",
                    "s3:GetBucketLocation"
                ],
                "Resource": [
                    "arn:aws:s3:::<bucket>",
                    "arn:aws:s3:::<bucket>/*"
                ]
            }
        ]
    }
    ```

    However, when you have enabled server-side encryption for the bucket using AWS KMS, you need to add another IAM policy to allow the `kms:GenerateDataKey` action.  In this case, use the following JSON policy.

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Statement1",
                "Effect": "Allow",
                "Action": [
                    "s3:GetObject",
                    "s3:PutObject",
                    "s3:ListBucket",
                    "s3:GetBucketLocation"
                ],
                "Resource": [
                    "arn:aws:s3:::<bucket>",
                    "arn:aws:s3:::<bucket>/*"
                ]
            },
            {
                "Sid": "AllowKMSGenerateDataKey",
                "Effect": "Allow",
                "Action": [
                    "kms:GenerateDataKey"
                ],
                "Resource": "arn:aws:kms:<region>:<account_id>:key/<key_id>"
            }
        ]
    }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p><code>&lt;bucket&gt;</code> should be replaced with the actual name of your S3 bucket.</p></li>
    <li><p><code>&lt;region&gt;</code>, <code>&lt;account_id&gt;</code>, and <code>&lt;key_id&gt;</code> should be replaced with their actual values. For details, refer to <a href="https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-id">Key identifiers</a> in AWS docs.</p></li>
    </ul>

    </Admonition>

1. On the **Review and create** page, enter a **Policy Name** (e.g. `zilliz-policy-for-integration-0819`) and a **Description** (optional) for the policy that you are creating, and review **Permissions defined in this policy**. Remember the policy name, as you will need it for future steps.

1. Choose **Create policy** to save your new policy. Once completed, proceed to [step 4](./integrate-with-aws-s3).

## Step 4: Create IAM role\{#step-4-create-iam-role}

Before creating an IAM role in AWS console, do the following in the Zilliz Cloud console:

<Supademo id="cmeic3fab9dajh3pyzp50jnck" title="Step 4: Create IAM role (1)" />

1. In the Zilliz Cloud console, click **Next** to proceed to the **Create IAM Role** step.

1. In **Select trusted entity**, copy the JSON content, then go to the [IAM console](https://console.aws.amazon.com/iam/).

Once that's done, do the following to create an IAM role:

<Supademo id="cmeic6bis9dgth3pybfmk8143" title="Step 4: Create IAM role (2)" />

1. In the [IAM console](https://console.aws.amazon.com/iam/), choose **Roles** > **Create role**.

1. Choose the **Custom trust policy** role type.

1. In the **Custom trust policy** section, copy and paste the custom trust policy for the role. Then, click **Next**.

    The following is a sample JSON trust policy. For the exact trust policy tailored to your integration, refer to the **Create IAM Role** step on the Zilliz Cloud console.

    ```json
    {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Effect": "Allow",
                "Action": "sts:AssumeRole",
                "Principal": {
                    "AWS": "965570967084"
                },
                "Condition": {
                    "StringEquals": {
                        "sts:ExternalId": "my-external-id"
                    }
                }
            }
        ]
    }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p><code>965570967084</code> and <code>my-external-id</code> should be replaced with the actual AWS account ID and external ID shown in the <strong>Create IAM Role</strong> step on the Zilliz Cloud console.</p>

    </Admonition>

1. Under **Permissions policies** of the **Add permissions** step, search for and select the policy you created in [step 3](./integrate-with-aws-s3) to add permissions. Then, click **Next**.

1. In the **Name, review, and create** step, enter a role name (e.g. `zilliz-integration-role-0819`) and review the settings. Then, click **Create role**.

1. Go to the details page of the created role, copy the **ARN** corresponding to the role. This will be required in Zilliz Cloud console in [step 5](./integrate-with-aws-s3#step-5-validate-and-add-integration).

## Step 5: Validate and add integration\{#step-5-validate-and-add-integration}

<Supademo id="cmeicbdyz9dprh3py2wwbguvn" title="Step 5: Validate and add integration" />

1. In the **Create IAM Role** step of the [Zilliz Cloud console](https://cloud.zilliz.com/login), paste the **ARN** you copied from the IAM console in the previous step.

1. Then, click **Validate Integration** to confirm the S3 bucket and IAM role settings.

1. Once the status changes to **Successful**, the integration works. Then, click **Add**.

You can now use this integration to export backup files or forward audit logs to your Amazon S3 bucket. For more information, refer to  [Export Backup Files](./export-backup-files) or [Audit Logging](./audit-logs).

## Manage integrations\{#manage-integrations}

Once the integration is added, you can view its details or remove the integration as needed.

![YODhb5leToWLsjxGRrpcyuZNnPb](https://zdoc-images.s3.us-west-2.amazonaws.com/yodhb5letowlsjxgrrpcyuznnpb.png "YODhb5leToWLsjxGRrpcyuZNnPb")

### Obtain the integration ID\{#obtain-the-integration-id}

If you need to use the RESTful API to export backup files to one of your AWS S3 buckets integrated with Zilliz Cloud, click **View Details** to display the details of an integration and copy its integration ID.

## Troubleshooting\{#troubleshooting}

If you encounter issues during the integration process, here are some common error messages and their solutions.

### Bucket region mismatch\{#bucket-region-mismatch}

**Description**: The following example error occurs when the region of the S3 bucket does not match the region of your Zilliz Cloud cluster.

```plaintext
"bucket region not match, want[us-west-1] got[us-west-2]"
```

**Solution**:

- Ensure that the AWS region where your S3 bucket is located matches the region of your Zilliz Cloud cluster.

- If needed, create a new bucket in the correct region or adjust your cluster's region to match the bucket’s region.

### Bucket not found\{#bucket-not-found}

**Description**: This error occurs when the specified S3 bucket does not exist or the bucket name is incorrect.

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 404, RequestID: ..., HostID: ..., api error NoSuchBucket: The specified bucket does not exis
```

**Solution**:

- Double-check the bucket name in both the Zilliz Cloud console and the AWS S3 console.

- Confirm that the bucket exists and that the name is correctly entered in your Zilliz Cloud configuration.

### Access denied for bucket location\{#access-denied-for-bucket-location}

**Description**: This error occurs when the IAM role does not have the required permissions to access the S3 bucket's location.

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 403 ...
```

**Solution**:

- Review the IAM policy attached to the role being used by Zilliz Cloud.

- Ensure the policy includes the `s3:GetBucketLocation` permission along with other necessary permissions, such as `s3:GetObject`, `s3:PutObject`, and `s3:ListBucket`.

### Role assumption failure\{#role-assumption-failure}

**Description**: This error occurs when there is an issue with assuming the IAM role due to incorrect role ARN, external ID, or trust policy.

```sql
try assume role from[zilliz-role] to [arn:aws:iam::041623484421:role/testoss121703] with externalId[zilliz-external-1umVCIK7q96kzDE] failed
```

**Solution**:

- Verify that the role ARN and external ID on the Zilliz Cloud console match the corresponding values in the IAM trust policy.

- Ensure that the trust policy in the IAM role allows Zilliz Cloud to assume the role.

