---
title: "Deploy BYOC-I on Microsoft Azure | BYOC"
slug: /deploy-byoc-i-azure
sidebar_key: deploy-byoc-i-azure
sidebar_label: "Deploy BYOC-I on Microsoft Azure"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: CONTACT SALES
notebook: FALSE
description: "This page explains how to deploy a Bring-Your-Own-Cloud (BYOC) data plane with a BYOC agent in your Microsoft Azure Virtual Network. | BYOC"
type: origin
token: QuBiwrIJdiDw3ckVDKBcPofinfe
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - microsoft azure
  - permissions
  - minimum permissions
  - milvus
  - vector database

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

# Deploy BYOC-I on Microsoft Azure

This page explains how to deploy a Bring-Your-Own-Cloud (BYOC) data plane with a BYOC agent in your Microsoft Azure Virtual Network.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p></li>
<li><p>This guide demonstrates how to create the necessary resources on the Microsoft Azure console step-by-step. If you prefer to use a Terraform script to provision the infrastructure,  see <a href="./terraform-provider">Terraform Provider</a>. </p></li>
</ul>

</Admonition>

## Prerequisites\{#prerequisites}

Ensure that 

- You are the owner of a BYOC-I organization.

- You have been granted the permissions listed in [Required permissions](./deploy-byoc-i-aws#required-permissions).

## Procedures\{#procedures}

### Step 1: Prepare the deployment environment\{#step-1-prepare-the-deployment-environment}

A deployment environment is a local machine, a virtual machine (VM), or a CI/CD pipeline configured to run the Terraform configuration files and deploy the data plane of your BYOC-I project. In this step, you need to 

- **Configure Microsoft Azure credentials.**

    Microsoft Azure credentials include your subscription ID and resource group name. 

    **Azure Portal (UI)**

    - **Subscription ID:**

        ![UCcVbQX7boMNMLxoiK8ccyM9ngd](https://zdoc-images.s3.us-west-2.amazonaws.com/uccvbqx7bomnmlxoik8ccym9ngd.png "UCcVbQX7boMNMLxoiK8ccyM9ngd")

        <Procedures>

        1. Navigate to **Subscriptions** in the top search bar or from the home page.

        1. Select your subscription.

        1. Find the `Subscription ID` in the **Essentials** section of the Overview page.

        </Procedures>

    - **Resource Group Name:**

        A resource group is a container that holds related resources for an Azure solution. 

        ![HY2ybEyBHoOrwTxvvsxcvBDFnOe](https://zdoc-images.s3.us-west-2.amazonaws.com/hy2ybeybhoorwtxvvsxcvbdfnoe.png "HY2ybEyBHoOrwTxvvsxcvBDFnOe")

        <Procedures>

        1. Navigate to **Resource groups** in the left-hand menu.

        1. The name is listed in the **Name** column. 

            If none is displayed, you may need to create one and provide it to Zilliz Cloud. When you run the Terraform scripts later, all necessary resources will be added to the resource group, including virtual machines (VMs), virtual networks (VNets), and Azure Kubernetes Service (AKS) clusters.

        </Procedures>

- **Add access control (IAM) permissions**

    Assign the **Contributor** and **User Access Administrator** permissions to the role that will run the Terraform scripts.

    ![P0NbbtVyTofpGmxtk1jcpQYsnTe](https://zdoc-images.s3.us-west-2.amazonaws.com/p0nbbtvytofpgmxtk1jcpqysnte.png "P0NbbtVyTofpGmxtk1jcpQYsnTe")

    <Procedures>

    1. Navigate to **Access control (IAM)** in the left-hand menu.

    1. Click **+ Add** and select **Add role assignment** in the drop-down list.

    1. In the **Role** tab, click **Privileged administrator roles**, filter for **Contributor**, and click **Next**.

    1. In the **Members** tab, select **User, group, or service principal** or **Managed entity** in **Assign access to**, and click **+ Select members**.

        Select **User, group, or service principal** if a user, group, or service principal is used to run the Terraform script. Otherwise, select **Managed entity**.

    1. Click **Next**, review the settings, and click **Review + assign** to save.

    1. Repeat the steps above for the **User Access Administrator** role.

    </Procedures>

- **Install the latest Terraform binary.**

    For details on installing Terraform, refer to [this document](https://developer.hashicorp.com/terraform/install?product_intent=terraform).

### Step 2: Create a project\{#step-2-create-a-project}

Within your BYOC-I organization, click the **Create Project** button to start the deployment. In the prompted dialog box, set **Zilliz BYOC Project Name**, and click **Create and Next**.

The project is created at the end of this step, and you will be redirected to the **Deploy Data Plane** dialog box.

![Wc5KwW4BihKe17beYFccNdb3nCf](https://zdoc-images.s3.us-west-2.amazonaws.com/Wc5KwW4BihKe17beYFccNdb3nCf.png)

### Step 3: Deploy the data plane\{#step-3-deploy-the-data-plane}

<Procedures>

1. Set **Data Plane Name** and **Cloud Region**, and click **Next**.

    Click **Cancel** to stop deploying the data plane. However, the project created above is still available. You can start deploying a data plane in the project at any time and add multiple data planes to a project. 

    ![M8EWwH1WJhTkVBbyJLOcWEDjnqN](https://zdoc-images.s3.us-west-2.amazonaws.com/M8EWwH1WJhTkVBbyJLOcWEDjnqN.png)

1. Determine whether to enable **Azure Private Service Connect**.

    This option allows private connectivity to the clusters within the current project. If you enable this option, you must create a VPC Endpoint for private connectivity.

1. Fill in your Azure **Subscription ID** and **Resource Group Name** obtained in [Step 1](./deploy-byoc-i-azure#step-1-prepare-the-deployment-environment).

1. Select an architecture type that matches your application in **Architecture**. 

    This determines the architecture type of the Zilliz BYOC image to use. Available options are **X86** and **ARM**.

1.  In **Resource Settings**, you need to

    1. Enable or disable **Auto-scaling** to allow Zilliz Cloud to automatically adjust the number of VM instances within a defined range based on your project workloads, ensuring efficient resource use.

    1. Configure **Initial Project Size**. 

        In a BYOC project, the query node, index services, Milvus components, and dependencies use different types of VM instances. You can set instance types and counts for these services and components individually. 

        If **Auto-scaling** is disabled, simply specify the number of VM instances required for each project component in the corresponding **Count** field.

        ![MzcibkvtSoZZK6xcsFncpd0Gn2f](https://zdoc-images.s3.us-west-2.amazonaws.com/mzcibkvtsozzk6xcsfncpd0gn2f.png "MzcibkvtSoZZK6xcsFncpd0Gn2f")

        Once **Auto-scaling** is enabled, you need to specify a range for Zilliz Cloud to automatically scale the number of VM instances based on actual project workloads by setting the corresponding **Min** and **Max** fields.

        ![IbqMbM0lGoNweKxba4Hcw0Ien4e](https://zdoc-images.s3.us-west-2.amazonaws.com/ibqmbm0lgonwekxba4hcw0ien4e.png "IbqMbM0lGoNweKxba4Hcw0Ien4e")

        To facilitate resource settings, there are four predefined project size options. The following table shows the mapping between these project size options and the number of clusters that can be created in the project, along with the number of entities each cluster can contain.

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

        You can also customize the settings by selecting **Custom** in **Initial Project Size** and adjusting the VM instance types and counts for all data plane components. If your preferred VM instance types are not listed, please [contact Zilliz support](https://zilliz.com/contact) for further assistance. 

1. Click **Next**.

</Procedures>

### Step 4: Deploy the data plane\{#step-4-deploy-the-data-plane}

Follow the steps displayed in the dialog to deploy the data plane for the currently created project.

![X3s2bYas0o5ICVxZ18rcta5TnLd](https://zdoc-images.s3.us-west-2.amazonaws.com/x3s2byas0o5icvxz18rcta5tnld.png "X3s2bYas0o5ICVxZ18rcta5TnLd")

For details on running the above Terraform scripts, refer to the [Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project).

Once you have deployed the project's data plane and created clusters, you can connect to these clusters either through direct VPC access or via Azure Private Link. For details, refer to [Connect to BYOC Clusters](./prepare-for-cluster-connection).

## Manage dataplanes\{#manage-dataplanes}

![IqvEwsg5ah4UaAb56tmcbOOlnIR](https://zdoc-images.s3.us-west-2.amazonaws.com/IqvEwsg5ah4UaAb56tmcbOOlnIR.png)

### Data planes with an Undeploy tag\{#data-planes-with-an-undeploy-tag}

If the status tag on the right corner of a project card reads **Undeploy**, you can always click the **Deploy Data Plane** button on the project card to reopen it. To rename or delete the project, click the **...** button in the project card and select **Rename** or **Delete** from the drop-down menu.  

### Data planes with a Deploying tag\{#data-planes-with-a-deploying-tag}

Once you have prepared the deployment environment and executed the displayed commands, you must wait for the BYOC agent to activate. When the status tag on the project card reads **Deploying** and shows the progress percentage, you cannot rename or delete the project until the data plane is in place.

### Data plans with a Running tag\{#data-plans-with-a-running-tag}

Once the status tag on a project card reads **Running**, you can start creating clusters in the project. To rename or delete a running project, ensure that there are no clusters in the project.

## Technical support access\{#technical-support-access}

To assist you with troubleshooting and maintenance operations, Zilliz Cloud enables technical support to access your project's data plane by default. 

![LozAb735eoX00UxLYAKcWqY2nkG](https://zdoc-images.s3.us-west-2.amazonaws.com/lozab735eox00uxlyakcwqy2nkg.png "LozAb735eoX00UxLYAKcWqY2nkG")

When you click **Technical Support Access** from the target project's drop-down menu to view the current settings.

![NdnSbwFbkokOPpxaW1ocGwklnab](https://zdoc-images.s3.us-west-2.amazonaws.com/ndnsbwfbkokoppxaw1ocgwklnab.png "NdnSbwFbkokOPpxaW1ocGwklnab")

You can disable it to meet data governance and security requirements.

