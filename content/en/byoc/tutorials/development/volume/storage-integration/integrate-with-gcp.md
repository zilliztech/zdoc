---
title: "Integrate with Google Cloud Storage | BYOC"
slug: /integrate-with-gcp
sidebar_label: "Google Cloud Storage"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page explains how to authorize a Zilliz Cloud GCP BYOC or BYOC-I data plane to access an external Google Cloud Storage bucket. You create a bucket-scoped custom IAM role and grant it directly to the data plane's storage Google service account (GSA). | BYOC"
type: origin
token: Q8LHwWmyjiPOQJkpDq8cU3bxnwg
sidebar_position: 6
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Integrate with Google Cloud Storage

This page explains how to authorize a Zilliz Cloud GCP BYOC or BYOC-I data plane to access an external Google Cloud Storage bucket. You create a bucket-scoped custom IAM role and grant it directly to the data plane's storage Google service account (GSA).

<Admonition type="info" icon="📘" title="Notes">

The Zilliz Cloud integration wizard displays the exact Google Cloud Service Account email to authorize. This is the storage GSA for the selected data plane. Grant that displayed principal bucket-level access; do not create, download, or upload a long-lived service account key.

</Admonition>

## Access flow\{#access-flow}

![T5GSwOpAnhKfNFbe5Zbc3t9Xneb](https://zdoc-images.s3.us-west-2.amazonaws.com/T5GSwOpAnhKfNFbe5Zbc3t9Xneb.png)

## Before you start\{#before-you-start}

Ensure that:

- Your GCP BYOC or BYOC-I data plane is running.

- You have Organization Owner or Project Admin access to the Zilliz Cloud project.

- You can create a project-level custom IAM role in the Google Cloud project that owns the bucket.

- You can update the IAM policy on the target Cloud Storage bucket.

- The bucket uses a single Region that matches the selected BYOC data plane Region.

<Admonition type="info" icon="📘" title="Notes">

A bucket integration is Region-specific. Multi-region and dual-region buckets do not match a single BYOC data plane Region. Use a regional bucket in the data plane's Region.

</Admonition>

## Step 1: Start the integration in Zilliz Cloud\{#step-1-start-the-integration-in-zilliz-cloud}

<Procedures>

1. Log in to the [Zilliz Cloud console](https://cloud.zilliz.com).

1. Open your GCP BYOC project and select **Integrations** in the left navigation.

1. Under **Google Cloud Storage**, click **+ Integration**.

1. Enter a unique **Integration Name** and, optionally, an **Integration Description**.

1. Click **Next**.

</Procedures>

## Step 2: Create a custom Cloud Storage role\{#step-2-create-a-custom-cloud-storage-role}

<Procedures>

1. In the Google Cloud console, select the project that owns the external bucket.

1. Open [IAM & Admin > Roles](https://console.cloud.google.com/iam-admin/roles) and click **+ Create role**.

1. Enter a title such as `Zilliz Bucket Integration`, add the following permissions, and create the role.    

    ```plaintext
    storage.buckets.get
    storage.objects.create
    storage.objects.list
    storage.objects.get
    ```

    | Permission | Purpose |
    | --- | --- |
    | `storage.buckets.get` | Read bucket metadata and validate its location. |
    | `storage.objects.get` | Read objects for external volumes and other read workflows. |
    | `storage.objects.list` | List objects and prefixes in the bucket. |
    | `storage.objects.create` | Write new objects for export and log-forwarding workflows. |

</Procedures>

## Step 3: Specify the external Cloud Storage bucket\{#step-3-specify-the-external-cloud-storage-bucket}

<Procedures>

1. Return to Zilliz Cloud and click **Next**.

1. In **Region**, select the Region of the BYOC data plane that will access the bucket.

1. In the [Cloud Storage Buckets](https://console.cloud.google.com/storage/browser) page, confirm that the target bucket uses the same Region.

1. In **Bucket Name**, enter only the bucket name. Do not include `gs://`, an object prefix, or a trailing slash.

1. Click **Next**.

</Procedures>

## Step 4: Grant the BYOC storage GSA access\{#step-4-grant-the-byoc-storage-gsa-access}

<Procedures>

1. On the target bucket's details page, open the **Permissions** tab.

1. Select **View by principals** and click **+ Grant access**.

1. In step 4 of the Zilliz Cloud integration wizard, copy the displayed **Google Cloud Service Account** email and paste it into **New principals**. This displayed account is the storage GSA.

1. Under **Assign roles**, select the custom role created in step 2.

1. Click **Save**.

    ```plaintext
    Principal
    <BYOC_STORAGE_SERVICE_ACCOUNT>@<BYOC_PROJECT_ID>.iam.gserviceaccount.com
    
    Role
    projects/<BUCKET_PROJECT_ID>/roles/<CUSTOM_ROLE_ID>
    
    Scope
    Target Cloud Storage bucket
    ```

    ![Copy the Google Cloud Service Account displayed in the Grant Access to Bucket step. The value shown in your integration is the source of truth.](https://zdoc-images.s3.us-west-2.amazonaws.com/copy-the-google-cloud-service-account-displayed-in-the-grant-access-to-bucket-step-the-value-shown-in-your-integration-is-the-source-of-truth.png "Copy the Google Cloud Service Account displayed in the Grant Access to Bucket step. The value shown in your integration is the source of truth.")

</Procedures>

<Admonition type="info" icon="📘" title="Notes">

Do not derive the email from a naming convention or substitute the GKE node service account, management service account, booter service account, or a Kubernetes service account. Copy the value displayed for the current integration.

</Admonition>

## Step 5: Validate and add the integration\{#step-5-validate-and-add-the-integration}

<Procedures>

1. Return to Zilliz Cloud and click **Validate Integration**.

1. If you granted the role recently, allow time for Google Cloud IAM propagation and retry validation.

1. When the status changes to **Successful**, click **Add**. The Google Cloud Storage integration is now available to supported workflows in the same Zilliz Cloud project and Region.

</Procedures>

## Security recommendations\{#security-recommendations}

- Create a dedicated custom role for bucket integrations and keep it limited to the four listed permissions.

- Grant the role on the target bucket rather than at project or organization scope.

- Keep Public Access Prevention enabled unless another workload has an explicit requirement.

- Do not create a service account key. The data plane uses its storage GSA through GKE Workload Identity.

- If an organization policy, IAM deny policy, VPC Service Controls perimeter, or Cloud KMS policy applies, ensure it permits the required data path.

## Troubleshooting\{#troubleshooting}

| Validation result | Likely cause | What to check |
| --- | --- | --- |
| `bucket region not match` | The bucket location differs from the selected BYOC data plane Region. | Use a regional bucket in the exact data plane Region. |
| `verify bucket access failed` | The service account cannot read bucket metadata. | Confirm the custom role contains `storage.buckets.get` and is granted on the correct bucket. |
| Principal not found | The displayed storage GSA email was copied incorrectly or belongs to a different integration. | Copy the Google Cloud Service Account again from step 4 of the current Zilliz Cloud integration wizard and retry the IAM grant. |
| Integration validates but a later workflow cannot read or write | An object permission is missing or blocked by another policy. | Check `storage.objects.get`, `storage.objects.list`, and `storage.objects.create`, plus organization deny and KMS policies. |
