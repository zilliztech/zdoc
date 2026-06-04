---
title: "Deploy BYOC-I on AWS | BYOC"
slug: /deploy-byoc-i-aws
sidebar_key: deploy-byoc-i-aws
sidebar_label: "Deploy BYOC-I on AWS"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: CONTACT SALES
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

---

import Admonition from '@theme/Admonition';


import Procedures from '@site/src/components/Procedures';

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

- You have been granted the permissions listed in [Required permissions](./deploy-byoc-i-aws#required-permissions).

## Procedures\{#procedures}

### Step 1: Prepare the deployment environment\{#step-1-prepare-the-deployment-environment}

A deployment environment is a local machine, a virtual machine (VM), or a CI/CD pipeline configured to run the Terraform configuration files and deploy the data plane of your BYOC-I project. In this step, you need to 

- **Configure AWS credentials (AWS profile or access key).**

    For details on how to configure AWS credentials, refer to [this document](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

- **Install the latest Terraform binary.**

    For details on how to install Terraform, refer to [this document](https://developer.hashicorp.com/terraform/install?product_intent=terraform).

### Step 2: Create a project\{#step-2-create-a-project}

Within your BYOC-I organization, click the **Create Project** button to start the deployment. In the prompted dialog box, set **Zilliz BYOC Project Name**, and click **Create and Next**.

The project is created at the end of this step, and you will be redirected to the **Deploy Data Plane** dialog box.

![BYiTwvFLRhOJvRbMWNSc7zitnPu](https://zdoc-images.s3.us-west-2.amazonaws.com/BYiTwvFLRhOJvRbMWNSc7zitnPu.png)

### Step 3: Deploy the data plane\{#step-3-deploy-the-data-plane}

<Procedures>

1. Set **Data Plane Name** and **Cloud Region**, and click **Next**.

    Click **Cancel** to stop deploying the data plane. However, the project created above is still available. You can start deploying a data plane in the project at any time and add multiple data planes to a project. 

    ![Lxi8wtMwmhRETHbRDqucLMx1nvb](https://zdoc-images.s3.us-west-2.amazonaws.com/Lxi8wtMwmhRETHbRDqucLMx1nvb.png)

1. Determine whether to enable **AWS PrivateLink**.

    This option allows private connectivity to the clusters within the current project. If you enable this option, you must create a VPC Endpoint for private connectivity.

    ![WIjGwV6bvhzqk1ba4YecWQGonTh](https://zdoc-images.s3.us-west-2.amazonaws.com/WIjGwV6bvhzqk1ba4YecWQGonTh.png)

1. Select an architecture type that matches your application in **Architecture**. 

    This determines the architecture type of the Zilliz BYOC image to use. Available options are **X86** and **ARM**.

1.  In **Resource Settings**, you need to

    1. Enable or disable **Auto-scaling** to allow Zilliz Cloud to automatically adjust the number of EC2 instances within a defined range based on your project workloads, ensuring efficient resource use.

    1. Configure **Initial Project Size**. 

        In a BYOC project, the query node, index services, Milvus components, and dependencies use different types of EC2 instances. You can set instance types and counts for these services and components individually. 

        If **Auto-scaling** is disabled, simply specify the number of EC2 instances required for each project component in the corresponding **Count** field.

        ![CxLubcykMohdUbxSlfVcj7ecn8d](https://zdoc-images.s3.us-west-2.amazonaws.com/cxlubcykmohdubxslfvcj7ecn8d.png "CxLubcykMohdUbxSlfVcj7ecn8d")

        Once **Auto-scaling** is enabled, you need to specify a range for Zilliz Cloud to automatically scale the number of EC2 instances based on actual project workloads by setting the corresponding **Min** and **Max** fields.

        ![FYu6bpIW9oURxuxkZlbc9ETzn3d](https://zdoc-images.s3.us-west-2.amazonaws.com/fyu6bpiw9ourxuxkzlbc9etzn3d.png "FYu6bpIW9oURxuxkZlbc9ETzn3d")

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

        You can also customize the settings by selecting **Custom** in **Initial Project Size** and adjusting the EC2 instance types and counts for all data plane components. If your preferred EC2 instance types are not listed, please [contact Zilliz support](https://zilliz.com/contact) for further assistance. 

    1. Determine whether to enable **Tiered Query Node**.

        This option determines whether you can create tiered-storage clusters. Once you select this option, you can set the instance type and count for the tiered query nodes. 

        ![FKDsbxbUuoEqMJxniZGcSZMQnb3](https://zdoc-images.s3.us-west-2.amazonaws.com/fkdsbxbuuoeqmjxnizgcszmqnb3.png "FKDsbxbUuoEqMJxniZGcSZMQnb3")

        <Admonition type="info" icon="📘" title="Notes">

        <ul>
        <li><p>Your choice in <strong>Project Size</strong> does not affect the settings in <strong>Tiered Storage Node</strong>.</p></li>
        <li><p>If <strong>Auto-scaling</strong> is disabled, the sum of the <strong>Default Query Node</strong> count and the <strong>Tiered Query Node</strong> count should be a positive integer.</p></li>
        <li><p>If <strong>Auto-scaling</strong> is enabled, the sum of the <strong>Min</strong> values of both the <strong>Default Query Node</strong> and the <strong>Tiered Query Node</strong> should be a positive integer.</p></li>
        </ul>

        </Admonition>

1. Click **Next**.

</Procedures>

### Step 4: Deploy the data plane\{#step-4-deploy-the-data-plane}

Follow the steps displayed in the dialog to deploy the data plane for the currently created project.

![GHGqbw4UroKPu7xoEWmcDQaDnEd](https://zdoc-images.s3.us-west-2.amazonaws.com/ghgqbw4urokpu7xoewmcdqadned.png "GHGqbw4UroKPu7xoEWmcDQaDnEd")

For details on running the above Terraform scripts, refer to the [Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project).

Once you have deployed the project's data plane and created clusters, you can connect to these clusters either through direct VPC access or via AWS PrivateLink. For details, refer to [Connect to BYOC Clusters](./prepare-for-cluster-connection).

## Manage dataplanes\{#manage-dataplanes}

![RJwFwpytnhWVcabKr6tcNsnfnrb](https://zdoc-images.s3.us-west-2.amazonaws.com/RJwFwpytnhWVcabKr6tcNsnfnrb.png)

### Data planes with an Undeploy tag\{#data-planes-with-an-undeploy-tag}

If the status tag on the right corner of a project card reads **Undeploy**, you can always click the **Deploy Data Plane** button on the project card to reopen it. To rename or delete the project, click the **...** button in the project card and select **Rename** or **Delete** from the drop-down menu.  

### Data planes with a Deploying tag\{#data-planes-with-a-deploying-tag}

Once you have prepared the deployment environment and executed the displayed commands, you must wait for the BYOC agent to activate. When the status tag on the project card reads **Deploying** and shows the progress percentage, you cannot rename or delete the project until the data plane is in place.

### Data planes with a Running tag\{#data-planes-with-a-running-tag}

Once the status tag on a project card reads **Running**, you can start creating clusters in the project. To rename or delete a running project, ensure that there are no clusters in the project.

## Technical support access\{#technical-support-access}

To assist you with troubleshooting and maintenance operations, Zilliz Cloud enables technical support to access your project's data plane by default. 

![XThkbwy5hoho7Ixpgg5ctUp1nRe](https://zdoc-images.s3.us-west-2.amazonaws.com/xthkbwy5hoho7ixpgg5ctup1nre.png "XThkbwy5hoho7Ixpgg5ctUp1nRe")

When you click **Technical Support Access** from the target project's drop-down menu to view the current settings.

![Z4L2bIrA0onlxPxFNUNcYv78nIe](https://zdoc-images.s3.us-west-2.amazonaws.com/z4l2bira0onlxpxfnuncyv78nie.png "Z4L2bIrA0onlxPxFNUNcYv78nIe")

You can disable it to meet data governance and security requirements.

## Required permissions\{#required-permissions}

In this section, you will find all the key permissions required to deploy BYOC-I on AWS.

### VPC and networking resource permissions\{#vpc-and-networking-resource-permissions}

- **VPC Management**: Create, modify, describe, and delete VPCs

- **Subnet Operations**: Create and delete subnets

- **Security Groups**: Create, modify, and delete security groups and their rules

- **Route Tables**: Create, associate, and manage route tables

- **Internet Gateways**: Create, attach, and detach internet gateways

- **NAT Gateways**: Create and delete NAT gateways with Elastic IPs

- **VPC Endpoints**: Create and delete VPC endpoints for AWS services

- **Launch Templates**: Create and delete EC2 launch templates

- **Route53**: Associate VPCs with hosted zones

- **Tagging**: Create and delete tags on VPC resources

### IAM roles and BYOC-I deployment permissions\{#iam-roles-and-byoc-i-deployment-permissions}

- **Role Management**: Create, get, list, attach/detach policies, and delete IAM roles

- **Policy Management**: Create, get, list versions, and delete IAM policies

- **Tagging**: Tag and untag roles and policies

- **Identity Verification**: Get caller identity (STS)

### S3 bucket permissions\{#s3-bucket-permissions}

- **Bucket Operations**: Create, list, get configuration, and delete S3 buckets

- **Bucket Configuration**: Manage bucket tagging, policies, ACLs, CORS, versioning, encryption, and public access settings

- **Object Tagging**: Put, get, and delete object tags

- **Bucket Listing**: List all buckets in the account

### EKS cluster and related resource permissions\{#eks-cluster-and-related-resource-permissions}

- **Service-Linked Roles**: Create EKS service-linked roles for cluster and node group management

- **OIDC Provider**: Create, tag, get, and delete OpenID Connect providers (with `Vendor=zilliz-byoc` tag requirement)

- **IAM Role Management**: Read EKS roles and pass roles to EKS service

- **EC2 Resources**: Create launch templates, run instances, and manage tags (with `Vendor=zilliz-byoc` tag requirement)

- **EKS Cluster Operations**: Create, update, describe, tag, and delete EKS clusters

- **Node Group Operations**: Create, update, describe, and delete EKS node groups

- **Addon Management**: Create, update, describe, and delete EKS addons

- **Access Entry Management**: Create, update, describe, and delete EKS access entries and pod identity associations

