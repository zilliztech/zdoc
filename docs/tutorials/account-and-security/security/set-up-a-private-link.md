---
slug: /set-up-a-private-link
beta: FALSE
notebook: FALSE
sidebar_position: 2
---



# Set up a Private Link

Zilliz Cloud offers private access to your cluster through a private link. This is useful if you do not want your cluster traffic to go over the Internet.

To enable private client access to clusters on Zilliz Cloud, you must create an endpoint in each of the subnets within your application's VPC. Then, register the VPC, subnets, and endpoints with Zilliz Cloud so that it can allocate a private link for you to set up a DNS record mapping the private link to the endpoints.

The following figure demonstrates how it works.

![private_link](/img/private_link.png)

This guide walks you through setting up a private link for a cluster.

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud.

- A cluster has been created. For information on how to create a cluster, see [Create Cluster](./create-cluster)[.](https://www.notion.so/Create-Cluster-c46973ff29754741a82d67471551897f?pvs=21)

## Add a private link{#add-a-private-link}

Zilliz Cloud offers you an intuitive wizard to add a private link. On the **Private Link** tab in your project, click **+ Add Private Link** and configure the settings.

Setting up a private link is project-level. When you configure a private link for a cluster, it applies to its neighboring clusters in the same project deployed in the same cloud region.

To continue setting up a private link, follow these steps as needed:

- [Set up a private link for a cluster on Amazon Web Service (AWS)](./set-up-a-private-link#select-a-cloud-provider-and-region)

- [Set up a private link for a cluster on Google Cloud Platform (GCP)](./set-up-a-private-link#set-up-a-private-link-for-a-cluster-on-gcp)

## Set up a private link for a cluster on AWS{#set-up-a-private-link-for-a-cluster-on-aws}

### Select a cloud provider and region{#select-a-cloud-provider-and-region}

To create a private link for a cluster deployed in an AWS region, select **AWS** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. For more information on available cloud providers and regions, see [Cloud Providers and Regions](./cloud-providers-and-regions).

:::info Notes

Once you have created a private link in a project, it applies immediately to its member clusters that have been deployed in the specified region. For those clusters that undergo maintenance then, such as scaling or patch-fixing, the private link applies to them after maintenance.

:::

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

### **Obtain a private link**{#obtain-a-private-link}

After verifying and accepting the VPC endpoint you have submitted, Zilliz Cloud allocates a private link for this endpoint. You can view it on the details tab of your cluster.

### **Set up a DNS record**{#set-up-a-dns-record}

Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to create a CNAME record in your DNS zone to resolve the private link to the DNS name of your VPC endpoint.

**Create a hosted zone using Amazon Route 53**

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

**Create an alias record in the hosted zone**

An alias record is a type of DNS record that maps an alias name to a true or canonical domain name. Create an alias record to map the private link allocated by Zilliz Cloud to the DNS name of your VPC endpoint. Then, you can use the private link to access your cluster privately.

![HHGZbpSyooxvajxZcsicrgaUnZB](/img/HHGZbpSyooxvajxZcsicrgaUnZB.png)

1. In the created hosted zone, click **Create record**.

1. On the **Create record** page, switch on **Alias**, and select Route traffic to as follows:
    1. Select **Alias to VPC endpoint** in the first drop-down list.

    1. Select the cloud region in the second drop-down list.

    1. Enter the name of the endpoint that has been created above.

1. Click **Create records**.

## Set up a private link for a cluster on GCP{#set-up-a-private-link-for-a-cluster-on-gcp}

### Select a cloud provider and region{#select-a-cloud-provider-and-region}

To create a private link for a cluster deployed in a Google Cloud region, select **Google Cloud** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. For more information on available cloud providers and regions, see [Cloud Providers and Regions](https://www.notion.so/Cloud-Providers-and-Regions-17c1d3ebb5eb4c6f8bf682a0f6ad4148?pvs=21).

:::info Notes

Once you have created a private link in a project, it applies immediately to its member clusters that have been deployed in the specified region. For those clusters that undergo maintenance then, such as scaling or patch-fixing, the private link applies to them after maintenance.

:::

![enter_vpc_endpoint_gcp](/img/enter_vpc_endpoint_gcp.png)

### **Obtain a Google Cloud project ID**{#obtain-a-google-cloud-project-id}

1. Open the [Google Cloud Dashboard](https://console.cloud.google.com/home/dashboard).

1. Find the Project ID of your desire and copy its ID.

1. Enter this ID in Google Cloud Project ID on Zilliz Cloud.

### Obtain a VPC name{#obtain-a-vpc-name}

Before creating a VPC endpoint, you need to have a VPC on your Amazon console. To view your VPCs, do as follows:

1. Open the [Google Cloud VPC Dashboard](https://console.cloud.google.com/networking/networks/list).

1. In the navigation pane, choose **VPC networks**.

1. Find the VPC of your desire and copy its Name.

1. Enter this name in **VPC Name** on Zilliz Cloud.

To create a VPC network, see [Create and manage VPC networks](https://cloud.google.com/vpc/docs/create-modify-vpc-networks).

### Obtain a subset name{#obtain-a-subset-name}

Subnets are sub-divisions of your VPC. You need to have a subnet that resides in the same region as the private link to be created. To view your subnets, do as follows:

1. Open your [VPC network list](https://console.cloud.google.com/networking/networks/list).

1. In the navigation pane, choose **VPC networks**.

1. Click the name of the VPC of your desire.

1. Find the subnet of your desire and copy its name.

1. Enter this name in **Subnet Name** on Zilliz Cloud.

### Set an endpoint prefix{#set-an-endpoint-prefix}

For your convenience, you are required to set an endpoint prefix in **Private Service Connect Endpoint prefix** so that any forwarding rules you create will have this prefix.

### Obtain a private service endpoint{#obtain-a-private-service-endpoint}

Copy the command generated at the bottom of the **Add Private Link** dialog box on Zilliz Cloud, and run this command in your GCP CloudShell to create a Private Service Connect Endpoint.

In the returned message, copy the endpoint name listed on [this page](https://console.cloud.google.com/net-services/psc/list/consumers).

Then, enter the copied name in **Your Endpoint** and click **Add**.

### Obtain a private link{#obtain-a-private-link}

After verifying and accepting the preceding attributes you have submitted, Zilliz Cloud allocates a private link for this endpoint. You can view it on the details tab of your cluster.

### **Set up firewall rules and a DNS record**{#set-up-firewall-rules-and-a-dns-record}

Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to create a CNAME record in your DNS zone to resolve the private link to the DNS name of your VPC endpoint.

### **Create firewall rules**{#create-firewall-rules}

To allow private access to your managed cluster, add appropriate firewall rules. The following snippet shows how to allow traffic through TCP port 22. Note that you need to set `VPC_NAME` to the name of your VPC.

```bash
VPC_NAME={{vpc-name}};

gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
```

### **Create a hosted zone using Cloud DNS**{#create-a-hosted-zone-using-cloud-dns}

Cloud DNS is a web-based DNS service. Create a managed DNS zone so that you can add DNS records to it.

Run the following script in your GCP Cloushell to create a managed DNS zone. Note that you need to set `PROJECT_ID` to your GCP project ID and `PRIVATE_DNS_ZONE_NAME` to `zilliz-privatelink-zone`.

```bash
PROJECT_ID={{project-id}};
PRIVATE_DNS_ZONE_NAME=zilliz-privatelink-zone;

gcloud dns --project=$PROJECT_ID managed-zones create $PRIVATE_DNS_ZONE_NAME --description="" --dns-name="vectordb.zillizcloud.com." --visibility="private" --networks=$VPC_NAME
```

### **Create a CNAME record in the hosted zone**{#create-a-cname-record-in-the-hosted-zone}

A CNAME record is a type of DNS record that maps an alias name to a true or canonical domain name. Create a CNAME record to map the private link allocated by Zilliz Cloud to the DNS name of your VPC endpoint. Then you can use the private link to access your cluster privately.

Run the following script in your Cloud Shell to create a CNAME record in the hosted DNS zone. Note that you need to set `ENDPOINT_IP` to the IP address of the endpoint created in the previous step and `PRIVATE_LINK_DOMAIN_PREFIX` to the private link listed on the **d**etails tab of your cluster.

```bash
PRIVATE_LINK_DOMAIN_SUFFIX=vectordb.zillizcloud.com;
## such as in01-61e949d971f841b-privatelink.gcp-us-west1
PRIVATE_LINK_DOMAIN_PREFIX={{privatelink-domain-prefix}};

## get id from endpoint
ENDPOINT_IP={{endpoint-ip}};

gcloud dns --project=$PROJECT_ID record-sets create $PRIVATE_LINK_DOMAIN_PREFIX.$PRIVATE_LINK_DOMAIN_SUFFIX. --zone="$PRIVATE_DNS_ZONE_NAME" --type="A" --ttl="60" --rrdatas="$ENDPOINT_IP"
```

## **Verify the connection**{#verify-the-connection}

![setup_private_link_01](/img/setup_private_link_01.png)

Once you complete the preceding steps, you can verify the connection as follows:

1. On the details tab of your cluster, click **Private Link** in the **Cloud Endpoint** area.

1. Copy the private link, and then click **View the guides to connect your database via endpoint**.

## Troubleshooting{#troubleshooting}

**Why does it always report `Name or service not known` when I ping the private link?**

Check your DNS settings by referring to [Set up firewall rules and a DNS record](https://zilliz.com/doc/setup_private_link-gcp#Set-up-firewall-rules-and-a-DNS-record).

- If the configuration is correct, when you ping your private link, you should see
    ![private_link_gcp_ts_01](/img/private_link_gcp_ts_01.png)

    

- If the configuration is incorrect, when you ping your private link, you may see
    ![private_link_gcp_ts_02](/img/private_link_gcp_ts_02.png)

    

## Related topics{#related-topics}

- [Manage API Keys](./manage-api-keys) 

- [Manage Cluster Credentials](./manage-cluster-credentials) 

- [Set up Whitelist](./set-up-whitelist) 
