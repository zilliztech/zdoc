---
slug: /activate-your-cloud
beta: FALSE
notebook: FALSE
token: X08WweRsXiz0MPk4DIbcXYaInjc
sidebar_position: 2
---

import Admonition from '@theme/Admonition';


# Activate Your License

The Zilliz Cloud Bring Your Own Cloud (BYOC) solution allows you to create and run a Zilliz Cloud cluster within your own cloud infrastructure. This enhances data security, reduces data breach risks, and improves performance and scalability. This guide will help you through the BYOC license activation process.

## Before you start{#before-you-start}

Ensure you have an AWS account and Zilliz Cloud account, allocate necessary cloud resources, and understand the required authorizations. Refer to the [Activation Prerequisites](./byoc-prerequisites) for details.

## Procedure{#procedure}

### Step 1: Enter BYOC organization to obtain external ID{#step-1-enter-byoc-organization-to-obtain-external-id}

Activating a BYOC license involves authorizing Zilliz Cloud to create necessary resources in your AWS account. This authorization requires an external ID for secure communication and [role assumption](https://docs.aws.amazon.com/STS/latest/APIReference/API_AssumeRole.html) between AWS and Zilliz Cloud. For more information about external IDs, refer to [AWS official documentation](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user_externalid.html).

Obtain the external ID from the Zilliz Cloud console and keep it for [step 2](./activate-your-cloud#step-2-acquire-external-arns).

![activate-your-cloud-1](/byoc/activate-your-cloud-1.png)

### Step 2: Acquire external ARNs{#step-2-acquire-external-arns}

[Amazon Resource Names (ARNs)](https://docs.aws.amazon.com/IAM/latest/UserGuide/reference-arns.html) play a crucial role in linking your AWS resources to the Zilliz Cloud BYOC license. They uniquely identify AWS resources and enable secure access and management by Zilliz Cloud during activation.

To acquire your external ARNs:

1. Download and decompress the configuration package:

    ```bash
    curl -O https://zilliz-byoc-bucket.s3.us-west-2.amazonaws.com/terraform-aws-iam.tar.gz && tar -zxvf terraform-aws-iam.tar.gz
    cd terraform-aws-iam
    ```

1. Edit `terraform.tfvars.example` with your AWS configuration details and rename it to `terraform.tfvars`. The configuration includes the AWS region, AWS access and secret keys, and the external ID for your BYOC organization in Zilliz Cloud.

    - **aws_region**: The AWS region where you want to deploy Zilliz Cloud services. Currently, the BYOC license supports only AWS **us-west-2 **region.

    - **aws_access_key** and **aws_secret_key**: The credentials required to run your project. Enter the access key and secret key you created in the [Prerequisites](./byoc-prerequisites#create-temporary-security-credentials) topic.

    - **external_id**: The external ID linked to your BYOC organization in Zilliz Cloud. This is the ID you obtained in [step 1](./activate-your-cloud#step-1-enter-byoc-organization-to-obtain-external-id).

1. Initialize the Terraform configuration. This step prepares Terraform to manage AWS resources by downloading necessary tools to the `.terraform/` directory.

    ```bash
    terraform init
    ```

1. Preview resource creation. Terraform lists all IAM policies and roles required for BYOC activation. For details, refer to [IAM permissions](./byoc-prerequisites#iam-permissions).

    ```bash
    terraform plan
    ```

1. Apply the configuration to create resources. This will generate a `terraform.state` file with sensitive information, such as resource passwords, secret keys, etc. It's important to store this file securely.

    ```bash
    terraform apply
    ```

    During the execution process, you will receive a prompt in the CLI asking you to enter **yes** in order to authorize Terraform to carry out the required actions.

1. After Terraform execution, carefully record the ARNs from the command output. These ARNs are important for the [subsequent activation steps](./activate-your-cloud#step-3-activate-cloud-region) in the Zilliz Cloud console.

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

### Step 3: Activate cloud region{#step-3-activate-cloud-region}

With your ARNs in hand, proceed to activate your cloud region in the Zilliz Cloud console.

- **ARN**: Enter the ARNs from [Terraform's output](./activate-your-cloud).

- **Netmask**: Select a subnet mask for BYOC deployment under your preferred VPC. Zilliz will create a new VPC under your AWS account for BYOC deployment. We recommend you select a suitable network segment based on the size of the BYOC cluster and long-term business plans.

- **Active Cloud Region**: Ensure the region matches the [**aws_region**](./activate-your-cloud) in your Terraform configuration.

![activate-your-cloud-3](/byoc/activate-your-cloud-3.png)

### Step 4: Confirm activation{#step-4-confirm-activation}

Allow about 30 minutes for the activation process to complete. You can review the resources created under your AWS account. For a list of necessary resources, refer to [Understand required resources and permissions](./byoc-prerequisites#understand-required-resources-and-permissions).

Once complete, go to the **License** page to confirm that your license details are accurate. Then, proceed to [deploy a Zilliz Cloud cluster](./create-cluster) on your infrastructure.

![view-license-info](/byoc/view-license-info.png)

## Related topics{#related-topics}

- [Create Cluster (Dev)](./create-cluster)

- [Quick Start](./quick-start)

- [Install SDKs](./install-sdks)

- [Example Dataset](./example-dataset)

