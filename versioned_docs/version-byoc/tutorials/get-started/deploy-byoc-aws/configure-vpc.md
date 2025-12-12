---
title: "Configure a Customer-Managed VPC on AWS | BYOC"
slug: /configure-vpc
sidebar_label: "Configure a Customer-Managed VPC on AWS"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "The Zilliz Cloud Bring-Your-Own-Cloud (BYOC) solution enables you to set up a project within your own Virtual Private Cloud (VPC). With a Zilliz Cloud project running in a customer-managed VPC, you gain greater control over your network configurations, allowing you to meet specific cloud security and governance standards required by your organization. | BYOC"
type: origin
token: U3mEwtr42i7GJsk25nzcc4KonUc
sidebar_position: 4
keywords: 
  - zilliz
  - byoc
  - aws
  - vpc
  - security group
  - vpc endpoint
  - subnet
  - milvus
  - vector database
  - milvus lite
  - milvus benchmark
  - managed milvus
  - Serverless vector database

---

import Admonition from '@theme/Admonition';


# Configure a Customer-Managed VPC on AWS

The Zilliz Cloud Bring-Your-Own-Cloud (BYOC) solution enables you to set up a project within your own Virtual Private Cloud (VPC). With a Zilliz Cloud project running in a customer-managed VPC, you gain greater control over your network configurations, allowing you to meet specific cloud security and governance standards required by your organization. 

This page enumerates the minimum requirements for you to host a Zilliz Cloud BYOC project in a customer-managed VPC that meets these requirements. 

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## VPC requirements\{#vpc-requirements}

Your VPC must meet the requirements enumerated in this section to host a Zilliz Cloud project. If you prefer to use an existing VPC for your BYOC project, ensure that your VPC meets these requirements. 

**Requirements**

- [VPC regions](./configure-vpc#vpc-regions)

- [VPC IP address ranges](./configure-vpc#vpc-ip-address-ranges)

- [Subnets](./configure-vpc#subnets)

- [DNS support](./configure-vpc#dns-support)

- [NAT gateway](./configure-vpc#nat-gateway)

- [Security group](./configure-vpc#security-group)

- [VPC endpoint](./configure-vpc#vpc-endpoint)

### VPC regions\{#vpc-regions}

The following table lists the AWS cloud regions the Zilliz Cloud BYOC solution supports. If you cannot find your cloud regions on the Zilliz Cloud console, please contact us at support@zilliz.com.

<table>
   <tr>
     <th><p>AWS Region</p></th>
     <th><p>Location</p></th>
   </tr>
   <tr>
     <td><p>us-west-2</p></td>
     <td><p>Oregon</p></td>
   </tr>
   <tr>
     <td><p>eu-central-1</p></td>
     <td><p>Frankfurt</p></td>
   </tr>
</table>

### VPC IP address ranges\{#vpc-ip-address-ranges}

Zilliz Cloud recommends using the **/16** netmask in IPv4 CIDR settings for the VPC, allowing a public subnet and three private subnets to be created from the CIDR block.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz Cloud currently supports only IPv4 CIDR blocks.</p>

</Admonition>

### Subnets\{#subnets}

A Zilliz Cloud project requires one public subnet and three private subnets, with each private subnet in a different availability zone. 

The public subnet hosts the NAT gateway and has a netmask of **/24**. Each private subnet has a netmask of **/18** and must be tagged with `kubernetes.io/role/internal-elb=1` to allow the use of Application Load Balancer (ALB) Ingress routing within the EKS cluster. 

For details on how ALB routes application and HTTP traffic for the pods in the EKS cluster, refer to [this article](https://docs.aws.amazon.com/eks/latest/userguide/alb-ingress.html).

### DNS support\{#dns-support}

The VPC should have DNS hostnames and DNS resolution enabled.

### NAT gateway\{#nat-gateway}

Zilliz Cloud will set up a single NAT gateway in the public subnet to enable resources in private subnets to reach the Internet. External services, however, cannot initiate a connection with the resources in private subnets.

### Security group\{#security-group}

The ingress rule should open port 443. For details on creating the security group, refer to [Step 2: Create a security group](./configure-vpc#step-2-create-a-security-group).

### VPC endpoint\{#vpc-endpoint}

The VPC endpoint is optional and will be used when you need to configure private endpoints for your BYOC clusters. For details on creating the security group, refer to [Step 3: (Optional) Create a VPC endpoint](./configure-vpc#step-3-optional-create-a-vpc-endpoint).

## Procedure\{#procedure}

You can create the VPC and related resources using the AWS console. As an alternative, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on AWS. For details, refer to [Terraform Provider](./terraform-provider).

### Step 1: Create VPC and resources\{#step-1-create-vpc-and-resources}

On the AWS console, you can create the VPC and related resources enumerated in [VPC requirements](./configure-vpc#vpc-requirements).

1. Go to the VPC dashboard on AWS.

1. Check the cloud region in the region drop-down in the upper-right corner. Change it to the one as that of your Zilliz Cloud project.

1. Click the **Create VPC** button.

1. In **VPC settings**, set as depicted in the following snapshot.

![create-aws-vpc-byoc](https://zdoc-images.s3.us-west-2.amazonaws.com/create-aws-vpc-byoc.png "create-aws-vpc-byoc")

1. Click **Create VPC**.

1. Once the VPC has been created, scroll down the details, click **View VPC.**

1. In the **Details** section, copy the VPC ID, and paste it back to Zilliz Cloud.

    ![Rkj2bzxw0ocgLzxE63AcJ0VEnHe](https://zdoc-images.s3.us-west-2.amazonaws.com/rkj2bzxw0ocglzxe63acj0venhe.png "Rkj2bzxw0ocgLzxE63AcJ0VEnHe")

1. In the **Resource map** section, click the external link icon at the end of each private subnet to view its details.

    ![VecQbx7epoBqABx8vKOcaIS7nDd](https://zdoc-images.s3.us-west-2.amazonaws.com/vecqbx7epobqabx8vkocais7ndd.png "VecQbx7epoBqABx8vKOcaIS7nDd")

1. On the **Subnet Details** page, copy the subnet ID. 

    ![GPimbEY2Aoz5UtxUCxkcqrAYnjc](https://zdoc-images.s3.us-west-2.amazonaws.com/gpimbey2aoz5utxucxkcqraynjc.png "GPimbEY2Aoz5UtxUCxkcqrAYnjc")

1. Then click **Manage tags**. On the page prompted open, click **Add new tag**, and set **Key** of the new tag list entry to `kubernetes.io/role/internal-elb` and **Value** to `1`. Then click **Save**.

    ![HZdBb4d4QoLEUzxrkxpcqro4nTe](https://zdoc-images.s3.us-west-2.amazonaws.com/hzdbb4d4qoleuzxrkxpcqro4nte.png "HZdBb4d4QoLEUzxrkxpcqro4nTe")

### Step 2: Create a security group\{#step-2-create-a-security-group}

Security groups in a VPC protect your AWS resources by controlling inbound and outbound traffic, acting as a virtual firewall for your EC2 instances. You can create security groups as follows:

1. Go to the VPC dashboard on AWS.

1. Locate **Security** > **Security groups** in the left navigation pane, and click **Create security group** in the upper right corner of the right pane.

1. Set **Security group name** and **Description** and select the VPC you previously created from the VPC drop-down list.

    ![W6n9b4BRVoVi8PxgrLUcajOtnSc](https://zdoc-images.s3.us-west-2.amazonaws.com/w6n9b4brvovi8pxgrlucajotnsc.png "W6n9b4BRVoVi8PxgrLUcajOtnSc")

1. Click **Add rule** in the **Inbound rules** section to create an inbound rule.

1. Select **Anywhere-IPv4** in **Source** or enter a CIDR block from which access is allowed in the text box on the right of the **Source** drop-down.

    ![Z6SObL7FYofXBuxk46WcuRsbnLb](https://zdoc-images.s3.us-west-2.amazonaws.com/z6sobl7fyofxbuxk46wcursbnlb.png "Z6SObL7FYofXBuxk46WcuRsbnLb")

1. Add a record, select **HTTPS** in **Type** and **Anywhere-IPv4** in **Destination** or enter a CIDR block to which access is allowed in the text box on the right of the **Destination** drop-down.

    ![N0B8bIiXdobTjUxp1AVc76Xcnsc](https://zdoc-images.s3.us-west-2.amazonaws.com/n0b8biixdobtjuxp1avc76xcnsc.png "N0B8bIiXdobTjUxp1AVc76Xcnsc")

1. In the **Tags** section, add a key-value pair as depicted in the following screenshot.

    ![FlaPbHes2oLjZ8xO1X9cppYTnyc](https://zdoc-images.s3.us-west-2.amazonaws.com/flapbhes2oljz8xo1x9cppytnyc.png "FlaPbHes2oLjZ8xO1X9cppYTnyc")

1. Click **Create security group** to save the security group.

1. Copy the security group ID back to Zilliz Cloud.

    ![KMuWbhLTVoiyCjx1HXjcGERunZd](https://zdoc-images.s3.us-west-2.amazonaws.com/kmuwbhltvoiycjx1hxjcgerunzd.png "KMuWbhLTVoiyCjx1HXjcGERunZd")

### Step 3: (Optional) Create a VPC endpoint\{#step-3-optional-create-a-vpc-endpoint}

VPC endpoint ensures secure cluster connectivity relay and enables private calls to Zilliz Cloud REST APIs. For guidance on managing VPC endpoints with the AWS Management Console, see the [AWS article Create VPC endpoints](https://docs.aws.amazon.com/vpc/latest/privatelink/create-interface-endpoint.html) in the AWS Management Console, or use the following procedure:

<Admonition type="info" icon="📘" title="Notes">

<p>The VPC endpoint created in this section is used to set up an AWS PrivateLink. Once the VPC endpoint is ready, you must create a hosted zone and add some DNS records. For details, refer to <a href="./setup-a-private-link-aws">Set up a PrivateLink (AWS)</a>.</p>

</Admonition>

1. Go to the **VPC dashboard** on AWS.

1. Locate **PrivateLink and Lattice** > **Endpoints** in the left navigation pane, and click **Create endpoint** in the upper right corner of the right pane.

1. Set **Name tag** or leave it blank to let AWS generate one for you. For **Type**, choose **Endpoint services that use NLBs and GWLBs**.

    ![GRIrbg4sYoN75oxCnRsci3JnnLO](https://zdoc-images.s3.us-west-2.amazonaws.com/grirbg4syon75oxcnrsci3jnnlo.png "GRIrbg4sYoN75oxCnRsci3JnnLO")

1. In **Service settings**, fill Zilliz Cloud VPC endpoint of your region in **Service name** and click **Verify service**. 

    The following table lists the cloud regions currently available. If your cloud region is not listed in the table, please contact us at support@zilliz.com.

    <table>
       <tr>
         <th><p>AWS Region</p></th>
         <th><p>Location</p></th>
         <th><p>Zilliz Cloud VPC endpoint</p></th>
       </tr>
       <tr>
         <td><p>us-west-2</p></td>
         <td><p>Oregon</p></td>
         <td><p><code>com.amazonaws.vpce.us-west-2.vpce-svc-0654fb016640c364a</code></p></td>
       </tr>
       <tr>
         <td><p>eu-central-1</p></td>
         <td><p>Frankfurt</p></td>
         <td><p><code>com.amazonaws.vpce.eu-central-1.vpce-svc-0d5ce1ec4decbc7df</code></p></td>
       </tr>
    </table>

    ![VYLlboU8fofvUPx6NYUcGztpn3s](https://zdoc-images.s3.us-west-2.amazonaws.com/vyllbou8fofvupx6nyucgztpn3s.png "VYLlboU8fofvUPx6NYUcGztpn3s")

1. In **Network settings**, select [the VPC created above](./configure-vpc#step-1-create-vpc-and-resources), and select **Enable DNS name**.

    ![DyH3b9kOro2wf6xGcsUcD2DbnVo](https://zdoc-images.s3.us-west-2.amazonaws.com/dyh3b9koro2wf6xgcsucd2dbnvo.png "DyH3b9kOro2wf6xGcsUcD2DbnVo")

1. In **Subnet**, select [the private subnets created along with the VPC](./configure-vpc#step-1-create-vpc-and-resources). 

    ![IdcebwU1Ao4QffxGwYTceh9AnVe](https://zdoc-images.s3.us-west-2.amazonaws.com/idcebwu1ao4qffxgwytceh9anve.png "IdcebwU1Ao4QffxGwYTceh9AnVe")

1. In **Security groups**, select [the security group created above](./configure-vpc#step-2-create-a-security-group).

1. Click **Create endpoint** to save the above settings.

1. Click the created VPC endpoint ID in the **Endpoints** list to view its details.

    ![KhRBbAbSAoU2X0xdnMtc0Gmunvf](https://zdoc-images.s3.us-west-2.amazonaws.com/khrbbabsaou2x0xdnmtc0gmunvf.png "KhRBbAbSAoU2X0xdnMtc0Gmunvf")

1. Check whether the value in **Private DNS names** is similar to `*.aws-{region}.byoc.cloud.zilliz.com`. 

    1. If so, copy the **Endpoint ID** and paste it back into the Zilliz Cloud console. 

        ![BUejbgXWJoXi5jxDmZnc7Ogdnah](https://zdoc-images.s3.us-west-2.amazonaws.com/buejbgxwjoxi5jxdmznc7ogdnah.png "BUejbgXWJoXi5jxDmZnc7Ogdnah")

    1. If not, check your settings and make necessary changes.

### Step 4: Submit VPC information to Zilliz Cloud\{#step-4-submit-vpc-information-to-zilliz-cloud}

Once you have completed the above procedures on AWS, go back to Zilliz Cloud, enter the VPC ID, the subnet IDs, the security group ID, and the optional VPC endpoint ID in **Network settings**, and click **Next** to view the summary of the entire project deployment process. If everything is configured as expected, click **Deploy** to start the process.

![VDXYbAfS2oQ04YxcMs0cEETbn2c](https://zdoc-images.s3.us-west-2.amazonaws.com/vdxybafs2oq04yxcms0ceetbn2c.png "VDXYbAfS2oQ04YxcMs0cEETbn2c")

