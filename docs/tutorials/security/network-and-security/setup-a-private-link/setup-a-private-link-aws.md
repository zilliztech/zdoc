---
title: "Set up a PrivateLink (AWS) | Cloud"
slug: /setup-a-private-link-aws
sidebar_label: "Set up a PrivateLink (AWS)"
beta: FALSE
notebook: FALSE
description: "This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different AWS VPCs. | Cloud"
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
  - ANN Search
  - What are vector embeddings
  - vector database tutorial
  - how do vector databases work

---

import Admonition from '@theme/Admonition';


# Set up a PrivateLink (AWS)

This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different AWS VPCs.

This feature is exclusively available to Dedicated (Enterprise) clusters.

A private link is set up at the project level and is effective for all clusters deployed within the same cloud provider and region under this project.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud does not charge you for creating and using private endpoints. However, your cloud provider may <a href="https://aws.amazon.com/privatelink/pricing/">charge you for each endpoint</a> that you create to access Zilliz Cloud.</p>

</Admonition>

## Before you start{#before-you-start}

Ensure that:

- A Dedicated (Enterprise) cluster has been created. For information on how to create a cluster, see [Create Cluster](./create-cluster).

## Create private endpoint{#create-private-endpoint}

Zilliz Cloud offers you an intuitive web console to add a private endpoint. Navigate to your target project and click **Network > Private Endpoint** in the left navigation. Click **+ Private Endpoint**.

![setup_private_link_aws_01](/img/setup_private_link_aws_01.png)

### Select a cloud provider and region{#select-a-cloud-provider-and-region}

To create a private endpoint for a cluster deployed in an AWS region, select **AWS** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. Click **Next**. 

For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions). 

![setup_private_link_window](/img/setup_private_link_window.png)

### Create an Endpoint{#create-an-endpoint}

You need to complete this step on your cloud provider console using either the UI console or CLI.

- **Via UI console**

    1. Switch to the **Via UI Console** tab.

    1. Navigate to the AWS console page.On the AWS console, check the if the cloud region corresponds to the cloud region you selected in Step 1. Click **Endpoints** in the left navigation. Click **Create Endpoint**.

        ![setup_private_link_window_gcp](/img/setup_private_link_window_gcp.png)

    1. On the **Create Endpoint** page, select **Endpoint services that use NLBs and GWLBs** as the endpoint **Type**.

        ![create_endpoint_type_gcp](/img/create_endpoint_type_gcp.png)

    1. Switch back to the Zilliz Cloud console, copy the Service Name.

    1. Switch to the AWS console. In **Service Settings**, paste the **Service Name** you copied from the Zilliz Cloud web console into the **Service Name** field. Then click **Verify service**.

        ![enter_service_name_gcp](/img/enter_service_name_gcp.png)

    1. When the service name is verified, complete network settings, subnet, security groups, and click **Create**.

    1. When the endpoint is successfully created, copy the Endpoint ID (starting with "vpce-").

- **Via CLI**

    ![setup_private_link_aws_via_CLI](/img/setup_private_link_aws_via_CLI.png)

    1. Switch to the **Via CLI** tab.

    1. Enter the **VPC ID**. 

        To view your VPCs, navigate to the [Amazon VPC console](https://console.aws.amazon.com/vpc/). In the navigation pane, choose **Your VPCs**. Find the VPC of your desire and copy its ID. Enter this ID in **VPC ID** on Zilliz Cloud.

        To create a VPC, see [Create a VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html#Create-VPC).

    1. Enter the **Subnet IDs**.

        Subnets are sub-divisions of your VPC. You need to have a subnet that resides in the same region as the private endpoint to be created. To view your subnets, navigate to the [Amazon VPC console](https://console.aws.amazon.com/vpc/). Change the current region to the one specified for creating the private link. In the navigation pane, choose **Subnets**. Find the subnet of your desire and copy its ID. Enter this ID in **Subnet IDs** on Zilliz Cloud. 

        To create a subnet, see [Create a Subnet in Your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-subnets.html#create-subnets).

    1. Click **Copy and Go**.

        You will be redirected to your cloud provider console. In the top navigation, launch the AWS CloudShell. Run the CLI command you just copied from Zilliz Cloud in the CloudShell.

        ![setup_private_link_aws_cloud_shell](/img/setup_private_link_aws_cloud_shell.png)

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

        In the returned message, copy the VpcEndpointId (starting with "vpce-") of the created VPC endpoint.

### Authorize your endpoint{#authorize-your-endpoint}

Paste the endpoint ID you obtained from the AWS console into the **Endpoint ID** box on Zilliz Cloud. Click **Create**.

![setup_private_link_aws_authorize_endpoint](/img/setup_private_link_aws_authorize_endpoint.png)

## Obtain a private link{#obtain-a-private-link}

After verifying and accepting the VPC endpoint you have submitted, Zilliz Cloud allocates a private link for this endpoint. This process takes about 5 minutes. 

When the private link is ready, you can view it on the **Private Link** page on Zilliz Cloud.

## Set up a DNS record{#set-up-a-dns-record}

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

    ![VoCsbJtTDo1glVx0vtGcqWPRnEd](/img/VoCsbJtTDo1glVx0vtGcqWPRnEd.png)

    1. In the created hosted zone, click **Create record**.

    1. On the **Create record** page, switch on **Alias**, and select Route traffic to as follows:

        1. Select **Alias to VPC endpoint** in the first drop-down list.

        1. Select the cloud region in the second drop-down list.

        1. Enter the name of the endpoint that has been created above.

    1. Click **Create records**.

## Manage internet access to your clusters{#manage-internet-access-to-your-clusters}

After configuring your private endpoint, you can choose to disable the cluster public endpoints to restrict internet access to your project. Once you have disabled the public endpoint, users can only connect to the cluster using the private link.

To disable public endpoints:

1. Go to the **Cluster Details** page of your target cluster.

1. Navigate to the **Connect** section.

1. Click on the configurations icon next to the cluster public endpoint.

1. Read the information and click **Disable** in the **Disable Public Endpoint** dialog box.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Private endpoints only impact <a href="/reference/restful/data-plane-v2">data plane</a> access. <a href="/reference/restful/control-plane-v2">Control plane</a> can still be accessed over the public internet.</p></li>
<li><p>After you re-enable the public endpoint, you may need to wait until the local DNS cache to expire before you can access the public endpoint.</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/disable_public_endpoint.png)

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

    You can use a `curl` command to test the connectivity of the private link. In a normal case, it returns a 400 response.

    ![ERtlbR2v7oA3Q4xXRlccM3VhnNc](/img/ERtlbR2v7oA3Q4xXRlccM3VhnNc.png)

    If the `curl` command hangs without any response as in the following screenshot, you need to set up proper security group rules by referring to step 9 in [Create a VPC endpoint](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html).

    ![KHj0bEy7ZojM6axnR0ocg1LPnue](/img/KHj0bEy7ZojM6axnR0ocg1LPnue.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>Two security groups must be configured: one for the EC2 instance, which must allow traffic on the port associated with your private link, and another for the VPC endpoint, which must permit traffic from the IP address of the EC2 instance and target the specified port number.</p>

    </Admonition>

