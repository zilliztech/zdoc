---
title: "クロスアカウント IAM ロールの作成 | BYOC"
slug: /create-cross-account-role
sidebar_key: create-cross-account-role
sidebar_label: "クロスアカウント IAM ロールの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz Cloud がプロジェクトのデータプレーンをブートストラップできるように、クロスアカウントロールを作成および設定する方法について説明します。このロールにより、Zilliz Cloud はお客様に代わって VPC リソースを管理するための制限付き権限を取得します。| BYOC"
type: origin
token: TQpDw2mkViTQ98k9RbfcxUarneb
sidebar_position: 3
keywords: 
  - zilliz
  - byoc
  - aws
  - クロスアカウント
  - IAM ロール
  - milvus
  - ベクトルデータベース

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# クロスアカウント IAM ロールの作成

このページでは、Zilliz Cloud がプロジェクトのデータプレーンをブートストラップできるように、クロスアカウントロールを作成して構成する方法について説明します。このロールにより、Zilliz Cloud はお客様に代わって VPC リソースを管理するための制限付き権限を取得します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在<strong>一般提供</strong>中です。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当者</a>までお問い合わせください。</p>

</Admonition>

## 手順\{#procedure}

AWS コンソールを使用してブートストラップロールを作成できます。代替方法として、Zilliz Cloud が提供する Terraform スクリプトを使用して、AWS 上の Zilliz Cloud プロジェクト用のインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: クロスアカウント IAM ロールの作成\{#step-1-create-a-cross-account-iam-role}

このステップでは、Zilliz Cloud とお客様の VPC 間の通信用にクロスアカウント IAM ロールを作成します。

<Supademo id="cmb913tte0m0usn1rnm0ft6bp" title=""  />

<Procedures>

1. Zilliz Cloud コンソールで、セットアップガイドに表示されている**外部 ID**をコピーします。

1. 管理者権限を持つユーザーとして**AWS コンソール**にログインし、**IAM**ダッシュボードへ移動します。

1. 左側のサイドバーで**ロール**タブをクリックし、次に**ロールの作成**をクリックします。

1. **信頼できるエンティティの選択**で、**AWS アカウント**タイルをクリックします。

1. **AWS アカウント**で、**別の AWS アカウント**チェックボックスをオンにします。

1. **アカウント ID**に、Zilliz Cloud のアカウント ID `965570967084` を入力します。

    これは、Zilliz Cloud コンソールからコピーした外部 ID とは異なります。

1. **外部 ID を必須にする**チェックボックスをオンにします。

1. **外部 ID**に、Zilliz Cloud コンソールからコピーした値を入力します。

1. **次へ**をクリックし、権限の追加をスキップします。

1. **名前を付けて確認し、作成**ステップで、ロールに名前を付け、信頼されたエンティティを確認して、**ロールの作成**をクリックします。

1. ロールが作成されたら、緑色のバーにある**ロールの表示**をクリックしてロールの詳細画面へ移動します。

1. ロールの**ARN**の前方にあるコピーアイコンをクリックします。

1. Zilliz Cloud コンソールに戻り、**EKS 設定**の下の**IAM ロール ARN**にロール ARN を貼り付けます。

</Procedures>

### ステップ 2: 権限の追加\{#step-2-add-permissions}

このステップは AWS コンソール上でのみ実行します。このステップでは、上記で作成したロール用のインラインポリシーを作成します。

<Supademo id="cmb92f3910mpwsn1rtrjo3szx" title=""  />

<Procedures>

1. 作成したロールの詳細ページへ移動します。**権限ポリシー**セクションで、**権限の追加**をクリックし、**インラインポリシーの作成**を選択します。

1. **権限の指定**ページで、**ポリシーエディター**セクション内の**JSON**をクリックしてポリシーエディターを開きます。次に、以下の権限をコピーしてポリシーエディターに貼り付け、`{bucketName}` を [S3 バケットとロールの作成](./create-bucket-and-role) で作成したバケットに置き換えます。

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

1. **Review and create** で、ポリシー名を入力し、権限を確認して、**Create policy** をクリックします。

</Procedures>