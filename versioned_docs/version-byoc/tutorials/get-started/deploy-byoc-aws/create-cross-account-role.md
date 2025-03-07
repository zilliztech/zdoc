---
title: "Create Cross-Account IAM Role | BYOC"
slug: /create-cross-account-role
sidebar_label: "Create Cross-Account IAM Role"
beta: CONTACT SALES
notebook: FALSE
description: "This page describes how to create and configure a cross-account role for Zilliz Cloud to bootstrap your project. This role gives Zilliz Cloud restricted permissions to manage VPC resources on your behalf. | BYOC"
type: origin
token: TQpDw2mkViTQ98k9RbfcxUarneb
sidebar_position: 3
keywords: 
  - zilliz
  - byoc
  - aws
  - cross-account
  - IAM role
  - milvus
  - vector database
  - vector db comparison
  - openai vector db
  - natural language processing database
  - cheap vector database

---

import Admonition from '@theme/Admonition';


# Create Cross-Account IAM Role

This page describes how to create and configure a cross-account role for Zilliz Cloud to bootstrap your project. This role gives Zilliz Cloud restricted permissions to manage VPC resources on your behalf.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Procedure{#procedure}

You can use the AWS console to create the bootstrap role. As an alternative, you can use the Terraform script Zilliz Cloud provides to bootstrap the infrastructure for your Zilliz Cloud project on AWS. For details, refer to [Bootstrap Project Infrastructure (Terraform)](./bootstrap-infrastructure-terraform).

### Step 1: Create a cross-account IAM role{#step-1-create-a-cross-account-iam-role}

In this step, you will create a cross-account IAM role for the communications between Zilliz Cloud and your VPC.

1. On the Zilliz Cloud console, copy **External ID** displayed in the setup guide.

    ![TS1XbezPjoruVGxQmuJckdo1nSc](/byoc/TS1XbezPjoruVGxQmuJckdo1nSc.png)

1. Log into your **AWS Console** as a user with administrator privileges and go to the **IAM** dashboard.

1. Click the **Roles** tab in the left sidebar, and then click **Create Role**.

    ![RKjvblTyRo8oDMxmjiNciRwrnUl](/byoc/RKjvblTyRo8oDMxmjiNciRwrnUl.png)

1. In **Select trusted entity**, click the **AWS account** tile.

    ![SxSkbijRMoSNeGxYDsnchgDOnQb](/byoc/SxSkbijRMoSNeGxYDsnchgDOnQb.png)

1. In **An AWS account**, select the **Another AWS account** checkbox.

1. In **Account ID**, enter the Zilliz Cloud account ID `965570967084`. 

    This is not the external ID you copied from the Zilliz Cloud console.

1. Select the **Require external ID** checkbox.

1. In **External ID**, enter the one you have copied from the Zilliz Cloud console.

1. Click **Next** and skip adding permissions.

1. In the **Name, review, and create** step, name the role, review the trusted entities, and click **Create role**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>When naming the role, use the prefix <code>zilliz-byoc</code>.</p>

    </Admonition>

1. Once the role has been created, click **View role** in the green bar to go to the role details. 

    ![DhbcbR2Lfocoopxjn5lcUixQn4e](/byoc/DhbcbR2Lfocoopxjn5lcUixQn4e.png)

1. Click the copy icon in front of the role's **ARN**.

    ![JMNYbgkEIol9LnxzYM8cgScZnWd](/byoc/JMNYbgkEIol9LnxzYM8cgScZnWd.png)

1. Go back to the Zilliz Cloud console, paste the role ARN in **IAM Role ARN** under **EKS settings**.

    ![Hgy9bfuYRo0KlTxUnUmcApyynWf](/byoc/Hgy9bfuYRo0KlTxUnUmcApyynWf.png)

### Step 2: Add permissions{#step-2-add-permissions}

This step is solely on the AWS console. In this step, you will create an inline policy for the role created above.

1. Go to the details page of the created role. In the **Permissions policies** section, click **Add permissions**, and choose **Create inline policy**.

    ![NJaZbbcAhopglpxSBThcill3n3c](/byoc/NJaZbbcAhopglpxSBThcill3n3c.png)

1. On the **Specify permissions** page, click **JSON** in the **Policy editor** section to open the policy editor. Then copy the permissions from below and paste it into the policy editor, replacing `{bucketName}` with the bucket you have created in [Create S3 Bucket and Role](./create-bucket-and-role).

    ```json
    {
        "Version" : "2012-10-17",
        "Statement" : [
         {
            "Sid" : "CreateOpenIDConnectProvider",
            "Effect" : "Allow",
            "Action" : [
              "iam:CreateOpenIDConnectProvider",
              "iam:TagOpenIDConnectProvider"
            ],
            "Resource" : [
              "arn:aws:iam::*:oidc-provider/*"
            ],
            "Condition" : {
              "StringEquals" : {
                "aws:RequestTag/Vendor" : "zilliz-byoc"
              }
            }
          },
          {
            "Sid" : "DeleteOpenIDConnectProvider",
            "Effect" : "Allow",
            "Action" : [
              "iam:GetOpenIDConnectProvider",
              "iam:DeleteOpenIDConnectProvider"
            ],
            "Resource" : [
              "arn:aws:iam::*:oidc-provider/*"
            ]
          },
          {
            "Sid" : "IAMReadEKSRole",
            "Effect" : "Allow",
            "Action" : [
              "iam:GetRole",
              "iam:ListAttachedRolePolicies"
            ],
            "Resource" : [
              "arn:aws:iam::*:role/zilliz-byoc*",
              "arn:aws:iam::*:role/aws-service-role/eks-nodegroup.amazonaws.com/AWSServiceRoleForAmazonEKSNodegroup"
            ]
          },
          {
            "Sid" : "IAMPassRoleToEKS",
            "Effect" : "Allow",
            "Action" : [
              "iam:PassRole"
            ],
            "Resource" : [
              "arn:*:iam::*:role/zilliz-byoc*"
            ],
            "Condition" : {
              "StringEquals" : {
                "iam:PassedToService" : "eks.amazonaws.com"
              }
            }
          },
          {
            "Sid" : "IAMUpdateTrustPolicyForEKSRole",
            "Effect" : "Allow",
            "Action" : [
              "iam:UpdateAssumeRolePolicy"
            ],
            "Resource" : [
              "arn:*:iam::*:role/zilliz-byoc*"
            ]
          },
          {
            "Sid" : "EC2Create",
            "Effect" : "Allow",
            "Action" : [
              "ec2:CreateLaunchTemplate",
              "ec2:RunInstances"
            ],
            "Resource" : [
              "arn:aws:ec2:*:*:launch-template/*",
              "arn:aws:ec2:*:*:volume/*",
              "arn:aws:ec2:*:*:instance/*",
              "arn:aws:ec2:*:*:network-interface/*"
            ],
            "Condition" : {
              "StringEquals" : {
                "aws:RequestTag/Vendor" : "zilliz-byoc"
              }
            }
          },
          {
            "Sid" : "EC2Update",
            "Effect" : "Allow",
            "Action" : [
              "ec2:DeleteLaunchTemplate",
              "ec2:CreateLaunchTemplateVersion",
              "ec2:RunInstances"
            ],
            "Resource" : [
              "arn:aws:ec2:*:*:launch-template/*",
              "arn:aws:ec2:*:*:image/*",
              "arn:aws:ec2:*:*:security-group/*",
              "arn:aws:ec2:*:*:subnet/*"
            ],
            "Condition" : {
              "StringEquals" : {
                "aws:ResourceTag/Vendor" : "zilliz-byoc"
              }
            }
          },
          {
            "Sid" : "EC2RunInstanceOnImage",
            "Effect" : "Allow",
            "Action" : [
              "ec2:RunInstances"
            ],
            "Resource" : [
              "arn:aws:ec2:*:*:image/*"
            ]
          },
          {
            "Sid" : "EC2Tag",
            "Effect" : "Allow",
            "Action" : [
              "ec2:CreateTags"
            ],
            "Resource" : [
              "arn:aws:ec2:*:*:launch-template/*",
              "arn:aws:ec2:*:*:volume/*",
              "arn:aws:ec2:*:*:instance/*",
              "arn:aws:ec2:*:*:image/*",
              "arn:aws:ec2:*:*:network-interface/*",
              "arn:aws:ec2:*:*:security-group/*",
              "arn:aws:ec2:*:*:subnet/*"
            ],
            "Condition" : {
              "StringEquals" : {
                "aws:ResourceTag/Vendor" : "zilliz-byoc"
              }
            }
          },
          {
            "Sid" : "EC2TagWithRequestTag",
            "Effect" : "Allow",
            "Action" : [
              "ec2:CreateTags"
            ],
            "Resource" : [
              "arn:aws:ec2:*:*:launch-template/*",
              "arn:aws:ec2:*:*:volume/*",
              "arn:aws:ec2:*:*:instance/*",
              "arn:aws:ec2:*:*:image/*",
              "arn:aws:ec2:*:*:network-interface/*",
              "arn:aws:ec2:*:*:security-group/*",
              "arn:aws:ec2:*:*:subnet/*"
            ],
            "Condition" : {
              "StringEquals" : {
                "aws:RequestTag/Vendor" : "zilliz-byoc"
              }
            }
          },
          {
            "Sid" : "EC2Read",
            "Effect" : "Allow",
            "Action" : [
              "ec2:DescribeAccountAttributes",
              "ec2:DescribeInstanceTypes",
              "ec2:DescribeLaunchTemplateVersions",
              "ec2:DescribeLaunchTemplates",
              "ec2:DescribeSubnets",
              "ec2:DescribeVpcs"
            ],
            "Resource" : [
              "*"
            ]
          },
          {
            "Sid" : "EKSCreate",
            "Effect" : "Allow",
            "Action" : [
              "eks:CreateCluster",
              "eks:CreateNodegroup",
              "eks:CreateAddon",
              "eks:CreateAccessEntry",
              "eks:CreatePodIdentityAssociation"
            ],
            "Resource" : [
              "arn:aws:eks:*:*:cluster/zilliz-byoc-*",
              "arn:aws:eks:*:*:addon/zilliz-byoc-*/*/*",
              "arn:aws:eks:*:*:nodegroup/zilliz-byoc-*/zilliz*/*",
              "arn:aws:eks:*:*:podidentityassociation/zilliz-byoc-*/*",
              "arn:aws:eks::aws:access-entry/zilliz-byoc-*/*/*/*/*",
              "arn:aws:eks::aws:access-policy/zilliz-byoc-*/*"
            ],
            "Condition" : {
              "StringEquals" : {
                "aws:RequestTag/Vendor" : "zilliz-byoc"
              }
            }
          },
          {
            "Sid" : "EKSUpdate",
            "Effect" : "Allow",
            "Action" : [
              "eks:AssociateAccessPolicy",
              "eks:UpdateAccessEntry",
              "eks:UpdateAddon",
              "eks:UpdateClusterConfig",
              "eks:UpdateClusterVersion",
              "eks:UpdateNodegroupConfig",
              "eks:UpdateNodegroupVersion",
              "eks:UpdatePodIdentityAssociation"
            ],
            "Resource" : [
              "arn:aws:eks:*:*:cluster/zilliz-byoc-*",
              "arn:aws:eks:*:*:addon/zilliz-byoc-*/*/*",
              "arn:aws:eks:*:*:nodegroup/zilliz-byoc-*/zilliz*/*",
              "arn:aws:eks:*:*:podidentityassociation/zilliz-byoc-*/*",
              "arn:aws:eks::aws:access-entry/zilliz-byoc-*/*/*/*/*",
              "arn:aws:eks::aws:access-policy/zilliz-byoc-*/*"
            ],
            "Condition" : {
              "StringEquals" : {
                "aws:ResourceTag/Vendor" : "zilliz-byoc"
              }
            }
          },
          {
            "Sid" : "EKSTag",
            "Effect" : "Allow",
            "Action" : [
              "eks:TagResource"
            ],
            "Resource" : [
              "arn:aws:eks:*:*:cluster/zilliz-byoc-*",
              "arn:aws:eks:*:*:addon/zilliz-byoc-*/*/*",
              "arn:aws:eks:*:*:nodegroup/zilliz-byoc-*/zilliz*/*",
              "arn:aws:eks:*:*:podidentityassociation/zilliz-byoc-*/*",
              "arn:aws:eks::aws:access-entry/zilliz-byoc-*/*/*/*/*"
            ]
          },
          {
            "Sid" : "EKSRead",
            "Effect" : "Allow",
            "Action" : [
              "eks:DescribeCluster",
              "eks:DescribeNodegroup",
              "eks:DescribeAccessEntry",
              "eks:DescribeAddon",
              "eks:DescribeAddonConfiguration",
              "eks:DescribeAddonVersions",
              "eks:DescribePodIdentityAssociation",
              "eks:DescribeUpdate",
              "eks:ListAccessEntries",
              "eks:ListAccessPolicies",
              "eks:ListAddons",
              "eks:ListNodegroups",
              "eks:ListUpdates",
              "eks:ListPodIdentityAssociations",
              "eks:ListTagsForResource"
            ],
            "Resource" : [
              "arn:aws:eks:*:*:cluster/zilliz-byoc-*",
              "arn:aws:eks:*:*:addon/zilliz-byoc-*/*/*",
              "arn:aws:eks:*:*:nodegroup/zilliz-byoc-*/zilliz*/*",
              "arn:aws:eks:*:*:podidentityassociation/zilliz-byoc-*/*",
              "arn:aws:eks::aws:access-entry/zilliz-byoc-*/*/*/*/*",
              "arn:aws:eks::aws:access-policy/zilliz-byoc-*/*"
            ]
          },
          {
            "Sid" : "EkSDelete",
            "Effect" : "Allow",
            "Resource" : [
              "arn:aws:eks:*:*:cluster/zilliz-byoc-*",
              "arn:aws:eks:*:*:addon/zilliz-byoc-*/*/*",
              "arn:aws:eks:*:*:nodegroup/zilliz-byoc-*/zilliz*/*",
              "arn:aws:eks:*:*:podidentityassociation/zilliz-byoc-*/*",
              "arn:aws:eks::aws:access-entry/zilliz-byoc-*/*/*/*/*",
              "arn:aws:eks::aws:access-policy/zilliz-byoc-*/*"
            ],
            "Action" : [
              "eks:DeleteAccessEntry",
              "eks:DeleteAddon",
              "eks:DeleteCluster",
              "eks:DeleteFargateProfile",
              "eks:DeleteNodegroup",
              "eks:DeletePodIdentityAssociation"
            ]
          },
          {
            "Sid" : "S3CheckBucketLocation",
            "Effect" : "Allow",
            "Action" : [
              "s3:GetBucketLocation"
            ],
            "Resource" : "arn:aws:s3:::{bucketName}"
          }
        ]
      }
    ```

    ![KD0ZbpltAoLfnxx8mGZcrsPPngg](/byoc/KD0ZbpltAoLfnxx8mGZcrsPPngg.png)

1. In **Review and create**, enter a policy name, review the permissions, and click **Create policy**.

    <Admonition type="info" icon="📘" title="Notes">

    <p>When naming the policy, use the prefix <code>zilliz-byoc</code>.</p>

    </Admonition>

    ![WcFVbDMPLod1fbxPcytcaliTnXS](/byoc/WcFVbDMPLod1fbxPcytcaliTnXS.png)

    