---
title: "Set up a Private Service Connect (GCP) | Cloud"
slug: /setup-a-private-link-gcp
sidebar_label: "Set up a Private Service Connect (GCP)"
beta: FALSE
notebook: FALSE
description: "This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different GCP VPCs. | Cloud"
type: origin
token: IojuwADAwiRK0hkl4pgcvC2QnQd
sidebar_position: 2
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
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


# Set up a Private Service Connect (GCP)

This guide demonstrates the procedure for setting up a private link from a Zilliz Cloud cluster to your service hosted in different GCP VPCs.

This feature is exclusively available to Dedicated (Enterprise) clusters.

A private link is set up at the project level and is effective for all clusters deployed within the same cloud provider and region under this project.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud does not charge you for private links. However, your cloud provider may <a href="https://cloud.google.com/vpc/pricing#psc-forwarding-rule-service">charge you for each endpoint</a> that you create to access Zilliz Cloud.</p>

</Admonition>

## Before you start{#before-you-start}

Make sure the following condition is met:

- A Dedicated (Enterprise) cluster has been created. For information on how to create a cluster, see [Create Cluster](./create-cluster).

## Create private endpoint{#create-private-endpoint}

Zilliz Cloud offers you an intuitive web console to add a private endpoint. Navigate to your target project and click **Network > Private Endpoint** in the left navigation. Click **+ Private Endpoint**.

![setup_private_link_aws_01](/img/setup_private_link_aws_01.png)

### Select a cloud provider and region{#select-a-cloud-provider-and-region}

To create a private endpoint for a cluster deployed in a GCP region, select **GCP** from the **Cloud Provider** drop-down list. In **Region**, select the region that accommodates the cluster you want to access privately. Click **Next**. 

For more information on available cloud providers and regions, see [Cloud Providers & Regions](./cloud-providers-and-regions). 

![setup_private_link_window_gcp](/img/setup_private_link_window_gcp.png)

### Create an endpoint{#create-an-endpoint}

You need to complete this step on your cloud provider console using either the UI console or CLI.

- **Via UI console**

    To create an endpoint on the Google Cloud UI console, refer to [this documentation](https://cloud.google.com/vpc/docs/configure-private-service-connect-services#create-endpoint) for step-by-step instructions.

    Note that for Step 5 in the doc above, use as the service attachment URI you copied from Zilliz Cloud console.

    ![service_uri_gpc](/img/service_uri_gpc.png)

- **Via CLI**

    1. Switch to the **Via CLI** tab.

    1. Enter the **Project ID**. 

        To obtain a Google Cloud project ID,

        1. Open the [Google Cloud Dashboard](https://console.cloud.google.com/home/dashboard).

        1. Find the Project ID of your desire and copy its ID.

        1. Enter this ID in Google Cloud Project ID on Zilliz Cloud.

    1. Enter the **VPC Name**.

        Before creating a VPC endpoint, you need to have a VPC on your GCP console. To view your VPCs, do as follows:

        1. Open the [Google Cloud VPC Dashboard](https://console.cloud.google.com/networking/networks/list).

        1. In the navigation pane, choose **VPC networks**.

        1. Find the VPC of your desire and copy its Name.

        1. Enter this name in **VPC Name** on Zilliz Cloud.

        To create a VPC network, see [Create and manage VPC networks](https://cloud.google.com/vpc/docs/create-modify-vpc-networks).

    1. Enter the **Subnet Name**.

        Subnets are sub-divisions of your VPC. You need to have a subnet that resides in the same region as the private link to be created. To view your subnets, do as follows:

        1. Open your [VPC network list](https://console.cloud.google.com/networking/networks/list).

        1. In the navigation pane, choose **VPC networks**.

        1. Click the name of the VPC of your desire.

        1. Find the subnet of your desire and copy its name.

        1. Enter this name in **Subnet Name** on Zilliz Cloud.

    1. Enter the **Private Service Connect Endpoint Prefix**.

        For your convenience, you are required to set an endpoint prefix in **Private Service Connect Endpoint prefix** so that any forwarding rules you create will have this prefix.

    1. Click **Copy and Go**.

        You will be redirected to your cloud provider console. In the top navigation, activated the Google Cloud Cloud Shell. Run the CLI command you just copied from Zilliz Cloud in the Cloud Shell.

        ![setup_private_link_window_gcp](/img/setup_private_link_window_gcp.png)

        When the endpoint is created, navigate to the [Google Cloud Private Service Connect page](https://console.cloud.google.com/net-services/psc/list/consumers) and copy the name of the endpoint you just created. 

### Authorize your endpoint{#authorize-your-endpoint}

Paste the endpoint ID and project ID you obtained from the Google Cloud console into the **Endpoint ID** and **Project ID** box respectively on Zilliz Cloud. Click **Create**.

## Obtain a private link{#obtain-a-private-link}

After verifying and accepting the preceding attributes you have submitted, Zilliz Cloud allocates a private link for this endpoint. This process takes about 5 minutes. 

When the private link is ready, you can view it on the **Private Link** page on Zilliz Cloud.

## Set up firewall rules and a DNS record{#set-up-firewall-rules-and-a-dns-record}

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

## Troubleshooting{#troubleshooting}

### Why does it always report `Name or service not known` when I ping the private link on GCP?{#why-does-it-always-report-name-or-service-not-known-when-i-ping-the-private-link-on-gcp}

Check your DNS settings by referring to [Set up firewall rules and a DNS record](./setup-a-private-link-gcp#set-up-firewall-rules-and-a-dns-record).

- If the configuration is correct, when you ping your private link, you should see

    ![private_link_gcp_ts_01](/img/private_link_gcp_ts_01.png)

- If the configuration is incorrect, when you ping your private link, you may see

    ![private_link_gcp_ts_02](/img/private_link_gcp_ts_02.png)

    