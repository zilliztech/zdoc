---
slug: /setup-a-private-link-aws
beta: FALSE
notebook: FALSE
type: origin
token: GBY6wbUmwi9lLjkXSuKccODgnne
sidebar_position: 1
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - aws

---

import Admonition from '@theme/Admonition';


# Set up a Private Link (AWS)

This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different AWS VPCs.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud does not charge you for private links. However, your cloud provider may <a href="https://aws.amazon.com/privatelink/pricing/">charge you for each endpoint</a> that you create to access Zilliz Cloud.</p>

</Admonition>

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud.

- A cluster has been created. For information on how to create a cluster, see [Create Cluster](./create-cluster).

## Add a private link{#add-a-private-link}

Zilliz Cloud offers you an intuitive wizard to add a private link. On the **Private Link** tab in your project, click **+ Add Private Link** and configure the settings.

Setting up a private link is project-level. When you configure a private link for a cluster, it applies to its neighboring clusters in the same project deployed in the same cloud region.

### Select a cloud provider and region.{#select-a-cloud-provider-and-region}

To create a private link for a cluster deployed in an AWS region, select **AWS** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions).

<Admonition type="info" icon="📘" title="Notes">

<p>Once you have created a private link in a project, it applies immediately to its member clusters that have been deployed in the specified region. For those clusters that undergo maintenance then, such as scaling or patch-fixing, the private link applies to them after maintenance.</p>

</Admonition>

![setup_private_link_02](/img/setup_private_link_02.png)

### Obtain a VPC ID{#obtain-a-vpc-id}

Before creating a VPC endpoint, you need to have a VPC on your Amazon console. To view your VPCs, do as follows:

1. Open the [Amazon VPC console](https://console.aws.amazon.com/vpc/).

1. In the navigation pane, choose **VPCs**.

1. Find the VPC of your desire and copy its ID.

1. Enter this ID in **VPC ID** on Zilliz Cloud.

To create a VPC, see [Create a VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html#Create-VPC).

### Obtain a subnet ID{#obtain-a-subnet-id}

Subnets are sub-divisions of your VPC. You need to have a subnet that resides in the same region as the private link to be created. To view your subnets, do as follows:

1. Open the [Amazon VPC console](https://console.aws.amazon.com/vpc/).

1. Change the current region to the one specified for creating the private link.

1. In the navigation pane, choose **Subnets**.

1. Find the subnet of your desire and copy its ID.

1. Enter this ID in **Subnet IDs** on Zilliz Cloud. To create a subnet, see [Create a Subnet in Your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-subnets.html#create-subnets).

### Obtain a VPC endpoint{#obtain-a-vpc-endpoint}

Copy the command generated at the bottom of the **Add Private Link** dialog box on Zilliz Cloud, and run this command in your Amazon CloudShell to create a VPC endpoint.

The returned message is similar to the following:

```json
{
    "VpcEndpoint": {
        # Copy this and fill it in "Your VPC Private Link ID"
        "VpcEndpointId": "vpce-0ce90d01341533a5c",
        "VpcEndpointType": "Interface",
        ...
        "DnsEntries": [
            {
                # Copy this one and use it as "VPCE_DNS" in the next step.
                "DnsName": "vpce-0ce90d01341533a5c-ngbqfdnj.vpce-svc-0b62964bfd0edfb74.us-west-2.vpce.amazonaws.com",
                "HostedZoneId": "Z1YSA3EXCYUU9Z"
            },
            {
                "DnsName": "vpce-0ce90d01341533a5c-ngbqfdnj-us-west-2a.vpce-svc-0b62964bfd0edfb74.us-west-2.vpce.amazonaws.com",
                "HostedZoneId": "Z1YSA3EXCYUU9Z"
            }
        ]
}
```

In the returned message, copy the ID and DNS name of the created VPC endpoint.

Then, enter the VPC endpoint ID in **Your VPC Private Link ID** and click **Add**.

### Obtain a private link{#obtain-a-private-link}

After verifying and accepting the VPC endpoint you have submitted, Zilliz Cloud allocates a private link for this endpoint. You can view it on the details tab of your cluster.

### Set up a DNS record{#set-up-a-dns-record}

Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to create a CNAME record in your DNS zone to resolve the private link to the DNS name of your VPC endpoint.

- **Create a hosted zone using Amazon Route 53**

    Amazon Route 53 is a web-based DNS service. Create a hosted DNS zone so that you can add DNS records to it.

    ![A1zxblLRPo96Kvx0zzccZ485nGb](/img/A1zxblLRPo96Kvx0zzccZ485nGb.png)

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
             <td><p>Private Link allocated by Zilliz Cloud for the target cluster.</p></td>
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

    ![VoCsbJtTDo1glVx0vtGcqWPRnEd](/img/VoCsbJtTDo1glVx0vtGcqWPRnEd.jpeg)

    1. In the created hosted zone, click **Create record**.

    1. On the **Create record** page, switch on **Alias**, and select Route traffic to as follows:

        1. Select **Alias to VPC endpoint** in the first drop-down list.

        1. Select the cloud region in the second drop-down list.

        1. Enter the name of the endpoint that has been created above.

    1. Click **Create records**.

## Troubleshooting{#troubleshooting}

### Why does it always report a timeout when connecting to the private link on AWS?{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

A timeout usually occurs for the following reasons:

- No private DNS records exist.

    If a DNS record exists, you can ping the private link as follows:

    ![QOanbDGrYovMXHxczXmcCbUcnsc](/img/QOanbDGrYovMXHxczXmcCbUcnsc.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>If the IP address of the VPC endpoint has been resolved correctly in the output of the ping request, the DNS record works. </p>

    </Admonition>

    If you see the following, you need to [set up the DNS record](./setup-a-private-link-aws#set-up-a-dns-record).

    ![X5ahblpw1oRxp8xKR3OczuD9nFf](/img/X5ahblpw1oRxp8xKR3OczuD9nFf.png)

- No or invalid security group rules exist.

    You need to properly set the security group rules for the traffic from your EC2 instance to your VPC endpoint in the AWS console. A proper security group within your VPC should allow inbound access from your EC2 instances on the port suffixed to your private link.

    ![ERtlbR2v7oA3Q4xXRlccM3VhnNc](/img/ERtlbR2v7oA3Q4xXRlccM3VhnNc.png)

    You can use a `curl` command to test the connectivity of the private link. In a normal case, it returns a 400 response.

    ![KHj0bEy7ZojM6axnR0ocg1LPnue](/img/KHj0bEy7ZojM6axnR0ocg1LPnue.png)

    If the `curl` command hangs without any response as in the following screenshot, you need to set up proper security group rules by referring to step 9 in [Create a VPC endpoint](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html).

    <Admonition type="info" icon="📘" title="Notes">

    <p>Two security groups must be configured: one for the EC2 instance, which must allow traffic on the port associated with your private link, and another for the VPC endpoint, which must permit traffic from the IP address of the EC2 instance and target the specified port number.</p>

    </Admonition>