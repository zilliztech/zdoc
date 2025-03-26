---
title: "Deploy BYOC-I on AWS | BYOC"
slug: /deploy-byoc-i-aws
sidebar_label: "Deploy BYOC-I on AWS"
beta: CONTACT SALES
notebook: FALSE
description: "This page explains how to create a Bring-Your-Own-Cloud (BYOC) data plane with a BYOC agent in your AWS Virtual Private Cloud (VPC). | BYOC"
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
  - hybrid search
  - lexical search
  - nearest neighbor search
  - Agentic RAG

---

import Admonition from '@theme/Admonition';


# Deploy BYOC-I on AWS

This page explains how to create a Bring-Your-Own-Cloud (BYOC) data plane with a BYOC agent in your AWS Virtual Private Cloud (VPC).

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Prerequisites{#prerequisites}

Ensure that 

- You are the owner of a BYOC-I organization.

## Procedures{#procedures}

### Step 1: Prepare the deployment environment{#step-1-prepare-the-deployment-environment}

A deployment environment is a local machine, a virtual machine (VM), or a CI/CD pipeline configured to run the Terraform configuration files and deploy the data plane of your BYOC-I project. In this step, you need to 

- **Configure AWS credentials (AWS profile or access key).**

    For details on how to configure AWS credentials, refer to [this document](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-files.html).

- **Install the latest Terraform binary.**

    For details on how to install Terraform, refer to [this document](https://developer.hashicorp.com/terraform/install?product_intent=terraform).

### Step 2: Create a project{#step-2-create-a-project}

Within your BYOC-I organization, click the **Create Project and Deploy Data Plane** button to start the deployment.

![Xd4ObksJao97jdxSFVTclO4Fno6](/byoc/Xd4ObksJao97jdxSFVTclO4Fno6.png)

### Step 3: Set up the general settings{#step-3-set-up-the-general-settings}

In **General Settings**, you need to set the project name and determine the cloud providers and regions where Zilliz Cloud deploys the data plane for the project.

![B7VJbAkvao0lf8xAXzAc3ZeGnTd](/byoc/B7VJbAkvao0lf8xAXzAc3ZeGnTd.png)

1. Set **Project Name**.

1. Select **Cloud Provider** and **Region**.

1. (Optional) Configure **Instance Settings**. 

    In a BYOC project, the search service, fundamental database components, and core support services use different instances. You can set instance types for these services and components. 

    For details, see [Instance Settings](./deploy-byoc-i-aws#instance-settings).

1. Click **Create and Next**.

### Step 4: Deploy the data plane{#step-4-deploy-the-data-plane}

Follow the steps displayed in the dialog to deploy the data plane for the currently created project.

![GHGqbw4UroKPu7xoEWmcDQaDnEd](/byoc/GHGqbw4UroKPu7xoEWmcDQaDnEd.png)

For details on running the above Terraform scripts, refer to the [Zilliz Cloud BYOC-I Project Setup Guide](https://registry.terraform.io/providers/zilliztech/zillizcloud/latest/docs/guides/create-a-byoc-i-project).

## Manage projects{#manage-projects}

![AHEybTRhto0gcKxnKIucbm3inte](/byoc/AHEybTRhto0gcKxnKIucbm3inte.png)

### Projects with an Undeploy tag{#projects-with-an-undeploy-tag}

If the status tag on the right corner of a project card reads **Undeploy**, you can always click the **Deploy Data Plane** button on the project card to reopen it. To rename or delete the project, click the **...** button in the project card and select **Rename** or **Delete** from the drop-down menu.  

### Projects with a Deploying tag{#projects-with-a-deploying-tag}

Once you have prepared the deployment environment and executed the displayed commands, you must wait for the BYOC agent to activate. When the status tag on the project card reads **Deploying** and shows the progress percentage, you cannot rename or delete the project until the data plane is in place.

### Projects with a Running tag{#projects-with-a-running-tag}

Once the status tag on a project card reads **Running**, you can start creating clusters in the project. To rename or delete a running project, ensure that there are no clusters in the project.

## Instance settings{#instance-settings}

During the project deployment, Zilliz Cloud creates the fundamental database components and core support services. When the project is ready, you can create clusters in the project. At this point, Zilliz Cloud creates instances for search services on your behalf. 

![OvCTbAZuMo3LmSxTMAIcIUYMnZd](/byoc/OvCTbAZuMo3LmSxTMAIcIUYMnZd.png)

You need to determine the types of instances to create for each component listed below during the deployment. 

<table>
   <tr>
     <th><p>Components</p></th>
     <th><p>Licenses consumed per instance</p></th>
     <th><p>Instance type</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p>Search service</p></td>
     <td><p>16</p></td>
     <td><p>m6id.4xlarge</p></td>
     <td><p>Instances solely used for query services</p></td>
   </tr>
   <tr>
     <td><p>Fundamental database components</p></td>
     <td><p>8</p></td>
     <td><p>m6i.2xlarge</p></td>
     <td><p>Instances used for fundamental database components, which are mainly used as the index pool</p></td>
   </tr>
   <tr>
     <td><p>Core support services</p></td>
     <td><p>0</p></td>
     <td><p>m6i.2xlarge</p></td>
     <td><p>Instances used for peripheral support services, including Milvus Operator, Zilliz Cloud Agent, and Milvus dependencies for logging, monitoring, and alerting</p></td>
   </tr>
</table>

If the instance settings are left unconfigured, the default settings listed above will apply.