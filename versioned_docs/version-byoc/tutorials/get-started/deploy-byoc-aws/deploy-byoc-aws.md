---
title: "Deploy BYOC on AWS | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "Deploy BYOC on AWS"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page describes how to manually create a fully managed Bring-Your-Own-Cloud (BYOC) data plane in your AWS Virtual Private Cloud (VPC) using the Zilliz Cloud console and custom AWS configurations. | BYOC"
type: origin
token: DsqzwjegpiYSdtk1k75c1zXsnZc
sidebar_position: 3
keywords: 
  - zilliz
  - byoc
  - aws
  - milvus
  - vector database
  - Sparse vector
  - Vector Dimension
  - ANN Search
  - What are vector embeddings

---

import Admonition from '@theme/Admonition';


# Deploy BYOC on AWS

This page describes how to manually create a fully managed Bring-Your-Own-Cloud (BYOC) data plane in your AWS Virtual Private Cloud (VPC) using the Zilliz Cloud console and custom AWS configurations.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p></li>
<li><p>This guide demonstrates how to create the necessary resources on the AWS console step-by-step. If you prefer to use a Terraform script to provision the infrastructure,  see <a href="./terraform-provider">Terraform Provider</a>. </p></li>
</ul>

</Admonition>

## Prerequisites\{#prerequisites}

- You must be a BYOC organization owner.

## Procedure\{#procedure}

To deploy BYOC on AWS, Zilliz Cloud needs to assume specific roles to access the S3 bucket and the EKS cluster within a customer-managed VPC on your behalf. Consequently, Zilliz Cloud needs to gather information about your S3 bucket, EKS cluster, and VPC, along with the roles necessary for accessing these infrastructure resources.

Within your BYOC organization, click the **Create Project and Deploy Data Plane** button to start the deployment.

![XtlJbBTIboHNbixzfqpc7H3nnvb](https://zdoc-images.s3.us-west-2.amazonaws.com/xtljbbtibohnbixzfqpc7h3nnvb.png "XtlJbBTIboHNbixzfqpc7H3nnvb")

### Step 1: Create a project\{#step-1-create-a-project}

In this step, you need to set the project name, determine the cloud providers and regions as well as the initial project size, and choose the way for Zilliz Cloud to create the project and deploy the data plane.

![ObsWbiWhxo4IQHx7pPacHUl2nuh](https://zdoc-images.s3.us-west-2.amazonaws.com/obswbiwhxo4iqhx7ppachul2nuh.png "ObsWbiWhxo4IQHx7pPacHUl2nuh")

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

        ![V1r0b6PDzokWRqxaA4ccrTs2nEd](https://zdoc-images.s3.us-west-2.amazonaws.com/v1r0b6pdzokwrqxaa4ccrts2ned.png "V1r0b6PDzokWRqxaA4ccrTs2nEd")

        Once **Auto-scaling** is enabled, you need to specify a range for Zilliz Cloud to automatically scale the number of EC2 instances based on actual project workloads by setting the corresponding **Min** and **Max** fields.

        ![XYW9bj1qfoKEXMx9L4DchlE7nHh](https://zdoc-images.s3.us-west-2.amazonaws.com/xyw9bj1qfokexmx9l4dchle7nhh.png "XYW9bj1qfoKEXMx9L4DchlE7nHh")

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

1. Choose the way for Zilliz Cloud to carry on the task in **Deploy Method**.

    There are three options for provisioning the infrastructure for your BYOC project on AWS. You can either

    - **Use AWS CloudFormation to provision the infrastructure.**

        If you prefer to use AWS CloudFormation to provision the data plane infrastructure for the project, select the **Quickstart** tile in the **Deploy Method** section. This is also the recommended method for starting a BYOC project.

        If you decide to use AWS CloudFormation, click **Next**, and you will be prompted with the following dialog box to choose whether to deploy the project to a new VPC or an existing VPC.

        ![EWCsb9An2oM6dkxjCuOcM5hRnCe](https://zdoc-images.s3.us-west-2.amazonaws.com/ewcsb9an2om6dkxjcuocm5hrnce.png "EWCsb9An2oM6dkxjCuOcM5hRnCe")

        Then, you can click **Create Stack with CloudFormation** to start deploying the project.

    - **Use a Terraform script to provision the infrastructure.**

        If you prefer to use a Terraform script to provision the infrastructure, you need to copy and paste the script output back to Zilliz Cloud. For details, see [Terraform Provider](./terraform-provider). 

        Note that you still need to fill in the information returned by the Terraform script to the Zilliz Cloud console, as specified in [Credential Settings](./deploy-byoc-aws#step-2-set-up-credentials) and [Network Settings](./deploy-byoc-aws#step-3-configure-network-settings).

    - **Use the AWS console to create** the **necessary resources and roles.**

        You need to create necessary resources, such as a storage bucket and several IAM roles, on the AWS console. Then, copy and paste their names and IDs back to the Zilliz Cloud console. If you prefer to create the project this way, select the **Manually** tile in the **Deploy Method** section and click **Next**. 

        Zilliz Cloud splits the process into [Credential Settings](./deploy-byoc-aws#step-2-set-up-credentials) and [Network Settings](./deploy-byoc-aws#step-3-configure-network-settings) to facilitate your configurations. 

1. Click **Next** to set up credentials.

### Step 2: Set up credentials\{#step-2-set-up-credentials}

In **Credential Settings**, you must set up the storage and several IAM roles for storage access, EKS cluster management, and data-plane deployment.

![LEGhbUbZwoPdwSx1PjxcHBjQnab](https://zdoc-images.s3.us-west-2.amazonaws.com/leghbubzwopdwsx1pjxchbjqnab.png "LEGhbUbZwoPdwSx1PjxcHBjQnab")

1. In **Storage settings**, set **Bucket Name** and **IAM Role ARN** obtained from AWS. 

    Zilliz Cloud will use the specified bucket as the data-plane storage and access it on your behalf using the specified IAM role.

     For more on the procedure for creating an S3 bucket, read [Create S3 Bucket and IAM Role](./create-bucket-and-role). 

1. In **EKS Settings**, set **IAM Role ARN** for EKS management. 

    Zilliz Cloud will use the specified role to deploy an EKS cluster on your behalf and deploy the data plane in the EKS cluster.

    For more on the procedure for creating an EKS role, read [Create EKS IAM Role](./create-eks-role).

1. In **Cross-Account Settings**, set **IAM Role ARN** for data-plane deployment.

    You need to copy the **External ID** provided in the dialog box. Zilliz Cloud will use the specified role to deploy the data plane of the Zilliz Cloud BYOC project. 

    For more on the procedure for creating the cross-account role, read [Create Cross-Account IAM Role](./create-cross-account-role).

1. Click **Next** to configure network settings.

### Step 3: Configure network settings\{#step-3-configure-network-settings}

In **Network Settings**, create a VPC and several types of resources, such as subnets, security groups, and optional VPC endpoint in the VPC.

![NeKmbmKVhoNWcOx18IjcC1eLnDb](https://zdoc-images.s3.us-west-2.amazonaws.com/nekmbmkvhonwcox18ijcc1elndb.png "NeKmbmKVhoNWcOx18IjcC1eLnDb")

1. In **Network Settings**, set the **VPC ID**, **Subnet IDs**, the **Security Group ID**, and the optional **VPC endpoint ID**.

    In the specified VPC, Zilliz Cloud requires 

    - A public subnet and three private subnets.

    - A security group, and

    - An optional VPC endpoint.

    Note that **VPC Endpoint ID** is available only when you switch on **AWS PrivateLink** in **General Settings** above. For more on the procedure for creating a VPC and its associated resources, refer to [Configure a Customer-Managed VPC](./configure-vpc).

1. Click **Next** to view the summary.

1. In **Deployment Summary**, review the configuration settings.

1. Click **Create** if everything is as expected.

## View deployment details\{#view-deployment-details}

After you create a project, you can view its status on the project page.

![Bw2Xb6wIKoXWAuxU4jOcDdAnn2e](https://zdoc-images.s3.us-west-2.amazonaws.com/bw2xb6wikoxwauxu4jocddann2e.png "Bw2Xb6wIKoXWAuxU4jOcDdAnn2e")

## Suspend & Resume\{#suspend-and-resume}

Suspending a project halts the data plane and terminates all EC2 instances associated with the EKS cluster supporting the project. This action does not impact the suspended Zilliz Cloud clusters within the project, which can be resumed once the data plane is restored.

![BN8KbqawgoErlZxtNYFcEvrjne4](https://zdoc-images.s3.us-west-2.amazonaws.com/bn8kbqawgoerlzxtnyfcevrjne4.png "BN8KbqawgoErlZxtNYFcEvrjne4")

You can only suspend a running project if there are no clusters in the project or all clusters have already been suspended.

![QXK1bRewYoasCzx1AHNcpbSBnhe](https://zdoc-images.s3.us-west-2.amazonaws.com/qxk1brewyoasczx1ahncpbsbnhe.png "QXK1bRewYoasCzx1AHNcpbSBnhe")

Once the status tag on a project card reads **Suspended**, you cannot manipulate clusters in the project. In such a case, you can click **Resume** to resume the project. Once the status tag turns to **Running** again, you can continue manipulating clusters in the project.

## Procedures\{#procedures}

import DocCardList from '@theme/DocCardList';

<DocCardList />