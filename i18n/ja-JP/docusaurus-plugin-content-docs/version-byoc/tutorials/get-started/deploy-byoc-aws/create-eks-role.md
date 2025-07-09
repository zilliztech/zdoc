---
title: "EKS IAMロールの作成 | BYOC"
slug: /create-eks-role
sidebar_label: "EKS IAMロールの作成"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz CloudプロジェクトにEKSクラスターをデプロイするために、Zilliz CloudのIAMロールを作成および構成する方法について説明します。 | BYOC"
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
  - Audio search
  - what is semantic search
  - Embedding model
  - image similarity search

---

import Admonition from '@theme/Admonition';


import Supademo from '@site/src/components/Supademo';

# EKS IAMロールの作成

このページでは、Zilliz CloudプロジェクトにEKSクラスターをデプロイするために、Zilliz CloudのIAMロールを作成および構成する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

</Admonition>

## 手続き{#procedure}

AWSコンソールを使用してEKSロールを作成できます。代わりに、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをAWS上でブートストラップすることもできます。詳細については、[テラフォームプロバイダName](./terraform-provider)を参照してください。

### ステップ1: IAMロールを作成する{#step-1-create-an-iam-role}

このステップでは、AWS上でZilliz CloudのIAMロールを作成し、代わりにEKSクラスターを管理し、ロールのARNをZilliz Cloudコンソールに貼り付けます。

<Supademo id="cmb7llk244s2yppkpeo4oz85z" title=""  />

1. 管理者権限を持つユーザーとしてAWSコンソールにログインし、IAMダッシュボードに移動してください。

1. アカウント情報を展開し、AWSアカウントIDの先頭にあるコピーボタンをクリックしてください。

1. 左サイドバーの「ロール」タブをクリックし、「ロールの作成」をクリックしてください。

1. 「信頼できるエンティティを選択」で、「カスタム信頼ポリシー」タイルをクリックしてください。「共通信頼ポリシー」で、以下の信頼JSONを「カスタム信頼ポリシー」セクションのエディタに貼り付け、`{accountId}`を「AWSアカウントID」に置き換えてください。

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

1. 「次へ」をクリックして、権限の追加をスキップしてください。

1. 「名前を付け、確認し、作成する」ステップで、役割に名前を付け、信頼できるエンティティを確認し、「役割を作成する」をクリックしてください。

1. 役割が作成されたら、緑色のバーにある「役割を表示」をクリックして、役割の詳細に移動してください。

1. 役割の**ARN**の前にあるコピーアイコンをクリックしてください。

1. Zilliz Cloudコンソールに戻り、**EKS設定**の**IAMロールARN**に役割ARNを貼り付けてください。

### ステップ2:権限を追加する{#step-2-add-permissions}

このステップでは、EKSロールに複数の権限を追加します。ロールの詳細ページで、「権限」タブをクリックします。「権限ポリシー」セクションで、「権限の追加」をクリックします。このステップでは、「ポリシーの添付」を選択し、「インラインポリシーの作成」を選択して、異なるソースから複数のポリシーを追加する必要があります。

<Supademo id="cmb7nj2tb4u69ppkptf3is7bo" title=""  />

#### AWSが管理するポリシーを添付してください。{#attach-aws-managed-policies}

以下の表には、添付ポリシーとして追加する権限がリストされています。必要な権限を表示するには、表の**権限**列の項目をクリックしてください。

<table>
   <tr>
     <th><p>パーミッション</p></th>
     <th><p>管理する</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html">AmazonEC2ContainerRegistryReadOnly</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Amazon EC 2 Container Registryリポジトリへの読み取り専用アクセスを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html">AmazonEKS_CNI_ポリシー</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Amazon VPC CNIプラグイン（amazon-vpc-cni-k 8 s）に、EKSワーカーノードのIPアドレス設定を変更するために必要な権限を提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html">AmazonEKSWorkerNodePolicy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Amazon EKSワーカーノードがAmazon EKSクラスターに接続できるようにします。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSClusterPolicy.html">AmazonEKSClusterPolicy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>あなたの代わりにリソースを管理するために必要な権限をKubernetesに提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSVPCResourceController.html">AmazonEKSVPCResourceController</a></p></td>
     <td><p>AWS</p></td>
     <td><p>VPCリソースコントローラーがワーカーノードのENIとIPを管理できるようにします。</p></td>
   </tr>
</table>

「ポリシーを添付」を選択したら、開いたページの「その他の権限ポリシー」セクションで、上記にリストされた各AWS管理ポリシーの名前を検索ボックスに入力し、その前にあるラジオボックスを選択してください。必要なすべてのポリシーを選択したら、「権限を追加」をクリックしてください。 

これらのポリシーは、**権限**ポリシーリストにリストされていることがわかります。

<Admonition type="info" icon="📘" title="ノート">

<p>EKSクラスターが作成されると、クラスターと一緒に2つの<a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html#iam-term-service-linked-role">サービス連携ロール</a>が自動的に作成されます。それらは<a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSServiceRolePolicy.html">AmazonEKSServiceRolePolicy</a>と<a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSServiceRoleForAmazonEKSNodegroup.html">AWSServiceRoleForAmazonEKSNodegroup</a>です。これら2つの役割は、Amazon EKSが他のAWSサービスを呼び出すために必要です。</p>

</Admonition>

#### インラインポリシーの作成{#create-inline-policies}

以下の表は、顧客インラインポリシーとして追加する必要があるポリシーを示しています。必要な権限を表示するには、表の**権限**列の項目をクリックしてください。

<table>
   <tr>
     <th><p>パーミッション</p></th>
     <th><p>管理する</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json">AWSロードバランサーコントローラー</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>AWSロードバランサーコントローラーは、KubernetesクラスターのElastic Load Balancerを管理するためのコントローラーです。</p><p>AWSロードバランサーコントローラーリポジトリの詳細については、<a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main">README</a>ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json">Amazon EBS CSIドライバー</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>Amazon Elastic Block Store Container Storage Interface（CSI）ドライバーは、コンテナオーケストレーターがAmazon EBSボリュームのライフサイクルを管理するために使用するCSIインターフェースを提供します。</p><p>Amazon EBS CSIドライバーの詳細については、<a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver">README</a>ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended">クラスタAutoScaler</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>Cluster AutoScalerは、Kubernetes Clusterの体格を自動的に調整するコンポーネントで、すべてのポッドが実行可能になり、不要なノードがなくなるように置く。</p><p>AWS上のCluster AutoScalerの詳細については、<a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md">README</a>ファイルを参照してください。</p></td>
   </tr>
</table>

「インラインポリシーの作成」を選択した後、「権限の指定」ページで、「ポリシーエディター」セクションの「JSON」をクリックしてポリシーエディターを開きます。その後、上記の権限の1つをコピーしてポリシーエディターに貼り付けます。

「次へ」をクリックし、「ポリシーの詳細」に「ポリシー名」を設定してください。すべてのリストされたインラインポリシーを追加したら、「ポリシーの作成」をクリックしてください。これらのポリシーが「権限」ポリシーリストにリストされていることがわかります。

