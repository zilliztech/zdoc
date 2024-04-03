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

1. __Operating System Compatibility__: Ensure that your machine operates on one of the following systems:

    - Linux

    - macOS

    - Windows

1. __Terraform Installation__: Zilliz Cloud utilizes Terraform for managing the cloud infrastructure required for BYOC deployment. 

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

1. __AWS Account__: Your Zilliz Cloud BYOC deployment will be hosted within your AWS account. If you do not have an AWS account, create one following the [AWS Account Creation Guide](https://docs.aws.amazon.com/organizations/latest/userguide/orgs_manage_accounts_create.html). The Zilliz Cloud BYOC solution currently supports the AWS __us-west-2__ region. For other cloud providers or regions, contact [our sales team](https://zilliz.com/contact-sales).

1. __Zilliz Cloud Account__: Use the account you provided to Zilliz Cloud technical support during the contract signing process.

## Create temporary security credentials{#create-temporary-security-credentials}

To activate your BYOC license using Terraform scripts, you'll need to provide temporary security credentials. These include an access key and a secret key, for AWS cloud resources. It's advisable to create these credentials solely for the activation process and deactivate them afterward.

Here's how to create temporary security credentials:

1. Sign in to the [IAM console](https://console.aws.amazon.com/iam) using your AWS account ID and password.

1. Go to the __Access keys__ section and click __Create access key__.

1. On the __Retrieve access keys__ page, choose either __Show__ to reveal the value of your user's secret access key, or __Download .csv file__. This is your only opportunity to save your secret access key. After you've saved your secret access key in a secure location, choose __Done__.

For detailed instructions, refer to [AWS official documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_access-keys.html#Using_CreateAccessKey).

![create-security-credentials](/byoc/create-security-credentials.png)

## Understand required resources and permissions{#understand-required-resources-and-permissions}

Deploying Zilliz Cloud BYOC requires specific cloud resources and permissions within your AWS account.

### Resource quotas{#resource-quotas}

Refer to the table below for the necessary cloud resources and services for Zilliz Cloud BYOC activation. If the cloud resources in your current account are insufficient, contact your cloud account administrator to increase quotas.

<Admonition type="info" icon="📘" title="Notes">

<p>Cloud administrators can monitor resource usage and quotas in the cloud quota dashboard. For details, refer to <a href="https://docs.aws.amazon.com/general/latest/gr/aws_service_limits.html">AWS service quotas</a>.</p>

</Admonition>

|  __Resource Type__        |  __Instance__<br/>  |  Min. Config<br/>                                                                                              |
| ------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------------------------- |
|  Virtual Machine<br/>  |  EC2<br/>           |  - (m6i.xlarge) * 4<br/> - (m6i.2xlarge) * 4<br/> - (r6id.8xlarge) * 1<br/> __Total__: 80 vCPUs, 448 GiB |
|  Object Storage           |  S3                    |  1.3 TB                                                                                                           |
|  Block Storage            |  EBS                   |  550 GB                                                                                                           |
|  Public IP                |  EIP                   |  1                                                                                                                |
|  Private Network          |  VPC<br/>           |  2                                                                                                                |
|  Network Channel          |  PrivateLink           |  1                                                                                                                |
|  Load Balance             |  AWS LB                |  1                                                                                                                |
|  DNS                      |  DNS Zone              |  2                                                                                                                |

### IAM permissions{#iam-permissions}

Terraform scripts used in activating Zilliz Cloud BYOC require specific AWS policies and permissions.

The table below summarizes the policies and roles Terraform will create for BYOC license activation.

In the table, the __Terraform Resource Identifier__ column lists the internal names used in Terraform scripts, while the __IAM Policy / Role__ column shows the actual names as they will appear in your AWS account.

|  Terraform Resource Identifier                                    |  IAM Policy / Role                     |  __Description__                                                                                                                                                                                                                   |
| ----------------------------------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
|  __aws_iam_policy.aws_lb_irsa_policy__                            |  __zilliz-aws-lb-irsa-policy__         |  Manages various aspects of ELB, including creation, modification, and deletion of load balancers and target groups, as well as associated security and tagging permissions, with specific conditions applied to certain actions.  |
|  __aws_iam_policy.bootstrap_policy__                              |  __zilliz-bootstrap-policy__           |  Grants permissions for managing AWS resources including EKS, EC2, S3, and Route 53, with specific restrictions and conditions.                                                                                                    |
|  __aws_iam_policy.cluster_autoscaler_irsa_policy__                |  __zilliz-ca-irsa-policy__             |  Allows for managing auto-scaling and EC2 instance operations in AWS, specifically for scaling and termination actions.                                                                                                            |
|  __aws_iam_policy.ebs_csi_irsa_policy__                           |  __zilliz-ebs-csi-irsa-policy__        |  Manages EC2 volumes and snapshots, including creation, attachment, detachment, and deletion, with specific conditions for tagging and cluster association.                                                                        |
|  __aws_iam_policy.management_policy__                             |  __zilliz-management-policy__          |  Allows for managing S3 buckets and objects, creating and tagging IAM policies, scaling EKS node groups, and handling various Elastic Load Balancing (ELB) resources, with restrictions based on specific resource tags and paths. |
|  __aws_iam_policy.permission_boundary__                           |  __zilliz-permission-boundary-policy__ |  Allows actions across various AWS services like ACM, AutoScaling, EC2, EKS, ELB, IAM, Logs, Route 53, S3, and SSM.                                                                                                                |
|  __aws_iam_policy.zilliz_business_irsa_policy__                   |  __zilliz-business-irsa-policy__       |  Allows specific S3 actions, such as reading, writing, listing, and deleting objects in buckets prefixed with __zilliz-byoc__, reflecting targeted S3 access for business-related operations.                                      |
|  __aws_iam_role.bootstrap_role__                                  |  __zilliz-bootstrap-role__             |  Secures role assumption with specific conditions, including external ID verification, primarily intended for controlled access within the __zilliz-byoc__ framework.                                                              |
|  __aws_iam_role.management_role__                                 |  __zilliz-management-role__            |  Secures role assumption, featuring conditions like external ID verification, and is specifically geared for management tasks within the __zilliz-byoc__ framework.                                                                |
|  __aws_iam_role_policy_attachment.bootstrap_attachment__<br/>  |  __zilliz-bootstrap-role__             |  Attaches a specific policy to the role __zilliz-bootstrap-role__, enabling the assignment of predefined permissions to this role.                                                                                                 |
|  __aws_iam_role_policy_attachment.management_attachment__         |  __zilliz-management-role__            |  Attaches a specific policy to the role __zilliz-management-role__, facilitating the application of predefined permissions to this role.                                                                                           |

For a comprehensive understanding of AWS policies and permissions, visit [Policies and Permissions in IAM](https://docs.aws.amazon.com/IAM/latest/UserGuide/access_policies.html).

## Next steps: Activating your BYOC license{#next-steps-activating-your-byoc-license}

Once you have met all the prerequisites outlined above, you are ready to proceed with the steps detailed in [Activate Your License](./activate-your-cloud) to begin your activation process. This will guide you through the specific actions required to activate and utilize your BYOC license on the Zilliz Cloud platform.