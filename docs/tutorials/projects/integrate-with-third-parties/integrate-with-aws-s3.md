---
title: "Integrate with AWS S3 | Cloud"
slug: /integrate-with-aws-s3
sidebar_key: integrate-with-aws-s3
sidebar_label: "AWS S3"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: FALSE
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

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Integrate with AWS S3

Zilliz Cloud allows you to integrate with Amazon Simple Storage Service (Amazon S3) to export backup files or audit logs to designated S3 buckets.

![BUEcwkZiChJrTlbziBMc3V49nFe](https://zdoc-images.s3.us-west-2.amazonaws.com/BUEcwkZiChJrTlbziBMc3V49nFe.png)

## Before you start\{#before-you-start}

- To integrate Zilliz Cloud with AWS S3, you must have **Organization Owner** or **Project Admin** access to the project. If you do not have necessary permissions, contact your Zilliz Cloud Organization Owner.

- You have administrative access to the AWS Management Console.

## Step 1: Start integration in Zilliz Cloud console\{#step-1-start-integration-in-zilliz-cloud-console}

<Supademo id="cmeibltu49co2h3pytvtdthb2" title=""  />

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com/login).

1. On your project page, navigate to **Integrations** from the left-side navigation pane.

1. Under the **Amazon S3** section, click **+ Integration**.

1. In the dialog box that appears, configure **Basic Settings**:

    - **Integration Name**: A unique name for this integration (e.g., `integration_0819`).

    - **Integration Description** *(optional)*: A description for this integration (e.g., `for export backupfile`).

    - **Bucket Permission**: Select the level of access Zilliz Cloud has to your S3 bucket. The following table explains the options.

        <table>
           <tr>
             <th><p><strong>Permission</strong></p></th>
             <th><p><strong>Description</strong></p></th>
           </tr>
           <tr>
             <td><p>Read only</p></td>
             <td><p>Zilliz Cloud can only read files from the bucket. Use for <a href="./external-volume">external volumes</a> that back external collections.</p></td>
           </tr>
           <tr>
             <td><p>Read write</p></td>
             <td><p>Zilliz Cloud can both read from and write to the bucket. Use for <a href="./export-backup-files">backup export</a>, <a href="./audit-logs">audit log forwarding</a>, or <a href="./configure-access-logs">access log forwarding</a>.</p></td>
           </tr>
        </table>

1. Click **Next**. You'll be redirected to the **Create Amazon S3 Bucket** step:

    1. In the **Zilliz Cloud Cluster** **Region** field, select the cloud region where your Zilliz Cloud cluster or external volume resides. The bucket you create later must be in the same region as your Zilliz Cloud cluster or volume.

    1. Open the [S3 console](https://us-west-2.console.aws.amazon.com/s3/buckets) and proceed to [step 2](./integrate-with-aws-s3).

</Procedures>

## Step 2: Create S3 bucket in AWS console\{#step-2-create-s3-bucket-in-aws-console}

<Supademo id="cmeibt2wt9cx1h3pyrojdocrn" title="Step 2: Create S3 bucket (1)" />

<Procedures>

1. In the upper-right corner of the [Amazon S3 console](https://console.aws.amazon.com/s3/), choose the AWS region that matches the region of your Zilliz Cloud cluster or external volume.

    <Admonition type="info" icon="📘" title="Notes">

    - The AWS region to create a bucket should be consistent with the region where your Zilliz Cloud cluster or external volume resides. For Zilliz Cloud-supported regions, refer to [Cloud Providers & Regions](./cloud-providers-and-regions).

    - For clusters running in different regions, create separate integrations for each region to ensure backup files or audit logs can be exported properly.

    </Admonition>

1. In the left navigation pane, choose **General purpose buckets**, and then click **Create bucket**.

1. Configure bucket settings:

    1. Under **Bucket type**, choose **General purpose**.

    1. For **Bucket name**, enter a name for your bucket (e.g., `zilliz-bucket-for-integration-0819`). Remember this bucket name, as you will need it for future steps.

    1. Keep other settings as default and click **Create bucket**.

    For more information, refer to [Creating a bucket](https://docs.aws.amazon.com/AmazonS3/latest/userguide/create-bucket-overview.html).

</Procedures>

Once the bucket is created, go back to the [Zilliz Cloud console](https://cloud.zilliz.com/login), and do the following:

<Supademo id="cmeibwrd19d3xh3pyx4h7r3d4" title="Step 2: Create S3 bucket (2)" />

<Procedures>

1. In the **Bucket Name** field, enter the name of the bucket you just created (in this example, `zilliz-bucket-for-integration-0819`). Then, click **Next**.

1. In the **Create IAM Policy** step, copy the JSON policy. It will be required in [step 3](./integrate-with-aws-s3).

1. Once completed, open the [IAM console](https://console.aws.amazon.com/iam/) and proceed to [step 3](./integrate-with-aws-s3).

</Procedures>

## Step 3: Create IAM policy in AWS console\{#step-3-create-iam-policy-in-aws-console}

To give Zilliz Cloud access to AWS S3, create an IAM policy. This policy should include specific actions and resources to facilitate the transfer of backup files between Zilliz Cloud and your S3 bucket.

<Supademo id="cmeibzhk09d4rh3pyaipwhqi7" title="Step 3: Create IAM policy (1)" />

For simplicity, create a policy using the JSON editor.

<Procedures>

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

    - `<bucket>` should be replaced with the actual name of your S3 bucket.

    - `<region>`, `<account_id>`, and `<key_id>` should be replaced with their actual values. For details, refer to [Key identifiers](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html#key-id) in AWS docs.

    </Admonition>

1. On the **Review and create** page, enter a **Policy Name** (e.g. `zilliz-policy-for-integration-0819`) and a **Description** (optional) for the policy that you are creating, and review **Permissions defined in this policy**. Remember the policy name, as you will need it for future steps.

1. Choose **Create policy** to save your new policy. Once completed, proceed to [step 4](./integrate-with-aws-s3).

</Procedures>

## Step 4: Create IAM role\{#step-4-create-iam-role}

Before creating an IAM role in AWS console, do the following in the Zilliz Cloud console:

<Supademo id="cmeic3fab9dajh3pyzp50jnck" title="Step 4: Create IAM role (1)" />

<Procedures>

1. In the Zilliz Cloud console, click **Next** to proceed to the **Create IAM Role** step.

1. In **Select trusted entity**, copy the JSON content, then go to the [IAM console](https://console.aws.amazon.com/iam/).

</Procedures>

Once that's done, do the following to create an IAM role:

<Supademo id="cmeic6bis9dgth3pybfmk8143" title="Step 4: Create IAM role (2)" />

<Procedures>

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

    `965570967084` and `my-external-id` should be replaced with the actual AWS account ID and external ID shown in the **Create IAM Role** step on the Zilliz Cloud console.

    </Admonition>

1. Under **Permissions policies** of the **Add permissions** step, search for and select the policy you created in [step 3](./integrate-with-aws-s3) to add permissions. Then, click **Next**.

1. In the **Name, review, and create** step, enter a role name (e.g. `zilliz-integration-role-0819`) and review the settings. Then, click **Create role**.

1. Go to the details page of the created role, copy the **ARN** corresponding to the role. This will be required in Zilliz Cloud console in [step 5](./integrate-with-aws-s3#step-5-validate-and-add-integration).

</Procedures>

## Step 5: Validate and add integration\{#step-5-validate-and-add-integration}

<Supademo id="cmeicbdyz9dprh3py2wwbguvn" title="Step 5: Validate and add integration" />

<Procedures>

1. In the **Create IAM Role** step of the [Zilliz Cloud console](https://cloud.zilliz.com/login), paste the **ARN** you copied from the IAM console in the previous step.

1. Then, click **Validate Integration** to confirm the S3 bucket and IAM role settings.

1. Once the status changes to **Successful**, the integration works. Then, click **Add**.

</Procedures>

You can now use this integration to export backup files or forward audit logs to your Amazon S3 bucket. For more information, refer to  [Export Backup Files](./export-backup-files) or [Audit Logging](./audit-logs).

## Create storage integration programmatically\{#create-storage-integration-programmatically}

As an alternative to working on Zilliz Cloud console, you can also programmatically create the storage integration.

<Procedures>

1. Create an S3 bucket.

    For details, refer to [Create S3 bucket in AWS console](./integrate-with-aws-s3#step-2-create-s3-bucket-in-aws-console) above or the [CreateBucket](https://docs.aws.amazon.com/AmazonS3/latest/API/API_CreateBucket.html) API doc.

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
        "regionId": "aws-us-west-2",
        "bucketName": "my-bucket"
    }'
    ```

    The above request generates the necessary credentials for you to create permissions, policies and roles on the AWS console. 

    A possible response is as follows:

    ```bash
    {
      "code": 0,
      "data": {
        "readonly": "{...}",
        "readwrite": "{...}",
        "iamPolicy": "{...}",
        "trustPolicy": "{...}",
        "zillizAccount": "306787409409",
        "externalId": "zilliz-external-AbCdEf12345678"
      }
    }
    ```

    For details on parameter descriptions, refer to [Generate Storage Integration Authorization Materials](/reference/restful/generate-storage-integration-authorization-materials-v2).

1. Use the returned `readonly`, `readwrite`, `iamPolicy`, `trustPolicy`, and `zillizAccount` to create an IAM role that has sufficient permissions to operate the bucket. 

    Write down the role ARN, which is similar to `arn:aws:iam::123456789012:role/zilliz-bucket-role`. For details on how to create a role, refer to [Create IAM policy in AWS console](./integrate-with-aws-s3#step-3-create-iam-policy-in-aws-console) and [Create IAM role](./integrate-with-aws-s3#step-4-create-iam-role) above.

1. Validate the obtained credentials.

    In the request, set `externalCred.roleArn` to the role ARN noted in the previous step, and `externalCred.externalId` to the one displayed in the obtained authentication materials.

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations/validate" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "regionId": "aws-us-west-2",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "arn:aws:iam::123456789012:role/zilliz-bucket-role",
            "externalId": "zilliz-external-AbCdEf12345678"
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

    This request shares most parameters with the validation request, except for a description.

    ```bash
    curl --request POST \
    --url "${BASE_URL}/v2/storageIntegrations" \
    --header "Authorization: Bearer ${TOKEN}" \
    --header "Request-Timeout: 5" \
    --header "Content-Type: application/json" \
    -d '{
        "projectId": "proj-xxxxxxxxxxxxxxxxxxxxxx",
        "name": "analytics-s3",
        "description": "S3 bucket for external tables",
        "regionId": "aws-us-west-2",
        "bucketName": "my-bucket",
        "externalCred": {
            "roleArn": "arn:aws:iam::123456789012:role/zilliz-bucket-role",
            "externalId": "zilliz-external-AbCdEf12345678"
        }
    }'
    ```

    The response is similar to the following:

    ```bash
    {
        "code": 0,
        "data": {
            "integrationId": "integ-xxxxxxxxxxxxxxxxxxx",
            "name": "analytics-s3"
        }
    }
    ```

    For details on parameter descriptions, refer to [Create Storage Integration](/reference/restful/create-storage-integration-v2).

</Procedures>

## Manage integrations\{#manage-integrations}

Once the integration is added, you can view its details or remove the integration as needed.

![YODhb5leToWLsjxGRrpcyuZNnPb](https://zdoc-images.s3.us-west-2.amazonaws.com/yodhb5letowlsjxgrrpcyuznnpb.png "YODhb5leToWLsjxGRrpcyuZNnPb")

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
                "name": "analytics-s3",
                "status": "ACTIVE",
                "message": "",
                "regionId": "aws-us-west-2",
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
        "name": "analytics-s3",
        "description": "S3 bucket for external tables",
        "status": "ACTIVE",
        "message": "",
        "regionId": "aws-us-west-2",
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
        "name": "analytics-s3"
    }
}
```

For details on parameter descriptions, refer to [Delete Storage Integration](/reference/restful/delete-storage-integration-v2).

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

