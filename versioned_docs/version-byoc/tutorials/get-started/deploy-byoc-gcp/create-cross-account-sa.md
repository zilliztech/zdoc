---
title: "Create a Cross-Account Service Account | BYOC"
slug: /create-cross-account-sa
sidebar_label: "Create a Cross-Account Service Account"
beta: CONTACT SALES
notebook: FALSE
description: "This page describes how to create and configure a cross-account service account for Zilliz Cloud to bootstrap your project data plane. This service account grants Zilliz Cloud the necessary permissions to manage VPC resources on your behalf. | BYOC"
type: origin
token: GeaswUCLVi04xQkLl4vc7cbdnVh
sidebar_position: 3
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - What is unstructured data
  - Vector embeddings
  - Vector store
  - open source vector database

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Create a Cross-Account Service Account

This page describes how to create and configure a cross-account service account for Zilliz Cloud to bootstrap your project data plane. This service account grants Zilliz Cloud the necessary permissions to manage VPC resources on your behalf.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## Procedures{#procedures}

You can use the Google Cloud Platform (GCP) dashboard to create the EKS role. Alternatively, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on GCP. For details, refer to [Terraform Provider](./terraform-provider).

### Step 1: Create a service account{#step-1-create-a-service-account}

In this step, you will create a service account for Zilliz Cloud to manage VPC resources on your behalf and paste the service account email address back to Zilliz Cloud console.

<Supademo id="cmbgab1q34jjnsn1r4j9hk4pb" title=""  />

The steps for creating a service account are as follows:

1. On the GCP console, find and click **IAM & Admin**.

1. Choose **Service Accounts** on the left navigation pane.

1. Click **Create service account**.

1. Set a proper name for the service account to create.

    In this demo, you can set it to `your-org-cross-account-sa`. The service account ID is the first 18 characters of the service account name. You can manually set it to a proper value.

1. Click **Create and continue**.

1. Keep the default settings for **Permissions** and **Principals**.

1. Click **Done**.

### Step 2: Grant permissions{#step-2-grant-permissions}

In this step, you will assign permissions to the service account created above by linking several roles to the service account. 

#### Create a custom role{#create-a-custom-role}

You will create a custom role and assign the role to the service account created above so that the service account has the minimum required permissions to manage GKE nodes.

<Supademo id="cmbgb65fo4klnsn1rfs4be7qd" title=""  />

The steps for creating a custom role are as follows:

1. On the GCP console, find and click **IAM & Admin**.

1. Choose **Roles** from the left navigation pane.

1. Click **Create role**.

1. Set a title and description for the custom role to create.

1. Change **Role launch stage** from **Alpha** to **General Availability**.

1. Click **Add permissions**. The permissions to add in this step are as follows:

    - **compute.instanceGroupManagers.get**

    - **compute.instanceGroupManagers.update**

1. Click **Create**.

#### Assign roles to the service account{#assign-roles-to-the-service-account}

You will assign the custom role created above with several GCP-managed roles to the cross-account service account.

<Supademo id="cmbhawpc15ia7sn1r90fhwxhi" title=""  />

The steps for assigning roles to the cross-account service account are as follows:

1. On the GCP console, find and click **IAM & Admin**.

1. On the **IAM** page, click **Grant access**.

1. Select the cross-account service account created in the previous step in the **Grant access** pane that moves inward.

1. Add the custom role created in the previous step and two GCP-managed roles to the service account.

    The following table lists the roles to be granted to the service account.

    <table>
       <tr>
         <th><p>Role</p></th>
         <th><p>Type</p></th>
         <th><p>Condition</p></th>
       </tr>
       <tr>
         <td><p><a href="./create-cross-account-sa#create-a-custom-role">Custom role created in </a><a href="./create-cross-account-sa#create-a-custom-role">the </a><a href="./create-cross-account-sa#create-a-custom-role">previous step</a></p></td>
         <td><p>Custom</p></td>
         <td><p>N/A</p></td>
       </tr>
       <tr>
         <td><p>Kubernetes Engine Admin</p></td>
         <td><p>GCP-managed</p></td>
         <td><p>N/A</p></td>
       </tr>
       <tr>
         <td><p>Storage Object Viewer</p></td>
         <td><p>GCP-managed</p></td>
         <td><p><code>resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")</code></p></td>
       </tr>
    </table>

    <Admonition type="info" icon="📘" title="Notes">

    <p>You should replace <code>YOUR_BUCKET_NAME</code> with the name of the bucket created in the previous step.</p>

    </Admonition>

1. Click **Save**.

#### Impersonate Zilliz Cloud's service account{#impersonate-zilliz-clouds-service-account}

You will have the cross-account service account to impersonate Zilliz Cloud's service account provided on the Zilliz Cloud console.

<Supademo id="cmbhbv9xj5iuasn1rj0od2qzt" title=""  />

The steps for impersonating the service account that Zilliz Cloud provides are as follows:

1. On the Zilliz Cloud console, copy the service account Zilliz Cloud provides.

1. Go to the GCP console, find and click **IAM & Admin**.

1. Choose **Service Accounts** in the left navigation pane.

1. Filter your cross-account service account and click its name to view its details.

1. Switch to the **Principals with access** tab and click **Grant access**.

1. Paste the service account copied from the Zilliz Cloud console.

1. Select **Service Account Token Creator** in **Select a role**.

1. Click **Save**.

