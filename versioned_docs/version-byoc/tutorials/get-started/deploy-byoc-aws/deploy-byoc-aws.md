---
title: "Deploy BYOC on AWS | BYOC"
slug: /deploy-byoc-aws
sidebar_label: "Deploy BYOC on AWS"
beta: FALSE
notebook: FALSE
description: "This page describes how to manually create a project in your Zilliz Cloud Bring-Your-Own-Cloud (BYOC) organization using the Zilliz Cloud console and custom AWS configurations. | BYOC"
type: origin
token: DsqzwjegpiYSdtk1k75c1zXsnZc
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - aws
  - milvus
  - vector database

---

import Admonition from '@theme/Admonition';


# Deploy BYOC on AWS

This page describes how to manually create a project in your Zilliz Cloud Bring-Your-Own-Cloud (BYOC) organization using the Zilliz Cloud console and custom AWS configurations.

## Prerequisites{#prerequisites}

- You must be a BYOC organization owner.

## Procedure{#procedure}

To deploy BYOC on AWS, Zilliz Cloud needs to assume specific roles to access the S3 bucket and the EKS cluster within a customer-managed VPC on your behalf. Consequently, Zilliz Cloud needs to gather information about your S3 bucket, EKS cluster, and VPC, along with the roles necessary for accessing these infrastructure resources.

There are two options for you to provision the infrastructure for your BYOC project. You can either

- Use a Terraform script to provision the infrastructure, or 

    If you prefer to use a Terraform script to provision the infrastructure, you still need to copy and paste the script output back to Zilliz Cloud. For details, see [Bootstrap Project Infrastructure (Terraform)](./bootstrap-infrastructure-terraform). 

- Use the AWS console to create necessary resources and roles.

    The following procedure is designed to use the Zilliz Cloud console to collect the necessary information about your infrastructure. 

    Go to the [Zilliz Cloud console](https://cloud.zilliz.com) and click **Create Project and Deploy Data Plane**. The procedure consists of three sections, namely 

    - [General Settings](./deploy-byoc-aws#general-settings),

    - [Credential Settings](./deploy-byoc-aws#credential-settings), and

    - [Network Settings](./deploy-byoc-aws#network-settings).

### General Settings{#general-settings}

In **General Settings**, you need to set the project name, determine the cloud providers and regions, and determine the types of instances used in the project.

![MEHmb9TPgoUmP8xgXV3cQvhrnNa](/byoc/MEHmb9TPgoUmP8xgXV3cQvhrnNa.png)

1. Set **Project Name**.

1. Select **Cloud Provider** and **Region**.

1. (Optional) Configure **Instance Settings**. 

    In a BYOC project, the search service, fundamental database components, and core support services use different instances. You can set instance types for these services and components. 

    For details, see [Instance Settings](./deploy-byoc-aws#instance-settings).

1. Click **Next** to configure credentials settings.

### Credential Settings{#credential-settings}

In **Credential Settings**, you must set up the storage and several IAM roles for storage access, EKS cluster management, and data-plane deployment.

![IAFtba9Ojoha3Lx7Hnbc0g9Znud](/byoc/IAFtba9Ojoha3Lx7Hnbc0g9Znud.png)

1. Follow the steps listed to configure storage, EKS, and cross-account settings.

    1. In **Storage settings**, set **Bucket Name** and **IAM Role ARN** obtained from AWS. 

        Zilliz Cloud will use the specified bucket as the data-plane storage and access it on your behalf using the specified IAM role.

         For more on the procedure for creating an S3 bucket, read [Create S3 Bucket and Role](./create-bucket-and-role). 

    1. In **EKS Settings**, set **IAM Role ARN** for EKS management. 

        Zilliz Cloud will use the specified role to deploy an EKS cluster on your behalf and deploy the data plane in the EKS cluster.

        For more on the procedure for creating an EKS role, read [Create an EKS](./create-eks-role).

    1. In **Cross-Account Settings**, set **IAM Role ARN** for data-plane deployment.

        Zilliz Cloud will use the specified role to deploy the data plane of the Zilliz Cloud BYOC project. 

        For more on the procedure for creating the cross-account role, read [Create an IAM Role for BYOC Deployment](./create-cross-account-role).

1. Click **Next** to configure network settings.

### Network Settings{#network-settings}

In Network Settings, you need to create a VPC and several types of resources, such as subnets, security group, and optional VPC endpoint in the VPC.

![NwhNbLBsyo0A1gxyjQxcdz4In8f](/byoc/NwhNbLBsyo0A1gxyjQxcdz4In8f.png)

1. In **Network Settings**, set the **VPC ID**, **Subnet IDs**, the **Security Group ID**, and the optional **VPC endpoint ID**.

    In the specified VPC, Zilliz Cloud requires 

    - A public subnet and three private subnets.

    - A security group, and

    - An optional VPC endpoint.

    For more on the procedure for creating a VPC and the resources within, refer to [Configure a Customer-Managed VPC](./configure-vpc).

1. Click **Next** to view the summary.

1. In **Deployment Summary**, review the configurations.

1. Click **Create** if everything is as expected.

## Instance Settings{#instance-settings}

During the project deployment, Zilliz Cloud creates the fundamental database components and core support services. When the project is ready, you can create clusters in the project. At this point, Zilliz Cloud creates instances for search services on your behalf. 

![OgfRbJJSroelpqx0ACIc3VjxnNh](/byoc/OgfRbJJSroelpqx0ACIc3VjxnNh.png)

You need to determine the types of instances to create for each component listed below during the deployment. 

<table>
   <tr>
     <th><p>Components</p></th>
     <th><p>Licenses consumed per instance</p></th>
     <th><p>Instance type</p></th>
     <th><p>Instances required for initial deployment</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Search service</p></td>
     <td><p>16</p></td>
     <td><p>m6id.4xlarge</p></td>
     <td><p>0</p></td>
     <td><p>Instances solely used for query services</p></td>
   </tr>
   <tr>
     <td><p>Fundamental database components</p></td>
     <td><p>8</p></td>
     <td><p>m6i.2xlarge</p></td>
     <td><p>1</p></td>
     <td><p>Instances used for fundamental database components, which are mainly used as the index pool</p></td>
   </tr>
   <tr>
     <td><p>Core support services</p></td>
     <td><p>0</p></td>
     <td><p>m6i.2xlarge</p></td>
     <td><p>3</p></td>
     <td><p>Instances used for peripheral support services, including Milvus Operator, Zilliz Cloud Agent, and Milvus dependencies for logging, monitoring, and alerting</p></td>
   </tr>
</table>

If the instance settings are left unconfigured, the default settings listed above will apply.

## View deployment details{#view-deployment-details}

After you create a project, you can view its status on the project page.

![Oe2zbx6qnoSE8cxax79c1OBRnXf](/byoc/Oe2zbx6qnoSE8cxax79c1OBRnXf.png)

## Follow-ups{#follow-ups}



import DocCardList from '@theme/DocCardList';

<DocCardList />