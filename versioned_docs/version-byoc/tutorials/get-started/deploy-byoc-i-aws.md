---
title: "Deploy BYOC-I on AWS | BYOC"
slug: /deploy-byoc-i-aws
sidebar_label: "Deploy BYOC-I on AWS"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page explains how to deploy a Bring-Your-Own-Cloud (BYOC) data plane with a BYOC agent in your AWS Virtual Private Cloud (VPC). | BYOC"
type: origin
token: D1E4wLr5xiuHoFkJgblcHZ1FnLb
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - aws
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search

---

import Admonition from '@theme/Admonition';


# Deploy BYOC-I on AWS

This page explains how to deploy a Bring-Your-Own-Cloud (BYOC) data plane with a BYOC agent in your AWS Virtual Private Cloud (VPC).

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p></li>
<li><p>This guide demonstrates how to create the necessary resources on the AWS console step-by-step. If you prefer to use a Terraform script to provision the infrastructure,  see <a href="./terraform-provider">Terraform Provider</a>. </p></li>
</ul>

</Admonition>

## Prerequisites\{#prerequisites}

Ensure that 

- You are the owner of a BYOC-I organization.

## Procedures\{#procedures}

### Step 1: Prepare the deployment environment\{#step-1-prepare-the-deployment-environment}

A deployment environment is a local machine, a virtual machine (VM), or a CI/CD pipeline configured to run the Terraform configuration files and deploy the data plane of your BYOC-I project. In this step, you need to 

- **Configure AWS credentials (AWS profile or access key).**

    For details on how to configure AWS credentials, refer to [this document](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

- **Install the latest Terraform binary.**

    For details on how to install Terraform, refer to [this document](https://developer.hashicorp.com/terraform/install?product_intent=terraform).

### Step 2: Create a project\{#step-2-create-a-project}

Within your BYOC-I organization, click the **Create Project and Deploy Data Plane** button to start the deployment.

![Xd4ObksJao97jdxSFVTclO4Fno6](https://zdoc-images.s3.us-west-2.amazonaws.com/xd4obksjao97jdxsfvtclo4fno6.png "Xd4ObksJao97jdxSFVTclO4Fno6")

### Step 3: Set up the general settings\{#step-3-set-up-the-general-settings}

In **General Settings**, you need to set the project name and determine the cloud providers and regions where Zilliz Cloud deploys the data plane for the project.

![Xejfbdz6PockHsxn5uacw3OTnVc](https://zdoc-images.s3.us-west-2.amazonaws.com/xejfbdz6pockhsxn5uacw3otnvc.png "Xejfbdz6PockHsxn5uacw3OTnVc")

1. Set **Project Name**.

1. Select **Cloud Provider** and **Region**.

1. Determine whether to enable **AWS PrivateLink**.

    This option allows private connectivity to the clusters within the current project. If you enable this option, you must create a VPC Endpoint for private connectivity.

1. Select an architecture type that matches your application in **Architecture**. 

    This determines the architecture type of the Zilliz BYOC image to use. Available options are **X86** and **ARM**.

1.  In **Resource Settings**, you need to

    1. Enable or disable **Auto-scaling** to allow Zilliz Cloud to automatically adjust the number of EC2 instances within a defined range based on your project workloads, ensuring efficient resource use.

    1. Configure **Initial Project Size**. 

        In a BYOC project, the query node, index services, Milvus components, and dependencies use different types of EC2 instances. You can set instance types and counts for these services and components individually. 

        If **Auto-scaling** is disabled, simply specify the number of EC2 instances required for each project component in the corresponding **Count** field.

        ![VHLHbZrT1oNG03xAJMgcFVKAnCh](https://zdoc-images.s3.us-west-2.amazonaws.com/vhlhbzrt1ong03xajmgcfvkanch.png "VHLHbZrT1oNG03xAJMgcFVKAnCh")

        Once **Auto-scaling** is enabled, you need to specify a range for Zilliz Cloud to automatically scale the number of EC2 instances based on actual project workloads by setting the corresponding **Min** and **Max** fields.

        ![VVjXbGaS3ovyZdxEPcacd6Vnnkh](https://zdoc-images.s3.us-west-2.amazonaws.com/vvjxbgas3ovyzdxepcacd6vnnkh.png "VVjXbGaS3ovyZdxEPcacd6Vnnkh")

        To facilitate resource settings, there are four predefined project size options. The following table shows the mapping between these project size options and the number of clusters that can be created in the project, as well as the number of entities these clusters can contain.

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

        You can also customize the settings by selecting **Custom** in **Initial Project Size** and adjusting the EC2 instance types and counts for all data plane components. If your preferred EC2 instance types are not listed, please [contact Zilliz support](https://zilliz.com/contact) for further assistance. 

1. Click **Next**.

### Step 4: Deploy the data plane\{#step-4-deploy-the-data-plane}

Follow the steps displayed in the dialog to deploy the data plane for the currently created project.

![GHGqbw4UroKPu7xoEWmcDQaDnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/ghgqbw4urokpu7xoewmcdqadned.png "GHGqbw4UroKPu7xoEWmcDQaDnEd")

For details on running the above Terraform scripts, refer to the [Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project).

## Manage projects\{#manage-projects}

![AHEybTRhto0gcKxnKIucbm3inte](https://zdoc-images.s3.us-west-2.amazonaws.com/aheybtrhto0gckxnkiucbm3inte.png "AHEybTRhto0gcKxnKIucbm3inte")

### Projects with an Undeploy tag\{#projects-with-an-undeploy-tag}

If the status tag on the right corner of a project card reads **Undeploy**, you can always click the **Deploy Data Plane** button on the project card to reopen it. To rename or delete the project, click the **...** button in the project card and select **Rename** or **Delete** from the drop-down menu.  

### Projects with a Deploying tag\{#projects-with-a-deploying-tag}

Once you have prepared the deployment environment and executed the displayed commands, you must wait for the BYOC agent to activate. When the status tag on the project card reads **Deploying** and shows the progress percentage, you cannot rename or delete the project until the data plane is in place.

### Projects with a Running tag\{#projects-with-a-running-tag}

Once the status tag on a project card reads **Running**, you can start creating clusters in the project. To rename or delete a running project, ensure that there are no clusters in the project.