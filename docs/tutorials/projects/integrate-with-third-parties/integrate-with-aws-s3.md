---
title: "Integrate with AWS S3 | Cloud"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: PRIVATE
notebook: FALSE
description: "Zilliz Cloud allows you to integrate with Amazon Simple Storage Service (Amazon S3) to export backup files to designated S3 buckets. | Cloud"
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
  - Zilliz vector database
  - Zilliz database
  - Unstructured Data
  - vector database

---

import Admonition from '@theme/Admonition';


# Integrate with AWS S3

Zilliz Cloud allows you to integrate with Amazon Simple Storage Service (Amazon S3) to export backup files to designated S3 buckets.

<Admonition type="info" icon="📘" title="Notes">

<p>This feature is in <strong>Private Preview</strong> for clusters on the <strong>Dedicated-Enterprise</strong> plan. To enable this feature or learn about the associated costs, contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

![BUEcwkZiChJrTlbziBMc3V49nFe](/img/BUEcwkZiChJrTlbziBMc3V49nFe.png)

## Before you start{#before-you-start}

- To integrate Zilliz Cloud with AWS S3, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud administrator.

- You have administrative access to the AWS Management Console.

## Step 1: Start integration on Zilliz Cloud{#step-1-start-integration-on-zilliz-cloud}

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. Navigate to **Integrations** from the left-side navigation pane.

1. Under the **Amazon S3** section, click **+ Configuration**.

1. In the dialog box that appears, complete **Basic Settings**:

    - **Configuration Name**: A unique name for this integration (e.g., `bucket_for_backup`).

    - **Configuration Description** *(optional)*: A description for this integration (e.g., `for export backupfile`).

1. Proceed to [step 2](./integrate-with-aws-s3).

![integrate-with-aws-1](/img/integrate-with-aws-1.png)

## Step 2: Create S3 bucket{#step-2-create-s3-bucket}

1. Log in to the **AWS Management Console** and open the [Amazon S3 console](https://console.aws.amazon.com/s3/).

1. At the top of the page, choose the AWS region that matches your Zilliz Cloud cluster’s region.

    <Admonition type="info" icon="📘" title="Notes">

    <ul>
    <li><p>The AWS region to create a bucket should be consistent with the region where your Zilliz Cloud cluster resides. For Zilliz Cloud-supported regions, refer to <a href="./cloud-providers-and-regions">Cloud Providers & Regions</a>.</p></li>
    <li><p>For clusters running in different regions, create separate integrations for each region to ensure backup files can be exported properly.</p></li>
    </ul>

    </Admonition>

1. In the left navigation pane, choose **General purpose buckets**, and then click **Create bucket**.

1. Configure bucket settings:

    1. Under **Bucket type**, choose **General purpose**.

    1. For **Bucket name**, enter a name for your bucket (e.g., `bucket-for-backup`). Be sure to remember this bucket name, as you will need it for future steps.

    1. Keep other settings as default and click **Create bucket**.

    For more information, refer to [Creating a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html).

1. Go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login). Enter the **Bucket Name** and **Bucket Region** in the **Create Amazon S3 Bucket** step. Once completed, proceed to [step 3](./integrate-with-aws-s3).

![integrate-with-aws-2](/img/integrate-with-aws-2.png)

## Step 3: Create IAM policy{#step-3-create-iam-policy}

To give Zilliz Cloud access to AWS S3, create an IAM policy. This policy should include specific actions and resources to facilitate the transfer of backup files between Zilliz Cloud and your S3 bucket.

For simplicity, create a policy using the JSON editor.

1. Log in to the **AWS Management Console** and open the [IAM console](https://console.aws.amazon.com/iam/).

1. In the console, choose **Policies** > **Create policy**.

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
            "arn:aws:s3:::$bucket",
            "arn:aws:s3:::$bucket/*"
          ]
        }
      ]
    }
    ```

    <Admonition type="info" icon="📘" title="Notes">

    <p><code>$bucket</code> should be replaced with the actual name of your S3 bucket.</p>

    </Admonition>

1. On the **Review and create** page, enter a **Policy Name** (e.g. `policy-for-backup`) and a **Description** (optional) for the policy that you are creating, and review **Permissions defined in this policy**. Remember the policy name, as you will need it for future steps.

1. Choose **Create policy** to save your new policy. Once completed, proceed to [step 4](./integrate-with-aws-s3).

![integrate-with-aws-3](/img/integrate-with-aws-3.png)

## Step 4: Create IAM role{#step-4-create-iam-role}

1. In the IAM console, choose **Roles** > **Create role**.

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

1. In the **Name, review, and create** step, enter a role name and review the settings. Then, click **Create role**.

    ![integrate-with-aws-4](/img/integrate-with-aws-4.png)

1. Go to the details page of the created role, copy the **ARN** corresponding to the role. This will be required on Zilliz Cloud.

1. Return to the [Zilliz Cloud console](https://cloud.zilliz.com/login). Enter **Role ARN** in the **Create IAM Role** step. Then, proceed to finalizing the configuration.

    ![integrate-with-aws-5](/img/integrate-with-aws-5.png)

## Step 5: Validate and create integration{#step-5-validate-and-create-integration}

1. In the [Zilliz Cloud console](https://cloud.zilliz.com/login), click **Validate Integration** to confirm the S3 bucket and IAM role settings.

1. Once validation is successful, click **Create Integration**.

You can now use this integration to export backup files to your Amazon S3 bucket. For more information, refer to  [Export Backup Files](./export-backup-files).

## Manage integrations{#manage-integrations}

Once the integration is added, you can view its details or remove the integration as needed.

![integrate-with-aws-6](/img/integrate-with-aws-6.png)

### Obtain the integration ID{#obtain-the-integration-id}

If you need to use the RESTful API to export backup files to one of your AWS S3 buckets integrated with Zilliz Cloud, click **View Details** to display the details of an integration and copy its integration ID.

## Troubleshooting{#troubleshooting}

If you encounter issues during the integration process, here are some common error messages and their solutions.

### Bucket region mismatch{#bucket-region-mismatch}

**Description**: The following example error occurs when the region of the S3 bucket does not match the region of your Zilliz Cloud cluster.

```plaintext
"bucket region not match, want[us-west-1] got[us-west-2]"
```

**Solution**:

- Ensure that the AWS region where your S3 bucket is located matches the region of your Zilliz Cloud cluster.

- If needed, create a new bucket in the correct region or adjust your cluster's region to match the bucket’s region.

### Bucket not found{#bucket-not-found}

**Description**: This error occurs when the specified S3 bucket does not exist or the bucket name is incorrect.

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 404, RequestID: ..., HostID: ..., api error NoSuchBucket: The specified bucket does not exis
```

**Solution**:

- Double-check the bucket name in both the Zilliz Cloud console and the AWS S3 console.

- Confirm that the bucket exists and that the name is correctly entered in your Zilliz Cloud configuration.

### Access denied for bucket location{#access-denied-for-bucket-location}

**Description**: This error occurs when the IAM role does not have the required permissions to access the S3 bucket's location.

```plaintext
check bucket failed: get bucket location: operation error S3: GetBucketLocation, https response error StatusCode: 403 ...
```

**Solution**:

- Review the IAM policy attached to the role being used by Zilliz Cloud.

- Ensure the policy includes the `s3:GetBucketLocation` permission along with other necessary permissions, such as `s3:GetObject`, `s3:PutObject`, and `s3:ListBucket`.

### Role assumption failure{#role-assumption-failure}

**Description**: This error occurs when there is an issue with assuming the IAM role due to incorrect role ARN, external ID, or trust policy.

```sql
try assume role from[zilliz-role] to [arn:aws:iam::041623484421:role/testoss121703] with externalId[zilliz-external-1umVCIK7q96kzDE] failed
```

**Solution**:

- Verify that the role ARN and external ID on the Zilliz Cloud console match the corresponding values in the IAM trust policy.

- Ensure that the trust policy in the IAM role allows Zilliz Cloud to assume the role.

