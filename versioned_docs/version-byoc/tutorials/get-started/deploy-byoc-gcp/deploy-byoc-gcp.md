---
title: "Deploy BYOC on GCP | BYOC"
slug: /deploy-byoc-gcp
sidebar_label: "Deploy BYOC on GCP"
beta: CONTACT SALES
notebook: FALSE
description: "This page describes how to manually create a fully managed Bring-Your-Own-Cloud (BYOC) data plane in your Google Cloud Platform (GCP) Virtual Private Cloud (VPC) using the Zilliz Cloud console and custom GCP configurations. | BYOC"
type: origin
token: KmYgwHNOFiPQ9sk4bSDcMuIHnjC
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Dense embedding
  - Faiss vector database
  - Chroma vector database
  - nlp search

---

import Admonition from '@theme/Admonition';


# Deploy BYOC on GCP

This page describes how to manually create a fully managed Bring-Your-Own-Cloud (BYOC) data plane in your Google Cloud Platform (GCP) Virtual Private Cloud (VPC) using the Zilliz Cloud console and custom GCP configurations.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## Prerequisites{#prerequisites}

- You must be a BYOC organization owner.

- You have enabled the [required GCP API services](./required-api-services-gcp).

## Procedure{#procedure}

To deploy BYOC on GCP, Zilliz Cloud needs to assume specific roles to access the Cloud Storage bucket and the GKE cluster within a customer-managed VPC on your behalf. Consequently, Zilliz Cloud needs to gather information about your Cloud Storage bucket, GKE cluster, and VPC, along with the roles necessary for accessing these infrastructure resources.

Within your BYOC organization, click the **Create Project and Deploy Data Plane** button to start the deployment.

![Cl50bi7eVoxSoHxk4jrcclh6n5O](/img/Cl50bi7eVoxSoHxk4jrcclh6n5O.png)

### Step 1: Create a project{#step-1-create-a-project}

In this step, you need to set the Zilliz BYOC project name, determine the cloud providers and regions, and the initial project size of your deployment.

![UBLObqjPzocbWvxUDK1c46N9nzb](/img/UBLObqjPzocbWvxUDK1c46N9nzb.png)

1. Set **Zilliz BYOC Project Name**.

1. Select **Cloud Provider** and **Cloud Region**.

1. Configure **Initial Project Size**. 

    In a BYOC project, the search service, other database components, and core support services use different Google Compute Engine (GCE) instances. You can set instance types for these services and components. 

    For details, see [Initial project sizes](./deploy-byoc-gcp#initial-project-sizes).

1. Determine whether to enable **GCP Private Service Connect**.

    This option allows private connectivity to the clusters within the current project. If you enable this option, you must create a Private Service Connect Endpoint for private connectivity.

### Step 2: Set up credentials{#step-2-set-up-credentials}

In **Credential Settings**, you must set up the storage and several service accounts for storage access, GKE cluster management, and data-plane deployment.

![BbOOboWZAo5eu2xplJWcXyLonph](/img/BbOOboWZAo5eu2xplJWcXyLonph.png)

1. In **Google Cloud Platform Project ID**, enter the ID of your GCP project.

1. In **Storage settings**, set **Bucket Name** and **Service Account Email** obtained from GCP. 

    Zilliz Cloud will use the specified bucket as the data-plane storage and access it on your behalf using the specified service account.

    For details on setting up the bucket and creating the service account, refer to [Create Cloud Storage Bucket and Service Account](./create-bucket-and-service-account).

1. In **GKE Settings**, set **GKE Cluster Name** and **Service Account Email** for GKE management. 

    Zilliz Cloud will use the specified service account to deploy a GKE cluster of the specified name on your behalf and deploy the data plane in the GKE cluster.

    For details on creating the service account, refer to [Create GKE Service Account](./create-gke-service-account).

1. In **Cross-Account Settings**, set **Service Account Name** for data-plane deployment.

    Once your service account is ready, copy the Zilliz BYOC principal provided in the read-only text box below and paste it into your GCP console to grant Zilliz BYOC the necessary permissions to deploy the data plane of the Zilliz Cloud BYOC project.

    For details on creating the cross-account service account, refer to [Create a Cross-Account Service Account](./create-cross-account-sa).

1. Click **Next** to configure network settings.

### Step 3: Configure network settings{#step-3-configure-network-settings}

In **Network Settings**, create a VPC and several types of resources, such as subnet names and an optional Private Service Connect Endpoint in the VPC.

![YVPNbLCjOoCkDTx9TEMcbV9LnPd](/img/YVPNbLCjOoCkDTx9TEMcbV9LnPd.png)

1. In **Network Settings**, set the **VPC Name**, **Subnet Names**, and the optional **Private Service Connect Endpoint**.

    In the specified VPC, Zilliz Cloud requires 

    - A primary subnet with two secondary subnets,

    - A load balancer subnet, and

    - An optional Private Service Connect endpoint.

    Note that **Private Service Connect Endpoint** is available only when you switch on **GCP Private Service Connect** in **General Settings** above. 

1. Click **Next** to view the summary.

1. In **Deployment Summary**, review the configuration settings.

1. Click **Create** if everything is as expected.

## Initial project sizes{#initial-project-sizes}

The data plane of a Zilliz BYOC project comprises three types of components: **Search Services**, **Other Database Components**, and **Core Support Services**, which use different GCE instances. 

![HLpfbbXr5onM7PxXG4jcfH4Mnic](/img/HLpfbbXr5onM7PxXG4jcfH4Mnic.png)

In the **General settings**, determine the GCE instance types for the three data plane components mentioned above. Additionally, you need to specify the number of GCE instances for **Core Support Services**, which determines the maximum number of clusters that can be created within the project.

There are four predefined project size options, and they are described as follows:

<table>
   <tr>
     <th rowspan="2"><p>Size</p></th>
     <th rowspan="2"><p>Maximum Cluster Quantity</p></th>
     <th colspan="2"><p>Maximum Number of Entities (Million)</p></th>
   </tr>
   <tr>
     <td><p>Performance-optimized CU</p></td>
     <td><p>Capacity-optimized CU</p></td>
   </tr>
   <tr>
     <td><p>Small</p></td>
     <td><p>3 clusters with 8 to 16 CUs</p></td>
     <td><p>10 Million - 25 Million</p></td>
     <td><p>40 Million - 80 Million</p></td>
   </tr>
   <tr>
     <td><p>Medium</p></td>
     <td><p>7 clusters with 16 to 64 CUs</p></td>
     <td><p>25 Million - 100 Million</p></td>
     <td><p>80 Million - 350 Million</p></td>
   </tr>
   <tr>
     <td><p>Large</p></td>
     <td><p>12 clusters with 64 to 192 CUs</p></td>
     <td><p>100 Million - 300 Million</p></td>
     <td><p>350 Million - 1 Billion</p></td>
   </tr>
   <tr>
     <td><p>X-Large</p></td>
     <td><p>17 clusters with 192 to 576 CUs</p></td>
     <td><p>300 Million - 900 Million</p></td>
     <td><p>1 Billion - 3 Billion</p></td>
   </tr>
</table>

You can also choose to customize the settings by selecting **Custom** in **Initial Project Size** and adjusting the GCE instance types and counts for all data plane components. If your preferred GCE instance types are not listed, please [contact Zilliz support](https://zilliz.com/contact). 

## View deployment details{#view-deployment-details}

After you create a project, you can view its status on the project page.

![DS61bOBm9oC0b1xdLT9cuEUsnmh](/img/DS61bOBm9oC0b1xdLT9cuEUsnmh.png)

## Suspend & Resume{#suspend-and-resume}

Suspending a project halts the data plane and terminates all GCE instances associated with the GKE cluster supporting the project. This action does not impact the suspended Zilliz Cloud clusters within the project, which can be resumed once the data plane is restored.

![YC2YbM9oyo6IcUxDQ5Bc3AzDnPc](/img/YC2YbM9oyo6IcUxDQ5Bc3AzDnPc.png)

You can only suspend a running project if there are no clusters in the project or all clusters have already been suspended.

![SVLQbgURIoRqHBx2tWwc5caWnx7](/img/SVLQbgURIoRqHBx2tWwc5caWnx7.png)

Once the status tag on a project card reads **Suspended**, you cannot manipulate clusters in the project. In such a case, you can click **Resume** to resume the project. Once the status tag turns to **Running** again, you can continue manipulating clusters in the project.

![EQKqbumOxoT1tVxw1ZRcZahXnDd](/img/EQKqbumOxoT1tVxw1ZRcZahXnDd.png)

## Procedures{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />