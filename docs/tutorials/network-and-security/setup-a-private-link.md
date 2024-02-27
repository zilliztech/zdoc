---
slug: /setup-a-private-link
beta: FALSE
notebook: FALSE
type: origin
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

Zilliz Cloud offers you an intuitive wizard to add a private link. On the __Private Link__ tab in your project, click __+ Add Private Link__ and configure the settings.

Setting up a private link is project-level. When you configure a private link for a cluster, it applies to its neighboring clusters in the same project deployed in the same cloud region.

<Tabs groupId="private-link" defaultValue="aws" values={[{"label":"Amazon AWS","value":"aws"},{"label":"Google GCP","value":"gcp"},{"label":"Microsoft Azure","value":"azure"}]}>

<TabItem value="aws">

1. Select a cloud provider and region

    To create a private link for a cluster deployed in an AWS region, select __AWS__ from the __Cloud Provider__ drop-down list. In __Region__, select the region that accommodates the cluster you want to access privately. For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions).

    <Admonition type="info" icon="📘" title="Notes">

    <p>Once you have created a private link in a project, it applies immediately to its member clusters that have been deployed in the specified region. For those clusters that undergo maintenance then, such as scaling or patch-fixing, the private link applies to them after maintenance.</p>

    </Admonition>

    ![setup_private_link_02](/img/setup_private_link_02.png)

1. Obtain a VPC ID

    Before creating a VPC endpoint, you need to have a VPC on your Amazon console. To view your VPCs, do as follows:

    1. Open the [Amazon VPC console](https://console.aws.amazon.com/vpc/).

    1. In the navigation pane, choose __VPCs__.

    1. Find the VPC of your desire and copy its ID.

    1. Enter this ID in __VPC ID__ on Zilliz Cloud.

    To create a VPC, see [Create a VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-vpcs.html#Create-VPC).

1. Obtain a subnet ID

    Subnets are sub-divisions of your VPC. You need to have a subnet that resides in the same region as the private link to be created. To view your subnets, do as follows:

    1. Open the [Amazon VPC console](https://console.aws.amazon.com/vpc/).

    1. Change the current region to the one specified for creating the private link.

    1. In the navigation pane, choose __Subnets__.

    1. Find the subnet of your desire and copy its ID.

    1. Enter this ID in __Subnet IDs__ on Zilliz Cloud. To create a subnet, see [Create a Subnet in Your VPC](https://docs.aws.amazon.com/vpc/latest/userguide/working-with-subnets.html#create-subnets).

1. Obtain a VPC endpoint

    Copy the command generated at the bottom of the __Add Private Link__ dialog box on Zilliz Cloud, and run this command in your Amazon CloudShell to create a VPC endpoint.

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

    Then, enter the VPC endpoint ID in __Your VPC Private Link ID__ and click __Add__.

1. Obtain a private link

    After verifying and accepting the VPC endpoint you have submitted, Zilliz Cloud allocates a private link for this endpoint. You can view it on the details tab of your cluster.

1. Set up a DNS record

    Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to create a CNAME record in your DNS zone to resolve the private link to the DNS name of your VPC endpoint.

    - __Create a hosted zone using Amazon Route 53__

        Amazon Route 53 is a web-based DNS service. Create a hosted DNS zone so that you can add DNS records to it.

        ![Xy3db8HiHoZBaux9SnScIurSnmg](/img/Xy3db8HiHoZBaux9SnScIurSnmg.png)

        1. Log into your AWS account and go to [Hosted zones](https://us-east-1.console.aws.amazon.com/route53/v2/hostedzones#).

        1. Click __Create hosted zone__.

        1. In the __Hosted zone configuration__ section, set the following parameters.

            |  __Parameter name__ |  __Parameter Description__                                      |
            | ------------------- | --------------------------------------------------------------- |
            |  __Domain name__    |  Private Link allocated by Zilliz Cloud for the target cluster. |
            |  __Description__    |  Description used to distinguish hosted zones.                  |
            |  __Type__           |  Select __Private hosted zone__.                                |

        1. In the VPCs to associate with the hosted zone section, add your VPC ID to associate it with the hosted zone.

    - __Create an alias record in the hosted zone__

        An alias record is a type of DNS record that maps an alias name to a true or canonical domain name. Create an alias record to map the private link allocated by Zilliz Cloud to the DNS name of your VPC endpoint. Then, you can use the private link to access your cluster privately.

        ![HHGZbpSyooxvajxZcsicrgaUnZB](/img/HHGZbpSyooxvajxZcsicrgaUnZB.png)

        1. In the created hosted zone, click __Create record__.

        1. On the __Create record__ page, switch on __Alias__, and select Route traffic to as follows:

            1. Select __Alias to VPC endpoint__ in the first drop-down list.

            1. Select the cloud region in the second drop-down list.

            1. Enter the name of the endpoint that has been created above.

        1. Click __Create records__.

</TabItem>
<TabItem value="gcp">

1. Select a cloud provider and region

    To create a private link for a cluster deployed in a Google Cloud region, select __Google Cloud__ from the __Cloud Provider__ drop-down list. In __Region__, select the region that accommodates the cluster you want to access privately. For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions).

    ![enter_vpc_endpoint_gcp](/img/enter_vpc_endpoint_gcp.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>Once you have created a private link in a project, it applies immediately to its member clusters that have been deployed in the specified region. For those clusters that undergo maintenance then, such as scaling or patch-fixing, the private link applies to them after maintenance.</p>

    </Admonition>

1. Obtain a Google Cloud project ID

    1. Open the [Google Cloud Dashboard](https://console.cloud.google.com/home/dashboard).

    1. Find the Project ID of your desire and copy its ID.

    1. Enter this ID in Google Cloud Project ID on Zilliz Cloud.

1. Obtain a VPC name

    Before creating a VPC endpoint, you need to have a VPC on your Amazon console. To view your VPCs, do as follows:

    1. Open the [Google Cloud VPC Dashboard](https://console.cloud.google.com/networking/networks/list).

    1. In the navigation pane, choose __VPC networks__.

    1. Find the VPC of your desire and copy its Name.

    1. Enter this name in __VPC Name__ on Zilliz Cloud.

    To create a VPC network, see [Create and manage VPC networks](https://cloud.google.com/vpc/docs/create-modify-vpc-networks).

1. Obtain a subset name

    Subnets are sub-divisions of your VPC. You need to have a subnet that resides in the same region as the private link to be created. To view your subnets, do as follows:

    1. Open your [VPC network list](https://console.cloud.google.com/networking/networks/list).

    1. In the navigation pane, choose __VPC networks__.

    1. Click the name of the VPC of your desire.

    1. Find the subnet of your desire and copy its name.

    1. Enter this name in __Subnet Name__ on Zilliz Cloud.

1. Set an endpoint prefix

    For your convenience, you are required to set an endpoint prefix in __Private Service Connect Endpoint prefix__ so that any forwarding rules you create will have this prefix.

1. Obtain a private service endpoint

    Copy the command generated at the bottom of the __Add Private Link__ dialog box on Zilliz Cloud, and run this command in your GCP CloudShell to create a Private Service Connect Endpoint.

    In the returned message, copy the endpoint name listed on [this page](https://console.cloud.google.com/net-services/psc/list/consumers).

    Then, enter the copied name in __Your Endpoint__ and click __Add__.

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

    ![KLfrbkXtDoXFccxRndlcMf1Fnob](/img/KLfrbkXtDoXFccxRndlcMf1Fnob.png)

    1. Select __Private__ in __Zone type__.

    1. Set __Zone name__ to `zilliz-privatelink-zone` or other values that you see fit.

    1. Set __DNS name__ to the private link obtained in step 7.

        A valid DNS name is similar to `in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com`.

    1. Select the proper VPC network in __Networks__.

    1. Click __CREATE__.

1. Create a record in the hosted zone

    1. In the zone created above, click __ADD STANDARD__ in the __RECORD SETS__ tab.

    1. On the __Create record set__ page, create an __A__ record with the default settings.

        ![OPjcbZ5zlo0VSTxatH9cEDEgnog](/img/OPjcbZ5zlo0VSTxatH9cEDEgnog.png)

    1. Click __SELECT IP ADDRESS__ in __IPv4 Address__, and select the IP address of your endpoint.

        ![SF2hbpUN2oS0VUx7yU5cZ8TXnhg](/img/SF2hbpUN2oS0VUx7yU5cZ8TXnhg.png)

    1. Click __CREATE__.

</TabItem>

<TabItem value="azure">

1. On the __Cluster Details__ tab in the Zilliz Cloud console, copy your cluster ID.

    ![IHILbNmFuoPfbxxtjhCcqjvqnzf](/img/IHILbNmFuoPfbxxtjhCcqjvqnzf.png)

1. In the __Create Private Link__ dialog box,

    1. Select a provider and region.

    1. Enter your user ID from the [Microsoft Azure Subscription page](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1).

    1. Click __Add__ to have Zilliz Cloud verify the submitted user ID and whitelist it.

    1. Copy the endpoint service alias similar to the following.

        `zilliz-prod-infra-privatelink.6a90fc24-16c3-40c1-a94c-648987ac7422.westus3.azure.privatelinkservice`

1. On the Microsoft Azure portal, go to [your subscriptions](https://portal.azure.com/#view/Microsoft_Azure_Billing/SubscriptionsBladeV1).

    1. [Create a private endpoint](https://portal.azure.com/#view/Microsoft_Azure_Network/PrivateLinkCenterBlade). At the end of this step, you need to write down the endpoint ID for __step 6__ and the network interface IP address for __step b__.

        1. Click __+ Create__ to start the process.

            - In the __Basics__ tab, fill in the necessary information for your Azure subscription. This is the same subscription that you have presented to Zilliz Cloud. Be sure to select the same region as the one you chose in __step 1__.

                ![MKg1bEROjoRg9LxlqdYcKp3tnhc](/img/MKg1bEROjoRg9LxlqdYcKp3tnhc.png)

            - In the __Resource__ tab, choose __Connect to an Azure resource by resource ID or alias__, and enter the endpoint service alias you have copied in __step 4__.

                ![QnvRbwN02ox36rxY1eocBOS0n1e](/img/QnvRbwN02ox36rxY1eocBOS0n1e.png)

            - In the __Virtual Network__ tab, select the virtual network and one of its subnets you need to link to Zilliz Cloud.

                ![G8lzbirHzojw1ixcG36cOsH0nne](/img/G8lzbirHzojw1ixcG36cOsH0nne.png)

        1. Click __Create__, and wait for the process to finish.

        1. Once the deployment is complete, you will see a message that reads __Your deployment is complete__. Click __Go to resource__ to view the endpoint service you have just created.

            On the __Overview__ page, __Connection Status__ is __Pending__, and __Request/Response__ is __Awaiting Approval__. This means that this private link is still pending approval by Zilliz Cloud.

            ![K0cIbJ6u3onHQyxTS8hcz8rBn0g](/img/K0cIbJ6u3onHQyxTS8hcz8rBn0g.png)

        1. Click __JSON View__ in the upper right corner on the __Overview__ page. 

            In the __Resource JSON__ panel, copy the values of `name` and `properties.resourceGuid`. Your endpoint ID should be these two values joined by a period (`.`). 

            ![WXmKbJXj2oamENx0IkBcnf6inTf](/img/WXmKbJXj2oamENx0IkBcnf6inTf.png)

            For example, the value of `name` is `private_link_1124`, and the value of `properties.resourceGuid` is `44f73fae-xxxxxxxxxxxxx`. Your endpoint ID is `private_link_1124.44f73fae-xxxxxxxxxxxx`.

        1. Go to __Settings__ > __DNS configuration__, and copy the __IP address__ of the network interface you have created.

            ![Rq2KbQYeuoK3SDxJeqecm5FMnIc](/img/Rq2KbQYeuoK3SDxJeqecm5FMnIc.png)

    1. [Create a Private DNS zone](https://portal.azure.com/#view/HubsExtension/BrowseResource/resourceType/Microsoft.Network%2FprivateDnsZones). Click __+ Create__ to start the process.

        1. In the __Basics__ tab, fill in the necessary information for your Azure subscription. This is the same subscription that you have presented to Zilliz Cloud. 

            Be sure to end the instance name with `.vectordb.zillizcloud.com`. For example, you can name your instance `az-eastus.vectordb.zillizcloud.com`.  

            ![LdZjbThh5oztOZxFpO2cS0bjnMb](/img/LdZjbThh5oztOZxFpO2cS0bjnMb.png)

        1. Click __Create__, and wait for the process to finish.

    1. Link the Private DNS zone to your virtual network.

        1. Click the name of the Private DNS zone you have just created and click __Settings__ > __Virtual network links__ in the left navigation pane.

        1. Click __+ Add__. In the __Add virtual network link__ dialog box, enter a __Link name__, and select __Subscription__ and __Virtual network__ you have used above.

            ![OnySbiSrBoNtTnxE32bc7DgsnOd](/img/OnySbiSrBoNtTnxE32bc7DgsnOd.png)

        1. Select __Enable auto registration__.

    1. Add record set.

        1. Click __Overview__ in the left navigation pane to go back to the overview page of the Private DNS zone.

        1. Click __+ Record set__. In the __Add record set__ dialog box, enter your cluster ID suffixed with `-privatelink` in __Name__, select __A - Address record__ in __Type__, and set __TTL__ to __120 Hours__. Check whether the listed IP address is the one you have noted down.

            ![NNKmbY85DoLHmFxabOQchpuknqb](/img/NNKmbY85DoLHmFxabOQchpuknqb.png)

        1. Click __OK __to add the record.

1. Go back to the Zilliz Cloud console. In the __Create Private Link__ dialog box, enter the endpoint ID you have noted down in __Endpoint ID__, and click __Create__.

    Upon receiving your request, Zilliz Cloud whitelists your connection and your private link is established.

</TabItem>

</Tabs>

## Verify the connection{#verify-the-connection}

![setup_private_link_01](/img/setup_private_link_01.png)

Once you complete the preceding steps, you can verify the connection as follows:

1. On the details tab of your cluster, click __Private Link__ in the __Cloud Endpoint__ area.

1. Copy the private link, and then click __View the guides to connect your database via endpoint__.

## Troubleshooting{#troubleshooting}

### Why does it always report a timeout when connecting to the private link on AWS?{#why-does-it-always-report-a-timeout-when-connecting-to-the-private-link-on-aws}

A timeout usually occurs for the following reasons:

- No private DNS records exist.

    If a DNS record exists, you can ping the private link as follows:

    ![DeBvbtVz9otRBNxuC3UcdRIqnhc](/img/DeBvbtVz9otRBNxuC3UcdRIqnhc.png)

    <Admonition type="info" icon="📘" title="Notes">

    <p>If the IP address of the VPC endpoint has been resolved correctly in the output of the ping request, the DNS record works. </p>

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

    <p>Two security groups must be configured: one for the EC2 instance, which must allow traffic on the port associated with your private link, and another for the VPC endpoint, which must permit traffic from the IP address of the EC2 instance and target the specified port number.</p>

    </Admonition>

### Why does it always report `Name or service not known` when I ping the private link on GCP?{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

Check your DNS settings by referring to [Set up firewall rules and a DNS record](https://zilliz.com/doc/setup_private_link-gcp#Set-up-firewall-rules-and-a-DNS-record).

- If the configuration is correct, when you ping your private link, you should see

    ![private_link_gcp_ts_01](/img/private_link_gcp_ts_01.png)

- If the configuration is incorrect, when you ping your private link, you may see

    ![private_link_gcp_ts_02](/img/private_link_gcp_ts_02.png)

## Related topics{#related-topics}

- [API Keys](./manage-api-keys)

- [Manage Cluster Credentials](./cluster-credentials-console)

- [Set up Whitelist](./setup-whitelist) 

