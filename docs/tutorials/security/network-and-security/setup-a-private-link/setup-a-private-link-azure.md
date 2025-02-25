---
title: "Set up a Private Link (Azure) | Cloud"
slug: /setup-a-private-link-azure
sidebar_label: "Set up a Private Link (Azure)"
beta: FALSE
notebook: FALSE
description: "This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different Microsoft Azure VPCs. | Cloud"
type: origin
token: W2fZwrrhVibvpGkd0MbcQGJQnib
sidebar_position: 3
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
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark

---

import Admonition from '@theme/Admonition';


# Set up a Private Link (Azure)

This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different Microsoft Azure VPCs.

This feature is exclusively available to Dedicated (Enterprise) clusters.

A private link is set up at the project level and is effective for all clusters deployed within the same cloud provider and region under this project.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud does not charge you for private links. However, your cloud provider may <a href="https://azure.microsoft.com/en-us/pricing/details/private-link/">charge you for each endpoint</a> that you create to access Zilliz Cloud.</p>

</Admonition>

## Before you start{#before-you-start}

Make sure the following condition is met:

- A Dedicated (Enterprise) cluster has been created. For information on how to create a cluster, see [Create Cluster](./create-cluster).

## Create private endpoint{#create-private-endpoint}

Zilliz Cloud offers you an intuitive web console to add a private endpoint. Navigate to your target project and click **Network > Private Endpoint** in the left navigation. Click **+ Private Endpoint**.

![setup_private_link_aws_01](/img/setup_private_link_aws_01.png)

### Select a cloud provider and region{#select-a-cloud-provider-and-region}

To create a private endpoint for a cluster deployed in an Azure region, select **Azure** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. Click **Next**. 

For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions). 

![setup_private_link_window_azure](/img/setup_private_link_window_azure.png)

### Establish and endpoint service{#establish-and-endpoint-service}

![establish_endpoint_service_azure](/img/establish_endpoint_service_azure.png)

Enter the subcription ID copied from the [Microsoft Azure Subscription page](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1). Below is an example

### Create an endpoint{#create-an-endpoint}

You need to complete this step on your cloud provider console.

1. Go to [Private Link Center](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade/~/privateendpoints), and click **+ Create**.

    ![TQB9bT5KKojscoxcOZbcZ4Q6nNf](/img/TQB9bT5KKojscoxcOZbcZ4Q6nNf.png)

1. Fill in the basic information for the private endpoint to create.

    ![ECcPbN4Kaog5bdxyed3cyP3HnHe](/img/ECcPbN4Kaog5bdxyed3cyP3HnHe.png)

1. Click **Next: Resource >** and choose **Connect to an Azure resource by resource ID or alias**. Then paste the one copied from the Zilliz Cloud console into **Resource ID or alias**.

    ![TDJVb0pkWoxVPIxCThvct9Hpnae](/img/TDJVb0pkWoxVPIxCThvct9Hpnae.png)

1. Select proper values in **Virtual network** and **Subnet**, and keep the default for other settings on this tab.

    ![SNdZbzo0EoP7PYxg1z4clUijnQg](/img/SNdZbzo0EoP7PYxg1z4clUijnQg.png)

1. Click **Next** until you reach the **Review + create** tab. If the validation passes, click **Create** to create the private endpoint.

    ![FJ95b4S4voMavqxFWEac3JdinAc](/img/FJ95b4S4voMavqxFWEac3JdinAc.png)

1. Once the deployment succeeds, you will see the following.

    ![QNHubedZWoJFe7xkX5ac5TOInzg](/img/QNHubedZWoJFe7xkX5ac5TOInzg.png)

1. Click **Go to resource** and see the overview page of the created Private Endpoint.

1. Click **JSON View** in the upper right corner on the **Overview** page. Note that the **Connection Status** is displayed as **Pending**. 

    ![YYrobZKr4oFJJ8xNRYicL2PZnde](/img/YYrobZKr4oFJJ8xNRYicL2PZnde.png)

    In the **Resource JSON** panel, copy the values of `name` and `properties.resourceGuid`. Your endpoint ID should be these two values joined by a period (`.`). 

    ![Vm7pbEGggo2tx6xirE3c9ZyRnSg](/img/Vm7pbEGggo2tx6xirE3c9ZyRnSg.png)

    For example, the value of the key `name` is `zilliz`, and the value of the key `properties.resourceGuid` is `d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`. Your Private Endpoint ID should be `zilliz.d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`.

### Authorize your endpoint{#authorize-your-endpoint}

Paste the endpoint ID you obtained from the Azure console into the **Endpoint ID** box on Zilliz Cloud. Click **Create**.

## Obtain a private link{#obtain-a-private-link}

After verifying and accepting the preceding attributes you have submitted, Zilliz Cloud allocates a private link for this endpoint. This process takes about 5 minutes. 

When the private link is ready, you can view it on the **Private Link** page on Zilliz Cloud.

## Set up DNS{#set-up-dns}

Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to set up DNS.

### Create a Private DNS Zone on the Azure portal{#create-a-private-dns-zone-on-the-azure-portal}

1. On the **Overview** page of the created Private Endpoint, choose **Settings** > **DNS configuration**, and copy the **IP address** of the network interface created along with the Private Endpoint.

    ![GC9jbsUp2oXgCZxkojbcrmJanJb](/img/GC9jbsUp2oXgCZxkojbcrmJanJb.png)

    The example value in the screen shot above is **10.0.0.4.**

1. Go to [Create a Private DNS zone](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones), and click **+ Create** to start the process.

1. In the **Basics** tab, select the subscription and resource group used above, and paste the Private Link URI copied from the Zilliz Cloud console in **Instance details** > **Name**. Then click **Review create**.

    ![QweWbLRSioY9Cix8nMUc0Q75n1e](/img/QweWbLRSioY9Cix8nMUc0Q75n1e.png)

1. Once the validation passes, click Create to start the process.

    ![LsmabNzrwoz9lvxJpKac2gEdnGG](/img/LsmabNzrwoz9lvxJpKac2gEdnGG.png)

1. If the deployment succeeds, you will see the following.

    ![LGB3bC80FoQnXIxx527cVkTMnAe](/img/LGB3bC80FoQnXIxx527cVkTMnAe.png)

1. Click **Go to resource** to see the **Overview** page of the created Private DNS zone.

    ![M401b0RiNoauaHxbBH6crLXlnXc](/img/M401b0RiNoauaHxbBH6crLXlnXc.png)

### Link the Private DNS Zone to your virtual network.{#link-the-private-dns-zone-to-your-virtual-network}

1. On the Overview page of the created Private DNS Zone, choose **Settings** > **Virtual network links** in the left navigation pane.

1. Click **+ Add**. In the **Add virtual network link** dialog box, enter a **Link name**, and select **Subscription** and **Virtual network** you have used above. In the **Configuration** section, select **Enable auto registration** also.

    ![KQZ2bvbbUodBlAxV98ccbrwxnWg](/img/KQZ2bvbbUodBlAxV98ccbrwxnWg.png)

    Once everything is set up as expected, click **OK** to continue. The link status of the created virtual network link will change to **Completed** after the deployment succeeds.

    ![R84pbAxcKo24pDxQvlKcyxV7n4b](/img/R84pbAxcKo24pDxQvlKcyxV7n4b.png)

1. Click **Overview** in the left navigation pane to go back to the **Overview** page of the Private DNS zone.

    ![S4bTb3ICwoWnlgxqSFrcYwEInvh](/img/S4bTb3ICwoWnlgxqSFrcYwEInvh.png)

1. Click **+ Record set**. In the **Add record set** dialog box, enter your cluster ID suffixed with `-privatelink` in **Name**, select **A - Address record** in **Type**, and set **TTL** to **10 Minutes**. Check whether the listed IP address is the one you have noted down.

    ![DtFQb18jloG9JDxYg0AcSlRsn75](/img/DtFQb18jloG9JDxYg0AcSlRsn75.png)

    Click **OK** to save the record set.

    ![YWSZbd4qEoAW64xf9gHcamC8nyd](/img/YWSZbd4qEoAW64xf9gHcamC8nyd.png)

1. Go back to the Overview page of the created Private Endpoint on the Azure portal, and you will see that the **Connection Status** of the Private Endpoint turns from **Pending** to **Approved**. 

    ![CqAEbOjDUogQGdxl3gjclaPAn1e](/img/CqAEbOjDUogQGdxl3gjclaPAn1e.png)

    Now the resources in your Azure virtual network can access the Zilliz Cloud cluster privately.

## Manage internet access to your clusters{#manage-internet-access-to-your-clusters}

After configuring your private endpoint, you can choose to disable the cluster public endpoints to restrict internet access to your project. Once you have disabled the public endpoint, users can only connect to the cluster using the private link.

To disable public endpoints:

1. Go to the **Cluster Details** page of your target cluster.

1. Navigate to the **Connection** section.

1. Click on the configurations icon next to the cluster public endpoint.

1. Read the information and click **Disable** in the **Disable Public Endpoint** dialog box.

<Admonition type="info" icon="📘" title="Notes">

<ul>
<li><p>Private endpoints only impact <a href="/reference/restful/data-plane-v2">data plane</a> access. <a href="/reference/restful/control-plane-v2">Control plane</a> can still be accessed over the public internet.</p></li>
<li><p>After you re-enable the public endpoint, you may need to wait until the local DNS cache to expire before you can access the public endpoint.</p></li>
</ul>

</Admonition>

![disable_public_endpoint](/img/disable_public_endpoint.png)

