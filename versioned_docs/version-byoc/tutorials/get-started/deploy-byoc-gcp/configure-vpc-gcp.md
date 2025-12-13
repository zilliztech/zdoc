---
title: "Configure a Customer-Managed VPC on GCP | BYOC"
slug: /configure-vpc-gcp
sidebar_label: "Configure a Customer-Managed VPC on GCP"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Zilliz Cloud Bring-Your-Own-Cloud (BYOC) solution enables you to set up a project within your own Virtual Private Cloud (VPC). With a Zilliz Cloud project running in a customer-managed VPC, you gain greater control over your network configurations, allowing you to meet specific cloud security and governance standards required by your organization. | BYOC"
type: origin
token: C94rw7r38ij0eCkvQKBcEFJ1n0e
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - AI Agent
  - semantic search
  - Anomaly Detection
  - sentence transformers

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# Configure a Customer-Managed VPC on GCP

The Zilliz Cloud Bring-Your-Own-Cloud (BYOC) solution enables you to set up a project within your own Virtual Private Cloud (VPC). With a Zilliz Cloud project running in a customer-managed VPC, you gain greater control over your network configurations, allowing you to meet specific cloud security and governance standards required by your organization. 

This page enumerates the minimum requirements for hosting a Zilliz Cloud BYOC project in a customer-managed VPC that meets these requirements. 

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## VPC requirements\{#vpc-requirements}

Your VPC must meet the requirements enumerated in this section to host a Zilliz Cloud project. If you prefer to use an existing VPC for your BYOC project, ensure that your VPC meets these requirements. 

**Requirements**

- [VPC regions](./configure-vpc-gcp#vpc-regions)

- [VPC IP address ranges](./configure-vpc-gcp#vpc-ip-address-ranges)

- [Subnets](./configure-vpc-gcp#subnets)

- [Cloud Router and NAT](./configure-vpc-gcp#cloud-router-and-nat)

- [Firewall Rules](./configure-vpc-gcp#firewall-rules)

- [Private Service Connect (PSC)](./configure-vpc-gcp#private-service-connect-psc-endpoint)

### VPC regions\{#vpc-regions}

The following table lists the Google Cloud Platform (GCP) regions the Zilliz Cloud BYOC solution supports. If you cannot find your cloud regions on the Zilliz Cloud console, please contact us at support@zilliz.com.

<table>
   <tr>
     <th><p>GCP Region</p></th>
     <th><p>Location</p></th>
   </tr>
   <tr>
     <td><p>us-west1</p></td>
     <td><p>Oregon</p></td>
   </tr>
</table>

### VPC IP address ranges\{#vpc-ip-address-ranges}

Zilliz Cloud recommends using the **/18** netmask in IPv4 CIDR settings for the VPC, allowing a public subnet and three private subnets to be created from the CIDR block.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud currently supports only IPv4 CIDR blocks.</p>

</Admonition>

### Subnets\{#subnets}

A Zilliz Cloud BYOC project requires one primary subnet with a primary IPv4 range and two secondary IPv4 ranges, along with a separate load balancing subnet.

### Cloud Router and NAT\{#cloud-router-and-nat}

A Google Cloud Router is required to allow dynamic route exchange between your VPC and other networks. You must also add a NAT gateway to allow the VMs and container pods on your VPC to communicate with Zilliz Cloud's VPC network.

### Firewall Rules\{#firewall-rules}

You need to create two ingress firewall rules: One is for Zilliz Cloud to perform health checks against the clusters within your BYOC project, and the other is for the VM instances within your VPC network to communicate with each other.

### Private Service Connect (PSC) endpoint\{#private-service-connect-psc-endpoint}

The PSC endpoint is optional and will be used when you configure private endpoints for your BYOC clusters. 

## Procedure\{#procedure}

On the GCP dashboard, you can create the VPC and related resources enumerated in [VPC requirements](./configure-vpc-gcp#vpc-requirements). Alternatively, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on GCP. For details, refer to [Terraform Provider](./terraform-provider).

### Step 1: Create a VPC network and add the primary subnet\{#step-1-create-a-vpc-network-and-add-the-primary-subnet}

You will create a VPC network and add the primary subnet in this step. The primary subnet includes a primary IPv4 address range and two secondary IPv4 address ranges for container pods and services.

<Supademo id="cmbhlqpyr5ovksn1rjtbv93bt" title=""  />

The steps to create a VPC network and add the primary subnet are as follows:

1. On the GCP console, find and click **VPC network**.

1. Click **Create VPC network**.

1. Set a name for the VPC and the primary subnet to create.

    In this demo, you can set it to `primary-subnet`, or name the subnet according to your naming conventions.

1. Select the region for the primary subnet.

    The region should be the same as your Zilliz BYOC project.

1. Set the primary IPv4 range for the primary subnet.

    In this demo, you can set it to `10.7.0.0/18` or use the planned network segment. You are advised to remember the name and IPv4 range for further reference.

1. Set the name and IPv4 address range of the secondary IPv4 range for container pods.

    In this demo, you can set the name to `pod-subnet` and range to `10.7.64.0/18`, or follow your naming conventions and networking plan. You are advised to remember the name and IPv4 range for further reference.

1. Click **Add a Secondary IPv4 range** to add a secondary IPv4 range for services, and set its name and range.

    In this demo, you can set the name to `service-subnet` and range `10.7.128.0/18`, or follow your naming conventions and networking plan.

1. Leave the rest in default settings and click **Create**.

### Step 2: Add the load-balancing subnet\{#step-2-add-the-load-balancing-subnet}

You will add a proxy-only subnet reserved for the regional Application Load Balancer in this step.

<Supademo id="cmbhmkul05p81sn1r161bhqiy" title=""  />

The steps for adding this subnet are as follows:

1. On the GCP console, find and click **VPC network**.

1. Filter the VPC network created in the previous step.

1. Click its name to view its details.

1. Switch to the **Subnets** tab, and click **Add subnet**.

1. Set a name for the subnet to create.

    In this demo, you can set it to `lb-subnet`, or name the subnet according to your naming conventions.

1. Select the region for the primary subnet.

    The region should be the same as your Zilliz BYOC project.

1. Select **Regional Managed Proxy** in **Purpose**.

    For details about this option and proxy-only subnets, refer to [this doc](https://cloud.google.com/load-balancing/docs/proxy-only-subnets).

1. Set the primary IPv4 range for this subnet.

    In this demo, you can set it to `10.7.192.0/18` or use the planned network segment.

1. Click **Add**.

### Step 3: Set up the Cloud Router and NAT gateway\{#step-3-set-up-the-cloud-router-and-nat-gateway}

You will configure a Cloud Router and a NAT gateway to enable network address translation for the traffic between your VPC and that of Zilliz Cloud.

<Supademo id="cmbhobhu95slrsn1r9uig4txt" title=""  />

The steps to set up the Cloud Router and NAT gateway are as follows:

1. On the GCP console, find and click **Network Connectivity**.

1. Choose **Cloud Router** in the left navigation pane.

1. Click **Create router**.

1. Set the name for the router to create.

    Set it to `your-org-byoc-router` in this demo, or follow your naming conventions.

1. Select the VPC network created in the previous step.

    In this demo, select `your-org-byoc-vpc`.

1. Select the region for the router to create.

    In this demo, select `us-west1 (Oregon)`.

1. Click **Create**.

1. Click the name of the router listed in the **Routers** list.

1. Scroll down and click **Add Cloud NAT gateway**.

1. Set the name for the NAT gateway to create.

    Set it to `your-org-byoc-nat` in this demo, or follow your naming conventions.

1. Select **Manual** in **Cloud NAT IP address**.

    You need to create a new IP address as follows:

    1. Select **Create IP address** from the drop-down list in **IP address 1**.

    1. In the prompted dialog box, set a name for the IP address to reserve and click **Reserve**.

        Set it to `your-org-byoc-nat-ip` in this demo, or follow your naming conventions.

1. Once the new IP address has been reserved for the NAT gateway, click **Create**.

### Step 4: Add firewall rules\{#step-4-add-firewall-rules}

You will add two firewall rules in this step. The first rule is to enable health checks against BYOC clusters deployed on your VPC network, and the second is to enable communications between all VMs with the target tag `zilliz-byoc`.

<Supademo id="cmbj0hb9p7c84sn1r5q4o16k0" title=""  />

The steps to add these firewall rules are as follows:

1. On the GCP console, find and click **VPC network**.

1. Filter the VPC network created in the previous step.

1. Click the name of the VPC network to view its details.

1. Switch to the **Firewalls** tab.

1. Click **Add Firewall rule**.

    - The firewall rule for health checks against BYOC clusters.

        <table>
           <tr>
             <th><p><strong>Name</strong></p></th>
             <th><p>ingress-rule-for-health-checks</p></th>
           </tr>
           <tr>
             <td><p><strong>Targets</strong></p></td>
             <td><p>All instances in the network</p></td>
           </tr>
           <tr>
             <td><p><strong>Source IPv4 ranges</strong></p></td>
             <td><p><code>130.211.0.0/22</code>, <code>35.191.0.0/16</code></p></td>
           </tr>
           <tr>
             <td><p><strong>Protocols and ports</strong></p></td>
             <td><p>Specified protocols and ports</p></td>
           </tr>
           <tr>
             <td><p><strong>TCP</strong></p></td>
             <td><p><code>19530</code></p></td>
           </tr>
        </table>

    - The firewall rule for local traffic between tagged VMs on the VPC network

        <table>
           <tr>
             <th><p><strong>Name</strong></p></th>
             <th><p>ingress-rule-for-local-traffic</p></th>
           </tr>
           <tr>
             <td><p><strong>Targets</strong></p></td>
             <td><p>Specified target tags</p></td>
           </tr>
           <tr>
             <td><p><strong>Target tags</strong></p></td>
             <td><p><code>zilliz-byoc</code></p></td>
           </tr>
           <tr>
             <td><p><strong>Source IPv4 ranges</strong></p></td>
             <td><p><code>10.7.0.0/18</code> (or use your planned one by referring to step 5 in <a href="./configure-vpc-gcp#step-1-create-a-vpc-network-and-add-the-primary-subnet">this section</a>.)</p></td>
           </tr>
           <tr>
             <td><p><strong>Protocols and ports</strong></p></td>
             <td><p>Allow all</p></td>
           </tr>
        </table>

### Step 5: (Optional) Create a PSC endpoint\{#step-5-optional-create-a-psc-endpoint}

You will add a PSC endpoint to ensure that communications between your VPC and Zilliz Cloud are off the Internet.

<Supademo id="cmbj22gip7cyqsn1r4kes9547" title=""  />

The steps for creating the PSC endpoint are as follows:

1. On the GCP console, find and click **Network Services**.

1. Choose **Private Service Connect** from the left navigation pane.

1. Click **Connect Endpoint**.

1. Select **Published service** in **Target**.

1. Enter the service attachment ID in **Target details** that Zilliz Cloud provides.

    The following table lists the service attachment ID specific to each available cloud regions.

    <table>
       <tr>
         <th><p>Region</p></th>
         <th><p>Service Attachment ID</p></th>
       </tr>
       <tr>
         <td><p>us-west1</p></td>
         <td><p><code>projects/vdc-prod/regions/us-west1/serviceAttachments/zilliz-byoc-psc-service</code></p></td>
       </tr>
    </table>

1. Set a name for the endpoint service.

1. Select the VPC network and its primary subnet created in the previous step.

1. Assign an IP address to the endpoint.

    In the prompted dialog box, do as follows:

    1. Click **Create IP address**.

    1. Set a name for the IP address.

    1. Select **Assign automatically** in **Static IP address**.

    1. Create **Reserve**.

1. Click **Add endpoint**.

