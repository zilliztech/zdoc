---
title: "Create Cloud Storage Bucket and Service Account | BYOC"
slug: /create-bucket-and-service-account
sidebar_label: "Create Cloud Storage Bucket and Service Account"
beta: CONTACT SALES
notebook: FALSE
description: "This page describes the procedure for creating and configuring the root storage for your Bring-Your-Own-Cloud (BYOC) project with proper permissions. | BYOC"
type: origin
token: RymGwWsFMi3VV1kXGmHckc2WnKc
sidebar_position: 1
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Video deduplication
  - Video similarity search
  - Vector retrieval
  - Audio similarity search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Create Cloud Storage Bucket and Service Account

This page describes the procedure for creating and configuring the root storage for your Bring-Your-Own-Cloud (BYOC) project with proper permissions.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## Best practices for the Cloud Storage bucket{#best-practices-for-the-cloud-storage-bucket}

The bucket you specify during the project deployment will be used as the root storage for the clusters created in the project. Before you create a Cloud Storage bucket, review the following best practices:

- The bucket must be in the same Google Cloud Platform (GCP) region as the project deployment.

- All clusters in a project share the Cloud Storage bucket created during the project deployment. Zilliz Cloud recommends using a Cloud Storage bucket dedicated to the project and not sharing it with other services and resources.

## Procedure{#procedure}

You can use the GCP dashboard to create the bucket and service account. Alternatively, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on GCP. For details, refer to [Terraform Provider](./terraform-provider).

### Step 1: Create a Cloud Storage bucket{#step-1-create-a-cloud-storage-bucket}

In this step, you will create a Cloud Storage bucket on GCP for the BYOC project deployment. If you prefer to use an existing bucket, ensure that the bucket is in the same region as the BYOC project. Once it is created, enter the bucket name in **Storage settings** on the Zilliz Cloud console.

<Supademo id="cmbg4ro374d54sn1rdnv6ca32" title=""  />

The steps to create a bucket are as follows:

1. On the GCP console, find and click **Cloud Storage**.

1. Click **Create bucket**.

    In this demo, you can set it to `zilliz-byoc-your-org-bucket`, or follow your naming conventions.

1. Set a descriptive name for the bucket to create.

1. Select **Region** in **Location type** to ensure the lowest latency within the single region, and select the region of your BYOC project in the drop-down list that appears.

    In this demo, you can set it to `us-west (Oregon)`. Ensure that this value is the same as the one of your BYOC project.

1. Click **Continue**.

1. In **Access control**, select **Fine-grained** to enable fine-grained public access prevention.

1. Click **Continue**.

1. Keep the default settings, and click **Create**.

1. Click **Confirm** in the prompted dialog box to confirm the prevention of public access to the bucket to create.

### Step 2: Create a service account to access the bucket{#step-2-create-a-service-account-to-access-the-bucket}

In this step, you will create a service account, associate several roles with the service account, and provide the service account to Zilliz Cloud so that Zilliz Cloud can access the bucket created above.

<Supademo id="cmc1mg9bvjk4bsn1r8awkyndh" title=""  />

The steps to create the storage service account are as follows:

1. On the GCP console, find and click **IAM & Admin**.

1. Choose **Service Accounts** in the left navigation pane.

1. Click **Create service account**.

1. Set a name for the service account to create. 

    In this demo, you can set it to `your-org-storage-sa`. The service account ID should be the first 18 characters of the service account name. You can manually set it to a proper value.

1. Click **Create and continue**.

1. In **Permissions**, add two roles with conditions.

    1. Select **Storage Object Admin** from the drop-down list.

    1. Click **Add IAM condition**, set the condition title, and put the following condition in the **Condition editor**.

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="Notes">

        <p>You should replace <code>YOUR_BUCKET_NAME</code> with the name of the bucket created in the previous step.</p>

        </Admonition>

    1. Click **Save**.

    1. Click **Add another role**.

    1. Select **Storage Bucket Viewer** from the drop-down list.

    1. Click **Add IAM condition**, set the condition title, and put the following condition in the **Condition editor**.

        ```json
        resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")
        ```

        <Admonition type="info" icon="📘" title="Notes">

        <p><strong>Condition builder</strong> and <strong>Condition editor</strong> are equivalent ways to set conditions. In either case, you should replace <code>YOUR_BUCKET_NAME</code> with the name of the bucket created in the previous step.</p>

        </Admonition>

    1. Click **Save**

1. Click **Done**.

