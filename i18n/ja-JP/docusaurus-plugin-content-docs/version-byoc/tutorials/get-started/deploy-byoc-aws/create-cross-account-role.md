---
title: "クロスアカウントIAMロールの作成 | BYOC"
slug: /create-cross-account-role
sidebar_label: "クロスアカウントIAMロールの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、プロジェクトをブートストラップするためにZilliz Cloudのクロスアカウントロールを作成および設定する方法について説明します。このロールにより、Zilliz Cloudはあなたの代わりにVPCリソースを管理するための制限付き権限を与えられます。 | BYOC"
type: origin
token: ILTuw2RQeiSXWykKoCucyZL5nig
sidebar_position: 3
keywords: 
  - zilliz
  - byoc
  - aws
  - cross-account
  - IAM role
  - milvus
  - vector database
  - vector database open source
  - open source vector db
  - vector database example
  - rag vector database

---

import Admonition from '@theme/Admonition';


# クロスアカウントIAMロールの作成

このページでは、プロジェクトをブートストラップするためにZilliz Cloudのクロスアカウントロールを作成および設定する方法について説明します。このロールにより、Zilliz Cloudはあなたの代わりにVPCリソースを管理するための制限付き権限を与えられます。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>一般提供</strong>中です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## 手続き{#procedure}

AWSコンソールを使用してブートストラップロールを作成できます。代わりに、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをAWS上でブートストラップすることもできます。詳細については、「[Bootstrapインフラストラクチャ（Terraform）](./bootstrap-infrastructure-terraform)」を参照してください。

### ステップ1:クロスアカウントIAMロールを作成する{#step-1-create-a-cross-account-iam-role}

このステップでは、Zilliz CloudとVPC間の通信のためのクロスアカウントIAMロールを作成します。

1. Zilliz Cloudコンソールで、セットアップガイドに表示されている**外部ID**をコピーします。

    ![HlT5b37CKoWnsexqAk4cXYqgnpe](/byoc/ja-JP/HlT5b37CKoWnsexqAk4cXYqgnpe.png)

1. 管理者権限を持つユーザーとして**AWSコンソール**にログインし、**IAM**ダッシュボードに移動します。

1. 左サイドバーの[**役割**]タブをクリックし、[**役割を作成**]をクリックします。

    ![S6eKbYvD5om0jGxUIWDcwdSEnXf](/byoc/ja-JP/S6eKbYvD5om0jGxUIWDcwdSEnXf.png)

1. [**信頼できるエンティティ**の選択]で、**AWSアカウント**タイルをクリックします。

    ![WQOCbEPNeoceCBxg2DVcf9Xln3g](/byoc/ja-JP/WQOCbEPNeoceCBxg2DVcf9Xln3g.png)

1. [**An AWS account**]で、[**Another AWS account**]チェックボックスをオンにします。

1. [**アカウントID**]に、Zilliz CloudアカウントID 9655 7 0 9670 8 4を入力し`ま`す。

    これは、Zilliz Cloudコンソールからコピーした外部IDではありません。

1. [**外部IDが必要]**チェックボックスをオンにします。

1. [**外部ID**]に、Zilliz CloudコンソールからコピーしたIDを入力します。

1. 「**次**へ」をクリックして、アクセス権の追加をスキップします。

1. 「**名前、レビュー、および作成**」ステップで、役割に名前を付け、信頼されたエンティティを確認し、「**役割を作成**」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>ロールに名前を付けるときは、プレフィックス<code>zilliz-byoc</code>を使用します。</p>

    </Admonition>

1. ロールが作成されたら、緑色のバーの[**View role**]をクリックしてロールの詳細に移動します。

    ![IkpJbCkEiomCLJxVekpcpRD4nh5](/byoc/ja-JP/IkpJbCkEiomCLJxVekpcpRD4nh5.png)

1. ロールの**ARN**の前にあるコピーアイコンをクリックします。

    ![LRmfbjfczo3BCAxIgyyc1EIznFc](/byoc/ja-JP/LRmfbjfczo3BCAxIgyyc1EIznFc.png)

1. Zilliz Cloudコンソールに戻り、**IAM Role ARN**の**EKS設定**にARNロールを貼り付けます。

    ![BdPebdKp0oc4nkxeUVgcK3ndn7e](/byoc/ja-JP/BdPebdKp0oc4nkxeUVgcK3ndn7e.png)

### ステップ2:権限を追加する{#step-2-add-permissions}

このステップはAWSコンソール上でのみ行われます。このステップでは、上記で作成したロールのインラインポリシーを作成します。

1. 作成したロールの詳細ページに移動します。[**権限ポリシー**]セクションで、[**権限を追加**]をクリックし、[**インラインポリシーを作成**]を選択します。

    ![UjQBb1Xbxo88qExt4amchip9nmg](/byoc/ja-JP/UjQBb1Xbxo88qExt4amchip9nmg.png)

1. 「**Specify permis**sions」ページで、「**JSON**」をクリックして**ポリシーエディタ**を開きます。その後、以下のパーミッションをコピーしてポリシーエディタに貼り付け、`{bucketName}`を「Create S3 Bucket and Role」で作成したバケットに置き換えます。

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

    ![OT5obistsoSodixuW5ncltJQnKe](/byoc/ja-JP/OT5obistsoSodixuW5ncltJQnKe.png)

1. [**レビューと作成**]で、ポリシー名を入力し、権限を確認して、[**ポリシーを作成**]をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>ポリシーに名前を付けるときは、プレフィックス<code>zilliz-byoc</code>を使用します。</p>

    </Admonition>

    ![LGHebTzMzoHTV1xRxIlcpV7rntc](/byoc/ja-JP/LGHebTzMzoHTV1xRxIlcpV7rntc.png)

    