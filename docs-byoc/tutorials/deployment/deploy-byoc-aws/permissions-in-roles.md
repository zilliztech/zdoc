---
title: "Permissions in Roles | BYOC"
slug: /permissions-in-roles
sidebar_label: "Permissions in Roles"
beta: FALSE
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page lists all IAM permissions that Zilliz Cloud requires to perform operations during the setup of the control plan on your behalf. | BYOC"
type: origin
token: IOPFwYrC2iJDw3k2iElcBrkMnef
sidebar_position: 5
displayed_sidebar: default

---

import Admonition from '@theme/Admonition';


# Permissions in Roles

This page lists all IAM permissions that Zilliz Cloud requires to perform operations during the setup of the control plan on your behalf. 

<Admonition type="info" icon="📘" title="Notes">

Zilliz BYOC is currently available in **General Availability**. For access and implementation details, please contact [Zilliz Cloud sales](https://zilliz.com/contact-sales).

</Admonition>

## Storage role permissions\{#storage-role-permissions}

You have created an S3 bucket and a storage role. Zilliz Cloud assumes this role with the following permissions during control plane setup.

| AWS IAM permission | AWS resource | Purpose |
| --- | --- | --- |
| s3:ListBucket | Bucket | Checks whether the bucket exists. |
| s3:GetObject | Bucket object | Allows Milvus read data from S3 bucket |
| s3:PutObject | Bucket object | Allows Milvus write data to bucket |
| s3:DeleteObject | Bucket object | Allows Milvus delete data |

## EKS role permissions\{#eks-role-permissions}

You have created an EKS role with the following permissions for Zilliz Cloud to manage the EKS cluster during control plane setup.

### AWS-managed permissions\{#aws-managed-permissions}

These permissions are managed by AWS and you can attach them to the EKS role. For details on each of these permissions, you can click the item in the **Permissions** column to learn more.

| Permissions | Managed by | Description |
| --- | --- | --- |
| [AmazonEC2ContainerRegistryReadOnly](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html) | AWS | Provides read-only access to Amazon EC2 Container Registry repositories. |
| [AmazonEKS_CNI_Policy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html) | AWS | Provides the Amazon VPC CNI Plugin (amazon-vpc-cni-k8s) the permissions it requires to modify the IP address configuration on your EKS worker nodes. |
| [AmazonEKSWorkerNodePolicy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html) | AWS | Allows Amazon EKS worker nodes to connect to Amazon EKS Clusters. |
| [AmazonEKSClusterPolicy](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSClusterPolicy.html) | AWS | Provides Kubernetes the permissions it requires to manage resources on your behalf. |
| [AmazonEKSVPCResourceController](https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSVPCResourceController.html) | AWS | Allows VPC Resource Controller to manage ENI and IPs for worker nodes. |

### Permissions from Kubernetes SIGs\{#permissions-from-kubernetes-sigs}

These permissions are managed by contributors in the [Kubernetes SIGs](https://github.com/kubernetes-sigs) repository. Zilliz Cloud references the permissions to install AWS Load Balancer Controller, Amazon EBS CSI driver, and Cluster AutoScaler. 

The following tables list the specific sets of permissions. For details on each of these permissions, you can click the item in the **Permissions** column to learn more.

| Permissions | Managed by | Description |
| --- | --- | --- |
| [AWS Load Balancer Controller](https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json) | Kubernetes SIGs | AWS Load Balancer Controller is a controller to help manage Elastic Load Balancers for a Kubernetes cluster.<br/>For details on the AWS Load Balancer Controller repository, refer to the [README](https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main) file. |
| [Amazon EBS CSI driver](https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json) | Kubernetes SIGs | The Amazon Elastic Block Store Container Storage Interface (CSI) Driver provides a CSI interface used by Container Orchestrators to manage the lifecycle of Amazon EBS volumes.<br/>For details on the Amazon EBS CSI driver, refer to the [README](https://github.com/kubernetes-sigs/aws-ebs-csi-driver) file. |
| [Cluster AutoScaler](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended) | Kubernetes SIGs | The Cluster AutoScaler is a component that automatically adjusts the size of a Kubernetes Cluster so that all pods have a place to run and there are no unneeded nodes.<br/>For details on the Cluster AutoScaler on AWS, refer to the [README](https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md) file. |

## Cross-account role permissions\{#cross-account-role-permissions}

You have created a cross-account role with the following permissions for Zilliz Cloud to set up the BYOC control plane in your EKS cluster.

| AWS IAM permission | AWS resource | Purpose |
| --- | --- | --- |
| iam:GetRole | Role | Read dependent roles when creating an EKS. |
| iam:ListAttachedRolePolicies | Policy | Get the policies of dependent roles. |
| iam:PassRole | Role | Allow EKS use the role. |
| iam:UpdateAssumeRolePolicy | IAM Role | Update trust policies for EKS OIDC provider. |
| ec2:CreateLaunchTemplate | Launch Template | Create launch template of EKS nodegroup. |
| ec2:RunInstances | Instance | Launches AWS instances of EKS nodegroup. |
| ec2:DeleteLaunchTemplate | Launch Template | Delete launch tempalte. |
| ec2:CreateLaunchTemplateVersion | Launch Template | Create Launch Template version. |
| ec2:CreateTags | Tags | Add tags to all zilliz byoc resources |
| ec2:DescribeAccountAttributes | Account | Confirm account ID when using the role. |
| ec2:DescribeInstanceTypes | Instance | Get instance type of instance. |
| ec2:DescribeLaunchTemplateVersions | Launch Template | Get version of Launch Template. |
| ec2:DescribeLaunchTemplates | Launch Template | Confirms that launch template are created correctly. |
| ec2:DescribeSubnets | Subnets | Confirms that Subnets exists in the VPC. |
| ec2:DescribeVpcs | VPC | Confirms that VPC exists. |
| eks:CreateCluster | EKS cluster | Create EKS cluster. |
| eks:CreateNodegroup | EKS nodegroup | Create EKS nodegroup. |
| eks:CreateAddon | EKS addons | Create EKS addons. |
| eks:CreateAccessEntry | EKS AccessEntry | An access entry allows an IAM principal to access your cluster. |
| eks:CreatePodIdentityAssociation | EKS PodIdentityAssociation | Allow pod assume AWS IAM roles. |
| eks:AssociateAccessPolicy | Policy | Associates an access policy and its scope to an access entry. |
| eks:UpdateAccessEntry | EKS AccessEntry | Update the EKS AccessEntry. |
| eks:UpdateAddon | EKS addons | Update the EKS addons. |
| eks:UpdateClusterConfig | EKS cluster | Update EKS' config. |
| eks:UpdateClusterVersion | EKS cluster | Update EKS EKS' version. |
| eks:UpdateNodegroupConfig | EKS nodegroup | Update EKS nodegroup's config. |
| eks:UpdateNodegroupVersion | EKS nodegroup | Update EKS nodegroup's version. |
| eks:UpdatePodIdentityAssociation | Pod identity | Update EKS pod identity. |
| eks:TagResource | Tags | Tags all eks resources. |
| eks:DescribeCluster | EKS cluster | Confirms that EKS cluster is created correctly. |
| eks:DescribeNodegroup | EKS nodegroup | Confirms that EKS nodegroup is created correctly. |
| eks:DescribeAccessEntry | EKS AccessEntry | Confirms that EKS accessentry is created correctly. |
| eks:DescribeAddon | EKS Addon | Confirms that EKS cluster is created correctly. |
| eks:DescribeAddonConfiguration | EKS addons | Confirms that EKS cluster is created correctly. |
| eks:DescribeAddonVersions | EKS addons | Confirms that EKS cluster is created correctly. |
| eks:DescribePodIdentityAssociation | Pod identity | Confirms that EKS cluster is created correctly. |
| eks:ListAccessEntries | EKS accessentry | Get EKS access entries of EKS created by Zilliz. |
| eks:ListAccessPolicies | EKS access policy | Get EKS access policies of EKS created by Zilliz. |
| eks:ListAddons | EKS addons | Get EKS addons created by Zilliz. |
| eks:ListNodegroups | EKS node group | Get EKS node groups created by Zilliz. |
| eks:ListUpdates | EKS | Get EKS updates created by Zilliz. |
| eks:ListPodIdentityAssociations | Pod identity | Get pod identity associations created by Zilliz. |
| eks:ListTagsForResource | Tags | Get resource tags created by Zilliz |
| eks:DeleteAccessEntry | EKS Accessentry | Delete EKS access entries created by Zilliz. |
| eks:DeleteAddon | EKS addons | Delete EKS addons created by Zilliz. |
| eks:DeleteCluster | EKS cluster | Delete EKS cluster created by Zilliz. |
| eks:DeleteFargateProfile | EKS | Delete EKS fargate profile created by Zilliz. |
| eks:DeleteNodegroup | EKS nodegroup | Delete EKS  nodegroup created by Zilliz. |
| eks:DeletePodIdentityAssociation | EKS | Delete EKS pod identity created by Zilliz. |
| s3:GetBucketLocation | Bucket | Confirms that S3 Bucket location  correct. |
