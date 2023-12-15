---
slug: /setup-a-private-link
beta: FALSE
notebook: FALSE
token: O5W3wHvmbiVSoLkzKgHcvB9XnUb
sidebar_position: 2
---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Set up a Private Link

Zilliz Cloud offers private access to your cluster through a private link. This is useful if you do not want your cluster traffic to go over the Internet.

To enable private client access to clusters on Zilliz Cloud, you must create an endpoint in each of the subnets within your application's VPC. Then, register the VPC, subnets, and endpoints with Zilliz Cloud so that it can allocate a private link for you to set up a DNS record mapping the private link to the endpoints.

The following figure demonstrates how it works.

![private_link](/img/private_link.png)

This guide walks you through setting up a private link for a cluster.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud.

- A cluster has been created. For information on how to create a cluster, see [Create Cluster](./create-cluster).

## Add a private link{#add-a-private-link}

Zilliz Cloud offers you an intuitive wizard to add a private link. On the **Private Link** tab in your project, click **+ Add Private Link** and configure the settings.

Setting up a private link is project-level. When you configure a private link for a cluster, it applies to its neighboring clusters in the same project deployed in the same cloud region.

<Tabs groupId="private-link" defaultValue="aws" values={[{"label":"Amazon AWS","value":"aws"},{"label":"Google GCP","value":"gcp"},{"label":"Microsoft Azure","value":"azure"}]}>

<TabItem value="aws">

1. Select a cloud provider and region

    To create a private link for a cluster deployed in an AWS region, select **AWS** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions).

    <Admonition type="info" icon="📘" title="Notes">

    Once you have created a private link in a project, it applies immediately to its member clusters that have been deployed in the specified region. For those clusters that undergo maintenance then, such as scaling or patch-fixing, the private link applies to them after maintenance.

    </Admonition>

    ![setup_private_link_02](/img/setup_private_link_02.png)

1. Obtain a VPC ID

    Before creating a VPC endpoint, you need to have a VPC on your Amazon console. To view your VPCs, do as follows:

    1. Open the [Amazon VPC console](https://console.aws.amazon.com/vpc/).

    1. In the navigation pane, choose **VPCs**.

    1. Find the VPC of your desire and copy its ID.

    1. Enter this ID in **VPC ID** on Zilliz Cloud.

    To create a VPC, see [Create a VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html#Create-VPC).

1. Obtain a subnet ID

    Subnets are sub-divisions of your VPC. You need to have a subnet that resides in the same region as the private link to be created. To view your subnets, do as follows:

    1. Open the [Amazon VPC console](https://console.aws.amazon.com/vpc/).

    1. Change the current region to the one specified for creating the private link.

    1. In the navigation pane, choose **Subnets**.

    1. Find the subnet of your desire and copy its ID.

    1. Enter this ID in **Subnet IDs** on Zilliz Cloud. To create a subnet, see [Create a Subnet in Your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-subnets.html#create-subnets).

1. Obtain a VPC endpoint

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

1. Obtain a private link

    After verifying and accepting the VPC endpoint you have submitted, Zilliz Cloud allocates a private link for this endpoint. You can view it on the details tab of your cluster.

1. Set up a DNS record

    Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to create a CNAME record in your DNS zone to resolve the private link to the DNS name of your VPC endpoint.

    - **Create a hosted zone using Amazon Route 53**

        Amazon Route 53 is a web-based DNS service. Create a hosted DNS zone so that you can add DNS records to it.

        ![Xy3db8HiHoZBaux9SnScIurSnmg](/img/Xy3db8HiHoZBaux9SnScIurSnmg.png)

        1. Log into your AWS account and go to [__Hosted zones__](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#).

        1. Click **Create hosted zone**.

        1. In the **Hosted zone configuration** section, set the following parameters.

            |  **Parameter name** |  **Parameter Description**                                      |
            | ------------------- | --------------------------------------------------------------- |
            |  **Domain name**    |  Private Link allocated by Zilliz Cloud for the target cluster. |
            |  **Description**    |  Description used to distinguish hosted zones.                  |
            |  **Type**           |  Select **Private hosted zone**.                                |

        1. In the VPCs to associate with the hosted zone section, add your VPC ID to associate it with the hosted zone.

    - **Create an alias record in the hosted zone**

        An alias record is a type of DNS record that maps an alias name to a true or canonical domain name. Create an alias record to map the private link allocated by Zilliz Cloud to the DNS name of your VPC endpoint. Then, you can use the private link to access your cluster privately.

        ![HHGZbpSyooxvajxZcsicrgaUnZB](/img/HHGZbpSyooxvajxZcsicrgaUnZB.png)

        1. In the created hosted zone, click **Create record**.

        1. On the **Create record** page, switch on **Alias**, and select Route traffic to as follows:

            1. Select **Alias to VPC endpoint** in the first drop-down list.

            1. Select the cloud region in the second drop-down list.

            1. Enter the name of the endpoint that has been created above.

        1. Click **Create records**.

</TabItem>
<TabItem value="gcp">

1. Select a cloud provider and region

    To create a private link for a cluster deployed in a Google Cloud region, select **Google Cloud** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions).

    ![enter_vpc_endpoint_gcp](/img/enter_vpc_endpoint_gcp.png)

    <Admonition type="info" icon="📘" title="Notes">

    Once you have created a private link in a project, it applies immediately to its member clusters that have been deployed in the specified region. For those clusters that undergo maintenance then, such as scaling or patch-fixing, the private link applies to them after maintenance.

    </Admonition>

1. Obtain a Google Cloud project ID

    1. Open the [Google Cloud Dashboard](https://console.cloud.google.com/home/dashboard).

    1. Find the Project ID of your desire and copy its ID.

    1. Enter this ID in Google Cloud Project ID on Zilliz Cloud.

1. Obtain a VPC name

    Before creating a VPC endpoint, you need to have a VPC on your Amazon console. To view your VPCs, do as follows:

    1. Open the [Google Cloud VPC Dashboard](https://console.cloud.google.com/networking/networks/list).

    1. In the navigation pane, choose **VPC networks**.

    1. Find the VPC of your desire and copy its Name.

    1. Enter this name in **VPC Name** on Zilliz Cloud.

    To create a VPC network, see [Create and manage VPC networks](https://cloud.google.com/vpc/docs/create-modify-vpc-networks).

1. Obtain a subset name

    Subnets are sub-divisions of your VPC. You need to have a subnet that resides in the same region as the private link to be created. To view your subnets, do as follows:

    1. Open your [VPC network list](https://console.cloud.google.com/networking/networks/list).

    1. In the navigation pane, choose **VPC networks**.

    1. Click the name of the VPC of your desire.

    1. Find the subnet of your desire and copy its name.

    1. Enter this name in **Subnet Name** on Zilliz Cloud.

1. Set an endpoint prefix

    For your convenience, you are required to set an endpoint prefix in **Private Service Connect Endpoint prefix** so that any forwarding rules you create will have this prefix.

1. Obtain a private service endpoint

    Copy the command generated at the bottom of the **Add Private Link** dialog box on Zilliz Cloud, and run this command in your GCP CloudShell to create a Private Service Connect Endpoint.

    In the returned message, copy the endpoint name listed on [this page](https://console.cloud.google.com/net-services/psc/list/consumers).

    Then, enter the copied name in **Your Endpoint** and click **Add**.

1. Obtain a private link

    After verifying and accepting the preceding attributes you have submitted, Zilliz Cloud allocates a private link for this endpoint. You can view it on the details tab of your cluster.

1. Set up firewall rules and a DNS record

    Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to create a CNAME record in your DNS zone to resolve the private link to the DNS name of your VPC endpoint.

1. Create firewall rules

    To allow private access to your managed cluster, add appropriate firewall rules. The following snippet shows how to allow traffic through TCP port 22. Note that you need to set `VPC_NAME` to the name of your VPC.

    ```bash
    VPC_NAME={{vpc-name}};
    
    gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
    ```

1. Create a hosted zone using Cloud DNS

    Go to [Cloud DNS](https://console.cloud.google.com/net-services/dns/zones) in your GCP console and create a DNS zone.

    ![ExLabRpAhoMetUxZpEncWWGEniA](/img/ExLabRpAhoMetUxZpEncWWGEniA.png)

    1. Select **Private** in **Zone type**.

    1. Set **Zone name** to `zilliz-privatelink-zone` or other values that you see fit.

    1. Set **DNS name** to the private link obtained in step 7.

        A valid DNS name is similar to `in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com`.

    1. Select the proper VPC network in **Networks**.

    1. Click **CREATE**.

1. Create a record in the hosted zone

    1. In the zone created above, click **ADD STANDARD** in the **RECORD SETS** tab.

    1. On the **Create record set** page, create an **A** record with the default settings.

        ![Jb3bbL4ZPozKTvxwZOEcFE4Bnkb](/img/Jb3bbL4ZPozKTvxwZOEcFE4Bnkb.png)

    1. Click **SELECT IP ADDRESS** in **IPv4 Address**, and select the IP address of your endpoint.

    1. Click **CREATE**.

</TabItem>

<TabItem value="azure">

1. On the **Cluster Details** tab in the Zilliz Cloud console, copy your cluster ID.

    ![IHILbNmFuoPfbxxtjhCcqjvqnzf](/img/IHILbNmFuoPfbxxtjhCcqjvqnzf.png)

1. In the **Create Private Link** dialog box,

    1. Select a provider and region.

    1. Enter your user ID from the [Microsoft Azure Subscription page](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1).

    1. Click **Add** to have Zilliz Cloud verify the submitted user ID and whitelist it.

    1. Copy the endpoint service alias similar to the following.

        `zilliz-prod-infra-privatelink.6a90fc24-16c3-40c1-a94c-648987ac7422.westus3.azure.privatelinkservice`

1. On the Microsoft Azure portal, go to [your subscriptions](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1).

    1. [Create a private endpoint](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade). At the end of this step, you need to write down the endpoint ID for **step 6** and the network interface IP address for **step b**.

        1. Click **+ Create** to start the process.

            - In the **Basics** tab, fill in the necessary information for your Azure subscription. This is the same subscription that you have presented to Zilliz Cloud. Be sure to select the same region as the one you chose in **step 1**.

                ![MKg1bEROjoRg9LxlqdYcKp3tnhc](/img/MKg1bEROjoRg9LxlqdYcKp3tnhc.png)

            - In the **Resource** tab, choose **Connect to an Azure resource by resource ID or alias**, and enter the endpoint service alias you have copied in **step 4**.

                ![QnvRbwN02ox36rxY1eocBOS0n1e](/img/QnvRbwN02ox36rxY1eocBOS0n1e.png)

            - In the **Virtual Network** tab, select the virtual network and one of its subnets you need to link to Zilliz Cloud.

                ![G8lzbirHzojw1ixcG36cOsH0nne](/img/G8lzbirHzojw1ixcG36cOsH0nne.png)

        1. Click **Create**, and wait for the process to finish.

        1. Once the deployment is complete, you will see a message that reads **Your deployment is complete**. Click **Go to resource** to view the endpoint service you have just created.

            On the **Overview** page, **Connection Status** is **Pending**, and **Request/Response** is **Awaiting Approval**. This means that this private link is still pending approval by Zilliz Cloud.

            ![K0cIbJ6u3onHQyxTS8hcz8rBn0g](/img/K0cIbJ6u3onHQyxTS8hcz8rBn0g.png)

        1. Click **JSON View** in the upper right corner on the **Overview** page. 

            In the **Resource JSON** panel, copy the values of `name` and `properties.resourceGuid`. Your endpoint ID should be these two values joined by a period (`.`). 

            ![WXmKbJXj2oamENx0IkBcnf6inTf](/img/WXmKbJXj2oamENx0IkBcnf6inTf.png)

            For example, the value of `name` is `private_link_1124`, and the value of `properties.resourceGuid` is `44f73fae-xxxxxxxxxxxxx`. Your endpoint ID is `private_link_1124.44f73fae-xxxxxxxxxxxx`.

        1. Go to **Settings** > **DNS configuration**, and copy the **IP address** of the network interface you have created.

            ![Rq2KbQYeuoK3SDxJeqecm5FMnIc](/img/Rq2KbQYeuoK3SDxJeqecm5FMnIc.png)

    1. [Create a Private DNS zone](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones). Click **+ Create** to start the process.

        1. In the **Basics** tab, fill in the necessary information for your Azure subscription. This is the same subscription that you have presented to Zilliz Cloud. 

            Be sure to end the instance name with `.vectordb.zillizcloud.com`. For example, you can name your instance `az-eastus.vectordb.zillizcloud.com`.  

            ![LdZjbThh5oztOZxFpO2cS0bjnMb](/img/LdZjbThh5oztOZxFpO2cS0bjnMb.png)

        1. Click **Create**, and wait for the process to finish.

    1. Link the Private DNS zone to your virtual network.

        1. Click the name of the Private DNS zone you have just created and click **Settings** > **Virtual network links** in the left navigation pane.

        1. Click **+ Add**. In the **Add virtual network link** dialog box, enter a **Link name**, and select **Subscription** and **Virtual network** you have used above.

            ![OnySbiSrBoNtTnxE32bc7DgsnOd](/img/OnySbiSrBoNtTnxE32bc7DgsnOd.png)

        1. Select **Enable auto registration**.

    1. Add record set.

        1. Click **Overview** in the left navigation pane to go back to the overview page of the Private DNS zone.

        1. Click **+ Record set**. In the **Add record set** dialog box, enter your cluster ID suffixed with `-privatelink` in **Name**, select **A - Address record** in **Type**, and set **TTL** to **120 Hours**. Check whether the listed IP address is the one you have noted down.

            ![NNKmbY85DoLHmFxabOQchpuknqb](/img/NNKmbY85DoLHmFxabOQchpuknqb.png)

        1. Click **OK **to add the record. 

1. Go back to the Zilliz Cloud console. In the **Create Private Link** dialog box, enter the endpoint ID you have noted down in **Endpoint ID**, and click **Create**.

    Upon receiving your request, Zilliz Cloud whitelists your connection and your private link is established.

</TabItem>

</Tabs>

## Verify the connection{#verify-the-connection}

![setup_private_link_01](/img/setup_private_link_01.png)

Once you complete the preceding steps, you can verify the connection as follows:

1. On the details tab of your cluster, click **Private Link** in the **Cloud Endpoint** area.

1. Copy the private link, and then click **View the guides to connect your database via endpoint**.

## Troubleshooting{#troubleshooting}

### Why does it always report a timeout when connecting to the private link on AWS?{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

A timeout usually occurs for the following reasons:

- No private DNS records exist.

    If a DNS record exists, you can ping the private link as follows:

    ![DeBvbtVz9otRBNxuC3UcdRIqnhc](/img/DeBvbtVz9otRBNxuC3UcdRIqnhc.png)

    <Admonition type="info" icon="📘" title="Notes">

    If the IP address of the VPC endpoint has been resolved correctly in the output of the ping request, the DNS record works. 

    </Admonition>

    If you see the following, you need to [set up the DNS record](./setup-a-private-link).

    ![MxXVbXo7woTHRZxEeXAcAhmGnjg](/img/MxXVbXo7woTHRZxEeXAcAhmGnjg.png)

- No or invalid security group rules exist.

    You need to properly set the security group rules for the traffic from your EC2 instance to your VPC endpoint in the AWS console. A proper security group within your VPC should allow inbound access from your EC2 instances on the port suffixed to your private link.

    ![Tp1gbtlQroQABBxfR30c99rUnfb](/img/Tp1gbtlQroQABBxfR30c99rUnfb.png)

    You can use a `curl` command to test the connectivity of the private link. In a normal case, it returns a 400 response.

    ![IXc2bqVxtoMa2NxDza1cx8SZnFc](/img/IXc2bqVxtoMa2NxDza1cx8SZnFc.png)

    If the `curl` command hangs without any response as in the following screenshot, you need to set up proper security group rules by referring to step 9 in [Create a VPC endpoint](https://docs.amazonaws.cn/en_us/vpc/latest/privatelink/create-interface-endpoint.html).

    <Admonition type="info" icon="📘" title="Notes">

    Two security groups must be configured: one for the EC2 instance, which must allow traffic on the port associated with your private link, and another for the VPC endpoint, which must permit traffic from the IP address of the EC2 instance and target the specified port number.

    </Admonition>

### Why does it always report `Name or service not known` when I ping the private link on GCP?{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

Check your DNS settings by referring to [Set up firewall rules and a DNS record](https://zilliz.com/doc/setup_private_link-gcp#Set-up-firewall-rules-and-a-DNS-record).

- If the configuration is correct, when you ping your private link, you should see

    ![private_link_gcp_ts_01](/img/private_link_gcp_ts_01.png)

- If the configuration is incorrect, when you ping your private link, you may see

    ![private_link_gcp_ts_02](/img/private_link_gcp_ts_02.png)

    

## Related topics{#related-topics}

- [Manage API Keys](./manage-api-keys) 

- [Manage Cluster Credentials](./manage-cluster-credentials-gui) 

- [Set up Whitelist](./set-up-whitelist) 

