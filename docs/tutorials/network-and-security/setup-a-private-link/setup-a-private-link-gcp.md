---
slug: /setup-a-private-link-gcp
beta: FALSE
notebook: FALSE
type: origin
token: IojuwADAwiRK0hkl4pgcvC2QnQd
sidebar_position: 2
keywords: 
  - zilliz
  - vector database
  - cloud
  - private link
  - gcp

---

import Admonition from '@theme/Admonition';


# Set up a Private Link (GCP)

This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different GCP VPCs.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud does not charge you for private links. However, your cloud provider may <a href="https://cloud.google.com/vpc/pricing#psc-forwarding-rule-service">charge you for each endpoint</a> that you create to access Zilliz Cloud.</p>

</Admonition>

## Before you start{#before-you-start}

Make sure the following conditions are met:

- You have signed up for Zilliz Cloud.

- A cluster has been created. For information on how to create a cluster, see [Create Cluster](./create-cluster).

## Add a private link{#add-a-private-link}

Zilliz Cloud offers you an intuitive wizard to add a private link. On the **Private Link** tab in your project, click **+ Add Private Link** and configure the settings.

Setting up a private link is project-level. When you configure a private link for a cluster, it applies to its neighboring clusters in the same project deployed in the same cloud region.

### Select a cloud provider and region{#select-a-cloud-provider-and-region}

To create a private link for a cluster deployed in a Google Cloud region, select **Google Cloud** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions).

![enter_vpc_endpoint_gcp](/img/enter_vpc_endpoint_gcp.png)

<Admonition type="info" icon="📘" title="Notes">

<p>Once you have created a private link in a project, it applies immediately to its member clusters that have been deployed in the specified region. For those clusters that undergo maintenance then, such as scaling or patch-fixing, the private link applies to them after maintenance.</p>

</Admonition>

### Obtain a Google Cloud project ID{#obtain-a-google-cloud-project-id}

1. Open the [Google Cloud Dashboard](https://console.cloud.google.com/home/dashboard).

1. Find the Project ID of your desire and copy its ID.

1. Enter this ID in Google Cloud Project ID on Zilliz Cloud.

### Obtain a VPC name{#obtain-a-vpc-name}

Before creating a VPC endpoint, you need to have a VPC on your GCP console. To view your VPCs, do as follows:

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

### Set up firewall rules and a DNS record{#set-up-firewall-rules-and-a-dns-record}

Before you can access your cluster via the private link allocated by Zilliz Cloud, it is necessary to create a CNAME record in your DNS zone to resolve the private link to the DNS name of your VPC endpoint.

### Create firewall rules{#create-firewall-rules}

To allow private access to your managed cluster, add appropriate firewall rules. The following snippet shows how to allow traffic through TCP port 22. Note that you need to set `VPC_NAME` to the name of your VPC.

```bash
VPC_NAME={{vpc-name}};

gcloud compute firewall-rules create psclab-iap-consumer --network $VPC_NAME --allow tcp:22 --source-ranges=35.235.240.0/20 --enable-logging
```

### Create a hosted zone using Cloud DNS{#create-a-hosted-zone-using-cloud-dns}

Go to [Cloud DNS](https://console.cloud.google.com/net-services/dns/zones) in your GCP console and create a DNS zone.

![V0XRbvlgLoHRPexZSzEcFB5rn17](/img/V0XRbvlgLoHRPexZSzEcFB5rn17.png)

1. Select **Private** in **Zone type**.

1. Set **Zone name** to `zilliz-privatelink-zone` or other values that you see fit.

1. Set **DNS name** to the private link obtained in step 7.

    A valid DNS name is similar to `in01-xxxxxxxxxxxxxxx.gcp-us-west1.vectordb.zillizcloud.com`.

1. Select the proper VPC network in **Networks**.

1. Click **CREATE**.

### Create a record in the hosted zone{#create-a-record-in-the-hosted-zone}

1. In the zone created above, click **ADD STANDARD** in the **RECORD SETS** tab.

1. On the **Create record set** page, create an **A** record with the default settings.

    ![Zys4bZxploNNTex5h2OcGGwnnYd](/img/Zys4bZxploNNTex5h2OcGGwnnYd.png)

1. Click **SELECT IP ADDRESS** in **IPv4 Address**, and select the IP address of your endpoint.

    ![Uh1sbVdLSok8N6xyRMhcildDn7f](/img/Uh1sbVdLSok8N6xyRMhcildDn7f.png)

1. Click **CREATE**.

## Troubleshooting{#troubleshooting}

### Why does it always report `Name or service not known` when I ping the private link on GCP?{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

Check your DNS settings by referring to [Set up firewall rules and a DNS record](https://zilliz.com/doc/setup_private_link-gcp#Set-up-firewall-rules-and-a-DNS-record).

- If the configuration is correct, when you ping your private link, you should see

    ![private_link_gcp_ts_01](/img/private_link_gcp_ts_01.png)

- If the configuration is incorrect, when you ping your private link, you may see

    ![private_link_gcp_ts_02](/img/private_link_gcp_ts_02.png)

    