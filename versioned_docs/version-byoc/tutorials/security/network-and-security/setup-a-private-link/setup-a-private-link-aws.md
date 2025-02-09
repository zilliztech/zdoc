---
title: "Set up a PrivateLink (AWS) | BYOC"
slug: /setup-a-private-link-aws
sidebar_label: "Set up a PrivateLink (AWS)"
beta: FALSE
notebook: FALSE
description: "This guide demonstrates the procedure for setting up a private link from a Zilliz BYOC project to your service hosted in different AWS VPCs. | BYOC"
type: origin
token: GBY6wbUmwi9lLjkXSuKccODgnne
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - privatelink
  - private endpoint
  - private service connect
  - aws
  - gcp
  - azure
  - nearest neighbor search
  - Agentic RAG
  - rag llm architecture
  - private llms

---

import Admonition from '@theme/Admonition';


# Set up a PrivateLink (AWS)

This guide demonstrates the procedure for setting up a private link from a Zilliz BYOC project to your service hosted in different AWS VPCs.

## Before you start{#before-you-start}

Ensure that:

- You have already created a VPC Endpoint using AWS CloudFormation, [AWS Console](./configure-vpc#step-3-optional-create-a-vpc-endpoint), or [the Terraform scripts](./bootstrap-infrastructure-terraform).

## Set up a DNS record{#set-up-a-dns-record}

Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to create a CNAME record in your DNS zone to resolve the private link to the DNS name of your VPC endpoint.

- **Create a hosted zone using Amazon Route 53**

    Amazon Route 53 is a web-based DNS service. Create a hosted DNS zone so that you can add DNS records to it.

    ![O8dObi5aBogsL1xDBY4cgEtInCb](/byoc/O8dObi5aBogsL1xDBY4cgEtInCb.png)

    1. Log into your AWS account and go to [Hosted zones](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#).

    1. Click **Create hosted zone**.

    1. In the **Hosted zone configuration** section, set the following parameters.

        <table>
           <tr>
             <th><p><strong>Parameter name</strong></p></th>
             <th><p><strong>Parameter Description</strong></p></th>
           </tr>
           <tr>
             <td><p><strong>Domain name</strong></p></td>
             <td><p></p><p></p><p>Use <code>byoc.zillizcloud.com</code>.</p><p></p></td>
           </tr>
           <tr>
             <td><p><strong>Description</strong></p></td>
             <td><p>Description used to distinguish hosted zones.</p></td>
           </tr>
           <tr>
             <td><p><strong>Type</strong></p></td>
             <td><p>Select <strong>Private hosted zone</strong>.</p></td>
           </tr>
        </table>

    1. In the VPCs to associate with the hosted zone section, add your VPC ID to associate it with the hosted zone.

- **Create an alias record in the hosted zone**

    An alias record is a type of DNS record that maps an alias name to a true or canonical domain name. Create an alias record to map the private link allocated by Zilliz Cloud to the DNS name of your VPC endpoint. Then, you can use the private link to access your cluster privately.

    ![KVjsbqBGRofmmxxmqvBccvOanDf](/byoc/KVjsbqBGRofmmxxmqvBccvOanDf.png)

    1. In the created hosted zone, click **Create record**.

    1. Set **Record name** to match the cloud region where your current project is deployed.

        <table>
           <tr>
             <th><p>AWS Region</p></th>
             <th><p>Record name</p></th>
           </tr>
           <tr>
             <td><p>us-west-2</p></td>
             <td><p><code>zilliz-byoc-us</code></p></td>
           </tr>
           <tr>
             <td><p>eu-central-1</p></td>
             <td><p><code>zilliz-byoc-eu</code></p></td>
           </tr>
        </table>

    1. On the **Create record** page, switch on **Alias**, and select Route traffic to as follows:

        1. Select **Alias to VPC endpoint** in the first drop-down list.

        1. Select the cloud region in the second drop-down list.

        1. Enter the name of the endpoint that has been created above.

    1. Click **Create records**.

