---
title: "Bootstrap Infrastructure (Terraform) | BYOC"
slug: /bootstrap-infrastructure-terraform
sidebar_label: "Bootstrap Infrastructure (Terraform)"
beta: FALSE
notebook: FALSE
description: "This page demonstrates how to use Terraform to bootstrap the infrastructure for a Zilliz Cloud BYOC project, including creating an S3 bucket, all related roles, and a qualified VPC. | BYOC"
type: origin
token: NrnnwjhY4iiIiWkEvUccplKCnwh
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - aws
  - terraform
  - milvus
  - vector database

---

import Admonition from '@theme/Admonition';


# Bootstrap Infrastructure (Terraform)

This page demonstrates how to use Terraform to bootstrap the infrastructure for a Zilliz Cloud BYOC project, including creating an S3 bucket, all related roles, and a qualified VPC.

<Admonition type="info" icon="📘" title="Notes">

<p>To run the Terraform script, you need to have <a href="https://developer.hashicorp.com/terraform/tutorials/aws-get-started/install-cli">Terraform</a> and <a href="https://docs.aws.amazon.com/cli/latest/userguide/install-cliv2.html">AWS CLI</a> installed on your computer and an AWS account with associated credentials that allow you to create VPCs. </p>

</Admonition>

## Clone the script repository{#clone-the-script-repository}

In this step, you will use the following command to clone and pull the script repository.

```shell
$ git clone https://github.com/zilliztech/paas-deploy.git
```

## Prepare the credentials{#prepare-the-credentials}

In this step, you are going to edit the `terraform.tfvars.json` file located within `client_init` folder.

```shell
$ cd byoc-prepare
$ vi terraform.tfvars.json
```

The file is similar to the following:

```json
{
  "aws_region": "us-west-2",
  "vpc_cidr": "10.0.0.0/16",
  "name": "test-byoc-lcf",
  "ExternalId": "cid-xxxxxxxxxxxxxxxxxxxxxxxxx"
}
```

<table>
   <tr>
     <th><p>Variable</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><code>aws_region</code></p></td>
     <td><p>The cloud region in which you will deploy Zilliz BYOC.</p><p>Currently, you can deploy your BYOC project in <code>us-west-2</code>. If you need to deploy your BYOC project in other cloud regions, please contact us by sending email to support@zilliz.com.</p></td>
   </tr>
   <tr>
     <td><p><code>vpc_cidr</code></p></td>
     <td><p>The CIDR blocks to be allocated within the customer-managed VPC. For example, <strong>10.0.0.0/16</strong>.</p></td>
   </tr>
   <tr>
     <td><p><code>name</code></p></td>
     <td><p>The name of the BYOC project to create. </p><p>Please align the value with the one you have entered in the form below.</p><p><img src="/byoc/VQ3NbcrKDoC6faxIOGRc6RvGn4e.png" alt="VQ3NbcrKDoC6faxIOGRc6RvGn4e" /></p></td>
   </tr>
   <tr>
     <td><p><code>ExternalId</code></p></td>
     <td><p>The <strong>External ID</strong> of the BYOC project to create. You can get this value from Zilliz Cloud console.</p><p><img src="/byoc/USjXbCTLBoMsfDxiMNDc0okbnIe.png" alt="USjXbCTLBoMsfDxiMNDc0okbnIe" /></p></td>
   </tr>
</table>

## Bootstrap infrastructure{#bootstrap-infrastructure}

Once you have prepared the credentials described above, bootstrap the infrastructure for the project as follows:

1. Run `terraform init` to prepare the env.

1. Run `terraform plan` if there are any errors, fix them, and then run the command again.

1. Run `terraform apply` to create the VPC.

    The result might be similar to the following:

    ```bash
    bootstrap_role_arn = "arn:aws:iam::xxxxxxxxxxxx:role/zilliz-byoc-boostrap-role"
    bucket_name = "zilliz-byoc-bucket"
    eks-role-arn = "arn:aws:iam::xxxxxxxxxxxx:role/zilliz-byoc-eks-role"
    external_id = "cid-xxxxxxxxxxxxxxxxxxxxxxxxx"
    security_group_id = "sg-xxxxxxxxxxxxxxxxx"
    storage_role_arn = "arn:aws:iam::xxxxxxxxxxxx:role/zilliz-byoc-storage-role"
    subnet_id = [
      "subnet-xxxxxxxxxxxxxxxxx",
      "subnet-xxxxxxxxxxxxxxxxx",
      "subnet-xxxxxxxxxxxxxxxxx",
    ]
    vpc_id = "vpc-xxxxxxxxxxxxxxxxx"
    ```

1. Collect the following information and fill it in the form on the Zilliz Cloud console.

    <table>
       <tr>
         <th><p>Parameter</p></th>
         <th><p>Value from</p></th>
       </tr>
       <tr>
         <td colspan="2"><p><strong>Storage settings</strong></p></td>
       </tr>
       <tr>
         <td><p>Bucket name</p></td>
         <td><p>Use the value of the <code>bucket_name</code> variable in the command output.</p><p>Zilliz Cloud uses the bucket as data plane storage.</p></td>
       </tr>
       <tr>
         <td><p>IAM role ARN</p></td>
         <td><p>Use the value of the <code>storage_role_arn</code> variable in the command output.</p><p>By assuming the role, Zilliz Cloud can access the above bucket on your behalf.</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>EKS settings</strong></p></td>
       </tr>
       <tr>
         <td><p>IAM role ARN</p></td>
         <td><p>Use the value of the <code>eks_role_arn</code> variable in the command output.</p><p>By assuming the role, Zilliz Cloud can create and manage the EKS cluster on your behalf.</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>Cross-account settings</strong></p></td>
       </tr>
       <tr>
         <td><p>IAM role ARN</p></td>
         <td><p>Use the value of the <code>cross_account_role_arn</code> variable in the command output.</p><p>By assuming the role, Zilliz Cloud can provision the data plane on your behalf.</p></td>
       </tr>
       <tr>
         <td colspan="2"><p><strong>Network settings</strong></p></td>
       </tr>
       <tr>
         <td><p>VPC ID</p></td>
         <td><p>Use the value in the <code>vpc_id</code> in the command output.</p><p>Zilliz Cloud provisions the data plane and clusters of the BYOC project in this VPC.</p></td>
       </tr>
       <tr>
         <td><p>Subnets</p></td>
         <td><p>Use the values of the <code>subnet_id</code> variable in the command output.</p><p>Zilliz Cloud requires a public subnet and three private subnets and deploys the NAT gateway in the public subnet to route the network traffic of the private subnets in each availability zone.</p><p>You need to concatenate the three subnet IDs with commas as in <code>subnet_xxxxxxxxxxxxxxxxx,subnet_xxxxxxxxxxxxxxxxx,subnet_xxxxxxxxxxxxxxxxx</code>.</p></td>
       </tr>
    </table>
