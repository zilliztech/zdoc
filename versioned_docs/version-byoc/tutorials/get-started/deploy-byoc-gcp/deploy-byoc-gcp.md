---
title: "Deploy BYOC on GCP | BYOC"
slug: /deploy-byoc-gcp
sidebar_key: deploy-byoc-gcp
sidebar_label: "Deploy BYOC on GCP"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: CONTACT SALES
notebook: FALSE
description: "This page describes how to manually create a fully managed Bring-Your-Own-Cloud (BYOC) data plane in your Google Cloud Platform (GCP) Virtual Private Cloud (VPC) using the Zilliz Cloud console and custom GCP configurations. | BYOC"
type: origin
token: KmYgwHNOFiPQ9sk4bSDcMuIHnjC
sidebar_position: 6
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Deploy BYOC on GCP

This page describes how to manually create a fully managed Bring-Your-Own-Cloud (BYOC) data plane in your Google Cloud Platform (GCP) Virtual Private Cloud (VPC) using the Zilliz Cloud console and custom GCP configurations.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p></li>
<li><p>This guide demonstrates how to create the necessary resources on the AWS console step-by-step. If you prefer to use a Terraform script to provision the infrastructure, see <a href="./terraform-provider">Terraform Provider</a>. </p></li>
</ul>

</Admonition>

## Prerequisites\{#prerequisites}

- You must be a BYOC organization owner.

- You have enabled the [required GCP API services](./required-api-services-gcp).

## Procedure\{#procedure}

To deploy BYOC on GCP, Zilliz Cloud needs to assume specific roles to access the Cloud Storage bucket and the GKE cluster within a customer-managed VPC on your behalf. Consequently, Zilliz Cloud needs to gather information about your Cloud Storage bucket, GKE cluster, and VPC, along with the roles necessary for accessing these infrastructure resources.

Within your BYOC organization, click the **Create Project** button to start the deployment.

![LyCiw8o03hUOnebv2CJc0vianpf](https://zdoc-images.s3.us-west-2.amazonaws.com/LyCiw8o03hUOnebv2CJc0vianpf.png)

### Step 1: Deploy the data plane\{#step-1-deploy-the-data-plane}

In this step, you need to set the Zilliz BYOC project name, determine the cloud providers and regions, and the initial project size of your deployment.

<Procedures>

1. Set **Data Plane Name** and **Cloud Region**, and click **Next**.

    Click **Cancel** to stop deploying the data plane. However, the project created above is still available. You can start deploying a data plane in the project at any time and add multiple data planes to a project. 

    ![SVVZwpbNphBfYGb5IgmckSkan6b](https://zdoc-images.s3.us-west-2.amazonaws.com/SVVZwpbNphBfYGb5IgmckSkan6b.png)

1. Determine whether to enable **GCP Private Service Connect**.

    This option allows private connectivity to the clusters within the current project. If you enable this option, you must create a Private Service Connect Endpoint for private connectivity. For details, refer to [Prepare for Cluster Connection](./prepare-for-cluster-connection#private-endpoint-access).

1. Select an architecture type that matches your application in **Architecture**. 

    This determines the architecture type of the Zilliz BYOC image to use. Available options are **X86** and **ARM**.

1. In **Resource Settings**, you need to

    1. Enable or disable **Auto-scaling** to allow Zilliz Cloud to automatically adjust the number of EC2 instances within a defined range based on your project workloads, ensuring efficient resource use.

    1. Configure **Initial Project Size**. 

        In a BYOC project, the query node, index services, Milvus components, and dependencies use different Google Compute Engine (GCE) instances. You can set instance types for these services and components. 

        If **Auto-scaling** is disabled, simply specify the number of GCE instances required for each project component in the corresponding **Count** field.

        ![Tl4Zbuwi5oT1KdxKVaIcnf05nEr](https://zdoc-images.s3.us-west-2.amazonaws.com/tl4zbuwi5ot1kdxkvaicnf05ner.png "Tl4Zbuwi5oT1KdxKVaIcnf05nEr")

        Once **Auto-scaling** is enabled, you need to specify a range for Zilliz Cloud to automatically scale the number of GCE instances based on actual project workloads by setting the corresponding **Min** and **Max** fields.

        ![Gq0GbQWJxoJf85xg6KJcppLDnZS](https://zdoc-images.s3.us-west-2.amazonaws.com/gq0gbqwjxojf85xg6kjcppldnzs.png "Gq0GbQWJxoJf85xg6KJcppLDnZS")

        To facilitate resource settings, there are four predefined project size options. The following table shows the mapping between these project size options and the number of clusters that can be created in the project, as well as the number of entities these clusters can contain.

        <table>
           <tr>
             <th rowspan="2"><p>Size</p></th>
             <th rowspan="2"><p>Maximum Cluster Quantity</p></th>
             <th colspan="3"><p>Maximum Number of Entities (Million)</p></th>
           </tr>
           <tr>
             <td><p>Performance-optimized CU</p></td>
             <td><p>Capacity-optimized CU</p></td>
             <td><p>Tiered-storage CU</p></td>
           </tr>
           <tr>
             <td><p>Small</p></td>
             <td><p>3 clusters with 8 to 16 CUs</p></td>
             <td><p>20 Million - 40 Million</p></td>
             <td><p>64 Million - 128 Million</p></td>
             <td><p>320 Million - 640 Million</p></td>
           </tr>
           <tr>
             <td><p>Medium</p></td>
             <td><p>7 clusters with 16 to 64 CUs</p></td>
             <td><p>40 Million - 160 Million</p></td>
             <td><p>128 Million - 512 Million</p></td>
             <td><p>640 Million - 2.6 Billion</p></td>
           </tr>
           <tr>
             <td><p>Large</p></td>
             <td><p>12 clusters with 64 to 192 CUs</p></td>
             <td><p>160 Million - 480 Million</p></td>
             <td><p>512 Million - 1.5 Billion</p></td>
             <td><p>2.6 Billion - 7.7 Billion</p></td>
           </tr>
           <tr>
             <td><p>X-Large</p></td>
             <td><p>17 clusters with 192 to 576 CUs</p></td>
             <td><p>480 Million - 1.44 Billion</p></td>
             <td><p>1.5 Billion -  4.6 Billion</p></td>
             <td><p>7.7 Billion - 23 Billion</p></td>
           </tr>
        </table>

        You can also customize the settings by selecting **Custom** in **Initial Project Size** and adjusting the GCE instance types and counts for all data plane components. If your preferred GCE instance types are not listed, please [contact Zilliz support](https://zilliz.com/contact) for further assistance. 

    1. Determine whether to enable **Tiered Query Node**.

        This option determines whether you can create tiered-storage clusters. Once you select this option, you can set the instance type and count for the tiered query nodes. 

        ![CFISbr4gloeeYoxStjuc7VuanM5](https://zdoc-images.s3.us-west-2.amazonaws.com/cfisbr4gloeeyoxstjuc7vuanm5.png "CFISbr4gloeeYoxStjuc7VuanM5")

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p>Your choice in <strong>Project Size</strong> does not affect the settings in <strong>Tiered Storage Node</strong>.</p></li>
        <li><p>If <strong>Auto-scaling</strong> is disabled, the sum of the <strong>Default Query Node</strong> count and the <strong>Tiered Query Node</strong> count should be a positive integer.</p></li>
        <li><p>If <strong>Auto-scaling</strong> is enabled, the sum of the <strong>Min</strong> values of both the <strong>Default Query Node</strong> and the <strong>Tiered Query Node</strong> should be a positive integer.</p></li>
        </ul>

        </Admonition>

1. Click **Next** to set up credentials.

</Procedures>

### Step 2: Set up credentials\{#step-2-set-up-credentials}

In **Credential Settings**, you must set up the storage and several service accounts for storage access, GKE cluster management, and data-plane deployment.

![BbOOboWZAo5eu2xplJWcXyLonph](https://zdoc-images.s3.us-west-2.amazonaws.com/bboobowzao5eu2xpljwcxylonph.png "BbOOboWZAo5eu2xplJWcXyLonph")

<Procedures>

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

</Procedures>

### Step 3: Configure network settings\{#step-3-configure-network-settings}

In **Network Settings**, create a VPC and several types of resources, such as subnet names and an optional Private Service Connect Endpoint in the VPC.

![YVPNbLCjOoCkDTx9TEMcbV9LnPd](https://zdoc-images.s3.us-west-2.amazonaws.com/yvpnblcjoockdtx9temcbv9lnpd.png "YVPNbLCjOoCkDTx9TEMcbV9LnPd")

<Procedures>

1. In **Network Settings**, set the **VPC Name**, **Subnet Names**, and the optional **Private Service Connect Endpoint**.

    In the specified VPC, Zilliz Cloud requires 

    - A primary subnet with two secondary subnets,

    - A load balancer subnet, and

    - An optional Private Service Connect endpoint.

    Note that **Private Service Connect Endpoint** is available only when you switch on **GCP Private Service Connect** in **General Settings** above. 

1. Click **Next** to view the summary.

1. In **Deployment Summary**, review the configuration settings.

1. Click **Create** if everything is as expected.

</Procedures>

## View deployment details\{#view-deployment-details}

After you create a project, you can view its status on the project page.

![BE13bnOpGo9ZAVxTx3acX2J8nEe](https://zdoc-images.s3.us-west-2.amazonaws.com/be13bnopgo9zavxtx3acx2j8nee.png "BE13bnOpGo9ZAVxTx3acX2J8nEe")

Once you have deployed the project's data plane and created clusters, you can connect to these clusters either through direct VPC access or via GCP Private Service Connect. For details, refer to [Connect to BYOC Clusters](./prepare-for-cluster-connection).

## Suspend & Resume\{#suspend-and-resume}

Suspending a project halts the data plane and terminates all GCE instances associated with the GKE cluster supporting the project. This action does not impact the suspended Zilliz Cloud clusters within the project, which can be resumed once the data plane is restored.

![Lq7AwLshAh64ZObMKeFcIXBwn5g](https://zdoc-images.s3.us-west-2.amazonaws.com/Lq7AwLshAh64ZObMKeFcIXBwn5g.png)

You can only suspend a running project if there are no clusters in the project or all clusters have already been suspended.

![SVLQbgURIoRqHBx2tWwc5caWnx7](https://zdoc-images.s3.us-west-2.amazonaws.com/svlqbguriorqhbx2twwc5cawnx7.png "SVLQbgURIoRqHBx2tWwc5caWnx7")

Once the status tag on a project card reads **Suspended**, you cannot manipulate clusters in the project. In such a case, you can click **Resume** to resume the project. Once the status tag turns to **Running** again, you can continue manipulating clusters in the project.

## Technical support access\{#technical-support-access}

To assist you with troubleshooting and maintenance operations, Zilliz Cloud enables technical support to access your project's data plane by default. 

![OHNUwYrFHhEUeIbgOW9coc5hngb](https://zdoc-images.s3.us-west-2.amazonaws.com/OHNUwYrFHhEUeIbgOW9coc5hngb.png)

When you click **Technical Support Access** from the target project's drop-down menu to view the current settings.

You can disable it to meet data governance and security requirements.

## Procedures\{#procedures}



import DocCardList from '@theme/DocCardList';

<DocCardList />