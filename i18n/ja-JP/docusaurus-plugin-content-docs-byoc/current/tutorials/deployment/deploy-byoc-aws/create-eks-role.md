---
title: "EKS IAM ロールの作成 | BYOC"
slug: /create-eks-role
sidebar_label: "EKS IAM ロールの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud プロジェクト用の EKS クラスターを Zilliz Cloud がデプロイできるようにするための IAM ロールの作成および設定方法について説明します。 | BYOC"
type: origin
token: IJBcwPCeGirLRGkVt1Vc580ynff
sidebar_position: 2
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

import Procedures from '@site/src/components/Procedures';

# EKS IAM ロールの作成

このページでは、Zilliz Cloud プロジェクト用の EKS クラスターを Zilliz Cloud がデプロイできるようにするための IAM ロールの作成および設定方法について説明します。

<Admonition type="info" icon="📘" title="注意">

Zilliz BYOC は現在 **General Availability** で提供されています。アクセスおよび導入の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

## 手順\{#procedure}

AWS コンソールを使用して EKS ロールを作成できます。別の方法として、Zilliz Cloud が提供する Terraform スクリプトを使用して、AWS 上の Zilliz Cloud プロジェクト向けインフラストラクチャをブートストラップすることもできます。詳細については、[Terraform Provider](./terraform-provider) を参照してください。

### ステップ 1: IAM ロールを作成する\{#step-1-create-an-iam-role}

このステップでは、Zilliz Cloud がお客様に代わって EKS クラスターを管理できるようにするため、AWS 上に IAM ロールを作成し、そのロールの ARN を Zilliz Cloud コンソールに貼り付けます。

<Supademo id="cmb7llk244s2yppkpeo4oz85z" title=""  />

<Procedures>

1. 管理者権限を持つユーザーとして AWS Console にログインし、IAM ダッシュボードに移動します。

1. アカウント情報を展開し、AWS Account ID の先頭にあるコピーボタンをクリックします。

1. 左側のサイドバーで **Roles** タブをクリックし、次に **Create Role** をクリックします。

1. **Select trusted entity** で **Custom trust policy** タイルをクリックします。**Common trust policy** で、以下の trust JSON を **Custom trust policy** セクションのエディターに貼り付け、`{accountId}` をお使いの **AWS Account ID** に置き換えます。

    ```json
    {
        "Version" : "2012-10-17",
        "Statement" : [
          {
            "Effect" : "Allow",
            "Principal" : {
              "Service" : "eks-nodegroup.amazonaws.com"
            },
            "Action" : "sts:AssumeRole"
          },
          {
            "Sid" : "EKSClusterAssumeRole",
            "Effect" : "Allow",
            "Principal" : {
              "Service" : "eks.amazonaws.com"
            },
            "Action" : "sts:AssumeRole"
          },
          {
            "Sid" : "EKSNodeAssumeRole",
            "Effect" : "Allow",
            "Principal" : {
              "Service" : "ec2.amazonaws.com"
            },
            "Action" : "sts:AssumeRole"
          },
          {
            "Effect" : "Allow",
            "Principal" : {
              "Federated" : "arn:aws:iam::{accountId}:oidc-provider/eks_oidc_url"
            },
            "Action" : "sts:AssumeRoleWithWebIdentity",
            "Condition" : {
              "StringEquals" : {
                "eks_oidc_url:aud" : "sts.amazonaws.com",
                "eks_oidc_url:sub" : "system:serviceaccount:kube-system:aws-load-balancer-controller"
              }
            }
          },
          {
            "Effect" : "Allow",
            "Principal" : {
              "Federated" : "arn:aws:iam::{accountId}:oidc-provider/eks_oidc_url"
            },
            "Action" : "sts:AssumeRoleWithWebIdentity",
            "Condition" : {
              "StringEquals" : {
                "eks_oidc_url:sub" : "system:serviceaccount:kube-system:ebs-csi-controller-sa",
                "eks_oidc_url:aud" : "sts.amazonaws.com"
              }
            }
          },
          {
            "Effect" : "Allow",
            "Principal" : {
              "Federated" : "arn:aws:iam::{accountId}:oidc-provider/eks_oidc_url"
            },
            "Action" : "sts:AssumeRoleWithWebIdentity",
            "Condition" : {
              "StringEquals" : {
                "eks_oidc_url:sub" : "system:serviceaccount:kube-system:cluster-autoscaler",
                "eks_oidc_url:aud" : "sts.amazonaws.com"
              }
            }
          }
        ]
      }
    ```

1. **Next** をクリックし、権限の追加はスキップします。

1. **Name, review, and create** ステップで、ロール名を指定し、信頼されたエンティティを確認して、**Create role** をクリックします。

1. ロールが作成されたら、緑色のバーにある **View role** をクリックしてロールの詳細画面に移動します。

1. ロールの **ARN** の前にあるコピーアイコンをクリックします。

1. Zilliz Cloud コンソールに戻り、**EKS settings** の **IAM Role ARN** にロール ARN を貼り付けます。

</Procedures>

### ステップ 2: 権限を追加する\{#step-2-add-permissions}

このステップでは、EKS ロールに複数の権限を追加します。ロールの詳細ページで **Permissions** タブをクリックします。**Permissions policies** セクションで **Add permissions** をクリックします。このステップでは、複数のソースから複数のポリシーを追加するために、**Attach policies** と **Create inline policy** を選択する必要があります。

<Supademo id="cmb7nj2tb4u69ppkptf3is7bo" title=""  />

#### AWS 管理ポリシーをアタッチする\{#attach-aws-managed-policies}

次の表は、アタッチされたポリシーとして追加する必要がある権限を示しています。必要な権限を確認するには、表の **Permissions** 列の項目をクリックしてください。

| Permissions | Managed by | Description |
| --- | --- | --- |
| [AmazonEC2ContainerRegistryReadOnly](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html) | AWS | Amazon EC2 Container Registry リポジトリへの読み取り専用アクセスを提供します。 |
| [AmazonEKS_CNI_Policy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html) | AWS | Amazon VPC CNI Plugin (amazon-vpc-cni-k8s) が EKS ワーカーノード上の IP アドレス設定を変更するために必要な権限を提供します。 |
| [AmazonEKSWorkerNodePolicy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html) | AWS | Amazon EKS ワーカーノードが Amazon EKS Clusters に接続できるようにします。 |
| [AmazonEKSClusterPolicy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSClusterPolicy.html) | AWS | Kubernetes がお客様に代わってリソースを管理するために必要な権限を提供します。 |
| [AmazonEKSVPCResourceController](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSVPCResourceController.html) | AWS | VPC Resource Controller がワーカーノードの ENI と IP を管理できるようにします。 |

**Attach policies** を選択した後、開いたページの **Other permissions policies** セクションで、上記に示した各 AWS 管理ポリシーの名前を検索ボックスに入力し、その前のラジオボックスを選択します。必要なポリシーをすべて選択したら、**Add permissions** をクリックします。 

これらのポリシーが **Permissions** policies リストに表示されます。

<Admonition type="info" icon="📘" title="注意">

EKS クラスターの作成時には、クラスターと一緒に 2 つの [service-linked roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html#iam-term-service-linked-role) も自動的に作成されます。それらは [AmazonEKSServiceRolePolicy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSServiceRolePolicy.html) と [AWSServiceRoleForAmazonEKSNodegroup](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSServiceRoleForAmazonEKSNodegroup.html) です。これら 2 つのロールは、Amazon EKS がお客様に代わって他の AWS サービスを呼び出すために必要です。

</Admonition>

#### インラインポリシーを作成する\{#create-inline-policies}

次の表は、カスタマーインラインポリシーとして追加する必要があるポリシーを示しています。必要な権限を確認するには、表の **Permissions** 列の項目をクリックしてください。

| Permissions | Managed by | Description |
| --- | --- | --- |
| [AWS Load Balancer Controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json) | Kubernetes SIGs | AWS Load Balancer Controller は、Kubernetes クラスターの Elastic Load Balancers の管理を支援するコントローラーです。<br/>AWS Load Balancer Controller リポジトリの詳細については、[README](https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main) ファイルを参照してください。 |
| [Amazon EBS CSI driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json) | Kubernetes SIGs | Amazon Elastic Block Store Container Storage Interface (CSI) Driver は、Container Orchestrators が Amazon EBS ボリュームのライフサイクルを管理するために使用する CSI インターフェースを提供します。<br/>Amazon EBS CSI driver の詳細については、[README](https://github.com/kubernetes-sigs/aws-ebs-csi-driver) ファイルを参照してください。 |
| [Cluster AutoScaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended) | Kubernetes SIGs | Cluster AutoScaler は、すべてのポッドが実行場所を持ち、不要なノードが存在しないように、Kubernetes クラスターのサイズを自動的に調整するコンポーネントです。<br/>AWS 上の Cluster AutoScaler の詳細については、[README](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md) ファイルを参照してください。 |

**Create inline policy** を選択した後、**Specify permissions** ページで **Policy editor** セクションの **JSON** をクリックしてポリシーエディターを開きます。次に、上記のいずれかの権限をコピーしてポリシーエディターに貼り付けます。

**Next** をクリックし、**Policy details** で **Policy name** を設定します。一覧にあるインラインポリシーをすべて追加したら、**Create policy** をクリックします。これらのポリシーが **Permissions** policies リストに表示されます。

