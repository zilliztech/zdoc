---
title: "クロスアカウントIAMロールの作成 | BYOC"
slug: /create-cross-account-role
sidebar_label: "クロスアカウントIAMロールの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud がプロジェクトデータプレーンをブートストラップするためのクロスアカウントロールの作成および構成方法について説明します。このロールは、Zilliz Cloud にVPCリソースを代理で管理するための制限付き権限を与えます。 | BYOC"
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
  - what is milvus
  - milvus database
  - milvus lite
  - milvus benchmark

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# クロスアカウントIAMロールの作成

このページでは、Zilliz Cloud がプロジェクトデータプレーンをブートストラップするためのクロスアカウントロールの作成および構成方法について説明します。このロールは、Zilliz Cloud にVPCリソースを代理で管理するための制限付き権限を与えます。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## 手順\{#procedure}

AWSコンソールを使用してブートストラップロールを作成できます。別の方法として、Zilliz Cloud が提供するTerraformスクリプトを使用して、AWS 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップできます。詳細については、[Terraform プロバイダー](./terraform-provider) を参照してください。

### ステップ1: クロスアカウントIAMロールを作成\{#step-1-create-a-cross-account-iam-role}

このステップでは、Zilliz Cloud とVPC間の通信のためのクロスアカウントIAMロールを作成します。

<Supademo id="cmb913tte0m0usn1rnm0ft6bp" title=""  />

1. Zilliz Cloud コンソールで、セットアップガイドに表示されている **外部ID** をコピーします。

1. 管理者権限を持つユーザーとして **AWSコンソール** にログインし、**IAM** ダッシュボードに移動します。

1. 左側のサイドバーで **ロール** タブをクリックし、次に **ロールを作成** をクリックします。

1. **信頼されたエンティティの選択** で、**AWSアカウント** タイルをクリックします。

1. **AWSアカウント** で、**別のAWSアカウント** チェックボックスを選択します。

1. **アカウントID** に Zilliz Cloud アカウントID `965570967084` を入力します。

    これは Zilliz Cloud コンソールからコピーした外部IDではありません。

1. **外部IDが必要** チェックボックスを選択します。

1. **外部ID** に Zilliz Cloud コンソールからコピーしたIDを入力します。

1. **次へ** をクリックし、権限の追加をスキップします。

1. **名前、レビュー、作成** ステップで、ロールに名前を付け、信頼されたエンティティを確認し、**ロールを作成** をクリックします。

1. ロールが作成されたら、緑色のバーの **ロールを表示** をクリックしてロールの詳細に移動します。

1. ロールの **ARN** の前にあるコピーアイコンをクリックします。

1. Zilliz Cloud コンソールに戻り、**EKS設定** の **IAMロールARN** にロールARNを貼り付けます。

### ステップ2: 権限を追加\{#step-2-add-permissions}

このステップは完全にAWSコンソール上での作業です。このステップでは、上記で作成したロールのインラインポリシーを作成します。

<Supademo id="cmb92f3910mpwsn1rtrjo3szx" title=""  />

1. 作成したロールの詳細ページに移動します。**権限ポリシー** セクションで、**権限を追加** をクリックし、**インラインポリシーを作成** を選択します。

1. **権限の指定** ページで、**ポリシーエディター** セクションの **JSON** をクリックしてポリシーエディターを開きます。次に、以下の権限をコピーし、ポリシーエディターに貼り付け、`{bucketName}` を [S3バケットとロールの作成](./create-bucket-and-role) で作成したバケットに置き換えます。

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

1. **レビューと作成** で、ポリシー名を入力し、権限を確認し、**ポリシーを作成** をクリックします。
