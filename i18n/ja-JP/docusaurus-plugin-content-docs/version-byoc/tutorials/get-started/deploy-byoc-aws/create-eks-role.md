---
title: "EKS IAMロールの作成 | BYOC"
slug: /create-eks-role
sidebar_label: "EKS IAMロールの作成"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud が Zilliz Cloud プロジェクト用にEKSクラスターを展開するためのIAMロールの作成および構成方法について説明します。 | BYOC"
type: origin
token: IJBcwPCeGirLRGkVt1Vc580ynff
sidebar_position: 2
keywords:
  - zilliz
  - byoc
  - aws
  - eks cluster
  - IAM role
  - milvus
  - vector database
  - Sparse vs Dense
  - Dense vector
  - Hierarchical Navigable Small Worlds
  - Dense embedding

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# EKS IAMロールの作成

このページでは、Zilliz Cloud が Zilliz Cloud プロジェクト用にEKSクラスターを展開するためのIAMロールの作成および構成方法について説明します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## 手順\{#procedure}

AWSコンソールを使用してEKSロールを作成できます。別の方法として、Zilliz Cloud が提供するTerraformスクリプトを使用して、AWS 上の Zilliz Cloud プロジェクト用インフラストラクチャをブートストラップできます。詳細については、[Terraform プロバイダー](./terraform-provider) を参照してください。

### ステップ1: IAMロールを作成\{#step-1-create-an-iam-role}

このステップでは、Zilliz Cloud がEKSクラスターを代理で管理できるようにAWS上にIAMロールを作成し、ロールのARNをZilliz Cloud コンソールに戻します。

<Supademo id="cmb7llk244s2yppkpeo4oz85z" title=""  />

1. 管理者権限を持つユーザーとしてAWSコンソールにログインし、IAMダッシュボードに移動します。

1. アカウント情報を展開し、AWSアカウントIDの先頭にあるコピーボタンをクリックします。

1. 左側のサイドバーで **ロール** タブをクリックし、次に **ロールを作成** をクリックします。

1. **信頼されたエンティティの選択** で、**カスタム信頼ポリシー** タイルをクリックします。**共通信頼ポリシー** で、以下の信頼JSONを **カスタム信頼ポリシー** セクションのエディタに貼り付け、`{accountId}` を自分の **AWSアカウントID** に置き換えます。

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

1. **次へ** をクリックし、権限の追加をスキップします。

1. **名前、レビュー、作成** ステップで、ロールに名前を付け、信頼されたエンティティを確認し、**ロールを作成** をクリックします。

1. ロールが作成されたら、緑色のバーの **ロールを表示** をクリックしてロールの詳細に移動します。

1. ロールの **ARN** の前にあるコピーアイコンをクリックします。

1. Zilliz Cloud コンソールに戻り、**EKS設定** の **IAMロールARN** にロールARNを貼り付けます。

### ステップ2: 権限を追加\{#step-2-add-permissions}

このステップでは、EKSロールに複数の権限を追加します。ロールの詳細ページで、**権限** タブをクリックします。**権限ポリシー** セクションで、**権限を追加** をクリックします。このステップでは、**ポリシーを添付** を選択し、次に **インラインポリシーを作成** を選択して、異なるソースから複数のポリシーを追加する必要があります。

<Supademo id="cmb7nj2tb4u69ppkptf3is7bo" title=""  />

#### AWS管理ポリシーを添付\{#attach-aws-managed-policies}

以下の表は、添付ポリシーとして追加する権限を示しています。表の **権限** 列の項目をクリックして、必要な権限を表示します。

<table>
   <tr>
     <th><p>権限</p></th>
     <th><p>管理元</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html">AmazonEC2ContainerRegistryReadOnly</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Amazon EC2 Container Registry リポジトリへの読み取り専用アクセスを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html">AmazonEKS_CNI_Policy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Amazon VPC CNIプラグイン (amazon-vpc-cni-k8s) がEKSワーカーノードのIPアドレス構成を変更するために必要な権限を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html">AmazonEKSWorkerNodePolicy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Amazon EKS ワーカーノードがAmazon EKS クラスターに接続できるようにします。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSClusterPolicy.html">AmazonEKSClusterPolicy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Kubernetes がリソースを代理で管理するために必要な権限を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSVPCResourceController.html">AmazonEKSVPCResourceController</a></p></td>
     <td><p>AWS</p></td>
     <td><p>VPCリソースコントローラーがワーカーノードのENIおよびIPを管理できるようにします。</p></td>
   </tr>
</table>

**ポリシーを添付** を選択した後、開いたページの **その他の権限ポリシー** セクションで、上記の各AWS管理ポリシー名を検索ボックスに入力し、その前にあるラジオボックスを選択します。必要なすべてのポリシーを選択したら、**権限を追加** をクリックします。

これらのポリシーが **権限** ポリシー一覧に表示されていることが確認できます。

<Admonition type="info" icon="📘" title="Notes">

<p>EKSクラスターの作成時に、<a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html#iam-term-service-linked-role">サービスリンクロール</a> もクラスターとともに自動的に作成され、それらは <a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSServiceRolePolicy.html">AmazonEKSServiceRolePolicy</a> と <a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSServiceRoleForAmazonEKSNodegroup.html">AWSServiceRoleForAmazonEKSNodegroup</a> です。これら2つのロールは、Amazon EKS が代理で他のAWSサービスを呼び出すために必要です。</p>

</Admonition>

#### インラインポリシーを作成\{#create-inline-policies}

以下の表は、カスタマーインラインポリシーとして追加する必要があるポリシーを示しています。表の **権限** 列の項目をクリックして、必要な権限を表示します。

<table>
   <tr>
     <th><p>権限</p></th>
     <th><p>管理元</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json">AWSロードバランサーコントローラー</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>AWSロードバランサーコントローラーは、Kubernetesクラスター用のElastic Load Balancerを管理するためのコントローラーです。</p><p>AWSロードバランサーコントローラーリポジトリの詳細については、<a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main">README</a> ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json">Amazon EBS CSIドライバー</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>Amazon Elastic Block Store Container Storage Interface (CSI) ドライバーは、コンテナオーケストレーターがAmazon EBSボリュームのライフサイクルを管理するために使用されるCSIインターフェースを提供します。</p><p>Amazon EBS CSIドライバーの詳細については、<a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver">README</a> ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended">クラスターオートスケーラー</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>クラスターオートスケーラーは、すべてのポッドが実行できる場所があり、不要なノードがないようにKubernetesクラスターのサイズを自動的に調整するコンポーネントです。</p><p>AWS上でのクラスターオートスケーラーの詳細については、<a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md">README</a> ファイルを参照してください。</p></td>
   </tr>
</table>

**インラインポリシーを作成** を選択した後、**権限の指定** ページで、**ポリシーエディター** セクションの **JSON** をクリックしてポリシーエディターを開きます。次に、上記の権限のいずれかをコピーし、ポリシーエディターに貼り付けます。

**次へ** をクリックし、**ポリシーの詳細** で **ポリシー名** を設定します。すべてのリストされたインラインポリシーを追加したら、**ポリシーを作成** をクリックします。これらのポリシーが **権限** ポリシー一覧に表示されていることが確認できます。
