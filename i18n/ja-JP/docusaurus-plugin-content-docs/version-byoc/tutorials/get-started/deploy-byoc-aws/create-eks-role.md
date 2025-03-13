---
title: "EKS IAMロールの作成 | BYOC"
slug: /create-eks-role
sidebar_label: "EKS IAMロールの作成"
beta: PRIVATE
notebook: FALSE
description: "このページでは、Zilliz CloudプロジェクトにEKSクラスターをデプロイするために、Zilliz CloudのIAMロールを作成および構成する方法について説明します。 | BYOC"
type: origin
token: N2cQwIdMZiCTX1k6bVEcbQTDn2g
sidebar_position: 2
keywords: 
  - zilliz
  - byoc
  - aws
  - eks cluster
  - IAM role
  - milvus
  - vector database
  - managed milvus
  - Serverless vector database
  - milvus open source
  - how does milvus work

---

import Admonition from '@theme/Admonition';


# EKS IAMロールの作成

このページでは、Zilliz CloudプロジェクトにEKSクラスターをデプロイするために、Zilliz CloudのIAMロールを作成および構成する方法について説明します。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>一般提供</strong>中です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## 手続き{#procedure}

AWSコンソールを使用してEKSロールを作成できます。代わりに、Zilliz Cloudが提供するTerraformスクリプトを使用して、Zilliz CloudプロジェクトのインフラストラクチャをAWS上でブートストラップすることもできます。詳細については、[Bootstrapインフラストラクチャ（Terraform）](./bootstrap-infrastructure-terraform)を参照してください。

### ステップ1: IAMロールを作成する{#step-1-create-an-iam-role}

このステップでは、AWS上でZilliz CloudのIAMロールを作成し、代わりにEKSクラスターを管理し、ロールのARNをZilliz Cloudコンソールに貼り付けます。

<Admonition type="info" icon="📘" title="ノート">

<p>EKSクラスターを作成すると、クラスターとともに2つの<a href="https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html#iam-term-service-linked-role">サービスリンクロール</a>が自動的に作成され、<a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSServiceRolePolicy.html">AmazonEKSServiceRolePolicy</a>と<a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AWSServiceRoleForAmazonEKSNodegroup.html">AWSServiceRoleForAmazonEKSNodegroup</a>です。これら2つのロールは、Amazon EKSがあなたの代わりに他のAWSサービスを呼び出すために必要です。</p>

</Admonition>

1. 管理者権限を持つユーザーとしてAWSコンソールにログインし、IAMダッシュボードに移動してください。

1. アカウント情報を展開し、AWSアカウントIDの先頭にあるコピーボタンをクリックしてください。

    ![EMi6b2DQJonwOZx8yksclm2hntc](/byoc/ja-JP/EMi6b2DQJonwOZx8yksclm2hntc.png)

1. 左サイドバーの[**役割**]タブをクリックし、[**役割を作成**]をクリックします。

    ![IESTbOXD4o9lfJx34fCcUkF9nSd](/byoc/ja-JP/IESTbOXD4o9lfJx34fCcUkF9nSd.png)

1. [**信頼できるエンティティ**の選択]で、[**カスタム信頼ポリシー**]タイルをクリックします。[**共通信頼ポリシー**]で、下の信頼JSONを[**カスタム信頼ポリシー**]セクションのエディタに貼り付け、`{account tId}`を**AWSアカウントID**に置き換えます。

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

    ![IJh1b5jTSos08MxhMMKcXcKAnRg](/byoc/ja-JP/IJh1b5jTSos08MxhMMKcXcKAnRg.png)

1. 「**次**へ」をクリックして、アクセス権の追加をスキップします。

1. 「**名前、レビュー、および作成**」ステップで、役割に名前を付け、信頼されたエンティティを確認し、「**役割を作成**」をクリックします。

    <Admonition type="info" icon="📘" title="ノート">

    <p>ロールに名前を付けるときは、プレフィックス<code>zilliz-byoc</code>を使用します。</p>

    </Admonition>

1. ロールが作成されたら、緑色のバーの[**View role**]をクリックしてロールの詳細に移動します。

    ![RsJhbMJnMogl3AxcBc7cVamNngc](/byoc/ja-JP/RsJhbMJnMogl3AxcBc7cVamNngc.png)

1. ロールの**ARN**の前にあるコピーアイコンをクリックします。

    ![L7rSbBI7donnqSxNZ03cjoEEn9f](/byoc/ja-JP/L7rSbBI7donnqSxNZ03cjoEEn9f.png)

1. Zilliz Cloudコンソールに戻り、**IAM Role ARN**の**EKS設定**にARNロールを貼り付けます。

    ![HoLTbTV52ogMGsxl0WfcFEHmnSc](/byoc/ja-JP/HoLTbTV52ogMGsxl0WfcFEHmnSc.png)

### ステップ2:権限を追加する{#step-2-add-permissions}

このステップでは、EKSロールに複数の権限を追加します。ロールの詳細ページで、「**権限**」タブをクリックします。「**権限ポリシー**」セクションで、「**権限追加**」をクリックします。このステップでは、「**ポリシー添付**」を選択し、「**インラインポリシー作成**」を選択して、異なるソースから複数のポリシーを追加する必要があります。

![PypqbYKgeolL9FxEVsxcDnPJnBf](/byoc/ja-JP/PypqbYKgeolL9FxEVsxcDnPJnBf.png)

#### AWSが管理するポリシーを添付{#attach-aws-managed-policies}

次の表に、添付ポリシーとして追加する権限を示します。表の[**権限**]列の項目をクリックして、必要な権限を表示します。

<table>
   <tr>
     <th><p>アクセス許可</p></th>
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

「**ポリシーを添付**」を選択した後、開いたページの「**その他の権限ポリシー**」セクションで、上記にリストされた各AWS管理ポリシーの名前を検索ボックスに入力し、その前にあるラジオボックスを選択してください。必要なすべてのポリシーを選択したら、「**権限を追加**」をクリックしてください。

![MK1AblIjSo5hxaxtfMDcN55AnJc](/byoc/ja-JP/MK1AblIjSo5hxaxtfMDcN55AnJc.png)

これらのポリシーは、[**アクセス許可**ポリシー]リストに表示されます。

![T29CbqmABoF5AmxYZ4xcY1RJn9e](/byoc/ja-JP/T29CbqmABoF5AmxYZ4xcY1RJn9e.png)

#### インラインポリシーの作成{#create-inline-policies}

次の表に、顧客のインラインポリシーとして追加する必要があるポリシーを示します。テーブルの[**権限**]列の項目をクリックして、必要な権限を表示します。

<table>
   <tr>
     <th><p>アクセス許可</p></th>
     <th><p>管理する</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json">AWS Load Balancer Controller</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>AWSロードバランサーコントローラーは、KubernetesクラスターのElastic Load Balancerを管理するためのコントローラーです。 AWSロードバランサーコントローラーリポジトリの詳細については、<a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main">README</a>ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json">Amazon EBS CSI driver</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>Amazon Elastic Block Store Container Storage Interface（CSI）ドライバーは、コンテナオーケストレーターがAmazon EBSボリュームのライフサイクルを管理するために使用するCSIインターフェースを提供します。 Amazon EBS CSIドライバーの詳細については、<a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver">README</a>ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended">Cluster AutoScaler</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>Cluster AutoScalerは、Kubernetes Clusterの体格を自動的に調整するコンポーネントで、すべてのポッドが実行可能になり、不要なノードがなくなるように置く。 AWS上のCluster AutoScalerの詳細については、<a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md">README</a>ファイルを参照してください。</p></td>
   </tr>
</table>

「**Create inline policy**」を選択した後、「**Specify permis**sions」ページで、「**JSON**」をクリックして**ポリシーエディタ**を開きます。次に、上記の権限のいずれかをコピーしてポリシーエディタに貼り付けます。

![ZmF0bkhWOoWYZMxoZHccP1iMnah](/byoc/ja-JP/ZmF0bkhWOoWYZMxoZHccP1iMnah.png)

[**次**へ]をクリックし、[ポリシーの詳細]で**ポリシー名**を**設定します**。

<Admonition type="info" icon="📘" title="ノート">

<p>次の図に示すように、ポリシーの命名にはプレフィックス<code>zilliz-byoc</code>を使用します。</p>

</Admonition>

![DaaUbPxOPowcAgxZprNceEBMndh](/byoc/ja-JP/DaaUbPxOPowcAgxZprNceEBMndh.png)

リストされたすべてのインラインポリシーを追加したら、[**ポリシーを作成**]をクリックします。これらのポリシーが[**権限**ポリシー]リストに表示されます。

![Q0TkbkN04oqWYIx3777cObDIndd](/byoc/ja-JP/Q0TkbkN04oqWYIx3777cObDIndd.png)

