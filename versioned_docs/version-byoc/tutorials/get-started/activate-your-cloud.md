---
slug: /activate-your-cloud
beta: FALSE
notebook: FALSE
token: X08WweRsXiz0MPk4DIbcXYaInjc
sidebar_position: 3
---

import Admonition from '@theme/Admonition';


# Activate Your Cloud

Activating your cloud in Zilliz Cloud is a straightforward process that enables you to leverage the power and flexibility of a Bring Your Own Cloud (BYOC) license. This guide provides you with the necessary steps to initiate your cloud services with Zilliz Cloud and ensure your subscription is up and running smoothly.

## Step 1: Verify subscription and start activation{#step-1-verify-subscription-and-start-activation}

Upon subscribing to a BYOC license of Zilliz Cloud, you will receive a welcome email with vital subscription details, including your license ID, core size, and validity period.

1. **Verify Subscription Details**: First, confirm the accuracy of the details in your welcome email. These details are essential for the activation process.

1. **Start Activation**:

    1. Access the Zilliz Cloud console by clicking the **Activate Cloud Region** button in your welcome email.

    1. Zilliz Cloud automatically establishes a default organization, labeled as **BYOC** in the web console.

    1. To activate your cloud region, ensure you are the [Organization Owner](./a-panorama-view#organization-roles) within this default organization.

![activate-your-cloud-1](/byoc/activate-your-cloud-1.png)

## Step 2: Acquire external ARNs{#step-2-acquire-external-arns}

Obtaining [Amazon Resource Names (ARNs)](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html) is a crucial step in the activation process.

To get your external ARNs:

1. [Install Terraform](https://developer.hashicorp.com/terraform/install?product_intent=terraform), a tool designed for managing your infrastructure efficiently.

1. Clone the following repo to your environment:

    ```bash
    git clone https://github.com/xxxxxxxx.git
    cd xxxxxxxx
    ```

1. Edit `terraform.tfvars.example` with your details and rename it to `terraform.tfvars`. The configuration includes the AWS region, AWS access and secret keys, and the external ID for your BYOC organization in Zilliz Cloud.

    - `aws_region`: The AWS region where you want to deploy Zilliz Cloud services. Currently, the BYOC license supports only AWS **us-west-2 **region.

    - `aws_access_key` and `aws_secret_key`: The credentials required to run your project. If needed, you can also adapt the setup to utilize any authentication method compatible with Terraform for AWS. For more information, see [Authentication and Configuration](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration).

    - `external_id`: The external ID linked to your BYOC organization in Zilliz Cloud. Zilliz Cloud will use this ID for secure communication with AWS, specifically for [assuming roles](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) in Identity and Access Management (IAM) that are set up by this project. You can locate the external ID in the Zilliz Cloud console:

        ![activate-your-cloud-2](/byoc/activate-your-cloud-2.png)

1. Initialize the Terraform configuration. Terraform will download the AWS Provider to the `.terraform/` directory. 

    ```bash
    terraform init
    ```

1. Preview the resources to be created.

    ```bash
    terraform plan
    ```

1. Apply the configuration to create resources.

    ```bash
    terraform apply
    ```

    In this step, Terraform generates the `terraform.state` file. This file contains sensitive information, such as resource passwords, secret keys, etc. It's important to store this file securely. To help with this, the file is automatically excluded from your project's version control by a`.gitignore`file.

1. After Terraform execution, carefully note down the ARNs in the command output. These ARNs are important for the [next step](./activate-your-cloud#step-3-activate-cloud-region) in the process.

    Example output:

    ```bash
    aws_lb_irsa_policy_arn = "arn:aws:iam::YOUR_ACCOUNT_ID:policy/zilliz/zilliz-aws-lb-irsa-policy"
    bootstrap_role_arn = "arn:aws:iam::YOUR_ACCOUNT_ID:role/zilliz/zilliz-bootstrap-role"
    cluster_autoscaler_irsa_policy_arn = "arn:aws:iam::YOUR_ACCOUNT_ID:policy/zilliz/zilliz-ca-irsa-policy"
    ebs_csi_irsa_policy_arn = "arn:aws:iam::YOUR_ACCOUNT_ID:policy/zilliz/zilliz-ebs-csi-irsa-policy"
    management_role_arn = "arn:aws:iam::YOUR_ACCOUNT_ID:role/zilliz/zilliz-management-role"
    permission_boundary_policy_arn = "arn:aws:iam::YOUR_ACCOUNT_ID:policy/zilliz/zilliz-permission-boundary-policy"
    zilliz_business_irsa_policy_arn = "arn:aws:iam::YOUR_ACCOUNT_ID:policy/zilliz/zilliz-business-irsa-policy"
    ```

## Step 3: Activate cloud region{#step-3-activate-cloud-region}

With your ARN ready, follow the Zilliz Cloud console's prompts to activate your cloud region.

![activate-your-cloud-3](/byoc/activate-your-cloud-3.png)

## Step 4: Confirm activation{#step-4-confirm-activation}

Once all the necessary details are entered and the configuration is set, you can confirm and finalize the activation. Then, your cloud region will be active, and you can start deploying Zilliz Cloud clusters on your cloud.

## Reference: IAM resources and policies{#reference-iam-resources-and-policies}

The BYOC solution incorporates Terraform for setting up IAM resources in your AWS account, including roles, permission boundaries, and policies. These components ensure secure and limited access to AWS actions and resources, preventing privilege escalation and providing transparent policy creation and attachment.

### IAM roles and policies{#iam-roles-and-policies}

|  **IAM Role**                  |  **Role Permission Boundary**             |  **IAM Policy**                             |
| ------------------------------ | ----------------------------------------- | ------------------------------------------- |
|  zilliz/zilliz-bootstrap-role  |  zilliz/zilliz-permission-boundary-policy |  zilliz/zilliz-bootstrap-policy             |
|  zilliz/zilliz-management-role |  zilliz/zilliz-permission-boundary-policy |  zilliz/zilliz-management-policy<br/> <br/>   |

- **Role Permission Boundary**: This defines the extent of AWS actions and resources that Zilliz Cloud can access and manage in your AWS account, safeguarding against excessive privileges.

- **Management Role and Policy**: These are utilized for regular management tasks of the BYOC in your AWS account, limiting operations to resources tagged **zilliz-byoc** or resources for proprietary patterns in Zilliz Cloud.

- **Bootstrap Role and Policy**: These are employed for initial setup, teardown, and urgent operations. After successful cloud activation, these can be safely removed. These roles work exclusively with resources or requests tagged **zilliz-byoc** and cannot create or modify new IAM policies.

### IAM roles for service accounts (IRSA){#iam-roles-for-service-accounts-irsa}

|  **IAM Policy for IRSA**                       |  Description                                                                                                                                 |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
|  zilliz/zilliz-business-irsa-policy<br/> <br/>   |  For Zilliz Cloud service accounts within your BYOC EKS. Attachable to specific namespaces and service accounts.                             |
|  zilliz/zilliz-aws-lb-irsa-policy              |  For AWS load balancers. [More Info](https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json) |
|  zilliz/zilliz-ebs-csi-irsa-policy             |  For Amazon EBS CSI drivers. [More Info](https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json)     |
|  zilliz/zilliz-ca-irsa-policy<br/> <br/>         |  For cluster autoscalers. [More Info](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md)   |

## Related topics{#related-topics}

- [Quick Start](./quick-start)

- [Install SDKs](./install-sdks)

- [Example Dataset](./example-dataset)

