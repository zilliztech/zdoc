---
title: "ロールの権限 | BYOC"
slug: /permissions-in-roles
sidebar_label: "ロールの権限"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud が代理で操作を実行するために必要なすべてのIAM権限を一覧表示します。 | BYOC"
type: origin
token: IOPFwYrC2iJDw3k2iElcBrkMnef
sidebar_position: 5
keywords:
  - zilliz
  - byoc
  - aws
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - Agentic RAG
  - rag llm architecture
  - private llms
  - nn search

---

import Admonition from '@theme/Admonition';


# ロールの権限

このページでは、Zilliz Cloud が代理で操作を実行するために必要なすべてのIAM権限を一覧表示します。

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC は現在、<strong>一般提供</strong>されています。アクセスおよび実装の詳細については、<a href="https://zilliz.com/contact-sales">Zilliz Cloud 営業担当</a>にお問い合わせください。</p>

</Admonition>

## ストレージロールの権限\{#storage-role-permissions}

S3バケットとストレージロールを作成しました。Zilliz Cloud は、以下の権限を持つこのロールを想定します。

<table>
   <tr>
     <th><p>AWS IAM権限</p></th>
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
     <td><p>バケットオブジェクト</p></td>
     <td><p>Milvus が S3 バケットからデータを読み取ることを許可します</p></td>
   </tr>
   <tr>
     <td><p>s3:PutObject</p></td>
     <td><p>バケットオブジェクト</p></td>
     <td><p>Milvus がバケットにデータを書き込むことを許可します</p></td>
   </tr>
   <tr>
     <td><p>s3:DeleteObject</p></td>
     <td><p>バケットオブジェクト</p></td>
     <td><p>Milvus がデータを削除することを許可します</p></td>
   </tr>
</table>

## EKSロールの権限\{#eks-role-permissions}

Zilliz Cloud が EKS クラスターを管理するために、以下の権限を持つ EKS ロールを作成しました。

### AWS管理の権限\{#aws-managed-permissions}

これらの権限は AWS によって管理され、EKS ロールに添付できます。これらの各権限の詳細については、**権限** 列の項目をクリックして詳細を確認できます。

<table>
   <tr>
     <th><p>権限</p></th>
     <th><p>管理元</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html">AmazonEC2ContainerRegistryReadOnly</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Amazon EC2 コンテナレジストリリポジトリへの読み取り専用アクセスを提供します。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html">AmazonEKS_CNI_Policy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Amazon VPC CNIプラグイン (amazon-vpc-cni-k8s) がEKSワーーカーノードのIPアドレス構成を変更するために必要な権限を提供します。</p></td>
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
     <td><p>VPC リソースコントローラーがワーカーノードのENIおよびIPを管理できるようにします。</p></td>
   </tr>
</table>

### Kubernetes SIGs からの権限\{#permissions-from-kubernetes-sigs}

これらの権限は [Kubernetes SIGs](https://github.com/kubernetes-sigs) リポジトリの貢献者によって管理されます。Zilliz Cloud は、AWS ロードバランサーコントローラー、Amazon EBS CSI ドライバー、およびクラスターオートスケーラーをインストールするための権限を参照しています。

以下の表は、特定の権限セットを一覧表示します。これらの各権限の詳細については、**権限** 列の項目をクリックして詳細を確認できます。

<table>
   <tr>
     <th><p>権限</p></th>
     <th><p>管理元</p></th>
     <th><p>説明</p></th>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json">AWS ロードバランサーコントローラー</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>AWS ロードバランサーコントローラーは、Kubernetes クラスター用のElastic Load Balancerを管理するのを助けるコントローラーです。</p><p>AWS ロードバランサーコントローラーリポジトリの詳細については、<a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main">README</a> ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json">Amazon EBS CSI ドライバー</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>Amazon Elastic Block Store Container Storage Interface (CSI) ドライバーは、コンテナオーケストレーターがAmazon EBSボリュームのライフサイクルを管理するために使用されるCSIインターフェースを提供します。</p><p>Amazon EBS CSIドライバーの詳細については、<a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver">README</a> ファイルを参照してください。</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended">クラスターオートスケーラー</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>クラスターオートスケーラーは、すべてのポッドが実行できる場所があり、不要なノードがないようにKubernetesクラスターのサイズを自動的に調整するコンポーネントです。</p><p>AWSでのクラスターオートスケーラーの詳細については、<a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md">README</a> ファイルを参照してください。</p></td>
   </tr>
</table>

## クロスアカウントロールの権限\{#cross-account-role-permissions}

Zilliz Cloud が EKS クラスターで BYOC ソリューションを展開するために、以下の権限を持つクロスアカウントロールを作成しました。

<table>
   <tr>
     <th><p>AWS IAM権限</p></th>
     <th><p>AWSリソース</p></th>
     <th><p>目的</p></th>
   </tr>
   <tr>
     <td><p>iam:GetRole</p></td>
     <td><p>ロール</p></td>
     <td><p>EKS作成時に依存ロールを読み取ります。</p></td>
   </tr>
   <tr>
     <td><p>iam:ListAttachedRolePolicies</p></td>
     <td><p>ポリシー</p></td>
     <td><p>依存ロールのポリシーを取得します。</p></td>
   </tr>
   <tr>
     <td><p>iam:PassRole</p></td>
     <td><p>ロール</p></td>
     <td><p>EKSがロールを使用することを許可します。</p></td>
   </tr>
   <tr>
     <td><p>iam:UpdateAssumeRolePolicy</p></td>
     <td><p>IAMロール</p></td>
     <td><p>EKS OIDCプロバイダーの信頼ポリシーを更新します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateLaunchTemplate</p></td>
     <td><p>起動テンプレート</p></td>
     <td><p>EKSノードグループの起動テンプレートを作成します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:RunInstances</p></td>
     <td><p>インスタンス</p></td>
     <td><p>EKSノードグループのAWSインスタンスを起動します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DeleteLaunchTemplate</p></td>
     <td><p>起動テンプレート</p></td>
     <td><p>起動テンプレートを削除します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateLaunchTemplateVersion</p></td>
     <td><p>起動テンプレート</p></td>
     <td><p>起動テンプレートのバージョンを作成します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateTags</p></td>
     <td><p>タグ</p></td>
     <td><p>すべてのzilliz byocリソースにタグを追加します</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeAccountAttributes</p></td>
     <td><p>アカウント</p></td>
     <td><p>ロール使用時にアカウントIDを確認します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeInstanceTypes</p></td>
     <td><p>インスタンス</p></td>
     <td><p>インスタンスのインスタンスタイプを取得します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeLaunchTemplateVersions</p></td>
     <td><p>起動テンプレート</p></td>
     <td><p>起動テンプレートのバージョンを取得します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeLaunchTemplates</p></td>
     <td><p>起動テンプレート</p></td>
     <td><p>起動テンプレートが正しく作成されたことを確認します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeSubnets</p></td>
     <td><p>サブネット</p></td>
     <td><p>VPC内にサブネットが存在することを確認します。</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeVpcs</p></td>
     <td><p>VPC</p></td>
     <td><p>VPCが存在することを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateCluster</p></td>
     <td><p>EKSクラスター</p></td>
     <td><p>EKSクラスターを作成します。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateNodegroup</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>EKSノードグループを作成します。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateAddon</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSアドオンを作成します。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>アクセスエントリーにより、IAMプリンシパルがクラスターにアクセスできるようになります。</p></td>
   </tr>
   <tr>
     <td><p>eks:CreatePodIdentityAssociation</p></td>
     <td><p>EKS PodIdentityAssociation</p></td>
     <td><p>ポッドがAWS IAMロールを想定することを許可します。</p></td>
   </tr>
   <tr>
     <td><p>eks:AssociateAccessPolicy</p></td>
     <td><p>ポリシー</p></td>
     <td><p>アクセスポリシーとそのスコープをアクセスエントリーに関連付けます。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>EKS AccessEntry を更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateAddon</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSアドオンを更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateClusterConfig</p></td>
     <td><p>EKSクラスター</p></td>
     <td><p>EKSの構成を更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateClusterVersion</p></td>
     <td><p>EKSクラスター</p></td>
     <td><p>EKSのバージョンを更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateNodegroupConfig</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>EKSノードグループの構成を更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateNodegroupVersion</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>EKSノードグループのバージョンを更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdatePodIdentityAssociation</p></td>
     <td><p>ポッドアイデンティティ</p></td>
     <td><p>EKSポッドアイデンティティを更新します。</p></td>
   </tr>
   <tr>
     <td><p>eks:TagResource</p></td>
     <td><p>タグ</p></td>
     <td><p>すべてのeksリソースにタグを付けます。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeCluster</p></td>
     <td><p>EKSクラスター</p></td>
     <td><p>EKSクラスターが正しく作成されたことを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeNodegroup</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>EKSノードグループが正しく作成されたことを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>EKS accessentryが正しく作成されたことを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddon</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSクラスターが正しく作成されたことを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddonConfiguration</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSクラスターが正しく作成されたことを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddonVersions</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSクラスターが正しく作成されたことを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribePodIdentityAssociation</p></td>
     <td><p>ポッドアイデンティティ</p></td>
     <td><p>EKSクラスターが正しく作成されたことを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAccessEntries</p></td>
     <td><p>EKS accessentry</p></td>
     <td><p>Zillizによって作成されたEKSのアクセスエントリーを取得します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAccessPolicies</p></td>
     <td><p>EKSアクセスポリシー</p></td>
     <td><p>Zillizによって作成されたEKSのアクセスポリシーを取得します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAddons</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>Zillizによって作成されたEKSアドオンを取得します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListNodegroups</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>Zillizによって作成されたEKSノードグループを取得します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListUpdates</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizによって作成されたEKSの更新を取得します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListPodIdentityAssociations</p></td>
     <td><p>ポッドアイデンティティ</p></td>
     <td><p>Zillizによって作成されたポッドアイデンティティ関連を取得します。</p></td>
   </tr>
   <tr>
     <td><p>eks:ListTagsForResource</p></td>
     <td><p>タグ</p></td>
     <td><p>Zillizによって作成されたリソースタグを取得します</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteAccessEntry</p></td>
     <td><p>EKS Accessentry</p></td>
     <td><p>Zillizによって作成されたEKSアクセスエントリーを削除します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteAddon</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>Zillizによって作成されたEKSアドオンを削除します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteCluster</p></td>
     <td><p>EKSクラスター</p></td>
     <td><p>Zillizによって作成されたEKSクラスターを削除します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteFargateProfile</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizによって作成されたEKS fargateプロファイルを削除します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteNodegroup</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>Zillizによって作成されたEKSノードグループを削除します。</p></td>
   </tr>
   <tr>
     <td><p>eks:DeletePodIdentityAssociation</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizによって作成されたEKSポッドアイデンティティを削除します。</p></td>
   </tr>
   <tr>
     <td><p>s3:GetBucketLocation</p></td>
     <td><p>バケット</p></td>
     <td><p>S3バケットの場所が正しいことを確認します。</p></td>
   </tr>
</table>
