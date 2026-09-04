---
title: "Integrate with Amazon S3 | BYOC"
slug: /integrate-with-aws-s3
sidebar_label: "AWS S3"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page explains how to authorize a Zilliz Cloud AWS BYOC or BYOC-I project to access an external Amazon S3 bucket. You create a customer-managed IAM policy and role in the AWS account that owns the bucket, then register the role in Zilliz Cloud. | BYOC"
type: origin
token: FuX7w7cfZisGBmk8chnco3msnud
sidebar_position: 4
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Integrate with Amazon S3

This page explains how to authorize a Zilliz Cloud AWS BYOC or BYOC-I project to access an external Amazon S3 bucket. You create a customer-managed IAM policy and role in the AWS account that owns the bucket, then register the role in Zilliz Cloud.

<Admonition type="info" icon="📘" title="Notes">

The policy and trust-policy examples on this page contain placeholders. When configuring AWS, copy the JSON generated in the Zilliz Cloud console. It contains the correct bucket name, trusted AWS principal, and unique external ID for your BYOC project.

</Admonition>

## Access flow\{#access-flow}

![JzmcwFXZ6hdb3IbEoAEc6lFYnRd](https://zdoc-images.s3.us-west-2.amazonaws.com/JzmcwFXZ6hdb3IbEoAEc6lFYnRd.png)

## Before you start\{#before-you-start}

Ensure that:

- Your AWS BYOC or BYOC-I data plane is running.

- You have Organization Owner or Project Admin access to the Zilliz Cloud project.

- You can create IAM policies and roles in the AWS account that owns the external S3 bucket.

- You can update the IAM permission policy attached to the selected BYOC data plane's storage role.

- The S3 bucket is in the same AWS Region as the BYOC data plane that will use the integration.

<Admonition type="info" icon="📘" title="Notes">

A bucket integration is Region-specific. If your project has data planes in multiple Regions, create a separate bucket and integration for each Region.

</Admonition>

## Step 1: Start the integration in Zilliz Cloud\{#step-1-start-the-integration-in-zilliz-cloud}

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com).

1. Open your BYOC project and select **Integrations** in the left navigation.

1. Under **Amazon S3**, click **+ Integration**.

1. Enter a unique **Integration Name** and, optionally, an **Integration Description**.

1. Select the bucket permission that matches how you will use the integration.

    | Bucket permission | Use for | Granted access |
    | --- | --- | --- |
    | **Read only** | External volumes and external collections | `s3:GetObject`, `s3:ListBucket`, and `s3:GetBucketLocation` |
    | **Read write** | Backup export, audit log forwarding, and access log forwarding | Read-only actions plus `s3:PutObject` |

</Procedures>

## Step 2: Specify the external S3 bucket\{#step-2-specify-the-external-s3-bucket}

<Procedures>

1. In **Region**, select the Region of the BYOC data plane that will access the bucket.

1. Confirm in the [Amazon S3 console](https://s3.console.aws.amazon.com/s3/home) that the external bucket is in the same Region.

1. In **Bucket Name**, enter only the bucket name. Do not include `s3://`, an object prefix, or a trailing slash.

1. Click **Next**. Zilliz Cloud generates a bucket-scoped IAM policy.

</Procedures>

## Step 3: Create the IAM permission policy\{#step-3-create-the-iam-permission-policy}

<Procedures>

1. In the Zilliz Cloud **Create IAM Policy** step, copy the generated JSON.

1. Open [IAM > Policies](https://us-east-1.console.aws.amazon.com/iam/home#/policies) in the AWS account that owns the bucket.

1. Click **Create policy**, select the **JSON** editor, and paste the generated policy.

1. Click **Next**, give the policy a recognizable name, such as `ZillizBucketIntegration-my-bucket`, and create it.

</Procedures>

The following examples show the policies generated for each permission level.

### Read-write policy\{#read-write-policy}

```plaintext
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
        "arn:aws:s3:::<BUCKET_NAME>",
        "arn:aws:s3:::<BUCKET_NAME>/*"
      ]
    }
  ]
}
```

### Read-only policy\{#read-only-policy}

```plaintext
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "Statement1",
      "Effect": "Allow",
      "Action": [
        "s3:GetObject",
        "s3:ListBucket",
        "s3:GetBucketLocation"
      ],
      "Resource": [
        "arn:aws:s3:::<BUCKET_NAME>",
        "arn:aws:s3:::<BUCKET_NAME>/*"
      ]
    }
  ]
}
```

<Admonition type="info" icon="📘" title="Notes">

If the bucket uses server-side encryption with a customer-managed AWS KMS key, also grant the role the required KMS permissions and allow the role in the KMS key policy. For a write workflow, the policy generated by the current console may need an additional `kms:GenerateDataKey` permission on that key.

</Admonition>

## Step 4: Create the IAM role and trust policy\{#step-4-create-the-iam-role-and-trust-policy}

<Procedures>

1. Return to Zilliz Cloud and click **Next** to open **Create IAM Role**.

1. Copy the generated custom trust policy. It contains the AWS principal for the selected BYOC data plane and a unique external ID.

1. In the bucket owner's AWS account, open [IAM > Roles](https://us-east-1.console.aws.amazon.com/iam/home#/roles) and click **Create role**.

1. Select **Custom trust policy**, paste the generated JSON, and click **Next**.

1. Attach the permission policy created in step 3.

1. Enter a role name, such as `ZillizBucketIntegrationRole`, review the configuration, and create the role.

    ```plaintext
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Effect": "Allow",
          "Action": "sts:AssumeRole",
          "Principal": {
            "AWS": "<ZILLIZ_BYOC_AWS_PRINCIPAL>"
          },
          "Condition": {
            "StringEquals": {
              "sts:ExternalId": "<ZILLIZ_GENERATED_EXTERNAL_ID>"
            }
          }
        }
      ]
    }
    ```

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

The external ID binds the role to this integration and protects the cross-account trust relationship. Copy both the principal and external ID exactly as displayed in Zilliz Cloud.

</Admonition>

## Step 5: Allow the BYOC storage role to assume the customer role\{#step-5-allow-the-byoc-storage-role-to-assume-the-customer-role}

The customer role's trust policy is only one side of the authorization. The selected data plane's storage role must also have an identity-based policy that allows `sts:AssumeRole` on the new customer role.

The role name typically ends with `-storage-role`. Locate the exact role ARN in Zilliz Cloud:

<Procedures>

1. Open your project, and click **Data Planes** in the left navigation.

1. Click the data plane that will use the bucket integration to open **View Data Plane Details**.

    ![Open the data plane that will use the external bucket.](https://zdoc-images.s3.us-west-2.amazonaws.com/open-the-data-plane-that-will-use-the-external-bucket.png "Open the data plane that will use the external bucket.")

1. Scroll to **Credential Settings > Storage**.

1. Copy the complete **IAM Role ARN**. Use this ARN even if the role name does not end with `-storage-role`.

    ![The IAM Role ARN under Credential Settings > Storage is the data plane storage role.](https://zdoc-images.s3.us-west-2.amazonaws.com/the-iam-role-arn-under-credential-settings-greater-storage-is-the-data-plane-storage-role.png "The IAM Role ARN under Credential Settings > Storage is the data plane storage role.")

1. In the AWS account that contains the BYOC data plane, open the IAM role identified by that ARN.

1. Create or update a customer-managed permission policy attached to that storage role.

1. Set `Resource` to the exact role ARN created in step 4. Do not use `*`.

    ```json
    {
      "Version": "2012-10-17",
      "Statement": [
        {
          "Sid": "AllowAssumeExternalBucketRole",
          "Effect": "Allow",
          "Action": "sts:AssumeRole",
          "Resource": "<CUSTOMER_BUCKET_ROLE_ARN>"
        }
      ]
    }
    ```

    <Admonition type="info" icon="📘" title="Both policies are required">

    The storage role's permission policy must allow the call, and the customer role's trust policy must trust the caller with the correct external ID. Missing either side causes role assumption to fail.

    </Admonition>

</Procedures>

## Step 6: Validate and add the integration\{#step-6-validate-and-add-the-integration}

<Procedures>

1. On the AWS role details page, copy the role ARN. It has the following format: `arn:aws:iam::<BUCKET_ACCOUNT_ID>:role/<ROLE_NAME>`.

1. Return to Zilliz Cloud and paste the ARN into **Role ARN**.

1. Click **Validate Integration**.

1. When the status changes to **Successful**, click **Add**. The Amazon S3 integration is now available to supported workflows in the same Zilliz Cloud project and Region.

</Procedures>

## Security recommendations\{#security-recommendations}

- Create a dedicated IAM role for each bucket integration.

- On the BYOC storage role, grant `sts:AssumeRole` only on the exact customer role ARN.

- Keep the policy scoped to the exact bucket and choose **Read only** unless the workflow must write objects.

- Keep S3 Block Public Access enabled. Bucket integration does not require public bucket access.

- Do not add long-lived AWS access keys to Zilliz Cloud. Access is obtained by assuming the customer role with temporary STS credentials.

- If an organization-level service control policy, permissions boundary, S3 bucket policy, or KMS key policy applies, ensure it does not deny the actions granted to this role.

## Troubleshooting\{#troubleshooting}

| Validation result | Likely cause | What to check |
| --- | --- | --- |
| `bucket region not match` | The bucket and selected BYOC data plane are in different Regions. | Select the matching Region or use a bucket in the data plane's Region. |
| `NoSuchBucket` | The bucket name is incorrect or the bucket no longer exists. | Enter only the exact bucket name, without `s3://` or a path. |
| `AccessDenied` for `GetBucketLocation` | The IAM permission policy is missing, not attached, or blocked by another AWS policy. | Confirm the role has `s3:GetBucketLocation` on the bucket and review permission boundaries, bucket policies, and service control policies. |
| Role assumption failed | The storage role lacks `sts:AssumeRole`, or the role ARN, trusted principal, or external ID does not match. | Check both sides: the storage role's identity policy must allow the customer role ARN, and the customer role's trust policy must contain the generated principal and external ID. |
