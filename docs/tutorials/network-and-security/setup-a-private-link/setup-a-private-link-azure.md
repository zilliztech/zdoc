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

---

import Admonition from '@theme/Admonition';


# Set up a Private Link (Azure)

This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different Microsoft Azure VPCs.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud does not charge you for private links. However, your cloud provider may <a href="https://azure.microsoft.com/en-us/pricing/details/private-link/">charge you for each endpoint</a> that you create to access Zilliz Cloud.</p>

</Admonition>

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud.

- A cluster has been created. For information on how to create a cluster, see [Create Cluster](./create-cluster).

## Add a private link{#add-a-private-link}

Zilliz Cloud offers you an intuitive wizard to add a private link. On the **Private Link** tab in your project, click **+ Add Private Link** and configure the settings.

### Copy your Cluster ID{#copy-your-cluster-id}

On the **Cluster Details** tab in the Zilliz Cloud console, copy your cluster ID.

![OOhXbh65DopBKhxjNr7ciP3WnHe](/img/OOhXbh65DopBKhxjNr7ciP3WnHe.png)

### Start creating a Private Link on Zilliz Cloud{#start-creating-a-private-link-on-zilliz-cloud}

In the **Create Private Link** dialog box,

1. Select a provider and region.

    ![CucwbnXMvo4MKIxZFblckLexnHe](/img/CucwbnXMvo4MKIxZFblckLexnHe.png)

1. Enter your user ID from the [Microsoft Azure Subscription page](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1).

    ![InPxbRBPLofV2jxhzkVc9hUpnDg](/img/InPxbRBPLofV2jxhzkVc9hUpnDg.png)

1. Click **Add** to have Zilliz Cloud verify the submitted user ID and whitelist it.

    ![DRzObdSHfoFFesxGSAmclzT1n4X](/img/DRzObdSHfoFFesxGSAmclzT1n4X.png)

1. Copy the endpoint service alias in the above dialog box similar to the following.

    ![AYcpbsHXcopDtoxrdgycSuCUnZe](/img/AYcpbsHXcopDtoxrdgycSuCUnZe.png)

### Create a Private Endpoint on the Azure portal{#create-a-private-endpoint-on-the-azure-portal}

1. Go to [Private Link Center](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade/~/privateendpoints), and click **+ Create**.

    ![NybUbya1ZoeQFFxsoahcGr7ZnsB](/img/NybUbya1ZoeQFFxsoahcGr7ZnsB.png)

1. Fill in the basic information for the private endpoint to create.

    ![RikRbsk6JoZatzxccNycL1W4nKb](/img/RikRbsk6JoZatzxccNycL1W4nKb.png)

1. Click **Next: Resource >** and choose **Connect to an Azure resource by resource ID or alias**. Then paste the one copied from the Zilliz Cloud console into **Resource ID or alias**.

    ![GTPnbA6kbo2cHjxMjggcvW0Wnvf](/img/GTPnbA6kbo2cHjxMjggcvW0Wnvf.png)

1. Select proper values in **Virtual network** and **Subnet**, and keep the default for other settings on this tab.

    ![Sl6MbHp9ho087TxkIo7cLoFrnOc](/img/Sl6MbHp9ho087TxkIo7cLoFrnOc.png)

1. Click **Next** until you reach the **Review + create** tab. If the validation passes, click **Create** to create the private endpoint.

    ![SouVbDyimoKdpKxDOKhcnDSjnRb](/img/SouVbDyimoKdpKxDOKhcnDSjnRb.png)

1. Once the deployment succeeds, you will see the following.

    ![IUOxbdG2noCDmZxS2bhcDvmMnrb](/img/IUOxbdG2noCDmZxS2bhcDvmMnrb.png)

1. Click **Go to resource** and see the overview page of the created Private Endpoint.

1. Click **JSON View** in the upper right corner on the **Overview** page. Note that the **Connection Status** is displayed as **Pending**. 

    ![TZYqb1YO5oXfFWxSj6xcdYqQnTh](/img/TZYqb1YO5oXfFWxSj6xcdYqQnTh.png)

    In the **Resource JSON** panel, copy the values of `name` and `properties.resourceGuid`. Your endpoint ID should be these two values joined by a period (`.`). 

    ![ESbBbLrCEoXHGXxsYIacacfknRg](/img/ESbBbLrCEoXHGXxsYIacacfknRg.png)

    For example, the value of the key `name` is `zilliz`, and the value of the key `properties.resourceGuid` is `d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`. Your Private Endpoint ID should be `zilliz.d73e9b55-7b9c-4f8d-8f0a-40e737f1ccbf`.

1. Fill your Private Endpoint ID in the **Create Private Link** dialog box on the Zilliz Cloud console and click **Create**.

    ![KBd4bLBWto3SuyxGHswcBGisnxc](/img/KBd4bLBWto3SuyxGHswcBGisnxc.png)

    Upon creation, Zilliz Cloud starts processing your private link request. The private link should be available within 5 minutes. 

1. Once the private link is ready, you will see the link URI on the **Cluster Details** tab of your Zilliz Cloud cluster. Copy the private link URI for the next step.

    ![PKhPbrMGloqncbxhxpCcZamlnVg](/img/PKhPbrMGloqncbxhxpCcZamlnVg.png)

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

