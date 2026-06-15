---
title: "Create a Cross-Account Service Account | BYOC"
slug: /create-cross-account-sa
sidebar_label: "Create a Cross-Account Service Account"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page describes how to create and configure a cross-account service account for Zilliz Cloud to bootstrap your project data plane. This service account grants Zilliz Cloud the necessary permissions to manage VPC resources on your behalf. | BYOC"
type: origin
token: GeaswUCLVi04xQkLl4vc7cbdnVh
sidebar_position: 3
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# Create a Cross-Account Service Account

This page describes how to create and configure a cross-account service account for Zilliz Cloud to bootstrap your project data plane. This service account grants Zilliz Cloud the necessary permissions to manage VPC resources on your behalf.

<Admonition type="info" icon="📘" title="Notes">

Zilliz BYOC is currently available in **General Availability**. For access and implementation details, please contact [Zilliz Cloud sales](https://zilliz.com/contact-sales).

</Admonition>

## Procedures\{#procedures}

You can use the Google Cloud Platform (GCP) dashboard to create the EKS role. Alternatively, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on GCP. For details, refer to [Terraform Provider](./terraform-provider).

### Step 1: Create custom roles\{#step-1-create-custom-roles}

Before creating the cross-account service account, you need create several custom roles that needs to be assigned to the service account.

#### Create an instance group manager custom role\{#create-an-instance-group-manager-custom-role}

You will create an instance group manager custom role and assign the custom role to the service account created above so that the service account has the minimum required permissions to manage GKE nodes.

<Supademo id="cmbgb65fo4klnsn1rfs4be7qd" title=""  />

The steps for creating the instance group manager custom role are as follows:

<Procedures>

1. On the GCP console, find and click **IAM & Admin**.

1. Choose **Roles** from the left navigation pane.

1. Click **Create role**.

1. Set a title and description for the custom role to create.

    In this demo, you can use **Zilliz Cloud Custom Role for GKE Management**.

1. Change **Role launch stage** from **Alpha** to **General Availability**.

1. Click **Add permissions**. The permissions to add in this step are as follows:

    - **compute.instanceGroupManagers.get**

    - **compute.instanceGroupManagers.update**

1. Click **Create**.

</Procedures>

#### Create an IAM custom role\{#create-an-iam-custom-role}

You will create an IAM custom role and assign the custom role to the service account created above so that the service account has the minimum required permissions to manage IAM policies.

<Supademo id="cmbri7b73cdexsn1r99xrvvfd" title=""  />

The steps for creating a custom role are as follows:

<Procedures>

1. On the GCP console, find and click **IAM & Admin**.

1. Choose **Roles** from the left navigation pane.

1. Click **Create role**.

1. Set a title and description for the custom role to create.

    In this demo, you can use **IAM custom role**.

1. Change **Role launch stage** from **Alpha** to **General Availability**.

1. Click **Add permissions**. The permissions to add in this step are as follows:

    - **iam.serviceAccounts.getIamPolicy**

    - **iam.serviceAccounts.setIamPolicy**

1. Click **Create**.

</Procedures>

### Step 2: Create a service account\{#step-2-create-a-service-account}

In this step, you will create a service account for Zilliz Cloud to manage VPC resources on your behalf and paste the service account email address back to Zilliz Cloud console.

<Supademo id="cmc1pq4ikjo9nsn1rzuxbs1p0" title=""  />

The steps for creating a service account are as follows:

<Procedures>

1. On the GCP console, find and click **IAM & Admin**.

1. Choose **Service Accounts** on the left navigation pane.

1. Click **Create service account**.

1. Set a proper name for the service account to create.

    In this demo, you can set it to `your-org-cross-account-sa`. The service account ID is the first 18 characters of the service account name. You can manually set it to a proper value.

1. Click **Create and continue**.

1. In the **Permissions** section, add the custom roles created in the previous steps and several GCP-managed roles to the service account.

    The following table lists the roles to be assigned to the service account.

    | Role | Type | Condition |
    | --- | --- | --- |
    | [Instance group manager custom role](./create-cross-account-sa) | Custom | `resource.name.extract("projects/<name>").startsWith("PROJECT_ID") &&resource.name.extract("zones/<name>").startsWith("REGION") &&resource.name.extract("instanceGroupManagers/<name>").startsWith("gke-CLUSTER_NAME")` |
    | [IAM custom role](./create-cross-account-sa) | Custom | `api.getAttribute("iam.googleapis.com/modifiedGrantsByRole", []).hasOnly(["roles/iam.workloadIdentityUser"])` |
    | Kubernetes Engine Admin | GCP-managed | N/A |
    | Storage Object Viewer | GCP-managed | `resource.name.startsWith("projects/_/buckets/YOUR_BUCKET_NAME")` |

    <Admonition type="info" icon="📘" title="Notes">

    You need to replace the three placeholders in the above expression with actual values:
    
    - `PROJECT_ID`
    
        This should be your GCP project ID.
    
    - `REGION`
    
        This should be the cloud region of your BYOC project.
    
    - `CLUSTER_NAME`
    
        This should be the name of the GKE cluster that Zilliz Cloud will create on your behalf. 
    
        Note that Google Cloud will add a prefix `gke-` in front of your cluster name. Therefore, you should keep the `gke-` prefix in the condition, and just replace `CLUSTER_NAME` with the actual name.
    
    - `YOUR_BUCKET_NAME` 
    
        This should be the name of the bucket created in the previous step.

    </Admonition>

1. Click **Save**.

</Procedures>

#### Grant access to other service accounts\{#grant-access-to-other-service-accounts}

You will grant the cross-account service account created in the previous step access to several other service accounts.

<Supademo id="cmbq9hdfjbatwsn1rv37dqcnr" title=""  />

Follow the steps below to grant the cross-account service account access to these service accounts.

<Procedures>

1. On the GCP console, find and click **Service Account**.

1. Find and click the following service accounts in the list.

    |  | Description |
    | --- | --- |
    | `PROJECT_NUMBER-compute@developer.gserviceaccount.com` | This service account is automatically created when you enable the Compute Engine API. |

    <Admonition type="info" icon="📘" title="Notes">

    A GCP project has a project ID and a project number: A project ID is a string you have entered when you create the project on the GCP console, while a project number is a string that GCP allocates to the project upon its creation.
    
    You need to replace `PROJECT_NUMBER` with your own GCP project number.

    </Admonition>

1. Switch to the **Principals with access** tab and click **Grant access**.

1. Enter the cross-account service account created in the previous step in **Add principals** > **New principals**.

1. Select **Service Account User** in **Assign roles** > **Role**.

</Procedures>

#### Impersonate Zilliz Cloud's service account\{#impersonate-zilliz-clouds-service-account}

You will have the cross-account service account to impersonate Zilliz Cloud's service account provided on the Zilliz Cloud console.

<Supademo id="cmbhbv9xj5iuasn1rj0od2qzt" title=""  />

The steps for impersonating the service account that Zilliz Cloud provides are as follows:

<Procedures>

1. On the Zilliz Cloud console, copy the service account Zilliz Cloud provides.

1. Go to the GCP console, find and click **IAM & Admin**.

1. Choose **Service Accounts** in the left navigation pane.

1. Filter your cross-account service account and click its name to view its details.

1. Switch to the **Principals with access** tab and click **Grant access**.

1. Paste the service account copied from the Zilliz Cloud console in **Add principals** > **New principals**.

1. Select **Service Account Token Creator** in **Assign roles** > **Role**.

1. Click **Save**.

</Procedures>