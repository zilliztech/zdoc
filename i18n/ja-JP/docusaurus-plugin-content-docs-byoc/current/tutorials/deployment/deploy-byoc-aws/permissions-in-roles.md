---
title: "ロール内の権限 | BYOC"
slug: /permissions-in-roles
sidebar_label: "ロール内の権限"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "このページでは、Zilliz Cloud がお客様に代わって control plan のセットアップ中に操作を実行するために必要なすべての IAM 権限を一覧表示します。 | BYOC"
type: origin
token: IOPFwYrC2iJDw3k2iElcBrkMnef
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# ロール内の権限

このページでは、Zilliz Cloud がお客様に代わって control plan のセットアップ中に操作を実行するために必要なすべての IAM 権限を一覧表示します。 

<Admonition type="info" icon="📘" title="注意">

Zilliz BYOC は現在 **General Availability** で利用可能です。アクセス方法および実装の詳細については、[Zilliz Cloud sales](https://zilliz.com/contact-sales) までお問い合わせください。

</Admonition>

## Storage role permissions\{#storage-role-permissions}

お客様はすでに S3 bucket と storage role を作成しています。Zilliz Cloud は、control plane のセットアップ中に次の権限でこの role を引き受けます。

| AWS IAM permission | AWS resource | 目的 |
| --- | --- | --- |
| s3:ListBucket | Bucket | bucket が存在するかどうかを確認します。 |
| s3:GetObject | Bucket object | Milvus が S3 bucket からデータを読み取れるようにします |
| s3:PutObject | Bucket object | Milvus が bucket にデータを書き込めるようにします |
| s3:DeleteObject | Bucket object | Milvus がデータを削除できるようにします |

## EKS role permissions\{#eks-role-permissions}

お客様は、control plane のセットアップ中に Zilliz Cloud が EKS cluster を管理できるよう、次の権限を持つ EKS role を作成しています。

### AWS-managed permissions\{#aws-managed-permissions}

これらの権限は AWS によって管理されており、EKS role にアタッチできます。各権限の詳細については、**Permissions** 列の項目をクリックして確認できます。

| Permissions | Managed by | 説明 |
| --- | --- | --- |
| [AmazonEC2ContainerRegistryReadOnly](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html) | AWS | Amazon EC2 Container Registry リポジトリへの読み取り専用アクセスを提供します。 |
| [AmazonEKS_CNI_Policy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html) | AWS | Amazon VPC CNI Plugin (amazon-vpc-cni-k8s) に、EKS worker node 上の IP アドレス設定を変更するために必要な権限を提供します。 |
| [AmazonEKSWorkerNodePolicy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html) | AWS | Amazon EKS worker node が Amazon EKS Clusters に接続できるようにします。 |
| [AmazonEKSClusterPolicy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSClusterPolicy.html) | AWS | Kubernetes がお客様に代わってリソースを管理するために必要な権限を提供します。 |
| [AmazonEKSVPCResourceController](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSVPCResourceController.html) | AWS | VPC Resource Controller が worker node の ENI および IP を管理できるようにします。 |

### Permissions from Kubernetes SIGs\{#permissions-from-kubernetes-sigs}

これらの権限は [Kubernetes SIGs](https://github.com/kubernetes-sigs) リポジトリのコントリビューターによって管理されています。Zilliz Cloud は、AWS Load Balancer Controller、Amazon EBS CSI driver、Cluster AutoScaler をインストールするためにこれらの権限を参照します。 

以下の表に、具体的な権限セットを示します。各権限の詳細については、**Permissions** 列の項目をクリックして確認できます。

| Permissions | Managed by | 説明 |
| --- | --- | --- |
| [AWS Load Balancer Controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json) | Kubernetes SIGs | AWS Load Balancer Controller は、Kubernetes cluster の Elastic Load Balancers の管理を支援する controller です。<br/>AWS Load Balancer Controller リポジトリの詳細については、[README](https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main) ファイルを参照してください。 |
| [Amazon EBS CSI driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json) | Kubernetes SIGs | Amazon Elastic Block Store Container Storage Interface (CSI) Driver は、Container Orchestrators が Amazon EBS volume のライフサイクルを管理するために使用する CSI インターフェースを提供します。<br/>Amazon EBS CSI driver の詳細については、[README](https://github.com/kubernetes-sigs/aws-ebs-csi-driver) ファイルを参照してください。 |
| [Cluster AutoScaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended) | Kubernetes SIGs | Cluster AutoScaler は、すべての pod に実行場所があり、不要な node が存在しないように、Kubernetes Cluster のサイズを自動的に調整するコンポーネントです。<br/>AWS 上の Cluster AutoScaler の詳細については、[README](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md) ファイルを参照してください。 |

## Cross-account role permissions\{#cross-account-role-permissions}

お客様は、Zilliz Cloud が EKS cluster 内に BYOC control plane をセットアップできるよう、次の権限を持つ cross-account role を作成しています。

| AWS IAM permission | AWS resource | 目的 |
| --- | --- | --- |
| iam:GetRole | Role | EKS を作成する際に依存する role を読み取ります。 |
| iam:ListAttachedRolePolicies | Policy | 依存する role の policy を取得します。 |
| iam:PassRole | Role | EKS がこの role を使用できるようにします。 |
| iam:UpdateAssumeRolePolicy | IAM Role | EKS OIDC provider の trust policy を更新します。 |
| ec2:CreateLaunchTemplate | Launch Template | EKS nodegroup の launch template を作成します。 |
| ec2:RunInstances | Instance | EKS nodegroup の AWS instance を起動します。 |
| ec2:DeleteLaunchTemplate | Launch Template | launch template を削除します。 |
| ec2:CreateLaunchTemplateVersion | Launch Template | Launch Template のバージョンを作成します。 |
| ec2:CreateTags | Tags | すべての zilliz byoc リソースにタグを追加します |
| ec2:DescribeAccountAttributes | Account | role を使用する際に account ID を確認します。 |
| ec2:DescribeInstanceTypes | Instance | instance の instance type を取得します。 |
| ec2:DescribeLaunchTemplateVersions | Launch Template | Launch Template のバージョンを取得します。 |
| ec2:DescribeLaunchTemplates | Launch Template | launch template が正しく作成されていることを確認します。 |
| ec2:DescribeSubnets | Subnets | VPC 内に Subnets が存在することを確認します。 |
| ec2:DescribeVpcs | VPC | VPC が存在することを確認します。 |
| eks:CreateCluster | EKS cluster | EKS cluster を作成します。 |
| eks:CreateNodegroup | EKS nodegroup | EKS nodegroup を作成します。 |
| eks:CreateAddon | EKS addons | EKS addons を作成します。 |
| eks:CreateAccessEntry | EKS AccessEntry | access entry により、IAM principal が cluster にアクセスできるようになります。 |
| eks:CreatePodIdentityAssociation | EKS PodIdentityAssociation | pod が AWS IAM role を引き受けられるようにします。 |
| eks:AssociateAccessPolicy | Policy | access policy とそのスコープを access entry に関連付けます。 |
| eks:UpdateAccessEntry | EKS AccessEntry | EKS AccessEntry を更新します。 |
| eks:UpdateAddon | EKS addons | EKS addons を更新します。 |
| eks:UpdateClusterConfig | EKS cluster | EKS の設定を更新します。 |
| eks:UpdateClusterVersion | EKS cluster | EKS のバージョンを更新します。 |
| eks:UpdateNodegroupConfig | EKS nodegroup | EKS nodegroup の設定を更新します。 |
| eks:UpdateNodegroupVersion | EKS nodegroup | EKS nodegroup のバージョンを更新します。 |
| eks:UpdatePodIdentityAssociation | Pod identity | EKS pod identity を更新します。 |
| eks:TagResource | Tags | すべての eks リソースにタグを付与します。 |
| eks:DescribeCluster | EKS cluster | EKS cluster が正しく作成されていることを確認します。 |
| eks:DescribeNodegroup | EKS nodegroup | EKS nodegroup が正しく作成されていることを確認します。 |
| eks:DescribeAccessEntry | EKS AccessEntry | EKS accessentry が正しく作成されていることを確認します。 |
| eks:DescribeAddon | EKS Addon | EKS cluster が正しく作成されていることを確認します。 |
| eks:DescribeAddonConfiguration | EKS addons | EKS cluster が正しく作成されていることを確認します。 |
| eks:DescribeAddonVersions | EKS addons | EKS cluster が正しく作成されていることを確認します。 |
| eks:DescribePodIdentityAssociation | Pod identity | EKS cluster が正しく作成されていることを確認します。 |
| eks:ListAccessEntries | EKS accessentry | Zilliz が作成した EKS の EKS access entries を取得します。 |
| eks:ListAccessPolicies | EKS access policy | Zilliz が作成した EKS の EKS access policies を取得します。 |
| eks:ListAddons | EKS addons | Zilliz が作成した EKS addons を取得します。 |
| eks:ListNodegroups | EKS node group | Zilliz が作成した EKS node groups を取得します。 |
| eks:ListUpdates | EKS | Zilliz が作成した EKS updates を取得します。 |
| eks:ListPodIdentityAssociations | Pod identity | Zilliz が作成した pod identity associations を取得します。 |
| eks:ListTagsForResource | Tags | Zilliz が作成したリソースタグを取得します |
| eks:DeleteAccessEntry | EKS Accessentry | Zilliz が作成した EKS access entries を削除します。 |
| eks:DeleteAddon | EKS addons | Zilliz が作成した EKS addons を削除します。 |
| eks:DeleteCluster | EKS cluster | Zilliz が作成した EKS cluster を削除します。 |
| eks:DeleteFargateProfile | EKS | Zilliz が作成した EKS fargate profile を削除します。 |
| eks:DeleteNodegroup | EKS nodegroup | Zilliz が作成した EKS nodegroup を削除します。 |
| eks:DeletePodIdentityAssociation | EKS | Zilliz が作成した EKS pod identity を削除します。 |
| s3:GetBucketLocation | Bucket | S3 Bucket の location が正しいことを確認します。 |
