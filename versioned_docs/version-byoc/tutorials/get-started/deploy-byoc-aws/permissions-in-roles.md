---
title: "Permissions in Roles | BYOC"
slug: /permissions-in-roles
sidebar_label: "Permissions in Roles"
beta: CONTACT SALES
notebook: FALSE
description: "This page lists all IAM permissions that Zilliz Cloud requires to perform operations on your behalf. | BYOC"
type: origin
token: IOPFwYrC2iJDw3k2iElcBrkMnef
sidebar_position: 6
keywords: 
  - zilliz
  - byoc
  - aws
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - how do vector databases work
  - vector db comparison
  - openai vector db
  - natural language processing database

---

import Admonition from '@theme/Admonition';


# Permissions in Roles

This page lists all IAM permissions that Zilliz Cloud requires to perform operations on your behalf. 

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud support</a>.</p>

</Admonition>

## Storage role permissions{#storage-role-permissions}

You have created an S3 bucket and a storage role. Zilliz Cloud assumes this role with the following permissions.

<table>
   <tr>
     <th><p>AWS IAM permission</p></th>
     <th><p>AWS resource</p></th>
     <th><p>Purpose</p></th>
   </tr>
   <tr>
     <td><p>s3:ListBucket</p></td>
     <td><p>Bucket</p></td>
     <td><p>Checks whether the bucket exists.</p></td>
   </tr>
   <tr>
     <td><p>s3:GetObject</p></td>
     <td><p>Bucket object</p></td>
     <td><p>Allows Milvus read data from S3 bucket</p></td>
   </tr>
   <tr>
     <td><p>s3:PutObject</p></td>
     <td><p>Bucket object</p></td>
     <td><p>Allows Milvus write data to bucket</p></td>
   </tr>
   <tr>
     <td><p>s3:DeleteObject</p></td>
     <td><p>Bucket object</p></td>
     <td><p>Allows Milvus delete data</p></td>
   </tr>
</table>

## EKS role permissions{#eks-role-permissions}

You have created an EKS role with the following permissions for Zilliz Cloud to manage the EKS cluster.

### AWS-managed permissions{#aws-managed-permissions}

These permissions are managed by AWS and you can attach them to the EKS role. For details on each of these permissions, you can click the item in the **Permissions** column to learn more.

<table>
   <tr>
     <th><p>Permissions</p></th>
     <th><p>Managed by</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEC2ContainerRegistryReadOnly.html">AmazonEC2ContainerRegistryReadOnly</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Provides read-only access to Amazon EC2 Container Registry repositories.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKS_CNI_Policy.html">AmazonEKS_CNI_Policy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Provides the Amazon VPC CNI Plugin (amazon-vpc-cni-k8s) the permissions it requires to modify the IP address configuration on your EKS worker nodes.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSWorkerNodePolicy.html">AmazonEKSWorkerNodePolicy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Allows Amazon EKS worker nodes to connect to Amazon EKS Clusters.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSClusterPolicy.html">AmazonEKSClusterPolicy</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Provides Kubernetes the permissions it requires to manage resources on your behalf.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://docs.aws.amazon.com/aws-managed-policy/latest/reference/AmazonEKSVPCResourceController.html">AmazonEKSVPCResourceController</a></p></td>
     <td><p>AWS</p></td>
     <td><p>Allows VPC Resource Controller to manage ENI and IPs for worker nodes.</p></td>
   </tr>
</table>

### Permissions from Kubernetes SIGs{#permissions-from-kubernetes-sigs}

These permissions are managed by contributors in the [Kubernetes SIGs](https://github.com/kubernetes-sigs) repository. Zilliz Cloud references the permissions to install AWS Load Balancer Controller, Amazon EBS CSI driver, and Cluster AutoScaler. 

The following tables list the specific sets of permissions. For details on each of these permissions, you can click the item in the **Permissions** column to learn more.

<table>
   <tr>
     <th><p>Permissions</p></th>
     <th><p>Managed by</p></th>
     <th><p>Description</p></th>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/blob/main/docs/install/iam_policy.json">AWS Load Balancer Controller</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>AWS Load Balancer Controller is a controller to help manage Elastic Load Balancers for a Kubernetes cluster. For details on the AWS Load Balancer Controller repository, refer to the <a href="https://github.com/kubernetes-sigs/aws-load-balancer-controller/tree/main">README</a> file.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver/blob/master/docs/example-iam-policy.json">Amazon EBS CSI driver</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>The Amazon Elastic Block Store Container Storage Interface (CSI) Driver provides a CSI interface used by Container Orchestrators to manage the lifecycle of Amazon EBS volumes. For details on the Amazon EBS CSI driver, refer to the <a href="https://github.com/kubernetes-sigs/aws-ebs-csi-driver">README</a> file.</p></td>
   </tr>
   <tr>
     <td><p><a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md#full-cluster-autoscaler-features-policy-recommended">Cluster AutoScaler</a></p></td>
     <td><p>Kubernetes SIGs</p></td>
     <td><p>The Cluster AutoScaler is a component that automatically adjusts the size of a Kubernetes Cluster so that all pods have a place to run and there are no unneeded nodes. For details on the Cluster AutoScaler on AWS, refer to the <a href="https://github.com/kubernetes/autoscaler/blob/master/cluster-autoscaler/cloudprovider/aws/README.md">README</a> file.</p></td>
   </tr>
</table>

## Cross-account role permissions{#cross-account-role-permissions}

You have created a cross-account role with the following permissions for Zilliz Cloud to deploy the BYOC solution in your EKS cluster.

<table>
   <tr>
     <th><p>AWS IAM permission</p></th>
     <th><p>AWS resource</p></th>
     <th><p>Purpose</p></th>
   </tr>
   <tr>
     <td><p>iam:GetRole</p></td>
     <td><p>Role</p></td>
     <td><p>Read dependent roles when creating an EKS.</p></td>
   </tr>
   <tr>
     <td><p>iam:ListAttachedRolePolicies</p></td>
     <td><p>Policy</p></td>
     <td><p>Get the policies of dependent roles.</p></td>
   </tr>
   <tr>
     <td><p>iam:PassRole</p></td>
     <td><p>Role</p></td>
     <td><p>Allow EKS use the role.</p></td>
   </tr>
   <tr>
     <td><p>iam:UpdateAssumeRolePolicy</p></td>
     <td><p>IAM Role</p></td>
     <td><p>Update trust policies for EKS OIDC provider.</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateLaunchTemplate</p></td>
     <td><p>Launch Template</p></td>
     <td><p>Create launch template of EKS nodegroup.</p></td>
   </tr>
   <tr>
     <td><p>ec2:RunInstances</p></td>
     <td><p>Instance</p></td>
     <td><p>Launches AWS instances of EKS nodegroup.</p></td>
   </tr>
   <tr>
     <td><p>ec2:DeleteLaunchTemplate</p></td>
     <td><p>Launch Template</p></td>
     <td><p>Delete launch tempalte.</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateLaunchTemplateVersion</p></td>
     <td><p>Launch Template</p></td>
     <td><p>Create Launch Template version.</p></td>
   </tr>
   <tr>
     <td><p>ec2:CreateTags</p></td>
     <td><p>Tags</p></td>
     <td><p>Add tags to all zilliz byoc resources</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeAccountAttributes</p></td>
     <td><p>Account</p></td>
     <td><p>Confirm account ID when using the role.</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeInstanceTypes</p></td>
     <td><p>Instance</p></td>
     <td><p>Get instance type of instance.</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeLaunchTemplateVersions</p></td>
     <td><p>Launch Template</p></td>
     <td><p>Get version of Launch Template.</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeLaunchTemplates</p></td>
     <td><p>Launch Template</p></td>
     <td><p>Confirms that launch template are created correctly.</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeSubnets</p></td>
     <td><p>Subnets</p></td>
     <td><p>Confirms that Subnets exists in the VPC.</p></td>
   </tr>
   <tr>
     <td><p>ec2:DescribeVpcs</p></td>
     <td><p>VPC</p></td>
     <td><p>Confirms that VPC exists.</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateCluster</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>Create EKS cluster.</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateNodegroup</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>Create EKS nodegroup.</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateAddon</p></td>
     <td><p>EKS addons</p></td>
     <td><p>Create EKS addons.</p></td>
   </tr>
   <tr>
     <td><p>eks:CreateAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>An access entry allows an IAM principal to access your cluster.</p></td>
   </tr>
   <tr>
     <td><p>eks:CreatePodIdentityAssociation</p></td>
     <td><p>EKS PodIdentityAssociation</p></td>
     <td><p>Allow pod assume AWS IAM roles.</p></td>
   </tr>
   <tr>
     <td><p>eks:AssociateAccessPolicy</p></td>
     <td><p>Policy</p></td>
     <td><p>Associates an access policy and its scope to an access entry.</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>Update the EKS AccessEntry.</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateAddon</p></td>
     <td><p>EKS addons</p></td>
     <td><p>Update the EKS addons.</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateClusterConfig</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>Update EKS' config.</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateClusterVersion</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>Update EKS EKS' version.</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateNodegroupConfig</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>Update EKS nodegroup's config.</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdateNodegroupVersion</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>Update EKS nodegroup's version.</p></td>
   </tr>
   <tr>
     <td><p>eks:UpdatePodIdentityAssociation</p></td>
     <td><p>Pod identity</p></td>
     <td><p>Update EKS pod identity.</p></td>
   </tr>
   <tr>
     <td><p>eks:TagResource</p></td>
     <td><p>Tags</p></td>
     <td><p>Tags all eks resources.</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeCluster</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>Confirms that EKS cluster is created correctly.</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeNodegroup</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>Confirms that EKS nodegroup is created correctly.</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAccessEntry</p></td>
     <td><p>EKS AccessEntry</p></td>
     <td><p>Confirms that EKS accessentry is created correctly.</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddon</p></td>
     <td><p>EKS Addon</p></td>
     <td><p>Confirms that EKS cluster is created correctly.</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddonConfiguration</p></td>
     <td><p>EKS addons</p></td>
     <td><p>Confirms that EKS cluster is created correctly.</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribeAddonVersions</p></td>
     <td><p>EKS addons</p></td>
     <td><p>Confirms that EKS cluster is created correctly.</p></td>
   </tr>
   <tr>
     <td><p>eks:DescribePodIdentityAssociation</p></td>
     <td><p>Pod identity</p></td>
     <td><p>Confirms that EKS cluster is created correctly.</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAccessEntries</p></td>
     <td><p>EKS accessentry</p></td>
     <td><p>Get EKS access entries of EKS created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAccessPolicies</p></td>
     <td><p>EKS access policy</p></td>
     <td><p>Get EKS access policies of EKS created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:ListAddons</p></td>
     <td><p>EKS addons</p></td>
     <td><p>Get EKS addons created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:ListNodegroups</p></td>
     <td><p>EKS node group</p></td>
     <td><p>Get EKS node groups created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:ListUpdates</p></td>
     <td><p>EKS</p></td>
     <td><p>Get EKS updates created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:ListPodIdentityAssociations</p></td>
     <td><p>Pod identity</p></td>
     <td><p>Get pod identity associations created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:ListTagsForResource</p></td>
     <td><p>Tags</p></td>
     <td><p>Get resource tags created by Zilliz</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteAccessEntry</p></td>
     <td><p>EKS Accessentry</p></td>
     <td><p>Delete EKS access entries created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteAddon</p></td>
     <td><p>EKS addons</p></td>
     <td><p>Delete EKS addons created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteCluster</p></td>
     <td><p>EKS cluster</p></td>
     <td><p>Delete EKS cluster created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteFargateProfile</p></td>
     <td><p>EKS</p></td>
     <td><p>Delete EKS fargate profile created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:DeleteNodegroup</p></td>
     <td><p>EKS nodegroup</p></td>
     <td><p>Delete EKS  nodegroup created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>eks:DeletePodIdentityAssociation</p></td>
     <td><p>EKS</p></td>
     <td><p>Delete EKS pod identity created by Zilliz.</p></td>
   </tr>
   <tr>
     <td><p>s3:GetBucketLocation</p></td>
     <td><p>Bucket</p></td>
     <td><p>Confirms that S3 Bucket location  correct.</p></td>
   </tr>
</table>
