---
title: "ロール内の権限 | BYOC"
slug: /permissions-in-roles
sidebar_label: "ロール内の権限"
beta: CONTACT SALES
notebook: FALSE
description: "このページでは、Zilliz Cloudがあなたの代わりに操作を実行するために必要なすべてのIAM権限がリストされています。 | BYOC"
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
  - hybrid vector search
  - Video deduplication
  - Video similarity search
  - Vector retrieval

---

import Admonition from '@theme/Admonition';


# ロール内の権限

このページでは、Zilliz Cloudがあなたの代わりに操作を実行するために必要なすべてのIAM権限がリストされています。 

<Admonition type="info" icon="📘" title="ノート">

<p>Zilliz BYOCは現在<strong>General Availability</strong>で利用可能です。アクセスと実装の詳細については、<a href="https://zilliz.com/contact-sales">Zillizクラウド販売</a>にお問い合わせください。</p>

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
     <td><p>S 3:リストバケット</p></td>
     <td><p>バケット</p></td>
     <td><p>バケットが存在するかどうかを確認します。</p></td>
   </tr>
   <tr>
     <td><p>S 3: GetObjectを取得する</p></td>
     <td><p>Bucketオブジェクト</p></td>
     <td><p>MilvusがS 3バケットからデータを読み取れるようにする</p></td>
   </tr>
   <tr>
     <td><p>S 3: PutObjectの設定</p></td>
     <td><p>Bucketオブジェクト</p></td>
     <td><p>Milvusがバケットにデータを書き込むことを許可します</p></td>
   </tr>
   <tr>
     <td><p>s 3:オブジェクトの削除</p></td>
     <td><p>Bucketオブジェクト</p></td>
     <td><p>Milvusがデータを削除できるようにする</p></td>
   </tr>
</table>

## EKSロールの権限{#eks-role-permissions}

Zilliz CloudでEKSクラスターを管理するために、次の権限を持つEKSロールを作成しました。

### AWSが管理する権限{#aws-managed-permissions}

これらの権限はAWSによって管理され、EKSロールに関連付けることができます。各権限の詳細については、**権限**列の項目をクリックして詳細を確認してください。

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

### Kubernetes SIGsからの権限{#permissions-from-kubernetes-sigs}

これらの権限は、[KubernetesのSIGs](https://github.com/kubernetes-sigs)リポジトリのコントリビューターによって管理されています。Zilliz Cloudは、AWSロードバランサーコントローラー、Amazon EBS CSIドライバー、およびCluster AutoScalerをインストールするための権限を参照しています。 

以下の表には、特定の権限セットがリストされています。これらの権限の詳細については、**権限**列の項目をクリックして詳細を確認できます。

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

## クロスアカウントロールの権限{#cross-account-role-permissions}

Zilliz CloudがEKSクラスターにBYOCソリューションをデプロイするために、次の権限を持つクロスアカウントロールを作成しました。

<table>
   <tr>
     <th><p>AWS IAMのパーミッション</p></th>
     <th><p>AWSリソース</p></th>
     <th><p>目的</p></th>
   </tr>
   <tr>
     <td><p>カテゴリー: GetRole</p></td>
     <td><p>役割</p></td>
     <td><p>EKSを作成する際に、依存する役割を読んでください。</p></td>
   </tr>
   <tr>
     <td><p>IAM:ListAttachedRolePolicies</p></td>
     <td><p>ポリシー</p></td>
     <td><p>依存ロールのポリシーを取得します。</p></td>
   </tr>
   <tr>
     <td><p>iam:パスワード</p></td>
     <td><p>役割</p></td>
     <td><p>EKSにロールの使用を許可します。</p></td>
   </tr>
   <tr>
     <td><p>IAM:UpdateAssumeRolePolicy</p></td>
     <td><p>IAMの役割</p></td>
     <td><p>EKS OIDCプロバイダーの信頼ポリシーを更新します。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:CreateLaunchTemplate</p></td>
     <td><p>テンプレートを起動</p></td>
     <td><p>EKS nodegroupの起動テンプレートを作成します。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:ランインスタンス</p></td>
     <td><p>インスタンス</p></td>
     <td><p>EKSノードグループのAWSインスタンスを起動します。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:DeleteLaunchTemplate</p></td>
     <td><p>テンプレートを起動</p></td>
     <td><p>一時的な起動を削除します。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:CreateLaunchTemplateVersion</p></td>
     <td><p>テンプレートを起動</p></td>
     <td><p>Launch Templateのバージョンを作成します。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:タグの作成</p></td>
     <td><p>タグ</p></td>
     <td><p>zilliz byocリソースにタグを追加</p></td>
   </tr>
   <tr>
     <td><p>EC 2:DescribeAccountAttributes</p></td>
     <td><p>アカウント</p></td>
     <td><p>ロールを使用する際にアカウントIDを確認してください。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:DescribeInstanceTypes</p></td>
     <td><p>インスタンス</p></td>
     <td><p>インスタンスの型を取得します。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:DescribeLaunchTemplateVersions</p></td>
     <td><p>テンプレートを起動</p></td>
     <td><p>起動テンプレートのバージョンを取得します。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:DescribeLaunchTemplates</p></td>
     <td><p>テンプレートを起動</p></td>
     <td><p>起動テンプレートが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>EC 2:サブネットの説明</p></td>
     <td><p>サブネット</p></td>
     <td><p>サブネットがVPCに存在することを確認します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: DescribeVpcs</p></td>
     <td><p>VPC</p></td>
     <td><p>VPCが存在することを確認します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: CreateCluster</p></td>
     <td><p>EKSクラスタ</p></td>
     <td><p>EKSクラスタを作成します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: CreateNodegroup</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>EKSノードグループを作成します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: CreateAddon</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSアドオンを作成します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: CreateAccessEntry</p></td>
     <td><p>EKSアクセスエントリー</p></td>
     <td><p>アクセスエントリを使用すると、IAMプリンシパルがクラスターにアクセスできます。</p></td>
   </tr>
   <tr>
     <td><p>EKS:CreatePodIdentityAssociation</p></td>
     <td><p>EKSPodIdentityAssociation</p></td>
     <td><p>ポッドにAWS IAMロールを割り当てます。</p></td>
   </tr>
   <tr>
     <td><p>EKS:AssociateAccessPolicy</p></td>
     <td><p>ポリシー</p></td>
     <td><p>アクセスエントリにアクセスポリシーとそのスコープを関連付けます。</p></td>
   </tr>
   <tr>
     <td><p>タグ: UpdateAccessEntry</p></td>
     <td><p>EKSアクセスエントリー</p></td>
     <td><p>EKS AccessEntryを更新します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: UpdateAddon</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSアドオンを更新します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: UpdateCluster Config</p></td>
     <td><p>EKSクラスタ</p></td>
     <td><p>EKSの設定を更新してください。</p></td>
   </tr>
   <tr>
     <td><p>EKS:UpdateClusterVersion</p></td>
     <td><p>EKSクラスタ</p></td>
     <td><p>EKSのバージョンを更新してください。</p></td>
   </tr>
   <tr>
     <td><p>EKS:UpdateNodegroupConfig</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>EKS nodegroupの設定を更新します。</p></td>
   </tr>
   <tr>
     <td><p>EKS:UpdateNodegroupVersion</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>EKS nodegroupのバージョンを更新します。</p></td>
   </tr>
   <tr>
     <td><p>EKS:UpdatePodIdentityAssociation</p></td>
     <td><p>ポッドのアイデンティティ</p></td>
     <td><p>EKSポッドIDを更新します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: TagResource</p></td>
     <td><p>タグ</p></td>
     <td><p>すべてのeksリソースにタグを付けます。</p></td>
   </tr>
   <tr>
     <td><p>タグ: DescribeCluster</p></td>
     <td><p>EKSクラスタ</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: DescribeNodegroup</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>EKSノードグループが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: DescribeAccessEntry</p></td>
     <td><p>EKSアクセスエントリー</p></td>
     <td><p>EKSアクセサリーが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: DescribeAddon</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>EKS:DescribeAddonConfiguration</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>EKS:DescribeAddonVersions</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>EKS:DescribePodIdentityAssociation</p></td>
     <td><p>ポッドのアイデンティティ</p></td>
     <td><p>EKSクラスターが正しく作成されていることを確認します。</p></td>
   </tr>
   <tr>
     <td><p>eksについて</p></td>
     <td><p>EKSアクセサリー</p></td>
     <td><p>Zillizが作成したEKSのアクセスエントリを取得してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:リストアクセスポリシー</p></td>
     <td><p>EKSアクセスポリシー</p></td>
     <td><p>Zillizが作成したEKSのアクセスポリシーを取得してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:リストアドオン</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>Zillizが作成したEKSアドオンを入手してください。</p></td>
   </tr>
   <tr>
     <td><p>eks:リストノードグループ</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>Zillizが作成したEKSノードグループを取得します。</p></td>
   </tr>
   <tr>
     <td><p>eks:リスト更新</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizが作成したEKSのアップデートを取得してください。</p></td>
   </tr>
   <tr>
     <td><p>EKS:ListPodIdentityAssociations</p></td>
     <td><p>ポッドのアイデンティティ</p></td>
     <td><p>Zillizによって作成されたポッドID関連付けを取得してください。</p></td>
   </tr>
   <tr>
     <td><p>タグ: List TagsForResource</p></td>
     <td><p>タグ</p></td>
     <td><p>Zillizによって作成されたリソースタグを取得する</p></td>
   </tr>
   <tr>
     <td><p>タグ: DeleteAccessEntry</p></td>
     <td><p>EKSアクセサリー</p></td>
     <td><p>Zillizによって作成されたEKSアクセスエントリを削除します。</p></td>
   </tr>
   <tr>
     <td><p>タグ: DeleteAddon</p></td>
     <td><p>EKSアドオン</p></td>
     <td><p>Zillizによって作成されたEKSアドオンを削除してください。</p></td>
   </tr>
   <tr>
     <td><p>タグ: DeleteCluster</p></td>
     <td><p>EKSクラスタ</p></td>
     <td><p>Zillizが作成したEKSクラスタを削除します。</p></td>
   </tr>
   <tr>
     <td><p>EKS:DeleteFargateProfile</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizによって作成されたEKSファーゲートプロファイルを削除してください。</p></td>
   </tr>
   <tr>
     <td><p>タグ: DeleteNodegroup</p></td>
     <td><p>EKSノードグループ</p></td>
     <td><p>Zillizが作成したEKSノードグループを削除します。</p></td>
   </tr>
   <tr>
     <td><p>EKS:DeletePodIdentityAssociation</p></td>
     <td><p>EKS</p></td>
     <td><p>Zillizによって作成されたEKSポッドIDを削除します。</p></td>
   </tr>
   <tr>
     <td><p>S 3: GetBucketLocationを取得する</p></td>
     <td><p>バケット</p></td>
     <td><p>S 3バケットの位置が正しいことを確認します。</p></td>
   </tr>
</table>
