---
title: "ロール内の権限 | BYOC"
slug: /permissions-in-roles
sidebar_label: "ロール内の権限"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz Cloudがあなたの代わりに操作を実行するために必要なすべてのIAM権限がリストされています。 | BYOC"
type: origin
token: KOdWw9PJbiZSdLkhi1Dc0oHAnRf
sidebar_position: 6
keywords: 
  - zilliz
  - byoc
  - aws
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - open source vector db
  - vector database example
  - rag vector database
  - what is vector db

---

import Admonition from '@theme/Admonition';


# ロール内の権限

このページでは、Zilliz Cloudがあなたの代わりに操作を実行するために必要なすべてのIAM権限がリストされています。

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>一般提供</strong>中です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloudサポート</a>にお問い合わせください。</p>

</Admonition>

## ストレージロールの権限{#storage-role-permissions}

S 3バケットとストレージロールを作成しました。Zilliz Cloudは以下の権限でこのロールを担います。

<table>
   <tr>
     <th><p>AWS IAMのパーミッション</p></th>
     <th><p>AWSリソース</p></th>
     <th><p>目的</p></th>
   </tr>
   <tr>
     <td><p>s3:ListBucket</p></td>
     <td><p>バケット</p></td>
     <td><p>バケットが存在するかどうかを確認します。</p></td>
   </tr>
   <tr>
     <td><p>s3:GetObject</p></td>
     <td><p>Bucketオブジェクト</p></td>
     <td><p>MilvusがS 3バケットからデータを読み取れるようにする</p></td>
   </tr>
   <tr>
     <td><p>s3:PutObject</p></td>
     <td><p>Bucketオブジェクト</p></td>
     <td><p>Milvusがバケットにデータを書き込むことを許可します</p></td>
   </tr>
   <tr>
     <td><p>s3:DeleteObject</p></td>
     <td><p>Bucketオブジェクト</p></td>
     <td><p>Milvusがデータを削除できるようにする</p></td>
   </tr>
</table>

## EKSロールの権限{#eks-role-permissions}

Zilliz CloudでEKSクラスターを管理するために、次の権限を持つEKSロールを作成しました。

### AWSが管理する権限{#aws-managed-permissions}

これらの権限はAWSによって管理され、EKSロールに関連付けることができます。各権限の詳細については、[**権限**]列の項目をクリックして詳細を確認してください。

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

### Kubernetes SIGsからの権限{#permissions-from-kubernetes-sigs}

これらの権限は、[Kubernetes SIGs](https://github.com/kubernetes-sigs)リポジトリのコントリビューターによって管理されています。Zilliz Cloudは、AWS Load Balancer Controller、Amazon EBS CSIドライバー、およびCluster AutoScalerをインストールするための権限を参照しています。

次の表に、特定の権限セットを示します。各権限の詳細については、「**権限**」列の項目をクリックして詳細を確認できます。

<table>
   <tr>
     <th><p>アクセス許可</p></th>
     <th><p>管理する</p></th>
     <th><p>説明する</p></th>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json">AWS Load Balancer Controller</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>AWSロードバランサーコントローラーは、KubernetesクラスターのElastic Load Balancerを管理するためのコントローラーです。</p><p>AWSロードバランサーコントローラーリポジトリの詳細については、<a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main">README</a>ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json">Amazon EBS CSI driver</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>Amazon Elastic Block Store Container Storage Interface（CSI）ドライバーは、コンテナオーケストレーターがAmazon EBSボリュームのライフサイクルを管理するために使用するCSIインターフェースを提供します。</p><p>Amazon EBS CSIドライバーの詳細については、<a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver">README</a>ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended">Cluster AutoScaler</a></p></td>
     <td><p>KubernetesのSIGs</p></td>
     <td><p>Cluster AutoScalerは、Kubernetes Clusterの体格を自動的に調整するコンポーネントで、すべてのポッドが実行可能になり、不要なノードがなくなるように置く。</p><p>AWS上のCluster AutoScalerの詳細については、<a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md">README</a>ファイルを参照してください。</p></td>
   </tr>
</table>

## クロスアカウントのロール権限{#cross-account-role-permissions}

Zilliz CloudがEKSクラスターにBYOCソリューションをデプロイするために、次の権限を持つクロスアカウントロールを作成しました。

<table>
   <tr>
     <th><p>AWS IAMのパーミッション</p></th>
     <th><p>AWSリソース</p></th>
     <th><p>目的</p></th>
   </tr>
   <tr>
     <td><p>iam:GetRole</p></td>
     <td><p>Role</p></td>
     <td><p>EKSを作成する際に、依存する役割を読んでください。</p></td>
   </tr>
   <tr>
     <td><p>iam:ListAttachedRolePolicies</p></td>
     <td><p>Policy</p></td>
     <td><p>依存ロールのポリシーを取得します。</p></td>
   </tr>
   <tr>
     <td><p>iam:PassRole</p></td>
     <td><p>Role</p></td>
     <td><p>EKSにロールの使用を許可します。</p></td>
   </tr>
   <tr>
     <td><p>iam:UpdateAssumeRolePolicy</p></td>
     <td><p>IAM Role</p></td>
     <td><p>EKS OIDCプロバイダーの信頼ポリシーを更新します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateLaunchTemplate</p></td>
     <td><p>Launch Template</p></td>
     <td><p>EKS nodegroupの起動テンプレートを作成します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:RunInstances</p></td>
     <td><p>Instance</p></td>
     <td><p>EKSノードグループのAWSインスタンスを起動します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DeleteLaunchTemplate</p></td>
     <td><p>Launch Template</p></td>
     <td><p>一時的な起動を削除します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateLaunchTemplateVersion</p></td>
     <td><p>Launch Template</p></td>
     <td><p>Launch Templateのバージョンを作成します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateTags</p></td>
     <td><p>Tags</p></td>
     <td><p>zilliz byocリソースにタグを追加</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeAccountAttributes</p></td>
     <td><p>Account</p></td>
     <td><p>ロールを使用する際にアカウントIDを確認してください。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeInstanceTypes</p></td>
     <td><p>Instance</p></td>
     <td><p>インスタンスの型を取得します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeLaunchTemplateVersions</p></td>
     <td><p>Launch Template</p></td>
     <td><p>起動テンプレートのバージョンを取得します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeLaunchTemplates</p></td>
     <td><p>Launch Template</p></td>
     <td><p>起動テンプレートが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeSubnets</p></td>
     <td><p>Subnets</p></td>
     <td><p>サブネットがVPCに存在することを確認します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeVpcs</p></td>
     <td><p>VPC</p></td>
     <td><p>VPCが存在することを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateCluster</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>EKSクラスタを作成します。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateNodegroup</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>EKSノードグループを作成します。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateAddon</p></td>
     <td><p>EKS addons</p></td>
     <td><p>EKSアドオンを作成します。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>アクセスエントリを使用すると、IAMプリンシパルがクラスターにアクセスできます。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreatePodIdentityAssociation</p></td>
     <td><p>EKS PodIdentityAssociation</p></td>
     <td><p>ポッドにAWS IAMロールを割り当てます。</p></td>
   </tr>
   <tr>
     <td><p>eks:AssociateAccessPolicy</p></td>
     <td><p>Policy</p></td>
     <td><p>アクセスエントリにアクセスポリシーとそのスコープを関連付けます。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>EKS AccessEntryを更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateAddon</p></td>
     <td><p>EKS addons</p></td>
     <td><p>EKSアドオンを更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateClusterConfig</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>EKSの設定を更新してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateClusterVersion</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>EKSのバージョンを更新してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateNodegroupConfig</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>EKS nodegroupの設定を更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateNodegroupVersion</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>EKS nodegroupのバージョンを更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdatePodIdentityAssociation</p></td>
     <td><p>Pod identity</p></td>
     <td><p>EKSポッドIDを更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:TagResource</p></td>
     <td><p>Tags</p></td>
     <td><p>すべてのeksリソースにタグを付けます。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeCluster</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeNodegroup</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>EKSノードグループが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>EKSアクセサリーが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddon</p></td>
     <td><p>EKS Addon</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddonConfiguration</p></td>
     <td><p>EKS addons</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddonVersions</p></td>
     <td><p>EKS addons</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribePodIdentityAssociation</p></td>
     <td><p>Pod identity</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAccessEntries</p></td>
     <td><p>EKS accessentry</p></td>
     <td><p>Zillizが作成したEKSのアクセスエントリを取得してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAccessPolicies</p></td>
     <td><p>EKS access policy</p></td>
     <td><p>Zillizが作成したEKSのアクセスポリシーを取得してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAddons</p></td>
     <td><p>EKS addons</p></td>
     <td><p>Zillizが作成したEKSアドオンを入手してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListNodegroups</p></td>
     <td><p>EKS node group</p></td>
     <td><p>Zillizが作成したEKSノードグループを取得します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListUpdates</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizが作成したEKSのアップデートを取得してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListPodIdentityAssociations</p></td>
     <td><p>Pod identity</p></td>
     <td><p>Zillizによって作成されたポッドID関連付けを取得してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListTagsForResource</p></td>
     <td><p>Tags</p></td>
     <td><p>Zillizによって作成されたリソースタグを取得する</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteAccessEntry</p></td>
     <td><p>EKS Accessentry</p></td>
     <td><p>Zillizによって作成されたEKSアクセスエントリを削除します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteAddon</p></td>
     <td><p>EKS addons</p></td>
     <td><p>Zillizによって作成されたEKSアドオンを削除してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteCluster</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>Zillizによって作成されたEKSクラスタを削除します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteFargateProfile</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizによって作成されたEKSファーゲートプロファイルを削除してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteNodegroup</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>Zillizが作成したEKSノードグループを削除します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeletePodIdentityAssociation</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizによって作成されたEKSポッドIDを削除します。</p></td>
   </tr>
   <tr>
     <td><p>s3:GetBucketLocation</p></td>
     <td><p>Bucket</p></td>
     <td><p>S 3バケットの位置が正しいことを確認します。</p></td>
   </tr>
</table>
