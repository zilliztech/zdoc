---
title: "Required Permissions | BYOC"
slug: /required-permissions-gcp
sidebar_label: "Required Permissions"
beta: CONTACT SALES
added_since: FALSE
last_modified: FALSE
deprecate_since: FALSE
notebook: FALSE
description: "This page lists the IAM policies required during the deployment of Zilliz BYOC data plane on your VPC network. | BYOC"
type: origin
token: ERIwwzvfuiLYIik9R4Ec0gCrnLb
sidebar_position: 5
keywords: 
  - zilliz
  - byoc
  - byoc-i
  - gcp
  - permissions
  - minimum permissions
  - milvus
  - vector database
  - cosine distance
  - what is a vector database
  - vectordb
  - multimodal vector database retrieval

---

import Admonition from '@theme/Admonition';


# Required Permissions

This page lists the IAM policies required during the deployment of Zilliz BYOC data plane on your VPC network.

<Admonition type="info" icon="📘" title="Notes">

<p>Zilliz BYOC is currently available in <strong>General Availability</strong>. For access and implementation details, please contact <a href="https://zilliz.com/contact-sales">Zilliz Cloud sales</a>.</p>

</Admonition>

## Storage service account\{#storage-service-account}

You should create a Cloud Storage bucket and a storage service account so that Zilliz Cloud can assume the service account to access the bucket.

The following table lists the roles that should be assigned to the storage service account.

<table>
   <tr>
     <th><p>Role</p></th>
     <th><p>Description</p></th>
     <th><p>Condition</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage Object Admin</a></p></td>
     <td><p>Grants full control of objects, including listing, creating, viewing, and deleting objects.</p></td>
     <td><p>Name of the target bucket</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage Bucket Viewer</a></p></td>
     <td><p>Grants permission to view buckets and their metadata, excluding IAM policies.</p></td>
     <td><p>Name of the target bucket</p></td>
   </tr>
</table>

## GKE service account\{#gke-service-account}

You should create a GKE service account so that Zilliz Cloud can assume this service account to manage the GKE clusters.

The following table lists the roles that should be assigned to the GKE service account.

<table>
   <tr>
     <th><p>Role</p></th>
     <th><p>Description</p></th>
     <th><p>Condition</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.defaultNodeServiceAccount">Kubernetes Engine Default Node Service Account</a></p></td>
     <td><p>Minimal set of permissions required by a GKE node to support standard capabilities such as logging and monitoring.</p></td>
     <td><p>--</p></td>
   </tr>
</table>

## Cross-account service account\{#cross-account-service-account}

You should create a cross-account service account so Zilliz Cloud can assume this service account to manage network resources.

The following table lists the roles that should be assigned to the cross-account service account.

<table>
   <tr>
     <th><p>Role</p></th>
     <th><p>Description</p></th>
     <th><p>Condition</p></th>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/storage#storage.objectAdmin">Storage Bucket Viewer</a></p></td>
     <td><p>Grants permission to view buckets and their metadata, excluding IAM policies.</p></td>
     <td><p>Name of the target bucket</p></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/container#container.admin">Kubernetes Engine Admin</a></p></td>
     <td><p>Provides access to full management of clusters and their Kubernetes API objects.</p></td>
     <td><p>--</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">Instance Group Manager Custom Role</a></p></td>
     <td><p>Binds the following permissions:</p><ul><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/get">compute.instanceGroupManagers.get</a></p></li><li><p><a href="https://cloud.google.com/compute/docs/reference/rest/v1/instanceGroupManagers/update">compute.instanceGroupManagers.update</a></p></li></ul></td>
     <td><p>Name of the GKE cluster to create</p></td>
   </tr>
   <tr>
     <td><p><a href="./create-cross-account-sa">IAM Custom Role</a></p></td>
     <td><p>Binds the following permissions:</p><ul><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/getIamPolicy">iam.serviceAccounts.getIamPolicy</a></p></li><li><p><a href="https://cloud.google.com/iam/docs/reference/rest/v1/projects.serviceAccounts/setIamPolicy">iam.serviceAccounts.setIamPolicy</a></p></li></ul></td>
     <td></td>
   </tr>
   <tr>
     <td><p><a href="https://cloud.google.com/iam/docs/roles-permissions/iam#iam.serviceAccountUser">Service Account User</a></p></td>
     <td><p>Run operations as the service account.</p></td>
     <td><p>--</p></td>
   </tr>
</table>

