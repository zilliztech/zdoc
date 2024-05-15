---
slug: /byoc-prerequisites
beta: FALSE
notebook: FALSE
type: origin
token: Bw7dwervZiOLHBk6OuWc3RylnKc
sidebar_position: 1

---

import Admonition from '@theme/Admonition';


# Prerequisites

This topic details the prerequisites required for activating the Zilliz Cloud Bring Your Own Cloud (BYOC) license. It's essential to ensure these initial steps are completed before proceeding to the detailed activation steps provided in [Activate Your License](./activate-your-cloud). The prerequisites outlined here are foundational for a successful and efficient activation process.

## Architecture{#architecture}

The following diagram shows the architecture for BYOC deployment. The control plane is hosted within Zilliz Cloud. With necessary authorization, Zilliz Cloud establishes a secure connection via Private Link to access the customer's VPC. It then creates cloud resources and deploys the BYOC components under the customer's cloud account.

![byoc_architecture_global](/byoc/byoc_architecture_global.png)

## Verify subscription via welcome email{#verify-subscription-via-welcome-email}

Upon subscribing to a BYOC license, you will receive a welcome email with your subscription details, including your license ID, core size, and validity period. Verify these details for accuracy before proceeding.

![welcome-email](/byoc/welcome-email.png)

## Set up your environment{#set-up-your-environment}

1. **Operating System Compatibility**: Ensure that your machine operates on one of the following systems:

    - Linux

    - macOS

    - Windows

1. **Terraform Installation**: Zilliz Cloud utilizes Terraform for managing the cloud infrastructure required for BYOC deployment. 

    - macOS

        ```shell
        brew tap hashicorp/tap
        brew install hashicorp/tap/terraform
        ```

    - CentOS/RHEL

        ```shell
        sudo yum install -y yum-utils
        sudo yum-config-manager --add-repo https://rpm.releases.hashicorp.com/RHEL/hashicorp.repo
        sudo yum -y install terraform
        ```

    If you use Windows or other Linux distributions, refer to [Terraform official documentation](https://developer.hashicorp.com/terraform/install?product_intent=terraform) for installation.

## Prepare your accounts{#prepare-your-accounts}

Activation requires two accounts:

1. **AWS Account**: Your Zilliz Cloud BYOC deployment will be hosted within your AWS account. If you do not have an AWS account, create one following the [AWS Account Creation Guide](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts_create.html). The Zilliz Cloud BYOC solution currently supports the AWS **us-west-2** region. For other cloud providers or regions, contact [our sales team](https://zilliz.com/contact-sales).

1. **Zilliz Cloud Account**: Use the account you provided to Zilliz Cloud technical support during the contract signing process.

## Create temporary security credentials{#create-temporary-security-credentials}

To activate your BYOC license using Terraform scripts, you'll need to provide temporary security credentials. These include an access key and a secret key, for AWS cloud resources. It's advisable to create these credentials solely for the activation process and deactivate them afterward.

Here's how to create temporary security credentials:

1. Sign in to the [IAM console](https://console.aws.amazon.com/iam) using your AWS account ID and password.

1. Go to the **Access keys** section and click **Create access key**.

1. On the **Retrieve access keys** page, choose either **Show** to reveal the value of your user's secret access key, or **Download .csv file**. This is your only opportunity to save your secret access key. After you've saved your secret access key in a secure location, choose **Done**.

For detailed instructions, refer to [AWS official documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey).

![create-security-credentials](/byoc/create-security-credentials.png)

## Understand required resources and permissions{#understand-required-resources-and-permissions}

Deploying Zilliz Cloud BYOC requires specific cloud resources and permissions within your AWS account.

### Resource quotas{#resource-quotas}

Refer to the table below for the necessary cloud resources and services for Zilliz Cloud BYOC activation. If the cloud resources in your current account are insufficient, contact your cloud account administrator to increase quotas.

<Admonition type="info" icon="📘" title="Notes">

<p>Cloud administrators can monitor resource usage and quotas in the cloud quota dashboard. For details, refer to <a href="https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html">AWS service quotas</a>.</p>

</Admonition>

<table>
   <tr>
     <th><strong>Resource Type</strong></th>
     <th><strong>Instance</strong><br/></th>
     <th>Min. Config<br/></th>
   </tr>
   <tr>
     <td>Virtual Machine<br/></td>
     <td>EC2<br/></td>
     <td></td>
   </tr>
   <tr>
     <td>Object Storage</td>
     <td>S3</td>
     <td>1.3 TB</td>
   </tr>
   <tr>
     <td>Block Storage</td>
     <td>EBS</td>
     <td>550 GB</td>
   </tr>
   <tr>
     <td>Public IP</td>
     <td>EIP</td>
     <td>1</td>
   </tr>
   <tr>
     <td>Private Network</td>
     <td>VPC<br/></td>
     <td>2</td>
   </tr>
   <tr>
     <td>Network Channel</td>
     <td>PrivateLink</td>
     <td>1</td>
   </tr>
   <tr>
     <td>Load Balance</td>
     <td>AWS LB</td>
     <td>1</td>
   </tr>
   <tr>
     <td>DNS</td>
     <td>DNS Zone</td>
     <td>2</td>
   </tr>
</table>

### IAM permissions{#iam-permissions}

Terraform scripts used in activating Zilliz Cloud BYOC require specific AWS policies and permissions.

The table below summarizes the policies and roles Terraform will create for BYOC license activation.

In the table, the **Terraform Resource Identifier** column lists the internal names used in Terraform scripts, while the **IAM Policy / Role** column shows the actual names as they will appear in your AWS account.

<table>
   <tr>
     <th>Terraform Resource Identifier</th>
     <th>IAM Policy / Role</th>
     <th><strong>Description</strong></th>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>policy.aws<em>lb</em>irsa_policy</strong></td>
     <td><strong>zilliz-aws-lb-irsa-policy</strong></td>
     <td>Manages various aspects of ELB, including creation, modification, and deletion of load balancers and target groups, as well as associated security and tagging permissions, with specific conditions applied to certain actions.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>policy.bootstrap_policy</strong></td>
     <td><strong>zilliz-bootstrap-policy</strong></td>
     <td>Grants permissions for managing AWS resources including EKS, EC2, S3, and Route 53, with specific restrictions and conditions.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>policy.cluster<em>autoscaler</em>irsa_policy</strong></td>
     <td><strong>zilliz-ca-irsa-policy</strong></td>
     <td>Allows for managing auto-scaling and EC2 instance operations in AWS, specifically for scaling and termination actions.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>policy.ebs<em>csi</em>irsa_policy</strong></td>
     <td><strong>zilliz-ebs-csi-irsa-policy</strong></td>
     <td>Manages EC2 volumes and snapshots, including creation, attachment, detachment, and deletion, with specific conditions for tagging and cluster association.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>policy.management_policy</strong></td>
     <td><strong>zilliz-management-policy</strong></td>
     <td>Allows for managing S3 buckets and objects, creating and tagging IAM policies, scaling EKS node groups, and handling various Elastic Load Balancing (ELB) resources, with restrictions based on specific resource tags and paths.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>policy.permission_boundary</strong></td>
     <td><strong>zilliz-permission-boundary-policy</strong></td>
     <td>Allows actions across various AWS services like ACM, AutoScaling, EC2, EKS, ELB, IAM, Logs, Route 53, S3, and SSM.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>policy.zilliz<em>business</em>irsa_policy</strong></td>
     <td><strong>zilliz-business-irsa-policy</strong></td>
     <td>Allows specific S3 actions, such as reading, writing, listing, and deleting objects in buckets prefixed with <strong>zilliz-byoc</strong>, reflecting targeted S3 access for business-related operations.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>role.bootstrap_role</strong></td>
     <td><strong>zilliz-bootstrap-role</strong></td>
     <td>Secures role assumption with specific conditions, including external ID verification, primarily intended for controlled access within the <strong>zilliz-byoc</strong> framework.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>role.management_role</strong></td>
     <td><strong>zilliz-management-role</strong></td>
     <td>Secures role assumption, featuring conditions like external ID verification, and is specifically geared for management tasks within the <strong>zilliz-byoc</strong> framework.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>role<em>policy</em>attachment.bootstrap_attachment</strong><br/></td>
     <td><strong>zilliz-bootstrap-role</strong></td>
     <td>Attaches a specific policy to the role <strong>zilliz-bootstrap-role</strong>, enabling the assignment of predefined permissions to this role.</td>
   </tr>
   <tr>
     <td><strong>aws<em>iam</em>role<em>policy</em>attachment.management_attachment</strong></td>
     <td><strong>zilliz-management-role</strong></td>
     <td>Attaches a specific policy to the role <strong>zilliz-management-role</strong>, facilitating the application of predefined permissions to this role.</td>
   </tr>
</table>

For a comprehensive understanding of AWS policies and permissions, visit [Policies and Permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html).

## Next steps: Activating your BYOC license{#next-steps-activating-your-byoc-license}

Once you have met all the prerequisites outlined above, you are ready to proceed with the steps detailed in [Activate Your License](./activate-your-cloud) to begin your activation process. This will guide you through the specific actions required to activate and utilize your BYOC license on the Zilliz Cloud platform.