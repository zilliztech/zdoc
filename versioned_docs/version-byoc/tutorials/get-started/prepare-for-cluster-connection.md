---
title: "Prepare for Cluster Connection | BYOC"
slug: /prepare-for-cluster-connection
sidebar_key: prepare-for-cluster-connection
sidebar_label: "Prepare for Cluster Connection"
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
beta: CONTACT SALES
notebook: FALSE
description: "All BYOC clusters are hosted entirely on your own virtual networks (AWS VPC, GCP VPC, or Microsoft Azure VNet) and do not have public endpoints. This guide explains the two approaches to connecting to these BYOC clusters. | BYOC"
type: origin
token: Ah0DwMIWsilLa4kVbYocJGCMnlh
sidebar_position: 7
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - connect to database
  - connect to cluster

---

import Admonition from '@theme/Admonition';
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

import Procedures from '@site/src/components/Procedures';

# Prepare for Cluster Connection

All BYOC clusters are hosted entirely on your own virtual networks (AWS VPC, GCP VPC, or Microsoft Azure VNet) and do not have public endpoints. This guide explains the two approaches to connecting to these BYOC clusters.

<details>

<summary>Terms and their equivalents used by cloud providers</summary>

This guide applies to all BYOC clusters, regardless of the cloud provider. To address terminology differences and simplify descriptions, the terms used in the guide are listed below, along with their mappings to those used by different providers.

<table>
   <tr>
     <th><p>Terms</p></th>
     <th><p>AWS</p></th>
     <th><p>GCP</p></th>
     <th><p>Azure</p></th>
   </tr>
   <tr>
     <td><p><strong>Virtual network</strong></p></td>
     <td><p>VPC</p></td>
     <td><p>VPC</p></td>
     <td><p>VNet</p></td>
   </tr>
   <tr>
     <td><p><strong>Security group</strong></p></td>
     <td><p>Security group</p></td>
     <td><p>Firewall rules</p></td>
     <td><p>Network Security Group (NSG)</p></td>
   </tr>
   <tr>
     <td><p><strong>Load balancer</strong></p></td>
     <td><p>Network Load Balancer (NLB)</p></td>
     <td><p>Cloud Load Balancer</p></td>
     <td><p>Load Balancer</p></td>
   </tr>
   <tr>
     <td><p><strong>Private endpoint</strong></p></td>
     <td><p>PrivateLink</p></td>
     <td><p>Private Service Connect (PSC)</p></td>
     <td><p>Private Link</p></td>
   </tr>
   <tr>
     <td><p><strong>Virtual network endpoint</strong></p></td>
     <td><p>VPC Endpoint</p></td>
     <td><p>PSC Endpoint</p></td>
     <td><p>Private Endpoint</p></td>
   </tr>
   <tr>
     <td><p><strong>Virtual network endpoint service</strong></p></td>
     <td><p>VPC Endpoint Service</p></td>
     <td><p>PSC Publishing</p></td>
     <td><p>Private Link Service</p></td>
   </tr>
</table>

</details>

## Available connection modes\{#available-connection-modes}

You can connect to your BYOC clusters in either of the following modes:

- **[Direct VPC access](./prepare-for-cluster-connection#direct-vpc-access)**

    In this mode, the clients, usually your applications that interact with BYOC clusters, reside in the same virtual network as the BYOC clusters. This mode is the default choice and requires no additional network configuration. 

    To use this, **leave the private endpoint unselected during the data plane deployment.**

- **[Private endpoint access](./prepare-for-cluster-connection#private-endpoint-access)**

    In this mode, clients may reside in multiple virtual networks or across different accounts. This requires a one-time setup, but adding new clusters or connecting additional client virtual networks becomes straightforward once the private endpoint is in place. 

    To use this, **enable the private endpoint during the data plane deployment.**

The following table compares these two modes in terms of setup complexity, availability, per-cluster access control, cross-account support, and multi-virtual-network scalability.

<table>
   <tr>
     <th></th>
     <th><p><strong>Mode 1: Direct VPC Access</strong></p></th>
     <th><p><strong>Mode 2: PrivateLink Access</strong></p></th>
   </tr>
   <tr>
     <td><p><strong>Best for</strong></p></td>
     <td><p>Clients in the same VPC as the data plane</p></td>
     <td><p>Clients in multiple VPCs or different accounts</p></td>
   </tr>
   <tr>
     <td><p><strong>Setup complexity</strong></p></td>
     <td><p>Low — works by default after deployment</p></td>
     <td><p>One-time setup; simpler to scale as new clusters are added, automatically accessible via wildcard DNS</p></td>
   </tr>
   <tr>
     <td><p><strong>Availability</strong></p></td>
     <td><p>Default for all BYOC deployments</p></td>
     <td><p>Currently requires contacting Zilliz Support to enable (self-service coming soon)</p></td>
   </tr>
   <tr>
     <td><p><strong>Per-cluster access control</strong></p></td>
     <td><p>Security Group per cluster load balancer</p></td>
     <td><p>Kubernetes Envoy Gateway SecurityPolicy</p></td>
   </tr>
   <tr>
     <td><p><strong>Cross-account support</strong></p></td>
     <td><p>No</p></td>
     <td><p>Yes</p></td>
   </tr>
   <tr>
     <td><p><strong>Multi-virtual-network scalability</strong></p></td>
     <td><p>Low — each new client VPC requires a separate VPC Peering and routing configurations.</p></td>
     <td><p>High — new client VPCs connect via a single Endpoint Service; new clusters are reachable immediately.</p></td>
   </tr>
</table>

## Direct VPC access\{#direct-vpc-access}

Each BYOC cluster is actually a Kubernetes cluster and exposes a load balancer as its entry point. The load balancer forwards incoming traffic to the cluster on port 19530. Zilliz manages the cluster endpoint via a public hosted zone, so traffic can be resolved from any network if your clients have established layer-3 connections to the load balancer.

![WXXlwsQOfhAw5NbizaFcvEYJnBh](https://zdoc-images.s3.us-west-2.amazonaws.com/WXXlwsQOfhAw5NbizaFcvEYJnBh.png)

The diagram above illustrates the traffic flow from your client application to BYOC clusters, where cluster-specific load balancers forward traffic to Milvus Proxy in each cluster. Each cluster has its own load balancer, allowing you to implement cluster-level access control.

### Prerequisites\{#prerequisites}

- The client application is running in the same virtual network as the data plane of your BYOC project, or the client virtual network and the data plane virtual network are connected via a virtual network peering with appropriate route table entries.

- The security group associated with your client allows **outbound traffic on port 19530** to the data plane virtual network segment.

- The data plane security group allows **inbound traffic on port 19530** from your client's network segment or security group.

### Step 1: Get your cluster endpoint\{#step-1-get-your-cluster-endpoint}

<Procedures>

1. Open the [Zilliz Cloud console](https://cloud.zilliz.com).

1. Navigate to your BYOC project and select your cluster.

1. On the **Cluster Details** page, locate the **Connect** card.

1. Copy the **Cluster Endpoint** — it is in the format `https://${cluster-id}-internal.${region}.byoc.vectordb.zillizcloud.com:19530`.

    <Admonition type="info" icon="📘" title="Notes">

    <p>For those BYOC clusters deployed using Terraform, you can also retrieve their endpoints from the Terraform output.</p>

    </Admonition>

</Procedures>

### Step 2: Connect to the cluster\{#step-2-connect-to-the-cluster}

Then you can connect the cluster with the copied cluster endpoint and credentials. For details, refer to [Connect to Cluster](./connect-to-cluster).

## Private endpoint access\{#private-endpoint-access}

If you have enabled the private endpoint during the deployment of your BYOC project data plane, a shared gateway is deployed in the data plane virtual network with a single load balancer as its entry point. The gateway terminates TLS and routes traffic to the correct cluster based on the request hostname. 

In this case, you need to expose the load balancer as a virtual network endpoint, allowing any number of client virtual networks, including those in other cloud provider accounts, to connect to your BYOC clusters via that endpoint.

![L0zPwoEePhJF9Bbgln3cQXFMn8e](https://zdoc-images.s3.us-west-2.amazonaws.com/L0zPwoEePhJF9Bbgln3cQXFMn8e.png)

As illustrated in the diagram above, traffic between the client application and a BYOC cluster passes through the virtual network endpoint in the client virtual network, the virtual network endpoint service, the shared load balancer in the data plane virtual network that serves as the Zilliz Gateway, the cluster-specific TLS termination gateway, and the Milvus Proxy in each cluster.

The cluster endpoint (`*.${region}.byoc.vectordb.zillizcloud.com`) resolves to a public address managed by Zilliz Cloud. Therefore, each client virtual network must override DNS resolution by adding a DNS record that points the wildcard domain to the virtual network's private IP addresses.

<Admonition type="info" icon="📘" title="Notes">

<p>If you deselect the private endpoint option during the data plane deployment and require private endpoint access, <a href="https://support.zilliz.com/hc/en-us/requests/new">contact us</a> so that we can enable the gateway deployment in your data plane. </p>

</Admonition>

### Prerequisites\{#prerequisites}

- You have a BYOC project, and Zilliz Technical Support has confirmed that the gateway is deployed.

- You have permissions to manage virtual network endpoints, virtual network endpoint services, and DNS records.

- Client virtual networks are in the same region as the data plane of your BYOC project.

### Step 1: Create a Virtual Network Endpoint Service\{#step-1-create-a-virtual-network-endpoint-service}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

The load balancer is named `zilliz-gateway` in your data plane. You need to create a virtual network endpoint service from this load balancer so that client virtual networks can connect to it.

There are three options available. You can create a virtual network endpoint on the AWS console, in AWS CloudShell, or using the Terraform script Zilliz provides.

#### On AWS Console\{#on-aws-console}

<Procedures>

1. Go to the **VPC** console and choose **PrivateLink and Lattice** > **Endpoint services**.

1. Click **Create endpoint service**.

1. Under **Load balancer type**, select **Network**.

1. Under **Available load balancers**, select the NLB named **`zilliz-gateway`**.

1. Set **Acceptance required** according to your access control preference (disable for automatic acceptance).

1. Click **Create endpoint service**.

1. Note the **Service name** (e.g., `com.amazonaws.vpce.${region}.vpce-svc-xxxxxxxxxxxxxxxxx`) — you will share this with all client VPC owners.

</Procedures>

#### In AWS CloudShell\{#in-aws-cloudshell}

Run the following commands to create the virtual network endpoint.

```bash
# Get the ARN of the zilliz-gateway NLB
NLB_ARN=$(aws elbv2 describe-load-balancers \
  --query "LoadBalancers[?LoadBalancerName=='zilliz-gateway'].LoadBalancerArn" \
  --output text)

# Create the endpoint service
aws ec2 create-vpc-endpoint-service-configuration \
  --network-load-balancer-arns "$NLB_ARN" \
  --no-acceptance-required \
  --query "ServiceConfiguration.ServiceName" \
  --output text
```

#### Using Terraform\{#using-terraform}

Run the following commands to create the virtual network endpoint.

```bash
data "aws_lb" "zilliz_gateway" {
  name = "zilliz-gateway"
}

resource "aws_vpc_endpoint_service" "zilliz_gateway" {
  network_load_balancer_arns = [data.aws_lb.zilliz_gateway.arn]
  acceptance_required        = false
}

output "endpoint_service_name" {
  value = aws_vpc_endpoint_service.zilliz_gateway.service_name
}
```

</TabItem>

<TabItem value="gcp">

#### On the GCP Console\{#on-the-gcp-console}

#### In GCP Cloud Shell\{#in-gcp-cloud-shell}

#### Using Terraform\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### On the Azure Console\{#on-the-azure-console}

#### In Azure Cloud Shell\{#in-azure-cloud-shell}

#### Using Terraform\{#using-terraform}

</TabItem>

</Tabs>

### Step 2: Create a Virtual Network Endpoint in each client virtual network\{#step-2-create-a-virtual-network-endpoint-in-each-client-virtual-network}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

#### On AWS Console\{#on-aws-console}

Repeat the following procedure for every client VPC that needs to connect to your BYOC clusters.

<Procedures>

1. Go to the **VPC** console and choose **PrivateLink and Lattice** > **Endpoints**.

1. Click **Create endpoint**.

1. Under **Service category**, select **Other endpoint services**.

1. Paste the **Service name** from Step 1 and click **Verify service**.

1. Select the **VPC** where your client application runs.

1. Select the **subnets** in each availability zone you want to use.

1. Assign a **security group** that allows inbound traffic on port 19530.

1. Click **Create endpoint**.

1. Wait for the endpoint status to become **Available**.

</Procedures>

For each VPC Endpoint created above, retrieve the private IP address assigned in each subnet as follows:

<Procedures>

1. Go to the **VPC** console and click **Endpoints**.

1. Select the endpoint and go to the **Subnets** tab.

1. Note the **IP address** listed for each subnet. You will use these as the A record targets.

</Procedures>

#### In AWS CloudShell\{#in-aws-cloudshell}

Replace placeholders with your values and run the commands.

```bash
# Replace with your values
SERVICE_NAME="com.amazonaws.vpce.${region}.vpce-svc-xxxxxxxxxxxxxxxxx"
VPC_ID="vpc-xxxxxxxxxxxxxxxxx"
SUBNET_IDS="subnet-aaa subnet-bbb subnet-ccc"
SECURITY_GROUP_ID="sg-xxxxxxxxxxxxxxxxx"

aws ec2 create-vpc-endpoint \
  --vpc-endpoint-type Interface \
  --service-name "$SERVICE_NAME" \
  --vpc-id "$VPC_ID" \
  --subnet-ids $SUBNET_IDS \
  --security-group-ids "$SECURITY_GROUP_ID"
```

#### Using Terraform\{#using-terraform}

Replace placeholders with your values and run the commands.

```bash
resource "aws_vpc_endpoint" "zilliz_byoc" {
  vpc_id              = var.client_vpc_id
  service_name        = aws_vpc_endpoint_service.zilliz_gateway.service_name
  vpc_endpoint_type   = "Interface"
  subnet_ids          = var.client_subnet_ids
  security_group_ids  = [var.client_security_group_id]
}
```

</TabItem>

<TabItem value="gcp">

#### On the GCP Console\{#on-the-gcp-console}

#### In GCP Cloud Shell\{#in-gcp-cloud-shell}

#### Using Terraform\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### On the Azure Console\{#on-the-azure-console}

#### In Azure Cloud Shell\{#in-azure-cloud-shell}

#### Using Terraform\{#using-terraform}

</TabItem>

</Tabs>

### Step 3: Configure DNS records\{#step-3-configure-dns-records}

<Tabs groupId="prepare-for-cluster-connection" defaultValue="aws" values={[{"label": "AWS", "value": "aws"},{"label": "GCP", "value": "gcp"},{"label": "Azure", "value": "azure"}]}>

<TabItem value="aws">

The cluster endpoint domain (`*.aws-${region}.byoc.vectordb.zillizcloud.com`) resolves to a publicly reachable Zilliz-managed IP address. To redirect this to your VPC Endpoint, you must create a private Route 53 hosted zone that overrides DNS resolution within your VPC. 

Repeat the following procedure for every client VPC that needs to connect to your BYOC clusters.

<Procedures>

1. Open the **Route 53** console and go to **Hosted zones**.

1. Click **Create hosted zone**.

1. Set **Domain name** to `aws-${region}.byoc.vectordb.zillizcloud.com` (replace `${region}` with your AWS region, e.g., `aws-us-west-2.byoc.vectordb.zillizcloud.com`).

1. Set **Type** to **Private hosted zone**.

1. Associate it with your client VPC.

1. Click **Create hosted zone**.

1. Inside the hosted zone, click **Create record**.

1. Set **Record name** to `*` (wildcard).

1. Set **Record type** to **A**.

1. Enter the endpoint IP addresses from above (one per line if using multivalue).

1. Click **Create records**.

</Procedures>

#### In AWS CloudShell\{#in-aws-cloudshell}

Replace placeholders with your values and run the commands.

```bash
REGION="us-west-2"
VPC_ID="vpc-xxxxxxxxxxxxxxxxx"
HOSTED_ZONE_NAME="aws-${REGION}.byoc.vectordb.zillizcloud.com"
ENDPOINT_IPS='["10.0.1.x", "10.0.2.x", "10.0.3.x"]'  # Replace with your endpoint IPs

# Create the private hosted zone
HOSTED_ZONE_ID=$(aws route53 create-hosted-zone \
  --name "$HOSTED_ZONE_NAME" \
  --caller-reference "$(date +%s)" \
  --hosted-zone-config "PrivateZone=true" \
  --vpc "VPCRegion=${REGION},VPCId=${VPC_ID}" \
  --query "HostedZone.Id" \
  --output text)

# Add the wildcard A record
aws route53 change-resource-record-sets \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --change-batch "{
    \"Changes\": [{
      \"Action\": \"CREATE\",
      \"ResourceRecordSet\": {
        \"Name\": \"*.${HOSTED_ZONE_NAME}\",
        \"Type\": \"A\",
        \"TTL\": 60,
        \"ResourceRecords\": $(echo $ENDPOINT_IPS | jq '[.[] | {\"Value\": .}]')
      }
    }]
  }"
```

To associate additional VPCs with the same hosted zone:

```dart
aws route53 associate-vpc-with-hosted-zone \
  --hosted-zone-id "$HOSTED_ZONE_ID" \
  --vpc "VPCRegion=${REGION},VPCId=${ADDTIONAL_VPC_ID}"
```

#### Using Terraform\{#using-terraform}

Replace placeholders with your values and run the commands.

```bash
locals {
  region         = "us-west-2"
  endpoint_ips   = ["10.0.1.x", "10.0.2.x", "10.0.3.x"]  # Replace with your endpoint IPs
}

resource "aws_route53_zone" "zilliz_byoc" {
  name = "aws-${local.region}.byoc.vectordb.zillizcloud.com"

  vpc {
    vpc_id = var.client_vpc_id
  }
}

resource "aws_route53_record" "zilliz_byoc_wildcard" {
  zone_id = aws_route53_zone.zilliz_byoc.zone_id
  name    = "*.aws-${local.region}.byoc.vectordb.zillizcloud.com"
  type    = "A"
  ttl     = 60
  records = local.endpoint_ips
}

# Associate additional VPCs if needed
resource "aws_route53_zone_association" "additional_vpc" {
  for_each = toset(var.additional_vpc_ids)

  zone_id = aws_route53_zone.zilliz_byoc.zone_id
  vpc_id  = each.value
}
```

</TabItem>

<TabItem value="gcp">

#### On the GCP Console\{#on-the-gcp-console}

#### In GCP Cloud Shell\{#in-gcp-cloud-shell}

#### Using Terraform\{#using-terraform}

</TabItem>

<TabItem value="azure">

#### On the Azure Console\{#on-the-azure-console}

#### In Azure Cloud Shell\{#in-azure-cloud-shell}

#### Using Terraform\{#using-terraform}

</TabItem>

</Tabs>

### Step 4: Connect to the cluster\{#step-4-connect-to-the-cluster}

Then you can connect the cluster with the copied cluster endpoint and credentials. For details, refer to [Connect to Cluster](./connect-to-cluster).

## Troubshootings\{#troubshootings}

The following table lists common issues you may encounter during preparation. 

<table>
   <tr>
     <th><p><strong>Symptom</strong></p></th>
     <th><p><strong>Likely cause</strong></p></th>
     <th><p><strong>Resolution</strong></p></th>
   </tr>
   <tr>
     <td><p>Connection timeout (Mode 1)</p></td>
     <td><p>Security group blocking port 19530</p></td>
     <td><p>Add an inbound rule on port 19530 in the data plane security group, or an outbound rule in the client security group.</p></td>
   </tr>
   <tr>
     <td><p>Connection timeout (Mode 2)</p></td>
     <td><p>DNS not overridden, or VPC Endpoint not ready</p></td>
     <td><p>Verify the hosted zone is associated with the correct VPC; confirm the endpoint status is Available</p></td>
   </tr>
   <tr>
     <td><p>DNS resolves to an incorrect IP address (Mode 2)</p></td>
     <td><p>Private hosted zone not associated with client VPC</p></td>
     <td><p>Associate the Route 53 hosted zone with all client VPCs</p></td>
   </tr>
   <tr>
     <td><p>TLS error</p></td>
     <td><p><code>secure=True</code> / HTTPS not specified in SDK</p></td>
     <td><p>Ensure the endpoint URI starts with <code>https://</code></p></td>
   </tr>
</table>

